import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientService } from '../services/clientService';

// ==========================================
// 1. EXISTING THUNKS (Clients)
// ==========================================

export const fetchClients = createAsyncThunk(
  'client/fetchClients',
  async (params, { rejectWithValue }) => {
    try {
      const response = await clientService.getClients(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'client/fetchClientById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await clientService.getClientById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createClient = createAsyncThunk(
  'client/createClient',
  async (data, { rejectWithValue }) => {
    try {
      const response = await clientService.createClient(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateClient = createAsyncThunk(
  'client/updateClient',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await clientService.updateClient(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'client/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      await clientService.deleteClient(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==========================================
// 2. WORK LOCATIONS THUNKS
// ==========================================

export const fetchWorkLocations = createAsyncThunk(
  'client/fetchWorkLocations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await clientService.getWorkLocations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createWorkLocation = createAsyncThunk(
  'client/createWorkLocation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await clientService.createWorkLocation(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteWorkLocation = createAsyncThunk(
  'client/deleteWorkLocation',
  async (id, { rejectWithValue }) => {
    try {
      await clientService.deleteWorkLocation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==========================================
// 3. ✅ NEW: CONTRACT DOCUMENTS THUNKS
// ==========================================

export const fetchContractDocuments = createAsyncThunk(
  'client/fetchContractDocuments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await clientService.getContractDocuments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createContractDocument = createAsyncThunk(
  'client/createContractDocument',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await clientService.createContractDocument(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteContractDocument = createAsyncThunk(
  'client/deleteContractDocument',
  async (id, { rejectWithValue }) => {
    try {
      await clientService.deleteContractDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// ==========================================
// 4. SLICE DEFINITION
// ==========================================

const clientSlice = createSlice({
  name: 'client',
  initialState: {
    clients: [],
    currentClient: null,
    
    // Helper Lists
    workLocations: [], 
    contractDocuments: [], // ✅ NEW
    
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
    setCurrentClient: (state, action) => { state.currentClient = action.payload; },
    clearCurrentClient: (state) => { state.currentClient = null; },
    setPage: (state, action) => { state.pagination.currentPage = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Clients ---
      .addCase(fetchClients.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.results || action.payload;
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
      .addCase(fetchClients.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // --- Fetch Client By ID (Includes Employees & Contracts) ---
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClient = action.payload;
        
        // Populate helper lists if they exist in the response
        if (action.payload.work_locations) state.workLocations = action.payload.work_locations;
        if (action.payload.contract_documents) state.contractDocuments = action.payload.contract_documents;
      })
      
      // --- CRUD Client ---
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Client created successfully!';
        state.clients.unshift(action.payload);
        state.pagination.count += 1;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Client updated successfully!';
        const index = state.clients.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.clients[index] = action.payload;
        if (state.currentClient?.id === action.payload.id) state.currentClient = action.payload;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Client deleted successfully!';
        state.clients = state.clients.filter(c => c.id !== action.payload);
        state.currentClient = null;
        if (state.pagination.count > 0) state.pagination.count -= 1;
      })

      // --- Work Location Handlers ---
      .addCase(fetchWorkLocations.fulfilled, (state, action) => {
        state.workLocations = action.payload.results || action.payload;
      })
      .addCase(createWorkLocation.fulfilled, (state, action) => {
        state.workLocations.push(action.payload);
        if (state.currentClient && state.currentClient.id === action.payload.client) {
             if (!state.currentClient.work_locations) state.currentClient.work_locations = [];
             state.currentClient.work_locations.push(action.payload);
        }
      })
      .addCase(deleteWorkLocation.fulfilled, (state, action) => {
        state.workLocations = state.workLocations.filter(loc => loc.id !== action.payload);
        if (state.currentClient && state.currentClient.work_locations) {
            state.currentClient.work_locations = state.currentClient.work_locations.filter(loc => loc.id !== action.payload);
        }
      })

      // --- ✅ NEW: Contract Document Handlers ---
      .addCase(fetchContractDocuments.fulfilled, (state, action) => {
        state.contractDocuments = action.payload.results || action.payload;
      })
      .addCase(createContractDocument.fulfilled, (state, action) => {
        state.contractDocuments.push(action.payload);
        // Update Current Client view instantly
        if (state.currentClient && state.currentClient.id === Number(action.payload.client)) {
             if (!state.currentClient.contract_documents) state.currentClient.contract_documents = [];
             state.currentClient.contract_documents.push(action.payload);
        }
        state.success = "Contract uploaded successfully!";
      })
      .addCase(deleteContractDocument.fulfilled, (state, action) => {
        state.contractDocuments = state.contractDocuments.filter(doc => doc.id !== action.payload);
        if (state.currentClient && state.currentClient.contract_documents) {
            state.currentClient.contract_documents = state.currentClient.contract_documents.filter(doc => doc.id !== action.payload);
        }
        state.success = "Contract deleted successfully!";
      });
  },
});

export const { clearError, clearSuccess, setCurrentClient, clearCurrentClient, setPage } = clientSlice.actions;
export default clientSlice.reducer;