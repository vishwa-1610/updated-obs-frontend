export { StunningTimePicker } from './StunningTimePicker';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Calendar, ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

export const StunningSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select option",
  required = false,
  className = "",
  searchable = false
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 220 && spaceAbove >= 240) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const selectedLabel = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => (opt.label || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const handleSelect = (val) => {
    onChange({ target: { value: val } });
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
          isDarkMode ? 'text-[#a1a1aa]' : 'text-[#64748b]'
        }`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* TRIGGER BUTTON */}
      <div 
        onClick={handleToggle} 
        className={`w-full px-4 py-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-150 select-none ${
          isDarkMode 
            ? `bg-[#18181b] ${isOpen ? 'theme-border-primary ring-2 ring-[var(--primary-glow)]' : 'border-[#27272a] hover:border-[#3f3f46]'} text-[#f4f4f5]` 
            : `bg-[#ffffff] ${isOpen ? 'theme-border-primary ring-2 ring-[var(--primary-glow)]' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'} text-[#0f172a] shadow-xs`
        }`}
      >
        <span className={`font-semibold text-xs sm:text-sm truncate ${!selectedOption && value !== "" ? 'text-slate-400' : ''}`}>
          {selectedLabel}
        </span>
        <ChevronDown 
          size={16} 
          className={`shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 theme-text-primary' : 'text-slate-400'
          }`} 
        />
      </div>

      {/* FLOATING DROPDOWN MENU */}
      {isOpen && (
        <div className={`absolute z-[100] w-full ${dropUp ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'} max-h-60 overflow-y-auto rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
          isDarkMode 
            ? 'bg-[#09090b] border-[#27272a] text-[#f4f4f5]' 
            : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]'
        }`}>
          {searchable && (
            <div className={`p-2 border-b ${isDarkMode ? 'border-zinc-800 bg-[#121217]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none ${
                    isDarkMode 
                      ? 'bg-[#18181b] border-zinc-700 text-white placeholder-zinc-500 focus:border-[var(--primary-color)]' 
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color)]'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
              No options available
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <div 
                  key={opt.value} 
                  onClick={() => handleSelect(opt.value)} 
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between text-xs sm:text-sm font-medium transition-colors ${
                    isSelected 
                      ? 'theme-bg-light theme-text-primary font-bold' 
                      : (isDarkMode ? 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white' : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]')
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.color && (
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check size={16} className="theme-text-primary shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export const StunningDatePicker = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  required = false,
  className = "",
  name = "date",
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);

  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(!isNaN(initialDate.getFullYear()) ? initialDate.getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(!isNaN(initialDate.getMonth()) ? initialDate.getMonth() : new Date().getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Only flip up if bottom space is strictly less than 230px AND top space has plenty of room (>= 250px)
      if (spaceBelow < 230 && spaceAbove >= 250) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const isoString = `${viewYear}-${m}-${d}`;
    if (typeof onChange === 'function') {
      onChange({ target: { name, value: isoString }, value: isoString });
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (typeof onChange === 'function') {
      onChange({ target: { name, value: '' }, value: '' });
    }
    setIsOpen(false);
  };

  const handleSetToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    const isoString = `${y}-${m}-${d}`;
    if (typeof onChange === 'function') {
      onChange({ target: { name, value: isoString }, value: isoString });
    }
    setIsOpen(false);
  };

  const formatDisplay = (val) => {
    if (!val) return "";
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);

  const leadingBlanks = Array.from({ length: startDay }, (_, i) => i);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const isDaySelected = (day) => {
    if (!value) return false;
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return value === `${viewYear}-${m}-${d}`;
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
          isDarkMode ? 'text-[#a1a1aa]' : 'text-[#64748b]'
        }`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* TRIGGER BUTTON */}
      <div 
        onClick={handleToggle} 
        className={`w-full px-3.5 py-2 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-150 select-none ${
          isDarkMode 
            ? `bg-[#141417] ${isOpen ? 'theme-border-primary ring-2 ring-[var(--primary-glow)]' : 'border-[#27272a] hover:border-[#3f3f46]'} text-[#f4f4f5]` 
            : `bg-slate-50/70 ${isOpen ? 'theme-border-primary ring-2 ring-[var(--primary-glow)] shadow-sm' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'} text-[#0f172a]`
        }`}
      >
        <span className={`font-semibold text-xs sm:text-sm truncate ${!value ? 'text-slate-400 font-normal' : ''}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar 
          size={15} 
          className={`shrink-0 ml-2 transition-colors duration-150 ${
            isOpen ? 'theme-text-primary' : 'text-slate-400'
          }`} 
        />
      </div>

      {/* COMPACT FLOATING CALENDAR POPOVER */}
      {isOpen && (
        <div className={`absolute z-[100] left-0 w-[260px] p-2.5 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
          dropUp ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'
        } ${
          isDarkMode 
            ? 'bg-[#18181b]/98 border-[#27272a] text-[#f4f4f5] shadow-black/80' 
            : 'bg-white/98 border-[#e2e8f0] text-[#0f172a] shadow-slate-400/50'
        }`}>
          {/* HEADER */}
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="text-xs font-black text-slate-800 dark:text-slate-100">
              {monthNames[viewMonth]} {viewYear}
            </div>
            <div className="flex items-center gap-0.5">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className={`p-1 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-[#27272a] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                type="button"
                onClick={handleNextMonth}
                className={`p-1 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-[#27272a] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* DAY OF WEEK */}
          <div className="grid grid-cols-7 gap-0.5 text-center mb-0.5">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <span key={d} className="text-[9px] font-bold text-slate-400 uppercase py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {leadingBlanks.map(b => (
              <div key={`blank-${b}`} className="w-6.5 h-6.5" />
            ))}
            {daysArray.map(day => {
              const selected = isDaySelected(day);
              const today = isToday(day);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`w-6.5 h-6.5 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all ${
                    selected
                      ? 'theme-bg-primary text-white shadow-md scale-105 font-black theme-shadow-primary'
                      : today
                        ? 'theme-bg-light theme-text-primary border border-[var(--primary-color)]/30 font-bold'
                        : isDarkMode
                          ? 'text-slate-300 hover:bg-[#27272a] hover:text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] font-semibold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[10px] font-bold theme-text-primary hover:underline transition-all"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const StatusBadge = ({ status, text }) => {
  const s = (status || '').toUpperCase();
  let bg = 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';

  if (s.includes('PRESENT') || s.includes('APPROVED') || s.includes('IN') || s.includes('ACTIVE') || s.includes('ON TIME')) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40';
  } else if (s.includes('LATE') || s.includes('PENDING') || s.includes('BREAK') || s.includes('HALF') || s.includes('IDLE')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40';
  } else if (s.includes('ABSENT') || s.includes('REJECTED') || s.includes('OUT') || s.includes('FLAG') || s.includes('OFFLINE')) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40';
  } else if (s.includes('LEAVE') || s.includes('REMOTE') || s.includes('WFH') || s.includes('SCHEDULED')) {
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/40';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse" />
      {text || status}
    </span>
  );
};

export const FeedbackModal = ({ modal, onClose }) => {
  const { isDarkMode } = useTheme();
  if (!modal || !modal.isOpen) return null;

  const isSuccess = modal.type === 'success';
  const isError = modal.type === 'error';
  const isWarning = modal.type === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
        isDarkMode ? 'bg-[#09090b] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isSuccess
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : isError
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'theme-bg-light theme-text-primary border border-[var(--primary-color)]/20'
          }`}>
            <span className="text-xl font-bold">
              {isSuccess ? '✓' : isError ? '✕' : 'ℹ'}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-base font-black tracking-tight">{modal.title || 'Notification'}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{modal.message}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
              isError
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'theme-bg-primary hover:opacity-90 text-white shadow-lg theme-shadow-primary'
            }`}
          >
            Okay, Understood
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * extractErrorMessage
 * Converts complex backend error responses (DRF error dictionaries, detail strings, field errors)
 * into clear, user-friendly human readable sentences.
 */
export const extractErrorMessage = (err, fallback = 'An unexpected error occurred. Please try again.') => {
  if (!err) return fallback;
  if (typeof err === 'string') {
    if (err.includes('status code 400') || err.includes('status code 500')) return fallback;
    return err;
  }
  if (err.response?.data) return extractErrorMessage(err.response.data, fallback);
  if (err.detail && typeof err.detail === 'string') return err.detail;
  if (err.error && typeof err.error === 'string') return err.error;
  if (err.message && typeof err.message === 'string' && !err.message.includes('status code')) return err.message;
  
  if (err.non_field_errors) {
    if (Array.isArray(err.non_field_errors)) return err.non_field_errors.join(' ');
    return String(err.non_field_errors);
  }

  if (typeof err === 'object') {
    const keys = Object.keys(err);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const firstVal = err[firstKey];
      const fieldName = firstKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (Array.isArray(firstVal)) {
        return `${fieldName}: ${firstVal.join(', ')}`;
      }
      if (typeof firstVal === 'string') {
        return `${fieldName}: ${firstVal}`;
      }
      if (typeof firstVal === 'object') {
        return extractErrorMessage(firstVal, fallback);
      }
    }
  }
  return fallback;
};
