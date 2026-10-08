import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Kanban, ListTodo, Target, Clock, Plus, 
  Sparkles, RefreshCw, Send, Loader2, CheckCircle2, AlertCircle,
  Briefcase, BarChart3, ShieldCheck, LineChart
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';

import TaskAnalyticsView from './TaskAnalyticsView';
import TaskBoard from './TaskBoard';
import ProjectList from './ProjectList';
import MyTasks from './MyTasks';
import MilestonesView from './MilestonesView';
import TimeTrackerView from './TimeTrackerView';

import TaskDetailModal from './TaskDetailModal';
import CreateEditTaskModal from './CreateEditTaskModal';
import CreateEditProjectModal from './CreateEditProjectModal';
import ProjectDetailModal from './ProjectDetailModal';

const TaskDashboard = () => {
  const { isDarkMode } = useTheme();
  // ANALYTICS FIRST
  const [activeTab, setActiveTab] = useState('analytics');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState('TODO');

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);

  // Automation Action Feedback
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes, statsRes] = await Promise.all([
        taskService.getProjects().catch(() => ({ data: [] })),
        taskService.getTasks().catch(() => ({ data: [] })),
        taskService.getSummaryStats().catch(() => ({ data: null }))
      ]);
      setProjects(projRes.data?.results || projRes.data || []);
      setTasks(taskRes.data?.results || taskRes.data || []);
      setStats(statsRes.data?.stats || null);
    } catch (err) {
      console.error('Failed to load tasks dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpawnRecurring = async () => {
    try {
      const res = await taskService.spawnRecurring();
      setActionMessage(res.data?.message || 'Recurring tasks generated successfully!');
      setTimeout(() => setActionMessage(null), 4000);
      loadAllData();
    } catch (err) {
      console.error('Failed to spawn recurring', err);
    }
  };

  const handleSendDigest = async () => {
    try {
      const res = await taskService.sendDigest('daily');
      setActionMessage(res.data?.message || 'Daily task digest sent!');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error('Failed to send digest', err);
    }
  };

  const openTaskDetail = (id) => {
    setSelectedTaskId(id);
    setIsTaskDetailOpen(true);
  };

  const openCreateTask = (taskToEdit = null, defaultStatus = 'TODO') => {
    setEditingTask(taskToEdit);
    setDefaultTaskStatus(defaultStatus);
    setIsCreateTaskOpen(true);
  };

  const openCreateProject = (projectToEdit = null) => {
    setEditingProject(projectToEdit);
    setIsCreateProjectOpen(true);
  };

  const openProjectDetail = (id) => {
    setSelectedProjectId(id);
    setIsProjectDetailOpen(true);
  };

  // TABS ORDER: Analytics & Insights FIRST
  const tabs = [
    { id: 'analytics', label: 'Analytics & Intelligence', icon: BarChart3 },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'projects', label: 'Projects Overview', icon: FolderKanban },
    { id: 'mytasks', label: 'My Work & Pending', icon: ListTodo },
    { id: 'milestones', label: 'Milestones & Roadmap', icon: Target },
    { id: 'time', label: 'Time Tracker', icon: Clock },
  ];

  const totalActiveProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdueCount = stats?.overdue_count || tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE').length;
  const totalHoursLogged = tasks.reduce((sum, t) => sum + (parseFloat(t.actual_hours) || 0), 0);

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-[1700px] mx-auto w-full animate-in fade-in duration-300 space-y-5">
      
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Task Manager & Workspaces
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full theme-bg-light theme-text-primary">
              Executive Suite v2.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise analytics, multi-timeframe forecasting, Kanban workflows, stopwatch logging, and delivery milestones.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSpawnRecurring}
            title="Auto-generate upcoming instances of recurring tasks"
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isDarkMode 
                ? 'bg-zinc-900/60 border-zinc-800 text-slate-300 hover:text-white hover:bg-zinc-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span className="hidden sm:inline">Spawn Recurring</span>
          </button>

          <button
            onClick={handleSendDigest}
            title="Dispatch daily email task digest to team"
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isDarkMode 
                ? 'bg-zinc-900/60 border-zinc-800 text-slate-300 hover:text-white hover:bg-zinc-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Send Digest</span>
          </button>

          <button
            onClick={() => openCreateProject()}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>+ Project</span>
          </button>

          <button
            onClick={() => openCreateTask()}
            className="px-4 py-2 rounded-xl text-xs font-bold theme-bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Task</span>
          </button>
        </div>
      </div>

      {/* ACTION TOAST MESSAGE */}
      {actionMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* NAVIGATION VIEW TABS */}
      <div className={`flex flex-wrap p-1 rounded-2xl border ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'theme-bg-primary text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW CONTENT */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400">Syncing task workspace with server...</p>
        </div>
      ) : (
        <div>
          {activeTab === 'analytics' && (
            <TaskAnalyticsView
              tasks={tasks}
              projects={projects}
              onOpenTaskDetail={openTaskDetail}
              onOpenProjectDetail={openProjectDetail}
              onOpenCreateTask={openCreateTask}
            />
          )}

          {activeTab === 'kanban' && (
            <TaskBoard
              tasks={tasks}
              projects={projects}
              onTaskUpdated={loadAllData}
              onOpenTaskDetail={openTaskDetail}
              onOpenProjectDetail={openProjectDetail}
              onOpenCreateTask={(task, defaultStatus) => openCreateTask(task, defaultStatus)}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectList
              projects={projects}
              onProjectUpdated={loadAllData}
              onOpenCreateProject={openCreateProject}
              onOpenProjectDetail={openProjectDetail}
              onOpenEditProject={openCreateProject}
            />
          )}

          {activeTab === 'mytasks' && (
            <MyTasks
              onOpenTaskDetail={openTaskDetail}
              onOpenProjectDetail={openProjectDetail}
              onOpenCreateTask={() => openCreateTask()}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesView
              projects={projects}
              onOpenTaskDetail={openTaskDetail}
              onOpenProjectDetail={openProjectDetail}
            />
          )}

          {activeTab === 'time' && (
            <TimeTrackerView
              tasks={tasks}
              onOpenTaskDetail={openTaskDetail}
              onOpenProjectDetail={openProjectDetail}
            />
          )}
        </div>
      )}

      {/* MODALS */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={isTaskDetailOpen}
        onClose={() => { setIsTaskDetailOpen(false); setSelectedTaskId(null); }}
        onTaskUpdated={loadAllData}
      />

      <CreateEditTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => { setIsCreateTaskOpen(false); setEditingTask(null); }}
        onTaskSaved={loadAllData}
        initialData={editingTask}
      />

      <CreateEditProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => { setIsCreateProjectOpen(false); setEditingProject(null); }}
        onProjectSaved={loadAllData}
        initialData={editingProject}
      />

      <ProjectDetailModal
        projectId={selectedProjectId}
        isOpen={isProjectDetailOpen}
        onClose={() => { setIsProjectDetailOpen(false); setSelectedProjectId(null); }}
        onEditProject={(proj) => { openCreateProject(proj); }}
      />

    </div>
  );
};

export default TaskDashboard;
