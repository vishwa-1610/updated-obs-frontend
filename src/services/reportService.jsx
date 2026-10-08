import api from './api';

export const reportService = {
  // ==========================================
  // 1. REPORT CATALOG & BI GENERATOR
  // ==========================================
  getCatalog: (params) => api.get('/reports/catalog/', { params }),
  generateReport: (data) => api.post('/reports/generate/', data),
  getHistory: (params) => api.get('/reports/history/', { params }),
  getStats: (params) => api.get('/reports/stats/', { params }),
  toggleFavorite: (slug) => api.post('/reports/favorite/', { slug }),

  // ==========================================
  // 2. EXECUTIVE INTELLIGENCE & BI DASHBOARD
  // ==========================================
  getExecutiveDashboard: (params) => api.get('/reports/executive-dashboard/', { params }),
  getComplianceAuditSummary: () => api.get('/reports/security/compliance-audit/'),

  // ==========================================
  // 3. PAYROLL RUNS & AUTO-CALCULATION ENGINE
  // ==========================================
  getPayrollRuns: (params) => api.get('/reports/payroll/runs/', { params }),
  getPayrollRunDetail: (id) => api.get(`/reports/payroll/runs/${id}/`),
  createPayrollRun: (data) => api.post('/reports/payroll/runs/', data),
  updatePayrollRun: (id, data) => api.patch(`/reports/payroll/runs/${id}/`, data),
  deletePayrollRun: (id) => api.delete(`/reports/payroll/runs/${id}/`),
  
  calculatePayrollRun: (id) => api.post(`/reports/payroll/runs/${id}/calculate/`),
  approvePayrollRun: (id) => api.post(`/reports/payroll/runs/${id}/approve/`),
  
  // Exporters for major payroll systems
  exportPayrollRun: (id, format = 'csv') => {
    return api.get(`/reports/payroll/runs/${id}/export-${format}/`, {
      responseType: 'blob'
    });
  },

  // ==========================================
  // 4. COMPLIANCE AUDIT TRAIL (SOC-2 / HIPAA)
  // ==========================================
  getAuditLogs: (params) => api.get('/reports/audit-logs/', { params }),
  getAuditLogDetail: (id) => api.get(`/reports/audit-logs/${id}/`),

  // ==========================================
  // 5. EXPENSE AUDIT & REIMBURSEMENTS
  // ==========================================
  getExpenseReports: (params) => api.get('/reports/expenses/reports/', { params }),
  getExpenseItems: (params) => api.get('/reports/expenses/items/', { params }),
};

export default reportService;
