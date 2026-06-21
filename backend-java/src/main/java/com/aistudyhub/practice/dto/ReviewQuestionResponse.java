package com.aistudyhub.practice.dto;

import java.util.List;

public record ReviewQuestionResponse(
        Long questionId,
        String question,
        List<ReviewOptionResponse> options,
        Long selectedOptionId,
        Integer selectedAnswerIndex,
        String selectedAnswer,
        Long correctOptionId,
        Integer correctAnswerIndex,
        String correctAnswer,
        Boolean isCorrect,
        String explanation,
        String difficulty
) {
}
