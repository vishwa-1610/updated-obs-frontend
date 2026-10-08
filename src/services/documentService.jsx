import api from './api';

const documentService = {
  // Company Documents & Policy Repository
  getCompanyDocuments: (params) => api.get('/company-documents/', { params }),
  getCompanyDocumentDetail: (id) => api.get(`/company-documents/${id}/`),
  createCompanyDocument: (formData) => 
    api.post('/company-documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateCompanyDocument: (id, formData) =>
    api.put(`/company-documents/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteCompanyDocument: (id) => api.delete(`/company-documents/${id}/`),

  // Filled Employee Tax & Onboarding Documents
  getFilledDocuments: (params) => api.get('/filled-documents/', { params }),

  // Digital Signature Envelopes (DocuSign Parity)
  getEnvelopes: (params) => api.get('/envelopes/', { params }),
  getEnvelopeDetail: (envelopeId) => api.get(`/envelopes/${envelopeId}/`),
  createEnvelope: (formData) =>
    api.post('/envelopes/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateEnvelope: (envelopeId, data) => api.put(`/envelopes/${envelopeId}/`, data),

  // ESIGN & UETA Audit Trails
  getAuditTrails: (params) => api.get('/audit-trail/', { params }),
  getAuditTrailDetail: (id) => api.get(`/audit-trail/${id}/`),
  downloadCertificate: (id) =>
    api.get(`/audit-trail/${id}/certificate/`, { responseType: 'blob' }),
  getOnboardingSignatureAudits: (onboardingId) =>
    api.get(`/onboarding/${onboardingId}/signature-audits/`),

  // Cryptographic SHA-256 Tamper Verification
  verifyDocumentSignature: (data) => api.post('/verify-signature/', data),

  // Letter & Agreement PDF Generators
  generateOfferLetter: (data) =>
    api.post('/generate-offer-letter/', data, { responseType: 'blob' }),
  generateEmployeeAgreement: (data) =>
    api.post('/generate-employee-agreement/', data, { responseType: 'blob' }),
  generateCompanyLetter: (data) =>
    api.post('/generate-letter/', data, { responseType: 'blob' })
};

export default documentService;

export { documentService };
