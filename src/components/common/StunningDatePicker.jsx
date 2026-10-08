import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, X, RotateCcw } from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';

export const StunningDatePicker = ({
  value = '',
  onChange,
  name,
  label,
  placeholder = 'Select Date',
  required = false,
  minYear = 1940,
  maxYear = new Date().getFullYear() + 10,
  className = '',
  disabled = false,
  isDarkMode: propDarkMode
}) => {
  const theme = useTheme ? useTheme() : null;
  const isDarkMode = propDarkMode !== undefined ? propDarkMode : (theme?.isDarkMode || false);
  const accentColor = theme?.accentColor || 'blue';
  const activeHexColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
  const containerRef = useRef(null);

  // Parse initial date
  const parseDate = (val) => {
    if (!val) return new Date();
    const parts = val.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const [viewDate, setViewDate] = useState(() => parseDate(value));

  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  // Outside click to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleSelectDay = (day) => {
    const y = viewDate.getFullYear();
    const m = (viewDate.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    if (onChange) {
      onChange({ target: { name, value: formatted } });
    }
    setIsOpen(false);
  };

  const handleSelectMonth = (monthIndex) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    setViewMode('days');
  };

  const handleSelectYear = (year) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setViewMode('days');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({ target: { name, value: '' } });
    }
  };

  const formatDisplay = (val) => {
    if (!val) return '';
    try {
      const d = parseDate(val);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return val;
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generate years list
  const yearsList = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearsList.push(y);
  }

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
          isDarkMode ? 'text-zinc-400' : 'text-slate-600'
        }`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all outline-none ${
          isDarkMode 
            ? 'bg-[#181a20] border-zinc-800 text-zinc-100 hover:border-zinc-700' 
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-sm'
        } ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar size={15} className={value ? 'text-blue-500' : (isDarkMode ? 'text-zinc-500' : 'text-slate-400')} />
          <span className={`truncate ${value ? 'font-semibold' : (isDarkMode ? 'text-zinc-500' : 'text-slate-400')}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear Date"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
        </div>
      </button>

      {/* Dropdown Calendar Popover */}
      {isOpen && (
        <div 
          className={`absolute left-0 mt-2 z-50 w-72 rounded-2xl border p-3.5 shadow-2xl animate-in fade-in zoom-in-95 origin-top-left ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/80'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className={`p-1 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  viewMode === 'months' 
                    ? 'bg-blue-500/20 text-blue-500' 
                    : isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                }`}
              >
                {fullMonths[month]}
              </button>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  viewMode === 'years' 
                    ? 'bg-blue-500/20 text-blue-500' 
                    : isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                }`}
              >
                {year}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className={`p-1 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View: Days */}
          {viewMode === 'days' && (
            <div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {dayLabels.map(d => (
                  <span key={d} className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array(firstDay).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7 w-7" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                  const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                  const isSelected = value === dateStr;
                  const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleSelectDay(d)}
                      className={`h-7 w-7 text-xs rounded-lg font-semibold flex items-center justify-center transition-all ${
                        isSelected
                          ? 'text-white shadow-md'
                          : isToday
                            ? 'border border-blue-500/50 text-blue-500 font-bold'
                            : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      style={isSelected ? { backgroundColor: activeHexColor } : {}}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View: Months */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {months.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                    month === idx
                      ? 'text-white'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  style={month === idx ? { backgroundColor: activeHexColor } : {}}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* View: Years */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto no-scrollbar py-1">
              {yearsList.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleSelectYear(y)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    year === y
                      ? 'text-white'
                      : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  style={year === y ? { backgroundColor: activeHexColor } : {}}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Quick Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/40 dark:border-zinc-800 light:border-slate-100 text-[10px]">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const nowStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
                if (onChange) onChange({ target: { name, value: nowStr } });
                setIsOpen(false);
              }}
              className="font-bold text-blue-500 hover:underline"
            >
              Today
            </button>
            <span className={isDarkMode ? 'text-zinc-500' : 'text-slate-400'}>
              {value || 'No date set'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StunningDatePicker;
