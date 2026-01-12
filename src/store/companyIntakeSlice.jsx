import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companyIntakeService } from '../services/companyIntakeService';

// --- Async Thunks ---

// Screen 1: Register
export const registerCompany = createAsyncThunk(
  'companyIntake/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await companyIntakeService.registerCompany(data);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Screen 6: Fetch Workflow
export const fetchWorkflowSteps = createAsyncThunk(
  'companyIntake/fetchWorkflow',
  async (_, { rejectWithValue }) => {
    try {
      // Service now handles the array extraction logic
      const response = await companyIntakeService.getWorkflowSteps();
      return response.data; // This is now guaranteed to be an array inside the service wrapper
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Screen 6: Reorder Workflow
export const reorderWorkflowSteps = createAsyncThunk(
  'companyIntake/reorderWorkflow',
  async (orderList, { rejectWithValue }) => {
    try {
      const response = await companyIntakeService.reorderWorkflowSteps(orderList);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Screen 7: Upload Doc
export const uploadCompanyDoc = createAsyncThunk(
  'companyIntake/uploadDoc',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await companyIntakeService.uploadCompanyDocument(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Generic Thunk for SAVING/UPDATING steps
export const saveStepData = createAsyncThunk(
  'companyIntake/saveStep',
  async ({ stepName, data }, { rejectWithValue }) => {
    try {
      let response;
      switch (stepName) {
        case 'contacts': 
          response = await companyIntakeService.updateCompanyContacts(data); 
          break;
        case 'company_type': 
          response = await companyIntakeService.setCompanyType(data); 
          break;
        case 'signature': 
          response = await companyIntakeService.saveDigitalSignature(data); 
          break;
        case 'branding': 
          response = await companyIntakeService.saveBranding(data); 
          break;
        case 'hosting': 
          response = await companyIntakeService.saveHosting(data); 
          break;
        case 'payment': 
          response = await companyIntakeService.savePayment(data); 
          break;
        default: 
          throw new Error(`Invalid Step Name: ${stepName}`);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- Slice ---

const companyIntakeSlice = createSlice({
  name: 'companyIntake',
  initialState: {
    currentStep: 1,
    registeredUrl: null, 
    workflowSteps: [], // ✅ Always initialized as empty array
    companyDocs: [],   // ✅ Always initialized as empty array
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    nextStep: (state) => { state.currentStep += 1; },
    prevStep: (state) => { state.currentStep -= 1; },
    setStep: (state, action) => { state.currentStep = action.payload; },
    clearMessages: (state) => { state.error = null; state.success = null; },
    resetIntake: (state) => {
      state.currentStep = 1;
      state.registeredUrl = null;
      state.workflowSteps = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Register Company ---
      .addCase(registerCompany.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Company Registered! Please login to your new dashboard.';
        state.registeredUrl = action.payload.tenant_url; 
      })
      .addCase(registerCompany.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // --- Workflow Steps (CRITICAL FIX) ---
      .addCase(fetchWorkflowSteps.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        
        // 🛡️ Defensive Check: Ensure it's an array
        if (Array.isArray(payload)) {
            state.workflowSteps = payload;
        } else if (payload && Array.isArray(payload.results)) {
            // Handle raw pagination response if service didn't catch it
            state.workflowSteps = payload.results;
        } else {
            console.warn("Redux: workflowSteps received non-array data", payload);
            state.workflowSteps = [];
        }
      })

      // --- Upload Doc (CRITICAL FIX) ---
      .addCase(uploadCompanyDoc.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Document Uploaded!';
        
        // Ensure companyDocs is an array before we try to push
        if (!Array.isArray(state.companyDocs)) {
            state.companyDocs = [];
        }

        const newDoc = action.payload;
        // Update list logic
        const index = state.companyDocs.findIndex(d => d.id === newDoc.id);
        if (index !== -1) state.companyDocs[index] = newDoc;
        else state.companyDocs.push(newDoc);
      })

      // --- Generic Save ---
      .addCase(saveStepData.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(saveStepData.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Settings Updated Successfully!';
      })
      .addCase(saveStepData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { nextStep, prevStep, setStep, clearMessages, resetIntake } = companyIntakeSlice.actions;
export default companyIntakeSlice.reducer;