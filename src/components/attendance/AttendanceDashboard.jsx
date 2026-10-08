import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Clock, CalendarCheck, CalendarX, ClipboardList, 
  UserCheck, BarChart3, Calendar, Settings, Timer, 
  MapPin, Activity, ArrowLeftRight, Users, Sparkles
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { fetchSettings, fetchHolidays, fetchMyLeaves } from '../../store/attendanceSlice';
import { attendanceService } from '../../services/attendanceService';

// Components
import { PunchInOut } from './PunchInOut';
import { LiveAttendanceRoster } from './LiveAttendanceRoster';
import { WorkLocationsView } from './WorkLocationsView';
import { ShiftRosterView } from './ShiftRosterView';
import { EmployeeMonitoringView } from './EmployeeMonitoringView';
import { LeaveManagement } from './LeaveManagement';
import { ManagerLeaveApproval } from './ManagerLeaveApproval';
import { Timesheet } from './Timesheet';
import { MonthlyReport } from './MonthlyReport';
import { HolidayManagement } from './HolidayManagement';
import { AttendanceSettings } from './AttendanceSettings';

const AttendanceDashboard = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { settings, holidays = [], myLeaves = [] } = useSelector((state) => state.attendance);

  const [activeView, setActiveView] = useState('live_roster');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(fetchHolidays());
    dispatch(fetchMyLeaves());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous in-browser Live Presence Heartbeat
  useEffect(() => {
    const sendLivePresence = () => {
      attendanceService.sendHeartbeat({
        current_app: 'Google Chrome (Antigravity IDE)',
        current_window_title: document.title || 'Workforce Attendance PRO 2.0 - Onboard Portal',
        status: document.hidden ? 'IDLE' : 'ONLINE_ACTIVE',
        os_platform: navigator.platform || 'Windows 11',
        agent_version: '2.4.0-web'
      }).catch((e) => console.debug('Heartbeat ping:', e));
    };

    // Send immediately on load
    sendLivePresence();

    // Ping every 30 seconds
    const heartbeatInterval = setInterval(sendLivePresence, 30000);

    // Listen to tab visibility
    const handleVisibilityChange = () => {
      sendLivePresence();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const isManager = true; // Admin/Manager workforce permissions

  const views = [
    { id: 'live_roster', label: 'Live Roster', icon: Users },
    { id: 'punch', label: 'Clock In / Breaks', icon: Clock },
    { id: 'shifts', label: 'Shifts & Rosters', icon: ArrowLeftRight },
    { id: 'leaves', label: 'Leave Quotas', icon: CalendarX },
    { id: 'timesheet', label: 'Timesheets', icon: ClipboardList },
    { id: 'monitoring', label: 'Productivity Suite', icon: Activity },
    { id: 'locations', label: 'Work Locations', icon: MapPin },
    { id: 'approvals', label: 'Manager Approvals', icon: UserCheck },
    { id: 'report', label: 'Analytics Reports', icon: BarChart3 },
    { id: 'holidays', label: 'Holidays', icon: Calendar },
    { id: 'settings', label: 'Policy Settings', icon: Settings },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const renderContent = () => {
    switch (activeView) {
      case 'live_roster': return <LiveAttendanceRoster />;
      case 'punch': return <PunchInOut />;
      case 'shifts': return <ShiftRosterView />;
      case 'leaves': return <LeaveManagement />;
      case 'timesheet': return <Timesheet />;
      case 'monitoring': return <EmployeeMonitoringView />;
      case 'locations': return <WorkLocationsView />;
      case 'approvals': return <ManagerLeaveApproval />;
      case 'report': return <MonthlyReport />;
      case 'holidays': return <HolidayManagement />;
      case 'settings': return <AttendanceSettings />;
      default: return <LiveAttendanceRoster />;
    }
  };

  return (
    <div className={`w-full min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-slate-50/40'}`}>
      
      {/* GLOBAL DASHBOARD HEADER */}
      <div className="px-3 pt-4 lg:px-6 lg:pt-4 max-w-[1600px] mx-auto w-full">
        
        {/* Top Title & Server Clock */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-3xl lg:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Workforce Attendance
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black theme-bg-primary text-white">
                PRO 2.0
              </span>
            </div>
            <p className="text-xs font-bold mt-1 uppercase tracking-widest text-slate-400">
              Centralized Geofenced Clock-In, Live Team Presence & Shift Rostering
            </p>
          </div>
          
          {/* Live Server Clock Card */}
          <div className={`inline-flex items-center gap-3 p-2.5 pr-5 rounded-2xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl theme-bg-light flex items-center justify-center">
              <Timer className="w-5 h-5 theme-text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Synchronized Time</p>
              <p className={`text-lg font-black font-mono tracking-tighter leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {formatTime(currentTime)}
              </p>
            </div>
          </div>
        </div>

        {/* FLOATING HORIZONTAL TAB BAR */}
        <div className="flex items-center overflow-x-auto custom-scrollbar pb-2 mb-4">
          <div className={`inline-flex items-center gap-1 p-1 rounded-2xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white/90 border-slate-200 shadow-sm backdrop-blur-md'
          }`}>
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'theme-bg-primary text-white shadow-md scale-[1.02]'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-[#18181b]'
                        : 'text-slate-600 hover:theme-text-primary hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DYNAMIC CHILD VIEW */}
        <div className="w-full pb-12">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default AttendanceDashboard;
