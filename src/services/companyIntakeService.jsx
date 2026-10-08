import api from './api';

export const companyIntakeService = {
  // --- REGISTRATION & PUBLIC ---
  registerCompany: (data) => api.post('register-company/', data),

  // --- UNIFIED PROFILE & BRANDING ---
  getUnifiedProfile: () => api.get('/company/profile/'),
  updateUnifiedProfile: (data) => api.patch('/company/profile/', data),
  getBranding: () => api.get('/company/branding/'),
  saveBranding: (formData) => api.patch('/company/branding/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // --- MULTI-ENTITY HIERARCHY ---
  getEntities: (params) => api.get('/company/entities/', { params }),
  createEntity: (data) => api.post('/company/entities/', data),
  getBranches: (params) => api.get('/company/branches/', { params }),
  createBranch: (data) => api.post('/company/branches/', data),
  getDepartments: (params) => api.get('/company/departments/', { params }),

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

  // --- WORKFLOW ---
  getWorkflowSteps: async () => {
    const response = await api.get('workflow-steps/');
    const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    return { data };
  },
  toggleWorkflowStep: (id, isActive) => api.patch(`workflow-step/${id}/`, { is_active: isActive }),
  reorderWorkflowSteps: (orderList) => api.post('workflow-reorder/', orderList),

  // --- DOCUMENTS ---
  getCompanyDocuments: async () => {
    const response = await api.get('company-docs/');
    const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    return { data };
  },
  uploadCompanyDocument: (formData) => api.post('company-docs/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // --- SIGNATURE ---
  getDigitalSignature: () => api.get('digital-signatures/'),
  createDigitalSignature: (formData) => api.post('digital-signatures/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateDigitalSignature: (id, formData) => api.patch(`digital-signatures/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  saveDigitalSignature: (data) => api.patch('digital-signature/', data),

  // --- PAYMENT & HOSTING ---
  savePayment: (data) => api.patch('payment-setup/', data),
  saveHosting: (data) => api.patch('hosting/', data),
};

export default companyIntakeService;
