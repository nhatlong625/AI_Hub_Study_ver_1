const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const REQUEST_TIMEOUT_MS = 15000;

const API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '') ||
  'http://localhost:8080'
).replace(/\/$/, '');

function readStoredUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = Number(user.userId || user.id);
    if (Number.isFinite(userId) && userId > 0) return userId;
  } catch {
    // Ignore malformed localStorage and fall back below.
  }

  const legacyUserId = Number(localStorage.getItem('aiStudyUserId'));
  if (Number.isFinite(legacyUserId) && legacyUserId > 0) return legacyUserId;

  const envUserId = Number(import.meta.env.VITE_AI_STUDY_USER_ID);
  return Number.isFinite(envUserId) && envUserId > 0 ? envUserId : 1;
}

async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options,
      signal: controller.signal
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.message || payload?.detail || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The AI service did not respond in time. Check that Spring Boot, Python AI, and SQL Server are running.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function getDefaultAiUserId() {
  return readStoredUserId();
}

/**
 * Gọi API: POST /api/chat/ask
 * Gửi: userId, sessionId, message, subjectId, documentIds, topK.
 * Trả về: câu trả lời AI, sessionId, subject phát hiện và danh sách source document.
 */
export function askAiChat({ userId, sessionId, message, subjectId, documentIds, topK = 3 }) {
  return requestJson('/api/chat/ask', {
    method: 'POST',
    body: JSON.stringify({
      userId: userId || getDefaultAiUserId(),
      sessionId: sessionId || null,
      subjectId: subjectId || null,
      documentIds: documentIds || [],
      message,
      topK
    })
  });
}

/**
 * Gọi API: GET /api/chat/sessions?userId=...
 * Gửi: userId trên query string.
 * Trả về: danh sách phiên chat của user.
 */
export function listAiChatSessions(userId = getDefaultAiUserId()) {
  return requestJson(`/api/chat/sessions?userId=${encodeURIComponent(userId)}`);
}

/**
 * Gọi API: GET /api/chat/sessions/{sessionId}/messages?userId=...
 * Gửi: sessionId trên path, userId trên query string.
 * Trả về: danh sách tin nhắn trong phiên chat.
 */
export function listAiChatMessages(sessionId, userId = getDefaultAiUserId()) {
  return requestJson(`/api/chat/sessions/${encodeURIComponent(sessionId)}/messages?userId=${encodeURIComponent(userId)}`);
}

/**
 * Gọi API: DELETE /api/chat/sessions/{sessionId}?userId=...
 * Gửi: sessionId, userId và thông tin phiên cần xóa.
 * Trả về: kết quả xóa phiên chat hoặc message xác nhận.
 */
export function deleteAiChatSession(sessionOrId, userId = getDefaultAiUserId()) {
  const isSessionObject = typeof sessionOrId === 'object' && sessionOrId !== null;
  const sessionId = isSessionObject ? (sessionOrId.sessionId || sessionOrId.id) : sessionOrId;
  const resolvedUserId = isSessionObject ? (sessionOrId.userId || userId || getDefaultAiUserId()) : (userId || getDefaultAiUserId());

  return requestJson(`/api/chat/sessions/${encodeURIComponent(sessionId)}?userId=${encodeURIComponent(resolvedUserId)}`, {
    method: 'DELETE',
    body: JSON.stringify({
      sessionId,
      userId: resolvedUserId,
      sessionTitle: isSessionObject ? (sessionOrId.sessionTitle || sessionOrId.title || '') : '',
      deletedAt: new Date().toISOString()
    })
  });
}


