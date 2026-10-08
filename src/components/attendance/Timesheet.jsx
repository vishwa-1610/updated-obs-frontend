import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Plus, CheckCircle2, Clock, Send, 
  Check, X, FileText, ChevronLeft, ChevronRight, Calendar,
  Sparkles, AlertCircle, ArrowRight, ShieldCheck, DollarSign,
  TrendingUp, Layers, UserCheck, Trash2, Tag, Briefcase,
  ListTodo, Filter, Play, CheckCircle
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { attendanceService } from '../../services/attendanceService';
import { 
  StunningSelect, 
  StunningDatePicker, 
  StunningTimePicker,
  StatusBadge, 
  FeedbackModal,
  extractErrorMessage 
} from './AttendanceComponents';

export const Timesheet = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'hourly'
  
  // Data states
  const [timesheets, setTimesheets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Hourly filter
  const [activityDateFilter, setActivityDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Calculate default current week start (Monday) and end (Sunday)
  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMonday));
    const sunday = new Date(today.setDate(monday.getDate() + 6));
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  const defaultRange = getWeekRange();
  
  // Timesheet Form
  const [createForm, setCreateForm] = useState({
    start_date: defaultRange.start,
    end_date: defaultRange.end,
    total_regular_hours: '40.00',
    total_overtime_hours: '0.00',
    manager_notes: ''
  });

  // Activity Log Form
  const [activityForm, setActivityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '11:00',
    project: '',
    category: 'Development',
    task_description: ''
  });

  const categoryOptions = [
    { value: 'Development', label: '💻 Development', color: '#2563eb' },
    { value: 'Meeting', label: '🤝 Meeting & Discussion', color: '#8b5cf6' },
    { value: 'Documentation', label: '📄 Documentation', color: '#06b6d4' },
    { value: 'Support', label: '🎧 Client Support', color: '#f59e0b' },
    { value: 'Testing', label: '🧪 Testing & QA', color: '#10b981' },
    { value: 'Design', label: '🎨 UI/UX Design', color: '#ec4899' },
    { value: 'Other', label: '📌 Other Activity', color: '#64748b' }
  ];

  // Fetch functions
  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getMyTimesheets();
      setTimesheets(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load timesheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await attendanceService.getActivityLogs({ date: activityDateFilter || undefined });
      setActivities(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'weekly') {
      fetchTimesheets();
    } else {
      fetchActivities();
    }
  }, [activeTab, activityDateFilter]);

  // Timesheet Handlers
  const handleCreateTimesheet = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        start_date: createForm.start_date,
        end_date: createForm.end_date,
        total_regular_hours: parseFloat(createForm.total_regular_hours) || 0,
        total_overtime_hours: parseFloat(createForm.total_overtime_hours) || 0,
        manager_notes: createForm.manager_notes
      };
      await attendanceService.createTimesheet(payload);
      setShowCreateModal(false);
      fetchTimesheets();
      setFeedback({ 
        isOpen: true, 
        title: 'Timesheet Drafted', 
        message: 'Weekly timesheet created. You can now submit it for manager approval.', 
        type: 'success' 
      });
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Failed to create timesheet. Verify dates and entries.');
      setFeedback({ isOpen: true, title: 'Creation Error', message: errorMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    try {
      const range = getWeekRange();
      await attendanceService.createTimesheet({
        start_date: range.start,
        end_date: range.end
      });
      fetchTimesheets();
      setFeedback({
        isOpen: true,
        title: 'Timesheet Auto-Compiled',
        message: 'Current week timesheet was compiled automatically from your attendance punches!',
        type: 'success'
      });
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Failed to auto-generate timesheet.');
      setFeedback({ isOpen: true, title: 'Error', message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTimesheet = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await attendanceService.submitTimesheet(id);
      fetchTimesheets();
      setFeedback({ 
        isOpen: true, 
        title: 'Timesheet Submitted', 
        message: 'Timesheet has been forwarded to your manager for payroll verification.', 
        type: 'success' 
      });
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Failed to submit timesheet.');
      setFeedback({ isOpen: true, title: 'Submission Error', message: errorMsg, type: 'error' });
    }
  };

  // Activity Log Handlers
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await attendanceService.createActivityLog(activityForm);
      setShowActivityModal(false);
      setActivityForm({
        date: activityDateFilter || new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '11:00',
        project: '',
        category: 'Development',
        task_description: ''
      });
      fetchActivities();
      setFeedback({
        isOpen: true,
        title: 'Activity Logged',
        message: 'Hour-by-hour activity record added to your daily timeline.',
        type: 'success'
      });
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Failed to log activity entry.');
      setFeedback({ isOpen: true, title: 'Error', message: errorMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await attendanceService.deleteActivityLog(id);
      fetchActivities();
      setFeedback({ isOpen: true, title: 'Activity Deleted', message: 'Activity entry was removed.', type: 'info' });
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Failed to delete entry.');
      setFeedback({ isOpen: true, title: 'Error', message: errorMsg, type: 'error' });
    }
  };

  // Metrics
  const totalRegular = timesheets.reduce((acc, t) => acc + (parseFloat(t.total_regular_hours) || 0), 0);
  const totalOvertime = timesheets.reduce((acc, t) => acc + (parseFloat(t.total_overtime_hours) || 0), 0);
  const pendingCount = timesheets.filter(t => t.status === 'PENDING').length;
  const approvedCount = timesheets.filter(t => t.status === 'APPROVED').length;

  const filteredActivities = categoryFilter === 'ALL'
    ? activities
    : activities.filter(a => a.category === categoryFilter);

  const totalActivityHours = filteredActivities.reduce((acc, a) => acc + (parseFloat(a.hours_spent) || 0), 0);

  return (
    <div className="space-y-6">
      {/* HEADER & SUB-TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Time Tracking & Timesheet Management
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Manage weekly payroll sign-offs and track granular hour-by-hour project activity logs
          </p>
        </div>

        {/* Action Buttons based on active tab */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab === 'weekly' ? (
            <>
              <button
                onClick={handleAutoGenerate}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                  isDarkMode 
                    ? 'bg-[#18181b] border-zinc-700 text-slate-200 hover:bg-zinc-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <Sparkles size={15} className="text-amber-500" /> Auto-Compile Week
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-bg-primary text-white font-bold text-xs shadow-lg theme-shadow-primary hover:opacity-95 transition-all"
              >
                <Plus size={16} /> Create Timesheet
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-bg-primary text-white font-bold text-xs shadow-lg theme-shadow-primary hover:opacity-95 transition-all"
            >
              <Plus size={16} /> Log Hour Block
            </button>
          )}
        </div>
      </div>

      {/* TOP SUB-TAB PILL SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'weekly'
              ? 'theme-bg-primary text-white shadow-md theme-shadow-primary'
              : isDarkMode
                ? 'bg-zinc-900/60 text-slate-400 hover:text-white hover:bg-zinc-800'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <ClipboardList size={16} /> Weekly Payroll Timesheets
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'weekly' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
          }`}>
            {timesheets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hourly')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'hourly'
              ? 'theme-bg-primary text-white shadow-md theme-shadow-primary'
              : isDarkMode
                ? 'bg-zinc-900/60 text-slate-400 hover:text-white hover:bg-zinc-800'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Clock size={16} /> Hour-by-Hour Activity Logs
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'hourly' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
          }`}>
            {activities.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WEEKLY PAYROLL TIMESHEETS */}
      {/* ========================================================================= */}
      {activeTab === 'weekly' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* METRICS SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 sm:p-5 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tracked</span>
                <div className="w-8 h-8 rounded-lg theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                  <Clock size={16} />
                </div>
              </div>
              <p className="text-xl font-black font-mono">{(totalRegular + totalOvertime).toFixed(1)} hrs</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Across all recorded periods</p>
            </div>

            <div className={`p-4 sm:p-5 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Regular Hours</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="text-xl font-black font-mono text-emerald-500">{totalRegular.toFixed(1)} hrs</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Standard base payroll</p>
            </div>

            <div className={`p-4 sm:p-5 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overtime Hours</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-xl font-black font-mono text-purple-500">{totalOvertime.toFixed(1)} hrs</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Premium rate hours</p>
            </div>

            <div className={`p-4 sm:p-5 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approval Status</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <p className="text-xl font-black font-mono">{approvedCount} Approved</p>
              <p className="text-[11px] text-amber-500 font-medium mt-0.5">{pendingCount} Pending Review</p>
            </div>
          </div>

          {/* TIMESHEET TABLE */}
          <div className={`rounded-3xl border overflow-hidden ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    My Timesheet Logs ({timesheets.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">Click any row to inspect timesheet breakdown</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
                    isDarkMode ? 'bg-[#18181b]/70 border-[#27272a] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <th className="py-3.5 px-4">Work Period</th>
                    <th className="py-3.5 px-4">Regular Hours</th>
                    <th className="py-3.5 px-4">Overtime Hours</th>
                    <th className="py-3.5 px-4">Total Hours</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Manager Remarks</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {timesheets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <FileText size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-sm">No timesheets generated yet</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Click 'Create Timesheet' or 'Auto-Compile Week' above to begin</p>
                      </td>
                    </tr>
                  ) : (
                    timesheets.map((ts) => {
                      const reg = parseFloat(ts.total_regular_hours) || 0;
                      const ot = parseFloat(ts.total_overtime_hours) || 0;
                      const total = reg + ot;

                      return (
                        <tr 
                          key={ts.id}
                          onClick={() => setSelectedTimesheet(ts)}
                          className={`cursor-pointer transition-colors group ${
                            isDarkMode ? 'hover:bg-[#18181b]/70' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="theme-text-primary shrink-0" />
                              <span className="font-mono">{ts.start_date} &rarr; {ts.end_date}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold">
                            {reg.toFixed(2)} hrs
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-purple-500">
                            {ot.toFixed(2)} hrs
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-xs">
                              {total.toFixed(2)} hrs
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={ts.status || 'DRAFT'} />
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 italic truncate max-w-xs">
                            {ts.manager_notes || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {ts.status === 'DRAFT' ? (
                              <button
                                type="button"
                                onClick={(e) => handleSubmitTimesheet(ts.id, e)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg theme-bg-primary hover:opacity-90 text-white font-bold text-[11px] shadow-sm theme-shadow-primary transition-all"
                              >
                                <Send size={12} /> Submit
                              </button>
                            ) : (
                              <span className="theme-text-primary font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                Details &rarr;
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOUR-BY-HOUR ACTIVITY LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'hourly' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* HOURLY METRICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className={`p-4 sm:p-5 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Hours on Date</span>
                <div className="w-8 h-8 rounded-lg theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                  <Clock size={16} />
                </div>
              </div>
              <p className="text-xl font-black font-mono theme-text-primary">{totalActivityHours.toFixed(2)} hrs</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{filteredActivities.length} Activity blocks recorded</p>
            </div>

            <div className={`p-4 sm:p-5 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Date Filter</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <Calendar size={16} />
                </div>
              </div>
              <p className="text-sm font-black font-mono mt-1 text-emerald-500">{activityDateFilter || 'All Dates'}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Filtering activity entries</p>
            </div>

            <div className={`p-4 sm:p-5 rounded-3xl border col-span-2 sm:col-span-1 ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Category</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <Tag size={16} />
                </div>
              </div>
              <p className="text-sm font-black mt-1 text-purple-500">{categoryFilter === 'ALL' ? 'All Categories' : categoryFilter}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Filter by activity category</p>
            </div>
          </div>

          {/* DATE & CATEGORY CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border bg-slate-50/50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-48">
                <StunningDatePicker
                  value={activityDateFilter}
                  onChange={(val) => setActivityDateFilter(val)}
                  placeholder="Select Date"
                  isDarkMode={isDarkMode}
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {['ALL', 'Development', 'Meeting', 'Support', 'Testing', 'Design'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      categoryFilter === cat
                        ? 'theme-bg-primary text-white shadow-sm theme-shadow-primary'
                        : isDarkMode
                          ? 'bg-zinc-800 text-slate-300 hover:text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl theme-bg-primary text-white font-bold text-xs shadow-md theme-shadow-primary hover:opacity-90 transition-all"
            >
              <Plus size={15} /> Log Hour Block
            </button>
          </div>

          {/* ACTIVITY LOGS LIST / TABLE */}
          <div className={`rounded-3xl border overflow-hidden ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Hour-by-Hour Activity Breakdown ({filteredActivities.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">Click any block to inspect full task details</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">No hourly activity logged for this date</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Click 'Log Hour Block' to record project work slots</p>
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors group ${
                      isDarkMode ? 'hover:bg-[#18181b]/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-2.5 rounded-xl theme-bg-light theme-text-primary font-bold shrink-0">
                        <Clock size={20} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {act.start_time} &rarr; {act.end_time}
                          </span>
                          <span className="px-2 py-0.5 rounded-md theme-bg-light theme-text-primary text-xs font-bold font-mono">
                            {parseFloat(act.hours_spent || 0).toFixed(2)} hrs
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            {act.category || 'General'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {act.project ? <span className="theme-text-primary font-bold mr-1">[{act.project}]</span> : null}
                          {act.task_description || 'No detailed task description.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteActivity(act.id, e)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 size={15} />
                      </button>
                      <span className="theme-text-primary font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Details &rarr;
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CREATE WEEKLY TIMESHEET MODAL - Extra Wide Zero Scrolling */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 my-auto ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Create Weekly Timesheet</h3>
                  <p className="text-xs text-slate-400">Draft timesheet period and record billable work hours</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTimesheet} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StunningDatePicker
                  label="Period Start Date *"
                  name="start_date"
                  value={createForm.start_date}
                  onChange={(val) => setCreateForm({ ...createForm, start_date: val })}
                  isDarkMode={isDarkMode}
                  required
                />

                <StunningDatePicker
                  label="Period End Date *"
                  name="end_date"
                  value={createForm.end_date}
                  onChange={(val) => setCreateForm({ ...createForm, end_date: val })}
                  isDarkMode={isDarkMode}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Regular Hours
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="40.00"
                    value={createForm.total_regular_hours}
                    onChange={(e) => setCreateForm({ ...createForm, total_regular_hours: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-mono font-bold transition-all focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] ${
                      isDarkMode 
                        ? 'bg-[#141417] border-[#27272a] text-white' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="0.00"
                    value={createForm.total_overtime_hours}
                    onChange={(e) => setCreateForm({ ...createForm, total_overtime_hours: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-mono font-bold transition-all focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] ${
                      isDarkMode 
                        ? 'bg-[#141417] border-[#27272a] text-white' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard weekly sprint deliverables completed"
                  value={createForm.manager_notes}
                  onChange={(e) => setCreateForm({ ...createForm, manager_notes: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none font-medium transition-all focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] ${
                    isDarkMode 
                      ? 'bg-[#141417] border-[#27272a] text-white' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold shadow-lg theme-shadow-primary hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Creating...' : 'Draft Timesheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOG HOUR BLOCK MODAL - Extra Wide Zero Scrolling */}
      {/* ========================================================================= */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 my-auto ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Log Hour-by-Hour Activity</h3>
                  <p className="text-xs text-slate-400">Record specific time slots, project tasks, and billable duration</p>
                </div>
              </div>
              <button 
                onClick={() => setShowActivityModal(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StunningDatePicker
                  label="Activity Date *"
                  name="date"
                  value={activityForm.date}
                  onChange={(val) => setActivityForm({ ...activityForm, date: val })}
                  isDarkMode={isDarkMode}
                  required
                />

                <StunningSelect
                  label="Category *"
                  value={activityForm.category}
                  onChange={(val) => setActivityForm({ ...activityForm, category: val })}
                  options={categoryOptions}
                  placeholder="Select Category"
                  isDarkMode={isDarkMode}
                  required
                />

                <StunningTimePicker
                  label="Start Time *"
                  required
                  value={activityForm.start_time}
                  onChange={(val) => setActivityForm({ ...activityForm, start_time: val.value || val.target?.value || val })}
                  isDarkMode={isDarkMode}
                />

                <StunningTimePicker
                  label="End Time *"
                  required
                  value={activityForm.end_time}
                  onChange={(val) => setActivityForm({ ...activityForm, end_time: val.value || val.target?.value || val })}
                  isDarkMode={isDarkMode}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Project Name / Client Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise CRM Redesign / Client Onboarding Portal"
                  value={activityForm.project}
                  onChange={(e) => setActivityForm({ ...activityForm, project: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none font-medium transition-all focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] ${
                    isDarkMode 
                      ? 'bg-[#141417] border-[#27272a] text-white' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Task Description & Deliverables *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the exact tasks accomplished during this time block..."
                  value={activityForm.task_description}
                  onChange={(e) => setActivityForm({ ...activityForm, task_description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none font-medium transition-all focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] ${
                    isDarkMode 
                      ? 'bg-[#141417] border-[#27272a] text-white' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold shadow-lg theme-shadow-primary hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saving...' : 'Save Activity Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TIMESHEET DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedTimesheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 my-auto ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-bold text-lg shadow-sm">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Timesheet Breakdown</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: #{selectedTimesheet.id} • Period: {selectedTimesheet.start_date} &rarr; {selectedTimesheet.end_date}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTimesheet(null)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Regular Hours</p>
                <p className="font-bold text-base mt-1 font-mono text-emerald-500">
                  {parseFloat(selectedTimesheet.total_regular_hours || 0).toFixed(2)} hrs
                </p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Overtime Hours</p>
                <p className="font-bold text-base mt-1 font-mono text-purple-500">
                  {parseFloat(selectedTimesheet.total_overtime_hours || 0).toFixed(2)} hrs
                </p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Billable</p>
                <p className="font-bold text-base mt-1 font-mono theme-text-primary">
                  {(parseFloat(selectedTimesheet.total_regular_hours || 0) + parseFloat(selectedTimesheet.total_overtime_hours || 0)).toFixed(2)} hrs
                </p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                <div className="mt-1 flex justify-center">
                  <StatusBadge status={selectedTimesheet.status || 'DRAFT'} />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manager & Payroll Notes</p>
              <p className="font-medium text-slate-700 dark:text-slate-200 italic">
                {selectedTimesheet.manager_notes || 'No manager notes attached.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div>
                {selectedTimesheet.status === 'DRAFT' && (
                  <button
                    onClick={() => {
                      handleSubmitTimesheet(selectedTimesheet.id);
                      setSelectedTimesheet(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl theme-bg-primary hover:opacity-90 text-white font-bold text-xs shadow-md theme-shadow-primary transition-all"
                  >
                    <Send size={14} /> Submit For Approval
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedTimesheet(null)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACTIVITY LOG DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 my-auto ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-bold text-lg shadow-sm">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {selectedActivity.project ? `${selectedActivity.project} Task` : 'Activity Detail'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Date: {selectedActivity.date} • {selectedActivity.start_time} &rarr; {selectedActivity.end_time}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedActivity(null)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Duration</p>
                <p className="font-bold text-base mt-1 font-mono theme-text-primary">
                  {parseFloat(selectedActivity.hours_spent || 0).toFixed(2)} hrs
                </p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Category</p>
                <p className="font-bold text-base mt-1 text-purple-500">{selectedActivity.category || 'General'}</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Project</p>
                <p className="font-bold text-base mt-1 text-emerald-500 truncate">{selectedActivity.project || 'General'}</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Task Deliverables & Description</p>
              <p className="font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedActivity.task_description || 'No detailed description.'}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold text-xs shadow-md theme-shadow-primary hover:opacity-90"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK NOTIFICATION MODAL */}
      <FeedbackModal modal={feedback} onClose={() => setFeedback({ ...feedback, isOpen: false })} />
    </div>
  );
};
