import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientService } from '../services/clientService';

// 1. Clients
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

// 2. Contracts & SOWs
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

// 3. Rate Cards
export const fetchRateCards = createAsyncThunk(
  'client/fetchRateCards',
  async (params, { rejectWithValue }) => {
    try {
      const response = await clientService.getRateCards(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createRateCard = createAsyncThunk(
  'client/createRateCard',
  async (data, { rejectWithValue }) => {
    try {
      const response = await clientService.createRateCard(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteRateCard = createAsyncThunk(
  'client/deleteRateCard',
  async (id, { rejectWithValue }) => {
    try {
      await clientService.deleteRateCard(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 4. Contacts & Locations & Verifications
export const fetchClientContacts = createAsyncThunk(
  'client/fetchClientContacts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await clientService.getClientContacts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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

export const fetchClientVerifications = createAsyncThunk(
  'client/fetchClientVerifications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await clientService.getClientVerifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  clients: [],
  contracts: [],
  rateCards: [],
  contacts: [],
  workLocations: [],
  verifications: [],
  currentClient: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    count: 0,
    totalPages: 1,
    currentPage: 1,
  }
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentClient: (state, action) => {
      state.currentClient = action.payload;
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.results) {
          state.clients = action.payload.results;
          state.pagination.count = action.payload.count || action.payload.results.length;
        } else {
          state.clients = Array.isArray(action.payload) ? action.payload : [];
          state.pagination.count = state.clients.length;
        }
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.currentClient = action.payload;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.unshift(action.payload);
        state.success = 'Client account registered successfully!';
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        state.currentClient = action.payload;
        state.success = 'Client account details updated!';
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(c => c.id !== action.payload);
        state.success = 'Client account removed.';
      })
      // Contracts
      .addCase(fetchContractDocuments.fulfilled, (state, action) => {
        state.contracts = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(createContractDocument.fulfilled, (state, action) => {
        state.contracts.unshift(action.payload);
        state.success = 'Contract agreement / SOW uploaded!';
      })
      .addCase(deleteContractDocument.fulfilled, (state, action) => {
        state.contracts = state.contracts.filter(c => c.id !== action.payload);
      })
      // Rate Cards
      .addCase(fetchRateCards.fulfilled, (state, action) => {
        state.rateCards = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(createRateCard.fulfilled, (state, action) => {
        state.rateCards.unshift(action.payload);
        state.success = 'Client bill rate card added!';
      })
      .addCase(deleteRateCard.fulfilled, (state, action) => {
        state.rateCards = state.rateCards.filter(r => r.id !== action.payload);
      })
      // Contacts & Locations & Verifications
      .addCase(fetchClientContacts.fulfilled, (state, action) => {
        state.contacts = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(fetchWorkLocations.fulfilled, (state, action) => {
        state.workLocations = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(fetchClientVerifications.fulfilled, (state, action) => {
        state.verifications = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      });
  }
});

export const {
  clearError,
  clearSuccess,
  setCurrentClient,
  clearCurrentClient,
  setPage
} = clientSlice.actions;

export default clientSlice.reducer;
