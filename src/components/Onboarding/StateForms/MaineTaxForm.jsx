import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Sparkles, Building2, MapPin, Check, HeartHandshake,
  HelpCircle, ArrowRight, Phone
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form W-4ME</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing state withholding certificate and vector markings...
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
const CustomDatePicker = ({ label, name, value, onChange, isDarkMode, activeHexColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });
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

  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
        isDarkMode ? 'text-zinc-400' : 'text-slate-600'
      }`}>
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all shadow-sm ${
          isDarkMode 
            ? 'bg-[#12141a] border-zinc-800 text-zinc-100 hover:border-zinc-700' 
            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar size={15} style={{ color: activeHexColor }} />
          <span>{value || 'Select confirmation date'}</span>
        </div>
        <ChevronDown size={14} className="text-zinc-400" />
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-2 p-4 rounded-2xl shadow-2xl border w-72 left-0 animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <button 
              type="button" 
              onClick={() => changeMonth(-1)}
              className="p-1 rounded-lg hover:bg-zinc-500/10 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-extrabold text-xs">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              type="button" 
              onClick={() => changeMonth(1)}
              className="p-1 rounded-lg hover:bg-zinc-500/10 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <span key={d} className="text-[10px] font-bold text-zinc-400">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array(firstDayOfMonth).fill(null).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = value === dateStr;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  style={isSelected ? { backgroundColor: activeHexColor, color: '#fff' } : {}}
                  className={`h-7 w-7 text-xs rounded-lg font-medium transition-colors ${
                    isSelected ? 'font-bold shadow-sm' : 'hover:bg-zinc-500/10'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 4. MAIN MAINE FORM COMPONENT ---
const MaineTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // 1. FORM DATA STATE INITIALIZED LAZILY
  const [formData, setFormData] = useState(() => {
    const rawSSN = (initialData?.ssn || '').replace(/\D/g, '').slice(0, 9);
    const formattedSSN = rawSSN.length === 9 
      ? `${rawSSN.slice(0, 3)}-${rawSSN.slice(3, 5)}-${rawSSN.slice(5)}` 
      : (initialData?.ssn || '');

    return {
      // Personal Details (Lines 1 & 2)
      first_name: initialData?.first_name || '',
      middle_initial: initialData?.middle_initial || initialData?.middle_name || '',
      last_name: initialData?.last_name || '',
      ssn: formattedSSN,
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || 'ME',
      zipcode: (initialData?.zipcode || '').toString().slice(0, 5),
      email: initialData?.email || '',

      // Line 3: Marital Status ("1", "2", "3")
      marital_status_code: String(initialData?.marital_status_code || '1'),

      // Personal Allowances Worksheet (Lines A through E)
      me_line_a: Boolean(initialData?.me_line_a ?? true),
      me_line_b: Boolean(initialData?.me_line_b ?? false),
      me_line_c: Boolean(initialData?.me_line_c ?? false),
      me_line_d: Number(initialData?.me_line_d ?? initialData?.dependents ?? 0),

      // Line 5: Additional Withholding
      additional_withholding: initialData?.additional_withholding || initialData?.state_additional_withholding || '',

      // Line 6: Exemption
      exempt: Boolean(initialData?.exempt ?? false),
      exempt_type: initialData?.exempt_type || '', // 'a', 'b', 'c', 'd', 'e'

      // Employer Section (Lines 7 to 10)
      employer_name: initialData?.employer_name || initialData?.company_name || 'Tech Innovators Inc.',
      employer_address: initialData?.employer_address || '100 Commercial St, Portland, ME 04101',
      employer_ein: initialData?.employer_ein || '12-3456789',
      contact_person: initialData?.contact_person || initialData?.employer_contact_person || 'HR Director',
      contact_phone: initialData?.contact_phone || initialData?.employer_phone || '(207) 555-0199',

      // Signature
      confirmation_date: initialData?.confirmation_date || new Date().toISOString().split('T')[0],
      signature_image: null
    };
  });

  // Sync initialData if updated from parent
  useEffect(() => {
    if (initialData) {
      const rawSSN = (initialData.ssn || '').replace(/\D/g, '').slice(0, 9);
      const formattedSSN = rawSSN.length === 9 
        ? `${rawSSN.slice(0, 3)}-${rawSSN.slice(3, 5)}-${rawSSN.slice(5)}` 
        : (initialData.ssn || '');

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        ...initialData,
        ssn: formattedSSN || prev.ssn,
        state: 'ME',
        zipcode: (initialData.zipcode || '').toString().slice(0, 5),
        marital_status_code: String(initialData.marital_status_code || prev.marital_status_code || '1'),
        me_line_a: initialData.me_line_a !== undefined ? Boolean(initialData.me_line_a) : prev.me_line_a,
        me_line_b: initialData.me_line_b !== undefined ? Boolean(initialData.me_line_b) : prev.me_line_b,
        me_line_c: initialData.me_line_c !== undefined ? Boolean(initialData.me_line_c) : prev.me_line_c,
        me_line_d: initialData.me_line_d !== undefined ? Number(initialData.me_line_d) : prev.me_line_d,
        exempt: Boolean(initialData.exempt ?? prev.exempt),
        exempt_type: initialData.exempt_type || prev.exempt_type || '',
        employer_name: initialData.employer_name || initialData.company_name || prev.employer_name,
        employer_address: initialData.employer_address || prev.employer_address,
        employer_ein: initialData.employer_ein || prev.employer_ein,
        contact_person: initialData.contact_person || initialData.employer_contact_person || prev.contact_person,
        contact_phone: initialData.contact_phone || initialData.employer_phone || prev.contact_phone
      }));
    }
  }, [initialData]);

  // Handle Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) {
            sigCanvasRef.current.fromDataURL(savedData);
          }
        }
      }
    };
    const timer = setTimeout(handleResize, 200);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Total Allowances Live Calculation (Lines A + B + C + D)
  const totalAllowances = (formData.me_line_a ? 1 : 0) + 
                          (formData.me_line_b ? 1 : 0) + 
                          (formData.me_line_c ? 1 : 0) + 
                          Math.max(0, parseInt(formData.me_line_d || 0, 10));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'ssn') {
      const clean = value.replace(/\D/g, '').slice(0, 9);
      let formatted = clean;
      if (clean.length > 5) formatted = `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5)}`;
      else if (clean.length > 3) formatted = `${clean.slice(0, 3)}-${clean.slice(3)}`;
      setFormData(prev => ({ ...prev, ssn: formatted }));
      return;
    }
    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 5) }));
      return;
    }
    if (name === 'me_line_d') {
      const parsed = parseInt(value, 10);
      setFormData(prev => ({ ...prev, [name]: isNaN(parsed) || parsed < 0 ? 0 : parsed }));
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
      setFormData(prev => ({ ...prev, signature_image: null }));
    }
  };

  const handleAutofillSample = () => {
    setFormData(prev => ({
      ...prev,
      first_name: 'vishwa',
      middle_initial: '',
      last_name: 'visu',
      ssn: '999-12-3456',
      address: '500 Commercial Street',
      city: 'Portland',
      state: 'ME',
      zipcode: '04101',
      marital_status_code: '2',
      me_line_a: true,
      me_line_b: true,
      me_line_c: false,
      me_line_d: 1,
      additional_withholding: '25.00',
      exempt: false,
      exempt_type: '',
      employer_name: 'Tech Innovators Inc.',
      employer_address: '100 Commercial St, Portland, ME 04101',
      employer_ein: '12-3456789',
      contact_person: 'HR Director',
      contact_phone: '(207) 555-0199',
      confirmation_date: new Date().toISOString().split('T')[0]
    }));
  };

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
        message: "Please sign in the digital signature box before submitting Form W-4ME."
      });
      return;
    }

    if (!formData.first_name || !formData.last_name) {
      setErrorState({
        isOpen: true,
        title: "Name Required",
        message: "Please enter your legal first and last name."
      });
      return;
    }

    const cleanSSN = (formData.ssn || '').replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      setErrorState({
        isOpen: true,
        title: "Invalid Social Security Number",
        message: "Please enter a valid 9-digit Social Security Number."
      });
      return;
    }

    if (formData.exempt && !formData.exempt_type) {
      setErrorState({
        isOpen: true,
        title: "Exemption Reason Required",
        message: "You checked the box claiming exemption from withholding. Please select the qualifying exemption reason (6a through 6e)."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanNumber = (val) => (val === '' || val === null || isNaN(val)) ? 0 : val;
      const payload = {
        ...formData,
        state: 'ME',
        ssn: cleanSSN,
        me_line_a: formData.me_line_a,
        me_line_b: formData.me_line_b,
        me_line_c: formData.me_line_c,
        me_line_d: cleanNumber(formData.me_line_d),
        line4_allowances: totalAllowances,
        additional_withholding: cleanNumber(formData.additional_withholding),
        marital_status_code: formData.marital_status_code,
        exempt: formData.exempt,
        exempt_type: formData.exempt ? formData.exempt_type : '',
        employer_name: formData.employer_name,
        employer_address: formData.employer_address,
        employer_ein: formData.employer_ein,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        signature_image: sig
      };

      await onSubmit(payload);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Form W-4ME Submission Error:", error);
      setIsSubmitting(false);
      setErrorState({
        isOpen: true,
        title: "Submission Error",
        message: error.response?.data?.error || error.message || "Failed to submit Maine Form W-4ME. Please try again."
      });
    }
  };

  // Reusable Styling Constants
  const cardBgClass = isDarkMode ? 'bg-[#181a20] border-zinc-800/80 shadow-md' : 'bg-white border-slate-200/90 shadow-sm';
  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`;
  const inputClass = `w-full px-4 py-3 rounded-xl border text-xs font-semibold transition-all outline-none shadow-sm ${
    isDarkMode 
      ? 'bg-[#12141a] border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600' 
      : 'bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 hover:bg-white focus:bg-white focus:border-slate-400'
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

      <div className={`w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 transition-colors duration-200 ${
        isDarkMode ? 'text-zinc-100' : 'text-slate-800'
      }`}>
        
        {/* HEADER SECTION */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-500/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border"
                 style={{ 
                   backgroundColor: `${activeHexColor}12`, 
                   borderColor: `${activeHexColor}30`,
                   color: activeHexColor 
                 }}>
              <MapPin size={12} />
              Maine Revenue Services • State Tax Form
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Maine Employee Withholding
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Form W-4ME • Employee's Withholding Allowance Certificate
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutofillSample}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-transform active:scale-95 shadow-sm hover:opacity-90"
              style={{ 
                backgroundColor: isDarkMode ? '#1e2029' : '#f1f5f9',
                borderColor: isDarkMode ? '#2d3139' : '#e2e8f0',
                color: isDarkMode ? '#f1f5f9' : '#1e293b'
              }}
            >
              <Sparkles size={14} style={{ color: activeHexColor }} />
              Autofill Sample
            </button>
            <span className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${
              isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              Form W-4ME (2026)
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 1. PERSONAL INFORMATION (LINES 1 & 2) */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                   style={{ backgroundColor: activeHexColor }}>
                <User size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">1. Employee Identification</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Lines 1 & 2: Legal identification and Maine residential address
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              <div className="sm:col-span-5">
                <label className={labelClass}>First Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  placeholder="e.g. Marcus"
                  className={inputClass}
                  required 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>M.I.</label>
                <input 
                  type="text" 
                  name="middle_initial" 
                  value={formData.middle_initial} 
                  onChange={handleChange} 
                  maxLength="1"
                  placeholder="D"
                  className={`${inputClass} text-center`} 
                />
              </div>

              <div className="sm:col-span-5">
                <label className={labelClass}>Last Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  placeholder="e.g. Vance"
                  className={inputClass}
                  required 
                />
              </div>

              <div className="sm:col-span-6">
                <label className={labelClass}>Social Security Number (Line 2) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="ssn" 
                    value={formData.ssn} 
                    onChange={handleChange} 
                    placeholder="9-digit SSN (e.g. 433881234)"
                    maxLength="11"
                    className={`${inputClass} pl-10 tracking-wider`}
                    required 
                  />
                  <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className={labelClass}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="marcus.vance@example.com"
                  className={inputClass} 
                />
              </div>

              <div className="sm:col-span-12">
                <label className={labelClass}>Home Address (Line 1) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="e.g. 2105 Congress Street, Apt 4B"
                  className={inputClass}
                  required 
                />
              </div>

              <div className="sm:col-span-5">
                <label className={labelClass}>City or Town <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="e.g. Portland"
                  className={inputClass}
                  required 
                />
              </div>

              <div className="sm:col-span-3">
                <label className={labelClass}>State</label>
                <input 
                  type="text" 
                  name="state" 
                  value="ME" 
                  readOnly 
                  className={`${inputClass} bg-zinc-500/10 cursor-not-allowed font-bold text-center`} 
                />
              </div>

              <div className="sm:col-span-4">
                <label className={labelClass}>ZIP Code <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="zipcode" 
                  value={formData.zipcode} 
                  onChange={handleChange} 
                  placeholder="04102"
                  maxLength="5"
                  className={inputClass}
                  required 
                />
              </div>
            </div>
          </div>

          {/* 2. MARITAL STATUS SELECTION (LINE 3) */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                   style={{ backgroundColor: activeHexColor }}>
                <HeartHandshake size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">2. Marital Status (Line 3)</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Select the withholding rate classification that applies to your household
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {[
                { 
                  id: "1", 
                  title: "Single or Head of Household", 
                  desc: "Single individuals, legally separated filers, or qualifying heads of household." 
                },
                { 
                  id: "2", 
                  title: "Married", 
                  desc: "Married couples filing jointly with a single income or non-working spouse." 
                },
                { 
                  id: "3", 
                  title: "Married (Higher Single Rate)", 
                  desc: "Recommended if both spouses work or you hold multiple jobs to prevent underwithholding." 
                }
              ].map(opt => {
                const isSelected = formData.marital_status_code === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setFormData(prev => ({ ...prev, marital_status_code: opt.id }))}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-transparent shadow-lg ring-2' 
                        : isDarkMode ? 'border-zinc-800 hover:border-zinc-700 bg-[#12141a]' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                    style={isSelected ? { 
                      backgroundColor: `${activeHexColor}10`,
                      borderColor: activeHexColor,
                      boxShadow: `0 8px 24px ${activeHexColor}20`
                    } : {}}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider"
                              style={isSelected ? { color: activeHexColor } : { color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
                          Option {opt.id}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'border-transparent text-white' : 'border-zinc-400/40'
                        }`}
                        style={isSelected ? { backgroundColor: activeHexColor } : {}}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                      <h4 className="text-sm font-extrabold mb-1.5">{opt.title}</h4>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isDarkMode ? 'bg-[#12141a] border-zinc-800/80 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <span className="font-bold">Official Note:</span> If married but legally separated, or if your spouse is a nonresident alien, check the <strong>Single or Head of Household</strong> box.
              </p>
            </div>
          </div>

          {/* 3. PERSONAL ALLOWANCES WORKSHEET (LINES A THROUGH E) */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                   style={{ backgroundColor: activeHexColor }}>
                <Calculator size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">3. Personal Allowances Worksheet (Lines A – E)</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Calculate your total withholding allowances for Line 4 of Form W-4ME
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {/* Line A */}
              <div 
                onClick={() => setFormData(prev => ({ ...prev, me_line_a: !prev.me_line_a }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  formData.me_line_a 
                    ? 'border-transparent shadow-sm' 
                    : isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
                }`}
                style={formData.me_line_a ? { 
                  backgroundColor: `${activeHexColor}10`,
                  borderColor: `${activeHexColor}50` 
                } : {}}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    formData.me_line_a ? 'border-transparent text-white' : 'border-zinc-400'
                  }`}
                  style={formData.me_line_a ? { backgroundColor: activeHexColor } : {}}>
                    {formData.me_line_a && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-inherit">
                      Line A: Enter "1" for yourself
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Check this box if no one else can claim you as a dependent on their tax return.
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold px-3 py-1 rounded-xl bg-zinc-500/10">
                  {formData.me_line_a ? "1" : "0"}
                </span>
              </div>

              {/* Line B */}
              <div 
                onClick={() => setFormData(prev => ({ ...prev, me_line_b: !prev.me_line_b }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  formData.me_line_b 
                    ? 'border-transparent shadow-sm' 
                    : isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
                }`}
                style={formData.me_line_b ? { 
                  backgroundColor: `${activeHexColor}10`,
                  borderColor: `${activeHexColor}50` 
                } : {}}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    formData.me_line_b ? 'border-transparent text-white' : 'border-zinc-400'
                  }`}
                  style={formData.me_line_b ? { backgroundColor: activeHexColor } : {}}>
                    {formData.me_line_b && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-inherit">
                      Line B: Enter "1" for your spouse
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Applicable if married filing jointly. Enter "0" if spouse also works to avoid underwithholding.
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold px-3 py-1 rounded-xl bg-zinc-500/10">
                  {formData.me_line_b ? "1" : "0"}
                </span>
              </div>

              {/* Line C */}
              <div 
                onClick={() => setFormData(prev => ({ ...prev, me_line_c: !prev.me_line_c }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  formData.me_line_c 
                    ? 'border-transparent shadow-sm' 
                    : isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
                }`}
                style={formData.me_line_c ? { 
                  backgroundColor: `${activeHexColor}10`,
                  borderColor: `${activeHexColor}50` 
                } : {}}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    formData.me_line_c ? 'border-transparent text-white' : 'border-zinc-400'
                  }`}
                  style={formData.me_line_c ? { backgroundColor: activeHexColor } : {}}>
                    {formData.me_line_c && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-inherit">
                      Line C: Enter "1" for Head of Household
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Applicable if you are unmarried and pay more than half the cost of maintaining a home for qualifying persons.
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold px-3 py-1 rounded-xl bg-zinc-500/10">
                  {formData.me_line_c ? "1" : "0"}
                </span>
              </div>

              {/* Line D */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div>
                  <h4 className="text-xs font-bold text-inherit">
                    Line D: Number of Children & Dependents
                  </h4>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Eligible for the federal child tax credit or federal credit for other dependents.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, me_line_d: Math.max(0, (parseInt(prev.me_line_d, 10) || 0) - 1) }))}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold hover:bg-zinc-500/10 transition-colors"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    name="me_line_d"
                    value={formData.me_line_d}
                    onChange={handleChange}
                    min="0"
                    className="w-16 py-1.5 text-center text-sm font-extrabold rounded-xl border bg-transparent outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, me_line_d: (parseInt(prev.me_line_d, 10) || 0) + 1 }))}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold hover:bg-zinc-500/10 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Line E Summary Banner */}
            <div className="p-5 rounded-2xl border flex items-center justify-between"
                 style={{ 
                   backgroundColor: `${activeHexColor}0e`,
                   borderColor: `${activeHexColor}35`
                 }}>
              <div className="flex items-center gap-3">
                <Sparkles size={20} style={{ color: activeHexColor }} />
                <div>
                  <h4 className="text-sm font-extrabold">Line E / Line 4: Total Allowances Claimed</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Sum of Lines A through D (automatically printed in Line 4 of Form W-4ME)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black" style={{ color: activeHexColor }}>
                  {totalAllowances}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                  Allowances
                </span>
              </div>
            </div>
          </div>

          {/* 4. ADDITIONAL WITHHOLDING (LINE 5) */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                   style={{ backgroundColor: activeHexColor }}>
                <DollarSign size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">4. Additional Withholding (Line 5)</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Optional extra state income tax withheld from each paycheck
                </p>
              </div>
            </div>

            {formData.exempt ? (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed max-w-lg ${
                isDarkMode ? 'bg-[#12141a] border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <span className="font-bold">Exemption Active:</span> You have claimed exemption from Maine withholding under Line 6. Additional withholding is not applicable while exempt from withholding.
              </div>
            ) : (
              <div className="max-w-md">
                <label className={labelClass}>Additional Amount Per Paycheck ($)</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    name="additional_withholding"
                    value={formData.additional_withholding}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputClass} pl-10 text-sm`}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">$</span>
                </div>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Leave as 0.00 if you do not want extra tax withheld.
                </p>
              </div>
            )}
          </div>

          {/* 5. EXEMPTION FROM WITHHOLDING (LINE 6) */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                   style={{ backgroundColor: activeHexColor }}>
                <Shield size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">5. Exemption from Withholding (Line 6)</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Only complete this section if you meet Maine statutory exemption requirements
                </p>
              </div>
            </div>

            {/* Master Exemption Toggle */}
            <div 
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                exempt: !prev.exempt, 
                exempt_type: !prev.exempt ? (prev.exempt_type || 'a') : '' 
              }))}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 mb-6 ${
                formData.exempt 
                  ? 'border-emerald-500/40 bg-emerald-500/10 shadow-sm' 
                  : isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                formData.exempt ? 'bg-emerald-600 border-transparent text-white' : 'border-zinc-400'
              }`}>
                {formData.exempt && <Check size={14} strokeWidth={3} />}
              </div>
              <div>
                <h4 className="text-sm font-extrabold">
                  I claim exemption from Maine state income tax withholding
                </h4>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  You must qualify under one of the specific state tax conditions below to claim exemption.
                </p>
              </div>
            </div>

            {/* Exemption Qualifying Options Grid */}
            {formData.exempt && (
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-emerald-500/30 animate-in fade-in slide-in-from-top-3 duration-200">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">
                  Select Qualifying Exemption Reason (Lines 6a – 6e):
                </p>
                {[
                  {
                    code: 'a',
                    label: '6a. Claimed "Exempt" on federal Form W-4',
                    desc: 'You had no tax liability last year and expect no federal income tax liability this year.'
                  },
                  {
                    code: 'b',
                    label: '6b. Completed federal Form W-4P (Periodic Retirement)',
                    desc: 'Checked the box on line 1 of federal Form W-4P regarding periodic pension/retirement payments.'
                  },
                  {
                    code: 'c',
                    label: '6c. Resident employee with no Maine tax liability in prior and current years',
                    desc: 'Maine resident who had zero tax liability in prior tax year and expects no Maine liability in current tax year.'
                  },
                  {
                    code: 'd',
                    label: '6d. Recipient of periodic retirement payments with no tax liability',
                    desc: 'Recipient of pension/annuity with no Maine tax liability in prior and current tax years.'
                  },
                  {
                    code: 'e',
                    label: '6e. Military spouse exemption under MSRRA',
                    desc: 'Spouse is a military service member stationed in Maine; qualifying under Military Spouse’s Residency Relief Act (requires documentation).'
                  }
                ].map(item => {
                  const isChecked = formData.exempt_type === item.code;
                  return (
                    <div
                      key={item.code}
                      onClick={() => setFormData(prev => ({ ...prev, exempt_type: item.code }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked 
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm' 
                          : isDarkMode ? 'border-zinc-800 hover:border-zinc-700 bg-[#12141a]' : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-emerald-600 border-transparent text-white' : 'border-zinc-400'
                      }`}>
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-inherit">{item.label}</h4>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                        {item.code === 'e' && isChecked && (
                          <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400 font-medium animate-in fade-in">
                            <span className="font-bold">Required Documentation:</span> Under the Military Spouse’s Residency Relief Act (MSRRA), you must provide supporting documentation to your employer (such as your valid military spouse ID and a copy of your spouse's official military orders stationed in Maine).
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. ATTESTATION & DIGITAL SIGNATURE */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                   style={{ backgroundColor: activeHexColor }}>
                <PenTool size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">6. Certification & Signature</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Sign under penalties of perjury to confirm your withholding allowances
                </p>
              </div>
            </div>

            {/* Official Perjury Statement */}
            <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed ${
              isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <p className="font-semibold mb-1">
                Under penalties of perjury:
              </p>
              <p>
                I certify that I am entitled to the number of withholding allowances or the exemption claimed on this certificate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-6">
              <div className="sm:col-span-5">
                <CustomDatePicker 
                  label="Date of Signing"
                  name="confirmation_date"
                  value={formData.confirmation_date}
                  onChange={handleChange}
                  isDarkMode={isDarkMode}
                  activeHexColor={activeHexColor}
                />
              </div>
            </div>

            {/* Digital Signature Canvas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Employee's Signature <span className="text-rose-500">*</span></label>
                <button 
                  type="button" 
                  onClick={clearSignature}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-rose-500/10"
                >
                  <Eraser size={14} /> Clear Signature
                </button>
              </div>

              <div 
                ref={containerRef}
                className={`relative w-full h-44 rounded-2xl border-2 border-dashed overflow-hidden cursor-crosshair transition-all ${
                  isDarkMode 
                    ? 'bg-[#12141a] border-zinc-700/80 hover:border-zinc-600' 
                    : 'bg-white border-slate-300 hover:border-slate-400'
                }`}
              >
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? '#60a5fa' : '#00198c'}
                  velocityFilterWeight={0.7}
                  canvasProps={{ className: 'sigCanvas w-full h-full' }}
                  onEnd={handleSignatureEnd}
                />
                {!formData.signature_image && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400 gap-2">
                    <PenTool size={22} className="opacity-40" />
                    <span className="text-xs font-semibold">Draw your official signature here</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 7. EMPLOYER INFORMATION (LINES 7 TO 10 - AUTO-POPULATED) */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                   style={{ backgroundColor: activeHexColor }}>
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">7. Employer / Payer Information</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Lines 7 to 10: Auto-populated corporate identification for Maine Revenue Services
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              {/* Line 7: Employer Name & Address */}
              <div className="sm:col-span-8">
                <label className={labelClass}>
                  Line 7: Employer/Payer Name & Address
                </label>
                <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Building2 size={16} className="mt-0.5 text-zinc-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[13px]">{formData.employer_name || 'Tech Innovators Inc.'}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{formData.employer_address || '100 Commercial St, Portland, ME 04101'}</div>
                  </div>
                </div>
              </div>

              {/* Line 8: Employer Identification Number (EIN) */}
              <div className="sm:col-span-4">
                <label className={labelClass}>
                  Line 8: Employer EIN
                </label>
                <div className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Shield size={16} className="text-zinc-400 shrink-0" />
                  <div>
                    <div className="font-bold font-mono tracking-wider text-[13px]">{formData.employer_ein || '12-3456789'}</div>
                    <div className="text-[10px] opacity-70">Maine Withholding Tax ID</div>
                  </div>
                </div>
              </div>

              {/* Line 9: Contact Person */}
              <div className="sm:col-span-6">
                <label className={labelClass}>
                  Line 9: Employer/Payer Contact Person
                </label>
                <div className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <User size={16} className="text-zinc-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[13px]">{formData.contact_person || 'HR Director'}</div>
                    <div className="text-[10px] opacity-70">Authorized Payroll Administrator</div>
                  </div>
                </div>
              </div>

              {/* Line 10: Contact Phone Number */}
              <div className="sm:col-span-6">
                <label className={labelClass}>
                  Line 10: Contact Person's Phone Number
                </label>
                <div className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Phone size={16} className="text-zinc-400 shrink-0" />
                  <div>
                    <div className="font-bold font-mono tracking-wider text-[13px]">{formData.contact_phone || '(207) 555-0199'}</div>
                    <div className="text-[10px] opacity-70">10-Digit Direct Contact</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`px-10 py-4 rounded-2xl font-bold text-sm text-white shadow-xl flex items-center gap-3 transition-all active:scale-95 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl hover:-translate-y-0.5'
              }`}
              style={{ backgroundColor: activeHexColor }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Form W-4ME PDF...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Confirm & Generate Form W-4ME
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default MaineTaxForm;