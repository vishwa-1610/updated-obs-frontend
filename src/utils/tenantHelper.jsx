// src/utils/tenantHelper.js

export const getTenant = () => {
  const hostname = window.location.hostname; // e.g., "netflix-6543.lvh.me" or "192.168.31.160"

  const isApexIpOrNip = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?:\.nip\.io)?$/.test(hostname);

  // 1. Check if we are on the Public Landing Page
  if (hostname === 'localhost' || hostname === '127.0.0.1' || isApexIpOrNip) {
    return {
      type: 'public',
      name: 'Public',
      apiUrl: `http://${hostname}:8000`
    };
  }

  // 2. We are on a Tenant Domain (e.g. techinnovatorsinc-6789.lvh.me or techinnovatorsinc-6789.192.168.31.160.nip.io)
  const parts = hostname.split('.');
  const tenantName = parts[0]; 

  return {
    type: 'tenant',
    name: tenantName,
    apiUrl: `http://${hostname}:8000` 
  };
};
