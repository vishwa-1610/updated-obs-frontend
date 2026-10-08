import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar as CalendarIcon, FileText, PieChart, 
  MapPin, Fingerprint, ChevronLeft, ChevronRight, 
  Plus, Download, Home, ChevronDown, Settings, 
  Maximize2, Users, Loader2
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import api from '../../api'; 
import Modal from '../common/Modal/Modal'; 
import PageLoader from '../common/LoadingScreen/LoadingScreen'; 

const Attendance = () => {
  const { isDarkMode } = useTheme();
  
  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarView, setCalendarView] = useState(new Date()); 
  
  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  
  // Dropdown States
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState('Happy');

  // --- API DATA STATES ---
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  
  // Live Punch State
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [hoursWorked, setHoursWorked] = useState("00:00");
  const [liveProgress, setLiveProgress] = useState(0);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Filters
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const [leaveForm, setLeaveForm] = useState({ leave_type: 'Full Day', start_date: '', end_date: '', reason: '' });
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '', is_national: true });

  // --- API DATA FETCHING ---
  const fetchAllData = async () => {
    try {
      const [attRes, leaveRes, holRes] = await Promise.all([
        api.get('/attendance/history/').catch(() => ({ data: [] })),
        api.get('/attendance/leave/my-requests/').catch(() => ({ data: [] })),
        api.get('/attendance/holidays/').catch(() => ({ data: [] }))
      ]);

      setAttendanceHistory(Array.isArray(attRes.data) ? attRes.data : []);
      setLeaveRequests(Array.isArray(leaveRes.data) ? leaveRes.data : []);
      setHolidays(Array.isArray(holRes.data) ? holRes.data : []);

      const todayStr = new Date().toLocaleDateString('en-CA'); 
      const todayRecord = Array.isArray(attRes.data) ? attRes.data.find(r => r.date === todayStr) : null;
      
      if (todayRecord && todayRecord.punch_in_time && !todayRecord.punch_out_time) {
        setIsPunchedIn(true);
        setPunchInTime(new Date(todayRecord.punch_in_time));
      } else {
        setIsPunchedIn(false);
        setPunchInTime(null);
        if (todayRecord && todayRecord.punch_out_time) {
           const inTime = new Date(todayRecord.punch_in_time);
           const outTime = new Date(todayRecord.punch_out_time);
           const diffMs = outTime - inTime;
           const hrs = Math.floor(diffMs / 3600000);
           const mins = Math.floor((diffMs % 3600000) / 60000);
           setHoursWorked(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
           setLiveProgress(Math.min((hrs / 9) * 100, 100)); 
        } else {
           setHoursWorked("00:00");
           setLiveProgress(0);
        }
      }
    } catch (err) {
      console.error("Data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get(`/attendance/report/monthly/?month=${reportMonth}&year=${reportYear}`);
      setReportData(res.data.data || []);
    } catch (err) { console.error("Report fetch error", err); }
  };

  useEffect(() => { fetchAllData(); }, []);
  useEffect(() => { if (activeTab === 'reports') fetchReports(); }, [activeTab, reportMonth, reportYear]);

  // --- LIVE CLOCK & HOURS CALCULATOR ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isPunchedIn && punchInTime) {
        const diffMs = new Date() - punchInTime;
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        setHoursWorked(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        setLiveProgress(Math.min(((diffMs / 3600000) / 9) * 100, 100)); 
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPunchedIn, punchInTime]);

  // --- POST ACTIONS ---
  const handlePunch = async () => {
    setPunchLoading(true);
    const submit = async (gps) => {
      try {
        await api.post('/attendance/punch/', { gps_coords: gps });
        await fetchAllData(); 
      } catch (err) { alert(err.response?.data?.error || "Punch failed."); } 
      finally { setPunchLoading(false); }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => submit(`${pos.coords.latitude}, ${pos.coords.longitude}`),
        () => submit("GPS_DENIED")
      );
    } else { submit("NO_GPS"); }
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/attendance/leave/my-requests/', leaveForm);
      setShowLeaveModal(false);
      setLeaveForm({ leave_type: 'Full Day', start_date: '', end_date: '', reason: '' });
      fetchAllData();
    } catch (err) { alert("Failed to submit leave."); } 
    finally { setFormLoading(false); }
  };

  const submitHoliday = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/attendance/holidays/', holidayForm);
      setShowHolidayModal(false);
      setHolidayForm({ name: '', date: '', is_national: true });
      fetchAllData();
    } catch (err) { alert("Failed to save holiday."); } 
    finally { setFormLoading(false); }
  };

  const handleExport = (format) => {
    window.open(`${import.meta.env.VITE_BACKEND_URL}/api/attendance/report/monthly/?month=${reportMonth}&year=${reportYear}&format=${format}`, '_blank');
  };

  // --- UI COMPONENTS ---
  const StatusBadge = ({ status }) => {
    const styles = {
      'Present': 'bg-emerald-500/10 text-emerald-600',
      'Late': 'bg-amber-500/10 text-amber-600',
      'Half-Day': 'bg-blue-500/10 text-blue-600',
      'Absent': 'bg-rose-500/10 text-rose-600',
      'Holiday': 'bg-purple-500/10 text-purple-600',
    };
    return (
      <span className={`px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
        {status}
      </span>
    );
  };

  // STUNNING DARK DROPDOWN (Matches your screenshot exactly)
  const SleekDropdown = ({ value, options, isOpen, setIsOpen, onChange }) => (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-[#1e293b] text-white hover:bg-slate-800 transition-colors border-none outline-none shadow-sm"
      >
        <span>😊</span> {value} <ChevronDown size={16} className={`transition-transform ml-1 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 rounded-2xl shadow-2xl bg-[#1e293b] border border-slate-700 overflow-hidden z-[100] animate-in fade-in zoom-in-95">
          {options.map((opt) => (
            <button 
              key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} 
              className="w-full text-left px-4 py-3 text-sm font-bold text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // --- FUNCTIONAL CALENDAR LOGIC ---
  const renderCalendar = () => {
    const year = calendarView.getFullYear();
    const month = calendarView.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Format holidays safely
    const holiMap = new Set(holidays.map(h => {
      // Ensure date is YYYY-MM-DD
      const d = new Date(h.date);
      return isNaN(d) ? h.date : d.toLocaleDateString('en-CA');
    }));
    
    const attMap = {};
    attendanceHistory.forEach(a => { 
      const d = new Date(a.date);
      const safeDate = isNaN(d) ? a.date : d.toLocaleDateString('en-CA');
      attMap[safeDate] = a.status; 
    });

    const todayStr = new Date().toLocaleDateString('en-CA');

    const grid = [];
    for (let i = 0; i < firstDay; i++) grid.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
      const isToday = dateStr === todayStr;
      const isWeekend = new Date(year, month, day).getDay() % 6 === 0;
      const isHoliday = holiMap.has(dateStr);
      const attStatus = attMap[dateStr];

      let baseClass = "flex items-center justify-center h-10 w-10 rounded-xl text-sm font-bold mx-auto transition-all cursor-default ";
      
      if (isToday) {
        baseClass += "bg-blue-600 text-white shadow-lg shadow-blue-500/40 transform hover:scale-110 cursor-pointer";
      } else if (isHoliday || attStatus === 'Absent') {
        baseClass += "bg-[#ffe4e6] text-[#e11d48] dark:bg-rose-500/20"; // Exact pink from screenshot
      } else if (attStatus === 'Present' || attStatus === 'Late') {
        baseClass += "bg-[#1e293b] text-white"; // Exact dark slate from screenshot
      } else if (isWeekend) {
        baseClass += "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600";
      } else {
        baseClass += `hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
      }

      grid.push(<div key={day} className={baseClass} title={attStatus || (isHoliday ? 'Holiday' : '')}>{day}</div>);
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col h-full ${isDarkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCalendarView(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ChevronLeft size={20}/></button>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{monthNames[month]} <span className="font-medium text-gray-400 text-sm ml-1">{year}</span></h3>
            <button onClick={() => setCalendarView(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ChevronRight size={20}/></button>
          </div>
          <Maximize2 size={16} className="text-gray-400 cursor-pointer hover:text-blue-500" />
        </div>
        
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className={`text-[11px] font-extrabold tracking-wider ${d === 'SUN' || d === 'SAT' ? 'text-rose-400' : 'text-blue-500'}`}>{d}</div>
          ))}
          {grid}
        </div>
      </div>
    );
  };

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <PageLoader 
          message="Loading Attendance & Timesheet Logs..."
          subMessage="Fetching clock-in records, timecard approvals, and PTO balances"
          showSkeleton={true}
          skeletonType="dashboard"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDarkMode ? 'bg-[#0f172a] text-gray-200' : 'bg-[#f8fafc] text-gray-800'}`}>
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Dashboard</h1>
        </div>
        
        <div className="flex bg-[#334155] p-1.5 rounded-2xl gap-1 shadow-inner">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'leave', label: 'Leaves', icon: CalendarIcon },
            { id: 'reports', label: 'Reports', icon: PieChart },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'text-gray-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              <tab.icon size={16} className="mr-2 hidden sm:block" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- TAB 1: DASHBOARD --- */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 space-y-6">
            
            {/* PUNCH CARD WIDGET */}
            <div className={`p-6 md:p-8 rounded-3xl border shadow-sm relative ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Let's get to work</h2>
                  <p className="text-gray-400 font-medium text-sm mt-1">{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <SleekDropdown value={selectedMood} options={['Happy', 'Neutral', 'Tired']} isOpen={isMoodOpen} setIsOpen={setIsMoodOpen} onChange={setSelectedMood} />
                  <div className="px-3 py-1.5 rounded-xl text-sm font-bold bg-[#d1fae5] text-[#047857] flex items-center shadow-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isPunchedIn ? 'bg-[#10b981] animate-pulse' : 'bg-gray-400'}`}></div>
                    {isPunchedIn ? 'Working' : 'Not Started'}
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className={`text-6xl md:text-7xl font-black tabular-nums tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>
                  {hoursWorked}
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-3">Hours Worked Today</p>
              </div>

              <div className="mb-8 px-2 md:px-8">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                  <span>09:00 AM</span>
                  <span>06:00 PM</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#1e293b] dark:bg-gray-800 overflow-hidden shadow-inner">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${liveProgress}%` }}></div>
                </div>
                <div className="text-center text-xs font-bold text-gray-400 mt-2">09:00 AM - 06:00 PM (Shift)</div>
              </div>

              <button 
                onClick={handlePunch} disabled={punchLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex justify-center items-center transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-80 ${
                  isPunchedIn ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-[#10b981] hover:bg-[#059669] shadow-emerald-500/20'
                }`}
              >
                {punchLoading ? <Loader2 className="animate-spin" /> : (isPunchedIn ? 'Stop Work (Punch Out)' : '▶ Clock In')}
              </button>
            </div>

            {/* RECENT ACTIVITY TABLE */}
            <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Punches</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-100'}`}>
                      <th className="pb-4 pl-4">Date</th>
                      <th className="pb-4">In</th>
                      <th className="pb-4">Out</th>
                      <th className="pb-4 text-right pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500 font-bold">No punches found.</td></tr>
                    ) : (
                      attendanceHistory.slice(0, 5).map((record) => (
                        <tr 
                          key={record.id} 
                          onClick={() => setSelectedRecord(record)} 
                          className={`cursor-pointer transition-colors border-b last:border-0 ${isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-50 hover:bg-blue-50/50'}`}
                        >
                          <td className="py-4 pl-4 font-bold text-blue-600 hover:underline">{record.date}</td>
                          <td className="py-4 font-medium">{record.punch_in_time ? new Date(record.punch_in_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '-'}</td>
                          <td className="py-4 font-medium">{record.punch_out_time ? new Date(record.punch_out_time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : 'Active'}</td>
                          <td className="py-4 pr-4 text-right"><StatusBadge status={record.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="xl:col-span-1 space-y-6 flex flex-col">
            <div className="flex-grow">
              {renderCalendar()}
            </div>

            <div className={`p-6 rounded-3xl border shadow-sm flex flex-col ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Home size={14}/></span> Upcoming Holidays
                </h3>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{holidays.length}</span>
              </div>
              
              {holidays.length > 0 ? (
                <div className="space-y-3">
                  {holidays.map(h => (
                    <div key={h.id} className={`p-4 rounded-2xl flex justify-between items-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div><h4 className="font-bold text-sm">{h.name}</h4><p className="text-xs text-gray-500">{h.date}</p></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 opacity-50">
                  <p className="text-sm font-bold">No Holidays Found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: LEAVES --- */}
      {activeTab === 'leave' && (
        <div className={`p-8 rounded-3xl border shadow-sm min-h-[60vh] ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center mb-8 border-b pb-6 dark:border-gray-800">
            <div><h2 className="text-2xl font-bold">Leave History</h2><p className="text-gray-500 mt-1 font-medium">Manage your time off requests.</p></div>
            <button onClick={() => setShowLeaveModal(true)} className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
              <Plus size={18} className="mr-2" /> Request Leave
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} flex flex-col`}>
                <div className="flex justify-between items-start mb-4"><StatusBadge status={leave.leave_type} /><StatusBadge status={leave.status} /></div>
                <h4 className="font-bold text-lg mb-2">{leave.reason}</h4>
                <div className="text-sm font-medium text-gray-500 flex items-center mt-auto pt-4 border-t dark:border-gray-700">
                  <CalendarIcon size={14} className="mr-2" />{leave.start_date} {leave.start_date !== leave.end_date && ` to ${leave.end_date}`}
                </div>
              </div>
            ))}
            {leaveRequests.length === 0 && <p className="text-gray-500 font-bold col-span-3 text-center py-10">No leave requests found.</p>}
          </div>
        </div>
      )}

      {/* --- TAB 3: REPORTS --- */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className={`flex flex-wrap items-center justify-between p-4 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="px-4 py-2 rounded-xl font-bold border-none outline-none bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white">
                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
              </select>
              <select value={reportYear} onChange={(e) => setReportYear(e.target.value)} className="px-4 py-2 rounded-xl font-bold border-none outline-none bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white">
                {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('csv')} className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold rounded-xl transition-colors"><Download size={16} className="mr-2" /> CSV</button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className="text-lg font-bold mb-6">Attendance Summary</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-4">Employee</th><th className="pb-4">Present</th><th className="pb-4">Late</th><th className="pb-4">Absent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {reportData.map((row, i) => (
                    <tr key={i}>
                      <td className="py-4 font-bold">{row.first_name} {row.last_name} <br/><span className="text-xs text-gray-500 font-normal">{row.email}</span></td>
                      <td className="py-4 text-emerald-500 font-black">{row.total_present}</td><td className="py-4 text-amber-500 font-black">{row.total_late}</td><td className="py-4 text-rose-500 font-black">{row.total_absent}</td>
                    </tr>
                  ))}
                  {reportData.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500 font-bold">No report data found.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className={`p-6 rounded-3xl border shadow-sm h-fit ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
               <h3 className="text-lg font-bold flex items-center gap-2 mb-6"><Users size={18} className="text-rose-500"/> Absentees Today</h3>
               <div className="space-y-4">
                 <p className="text-sm font-bold text-gray-500 text-center py-4">No absentees to display.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: SETTINGS --- */}
      {activeTab === 'settings' && (
        <div className={`p-8 rounded-3xl border shadow-sm min-h-[60vh] ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center mb-8 border-b pb-6 dark:border-gray-800">
            <div><h2 className="text-2xl font-bold">Holiday Configurations</h2><p className="text-gray-500 mt-1 font-medium">Manage public holidays to reflect on calendars.</p></div>
            <button onClick={() => setShowHolidayModal(true)} className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
              <Plus size={18} className="mr-2" /> Add Holiday
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b dark:border-gray-800">
                <th className="pb-4">Name</th><th className="pb-4">Date</th><th className="pb-4">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {holidays.map(h => (
                <tr key={h.id}><td className="py-4 font-bold">{h.name}</td><td className="py-4">{h.date}</td><td className="py-4"><StatusBadge status={h.is_national ? 'National' : 'Holiday'} /></td></tr>
              ))}
              {holidays.length === 0 && <tr><td colSpan="3" className="text-center py-8 text-gray-500 font-bold">No holidays configured.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================= */}
      {/* MODALS */}
      {/* ========================================= */}

      {/* Row Click Details */}
      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Punch Details" size="md">
        {selectedRecord && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
              <h3 className="text-2xl font-black">{selectedRecord.date}</h3>
              <StatusBadge status={selectedRecord.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 border-none">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Clock In</p>
                <p className="text-xl font-bold text-blue-500">{selectedRecord.punch_in_time ? new Date(selectedRecord.punch_in_time).toLocaleTimeString() : '-'}</p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 border-none">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Clock Out</p>
                <p className="text-xl font-bold text-rose-500">{selectedRecord.punch_out_time ? new Date(selectedRecord.punch_out_time).toLocaleTimeString() : 'Active'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Request Leave */}
      <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Request Leave" size="md">
        <form onSubmit={submitLeave} className="space-y-6">
          {/* Custom Select Wrapper removing native borders */}
          <div className="relative">
             <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Leave Type</label>
             <div className="relative">
                <select value={leaveForm.leave_type} onChange={e => setLeaveForm({...leaveForm, leave_type: e.target.value})} className="w-full p-4 rounded-xl font-bold appearance-none bg-gray-100 text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white cursor-pointer">
                  <option value="Full Day">Full Day</option><option value="Half Day">Half Day</option><option value="WFH">Work From Home</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Start Date</label><input type="date" required value={leaveForm.start_date} onChange={e => setLeaveForm({...leaveForm, start_date: e.target.value})} className="w-full p-4 rounded-xl font-bold bg-gray-100 text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" /></div>
            <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">End Date</label><input type="date" required value={leaveForm.end_date} onChange={e => setLeaveForm({...leaveForm, end_date: e.target.value})} className="w-full p-4 rounded-xl font-bold bg-gray-100 text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" /></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Reason</label><textarea required rows="3" value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full p-4 rounded-xl font-bold bg-gray-100 text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" placeholder="Provide a brief reason..."></textarea></div>
          <button type="submit" disabled={formLoading} className="w-full py-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">{formLoading ? <Loader2 className="animate-spin mx-auto" /> : "Submit Request"}</button>
        </form>
      </Modal>

      {/* Add Holiday (Matching Screenshot 1) */}
      <Modal isOpen={showHolidayModal} onClose={() => setShowHolidayModal(false)} title="Add Holiday" size="sm">
        <form onSubmit={submitHoliday} className="space-y-6">
          <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Holiday Name</label><input type="text" required value={holidayForm.name} onChange={e => setHolidayForm({...holidayForm, name: e.target.value})} className="w-full p-4 rounded-xl font-bold bg-gray-100 text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" placeholder="e.g., Thanksgiving" /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Date</label><input type="date" required value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} className="w-full p-4 rounded-xl font-bold bg-gray-100 text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" /></div>
          <button type="submit" disabled={formLoading} className="w-full py-4 bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold text-lg rounded-xl transition-all shadow-[0_4px_14px_0_rgba(29,78,216,0.39)]">{formLoading ? <Loader2 className="animate-spin mx-auto" /> : "Save Holiday"}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;