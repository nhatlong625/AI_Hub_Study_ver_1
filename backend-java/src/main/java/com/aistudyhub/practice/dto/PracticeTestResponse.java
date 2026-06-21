package com.aistudyhub.practice.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PracticeTestResponse(
        Long id,
        String title,
        Long documentId,
        String documentName,
        String subject,
        String difficulty,
        String questionType,
        Integer numberOfQuestions,
        Integer duration,
        Boolean instantFeedback,
        LocalDateTime createdAt,
        List<SourceDocumentResponse> sources,
        List<QuizQuestionResponse> questions
) {
}
