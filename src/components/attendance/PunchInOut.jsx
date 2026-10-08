import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LogIn, LogOut, MapPin, Clock, AlertCircle,
  CheckCircle2, Timer, Coffee, Navigation, Camera,
  ShieldCheck, ShieldAlert, Sparkles, RefreshCw,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Laptop, Briefcase, Eye, X, Check, Info, AlertTriangle,
  Play, Square
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { 
  punchAction, clearPunchStatus, clearError, 
  fetchMyHistory, fetchHolidays, fetchSettings, setTodayRecord
} from '../../store/attendanceSlice';
import { attendanceService } from '../../services/attendanceService';
import { StunningSelect, StunningDatePicker, StatusBadge, FeedbackModal } from './AttendanceComponents';

export const PunchInOut = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  const { 
    todayRecord, hoursWorked, loading, attendanceHistory = [], holidays = [], settings 
  } = useSelector((state) => state.attendance);

  // GPS & Live clock
  const [gpsCoords, setGpsCoords] = useState('');
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsed, setElapsed] = useState('00:00:00');
  
  // Work mode & Location
  const [workMode, setWorkMode] = useState('OFFICE'); // 'OFFICE' | 'REMOTE' | 'FIELD'
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);
  
  // Breaks & Live Break Stopwatch
  const [activeBreak, setActiveBreak] = useState(null);
  const [breakElapsed, setBreakElapsed] = useState('00:00:00');
  const [breakType, setBreakType] = useState('LUNCH');
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakReason, setBreakReason] = useState('');
  const [todayBreaks, setTodayBreaks] = useState([]);
  
  // Selfie Verification
  const [selfieImage, setSelfieImage] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Calendar State & Details
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);

  // Modal Notification Dialog
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showFeedback = (title, message, type = 'info') => {
    setFeedbackModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeFeedback = () => {
    setFeedbackModal(prev => ({ ...prev, isOpen: false }));
  };

  // Initial load
  const loadData = () => {
    dispatch(fetchMyHistory({ month: currentMonth + 1, year: currentYear }));
    dispatch(fetchHolidays());
    dispatch(fetchSettings());

    attendanceService.getLocations().then(res => {
      const locs = res.data?.results || res.data || [];
      setLocations(locs);
      if (locs.length > 0 && !selectedLocation) setSelectedLocation(String(locs[0].id));
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, [dispatch, currentMonth, currentYear]);

  // High precision GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatLng({ lat, lng });
          setGpsCoords(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
        () => setGpsCoords('GPS Location Detected (IP Fallback)'),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Sync today's breaks and active break from todayRecord
  useEffect(() => {
    if (todayRecord?.breaks) {
      setTodayBreaks(todayRecord.breaks);
      const ongoing = todayRecord.breaks.find(b => !b.end_time || b.end_time === null);
      setActiveBreak(ongoing || null);
    } else if (attendanceHistory.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const match = attendanceHistory.find(r => r.date === todayStr);
      if (match?.breaks) {
        setTodayBreaks(match.breaks);
        const ongoing = match.breaks.find(b => !b.end_time || b.end_time === null);
        setActiveBreak(ongoing || null);
      } else {
        setTodayBreaks([]);
        setActiveBreak(null);
      }
    } else {
      setTodayBreaks([]);
      setActiveBreak(null);
    }
  }, [todayRecord, attendanceHistory]);

  // Live Timer & Active Break Stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Shift elapsed
      if (todayRecord?.punch_in_time && !todayRecord?.punch_out_time) {
        const diff = Math.max(0, Math.floor((now - new Date(todayRecord.punch_in_time)) / 1000));
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        setElapsed(`${h}:${m}:${s}`);
      }

      // Break elapsed
      if (activeBreak?.start_time) {
        const diff = Math.max(0, Math.floor((now - new Date(activeBreak.start_time)) / 1000));
        const m = Math.floor(diff / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        setBreakElapsed(`00:${m}:${s}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todayRecord, activeBreak]);

  // Selfie Handler
  const handleSelfieChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelfieImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelfiePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Punch In / Out Dispatch
  const handlePunchAction = async () => {
    const isClockedIn = Boolean(todayRecord?.punch_in_time && !todayRecord?.punch_out_time);
    const action = isClockedIn ? 'out' : 'in';

    const payload = {
      action,
      latitude: latLng.lat,
      longitude: latLng.lng,
      location_id: selectedLocation ? Number(selectedLocation) : null,
      work_mode: workMode,
      selfie_image: selfiePreview,
      notes: `${workMode} punch via web portal`
    };

    try {
      const res = await dispatch(punchAction(payload)).unwrap();
      if (res.record) {
        dispatch(setTodayRecord(res.record));
      }
      showFeedback(
        action === 'in' ? 'Clocked In Successfully!' : 'Clocked Out Successfully!',
        res.message || (action === 'in' ? 'Your shift attendance has been logged.' : 'Your shift duration has been recorded.'),
        'success'
      );
      loadData();
    } catch (err) {
      const errMsg = err?.detail || err?.error || err?.message || 'Check your location or network connection.';
      showFeedback('Punch Action Error', errMsg, 'error');
    }
  };

  // Start Break
  const handleStartBreak = async () => {
    try {
      const res = await attendanceService.startBreak({
        break_type: breakType,
        reason: breakReason || 'Standard work break'
      });
      const newB = res.data?.break || res.data || { start_time: new Date().toISOString(), break_type: breakType };
      setActiveBreak(newB);
      setTodayBreaks(prev => [newB, ...prev]);
      setShowBreakModal(false);
      setBreakReason('');
      showFeedback('Break Started', `Your ${breakType.replace('_', ' ')} timer has started.`, 'success');
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.detail || err.message;
      showFeedback('Cannot Start Break', errMsg, 'error');
    }
  };

  // End Break
  const handleEndBreak = async () => {
    try {
      const res = await attendanceService.endBreak(activeBreak?.id);
      setActiveBreak(null);
      
      // Update local breaks array with ended break
      setTodayBreaks(prev => prev.map(b => {
        if (!b.end_time || b.id === activeBreak?.id) {
          return {
            ...b,
            end_time: new Date().toISOString(),
            duration_minutes: b.duration_minutes || 15
          };
        }
        return b;
      }));

      if (res.data?.record) {
        dispatch(setTodayRecord(res.data.record));
      }

      showFeedback('Break Completed', res.data?.message || 'Your break time has been logged.', 'success');
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.detail || err.message;
      showFeedback('Cannot End Break', errMsg, 'error');
    }
  };

  const isClockedIn = Boolean(todayRecord?.punch_in_time && !todayRecord?.punch_out_time);
  const isClockedOut = Boolean(todayRecord?.punch_in_time && todayRecord?.punch_out_time);

  const locationOptions = locations.map(loc => ({
    value: String(loc.id),
    label: `${loc.name} (${loc.radius_meters || 150}m geofence)`
  }));

  const breakOptions = [
    { value: 'LUNCH', label: 'Lunch Break (45-60m)' },
    { value: 'TEA', label: 'Tea / Coffee Break (15m)' },
    { value: 'REST', label: 'Rest / Wellness Break (15m)' },
    { value: 'PERSONAL', label: 'Personal Time' },
  ];

  return (
    <div className="space-y-6">
      {/* PUNCH COMMAND CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MAIN PUNCH ACTION CARD (7 COLS) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden ${
          isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full theme-bg-light opacity-30 blur-3xl pointer-events-none" />

          <div>
            {/* Top Status & Geofence Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  activeBreak 
                    ? 'bg-amber-500 animate-pulse'
                    : isClockedIn 
                      ? 'bg-emerald-500 animate-ping' 
                      : isClockedOut 
                        ? 'bg-blue-500' 
                        : 'bg-slate-400'
                }`} />
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {activeBreak ? 'Currently on Break' : isClockedIn ? 'Currently Clocked In' : isClockedOut ? 'Shift Completed Today' : 'Ready to Clock In'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                  todayRecord?.punch_in_geofence_status === 'OUTSIDE'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
                }`}>
                  {todayRecord?.punch_in_geofence_status === 'OUTSIDE' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                  {todayRecord?.punch_in_geofence_status === 'OUTSIDE' ? 'Outside Geofence (Flagged)' : 'Geofence Verified'}
                </span>
              </div>
            </div>

            {/* Shift Elapsed & Time Display */}
            <div className="text-center py-4 mb-6">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {isClockedIn ? "Active Shift Elapsed Time" : "Today's Total Hours"}
              </p>
              <h2 className={`text-4xl sm:text-5xl font-black font-mono tracking-tighter ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {isClockedIn ? elapsed : todayRecord?.total_hours_worked ? `${todayRecord.total_hours_worked} hrs` : '00:00:00'}
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Punch In: <span className="font-bold text-slate-700 dark:text-zinc-200">
                  {todayRecord?.punch_in_time ? new Date(todayRecord.punch_in_time).toLocaleTimeString() : 'Not yet'}
                </span> &bull; Punch Out: <span className="font-bold text-slate-700 dark:text-zinc-200">
                  {todayRecord?.punch_out_time ? new Date(todayRecord.punch_out_time).toLocaleTimeString() : (isClockedIn ? 'In Progress' : 'Pending')}
                </span>
              </p>
            </div>

            {/* Work Mode & Location Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Work Mode
                </label>
                <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
                  isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  {[
                    { id: 'OFFICE', label: 'Office', icon: MapPin },
                    { id: 'REMOTE', label: 'WFH', icon: Laptop },
                    { id: 'FIELD', label: 'Field', icon: Briefcase },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = workMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setWorkMode(mode.id)}
                        className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected 
                            ? 'theme-bg-primary text-white shadow-xs' 
                            : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon size={12} />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <StunningSelect
                  label="Assigned Office Location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  options={locationOptions}
                />
              </div>
            </div>

            {/* GPS Coords indicator & Selfie toggle */}
            <div className={`p-3 rounded-2xl border mb-6 flex items-center justify-between text-xs ${
              isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-2 text-slate-400 truncate max-w-[240px]">
                <Navigation size={14} className="text-blue-500 shrink-0 animate-pulse" />
                <span className="font-mono truncate">{gpsCoords || 'Detecting GPS...'}</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  ref={fileInputRef}
                  onChange={handleSelfieChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    selfiePreview 
                      ? 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' 
                      : isDarkMode ? 'border-zinc-700 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Camera size={14} />
                  {selfiePreview ? 'Selfie Attached ✓' : 'Add Selfie'}
                </button>
              </div>
            </div>
          </div>

          {/* MAIN PUNCH BUTTON & BREAK BUTTON */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={handlePunchAction}
              disabled={loading}
              className={`w-full sm:flex-1 py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 ${
                isClockedIn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'theme-bg-primary hover:opacity-90 text-white shadow-blue-600/20'
              }`}
            >
              {isClockedIn ? <LogOut size={18} /> : <LogIn size={18} />}
              {isClockedIn ? 'CLOCK OUT NOW' : (isClockedOut ? 'RE-CLOCK IN / START SHIFT' : 'CLOCK IN NOW')}
            </button>

            {/* BREAK CONTROLLER BUTTON */}
            {isClockedIn && (
              activeBreak ? (
                <button
                  onClick={handleEndBreak}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center justify-center gap-2 animate-pulse"
                >
                  <Square size={16} />
                  End Break ({breakElapsed})
                </button>
              ) : (
                <button
                  onClick={() => setShowBreakModal(true)}
                  className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${
                    isDarkMode ? 'border-zinc-700 text-amber-400 hover:bg-zinc-800' : 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  <Coffee size={16} />
                  Take Break
                </button>
              )
            )}
          </div>
        </div>

        {/* SIDE ATTENDANCE METRICS & BREAKS TRACKER (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* BREAKS TRACKER CARD */}
          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coffee size={16} className="text-amber-500" />
                <h3 className={`text-xs font-black uppercase tracking-wider ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Today's Break Tracker ({todayBreaks.length})
                </h3>
              </div>

              {isClockedIn && !activeBreak && (
                <button
                  onClick={() => setShowBreakModal(true)}
                  className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1"
                >
                  + Take Break
                </button>
              )}
            </div>

            {/* Active Break Banner */}
            {activeBreak && (
              <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <Coffee size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-500">
                      Active {activeBreak.break_type || 'Lunch'} Break
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Running: {breakElapsed}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEndBreak}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs"
                >
                  End Break
                </button>
              </div>
            )}

            {/* Today's Breaks List */}
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {todayBreaks.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <Coffee size={24} className="mx-auto mb-1 opacity-30" />
                  <p className="text-xs font-medium">No breaks taken yet today</p>
                </div>
              ) : (
                todayBreaks.map((b, idx) => (
                  <div 
                    key={b.id || idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {b.break_type_display || b.break_type || 'Break'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {b.start_time ? new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} 
                        {b.end_time ? ` → ${new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' (Ongoing)'}
                      </p>
                    </div>

                    <span className="font-bold font-mono text-amber-500 text-[11px]">
                      {b.end_time ? (b.duration_minutes ? `${b.duration_minutes}m` : '15m') : 'Running'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monthly Snapshot Mini Calendar */}
          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Attendance Log ({attendanceHistory.length} Days)
              </h4>
              <span className="text-[10px] font-bold text-blue-500">Live Sync</span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {attendanceHistory.slice(0, 5).map((rec, idx) => (
                <div 
                  key={rec.id || idx}
                  onClick={() => setSelectedDayRecord(rec)}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    isDarkMode ? 'bg-[#18181b] border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{rec.date}</p>
                    <p className="text-[10px] text-slate-400">{rec.status || 'PRESENT'} &bull; {rec.total_hours_worked || 0} hrs</p>
                  </div>
                  <StatusBadge status={rec.status || 'PRESENT'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TAKE BREAK MODAL */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Coffee size={18} />
                </div>
                <h3 className="text-base font-black tracking-tight">Start Work Break</h3>
              </div>
              <button onClick={() => setShowBreakModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <StunningSelect
                label="Break Category"
                value={breakType}
                onChange={(e) => setBreakType(e.target.value)}
                options={breakOptions}
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Optional Note / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lunch with client"
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                    isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowBreakModal(false)}
                className="px-4 py-2 rounded-xl font-bold text-xs border border-slate-200 dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartBreak}
                className="px-5 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center gap-1.5"
              >
                <Play size={14} />
                Start Timer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTIFICATION DIALOG */}
      <FeedbackModal modal={feedbackModal} onClose={closeFeedback} />

      {/* DAY DETAIL MODAL */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black tracking-tight">Attendance Record: {selectedDayRecord.date}</h3>
              <button onClick={() => setSelectedDayRecord(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Punch In</p>
                <p className="font-bold text-sm mt-1">{selectedDayRecord.punch_in_time ? new Date(selectedDayRecord.punch_in_time).toLocaleTimeString() : '—'}</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Punch Out</p>
                <p className="font-bold text-sm mt-1">{selectedDayRecord.punch_out_time ? new Date(selectedDayRecord.punch_out_time).toLocaleTimeString() : '—'}</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Hours</p>
                <p className="font-bold text-sm mt-1">{selectedDayRecord.total_hours_worked || 0} hrs</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Geofence Compliance</p>
                <p className="font-bold text-sm mt-1">{selectedDayRecord.punch_in_geofence_status || 'INSIDE'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDayRecord(null)}
                className="px-4 py-2 rounded-xl theme-bg-primary text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
