package com.aistudyhub.practice.service;

import java.util.List;

public record GeneratedQuestion(
        String question,
        String difficulty,
        String topic,
        String explanation,
        List<GeneratedAnswerOption> options
) {
}
