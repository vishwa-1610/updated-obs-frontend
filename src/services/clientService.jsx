import api from './api';

export const clientService = {
  // 1. Client CRUD
  getClients: (params) => api.get('/clients/', { params }),
  getClientById: (id) => api.get(`/clients/${id}/`),
  getClientDashboard: (id) => api.get(`/clients/${id}/dashboard/`),
  createClient: (data) => api.post('/clients/', data),
  updateClient: (id, data) => api.put(`/clients/${id}/`, data),
  patchClient: (id, data) => api.patch(`/clients/${id}/`, data),
  deleteClient: (id) => api.delete(`/clients/${id}/`),

  // 2. Client Documents
  getClientDocuments: (params) => api.get('/client-documents/', { params }),
  createClientDocument: (formData) => api.post('/client-documents/create/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateClientDocument: (id, data) => api.patch(`/client-documents/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteClientDocument: (id) => api.delete(`/client-documents/${id}/`),

  // 3. Client Verifications
  getClientVerifications: (params) => api.get('/client-verifications/', { params }),
  createClientVerification: (data) => api.post('/client-verifications/', data),
  updateClientVerification: (id, data) => api.patch(`/client-verifications/${id}/`, data),
  deleteClientVerification: (id) => api.delete(`/client-verifications/${id}/`),

  // 4. Client Work Locations
  getWorkLocations: (params) => api.get('/client-locations/', { params }),
  createWorkLocation: (data) => api.post('/client-locations/', data),
  updateWorkLocation: (id, data) => api.patch(`/client-locations/${id}/`, data),
  deleteWorkLocation: (id) => api.delete(`/client-locations/${id}/`),

  // 5. Client Contacts
  getClientContacts: (params) => api.get('/client-contacts/', { params }),
  createClientContact: (data) => api.post('/client-contacts/', data),
  updateClientContact: (id, data) => api.patch(`/client-contacts/${id}/`, data),
  deleteClientContact: (id) => api.delete(`/client-contacts/${id}/`),

  // 6. Contracts, MSAs & SOWs
  getContractDocuments: (params) => api.get('/client-contract-documents/', { params }),
  createContractDocument: (formData) => api.post('/client-contract-documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateContractDocument: (id, formData) => api.put(`/client-contract-documents/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteContractDocument: (id) => api.delete(`/client-contract-documents/${id}/`),

  // 7. Client Rate Cards
  getRateCards: (params) => api.get('/client-rate-cards/', { params }),
  createRateCard: (data) => api.post('/client-rate-cards/', data),
  updateRateCard: (id, data) => api.put(`/client-rate-cards/${id}/`, data),
  deleteRateCard: (id) => api.delete(`/client-rate-cards/${id}/`)
};

export default clientService;
