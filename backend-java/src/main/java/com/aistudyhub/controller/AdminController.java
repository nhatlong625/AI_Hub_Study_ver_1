package com.aistudyhub.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final NamedParameterJdbcTemplate jdbc;

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        Map<String, Object> users = one("""
            SELECT COUNT(*) AS totalUsers,
                   COALESCE(SUM(CASE WHEN created_at >= DATEADD(day, -30, GETDATE()) THEN 1 ELSE 0 END), 0) AS newUsersThisMonth
            FROM dbo.[USER]
            """, Map.of());
        Map<String, Object> revenue = one("""
            SELECT COALESCE(SUM(CASE WHEN ph.payment_status = 'Success' THEN ph.amount ELSE 0 END), 0) AS totalRevenue,
                   COALESCE(SUM(CASE WHEN ph.payment_status = 'Success' AND UPPER(sp.plan_name) = 'PLUS' THEN ph.amount ELSE 0 END), 0) AS plusRevenue,
                   COALESCE(SUM(CASE WHEN ph.payment_status = 'Success' AND UPPER(sp.plan_name) = 'PRO' THEN ph.amount ELSE 0 END), 0) AS proRevenue
            FROM dbo.PAYMENT_HISTORY ph
            JOIN dbo.USER_SUBSCRIPTION us ON us.subscription_id = ph.subscription_id
            JOIN dbo.SUBSCRIPTION_PLAN sp ON sp.plan_id = us.plan_id
            """, Map.of());
        Map<String, Object> documents = one("""
            SELECT COUNT(*) AS totalDocuments,
                   COALESCE(SUM(CAST(document_size AS DECIMAL(18,2)) / 1048576), 0) AS totalSizeMb,
                   COALESCE(SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END), 0) AS approvedDocuments,
                   COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) AS pendingDocuments
            FROM dbo.DOCUMENT
            """, Map.of());
        Map<String, Object> tests = one("SELECT COUNT(*) AS totalPracticeTests FROM dbo.AI_QUESTION", Map.of());
        Map<String, Object> reviews = one("SELECT COUNT(*) AS pendingReviews FROM dbo.REPORT WHERE status IN ('Pending', 'Edited')", Map.of());

        List<Map<String, Object>> planDistribution = jdbc.queryForList("""
            WITH latest_subscription AS (
              SELECT us.user_id, sp.plan_name,
                     ROW_NUMBER() OVER (PARTITION BY us.user_id ORDER BY us.end_date DESC, us.subscription_id DESC) AS rn
              FROM dbo.USER_SUBSCRIPTION us
              JOIN dbo.SUBSCRIPTION_PLAN sp ON sp.plan_id = us.plan_id
            )
            SELECT COALESCE(ls.plan_name, 'Basic') AS [plan], COUNT(*) AS total
            FROM dbo.[USER] u
            LEFT JOIN latest_subscription ls ON ls.user_id = u.user_id AND ls.rn = 1
            GROUP BY COALESCE(ls.plan_name, 'Basic')
            """, Map.of()).stream().map(row -> {
            long totalUsers = number(users.get("totalUsers")).longValue();
            long total = number(row.get("total")).longValue();
            Map<String, Object> mapped = new LinkedHashMap<>();
            mapped.put("plan", row.get("plan"));
            mapped.put("total", total);
            mapped.put("percent", totalUsers == 0 ? 0 : Math.round((total * 100.0) / totalUsers));
            return mapped;
        }).toList();

        List<Map<String, Object>> recentDocuments = jdbc.queryForList("""
            SELECT TOP 5 d.title, u.full_name AS [user], CONVERT(NVARCHAR(19), d.uploaded_at, 120) AS [time], d.status
            FROM dbo.DOCUMENT d
            JOIN dbo.[USER] u ON u.user_id = d.user_id
            ORDER BY d.document_id DESC
            """, Map.of());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.putAll(users);
        stats.putAll(revenue);
        stats.putAll(documents);
        stats.putAll(tests);
        stats.putAll(reviews);
        return Map.of("stats", stats, "planDistribution", planDistribution, "recentDocuments", recentDocuments);
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users(@RequestParam(required = false, defaultValue = "") String q) {
        MapSqlParameterSource params = new MapSqlParameterSource("search", "%" + q.toLowerCase() + "%");
        String where = q.isBlank() ? "" : "WHERE LOWER(u.full_name) LIKE :search OR LOWER(u.email) LIKE :search OR LOWER(r.role_name) LIKE :search OR LOWER(COALESCE(ls.plan_name, 'Basic')) LIKE :search";
        return jdbc.queryForList("""
            WITH latest_subscription AS (
              SELECT us.user_id, sp.plan_name,
                     ROW_NUMBER() OVER (PARTITION BY us.user_id ORDER BY us.end_date DESC, us.subscription_id DESC) AS rn
              FROM dbo.USER_SUBSCRIPTION us
              JOIN dbo.SUBSCRIPTION_PLAN sp ON sp.plan_id = us.plan_id
            )
            SELECT u.user_id AS id, u.full_name AS name, u.email, r.role_name AS role,
                   COALESCE(ls.plan_name, 'Basic') AS [plan],
                   (SELECT COUNT(*) FROM dbo.USER_SUBJECT usj WHERE usj.user_id = u.user_id) AS folders,
                   (SELECT COUNT(*) FROM dbo.TEST_ATTEMPT ta WHERE ta.user_id = u.user_id) AS tests,
                   CASE WHEN u.avatar_url IS NULL OR u.avatar_url = '' THEN 'initials' ELSE 'logo' END AS type,
                   UPPER(LEFT(REPLACE(u.full_name, ' ', ''), 2)) AS initials,
                   '#DBEAFE' AS color, '#1D4ED8' AS textColor, 'Not set' AS location,
                   COALESCE(CONVERT(NVARCHAR(19), u.last_login, 120), 'Never') AS lastLogin,
                   'No activity yet.' AS latestAction, 'Just now' AS actionTime, u.status
            FROM dbo.[USER] u
            JOIN dbo.ROLE r ON r.role_id = u.role_id
            LEFT JOIN latest_subscription ls ON ls.user_id = u.user_id AND ls.rn = 1
            """ + where + " ORDER BY u.user_id DESC", params);
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> body) {
        String name = required(body, "name");
        String email = required(body, "email").toLowerCase();
        String role = str(body, "role", "User");
        String plan = str(body, "plan", "Basic");
        ensureRole(role);
        ensurePlan(plan);
        Integer id = jdbc.queryForObject("""
            INSERT INTO dbo.[USER] (role_id, full_name, email, password_hash, avatar_url, status, created_at, updated_at)
            OUTPUT INSERTED.user_id
            VALUES ((SELECT role_id FROM dbo.ROLE WHERE role_name = :role), :name, :email, 'admin-created-user', NULL, :status, GETDATE(), NULL)
            """, params("role", role).addValue("name", name).addValue("email", email).addValue("status", str(body, "status", "Active")), Integer.class);
        upsertSubscription(id, plan);
        return ResponseEntity.status(HttpStatus.CREATED).body(userById(id));
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        String role = str(body, "role", "User");
        String plan = str(body, "plan", "Basic");
        ensureRole(role);
        ensurePlan(plan);
        int rows = jdbc.update("""
            UPDATE dbo.[USER]
            SET role_id = (SELECT role_id FROM dbo.ROLE WHERE role_name = :role),
                full_name = :name,
                email = :email,
                status = :status,
                updated_at = GETDATE()
            WHERE user_id = :id
            """, params("id", id).addValue("role", role).addValue("name", required(body, "name")).addValue("email", required(body, "email")).addValue("status", str(body, "status", "Active")));
        if (rows == 0) throw notFound("User not found.");
        upsertSubscription(id, plan);
        return userById(id);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        int rows = jdbc.update("DELETE FROM dbo.[USER] WHERE user_id = :id", Map.of("id", id));
        if (rows == 0) throw notFound("User not found.");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/library/semesters")
    public List<Map<String, Object>> semesters() {
        return jdbc.queryForList("""
            SELECT s.semester_id AS id, s.semester_name AS name,
                   CONVERT(NVARCHAR(19), s.created_at, 120) AS createdAt,
                   CONVERT(NVARCHAR(19), s.updated_at, 120) AS updatedAt,
                   CONCAT(CAST(COALESCE(SUM(CAST(d.document_size AS DECIMAL(18,2))) / 1048576, 0) AS DECIMAL(10,1)), ' MB') AS storage,
                   COUNT(DISTINCT sub.subject_id) AS courses, COUNT(DISTINCT d.document_id) AS docs
            FROM dbo.SEMESTER s
            LEFT JOIN dbo.SUBJECT sub ON sub.semester_id = s.semester_id
            LEFT JOIN dbo.DOCUMENT d ON d.subject_id = sub.subject_id
            GROUP BY s.semester_id, s.semester_name, s.created_at, s.updated_at
            ORDER BY s.semester_id DESC
            """, Map.of());
    }

    @PostMapping("/library/semesters")
    public ResponseEntity<Map<String, Object>> createSemester(@RequestBody Map<String, Object> body) {
        Integer id = jdbc.queryForObject("INSERT INTO dbo.SEMESTER (semester_name, created_at, updated_at) OUTPUT INSERTED.semester_id VALUES (:name, GETDATE(), NULL)", Map.of("name", required(body, "name")), Integer.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(semesterById(id));
    }

    @PutMapping("/library/semesters/{id}")
    public Map<String, Object> updateSemester(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        int rows = jdbc.update("UPDATE dbo.SEMESTER SET semester_name = :name, updated_at = GETDATE() WHERE semester_id = :id", params("id", id).addValue("name", required(body, "name")));
        if (rows == 0) throw notFound("Semester not found.");
        return semesterById(id);
    }

    @DeleteMapping("/library/semesters/{id}")
    public ResponseEntity<Void> deleteSemester(@PathVariable Integer id) {
        int rows = jdbc.update("DELETE FROM dbo.SEMESTER WHERE semester_id = :id", Map.of("id", id));
        if (rows == 0) throw notFound("Semester not found.");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/library/semesters/{id}/courses")
    public List<Map<String, Object>> courses(@PathVariable Integer id) {
        return jdbc.queryForList("""
            SELECT sub.subject_id AS id, sub.subject_name AS name, CONCAT('SUB-', sub.subject_id) AS code,
                   COALESCE(sub.description, '') AS instructor, COUNT(d.document_id) AS docs,
                   COALESCE(CONVERT(NVARCHAR(19), sub.updated_at, 120), CONVERT(NVARCHAR(19), sub.created_at, 120)) AS updated,
                   'Active' AS status, 'book' AS icon, '#d1fae5' AS color, '#059669' AS iconColor
            FROM dbo.SUBJECT sub
            LEFT JOIN dbo.DOCUMENT d ON d.subject_id = sub.subject_id
            WHERE sub.semester_id = :id
            GROUP BY sub.subject_id, sub.subject_name, sub.description, sub.created_at, sub.updated_at
            ORDER BY sub.subject_id DESC
            """, Map.of("id", id));
    }

    @PostMapping("/library/semesters/{id}/courses")
    public ResponseEntity<Map<String, Object>> createCourse(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Integer courseId = jdbc.queryForObject("""
            INSERT INTO dbo.SUBJECT (semester_id, subject_name, description, created_at, updated_at)
            OUTPUT INSERTED.subject_id
            VALUES (:semesterId, :name, :description, GETDATE(), NULL)
            """, params("semesterId", id).addValue("name", required(body, "name")).addValue("description", str(body, "instructor", "")), Integer.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseById(courseId));
    }

    @DeleteMapping("/library/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Integer id) {
        int rows = jdbc.update("DELETE FROM dbo.SUBJECT WHERE subject_id = :id", Map.of("id", id));
        if (rows == 0) throw notFound("Course not found.");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/document-management")
    public List<Map<String, Object>> documents() {
        return jdbc.queryForList(documentSql("ORDER BY d.document_id DESC"), Map.of()).stream().map(this::documentShape).toList();
    }

    @PutMapping("/document-management/{id}/status")
    public Map<String, Object> updateDocumentStatus(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        int rows = jdbc.update("UPDATE dbo.DOCUMENT SET status = :status, updated_at = GETDATE() WHERE document_id = :id", params("id", id).addValue("status", str(body, "status", "Pending")));
        if (rows == 0) throw notFound("Document not found.");
        return documentShape(one(documentSql("WHERE d.document_id = :id"), Map.of("id", id)));
    }

    @Transactional
    @DeleteMapping("/document-management/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Integer id) {
        List<Map<String, Object>> documents = jdbc.queryForList("""
            SELECT d.document_id AS id, d.user_id AS userId, d.title, d.document_name AS documentName
            FROM dbo.DOCUMENT d
            WHERE d.document_id = :id
            """, Map.of("id", id));
        if (documents.isEmpty()) return ResponseEntity.notFound().build();
        Map<String, Object> document = documents.get(0);

        Integer userId = ((Number) document.get("userId")).intValue();
        String title = String.valueOf(document.get("title"));
        Integer announcementId = jdbc.queryForObject("""
            INSERT INTO dbo.ANNOUNCEMENT (user_id, title, content, type, created_at)
            OUTPUT INSERTED.announcement_id
            VALUES (:userId, :title, :content, :type, GETDATE())
            """, params("userId", userId)
                .addValue("title", "Document deleted")
                .addValue("content", "Your document \"" + title + "\" was deleted by an administrator.")
                .addValue("type", "document"), Integer.class);
        jdbc.update("""
            INSERT INTO dbo.USER_ANNOUNCEMENT (user_id, announcement_id, is_read, read_at)
            VALUES (:userId, :announcementId, 0, NULL)
            """, params("userId", userId).addValue("announcementId", announcementId));

        MapSqlParameterSource p = params("id", id);
        jdbc.update("""
            DELETE FROM dbo.USER_ANSWER
            WHERE attempt_id IN (
                SELECT ta.attempt_id FROM dbo.TEST_ATTEMPT ta
                WHERE ta.test_id IN (SELECT qt.quiz_id FROM dbo.QUIZ_TEST qt JOIN dbo.AI_QUESTION aq ON aq.question_id = qt.question_id WHERE aq.document_id = :id)
                   OR ta.question_id IN (SELECT aq.question_id FROM dbo.AI_QUESTION aq WHERE aq.document_id = :id)
            )
            """, p);
        jdbc.update("""
            DELETE FROM dbo.TEST_RESULT
            WHERE attempt_id IN (
                SELECT ta.attempt_id FROM dbo.TEST_ATTEMPT ta
                WHERE ta.test_id IN (SELECT qt.quiz_id FROM dbo.QUIZ_TEST qt JOIN dbo.AI_QUESTION aq ON aq.question_id = qt.question_id WHERE aq.document_id = :id)
                   OR ta.question_id IN (SELECT aq.question_id FROM dbo.AI_QUESTION aq WHERE aq.document_id = :id)
            )
            """, p);
        jdbc.update("""
            DELETE FROM dbo.TEST_ATTEMPT
            WHERE test_id IN (SELECT qt.quiz_id FROM dbo.QUIZ_TEST qt JOIN dbo.AI_QUESTION aq ON aq.question_id = qt.question_id WHERE aq.document_id = :id)
               OR question_id IN (SELECT aq.question_id FROM dbo.AI_QUESTION aq WHERE aq.document_id = :id)
            """, p);
        jdbc.update("""
            DELETE FROM dbo.ANSWER_OPTION
            WHERE question_id IN (SELECT qt.quiz_id FROM dbo.QUIZ_TEST qt JOIN dbo.AI_QUESTION aq ON aq.question_id = qt.question_id WHERE aq.document_id = :id)
            """, p);
        jdbc.update("DELETE FROM dbo.QUIZ_TEST WHERE question_id IN (SELECT question_id FROM dbo.AI_QUESTION WHERE document_id = :id)", p);
        jdbc.update("""
            DELETE FROM dbo.STUDY_ACTIVITY
            WHERE document_id = :id
               OR summary_id IN (SELECT summary_id FROM dbo.AI_SUMMARY WHERE document_id = :id)
               OR session_id IN (SELECT session_id FROM dbo.CHAT_SESSION WHERE document_id = :id)
               OR question_id IN (SELECT question_id FROM dbo.AI_QUESTION WHERE document_id = :id)
            """, p);
        jdbc.update("DELETE FROM dbo.REPORT WHERE document_id = :id", p);
        jdbc.update("DELETE FROM dbo.COMMENT WHERE document_id = :id", p);
        jdbc.update("DELETE FROM dbo.CHAT_MESSAGE WHERE session_id IN (SELECT session_id FROM dbo.CHAT_SESSION WHERE document_id = :id)", p);
        jdbc.update("DELETE FROM dbo.CHAT_SESSION WHERE document_id = :id", p);
        jdbc.update("DELETE FROM dbo.AI_SUGGESTION WHERE document_id = :id", p);
        jdbc.update("DELETE FROM dbo.AI_SUMMARY WHERE document_id = :id", p);
        jdbc.update("DELETE FROM dbo.AI_QUESTION WHERE document_id = :id", p);
        jdbc.update("DELETE FROM dbo.DOCUMENT_SHARE WHERE document_id = :id", p);
        int rows = jdbc.update("DELETE FROM dbo.DOCUMENT WHERE document_id = :id", p);
        if (rows == 0) throw notFound("Document not found.");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/payments")
    public Map<String, Object> payments() {
        List<Map<String, Object>> members = jdbc.queryForList("""
            SELECT us.subscription_id AS id, u.full_name AS name, u.email, COALESCE(u.avatar_url, '') AS avatar,
                   UPPER(LEFT(REPLACE(u.full_name, ' ', ''), 2)) AS initials,
                   '#dbeafe' AS avatarBg, '#1d4ed8' AS avatarColor, UPPER(sp.plan_name) AS [plan], us.status,
                   CASE WHEN sp.duration_month >= 12 THEN 'Yearly' ELSE 'Monthly' END AS billing,
                   COALESCE(CONVERT(NVARCHAR(19), ph.payment_date, 120), CONVERT(NVARCHAR(10), us.start_date, 120)) AS paymentDate,
                   COALESCE(ph.amount, sp.price) AS amount
            FROM dbo.USER_SUBSCRIPTION us
            JOIN dbo.[USER] u ON u.user_id = us.user_id
            JOIN dbo.SUBSCRIPTION_PLAN sp ON sp.plan_id = us.plan_id
            OUTER APPLY (SELECT TOP 1 amount, payment_date FROM dbo.PAYMENT_HISTORY ph WHERE ph.subscription_id = us.subscription_id ORDER BY ph.payment_date DESC, ph.payment_id DESC) ph
            ORDER BY us.subscription_id DESC
            """, Map.of());
        List<Map<String, Object>> plans = jdbc.queryForList("""
            SELECT UPPER(plan_name) AS [plan], price,
                   CASE WHEN duration_month >= 12 THEN 'Yearly' ELSE 'Monthly' END AS billing,
                   COALESCE(description, '') AS description
            FROM dbo.SUBSCRIPTION_PLAN
            ORDER BY CASE UPPER(plan_name) WHEN 'PLUS' THEN 1 WHEN 'PRO' THEN 2 ELSE 3 END
            """, Map.of());
        BigDecimal totalRevenue = members.stream().filter(m -> "Active".equals(m.get("status"))).map(m -> number(m.get("amount"))).reduce(BigDecimal.ZERO, BigDecimal::add);
        long active = members.stream().filter(m -> "Active".equals(m.get("status"))).count();
        long pending = members.stream().filter(m -> "Expired".equals(m.get("status"))).count();
        return Map.of("members", members, "plans", plans, "stats", Map.of("totalRevenue", totalRevenue, "activeSubscriptions", active, "pendingInvoices", pending));
    }

    @PutMapping("/payments/plans/{plan}")
    public Map<String, Object> updatePlan(@PathVariable String plan, @RequestBody Map<String, Object> body) {
        int rows = jdbc.update("""
            UPDATE dbo.SUBSCRIPTION_PLAN
            SET price = :price,
                duration_month = CASE WHEN :billing = 'Yearly' THEN 12 ELSE 1 END,
                description = COALESCE(NULLIF(:description, ''), description)
            WHERE UPPER(plan_name) = UPPER(:plan)
            """, params("plan", plan).addValue("price", number(body.get("price"))).addValue("billing", str(body, "billing", "Monthly")).addValue("description", str(body, "description", "")));
        if (rows == 0) throw notFound("Payment plan not found.");
        return one("""
            SELECT UPPER(plan_name) AS [plan], price,
                   CASE WHEN duration_month >= 12 THEN 'Yearly' ELSE 'Monthly' END AS billing,
                   COALESCE(description, '') AS description
            FROM dbo.SUBSCRIPTION_PLAN WHERE UPPER(plan_name) = UPPER(:plan)
            """, Map.of("plan", plan));
    }

    @GetMapping("/practice-tests")
    public List<Map<String, Object>> practiceTests() {
        return jdbc.queryForList("""
            SELECT aq.question_id AS id, aq.title AS name, COUNT(DISTINCT aq.document_id) AS docs,
                   aq.total_question AS questions, sub.subject_name AS subject,
                   UPPER(LEFT(REPLACE(u.full_name, ' ', ''), 2)) AS creator_initials,
                   u.full_name AS creator_name, '#DBEAFE' AS creator_color, '#1D4ED8' AS creator_text,
                   COUNT(DISTINCT ta.attempt_id) AS attempts, CAST(COALESCE(AVG(ta.score), 0) AS INT) AS avg,
                   'Published' AS status, 'AI Generated' AS created_type
            FROM dbo.AI_QUESTION aq
            JOIN dbo.DOCUMENT d ON d.document_id = aq.document_id
            JOIN dbo.SUBJECT sub ON sub.subject_id = d.subject_id
            JOIN dbo.[USER] u ON u.user_id = d.user_id
            LEFT JOIN dbo.TEST_ATTEMPT ta ON ta.question_id = aq.question_id
            GROUP BY aq.question_id, aq.title, aq.total_question, sub.subject_name, u.full_name
            ORDER BY aq.question_id DESC
            """, Map.of()).stream().map(this::practiceTestShape).toList();
    }

    @GetMapping("/practice-tests/{id}/questions")
    public List<Map<String, Object>> practiceQuestions(@PathVariable Integer id) {
        return jdbc.queryForList("""
            SELECT quiz_id AS id, question_content AS question, question_type AS type,
                   difficulty_level AS difficulty,
                   CASE WHEN correct_answer IS NULL OR correct_answer = '' THEN 0 ELSE 100 END AS aiScore
            FROM dbo.QUIZ_TEST
            WHERE question_id = :id
            ORDER BY quiz_id
            """, Map.of("id", id));
    }

    @DeleteMapping("/practice-tests/{id}")
    public ResponseEntity<Void> deletePracticeTest(@PathVariable Integer id) {
        jdbc.update("DELETE FROM dbo.QUIZ_TEST WHERE question_id = :id", Map.of("id", id));
        int rows = jdbc.update("DELETE FROM dbo.AI_QUESTION WHERE question_id = :id", Map.of("id", id));
        if (rows == 0) throw notFound("Practice test not found.");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/practice-review-queue")
    public List<Map<String, Object>> reviewQueue() {
        return jdbc.queryForList(reviewSql("WHERE r.status IN ('Pending', 'Edited') ORDER BY r.report_id DESC"), Map.of()).stream().map(this::reviewShape).toList();
    }

    @PutMapping("/practice-review-queue/{queueId}")
    public Map<String, Object> updateReview(@PathVariable String queueId, @RequestBody Map<String, Object> body) {
        int id = queueIdNumber(queueId);
        int rows = jdbc.update("UPDATE dbo.REPORT SET reason = COALESCE(NULLIF(:question, ''), reason), description = COALESCE(NULLIF(:flagNote, ''), description), status = 'Edited' WHERE report_id = :id",
                params("id", id).addValue("question", str(body, "question", "")).addValue("flagNote", str(body, "flagNote", str(body, "question", ""))));
        if (rows == 0) throw notFound("Review queue item not found.");
        return reviewShape(one(reviewSql("WHERE r.report_id = :id"), Map.of("id", id)));
    }

    @PutMapping("/practice-review-queue/{queueId}/resolve")
    public ResponseEntity<Void> resolveReview(@PathVariable String queueId, @RequestBody Map<String, Object> body) {
        int rows = jdbc.update("UPDATE dbo.REPORT SET status = :status WHERE report_id = :id", params("id", queueIdNumber(queueId)).addValue("status", str(body, "status", "Approved")));
        if (rows == 0) throw notFound("Review queue item not found.");
        return ResponseEntity.noContent().build();
    }

    private String documentSql(String suffix) {
        return """
            SELECT d.document_id AS id, d.title, d.document_type AS type,
                   CONCAT(CAST(CAST(d.document_size AS DECIMAL(18,2)) / 1048576 AS DECIMAL(10,1)), ' MB') AS size,
                   CAST(d.document_size AS DECIMAL(18,2)) / 1048576 AS sizeMb,
                   sub.subject_name AS course, sem.semester_name AS semester,
                   u.full_name AS uploader_name,
                   UPPER(LEFT(REPLACE(u.full_name, ' ', ''), 2)) AS uploader_initials,
                   '#DBEAFE' AS uploader_color, '#1D4ED8' AS uploader_text,
                   CONVERT(NVARCHAR(19), d.uploaded_at, 120) AS uploadedAt,
                   d.status, d.document_name AS description, '' AS rejectReason
            FROM dbo.DOCUMENT d
            JOIN dbo.SUBJECT sub ON sub.subject_id = d.subject_id
            JOIN dbo.SEMESTER sem ON sem.semester_id = sub.semester_id
            JOIN dbo.[USER] u ON u.user_id = d.user_id
            """ + suffix;
    }

    private String reviewSql(String suffix) {
        return """
            SELECT CONCAT('R-', r.report_id) AS id, UPPER(CONCAT(sub.subject_name, ' - ', d.title)) AS course,
                   CONVERT(NVARCHAR(19), r.created_at, 120) AS time, r.reason AS flag, NULL AS flagScore,
                   COALESCE(r.description, d.title) AS question, '' AS aiAnswer, '' AS currentAnswer,
                   COALESCE(r.description, '') AS flagNote, u.email AS userReportStudent,
                   COALESCE(r.description, '') AS userReportText, 'reported' AS type, r.status
            FROM dbo.REPORT r
            JOIN dbo.DOCUMENT d ON d.document_id = r.document_id
            JOIN dbo.SUBJECT sub ON sub.subject_id = d.subject_id
            JOIN dbo.[USER] u ON u.user_id = r.user_id
            """ + suffix;
    }

    private Map<String, Object> userById(Integer id) {
        List<Map<String, Object>> rows = jdbc.queryForList("""
            WITH latest_subscription AS (
              SELECT us.user_id, sp.plan_name,
                     ROW_NUMBER() OVER (PARTITION BY us.user_id ORDER BY us.end_date DESC, us.subscription_id DESC) AS rn
              FROM dbo.USER_SUBSCRIPTION us JOIN dbo.SUBSCRIPTION_PLAN sp ON sp.plan_id = us.plan_id
            )
            SELECT u.user_id AS id, u.full_name AS name, u.email, r.role_name AS role, COALESCE(ls.plan_name, 'Basic') AS [plan],
                   0 AS folders, 0 AS tests, CASE WHEN u.avatar_url IS NULL OR u.avatar_url = '' THEN 'initials' ELSE 'logo' END AS type,
                   UPPER(LEFT(REPLACE(u.full_name, ' ', ''), 2)) AS initials, '#DBEAFE' AS color, '#1D4ED8' AS textColor,
                   'Not set' AS location, COALESCE(CONVERT(NVARCHAR(19), u.last_login, 120), 'Never') AS lastLogin,
                   'No activity yet.' AS latestAction, 'Just now' AS actionTime, u.status
            FROM dbo.[USER] u JOIN dbo.ROLE r ON r.role_id = u.role_id
            LEFT JOIN latest_subscription ls ON ls.user_id = u.user_id AND ls.rn = 1
            WHERE u.user_id = :id
            """, Map.of("id", id));
        if (rows.isEmpty()) throw notFound("User not found.");
        return rows.get(0);
    }

    private Map<String, Object> semesterById(Integer id) {
        return one("""
            SELECT s.semester_id AS id, s.semester_name AS name,
                   CONVERT(NVARCHAR(19), s.created_at, 120) AS createdAt,
                   CONVERT(NVARCHAR(19), s.updated_at, 120) AS updatedAt,
                   CONCAT(CAST(COALESCE(SUM(CAST(d.document_size AS DECIMAL(18,2))) / 1048576, 0) AS DECIMAL(10,1)), ' MB') AS storage,
                   COUNT(DISTINCT sub.subject_id) AS courses, COUNT(DISTINCT d.document_id) AS docs
            FROM dbo.SEMESTER s
            LEFT JOIN dbo.SUBJECT sub ON sub.semester_id = s.semester_id
            LEFT JOIN dbo.DOCUMENT d ON d.subject_id = sub.subject_id
            WHERE s.semester_id = :id
            GROUP BY s.semester_id, s.semester_name, s.created_at, s.updated_at
            """, Map.of("id", id));
    }

    private Map<String, Object> courseById(Integer id) {
        return one("""
            SELECT subject_id AS id, subject_name AS name, CONCAT('SUB-', subject_id) AS code,
                   COALESCE(description, '') AS instructor, 0 AS docs, 'Just now' AS updated,
                   'Active' AS status, 'book' AS icon, '#d1fae5' AS color, '#059669' AS iconColor
            FROM dbo.SUBJECT WHERE subject_id = :id
            """, Map.of("id", id));
    }

    private Map<String, Object> one(String sql, Map<String, ?> params) {
        List<Map<String, Object>> rows = jdbc.queryForList(sql, params);
        if (rows.isEmpty()) throw notFound("Resource not found.");
        return rows.get(0);
    }

    private MapSqlParameterSource params(String key, Object value) {
        return new MapSqlParameterSource(key, value);
    }

    private String required(Map<String, Object> body, String key) {
        String value = str(body, key, "").trim();
        if (value.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required.");
        return value;
    }

    private String str(Map<String, Object> body, String key, String fallback) {
        Object value = body.get(key);
        return value == null ? fallback : String.valueOf(value);
    }

    private BigDecimal number(Object value) {
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        if (value == null) return BigDecimal.ZERO;
        try { return new BigDecimal(String.valueOf(value)); } catch (NumberFormatException ex) { return BigDecimal.ZERO; }
    }

    private void ensureRole(String role) {
        jdbc.update("""
            IF NOT EXISTS (SELECT 1 FROM dbo.ROLE WHERE role_name = :role)
            INSERT INTO dbo.ROLE (role_name, description, created_at) VALUES (:role, :role, GETDATE())
            """, Map.of("role", role));
    }

    private void ensurePlan(String plan) {
        jdbc.update("""
            IF NOT EXISTS (SELECT 1 FROM dbo.SUBSCRIPTION_PLAN WHERE UPPER(plan_name) = UPPER(:plan))
            INSERT INTO dbo.SUBSCRIPTION_PLAN (plan_name, price, duration_month, max_storage, description)
            VALUES (:plan, 0, 1, 0, NULL)
            """, Map.of("plan", plan));
    }

    private void upsertSubscription(Integer userId, String plan) {
        Map<String, Object> row = one("SELECT TOP 1 plan_id AS planId, duration_month AS months FROM dbo.SUBSCRIPTION_PLAN WHERE UPPER(plan_name) = UPPER(:plan)", Map.of("plan", plan));
        List<Map<String, Object>> existing = jdbc.queryForList("SELECT TOP 1 subscription_id AS id FROM dbo.USER_SUBSCRIPTION WHERE user_id = :userId ORDER BY end_date DESC, subscription_id DESC", Map.of("userId", userId));
        MapSqlParameterSource p = params("userId", userId).addValue("planId", row.get("planId")).addValue("endDate", LocalDate.now().plusMonths(number(row.get("months")).longValue()));
        if (existing.isEmpty()) {
            jdbc.update("INSERT INTO dbo.USER_SUBSCRIPTION (user_id, plan_id, start_date, end_date, status) VALUES (:userId, :planId, CAST(GETDATE() AS DATE), :endDate, 'Active')", p);
        } else {
            jdbc.update("UPDATE dbo.USER_SUBSCRIPTION SET plan_id = :planId, end_date = :endDate, status = 'Active' WHERE subscription_id = :id", p.addValue("id", existing.get(0).get("id")));
        }
    }

    private Map<String, Object> documentShape(Map<String, Object> row) {
        Map<String, Object> shaped = new LinkedHashMap<>(row);
        Map<String, Object> uploader = new LinkedHashMap<>();
        uploader.put("name", row.get("uploader_name"));
        uploader.put("initials", row.get("uploader_initials"));
        uploader.put("color", row.get("uploader_color"));
        uploader.put("text", row.get("uploader_text"));
        shaped.put("uploader", uploader);
        return shaped;
    }

    private Map<String, Object> practiceTestShape(Map<String, Object> row) {
        Map<String, Object> shaped = new LinkedHashMap<>(row);
        Map<String, Object> creator = new LinkedHashMap<>();
        creator.put("initials", row.get("creator_initials"));
        creator.put("name", row.get("creator_name"));
        creator.put("color", row.get("creator_color"));
        creator.put("text", row.get("creator_text"));
        shaped.put("creator", creator);
        shaped.put("createdType", row.get("created_type"));
        return shaped;
    }

    private Map<String, Object> reviewShape(Map<String, Object> row) {
        Map<String, Object> shaped = new LinkedHashMap<>(row);
        Map<String, Object> userReport = new LinkedHashMap<>();
        userReport.put("student", row.get("userReportStudent"));
        userReport.put("text", row.get("userReportText"));
        shaped.put("userReport", userReport);
        return shaped;
    }
    private int queueIdNumber(String queueId) {
        return Integer.parseInt(queueId.replaceFirst("(?i)^R-", ""));
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
