package com.aistudyhub.practice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PracticeTestSummaryResponse(
        Long id,
        String title,
        Long documentId,
        String documentName,
        String subject,
        Integer questions,
        Integer duration,
        String difficulty,
        String status,
        BigDecimal score,
        LocalDateTime createdAt,
        LocalDateTime completedAt
) {
}
