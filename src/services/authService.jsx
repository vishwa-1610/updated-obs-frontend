import api from './api';

export const authService = {
  // --- AUTHENTICATION ---
  
  // 1. Login (Missing in your code, required by authSlice)
  login: (credentials) => api.post('/users/login/', credentials),

  // 2. Fetch logged-in user profile
  getProfile: () => api.get('/users/profile/'),

  // 3. Update profile details
  updateProfile: (data) => api.patch('/users/profile/', data),

  // 4. Change Password
  changePassword: (data) => api.post('/users/change-password/', data),

  // --- ADMIN DASHBOARD FUNCTIONS ---

  // 5. Get All Users (For Admin Dashboard Table)
  getUsers: () => api.get('/users/'),

  // 6. Delete User (For Admin Dashboard Actions)
  deleteUser: (id) => api.delete(`/users/${id}/`),
};