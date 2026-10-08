import api from './api';

export const authService = {
  // --- AUTHENTICATION ---
  login: (credentials) => api.post('/users/login/', credentials),
  verify2FALogin: (data) => api.post('/users/2fa/verify-login/', data),
  sendEmailOTP: (data) => api.post('/users/2fa/send-email-otp/', data),
  forgotPassword: (data) => api.post('/users/forgot-password/', data),
  resetPassword: (data) => api.post('/users/reset-password/', data),
  signup: (data) => api.post('/users/signup/', data),

  // --- USER PROFILE & IDENTITY ---
  getProfile: () => api.get('/users/profile/'),
  getMe: () => api.get('/users/me/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
  changePassword: (data) => api.post('/users/change-password/', data),

  // --- 2FA MANAGEMENT ---
  setup2FA: () => api.post('/users/2fa/setup/'),
  enable2FA: (data) => api.post('/users/2fa/enable/', data),
  disable2FA: (data) => api.post('/users/2fa/disable/', data),
  regenerateBackupCodes: () => api.post('/users/2fa/backup-codes/'),

  // --- ADMIN DASHBOARD ---
  getUsers: () => api.get('/users/'),
  deleteUser: (id) => api.delete(`/users/${id}/`),
  updateUserRole: (id, data) => api.patch(`/users/${id}/role/`, data),
};

export default authService;
