import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, CheckSquare, 
  MoreVertical, AlertCircle, RefreshCw, Tag, Flag, User,
  ChevronDown, Flame, Sparkles
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';
import { StunningSelect } from './StunningSelect';

const STATUS_COLUMNS = [
  { key: 'BACKLOG', label: 'Backlog', color: 'border-t-zinc-400 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400' },
  { key: 'TODO', label: 'To Do', color: 'border-t-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  { key: 'REVIEW', label: 'In Review', color: 'border-t-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { key: 'DONE', label: 'Done', color: 'border-t-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
];

const PRIORITY_BADGES = {
  LOW: { label: 'Low', bg: 'bg-slate-100 dark:bg-zinc-800 text-slate-500' },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' },
  HIGH: { label: 'High', bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' },
  URGENT: { label: 'Urgent', bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 animate-pulse' },
};

const TaskBoard = ({ 
  tasks = [], 
  projects = [], 
  onTaskUpdated, 
  onOpenTaskDetail, 
  onOpenCreateTask 
}) => {
  const getProjectName = (task) => {
    if (task.project_name) return task.project_name;
    if (task.project && typeof task.project === 'object' && task.project.name) return task.project.name;
    const found = (projects || []).find(p => String(p.id) === String(task.project));
    return found ? found.name : 'Workspace';
  };
  const { isDarkMode } = useTheme();
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterProject !== 'ALL' && String(task.project) !== String(filterProject) && String(task.project?.id) !== String(filterProject)) {
      return false;
    }
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const titleMatch = (task.title || '').toLowerCase().includes(q);
      const descMatch = (task.description || '').toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  });

  // Drag and Drop
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    try {
      await taskService.updateTaskStatus(taskId, targetStatus);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Failed to move task', err);
    } finally {
      setDraggedTaskId(null);
    }
  };

  const projectFilterOptions = [
    { value: 'ALL', label: 'All Projects' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ];

  const priorityFilterOptions = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  return (
    <div className="space-y-4">
      
      {/* FILTER BAR */}
      <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks in board..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-medium ${
                isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5] placeholder:text-[#52525b]' : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a] placeholder:text-[#94a3b8] shadow-xs'
              }`}
            />
          </div>

          {/* Project Filter */}
          <div className="min-w-[170px]">
            <StunningSelect
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              options={projectFilterOptions}
            />
          </div>

          {/* Priority Filter */}
          <div className="min-w-[150px]">
            <StunningSelect
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={priorityFilterOptions}
            />
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => onOpenCreateTask()}
          className="px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* KANBAN BOARD COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {STATUS_COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => (t.status || 'TODO') === col.key);
          return (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`rounded-2xl border flex flex-col min-h-[500px] transition-colors ${
                isDarkMode 
                  ? 'bg-[#0e0e11]/80 border-zinc-800/80 hover:border-zinc-700' 
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* COLUMN HEADER */}
              <div className={`px-4 py-3 border-b flex items-center justify-between rounded-t-2xl border-t-4 ${col.color} ${
                isDarkMode ? 'border-b-zinc-800/80 bg-zinc-900/40' : 'border-b-slate-200/60 bg-white/70'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onOpenCreateTask(null, col.key)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* TASK CARDS LIST */}
              <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)]">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-400 italic">
                    Drop tasks here
                  </div>
                ) : (
                  colTasks.map(task => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onOpenTaskDetail(task.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                          isDarkMode 
                            ? 'bg-[#15151c] border-zinc-800 hover:border-zinc-700 text-slate-200' 
                            : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-xs'
                        }`}
                      >
                        {/* TOP CARD CHIPS: Priority & Type */}
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${PRIORITY_BADGES[task.priority]?.bg || 'bg-slate-100'}`}>
                            {PRIORITY_BADGES[task.priority]?.label || task.priority}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            #{task.id}
                          </span>
                        </div>

                        {/* TITLE */}
                        <h4 className="text-xs font-bold leading-snug line-clamp-2 text-slate-900 dark:text-slate-100">
                          {task.title}
                        </h4>

                        {/* PROJECT BADGE */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            const pId = task.project_id || (typeof task.project === 'object' ? task.project.id : task.project);
                            if (pId && onOpenProjectDetail) onOpenProjectDetail(pId);
                          }}
                          className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          📁 <span>{getProjectName(task)}</span>
                        </div>

                        {/* FOOTER ROW: DATES, EFFORT & ASSIGNEE */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-2">
                            {task.due_date && (
                              <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-500 font-bold' : ''}`}>
                                <Calendar className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                            {task.actual_hours > 0 && (
                              <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
                                <Clock className="w-3 h-3" /> {task.actual_hours}h
                              </span>
                            )}
                          </div>

                          {/* ASSIGNEE AVATAR */}
                          <div className="flex items-center">
                            <div 
                              title={task.assignee_name || task.assignee?.email || 'Unassigned'}
                              className="w-5 h-5 rounded-full theme-bg-light theme-text-primary text-[9px] font-bold flex items-center justify-center border border-current"
                            >
                              {(task.assignee_name || task.assignee?.email || 'U')[0].toUpperCase()}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* QUICK ADD CARD BUTTON */}
              <div className="p-2 border-t border-slate-100 dark:border-zinc-800/60">
                <button
                  onClick={() => onOpenCreateTask(null, col.key)}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    isDarkMode 
                      ? 'text-slate-400 hover:text-white hover:bg-zinc-800/80' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default TaskBoard;
