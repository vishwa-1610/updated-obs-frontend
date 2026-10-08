import api from './api';

export const templateService = {
  // 1. Template CRUD
  getTemplates: (params) => api.get('/templates/', { params }),
  getTemplateById: (id) => api.get(`/templates/${id}/`),
  
  createTemplate: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/templates/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
  },
  
  updateTemplate: (id, data) => {
    const isFormData = data instanceof FormData;
    return api.patch(`/templates/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
  },
  
  deleteTemplate: (id) => api.delete(`/templates/${id}/`),

  // 2. Preset Library & Blueprints (1-Click Cloning)
  getPresets: () => api.get('/templates/presets/'),
  clonePreset: (presetKey) => api.post(`/templates/presets/${presetKey}/clone/`),

  // 3. Dynamic Live Preview & Merge Tag Context
  previewTemplate: (id, context = {}) => api.post(`/templates/${id}/preview/`, { context }),
  getPreviewHtml: (id) => api.get(`/templates/${id}/preview/`),
  renderTemplate: (id, context = {}) => api.post(`/templates/${id}/render/`, { context }),

  // 4. Live Test Email Dispatch
  sendTestEmail: (id, payload) => api.post(`/templates/${id}/send-test/`, payload),

  // 5. Render & Export Branded PDF
  renderPdf: (id) => api.get(`/templates/${id}/render-pdf/`, { responseType: 'blob' }),
};

export default templateService;
