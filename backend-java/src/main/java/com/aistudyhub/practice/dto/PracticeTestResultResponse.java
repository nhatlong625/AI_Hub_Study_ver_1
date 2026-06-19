package com.aistudyhub.practice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PracticeTestResultResponse(
        Long resultId,
        Long attemptId,
        Long testId,
        String title,
        Integer totalQuestions,
        Integer correctAnswers,
        Integer wrongAnswers,
        BigDecimal score,
        String grade,
        Integer elapsedSeconds,
        LocalDateTime submittedAt,
        List<ReviewQuestionResponse> review,
        PracticeTestResponse quiz
) {
}
