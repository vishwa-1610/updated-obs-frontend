import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

export const StunningSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select option",
  required = false,
  className = "",
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleSelect = (val) => {
    if (typeof onChange === 'function') {
      const eventObj = {
        target: { value: val, name: label || '' },
        currentTarget: { value: val, name: label || '' },
        value: val,
        toString: () => String(val),
        valueOf: () => val
      };
      onChange(eventObj);
    }
    setIsOpen(false);
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
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full px-4 py-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-150 select-none ${
          isDarkMode 
            ? `bg-[#18181b] ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#27272a] hover:border-[#3f3f46]'} text-[#f4f4f5]` 
            : `bg-[#ffffff] ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'} text-[#0f172a] shadow-xs`
        }`}
      >
        <span className={`font-semibold text-xs sm:text-sm truncate ${!selectedOption && value !== "" ? 'text-slate-400' : ''}`}>
          {selectedLabel}
        </span>
        <ChevronDown 
          size={16} 
          className={`shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'
          }`} 
        />
      </div>

      {/* FLOATING DROPDOWN MENU */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1.5 max-h-60 overflow-y-auto rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
          isDarkMode 
            ? 'bg-[#09090b] border-[#27272a] text-[#f4f4f5]' 
            : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]'
        }`}>
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <div 
                  key={opt.value} 
                  onClick={() => handleSelect(opt.value)} 
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between text-xs sm:text-sm font-medium transition-colors ${
                    isSelected 
                      ? (isDarkMode ? 'bg-blue-600/20 theme-text-primary font-bold' : 'bg-blue-50 theme-text-primary font-bold') 
                      : (isDarkMode ? 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white' : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]')
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
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

export const CustomInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  placeholder, 
  disabled = false,
  required = false,
  className = "",
  min,
  max,
  step
}) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
          isDarkMode ? 'text-[#a1a1aa]' : 'text-[#64748b]'
        }`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input 
        type={type} 
        name={name} 
        value={value !== undefined && value !== null ? value : ''} 
        onChange={onChange} 
        disabled={disabled}
        required={required}
        placeholder={placeholder} 
        min={min}
        max={max}
        step={step}
        className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-xs sm:text-sm font-medium ${
          isDarkMode 
            ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-[#52525b] disabled:opacity-50' 
            : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-[#94a3b8] shadow-xs disabled:opacity-50'
        }`}
      />
    </div>
  );
};

// ==========================================
// STUNNING DATE PICKER (WITH CUSTOM POPUP)
// ==========================================
export const StunningDatePicker = ({
  label,
  name,
  value,
  onChange,
  placeholder = "Select date",
  required = false,
  className = ""
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current date or use today for calendar view
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth() || new Date().getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

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

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
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
    onChange({ target: { name, value: isoString } });
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({ target: { name, value: '' } });
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    onChange({ target: { name, value: `${y}-${m}-${d}` } });
    setIsOpen(false);
  };

  // Format date display
  const formatDisplay = (val) => {
    if (!val) return "";
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);

  // Generate blank leading days
  const leadingBlanks = Array.from({ length: startDay }, (_, i) => i);
  // Generate month days
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Check if a day is currently selected
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
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full px-4 py-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-150 select-none ${
          isDarkMode 
            ? `bg-[#18181b] ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#27272a] hover:border-[#3f3f46]'} text-[#f4f4f5]` 
            : `bg-[#ffffff] ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'} text-[#0f172a] shadow-xs`
        }`}
      >
        <span className={`font-semibold text-xs sm:text-sm truncate ${!value ? 'text-slate-400 font-normal' : ''}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar 
          size={16} 
          className={`shrink-0 ml-2 transition-colors duration-150 ${
            isOpen ? 'text-blue-500' : 'text-slate-400'
          }`} 
        />
      </div>

      {/* FLOATING CALENDAR POPOVER */}
      {isOpen && (
        <div className={`absolute z-50 left-0 w-72 mt-1.5 p-3.5 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
          isDarkMode 
            ? 'bg-[#09090b] border-[#27272a] text-[#f4f4f5]' 
            : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]'
        }`}>
          {/* HEADER: MONTH / YEAR & NAVIGATION */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {monthNames[viewMonth]} {viewYear}
            </div>
            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-[#18181b] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                type="button"
                onClick={handleNextMonth}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-[#18181b] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* DAY OF WEEK LABELS */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                {d}
              </span>
            ))}
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {leadingBlanks.map(b => (
              <div key={`blank-${b}`} className="w-8 h-8" />
            ))}
            {daysArray.map(day => {
              const selected = isDaySelected(day);
              const today = isToday(day);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                    selected
                      ? 'theme-bg-primary text-white shadow-sm scale-105'
                      : today
                        ? isDarkMode
                          ? 'bg-blue-950/40 text-blue-400 border border-blue-500/30'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                        : isDarkMode
                          ? 'text-slate-300 hover:bg-[#18181b] hover:text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[11px] font-bold theme-text-primary hover:underline transition-all"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
