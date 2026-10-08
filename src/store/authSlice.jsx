import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

// Login Thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        'Login failed. Please verify your credentials.'
      );
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('access') || null,
  refreshToken: localStorage.getItem('refresh') || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('access'),
  twoFactorChallenge: null, // Holds { temp_token, method, email } when 2FA is required
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.twoFactorChallenge = null;
      state.user = action.payload.user;
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;

      if (action.payload.user) localStorage.setItem('user', JSON.stringify(action.payload.user));
      if (action.payload.access) localStorage.setItem('access', action.payload.access);
      if (action.payload.refresh) localStorage.setItem('refresh', action.payload.refresh);
    },
    setTwoFactorChallenge: (state, action) => {
      state.twoFactorChallenge = action.payload;
    },
    clearTwoFactorChallenge: (state) => {
      state.twoFactorChallenge = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.twoFactorChallenge = null;
      state.error = null;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
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
        if (action.payload.requires_2fa) {
          state.twoFactorChallenge = {
            temp_token: action.payload.temp_token,
            method: action.payload.method || 'TOTP',
            email: action.payload.email
          };
        } else {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.access;
          state.refreshToken = action.payload.refresh;

          if (action.payload.user) localStorage.setItem('user', JSON.stringify(action.payload.user));
          if (action.payload.access) localStorage.setItem('access', action.payload.access);
          if (action.payload.refresh) localStorage.setItem('refresh', action.payload.refresh);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLoginSuccess, setTwoFactorChallenge, clearTwoFactorChallenge, updateUser, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
