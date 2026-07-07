// src/services/libraryApi.js
// ============================================================
// API Service - Káº¿t ná»‘i vá»›i Spring Boot Backend
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================================================
// SEMESTER API
// ============================================================

export const libraryApi = {
  getOverview: async (userId) => {
    const res = await fetch(`${BASE_URL}/library/users/${userId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Cannot load library (HTTP ${res.status})`);
    return res.json();
  },
};

export const semesterApi = {
  // Láº¥y táº¥t cáº£ semester + subject cá»§a há»‡ thá»‘ng
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/semesters`, { headers: getHeaders() });
    return res.json();
  },
};

// ============================================================
// SUBJECT API
// ============================================================
export const subjectApi = {
  // Láº¥y subject theo semester
  getBySemester: async (semesterId) => {
    const res = await fetch(`${BASE_URL}/subjects/semester/${semesterId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // ThÃªm subject má»›i (dÃ¹ng cho flow táº¡o mÃ´n má»›i ngoÃ i danh sÃ¡ch)
  add: async (semesterId, subjectName, description = "") => {
    const res = await fetch(
      `${BASE_URL}/subjects?semesterId=${semesterId}&subjectName=${encodeURIComponent(subjectName)}&description=${encodeURIComponent(description)}`,
      { method: "POST", headers: getHeaders() },
    );
    return res.json();
  },

  // XÃ³a subject
  delete: async (subjectId) => {
    const res = await fetch(`${BASE_URL}/subjects/${subjectId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.text();
  },
};

// ============================================================
// USER_SUBJECT API â€” subject user Ä‘Ã£ "add" vÃ o Library cÃ¡ nhÃ¢n
// (Ä‘á»™c láº­p vá»›i viá»‡c Ä‘Ã£ upload tÃ i liá»‡u hay chÆ°a)
// ============================================================
export const userSubjectApi = {
  // Láº¥y danh sÃ¡ch subject user Ä‘Ã£ add â€” dÃ¹ng Ä‘á»ƒ render báº£ng Library
  getByUser: async (userId) => {
    const res = await fetch(`${BASE_URL}/user-subjects/user/${userId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Add 1 subject vÃ o Library â€” gá»i khi báº¥m "Create" trong modal Create Course
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

  // XÃ³a subject khá»i Library â€” BE xÃ³a cáº£ document + file Supabase cá»§a user trong subject nÃ y
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
  // Upload file (multipart) â€” visibilityStatus máº·c Ä‘á»‹nh PRIVATE
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
      headers: {
        ...(localStorage.getItem("token")
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : {}),
      },
      body: formData, // Khong set Content-Type - browser tu set boundary
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const message = errorBody?.message || `Upload failed (HTTP ${res.status}).`;
      throw new Error(message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Láº¥y táº¥t cáº£ document cá»§a 1 subject (má»i visibility â€” dÃ¹ng trong Library cá»§a chÃ­nh user)
  getBySubject: async (subjectId) => {
    const res = await fetch(`${BASE_URL}/documents/subject/${subjectId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Láº¥y document PUBLIC cá»§a 1 subject (dÃ¹ng á»Ÿ Home page â€” hiá»‡n cho má»i ngÆ°á»i)
  getPublicBySubject: async (subjectId) => {
    const res = await fetch(
      `${BASE_URL}/documents/subject/${subjectId}/public`,
      { headers: getHeaders() },
    );
    if (!res.ok) return [];
    return res.json();
  },

  // Láº¥y document theo user (dÃ¹ng trong Library â€” chá»‰ doc cá»§a mÃ¬nh)
  getByUser: async (userId) => {
    const res = await fetch(`${BASE_URL}/documents/user/${userId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Láº¥y 1 document theo ID
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

  // XÃ³a document (BE sáº½ xÃ³a cáº£ file trÃªn Supabase)
  delete: async (documentId) => {
    const res = await fetch(`${BASE_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.text();
  },

  // Cáº­p nháº­t visibility â€” BE xá»­ lÃ½ logic:
  //   PRIVATE  â†’ PENDING_REVIEW : gá»­i request admin duyá»‡t
  //   PUBLIC   â†’ PRIVATE        : tá»©c thÃ¬
  //   PENDING_REVIEW â†’ reject náº¿u Ä‘ang pending (409)
  //   Cooldown 1h khi Ä‘á»•i PRIVATE â†’ PENDING_REVIEW quÃ¡ nhanh (429, Ã¡p dá»¥ng
  //   chung cho má»i nguyÃªn nhÃ¢n: tá»±-há»§y, admin reject, vá»«a PUBLICâ†’PRIVATE)
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

  // Äá»•i tÃªn hiá»ƒn thá»‹ (title) â€” khÃ´ng áº£nh hÆ°á»Ÿng visibility/cooldown
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

  // â”€â”€ Share Document â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Táº¡o hoáº·c láº¥y láº¡i link share ACTIVE â€” idempotent
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

  // Há»§y link share ACTIVE
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

  // Láº¥y document theo shareId â€” public, khÃ´ng cáº§n auth
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


  shareWithUser: async (documentId, email, permission, ownerUserId = 1) => {
    const res = await fetch(`${BASE_URL}/documents/${documentId}/share/user`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, permission, ownerUserId }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.message || `HTTP ${res.status}`);
    return payload;
  },

  getSharesForDocument: async (documentId) => {
    const res = await fetch(`${BASE_URL}/documents/${documentId}/share/users`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  getSharedWithMe: async (userId = 1) => {
    const res = await fetch(`${BASE_URL}/documents/shared-with-me?userId=${userId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  revokeUserShare: async (shareId) => {
    const res = await fetch(`${BASE_URL}/documents/share/user/${shareId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  updateSharePermission: async (shareId, permission) => {
    const res = await fetch(
      `${BASE_URL}/documents/share/user/${shareId}/permission?permission=${permission}`,
      { method: "PATCH", headers: getHeaders() },
    );
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.message || `HTTP ${res.status}`);
    return payload;
  },
  // AI Summarize (proxy sang Python service)
  getSummary: async (documentId, publicAccess = false) => {
    const path = publicAccess
      ? `${BASE_URL}/documents/public/${documentId}/summary`
      : `${BASE_URL}/documents/${documentId}/summary`;
    const res = await fetch(path, { headers: getHeaders() });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      const error = new Error(payload?.message || `HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return payload;
  },

  summarize: async (documentId, _userId = null, maxChunks = null) => {
    const body = { documentId };
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

// ============================================================
// COMMENT API
// ============================================================
export const commentApi = {
  getByDocument: async (documentId, { publicAccess = false, shareId = null } = {}) => {
    const path = shareId
      ? `${BASE_URL}/comments/share/${shareId}`
      : publicAccess
        ? `${BASE_URL}/comments/public/document/${documentId}`
        : `${BASE_URL}/comments/document/${documentId}`;
    const res = await fetch(path, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  create: async (userId, documentId, content) => {
    const res = await fetch(`${BASE_URL}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ userId, documentId, content }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  delete: async (commentId, userId) => {
    const res = await fetch(`${BASE_URL}/comments/${commentId}?userId=${userId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};
