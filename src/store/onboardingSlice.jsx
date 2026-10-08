import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import onboardingService from '../services/onboardingService';

// Candidate Lifecycle Thunks
export const fetchAllOnboardings = createAsyncThunk(
  'onboarding/fetchAllOnboardings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getAllOnboardings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const fetchOnboardings = fetchAllOnboardings;

export const fetchPendingOnboardings = createAsyncThunk(
  'onboarding/fetchPendingOnboardings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getPendingOnboardings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchInProgressOnboardings = createAsyncThunk(
  'onboarding/fetchInProgressOnboardings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getInProgressOnboardings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchConfirmedOnboardings = createAsyncThunk(
  'onboarding/fetchConfirmedOnboardings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getConfirmedOnboardings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createNewOnboarding = createAsyncThunk(
  'onboarding/createNewOnboarding',
  async (data, { rejectWithValue }) => {
    try {
      const response = await onboardingService.createOnboarding(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const createOnboarding = createNewOnboarding;

export const updateOnboardingRecord = createAsyncThunk(
  'onboarding/updateOnboardingRecord',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await onboardingService.updateOnboarding(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const updateOnboarding = updateOnboardingRecord;

export const deleteOnboardingRecord = createAsyncThunk(
  'onboarding/deleteOnboardingRecord',
  async (id, { rejectWithValue }) => {
    try {
      await onboardingService.deleteOnboarding(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const convertToEmployeeAction = createAsyncThunk(
  'onboarding/convertToEmployeeAction',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await onboardingService.convertToEmployee(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const remindCandidateAction = createAsyncThunk(
  'onboarding/remindCandidateAction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await onboardingService.remindOnboarding(id);
      return { id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const remindOnboarding = remindCandidateAction;

export const regretCandidateAction = createAsyncThunk(
  'onboarding/regretCandidateAction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await onboardingService.regretOnboarding(id);
      return { id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const confirmOnboarding = createAsyncThunk(
  'onboarding/confirmOnboarding',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await onboardingService.convertToEmployee(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBankDetails = createAsyncThunk(
  'onboarding/fetchBankDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getOnboardingDetail(id);
      return response.data?.bank_details || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'onboarding/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getDocumentExpirations();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Enterprise Suite Thunks
export const fetchBenefitPlans = createAsyncThunk(
  'onboarding/fetchBenefitPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getBenefitPlans();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createBenefitPlan = createAsyncThunk(
  'onboarding/createBenefitPlan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await onboardingService.createBenefitPlan(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCompanyPolicies = createAsyncThunk(
  'onboarding/fetchCompanyPolicies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getCompanyPolicies();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCompanyPolicy = createAsyncThunk(
  'onboarding/createCompanyPolicy',
  async (data, { rejectWithValue }) => {
    try {
      const response = await onboardingService.createCompanyPolicy(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDocumentExpirations = createAsyncThunk(
  'onboarding/fetchDocumentExpirations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getDocumentExpirations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  allOnboardings: [],
  onboardings: [],
  pendingOnboardings: [],
  inProgressOnboardings: [],
  confirmedOnboardings: [],
  benefitPlans: [],
  companyPolicies: [],
  documentExpirations: [],
  notifications: [],
  selectedOnboarding: null,
  currentOnboarding: null,
  bankDetails: null,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
  successMessage: null,
  success: null
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setSelectedOnboarding: (state, action) => {
      state.selectedOnboarding = action.payload;
      state.currentOnboarding = action.payload;
    },
    setCurrentOnboarding: (state, action) => {
      state.currentOnboarding = action.payload;
      state.selectedOnboarding = action.payload;
    },
    clearCurrentOnboarding: (state) => {
      state.currentOnboarding = null;
      state.selectedOnboarding = null;
    },
    clearBankDetails: (state) => {
      state.bankDetails = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearOnboardingError: (state) => {
      state.error = null;
    },
    clearOnboardingSuccess: (state) => {
      state.successMessage = null;
      state.success = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // All
      .addCase(fetchAllOnboardings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllOnboardings.fulfilled, (state, action) => {
        state.loading = false;
        const list = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
        state.allOnboardings = list;
        state.onboardings = list;
      })
      .addCase(fetchAllOnboardings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Pending
      .addCase(fetchPendingOnboardings.fulfilled, (state, action) => {
        state.pendingOnboardings = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      // InProgress
      .addCase(fetchInProgressOnboardings.fulfilled, (state, action) => {
        state.inProgressOnboardings = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      // Confirmed
      .addCase(fetchConfirmedOnboardings.fulfilled, (state, action) => {
        state.confirmedOnboardings = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      // Create
      .addCase(createNewOnboarding.fulfilled, (state, action) => {
        state.allOnboardings.unshift(action.payload);
        state.onboardings.unshift(action.payload);
        state.successMessage = 'Candidate enrolled in onboarding successfully!';
        state.success = true;
      })
      // Bank details
      .addCase(fetchBankDetails.fulfilled, (state, action) => {
        state.bankDetails = action.payload;
      })
      // Notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = Array.isArray(action.payload) ? action.payload : [];
      })
      // Benefit Plans
      .addCase(fetchBenefitPlans.fulfilled, (state, action) => {
        state.benefitPlans = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(createBenefitPlan.fulfilled, (state, action) => {
        state.benefitPlans.unshift(action.payload);
        state.successMessage = 'Benefit plan added successfully!';
        state.success = true;
      })
      // Policies
      .addCase(fetchCompanyPolicies.fulfilled, (state, action) => {
        state.companyPolicies = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      })
      .addCase(createCompanyPolicy.fulfilled, (state, action) => {
        state.companyPolicies.unshift(action.payload);
        state.successMessage = 'Company policy uploaded successfully!';
        state.success = true;
      })
      // Document Expirations
      .addCase(fetchDocumentExpirations.fulfilled, (state, action) => {
        state.documentExpirations = Array.isArray(action.payload) ? action.payload : (action.payload?.results || []);
      });
  }
});

export const {
  setSelectedOnboarding,
  setCurrentOnboarding,
  clearCurrentOnboarding,
  clearBankDetails,
  setPage,
  clearOnboardingError,
  clearOnboardingSuccess,
  clearSuccess
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
