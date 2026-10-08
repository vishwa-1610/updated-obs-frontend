import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MapPin, Clock, AlertTriangle, 
  CheckCircle2, XCircle, Coffee, Laptop, ShieldAlert,
  Eye, RefreshCw, ChevronDown, Download, UserCheck, Smartphone
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { attendanceService } from '../../services/attendanceService';
import { StunningSelect, StatusBadge } from './AttendanceComponents';

export const LiveAttendanceRoster = () => {
  const { isDarkMode } = useTheme();
  const [rosterData, setRosterData] = useState([]);
  const [summary, setSummary] = useState({
    total_present: 0,
    in_office: 0,
    remote_wfh: 0,
    on_break: 0,
    late_count: 0,
    geofence_flagged: 0,
    on_leave: 0,
    total_absent: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [locations, setLocations] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchLiveRoster = async () => {
    setLoading(true);
    try {
      const [dashRes, locRes] = await Promise.all([
        attendanceService.getLiveDashboard(),
        attendanceService.getLocations()
      ]);
      
      const records = dashRes.data?.records || dashRes.data?.roster || dashRes.data || [];
      setRosterData(Array.isArray(records) ? records : []);
      
      if (dashRes.data?.summary) {
        setSummary(dashRes.data.summary);
      } else {
        // Calculate summary on the fly
        const present = records.filter(r => r.punch_in_time && !r.punch_out_time).length;
        const inOffice = records.filter(r => r.work_mode === 'OFFICE' && r.punch_in_time && !r.punch_out_time).length;
        const remote = records.filter(r => (r.work_mode === 'REMOTE' || r.work_mode === 'WFH') && r.punch_in_time && !r.punch_out_time).length;
        const onBreak = records.filter(r => r.is_on_break).length;
        const late = records.filter(r => r.is_late).length;
        const flagged = records.filter(r => r.is_geofence_violation || r.geofence_status === 'OUTSIDE').length;
        const leave = records.filter(r => r.status === 'ON_LEAVE' || r.status === 'Leave').length;
        const absent = records.filter(r => r.status === 'ABSENT' || (!r.punch_in_time && r.status !== 'ON_LEAVE')).length;

        setSummary({
          total_present: present,
          in_office: inOffice,
          remote_wfh: remote,
          on_break: onBreak,
          late_count: late,
          geofence_flagged: flagged,
          on_leave: leave,
          total_absent: absent
        });
      }

      setLocations(locRes.data?.results || locRes.data || []);
    } catch (err) {
      console.error('Failed to load live roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRoster();
    const interval = setInterval(fetchLiveRoster, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const locationOptions = [
    { value: 'ALL', label: 'All Locations' },
    ...locations.map(loc => ({ value: String(loc.id), label: loc.name }))
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PRESENT', label: 'Present / In Office' },
    { value: 'REMOTE', label: 'Remote / WFH' },
    { value: 'BREAK', label: 'On Break' },
    { value: 'LATE', label: 'Late Arrival' },
    { value: 'FLAGGED', label: 'Geofence Flagged' },
    { value: 'LEAVE', label: 'On Leave' },
    { value: 'ABSENT', label: 'Absent' },
  ];

  const filteredRoster = rosterData.filter(item => {
    const name = (item.employee_name || item.user_name || item.name || '').toLowerCase();
    const email = (item.employee_email || item.email || '').toLowerCase();
    const dept = (item.department || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = name.includes(query) || email.includes(query) || dept.includes(query);
    
    let matchesStatus = true;
    if (statusFilter === 'PRESENT') matchesStatus = item.punch_in_time && !item.punch_out_time;
    else if (statusFilter === 'REMOTE') matchesStatus = item.work_mode === 'REMOTE' || item.work_mode === 'WFH';
    else if (statusFilter === 'BREAK') matchesStatus = item.is_on_break;
    else if (statusFilter === 'LATE') matchesStatus = item.is_late;
    else if (statusFilter === 'FLAGGED') matchesStatus = item.is_geofence_violation || item.geofence_status === 'OUTSIDE';
    else if (statusFilter === 'LEAVE') matchesStatus = item.status === 'ON_LEAVE' || item.status === 'Leave';
    else if (statusFilter === 'ABSENT') matchesStatus = item.status === 'ABSENT' || (!item.punch_in_time && item.status !== 'ON_LEAVE');

    let matchesLoc = true;
    if (locationFilter !== 'ALL') {
      matchesLoc = String(item.location_id) === locationFilter || String(item.location) === locationFilter;
    }

    return matchesSearch && matchesStatus && matchesLoc;
  });

  return (
    <div className="space-y-6">
      {/* SUMMARY KPI ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Present Now', count: summary.total_present, icon: UserCheck, color: 'emerald' },
          { label: 'In Office', count: summary.in_office, icon: MapPin, color: 'blue' },
          { label: 'Remote / WFH', count: summary.remote_wfh, icon: Laptop, color: 'indigo' },
          { label: 'On Break', count: summary.on_break, icon: Coffee, color: 'amber' },
          { label: 'Late Arrival', count: summary.late_count, icon: Clock, color: 'amber' },
          { label: 'Geofence Flagged', count: summary.geofence_flagged, icon: ShieldAlert, color: 'rose' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className={`p-3.5 rounded-2xl border transition-all hover:scale-[1.02] ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg bg-${kpi.color}-50 dark:bg-${kpi.color}-950/40 text-${kpi.color}-600 dark:text-${kpi.color}-400`}>
                  <Icon size={14} />
                </div>
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {kpi.count}
              </p>
            </div>
          );
        })}
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border outline-none transition-all ${
              isDarkMode 
                ? 'bg-[#18181b] border-[#27272a] text-white focus:border-blue-500' 
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <StunningSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="w-44"
          />

          <StunningSelect
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            options={locationOptions}
            className="w-44"
          />

          <button
            onClick={fetchLiveRoster}
            disabled={loading}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              isDarkMode 
                ? 'bg-[#18181b] border-[#27272a] text-slate-300 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Refresh Roster"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* LIVE ROSTER TABLE */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
                isDarkMode ? 'bg-[#18181b]/70 border-[#27272a] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Work Mode</th>
                <th className="py-3.5 px-4">Punch In</th>
                <th className="py-3.5 px-4">Punch Out</th>
                <th className="py-3.5 px-4">Geofence Compliance</th>
                <th className="py-3.5 px-4">Breaks / Elapsed</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {loading && rosterData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-xs font-medium">Fetching real-time team attendance...</p>
                  </td>
                </tr>
              ) : filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No employee records match the filters</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Try resetting search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredRoster.map((item, idx) => {
                  const isClockedIn = item.punch_in_time && !item.punch_out_time;
                  const isViolation = item.is_geofence_violation || item.geofence_status === 'OUTSIDE';

                  return (
                    <tr 
                      key={item.id || idx}
                      className={`transition-colors duration-150 cursor-pointer ${
                        isDarkMode ? 'hover:bg-[#18181b]/60' : 'hover:bg-slate-50/80'
                      }`}
                      onClick={() => setSelectedRecord(item)}
                    >
                      {/* Employee Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isDarkMode ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {(item.employee_name || item.user_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {item.employee_name || item.user_name || 'Employee'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.department || item.role || item.employee_email || 'Staff'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.is_on_break ? (
                          <StatusBadge status="BREAK" text="On Break" />
                        ) : isClockedIn ? (
                          <StatusBadge status="PRESENT" text={item.is_late ? "Late (Active)" : "Clocked In"} />
                        ) : item.status === 'ON_LEAVE' ? (
                          <StatusBadge status="LEAVE" text="On Leave" />
                        ) : item.punch_out_time ? (
                          <StatusBadge status="OUT" text="Clocked Out" />
                        ) : (
                          <StatusBadge status="ABSENT" text="Absent" />
                        )}
                      </td>

                      {/* Work Mode */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          item.work_mode === 'REMOTE' || item.work_mode === 'WFH'
                            ? (isDarkMode ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/30' : 'bg-indigo-50 text-indigo-700')
                            : (isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700')
                        }`}>
                          {item.work_mode === 'REMOTE' || item.work_mode === 'WFH' ? <Laptop size={12} /> : <MapPin size={12} />}
                          {item.work_mode || 'OFFICE'}
                        </span>
                      </td>

                      {/* Punch In */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {item.punch_in_time 
                          ? new Date(item.punch_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'
                        }
                      </td>

                      {/* Punch Out */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {item.punch_out_time 
                          ? new Date(item.punch_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'
                        }
                      </td>

                      {/* Geofence Status */}
                      <td className="py-3.5 px-4">
                        {isViolation ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/40">
                            <ShieldAlert size={12} /> Outside Zone
                          </span>
                        ) : item.punch_in_time ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                            <CheckCircle2 size={12} /> Inside Zone
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Breaks / Elapsed */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">
                            {item.total_hours_worked ? `${item.total_hours_worked} hrs` : item.elapsed || '—'}
                          </span>
                          {item.total_break_minutes > 0 && (
                            <span className="ml-2 text-slate-400">
                              ({item.total_break_minutes}m break)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Details Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(item);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isDarkMode 
                              ? 'border-zinc-700 hover:bg-zinc-800 text-slate-300 hover:text-white' 
                              : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl space-y-6 ${
            isDarkMode ? 'bg-[#09090b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-slate-200 text-[#0f172a]'
          }`}>
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 flex items-center justify-center text-lg font-black">
                  {(selectedRecord.employee_name || 'U').charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">{selectedRecord.employee_name || 'Employee Attendance'}</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedRecord.department || 'General Staff'} &bull; {selectedRecord.employee_email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Punch In</p>
                <p className="text-sm font-black mt-1 font-mono">
                  {selectedRecord.punch_in_time ? new Date(selectedRecord.punch_in_time).toLocaleTimeString() : 'Not recorded'}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Punch Out</p>
                <p className="text-sm font-black mt-1 font-mono">
                  {selectedRecord.punch_out_time ? new Date(selectedRecord.punch_out_time).toLocaleTimeString() : 'Active'}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Work Mode</p>
                <p className="text-sm font-black mt-1">{selectedRecord.work_mode || 'OFFICE'}</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Geofence Status</p>
                <p className={`text-sm font-black mt-1 ${selectedRecord.is_geofence_violation ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {selectedRecord.is_geofence_violation ? 'Violation' : 'Compliant'}
                </p>
              </div>
            </div>

            {/* GPS & IP Info */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">GPS Coordinates:</span>
                <span className="font-mono font-semibold">
                  {selectedRecord.punch_in_latitude && selectedRecord.punch_in_longitude 
                    ? `${selectedRecord.punch_in_latitude}, ${selectedRecord.punch_in_longitude}`
                    : selectedRecord.gps_coords || 'Not available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Network IP Address:</span>
                <span className="font-mono font-semibold">{selectedRecord.ip_address || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Assigned Location:</span>
                <span className="font-semibold">{selectedRecord.location_name || 'Main Office'}</span>
              </div>
            </div>

            {/* Selfie Verification if available */}
            {selectedRecord.selfie_url && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Punch Verification Selfie</p>
                <img 
                  src={selectedRecord.selfie_url} 
                  alt="Punch Selfie" 
                  className="w-32 h-32 rounded-2xl object-cover border border-slate-200 dark:border-zinc-700" 
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs theme-bg-primary text-white"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
