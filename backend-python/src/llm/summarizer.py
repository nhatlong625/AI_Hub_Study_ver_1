from dataclasses import dataclass
from typing import Optional

from src.chunking.chunker import TextChunker
from src.ingestion.loader import DocumentLoader
from src.llm.llm_client import GeminiService
from src.prompts.prompt_templates import build_document_summary_prompt, build_final_summary_prompt


@dataclass
class SummaryResult:
    summary: str
    chunk_count: int
    used_mock_ai: bool = False


class DocumentSummarizer:
    def __init__(self):
        self.loader = DocumentLoader()
        self.chunker = TextChunker()
        self.llm = GeminiService()

    def summarize(self, text: Optional[str] = None, file_path: Optional[str] = None, max_chunks: Optional[int] = None) -> SummaryResult:
        raw_text = text or self.loader.load(file_path or "")
        chunks = self.chunker.split(raw_text)
        if max_chunks:
            chunks = chunks[:max_chunks]

        chunk_summaries = []
        used_mock_ai = False
        for chunk in chunks:
            summary, is_mock = self.llm.generate(build_document_summary_prompt(chunk))
            chunk_summaries.append(summary)
            used_mock_ai = used_mock_ai or is_mock

        if len(chunk_summaries) == 1:
            return SummaryResult(summary=chunk_summaries[0], chunk_count=len(chunks), used_mock_ai=used_mock_ai)

        final_summary, is_mock = self._combine_summaries(chunk_summaries)
        return SummaryResult(
            summary=final_summary,
            chunk_count=len(chunks),
            used_mock_ai=used_mock_ai or is_mock,
        )

    def _combine_summaries(self, summaries: list[str], batch_size: int = 8) -> tuple[str, bool]:
        used_mock_ai = False
        current = summaries

        while len(current) > 1:
            next_round = []
            for index in range(0, len(current), batch_size):
                batch = current[index:index + batch_size]
                summary, is_mock = self.llm.generate(build_final_summary_prompt(batch))
                next_round.append(summary)
                used_mock_ai = used_mock_ai or is_mock
            current = next_round

        return current[0], used_mock_ai
