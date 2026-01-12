import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

// --- THUNKS ---

// Login Action
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // Calls the new login method in authService
      const response = await authService.login(credentials);
      return response.data; // Expected: { access, refresh, user: {...} }
    } catch (error) {
      // Safely handle error messages from backend
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

// --- SLICE ---

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('access') || null,
  refreshToken: localStorage.getItem('refresh') || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('access'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.clear();
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;

        // Persist to LocalStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('access', action.payload.access);
        localStorage.setItem('refresh', action.payload.refresh);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Contains the error message
      });
  },
});

export const { updateUser, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;