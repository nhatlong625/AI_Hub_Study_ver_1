# AI Study Hub Python Backend

FastAPI service for AI/RAG workflows. This service retrieves study context, prepares prompts, and calls the configured LLM provider.

## Structure

```text
backend-python/
├── README.md
├── requirements.txt
├── .env
├── .gitignore
├── config.yaml
├── main.py
├── src/
│   ├── ingestion/
│   ├── chunking/
│   ├── embeddings/
│   ├── vectordb/
│   ├── retrieval/
│   ├── prompts/
│   ├── llm/
│   ├── api/
│   ├── schemas/
│   ├── core/
│   └── utils/
├── tests/
└── logs/
```

## Run

```powershell
cd C:\Users\admin\Downloads\AI_Hub_Study\backend-python
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Swagger: http://localhost:8000/docs

Use `.env` for local secrets and runtime settings. Commit `.env.example`, not `.env`.

## Document Summarization

Endpoint:

```text
POST /api/documents/summarize
```

The endpoint accepts either raw `text` or a local `file_path` for basic `.txt`, `.md`, and `.csv` files. Java backend can call this endpoint after storing an uploaded document and extracting or passing its text.

## Storage Layer

Database connection and persistence code lives in `src/storage/`:

- `connection.py`: creates SQL Server connections with `pyodbc`.
- `summary_repository.py`: saves generated summaries into `AI_SUMMARY`.

To save a generated document summary, call `POST /api/documents/summarize` with `save_to_db: true`, plus `user_id` and `document_id`.
