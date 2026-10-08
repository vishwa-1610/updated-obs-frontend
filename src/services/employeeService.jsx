import api from './api';

export const employeeService = {
  // 1. Dashboard Stats
  getStats: (params) => api.get('/employees/stats/', { params }),

  // 2. Core Employee Directory
  getEmployees: (params) => api.get('/employees/', { params }),
  getEmployeeById: (id) => api.get(`/employees/${id}/`),
  createEmployee: (data) => api.post('/employees/', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}/`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}/`),

  // 3. Digital Employee Profiles
  getProfiles: (params) => api.get('/directory/profiles/', { params }),
  getProfileById: (id) => api.get(`/directory/profiles/${id}/`),
  createProfile: (data) => api.post('/directory/profiles/', data),
  updateProfile: (id, data) => api.put(`/directory/profiles/${id}/`, data),
  deleteProfile: (id) => api.delete(`/directory/profiles/${id}/`),

  // 4. Hardware Equipment & Assets
  getAssets: (params) => api.get('/assets/inventory/', { params }),
  getAssetById: (id) => api.get(`/assets/inventory/${id}/`),
  createAsset: (data) => api.post('/assets/inventory/', data),
  updateAsset: (id, data) => api.put(`/assets/inventory/${id}/`, data),
  deleteAsset: (id) => api.delete(`/assets/inventory/${id}/`),

  // 5. SaaS App Provisioning Accounts
  getAppAccounts: (params) => api.get('/apps/provisioning/', { params }),
  createAppAccount: (data) => api.post('/apps/provisioning/', data),
  updateAppAccount: (id, data) => api.put(`/apps/provisioning/${id}/`, data),
  revokeAppAccess: (id) => api.post(`/apps/provisioning/${id}/revoke/`),
  deleteAppAccount: (id) => api.delete(`/apps/provisioning/${id}/`),

  // 6. 1-on-1s & Talent Reviews
  getOneOnOnes: (params) => api.get('/performance/1-on-1s/', { params }),
  createOneOnOne: (data) => api.post('/performance/1-on-1s/', data),
  updateOneOnOne: (id, data) => api.put(`/performance/1-on-1s/${id}/`, data),
  deleteOneOnOne: (id) => api.delete(`/performance/1-on-1s/${id}/`),

  getPerformanceReviews: (params) => api.get('/performance/reviews/', { params }),
  createPerformanceReview: (data) => api.post('/performance/reviews/', data),
  updatePerformanceReview: (id, data) => api.put(`/performance/reviews/${id}/`, data),

  // 7. Structured Offboarding & US Final Pay Compliance
  getSeparations: (params) => api.get('/offboarding/separations/', { params }),
  getSeparationById: (id) => api.get(`/offboarding/separations/${id}/`),
  createSeparation: (data) => api.post('/offboarding/separations/', data),
  updateSeparation: (id, data) => api.put(`/offboarding/separations/${id}/`, data),
  deleteSeparation: (id) => api.delete(`/offboarding/separations/${id}/`),
  calculateFinalPay: (id) => api.post(`/offboarding/separations/${id}/calculate-final-pay/`),
  deprovisionAccess: (id) => api.post(`/offboarding/separations/${id}/deprovision-access/`),
  collectAssets: (id, data) => api.post(`/offboarding/separations/${id}/collect-assets/`, data),
  hrSignoff: (id) => api.post(`/offboarding/separations/${id}/hr-signoff/`),
  getSeparationComplianceDashboard: () => api.get('/offboarding/separations/compliance-dashboard/'),

  // 8. Company Announcements & Engagement
  getAnnouncements: (params) => api.get('/engagement/announcements/', { params }),
  createAnnouncement: (data) => api.post('/engagement/announcements/', data),
  updateAnnouncement: (id, data) => api.put(`/engagement/announcements/${id}/`, data),
  deleteAnnouncement: (id) => api.delete(`/engagement/announcements/${id}/`),
};

export default employeeService;
