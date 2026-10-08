import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../services/reportService';

// ==========================================
// 1. ASYNC THUNKS
// ==========================================

// Fetch the list of available reports (Catalog)
export const fetchCatalog = createAsyncThunk(
  'reports/fetchCatalog',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getCatalog(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Trigger a new report generation
export const generateReport = createAsyncThunk(
  'reports/generate',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await reportService.generateReport(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch history of generated reports
export const fetchHistory = createAsyncThunk(
  'reports/fetchHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Real-Time Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  'reports/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Toggle Favorite Status
export const toggleFavorite = createAsyncThunk(
  'reports/toggleFavorite',
  async (slug, { rejectWithValue }) => {
    try {
      await reportService.toggleFavorite(slug);
      return slug;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Executive BI Dashboard
export const fetchExecutiveDashboard = createAsyncThunk(
  'reports/fetchExecutiveDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getExecutiveDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Payroll Runs
export const fetchPayrollRuns = createAsyncThunk(
  'reports/fetchPayrollRuns',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getPayrollRuns(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Compliance Audit Logs
export const fetchAuditLogs = createAsyncThunk(
  'reports/fetchAuditLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportService.getAuditLogs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==========================================
// 2. SLICE DEFINITION
// ==========================================

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    catalog: [],       // List of report definitions
    history: [],       // List of past generated reports
    payrollRuns: [],   // Payroll calculation runs
    auditLogs: [],     // SOC-2 / HIPAA audit logs
    
    // Dashboard Stats State
    stats: {
      total_generated: 0,
      most_popular: 'N/A',
      most_popular_count: 0,
      unique_reports_run: 0,
      total_definitions: 0,
      chart_data: [],
      category_breakdown: [],
      top_reports_data: []
    },

    // Executive BI state
    executiveDashboard: null,

    // Immediate Result (for displaying table preview)
    currentReportResult: null, 
    
    loading: false,    // For fetching
    generating: false, // For generation button
    
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = null; },
    clearCurrentReport: (state) => { state.currentReportResult = null; },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Catalog ---
      .addCase(fetchCatalog.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.catalog = action.payload.results || action.payload || [];
      })
      .addCase(fetchCatalog.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      // --- Generate Report ---
      .addCase(generateReport.pending, (state) => { 
        state.generating = true; 
        state.error = null; 
        state.currentReportResult = null; 
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generating = false;
        state.success = 'Report generated successfully!';
        state.currentReportResult = action.payload;
        
        // Optimistic history insertion
        const historyItem = {
          id: Date.now(),
          report_name: action.payload.report_name || "New Report",
          requested_by_name: "Admin User",
          status: "COMPLETED",
          created_at: new Date().toISOString(),
          file_url: action.payload.download_url
        };
        state.history.unshift(historyItem);
      })
      .addCase(generateReport.rejected, (state, action) => { 
        state.generating = false; 
        state.error = action.payload?.error || action.payload?.detail || "Failed to generate report"; 
      })

      // --- Fetch History ---
      .addCase(fetchHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.results || action.payload || [];
      })
      .addCase(fetchHistory.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      // --- Fetch Stats ---
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // --- Executive Dashboard ---
      .addCase(fetchExecutiveDashboard.fulfilled, (state, action) => {
        state.executiveDashboard = action.payload;
      })

      // --- Payroll Runs ---
      .addCase(fetchPayrollRuns.fulfilled, (state, action) => {
        state.payrollRuns = action.payload.results || action.payload || [];
      })

      // --- Audit Logs ---
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload.results || action.payload || [];
      })

      // --- Toggle Favorite ---
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const slug = action.payload;
        const reportIndex = state.catalog.findIndex(r => r.slug === slug);
        if (reportIndex !== -1) {
          state.catalog[reportIndex].is_favorite = !state.catalog[reportIndex].is_favorite;
        }
      });
  },
});

export const { clearError, clearSuccess, clearCurrentReport } = reportSlice.actions;
export default reportSlice.reducer;
