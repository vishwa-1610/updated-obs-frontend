import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, ShieldCheck, MapPin, Clock, 
  Camera, Laptop, AlertCircle, Monitor, CheckCircle2 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { attendanceService } from '../../services/attendanceService';
import { FeedbackModal, StunningTimePicker } from './AttendanceComponents';

export const AttendanceSettings = () => {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    work_start_time: '09:00',
    work_end_time: '18:00',
    grace_period_minutes: 15,
    half_day_hours: 4.0,
    full_day_hours: 8.0,
    require_geofencing: true,
    allow_wfh: true,
    selfie_required: true,
    overtime_allowed: true,
    overtime_daily_threshold_hours: 8.0,
    break_daily_limit_minutes: 60,
    enable_live_presence: true,
    enable_screenshot_monitoring: true,
    screenshot_interval_minutes: 10,
    screenshot_blur_mode: true,
    idle_threshold_seconds: 300,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    attendanceService.getSettings().then(res => {
      if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
    }).catch(err => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await attendanceService.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Settings Error', message: err.response?.data?.detail || err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Attendance Policies & Monitoring Rules
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Configure global shift timings, GPS geofencing requirements, biometric selfie capture & desktop tracking
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 size={14} /> Settings Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* SHIFT & WORK HOURS */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> Standard Shift Hours & Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <StunningTimePicker
                label="Work Start Time"
                value={settings.work_start_time}
                onChange={(e) => setSettings({ ...settings, work_start_time: e.target.value })}
                isDarkMode={isDarkMode}
              />
            </div>
            <div>
              <StunningTimePicker
                label="Work End Time"
                value={settings.work_end_time}
                onChange={(e) => setSettings({ ...settings, work_end_time: e.target.value })}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Grace Period (Mins)</label>
              <input
                type="number"
                value={settings.grace_period_minutes}
                onChange={(e) => setSettings({ ...settings, grace_period_minutes: Number(e.target.value) })}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none transition-all ${
                  isDarkMode ? 'bg-[#141417] border-[#27272a] text-white focus:border-violet-500' : 'bg-slate-50/70 border-slate-200 text-slate-900 focus:border-violet-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* GEOFENCING & BIOMETRIC VERIFICATION */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" /> Geofencing & Biometric Verification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_geofencing}
                onChange={(e) => setSettings({ ...settings, require_geofencing: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Strict GPS Geofencing</p>
                <p className="text-[10px] text-slate-400">Flag punches occurring outside authorized office radius</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.selfie_required}
                onChange={(e) => setSettings({ ...settings, selfie_required: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Live Punch Selfie Verification</p>
                <p className="text-[10px] text-slate-400">Require camera snap on clock-in / clock-out</p>
              </div>
            </label>
          </div>
        </div>

        {/* EMPLOYEE MONITORING SUITE */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor size={16} className="text-indigo-500" /> Desktop Client & Activity Monitoring
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Screenshot Interval (Minutes)
              </label>
              <input
                type="number"
                value={settings.screenshot_interval_minutes}
                onChange={(e) => setSettings({ ...settings, screenshot_interval_minutes: Number(e.target.value) })}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none ${
                  isDarkMode ? 'bg-[#18181b] border-zinc-700' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Idle Detection Timeout (Seconds)
              </label>
              <input
                type="number"
                value={settings.idle_threshold_seconds}
                onChange={(e) => setSettings({ ...settings, idle_threshold_seconds: Number(e.target.value) })}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold outline-none ${
                  isDarkMode ? 'bg-[#18181b] border-zinc-700' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs theme-bg-primary text-white shadow-lg hover:opacity-90 transition-all"
          >
            <Save size={16} /> Save Policy Settings
          </button>
        </div>
      </form>
      <FeedbackModal modal={feedback} onClose={() => setFeedback({ ...feedback, isOpen: false })} />
    </div>
  );
};
