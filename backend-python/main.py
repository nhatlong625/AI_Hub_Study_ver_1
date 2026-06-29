from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.document_routes import router as document_router
from src.api.quiz_routes import router as quiz_router
from src.api.routes import router as chat_router
from src.llm.llm_client import GeminiService
from src.core.runtime_ai_config import reset_runtime_ai_config, set_runtime_ai_config

app = FastAPI(
    title="AI Study Hub Chat Bot API",
    description="AI generation API: receive study context from Spring Boot and answer with Gemini.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def load_runtime_ai_config(request, call_next):
    headers = request.headers
    token = set_runtime_ai_config({
        "provider_order": headers.get("x-ai-provider-order", ""),
        "openai_api_key": headers.get("x-ai-openai-key", ""),
        "openai_model": headers.get("x-ai-openai-model", ""),
        "gemini_api_key": headers.get("x-ai-gemini-key", ""),
        "gemini_model": headers.get("x-ai-gemini-model", ""),
        "temperature": headers.get("x-ai-temperature", ""),
        "max_tokens": headers.get("x-ai-max-tokens", ""),
        "top_p": headers.get("x-ai-top-p", ""),
        "system_prompt": headers.get("x-ai-system-prompt", ""),
    })
    try:
        return await call_next(request)
    finally:
        reset_runtime_ai_config(token)

app.include_router(chat_router, prefix="/api/chat", tags=["AI Chat Bot"])
app.include_router(document_router, prefix="/api/documents", tags=["Documents"])
app.include_router(quiz_router, prefix="/api/quiz", tags=["Quiz"])


@app.post("/internal/ai/test", tags=["Internal"])
def test_ai_connection():
    service = GeminiService()
    response, is_mock = service.generate("Reply only with OK.")
    return {
        "valid": not is_mock,
        "provider": service.provider,
        "message": "Connection successful." if not is_mock else response[:300],
    }


@app.get("/health", tags=["Health"])
def health_check():
    service = GeminiService()
    return {
        "status": "ok",
        "llm_provider": service.provider,
        "llm_provider_order": service.provider_order,
    }
