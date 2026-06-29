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
 * Ãƒâ€žÃ‚ÂÃƒÂ¡Ã‚Â»Ã‚Âc/viÃƒÂ¡Ã‚ÂºÃ‚Â¿t bÃƒÂ¡Ã‚ÂºÃ‚Â£ng AI_SUMMARY ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â nguÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“n context cho RAG chat (ChatService) vÃƒÆ’Ã‚Â 
 * nÃƒâ€ Ã‚Â¡i lÃƒâ€ Ã‚Â°u kÃƒÂ¡Ã‚ÂºÃ‚Â¿t quÃƒÂ¡Ã‚ÂºÃ‚Â£ summarize tÃƒÆ’Ã‚Â i liÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡u (DocumentService, dÃƒÆ’Ã‚Â¹ng ÃƒÂ¡Ã‚Â»Ã…Â¸ tÃƒÆ’Ã‚Â­nh nÃƒâ€žÃ†â€™ng summarize sau).
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

    /** XÃƒÆ’Ã‚Â³a tÃƒÂ¡Ã‚ÂºÃ‚Â¥t cÃƒÂ¡Ã‚ÂºÃ‚Â£ summary cÃƒÂ¡Ã‚Â»Ã‚Â§a 1 document ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â gÃƒÂ¡Ã‚Â»Ã‚Âi trÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã¢â‚¬Âºc khi xÃƒÆ’Ã‚Â³a document Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã†â€™ trÃƒÆ’Ã‚Â¡nh FK constraint. */
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
                WHERE document_id = ?
                  AND model_name = 'python-ai-service-full'
                ORDER BY
                    CASE WHEN user_id = ? THEN 0 ELSE 1 END,
                    created_at DESC,
                    summary_id DESC
                """, String.class, documentId, userId);
        return summaries.stream().findFirst();
    }
    /** LÃƒÂ¡Ã‚ÂºÃ‚Â¥y cÃƒÆ’Ã‚Â¡c summary cÃƒÂ¡Ã‚Â»Ã‚Â§a user, lÃƒÂ¡Ã‚Â»Ã‚Âc theo subject/document nÃƒÂ¡Ã‚ÂºÃ‚Â¿u cÃƒÆ’Ã‚Â³ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â dÃƒÆ’Ã‚Â¹ng lÃƒÆ’Ã‚Â m context RAG cho chat. */
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
                      AND s.model_name = 'python-ai-service-full'
                      AND s.summary_content NOT LIKE 'AI quota/rate limit has been reached.%'
                      AND s.summary_content NOT LIKE 'Mock mode is active%'
                      AND s.summary_content NOT LIKE 'Demo mode is active%'
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


