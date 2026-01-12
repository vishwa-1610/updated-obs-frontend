import api from './api';

export const templateService = {
  // ... existing CRUD methods ...
  getTemplates: (params) => api.get('/templates/', { params }),
  getTemplateById: (id) => api.get(`/templates/${id}/`),
  
  createTemplate: (data) => api.post('/templates/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  updateTemplate: (id, data) => api.patch(`/templates/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  deleteTemplate: (id) => api.delete(`/templates/${id}/`),

  // ✅ NEW: Preview Template (Fetches rendered HTML)
  previewTemplate: (id) => api.get(`/templates/${id}/preview/`),
};