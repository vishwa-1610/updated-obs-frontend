import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subcontractorService } from '../services/subcontractorService';

// 1. Subcontractors
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

// 2. Placements
export const fetchPlacements = createAsyncThunk(
  'subcontractor/fetchPlacements',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.getPlacements(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPlacement = createAsyncThunk(
  'subcontractor/createPlacement',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.createPlacement(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 3. Invoices
export const fetchInvoices = createAsyncThunk(
  'subcontractor/fetchInvoices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.getInvoices(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createInvoice = createAsyncThunk(
  'subcontractor/createInvoice',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.createInvoice(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 4. W-9 Forms
export const fetchW9Forms = createAsyncThunk(
  'subcontractor/fetchW9Forms',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.getW9Forms(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createW9Form = createAsyncThunk(
  'subcontractor/createW9Form',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.createW9Form(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 5. Contacts & Locations
export const fetchContacts = createAsyncThunk(
  'subcontractor/fetchContacts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subcontractorService.getContacts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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

const initialState = {
  subcontractors: [],
  placements: [],
  invoices: [],
  w9Forms: [],
  contacts: [],
  workLocations: [],
  currentSubcontractor: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    count: 0,
    totalPages: 1,
    currentPage: 1,
  }
};

const subcontractorSlice = createSlice({
  name: 'subcontractor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentSubcontractor: (state, action) => {
      state.currentSubcontractor = action.payload;
    },
    clearCurrentSubcontractor: (state) => {
      state.currentSubcontractor = null;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Subcontractors
      .addCase(fetchSubcontractors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcontractors.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.results) {
          state.subcontractors = action.payload.results;
          state.pagination.count = action.payload.count || action.payload.results.length;
        } else {
          state.subcontractors = Array.isArray(action.payload) ? action.payload : [];
          state.pagination.count = state.subcontractors.length;
        }
      })
      .addCase(fetchSubcontractors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubcontractorById.fulfilled, (state, action) => {
        state.currentSubcontractor = action.payload;
      })
      .addCase(createSubcontractor.fulfilled, (state, action) => {
        state.subcontractors.unshift(action.payload);
        state.success = 'Subcontractor registered successfully!';
      })
      .addCase(updateSubcontractor.fulfilled, (state, action) => {
        const index = state.subcontractors.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.subcontractors[index] = action.payload;
        }
        state.currentSubcontractor = action.payload;
        state.success = 'Subcontractor profile updated!';
      })
      .addCase(deleteSubcontractor.fulfilled, (state, action) => {
        state.subcontractors = state.subcontractors.filter(s => s.id !== action.payload);
        state.success = 'Subcontractor removed.';
      })
      // Placements
      .addCase(fetchPlacements.fulfilled, (state, action) => {
        state.placements = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(createPlacement.fulfilled, (state, action) => {
        state.placements.unshift(action.payload);
        state.success = '1099 Placement recorded successfully!';
      })
      // Invoices
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
        state.success = 'Vendor invoice submitted!';
      })
      // W-9
      .addCase(fetchW9Forms.fulfilled, (state, action) => {
        state.w9Forms = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(createW9Form.fulfilled, (state, action) => {
        state.w9Forms.unshift(action.payload);
        state.success = 'Form W-9 certified and registered!';
      })
      // Contacts & Locations
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contacts = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(fetchWorkLocations.fulfilled, (state, action) => {
        state.workLocations = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      });
  }
});

export const {
  clearError,
  clearSuccess,
  setCurrentSubcontractor,
  clearCurrentSubcontractor,
  setPage
} = subcontractorSlice.actions;

export default subcontractorSlice.reducer;
