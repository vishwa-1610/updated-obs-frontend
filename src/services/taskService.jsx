// src/services/taskService.jsx
import api from './api';

export const taskService = {
  // Projects
  getProjects: (params) => api.get('/tasks/projects/', { params }),
  getProject: (id) => api.get(`/tasks/projects/${id}/`),
  createProject: (data) => api.post('/tasks/projects/', data),
  updateProject: (id, data) => api.patch(`/tasks/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/tasks/projects/${id}/`),
  getProjectStats: (id) => api.get(`/tasks/projects/${id}/stats/`),
  getKanbanBoard: (projectId) => api.get(`/tasks/projects/${projectId}/kanban/`),
  duplicateProject: (id) => api.post(`/tasks/projects/${id}/duplicate_project/`),
  archiveProject: (id) => api.post(`/tasks/projects/${id}/archive_project/`),
  addTeamMember: (id, userId) => api.post(`/tasks/projects/${id}/add_team_member/`, { user_id: userId }),
  removeTeamMember: (id, userId) => api.post(`/tasks/projects/${id}/remove_team_member/`, { user_id: userId }),

  // Tasks
  getTasks: (params) => api.get('/tasks/tasks/', { params }),
  getTask: (id) => api.get(`/tasks/tasks/${id}/`),
  createTask: (data) => api.post('/tasks/tasks/', data),
  updateTask: (id, data) => api.patch(`/tasks/tasks/${id}/`, data),
  deleteTask: (id) => api.delete(`/tasks/tasks/${id}/`),
  updateTaskStatus: (id, status) => api.post(`/tasks/tasks/${id}/update_status/`, { status }),
  startTimer: (id) => api.post(`/tasks/tasks/${id}/start_timer/`),
  stopTimer: (id, data) => api.post(`/tasks/tasks/${id}/stop_timer/`, data || {}),
  addComment: (id, data) => api.post(`/tasks/tasks/${id}/add_comment/`, data),
  createSubtask: (id, data) => api.post(`/tasks/tasks/${id}/create_subtask/`, data),
  getTaskHistory: (id) => api.get(`/tasks/tasks/${id}/history/`),
  bulkUpdateStatus: (taskIds, status) => api.post('/tasks/tasks/bulk_update_status/', { task_ids: taskIds, status }),
  spawnRecurring: (targetDate) => api.post('/tasks/tasks/spawn-recurring/', targetDate ? { target_date: targetDate } : {}),
  sendDigest: (digestType, userId) => api.post('/tasks/tasks/send-digest/', { digest_type: digestType, user_id: userId }),
  getSummaryStats: () => api.get('/tasks/tasks/summary-stats/'),

  // My Tasks & Pending
  getMyTasks: () => api.get('/tasks/my-tasks/'),
  getMyPendingTasks: () => api.get('/tasks/my-pending/'),

  // Milestones
  getMilestones: (params) => api.get('/tasks/milestones/', { params }),
  createMilestone: (data) => api.post('/tasks/milestones/', data),
  updateMilestone: (id, data) => api.patch(`/tasks/milestones/${id}/`, data),
  deleteMilestone: (id) => api.delete(`/tasks/milestones/${id}/`),

  // Sprints
  getSprints: (params) => api.get('/tasks/sprints/', { params }),
  createSprint: (data) => api.post('/tasks/sprints/', data),
  updateSprint: (id, data) => api.patch(`/tasks/sprints/${id}/`, data),
  deleteSprint: (id) => api.delete(`/tasks/sprints/${id}/`),

  // Boards & Labels
  getBoards: (params) => api.get('/tasks/boards/', { params }),
  getLabels: (params) => api.get('/tasks/labels/', { params }),
  createLabel: (data) => api.post('/tasks/labels/', data),
};

export default taskService;
