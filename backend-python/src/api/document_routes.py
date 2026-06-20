from fastapi import APIRouter

from src.llm.summarizer import DocumentSummarizer
from src.schemas.document import DocumentSummarizeRequest, DocumentSummarizeResponse

router = APIRouter()
summarizer = DocumentSummarizer()


@router.post("/summarize", response_model=DocumentSummarizeResponse)
def summarize_document(payload: DocumentSummarizeRequest):
    result = summarizer.summarize(
        text=payload.text,
        file_path=payload.file_path,
        max_chunks=payload.max_chunks,
    )

    return DocumentSummarizeResponse(
        document_id=payload.document_id,
        document_name=payload.document_name,
        summary=result.summary,
        chunk_count=result.chunk_count,
        used_mock_ai=result.used_mock_ai,
        saved_to_db=False,
    )
