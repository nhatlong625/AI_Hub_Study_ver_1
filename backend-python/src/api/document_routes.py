from fastapi import APIRouter, HTTPException

from src.llm.summarizer import DocumentSummarizer
from src.schemas.document import DocumentSummarizeRequest, DocumentSummarizeResponse
from src.storage.summary_repository import SummaryRepository

router = APIRouter()
summarizer = DocumentSummarizer()
summary_repository = SummaryRepository()


@router.post("/summarize", response_model=DocumentSummarizeResponse)
def summarize_document(payload: DocumentSummarizeRequest):
    result = summarizer.summarize(
        text=payload.text,
        file_path=payload.file_path,
        max_chunks=payload.max_chunks,
    )

    saved_to_db = False
    if payload.save_to_db:
        if payload.user_id is None or payload.document_id is None:
            raise HTTPException(
                status_code=400,
                detail="user_id and document_id are required when save_to_db is true.",
            )

        summary_repository.save_document_summary(
            user_id=payload.user_id,
            document_id=payload.document_id,
            summary_content=result.summary,
        )
        saved_to_db = True

    return DocumentSummarizeResponse(
        document_id=payload.document_id,
        document_name=payload.document_name,
        summary=result.summary,
        chunk_count=result.chunk_count,
        used_mock_ai=result.used_mock_ai,
        saved_to_db=saved_to_db,
    )
