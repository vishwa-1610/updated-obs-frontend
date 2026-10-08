import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../services/employeeService';

// 1. Dashboard Stats
export const fetchEmployeeStats = createAsyncThunk(
  'employee/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch employee statistics');
    }
  }
);

// 2. Core Employee Directory
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getEmployees(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch employees');
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employee/fetchEmployeeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeService.getEmployeeById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch employee details');
    }
  }
);
export const fetchEmployeeDetail = fetchEmployeeById;

export const createEmployee = createAsyncThunk(
  'employee/createEmployee',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeService.createEmployee(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateEmployee(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employee/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteEmployee(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete employee');
    }
  }
);

// 3. Profiles
export const fetchProfiles = createAsyncThunk(
  'employee/fetchProfiles',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getProfiles(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profiles');
    }
  }
);

// 4. Hardware Equipment & Assets
export const fetchAssets = createAsyncThunk(
  'employee/fetchAssets',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getAssets(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch assets');
    }
  }
);
export const fetchHardwareAssets = fetchAssets;

export const createAsset = createAsyncThunk(
  'employee/createAsset',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeService.createAsset(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to register hardware asset');
    }
  }
);
export const createHardwareAsset = createAsset;

export const updateAsset = createAsyncThunk(
  'employee/updateAsset',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateAsset(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update asset');
    }
  }
);
export const updateHardwareAsset = updateAsset;

export const deleteAsset = createAsyncThunk(
  'employee/deleteAsset',
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteAsset(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete asset');
    }
  }
);
export const deleteHardwareAsset = deleteAsset;

// 5. SaaS App Provisioning Accounts
export const fetchAppAccounts = createAsyncThunk(
  'employee/fetchAppAccounts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getAppAccounts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch SaaS accounts');
    }
  }
);
export const fetchSaaSAccounts = fetchAppAccounts;

export const createAppAccount = createAsyncThunk(
  'employee/createAppAccount',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeService.createAppAccount(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to provision SaaS account');
    }
  }
);
export const createSaaSAccount = createAppAccount;

export const updateAppAccount = createAsyncThunk(
  'employee/updateAppAccount',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateAppAccount(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update SaaS account');
    }
  }
);
export const updateSaaSAccount = updateAppAccount;

export const revokeAppAccess = createAsyncThunk(
  'employee/revokeAppAccess',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeService.revokeAppAccess(id);
      return response.data || { id };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to revoke app access');
    }
  }
);
export const revokeSaaSAccess = revokeAppAccess;

export const deleteAppAccount = createAsyncThunk(
  'employee/deleteAppAccount',
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteAppAccount(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete SaaS account');
    }
  }
);
export const deleteSaaSAccount = deleteAppAccount;

// 6. 1-on-1s & Manager Reviews
export const fetchOneOnOnes = createAsyncThunk(
  'employee/fetchOneOnOnes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getOneOnOnes(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch 1-on-1 meetings');
    }
  }
);

export const createOneOnOne = createAsyncThunk(
  'employee/createOneOnOne',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeService.createOneOnOne(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to schedule 1-on-1');
    }
  }
);

export const updateOneOnOne = createAsyncThunk(
  'employee/updateOneOnOne',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateOneOnOne(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update 1-on-1');
    }
  }
);

export const deleteOneOnOne = createAsyncThunk(
  'employee/deleteOneOnOne',
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteOneOnOne(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete 1-on-1');
    }
  }
);

// 7. Structured Offboarding & Separations
export const fetchSeparations = createAsyncThunk(
  'employee/fetchSeparations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getSeparations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch offboarding cases');
    }
  }
);
export const fetchOffboardingCases = fetchSeparations;

export const createSeparation = createAsyncThunk(
  'employee/createSeparation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeService.createSeparation(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to initiate separation');
    }
  }
);
export const createOffboardingCase = createSeparation;

export const updateSeparation = createAsyncThunk(
  'employee/updateSeparation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateSeparation(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update separation');
    }
  }
);
export const updateOffboardingCase = updateSeparation;

export const deleteSeparation = createAsyncThunk(
  'employee/deleteSeparation',
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteSeparation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete offboarding case');
    }
  }
);
export const deleteOffboardingCase = deleteSeparation;

export const calculateFinalPayAction = createAsyncThunk(
  'employee/calculateFinalPay',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeService.calculateFinalPay(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to calculate statutory final pay');
    }
  }
);

export const hrSignoffAction = createAsyncThunk(
  'employee/hrSignoff',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeService.hrSignoff(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to record HR sign-off');
    }
  }
);

// 8. Company Announcements & Broadcasts
export const fetchAnnouncements = createAsyncThunk(
  'employee/fetchAnnouncements',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getAnnouncements(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch announcements');
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'employee/createAnnouncement',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeService.createAnnouncement(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to publish announcement');
    }
  }
);

export const updateAnnouncement = createAsyncThunk(
  'employee/updateAnnouncement',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateAnnouncement(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update announcement');
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'employee/deleteAnnouncement',
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteAnnouncement(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete announcement');
    }
  }
);

