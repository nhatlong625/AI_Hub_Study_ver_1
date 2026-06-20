const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const practiceTestApi = {
  list: (userId = 1) => request(`/practice-tests?userId=${userId}`),
  get: (testId) => request(`/practice-tests/${testId}`),
  generate: (payload) =>
    request("/practice-tests/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  submit: (testId, payload) =>
    request(`/practice-tests/${testId}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
