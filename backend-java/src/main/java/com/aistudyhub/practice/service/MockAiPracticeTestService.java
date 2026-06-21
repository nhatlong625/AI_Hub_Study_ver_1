package com.aistudyhub.practice.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Primary
public class MockAiPracticeTestService implements AiPracticeTestService {
    private static final Pattern SENTENCE_SPLIT = Pattern.compile("(?<=[.!?])\\s+");
    private static final Set<String> STOP_WORDS = Set.of(
            "about", "after", "again", "also", "because", "before", "between", "could",
            "during", "every", "first", "from", "have", "into", "more", "most",
            "other", "should", "such", "than", "that", "their", "there", "these",
            "they", "this", "through", "under", "using", "when", "where", "which",
            "while", "with", "within", "would"
    );

    @Override
    public GeneratedPracticeTest generate(PracticeTestGenerationInput input) {
        List<String> sourceSentences = selectSourceSentences(input.documentText());
        if (sourceSentences.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected document does not contain enough educational text to generate a practice test.");
        }
        List<GeneratedQuestion> questions = new ArrayList<>();
        for (int index = 0; index < Math.max(1, input.numberOfQuestions()); index++) {
            String source = sourceSentences.get(index % sourceSentences.size());
            String topic = selectTopic(source, input.title());
            String difficulty = resolveDifficulty(input.difficulty(), index);
            String correctAnswer = normalizeAnswer(source);
            questions.add(new GeneratedQuestion(
                    createQuestion(topic, difficulty, index),
                    difficulty,
                    topic,
                    "The correct option is supported by the source material section about " + topic + ".",
                    createOptions(correctAnswer, topic, sourceSentences, index)
            ));
        }
        return new GeneratedPracticeTest(questions);
    }

    private List<String> selectSourceSentences(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        String normalized = text.replaceAll("\\s+", " ").trim();
        List<String> sentences = Arrays.stream(SENTENCE_SPLIT.split(normalized))
                .map(String::trim)
                .filter(sentence -> sentence.length() >= 45)
                .filter(sentence -> sentence.split(" ").length >= 8)
                .filter(sentence -> !sentence.matches("^[0-9 .-]+$"))
                .map(sentence -> sentence.replaceFirst("^[\\-0-9.)\\s]+", "").trim())
                .distinct()
                .limit(80)
                .toList();
        if (!sentences.isEmpty()) {
            return sentences;
        }
        List<String> chunks = new ArrayList<>();
        for (int start = 0; start < normalized.length(); start += 180) {
            String chunk = normalized.substring(start, Math.min(normalized.length(), start + 180)).trim();
            if (chunk.length() >= 45) {
                chunks.add(chunk);
            }
        }
        return chunks;
    }

    private String selectTopic(String sentence, String fallbackTitle) {
        List<String> words = Arrays.stream(sentence.replaceAll("[^A-Za-z0-9 ]", " ").split("\\s+"))
                .map(String::trim)
                .filter(word -> word.length() >= 5)
                .filter(word -> !STOP_WORDS.contains(word.toLowerCase(Locale.ROOT)))
                .distinct()
                .toList();
        if (!words.isEmpty()) {
            return titleCase(words.get(0));
        }
        if (fallbackTitle != null && !fallbackTitle.isBlank()) {
            return trimToLength(fallbackTitle.trim(), 48);
        }
        return "the selected concept";
    }

    private String resolveDifficulty(String requestedDifficulty, int index) {
        if (requestedDifficulty == null || requestedDifficulty.isBlank()) {
            return "Medium";
        }
        if (requestedDifficulty.equalsIgnoreCase("Mixed")) {
            return switch (index % 3) {
                case 0 -> "Easy";
                case 1 -> "Medium";
                default -> "Hard";
            };
        }
        return titleCase(requestedDifficulty.trim());
    }

    private String normalizeAnswer(String source) {
        String answer = source.replaceAll("\\s+", " ").trim();
        if (!answer.endsWith(".") && !answer.endsWith("!") && !answer.endsWith("?")) {
            answer = answer + ".";
        }
        return trimToLength(answer, 170);
    }

    private List<GeneratedAnswerOption> createOptions(String correctAnswer, String topic, List<String> sourceSentences, int index) {
        LinkedHashSet<String> optionTexts = new LinkedHashSet<>();
        optionTexts.add(correctAnswer);
        int cursor = index + 1;
        while (optionTexts.size() < 4 && cursor < index + sourceSentences.size() + 5) {
            String candidate = normalizeAnswer(sourceSentences.get(cursor % sourceSentences.size()));
            if (!candidate.equalsIgnoreCase(correctAnswer)) {
                optionTexts.add(candidate);
            }
            cursor++;
        }
        optionTexts.add("It removes the need to analyze " + topic + " in the learning material.");
        optionTexts.add("It is mainly a formatting detail and does not affect the concept being studied.");
        optionTexts.add("It means the topic should be skipped until the final review session.");
        List<GeneratedAnswerOption> options = new ArrayList<>();
        for (String optionText : optionTexts.stream().limit(4).toList()) {
            options.add(new GeneratedAnswerOption(optionText, optionText.equals(correctAnswer)));
        }
        Collections.shuffle(options, new Random(Objects.hash(correctAnswer, topic, index)));
        return options;
    }

    private String createQuestion(String topic, String difficulty, int index) {
        return switch (index % 4) {
            case 0 -> "Which statement is best supported by the material about " + topic + "?";
            case 1 -> "In the context of " + topic + ", which option matches the document most closely?";
            case 2 -> "What should a student remember about " + topic + " from this material?";
            default -> difficulty.equalsIgnoreCase("Hard")
                    ? "Which answer provides the strongest interpretation of " + topic + " based on the document?"
                    : "Which answer correctly describes " + topic + "?";
        };
    }

    private String titleCase(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        String lower = value.toLowerCase(Locale.ROOT);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    private String trimToLength(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        int lastSpace = value.lastIndexOf(' ', maxLength - 3);
        int end = lastSpace > 40 ? lastSpace : maxLength - 3;
        return value.substring(0, end).trim() + "...";
    }
}
