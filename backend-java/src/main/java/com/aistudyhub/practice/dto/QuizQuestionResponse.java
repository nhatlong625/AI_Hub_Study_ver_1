package com.aistudyhub.practice.dto;

import java.util.List;

public record QuizQuestionResponse(
        Long id,
        String question,
        List<String> options,
        List<AnswerOptionResponse> answerOptions,
        String difficulty,
        String questionType,
        String topic,
        String explanation
) {
}
