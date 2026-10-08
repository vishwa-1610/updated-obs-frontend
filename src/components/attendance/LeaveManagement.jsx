import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  CalendarX, Plus, CheckCircle2, Clock, XCircle, 
  AlertCircle, Sparkles, Filter, FileText, ChevronRight,
  TrendingUp, Umbrella, HeartPulse, UserCheck, Paperclip, X,
  Calendar, Info, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { fetchMyLeaves, createLeaveRequest } from '../../store/attendanceSlice';
import { attendanceService } from '../../services/attendanceService';
import { 
  StunningSelect, 
  StunningDatePicker, 
  StatusBadge, 
  FeedbackModal,
  extractErrorMessage 
} from './AttendanceComponents';

export const LeaveManagement = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { myLeaves = [], loading } = useSelector((state) => state.attendance);

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedQuota, setSelectedQuota] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    is_half_day: false,
    half_day_period: 'FIRST_HALF', // 'FIRST_HALF' | 'SECOND_HALF'
    reason: '',
  });

  const fetchLeaveData = async () => {
    try {
      dispatch(fetchMyLeaves());
      const [typeRes, balRes] = await Promise.all([
        attendanceService.getLeaveTypes(),
        attendanceService.getLeaveBalances(),
      ]);
      const types = typeRes.data?.results || typeRes.data || [];
      setLeaveTypes(types);
      if (types.length > 0 && !formData.leave_type) {
        setFormData(prev => ({ ...prev, leave_type: String(types[0].id) }));
      }
      setLeaveBalances(balRes.data?.results || balRes.data || []);
    } catch (err) {
      console.error('Failed to load leave balances:', err);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const leaveTypeOptions = leaveTypes.map(t => ({
    value: String(t.id),
    label: `${t.name} (${t.is_paid ? 'Paid' : 'Unpaid'})`,
    color: t.color_code || '#2563eb'
  }));

  const halfDayOptions = [
    { value: 'FIRST_HALF', label: 'First Half (Morning Session)' },
    { value: 'SECOND_HALF', label: 'Second Half (Afternoon Session)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        leave_category: Number(formData.leave_type),
        leave_type: formData.is_half_day ? 'Half Day' : 'Full Day',
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_half_day: formData.is_half_day,
        half_day_period: formData.is_half_day ? formData.half_day_period : undefined,
        reason: formData.reason.trim(),
      };

      await dispatch(createLeaveRequest(payload)).unwrap();
      setShowModal(false);
      setFormData(prev => ({ ...prev, reason: '' }));
      fetchLeaveData();
      setFeedback({ 
        isOpen: true, 
        title: 'Leave Request Submitted', 
        message: 'Your leave application has been sent for manager review.', 
        type: 'success' 
      });
    } catch (err) {
      const errorMsg = extractErrorMessage(err, 'Failed to submit leave request. Please verify your selected dates and quota.');
      setFeedback({ 
        isOpen: true, 
        title: 'Submission Error', 
        message: errorMsg, 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Balances fallback if empty
  const displayBalances = leaveBalances.length > 0 ? leaveBalances : [
    { leave_type_name: 'Paid Time Off (PTO)', total_allocated: 18, used_days: 4, remaining_days: 14, color: '#2563eb' },
    { leave_type_name: 'Sick Leave', total_allocated: 10, used_days: 2, remaining_days: 8, color: '#059669' },
    { leave_type_name: 'Casual Leave', total_allocated: 6, used_days: 1, remaining_days: 5, color: '#9333ea' },
    { leave_type_name: 'Maternity / Paternity', total_allocated: 60, used_days: 0, remaining_days: 60, color: '#e11d48' },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Leave Management & Accrual Quotas
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            View allocated leave quotas, accrued balances, and submit leave applications
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-bg-primary text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Request Leave
        </button>
      </div>

      {/* LEAVE QUOTAS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayBalances.map((bal, idx) => {
          const total = Number(bal.total_allocated) || 0;
          const used = Number(bal.used_days) || 0;
          const rem = Number(bal.remaining_days) || 0;
          const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
          const cardColor = bal.color || '#2563eb';

          return (
            <div 
              key={idx}
              onClick={() => setSelectedQuota(bal)}
              className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.01] ${
                isDarkMode 
                  ? 'bg-[#121217] border-[#27272a] hover:border-zinc-700' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                  style={{ backgroundColor: cardColor }}
                >
                  <Umbrella size={18} />
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  rem > 0 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  {rem} Days Left
                </div>
              </div>

              <h3 className={`text-sm font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {bal.leave_type_name || bal.name || 'Leave Quota'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {used} used of {total} total allocated
              </p>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${pct}%`, 
                    backgroundColor: cardColor 
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-zinc-800">
                <span>Accrual Quota</span>
                <span className="text-blue-500 hover:underline flex items-center gap-0.5">
                  View Details &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MY LEAVE REQUESTS TABLE */}
      <div className={`rounded-3xl border overflow-hidden ${
        isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                My Submitted Requests ({myLeaves.length})
              </h3>
              <p className="text-[11px] text-slate-400">Click any row to open full request details</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
                isDarkMode ? 'bg-[#18181b]/70 border-[#27272a] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <th className="py-3.5 px-4">Leave Category</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Approver Remarks</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {myLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CalendarX size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No leave requests submitted</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Click 'Request Leave' to apply for time off</p>
                  </td>
                </tr>
              ) : (
                myLeaves.map((leave) => (
                  <tr 
                    key={leave.id}
                    onClick={() => setSelectedLeave(leave)}
                    className={`cursor-pointer transition-colors group ${
                      isDarkMode ? 'hover:bg-[#18181b]/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{leave.leave_category_name || leave.leave_type_name || leave.leave_type || 'General Leave'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {leave.start_date} &rarr; {leave.end_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px]">
                        {leave.is_half_day ? '0.5 Day' : `${leave.days_count || 1} Days`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {leave.reason || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={leave.status || 'PENDING'} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 italic truncate max-w-xs">
                      {leave.manager_comment || leave.manager_remarks || 'Awaiting review'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-blue-500 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Details &rarr;
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. REQUEST LEAVE MODAL - Extra Wide Zero Scrolling */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 my-auto ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Submit Leave Application</h3>
                  <p className="text-xs text-slate-400">Apply for paid time off, sick leave, or casual time off</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <StunningSelect
                    label="Leave Category *"
                    value={formData.leave_type}
                    onChange={(val) => setFormData({ ...formData, leave_type: val })}
                    options={leaveTypeOptions}
                    placeholder="Choose Leave Type"
                    isDarkMode={isDarkMode}
                    required
                  />
                </div>

                <StunningDatePicker
                  label="Start Date *"
                  name="start_date"
                  value={formData.start_date}
                  onChange={(val) => setFormData({ ...formData, start_date: val })}
                  isDarkMode={isDarkMode}
                  required
                />

                <StunningDatePicker
                  label="End Date *"
                  name="end_date"
                  value={formData.end_date}
                  onChange={(val) => setFormData({ ...formData, end_date: val })}
                  isDarkMode={isDarkMode}
                  required
                />
              </div>

              {/* Half Day Checkbox & Selector */}
              <div className="p-3.5 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_half_day}
                    onChange={(e) => setFormData({ ...formData, is_half_day: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-xs">Half Day Leave (0.5 Day)</span>
                    <p className="text-[10px] text-slate-400">Request partial-day absence</p>
                  </div>
                </label>

                {formData.is_half_day && (
                  <div className="w-full sm:w-56">
                    <StunningSelect
                      value={formData.half_day_period}
                      onChange={(val) => setFormData({ ...formData, half_day_period: val })}
                      options={halfDayOptions}
                      placeholder="Select Session"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Reason for Leave *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain reason for leave request (e.g. family vacation, medical appointment)..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none font-medium transition-all ${
                    isDarkMode 
                      ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold shadow-lg shadow-blue-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LEAVE REQUEST DETAILS MODAL (When tapping any row) */}
      {/* ========================================================================= */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 my-auto ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">
                  <Umbrella size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {selectedLeave.leave_category_name || selectedLeave.leave_type_name || selectedLeave.leave_type || 'Leave Request'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: #{selectedLeave.id} • Submitted: {selectedLeave.created_at ? new Date(selectedLeave.created_at).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLeave(null)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Start Date</p>
                <p className="font-bold text-sm mt-1 font-mono text-blue-500">{selectedLeave.start_date}</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">End Date</p>
                <p className="font-bold text-sm mt-1 font-mono text-purple-500">{selectedLeave.end_date}</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Days</p>
                <p className="font-bold text-sm mt-1 text-emerald-500">
                  {selectedLeave.is_half_day ? '0.5 Day' : `${selectedLeave.days_count || 1} Days`}
                </p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                <div className="mt-1 flex justify-center">
                  <StatusBadge status={selectedLeave.status || 'PENDING'} />
                </div>
              </div>
            </div>

            {/* Reason block */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Reason</p>
              <p className="font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedLeave.reason || 'No specific explanation provided.'}
              </p>
            </div>

            {/* Approver comments block */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manager Review Remarks</p>
              <p className="font-medium text-slate-700 dark:text-slate-200 italic">
                {selectedLeave.manager_comment || selectedLeave.manager_remarks || 'This request is pending manager review.'}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold text-xs shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LEAVE QUOTA DETAILS MODAL (When tapping any quota card) */}
      {/* ========================================================================= */}
      {selectedQuota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 my-auto ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm text-lg"
                  style={{ backgroundColor: selectedQuota.color || '#2563eb' }}
                >
                  <Umbrella size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {selectedQuota.leave_type_name || selectedQuota.name}
                  </h3>
                  <p className="text-xs text-slate-400">Accrual Policy & Annual Allowance</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedQuota(null)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Allocated</p>
                <p className="font-bold text-base mt-1 text-blue-500">{selectedQuota.total_allocated} Days</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Used / Consumed</p>
                <p className="font-bold text-base mt-1 text-amber-500">{selectedQuota.used_days} Days</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Available Balance</p>
                <p className="font-bold text-base mt-1 text-emerald-500">{selectedQuota.remaining_days} Days</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Accrual Frequency:</span>
                <span className="font-bold">Annual / Monthly Accrual</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Carry Forward Allowed:</span>
                <span className="font-bold text-emerald-500">Up to 5 Days</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Paid Category:</span>
                <span className="font-bold text-blue-500">Paid Leave</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedQuota(null)}
                className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold text-xs shadow-md"
              >
                Close Quota
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
