import api from './api';

export const onboardingService = {
  // --- 1. Tab-Based Fetching ---
  getOnboardings: (params) => api.get('/onboarding/', { params }),
  getPendingOnboardings: (params) => api.get('/pending-onboarding/', { params }),
  getConfirmedOnboardings: (params) => api.get('/confirmed-onboarding/', { params }),
  getInProgressOnboardings: (params) => api.get('/inprogress-onboarding/', { params }),

  // ✅ NEW: Master List (Returns everything)
  getAllOnboardings: (params) => api.get('/all-onboardings/', { params }),

  // --- 2. CRUD Operations ---
  getOnboardingById: (id) => api.get(`/onboarding/${id}/`),
  createOnboarding: (data) => api.post('/onboarding/', data),
  updateOnboarding: (id, data) => api.patch(`/onboarding/${id}/`, data),
  deleteOnboarding: (id) => api.delete(`/onboarding/${id}/`),

  // --- 3. Bank Details ---
  getBankDetails: (onboardingId) => 
    api.get('/bank-details/get/', { params: { onboarding_id: onboardingId } }),

  // --- 4. Actions (Reminders, Regret, Terminate) ---
  
  // Existing Reminder
  remindOnboarding: (id) => api.post(`/onboarding/${id}/remind/`),

  // ✅ NEW: Regret Action
  // Matches Python: path('<int:pk>/regret/', ...)
  // Usage: onboardingService.regretOnboarding(12, "Found another job")
  regretOnboarding: (id, reason) => api.post(`/${id}/regret/`, { reason }),

  // ✅ NEW: Terminate Action
  // Matches Python: path('<int:pk>/terminate/', ...)
  // Usage: onboardingService.terminateOnboarding(12, "Contract ended")
  terminateOnboarding: (id, reason) => api.post(`/${id}/terminate/`, { reason }),
};