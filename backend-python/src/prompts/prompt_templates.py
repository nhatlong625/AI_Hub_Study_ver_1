def build_study_answer_prompt(question: str, hits) -> str:
    context = "\n\n".join(
        f"Document: {hit.document_name}\nSubject: {hit.subject_name or 'Unknown'}\nSummary: {hit.summary_content}"
        for hit in hits
    )

    return f"""
You are AI Study Bot for the AI Study Hub platform.
Answer only by using the Document Summary section below.
If the summaries do not contain enough information, clearly say that the original document needs to be scanned or reviewed.
Keep the answer concise, accurate, and easy for a student to understand.

Student question:
{question}

Relevant Document Summary:
{context}
""".strip()


def build_document_summary_prompt(text: str) -> str:
    return f"""
You are an academic document summarization assistant for AI Study Hub.
Summarize the document chunk below in English.

Requirements:
- Capture the main ideas and key terms.
- Keep important definitions, steps, formulas, or constraints.
- Use clear bullet points when helpful.
- Do not invent information that is not in the text.

Document chunk:
{text}
""".strip()


def build_final_summary_prompt(chunk_summaries: list[str]) -> str:
    joined_summaries = "\n\n".join(chunk_summaries)
    return f"""
You are an academic document summarization assistant for AI Study Hub.
Combine the partial summaries below into one coherent final summary in English.

Requirements:
- Remove repetition.
- Preserve the most important concepts, definitions, and relationships.
- Structure the final summary so a student can review it quickly.
- Do not add information that is not present in the partial summaries.

Partial summaries:
{joined_summaries}
""".strip()
