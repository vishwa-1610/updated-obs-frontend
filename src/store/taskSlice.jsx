// src/store/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../services/taskService';

export const fetchProjects = createAsyncThunk('tasks/fetchProjects', async (params) => {
  const response = await taskService.getProjects(params);
  return response.data;
});

export const createProject = createAsyncThunk('tasks/createProject', async (data) => {
  const response = await taskService.createProject(data);
  return response.data;
});

export const updateProject = createAsyncThunk('tasks/updateProject', async ({ id, data }) => {
  const response = await taskService.updateProject(id, data);
  return response.data;
});

export const deleteProject = createAsyncThunk('tasks/deleteProject', async (id) => {
  await taskService.deleteProject(id);
  return id;
});

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (params) => {
  const response = await taskService.getTasks(params);
  return response.data;
});

export const createTask = createAsyncThunk('tasks/createTask', async (data) => {
  const response = await taskService.createTask(data);
  return response.data;
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, data }) => {
  const response = await taskService.updateTask(id, data);
  return response.data;
});

export const updateTaskStatus = createAsyncThunk('tasks/updateTaskStatus', async ({ id, status }) => {
  const response = await taskService.updateTaskStatus(id, status);
  return response.data;
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id) => {
  await taskService.deleteTask(id);
  return id;
});

export const fetchMyTasks = createAsyncThunk('tasks/fetchMyTasks', async () => {
  const response = await taskService.getMyTasks();
  return response.data;
});

export const fetchKanbanBoard = createAsyncThunk('tasks/fetchKanban', async (projectId) => {
  const response = await taskService.getKanbanBoard(projectId);
  return response.data;
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    projects: [],
    currentProject: null,
    tasks: [],
    myTasks: [],
    kanbanBoards: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = null; },
    setCurrentProject: (state, action) => { state.currentProject = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.results || action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
        state.success = 'Project created!';
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.projects.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.projects[idx] = action.payload;
        state.success = 'Project updated!';
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
        state.success = 'Project deleted!';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload.results || action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.myTasks = action.payload.results || action.payload;
      })
      .addCase(fetchKanbanBoard.fulfilled, (state, action) => {
        state.kanbanBoards = action.payload;
      });
  },
});

export const { clearError, clearSuccess, setCurrentProject } = taskSlice.actions;
export default taskSlice.reducer;