import api from './api'; // Ensure this points to your fixed api.js

export const clientService = {
  // ==========================================
  // 1. CLIENT CRUD
  // ==========================================
  getClients: (params) => api.get('/clients/', { params }),
  getClientById: (id) => api.get(`/clients/${id}/`),
  createClient: (data) => api.post('/clients/', data),
  updateClient: (id, data) => api.patch(`/clients/${id}/`, data),
  deleteClient: (id) => api.delete(`/clients/${id}/`),

  // ==========================================
  // 2. CLIENT DOCUMENTS (General Docs)
  // ==========================================
  getClientDocuments: (params) => api.get('/client-documents/', { params }),
  createClientDocument: (formData) => api.post('/client-documents/create/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateClientDocument: (id, data) => api.patch(`/client-documents/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteClientDocument: (id) => api.delete(`/client-documents/${id}/`),

  // ==========================================
  // 3. CLIENT VERIFICATION
  // ==========================================
  getClientVerifications: (params) => api.get('/client-verifications/', { params }),
  createClientVerification: (data) => api.post('/client-verifications/', data),
  updateClientVerification: (id, data) => api.patch(`/client-verifications/${id}/`, data),
  deleteClientVerification: (id) => api.delete(`/client-verifications/${id}/`),

  // ==========================================
  // 4. CLIENT WORK LOCATIONS
  // ==========================================
  getWorkLocations: (params) => api.get('/client-locations/', { params }),
  createWorkLocation: (data) => api.post('/client-locations/', data),
  updateWorkLocation: (id, data) => api.patch(`/client-locations/${id}/`, data),
  deleteWorkLocation: (id) => api.delete(`/client-locations/${id}/`),

  // ==========================================
  // 5. CLIENT CONTACTS
  // ==========================================
  getClientContacts: (params) => api.get('/client-contacts/', { params }),
  createClientContact: (data) => api.post('/client-contacts/', data),
  updateClientContact: (id, data) => api.patch(`/client-contacts/${id}/`, data),
  deleteClientContact: (id) => api.delete(`/client-contacts/${id}/`),

  // ==========================================
  // 6. ✅ NEW: CLIENT CONTRACT DOCUMENTS
  // ==========================================
  // Fetches list of contract documents (optionally filtered by ?client=ID)
  getContractDocuments: (params) => api.get('/client-contract-documents/', { params }),

  // Uploads a new contract file
  createContractDocument: (formData) => api.post('/client-contract-documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Deletes a contract file
  deleteContractDocument: (id) => api.delete(`/client-contract-documents/${id}/`),
};