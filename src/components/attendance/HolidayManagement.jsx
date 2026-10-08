import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Trash2, CheckCircle2, Sparkles, 
  Clock, Flag, Sun, PartyPopper
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { attendanceService } from '../../services/attendanceService';
import { StunningSelect, StunningDatePicker, FeedbackModal } from './AttendanceComponents';

export const HolidayManagement = () => {
  const { isDarkMode } = useTheme();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'NATIONAL', // 'NATIONAL' | 'REGIONAL' | 'OPTIONAL'
    description: '',
    is_recurring: true
  });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getHolidays();
      setHolidays(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    try {
      await attendanceService.createHoliday(formData);
      setShowModal(false);
      fetchHolidays();
    } catch (err) {
      setFeedback({ isOpen: true, title: 'Error', message: err.response?.data?.detail || err.message, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this company holiday?')) {
      try {
        await attendanceService.deleteHoliday(id);
        fetchHolidays();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const typeOptions = [
    { value: 'NATIONAL', label: 'National Public Holiday' },
    { value: 'REGIONAL', label: 'Regional / State Holiday' },
    { value: 'OPTIONAL', label: 'Optional / Floating Holiday' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Company Holiday Calendar
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Manage official corporate paid holidays, recurring annual days & floating leaves
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs theme-bg-primary text-white shadow-md hover:scale-105 transition-all"
        >
          <Plus size={16} />
          Add Holiday
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map((h) => (
          <div 
            key={h.id} 
            className={`p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-600 flex items-center justify-center font-bold">
                    <PartyPopper size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{h.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{h.type || 'NATIONAL'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(h.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                {h.description || 'Official company holiday. Office branches will remain closed.'}
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
            }`}>
              <span className="text-slate-400 font-medium">Date:</span>
              <span className="font-bold font-mono text-blue-500">{h.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-lg font-black tracking-tight">Add Company Holiday</h3>
            <form onSubmit={handleSaveHoliday} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Holiday Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                    isDarkMode ? 'bg-[#18181b] border-zinc-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <StunningDatePicker
                label="Holiday Date *"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />

              <StunningSelect
                label="Holiday Category"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={typeOptions}
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <input
                  type="text"
                  placeholder="Brief note..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                    isDarkMode ? 'bg-[#18181b] border-zinc-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-bold border border-slate-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold theme-bg-primary text-white shadow-md"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <FeedbackModal modal={feedback} onClose={() => setFeedback({ ...feedback, isOpen: false })} />
    </div>
  );
};
