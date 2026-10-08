import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line,
  RadialBarChart, RadialBar 
} from 'recharts';
import { 
  TrendingUp, PieChart as PieIcon, BarChart3, CheckCircle2, 
  AlertCircle, Clock, DollarSign, Users, Target, Sparkles, 
  Activity, ShieldAlert, ArrowUpRight, Zap, RefreshCw, Filter,
  Layers, ChevronRight, Check, Flame, Award, Calendar, Repeat,
  FileCheck2, ShieldCheck, HelpCircle
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { StunningSelect, StunningDatePicker } from './StunningSelect';

const STATUS_COLORS = {
  BACKLOG: '#71717a',
  TODO: '#3b82f6',
  IN_PROGRESS: '#6366f1',
  REVIEW: '#f59e0b',
  DONE: '#10b981',
};

const PRIORITY_COLORS = {
  LOW: '#94a3b8',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#f43f5e',
};

const TYPE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'
];

const TIMEFRAME_OPTIONS = [
  { value: 'ALL', label: 'All Time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'WEEKLY', label: 'This Week' },
  { value: 'MONTHLY', label: 'This Month' },
  { value: 'QUARTERLY', label: 'This Quarter (Q1-Q4)' },
  { value: 'SEMI_ANNUALLY', label: 'Semi-Annually (6 Months)' },
  { value: 'ANNUALLY', label: 'This Year (12 Months)' },
  { value: 'CUSTOM', label: 'Custom Date Range' },
];

const TaskAnalyticsView = ({ tasks = [], projects = [], onOpenTaskDetail, onOpenProjectDetail, onOpenCreateTask }) => {
  const { isDarkMode } = useTheme();
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('ALL');
  
  // Custom range
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // 1. Filter tasks by Project and Timeframe
  const scopedTasks = useMemo(() => {
    let result = tasks;

    // Project filter
    if (selectedProjectFilter !== 'ALL') {
      result = result.filter(t => 
        String(t.project) === String(selectedProjectFilter) || 
        String(t.project?.id) === String(selectedProjectFilter)
      );
    }

    // Timeframe filter
    if (selectedTimeframe !== 'ALL') {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      if (selectedTimeframe === 'TODAY') {
        result = result.filter(t => t.due_date === todayStr || (t.created_at && t.created_at.startsWith(todayStr)));
      } else if (selectedTimeframe === 'WEEKLY') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        result = result.filter(t => {
          if (!t.due_date) return false;
          const d = new Date(t.due_date);
          return d >= startOfWeek && d <= endOfWeek;
        });
      } else if (selectedTimeframe === 'MONTHLY') {
        const y = now.getFullYear();
        const m = now.getMonth();
        result = result.filter(t => {
          if (!t.due_date) return false;
          const d = new Date(t.due_date);
          return d.getFullYear() === y && d.getMonth() === m;
        });
      } else if (selectedTimeframe === 'QUARTERLY') {
        const y = now.getFullYear();
        const q = Math.floor(now.getMonth() / 3);
        const qStart = new Date(y, q * 3, 1);
        const qEnd = new Date(y, q * 3 + 3, 0);
        result = result.filter(t => {
          if (!t.due_date) return false;
          const d = new Date(t.due_date);
          return d >= qStart && d <= qEnd;
        });
      } else if (selectedTimeframe === 'SEMI_ANNUALLY') {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        result = result.filter(t => {
          if (!t.due_date) return false;
          const d = new Date(t.due_date);
          return d >= sixMonthsAgo && d <= now;
        });
      } else if (selectedTimeframe === 'ANNUALLY') {
        const y = now.getFullYear();
        result = result.filter(t => {
          if (!t.due_date) return false;
          const d = new Date(t.due_date);
          return d.getFullYear() === y;
        });
      } else if (selectedTimeframe === 'CUSTOM' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        result = result.filter(t => {
          if (!t.due_date) return false;
          const d = new Date(t.due_date);
          return d >= start && d <= end;
        });
      }
    }

    return result;
  }, [tasks, selectedProjectFilter, selectedTimeframe, customStartDate, customEndDate]);

  // Scoped projects
  const scopedProjects = useMemo(() => {
    if (selectedProjectFilter === 'ALL') return projects;
    return projects.filter(p => String(p.id) === String(selectedProjectFilter));
  }, [projects, selectedProjectFilter]);

  // 1. Status Distribution
  const statusData = useMemo(() => {
    const counts = { BACKLOG: 0, TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
    scopedTasks.forEach(t => {
      const s = t.status || 'TODO';
      counts[s] = (counts[s] || 0) + 1;
    });
    return [
      { name: 'Backlog', value: counts.BACKLOG, color: STATUS_COLORS.BACKLOG },
      { name: 'To Do', value: counts.TODO, color: STATUS_COLORS.TODO },
      { name: 'In Progress', value: counts.IN_PROGRESS, color: STATUS_COLORS.IN_PROGRESS },
      { name: 'In Review', value: counts.REVIEW, color: STATUS_COLORS.REVIEW },
      { name: 'Done', value: counts.DONE, color: STATUS_COLORS.DONE },
    ].filter(d => d.value > 0);
  }, [scopedTasks]);

  // 2. Priority Distribution
  const priorityData = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    scopedTasks.forEach(t => {
      const p = t.priority || 'MEDIUM';
      counts[p] = (counts[p] || 0) + 1;
    });
    return [
      { name: 'Low', count: counts.LOW, fill: PRIORITY_COLORS.LOW },
      { name: 'Medium', count: counts.MEDIUM, fill: PRIORITY_COLORS.MEDIUM },
      { name: 'High', count: counts.HIGH, fill: PRIORITY_COLORS.HIGH },
      { name: 'Urgent', count: counts.URGENT, fill: PRIORITY_COLORS.URGENT },
    ];
  }, [scopedTasks]);

  // 3. Project Budget vs Actual Hours
  const projectHoursData = useMemo(() => {
    return scopedProjects.slice(0, 8).map(p => ({
      name: p.name.length > 14 ? p.name.slice(0, 14) + '...' : p.name,
      Budget: parseFloat(p.budget_hours) || 0,
      Logged: parseFloat(p.actual_hours) || 0,
      Capital: parseFloat(p.budget_amount) || 0,
    }));
  }, [scopedProjects]);

  // 4. Task Type Breakdown
  const typeData = useMemo(() => {
    const counts = {};
    scopedTasks.forEach(t => {
      const type = t.task_type || 'TASK';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: TYPE_COLORS[i % TYPE_COLORS.length]
    }));
  }, [scopedTasks]);

  // 5. Team Member Workload Breakdown
  const teamWorkloadData = useMemo(() => {
    const memberMap = {};
    scopedTasks.forEach(t => {
      const name = t.assignee_details?.first_name 
        ? `${t.assignee_details.first_name} ${t.assignee_details.last_name || ''}`.trim()
        : (t.assignee_name || t.assignee?.email || 'Unassigned');
      
      if (!memberMap[name]) {
        memberMap[name] = { name, total: 0, completed: 0, hours: 0 };
      }
      memberMap[name].total += 1;
      if (t.status === 'DONE') memberMap[name].completed += 1;
      memberMap[name].hours += parseFloat(t.actual_hours) || 0;
    });
    return Object.values(memberMap).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [scopedTasks]);

  // 6. Department / Functional Breakdown
  const departmentData = useMemo(() => {
    const deptMap = {};
    scopedTasks.forEach(t => {
      const dept = t.department || 'General';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    return Object.entries(deptMap).map(([name, count]) => ({ name, count }));
  }, [scopedTasks]);

  // 7. Velocity / Cumulative Completion Trendline
  const velocityTrendData = useMemo(() => {
    const sorted = [...scopedTasks]
      .filter(t => t.completed_at || t.created_at)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let runningCompleted = 0;
    let runningCreated = 0;

    const map = {};
    sorted.forEach(t => {
      const dateKey = (t.created_at || '').split('T')[0] || 'Earlier';
      if (!map[dateKey]) map[dateKey] = { date: dateKey, created: 0, completed: 0 };
      map[dateKey].created += 1;
      if (t.status === 'DONE') map[dateKey].completed += 1;
    });

    return Object.values(map).slice(-10).map(item => {
      runningCreated += item.created;
      runningCompleted += item.completed;
      return {
        date: item.date.slice(5), // MM-DD
        Created: runningCreated,
        Completed: runningCompleted,
      };
    });
  }, [scopedTasks]);

  // High-Level Calculation Metrics
  const totalTasks = scopedTasks.length;
  const completedTasks = scopedTasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = scopedTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = scopedTasks.filter(t => t.status === 'REVIEW').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const overdueTasksList = scopedTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE');
  const overdueCount = overdueTasksList.length;
  const overdueRate = totalTasks > 0 ? Math.round((overdueCount / totalTasks) * 100) : 0;

  const totalActualHours = scopedTasks.reduce((sum, t) => sum + (parseFloat(t.actual_hours) || 0), 0);
  const totalEstimatedHours = scopedTasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
  const totalBillableHours = scopedTasks.reduce((sum, t) => sum + (t.is_billable ? (parseFloat(t.actual_hours) || 0) : 0), 0);
  const billableRate = totalActualHours > 0 ? Math.round((totalBillableHours / totalActualHours) * 100) : 100;

  const totalProjectBudgetAmount = scopedProjects.reduce((sum, p) => sum + (parseFloat(p.budget_amount) || 0), 0);
  const totalBudgetHours = scopedProjects.reduce((sum, p) => sum + (parseFloat(p.budget_hours) || 0), 0);

  // Financial Value (Assuming standard $100/hr blended billable rate)
  const estimatedBillableValue = totalBillableHours * 100;

  // Recurring automation count
  const recurringTasksCount = scopedTasks.filter(t => t.is_recurring).length;

  const tooltipBg = isDarkMode ? '#18181b' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#27272a' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f4f4f5' : '#0f172a';

  const projectFilterOptions = [
    { value: 'ALL', label: 'All Projects & Workspaces' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* FILTER & TIMEFRAME BAR (MOBILE & DESKTOP RESPONSIVE) */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl theme-bg-light theme-text-primary shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Executive Analytics & Performance Intelligence
            </h2>
            <p className="text-xs text-slate-400">
              Multi-timeframe forecasting, resource utilization, velocity burnup, and SLA exposure.
            </p>
          </div>
        </div>

        {/* CONTROLS: TIMEFRAME + PROJECT + CUSTOM DATE */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Dropdown */}
          <div className="min-w-[180px] flex-1 sm:flex-initial">
            <StunningSelect
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              options={TIMEFRAME_OPTIONS}
            />
          </div>

          {/* Project Dropdown */}
          <div className="min-w-[210px] flex-1 sm:flex-initial">
            <StunningSelect
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              options={projectFilterOptions}
            />
          </div>

          {/* Custom Date Pickers (Shown if CUSTOM selected) */}
          {selectedTimeframe === 'CUSTOM' && (
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0 animate-in fade-in duration-150">
              <div className="w-36">
                <StunningDatePicker
                  placeholder="Start Date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <span className="text-xs text-slate-400">to</span>
              <div className="w-36">
                <StunningDatePicker
                  placeholder="End Date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6 EXECUTIVE KPI GAUGE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Velocity */}
        <div className={`p-4 rounded-3xl border transition-all duration-200 hover:shadow-lg ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Velocity</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {completionRate}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-semibold truncate">
            {completedTasks} of {totalTasks} closed
          </div>
        </div>

        {/* KPI 2: Billable Ratio */}
        <div className={`p-4 rounded-3xl border transition-all duration-200 hover:shadow-lg ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Billable Ratio</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">
            {billableRate}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 mt-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${billableRate}%` }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-semibold truncate">
            {totalBillableHours.toFixed(1)} billable hrs
          </div>
        </div>

        {/* KPI 3: Overdue SLA Exposure */}
        <div className={`p-4 rounded-3xl border transition-all duration-200 hover:shadow-lg ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>SLA At Risk</span>
            <ShieldAlert className={`w-3.5 h-3.5 ${overdueCount > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-2xl font-black mt-1.5 ${overdueCount > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
            {overdueCount}
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 mt-2 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(overdueRate, 100)}%` }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-semibold truncate">
            {overdueRate}% overdue rate
          </div>
        </div>

        {/* KPI 4: Logged vs Estimated Hours */}
        <div className={`p-4 rounded-3xl border transition-all duration-200 hover:shadow-lg ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Logged Hours</span>
            <Clock className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">
            {totalActualHours.toFixed(1)}h
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 mt-2 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((totalActualHours / (totalEstimatedHours || 1)) * 100, 100)}%` }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-semibold truncate">
            {totalEstimatedHours.toFixed(1)}h est.
          </div>
        </div>

        {/* KPI 5: Active Pipeline */}
        <div className={`p-4 rounded-3xl border transition-all duration-200 hover:shadow-lg ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>In-Flight</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500 mt-1.5">
            {inProgressTasks + inReviewTasks}
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 mt-2 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(((inProgressTasks + inReviewTasks) / (totalTasks || 1)) * 100, 100)}%` }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-semibold truncate">
            {inProgressTasks} active, {inReviewTasks} review
          </div>
        </div>

        {/* KPI 6: Recurring Automation */}
        <div className={`p-4 rounded-3xl border transition-all duration-200 hover:shadow-lg ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Recurring</span>
            <Repeat className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {recurringTasksCount}
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 font-semibold truncate">
            Active recurring schedules
          </div>
        </div>

      </div>

      {/* CHARTS ROW 1: STATUS DISTRIBUTION & PRIORITY DENSITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CHART 1: DONUT STATUS BREAKDOWN */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-500" /> Task Status Distribution
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Live workload balance across stages ({selectedTimeframe})</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
              {totalTasks} Tasks
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderColor: tooltipBorder, 
                      borderRadius: '16px',
                      color: tooltipText,
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                    }} 
                  />
                  <Legend 
                    formatter={(val) => <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{val}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 italic">No task data for this timeframe</div>
            )}
          </div>
        </div>

        {/* CHART 2: PRIORITY DENSITY BAR CHART */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" /> Urgency & Priority Density
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Tasks segmented by severity and impact</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke={isDarkMode ? '#71717a' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDarkMode ? '#71717a' : '#94a3b8'} fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: isDarkMode ? '#27272a33' : '#f1f5f9' }}
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '16px',
                    color: tooltipText,
                    fontSize: '12px',
                    fontWeight: 700,
                  }} 
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CHARTS ROW 2: VELOCITY BURNUP TRENDLINE (AREA CHART) */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${
        isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Velocity & Delivery Burnup Trendline
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Cumulative comparison of tasks created vs tasks resolved</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-blue-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Created ({totalTasks})
            </span>
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed ({completedTasks})
            </span>
          </div>
        </div>

        <div className="h-64">
          {velocityTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityTrendData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke={isDarkMode ? '#71717a' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDarkMode ? '#71717a' : '#94a3b8'} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '16px',
                    color: tooltipText,
                    fontSize: '12px',
                    fontWeight: 700,
                  }} 
                />
                <Area type="monotone" dataKey="Created" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No historical trend data available
            </div>
          )}
        </div>
      </div>

      {/* CHARTS ROW 3: PROJECT HOURS BURN RATE (FULL WIDTH) */}
      <div className={`p-5 sm:p-6 rounded-3xl border ${
        isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Project Workload & Hours Burn Rate
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Estimated budget allocation vs actual logged hours per active project</p>
          </div>
          <div className="text-xs font-bold text-slate-500">
            Total Burn: <span className="theme-text-primary">{totalActualHours.toFixed(1)} / {totalBudgetHours.toFixed(1)} hrs</span>
          </div>
        </div>

        <div className="h-72">
          {projectHoursData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectHoursData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <XAxis dataKey="name" stroke={isDarkMode ? '#71717a' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDarkMode ? '#71717a' : '#94a3b8'} fontSize={11} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: isDarkMode ? '#27272a33' : '#f1f5f9' }}
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder, 
                    borderRadius: '16px',
                    color: tooltipText,
                    fontSize: '12px',
                    fontWeight: 700,
                  }} 
                />
                <Legend formatter={(val) => <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{val}</span>} />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Budget Hours" />
                <Bar dataKey="Logged" fill="#10b981" radius={[8, 8, 0, 0]} name="Actual Logged Hours" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No project budget data available
            </div>
          )}
        </div>
      </div>

      {/* CHARTS ROW 4: TEAM WORKLOAD & TASK TYPE DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* TEAM WORKLOAD TABLE & EFFORT BREAKDOWN */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> Team Capacity & Execution Leaderboard
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Tasks assigned, completed, and logged time per member</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className={`text-[10px] font-bold text-slate-400 uppercase ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                <tr>
                  <th className="pb-3">Assignee</th>
                  <th className="pb-3">Assigned</th>
                  <th className="pb-3">Completed</th>
                  <th className="pb-3">Hours Logged</th>
                  <th className="pb-3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {teamWorkloadData.length > 0 ? (
                  teamWorkloadData.map((member, i) => {
                    const rate = member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                        <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full theme-bg-light theme-text-primary text-[10px] font-bold flex items-center justify-center">
                            {member.name[0].toUpperCase()}
                          </div>
                          <span>{member.name}</span>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-600 dark:text-slate-400">{member.total} tasks</td>
                        <td className="py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{member.completed} closed</td>
                        <td className="py-2.5 font-bold text-blue-600 dark:text-blue-400">{member.hours.toFixed(1)} hrs</td>
                        <td className="py-2.5 text-right font-black">
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] ${
                            rate >= 80 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
                            rate >= 50 ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                            'bg-slate-100 dark:bg-zinc-800 text-slate-600'
                          }`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">No assigned team data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TASK TYPE CLASSIFICATION & DEPARTMENT BREAKDOWN */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${
          isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-500" /> Task Type & Functional Distribution
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Classification by Feature, Bug, Epic, and Subtask</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {typeData.map(t => (
              <div key={t.name} className={`p-3 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{t.value}</span>
              </div>
            ))}
          </div>

          {/* Department Breakdown list */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Department Allocation</div>
            <div className="space-y-2">
              {departmentData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full theme-bg-primary rounded-full" style={{ width: `${Math.min((d.count / (totalTasks || 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="font-bold text-[11px] text-slate-500">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* OVERDUE BLOCKERS & HIGH RISK RADAR (IF ANY OVERDUE) */}
      {overdueTasksList.length > 0 && (
        <div className={`p-5 sm:p-6 rounded-3xl border border-rose-500/30 ${
          isDarkMode ? 'bg-rose-950/10' : 'bg-rose-50/50'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Critical Blockers & Overdue Backlog ({overdueTasksList.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 self-start sm:self-auto">
              Immediate Attention Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueTasksList.slice(0, 6).map(t => (
              <div key={t.id} onClick={() => onOpenTaskDetail && onOpenTaskDetail(t.id)} className={`p-3.5 rounded-2xl border text-xs cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-150 ${
                isDarkMode ? 'bg-[#15151c] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[10px] text-rose-500">
                    Due: {new Date(t.due_date).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">#{t.id}</span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">{t.title}</h4>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      const pId = t.project_id || (typeof t.project === 'object' ? t.project?.id : t.project);
                      if (pId && onOpenProjectDetail) onOpenProjectDetail(pId);
                    }}
                    className="hover:underline font-bold text-blue-600 dark:text-blue-400"
                  >
                    📁 {t.project_name || 'Project'}
                  </span>
                  <span>👤 {t.assignee_name || 'Unassigned'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default TaskAnalyticsView;
