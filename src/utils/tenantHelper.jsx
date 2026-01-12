// src/utils/tenantHelper.js

export const getTenant = () => {
  const hostname = window.location.hostname; // e.g., "netflix-6543.lvh.me"

  // 1. Check if we are on the Public Landing Page
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return {
      type: 'public',
      name: 'Public',
      apiUrl: 'http://localhost:8000'
    };
  }

  // 2. We are on a Tenant Domain
  // We extract the subdomain "netflix-6543" just in case we need it
  const parts = hostname.split('.');
  const tenantName = parts[0]; 

  return {
    type: 'tenant',
    name: tenantName,
    // IMPORTANT: The API lives on the SAME domain, just port 8000
    apiUrl: `http://${hostname}:8000` 
  };
};