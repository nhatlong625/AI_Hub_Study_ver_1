package com.aistudyhub.model;

/** Một bản tóm tắt (AI_SUMMARY) khớp với câu hỏi, kèm điểm liên quan (score) sau khi chấm. */
public record SummaryHit(
        Integer documentId,
        String documentName,
        String title,
        Integer subjectId,
        String subjectName,
        String summaryContent,
        Double score
) {
    public SummaryHit withScore(Double score) {
        return new SummaryHit(documentId, documentName, title, subjectId, subjectName, summaryContent, score);
    }
}
