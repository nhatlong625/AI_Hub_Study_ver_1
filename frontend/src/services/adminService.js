async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Request failed.');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const adminService = {
  getDashboard: async () => request('/api/admin/dashboard'),
  getUsers: async (searchTerm = '') => {
    const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
    return request(`/api/admin/users${query}`);
  },
  createUser: async (user) => request('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  updateUser: async (id, user) => request(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  }),
  deleteUser: async (id) => request(`/api/admin/users/${id}`, {
    method: 'DELETE',
  }),
  getLibrarySemesters: async () => request('/api/admin/library/semesters'),
  createLibrarySemester: async (semester) => request('/api/admin/library/semesters', {
    method: 'POST',
    body: JSON.stringify({ name: semester.name }),
  }),
  updateLibrarySemester: async (id, semester) => request(`/api/admin/library/semesters/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: semester.name }),
  }),
  deleteLibrarySemester: async (id) => request(`/api/admin/library/semesters/${id}`, {
    method: 'DELETE',
  }),
  getLibraryCourses: async (semesterId) => request(`/api/admin/library/semesters/${semesterId}/courses`),
  createLibraryCourse: async (semesterId, course) => request(`/api/admin/library/semesters/${semesterId}/courses`, {
    method: 'POST',
    body: JSON.stringify(course),
  }),
  deleteLibraryCourse: async (courseId) => request(`/api/admin/library/courses/${courseId}`, {
    method: 'DELETE',
  }),
  getDocuments: async () => request('/api/admin/document-management'),
  updateDocumentStatus: async (id, status, rejectReason = '') => request(`/api/admin/document-management/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, rejectReason }),
  }),
  deleteDocument: async (id) => request(`/api/admin/document-management/${id}`, {
    method: 'DELETE',
  }),
  getPracticeTests: async () => request('/api/admin/practice-tests'),
  getPracticeTestQuestions: async (testId) => request(`/api/admin/practice-tests/${testId}/questions`),
  deletePracticeTest: async (testId) => request(`/api/admin/practice-tests/${testId}`, {
    method: 'DELETE',
  }),
  getPracticeReviewQueue: async () => request('/api/admin/practice-review-queue'),
  updatePracticeReviewQueueItem: async (id, item) => request(`/api/admin/practice-review-queue/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  resolvePracticeReviewQueueItem: async (id, status) => request(`/api/admin/practice-review-queue/${id}/resolve`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  getPayments: async () => request('/api/admin/payments'),
  updatePaymentPlan: async (plan, data) => request(`/api/admin/payments/plans/${plan}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  getReviewQueue: async () => Promise.resolve([]),
};
