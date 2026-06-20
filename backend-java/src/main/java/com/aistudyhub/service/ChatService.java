package com.aistudyhub.service;

import com.aistudyhub.dto.python.PythonChatAskRequest;
import com.aistudyhub.dto.python.PythonContextDocument;
import com.aistudyhub.dto.request.*;
import com.aistudyhub.dto.response.*;
import com.aistudyhub.exception.ResourceNotFoundException;
import com.aistudyhub.exception.UnauthorizedException;
import com.aistudyhub.model.SummaryHit;
import com.aistudyhub.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final Pattern TOKEN_PATTERN = Pattern.compile("[a-zA-Z0-9_]+");

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final AiSummaryRepository aiSummaryRepository;
    private final WebClient pythonAiWebClient;
    private final ObjectMapper objectMapper;

    public List<ChatSessionDto> listSessions(Integer userId) {
        return sessionRepository.findByUserId(userId);
    }

    public ChatSessionDto createSession(CreateChatSessionRequest req) {
        String title = req.getSessionTitle() != null ? req.getSessionTitle() : "New Chat";
        return sessionRepository.save(req.getUserId(), req.getDocumentId(), title);
    }

    public List<ChatMessageDto> listMessages(Integer sessionId, Integer userId) {
        ChatSessionDto session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        if (userId != null && !session.userId().equals(userId))
            throw new UnauthorizedException("Access denied");
        return messageRepository.findBySessionId(sessionId);
    }

    public void deleteSession(Integer sessionId, Integer userId) {
        ChatSessionDto session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        if (userId != null && !session.userId().equals(userId))
            throw new UnauthorizedException("Access denied");
        messageRepository.deleteBySessionId(sessionId);
        sessionRepository.deleteById(sessionId);
    }

    public ChatAskResponse ask(ChatAskRequest req) {
        final Integer sessionId;
        if (req.getSessionId() == null) {
            sessionId = sessionRepository.save(req.getUserId(), req.getDocumentId(), createTitle(req.getMessage())).sessionId();
        } else {
            sessionId = req.getSessionId();
            sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        }

        messageRepository.save(sessionId, "user", req.getMessage());

        // ── RAG: tìm các AI_SUMMARY liên quan nhất để làm context ──
        List<SummaryHit> contextHits = searchContext(req);
        List<SourceDocumentResponse> sources = contextHits.stream().map(this::toSourceResponse).toList();
        DetectedSubjectResponse detectedSubject = contextHits.isEmpty()
                ? null
                : new DetectedSubjectResponse(contextHits.get(0).subjectId(), contextHits.get(0).subjectName());

        String answer;
        boolean usedMockAi;
        try {
            Map<String, Object> result = pythonAiWebClient.post()
                    .uri("/api/chat/ask")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(new PythonChatAskRequest(
                            req.getMessage(),
                            sessionId,
                            contextHits.stream().map(this::toPythonContextDocument).toList()
                    ))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (result != null && result.get("answer") != null) {
                answer = String.valueOf(result.get("answer"));
                usedMockAi = Boolean.TRUE.equals(result.get("used_mock_ai"));
            } else {
                answer = buildLocalMockAnswer(req.getMessage(), contextHits);
                usedMockAi = true;
            }
        } catch (Exception e) {
            log.warn("Python AI service unavailable, falling back to mock answer: {}", e.getMessage());
            answer = buildLocalMockAnswer(req.getMessage(), contextHits);
            usedMockAi = true;
        }

        messageRepository.save(sessionId, "assistant", answer, toSourcesJson(sources));
        sessionRepository.touch(sessionId);

        return new ChatAskResponse(answer, sessionId, detectedSubject, sources, usedMockAi);
    }

    private String createTitle(String message) {
        String normalized = message == null ? "New AI Chat" : message.trim();
        if (normalized.isBlank()) return "New AI Chat";
        return normalized.length() > 80 ? normalized.substring(0, 80) : normalized;
    }

    private List<SummaryHit> searchContext(ChatAskRequest req) {
        List<Integer> documentIds = normalizeDocumentIds(req);
        int topK = req.getTopK() == null ? 3 : req.getTopK();

        List<SummaryHit> ranked = aiSummaryRepository.findForChatContext(req.getUserId(), req.getSubjectId(), documentIds).stream()
                .map(hit -> hit.withScore(keywordScore(req.getMessage(), hit)))
                .sorted(Comparator.comparing(SummaryHit::score).reversed())
                .limit(topK)
                .toList();

        if (documentIds == null || documentIds.isEmpty()) {
            return ranked.stream().filter(hit -> hit.score() > 0).toList();
        }
        return ranked;
    }

    private List<Integer> normalizeDocumentIds(ChatAskRequest req) {
        if (req.getDocumentIds() != null && !req.getDocumentIds().isEmpty()) {
            return req.getDocumentIds();
        }
        if (req.getDocumentId() != null) {
            return List.of(req.getDocumentId());
        }
        return List.of();
    }

    /** Chấm điểm liên quan đơn giản bằng overlap từ khóa giữa câu hỏi và nội dung summary. */
    private Double keywordScore(String query, SummaryHit hit) {
        Set<String> queryTerms = tokenize(query);
        if (queryTerms.isEmpty()) {
            return 0.0;
        }
        Set<String> titleTerms = tokenize(String.join(" ", Arrays.asList(
                nullToBlank(hit.documentName()),
                nullToBlank(hit.title()),
                nullToBlank(hit.subjectName())
        )));
        Set<String> summaryTerms = tokenize(hit.summaryContent());

        double score = 0.0;
        for (String term : queryTerms) {
            if (titleTerms.contains(term)) score += 2.0;
            if (summaryTerms.contains(term)) score += 1.0;
        }
        return Math.round(score / queryTerms.size() * 10_000.0) / 10_000.0;
    }

    private Set<String> tokenize(String text) {
        Set<String> terms = new HashSet<>();
        TOKEN_PATTERN.matcher(nullToBlank(text).toLowerCase(Locale.ROOT))
                .results()
                .map(match -> match.group())
                .forEach(terms::add);
        return terms;
    }

    private SourceDocumentResponse toSourceResponse(SummaryHit hit) {
        return new SourceDocumentResponse(
                hit.documentId(), hit.documentName(), hit.title(),
                hit.subjectId(), hit.subjectName(), hit.score(), preview(hit.summaryContent())
        );
    }

    private PythonContextDocument toPythonContextDocument(SummaryHit hit) {
        return new PythonContextDocument(
                hit.documentId(), hit.documentName(), hit.title(),
                hit.subjectId(), hit.subjectName(), hit.score(), hit.summaryContent()
        );
    }

    /** Fallback khi Python AI không phản hồi: trả lời dựa thẳng vào summary tìm được, để chat không bị vỡ. */
    private String buildLocalMockAnswer(String question, List<SummaryHit> hits) {
        if (hits.isEmpty()) {
            return "AI service is unavailable right now and no matching study material was found for this question.";
        }

        SummaryHit bestHit = hits.get(0);
        StringBuilder answer = new StringBuilder();
        answer.append("AI service is unavailable right now — here is a quick answer based on your documents.\n\n");
        answer.append("Based on ").append(bestHit.documentName()).append(": ");
        answer.append(preview(bestHit.summaryContent()));

        if (hits.size() > 1) {
            answer.append("\n\nOther related documents:");
            hits.stream().skip(1).limit(2).forEach(hit -> answer.append("\n- ").append(hit.documentName()));
        }
        return answer.toString();
    }

    private String preview(String text) {
        String normalized = nullToBlank(text);
        return normalized.length() > 240 ? normalized.substring(0, 240) : normalized;
    }

    private String nullToBlank(String value) {
        return value == null ? "" : value;
    }

    private String toSourcesJson(List<SourceDocumentResponse> sources) {
        if (sources == null || sources.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(sources);
        } catch (JsonProcessingException e) {
            log.warn("Could not serialize chat sources: {}", e.getMessage());
            return null;
        }
    }
}
