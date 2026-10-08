// src/services/attendanceService.jsx
import api from './api';

export const attendanceService = {
  // ==========================================
  // 1. ATTENDANCE SETTINGS & WORK LOCATIONS
  // ==========================================
  getSettings: () => api.get('/attendance/settings/'),
  updateSettings: (data) => api.patch('/attendance/settings/', data),

  getLocations: () => api.get('/attendance/locations/'),
  createLocation: (data) => api.post('/attendance/locations/', data),
  updateLocation: (id, data) => api.patch(`/attendance/locations/${id}/`, data),
  deleteLocation: (id) => api.delete(`/attendance/locations/${id}/`),

  // ==========================================
  // 2. HOLIDAY MANAGEMENT
  // ==========================================
  getHolidays: () => api.get('/attendance/holidays/'),
  createHoliday: (data) => api.post('/attendance/holidays/', data),
  deleteHoliday: (id) => api.delete(`/attendance/holidays/${id}/`),

  // ==========================================
  // 3. PUNCH IN/OUT & BREAKS (GEOFENCED)
  // ==========================================
  punchAction: (data) => api.post('/attendance/punch/', data),
  startBreak: (data) => api.post('/attendance/breaks/start/', data),
  endBreak: (id, data) => id ? api.post(`/attendance/breaks/${id}/end/`, data || {}) : api.post('/attendance/breaks/end/', data || {}),

  // ==========================================
  // 4. LIVE DASHBOARD & ATTENDANCE HISTORY
  // ==========================================
  getLiveDashboard: (params) => api.get('/attendance/live-dashboard/', { params }),
  getMyHistory: (params) => api.get('/attendance/history/', { params }),

  // ==========================================
  // 5. LEAVE MANAGEMENT & ACCRUALS
  // ==========================================
  getMyLeaves: (params) => api.get('/attendance/leave/my-requests/', { params }),
  createLeaveRequest: (data) => api.post('/attendance/leave/my-requests/', data),
  approveRejectLeave: (id, data) => api.patch(`/attendance/leave/action/${id}/`, data),

  getLeaveTypes: () => api.get('/attendance/leave-types/'),
  createLeaveType: (data) => api.post('/attendance/leave-types/', data),
  updateLeaveType: (id, data) => api.patch(`/attendance/leave-types/${id}/`, data),
  deleteLeaveType: (id) => api.delete(`/attendance/leave-types/${id}/`),

  getLeavePolicies: () => api.get('/attendance/leave-policies/'),
  createLeavePolicy: (data) => api.post('/attendance/leave-policies/', data),
  updateLeavePolicy: (id, data) => api.patch(`/attendance/leave-policies/${id}/`, data),

  getLeaveBalances: (params) => api.get('/attendance/leave-balances/', { params }),

  // ==========================================
  // 6. SHIFT SCHEDULING & ROSTERS
  // ==========================================
  getShifts: () => api.get('/attendance/shifts/'),
  createShift: (data) => api.post('/attendance/shifts/', data),
  updateShift: (id, data) => api.patch(`/attendance/shifts/${id}/`, data),
  deleteShift: (id) => api.delete(`/attendance/shifts/${id}/`),

  getRosters: (params) => api.get('/attendance/rosters/', { params }),
  createRoster: (data) => api.post('/attendance/rosters/', data),
  updateRoster: (id, data) => api.patch(`/attendance/rosters/${id}/`, data),
  deleteRoster: (id) => api.delete(`/attendance/rosters/${id}/`),
  generateWeeklyRoster: (data) => api.post('/attendance/rosters/generate-weekly/', data),

  getShiftSwaps: (params) => api.get('/attendance/shift-swaps/', { params }),
  createShiftSwap: (data) => api.post('/attendance/shift-swaps/', data),
  approveRejectShiftSwap: (id, data) => api.post(`/attendance/shift-swaps/${id}/action/`, data),

  getOpenShifts: (params) => api.get('/attendance/open-shifts/', { params }),
  createOpenShift: (data) => api.post('/attendance/open-shifts/', data),
  bidOpenShift: (openShiftId, data) => api.post('/attendance/shift-bids/', { open_shift: openShiftId, ...data }),
  getShiftBids: (params) => api.get('/attendance/shift-bids/', { params }),
  awardShiftBid: (id, data) => api.post(`/attendance/shift-bids/${id}/award/`, data || {}),

  // ==========================================
  // 7. TIMESHEETS
  // ==========================================
  getMyTimesheets: (params) => api.get('/attendance/timesheets/my-timesheets/', { params }),
  generateTimesheet: (data) => api.post('/attendance/timesheets/my-timesheets/', data),
  submitTimesheet: (id) => api.post(`/attendance/timesheets/my-timesheets/${id}/submit/`),
  getManagerTimesheets: (params) => api.get('/attendance/timesheets/manage/', { params }),
  approveRejectTimesheet: (id, data) => api.post(`/attendance/timesheets/manage/${id}/action/`, data),

  // ==========================================
  // 8. EMPLOYEE MONITORING & PRODUCTIVITY
  // ==========================================
  getMonitoringSettings: () => api.get('/attendance/monitoring/settings/'),
  updateMonitoringSettings: (data) => api.patch('/attendance/monitoring/settings/', data),

  sendHeartbeat: (data) => api.post('/attendance/monitoring/heartbeat/', data),
  getLiveTeamPresence: () => api.get('/attendance/monitoring/live-team/'),
  
  getProductivityRules: (params) => api.get('/attendance/monitoring/rules/', { params }),
  createProductivityRule: (data) => api.post('/attendance/monitoring/rules/', data),
  updateProductivityRule: (id, data) => api.patch(`/attendance/monitoring/rules/${id}/`, data),
  deleteProductivityRule: (id) => api.delete(`/attendance/monitoring/rules/${id}/`),

  getScreenshots: (params) => api.get('/attendance/monitoring/screenshots/', { params }),
  getProductivitySummary: (params) => api.get('/attendance/monitoring/analytics/summary/', { params }),

  // ==========================================
  // 9. REPORTS & ACTIVITIES
  // ==========================================
  getMonthlyReport: (params) => api.get('/attendance/report/monthly/', { params }),
  downloadReport: (params) => api.get('/attendance/report/monthly/', { params, responseType: 'blob' }),
  getActivityLogs: (params) => api.get('/attendance/activities/', { params }),
  createActivityLog: (data) => api.post('/attendance/activities/', data),
  deleteActivityLog: (id) => api.delete(`/attendance/activities/${id}/`),
};

export default attendanceService;
