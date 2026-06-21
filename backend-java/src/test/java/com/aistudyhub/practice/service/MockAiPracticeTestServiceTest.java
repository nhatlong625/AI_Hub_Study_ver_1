package com.aistudyhub.practice.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MockAiPracticeTestServiceTest {
    private final MockAiPracticeTestService service = new MockAiPracticeTestService();

    @Test
    void generateCreatesRequestedMultipleChoiceQuestions() {
        String sourceText = """
                Photosynthesis allows plants to convert light energy into chemical energy stored in glucose.
                Chlorophyll absorbs light most strongly in the blue and red wavelengths during photosynthesis.
                The light-dependent reactions produce ATP and NADPH that support the Calvin cycle.
                The Calvin cycle fixes carbon dioxide into sugars that can be used for growth and storage.
                """;

        GeneratedPracticeTest generated = service.generate(new PracticeTestGenerationInput(10L, "Photosynthesis", sourceText, 4, "Mixed"));

        assertThat(generated.questions()).hasSize(4);
        assertThat(generated.questions()).allSatisfy(question -> {
            assertThat(question.question()).isNotBlank();
            assertThat(question.options()).hasSize(4);
            assertThat(question.options()).filteredOn(GeneratedAnswerOption::correct).hasSize(1);
        });
    }
}
