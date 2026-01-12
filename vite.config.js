import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, 
    port: 5173,
    // --- ADD THIS BLOCK ---
    allowedHosts: [
      'netflix-6543.lvh.me', // Allow your specific tenant
      '.lvh.me',             // OR allow ALL lvh.me subdomains (Recommended)
      'localhost'
    ]
  }
})