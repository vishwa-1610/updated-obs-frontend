// src/config.js

export const getApiUrl = () => {
  const currentHost = window.location.hostname; // e.g. "netflix-6543.lvh.me"
  const protocol = window.location.protocol;    // e.g. "http:"

  // List of domains that are "Public" (Landing Page)
  // If the user is here, we send them to the Main Backend.
  const publicDomains = ['localhost', '127.0.0.1', 'secureobs.tiswatech.com'];

  // 1. IF PUBLIC: Use the hardcoded .env URL
  if (publicDomains.includes(currentHost)) {
    return import.meta.env.VITE_BACKEND_URL; 
  }

  // 2. IF TENANT (Localhost Testing): 
  // We are on "netflix.lvh.me". We need to talk to "netflix.lvh.me:8000"
  if (import.meta.env.DEV) {
    return `${protocol}//${currentHost}:8000`;
  }

  // 3. IF TENANT (Production):
  // We are on "netflix.secureobs.com". The backend is on the same domain.
  return `${protocol}//${currentHost}`;
};