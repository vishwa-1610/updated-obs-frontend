import React, { useState, useEffect, useRef, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Sparkles, Building2, MapPin, Check
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

// --- 1. THEME-AWARE LOADING OVERLAY ---
const LoadingOverlay = ({ isDarkMode, activeHexColor }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 p-4 ${
    isDarkMode ? 'bg-[#0d0f15]/80' : 'bg-white/85'
  }`}>
    <div className={`flex flex-col items-center p-8 rounded-3xl shadow-2xl border max-w-sm w-full text-center animate-in zoom-in-95 duration-200 ${
      isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="relative mb-4">
        <div 
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{ borderColor: `${activeHexColor}30`, borderTopColor: activeHexColor }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText size={20} style={{ color: activeHexColor }} />
        </div>
      </div>
      <h3 className="text-base font-extrabold tracking-tight mb-1">Processing Certificate</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Generating official Kansas Form K-4 and computing withholding rates...
      </p>
    </div>
  </div>
);

// --- 2. THEME-AWARE ERROR MODAL ---
const ErrorModal = ({ isOpen, title, message, onClose, isDarkMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border ${
        isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-4 text-rose-500">
            <XCircle size={28} />
          </div>
          <h3 className="text-lg font-extrabold mb-1.5">{title || "Action Required"}</h3>
          <p className={`text-xs mb-6 leading-relaxed max-w-sm ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            {message || "Please review the highlighted fields."}
          </p>
          <button 
            type="button"
            onClick={onClose} 
            className="w-full py-3 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-md"
          >
            Review & Complete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. THEME-AWARE CUSTOM DATE PICKER ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder, isDarkMode, activeHexColor }) => {
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

  useEffect(() => {
    if (view === 'year' && yearScrollRef.current) {
      const selectedYearEl = yearScrollRef.current.querySelector('.selected-year');
      if (selectedYearEl) selectedYearEl.scrollIntoView({ block: 'center' });
    }
  }, [view]);

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
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
          isDarkMode ? 'text-zinc-400' : 'text-slate-500'
        }`}>
          {label}
        </label>
      )}
      <div 
        className={`relative cursor-pointer flex items-center px-4 py-3 rounded-xl border transition-all text-xs font-semibold ${
          isDarkMode 
            ? 'bg-[#22242c] border-zinc-700/80 text-zinc-100 hover:border-zinc-600' 
            : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={16} className="mr-2.5 shrink-0" style={{ color: activeHexColor }} />
        <span className="flex-1">{value || placeholder || "YYYY-MM-DD"}</span>
        <ChevronDown size={14} className="text-zinc-400 shrink-0 pointer-events-none" />
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-2 p-4 rounded-2xl shadow-2xl border w-72 max-w-[90vw] left-0 sm:left-auto animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            {view === 'calendar' && (
              <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                <ChevronLeft size={16} />
              </button>
            )}
            <div className="flex gap-1.5">
              <button 
                type="button" 
                onClick={() => setView(view === 'month' ? 'calendar' : 'month')} 
                className="font-bold px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-xs"
              >
                {monthNames[currentDate.getMonth()]}
              </button>
              <button 
                type="button" 
                onClick={() => setView(view === 'year' ? 'calendar' : 'year')} 
                className="font-bold px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-xs"
              >
                {currentDate.getFullYear()}
              </button>
            </div>
            {view === 'calendar' && (
              <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {view === 'calendar' && (
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <span key={d} className="text-[10px] text-zinc-400 font-bold py-1">{d}</span>
              ))}
              {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_, i) => (
                <div key={i} />
              ))}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(d => (
                <button 
                  key={d} 
                  type="button" 
                  onClick={() => handleDateClick(d)} 
                  className="h-7 w-7 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {view === 'month' && (
            <div className="grid grid-cols-3 gap-1.5">
              {monthNames.map((m, i) => (
                <button 
                  key={m} 
                  type="button" 
                  onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), i, 1)); setView('calendar'); }} 
                  className="p-2 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {view === 'year' && (
            <div ref={yearScrollRef} className="h-48 overflow-y-auto grid grid-cols-3 gap-1.5 custom-scrollbar pr-1">
              {years.map(y => (
                <button 
                  key={y} 
                  type="button" 
                  onClick={() => { setCurrentDate(new Date(y, currentDate.getMonth(), 1)); setView('calendar'); }} 
                  className={`p-1.5 text-xs rounded-lg ${
                    y === currentDate.getFullYear() 
                      ? 'bg-blue-500/20 text-blue-500 font-bold selected-year' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                  }`}
                >
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

// --- MAIN KANSAS FORM COMPONENT ---
const KansasTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // FORM DATA STATE
  const [formData, setFormData] = useState({
    // Personal Info (Boxes 1 & 2)
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    email: '',
    phone_no: '',
    address: '',
    city: '',
    state: 'KS',
    zipcode: '',
    client_name: '',

    // Allowance Rate (Line 3 & Line A)
    // "1" = Single / Married(spouse works), "2" = Joint / Married(spouse not working)
    allowance_rate: '1',

    // Personal Allowance Worksheet (Lines B through E)
    claim_self: true,             // Line B: 1 allowance
    married: false,
    spouse_works: false,          // Line C: 1 allowance if married & not spouse_works
    head_of_household: false,     // Line D: 2 allowances
    dependents: 0,                // Line E: number of dependents

    // Additional Withholding (Line 5)
    additional_withholding: '',

    // Exemption (Line 6)
    exempt: false,

    // Attestation & Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null,
  });

  // INITIALIZE FROM INITIAL DATA
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        state: 'KS',
        zipcode: (initialData.zipcode || '').toString().slice(0, 5),
        confirmation_date: initialData.confirmation_date || new Date().toISOString().split('T')[0]
      }));
    }
  }, [initialData]);

  // LIVE COMPUTATION OF WORKSHEET LINE F
  const computedAllowances = useMemo(() => {
    if (formData.exempt) return 0;
    const lineB = formData.claim_self ? 1 : 0;
    const lineC = (formData.married && !formData.spouse_works) ? 1 : 0;
    const lineD = formData.head_of_household ? 2 : 0;
    const lineE = Math.max(0, parseInt(formData.dependents, 10) || 0);
    return lineB + lineC + lineD + lineE;
  }, [formData.claim_self, formData.married, formData.spouse_works, formData.head_of_household, formData.dependents, formData.exempt]);

  // CANVAS RESIZE HANDLER WITH PRESERVATION
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (canvas.width !== rect.width || canvas.height !== rect.height)) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) {
            sigCanvasRef.current.fromDataURL(savedData);
          }
        }
      }
    };
    const timer = setTimeout(resizeCanvas, 150);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'zipcode') {
      const cleanZip = value.replace(/\D/g, '').slice(0, 5);
      setFormData(prev => ({ ...prev, [name]: cleanZip }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const sigData = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: sigData }));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  // SUBMISSION HANDLER
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    let sig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!sig) {
      setErrorState({
        isOpen: true,
        title: "Missing Signature",
        message: "Please provide your signature in the digital attestation box before submitting Form K-4."
      });
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.ssn || !formData.address || !formData.city || !formData.zipcode) {
      setErrorState({
        isOpen: true,
        title: "Incomplete Employee Information",
        message: "Please ensure your Full Name, SSN, Street Address, City, and 5-digit ZIP Code are filled out."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const finalData = {
        ...formData,
        state: 'KS',
        dependents: Math.max(0, parseInt(formData.dependents, 10) || 0),
        allowances: computedAllowances,
        signature: sig,
        signature_image: sig
      };

      await onSubmit(finalData);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Kansas submission error:", error);
      setIsSubmitting(false);
      const msg = error.response?.data?.error || error.message || "Something went wrong submitting Form K-4.";
      setErrorState({ isOpen: true, title: "Submission Failed", message: typeof msg === 'object' ? JSON.stringify(msg) : msg });
    }
  };

  // COMMON STYLE TOKENS
  const cardClass = `p-6 sm:p-7 rounded-3xl border transition-all ${
    isDarkMode 
      ? 'bg-[#181a20] border-zinc-800 shadow-xl' 
      : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
  }`;

  const inputClass = `w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none transition-all ${
    isDarkMode 
      ? 'bg-[#22242c] border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:border-blue-500' 
      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white'
  }`;

  const labelClass = `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
    isDarkMode ? 'text-zinc-400' : 'text-slate-500'
  }`;

  return (
    <>
      {isSubmitting && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeHexColor} />}
      <ErrorModal 
        isOpen={errorState.isOpen} 
        title={errorState.title} 
        message={errorState.message} 
        onClose={() => setErrorState({ isOpen: false, title: '', message: '' })}
        isDarkMode={isDarkMode}
      />

      <div className="w-full space-y-6 text-left">
        
        {/* --- HEADER BANNER --- */}
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-[#181a20] via-[#1a1d27] to-[#181a20] border-zinc-800' 
            : 'bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/50 border-slate-200/80'
        }`}>
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span 
                  className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
                  style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                >
                  Form K-4 (Rev. 7-24)
                </span>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Kansas Dept. of Revenue
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Kansas Employee's Withholding Allowance Certificate
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Complete this form so your employer can calculate the accurate Kansas state income tax to withhold.
              </p>
            </div>
          </div>

          {/* Quick Allowance Counter Pill */}
          <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 self-start md:self-auto ${
            isDarkMode ? 'bg-[#12141c] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <Calculator size={18} style={{ color: activeHexColor }} />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Calculated Allowances
              </span>
              <span className="text-base font-extrabold" style={{ color: activeHexColor }}>
                {formData.exempt ? '0 (Exempt)' : `${computedAllowances} Allowances`}
              </span>
            </div>
          </div>
        </div>

        {/* --- SECTION 1: EMPLOYEE PERSONAL INFORMATION --- */}
        <section className={cardClass}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}>
              <User size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">1. Employee Information (Boxes 1 & 2)</h3>
              <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Enter your full legal name, social security number, and Kansas residential address.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className={labelClass}>First Name <span className="text-rose-500">*</span></label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>M.I.</label>
              <input type="text" name="middle_initial" maxLength={2} value={formData.middle_initial} onChange={handleChange} className={`${inputClass} text-center`} placeholder="M" />
            </div>
            <div className="md:col-span-5">
              <label className={labelClass}>Last Name <span className="text-rose-500">*</span></label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" />
            </div>

            <div className="md:col-span-6">
              <label className={labelClass}>Social Security Number <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  name="ssn" 
                  value={formData.ssn} 
                  onChange={handleChange} 
                  className={`${inputClass} pl-9 tracking-widest font-mono`} 
                  placeholder="XXX-XX-XXXX" 
                />
                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="md:col-span-6">
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="employee@example.com" />
            </div>

            <div className="md:col-span-12">
              <label className={labelClass}>Mailing Street Address (Box 2) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={`${inputClass} pl-9`} placeholder="Street Address and Apt / Suite" />
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className={labelClass}>City <span className="text-rose-500">*</span></label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="City" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>State</label>
              <input type="text" name="state" value="KS" readOnly className={`${inputClass} text-center font-bold opacity-80 cursor-not-allowed`} />
            </div>
            <div className="md:col-span-4">
              <label className={labelClass}>Zip Code (5 Digits) <span className="text-rose-500">*</span></label>
              <input type="text" name="zipcode" maxLength={5} value={formData.zipcode} onChange={handleChange} className={inputClass} placeholder="66612" />
            </div>
          </div>
        </section>

        {/* --- SECTION 2: ALLOWANCE RATE (LINE 3 & LINE A) --- */}
        <section className={cardClass}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">2. Allowance Rate (Line 3 & Line A)</h3>
              <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Choose the applicable Kansas tax allowance bracket based on your marital and employment status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rate 1 Option */}
            <div 
              onClick={() => setFormData(prev => ({ ...prev, allowance_rate: '1' }))}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                formData.allowance_rate === '1'
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
                  : isDarkMode ? 'border-zinc-800 bg-[#12141c] hover:border-zinc-700' : 'border-slate-200 bg-white hover:border-slate-300'
              } ${formData.allowance_rate === '1' ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50/40') : ''}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                formData.allowance_rate === '1' ? 'border-blue-500 bg-blue-500 text-white' : 'border-zinc-400'
              }`}>
                {formData.allowance_rate === '1' && <Check size={12} strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-extrabold">Rate 1: Single</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">Standard</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Single filer, OR Married whose spouse also earns income (withholds at the single tax rate).
                </p>
              </div>
            </div>

            {/* Rate 2 Option */}
            <div 
              onClick={() => setFormData(prev => ({ ...prev, allowance_rate: '2' }))}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                formData.allowance_rate === '2'
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
                  : isDarkMode ? 'border-zinc-800 bg-[#12141c] hover:border-zinc-700' : 'border-slate-200 bg-white hover:border-slate-300'
              } ${formData.allowance_rate === '2' ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50/40') : ''}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                formData.allowance_rate === '2' ? 'border-blue-500 bg-blue-500 text-white' : 'border-zinc-400'
              }`}>
                {formData.allowance_rate === '2' && <Check size={12} strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-extrabold">Rate 2: Joint</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">Married Joint</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Married filer whose spouse does NOT work outside the home (withholds at the joint tax rate).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: PERSONAL ALLOWANCE WORKSHEET (LINES B - F) --- */}
        <section className={cardClass}>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}>
                <Calculator size={16} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">3. Personal Allowance Worksheet (Lines B through F)</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Complete each line to calculate your total withholding allowances.
                </p>
              </div>
            </div>

            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
              isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              Line F: {computedAllowances} Allowances
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Line B: Personal Allowance */}
            <label className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
              formData.claim_self
                ? isDarkMode ? 'bg-blue-500/10 border-blue-500/40' : 'bg-blue-50/50 border-blue-300'
                : isDarkMode ? 'bg-[#12141c] border-zinc-800' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                name="claim_self"
                checked={formData.claim_self}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">Line B: Personal Allowance for Yourself</span>
                  <span className="text-xs font-bold text-blue-500">+1 Allowance</span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter 1 if you are single or married (uncheck only if you wish to withhold more tax).
                </p>
              </div>
            </label>

            {/* Line C: Married & Spouse does not work */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
              formData.married
                ? isDarkMode ? 'bg-blue-500/5 border-blue-500/30' : 'bg-blue-50/30 border-blue-200'
                : isDarkMode ? 'bg-[#12141c] border-zinc-800' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <label className="flex items-start gap-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="married"
                  checked={formData.married}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-xs font-extrabold block">Are you legally married?</span>
                  <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Check if you will file as married filing jointly.
                  </p>
                </div>
              </label>

              {formData.married && (
                <div className={`pl-7 pt-2.5 border-t ${isDarkMode ? 'border-zinc-800' : 'border-slate-200/60'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="spouse_works"
                      checked={formData.spouse_works}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Does your spouse work outside the home?</span>
                        <span className="text-xs font-bold" style={{ color: !formData.spouse_works ? '#10b981' : '#6b7280' }}>
                          {!formData.spouse_works ? '+1 Allowance (Line C)' : '0 Allowances'}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Line C: If married and your spouse does NOT work, claim 1 additional allowance.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Line D: Head of Household */}
            <label className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
              formData.head_of_household
                ? isDarkMode ? 'bg-blue-500/10 border-blue-500/40' : 'bg-blue-50/50 border-blue-300'
                : isDarkMode ? 'bg-[#12141c] border-zinc-800' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                name="head_of_household"
                checked={formData.head_of_household}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-0 shrink-0 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">Line D: Filing as Head of Household</span>
                  <span className="text-xs font-bold text-emerald-500">+2 Allowances</span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter 2 if you are unmarried and pay more than 50% of the cost of keeping up a home for qualifying dependents.
                </p>
              </div>
            </label>

            {/* Line E & Line 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#12141c] border-zinc-800' : 'bg-slate-50/50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold">Line E: Dependents Claimed</label>
                  <span className="text-xs font-bold text-blue-500">+{formData.dependents || 0} Allowances</span>
                </div>
                <p className={`text-[10px] mb-2.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Number of dependents you claim on your Kansas tax return (do not include yourself or spouse).
                </p>
                <input
                  type="number"
                  name="dependents"
                  min="0"
                  max="20"
                  value={formData.dependents}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#12141c] border-zinc-800' : 'bg-slate-50/50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold">Line 5: Additional Withholding ($)</label>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Optional</span>
                </div>
                <p className={`text-[10px] mb-2.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Additional dollar amount you want withheld from each paycheck.
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    name="additional_withholding"
                    min="0"
                    step="0.01"
                    value={formData.additional_withholding}
                    onChange={handleChange}
                    className={`${inputClass} pl-8`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: EXEMPTION FROM WITHHOLDING (LINE 6) --- */}
        <section className={cardClass}>
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}>
              <Shield size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">4. Exemption from Withholding (Line 6)</h3>
              <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Claim exemption if you had no Kansas tax liability last year and anticipate none this year.
              </p>
            </div>
          </div>

          <label className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
            formData.exempt
              ? 'border-emerald-500 bg-emerald-500/10'
              : isDarkMode ? 'border-zinc-800 bg-[#12141c] hover:border-zinc-700' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}>
            <input
              type="checkbox"
              name="exempt"
              checked={formData.exempt}
              onChange={handleChange}
              className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-0 shrink-0 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-extrabold">I Claim Exemption from Kansas Income Tax Withholding (Line 6)</span>
                {formData.exempt && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Exemption Active
                  </span>
                )}
              </div>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                You must meet Kansas DOR conditions: 1) You had no state income tax liability last year; and 2) This year you expect no tax liability.
                Note: When exempt is claimed, "Exempt" is written on Line 6 and standard allowance computations are bypassed.
              </p>
            </div>
          </label>
        </section>

        {/* --- SECTION 5: ATTESTATION & DIGITAL SIGNATURE --- */}
        <section className={cardClass}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}>
              <PenTool size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">5. Attestation & Digital Signature</h3>
              <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Sign and date to attest to the accuracy of your Kansas Form K-4.
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed ${
            isDarkMode ? 'bg-[#12141c] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <p className="font-medium">
              <strong>Statutory Declaration:</strong> Under penalties of perjury, I declare that I have examined this certificate and to the best of my knowledge and belief it is true, correct, and complete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5">
              <CustomDatePicker
                label="Date of Signing"
                name="confirmation_date"
                value={formData.confirmation_date}
                onChange={handleChange}
                isDarkMode={isDarkMode}
                activeHexColor={activeHexColor}
              />
            </div>

            <div className="md:col-span-7">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>
                  Digital Signature <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg hover:bg-rose-500/10"
                >
                  <Eraser size={12} /> Clear Signature
                </button>
              </div>

              <div 
                ref={containerRef}
                className={`border-2 border-dashed rounded-2xl overflow-hidden h-44 w-full relative transition-all touch-none select-none ${
                  isDarkMode 
                    ? 'border-zinc-700 hover:border-zinc-500 bg-[#22242c]' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? '#ffffff' : '#0f172a'}
                  velocityFilterWeight={0.7}
                  canvasProps={{ className: 'sigCanvas w-full h-full cursor-crosshair' }}
                  onEnd={handleSignatureEnd}
                />
                {!formData.signature_image && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400 gap-1.5">
                    <PenTool size={20} className="opacity-40" />
                    <span className="text-xs font-semibold">Draw Signature Here (Mouse or Touchscreen)</span>
                  </div>
                )}
              </div>
              <p className={`text-[10px] mt-1.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Sign within the box. By signing, you confirm that this digital signature has the same legal validity as a handwritten signature.
              </p>
            </div>
          </div>
        </section>

        {/* --- SUBMIT ACTION BUTTON --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles size={14} style={{ color: activeHexColor }} />
            <span>Form K-4 will be officially rendered with PyMuPDF</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ backgroundColor: activeHexColor }}
            className={`w-full sm:w-auto px-8 py-3.5 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-95 hover:shadow-xl active:scale-95'
            }`}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSubmitting ? 'Submitting Form K-4...' : 'Confirm & Generate Official K-4'}</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default KansasTaxForm;
