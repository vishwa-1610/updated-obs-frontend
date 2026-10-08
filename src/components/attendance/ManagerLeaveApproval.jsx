import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Check, X, CalendarX, ArrowLeftRight, 
  ShoppingBag, Clock, AlertCircle, Sparkles, Filter, RefreshCw
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { attendanceService } from '../../services/attendanceService';
import { StunningSelect, StatusBadge, FeedbackModal } from './AttendanceComponents';

export const ManagerLeaveApproval = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('leaves'); // 'leaves' | 'swaps' | 'bids'
  const [leaves, setLeaves] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState({});
  const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const [lRes, swRes, bRes] = await Promise.all([
        attendanceService.getMyLeaves({ status: 'PENDING' }),
        attendanceService.getShiftSwaps({ status: 'PENDING' }),
        attendanceService.getShiftBids({ status: 'PENDING' }),
      ]);
      setLeaves(lRes.data?.results || lRes.data || []);
      setSwaps(swRes.data?.results || swRes.data || []);
      setBids(bRes.data?.results || bRes.data || []);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleLeaveAction = async (id, status) => {
    try {
      await attendanceService.approveRejectLeave(id, {
        status,
        remarks: remarks[id] || `${status} by manager`
      });
      fetchApprovals();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Error', message: err.response?.data?.detail || err.message, type: 'error' });
    }
  };

  const handleSwapAction = async (id, action) => {
    try {
      await attendanceService.approveRejectShiftSwap(id, { action });
      fetchApprovals();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Error', message: err.response?.data?.detail || err.message, type: 'error' });
    }
  };

  const handleAwardBid = async (bidId) => {
    try {
      await attendanceService.awardShiftBid(bidId);
      fetchApprovals();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Error', message: err.response?.data?.detail || err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Manager Approvals Center
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Review and approve pending employee leave applications, shift swaps & open shift bids
          </p>
        </div>

        {/* TABS */}
        <div className={`inline-flex items-center p-1 rounded-xl border ${
          isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {[
            { id: 'leaves', label: 'Leave Requests', icon: CalendarX, count: leaves.length },
            { id: 'swaps', label: 'Shift Swaps', icon: ArrowLeftRight, count: swaps.length },
            { id: 'bids', label: 'Shift Bids', icon: ShoppingBag, count: bids.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

      {/* TAB 1: LEAVE REQUESTS */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaves.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <UserCheck size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm">All caught up! No pending leave requests</p>
            </div>
          ) : (
            leaves.map((l) => (
              <div 
                key={l.id} 
                className={`p-5 rounded-2xl border space-y-3 ${
                  isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {l.employee_name || 'Staff Employee'}
                    </h4>
                    <p className="text-[10px] text-slate-400">{l.department || 'General'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                    {l.leave_type_name || 'Paid Leave'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                  isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Dates:</span>
                    <span className="font-bold">{l.start_date} &rarr; {l.end_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-semibold">{l.is_half_day ? '0.5 Day (Half Day)' : `${l.days_count || 1} Days`}</span>
                  </div>
                  {l.reason && (
                    <p className="text-slate-500 pt-1 italic">"{l.reason}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <input
                    type="text"
                    placeholder="Optional remarks..."
                    value={remarks[l.id] || ''}
                    onChange={(e) => setRemarks({ ...remarks, [l.id]: e.target.value })}
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700' : 'bg-white border-slate-200'
                    }`}
                  />
                  <button
                    onClick={() => handleLeaveAction(l.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-500 font-bold text-xs hover:bg-rose-50 dark:border-rose-900/40"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleLeaveAction(l.id, 'APPROVED')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SHIFT SWAPS */}
      {activeTab === 'swaps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {swaps.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <ArrowLeftRight size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm">No pending shift swaps</p>
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
                  <span className="text-xs font-bold text-slate-400">Swap ID #{sw.id}</span>
                  <StatusBadge status={sw.status || 'PENDING'} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{sw.requester_name || 'Requester'}</span>
                  <ArrowLeftRight size={14} className="text-blue-500" />
                  <span className="font-bold">{sw.target_employee_name || 'Peer Colleague'}</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={() => handleSwapAction(sw.id, 'REJECT')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-500 font-bold text-xs"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleSwapAction(sw.id, 'APPROVE')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: OPEN SHIFT BIDS */}
      {activeTab === 'bids' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bids.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm">No pending bids on open shifts</p>
            </div>
          ) : (
            bids.map((b) => (
              <div 
                key={b.id} 
                className={`p-5 rounded-2xl border space-y-3 ${
                  isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {b.employee_name || 'Staff Member'}
                  </h4>
                  <StatusBadge status={b.status || 'PENDING'} />
                </div>

                <p className="text-xs text-slate-400">Shift Slot: {b.open_shift_name || 'Unassigned Shift'}</p>

                <button
                  onClick={() => handleAwardBid(b.id)}
                  className="w-full py-2 rounded-xl font-bold text-xs theme-bg-primary text-white shadow-xs"
                >
                  Award Shift Slot
                </button>
              </div>
            ))
          )}
        </div>
      )}
      <FeedbackModal modal={feedback} onClose={() => setFeedback({ ...feedback, isOpen: false })} />
    </div>
  );
};
