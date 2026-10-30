import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Building2, MapPin, Check, HeartHandshake,
  HelpCircle, ArrowRight, CreditCard, Flag, Award, RefreshCw, ChevronUp
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form MW-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Montana Employee's Withholding & Exemption Certificate...
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
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
          isDarkMode 
            ? 'bg-[#181a20] border-zinc-700/80 hover:border-zinc-600 text-zinc-100' 
            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar size={15} style={{ color: activeHexColor }} />
          <span className="font-semibold">{value || "Select Date"}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-400' : 'text-zinc-500'}`} />
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-1.5 p-3 rounded-2xl shadow-xl border w-64 animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-extrabold tracking-wide">
              {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <div className="flex gap-1">
              <button 
                type="button" 
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                type="button" 
                onClick={() => changeMonth(1)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-zinc-400">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDayOfMonth).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="h-6" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = value === dateStr;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  style={isSelected ? { backgroundColor: activeHexColor, color: '#fff' } : {}}
                  className={`h-6 text-[11px] font-semibold rounded-lg flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'shadow-sm font-bold' 
                      : isDarkMode 
                        ? 'hover:bg-zinc-800 text-zinc-300' 
                        : 'hover:bg-slate-100 text-slate-700'
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

// --- MAIN MONTANA FORM COMPONENT ---
const MontanaTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    // Employee Personal Info
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'MT',
    zipcode: '',

    // Line 1: Filing Status ('1'=Single/MFS, '2'=Married Joint, '3'=Head of Household)
    filing_status_mt: '1',

    // Line 2: Both Spouses Working Checkbox
    both_working: false,

    // Line 3: Extra Withholding Amount ($)
    extra_withholding: '',

    // Line 4: Specified Amount ($)
    specified_withholding: '',

    // Line 5: Exemption from Withholding
    exempt: false,
    tax_year: new Date().getFullYear().toString(),
    exempt_type: '', // 'a'=Tribal, 'b'=Title 10 Reserve, 'c'=North Dakota, 'd'=Military Spouse MSRRA

    // Page 2: Multiple Jobs Worksheet
    use_worksheet: false,
    worksheet_mode: '2jobs', // '2jobs' | '3jobs'
    wage_job1: 75000,
    wage_job2: 45000,
    wage_job3: 0,
    worksheet_line1: '590.00',
    worksheet_line2a: '590.00',
    worksheet_line2b: '470.00',
    worksheet_line2c: '1060.00',
    pay_periods: 26,
    worksheet_line4: '22.69',

    // Signature & Date
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null,

    // Employer Information
    employer_name: 'Big Sky Tech Innovations Inc.',
    employer_address: '100 Frontier Way',
    employer_city: 'Helena',
    employer_state: 'MT',
    employer_zipcode: '59601',
    employer_ein: '12-3456789',
    employer_state_tax_id: '12345678'
  });

  // Load Initial Data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || '',
        middle_initial: initialData.middle_initial || initialData.middle_name || initialData.initial || '',
        last_name: initialData.last_name || '',
        ssn: initialData.ssn || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: 'MT',
        zipcode: initialData.zipcode ? String(initialData.zipcode).slice(0, 5) : '',
        filing_status_mt: String(initialData.filing_status_mt || initialData.filing_status || '1'),
        both_working: Boolean(initialData.both_working),
        extra_withholding: initialData.extra_withholding ? String(initialData.extra_withholding).replace('$', '') : '',
        specified_withholding: initialData.specified_withholding ? String(initialData.specified_withholding).replace('$', '') : '',
        exempt: Boolean(initialData.exempt),
        tax_year: initialData.tax_year ? String(initialData.tax_year) : new Date().getFullYear().toString(),
        exempt_type: initialData.exempt_type || initialData.exempt_reason || '',
        employer_name: initialData.employer_name || initialData.client_name || prev.employer_name,
        employer_ein: initialData.employer_ein || initialData.fein || prev.employer_ein,
        employer_state_tax_id: initialData.employer_state_tax_id || initialData.mt_tax_id || prev.employer_state_tax_id,
        employer_address: initialData.employer_address || initialData.client_address || prev.employer_address,
        employer_city: initialData.employer_city || prev.employer_city,
        employer_state: initialData.employer_state || 'MT',
        employer_zipcode: initialData.employer_zipcode || prev.employer_zipcode
      }));
    }
  }, [initialData]);

  // Autofill Sample Benchmark Helper
  const handleAutofillSample = () => {
    setFormData(prev => ({
      ...prev,
      first_name: 'Vishwa',
      middle_initial: 'K',
      last_name: 'Visu',
      ssn: '123-45-6789',
      address: '123 Mountain View Trail',
      city: 'Helena',
      state: 'MT',
      zipcode: '59601',
      filing_status_mt: '2',
      both_working: true,
      extra_withholding: '45.00',
      specified_withholding: '0.00',
      use_worksheet: true,
      wage_job1: 75000,
      wage_job2: 45000,
      worksheet_line1: '590.00',
      pay_periods: 26,
      worksheet_line4: '22.69',
      exempt: false,
      tax_year: '2026',
      employer_name: 'Big Sky Tech Innovations Inc.',
      employer_address: '100 Frontier Way',
      employer_city: 'Helena',
      employer_state: 'MT',
      employer_zipcode: '59601',
      employer_ein: '12-3456789',
      employer_state_tax_id: '12345678'
    }));
  };

  // Re-calculate worksheet values
  useEffect(() => {
    if (!formData.use_worksheet) return;

    const p = parseInt(formData.pay_periods) || 26;
    if (formData.worksheet_mode === '2jobs') {
      const w1 = parseFloat(formData.wage_job1) || 0;
      const w2 = parseFloat(formData.wage_job2) || 0;
      let annualAmt = 590;
      if (w1 >= 100000 && w2 >= 100000) annualAmt = 940;
      else if (w1 >= 60000 && w2 >= 40000) annualAmt = 590;
      else if (w1 >= 40000 && w2 >= 20000) annualAmt = 470;
      else annualAmt = 320;

      const perPeriod = (annualAmt / p).toFixed(2);
      setFormData(prev => ({
        ...prev,
        worksheet_line1: annualAmt.toFixed(2),
        worksheet_line4: perPeriod
      }));
    } else {
      const l2a = parseFloat(formData.worksheet_line2a) || 0;
      const l2b = parseFloat(formData.worksheet_line2b) || 0;
      const l2c = l2a + l2b;
      const perPeriod = (l2c / p).toFixed(2);
      setFormData(prev => ({
        ...prev,
        worksheet_line2c: l2c.toFixed(2),
        worksheet_line4: perPeriod
      }));
    }
  }, [
    formData.use_worksheet,
    formData.worksheet_mode,
    formData.wage_job1,
    formData.wage_job2,
    formData.worksheet_line2a,
    formData.worksheet_line2b,
    formData.pay_periods
  ]);

  // Apply Worksheet to Line 3 Withholding
  const handleApplyWorksheetToLine3 = () => {
    const val = parseFloat(formData.worksheet_line4) || 0;
    setFormData(prev => ({
      ...prev,
      extra_withholding: val.toFixed(2)
    }));
  };

  // Canvas Resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
        canvas.width = rect.width;
        canvas.height = rect.height;
        if (savedData) sigCanvasRef.current.fromDataURL(savedData);
      }
    };
    setTimeout(resizeCanvas, 150);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, [name]: value.slice(0, 5) }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: dataUrl }));
    }
  };

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setFormData(prev => ({ ...prev, signature_image: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let sig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!sig) {
      setErrorModal({
        isOpen: true,
        title: "Signature Required",
        message: "Please provide your digital signature in the signature box before submitting Form MW-4."
      });
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.ssn) {
      setErrorModal({
        isOpen: true,
        title: "Missing Information",
        message: "Please complete all required fields including Full Name and Social Security Number."
      });
      return;
    }

    if (formData.exempt && !formData.exempt_type) {
      setErrorModal({
        isOpen: true,
        title: "Exemption Reason Required",
        message: "You checked the box to claim an exemption. Please select one of the statutory exemption reasons (a, b, c, or d)."
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        state: 'MT',
        signature_image: sig,
        signature: sig
      };
      await onSubmit(payload);
    } catch (err) {
      console.error("Submission failed:", err);
      const msg = err.response?.data?.error || err.message || "Failed to generate Montana Form MW-4.";
      setErrorModal({ isOpen: true, title: "Submission Failed", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Card & Header Styles
  const cardClass = `rounded-3xl border p-5 sm:p-6 transition-all duration-200 shadow-sm ${
    isDarkMode ? 'bg-[#14161d] border-zinc-800/80 hover:border-zinc-700/80' : 'bg-white border-slate-200/90 hover:border-slate-300'
  }`;
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
    isDarkMode 
      ? 'bg-[#181a20] border-zinc-700 text-zinc-100 focus:border-blue-500 placeholder-zinc-500' 
      : 'bg-white border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder-slate-400'
  }`;
  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDarkMode ? 'text-zinc-400' : 'text-slate-600'
  }`;

  return (
    <>
      {isLoading && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeHexColor} />}
      <ErrorModal 
        isOpen={errorModal.isOpen} 
        title={errorModal.title} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} 
        isDarkMode={isDarkMode} 
      />

      <div className={`max-w-4xl mx-auto space-y-6 ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
        
        {/* HEADER BAR */}
        <div className={`rounded-3xl border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isDarkMode ? 'bg-[#14161d] border-zinc-800' : 'bg-gradient-to-r from-blue-50/60 via-white to-sky-50/40 border-blue-100'
        }`}>
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-md"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor, border: `1px solid ${activeHexColor}35` }}
            >
              MT
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black tracking-tight">Form MW-4</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  Rev. 12/2024 V5
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Zero Tax Gap Compliant
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Montana Employee's Withholding and Exemption Certificate • Department of Revenue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={handleAutofillSample}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                isDarkMode 
                  ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Autofill Sample
            </button>
          </div>
        </div>

        {/* STATUS SUMMARY PILL BAR */}
        <div className={`flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-semibold ${
          isDarkMode ? 'bg-[#181a20]/60 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200/80 text-slate-700'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold uppercase text-[10px]">Status:</span>
            <span className="font-extrabold" style={{ color: activeHexColor }}>
              {formData.filing_status_mt === '1' ? 'Single / MFS' : formData.filing_status_mt === '2' ? 'Married Filing Jointly' : 'Head of Household'}
            </span>
          </div>
          <span className="text-zinc-400">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold uppercase text-[10px]">Both Working:</span>
            <span className={formData.both_working ? 'text-amber-500 font-bold' : 'text-zinc-400 font-medium'}>
              {formData.both_working ? 'Yes (Line 2)' : 'No'}
            </span>
          </div>
          <span className="text-zinc-400">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold uppercase text-[10px]">Extra Withholding:</span>
            <span className="font-bold">
              {formData.extra_withholding ? `$${formData.extra_withholding}` : '$0.00'}
            </span>
          </div>
          <span className="text-zinc-400">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold uppercase text-[10px]">Exempt:</span>
            <span className={formData.exempt ? 'text-emerald-500 font-bold uppercase' : 'text-zinc-400 font-medium'}>
              {formData.exempt ? `Claimed (${formData.exempt_type ? `Reason ${formData.exempt_type.toUpperCase()}` : 'Pending Reason'})` : 'No'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. EMPLOYEE PERSONAL INFORMATION */}
          <div className={cardClass}>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <User size={18} style={{ color: activeHexColor }} />
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Employee Personal Information</h2>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Must match your federal tax return and Social Security card.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <label className={labelClass}>First Name & Middle Initial *</label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="First Name"
                    className={`${inputClass} col-span-3`}
                  />
                  <input
                    type="text"
                    name="middle_initial"
                    maxLength={1}
                    value={formData.middle_initial}
                    onChange={handleChange}
                    placeholder="M.I."
                    className={`${inputClass} text-center uppercase col-span-1`}
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className={labelClass}>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Last Name"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-3">
                <label className={labelClass}>Social Security Number *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="ssn"
                    value={formData.ssn}
                    onChange={handleChange}
                    required
                    placeholder="•••-••-••••"
                    className={`${inputClass} pl-8 font-mono`}
                  />
                  <Shield size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className={labelClass}>Physical Home Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Street Address, Apt / Suite"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-3">
                <label className={labelClass}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="City"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-1">
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  name="state"
                  value="MT"
                  readOnly
                  className={`${inputClass} text-center font-bold bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>ZIP Code *</label>
                <input
                  type="text"
                  name="zipcode"
                  maxLength={5}
                  value={formData.zipcode}
                  onChange={handleChange}
                  required
                  placeholder="59000"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* 2. FILING STATUS & BOTH SPOUSES WORKING */}
          <div className={cardClass}>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <FileText size={18} style={{ color: activeHexColor }} />
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Line 1: Federal Filing Status</h2>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Choose one status for your Montana income tax withholding calculations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
              {[
                { 
                  code: '1', 
                  title: '1. Single / Married Filing Separately', 
                  desc: 'If you have multiple jobs, complete the Multiple Jobs Worksheet on Page 2.' 
                },
                { 
                  code: '2', 
                  title: '2. Married Filing Jointly', 
                  desc: 'Or Qualifying Surviving Spouse. If both work, check Line 2.' 
                },
                { 
                  code: '3', 
                  title: '3. Head of Household', 
                  desc: 'Unmarried individual paying more than half the cost of maintaining a home for a qualifying person.' 
                }
              ].map(st => {
                const isSelected = formData.filing_status_mt === st.code;
                return (
                  <div
                    key={st.code}
                    onClick={() => setFormData(prev => ({ ...prev, filing_status_mt: st.code }))}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20' 
                        : isDarkMode 
                          ? 'border-zinc-800 bg-[#181a20]/60 hover:border-zinc-700' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black tracking-tight">{st.title}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-zinc-400'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Line 2: Both Spouses Working Checkbox */}
            <div className={`p-4 rounded-2xl border transition-all ${
              formData.both_working 
                ? 'bg-amber-500/10 border-amber-500/30' 
                : isDarkMode ? 'bg-[#181a20]/40 border-zinc-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="both_working"
                  checked={formData.both_working}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">
                      Line 2: Married Filing Jointly with Both Spouses Working
                    </span>
                    {formData.both_working && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-600">
                        Line 2 Checked
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-0.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    If you are married and you and your spouse are both working and earn similar incomes, mark this box. If you and your spouse have multiple jobs, you may also complete the Multiple Jobs Worksheet on page 2.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. WITHHOLDING ADJUSTMENTS (LINES 3 & 4) */}
          <div className={cardClass}>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <Calculator size={18} style={{ color: activeHexColor }} />
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Withholding Adjustments (Lines 3 & 4)</h2>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Customize additional or specified withholding per pay period.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Line 3: Additional Amount to Withhold ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="extra_withholding"
                    value={formData.extra_withholding}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputClass} pl-7`}
                  />
                </div>
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Enter extra withholding per pay period (includes amount from Multiple Jobs Worksheet Line 4).
                </p>
              </div>

              <div>
                <label className={labelClass}>Line 4: Specified Withholding Amount ($) (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="specified_withholding"
                    value={formData.specified_withholding}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputClass} pl-7`}
                  />
                </div>
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  If entered, your employer will withhold this EXACT amount each pay period (replaces formula).
                </p>
              </div>
            </div>
          </div>

          {/* 4. MULTIPLE JOBS WORKSHEET (PAGE 1 / PAGE 2) */}
          <div className={cardClass}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Building2 size={18} style={{ color: activeHexColor }} />
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight">Multiple Jobs Worksheet (Form MW-4 Page 2)</h2>
                  <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Calculate exact additional withholding when you hold multiple jobs or both spouses work.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, use_worksheet: !prev.use_worksheet }))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  formData.use_worksheet
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : isDarkMode 
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {formData.use_worksheet ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {formData.use_worksheet ? 'Worksheet Enabled' : 'Enable Worksheet'}
              </button>
            </div>

            {formData.use_worksheet && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Worksheet Mode Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Calculation Method:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, worksheet_mode: '2jobs' }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        formData.worksheet_mode === '2jobs'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Line 1: Two Jobs
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, worksheet_mode: '3jobs' }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        formData.worksheet_mode === '3jobs'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Line 2: Three Jobs (2a, 2b, 2c)
                    </button>
                  </div>
                </div>

                {formData.worksheet_mode === '2jobs' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <label className={labelClass}>Higher Paying Job Wages ($)</label>
                      <input
                        type="number"
                        name="wage_job1"
                        value={formData.wage_job1}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Lower Paying Job Wages ($)</label>
                      <input
                        type="number"
                        name="wage_job2"
                        value={formData.wage_job2}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Line 1 Annual Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="worksheet_line1"
                        value={formData.worksheet_line1}
                        onChange={handleChange}
                        className={`${inputClass} font-bold text-blue-600 dark:text-blue-400`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <label className={labelClass}>Line 2a: Higher + 2nd Job ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="worksheet_line2a"
                        value={formData.worksheet_line2a}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Line 2b: Top 2 + 3rd Job ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="worksheet_line2b"
                        value={formData.worksheet_line2b}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Line 2c: Total of 2a + 2b ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        readOnly
                        name="worksheet_line2c"
                        value={formData.worksheet_line2c}
                        className={`${inputClass} font-bold bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed text-blue-600 dark:text-blue-400`}
                      />
                    </div>
                  </div>
                )}

                {/* Line 3 Pay periods and Line 4 Result */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className={labelClass}>Line 3: Pay Periods Per Year</label>
                    <select
                      name="pay_periods"
                      value={formData.pay_periods}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="52">52 - Weekly</option>
                      <option value="26">26 - Bi-Weekly (Every 2 Weeks)</option>
                      <option value="24">24 - Semi-Monthly (Twice a Month)</option>
                      <option value="12">12 - Monthly</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Line 4 Result</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        ${formData.worksheet_line4 || '0.00'}
                      </span>
                      <span className="text-[11px] text-zinc-500 block">per pay period</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyWorksheetToLine3}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <ArrowRight size={13} />
                      Apply to Line 3
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. EXEMPTIONS FROM WITHHOLDING (LINE 5) */}
          <div className={cardClass}>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <Flag size={18} style={{ color: activeHexColor }} />
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Line 5: Exemptions from Montana Withholding</h2>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Mark a box only if you qualify for statutory exemption under Montana law.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="exempt"
                    checked={formData.exempt}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-extrabold block">I claim Exemption from Montana Withholding</span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      You must specify the exemption year and select one reason below.
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">Tax Year:</span>
                  <input
                    type="text"
                    maxLength={4}
                    name="tax_year"
                    value={formData.tax_year}
                    onChange={handleChange}
                    className={`${inputClass} w-20 text-center font-bold`}
                  />
                </div>
              </div>

              {formData.exempt && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 animate-in fade-in duration-200">
                  {[
                    {
                      code: 'a',
                      title: 'Reason A: American Indian Tribal Member',
                      desc: 'Enrolled member of a registered tribe, residing on the reservation of that tribe, and earning wages from work performed on that reservation.'
                    },
                    {
                      code: 'b',
                      title: 'Reason B: Armed Forces Reserve / Title 10',
                      desc: 'Member of a reserve component of the armed forces or National Guard called to active duty under Title 10 of the U.S. Code.'
                    },
                    {
                      code: 'c',
                      title: 'Reason C: North Dakota Resident Reciprocity',
                      desc: 'Resident of North Dakota claiming exemption under the Montana / North Dakota income tax reciprocity agreement.'
                    },
                    {
                      code: 'd',
                      title: 'Reason D: Military Spouse (MSRRA / SCRA)',
                      desc: 'Spouse of an active-duty military member who is in Montana solely in compliance with military orders under the Military Spouses Residency Relief Act.'
                    }
                  ].map(reason => {
                    const isSelected = formData.exempt_type === reason.code;
                    return (
                      <div
                        key={reason.code}
                        onClick={() => setFormData(prev => ({ ...prev, exempt_type: reason.code }))}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20' 
                            : isDarkMode 
                              ? 'border-zinc-800 bg-[#181a20]/60 hover:border-zinc-700' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black tracking-tight">{reason.title}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-400'
                          }`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {reason.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 6. DECLARATION & DIGITAL SIGNATURE */}
          <div className={cardClass}>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <Calendar size={18} style={{ color: activeHexColor }} />
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Declaration & Digital Signature</h2>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Under penalties of false swearing, I declare that I have examined this certificate and, to the best of my knowledge and belief, it is true, correct, and complete.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-1">
                <CustomDatePicker
                  label="Date of Signing *"
                  name="confirmation_date"
                  value={formData.confirmation_date}
                  onChange={handleChange}
                  isDarkMode={isDarkMode}
                  activeHexColor={activeHexColor}
                />
                <div className={`mt-4 p-3.5 rounded-2xl border text-[11px] ${
                  isDarkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <p className="font-semibold text-zinc-300 mb-1">Legal Notice:</p>
                  This form is filed with your employer. If you claim exemption, your employer is required to send a copy to the Montana Department of Revenue.
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Employee Signature *</label>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Eraser size={13} /> Clear Canvas
                  </button>
                </div>

                <div 
                  ref={containerRef}
                  className={`h-40 rounded-2xl border-2 border-dashed relative overflow-hidden transition-all ${
                    isDarkMode 
                      ? 'border-zinc-700 hover:border-zinc-500 bg-[#12141a]' 
                      : 'border-slate-300 hover:border-slate-400 bg-white'
                  }`}
                >
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor={isDarkMode ? '#ffffff' : '#000000'}
                    velocityFilterWeight={0.7}
                    canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
                    onEnd={handleSignatureEnd}
                  />

                  {!formData.signature_image && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400 gap-1.5 opacity-60">
                      <PenTool size={20} />
                      <span className="text-xs font-semibold">Sign your name in this box</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-between pt-4 pb-8">
            <div className="text-xs text-zinc-500">
              Form MW-4 will be calibrated, verified, and saved as an encrypted PDF document.
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: activeHexColor }}
              className="px-8 py-3.5 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing Form MW-4...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Confirm & Generate Form MW-4
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default MontanaTaxForm;