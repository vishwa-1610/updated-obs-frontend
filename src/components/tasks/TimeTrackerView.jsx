import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, DollarSign, Calendar, CheckCircle2, 
  Loader2, Plus, Sparkles, Filter 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';
import { StunningSelect } from './StunningSelect';

const TimeTrackerView = ({ tasks = [], onOpenTaskDetail, onOpenProjectDetail }) => {
  const { isDarkMode } = useTheme();
  const [activeTaskId, setActiveTaskId] = useState(tasks[0]?.id || '');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = async () => {
    if (!activeTaskId) {
      alert('Select a task first to track time.');
      return;
    }
    if (!isTimerRunning) {
      try {
        await taskService.startTimer(activeTaskId);
        setIsTimerRunning(true);
      } catch (err) {
        console.error('Failed to start timer', err);
      }
    } else {
      try {
        await taskService.stopTimer(activeTaskId, { description: `Logged via Time Tracker tab (${Math.ceil(seconds/60)} min)` });
        setIsTimerRunning(false);
        setSeconds(0);
      } catch (err) {
        console.error('Failed to stop timer', err);
      }
    }
  };

  const totalBillableHours = tasks.reduce((sum, t) => sum + (t.is_billable ? (parseFloat(t.actual_hours) || 0) : 0), 0);
  const totalLoggedHours = tasks.reduce((sum, t) => sum + (parseFloat(t.actual_hours) || 0), 0);

  const taskOptions = [
    { value: '', label: '-- Choose Task to Track --' },
    ...tasks.map(t => ({ value: t.id, label: `#${t.id} - ${t.title} (${t.project_name || 'Workspace'})` }))
  ];

  return (
    <div className="space-y-5">
      
      {/* HERO TIMER CARD */}
      <div className={`p-6 rounded-3xl border text-center relative overflow-hidden ${
        isTimerRunning 
          ? 'bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border-blue-500/40 shadow-2xl' 
          : isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isTimerRunning ? '⚡ Active Stopwatch Recording' : 'Start Task Time Tracker'}
          </div>

          <div className="font-mono text-4xl font-black text-blue-600 dark:text-blue-400 tracking-wider">
            {formatTimer(seconds)}
          </div>

          {/* Task Selector with StunningSelect */}
          <div className="text-left">
            <StunningSelect
              value={activeTaskId}
              onChange={(e) => !isTimerRunning && setActiveTaskId(e.target.value)}
              options={taskOptions}
              placeholder="Choose Task to Track"
            />
          </div>

          {/* Start / Stop Button */}
          <button
            onClick={handleToggleTimer}
            className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
              isTimerRunning 
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'theme-bg-primary text-white hover:opacity-90'
            }`}
          >
            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isTimerRunning ? 'Stop Recording & Submit Log' : 'Start Timer for Selected Task'}
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-xs font-bold uppercase text-slate-400">Total Hours Tracked</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            {totalLoggedHours.toFixed(1)} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-xs font-bold uppercase text-slate-400">Billable Hours</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalBillableHours.toFixed(1)} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="text-xs font-bold uppercase text-slate-400">Billable Ratio</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {totalLoggedHours > 0 ? ((totalBillableHours / totalLoggedHours) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* TASKS HOURS TABLE */}
      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'}`}>
        <div className={`px-5 py-3 border-b text-xs font-bold uppercase tracking-wider text-slate-400 ${
          isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50 border-slate-100'
        }`}>
          Hours Logged By Task
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`text-[11px] font-bold text-slate-400 uppercase ${
              isDarkMode ? 'bg-zinc-900/20' : 'bg-slate-50/50'
            }`}>
              <tr>
                <th className="px-5 py-2.5">Task</th>
                <th className="px-5 py-2.5">Project</th>
                <th className="px-5 py-2.5">Estimated</th>
                <th className="px-5 py-2.5">Actual Logged</th>
                <th className="px-5 py-2.5">Billable</th>
                <th className="px-5 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {tasks.map(t => (
                <tr key={t.id} className={`hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors`}>
                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">
                    #{t.id} {t.title}
                  </td>
                  <td 
                    onClick={() => {
                      const pId = t.project_id || (typeof t.project === 'object' ? t.project?.id : t.project);
                      if (pId && onOpenProjectDetail) onOpenProjectDetail(pId);
                    }}
                    className="px-5 py-3 text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-medium"
                  >
                    {t.project_name || 'Project'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {t.estimated_hours || 0} hrs
                  </td>
                  <td className="px-5 py-3 font-bold text-blue-600 dark:text-blue-400">
                    {t.actual_hours || 0} hrs
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.is_billable 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                    }`}>
                      {t.is_billable ? 'Billable' : 'Internal'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onOpenTaskDetail(t.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold theme-bg-light theme-text-primary hover:opacity-90"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TimeTrackerView;
