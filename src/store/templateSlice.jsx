import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { templateService } from '../services/templateService';

// 1. Core CRUD Thunks
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

export const fetchTemplateById = createAsyncThunk(
  'template/fetchTemplateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await templateService.getTemplateById(id);
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

// 2. Preset Library Thunks
export const fetchPresets = createAsyncThunk(
  'template/fetchPresets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await templateService.getPresets();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clonePreset = createAsyncThunk(
  'template/clonePreset',
  async (presetKey, { rejectWithValue }) => {
    try {
      const response = await templateService.clonePreset(presetKey);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 3. Live Preview & Merge Tag Context Thunk
export const fetchPreview = createAsyncThunk(
  'template/fetchPreview',
  async ({ id, context = {} }, { rejectWithValue }) => {
    try {
      const response = await templateService.previewTemplate(id, context);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 4. Send Test Email Thunk
export const sendTestEmail = createAsyncThunk(
  'template/sendTestEmail',
  async ({ id, recipient_email, context = {} }, { rejectWithValue }) => {
    try {
      const response = await templateService.sendTestEmail(id, { recipient_email, context });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial State
const initialState = {
  templates: [],
  presets: [],
  currentTemplate: null,
  previewData: null,
  loading: false,
  actionLoading: false,
  previewLoading: false,
  error: null,
  success: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
  },
};

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    clearPreviewData: (state) => {
      state.previewData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Templates
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.templates = action.payload;
          state.pagination.count = action.payload.length;
        } else if (action.payload && action.payload.results) {
          state.templates = action.payload.results;
          state.pagination.count = action.payload.count || 0;
          state.pagination.next = action.payload.next;
          state.pagination.previous = action.payload.previous;
          state.pagination.totalPages = Math.ceil((action.payload.count || 0) / 10) || 1;
        } else {
          state.templates = [];
        }
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Template
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.currentTemplate = action.payload;
      })

      // Create Template
      .addCase(createTemplate.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.actionLoading = false;
        const newTemp = action.payload.template || action.payload;
        state.templates.unshift(newTemp);
        state.success = 'Template created successfully!';
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update Template
      .addCase(updateTemplate.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.template || action.payload;
        const index = state.templates.findIndex((t) => t.id === updated.id);
        if (index !== -1) {
          state.templates[index] = updated;
        }
        if (state.currentTemplate && state.currentTemplate.id === updated.id) {
          state.currentTemplate = updated;
        }
        state.success = 'Template updated successfully!';
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete Template
      .addCase(deleteTemplate.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.templates = state.templates.filter((t) => t.id !== action.payload);
        state.success = 'Template removed successfully.';
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Presets
      .addCase(fetchPresets.fulfilled, (state, action) => {
        state.presets = action.payload.presets || action.payload || [];
      })
      .addCase(clonePreset.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(clonePreset.fulfilled, (state, action) => {
        state.actionLoading = false;
        const cloned = action.payload.template;
        if (cloned) {
          state.templates.unshift(cloned);
        }
        state.success = action.payload.message || 'Blueprint cloned successfully!';
      })
      .addCase(clonePreset.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Live Preview
      .addCase(fetchPreview.pending, (state) => {
        state.previewLoading = true;
      })
      .addCase(fetchPreview.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.previewData = action.payload;
      })
      .addCase(fetchPreview.rejected, (state, action) => {
        state.previewLoading = false;
        state.error = action.payload;
      })

      // Send Test Email
      .addCase(sendTestEmail.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(sendTestEmail.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = action.payload.message || 'Test email dispatched successfully!';
      })
      .addCase(sendTestEmail.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentTemplate,
  clearCurrentTemplate,
  clearPreviewData,
} = templateSlice.actions;

export default templateSlice.reducer;
