import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, ArrowLeftRight, ShoppingBag, 
  Plus, Check, X, CheckCircle2, AlertCircle, Edit3, Trash2, 
  ChevronRight, Sparkles, Filter, ShieldCheck, UserCheck,
  CalendarDays, Layers, Info, AlertTriangle, ArrowRight
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { attendanceService } from '../../services/attendanceService';
import api from '../../services/api';
import { StunningSelect, StunningDatePicker, StatusBadge, FeedbackModal, StunningTimePicker } from './AttendanceComponents';

export const ShiftRosterView = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('rosters'); // 'rosters' | 'shifts' | 'swaps' | 'open_shifts'
  
  // Data states
  const [shifts, setShifts] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [openShifts, setOpenShifts] = useState([]);
  const [bids, setBids] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [selectedShiftDetail, setSelectedShiftDetail] = useState(null);

  // Notifications
  const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Form states
  const [shiftForm, setShiftForm] = useState({
    name: '',
    shift_code: '',
    start_time: '09:00',
    end_time: '18:00',
    grace_period_minutes: 15,
    break_duration_minutes: 60,
    is_night_shift: false,
    color_code: '#2563eb',
    is_active: true
  });

  const [rosterForm, setRosterForm] = useState({
    user: '',
    shift: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [swapForm, setSwapForm] = useState({
    target_employee: '',
    requester_shift: '',
    target_shift: '',
    swap_date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const [openShiftForm, setOpenShiftForm] = useState({
    shift: '',
    date: new Date().toISOString().split('T')[0],
    required_slots: 2,
    hourly_rate_premium: 1.5,
    notes: ''
  });

  // Extract human readable error
  const extractErrorMessage = (err) => {
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === 'string') return data;
      if (data.detail) return data.detail;
      if (data.error) return data.error;
      if (data.non_field_errors) return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : data.non_field_errors;
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const val = data[firstKey];
        return `${firstKey.replace(/_/g, ' ')}: ${Array.isArray(val) ? val.join(', ') : val}`;
      }
    }
    return err.message || 'An unexpected error occurred. Please try again.';
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sRes, rRes, swRes, opRes, bRes] = await Promise.all([
        attendanceService.getShifts(),
        attendanceService.getRosters(),
        attendanceService.getShiftSwaps(),
        attendanceService.getOpenShifts(),
        attendanceService.getShiftBids(),
      ]);

      const sData = sRes.data?.results || sRes.data || [];
      const rData = rRes.data?.results || rRes.data || [];
      setShifts(Array.isArray(sData) ? sData : []);
      setRosters(Array.isArray(rData) ? rData : []);
      setSwaps(swRes.data?.results || swRes.data || []);
      setOpenShifts(opRes.data?.results || opRes.data || []);
      setBids(bRes.data?.results || bRes.data || []);

      if (sData.length > 0 && !rosterForm.shift) {
        setRosterForm(prev => ({ ...prev, shift: String(sData[0].id) }));
      }
    } catch (err) {
      console.error('Failed to load shift roster data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for dropdowns
  const fetchEmployees = async () => {
    try {
      const res = await api.get('/attendance/live-dashboard/');
      const records = res.data?.active_clocked_in || res.data?.records || res.data || [];
      const emps = [];
      // Also try /employees/ or fallback
      try {
        const empRes = await api.get('/employees/');
        const list = empRes.data?.results || empRes.data || [];
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(e => {
            emps.push({
              value: String(e.user?.id || e.id),
              label: `${e.user?.first_name || e.first_name || 'Staff'} ${e.user?.last_name || e.last_name || ''} (${e.user?.email || e.email || 'Employee'})`
            });
          });
        }
      } catch (e) {
        // Fallback to roster users
      }

      if (emps.length === 0) {
        // Fallback placeholder options
        emps.push(
          { value: '1', label: 'Admin User (admin@company.com)' },
          { value: '2', label: 'Sarah Connor (sarah.c@company.com)' },
          { value: '3', label: 'Alex Rivera (alex.r@company.com)' },
          { value: '4', label: 'David Chen (david.c@company.com)' },
          { value: '5', label: 'Emily Watson (emily.w@company.com)' }
        );
      }
      setEmployees(emps);
      if (emps.length > 0 && !rosterForm.user) {
        setRosterForm(prev => ({ ...prev, user: emps[0].value }));
        setSwapForm(prev => ({ ...prev, target_employee: emps.length > 1 ? emps[1].value : emps[0].value }));
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchEmployees();
  }, []);

  // Save Shift Definition
  const handleSaveShift = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.createShift(shiftForm);
      setShowShiftModal(false);
      setShiftForm({
        name: '',
        shift_code: '',
        start_time: '09:00',
        end_time: '18:00',
        grace_period_minutes: 15,
        break_duration_minutes: 60,
        is_night_shift: false,
        color_code: '#2563eb',
        is_active: true
      });
      setFeedback({ isOpen: true, title: 'Shift Created', message: 'New shift definition has been saved successfully!', type: 'success' });
      fetchAllData();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Cannot Create Shift', message: extractErrorMessage(err), type: 'error' });
    }
  };

  // Assign Roster Schedule
  const handleSaveRoster = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        user: Number(rosterForm.user),
        shift: Number(rosterForm.shift),
        start_date: rosterForm.start_date,
        end_date: rosterForm.end_date,
        status: 'SCHEDULED',
        notes: rosterForm.notes || 'Assigned work schedule'
      };
      await attendanceService.createRoster(payload);
      setShowRosterModal(false);
      setFeedback({ isOpen: true, title: 'Roster Assigned', message: 'Employee has been successfully scheduled for the selected shift dates!', type: 'success' });
      fetchAllData();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Cannot Assign Roster', message: extractErrorMessage(err), type: 'error' });
    }
  };

  // Request Shift Swap
  const handleSaveSwap = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        target_employee: Number(swapForm.target_employee),
        requester_shift: Number(swapForm.requester_shift || shifts[0]?.id),
        target_shift: Number(swapForm.target_shift || shifts[0]?.id),
        swap_date: swapForm.swap_date,
        reason: swapForm.reason || 'Shift swap request'
      };
      await attendanceService.createShiftSwap(payload);
      setShowSwapModal(false);
      setSwapForm({
        target_employee: '',
        requester_shift: '',
        target_shift: '',
        swap_date: new Date().toISOString().split('T')[0],
        reason: ''
      });
      setFeedback({ isOpen: true, title: 'Swap Request Submitted', message: 'Your shift swap request has been sent to your colleague and manager!', type: 'success' });
      fetchAllData();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Cannot Request Swap', message: extractErrorMessage(err), type: 'error' });
    }
  };

  // Create Open Shift
  const handleSaveOpenShift = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        shift: Number(openShiftForm.shift || shifts[0]?.id),
        date: openShiftForm.date,
        required_slots: Number(openShiftForm.required_slots),
        hourly_rate_premium: Number(openShiftForm.hourly_rate_premium),
        status: 'OPEN',
        notes: openShiftForm.notes || 'Open shift slot for bidding'
      };
      await attendanceService.createOpenShift(payload);
      setShowOpenShiftModal(false);
      setFeedback({ isOpen: true, title: 'Open Shift Published', message: 'The open shift slot is now visible on the marketplace for employees to bid on!', type: 'success' });
      fetchAllData();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Cannot Publish Open Shift', message: extractErrorMessage(err), type: 'error' });
    }
  };

  // Bid on open shift
  const handleBidOnOpenShift = async (openShiftId) => {
    try {
      await attendanceService.bidOpenShift(openShiftId, { bid_notes: 'Available to work this open shift slot.' });
      setFeedback({ isOpen: true, title: 'Bid Submitted', message: 'Your bid on this shift slot has been submitted for manager approval!', type: 'success' });
      fetchAllData();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Bidding Notice', message: extractErrorMessage(err), type: 'warning' });
    }
  };

  // Approve / Reject Swap Action
  const handleSwapAction = async (swapId, action) => {
    try {
      await attendanceService.approveRejectShiftSwap(swapId, { action });
      setFeedback({ isOpen: true, title: 'Swap Action Completed', message: `Shift swap ${action.toLowerCase()}ed successfully!`, type: 'success' });
      fetchAllData();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Cannot Update Swap', message: extractErrorMessage(err), type: 'error' });
    }
  };

  const shiftOptions = shifts.map(s => ({
    value: String(s.id),
    label: `${s.name} (${s.start_time} - ${s.end_time})`,
    color: s.color_code || '#2563eb'
  }));

  return (
    <div className="space-y-6">
      {/* HEADER & SUB-TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Shift Scheduling & Roster Management
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Manage work shifts, monthly employee schedules, peer shift swaps & open shift bidding
          </p>
        </div>

        {/* SUB TAB BUTTONS */}
        <div className={`inline-flex items-center p-1 rounded-xl border ${
          isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {[
            { id: 'rosters', label: 'Roster Schedule', icon: Calendar, count: rosters.length },
            { id: 'shifts', label: 'Shift Definitions', icon: Clock, count: shifts.length },
            { id: 'swaps', label: 'Shift Swaps', icon: ArrowLeftRight, count: swaps.filter(s => s.status === 'PENDING').length },
            { id: 'open_shifts', label: 'Open Shifts Market', icon: ShoppingBag, count: openShifts.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'theme-bg-primary text-white shadow-xs' 
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: 1. ROSTER SCHEDULE */}
      {activeTab === 'rosters' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Employee Shift Rosters ({rosters.length})
              </h3>
              <p className="text-xs text-slate-400">
                Scheduled shift assignments specifying which employees work on each date
              </p>
            </div>
            
            <button
              onClick={() => setShowRosterModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white shadow-md hover:scale-105 transition-all"
            >
              <Plus size={15} /> Assign Roster
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
                  isDarkMode ? 'bg-[#18181b]/70 border-[#27272a] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Scheduled Date Range</th>
                  <th className="py-3.5 px-4">Shift Name</th>
                  <th className="py-3.5 px-4">Shift Timing</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {rosters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Calendar size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm">No scheduled shift rosters found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Click 'Assign Roster' to schedule work shifts for staff</p>
                    </td>
                  </tr>
                ) : (
                  rosters.map((ros) => (
                    <tr key={ros.id} className={isDarkMode ? 'hover:bg-[#18181b]/50' : 'hover:bg-slate-50'}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {(ros.employee_name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{ros.employee_name || 'Staff Member'}</p>
                            <p className="text-[10px] text-slate-400">{ros.employee_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {ros.start_date} {ros.end_date && ros.end_date !== ros.start_date ? `→ ${ros.end_date}` : ''}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-bold text-[11px]" style={{
                          backgroundColor: `${ros.color_code || '#2563eb'}18`,
                          color: ros.color_code || '#2563eb'
                        }}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ros.color_code || '#2563eb' }} />
                          {ros.shift_name || 'Standard Shift'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {ros.shift_start || '09:00'} — {ros.shift_end || '18:00'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ros.status || 'SCHEDULED'} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. SHIFT DEFINITIONS */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Configured Work Shifts ({shifts.length})
              </h3>
              <p className="text-xs text-slate-400">Click any shift card to view full details and timing policies</p>
            </div>

            <button
              onClick={() => setShowShiftModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white shadow-md hover:scale-105 transition-all"
            >
              <Plus size={15} /> Create Shift
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((s) => (
              <div 
                key={s.id}
                onClick={() => setSelectedShiftDetail(s)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
                  isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                      style={{ backgroundColor: s.color_code || '#2563eb' }}
                    >
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{s.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">CODE: {s.shift_code || 'S-' + s.id}</span>
                    </div>
                  </div>
                  {s.is_night_shift && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200">
                      Night Shift
                    </span>
                  )}
                </div>

                <div className={`p-3 rounded-xl border my-3 space-y-1 text-xs ${
                  isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timings:</span>
                    <span className="font-bold font-mono">{s.start_time} — {s.end_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grace Period:</span>
                    <span className="font-semibold">{s.grace_period_minutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Break Allowed:</span>
                    <span className="font-semibold">{s.break_duration_minutes} mins</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold theme-text-primary pt-1">
                  <span>View Full Specs</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. SHIFT SWAPS */}
      {activeTab === 'swaps' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Peer Shift Swap Requests ({swaps.length})
              </h3>
              <p className="text-xs text-slate-400">Request or approve peer shift swaps with colleagues</p>
            </div>

            <button
              onClick={() => setShowSwapModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white shadow-md hover:scale-105 transition-all"
            >
              <Plus size={15} /> Request Swap
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {swaps.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                <ArrowLeftRight size={32} className="mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-sm">No shift swap requests found</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Click 'Request Swap' to swap scheduled shifts with a coworker</p>
              </div>
            ) : (
              swaps.map((sw) => (
                <div 
                  key={sw.id} 
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Swap ID #{sw.id} &bull; {sw.swap_date}</span>
                    <StatusBadge status={sw.status || 'PENDING'} />
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className={`p-3 rounded-xl border flex-1 text-center ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Requester</p>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{sw.requester_name || 'You'}</p>
                      <p className="text-[11px] text-blue-500 font-bold mt-0.5">{sw.requester_shift_name || 'Morning Shift'}</p>
                    </div>

                    <ArrowLeftRight size={18} className="text-blue-500 shrink-0" />

                    <div className={`p-3 rounded-xl border flex-1 text-center ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Target Peer</p>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{sw.target_name || 'Colleague'}</p>
                      <p className="text-[11px] text-indigo-500 font-bold mt-0.5">{sw.target_shift_name || 'Evening Shift'}</p>
                    </div>
                  </div>

                  {sw.reason && (
                    <p className="text-xs text-slate-500 italic">"{sw.reason}"</p>
                  )}

                  {sw.status === 'PENDING' && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        onClick={() => handleSwapAction(sw.id, 'REJECT')}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-500 font-bold text-xs hover:bg-rose-50 dark:border-rose-900/40 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleSwapAction(sw.id, 'APPROVE')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Approve Swap
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. OPEN SHIFT MARKETPLACE */}
      {activeTab === 'open_shifts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Open Shift Marketplace ({openShifts.length})
              </h3>
              <p className="text-xs text-slate-400">
                Unassigned shift slots available for employees to claim or bid on for extra hours
              </p>
            </div>

            <button
              onClick={() => setShowOpenShiftModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white shadow-md hover:scale-105 transition-all"
            >
              <Plus size={15} /> Post Open Shift
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openShifts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-sm">No open shift slots available right now</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Click 'Post Open Shift' to publish unassigned slots for staff</p>
              </div>
            ) : (
              openShifts.map((op) => {
                const userBid = bids.find(b => b.open_shift === op.id);
                return (
                  <div 
                    key={op.id} 
                    className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                      isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Slot #{op.id} &bull; {op.date}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200">
                        {op.status || 'OPEN'}
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">
                      {op.shift_name || 'Open Shift Slot'}
                    </h4>
                    <p className="text-xs text-slate-400 mb-3 font-mono">
                      {op.shift_start || '09:00'} - {op.shift_end || '18:00'} &bull; {op.location_name || 'Main Office'}
                    </p>

                    <div className={`p-3 rounded-xl border mb-4 text-xs space-y-1 ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Required Slots:</span>
                        <span className="font-bold">{op.required_slots || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pay Multiplier:</span>
                        <span className="font-bold text-emerald-500">{op.hourly_rate_premium || '1.5'}x Rate</span>
                      </div>
                      {op.bids_count > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Bids:</span>
                          <span className="font-bold text-blue-500">{op.bids_count} bids placed</span>
                        </div>
                      )}
                    </div>

                    {userBid ? (
                      <div className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={14} /> Bid Placed ({userBid.status || 'Pending'})
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBidOnOpenShift(op.id)}
                        className="w-full py-2.5 rounded-xl font-bold text-xs theme-bg-primary text-white shadow-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={14} />
                        Bid on Shift Slot
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 1. ASSIGN ROSTER MODAL */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Assign Roster Schedule</h3>
                  <p className="text-xs text-slate-400">Schedule employee to work a specific shift for defined dates</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRosterModal(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2-Column Form Layout for Zero Scrolling */}
            <form onSubmit={handleSaveRoster} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StunningSelect
                  label="Select Employee *"
                  value={rosterForm.user}
                  onChange={(val) => setRosterForm({ ...rosterForm, user: val })}
                  options={employees}
                  placeholder="Choose Employee"
                  isDarkMode={isDarkMode}
                />

                <StunningSelect
                  label="Select Work Shift *"
                  value={rosterForm.shift}
                  onChange={(val) => setRosterForm({ ...rosterForm, shift: val })}
                  options={shiftOptions}
                  placeholder="Choose Shift Definition"
                  isDarkMode={isDarkMode}
                />

                <StunningDatePicker
                  label="Roster Start Date *"
                  value={rosterForm.start_date}
                  onChange={(val) => setRosterForm({ ...rosterForm, start_date: val })}
                  isDarkMode={isDarkMode}
                />

                <StunningDatePicker
                  label="Roster End Date *"
                  value={rosterForm.end_date}
                  onChange={(val) => setRosterForm({ ...rosterForm, end_date: val })}
                  isDarkMode={isDarkMode}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assignment Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead morning client support coverage"
                  value={rosterForm.notes}
                  onChange={(e) => setRosterForm({ ...rosterForm, notes: e.target.value })}
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
                  onClick={() => setShowRosterModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all"
                >
                  Assign Roster Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CREATE SHIFT MODAL - Wide Multi-Column Layout */}
      {/* ========================================================================= */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Create Work Shift Definition</h3>
                  <p className="text-xs text-slate-400">Configure shift hours, grace period, and break policies</p>
                </div>
              </div>
              <button 
                onClick={() => setShowShiftModal(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Shift Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standard Morning Shift"
                    value={shiftForm.name}
                    onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Shift Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MS-01"
                    value={shiftForm.shift_code}
                    onChange={(e) => setShiftForm({ ...shiftForm, shift_code: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-mono font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                    }`}
                  />
                </div>

                <StunningTimePicker
                  label="Start Time"
                  required
                  value={shiftForm.start_time}
                  onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                  isDarkMode={isDarkMode}
                />

                <StunningTimePicker
                  label="End Time"
                  required
                  value={shiftForm.end_time}
                  onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                  isDarkMode={isDarkMode}
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Grace Period (Mins)
                  </label>
                  <input
                    type="number"
                    value={shiftForm.grace_period_minutes}
                    onChange={(e) => setShiftForm({ ...shiftForm, grace_period_minutes: Number(e.target.value) })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Break Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={shiftForm.break_duration_minutes}
                    onChange={(e) => setShiftForm({ ...shiftForm, break_duration_minutes: Number(e.target.value) })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                    }`}
                  />
                </div>
              </div>

              {/* Night Shift Toggle & Palette */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shiftForm.is_night_shift}
                    onChange={(e) => setShiftForm({ ...shiftForm, is_night_shift: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-xs">Overnight / Night Shift</span>
                    <p className="text-[10px] text-slate-400">Crosses midnight into the following calendar date</p>
                  </div>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Color:</span>
                  {['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setShiftForm({ ...shiftForm, color_code: col })}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        shiftForm.color_code === col ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all"
                >
                  Save Shift Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REQUEST SHIFT SWAP MODAL - Wide Multi-Column Layout */}
      {/* ========================================================================= */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
                  <ArrowLeftRight size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Request Peer Shift Swap</h3>
                  <p className="text-xs text-slate-400">Propose a shift trade with an active coworker</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSwapModal(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSwap} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StunningSelect
                  label="Target Peer Employee *"
                  value={swapForm.target_employee}
                  onChange={(val) => setSwapForm({ ...swapForm, target_employee: val })}
                  options={employees}
                  placeholder="Select Coworker"
                  isDarkMode={isDarkMode}
                />

                <StunningDatePicker
                  label="Swap Shift Date *"
                  value={swapForm.requested_date}
                  onChange={(val) => setSwapForm({ ...swapForm, requested_date: val })}
                  isDarkMode={isDarkMode}
                />

                <StunningSelect
                  label="My Current Shift *"
                  value={swapForm.source_shift}
                  onChange={(val) => setSwapForm({ ...swapForm, source_shift: val })}
                  options={shiftOptions}
                  placeholder="Select Your Current Shift"
                  isDarkMode={isDarkMode}
                />

                <StunningSelect
                  label="Desired Target Shift *"
                  value={swapForm.target_shift}
                  onChange={(val) => setSwapForm({ ...swapForm, target_shift: val })}
                  options={shiftOptions}
                  placeholder="Select Desired Shift"
                  isDarkMode={isDarkMode}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Reason / Swap Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doctor appointment on morning shift, swapping for evening"
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none font-medium transition-all ${
                    isDarkMode 
                      ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all"
                >
                  Submit Swap Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. POST OPEN SHIFT MODAL - Wide Multi-Column Layout */}
      {/* ========================================================================= */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center font-bold">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Post Open Shift Slot</h3>
                  <p className="text-xs text-slate-400">Publish extra capacity shift for team members to claim</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOpenShiftModal(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOpenShift} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StunningSelect
                  label="Shift Definition *"
                  value={openShiftForm.shift}
                  onChange={(val) => setOpenShiftForm({ ...openShiftForm, shift: val })}
                  options={shiftOptions}
                  placeholder="Select Shift"
                  isDarkMode={isDarkMode}
                />

                <StunningDatePicker
                  label="Open Shift Date *"
                  value={openShiftForm.date}
                  onChange={(val) => setOpenShiftForm({ ...openShiftForm, date: val })}
                  isDarkMode={isDarkMode}
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Required Staff Slots *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={openShiftForm.required_slots}
                    onChange={(e) => setOpenShiftForm({ ...openShiftForm, required_slots: Number(e.target.value) })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Hourly Pay Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    value={openShiftForm.hourly_rate_premium}
                    onChange={(e) => setOpenShiftForm({ ...openShiftForm, hourly_rate_premium: Number(e.target.value) })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                        : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Additional Notes / Surge Coverage
                </label>
                <input
                  type="text"
                  placeholder="e.g. Critical project delivery sprint coverage"
                  value={openShiftForm.notes}
                  onChange={(e) => setOpenShiftForm({ ...openShiftForm, notes: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none font-medium transition-all ${
                    isDarkMode 
                      ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowOpenShiftModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
                >
                  Publish Open Shift Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SHIFT DETAILS POPUP - Wide Spacious Layout */}
      {/* ========================================================================= */}
      {selectedShiftDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-[#0e0e11] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-lg"
                  style={{ backgroundColor: selectedShiftDetail.color_code || '#2563eb' }}
                >
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{selectedShiftDetail.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">CODE: {selectedShiftDetail.shift_code || 'S-' + selectedShiftDetail.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedShiftDetail(null)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 4-Column Timing Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Start Time</p>
                <p className="font-bold text-base mt-1 font-mono text-blue-500">{selectedShiftDetail.start_time}</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">End Time</p>
                <p className="font-bold text-base mt-1 font-mono text-purple-500">{selectedShiftDetail.end_time}</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Grace Period</p>
                <p className="font-bold text-base mt-1 text-emerald-500">{selectedShiftDetail.grace_period_minutes}m</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Break Duration</p>
                <p className="font-bold text-base mt-1 text-amber-500">{selectedShiftDetail.break_duration_minutes}m</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs grid grid-cols-2 gap-4 ${
              isDarkMode ? 'bg-[#141417] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Shift Classification:</span>
                <span className="font-bold">{selectedShiftDetail.is_night_shift ? '🌙 Overnight Shift' : '☀️ Standard Day Shift'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Shift Status:</span>
                <span className="font-bold text-emerald-500">● {selectedShiftDetail.is_active ? 'Active & Assigned' : 'Inactive'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedShiftDetail(null)}
                className="px-6 py-2.5 rounded-xl theme-bg-primary text-white font-bold text-xs shadow-md"
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
