package com.aistudyhub.service;

import com.aistudyhub.dto.python.PythonDocumentSummarizeRequest;
import com.aistudyhub.dto.request.DocumentSummarizeRequest;
import com.aistudyhub.dto.response.DocumentResponse;
import com.aistudyhub.dto.response.DocumentSummarizeResponse;
import com.aistudyhub.entity.Document;
import com.aistudyhub.exception.BadRequestException;
import com.aistudyhub.exception.ConflictException;
import com.aistudyhub.exception.ResourceNotFoundException;
import com.aistudyhub.exception.TooManyRequestsException;
import com.aistudyhub.dto.response.AdminDocumentResponse;
import com.aistudyhub.dto.response.DocumentShareResponse;
import com.aistudyhub.entity.DocumentShare;
import com.aistudyhub.repository.AiSummaryRepository;
import com.aistudyhub.repository.DocumentShareRepository;
import com.aistudyhub.repository.DocumentRepository;
import com.aistudyhub.repository.SemesterRepository;
import com.aistudyhub.repository.SubjectRepository;
import com.aistudyhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    /** Các đuôi file mà DocumentService biết trích xuất ra text thuần để gửi cho AI summarize. */
    private static final Set<String> SUMMARIZABLE_TYPES = Set.of("txt", "md", "csv", "pdf", "docx", "pptx");
    private static final Pattern UNSAFE_OBJECT_NAME_CHARS = Pattern.compile("[^a-zA-Z0-9._-]");

    private final DocumentRepository documentRepository;
    private final AiSummaryRepository aiSummaryRepository;
    private final UserSubjectService userSubjectService;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;
    private final DocumentShareRepository documentShareRepository;
    private final WebClient supabaseWebClient;
    private final WebClient pythonAiWebClient;

    public record DocumentFile(String fileName, MediaType mediaType, byte[] bytes) {}

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    @Value("${supabase.url}")
    private String supabaseUrl;

    // ── Upload file lên Supabase + lưu DB ─────────────────────
    @Transactional
    public DocumentResponse upload(MultipartFile file, String title,
                                   Integer subjectId, Integer userId,
                                   String visibilityStatus) throws Exception {
        String originalName = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String safeName = UNSAFE_OBJECT_NAME_CHARS.matcher(originalName).replaceAll("_");
        String objectKey = "students/" + userId + "/subjects/" + subjectId + "/" + UUID.randomUUID() + "_" + safeName;

        try {
            supabaseWebClient.post()
                    .uri("/storage/v1/object/" + bucket + "/" + objectKey)
                    .header("apikey", supabaseKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                    .header("x-upsert", "true")
                    .contentType(MediaType.parseMediaType(
                            file.getContentType() != null ? file.getContentType() : "application/octet-stream"))
                    .bodyValue(file.getBytes())
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (WebClientResponseException e) {
            throw new BadRequestException("Supabase upload failed: HTTP " + e.getStatusCode().value() + " - " + e.getResponseBodyAsString());
        }

        String publicUrl = "/storage/v1/object/public/" + bucket + "/" + objectKey;

        Document doc = new Document();
        doc.setUserId(userId);
        doc.setSubjectId(subjectId);
        doc.setTitle(title != null ? title : originalName);
        doc.setDocumentName(originalName);
        doc.setDocumentType(getExtension(file.getOriginalFilename()));
        doc.setDocumentSize(file.getSize());
        doc.setDocumentUrl(publicUrl);
        doc.setVisibilityStatus(visibilityStatus != null ? visibilityStatus : "PRIVATE");
        doc.setStatus("Active");
        doc.setUploadedAt(LocalDateTime.now());
        doc.setCreatedAt(LocalDateTime.now());

        DocumentResponse response = toDto(documentRepository.save(doc));
        // Đảm bảo subject này có mặt trong Library của user dù upload trực tiếp,
        // không qua modal "Create course" (vd test qua Postman).
        userSubjectService.ensureAdded(userId, subjectId);
        return response;
    }

    // ── CRUD thông thường ──────────────────────────────────────
    public List<DocumentResponse> getBySubject(Integer subjectId) {
        return documentRepository.findBySubjectId(subjectId).stream().map(this::toDto).collect(Collectors.toList());
    }

    /** Chỉ trả về document PUBLIC của 1 subject — dùng cho Home page */
    public List<DocumentResponse> getPublicBySubject(Integer subjectId) {
        return documentRepository.findBySubjectIdAndVisibilityStatus(subjectId, "PUBLIC")
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<DocumentResponse> getByUser(Integer userId) {
        return documentRepository.findByUserId(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public DocumentResponse getById(Integer id) {
        return documentRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
    }

    public DocumentFile getFile(Integer id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        return new DocumentFile(doc.getDocumentName(), mediaTypeFor(doc.getDocumentType()), downloadFileBytes(doc));
    }

    public String getAiReadableText(Integer id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        return resolveSummarizableText(doc);
    }

    public List<DocumentResponse> getAll() {
        return documentRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    /**
     * Cập nhật visibility với business logic:
     *  - PRIVATE  → PENDING_REVIEW : cho phép, NHƯNG bị chặn 429 nếu còn trong
     *                                 cooldown 1h kể từ lần đổi visibility gần nhất
     *                                 (updated_at). Áp dụng CHUNG cho mọi nguyên nhân
     *                                 khiến doc đang ở PRIVATE (tự-hủy, admin reject,
     *                                 hay vừa toggle PUBLIC→PRIVATE) — không phân biệt
     *                                 nguồn, chỉ chặn spam đổi trạng thái nói chung.
     *  - PENDING_REVIEW → PRIVATE  : cho phép (user tự hủy request trước khi admin duyệt)
     *  - PENDING_REVIEW → khác PRIVATE : 409 Conflict (đang chờ duyệt, không tự set PUBLIC được)
     *  - PUBLIC   → PRIVATE          : cho phép tức thì (cooldown chỉ áp dụng ở bước
     *                                 PRIVATE → PENDING_REVIEW kế tiếp, không áp dụng ở đây)
     */
    @Transactional
    public DocumentResponse updateVisibility(Integer id, String newStatus) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        String current = doc.getVisibilityStatus();

        if ("PENDING_REVIEW".equals(current) && !"PRIVATE".equals(newStatus)) {
            // Không cho tự chuyển PENDING → PUBLIC hoặc request lại khi đang PENDING
            throw new ConflictException("This document is pending admin review. Please wait for the result.");
        }

        // Cooldown 1h: chặn spam toggle PRIVATE → PENDING_REVIEW, không phân biệt
        // lý do doc đang PRIVATE (tự-hủy / admin reject / vừa PUBLIC→PRIVATE).
        if ("PRIVATE".equals(current) && "PENDING_REVIEW".equals(newStatus) && doc.getUpdatedAt() != null) {
            LocalDateTime cooldownEnd = doc.getUpdatedAt().plusHours(1);
            if (LocalDateTime.now().isBefore(cooldownEnd)) {
                throw new TooManyRequestsException("You need to wait 1 more hour before requesting to publish again.");
            }
        }

        doc.setVisibilityStatus(newStatus);
        doc.setUpdatedAt(LocalDateTime.now());
        return toDto(documentRepository.save(doc));
    }

    /**
     * Đổi tên hiển thị (title) — KHÔNG đụng updated_at. Cố tình không set
     * updated_at = now() ở đây vì field này đang được dùng làm mốc tính
     * cooldown 1h của visibility (xem updateVisibility()) — nếu set ở đây,
     * đổi tên file sẽ vô tình reset/kéo dài cooldown của 1 hành động hoàn
     * toàn không liên quan.
     */
    @Transactional
    public DocumentResponse updateTitle(Integer id, String title) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Title must not be empty.");
        }
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        doc.setTitle(title.trim());
        return toDto(documentRepository.save(doc));
    }

    // ── Admin duyệt document (B2) ──────────────────────────────
    /** Danh sách document đang chờ duyệt — cho trang Admin Document Management. */
    public List<AdminDocumentResponse> getPendingForAdmin() {
        return documentRepository.findByVisibilityStatus("PENDING_REVIEW")
                .stream().map(this::toAdminDto).collect(Collectors.toList());
    }

    /** Admin duyệt — set PUBLIC. Chỉ áp dụng khi doc đang PENDING_REVIEW. */
    @Transactional
    public AdminDocumentResponse approveDocument(Integer id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        if (!"PENDING_REVIEW".equals(doc.getVisibilityStatus())) {
            throw new ConflictException("This document is not pending review.");
        }
        doc.setVisibilityStatus("PUBLIC");
        doc.setUpdatedAt(LocalDateTime.now());
        return toAdminDto(documentRepository.save(doc));
    }

    /**
     * Admin từ chối — set về PRIVATE + updated_at = now(). Dùng CHUNG cơ chế
     * cooldown 1h với updateVisibility() (không có cooldown riêng cho admin
     * reject nữa — đã thống nhất chỉ 1 cooldown 1h áp dụng cho mọi nguyên
     * nhân khiến doc về PRIVATE). Chỉ áp dụng khi doc đang PENDING_REVIEW.
     *
     * Ghi chú: tham số `reason` hiện chưa được lưu vào DB — bảng DOCUMENT
     * không có cột reject_reason (CLAUDE.md: không thêm cột mới nếu không
     * cần thiết) và hệ thống chưa có cơ chế thông báo cho user (NOTIFICATION
     * vẫn đang mock). Giữ tham số lại để khi làm notification thật sau này
     * không cần đổi lại chữ ký API.
     */
    @Transactional
    public AdminDocumentResponse rejectDocument(Integer id, String reason) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        if (!"PENDING_REVIEW".equals(doc.getVisibilityStatus())) {
            throw new ConflictException("This document is not pending review.");
        }
        doc.setVisibilityStatus("PRIVATE");
        doc.setUpdatedAt(LocalDateTime.now());
        return toAdminDto(documentRepository.save(doc));
    }

    private AdminDocumentResponse toAdminDto(Document d) {
        AdminDocumentResponse r = new AdminDocumentResponse();
        r.setDocumentId(d.getDocumentId());
        r.setTitle(d.getTitle());
        r.setDocumentName(d.getDocumentName());
        r.setDocumentType(d.getDocumentType() == null ? "" : d.getDocumentType().toUpperCase());
        r.setDocumentSizeBytes(d.getDocumentSize());
        r.setDocumentSizeLabel(formatSize(d.getDocumentSize()));
        r.setDocumentUrl(toDownloadUrl(d.getDocumentUrl()));
        r.setVisibilityStatus(d.getVisibilityStatus());
        r.setUploadedAt(d.getUploadedAt());
        r.setUpdatedAt(d.getUpdatedAt());

        r.setUserId(d.getUserId());
        userRepository.findById(d.getUserId()).ifPresent(u -> {
            r.setUploaderName(u.getFullName());
            r.setUploaderEmail(u.getEmail());
        });

        r.setSubjectId(d.getSubjectId());
        subjectRepository.findById(d.getSubjectId()).ifPresent(s -> {
            r.setSubjectName(s.getSubjectName());
            r.setSemesterId(s.getSemesterId());
            semesterRepository.findById(s.getSemesterId())
                    .ifPresent(sem -> r.setSemesterName(sem.getSemesterName()));
        });

        return r;
    }

    private String formatSize(Long bytes) {
        if (bytes == null) return "0 B";
        double kb = bytes / 1024.0;
        if (kb < 1024) return String.format("%.1f KB", kb);
        double mb = kb / 1024.0;
        if (mb < 1024) return String.format("%.1f MB", mb);
        return String.format("%.1f GB", mb / 1024.0);
    }

    // ── Share Document ────────────────────────────────────────

    /**
     * Tạo link share kiểu LINK (ai có link xem được, không cần đăng nhập).
     * Idempotent: nếu đã có link ACTIVE cho doc này thì trả lại link cũ,
     * không tạo mới — tránh nhiều link song song cho cùng 1 document.
     */
    @Transactional
    public DocumentShareResponse createOrGetShareLink(Integer documentId, Integer userId) {
        documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        // Trả lại link cũ nếu đã ACTIVE
        return documentShareRepository
                .findFirstByDocumentIdAndShareTypeAndStatus(documentId, "LINK", "ACTIVE")
                .map(this::toShareDto)
                .orElseGet(() -> {
                    DocumentShare share = new DocumentShare();
                    share.setDocumentId(documentId);
                    share.setUserId(userId);
                    share.setShareType("LINK");
                    share.setStatus("ACTIVE");
                    return toShareDto(documentShareRepository.save(share));
                });
    }

    /**
     * Hủy link share ACTIVE của document — set status = REVOKED.
     * Sau khi revoke, link cũ không dùng được nữa. Bấm Share lại sẽ sinh link mới.
     */
    @Transactional
    public void revokeShareLink(Integer documentId, Integer userId) {
        // Revoke tất cả link ACTIVE — tránh trường hợp có >1 record ACTIVE do data cũ
        documentShareRepository
                .findAllByDocumentIdAndShareTypeAndStatus(documentId, "LINK", "ACTIVE")
                .forEach(share -> {
                    share.setStatus("REVOKED");
                    documentShareRepository.save(share);
                });
    }

    /**
     * Resolve shareId → DocumentResponse — dùng cho endpoint public GET /share/{shareId}.
     * Chỉ trả về nếu link còn ACTIVE, trả 404 nếu không tồn tại hoặc đã REVOKED.
     */
    public DocumentResponse getDocumentByShareId(Integer shareId) {
        DocumentShare share = documentShareRepository
                .findByShareIdAndStatus(shareId, "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Share link not found or has been revoked."));
        return getById(share.getDocumentId());
    }

    private DocumentShareResponse toShareDto(DocumentShare share) {
        DocumentShareResponse r = new DocumentShareResponse();
        r.setShareId(share.getShareId());
        r.setDocumentId(share.getDocumentId());
        r.setShareType(share.getShareType());
        r.setStatus(share.getStatus());
        r.setShareUrl(frontendUrl + "/share/" + share.getShareId());
        return r;
    }

    @Transactional
    public void delete(Integer id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        deleteSupabaseFile(doc);
        documentRepository.deleteById(id);
    }

    /**
     * Xóa toàn bộ document của 1 user trong 1 subject — dùng khi user xóa
     * cả "course" khỏi Library (action menu ở StudentLibraryPage).
     * Xóa cả file trên Supabase, không chỉ DB record.
     */
    @Transactional
    public void deleteAllByUserAndSubject(Integer userId, Integer subjectId) {
        List<Document> docs = documentRepository.findByUserIdAndSubjectId(userId, subjectId);
        for (Document doc : docs) {
            deleteSupabaseFile(doc);
        }
        documentRepository.deleteAll(docs);
    }

    private void deleteSupabaseFile(Document doc) {
        String objectKey = extractObjectKey(doc.getDocumentUrl());
        if (objectKey == null || objectKey.isBlank()) return;
        try {
            supabaseWebClient.delete()
                    .uri("/storage/v1/object/" + bucket + "/" + objectKey)
                    .header("apikey", supabaseKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                    .retrieve().toBodilessEntity().block();
        } catch (Exception ignored) {}
    }
    // ── AI Summary (proxy sang Python AI service, lưu vào AI_SUMMARY) ──
    @Transactional
    public DocumentSummarizeResponse summarize(DocumentSummarizeRequest request) {
        Document doc = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + request.getDocumentId()));

        Integer userId = request.getUserId();
        if (userId != null) {
            var existingSummary = aiSummaryRepository.findLatestFullFileSummary(doc.getDocumentId(), userId);
            if (existingSummary.isPresent()) {
                return new DocumentSummarizeResponse(
                        doc.getDocumentId(), doc.getDocumentName(), existingSummary.get(), null, false, true);
            }
        }

        String text = resolveSummarizableText(doc);
        Integer maxChunks = request.getMaxChunks();

        Map<String, Object> result;
        try {
            result = pythonAiWebClient.post()
                    .uri("/api/documents/summarize")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(new PythonDocumentSummarizeRequest(
                            doc.getDocumentId(), doc.getDocumentName(), text, null, maxChunks))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (Exception e) {
            throw new BadRequestException("AI summarize service unavailable: " + e.getMessage());
        }

        if (result == null || result.get("summary") == null) {
            throw new BadRequestException("AI service returned no summary for this document.");
        }

        String summary = String.valueOf(result.get("summary"));
        Integer chunkCount = result.get("chunk_count") instanceof Number n ? n.intValue() : null;
        boolean usedMockAi = Boolean.TRUE.equals(result.get("used_mock_ai"));

        aiSummaryRepository.save(doc.getDocumentId(), userId, summary,
                usedMockAi ? "mock-ai-full" : "python-ai-service-full");

        return new DocumentSummarizeResponse(doc.getDocumentId(), doc.getDocumentName(), summary, chunkCount, usedMockAi, true);
    }

    /**
     * Java tải file từ Supabase rồi tự trích xuất text (PDF/DOCX/PPTX dùng PDFBox/POI,
     * txt/md/csv đọc thẳng UTF-8) — vì Python's DocumentLoader chỉ đọc local path .txt/.md/.csv,
     * không tự tải URL hay parse file nhị phân.
     */
    private String resolveSummarizableText(Document doc) {
        String type = doc.getDocumentType() == null ? "" : doc.getDocumentType().toLowerCase();
        if (!SUMMARIZABLE_TYPES.contains(type)) {
            throw new BadRequestException(
                    "AI summary chưa hỗ trợ định dạng \"" + type + "\" (file \"" + doc.getDocumentName()
                            + "\"). Hiện chỉ hỗ trợ: " + SUMMARIZABLE_TYPES);
        }

        byte[] bytes = downloadFileBytes(doc);

        try {
            return switch (type) {
                case "pdf" -> extractPdfText(bytes);
                case "docx" -> extractDocxText(bytes);
                case "pptx" -> extractPptxText(bytes);
                default -> new String(bytes, StandardCharsets.UTF_8); // txt / md / csv
            };
        } catch (IOException e) {
            throw new BadRequestException("Could not extract text from \"" + doc.getDocumentName() + "\": " + e.getMessage());
        }
    }

    private byte[] downloadFileBytes(Document doc) {
        String objectKey = extractObjectKey(doc.getDocumentUrl());
        if (objectKey == null || objectKey.isBlank()) {
            throw new BadRequestException("Document storage path is invalid.");
        }

        byte[] bytes = supabaseWebClient.get()
                .uri("/storage/v1/object/" + bucket + "/" + objectKey)
                .header("apikey", supabaseKey)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                .retrieve()
                .bodyToMono(byte[].class)
                .block();

        if (bytes == null || bytes.length == 0) {
            throw new BadRequestException("Could not download document content from storage.");
        }
        return bytes;
    }
    private String extractPdfText(byte[] bytes) throws IOException {
        try (PDDocument pdf = Loader.loadPDF(bytes)) {
            return new PDFTextStripper().getText(pdf);
        }
    }

    private String extractDocxText(byte[] bytes) throws IOException {
        try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(bytes));
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String extractPptxText(byte[] bytes) throws IOException {
        try (XMLSlideShow ppt = new XMLSlideShow(new ByteArrayInputStream(bytes))) {
            StringBuilder text = new StringBuilder();
            for (XSLFSlide slide : ppt.getSlides()) {
                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        text.append(textShape.getText()).append("\n");
                    }
                }
            }
            return text.toString();
        }
    }

    private DocumentResponse toDto(Document d) {
        DocumentResponse r = new DocumentResponse();
        r.setDocumentId(d.getDocumentId());
        r.setUserId(d.getUserId());
        r.setSubjectId(d.getSubjectId());
        r.setTitle(d.getTitle());
        r.setDocumentName(d.getDocumentName());
        r.setDocumentType(d.getDocumentType());
        r.setDocumentSize(d.getDocumentSize());
        // DB lưu path tương đối (để backend tự gọi Supabase qua WebClient base-url);
        // FE cần URL tuyệt đối mới load được trực tiếp (iframe preview, link download).
        r.setDocumentUrl(toDownloadUrl(d.getDocumentUrl()));
        r.setVisibilityStatus(d.getVisibilityStatus());
        r.setStatus(d.getStatus());
        r.setUploadedAt(d.getUploadedAt());
        r.setCreatedAt(d.getCreatedAt());
        r.setUpdatedAt(d.getUpdatedAt());
        return r;
    }

    private String toDownloadUrl(String storedUrl) {
        String objectKey = extractObjectKey(storedUrl);
        if (objectKey == null || objectKey.isBlank()) {
            return null;
        }
        try {
            Map<String, Object> result = supabaseWebClient.post()
                    .uri("/storage/v1/object/sign/" + bucket + "/" + objectKey)
                    .header("apikey", supabaseKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("expiresIn", 3600))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            Object signedUrl = result == null ? null : result.get("signedURL");
            if (signedUrl != null && !String.valueOf(signedUrl).isBlank()) {
                return toAbsoluteUrl(String.valueOf(signedUrl));
            }
        } catch (Exception ignored) {}
        return toAbsoluteUrl(storedUrl);
    }

    private String toAbsoluteUrl(String relativeOrAbsoluteUrl) {
        if (relativeOrAbsoluteUrl == null || relativeOrAbsoluteUrl.startsWith("http")) {
            return relativeOrAbsoluteUrl;
        }
        String base = supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
        String path = relativeOrAbsoluteUrl.startsWith("/") ? relativeOrAbsoluteUrl : "/" + relativeOrAbsoluteUrl;
        if (path.startsWith("/object/")) {
            path = "/storage/v1" + path;
        }
        return base + path;
    }

    private MediaType mediaTypeFor(String type) {
        if (type == null) return MediaType.APPLICATION_OCTET_STREAM;
        return switch (type.toLowerCase()) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "png" -> MediaType.IMAGE_PNG;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "gif" -> MediaType.IMAGE_GIF;
            case "txt", "md", "csv" -> MediaType.TEXT_PLAIN;
            case "docx" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            case "pptx" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }

    private String extractObjectKey(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank()) return null;
        String value = storedUrl.trim();
        String base = supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
        if (value.startsWith(base)) {
            value = value.substring(base.length());
        } else if (value.startsWith("http://") || value.startsWith("https://")) {
            return null;
        }
        String publicPrefix = "/storage/v1/object/public/" + bucket + "/";
        String objectPrefix = "/storage/v1/object/" + bucket + "/";
        if (value.startsWith(publicPrefix)) return safeObjectKey(value.substring(publicPrefix.length()));
        if (value.startsWith(objectPrefix)) return safeObjectKey(value.substring(objectPrefix.length()));
        if (!value.startsWith("/storage/")) return safeObjectKey(value);
        return null;
    }

    private String safeObjectKey(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) return null;
        String normalized = objectKey.trim().replace('\\', '/');
        if (normalized.startsWith("/") || normalized.contains("../") || normalized.contains("/..")) {
            return null;
        }
        return normalized;
    }
    private String getExtension(String name) {
        if (name == null || !name.contains(".")) return "unknown";
        return name.substring(name.lastIndexOf('.') + 1).toLowerCase();
    }
}
