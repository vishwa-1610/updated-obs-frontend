import api from '../api';

export const subcontractorService = {
  // ==========================================
  // 1. SUBCONTRACTOR CRUD
  // ==========================================
  getSubcontractors: (params) => api.get('/subcontractors/', { params }),
  getSubcontractorById: (id) => api.get(`/subcontractors/${id}/`),
  createSubcontractor: (data) => api.post('/subcontractors/', data),
  updateSubcontractor: (id, data) => api.put(`/subcontractors/${id}/`, data),
  deleteSubcontractor: (id) => api.delete(`/subcontractors/${id}/`),
  
  // ==========================================
  // 2. DOCUMENTS
  // ==========================================
  createSubcontractorDocument: (data) => api.post('/subcontractor-documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSubcontractorDocument: (id, data) => api.patch(`/subcontractor-documents/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSubcontractorDocument: (id) => api.delete(`/subcontractor-documents/${id}/`),
  
  // ==========================================
  // 3. CONTACTS
  // ==========================================
  createSubcontractorContact: (data) => api.post('/subcontractor-contacts/', data),
  updateSubcontractorContact: (id, data) => api.put(`/subcontractor-contacts/${id}/`, data),
  deleteSubcontractorContact: (id) => api.delete(`/subcontractor-contacts/${id}/`), 

  // ==========================================
  // 4. ✅ NEW: WORK LOCATIONS
  // ==========================================
  // Essential for dropdowns in contacts
  getWorkLocations: (params) => api.get('/subcontractor-locations/', { params }),
  createWorkLocation: (data) => api.post('/subcontractor-locations/', data),
  updateWorkLocation: (id, data) => api.put(`/subcontractor-locations/${id}/`, data),
  deleteWorkLocation: (id) => api.delete(`/subcontractor-locations/${id}/`),

  // ==========================================
  // 5. ✅ NEW: PLACEMENTS
  // ==========================================
  createPlacement: (data) => api.post('/subcontractor-placements/', data),
  updatePlacement: (id, data) => api.put(`/subcontractor-placements/${id}/`, data),
  deletePlacement: (id) => api.delete(`/subcontractor-placements/${id}/`),
};