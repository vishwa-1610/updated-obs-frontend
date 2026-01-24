import api from '../api'; // Your axios instance from api.js

export const companyIntakeService = {

  // --- REGISTRATION ---
  registerCompany: (data) => api.post('register-company/', data),

  // --- USER MANAGEMENT ---
  getUsers: () => api.get('users/'), 
  createUser: (data) => api.post('users/signup/', data),
  updateUser: (id, data) => api.patch(`users/${id}/`, data),
  deleteUser: (id) => api.delete(`users/${id}/`),

  // --- CONTACTS ---
  getCompanyContacts: () => api.get('company-contacts/'),
  updateCompanyContacts: (data) => api.patch('company-contacts/', data),

  // --- INDUSTRY TYPE ---
  getCompanyType: () => api.get('company-type/'),
  setCompanyType: (data) => api.patch('company-type/', data),

  // --- WORKFLOW (Screen 6) ---
  getWorkflowSteps: async () => {
    const response = await api.get('workflow-steps/');
    // ✅ SAFETY FIX: Handle Pagination vs List
    // If backend returns { results: [...] }, use that. Otherwise use data directly.
    const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    return { data }; // Return standardized structure
  },
  
  toggleWorkflowStep: (id, isActive) => api.patch(`workflow-step/${id}/`, { is_active: isActive }),
  reorderWorkflowSteps: (orderList) => api.post('workflow-reorder/', orderList),

  // --- DOCUMENTS ---
  getCompanyDocuments: async () => {
    const response = await api.get('company-docs/');
    // ✅ SAFETY FIX: Handle Pagination vs List
    const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    return { data };
  },
  
  uploadCompanyDocument: (formData) => api.post('company-docs/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // --- SIGNATURE ---
  getDigitalSignature: () => api.get('digital-signatures/'), 

  // 2. Create New (POST + FormData)
  createDigitalSignature: (formData) => api.post('digital-signatures/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // 3. Update Existing (PATCH + FormData + ID)
  updateDigitalSignature: (id, formData) => api.patch(`digital-signatures/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  saveDigitalSignature: (data) => api.patch('digital-signature/', data),

  // --- BRANDING ---
  // ✅ FIX: Added getBranding for consistency
  getBranding: () => api.get('branding/'), 
  saveBranding: (formData) => api.patch('branding/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // --- PAYMENT & HOSTING ---
  savePayment: (data) => api.patch('payment-setup/', data),
  saveHosting: (data) => api.patch('hosting/', data),
};