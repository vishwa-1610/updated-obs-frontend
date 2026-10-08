import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Play, Pause, AlertCircle, Calendar, 
  Flag, Tag, ChevronDown, ChevronRight, Loader2, Sparkles, Send, RefreshCw
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';

const MyTasks = ({ onOpenTaskDetail, onOpenProjectDetail, onOpenCreateTask }) => {
  const { isDarkMode } = useTheme();
  const [pendingData, setPendingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTimerTaskId, setActiveTimerTaskId] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    loadPendingCenter();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTimerTaskId) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerTaskId]);

  const loadPendingCenter = async () => {
    setLoading(true);
    try {
      const res = await taskService.getMyPendingTasks();
      setPendingData(res.data);
    } catch (err) {
      console.error('Failed to load pending center', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDone = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      loadPendingCenter();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleToggleTimer = async (taskId) => {
    if (activeTimerTaskId === taskId) {
      try {
        await taskService.stopTimer(taskId, { description: `Stopwatch entry (${Math.ceil(timerSeconds/60)} min)` });
        setActiveTimerTaskId(null);
        setTimerSeconds(0);
        loadPendingCenter();
      } catch (err) {
        console.error('Failed to stop timer', err);
      }
    } else {
      if (activeTimerTaskId) {
        await taskService.stopTimer(activeTimerTaskId).catch(() => {});
      }
      try {
        await taskService.startTimer(taskId);
        setActiveTimerTaskId(taskId);
        setTimerSeconds(0);
      } catch (err) {
        console.error('Failed to start timer', err);
      }
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTaskRow = (task, isOverdue = false) => {
    const isRunning = activeTimerTaskId === task.id;
    return (
      <div 
        key={task.id}
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all duration-150 ${
          isDarkMode 
            ? 'bg-[#15151c] border-zinc-800 hover:border-zinc-700' 
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        {/* Checkbox & Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => handleToggleDone(task.id, task.status)}
            className="text-slate-400 hover:text-emerald-500 transition-colors"
          >
            {task.status === 'DONE' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-zinc-700 hover:border-emerald-500" />
            )}
          </button>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenTaskDetail(task.id)}>
            <div className="flex items-center gap-2">
              <h4 className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                {task.title}
              </h4>
              <span className="text-[10px] font-mono text-slate-400">#{task.id}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  const pId = task.project_id || (typeof task.project === 'object' ? task.project?.id : task.project);
                  if (pId && onOpenProjectDetail) onOpenProjectDetail(pId);
                }}
                className="hover:underline cursor-pointer text-blue-600 dark:text-blue-400 font-medium"
              >
                📁 {task.project_name || 'Project'}
              </span>
              <span>•</span>
              <span className={`font-semibold ${isOverdue ? 'text-rose-500' : ''}`}>
                📅 {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
              </span>
            </div>
          </div>
        </div>

        {/* Stopwatch & Action */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="font-mono text-xs font-bold text-rose-500 animate-pulse">
              {formatTimer(timerSeconds)}
            </span>
          )}

          <button
            onClick={() => handleToggleTimer(task.id)}
            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              isRunning
                ? 'bg-rose-600 text-white animate-pulse'
                : 'theme-bg-light theme-text-primary hover:opacity-90'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading your personalized task center...</p>
      </div>
    );
  }

  const overdueList = pendingData?.overdue || [];
  const dueTodayList = pendingData?.due_today || [];
  const thisWeekList = pendingData?.this_week || [];
  const otherPendingList = pendingData?.other_pending || [];

  return (
    <div className="space-y-6">
      
      {/* SUMMARY BANNER */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl font-black text-rose-500">{overdueList.length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Overdue</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800" />
          <div className="text-center">
            <div className="text-xl font-black text-amber-500">{dueTodayList.length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Due Today</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800" />
          <div className="text-center">
            <div className="text-xl font-black text-blue-500">{thisWeekList.length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">This Week</div>
          </div>
        </div>

        <button
          onClick={loadPendingCenter}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold theme-bg-light theme-text-primary hover:opacity-90 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Center
        </button>
      </div>

      {/* OVERDUE SECTION */}
      {overdueList.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500">
            <AlertCircle className="w-4 h-4" />
            <span>Overdue Tasks ({overdueList.length})</span>
          </div>
          <div className="space-y-2">
            {overdueList.map(t => renderTaskRow(t, true))}
          </div>
        </div>
      )}

      {/* DUE TODAY SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
          <Clock className="w-4 h-4" />
          <span>Due Today ({dueTodayList.length})</span>
        </div>
        {dueTodayList.length === 0 ? (
          <div className={`p-4 rounded-xl border text-center text-xs text-slate-400 italic ${
            isDarkMode ? 'bg-[#121217]/50 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            No tasks due today. You are all caught up!
          </div>
        ) : (
          <div className="space-y-2">
            {dueTodayList.map(t => renderTaskRow(t))}
          </div>
        )}
      </div>

      {/* THIS WEEK SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-500">
          <Calendar className="w-4 h-4" />
          <span>This Week ({thisWeekList.length})</span>
        </div>
        {thisWeekList.length === 0 ? (
          <div className={`p-4 rounded-xl border text-center text-xs text-slate-400 italic ${
            isDarkMode ? 'bg-[#121217]/50 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            No upcoming tasks this week.
          </div>
        ) : (
          <div className="space-y-2">
            {thisWeekList.map(t => renderTaskRow(t))}
          </div>
        )}
      </div>

      {/* OTHER PENDING */}
      {otherPendingList.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Later & Backlog ({otherPendingList.length})
          </div>
          <div className="space-y-2">
            {otherPendingList.map(t => renderTaskRow(t))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MyTasks;
