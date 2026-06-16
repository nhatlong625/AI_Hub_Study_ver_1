from pydantic import BaseModel, Field
from typing import List, Optional


class ChatAskRequest(BaseModel):
    user_id: int = Field(..., examples=[1])
    message: str = Field(..., examples=["Interview trong SWR là gì?"])
    session_id: Optional[int] = Field(default=None, examples=[10])
    subject_id: Optional[int] = Field(default=None, examples=[2])
    document_ids: List[int] = Field(default_factory=list, examples=[[1, 2, 3]])
    top_k: int = Field(default=3, ge=1, le=10)


class SourceDocument(BaseModel):
    document_id: int
    document_name: str
    title: Optional[str] = None
    subject_id: Optional[int] = None
    subject_name: Optional[str] = None
    score: float
    summary_preview: str


class DetectedSubject(BaseModel):
    subject_id: Optional[int] = None
    subject_name: Optional[str] = None


class ChatAskResponse(BaseModel):
    answer: str
    session_id: Optional[int]
    detected_subject: Optional[DetectedSubject]
    sources: List[SourceDocument]
    used_mock_ai: bool = False


class ChatSessionCreateRequest(BaseModel):
    user_id: int
    document_id: Optional[int] = None
    session_title: str = "New AI Chat"


class ChatSessionResponse(BaseModel):
    session_id: int
    user_id: int
    document_id: Optional[int] = None
    session_title: str
