import api from './api';

export const reportService = {
  // ==========================================
  // 1. REPORT CATALOG (The Menu)
  // ==========================================
  getCatalog: () => api.get('/catalog/'),

  // ==========================================
  // 2. GENERATE REPORT (The Action)
  // ==========================================
  // Payload: { slug: "report-slug", parameters: { ... } }
  generateReport: (data) => api.post('/generate/', data),

  // ==========================================
  // 3. REPORT HISTORY (Past downloads)
  // ==========================================
  getHistory: () => api.get('/history/'),
  getStats: () => api.get('/stats/'),


  toggleFavorite: (slug) => api.post('/favorite/', { slug }),
};