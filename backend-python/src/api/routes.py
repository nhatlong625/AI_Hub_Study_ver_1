from fastapi import APIRouter

from src.llm.llm_client import GeminiService
from src.retrieval.retriever import SummarySearchService
from src.schemas.chat import (
    ChatAskRequest,
    ChatAskResponse,
    ChatSessionCreateRequest,
    ChatSessionResponse,
    DetectedSubject,
    SourceDocument,
)

router = APIRouter()
summary_search = SummarySearchService()
gemini = GeminiService()


@router.post("/ask", response_model=ChatAskResponse)
def ask_chatbot(payload: ChatAskRequest):
    hits = summary_search.search(
        user_id=payload.user_id,
        message=payload.message,
        top_k=payload.top_k,
        subject_id=payload.subject_id,
        document_ids=payload.document_ids,
    )
    answer, used_mock_ai = gemini.answer(payload.message, hits)

    detected = None
    if hits:
        detected = DetectedSubject(subject_id=hits[0].subject_id, subject_name=hits[0].subject_name)

    return ChatAskResponse(
        answer=answer,
        session_id=payload.session_id,
        detected_subject=detected,
        sources=[
            SourceDocument(
                document_id=hit.document_id,
                document_name=hit.document_name,
                title=hit.title,
                subject_id=hit.subject_id,
                subject_name=hit.subject_name,
                score=hit.score,
                summary_preview=hit.summary_content[:240],
            )
            for hit in hits
        ],
        used_mock_ai=used_mock_ai,
    )


@router.post("/sessions", response_model=ChatSessionResponse)
def create_chat_session(payload: ChatSessionCreateRequest):
    # Demo endpoint. In production, insert into CHAT_SESSION and return the generated ID.
    return ChatSessionResponse(
        session_id=1,
        user_id=payload.user_id,
        document_id=payload.document_id,
        session_title=payload.session_title,
    )
