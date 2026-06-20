package com.aistudyhub.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

/** Body cho POST /api/documents/{id}/summarize — Java tự lấy nội dung tài liệu, không cần FE gửi text. */
@Data
public class DocumentSummarizeRequest {
    @NotNull Integer documentId;
    @NotNull Integer userId;
    @Min(1) @Max(30) Integer maxChunks;
}
