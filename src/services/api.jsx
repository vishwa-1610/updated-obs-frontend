import axios from 'axios';

// 1. Dynamic Base URL (Smart detection)
const getBaseUrl = () => {
  const { hostname, protocol } = window.location;

  // ✅ CASE 1: Local Development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.lvh.me')) {
    return `${protocol}//${hostname}:8000/api/`; 
  }

  // ✅ CASE 2: Production Specific Fix
  // If the frontend is on 'obs.tiswatech.com', send API calls to 'secureobs.tiswatech.com'
  if (hostname.includes('obs.tiswatech.com')) {
      const backendHost = hostname.replace('obs.tiswatech.com', 'secureobs.tiswatech.com');
      return `https://${backendHost}/api/`; // ✅ Force HTTPS for backend
  }

  // ✅ CASE 3: Fallback (Standard behavior)
  return `${protocol}//${hostname}/api/`; 
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// ... (Keep your Interceptors exactly as they are) ...

// 2. REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access'); 
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    if (response.data && Array.isArray(response.data.results)) {
        console.log(`[API Fix] Unwrapping pagination for: ${response.config.url}`);
        response.data = response.data.results; 
    }
    return response;
  },
  async (error) => {
    // ... (Keep your refresh token logic here) ...
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const res = await axios.post(`${getBaseUrl()}users/token/refresh/`, { refresh: refreshToken });
          localStorage.setItem('access', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;