from dataclasses import dataclass

from src.storage.connection import get_db_connection


@dataclass
class SavedSummary:
    user_id: int
    document_id: int
    summary_content: str


class SummaryRepository:
    """Persist AI-generated document summaries in SQL Server."""

    def save_document_summary(self, user_id: int, document_id: int, summary_content: str) -> SavedSummary:
        with get_db_connection() as connection:
            cursor = connection.cursor()
            cursor.execute(
                """
                DELETE FROM AI_SUMMARY
                WHERE user_id = ? AND document_id = ?
                """,
                user_id,
                document_id,
            )
            cursor.execute(
                """
                INSERT INTO AI_SUMMARY (user_id, document_id, summary_content)
                VALUES (?, ?, ?)
                """,
                user_id,
                document_id,
                summary_content,
            )

        return SavedSummary(
            user_id=user_id,
            document_id=document_id,
            summary_content=summary_content,
        )
