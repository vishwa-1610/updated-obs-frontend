import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Calendar, CheckSquare, Square, MessageSquare, Send, 
  Play, Pause, Trash2, Edit2, User, Flag, Tag, Paperclip, 
  CheckCircle2, AlertCircle, RefreshCw, Sparkles, Plus, Check, ChevronDown
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';

const PRIORITY_BADGES = {
  LOW: { label: 'Low', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  HIGH: { label: 'High', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  URGENT: { label: 'Urgent', bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse' },
};

const STATUS_CONFIG = {
  BACKLOG: { label: 'Backlog', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' },
  TODO: { label: 'To Do', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
  REVIEW: { label: 'In Review', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  DONE: { label: 'Completed', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
};

const TaskDetailModal = ({ taskId, isOpen, onClose, onTaskUpdated }) => {
  const { isDarkMode } = useTheme();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subtasks'); // subtasks, comments, history
  
  // Subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [submittingSubtask, setSubmittingSubtask] = useState(false);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskDetails();
    } else {
      setTask(null);
      setIsTimerRunning(false);
      setTimerSeconds(0);
    }
  }, [isOpen, taskId]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await taskService.getTask(taskId);
      setTask(res.data);
      const histRes = await taskService.getTaskHistory(taskId).catch(() => ({ data: [] }));
      setHistoryLogs(histRes.data || []);
    } catch (err) {
      console.error('Failed to load task details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    try {
      await taskService.updateTaskStatus(task.id, newStatus);
      setTask(prev => ({ ...prev, status: newStatus }));
      if (onTaskUpdated) onTaskUpdated();
      loadTaskDetails();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;
    setSubmittingSubtask(true);
    try {
      await taskService.createSubtask(task.id, { title: newSubtaskTitle.trim() });
      setNewSubtaskTitle('');
      await loadTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Failed to add subtask', err);
    } finally {
      setSubmittingSubtask(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    setSubmittingComment(true);
    try {
      await taskService.addComment(task.id, {
        content: newComment.trim(),
        is_internal: isInternalComment
      });
      setNewComment('');
      setIsInternalComment(false);
      await loadTaskDetails();
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleTimer = async () => {
    if (!task) return;
    if (!isTimerRunning) {
      try {
        await taskService.startTimer(task.id);
        setIsTimerRunning(true);
      } catch (err) {
        console.error('Failed to start timer', err);
      }
    } else {
      try {
        await taskService.stopTimer(task.id, { description: `Logged via web timer (${Math.ceil(timerSeconds / 60)} min)` });
        setIsTimerRunning(false);
        setTimerSeconds(0);
        await loadTaskDetails();
        if (onTaskUpdated) onTaskUpdated();
      } catch (err) {
        console.error('Failed to stop timer', err);
      }
    }
  };

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDarkMode ? 'bg-[#0e0e11] border-zinc-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* HEADER */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              #{task?.id ? `TSK-${task.id}` : '...'}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {task?.project_name || task?.project?.name || 'Project Workspace'}
            </span>
            {task?.is_recurring && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recurring ({task.recurrence_interval})
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors ${
              isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading task details & conversations...</p>
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLS: Main content */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Title & Status Pills */}
              <div>
                <h1 className={`text-xl font-bold mb-3 leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {task.title}
                </h1>
                
                {/* Status Switcher Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const isCurrent = task.status === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                          isCurrent 
                            ? `${config.color} border-current ring-4 ring-blue-500/15 shadow-sm scale-105` 
                            : isDarkMode 
                              ? 'bg-zinc-900/60 border-zinc-800 text-slate-400 hover:text-white hover:border-zinc-700' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50/70 border-slate-200/80 shadow-xs'}`}>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description & Scope</h3>
                <p className={`text-xs whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {task.description || 'No description provided for this task.'}
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className={`flex border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
                {[
                  { id: 'subtasks', label: `Subtasks (${task.subtasks?.length || 0})`, icon: CheckSquare },
                  { id: 'comments', label: `Comments (${task.comments?.length || 0})`, icon: MessageSquare },
                  { id: 'history', label: `Activity (${historyLogs?.length || 0})`, icon: Clock },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                        isActive
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENT: SUBTASKS */}
              {activeTab === 'subtasks' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {task.subtasks && task.subtasks.length > 0 ? (
                      task.subtasks.map(sub => (
                        <div 
                          key={sub.id} 
                          className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs transition-all ${
                            sub.status === 'DONE' 
                              ? isDarkMode ? 'bg-zinc-900/30 border-zinc-800 text-slate-500 line-through' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                              : isDarkMode ? 'bg-zinc-900 border-zinc-800 text-slate-200 shadow-xs' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => taskService.updateTaskStatus(sub.id, sub.status === 'DONE' ? 'TODO' : 'DONE').then(loadTaskDetails)}
                              className="text-blue-500 hover:scale-110 transition-transform"
                            >
                              {sub.status === 'DONE' ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-slate-400" />}
                            </button>
                            <span className="font-bold">{sub.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">#SUB-{sub.id}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No checklist subtasks yet. Add one below.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a checklist subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className={`flex-1 px-4 py-2.5 rounded-2xl text-xs font-semibold border outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={submittingSubtask || !newSubtaskTitle.trim()}
                      className="px-4 py-2.5 rounded-2xl text-xs font-bold theme-bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Subtask
                    </button>
                  </form>
                </div>
              )}

              {/* TAB CONTENT: COMMENTS */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {task.comments && task.comments.length > 0 ? (
                      task.comments.map(c => {
                        const commenter = c.user?.first_name 
                          ? `${c.user.first_name} ${c.user.last_name || ''}`.trim()
                          : (c.user?.email || c.user_email || 'Team Member');

                        return (
                          <div 
                            key={c.id} 
                            className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                              c.is_internal 
                                ? isDarkMode ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50 border-amber-200' 
                                : isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                <User className="w-3.5 h-3.5 text-blue-500" />
                                <span>{commenter}</span>
                                {c.is_internal && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 uppercase font-black">
                                    Internal
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            <p className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                              {c.content}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No comments yet. Start the conversation below.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="space-y-2.5">
                    <textarea
                      rows={2}
                      placeholder="Write a message or update..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className={`w-full p-3.5 rounded-2xl text-xs leading-relaxed border outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Internal Note (Team only)</span>
                      </label>
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="px-4 py-2 rounded-2xl text-xs font-bold theme-bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Post Comment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB CONTENT: HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {historyLogs && historyLogs.length > 0 ? (
                    historyLogs.map(h => (
                      <div key={h.id} className={`p-3 rounded-2xl border text-xs flex items-start gap-3 ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{h.action}</span>
                            <span className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {h.old_value && <span className="line-through mr-1 text-rose-500">{h.old_value}</span>}
                            {h.new_value && <span className="text-emerald-500 font-bold">➔ {h.new_value}</span>}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No activity history recorded.</p>
                  )}
                </div>
              )}

            </div>

            {/* RIGHT COL: Metadata & Stopwatch Sidebar */}
            <div className="space-y-4">
              
              {/* LIVE TIMER WIDGET */}
              <div className={`p-5 rounded-2xl border text-center relative overflow-hidden ${
                isTimerRunning 
                  ? 'bg-gradient-to-br from-blue-600/15 to-indigo-600/15 border-blue-500/40' 
                  : isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Live Stopwatch</div>
                <div className="font-mono text-2xl font-black tracking-wider mb-3 text-blue-600 dark:text-blue-400">
                  {formatTimer(timerSeconds)}
                </div>
                <button
                  onClick={handleToggleTimer}
                  className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isTimerRunning
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'theme-bg-primary text-white hover:opacity-95'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isTimerRunning ? 'Stop & Log Time' : 'Start Live Timer'}
                </button>
                <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between font-semibold">
                  <span>Logged: <strong className="text-slate-800 dark:text-slate-200">{task.actual_hours || 0} hrs</strong></span>
                  <span>Estimate: <strong className="text-slate-800 dark:text-slate-200">{task.estimated_hours || 0} hrs</strong></span>
                </div>
              </div>

              {/* Task Meta Attributes */}
              <div className={`p-4 rounded-2xl border space-y-3.5 text-xs ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                
                {/* Priority */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" /> Priority</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${PRIORITY_BADGES[task.priority]?.bg || 'bg-slate-100'}`}>
                    {PRIORITY_BADGES[task.priority]?.label || task.priority}
                  </span>
                </div>

                {/* Assignee */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Assignee</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {task.assignee_name || task.assignee?.email || 'Unassigned'}
                  </span>
                </div>

                {/* Task Type */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Task Type</span>
                  <span className="px-2.5 py-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800 font-bold text-[11px]">
                    {task.task_type || 'TASK'}
                  </span>
                </div>

                {/* Due Date */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Due Date</span>
                  <span className={`font-bold ${
                    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE'
                      ? 'text-rose-500'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </span>
                </div>

                {/* Billable */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Billable</span>
                  <span className={`font-bold ${task.is_billable ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {task.is_billable ? 'Yes (Billable)' : 'No (Internal)'}
                  </span>
                </div>

                {/* Department */}
                {task.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Department</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{task.department}</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Task could not be found.</div>
        )}

        {/* FOOTER */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}`}>
          <div className="text-[11px] text-slate-400">
            Last updated {task?.updated_at ? new Date(task.updated_at).toLocaleString() : ''}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl font-bold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
