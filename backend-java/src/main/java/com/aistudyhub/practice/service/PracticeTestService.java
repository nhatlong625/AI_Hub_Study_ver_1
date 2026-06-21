package com.aistudyhub.practice.service;

import com.aistudyhub.document.entity.DocumentEntity;
import com.aistudyhub.document.repository.DocumentRepository;
import com.aistudyhub.practice.config.PracticeProperties;
import com.aistudyhub.practice.dto.AnswerOptionResponse;
import com.aistudyhub.practice.dto.GeneratePracticeTestRequest;
import com.aistudyhub.practice.dto.PracticeTestResponse;
import com.aistudyhub.practice.dto.PracticeTestResultResponse;
import com.aistudyhub.practice.dto.PracticeTestSummaryResponse;
import com.aistudyhub.practice.dto.QuizQuestionResponse;
import com.aistudyhub.practice.dto.ReviewOptionResponse;
import com.aistudyhub.practice.dto.ReviewQuestionResponse;
import com.aistudyhub.practice.dto.SourceDocumentResponse;
import com.aistudyhub.practice.dto.SubmitPracticeTestRequest;
import com.aistudyhub.practice.entity.AnswerOptionEntity;
import com.aistudyhub.practice.entity.PracticeTestEntity;
import com.aistudyhub.practice.entity.QuizQuestionEntity;
import com.aistudyhub.practice.entity.TestAttemptEntity;
import com.aistudyhub.practice.entity.TestResultEntity;
import com.aistudyhub.practice.entity.UserAnswerEntity;
import com.aistudyhub.practice.repository.AnswerOptionRepository;
import com.aistudyhub.practice.repository.PracticeTestRepository;
import com.aistudyhub.practice.repository.QuizQuestionRepository;
import com.aistudyhub.practice.repository.TestAttemptRepository;
import com.aistudyhub.practice.repository.TestResultRepository;
import com.aistudyhub.practice.repository.UserAnswerRepository;
import com.aistudyhub.security.CurrentUserService;
import com.aistudyhub.user.entity.UserEntity;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PracticeTestService {
    private static final String QUESTION_TYPE = "Multiple Choice";

    private final CurrentUserService currentUserService;
    private final DocumentRepository documentRepository;
    private final PracticeTestRepository practiceTestRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AnswerOptionRepository answerOptionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final TestResultRepository testResultRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final PdfTextExtractor pdfTextExtractor;
    private final AiPracticeTestService aiPracticeTestService;
    private final PracticeProperties practiceProperties;

    public PracticeTestService(CurrentUserService currentUserService,
                               DocumentRepository documentRepository,
                               PracticeTestRepository practiceTestRepository,
                               QuizQuestionRepository quizQuestionRepository,
                               AnswerOptionRepository answerOptionRepository,
                               TestAttemptRepository testAttemptRepository,
                               TestResultRepository testResultRepository,
                               UserAnswerRepository userAnswerRepository,
                               PdfTextExtractor pdfTextExtractor,
                               AiPracticeTestService aiPracticeTestService,
                               PracticeProperties practiceProperties) {
        this.currentUserService = currentUserService;
        this.documentRepository = documentRepository;
        this.practiceTestRepository = practiceTestRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.answerOptionRepository = answerOptionRepository;
        this.testAttemptRepository = testAttemptRepository;
        this.testResultRepository = testResultRepository;
        this.userAnswerRepository = userAnswerRepository;
        this.pdfTextExtractor = pdfTextExtractor;
        this.aiPracticeTestService = aiPracticeTestService;
        this.practiceProperties = practiceProperties;
    }

    @Transactional
    public PracticeTestResponse generate(GeneratePracticeTestRequest request) {
        UserEntity user = currentUserService.getCurrentUser();
        DocumentEntity document = documentRepository.findAccessibleById(request.getDocumentId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document was not found or is not accessible."));
        validatePdfDocument(document);

        String documentText = pdfTextExtractor.extractText(document.getDocumentUrl());
        if (documentText.length() < practiceProperties.getMinimumSourceTextLength()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected PDF does not contain enough text to generate a practice test.");
        }

        int questionCount = resolveQuestionCount(request.getNumberOfQuestions());
        int timeLimit = resolveTimeLimitMinutes(request.getDuration());
        String difficulty = normalizeDifficulty(request.getDifficulty());
        String title = resolveTitle(request.getTitle(), document);

        GeneratedPracticeTest generated = aiPracticeTestService.generate(new PracticeTestGenerationInput(
                document.getId(), title, documentText, questionCount, difficulty
        ));
        if (generated.questions() == null || generated.questions().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Practice test generation returned no questions.");
        }

        PracticeTestEntity practiceTest = new PracticeTestEntity();
        practiceTest.setDocument(document);
        practiceTest.setTitle(title);
        practiceTest.setDescription("Generated from document " + document.getId() + " with " + difficulty + " difficulty.");
        practiceTest.setTotalQuestion(generated.questions().size());
        practiceTest.setTimeLimit(timeLimit);
        PracticeTestEntity savedPracticeTest = practiceTestRepository.save(practiceTest);

        List<QuizQuestionEntity> savedQuestions = new ArrayList<>();
        for (GeneratedQuestion generatedQuestion : generated.questions()) {
            QuizQuestionEntity question = new QuizQuestionEntity();
            question.setPracticeTest(savedPracticeTest);
            question.setQuestionContent(required(generatedQuestion.question(), "Generated question content is missing."));
            question.setQuestionType(QUESTION_TYPE);
            question.setDifficultyLevel(normalizeDifficulty(generatedQuestion.difficulty()));
            question.setCorrectAnswer(resolveCorrectAnswer(generatedQuestion));
            QuizQuestionEntity savedQuestion = quizQuestionRepository.save(question);
            savedQuestions.add(savedQuestion);
            saveAnswerOptions(savedQuestion, generatedQuestion.options());
        }

        return toPracticeTestResponse(savedPracticeTest, savedQuestions, loadOptionsByQuestion(savedQuestions));
    }

    @Transactional(readOnly = true)
    public PracticeTestResponse getPracticeTest(Long practiceTestId) {
        UserEntity user = currentUserService.getCurrentUser();
        PracticeTestEntity practiceTest = findAccessiblePracticeTest(practiceTestId, user.getId());
        List<QuizQuestionEntity> questions = quizQuestionRepository.findByPracticeTestIdOrderByIdAsc(practiceTest.getId());
        return toPracticeTestResponse(practiceTest, questions, loadOptionsByQuestion(questions));
    }

    @Transactional(readOnly = true)
    public List<PracticeTestSummaryResponse> getMyTests() {
        UserEntity user = currentUserService.getCurrentUser();
        return practiceTestRepository.findAccessibleForUser(user.getId()).stream()
                .map(practiceTest -> toPracticeTestSummary(practiceTest, user.getId()))
                .toList();
    }

    @Transactional
    public PracticeTestResultResponse submit(Long practiceTestId, SubmitPracticeTestRequest request) {
        UserEntity user = currentUserService.getCurrentUser();
        PracticeTestEntity practiceTest = findAccessiblePracticeTest(practiceTestId, user.getId());
        List<QuizQuestionEntity> questions = quizQuestionRepository.findByPracticeTestIdOrderByIdAsc(practiceTest.getId());
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This practice test has no questions.");
        }

        Map<Long, List<AnswerOptionEntity>> optionsByQuestion = loadOptionsByQuestion(questions);
        Map<Long, AnswerOptionEntity> submittedAnswers = parseSubmittedAnswers(request.getAnswers(), questions, optionsByQuestion);
        LocalDateTime submittedAt = LocalDateTime.now();

        TestAttemptEntity attempt = new TestAttemptEntity();
        attempt.setUserId(user.getId());
        attempt.setQuestionId(practiceTest.getId());
        attempt.setTestId(questions.get(0).getId());
        attempt.setStartTime(resolveStartTime(submittedAt, request.getElapsedSeconds()));
        attempt.setEndTime(submittedAt);
        attempt.setStatus("Completed");
        TestAttemptEntity savedAttempt = testAttemptRepository.save(attempt);

        int correctCount = 0;
        for (QuizQuestionEntity question : questions) {
            AnswerOptionEntity selected = submittedAnswers.get(question.getId());
            if (selected == null) {
                continue;
            }
            boolean correct = Boolean.TRUE.equals(selected.getCorrect());
            if (correct) {
                correctCount++;
            }
            saveUserAnswer(savedAttempt, question, selected, correct, submittedAt);
        }

        BigDecimal score = calculateScore(correctCount, questions.size());
        savedAttempt.setScore(score);

        TestResultEntity result = new TestResultEntity();
        result.setAttemptId(savedAttempt.getId());
        result.setTotalQuestion(questions.size());
        result.setCorrectAnswer(correctCount);
        result.setScore(score);
        result.setGrade(resolveGrade(score));
        TestResultEntity savedResult = testResultRepository.save(result);

        return toPracticeTestResultResponse(savedResult, savedAttempt, practiceTest, questions, optionsByQuestion, submittedAnswers, request.getElapsedSeconds());
    }

    @Transactional(readOnly = true)
    public PracticeTestResultResponse getResult(Long resultId) {
        UserEntity user = currentUserService.getCurrentUser();
        TestResultEntity result = testResultRepository.findById(resultId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice test result was not found."));
        TestAttemptEntity attempt = testAttemptRepository.findById(result.getAttemptId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice test attempt was not found."));
        if (!Objects.equals(attempt.getUserId(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access another user's practice test result.");
        }

        PracticeTestEntity practiceTest = findAccessiblePracticeTest(attempt.getQuestionId(), user.getId());
        List<QuizQuestionEntity> questions = quizQuestionRepository.findByPracticeTestIdOrderByIdAsc(practiceTest.getId());
        Map<Long, List<AnswerOptionEntity>> optionsByQuestion = loadOptionsByQuestion(questions);
        Map<Long, AnswerOptionEntity> submittedAnswers = loadSubmittedAnswers(attempt.getId(), optionsByQuestion);
        return toPracticeTestResultResponse(result, attempt, practiceTest, questions, optionsByQuestion, submittedAnswers, resolveElapsedSeconds(attempt));
    }

    private PracticeTestEntity findAccessiblePracticeTest(Long practiceTestId, Long userId) {
        return practiceTestRepository.findAccessibleById(practiceTestId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice test was not found or is not accessible."));
    }

    private void validatePdfDocument(DocumentEntity document) {
        String documentType = document.getDocumentType();
        String documentUrl = document.getDocumentUrl();
        boolean typeLooksPdf = documentType != null && documentType.toLowerCase(Locale.ROOT).contains("pdf");
        boolean urlLooksPdf = documentUrl != null && documentUrl.toLowerCase(Locale.ROOT).contains(".pdf");
        if (!typeLooksPdf && !urlLooksPdf) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Practice tests can only be generated from PDF documents.");
        }
    }

    private int resolveQuestionCount(Integer requestedCount) {
        int count = requestedCount == null ? practiceProperties.getDefaultQuestionCount() : requestedCount;
        return Math.min(Math.max(1, count), practiceProperties.getMaxQuestions());
    }

    private int resolveTimeLimitMinutes(String requestedDuration) {
        if (requestedDuration == null || requestedDuration.isBlank()) {
            return practiceProperties.getDefaultTimeLimitMinutes();
        }
        String digits = requestedDuration.replaceAll("[^0-9]", "");
        if (digits.isBlank()) {
            return practiceProperties.getDefaultTimeLimitMinutes();
        }
        try {
            return Math.max(1, Integer.parseInt(digits));
        } catch (NumberFormatException exception) {
            return practiceProperties.getDefaultTimeLimitMinutes();
        }
    }

    private String normalizeDifficulty(String difficulty) {
        if (difficulty == null || difficulty.isBlank()) {
            return "Medium";
        }
        return switch (difficulty.trim().toLowerCase(Locale.ROOT)) {
            case "easy" -> "Easy";
            case "hard" -> "Hard";
            case "mixed" -> "Mixed";
            default -> "Medium";
        };
    }

    private String resolveTitle(String requestedTitle, DocumentEntity document) {
        if (requestedTitle != null && !requestedTitle.isBlank()) {
            return trimToLength(requestedTitle.trim(), 255);
        }
        String base = document.getTitle() != null && !document.getTitle().isBlank()
                ? document.getTitle()
                : document.getDocumentName();
        return trimToLength((base == null || base.isBlank() ? "Practice Test" : base + " Practice Test"), 255);
    }

    private String resolveCorrectAnswer(GeneratedQuestion generatedQuestion) {
        if (generatedQuestion.options() == null || generatedQuestion.options().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Generated question is missing answer options.");
        }
        return generatedQuestion.options().stream()
                .filter(GeneratedAnswerOption::correct)
                .map(GeneratedAnswerOption::text)
                .filter(text -> text != null && !text.isBlank())
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Generated question is missing a correct answer."));
    }

    private String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
        }
        return value.trim();
    }

    private void saveAnswerOptions(QuizQuestionEntity savedQuestion, List<GeneratedAnswerOption> generatedOptions) {
        if (generatedOptions == null || generatedOptions.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Generated question must have at least two options.");
        }
        long correctCount = generatedOptions.stream().filter(GeneratedAnswerOption::correct).count();
        if (correctCount != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Generated question must have exactly one correct option.");
        }
        for (GeneratedAnswerOption generatedOption : generatedOptions) {
            AnswerOptionEntity option = new AnswerOptionEntity();
            option.setQuestionId(savedQuestion.getId());
            option.setOptionContent(required(generatedOption.text(), "Generated answer option content is missing."));
            option.setCorrect(generatedOption.correct());
            answerOptionRepository.save(option);
        }
    }

    private Map<Long, List<AnswerOptionEntity>> loadOptionsByQuestion(Collection<QuizQuestionEntity> questions) {
        List<Long> questionIds = questions.stream().map(QuizQuestionEntity::getId).toList();
        if (questionIds.isEmpty()) {
            return Map.of();
        }
        return answerOptionRepository.findByQuestionIdIn(questionIds).stream()
                .sorted(Comparator.comparing(AnswerOptionEntity::getId))
                .collect(Collectors.groupingBy(AnswerOptionEntity::getQuestionId, LinkedHashMap::new, Collectors.toList()));
    }

    private PracticeTestResponse toPracticeTestResponse(PracticeTestEntity practiceTest, List<QuizQuestionEntity> questions, Map<Long, List<AnswerOptionEntity>> optionsByQuestion) {
        DocumentEntity document = practiceTest.getDocument();
        List<QuizQuestionResponse> questionResponses = questions.stream()
                .map(question -> {
                    List<AnswerOptionResponse> answerOptions = optionsByQuestion.getOrDefault(question.getId(), List.of()).stream()
                            .map(option -> new AnswerOptionResponse(option.getId(), option.getOptionContent()))
                            .toList();
                    return new QuizQuestionResponse(
                            question.getId(),
                            question.getQuestionContent(),
                            answerOptions.stream().map(AnswerOptionResponse::text).toList(),
                            answerOptions,
                            question.getDifficultyLevel(),
                            question.getQuestionType(),
                            null,
                            null
                    );
                })
                .toList();

        return new PracticeTestResponse(
                practiceTest.getId(),
                practiceTest.getTitle(),
                document.getId(),
                document.getDocumentName(),
                document.getTitle(),
                resolvePracticeDifficulty(questions),
                QUESTION_TYPE,
                questions.size(),
                practiceTest.getTimeLimit(),
                Boolean.FALSE,
                practiceTest.getCreatedAt(),
                List.of(new SourceDocumentResponse(document.getId(), document.getDocumentName(), document.getTitle(), document.getDocumentUrl())),
                questionResponses
        );
    }

    private PracticeTestSummaryResponse toPracticeTestSummary(PracticeTestEntity practiceTest, Long userId) {
        Optional<TestAttemptEntity> latestAttempt = testAttemptRepository.findTopByUserIdAndQuestionIdOrderByEndTimeDesc(userId, practiceTest.getId());
        Optional<TestResultEntity> latestResult = latestAttempt.flatMap(attempt -> testResultRepository.findByAttemptId(attempt.getId()));
        String status = latestResult.map(result -> result.getScore().compareTo(BigDecimal.valueOf(50)) >= 0 ? "Passed" : "Failed")
                .orElseGet(() -> latestAttempt.map(TestAttemptEntity::getStatus).orElse("Ready"));
        DocumentEntity document = practiceTest.getDocument();
        List<QuizQuestionEntity> questions = quizQuestionRepository.findByPracticeTestIdOrderByIdAsc(practiceTest.getId());
        return new PracticeTestSummaryResponse(
                practiceTest.getId(),
                practiceTest.getTitle(),
                document.getId(),
                document.getDocumentName(),
                document.getTitle(),
                practiceTest.getTotalQuestion(),
                practiceTest.getTimeLimit(),
                resolvePracticeDifficulty(questions),
                status,
                latestResult.map(TestResultEntity::getScore).orElseGet(() -> latestAttempt.map(TestAttemptEntity::getScore).orElse(null)),
                practiceTest.getCreatedAt(),
                latestAttempt.map(TestAttemptEntity::getEndTime).orElse(null)
        );
    }

    private PracticeTestResultResponse toPracticeTestResultResponse(TestResultEntity result,
                                                                    TestAttemptEntity attempt,
                                                                    PracticeTestEntity practiceTest,
                                                                    List<QuizQuestionEntity> questions,
                                                                    Map<Long, List<AnswerOptionEntity>> optionsByQuestion,
                                                                    Map<Long, AnswerOptionEntity> submittedAnswers,
                                                                    Integer elapsedSeconds) {
        List<ReviewQuestionResponse> review = questions.stream()
                .map(question -> toReviewQuestion(question, optionsByQuestion.getOrDefault(question.getId(), List.of()), submittedAnswers.get(question.getId())))
                .toList();
        return new PracticeTestResultResponse(
                result.getId(),
                attempt.getId(),
                practiceTest.getId(),
                practiceTest.getTitle(),
                result.getTotalQuestion(),
                result.getCorrectAnswer(),
                result.getTotalQuestion() - result.getCorrectAnswer(),
                result.getScore(),
                result.getGrade(),
                elapsedSeconds,
                result.getGeneratedAt(),
                review,
                toPracticeTestResponse(practiceTest, questions, optionsByQuestion)
        );
    }

    private ReviewQuestionResponse toReviewQuestion(QuizQuestionEntity question, List<AnswerOptionEntity> options, AnswerOptionEntity selectedOption) {
        AnswerOptionEntity correctOption = options.stream().filter(option -> Boolean.TRUE.equals(option.getCorrect())).findFirst().orElse(null);
        Integer selectedIndex = indexOfOption(options, selectedOption);
        Integer correctIndex = indexOfOption(options, correctOption);
        List<ReviewOptionResponse> optionResponses = options.stream()
                .map(option -> new ReviewOptionResponse(
                        option.getId(),
                        option.getOptionContent(),
                        selectedOption != null && Objects.equals(selectedOption.getId(), option.getId()),
                        Boolean.TRUE.equals(option.getCorrect())
                ))
                .toList();
        return new ReviewQuestionResponse(
                question.getId(),
                question.getQuestionContent(),
                optionResponses,
                selectedOption == null ? null : selectedOption.getId(),
                selectedIndex,
                selectedOption == null ? null : selectedOption.getOptionContent(),
                correctOption == null ? null : correctOption.getId(),
                correctIndex,
                correctOption == null ? null : correctOption.getOptionContent(),
                selectedOption != null && Boolean.TRUE.equals(selectedOption.getCorrect()),
                null,
                question.getDifficultyLevel()
        );
    }

    private Integer indexOfOption(List<AnswerOptionEntity> options, AnswerOptionEntity option) {
        if (option == null) {
            return null;
        }
        for (int index = 0; index < options.size(); index++) {
            if (Objects.equals(options.get(index).getId(), option.getId())) {
                return index;
            }
        }
        return null;
    }

    private Map<Long, AnswerOptionEntity> parseSubmittedAnswers(JsonNode answers, List<QuizQuestionEntity> questions, Map<Long, List<AnswerOptionEntity>> optionsByQuestion) {
        if (answers == null || answers.isNull()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "answers is required.");
        }
        Map<Long, QuizQuestionEntity> questionsById = questions.stream()
                .collect(Collectors.toMap(QuizQuestionEntity::getId, Function.identity(), (left, right) -> left, LinkedHashMap::new));
        Map<Long, AnswerOptionEntity> selections = new LinkedHashMap<>();
        if (answers.isObject()) {
            answers.fields().forEachRemaining(entry -> {
                Long questionId = parseQuestionId(entry.getKey());
                if (!questionsById.containsKey(questionId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer references an unknown question: " + entry.getKey());
                }
                resolveSelectedOption(questionId, entry.getValue(), optionsByQuestion).ifPresent(option -> selections.put(questionId, option));
            });
            return selections;
        }
        if (answers.isArray()) {
            int index = 0;
            for (JsonNode answerNode : answers) {
                int answerIndex = index;
                Long questionId = resolveQuestionId(answerNode).orElseGet(() -> answerIndex < questions.size() ? questions.get(answerIndex).getId() : null);
                if (questionId == null || !questionsById.containsKey(questionId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer at index " + index + " does not reference a known question.");
                }
                JsonNode selectedNode = resolveSelectedAnswerNode(answerNode).orElse(answerNode);
                resolveSelectedOption(questionId, selectedNode, optionsByQuestion).ifPresent(option -> selections.put(questionId, option));
                index++;
            }
            return selections;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "answers must be an object or array.");
    }

    private Long parseQuestionId(String key) {
        try {
            return Long.parseLong(key);
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question id must be numeric: " + key);
        }
    }

    private Optional<Long> resolveQuestionId(JsonNode answerNode) {
        if (!answerNode.isObject()) {
            return Optional.empty();
        }
        for (String field : List.of("questionId", "quizId", "id")) {
            JsonNode value = answerNode.get(field);
            if (value != null && value.canConvertToLong()) {
                return Optional.of(value.asLong());
            }
        }
        return Optional.empty();
    }

    private Optional<JsonNode> resolveSelectedAnswerNode(JsonNode answerNode) {
        if (!answerNode.isObject()) {
            return Optional.empty();
        }
        for (String field : List.of("optionId", "selectedOptionId", "answerOptionId", "selectedAnswerIndex", "selectedIndex", "answer", "selectedAnswer")) {
            JsonNode value = answerNode.get(field);
            if (value != null && !value.isNull()) {
                return Optional.of(value);
            }
        }
        return Optional.empty();
    }

    private Optional<AnswerOptionEntity> resolveSelectedOption(Long questionId, JsonNode selectedNode, Map<Long, List<AnswerOptionEntity>> optionsByQuestion) {
        if (selectedNode == null || selectedNode.isNull()) {
            return Optional.empty();
        }
        List<AnswerOptionEntity> options = optionsByQuestion.getOrDefault(questionId, List.of());
        if (options.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question has no answer options: " + questionId);
        }
        if (selectedNode.canConvertToLong()) {
            long numericValue = selectedNode.asLong();
            Optional<AnswerOptionEntity> byId = options.stream().filter(option -> Objects.equals(option.getId(), numericValue)).findFirst();
            if (byId.isPresent()) {
                return byId;
            }
            if (numericValue >= 0 && numericValue < options.size()) {
                return Optional.of(options.get((int) numericValue));
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected option is not valid for question " + questionId + ".");
        }
        if (selectedNode.isTextual()) {
            String selectedText = selectedNode.asText().trim();
            if (selectedText.isBlank()) {
                return Optional.empty();
            }
            Optional<AnswerOptionEntity> byLetter = optionByLetter(selectedText, options);
            if (byLetter.isPresent()) {
                return byLetter;
            }
            return options.stream().filter(option -> option.getOptionContent().equalsIgnoreCase(selectedText)).findFirst()
                    .or(() -> { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected answer text does not match any option for question " + questionId + "."); });
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected option format is invalid for question " + questionId + ".");
    }

    private Optional<AnswerOptionEntity> optionByLetter(String selectedText, List<AnswerOptionEntity> options) {
        if (selectedText.length() != 1) {
            return Optional.empty();
        }
        int index = Character.toUpperCase(selectedText.charAt(0)) - 'A';
        return index >= 0 && index < options.size() ? Optional.of(options.get(index)) : Optional.empty();
    }

    private void saveUserAnswer(TestAttemptEntity attempt, QuizQuestionEntity question, AnswerOptionEntity selectedOption, boolean correct, LocalDateTime answeredAt) {
        UserAnswerEntity userAnswer = new UserAnswerEntity();
        userAnswer.setAttemptId(attempt.getId());
        userAnswer.setQuestionId(question.getId());
        userAnswer.setOptionId(selectedOption.getId());
        userAnswer.setSelectedAnswer(selectedOption.getOptionContent());
        userAnswer.setCorrect(correct);
        userAnswer.setAnsweredAt(answeredAt);
        userAnswerRepository.save(userAnswer);
    }

    private Map<Long, AnswerOptionEntity> loadSubmittedAnswers(Long attemptId, Map<Long, List<AnswerOptionEntity>> optionsByQuestion) {
        Map<Long, Map<Long, AnswerOptionEntity>> optionsByQuestionAndId = optionsByQuestion.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().stream().collect(Collectors.toMap(AnswerOptionEntity::getId, Function.identity()))));
        Map<Long, AnswerOptionEntity> submittedAnswers = new LinkedHashMap<>();
        for (UserAnswerEntity answer : userAnswerRepository.findByAttemptIdOrderByIdAsc(attemptId)) {
            AnswerOptionEntity option = optionsByQuestionAndId.getOrDefault(answer.getQuestionId(), Map.of()).get(answer.getOptionId());
            if (option != null) {
                submittedAnswers.put(answer.getQuestionId(), option);
            }
        }
        return submittedAnswers;
    }

    private BigDecimal calculateScore(int correctAnswers, int totalQuestions) {
        if (totalQuestions <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(correctAnswers).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP);
    }

    private String resolveGrade(BigDecimal score) {
        int value = score.setScale(0, RoundingMode.DOWN).intValue();
        if (value >= 90) return "A";
        if (value >= 80) return "B";
        if (value >= 70) return "C";
        if (value >= 60) return "D";
        return "F";
    }

    private LocalDateTime resolveStartTime(LocalDateTime submittedAt, Integer elapsedSeconds) {
        return elapsedSeconds == null || elapsedSeconds < 0 ? submittedAt : submittedAt.minusSeconds(elapsedSeconds);
    }

    private Integer resolveElapsedSeconds(TestAttemptEntity attempt) {
        if (attempt.getStartTime() == null || attempt.getEndTime() == null) {
            return null;
        }
        long seconds = Duration.between(attempt.getStartTime(), attempt.getEndTime()).toSeconds();
        return seconds > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) Math.max(0, seconds);
    }

    private String resolvePracticeDifficulty(List<QuizQuestionEntity> questions) {
        Set<String> difficulties = questions.stream()
                .map(QuizQuestionEntity::getDifficultyLevel)
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.toSet());
        return difficulties.isEmpty() ? "Medium" : difficulties.size() == 1 ? difficulties.iterator().next() : "Mixed";
    }

    private String trimToLength(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength).trim();
    }
}
