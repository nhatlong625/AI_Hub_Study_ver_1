from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.document_routes import router as document_router
from src.api.routes import router as chat_router

app = FastAPI(
    title="AI Study Hub Chat Bot API",
    description="RAG API: retrieve study context, detect relevant documents, and answer with Gemini.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/chat", tags=["AI Chat Bot"])
app.include_router(document_router, prefix="/api/documents", tags=["Documents"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}

