import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Sparkles, Building2, MapPin, Check, HeartHandshake,
  ArrowRight, Briefcase, Eye, EyeOff, RotateCcw, CheckCircle, HelpCircle
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Maryland Form W-4</h3>
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

// --- MARYLAND COUNTIES LIST (23 Counties + Baltimore City + Out of State) ---
const MARYLAND_COUNTIES = [
  "Allegany",
  "Anne Arundel",
  "Baltimore City",
  "Baltimore County",
  "Calvert",
  "Caroline",
  "Carroll",
  "Cecil",
  "Charles",
  "Dorchester",
  "Frederick",
  "Garrett",
  "Harford",
  "Howard",
  "Kent",
  "Montgomery",
  "Prince George's",
  "Queen Anne's",
  "St. Mary's",
  "Somerset",
  "Talbot",
  "Washington",
  "Wicomico",
  "Worcester",
  "Nonresident / Out of State"
];

// --- 4. MAIN MARYLAND FORM COMPONENT ---
const MarylandTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });
  const [showSSN, setShowSSN] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState('all'); // 'all' | '1' | '2' | '3' | '4' | '5'

  // 1. FORM DATA STATE INITIALIZED LAZILY
  const [formData, setFormData] = useState(() => {
    const rawSSN = (initialData?.ssn || '').replace(/\D/g, '').slice(0, 9);
    const formattedSSN = rawSSN.length === 9 
      ? `${rawSSN.slice(0, 3)}-${rawSSN.slice(3, 5)}-${rawSSN.slice(5)}` 
      : (initialData?.ssn || '');

    return {
      // Step 1: Personal Info
      first_name: initialData?.first_name || '',
      middle_initial: initialData?.middle_initial || initialData?.middle_name || '',
      last_name: initialData?.last_name || '',
      ssn: formattedSSN,
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || 'MD',
      zipcode: (initialData?.zipcode || '').toString().slice(0, 5),
      county: initialData?.county || '',
      email: initialData?.email || '',

      // Payroll System & Agency
      payroll_system: initialData?.payroll_system || 'RG',
      agency_number: (initialData?.agency_number || '').toString().slice(0, 5),
      agency_name: initialData?.agency_name || '',

      // Step 1(c): Filing Status ("1", "2", "3")
      filing_status: String(initialData?.filing_status || '1'),

      // Step 2: Multiple Jobs
      multiple_jobs: Boolean(initialData?.multiple_jobs ?? false),

      // Step 3: Dependents
      kids_under_17: Number(initialData?.kids_under_17 ?? 0),
      other_dependents: Number(initialData?.other_dependents ?? 0),
      other_credits: initialData?.other_credits || '',

      // Step 4: Other Adjustments
      step4_other_income: initialData?.step4_other_income || '',
      step4_deductions: initialData?.step4_deductions || '',
      step4_extra_withholding: initialData?.step4_extra_withholding || initialData?.additional_withholding || '',

      // Step 5: Signature
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
        first_name: initialData.first_name || prev.first_name,
        middle_initial: initialData.middle_initial || initialData.middle_name || prev.middle_initial,
        last_name: initialData.last_name || prev.last_name,
        ssn: formattedSSN || prev.ssn,
        state: 'MD',
        zipcode: (initialData.zipcode || prev.zipcode || '').toString().slice(0, 5),
        county: initialData.county || prev.county,
        agency_number: (initialData.agency_number || prev.agency_number || '').toString().slice(0, 5),
        agency_name: initialData.agency_name || prev.agency_name,
        payroll_system: initialData.payroll_system || prev.payroll_system || 'RG',
        filing_status: String(initialData.filing_status || prev.filing_status || '1'),
        multiple_jobs: Boolean(initialData.multiple_jobs ?? prev.multiple_jobs),
        kids_under_17: initialData.kids_under_17 !== undefined ? Number(initialData.kids_under_17) : prev.kids_under_17,
        other_dependents: initialData.other_dependents !== undefined ? Number(initialData.other_dependents) : prev.other_dependents,
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

  // Step 3 Live Total Dependents Credit Calculation
  const kidsCredit = Math.max(0, parseInt(formData.kids_under_17 || 0, 10)) * 2000;
  const othersCredit = Math.max(0, parseInt(formData.other_dependents || 0, 10)) * 500;
  const extraCredits = Math.max(0, parseFloat(formData.other_credits || 0) || 0);
  const totalStep3Credits = kidsCredit + othersCredit + extraCredits;

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
    if (name === 'agency_number') {
      setFormData(prev => ({ ...prev, [name]: value.slice(0, 5) }));
      return;
    }
    if (name === 'middle_initial') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 2) }));
      return;
    }
    if (name === 'kids_under_17' || name === 'other_dependents') {
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

  // Quick Demo Autofill Helper
  const handleQuickDemoFill = () => {
    setFormData(prev => ({
      ...prev,
      first_name: 'Marcus',
      middle_initial: 'E',
      last_name: 'Vance',
      ssn: '456-78-9012',
      address: '2105 Charles Street, Apt 4B',
      city: 'Baltimore',
      state: 'MD',
      zipcode: '21201',
      county: 'Baltimore City',
      payroll_system: 'RG',
      agency_number: '36010',
      agency_name: 'Department of Transportation',
      filing_status: '1',
      multiple_jobs: false,
      kids_under_17: 2,
      other_dependents: 1,
      other_credits: '250',
      step4_other_income: '500',
      step4_deductions: '1000',
      step4_extra_withholding: '50',
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
        message: "Please sign in the digital signature box before submitting Maryland Form W-4."
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

    if (!formData.county) {
      setErrorState({
        isOpen: true,
        title: "County Required",
        message: "Please select your Maryland County of Residence (required for state & county withholding calculations)."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanNumber = (val) => (val === '' || val === null || isNaN(val)) ? 0 : val;
      const payload = {
        ...formData,
        state: 'MD',
        ssn: cleanSSN,
        middle_initial: formData.middle_initial,
        agency_number: formData.agency_number.slice(0, 5),
        payroll_system: formData.payroll_system.slice(0, 5),
        kids_under_17: cleanNumber(formData.kids_under_17),
        other_dependents: cleanNumber(formData.other_dependents),
        other_credits: cleanNumber(formData.other_credits),
        step3_total: totalStep3Credits,
        step4_other_income: cleanNumber(formData.step4_other_income),
        step4_deductions: cleanNumber(formData.step4_deductions),
        step4_extra_withholding: cleanNumber(formData.step4_extra_withholding),
        signature_image: sig,
        signature: sig
      };

      await onSubmit(payload);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Form W-4 (MD) Submission Error:", error);
      setIsSubmitting(false);
      setErrorState({
        isOpen: true,
        title: "Submission Error",
        message: error.response?.data?.error || error.message || "Failed to submit Maryland Form W-4. Please try again."
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

  // Form Section Visibility
  const showSection = (stepNum) => activeStepTab === 'all' || activeStepTab === stepNum;

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
        <div className="mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-500/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border"
                 style={{ 
                   backgroundColor: `${activeHexColor}12`, 
                   borderColor: `${activeHexColor}30`,
                   color: activeHexColor 
                 }}>
              <MapPin size={12} />
              Central Payroll Bureau • State of Maryland
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Maryland Employee Withholding
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Form W-4 / MW507 • Employee's Withholding Exemption Certificate
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDarkMode 
                  ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Quickly fill sample Maryland candidate data"
            >
              <Sparkles size={13} style={{ color: activeHexColor }} />
              Auto-Fill Sample
            </button>
            <span className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${
              isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              Form W-4 (2024–2026)
            </span>
          </div>
        </div>

        {/* STEPPER NAVIGATION BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {[
            { id: 'all', label: 'All Sections' },
            { id: '1', label: '1. Personal & Agency' },
            { id: '2', label: '2. Multiple Jobs' },
            { id: '3', label: '3. Dependents' },
            { id: '4', label: '4. Adjustments' },
            { id: '5', label: '5. Sign & Date' }
          ].map(tab => {
            const isActive = activeStepTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStepTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive 
                    ? 'shadow-sm text-white border-transparent' 
                    : isDarkMode 
                      ? 'bg-[#12141a] border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                style={isActive ? { backgroundColor: activeHexColor } : {}}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* STEP 1: PERSONAL INFORMATION & PAYROLL SYSTEM */}
          {showSection('1') && (
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                     style={{ backgroundColor: activeHexColor }}>
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Step 1 — Personal Information & Payroll System</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Employee legal identification, Maryland residence county, and state payroll classification
                  </p>
                </div>
              </div>

              {/* Payroll System Checkbox Selection */}
              <div className="mb-6">
                <label className={labelClass}>Payroll System (Check One) <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'RG', label: 'RG — Regular State Payroll', desc: 'Standard executive, judicial & state agency employees' },
                    { id: 'CT', label: 'CT — Comptroller of Maryland', desc: 'Comptroller agency employees' },
                    { id: 'UM', label: 'UM — University of Maryland', desc: 'University System of Maryland institutions' }
                  ].map(item => {
                    const isSelected = formData.payroll_system === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setFormData(prev => ({ ...prev, payroll_system: item.id }))}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected 
                            ? 'border-transparent shadow-sm ring-2' 
                            : isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
                        }`}
                        style={isSelected ? { 
                          backgroundColor: `${activeHexColor}12`,
                          borderColor: activeHexColor,
                          boxShadow: `0 4px 14px ${activeHexColor}18`
                        } : {}}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected ? 'border-transparent text-white' : 'border-zinc-400'
                        }`}
                        style={isSelected ? { backgroundColor: activeHexColor } : {}}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-inherit">{item.label}</h4>
                          <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agency Details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mb-6">
                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-inherit">
                      Agency Number (Max 5 Digits)
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {formData.agency_number.length}/5
                    </span>
                  </div>
                  <input 
                    type="text" 
                    name="agency_number" 
                    value={formData.agency_number} 
                    onChange={handleChange} 
                    placeholder="e.g. 36010"
                    maxLength="5"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className={labelClass}>Name of Employing Agency</label>
                  <input 
                    type="text" 
                    name="agency_name" 
                    value={formData.agency_name} 
                    onChange={handleChange} 
                    placeholder="e.g. Department of Transportation / Univ. of Maryland"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                <div className="sm:col-span-5">
                  <label className={labelClass}>First Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleChange} 
                    placeholder="Marcus"
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
                    placeholder="E"
                    maxLength="2"
                    className={`${inputClass} text-center uppercase`}
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className={labelClass}>Last Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="last_name" 
                    value={formData.last_name} 
                    onChange={handleChange} 
                    placeholder="Vance"
                    className={inputClass}
                    required 
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className={labelClass}>Social Security Number <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input 
                      type={showSSN ? "text" : "password"} 
                      name="ssn" 
                      value={formData.ssn} 
                      onChange={handleChange} 
                      placeholder="XXX-XX-XXXX"
                      maxLength="11"
                      className={`${inputClass} pl-10 pr-10 tracking-wider font-mono`}
                      required 
                    />
                    <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <button
                      type="button"
                      onClick={() => setShowSSN(!showSSN)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showSSN ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label className={labelClass}>
                    Maryland County of Residence <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      name="county" 
                      value={formData.county} 
                      onChange={handleChange} 
                      className={`${inputClass} appearance-none pr-10 cursor-pointer font-medium`}
                      required
                    >
                      <option value="">Select Maryland County or City</option>
                      {MARYLAND_COUNTIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                  <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Required to assess local Maryland county income withholding tax.
                  </p>
                </div>

                <div className="sm:col-span-12">
                  <label className={labelClass}>Home Address (Street, Apt/Suite) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder="e.g. 2105 Charles Street, Apt 4B"
                    className={inputClass}
                    required 
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className={labelClass}>City <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    placeholder="Baltimore"
                    className={inputClass}
                    required 
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className={labelClass}>State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value="MD" 
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
                    placeholder="21201"
                    maxLength="5"
                    className={inputClass}
                    required 
                  />
                </div>
              </div>

              {/* Step 1(c): Marital Status */}
              <div className="mt-8 pt-6 border-t border-zinc-500/10">
                <label className={labelClass}>Step 1(c) — Marital Status Rate <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: '1', title: 'Single or Married filing separately', desc: 'Single individuals, or married taxpayers electing separate state withholding' },
                    { id: '2', title: 'Married filing jointly', desc: 'Or Qualifying surviving spouse with dependents' },
                    { id: '3', title: 'Head of household', desc: 'Unmarried and paying more than half the cost of maintaining a home' }
                  ].map(opt => {
                    const isSelected = formData.filing_status === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setFormData(prev => ({ ...prev, filing_status: opt.id }))}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
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
              </div>
            </div>
          )}

          {/* STEP 2: MULTIPLE JOBS OR SPOUSE WORKS */}
          {showSection('2') && (
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                     style={{ backgroundColor: activeHexColor }}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Step 2 — Multiple Jobs or Spouse Works</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Complete if you hold more than one job at a time or are married filing jointly and spouse works
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setFormData(prev => ({ ...prev, multiple_jobs: !prev.multiple_jobs }))}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                  formData.multiple_jobs 
                    ? 'border-transparent shadow-sm ring-2' 
                    : isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
                }`}
                style={formData.multiple_jobs ? { 
                  backgroundColor: `${activeHexColor}12`,
                  borderColor: activeHexColor 
                } : {}}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                  formData.multiple_jobs ? 'border-transparent text-white' : 'border-zinc-400'
                }`}
                style={formData.multiple_jobs ? { backgroundColor: activeHexColor } : {}}>
                  {formData.multiple_jobs && <Check size={14} strokeWidth={3} />}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold">
                    Step 2(c): Check here if there are only two jobs total
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Do the same on Form W-4 for the other job. This option is generally accurate if pay at the lower-paying job is more than half of the higher-paying job.
                  </p>
                </div>
              </div>

              <div className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${
                isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <Info size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed">
                  <strong>Multiple Jobs Tip:</strong> Complete Steps 3 through 4(b) on Form W-4 for only <strong>ONE</strong> of these jobs (preferably the highest paying). Leave those steps blank on forms for other jobs for proper withholding.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: CLAIM DEPENDENTS & CREDITS */}
          {showSection('3') && (
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                     style={{ backgroundColor: activeHexColor }}>
                  <Calculator size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Step 3 — Claim Dependents & Other Credits</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Applies if total annual income is $200,000 or less ($400,000 or less if married filing jointly)
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {/* Qualifying Children Under 17 */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <div>
                    <h4 className="text-xs font-bold text-inherit">
                      Qualifying Children Under Age 17 ($2,000 Each)
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Multiply number of eligible qualifying children by $2,000
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, kids_under_17: Math.max(0, (parseInt(prev.kids_under_17, 10) || 0) - 1) }))}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold hover:bg-zinc-500/10 transition-colors"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        name="kids_under_17" 
                        value={formData.kids_under_17} 
                        onChange={handleChange} 
                        min="0"
                        className="w-16 py-1.5 text-center text-sm font-extrabold rounded-xl border bg-transparent outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, kids_under_17: (parseInt(prev.kids_under_17, 10) || 0) + 1 }))}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold hover:bg-zinc-500/10 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-500/10 min-w-[70px] text-right font-mono">
                      ${kidsCredit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Other Dependents */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <div>
                    <h4 className="text-xs font-bold text-inherit">
                      Other Dependents ($500 Each)
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Multiply number of other dependents by $500
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, other_dependents: Math.max(0, (parseInt(prev.other_dependents, 10) || 0) - 1) }))}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold hover:bg-zinc-500/10 transition-colors"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        name="other_dependents" 
                        value={formData.other_dependents} 
                        onChange={handleChange} 
                        min="0"
                        className="w-16 py-1.5 text-center text-sm font-extrabold rounded-xl border bg-transparent outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, other_dependents: (parseInt(prev.other_dependents, 10) || 0) + 1 }))}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold hover:bg-zinc-500/10 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-500/10 min-w-[70px] text-right font-mono">
                      ${othersCredit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Other Tax Credits */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDarkMode ? 'border-zinc-800 bg-[#12141a]' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  <div>
                    <h4 className="text-xs font-bold text-inherit">
                      Other Tax Credits ($)
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Education credits, child care, or Maryland state personal credits
                    </p>
                  </div>
                  <div className="relative max-w-xs w-full sm:w-auto">
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      name="other_credits" 
                      value={formData.other_credits} 
                      onChange={handleChange} 
                      placeholder="0.00"
                      className={`${inputClass} pl-8 text-right font-mono`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                  </div>
                </div>
              </div>

              {/* Step 3 Total Badge */}
              <div className="p-5 rounded-2xl border flex items-center justify-between"
                   style={{ 
                     backgroundColor: `${activeHexColor}0e`,
                     borderColor: `${activeHexColor}35`
                   }}>
                <div className="flex items-center gap-3">
                  <Sparkles size={20} style={{ color: activeHexColor }} />
                  <div>
                    <h4 className="text-sm font-extrabold">Step 3 Total: Total Dependent & Tax Credits</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Directly printed on Line 3 of Maryland Form W-4
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-mono" style={{ color: activeHexColor }}>
                    ${totalStep3Credits.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: OTHER ADJUSTMENTS */}
          {showSection('4') && (
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                     style={{ backgroundColor: activeHexColor }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Step 4 — Other Adjustments (Optional)</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Optional lines for other taxable income, deductions, or extra payroll withholding
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>4(a) Other Income ($)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      name="step4_other_income" 
                      value={formData.step4_other_income} 
                      onChange={handleChange} 
                      placeholder="0.00"
                      className={`${inputClass} pl-8 font-mono`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                  </div>
                  <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Non-job income (interest, dividends, retirement).
                  </p>
                </div>

                <div>
                  <label className={labelClass}>4(b) Deductions ($)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      name="step4_deductions" 
                      value={formData.step4_deductions} 
                      onChange={handleChange} 
                      placeholder="0.00"
                      className={`${inputClass} pl-8 font-mono`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                  </div>
                  <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Deductions exceeding standard deduction.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>4(c) Extra Withholding ($)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      name="step4_extra_withholding" 
                      value={formData.step4_extra_withholding} 
                      onChange={handleChange} 
                      placeholder="0.00"
                      className={`${inputClass} pl-8 font-mono`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                  </div>
                  <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Additional tax withheld from each paycheck.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ATTESTATION & DIGITAL SIGNATURE */}
          {showSection('5') && (
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-500/10">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                     style={{ backgroundColor: activeHexColor }}>
                  <PenTool size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Step 5 — Sign & Date</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Under penalties of perjury, declare that this certificate is true, correct, and complete
                  </p>
                </div>
              </div>

              {/* Perjury Statement */}
              <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed ${
                isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <p className="font-semibold mb-1">
                  Under penalties of perjury:
                </p>
                <p>
                  I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete. (This certificate is not valid unless you sign it.)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-6">
                <div className="sm:col-span-5">
                  <CustomDatePicker 
                    label="Confirmation Date"
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
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-500/10">
            <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Selected County: <strong className="text-current">{formData.county || 'None'}</strong> • 
              Payroll: <strong className="text-current">{formData.payroll_system}</strong> • 
              Total Credits: <strong className="text-current font-mono">${totalStep3Credits.toLocaleString()}</strong>
            </div>

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
                  Generating Maryland Form W-4 PDF...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Confirm & Generate Maryland Form W-4
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

export default MarylandTaxForm;