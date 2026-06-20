package com.aistudyhub.controller;

import com.aistudyhub.dto.request.DocumentSummarizeRequest;
import com.aistudyhub.dto.response.DocumentShareResponse;
import com.aistudyhub.dto.response.DocumentResponse;
import com.aistudyhub.dto.response.DocumentSummarizeResponse;
import com.aistudyhub.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /** Upload file lên Supabase + lưu metadata DB */
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("subjectId") Integer subjectId,
            @RequestParam("userId") Integer userId,
            @RequestParam(value = "visibilityStatus", defaultValue = "PRIVATE") String visibility) {
        try {
            return ResponseEntity.ok(documentService.upload(file, title, subjectId, userId, visibility));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAll() {
        return ResponseEntity.ok(documentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(documentService.getById(id));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<ByteArrayResource> preview(@PathVariable Integer id) {
        return fileResponse(documentService.getFile(id), false);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> download(@PathVariable Integer id) {
        return fileResponse(documentService.getFile(id), true);
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<DocumentResponse>> getBySubject(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(documentService.getBySubject(subjectId));
    }

    /** Chỉ trả về document PUBLIC — dùng cho Home page hiện số file và recent doc */
    @GetMapping("/subject/{subjectId}/public")
    public ResponseEntity<List<DocumentResponse>> getPublicBySubject(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(documentService.getPublicBySubject(subjectId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DocumentResponse>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(documentService.getByUser(userId));
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<DocumentResponse> updateVisibility(
            @PathVariable Integer id,
            @RequestParam String visibilityStatus) {
        return ResponseEntity.ok(documentService.updateVisibility(id, visibilityStatus));
    }

    /** Đổi tên hiển thị (title) của document — không đụng visibility_status/updated_at. */
    @PatchMapping("/{id}/title")
    public ResponseEntity<DocumentResponse> updateTitle(
            @PathVariable Integer id,
            @RequestParam String title) {
        return ResponseEntity.ok(documentService.updateTitle(id, title));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Tóm tắt tài liệu bằng AI (proxy sang Python AI service), kết quả lưu vào AI_SUMMARY. */
    @PostMapping("/{id}/summarize")
    public ResponseEntity<DocumentSummarizeResponse> summarize(
            @PathVariable Integer id,
            @Valid @RequestBody DocumentSummarizeRequest request) {
        request.setDocumentId(id);
        return ResponseEntity.ok(documentService.summarize(request));
    }

    // ── Share Document ────────────────────────────────────────

    /**
     * Tạo hoặc lấy lại link share ACTIVE cho document.
     * Idempotent: bấm nhiều lần vẫn trả cùng 1 link.
     * TODO: sau B1, lấy userId từ JWT thay vì RequestParam.
     */
    @PostMapping("/{id}/share")
    public ResponseEntity<DocumentShareResponse> createShareLink(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "1") Integer userId) {
        return ResponseEntity.ok(documentService.createOrGetShareLink(id, userId));
    }

    /**
     * Hủy link share ACTIVE — link cũ không dùng được nữa.
     * TODO: sau B1, lấy userId từ JWT.
     */
    @DeleteMapping("/{id}/share")
    public ResponseEntity<Void> revokeShareLink(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "1") Integer userId) {
        documentService.revokeShareLink(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Resolve shareId → document — PUBLIC, không cần đăng nhập.
     * Dùng cho trang /share/:shareId ở FE.
     */
    @GetMapping("/share/{shareId}")
    public ResponseEntity<DocumentResponse> getByShareId(@PathVariable Integer shareId) {
        return ResponseEntity.ok(documentService.getDocumentByShareId(shareId));
    }

    private ResponseEntity<ByteArrayResource> fileResponse(DocumentService.DocumentFile file, boolean attachment) {
        String disposition = attachment ? "attachment" : "inline";
        String safeName = file.fileName() == null ? "document" : file.fileName().replace("\"", "");
        return ResponseEntity.ok()
                .contentType(file.mediaType() == null ? MediaType.APPLICATION_OCTET_STREAM : file.mediaType())
                .contentLength(file.bytes().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + safeName + "\"")
                .body(new ByteArrayResource(file.bytes()));
    }
}
