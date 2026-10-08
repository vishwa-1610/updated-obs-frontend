// src/store/attendanceSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../services/attendanceService';

// ==========================================
// THUNKS
// ==========================================

// Settings
export const fetchSettings = createAsyncThunk('attendance/fetchSettings', async () => {
  const response = await attendanceService.getSettings();
  return response.data;
});

export const updateSettings = createAsyncThunk('attendance/updateSettings', async (data) => {
  const response = await attendanceService.updateSettings(data);
  return response.data;
});

// Holidays
export const fetchHolidays = createAsyncThunk('attendance/fetchHolidays', async () => {
  const response = await attendanceService.getHolidays();
  return response.data;
});

export const createHoliday = createAsyncThunk('attendance/createHoliday', async (data) => {
  const response = await attendanceService.createHoliday(data);
  return response.data;
});

export const deleteHoliday = createAsyncThunk('attendance/deleteHoliday', async (id) => {
  await attendanceService.deleteHoliday(id);
  return id;
});

// Punch
export const punchAction = createAsyncThunk('attendance/punchAction', 
  async (data, { rejectWithValue }) => {
    try {
      const response = await attendanceService.punchAction(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Leaves
export const fetchMyLeaves = createAsyncThunk('attendance/fetchMyLeaves', async (params) => {
  const response = await attendanceService.getMyLeaves(params);
  return response.data;
});

export const createLeaveRequest = createAsyncThunk('attendance/createLeaveRequest', 
  async (data, { rejectWithValue }) => {
    try {
      const response = await attendanceService.createLeaveRequest(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPendingLeaves = createAsyncThunk('attendance/fetchPendingLeaves', async (params) => {
  const response = await attendanceService.getMyLeaves({ status: 'Pending', ...params });
  return response.data;
});

export const approveRejectLeave = createAsyncThunk('attendance/approveRejectLeave', 
  async ({ id, data }) => {
    const response = await attendanceService.approveRejectLeave(id, data);
    return response.data;
  }
);

// History
export const fetchMyHistory = createAsyncThunk('attendance/fetchMyHistory', async (params) => {
  const response = await attendanceService.getMyHistory(params);
  return response.data;
});

// Reports
export const fetchMonthlyReport = createAsyncThunk('attendance/fetchMonthlyReport', async (params) => {
  const response = await attendanceService.getMonthlyReport(params);
  return response.data;
});

// ==========================================
// SLICE
// ==========================================
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    settings: null,
    holidays: [],
    todayRecord: null,
    punchStatus: null,
    punchMessage: '',
    hoursWorked: 0,
    myLeaves: [],
    pendingLeaves: [],
    attendanceHistory: [],
    reportData: [],
    reportMonth: null,
    reportYear: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearPunchStatus: (state) => {
      state.punchStatus = null;
      state.punchMessage = '';
    },
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = null; },
    setTodayRecord: (state, action) => {
      state.todayRecord = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Settings
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.success = 'Settings updated successfully';
      })
      
      // Holidays
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.holidays = action.payload.results || action.payload || [];
      })
      
      // Punch
      .addCase(punchAction.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(punchAction.fulfilled, (state, action) => {
        state.loading = false;
        state.punchStatus = action.payload.status;
        state.punchMessage = action.payload.message;
        state.hoursWorked = action.payload.hours_worked || 0;
        
        if (action.payload.record) {
          state.todayRecord = action.payload.record;
        }
      })
      .addCase(punchAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Punch action failed';
      })
      
      // My Leaves
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.myLeaves = action.payload.results || action.payload || [];
      })
      
      // History
      .addCase(fetchMyHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchMyHistory.fulfilled, (state, action) => {
        state.loading = false;
        const list = action.payload.results || action.payload || [];
        state.attendanceHistory = list;
        
        // Auto-extract today's attendance record
        const todayStr = new Date().toISOString().split('T')[0];
        const currentToday = list.find(r => r.date === todayStr);
        if (currentToday) {
          state.todayRecord = currentToday;
        } else if (list.length > 0 && !state.todayRecord) {
          // If no exact match today, default to most recent if matching today's local date
          const mostRecent = list[0];
          const recDate = new Date(mostRecent.date).toISOString().split('T')[0];
          if (recDate === todayStr) {
            state.todayRecord = mostRecent;
          }
        }
      })
      .addCase(fetchMyHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Reports
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.reportData = action.payload.data || action.payload || [];
      });
  },
});

export const { clearPunchStatus, clearError, clearSuccess, setTodayRecord } = attendanceSlice.actions;
export default attendanceSlice.reducer;
