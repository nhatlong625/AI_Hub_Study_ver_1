package com.aistudyhub.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

/** Body for POST /api/documents/{id}/summarize. Java reads document content; FE does not send text. */
@Data
public class DocumentSummarizeRequest {
    @NotNull Integer documentId;
    Integer userId;
    @Min(1) @Max(30) Integer maxChunks;
}
