import os
import re
from typing import List

import httpx

from src.core.config import get_settings
from src.core.runtime_ai_config import get_runtime_ai_config
from src.prompts.prompt_templates import build_study_answer_prompt
from src.schemas.chat import ContextDocument


class LlmService:
    def __init__(self):
        self.settings = get_settings()
        self._disable_broken_local_proxy()
        self._refresh_runtime_config()

    def _refresh_runtime_config(self) -> None:
        runtime = get_runtime_ai_config()
        self.openai_api_key = runtime.get("openai_api_key") or self.settings.openai_api_key
        self.openai_model = runtime.get("openai_model") or self.settings.openai_model
        self.gemini_api_key = runtime.get("gemini_api_key") or self.settings.gemini_api_key
        self.gemini_model_name = runtime.get("gemini_model") or self.settings.gemini_model
        self.temperature = self._float_value(runtime.get("temperature"), 0.3)
        self.max_tokens = self._int_value(runtime.get("max_tokens"), 2048)
        self.top_p = self._float_value(runtime.get("top_p"), 1.0)
        self.system_prompt = runtime.get("system_prompt") or (
            "You are a helpful AI study assistant. Answer clearly and use the provided "
            "course/document context when available."
        )

        configured_order = [
            item.strip().lower()
            for item in str(runtime.get("provider_order") or "").split(",")
            if item.strip()
        ]
        if configured_order:
            self.provider_order = [
                provider for provider in configured_order
                if (provider == "openai" and self.openai_api_key)
                or (provider == "gemini" and self._has_valid_gemini_key())
            ] or ["mock"]
        else:
            requested_provider = (self.settings.llm_provider or "auto").lower()
            self.provider_order = self._select_providers(requested_provider)
        self.provider = self.provider_order[0] if self.provider_order else "mock"

    def _float_value(self, value, fallback: float) -> float:
        try:
            return float(value) if value not in (None, "") else fallback
        except (TypeError, ValueError):
            return fallback

    def _int_value(self, value, fallback: int) -> int:
        try:
            return int(value) if value not in (None, "") else fallback
        except (TypeError, ValueError):
            return fallback

    def _disable_broken_local_proxy(self) -> None:
        for name in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"):
            value = os.environ.get(name, "")
            if value.startswith("http://127.0.0.1:9") or value.startswith("http://localhost:9"):
                os.environ.pop(name, None)

    def _select_providers(self, requested_provider: str) -> List[str]:
        providers: List[str] = []

        def add(provider: str, enabled: bool) -> None:
            if enabled and provider not in providers:
                providers.append(provider)

        if requested_provider == "gemini":
            add("gemini", self._has_valid_gemini_key())
            add("openai", bool(self.openai_api_key))
        else:
            add("openai", bool(self.openai_api_key))
            add("gemini", self._has_valid_gemini_key())

        return providers or ["mock"]

    def _has_valid_gemini_key(self) -> bool:
        key = (self.gemini_api_key or "").strip()
        return key.startswith("AIza") or key.startswith("AQ.")

    def generate(self, prompt: str) -> tuple[str, bool]:
        self._refresh_runtime_config()
        if self.provider == "mock":
            return (
                "Demo mode is active because no LLM API key is configured. This is a mock AI response.",
                True,
            )

        try:
            return self._generate_with_failover(prompt), False
        except Exception as exc:
            return self._mock_answer_for_ai_error(str(exc), []), True

    def answer(self, question: str, hits: List[ContextDocument]) -> tuple[str, bool]:
        self._refresh_runtime_config()
        if not hits:
            return "I could not find a document summary in the database that matches this question. Please select a more specific subject or upload/summarize a related document first.", False

        prompt = build_study_answer_prompt(question, hits)

        if self.provider == "mock":
            return self._answer_from_database_context(question, hits), True

        try:
            return self._generate_with_failover(prompt), False
        except Exception as exc:
            return self._answer_from_database_context(question, hits, str(exc)), True

    def _generate_with_failover(self, prompt: str) -> str:
        errors = []
        for provider in self.provider_order:
            if provider == "mock":
                continue
            try:
                self.provider = provider
                if provider == "openai":
                    return self._generate_openai(prompt)
                if provider == "gemini":
                    return self._generate_gemini(prompt)
            except Exception as exc:
                errors.append(f"{self.provider_label(provider)}: {self._sanitize_error(str(exc))}")

        raise RuntimeError("; ".join(errors) or "No LLM provider is configured.")

    def _generate_gemini(self, prompt: str) -> str:
        return self._generate_gemini_rest(prompt)

    def _generate_gemini_rest(self, prompt: str) -> str:
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        errors = []

        with httpx.Client(timeout=60, trust_env=False) as client:
            for model in self._gemini_rest_model_candidates():
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
                for request_kwargs in (
                    {"headers": {"x-goog-api-key": self.gemini_api_key}},
                    {"params": {"key": self.gemini_api_key}},
                ):
                    try:
                        response = client.post(url, json=payload, **request_kwargs)
                        response.raise_for_status()
                        data = response.json()
                        candidates = data.get("candidates") or []
                        parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
                        text = "".join(part.get("text", "") for part in parts).strip()
                        return text or "Gemini did not return any content."
                    except Exception as exc:
                        errors.append(f"{model}: {self._sanitize_error(str(exc))}")

        raise RuntimeError("Gemini REST failed: " + " | ".join(errors))

    def _gemini_rest_model_candidates(self) -> list[str]:
        candidates = []
        for model in (
            self.gemini_model_name,
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
        ):
            if model and model not in candidates:
                candidates.append(model)
        return candidates

    def _sanitize_error(self, message: str) -> str:
        message = re.sub(r"([?&]key=)[^&\s']+", r"\1***", message)
        message = re.sub(r"(AQ\.)[A-Za-z0-9_\-]+", r"\1***", message)
        message = re.sub(r"(AIza)[A-Za-z0-9_\-]+", r"\1***", message)
        message = re.sub(r"(sk-[A-Za-z0-9_\-]{8})[A-Za-z0-9_\-]+", r"\1***", message)
        return message

    def _generate_openai(self, prompt: str) -> str:
        with httpx.Client(timeout=60, trust_env=False) as client:
            response = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.openai_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": self.system_prompt,
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": self.temperature,
                    "max_tokens": self.max_tokens,
                    "top_p": self.top_p,
                },
            )
        response.raise_for_status()
        payload = response.json()
        choices = payload.get("choices") or []
        if not choices:
            return "OpenAI did not return any content."
        return choices[0].get("message", {}).get("content") or "OpenAI did not return any content."

    def _answer_from_database_context(
        self,
        question: str,
        hits: List[ContextDocument],
        ai_error: str | None = None,
    ) -> str:
        best_hit = hits[0]
        note = ""
        if ai_error:
            note = f"\n\nNote: {self._database_fallback_note(ai_error)}"

        return (
            f"Based on {best_hit.document_name}:\n\n"
            f"{best_hit.summary_content[:700]}"
            f"{note}"
        )

    def _database_fallback_note(self, ai_error: str) -> str:
        lower_error = ai_error.lower()
        if "429" in lower_error or "quota" in lower_error or "resourceexhausted" in lower_error:
            return "OpenAI/Gemini quota or rate limit has been reached, so this answer is composed from summaries stored in SQL Server."
        if "401" in lower_error or "unauthorized" in lower_error or "invalid_api_key" in lower_error:
            return "The configured AI API key is invalid or unauthorized, so this answer is composed from summaries stored in SQL Server."
        return "The AI model service is unavailable right now, so this answer is composed from summaries stored in SQL Server."

    def _mock_answer_for_ai_error(self, error_message: str, hits: List[ContextDocument]) -> str:
        lower_error = error_message.lower()
        provider = self.provider_label()
        if "quota" in lower_error or "429" in lower_error or "resourceexhausted" in lower_error:
            reason = f"{provider} quota/rate limit has been reached."
        elif "401" in lower_error or "unauthorized" in lower_error or "invalid_api_key" in lower_error:
            reason = f"{provider} API key is invalid or unauthorized."
        else:
            reason = f"{provider} is temporarily unavailable."

        if not hits:
            return (
                f"Mock mode is active because {reason} "
                "No matching document context was provided for this request."
            )

        best_hit = hits[0]
        return (
            f"Mock mode is active because {reason}\n\n"
            f"Based on {best_hit.document_name}: {best_hit.summary_content[:360]}"
        )

    def provider_label(self, provider: str | None = None) -> str:
        provider = provider or self.provider
        if provider == "openai":
            return "OpenAI"
        if provider == "gemini":
            return "Gemini"
        return "LLM"


GeminiService = LlmService
