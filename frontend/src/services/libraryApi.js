// src/services/libraryApi.js
// ============================================================
// API Service - Kết nối với Spring Boot Backend
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
});

// ============================================================
// SEMESTER API
// ============================================================
export const semesterApi = {
  // Lấy tất cả semester + subject của hệ thống
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/semesters`, { headers: getHeaders() });
    return res.json();
  },
};

// ============================================================
// SUBJECT API
// ============================================================
export const subjectApi = {
  // Lấy subject theo semester
  getBySemester: async (semesterId) => {
    const res = await fetch(`${BASE_URL}/subjects/semester/${semesterId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Thêm subject mới (dùng cho flow tạo môn mới ngoài danh sách)
  add: async (semesterId, subjectName, description = "") => {
    const res = await fetch(
      `${BASE_URL}/subjects?semesterId=${semesterId}&subjectName=${encodeURIComponent(subjectName)}&description=${encodeURIComponent(description)}`,
      { method: "POST", headers: getHeaders() },
    );
    return res.json();
  },

  // Xóa subject
  delete: async (subjectId) => {
    const res = await fetch(`${BASE_URL}/subjects/${subjectId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.text();
  },
};

// ============================================================
// USER_SUBJECT API — subject user đã "add" vào Library cá nhân
// (độc lập với việc đã upload tài liệu hay chưa)
// ============================================================
export const userSubjectApi = {
  // Lấy danh sách subject user đã add — dùng để render bảng Library
  getByUser: async (userId) => {
    const res = await fetch(`${BASE_URL}/user-subjects/user/${userId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Add 1 subject vào Library — gọi khi bấm "Create" trong modal Create Course
  add: async (userId, subjectId) => {
    const res = await fetch(
      `${BASE_URL}/user-subjects?userId=${userId}&subjectId=${subjectId}`,
      { method: "POST", headers: getHeaders() },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.message || `HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  // Xóa subject khỏi Library — BE xóa cả document + file Supabase của user trong subject này
  remove: async (userId, subjectId) => {
    const res = await fetch(
      `${BASE_URL}/user-subjects?userId=${userId}&subjectId=${subjectId}`,
      { method: "DELETE", headers: getHeaders() },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.message || `HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
  },
};

// ============================================================
// DOCUMENT API
// ============================================================
export const documentApi = {
  // Upload file (multipart) — visibilityStatus mặc định PRIVATE
  upload: async (
    file,
    title,
    subjectId,
    userId,
    visibilityStatus = "PRIVATE",
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("subjectId", subjectId);
    formData.append("userId", userId);
    formData.append("visibilityStatus", visibilityStatus);

    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: "POST",
      body: formData, // Khong set Content-Type - browser tu set boundary
    });
    if (!res.ok) {
      const message = await res.text().catch(() => "Upload failed.");
      throw new Error(message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Lấy tất cả document của 1 subject (mọi visibility — dùng trong Library của chính user)
  getBySubject: async (subjectId) => {
    const res = await fetch(`${BASE_URL}/documents/subject/${subjectId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Lấy document PUBLIC của 1 subject (dùng ở Home page — hiện cho mọi người)
  getPublicBySubject: async (subjectId) => {
    const res = await fetch(
      `${BASE_URL}/documents/subject/${subjectId}/public`,
      { headers: getHeaders() },
    );
    if (!res.ok) return [];
    return res.json();
  },

  // Lấy document theo user (dùng trong Library — chỉ doc của mình)
  getByUser: async (userId) => {
    const res = await fetch(`${BASE_URL}/documents/user/${userId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Lấy 1 document theo ID
  getById: async (documentId) => {
    const res = await fetch(`${BASE_URL}/documents/${documentId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.message || `HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  // Xóa document (BE sẽ xóa cả file trên Supabase)
  delete: async (documentId) => {
    const res = await fetch(`${BASE_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.text();
  },

  // Cập nhật visibility — BE xử lý logic:
  //   PRIVATE  → PENDING_REVIEW : gửi request admin duyệt
  //   PUBLIC   → PRIVATE        : tức thì
  //   PENDING_REVIEW → reject nếu đang pending (409)
  //   Cooldown 1h khi đổi PRIVATE → PENDING_REVIEW quá nhanh (429, áp dụng
  //   chung cho mọi nguyên nhân: tự-hủy, admin reject, vừa PUBLIC→PRIVATE)
  updateVisibility: async (documentId, visibilityStatus) => {
    const res = await fetch(
      `${BASE_URL}/documents/${documentId}/visibility?visibilityStatus=${visibilityStatus}`,
      { method: "PATCH", headers: getHeaders() },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.message || `HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  // Đổi tên hiển thị (title) — không ảnh hưởng visibility/cooldown
  updateTitle: async (documentId, title) => {
    const res = await fetch(
      `${BASE_URL}/documents/${documentId}/title?title=${encodeURIComponent(title)}`,
      { method: "PATCH", headers: getHeaders() },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.message || `HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  // ── Share Document ──────────────────────────────────────────
  // Tạo hoặc lấy lại link share ACTIVE — idempotent
  createShareLink: async (documentId, userId = 1) => {
    const res = await fetch(
      `${BASE_URL}/documents/${documentId}/share?userId=${userId}`,
      { method: "POST", headers: getHeaders() },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json(); // { shareId, documentId, shareType, status, shareUrl }
  },

  // Hủy link share ACTIVE
  revokeShareLink: async (documentId, userId = 1) => {
    const res = await fetch(
      `${BASE_URL}/documents/${documentId}/share?userId=${userId}`,
      { method: "DELETE", headers: getHeaders() },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
  },

  // Lấy document theo shareId — public, không cần auth
  getByShareId: async (shareId) => {
    const res = await fetch(`${BASE_URL}/documents/share/${shareId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(
        err.message || "Share link not found or has been revoked.",
      );
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  // AI Summarize (proxy sang Python service)
  summarize: async (documentId, userId, maxChunks = null) => {
    const body = { documentId, userId };
    if (maxChunks) {
      body.maxChunks = maxChunks;
    }

    const res = await fetch(`${BASE_URL}/documents/${documentId}/summarize`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(
        payload?.message || `Summarize failed with status ${res.status}`,
      );
    }
    return payload;
  },
};
