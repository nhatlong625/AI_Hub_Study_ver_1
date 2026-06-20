const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const DEFAULT_USER_ID = Number(import.meta.env.VITE_AI_STUDY_USER_ID || localStorage.getItem('aiStudyUserId') || 1);
const REQUEST_TIMEOUT_MS = 15000;

async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
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
  return Number.isFinite(DEFAULT_USER_ID) && DEFAULT_USER_ID > 0 ? DEFAULT_USER_ID : 1;
}

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

export function listAiChatSessions(userId = getDefaultAiUserId()) {
  return requestJson(`/api/chat/sessions?userId=${encodeURIComponent(userId)}`);
}

export function listAiChatMessages(sessionId, userId = getDefaultAiUserId()) {
  return requestJson(`/api/chat/sessions/${encodeURIComponent(sessionId)}/messages?userId=${encodeURIComponent(userId)}`);
}

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
