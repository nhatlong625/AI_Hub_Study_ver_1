package com.aistudyhub.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Tài liệu được dùng làm context để trả lời, hiển thị cho FE biết "trả lời dựa trên đâu". */
public record SourceDocumentResponse(
        @JsonProperty("document_id") Integer documentId,
        @JsonProperty("document_name") String documentName,
        String title,
        @JsonProperty("subject_id") Integer subjectId,
        @JsonProperty("subject_name") String subjectName,
        Double score,
        @JsonProperty("summary_preview") String summaryPreview
) {
}
