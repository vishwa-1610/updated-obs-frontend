import api from '../api';

export const jobService = {
  // --- 1. ATS Stats & Analytics ---
  getStats: async () => {
    const response = await api.get('/jobs/stats/');
    return response.data;
  },

  // --- 2. Job Openings ---
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs/', { params });
    return response.data;
  },

  getJobDetail: async (id) => {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs/', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.patch(`/jobs/${id}/`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}/`);
    return response.data;
  },

  // --- 3. Candidate Applications ---
  getApplications: async (params = {}) => {
    const response = await api.get('/job-applications/', { params });
    return response.data;
  },

  getApplicationDetail: async (id) => {
    const response = await api.get(`/job-applications/${id}/`);
    return response.data;
  },

  createApplication: async (formData) => {
    const isMultipart = formData instanceof FormData;
    const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post('/job-applications/', formData, config);
    return response.data;
  },

  updateApplication: async (id, data) => {
    const isMultipart = data instanceof FormData;
    const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.patch(`/job-applications/${id}/`, data, config);
    return response.data;
  },

  deleteApplication: async (id) => {
    const response = await api.delete(`/job-applications/${id}/`);
    return response.data;
  },

  convertToOnboarding: async (id, payload = {}) => {
    const response = await api.post(`/job-applications/${id}/convert-to-onboarding/`, payload);
    return response.data;
  },

  // --- 4. Interview Schedules ---
  getInterviews: async (params = {}) => {
    const response = await api.get('/interviews/schedules/', { params });
    return response.data;
  },

  createInterview: async (interviewData) => {
    const response = await api.post('/interviews/schedules/', interviewData);
    return response.data;
  },

  updateInterview: async (id, data) => {
    const response = await api.patch(`/interviews/schedules/${id}/`, data);
    return response.data;
  },

  deleteInterview: async (id) => {
    const response = await api.delete(`/interviews/schedules/${id}/`);
    return response.data;
  }
};

export default jobService;