// Initial Redux State
const initialState = {
  stats: null,
  employees: [],
  currentEmployee: null,
  selectedEmployee: null,
  profiles: [],
  assets: [],
  hardwareAssets: [],
  appAccounts: [],
  saasAccounts: [],
  oneOnOnes: [],
  separations: [],
  offboardingCases: [],
  announcements: [],
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
  },
  loading: false,
  actionLoading: false,
  error: null,
  success: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentEmployee: (state, action) => {
      state.currentEmployee = action.payload;
      state.selectedEmployee = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.currentEmployee = action.payload;
      state.selectedEmployee = action.payload;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
      state.selectedEmployee = null;
    },
    setPaginationPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchEmployeeStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.employees = action.payload;
          state.pagination.count = action.payload.length;
        } else if (action.payload && action.payload.results) {
          state.employees = action.payload.results;
          state.pagination.count = action.payload.count || 0;
          state.pagination.next = action.payload.next;
          state.pagination.previous = action.payload.previous;
          state.pagination.totalPages = Math.ceil((action.payload.count || 0) / 10) || 1;
        } else {
          state.employees = [];
        }
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Employee Detail
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.currentEmployee = action.payload;
        state.selectedEmployee = action.payload;
      })

      // Create Employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload);
        state.success = 'Employee record created successfully!';
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee && state.currentEmployee.id === action.payload.id) {
          state.currentEmployee = action.payload;
          state.selectedEmployee = action.payload;
        }
        state.success = 'Employee details updated successfully!';
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter((e) => e.id !== action.payload);
        state.success = 'Employee deactivated successfully.';
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Profiles
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        const data = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
        state.profiles = data;
      })

      // Assets
      .addCase(fetchAssets.fulfilled, (state, action) => {
        const data = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
        state.assets = data;
        state.hardwareAssets = data;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.assets.unshift(action.payload);
        state.hardwareAssets.unshift(action.payload);
        state.success = 'Hardware asset registered successfully!';
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.assets.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.assets[index] = action.payload;
        const hIndex = state.hardwareAssets.findIndex(a => a.id === action.payload.id);
        if (hIndex !== -1) state.hardwareAssets[hIndex] = action.payload;
        state.success = 'Asset updated successfully!';
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.assets = state.assets.filter(a => a.id !== action.payload);
        state.hardwareAssets = state.hardwareAssets.filter(a => a.id !== action.payload);
        state.success = 'Asset removed from inventory.';
      })

      // SaaS App Accounts
      .addCase(fetchAppAccounts.fulfilled, (state, action) => {
        const data = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
        state.appAccounts = data;
        state.saasAccounts = data;
      })
      .addCase(createAppAccount.fulfilled, (state, action) => {
        state.appAccounts.unshift(action.payload);
        state.saasAccounts.unshift(action.payload);
        state.success = 'SaaS account provisioned successfully!';
      })
      .addCase(updateAppAccount.fulfilled, (state, action) => {
        const index = state.appAccounts.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.appAccounts[index] = action.payload;
        const sIndex = state.saasAccounts.findIndex(a => a.id === action.payload.id);
        if (sIndex !== -1) state.saasAccounts[sIndex] = action.payload;
        state.success = 'SaaS account updated!';
      })
      .addCase(revokeAppAccess.fulfilled, (state, action) => {
        const index = state.appAccounts.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.appAccounts[index].status = 'REVOKED';
        const sIndex = state.saasAccounts.findIndex(a => a.id === action.payload.id);
        if (sIndex !== -1) state.saasAccounts[sIndex].status = 'REVOKED';
        state.success = 'SaaS account access revoked!';
      })
      .addCase(deleteAppAccount.fulfilled, (state, action) => {
        state.appAccounts = state.appAccounts.filter(a => a.id !== action.payload);
        state.saasAccounts = state.saasAccounts.filter(a => a.id !== action.payload);
        state.success = 'SaaS account record deleted.';
      })

      // 1-on-1s
      .addCase(fetchOneOnOnes.fulfilled, (state, action) => {
        state.oneOnOnes = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      })
      .addCase(createOneOnOne.fulfilled, (state, action) => {
        state.oneOnOnes.unshift(action.payload);
        state.success = '1-on-1 meeting scheduled!';
      })
      .addCase(updateOneOnOne.fulfilled, (state, action) => {
        const idx = state.oneOnOnes.findIndex(m => m.id === action.payload.id);
        if (idx !== -1) state.oneOnOnes[idx] = action.payload;
        state.success = '1-on-1 notes updated!';
      })
      .addCase(deleteOneOnOne.fulfilled, (state, action) => {
        state.oneOnOnes = state.oneOnOnes.filter(m => m.id !== action.payload);
        state.success = '1-on-1 meeting removed.';
      })

      // Separations
      .addCase(fetchSeparations.fulfilled, (state, action) => {
        const data = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
        state.separations = data;
        state.offboardingCases = data;
      })
      .addCase(createSeparation.fulfilled, (state, action) => {
        state.separations.unshift(action.payload);
        state.offboardingCases.unshift(action.payload);
        state.success = 'Offboarding case initiated!';
      })
      .addCase(updateSeparation.fulfilled, (state, action) => {
        const idx = state.separations.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.separations[idx] = action.payload;
        const oIdx = state.offboardingCases.findIndex(s => s.id === action.payload.id);
        if (oIdx !== -1) state.offboardingCases[oIdx] = action.payload;
        state.success = 'Offboarding case updated!';
      })
      .addCase(calculateFinalPayAction.fulfilled, (state, action) => {
        const idx = state.separations.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.separations[idx] = action.payload;
        state.success = 'State statutory final pay & PTO calculated!';
      })
      .addCase(hrSignoffAction.fulfilled, (state, action) => {
        const idx = state.separations.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.separations[idx] = action.payload;
        state.success = 'HR sign-off recorded & offboarding finalized!';
      })

      // Announcements
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements = Array.isArray(action.payload) ? action.payload : (action.payload.results || []);
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
        state.success = 'Announcement broadcasted successfully!';
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        const idx = state.announcements.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.announcements[idx] = action.payload;
        state.success = 'Announcement updated!';
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(a => a.id !== action.payload);
        state.success = 'Announcement deleted.';
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentEmployee, 
  setSelectedEmployee,
  clearCurrentEmployee,
  setPaginationPage 
} = employeeSlice.actions;

export default employeeSlice.reducer;
