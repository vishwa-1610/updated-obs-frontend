import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { onboardingService } from '../services/onboardingService';

// =================================================================
// 1. ASYNC THUNKS
// =================================================================

// --- A. Fetch Notifications (For Navbar Bell) ---
// This always fetches Pending & In Progress items, independent of the current view.
export const fetchNotifications = createAsyncThunk(
  'onboarding/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // Re-use the pending endpoint but force no search param to get all actionable items
      const response = await onboardingService.getPendingOnboardings({ search: '' });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- B. Fetch Table Data (For Main Page) ---
// Handles switching between tabs
export const fetchOnboardings = createAsyncThunk(
  'onboarding/fetchOnboardings',
  async ({ tab, params }, { rejectWithValue }) => {
    try {
      let response;
      if (tab === 'pending') {
        response = await onboardingService.getPendingOnboardings(params);
      } else if (tab === 'confirmed') {
        response = await onboardingService.getConfirmedOnboardings(params);
      } else if (tab === 'inprogress') {
        response = await onboardingService.getInProgressOnboardings(params);
      } else {
        // Fallback or 'all'
        response = await onboardingService.getOnboardings(params);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- C. CRUD Operations ---

export const createOnboarding = createAsyncThunk(
  'onboarding/createOnboarding',
  async (data, { rejectWithValue }) => {
    try {
      const response = await onboardingService.createOnboarding(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOnboarding = createAsyncThunk(
  'onboarding/updateOnboarding',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await onboardingService.updateOnboarding(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteOnboarding = createAsyncThunk(
  'onboarding/deleteOnboarding',
  async (id, { rejectWithValue }) => {
    try {
      await onboardingService.deleteOnboarding(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- D. Bank Details ---

export const fetchBankDetails = createAsyncThunk(
  'onboarding/fetchBankDetails',
  async (onboardingId, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getBankDetails(onboardingId);
      return response.data.bank_accounts; 
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- E. Reminders ---

export const remindOnboarding = createAsyncThunk(
  'onboarding/remindOnboarding',
  async (id, { rejectWithValue }) => {
    try {
      const response = await onboardingService.remindOnboarding(id);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =================================================================
// 2. SLICE DEFINITION
// =================================================================

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
    // Main Data
    onboardings: [],      // Data for the Table
    notifications: [],    // Data for the Navbar Bell (Pending/In Progress only)
    currentOnboarding: null,
    
    // UI States
    loading: false,
    error: null,
    success: null,
    
    // Pagination
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
      pageSize: 10,
    },

    // Sub-data
    bankDetails: [],
    bankLoading: false,
  },
  
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = null; },
    setCurrentOnboarding: (state, action) => { state.currentOnboarding = action.payload; },
    clearCurrentOnboarding: (state) => { state.currentOnboarding = null; },
    setPage: (state, action) => { state.pagination.currentPage = action.payload; },
    clearBankDetails: (state) => { state.bankDetails = []; },
  },

  extraReducers: (builder) => {
    builder
      // --- 1. Fetch Onboardings (Table) ---
      .addCase(fetchOnboardings.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
        state.onboardings = []; // Clear table to prevent stale data flash
      })
      .addCase(fetchOnboardings.fulfilled, (state, action) => {
        state.loading = false;
        // Handle DRF Pagination ({ count: ..., results: [] }) vs Flat Array
        const results = action.payload.results || action.payload;
        state.onboardings = results;
        
        if (action.payload.count !== undefined) {
          state.pagination = {
            ...state.pagination,
            count: action.payload.count,
            next: action.payload.next,
            previous: action.payload.previous,
          };
        }
      })
      .addCase(fetchOnboardings.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      })

      // --- 2. Fetch Notifications (Navbar) ---
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const results = action.payload.results || action.payload;
        // Strictly filter to ensure only actionable items appear in dropdown
        state.notifications = results.filter(o => 
            ['Pending', 'PENDING', 'IN_PROGRESS', 'In Progress', 'False', false].includes(o.status)
        );
      })

      // --- 3. Create ---
      .addCase(createOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Onboarding initiated successfully!';
        // Add to main list
        state.onboardings.unshift(action.payload);
        state.pagination.count += 1;
        // Add to notifications list immediately
        state.notifications.unshift(action.payload);
      })

      // --- 4. Update ---
      .addCase(updateOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Onboarding updated successfully!';
        
        // Update in main list
        const index = state.onboardings.findIndex(o => o.id === action.payload.id);
        if (index !== -1) state.onboardings[index] = action.payload;
        
        // Update in notifications list
        const notifIndex = state.notifications.findIndex(o => o.id === action.payload.id);
        if (notifIndex !== -1) state.notifications[notifIndex] = action.payload;

        if (state.currentOnboarding?.id === action.payload.id) state.currentOnboarding = action.payload;
      })

      // --- 5. Delete ---
      .addCase(deleteOnboarding.fulfilled, (state, action) => {
        state.success = 'Onboarding deleted successfully!';
        // Remove from both lists
        state.onboardings = state.onboardings.filter(o => o.id !== action.payload);
        state.notifications = state.notifications.filter(o => o.id !== action.payload);
        
        if(state.pagination.count > 0) state.pagination.count -= 1;
        state.currentOnboarding = null;
      })

      // --- 6. Bank Details ---
      .addCase(fetchBankDetails.pending, (state) => { state.bankLoading = true; })
      .addCase(fetchBankDetails.fulfilled, (state, action) => {
        state.bankLoading = false;
        state.bankDetails = action.payload;
      })
      .addCase(fetchBankDetails.rejected, (state, action) => {
        state.bankLoading = false;
      })

      // --- 7. Reminders ---
      .addCase(remindOnboarding.pending, (state) => { state.loading = true; })
      .addCase(remindOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Reminder sent successfully!';
      })
      .addCase(remindOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, clearSuccess, setCurrentOnboarding, 
  clearCurrentOnboarding, setPage, clearBankDetails 
} = onboardingSlice.actions;

export default onboardingSlice.reducer;