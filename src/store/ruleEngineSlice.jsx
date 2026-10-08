import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ruleEngineService } from '../services/ruleEngineService';

// Async Thunks
export const fetchDocuments = createAsyncThunk(
  'ruleEngine/fetchDocuments',
  async (params, { rejectWithValue }) => {
    try {
      const data = await ruleEngineService.getDocuments(params);
      return data.results ? data.results : data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchDocumentDetail = createAsyncThunk(
  'ruleEngine/fetchDocumentDetail',
  async (id, { rejectWithValue }) => {
    try {
      return await ruleEngineService.getDocumentDetail(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createDocument = createAsyncThunk(
  'ruleEngine/createDocument',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const data = await ruleEngineService.createDocument(formData);
      dispatch(fetchDocuments());
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateDocument = createAsyncThunk(
  'ruleEngine/updateDocument',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await ruleEngineService.updateDocument(id, data);
      dispatch(fetchDocuments());
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'ruleEngine/deleteDocument',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await ruleEngineService.deleteDocument(id);
      dispatch(fetchDocuments());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchFields = createAsyncThunk(
  'ruleEngine/fetchFields',
  async (docId, { rejectWithValue }) => {
    try {
      const data = await ruleEngineService.getFields(docId);
      return data.results ? data.results : data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createField = createAsyncThunk(
  'ruleEngine/createField',
  async (fieldData, { dispatch, rejectWithValue }) => {
    try {
      const res = await ruleEngineService.createField(fieldData);
      if (fieldData.document) {
        dispatch(fetchFields(fieldData.document));
        dispatch(fetchDocuments());
      }
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateField = createAsyncThunk(
  'ruleEngine/updateField',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await ruleEngineService.updateField(id, data);
      if (data.document) {
        dispatch(fetchFields(data.document));
        dispatch(fetchDocuments());
      }
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteField = createAsyncThunk(
  'ruleEngine/deleteField',
  async ({ id, docId }, { dispatch, rejectWithValue }) => {
    try {
      await ruleEngineService.deleteField(id);
      if (docId) {
        dispatch(fetchFields(docId));
        dispatch(fetchDocuments());
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchSignatures = createAsyncThunk(
  'ruleEngine/fetchSignatures',
  async (_, { rejectWithValue }) => {
    try {
      const data = await ruleEngineService.getSignatures();
      return data.results ? data.results : data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const testFillDocument = createAsyncThunk(
  'ruleEngine/testFillDocument',
  async ({ docId, payload }, { rejectWithValue }) => {
    try {
      return await ruleEngineService.testFillDocument(docId, payload);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const ruleEngineSlice = createSlice({
  name: 'ruleEngine',
  initialState: {
    documents: [],
    selectedDocument: null,
    fields: [],
    signatures: [],
    testFillResult: null,
    loading: false,
    generating: false,
    error: null,
    success: null,
  },
  reducers: {
    setSelectedDocument: (state, action) => {
      state.selectedDocument = action.payload;
    },
    clearTestFillResult: (state) => {
      state.testFillResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDocuments
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload || [];
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchDocumentDetail
      .addCase(fetchDocumentDetail.fulfilled, (state, action) => {
        state.selectedDocument = action.payload;
        if (action.payload?.fields) {
          state.fields = action.payload.fields;
        }
      })
      // fetchFields
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.fields = action.payload || [];
      })
      // fetchSignatures
      .addCase(fetchSignatures.fulfilled, (state, action) => {
        state.signatures = action.payload || [];
      })
      // testFillDocument
      .addCase(testFillDocument.pending, (state) => {
        state.generating = true;
      })
      .addCase(testFillDocument.fulfilled, (state, action) => {
        state.generating = false;
        state.testFillResult = action.payload;
      })
      .addCase(testFillDocument.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSelectedDocument, 
  clearTestFillResult, 
  clearError, 
  clearSuccess 
} = ruleEngineSlice.actions;

export default ruleEngineSlice.reducer;
