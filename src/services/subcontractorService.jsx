import api from './api';

export const subcontractorService = {
  // 1. Subcontractor Vendor Directory
  getSubcontractors: (params) => api.get('/subcontractors/', { params }),
  getSubcontractorById: (id) => api.get(`/subcontractors/${id}/`),
  getSubcontractorDashboard: (id) => api.get(`/subcontractors/${id}/dashboard/`),
  createSubcontractor: (data) => api.post('/subcontractors/', data),
  updateSubcontractor: (id, data) => api.put(`/subcontractors/${id}/`, data),
  deleteSubcontractor: (id) => api.delete(`/subcontractors/${id}/`),

  // 2. Compliance Documents & COI
  getDocuments: (params) => api.get('/subcontractor-documents/', { params }),
  createSubcontractorDocument: (data) => api.post('/subcontractor-documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSubcontractorDocument: (id, data) => api.patch(`/subcontractor-documents/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSubcontractorDocument: (id) => api.delete(`/subcontractor-documents/${id}/`),

  // 3. Contacts
  getContacts: (params) => api.get('/subcontractor-contacts/', { params }),
  createSubcontractorContact: (data) => api.post('/subcontractor-contacts/', data),
  updateSubcontractorContact: (id, data) => api.put(`/subcontractor-contacts/${id}/`, data),
  deleteSubcontractorContact: (id) => api.delete(`/subcontractor-contacts/${id}/`),

  // 4. Work Locations
  getWorkLocations: (params) => api.get('/subcontractor-locations/', { params }),
  createWorkLocation: (data) => api.post('/subcontractor-locations/', data),
  updateWorkLocation: (id, data) => api.put(`/subcontractor-locations/${id}/`, data),
  deleteWorkLocation: (id) => api.delete(`/subcontractor-locations/${id}/`),

  // 5. Placements (1099 Placed Candidates)
  getPlacements: (params) => api.get('/subcontractor-placements/', { params }),
  createPlacement: (data) => api.post('/subcontractor-placements/', data),
  updatePlacement: (id, data) => api.put(`/subcontractor-placements/${id}/`, data),
  deletePlacement: (id) => api.delete(`/subcontractor-placements/${id}/`),

  // 6. Invoices & Remittances
  getInvoices: (params) => api.get('/subcontractor-invoices/', { params }),
  createInvoice: (data) => api.post('/subcontractor-invoices/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateInvoice: (id, data) => api.put(`/subcontractor-invoices/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteInvoice: (id) => api.delete(`/subcontractor-invoices/${id}/`),

  // 7. Form W-9 Tax Certification
  getW9Forms: (params) => api.get('/w9-forms/', { params }),
  createW9Form: (data) => api.post('/w9-forms/', data),
  updateW9Form: (id, data) => api.put(`/w9-forms/${id}/`, data),
  downloadW9Pdf: (id) => api.get(`/w9-forms/${id}/download/`, { responseType: 'blob' }),
  getSubcontractorW9: (subId) => api.get(`/subcontractors/${subId}/w9/`)
};

export default subcontractorService;
