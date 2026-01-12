// src/apiConfig.js

export const getBackendUrl = () => {
  const hostname = window.location.hostname; // e.g., "netflix-6543.lvh.me"
  const protocol = window.location.protocol; // "http:" or "https:"
  
  // 1. DEFINE YOUR PUBLIC ROOTS
  // These are the domains that should hit the "Public" backend
  const publicDomains = [
    'localhost',
    '127.0.0.1',
    'secureobs.tiswatech.com',
    'www.secureobs.tiswatech.com'
  ];

  // 2. CHECK IF WE ARE PUBLIC
  if (publicDomains.includes(hostname)) {
    // Return the Public URL from your .env (as a fallback) or hardcoded
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  }

  // 3. WE ARE A TENANT (e.g. netflix-6543.lvh.me)
  // We need to construct the URL dynamically to match the browser's subdomain
  
  if (import.meta.env.DEV) {
    // DEVELOPMENT MODE (Localhost)
    // Browser is on port 3000, Backend is on port 8000
    // We keep the subdomain (netflix-6543.lvh.me) but force port 8000
    return `${protocol}//${hostname}:8000`;
  } else {
    // PRODUCTION MODE
    // Browser and Backend are on the same domain (https://netflix...)
    // So we just return the origin
    return `${protocol}//${hostname}`;
  }
};