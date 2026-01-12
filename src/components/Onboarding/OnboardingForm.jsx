import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Save, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  ChevronDown, Check, Search, Building2, MapPin, Loader2, 
  CheckCircle2, AlertTriangle, Briefcase, Mail, Phone, User
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { fetchClients } from '../../store/clientSlice';

// --- CONSTANTS ---
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

// --- SHARED STYLES (Single Source of Truth) ---
const getSharedStyles = (isDarkMode, hasError = false) => ({
  wrapper: `relative w-full group`,
  label: `block text-[11px] font-bold uppercase tracking-wider mb-2 ml-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`,
  inputContainer: `relative flex items-center w-full transition-all duration-200`,
  // The master input class for identical height/padding across ALL types
  baseInput: `
    w-full h-12 pl-11 pr-10 rounded-xl border text-sm font-medium transition-all duration-200 outline-none
    ${isDarkMode 
      ? 'bg-gray-800/60 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300'}
    ${hasError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}
  `,
  iconLeft: `absolute left-3.5 z-10 pointer-events-none transition-colors duration-200 ${isDarkMode ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-600'}`,
  iconRight: `absolute right-3.5 z-10 pointer-events-none transition-all duration-200 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`,
  popup: `
    absolute left-0 w-full mt-2 p-1 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top z-50
    ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-black/50' : 'bg-white border-gray-100 shadow-xl ring-1 ring-black/5'}
  `
});

