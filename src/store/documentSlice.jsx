import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import documentService from '../services/documentService';

export const fetchCompanyDocuments = createAsyncThunk(
  'documents/fetchCompanyDocuments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await documentService.getCompanyDocuments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCompanyDocument = createAsyncThunk(
  'documents/createCompanyDocument',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await documentService.createCompanyDocument(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCompanyDocument = createAsyncThunk(
  'documents/deleteCompanyDocument',
  async (id, { rejectWithValue }) => {
    try {
      await documentService.deleteCompanyDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFilledDocuments = createAsyncThunk(
  'documents/fetchFilledDocuments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await documentService.getFilledDocuments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEnvelopes = createAsyncThunk(
  'documents/fetchEnvelopes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await documentService.getEnvelopes(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createEnvelope = createAsyncThunk(
  'documents/createEnvelope',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await documentService.createEnvelope(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAuditTrails = createAsyncThunk(
  'documents/fetchAuditTrails',
  async (params, { rejectWithValue }) => {
    try {
      const response = await documentService.getAuditTrails(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  companyDocuments: [],
  filledDocuments: [],
  envelopes: [],
  auditTrails: [],
  selectedDocument: null,
  selectedEnvelope: null,
  selectedAudit: null,
  verificationResult: null,
  loading: false,
  error: null,
  successMessage: null
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setSelectedDocument: (state, action) => {
      state.selectedDocument = action.payload;
    },
    setSelectedEnvelope: (state, action) => {
      state.selectedEnvelope = action.payload;
    },
    setSelectedAudit: (state, action) => {
      state.selectedAudit = action.payload;
    },
    setVerificationResult: (state, action) => {
      state.verificationResult = action.payload;
    },
    clearVerificationResult: (state) => {
      state.verificationResult = null;
    },
    clearDocumentError: (state) => {
      state.error = null;
    },
    clearDocumentSuccess: (state) => {
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Company Docs
      .addCase(fetchCompanyDocuments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCompanyDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.companyDocuments = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(fetchCompanyDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCompanyDocument.fulfilled, (state, action) => {
        state.companyDocuments.unshift(action.payload);
        state.successMessage = 'Document uploaded to repository successfully!';
      })
      .addCase(deleteCompanyDocument.fulfilled, (state, action) => {
        state.companyDocuments = state.companyDocuments.filter(d => d.id !== action.payload);
        state.successMessage = 'Document deleted from repository.';
      })
      // Filled Docs
      .addCase(fetchFilledDocuments.fulfilled, (state, action) => {
        state.filledDocuments = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      // Envelopes
      .addCase(fetchEnvelopes.fulfilled, (state, action) => {
        state.envelopes = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(createEnvelope.fulfilled, (state, action) => {
        state.envelopes.unshift(action.payload);
        state.successMessage = 'Digital signature envelope dispatched!';
      })
      // Audit Trails
      .addCase(fetchAuditTrails.fulfilled, (state, action) => {
        state.auditTrails = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      });
  }
});

export const {
  setSelectedDocument,
  setSelectedEnvelope,
  setSelectedAudit,
  setVerificationResult,
  clearVerificationResult,
  clearDocumentError,
  clearDocumentSuccess
} = documentSlice.actions;

export default documentSlice.reducer;
