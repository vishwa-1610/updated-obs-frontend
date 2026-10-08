import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobService } from '../services/jobService';

// Async Thunks
export const fetchJobStats = createAsyncThunk(
  'jobs/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await jobService.getStats();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params, { rejectWithValue }) => {
    try {
      const data = await jobService.getJobs(params);
      return data.results ? data.results : data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchJobDetail = createAsyncThunk(
  'jobs/fetchJobDetail',
  async (id, { rejectWithValue }) => {
    try {
      return await jobService.getJobDetail(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { dispatch, rejectWithValue }) => {
    try {
      const res = await jobService.createJob(jobData);
      dispatch(fetchJobs());
      dispatch(fetchJobStats());
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await jobService.updateJob(id, data);
      dispatch(fetchJobs());
      dispatch(fetchJobStats());
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await jobService.deleteJob(id);
      dispatch(fetchJobs());
      dispatch(fetchJobStats());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchApplications = createAsyncThunk(
  'jobs/fetchApplications',
  async (params, { rejectWithValue }) => {
    try {
      const data = await jobService.getApplications(params);
      return data.results ? data.results : data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createApplication = createAsyncThunk(
  'jobs/createApplication',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await jobService.createApplication(data);
      dispatch(fetchApplications());
      dispatch(fetchJobStats());
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateApplication = createAsyncThunk(
  'jobs/updateApplication',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await jobService.updateApplication(id, data);
      dispatch(fetchApplications());
      dispatch(fetchJobStats());
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteApplication = createAsyncThunk(
  'jobs/deleteApplication',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await jobService.deleteApplication(id);
      dispatch(fetchApplications());
      dispatch(fetchJobStats());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const convertToOnboarding = createAsyncThunk(
  'jobs/convertToOnboarding',
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const res = await jobService.convertToOnboarding(id, payload);
      dispatch(fetchApplications());
      dispatch(fetchJobStats());
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchInterviews = createAsyncThunk(
  'jobs/fetchInterviews',
  async (params, { rejectWithValue }) => {
    try {
      const data = await jobService.getInterviews(params);
      return data.results ? data.results : data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createInterview = createAsyncThunk(
  'jobs/createInterview',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await jobService.createInterview(data);
      dispatch(fetchInterviews());
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateInterview = createAsyncThunk(
  'jobs/updateInterview',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await jobService.updateInterview(id, data);
      dispatch(fetchInterviews());
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteInterview = createAsyncThunk(
  'jobs/deleteInterview',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await jobService.deleteInterview(id);
      dispatch(fetchInterviews());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    stats: null,
    jobs: [],
    selectedJob: null,
    applications: [],
    selectedApplication: null,
    interviews: [],
    loading: false,
    converting: false,
    error: null,
    success: null,
  },
  reducers: {
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
    setSelectedApplication: (state, action) => {
      state.selectedApplication = action.payload;
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
      // fetchJobStats
      .addCase(fetchJobStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // fetchJobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload || [];
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchJobDetail
      .addCase(fetchJobDetail.fulfilled, (state, action) => {
        state.selectedJob = action.payload;
      })
      // fetchApplications
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.applications = action.payload || [];
      })
      // fetchInterviews
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.interviews = action.payload || [];
      })
      // convertToOnboarding
      .addCase(convertToOnboarding.pending, (state) => {
        state.converting = true;
      })
      .addCase(convertToOnboarding.fulfilled, (state, action) => {
        state.converting = false;
        state.success = 'Candidate successfully converted to Onboarding!';
      })
      .addCase(convertToOnboarding.rejected, (state, action) => {
        state.converting = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedJob, setSelectedApplication, clearError, clearSuccess } = jobSlice.actions;
export default jobSlice.reducer;