// --- 1. SEARCHABLE SELECT ---
const SearchableSelect = ({ label, icon: Icon, options, value, onChange, placeholder, isLoading, required, disabled }) => {
  const { isDarkMode } = useTheme();
  const styles = getSharedStyles(isDarkMode);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const filteredOptions = useMemo(() => options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase())), [options, searchTerm]);
  const selectedLabel = options.find(opt => opt.value === value)?.label || '';

  useEffect(() => {
    const handleClickOutside = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (!isOpen) setSearchTerm(''); }, [isOpen]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <label className={styles.label}>{label} {required && <span className="text-rose-500">*</span>}</label>
      
      <div className={styles.inputContainer} onClick={() => !isLoading && !disabled && setIsOpen(!isOpen)}>
        {/* Left Icon */}
        <div className={styles.iconLeft}>
          {Icon ? <Icon size={18} /> : <Search size={18} />}
        </div>
        
        {/* Fake Input Area */}
        <div className={`${styles.baseInput} flex items-center cursor-pointer ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : ''}`}>
          <span className={`block truncate ${!selectedLabel ? 'text-opacity-50' : ''}`}>
            {selectedLabel || <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>{placeholder}</span>}
          </span>
        </div>

        {/* Right Icon */}
        <div className={`${styles.iconRight} ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div className={styles.popup}>
          <div className={`p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input 
                autoFocus 
                type="text" 
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg focus:outline-none bg-transparent ${isDarkMode ? 'text-white' : 'text-gray-900'}`} 
                placeholder="Type to search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto custom-scrollbar p-1 space-y-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li key={opt.value} onClick={() => { onChange(opt); setIsOpen(false); }} 
                    className={`flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-blue-50 text-gray-700'} ${value === opt.value ? (isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-700') : ''}`}>
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check size={16} className="text-blue-500" />}
                </li>
              ))
            ) : <li className="px-4 py-6 text-sm text-center opacity-50 italic">No matches found</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- 2. DATE PICKER ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder, required, disabled }) => {
  const { isDarkMode } = useTheme();
  const styles = getSharedStyles(isDarkMode);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const dropdownRef = useRef(null);
  const yearScrollRef = useRef(null);

  useEffect(() => {
    const clickOut = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  useEffect(() => { if (value) setCurrentDate(new Date(value)); }, [value]);

  useEffect(() => {
    if (view === 'year' && yearScrollRef.current) {
        yearScrollRef.current.querySelector('.selected-year')?.scrollIntoView({ block: 'center' });
    }
  }, [view]);

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  const changeMonth = (off) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + off, 1));
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <label className={styles.label}>{label} {required && <span className="text-rose-500">*</span>}</label>
      <div className={styles.inputContainer} onClick={() => !disabled && setIsOpen(!isOpen)}>
        <CalendarIcon size={18} className={styles.iconLeft} />
        <input readOnly type="text" value={value || ''} placeholder={placeholder || "YYYY-MM-DD"} className={`${styles.baseInput} cursor-pointer ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : ''}`} />
        <ChevronDown size={16} className={`${styles.iconRight} ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </div>

      {isOpen && (
        <div className={`${styles.popup} w-72 p-4`}>
          <div className="flex justify-between items-center mb-4 px-1">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><ChevronLeft size={16}/></button>
            <div className="font-bold text-sm flex gap-2">
                <button type="button" onClick={() => setView('month')} className="hover:text-blue-500 transition">{monthNames[currentDate.getMonth()]}</button>
                <button type="button" onClick={() => setView('year')} className="hover:text-blue-500 transition">{currentDate.getFullYear()}</button>
            </div>
            <button type="button" onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><ChevronRight size={16}/></button>
          </div>
          {view === 'calendar' && (
            <div className="animate-in slide-in-from-left-2 duration-200">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[10px] font-bold opacity-50">{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array(firstDay).fill(null).map((_,i) => <div key={`e-${i}`}/>)}
                    {Array.from({length: daysInMonth}, (_,i) => i+1).map(d => (
                        <button key={d} type="button" onClick={() => handleDateClick(d)} className={`h-8 w-8 text-xs rounded-full font-medium transition-all ${value?.endsWith(`-${d.toString().padStart(2,'0')}`) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{d}</button>
                    ))}
                </div>
            </div>
          )}
          {view === 'month' && <div className="grid grid-cols-3 gap-2">{monthNames.map((m, i) => <button key={m} type="button" onClick={() => {setCurrentDate(new Date(currentDate.getFullYear(), i, 1)); setView('calendar')}} className="p-2 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700">{m}</button>)}</div>}
          {view === 'year' && <div className="h-48 overflow-y-auto grid grid-cols-3 gap-2 custom-scrollbar pr-1" ref={yearScrollRef}>{Array.from({length:81},(_,i)=>1950+i).map(y=><button key={y} type="button" onClick={()=>{setCurrentDate(new Date(y,currentDate.getMonth(),1)); setView('calendar')}} className={`p-2 text-xs rounded ${currentDate.getFullYear()===y?'bg-blue-600 text-white selected-year':'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{y}</button>)}</div>}
        </div>
      )}
    </div>
  );
};

// --- 3. MAIN FORM ---
const OnboardingForm = ({ initialData = {}, onSubmit, onCancel, isLoading, isEdit = false }) => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const styles = getSharedStyles(isDarkMode); // Get shared styles for standard inputs
  
  const [internalError, setInternalError] = useState(null);
  const [internalSuccess, setInternalSuccess] = useState(null);
  const { clients, loading: clientsLoading } = useSelector((state) => state.client);

  useEffect(() => { if (clients.length === 0) dispatch(fetchClients({ page: 1, pageSize: 100 })); }, [dispatch, clients.length]);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', client: null, client_name: '', email: '',
    phone_no: '', job_title: '', start_date: '', end_date: '', state: '',
    status: 'PENDING', is_active: true,
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        ...initialData,
        client: initialData.client || null, 
        status: initialData.status || 'PENDING',
        is_active: initialData.is_active ?? true, 
      });
    }
  }, [initialData]);

  const clientOptions = useMemo(() => clients.map(c => ({ value: c.id, label: c.client_name || 'Unnamed Client' })), [clients]);
  const stateOptions = useMemo(() => US_STATES.map(s => ({ value: s, label: s })), []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleClientChange = (opt) => setFormData(prev => ({ ...prev, client: opt.value, client_name: opt.label }));
  const handleStateChange = (opt) => setFormData(prev => ({ ...prev, state: opt.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInternalError(null); setInternalSuccess(null);
    try {
      await onSubmit(formData);
      setInternalSuccess(isEdit ? "Record updated successfully" : "Onboarding initiated successfully");
    } catch (error) {
      let errMsg = "An unexpected error occurred.";
      if (typeof error === 'object' && error !== null) {
        if (error.detail) errMsg = error.detail;
        else { const keys = Object.keys(error); if (keys.length > 0) errMsg = `${keys[0]}: ${Array.isArray(error[keys[0]]) ? error[keys[0]][0] : error[keys[0]]}`; }
      }
      setInternalError(errMsg);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] w-full relative">
      
      {/* ALERTS */}
      <div className="absolute top-0 left-0 w-full px-6 z-50 pointer-events-none">
        {internalSuccess && (
            <div className="animate-in slide-in-from-top-5 duration-300 flex items-center p-4 mb-4 rounded-2xl bg-emerald-500/95 backdrop-blur-md text-white shadow-xl shadow-emerald-500/20 ring-1 ring-white/10 mt-4">
                <CheckCircle2 size={20} className="mr-3 text-emerald-100" />
                <div><h4 className="font-bold text-sm">Success</h4><p className="text-xs opacity-90">{internalSuccess}</p></div>
            </div>
        )}
        {internalError && (
            <div className="animate-in slide-in-from-top-5 duration-300 flex items-center p-4 mb-4 rounded-2xl bg-rose-500/95 backdrop-blur-md text-white shadow-xl shadow-rose-500/20 ring-1 ring-white/10 mt-4">
                <AlertTriangle size={20} className="mr-3 text-rose-100" />
                <div><h4 className="font-bold text-sm">Error</h4><p className="text-xs opacity-90">{internalError}</p></div>
            </div>
        )}
      </div>

      {/* FORM BODY */}
      <div className={`flex-1 overflow-y-auto px-6 custom-scrollbar pb-48 transition-all duration-300 ${isLoading ? 'blur-[2px] opacity-60 pointer-events-none' : ''}`}> 
        <form id="onboarding-form" onSubmit={handleSubmit} className="space-y-8 pt-6">
          
          {/* PERSONAL INFO */}
          <div className="space-y-6">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <User size={14}/> Candidate Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 relative z-30">
                <div className={styles.wrapper}>
                    <label className={styles.label}>First Name <span className="text-rose-500">*</span></label>
                    <div className={styles.inputContainer}>
                        <User size={18} className={styles.iconLeft} />
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="John" className={styles.baseInput} />
                    </div>
                </div>
                <div className={styles.wrapper}>
                    <label className={styles.label}>Last Name <span className="text-rose-500">*</span></label>
                    <div className={styles.inputContainer}>
                        <User size={18} className={styles.iconLeft} />
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Doe" className={styles.baseInput} />
                    </div>
                </div>
                <div className={styles.wrapper}>
                    <label className={styles.label}>Email Address <span className="text-rose-500">*</span></label>
                    <div className={styles.inputContainer}>
                        <Mail size={18} className={styles.iconLeft} />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className={styles.baseInput} />
                    </div>
                </div>
                <div className={styles.wrapper}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.inputContainer}>
                        <Phone size={18} className={styles.iconLeft} />
                        <input type="tel" name="phone_no" value={formData.phone_no} onChange={handleChange} placeholder="+1 (555) 000-0000" className={styles.baseInput} />
                    </div>
                </div>
            </div>
          </div>

          {/* ASSIGNMENT INFO */}
          <div className="space-y-6">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pt-4 border-t ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-100'}`}>
                <Briefcase size={14}/> Assignment Details
            </h3>
            {/* High Z-Index for this row to ensure dropdowns float over elements below */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 relative z-20">
                <SearchableSelect label="Client" icon={Building2} options={clientOptions} value={formData.client} onChange={handleClientChange} placeholder="Select Client..." isLoading={clientsLoading} required />
                
                <div className={styles.wrapper}>
                    <label className={styles.label}>Job Title</label>
                    <div className={styles.inputContainer}>
                        <Briefcase size={18} className={styles.iconLeft} />
                        <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} placeholder="Senior Developer" className={styles.baseInput} />
                    </div>
                </div>
            </div>

            {/* Lower Z-Index for this row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 relative z-10">
                <CustomDatePicker label="Start Date" name="start_date" value={formData.start_date} onChange={handleChange} />
                <CustomDatePicker label="End Date" name="end_date" value={formData.end_date} onChange={handleChange} />
                <div className="md:col-span-2">
                    <SearchableSelect label="Work State" icon={MapPin} options={stateOptions} value={formData.state} onChange={handleStateChange} placeholder="Select State..." />
                </div>
            </div>
          </div>

          {/* FOOTER TOGGLE */}
          <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isDarkMode ? 'border-gray-700 bg-gray-800/40' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-full ${formData.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    <CheckCircle2 size={20} />
                </div>
                <div>
                    <h4 className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Active Record</h4>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Enable access for this onboarding.</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only peer" />
                <div className="w-12 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 shadow-inner"></div>
            </label>
          </div>

        </form>
      </div>

      {/* FOOTER */}
      <div className={`absolute bottom-0 left-0 w-full p-5 border-t flex justify-end space-x-3 backdrop-blur-xl z-40 rounded-b-2xl ${isDarkMode ? 'border-gray-700 bg-gray-900/90' : 'border-gray-200 bg-white/90'}`}>
        <button onClick={onCancel} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" form="onboarding-form" className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center ${isLoading ? 'bg-blue-500 cursor-not-allowed pl-6' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isLoading ? 'Processing...' : isEdit ? 'Update Record' : 'Initiate'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingForm;