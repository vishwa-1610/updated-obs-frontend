import React, { useState, useEffect, useRef, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronLeft, ChevronRight, ChevronDown, 
  Eraser, Save, PenTool, FileText, Calculator, Building2, CheckCircle2, 
  AlertCircle, HelpCircle, Briefcase, Info, XCircle, Loader2
} from 'lucide-react';
import StunningSelect from '../../common/StunningSelect';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

// --- 1. LOADING OVERLAY ---
const LoadingOverlay = ({ isDarkMode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300">
    <div className={`flex flex-col items-center p-8 rounded-2xl shadow-2xl border ${
      isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
    } animate-in fade-in zoom-in duration-300`}>
      <div className="relative mb-4">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="text-blue-500 w-6 h-6 animate-pulse" />
        </div>
      </div>
      <h3 className="text-lg font-extrabold tracking-tight">Generating Form IL-W-4...</h3>
      <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Calculating allowances and rendering official Illinois certificate
      </p>
    </div>
  </div>
);

// --- 2. ERROR MODAL ---
const ErrorModal = ({ isOpen, title, message, onClose, isDarkMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-6 duration-300 transform transition-all border ${
        isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
            <XCircle className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">{title || "Validation Required"}</h3>
          <p className={`mb-6 text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            {message || "Please complete all required fields before proceeding."}
          </p>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-red-500/20"
          >
            Review and Correct
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. CUSTOM THEMED DATE PICKER ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const dropdownRef = useRef(null);
  const yearScrollRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); 
        setView('calendar');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { 
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setCurrentDate(d);
    }
  }, [value]);

  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 81 }, (_, i) => 1950 + i);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
          {label}
        </label>
      )}
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
        <input 
          readOnly 
          type="text" 
          value={value || ''} 
          placeholder={placeholder || "YYYY-MM-DD"} 
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium cursor-pointer outline-none transition-all ${
            isDarkMode 
              ? 'bg-zinc-900/60 border-zinc-700/80 text-zinc-100 hover:border-zinc-600' 
              : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300'
          }`} 
        />
        <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
      </div>
      {isOpen && (
        <div className={`absolute z-50 mb-2 p-4 rounded-2xl shadow-2xl border w-72 bottom-full left-0 backdrop-blur-xl ${
          isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center mb-4">
            {view === 'calendar' && (
              <button type="button" onClick={() => changeMonth(-1)} className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                <ChevronLeft size={16}/>
              </button>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className={`font-bold px-2 py-0.5 rounded text-xs ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>
                {monthNames[currentDate.getMonth()]}
              </button>
              <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className={`font-bold px-2 py-0.5 rounded text-xs ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>
                {currentDate.getFullYear()}
              </button>
            </div>
            {view === 'calendar' && (
              <button type="button" onClick={() => changeMonth(1)} className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                <ChevronRight size={16}/>
              </button>
            )}
          </div>
          {view === 'calendar' && (
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <span key={d} className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{d}</span>
              ))}
              {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={i}/>)}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate() }, (_, i) => i+1).map(d => (
                <button 
                  key={d} 
                  type="button" 
                  onClick={() => handleDateClick(d)} 
                  className={`h-7 w-7 text-xs rounded-full font-medium transition-all ${
                    isDarkMode ? 'hover:bg-blue-600/30 text-zinc-200' : 'hover:bg-blue-100 text-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
          {view === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map((m, i) => (
                <button key={m} onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), i, 1)); setView('calendar'); }} className={`p-2 text-xs rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>
                  {m}
                </button>
              ))}
            </div>
          )}
          {view === 'year' && (
            <div ref={yearScrollRef} className="h-44 overflow-y-auto grid grid-cols-3 gap-2">
              {years.map(y => (
                <button key={y} onClick={() => { setCurrentDate(new Date(y, currentDate.getMonth(), 1)); setView('calendar'); }} className={`p-2 text-xs rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN ILLINOIS TAX FORM COMPONENT ---
const IllinoisTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // FORM DATA STATE
  const [formData, setFormData] = useState({
    // Personal Demographics
    first_name: '',
    last_name: '',
    ssn: '',
    email: '',
    address: '',
    city: '',
    state: 'IL',
    zipcode: '',

    // Status & Allowances
    filing_status: 'Single',
    dependents: 0,
    you_65: false,
    you_blind: false,
    sp_65: false,
    sp_blind: false,
    additional_withholding: '',

    // Exemption
    exempt: false,

    // Attestation
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingOptions = [
    { value: 'Single', label: 'Single or Married Filing Separately' },
    { value: 'Married', label: 'Married Filing Jointly' }
  ];

  // 1. INITIALIZE DATA
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        state: 'IL',
        zipcode: (initialData.zipcode || '').slice(0, 5)
      }));
    }
  }, [initialData]);

  // 2. CANVAS RESIZE HANDLER
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) sigCanvasRef.current.fromDataURL(savedData);
        }
      }
    };
    const timer = setTimeout(resizeCanvas, 200);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 3. INPUT HANDLERS
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 5) }));
      return;
    }

    if (name === 'ssn') {
      const digits = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, ssn: digits }));
      return;
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: sig }));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  // 4. COMPUTED ALLOWANCE TOTALS
  const basicAllowances = useMemo(() => {
    const base = formData.filing_status === 'Married' ? 2 : 1;
    const deps = parseInt(formData.dependents, 10) || 0;
    return base + Math.max(0, deps);
  }, [formData.filing_status, formData.dependents]);

  const additionalAllowances = useMemo(() => {
    let count = 0;
    if (formData.you_65) count += 1;
    if (formData.you_blind) count += 1;
    if (formData.sp_65) count += 1;
    if (formData.sp_blind) count += 1;
    return count;
  }, [formData.you_65, formData.you_blind, formData.sp_65, formData.sp_blind]);

  // 5. SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let sig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!sig) {
      setErrorState({ 
        isOpen: true, 
        title: "Signature Required", 
        message: "Please draw your signature in the digital signature box before submitting." 
      });
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.ssn || !formData.address) {
      setErrorState({ 
        isOpen: true, 
        title: "Required Fields Incomplete", 
        message: "Please ensure your First Name, Last Name, SSN, and Residential Address are filled out." 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanNumber = (val) => (val === '' || val === null || isNaN(val)) ? 0 : val;

      const submissionPayload = { 
        ...formData,
        dependents: cleanNumber(formData.dependents),
        additional_withholding: cleanNumber(formData.additional_withholding),
        basic_claim: basicAllowances,
        additional_claim: additionalAllowances,
        signature_image: sig 
      };

      await onSubmit(submissionPayload);
      setIsSubmitting(false);

    } catch (error) {
      console.error("IL-W-4 Submission Error:", error);
      setIsSubmitting(false);
      const msg = error.response?.data?.error || error.message || "Failed to generate Form IL-W-4. Please review your inputs.";
      setErrorState({ isOpen: true, title: "Submission Failed", message: typeof msg === 'object' ? JSON.stringify(msg) : msg });
    }
  };

  // COMMON STYLES
  const labelStyle = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`;
  const inputStyle = `w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
    isDarkMode 
      ? 'bg-zinc-900/60 border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30' 
      : 'bg-slate-50/70 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
  }`;

  const cardStyle = `p-6 rounded-2xl border transition-all ${
    isDarkMode 
      ? 'bg-[#181a20]/90 border-zinc-800 shadow-xl shadow-black/20' 
      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
  }`;

  return (
    <>
      {isSubmitting && <LoadingOverlay isDarkMode={isDarkMode} />}
      <ErrorModal 
        isOpen={errorState.isOpen} 
        title={errorState.title} 
        message={errorState.message} 
        onClose={() => setErrorState({ isOpen: false, title: '', message: '' })} 
        isDarkMode={isDarkMode}
      />

      <div className={`w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
        
        {/* HEADER BADGE */}
        <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border-blue-100'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-blue-600 text-white font-extrabold text-lg">
              IL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Form IL-W-4</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  Illinois Official
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Employee's Illinois Withholding Allowance Certificate • Illinois Department of Revenue
              </p>
            </div>
          </div>

          {/* QUICK CALCULATOR MINI-BADGE */}
          <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 self-stretch sm:self-auto ${
            formData.exempt 
              ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
              : (isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm')
          }`}>
            <Calculator size={18} className="shrink-0" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                {formData.exempt ? 'Filing Status' : 'Calculated Allowances'}
              </div>
              <div className="text-xs font-black">
                {formData.exempt 
                  ? 'EXEMPT (0 Withholding)' 
                  : `Line 1: ${basicAllowances} | Line 2: ${additionalAllowances}`
                }
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 1. EMPLOYEE PERSONAL INFORMATION */}
          <section className={cardStyle}>
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-inherit">
              <User size={20} className="text-blue-500" />
              <h3 className="text-base font-bold">1. Employee Identification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-6">
                <label className={labelStyle}>First Name *</label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="First name"
                  required 
                />
              </div>

              <div className="md:col-span-6">
                <label className={labelStyle}>Last Name *</label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Last name"
                  required 
                />
              </div>

              <div className="md:col-span-6">
                <label className={labelStyle}>Social Security Number (SSN) *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="ssn" 
                    value={formData.ssn} 
                    onChange={handleChange} 
                    className={`${inputStyle} pl-10 tracking-widest font-mono`} 
                    placeholder="9-digit SSN"
                    maxLength={9}
                    required 
                  />
                  <Shield size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                </div>
              </div>

              <div className="md:col-span-6">
                <label className={labelStyle}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="name@company.com" 
                />
              </div>

              <div className="md:col-span-12">
                <label className={labelStyle}>Residential Street Address *</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="Street address (including Apt/Suite)"
                  required 
                />
              </div>

              <div className="md:col-span-5">
                <label className={labelStyle}>City *</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="City"
                  required 
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelStyle}>State</label>
                <input 
                  type="text" 
                  name="state" 
                  value="IL" 
                  readOnly 
                  className={`${inputStyle} text-center font-bold opacity-80 cursor-not-allowed`} 
                />
              </div>

              <div className="md:col-span-4">
                <label className={labelStyle}>ZIP Code *</label>
                <input 
                  type="text" 
                  name="zipcode" 
                  value={formData.zipcode} 
                  onChange={handleChange} 
                  className={inputStyle} 
                  placeholder="5-digit ZIP"
                  maxLength={5}
                  required 
                />
              </div>
            </div>
          </section>

          {/* 2. EXEMPTION STATUS */}
          <section className={cardStyle}>
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-inherit">
              <Shield size={20} className="text-emerald-500" />
              <h3 className="text-base font-bold">2. Exemption from Illinois Withholding</h3>
            </div>

            <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
              formData.exempt 
                ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/40' : 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400')
                : (isDarkMode ? 'bg-zinc-900/40 border-zinc-700/60 hover:border-zinc-600' : 'bg-slate-50/60 border-slate-200 hover:border-slate-300')
            }`}>
              <input 
                type="checkbox" 
                name="exempt" 
                checked={formData.exempt} 
                onChange={handleChange} 
                className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
              />
              <div className="space-y-1">
                <span className={`block font-bold text-sm ${formData.exempt ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                  I am Exempt from Illinois Income Tax Withholding
                </span>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Check this box only if you are exempt from federal and Illinois income tax withholding. When claiming exempt, 
                  withholding allowances will not be deducted and the official exemption box on Form IL-W-4 will be recorded.
                </p>
              </div>
            </label>
          </section>

          {/* 3. ALLOWANCES WORKSHEET (Disabled if Exempt) */}
          <section className={`${cardStyle} transition-all duration-300 ${
            formData.exempt ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'
          }`}>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-inherit">
              <div className="flex items-center gap-2.5">
                <Calculator size={20} className="text-blue-500" />
                <h3 className="text-base font-bold">3. Withholding Allowances Worksheet</h3>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'
              }`}>
                Steps 1, 2 & 3
              </span>
            </div>

            <div className="space-y-6">
              
              {/* Filing Status via StunningSelect */}
              <div>
                <StunningSelect
                  label="Filing Status (Determines Step 1 Base Allowances)"
                  value={formData.filing_status}
                  onChange={(e) => handleChange({ target: { name: 'filing_status', value: e.target.value } })}
                  options={filingOptions}
                  placeholder="Select Filing Status"
                  isDarkMode={isDarkMode}
                  activeHexColor={activeHexColor}
                />
                <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Single filers receive 1 base personal allowance; Married filing jointly receives 2 base allowances.
                </p>
              </div>

              {/* Step 1: Basic Allowances for Dependents */}
              <div className={`p-5 rounded-xl border ${
                isDarkMode ? 'bg-zinc-900/40 border-zinc-700/60' : 'bg-blue-50/40 border-blue-100'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelStyle}>Step 1: Number of Dependents</label>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Step 1 Line 4 Total: {basicAllowances}
                  </span>
                </div>
                <input 
                  type="number" 
                  name="dependents" 
                  value={formData.dependents} 
                  onChange={handleChange} 
                  min="0" 
                  max="20"
                  className={inputStyle} 
                />
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter the number of dependents (other than yourself or spouse) you will claim on your tax return.
                </p>
              </div>

              {/* Step 2: Additional Allowances (Age 65+ / Blindness) */}
              <div className={`p-5 rounded-xl border ${
                isDarkMode ? 'bg-zinc-900/40 border-zinc-700/60' : 'bg-slate-50/70 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <label className={labelStyle}>Step 2: Additional Allowances (Age 65+ & Blindness)</label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Step 2 Line 9 Total: {additionalAllowances}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.you_65 
                      ? (isDarkMode ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-800')
                      : (isDarkMode ? 'bg-zinc-900/60 border-zinc-700/60' : 'bg-white border-slate-200')
                  }`}>
                    <input 
                      type="checkbox" 
                      name="you_65" 
                      checked={formData.you_65} 
                      onChange={handleChange} 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-xs font-bold">You are 65 or older</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.you_blind 
                      ? (isDarkMode ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-800')
                      : (isDarkMode ? 'bg-zinc-900/60 border-zinc-700/60' : 'bg-white border-slate-200')
                  }`}>
                    <input 
                      type="checkbox" 
                      name="you_blind" 
                      checked={formData.you_blind} 
                      onChange={handleChange} 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-xs font-bold">You are legally blind</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.sp_65 
                      ? (isDarkMode ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-800')
                      : (isDarkMode ? 'bg-zinc-900/60 border-zinc-700/60' : 'bg-white border-slate-200')
                  }`}>
                    <input 
                      type="checkbox" 
                      name="sp_65" 
                      checked={formData.sp_65} 
                      onChange={handleChange} 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-xs font-bold">Spouse is 65 or older</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    formData.sp_blind 
                      ? (isDarkMode ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-800')
                      : (isDarkMode ? 'bg-zinc-900/60 border-zinc-700/60' : 'bg-white border-slate-200')
                  }`}>
                    <input 
                      type="checkbox" 
                      name="sp_blind" 
                      checked={formData.sp_blind} 
                      onChange={handleChange} 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-xs font-bold">Spouse is legally blind</span>
                  </label>
                </div>
              </div>

              {/* Step 3: Additional Withholding */}
              <div className={`p-5 rounded-xl border ${
                isDarkMode ? 'bg-zinc-900/40 border-zinc-700/60' : 'bg-slate-50/70 border-slate-200'
              }`}>
                <label className={labelStyle}>Step 3: Additional Withholding per Paycheck ($)</label>
                <div className="relative max-w-sm">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm ${
                    isDarkMode ? 'text-zinc-500' : 'text-slate-400'
                  }`}>$</span>
                  <input 
                    type="number" 
                    name="additional_withholding" 
                    value={formData.additional_withholding} 
                    onChange={handleChange} 
                    className={`${inputStyle} pl-8`} 
                    placeholder="0.00"
                    min="0"
                    step="1"
                  />
                </div>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter any additional dollar amount you want withheld (deducted) from each paycheck.
                </p>
              </div>

              {/* LIVE CERTIFICATE SUMMARY TABLE */}
              <div className={`p-4 rounded-xl border grid grid-cols-3 text-center gap-2 ${
                isDarkMode ? 'bg-black/30 border-zinc-800' : 'bg-slate-100/60 border-slate-200'
              }`}>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">Line 1 (Basic)</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">{basicAllowances}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">Line 2 (Additional)</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{additionalAllowances}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">Line 3 (Extra $/Pay)</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    ${formData.additional_withholding ? Number(formData.additional_withholding).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* 4. ATTESTATION & SIGNATURE */}
          <section className={cardStyle}>
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-inherit">
              <PenTool size={20} className="text-blue-500" />
              <h3 className="text-base font-bold">4. Attestation & Digital Signature</h3>
            </div>

            <div className={`p-4 rounded-xl mb-6 text-xs leading-relaxed font-medium ${
              isDarkMode ? 'bg-zinc-900/60 text-zinc-300 border border-zinc-800' : 'bg-blue-50/60 text-slate-700 border border-blue-100'
            }`}>
              I certify that I am entitled to the number of withholding allowances claimed on this certificate, or that I am entitled to claim exempt status.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <CustomDatePicker 
                  label="Date of Signing *" 
                  name="confirmation_date" 
                  value={formData.confirmation_date} 
                  onChange={handleChange}
                  isDarkMode={isDarkMode} 
                />
              </div>

              <div className="md:col-span-8">
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelStyle}>
                    Digital Signature <span className="text-red-500">*</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={clearSignature} 
                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg hover:bg-red-500/10"
                  >
                    <Eraser size={13} />
                    <span>Clear Signature</span>
                  </button>
                </div>

                <div 
                  ref={containerRef} 
                  className={`border-2 border-dashed rounded-2xl overflow-hidden h-44 w-full relative transition-colors cursor-crosshair shadow-inner ${
                    isDarkMode 
                      ? 'border-zinc-700 bg-zinc-900/40 hover:border-zinc-500' 
                      : 'border-slate-300 bg-slate-50/50 hover:border-blue-400'
                  }`}
                >
                  <SignatureCanvas 
                    ref={sigCanvasRef} 
                    penColor={isDarkMode ? 'white' : 'black'} 
                    velocityFilterWeight={0.7} 
                    canvasProps={{ className: 'sigCanvas w-full h-full' }} 
                    onEnd={handleSignatureEnd} 
                  />
                  {!formData.signature_image && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 gap-2">
                      <PenTool size={20} />
                      <span className="text-xs font-bold">Sign Inside This Box</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              style={{ backgroundColor: activeHexColor }}
              className={`px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-xl hover:shadow-2xl transition-all flex items-center gap-2.5 active:scale-95 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'
              }`}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{isSubmitting ? 'Generating Official IL-W-4...' : 'Confirm & Generate PDF'}</span>
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default IllinoisTaxForm;
