import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Calendar, Clock, MapPin, CheckCircle2, 
  AlertTriangle, ChevronLeft, ChevronRight,
  Filter, LogIn, LogOut, Timer
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { fetchMyHistory } from '../../store/attendanceSlice';
import Modal from '../common/Modal/Modal';
import { StunningSelect } from './AttendanceComponents';

const MyAttendanceHistory = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { attendanceHistory = [], loading } = useSelector((state) => state.attendance);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const params = {
      page: currentPage,
      month: monthFilter,
      year: yearFilter,
    };
    if (statusFilter) params.status = statusFilter;
    
    dispatch(fetchMyHistory(params));
  }, [dispatch, currentPage, monthFilter, yearFilter, statusFilter]);


  const StatusBadge = ({ status }) => {
    const colors = {
      'Present': 'text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5',
      'Late': 'text-[#f59e0b] border-[#f59e0b]/20 bg-[#f59e0b]/5',
      'Half-Day': 'text-[#0ea5e9] border-[#0ea5e9]/20 bg-[#0ea5e9]/5',
      'Absent': 'text-[#f43f5e] border-[#f43f5e]/20 bg-[#f43f5e]/5',
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${colors[status] || colors['Present']}`}>
        {status}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Present': 'text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5',
      'Late': 'text-[#f59e0b] border-[#f59e0b]/20 bg-[#f59e0b]/5',
      'Half-Day': 'text-[#0ea5e9] border-[#0ea5e9]/20 bg-[#0ea5e9]/5',
      'Absent': 'text-[#f43f5e] border-[#f43f5e]/20 bg-[#f43f5e]/5',
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${colors[status] || colors['Present']}`}>
        {status}
      </span>
    );
  };

  const getHoursWorked = (record) => {
    if (!record.punch_in_time || !record.punch_out_time) return '-';
    const diff = new Date(record.punch_out_time) - new Date(record.punch_in_time);
    const hours = diff / (1000 * 60 * 60);
    return `${hours.toFixed(2)}h`;
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    // Pristine Pure-White Base Layout (Tightened padding)
    <div className="p-2 lg:p-4 max-w-[1600px] mx-auto w-full bg-slate-50/40 dark:bg-transparent min-h-screen">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className={`text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Attendance History
          </h2>
          <p className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Review and filter your complete log records
          </p>
        </div>

        {/* Stunning Custom Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36">
            <StunningSelect
              value={monthFilter}
              onChange={(val) => { setMonthFilter(Number(val)); setCurrentPage(1); }}
              options={months.map((m, idx) => ({ value: idx + 1, label: m }))}
              placeholder="Select Month"
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="w-28">
            <StunningSelect
              value={yearFilter}
              onChange={(val) => { setYearFilter(Number(val)); setCurrentPage(1); }}
              options={years.map((y) => ({ value: y, label: String(y) }))}
              placeholder="Select Year"
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="w-36">
            <StunningSelect
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Present', label: 'Present Only' },
                { value: 'Late', label: 'Late Only' },
                { value: 'Half-Day', label: 'Half-Day Only' },
                { value: 'Absent', label: 'Absent Only' }
              ]}
              placeholder="Filter Status"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* STUNNING SUMMARY CARDS (Tightened padding and sizing) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Present', color: 'emerald', value: attendanceHistory.filter(r => r.status === 'Present').length },
          { label: 'Late', color: 'amber', value: attendanceHistory.filter(r => r.status === 'Late').length },
          { label: 'Half-Day', color: 'sky', value: attendanceHistory.filter(r => r.status === 'Half-Day').length },
          { label: 'Absent', color: 'rose', value: attendanceHistory.filter(r => r.status === 'Absent').length },
        ].map((stat) => (
          <div key={stat.label} className={`p-3 rounded-xl border relative overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`absolute top-0 right-0 w-16 h-16 bg-${stat.color}-500/10 rounded-full blur-xl -mr-4 -mt-4`} />
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 text-${stat.color}-500`}>
              Total {stat.label}
            </p>
            <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* PRISTINE DATA TABLE (Shrunk padding and typography) */}
      <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[9px] font-bold uppercase tracking-widest border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/30 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Punch In</th>
                <th className="px-3 py-2.5">Punch Out</th>
                <th className="px-3 py-2.5">Total Hours</th>
                <th className="px-4 py-2.5">Location</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                      <p className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : attendanceHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 border border-slate-200 dark:border-slate-700">
                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No Records Found</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Try adjusting your month or year filters.</p>
                  </td>
                </tr>
              ) : attendanceHistory.map((record) => (
                <tr 
                  key={record.id} 
                  onClick={() => setSelectedRecord(record)}
                  className={`group cursor-pointer transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-blue-50/30'
                  }`}
                >
                  <td className="px-4 py-2">
                    <div className={`text-[11px] font-bold tracking-wide transition-colors ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>
                      {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-mono text-[11px] font-bold transition-colors ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-blue-600'}`}>
                      {record.punch_in_time 
                        ? new Date(record.punch_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                        : <span className="text-slate-300 dark:text-slate-500">--:--</span>
                      }
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-mono text-[11px] font-bold transition-colors ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-blue-600'}`}>
                      {record.punch_out_time 
                        ? new Date(record.punch_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) 
                        : <span className="text-slate-300 dark:text-slate-500">--:--</span>
                      }
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`font-mono text-[11px] font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {getHoursWorked(record)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {record.punch_in_gps ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                          {record.punch_in_gps}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-300 dark:text-slate-600">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Elegant Pagination Footer */}
        <div className={`px-4 py-2.5 border-t flex flex-col sm:flex-row items-center justify-between gap-2 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
          <p className={`text-[9px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            Showing <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>{attendanceHistory.length}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-md transition-colors border-none outline-none ${
                isDarkMode 
                  ? 'bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50' 
                  : 'bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 shadow-sm disabled:opacity-50 disabled:bg-transparent disabled:text-slate-400'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={attendanceHistory.length < 10} // Assuming 10 is page size
              className={`p-1.5 rounded-md transition-colors border-none outline-none ${
                isDarkMode 
                  ? 'bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50' 
                  : 'bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 shadow-sm disabled:opacity-50 disabled:bg-transparent disabled:text-slate-400'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* STUNNING RECORD DETAIL MODAL (Tightened) */}
      {/* ========================================== */}
      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} size="sm">
        {selectedRecord && (
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {new Date(selectedRecord.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <StatusBadge status={selectedRecord.status} />
            </div>
            
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-100 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80 mb-0.5">Clock In</p>
                  <p className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-200">
                    {selectedRecord.punch_in_time ? new Date(selectedRecord.punch_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '---'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50/50 border-rose-100 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-rose-600/80 dark:text-rose-400/80 mb-0.5">Clock Out</p>
                  <p className="font-mono font-bold text-sm text-rose-800 dark:text-rose-200">
                    {selectedRecord.punch_out_time ? new Date(selectedRecord.punch_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '---'}
                  </p>
                </div>
              </div>
            </div>

            {selectedRecord.punch_in_time && selectedRecord.punch_out_time && (
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white border-slate-200 shadow-sm'} flex items-center justify-between`}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500">Total Logged</span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                  {getHoursWorked(selectedRecord)}
                </span>
              </div>
            )}

            {selectedRecord.punch_in_gps && (
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} flex items-center gap-2.5`}>
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="overflow-hidden">
                   <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Verification Area</span>
                   <span className={`text-[11px] font-semibold truncate block ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                     {selectedRecord.punch_in_gps}
                   </span>
                </div>
              </div>
            )}

            <button 
              onClick={() => setSelectedRecord(null)} 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors border-none outline-none shadow-sm mt-2">
              Dismiss Panel
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default MyAttendanceHistory;