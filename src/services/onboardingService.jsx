import api from './api';

const onboardingService = {
  // Candidate Lifecycle
  getAllOnboardings: () => api.get('/all-onboardings/'),
  getPendingOnboardings: () => api.get('/pending-onboarding/'),
  getInProgressOnboardings: () => api.get('/inprogress-onboarding/'),
  getConfirmedOnboardings: () => api.get('/confirmed-onboarding/'),
  getOnboardingDetail: (id) => api.get(`/onboarding/${id}/`),
  createOnboarding: (data) => api.post('/onboarding/', data),
  updateOnboarding: (id, data) => api.put(`/onboarding/${id}/`, data),
  deleteOnboarding: (id) => api.delete(`/onboarding/${id}/`),

  // Actions
  remindOnboarding: (id) => api.post(`/onboarding/${id}/remind/`),
  regretOnboarding: (id) => api.post(`/${id}/regret/`),
  terminateOnboarding: (id, data) => api.post(`/${id}/terminate/`, data || {}),
  convertToEmployee: (id, data) => api.post(`/onboarding/${id}/convert-to-employee/`, data || {}),

  // Form I-9 & Employer Verification
  getI9Detail: (id) => api.get(`/onboarding/${id}/i9/`),
  submitI9EmployerVerify: (id, data) => api.post(`/i9/${id}/employer-verify/`, data),
  submitI9EmployerVerifyDirect: (data) => api.post('/i9/employer-verify/', data),

  // USCIS E-Verify & Background Screening
  getEVerifyCase: (id) => api.get(`/onboarding/${id}/everify/`),
  submitEVerifyCase: (id, data) => api.post(`/onboarding/${id}/everify/submit/`, data || {}),
  closeEVerifyCase: (caseId, data) => api.post(`/everify/cases/${caseId}/close/`, data),
  getBackgroundChecks: (id) => api.get(`/onboarding/${id}/background-checks/`),
  triggerBackgroundCheck: (id, data) => api.post(`/onboarding/${id}/background-checks/`, data || {}),

  // Benefit Plans
  getBenefitPlans: () => api.get('/benefits/plans/'),
  createBenefitPlan: (data) => api.post('/benefits/plans/', data),
  updateBenefitPlan: (id, data) => api.put(`/benefits/plans/${id}/`, data),
  deleteBenefitPlan: (id) => api.delete(`/benefits/plans/${id}/`),
  getCandidateBenefits: (id) => api.get(`/onboarding/${id}/benefits/`),

  // Company Policies & Handbook
  getCompanyPolicies: () => api.get('/policies/'),
  createCompanyPolicy: (data) => api.post('/policies/', data),
  updateCompanyPolicy: (id, data) => api.put(`/policies/${id}/`, data),
  deleteCompanyPolicy: (id) => api.delete(`/policies/${id}/`),
  getCandidatePolicies: (id) => api.get(`/onboarding/${id}/policies/`),

  // Document Expirations & Reverification Radar
  getDocumentExpirations: () => api.get('/compliance/expirations/'),
  scanDocumentExpirations: () => api.post('/compliance/expirations/scan/'),

  // Payroll CSV Export & Bulk Import
  exportPayrollCsv: (provider = 'ADP') =>
    api.get(`/onboarding/export/payroll/?provider=${provider}`, { responseType: 'blob' }),
  bulkImportCandidates: (formData) =>
    api.post('/onboarding/bulk-import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export { onboardingService };
export default onboardingService;
