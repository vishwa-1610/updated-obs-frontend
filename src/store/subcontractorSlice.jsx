import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subcontractorService } from '../services/subcontractorService';

// ==========================================
// 1. EXISTING THUNKS
// ==========================================

export const fetchSubcontractors = createAsyncThunk(
  'subcontractor/fetchSubcontractors',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.getSubcontractors(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSubcontractorById = createAsyncThunk(
  'subcontractor/fetchSubcontractorById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.getSubcontractorById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSubcontractor = createAsyncThunk(
  'subcontractor/createSubcontractor',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.createSubcontractor(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSubcontractor = createAsyncThunk(
  'subcontractor/updateSubcontractor',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.updateSubcontractor(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSubcontractor = createAsyncThunk(
  'subcontractor/deleteSubcontractor',
  async (id, { rejectWithValue }) => {
    try {
      await subcontractorService.deleteSubcontractor(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==========================================
// 2. ✅ NEW THUNKS (Work Locations)
// ==========================================

export const fetchWorkLocations = createAsyncThunk(
  'subcontractor/fetchWorkLocations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.getWorkLocations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createWorkLocation = createAsyncThunk(
  'subcontractor/createWorkLocation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.createWorkLocation(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteWorkLocation = createAsyncThunk(
  'subcontractor/deleteWorkLocation',
  async (id, { rejectWithValue }) => {
    try {
      await subcontractorService.deleteWorkLocation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==========================================
// 3. SLICE DEFINITION
// ==========================================

const subcontractorSlice = createSlice({
  name: 'subcontractor',
  initialState: {
    subcontractors: [],
    currentSubcontractor: null,
    
    // ✅ NEW STATE for Dropdowns
    workLocations: [], 
    
    loading: false,
    error: null,
    success: null,
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    },
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = null; },
    setCurrentSubcontractor: (state, action) => { state.currentSubcontractor = action.payload; },
    clearCurrentSubcontractor: (state) => { state.currentSubcontractor = null; },
    setPage: (state, action) => { state.pagination.currentPage = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSubcontractors.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSubcontractors.fulfilled, (state, action) => {
        state.loading = false;
        state.subcontractors = action.payload.results || action.payload;
        if (action.payload.count !== undefined) {
          state.pagination = {
            ...state.pagination,
            count: action.payload.count,
            next: action.payload.next,
            previous: action.payload.previous,
            totalPages: Math.ceil(action.payload.count / state.pagination.pageSize),
          };
        }
      })
      .addCase(fetchSubcontractors.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Fetch By ID
      .addCase(fetchSubcontractorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubcontractor = action.payload;
        // Populate locations if nested
        if (action.payload.work_locations) {
            state.workLocations = action.payload.work_locations;
        }
      })

      // Create
      .addCase(createSubcontractor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Subcontractor created successfully!';
        state.subcontractors.unshift(action.payload);
        state.pagination.count += 1;
      })
      
      // Update
      .addCase(updateSubcontractor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Subcontractor updated successfully!';
        const index = state.subcontractors.findIndex(sub => sub.id === action.payload.id);
        if (index !== -1) state.subcontractors[index] = action.payload;
        if (state.currentSubcontractor?.id === action.payload.id) state.currentSubcontractor = action.payload;
      })
      
      // Delete
      .addCase(deleteSubcontractor.fulfilled, (state, action) => {
        state.success = 'Subcontractor deleted successfully!';
        state.subcontractors = state.subcontractors.filter(sub => sub.id !== action.payload);
        state.currentSubcontractor = null;
        if (state.pagination.count > 0) state.pagination.count -= 1;
      })

      // ✅ NEW: Work Location Handlers
      .addCase(fetchWorkLocations.fulfilled, (state, action) => {
        state.workLocations = action.payload.results || action.payload;
      })
      .addCase(createWorkLocation.fulfilled, (state, action) => {
        state.workLocations.push(action.payload);
        if (state.currentSubcontractor && state.currentSubcontractor.id === action.payload.subcontractor) {
             if (!state.currentSubcontractor.work_locations) state.currentSubcontractor.work_locations = [];
             state.currentSubcontractor.work_locations.push(action.payload);
        }
      })
      .addCase(deleteWorkLocation.fulfilled, (state, action) => {
        state.workLocations = state.workLocations.filter(loc => loc.id !== action.payload);
        if (state.currentSubcontractor && state.currentSubcontractor.work_locations) {
            state.currentSubcontractor.work_locations = state.currentSubcontractor.work_locations.filter(loc => loc.id !== action.payload);
        }
      });
  },
});

export const { clearError, clearSuccess, setCurrentSubcontractor, clearCurrentSubcontractor, setPage } = subcontractorSlice.actions;
export default subcontractorSlice.reducer;