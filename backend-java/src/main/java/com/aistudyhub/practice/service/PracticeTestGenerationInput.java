package com.aistudyhub.practice.service;

public record PracticeTestGenerationInput(
        Long documentId,
        String title,
        String documentText,
        int numberOfQuestions,
        String difficulty
) {
}
