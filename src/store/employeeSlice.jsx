import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../services/employeeService';

// Async Thunks
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getEmployees(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employee/createEmployee',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeService.createEmployee(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    employees: [],
    currentEmployee: null,
    loading: false,
    error: null,
    success: null,
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
      totalPages: 1,
    },
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = null; },
    setCurrentEmployee: (state, action) => { state.currentEmployee = action.payload; },
    clearCurrentEmployee: (state) => { state.currentEmployee = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.results || action.payload;
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
      .addCase(fetchEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Create
      .addCase(createEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Employee created successfully!';
        state.employees.unshift(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Update
      .addCase(updateEmployee.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Employee updated successfully!';
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) state.employees[index] = action.payload;
        if (state.currentEmployee?.id === action.payload.id) state.currentEmployee = action.payload;
      })
      .addCase(updateEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Delete
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.success = 'Employee deleted successfully!';
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        state.currentEmployee = null;
      });
  },
});

export const { clearError, clearSuccess, setCurrentEmployee, clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;