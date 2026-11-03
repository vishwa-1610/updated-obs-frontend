// src/apiConfig.js

export const getBackendUrl = () => {
  const hostname = window.location.hostname; // e.g., "netflix-6543.lvh.me"
  const protocol = window.location.protocol; // "http:" or "https:"
  
  // 1. DEFINE YOUR PUBLIC ROOTS
  const publicDomains = [
    'localhost',
    '127.0.0.1',
    'secureobs.tiswatech.com',
    'www.secureobs.tiswatech.com'
  ];

  // 2. CHECK IF WE ARE PUBLIC (or apex IP/nip.io without tenant subdomain)
  const isApexIpOrNip = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?:\.nip\.io)?$/.test(hostname);
  if (publicDomains.includes(hostname) || isApexIpOrNip) {
    return `${protocol}//${hostname}:8000`;
  }

  // 3. WE ARE A TENANT (e.g. netflix-6543.lvh.me or techinnovatorsinc-6789.192.168.31.160.nip.io)
  if (import.meta.env.DEV || hostname.includes('nip.io') || hostname.includes('lvh.me')) {
    return `${protocol}//${hostname}:8000`;
  } else {
    return `${protocol}//${hostname}`;
  }
};
