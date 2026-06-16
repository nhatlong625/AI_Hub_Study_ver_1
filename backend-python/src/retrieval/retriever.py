import re
from dataclasses import dataclass
from typing import List, Optional

import pyodbc

from src.core.config import get_settings


@dataclass
class SummaryHit:
    document_id: int
    document_name: str
    title: Optional[str]
    subject_id: Optional[int]
    subject_name: Optional[str]
    summary_content: str
    score: float = 0.0


MOCK_SUMMARIES = [
    SummaryHit(
        document_id=1,
        document_name="COS SRS.pdf",
        title="Course Online System SRS",
        subject_id=1,
        subject_name="Software Requirements",
        summary_content="SWR explains stakeholder needs, functional requirements, non-functional requirements, SRS documents, validation, business rules, and requirement traceability.",
    ),
    SummaryHit(
        document_id=2,
        document_name="SWR_Elicitation_Techniques.pdf",
        title="SWR Elicitation Techniques",
        subject_id=1,
        subject_name="Software Requirements",
        summary_content="Interview is a requirements elicitation technique used to collect detailed information from stakeholders, clarify ambiguous needs, discover constraints, and validate requirements.",
    ),
    SummaryHit(
        document_id=3,
        document_name="Linear_Algebra_Chapter_5.pdf",
        title="Eigenvectors and Eigenvalues",
        subject_id=2,
        subject_name="Linear Algebra",
        summary_content="Eigenvectors keep direction under a matrix transformation, while eigenvalues describe the scale factor. The chapter includes examples and transformation intuition.",
    ),
]


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9_]+", text.lower())


def keyword_score(query: str, hit: SummaryHit) -> float:
    query_terms = set(tokenize(query))
    haystack = " ".join(
        filter(None, [hit.document_name, hit.title or "", hit.subject_name or "", hit.summary_content])
    )
    haystack_terms = set(tokenize(haystack))
    if not query_terms:
        return 0.0
    overlap = query_terms.intersection(haystack_terms)
    return round(len(overlap) / len(query_terms), 4)


class SummarySearchService:
    def __init__(self):
        self.settings = get_settings()

    def search(self, user_id: int, message: str, top_k: int, subject_id: Optional[int] = None, document_ids: Optional[List[int]] = None) -> List[SummaryHit]:
        hits = self._mock_search() if self.settings.use_mock_data else self._sql_search(user_id, subject_id, document_ids)

        filtered = []
        for hit in hits:
            if subject_id and hit.subject_id != subject_id:
                continue
            if document_ids and hit.document_id not in document_ids:
                continue
            hit.score = keyword_score(message, hit)
            filtered.append(hit)

        filtered.sort(key=lambda item: item.score, reverse=True)
        return filtered[:top_k]

    def _mock_search(self) -> List[SummaryHit]:
        return [SummaryHit(**hit.__dict__) for hit in MOCK_SUMMARIES]

    def _sql_search(self, user_id: int, subject_id: Optional[int], document_ids: Optional[List[int]]) -> List[SummaryHit]:
        query = """
            SELECT
                d.document_id,
                d.document_name,
                d.title,
                sub.subject_id,
                sub.subject_name,
                s.summary_content
            FROM AI_SUMMARY s
            JOIN DOCUMENT d ON s.document_id = d.document_id
            LEFT JOIN SUBJECT sub ON d.subject_id = sub.subject_id
            WHERE s.user_id = ?
        """
        params = [user_id]

        if subject_id:
            query += " AND sub.subject_id = ?"
            params.append(subject_id)

        if document_ids:
            placeholders = ",".join("?" for _ in document_ids)
            query += f" AND d.document_id IN ({placeholders})"
            params.extend(document_ids)

        with pyodbc.connect(self.settings.odbc_connection_string) as conn:
            rows = conn.cursor().execute(query, params).fetchall()

        return [
            SummaryHit(
                document_id=row.document_id,
                document_name=row.document_name,
                title=row.title,
                subject_id=row.subject_id,
                subject_name=row.subject_name,
                summary_content=row.summary_content,
            )
            for row in rows
        ]
