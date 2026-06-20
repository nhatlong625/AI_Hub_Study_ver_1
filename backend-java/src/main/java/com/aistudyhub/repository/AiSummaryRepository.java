package com.aistudyhub.repository;

import com.aistudyhub.model.SummaryHit;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Ã„ÂÃ¡Â»Âc/viÃ¡ÂºÂ¿t bÃ¡ÂºÂ£ng AI_SUMMARY Ã¢â‚¬â€ nguÃ¡Â»â€œn context cho RAG chat (ChatService) vÃƒÂ 
 * nÃ†Â¡i lÃ†Â°u kÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ summarize tÃƒÂ i liÃ¡Â»â€¡u (DocumentService, dÃƒÂ¹ng Ã¡Â»Å¸ tÃƒÂ­nh nÃ„Æ’ng summarize sau).
 */
@Repository
public class AiSummaryRepository {

    private static final @NonNull RowMapper<SummaryHit> SUMMARY_HIT_ROW_MAPPER = (rs, rowNum) -> new SummaryHit(
            rs.getInt("document_id"),
            rs.getString("document_name"),
            rs.getString("title"),
            rs.getObject("subject_id", Integer.class),
            rs.getString("subject_name"),
            rs.getString("summary_content"),
            0.0
    );

    private final JdbcTemplate jdbcTemplate;

    public AiSummaryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** XÃƒÂ³a tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ summary cÃ¡Â»Â§a 1 document Ã¢â‚¬â€ gÃ¡Â»Âi trÃ†Â°Ã¡Â»â€ºc khi xÃƒÂ³a document Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh FK constraint. */
    public void deleteByDocumentId(Integer documentId) {
        jdbcTemplate.update("DELETE FROM AI_SUMMARY WHERE document_id = ?", documentId);
    }

    public void save(Integer documentId, Integer userId, String summaryContent, String modelName) {
        jdbcTemplate.update("""
                INSERT INTO AI_SUMMARY (document_id, user_id, summary_content, model_name, created_at)
                VALUES (?, ?, ?, ?, ?)
                """, documentId, userId, summaryContent, modelName, LocalDateTime.now());
    }

    public Optional<String> findLatestSummary(Integer documentId, Integer userId) {
        List<String> summaries = jdbcTemplate.queryForList("""
                SELECT TOP 1 summary_content
                FROM AI_SUMMARY
                WHERE document_id = ? AND user_id = ?
                ORDER BY created_at DESC, summary_id DESC
                """, String.class, documentId, userId);
        return summaries.stream().findFirst();
    }

    public Optional<String> findLatestFullFileSummary(Integer documentId, Integer userId) {
        List<String> summaries = jdbcTemplate.queryForList("""
                SELECT TOP 1 summary_content
                FROM AI_SUMMARY
                WHERE document_id = ? AND user_id = ?
                  AND model_name IN ('python-ai-service-full', 'mock-ai-full')
                ORDER BY created_at DESC, summary_id DESC
                """, String.class, documentId, userId);
        return summaries.stream().findFirst();
    }
    /** LÃ¡ÂºÂ¥y cÃƒÂ¡c summary cÃ¡Â»Â§a user, lÃ¡Â»Âc theo subject/document nÃ¡ÂºÂ¿u cÃƒÂ³ Ã¢â‚¬â€ dÃƒÂ¹ng lÃƒÂ m context RAG cho chat. */
    public List<SummaryHit> findForChatContext(Integer userId, Integer subjectId, List<Integer> documentIds) {
        StringBuilder sql = new StringBuilder("""
                WITH latest_summary AS (
                    SELECT
                        s.*,
                        ROW_NUMBER() OVER (
                            PARTITION BY s.document_id, s.user_id
                            ORDER BY s.created_at DESC, s.summary_id DESC
                        ) AS rn
                    FROM AI_SUMMARY s
                    WHERE s.user_id = ?
                )
                SELECT
                    d.document_id,
                    d.document_name,
                    d.title,
                    sub.subject_id,
                    sub.subject_name,
                    s.summary_content
                FROM latest_summary s
                JOIN DOCUMENT d ON s.document_id = d.document_id
                LEFT JOIN SUBJECT sub ON d.subject_id = sub.subject_id
                WHERE s.rn = 1
                """);
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (subjectId != null) {
            sql.append(" AND d.subject_id = ?");
            params.add(subjectId);
        }

        if (documentIds != null && !documentIds.isEmpty()) {
            sql.append(" AND d.document_id IN (");
            sql.append(String.join(",", documentIds.stream().map(id -> "?").toList()));
            sql.append(")");
            params.addAll(documentIds);
        }

        return jdbcTemplate.query(sql.toString(), SUMMARY_HIT_ROW_MAPPER, params.toArray());
    }
}

