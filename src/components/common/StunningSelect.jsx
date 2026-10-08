import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';

export const StunningSelect = ({
  options = [],
  value = '',
  onChange,
  name,
  label,
  placeholder = 'Select option...',
  required = false,
  searchable = false,
  icon: Icon,
  className = '',
  buttonClassName = '',
  disabled = false,
  isDarkMode: propDarkMode,
  activeHexColor: propHexColor,
  dropUp = false
}) => {
  const theme = useTheme ? useTheme() : null;
  const isDarkMode = propDarkMode !== undefined ? propDarkMode : (theme?.isDarkMode || false);
  const accentColor = theme?.accentColor || 'blue';
  const activeHexColor = propHexColor || THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(opt => (opt.value !== undefined ? opt.value : opt) === value);
  const selectedLabel = selectedOption?.label || selectedOption?.name || (typeof selectedOption === 'string' ? selectedOption : null);

  const filteredOptions = options.filter(opt => {
    if (!searchTerm) return true;
    const l = (opt.label || opt.name || opt.value || opt || '').toString().toLowerCase();
    return l.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (val) => {
    if (onChange) {
      // Support both event object or direct value
      onChange({ target: { name, value: val } });
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
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
        style={isOpen ? { borderColor: activeHexColor, boxShadow: `0 0 0 3px ${activeHexColor}25` } : {}}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all outline-none ${
          isDarkMode 
            ? 'bg-[#181a20] border-zinc-700/80 text-zinc-100 hover:border-zinc-600' 
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-sm'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate pr-1">
          {Icon && <Icon size={14} style={value ? { color: activeHexColor } : {}} className={value ? '' : (isDarkMode ? 'text-zinc-500' : 'text-slate-400')} />}
          <span className={`truncate ${selectedLabel ? 'font-semibold' : (isDarkMode ? 'text-zinc-400' : 'text-slate-400')}`}>
            {selectedLabel || placeholder}
          </span>
        </div>

        <ChevronDown 
          size={14} 
          style={isOpen ? { color: activeHexColor } : {}}
          className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : 'text-slate-400'}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute left-0 right-0 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'} z-[100] rounded-2xl border p-1.5 shadow-2xl animate-in fade-in zoom-in-95 origin-top max-h-60 overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-800 shadow-xl ring-1 ring-black/5'
          }`}
        >
          {searchable && (
            <div className="p-1 mb-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={`w-full pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none border ${
                  isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          )}

          <div className="overflow-y-auto custom-scrollbar py-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-400">No options found</p>
            ) : (
              filteredOptions.map((opt, i) => {
                const optVal = opt.value !== undefined ? opt.value : opt;
                const optLabel = opt.label || opt.name || opt;
                const isSelected = value === optVal;

                return (
                  <div
                    key={optVal || i}
                    onClick={() => handleSelect(optVal)}
                    style={isSelected ? { backgroundColor: `${activeHexColor}18`, color: activeHexColor } : {}}
                    className={`px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'font-bold'
                        : isDarkMode ? 'hover:bg-zinc-800/80 text-zinc-200' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{optLabel}</span>
                    {isSelected && <Check size={14} style={{ color: activeHexColor }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StunningSelect;
