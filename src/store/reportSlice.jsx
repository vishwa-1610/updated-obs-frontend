import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../services/reportService';

// ==========================================
// 1. ASYNC THUNKS
// ==========================================

// Fetch the list of available reports (Catalog)
export const fetchCatalog = createAsyncThunk(
  'reports/fetchCatalog',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getCatalog();
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
      return response.data; // Expected: { status: 'COMPLETED', download_url: '...', data: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch history of generated reports
export const fetchHistory = createAsyncThunk(
  'reports/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Real-Time Dashboard Stats (Charts & Scores)
export const fetchDashboardStats = createAsyncThunk(
  'reports/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ NEW: Toggle Favorite Status
export const toggleFavorite = createAsyncThunk(
  '/favorite/',
  async (slug, { rejectWithValue }) => {
    try {
      // We don't necessarily need the response data, just the successful signal
      await reportService.toggleFavorite(slug);
      return slug; // Return the slug so we know which item to update in the reducer
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

    // Immediate Result (for displaying table after generation)
    currentReportResult: null, 
    
    loading: false,    // For fetching catalog/history
    generating: false, // Specific loading state for generation button
    
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
        state.catalog = action.payload.results || action.payload;
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
        
        // Store the result data for immediate display
        state.currentReportResult = action.payload;
        
        // Add to history list immediately (Optimistic update)
        const historyItem = {
            id: Date.now(), // Temp ID until refresh
            report_name: action.payload.report_name || "New Report",
            requested_by_name: "Me", // Temporary
            status: "COMPLETED",
            created_at: new Date().toISOString(),
            file_url: action.payload.download_url
        };
        state.history.unshift(historyItem);
      })
      .addCase(generateReport.rejected, (state, action) => { 
        state.generating = false; 
        state.error = action.payload?.error || "Failed to generate report"; 
      })

      // --- Fetch History ---
      .addCase(fetchHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.results || action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      // --- Fetch Stats ---
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // --- ✅ NEW: Toggle Favorite ---
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const slug = action.payload;
        // Find the report in the catalog and flip its is_favorite status
        const reportIndex = state.catalog.findIndex(r => r.slug === slug);
        if (reportIndex !== -1) {
            state.catalog[reportIndex].is_favorite = !state.catalog[reportIndex].is_favorite;
        }
      });
  },
});

export const { clearError, clearSuccess, clearCurrentReport } = reportSlice.actions;
export default reportSlice.reducer;