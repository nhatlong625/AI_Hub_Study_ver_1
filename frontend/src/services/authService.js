export const authService = {
  login: async (payload) => Promise.resolve({ success: true, payload }),
  register: async (payload) => Promise.resolve({ success: true, payload }),
  forgotPassword: async (payload) => Promise.resolve({ success: true, payload }),
  verifyEmail: async (payload) => Promise.resolve({ success: true, payload }),
};
