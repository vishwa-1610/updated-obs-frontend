import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { templateService } from '../services/templateService';

// --- 1. EXISTING THUNKS (Restored) ---

export const fetchTemplates = createAsyncThunk(
  'template/fetchTemplates',
  async (params, { rejectWithValue }) => {
    try {
      const response = await templateService.getTemplates(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTemplate = createAsyncThunk(
  'template/createTemplate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await templateService.createTemplate(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'template/updateTemplate',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await templateService.updateTemplate(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'template/deleteTemplate',
  async (id, { rejectWithValue }) => {
    try {
      await templateService.deleteTemplate(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- 2. NEW PREVIEW THUNK (Added) ---

export const fetchPreview = createAsyncThunk(
  'template/fetchPreview',
  async (id, { rejectWithValue }) => {
    try {
      const response = await templateService.previewTemplate(id);
      return response.data; // Expecting { html_content: "..." }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- 3. SLICE DEFINITION ---

const templateSlice = createSlice({
  name: 'template',
  initialState: {
    templates: [],
    currentTemplate: null,
    previewHtml: null, // New state for preview
    loading: false,
    error: null,
    success: null,
    pagination: { count: 0, next: null, previous: null, currentPage: 1, totalPages: 1 },
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = null; },
    setCurrentTemplate: (state, action) => { state.currentTemplate = action.payload; },
    clearCurrentTemplate: (state) => { state.currentTemplate = null; },
    
    // New action to clear preview
    clearPreview: (state) => { state.previewHtml = null; } 
  },
  extraReducers: (builder) => {
    builder
      // Fetch Templates
      .addCase(fetchTemplates.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.results || action.payload;
        if (action.payload.count !== undefined) {
          state.pagination = {
            count: action.payload.count,
            next: action.payload.next,
            previous: action.payload.previous,
            currentPage: action.payload.current_page || 1,
            totalPages: Math.ceil(action.payload.count / 10),
          };
        }
      })
      .addCase(fetchTemplates.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Create Template
      .addCase(createTemplate.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Template created successfully!';
        state.templates.unshift(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Update Template
      .addCase(updateTemplate.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Template updated successfully!';
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.templates[index] = action.payload;
        if (state.currentTemplate?.id === action.payload.id) state.currentTemplate = action.payload;
      })
      .addCase(updateTemplate.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Delete Template
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.success = 'Template deleted successfully!';
        state.templates = state.templates.filter(t => t.id !== action.payload);
        state.currentTemplate = null;
      })

      // Fetch Preview (New)
      .addCase(fetchPreview.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
        state.previewHtml = null; 
      })
      .addCase(fetchPreview.fulfilled, (state, action) => {
        state.loading = false;
        // The API returns { template_name: "...", html_content: "..." }
        state.previewHtml = action.payload.html_content; 
      })
      .addCase(fetchPreview.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      });
  },
});

export const { clearError, clearSuccess, setCurrentTemplate, clearCurrentTemplate, clearPreview } = templateSlice.actions;
export default templateSlice.reducer;