import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertCircle, Building2, Info, ArrowRight, MinusCircle, PlusCircle
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

// --- 1. PREMIUM LOADING OVERLAY ---
const LoadingOverlay = ({ isDarkMode, activeHexColor }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
    <div className={`flex flex-col items-center p-8 rounded-3xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
      isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="relative mb-4">
        <div 
          className="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${activeHexColor}30`, borderTopColor: activeHexColor }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText size={20} style={{ color: activeHexColor }} className="animate-pulse" />
        </div>
      </div>
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form L-4 PDF</h3>
      <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing state withholding certificate and vector markings...
      </p>
    </div>
  </div>
);

// --- 2. ERROR MODAL ---
const ErrorModal = ({ isOpen, title, message, onClose, isDarkMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 border animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-3">
            <XCircle size={24} />
          </div>
          <h3 className="text-base font-extrabold mb-1">{title || "Validation Required"}</h3>
          <p className={`text-xs mb-5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            {message || "Please verify all required fields on Form L-4 before continuing."}
          </p>
          <button 
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

// --- 4. MAIN LOUISIANA FORM COMPONENT ---
const LouisianaTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // 1. FORM DATA STATE INITIALIZED LAZILY
  const [formData, setFormData] = useState(() => ({
    // Personal Details (Lines 1 & 2)
    first_name: initialData?.first_name || '',
    middle_name: initialData?.middle_name || initialData?.middle_initial || '',
    last_name: initialData?.last_name || '',
    ssn: initialData?.ssn || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || 'LA',
    zipcode: (initialData?.zipcode || '').toString().slice(0, 10),
    email: initialData?.email || '',

    // L-4 Personal Allowances Worksheet
    l4_personal_exemptions: String(initialData?.l4_personal_exemptions ?? initialData?.exemptions ?? '1'), // Block A: "0", "1", "2"
    dependents: Number(initialData?.dependents ?? initialData?.dependents_count ?? 0),                      // Block B: 0, 1, 2...
    additional_withholding: initialData?.additional_withholding || initialData?.state_additional_withholding || '', // Line 8
    withholding_adjustment_type: Number(initialData?.additional_withholding) < 0 ? 'decrease' : 'increase',
    l4_filing_status: String(initialData?.l4_filing_status ?? '2'),                                        // Line 3: "1", "2", "3"

    // Employer Information (Lines 9 & 10)
    employer_name: initialData?.employer_name || 'Tech Innovators Inc.',
    employer_address: initialData?.employer_address || '100 North Pocahontas Street, Suite 500',
    employer_city: initialData?.employer_city || 'Baton Rouge',
    employer_state: initialData?.employer_state || 'LA',
    employer_zipcode: initialData?.employer_zipcode || '70802',
    employer_account: initialData?.employer_account || initialData?.employer_state_tax_id || 'LA-987654321',

    // Attestation & Signature
    confirmation_date: initialData?.confirmation_date || new Date().toISOString().split('T')[0],
    signature_image: initialData?.signature_image || null
  }));

  // SYNC FROM ASYNCHRONOUS INITIAL DATA PROP
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || prev.first_name,
        middle_name: initialData.middle_name || initialData.middle_initial || prev.middle_name,
        last_name: initialData.last_name || prev.last_name,
        ssn: initialData.ssn || prev.ssn,
        address: initialData.address || prev.address,
        city: initialData.city || prev.city,
        state: initialData.state || 'LA',
        zipcode: (initialData.zipcode || prev.zipcode).toString().slice(0, 10),
        email: initialData.email || prev.email,
        l4_personal_exemptions: String(initialData.l4_personal_exemptions ?? initialData.exemptions ?? prev.l4_personal_exemptions),
        dependents: Number(initialData.dependents ?? prev.dependents),
        additional_withholding: initialData.additional_withholding ?? prev.additional_withholding,
        l4_filing_status: String(initialData.l4_filing_status ?? prev.l4_filing_status),
        employer_name: initialData.employer_name || prev.employer_name,
        employer_city: initialData.employer_city || prev.employer_city,
        employer_state: initialData.employer_state || prev.employer_state,
        employer_zipcode: initialData.employer_zipcode || prev.employer_zipcode,
        employer_account: initialData.employer_account || prev.employer_account,
        confirmation_date: initialData.confirmation_date || prev.confirmation_date,
        signature_image: initialData.signature_image || prev.signature_image
      }));
    }
  }, [initialData]);

  // CANVAS RESIZE HANDLER WITH SIGNATURE PRESERVATION
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
    const t = setTimeout(resizeCanvas, 150);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, [name]: value.slice(0, 10) }));
      return;
    }

    if (name === 'ssn') {
      const clean = value.replace(/\D/g, '').slice(0, 9);
      let formatted = clean;
      if (clean.length > 5) formatted = `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5)}`;
      else if (clean.length > 3) formatted = `${clean.slice(0, 3)}-${clean.slice(3)}`;
      setFormData(prev => ({ ...prev, ssn: formatted }));
      return;
    }

    // Auto-sync Line 3 with Block A recommendation
    if (name === 'l4_personal_exemptions') {
      let recommendedStatus = '2';
      if (value === '0') recommendedStatus = '1';
      else if (value === '2') recommendedStatus = '3';
      setFormData(prev => ({
        ...prev,
        l4_personal_exemptions: value,
        l4_filing_status: recommendedStatus
      }));
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
      setFormData(prev => ({ ...prev, signature_image: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let sig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!formData.first_name || !formData.last_name || !formData.ssn) {
      setErrorState({
        isOpen: true,
        title: "Missing Required Information",
        message: "Please enter your Legal First Name, Last Name, and Social Security Number."
      });
      return;
    }

    if (!formData.address || !formData.city || !formData.zipcode) {
      setErrorState({
        isOpen: true,
        title: "Incomplete Address",
        message: "Please enter your full Residential Address, City, and ZIP code."
      });
      return;
    }

    if (!sig) {
      setErrorState({
        isOpen: true,
        title: "Digital Signature Required",
        message: "Please provide your digital signature inside the designated box before submitting Form L-4."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate signed additional withholding based on toggle
      let finalWithholding = '0.00';
      const rawWithholding = Math.abs(parseFloat(String(formData.additional_withholding).replace(/[^0-9.]/g, '')) || 0);
      if (rawWithholding > 0) {
        if (formData.withholding_adjustment_type === 'decrease') {
          finalWithholding = `-${rawWithholding.toFixed(2)}`;
        } else {
          finalWithholding = rawWithholding.toFixed(2);
        }
      }

      const finalPayload = {
        ...formData,
        state: 'LA',
        l4_personal_exemptions: parseInt(formData.l4_personal_exemptions, 10) || 0,
        dependents: parseInt(formData.dependents, 10) || 0,
        additional_withholding: finalWithholding,
        l4_filing_status: formData.l4_filing_status,
        signature_image: sig,
        signature: sig
      };

      await onSubmit(finalPayload);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Louisiana Form Submission Error:", err);
      setIsSubmitting(false);
      const msg = err.response?.data?.error || err.message || "Failed to submit Louisiana withholding certificate.";
      setErrorState({ isOpen: true, title: "Submission Error", message: msg });
    }
  };

  // Modern input styles
  const inputClass = `w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none transition-all shadow-sm ${
    isDarkMode 
      ? 'bg-[#12141a] border-zinc-800 text-zinc-100 focus:border-blue-500 placeholder-zinc-600' 
      : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 placeholder-slate-400'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-2 ${
    isDarkMode ? 'text-zinc-400' : 'text-slate-600'
  }`;

  const cardClass = `p-6 rounded-2xl border transition-all ${
    isDarkMode ? 'bg-[#181a20] border-zinc-800 shadow-xl' : 'bg-white border-slate-200/80 shadow-sm'
  }`;

  const sectionHeaderClass = `text-sm font-extrabold uppercase tracking-wider flex items-center gap-2.5 pb-4 mb-6 border-b ${
    isDarkMode ? 'text-zinc-100 border-zinc-800' : 'text-slate-800 border-slate-100'
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

      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
        
        {/* HEADER BADGE */}
        <div className={`p-6 sm:p-8 rounded-3xl border text-center relative overflow-hidden ${
          isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border"
            style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor, borderColor: `${activeHexColor}30` }}
          >
            <FileText size={32} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Form L-4 (R-1300)
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
            Louisiana Employee Withholding Exemption Certificate
          </h1>
          <p className={`text-xs max-w-xl mx-auto leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            State of Louisiana Department of Revenue withholding certificate for personal exemptions, dependent credits, and additional per-period tax withholding.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. PERSONAL INFORMATION (LINES 1 & 2) */}
          <div className={cardClass}>
            <div className={sectionHeaderClass}>
              <User size={18} style={{ color: activeHexColor }} />
              <span>1. Employee Identification (Lines 1 & 2)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <label className={labelClass}>First Name *</label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  placeholder="First name"
                  className={inputClass} 
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Middle Initial</label>
                <input 
                  type="text" 
                  name="middle_name" 
                  value={formData.middle_name} 
                  onChange={handleChange} 
                  maxLength="2"
                  placeholder="M.I."
                  className={`${inputClass} text-center`} 
                />
              </div>

              <div className="sm:col-span-5">
                <label className={labelClass}>Last Name *</label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  placeholder="Last name"
                  className={inputClass} 
                  required
                />
              </div>

              <div className="sm:col-span-6">
                <label className={labelClass}>Social Security Number *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="ssn" 
                    value={formData.ssn} 
                    onChange={handleChange} 
                    placeholder="XXX-XX-XXXX"
                    className={`${inputClass} pl-10 tracking-widest`} 
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
                  placeholder="employee@example.com"
                  className={inputClass} 
                />
              </div>
            </div>
          </div>

          {/* 2. RESIDENTIAL ADDRESS (LINES 4 & 5) */}
          <div className={cardClass}>
            <div className={sectionHeaderClass}>
              <Building2 size={18} style={{ color: activeHexColor }} />
              <span>2. Home Address (Lines 4 & 5)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-12">
                <label className={labelClass}>Home Address (number and street or rural route) *</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="e.g. 2105 St. Charles Avenue, Apt 4B"
                  className={inputClass} 
                  required
                />
              </div>

              <div className="sm:col-span-6">
                <label className={labelClass}>City *</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="e.g. New Orleans"
                  className={inputClass} 
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>State *</label>
                <input 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  readOnly
                  className={`${inputClass} font-bold text-center opacity-80 cursor-not-allowed`} 
                />
              </div>

              <div className="sm:col-span-4">
                <label className={labelClass}>ZIP Code *</label>
                <input 
                  type="text" 
                  name="zipcode" 
                  value={formData.zipcode} 
                  onChange={handleChange} 
                  placeholder="e.g. 70130"
                  className={inputClass} 
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. PERSONAL ALLOWANCES WORKSHEET (BLOCKS A & B, LINES 6 & 7) */}
          <div className={cardClass}>
            <div className={sectionHeaderClass}>
              <Calculator size={18} style={{ color: activeHexColor }} />
              <span>3. Personal Allowances Worksheet (Blocks A & B)</span>
            </div>

            <div className="space-y-6">
              {/* BLOCK A: PERSONAL EXEMPTIONS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>
                    Block A: Personal Exemptions (Line 6) *
                  </label>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Form Line 6
                  </span>
                </div>
                <p className={`text-xs mb-3 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Select the number of personal exemptions claimed for state withholding.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "0", title: "0 - None Claimed", desc: "Claim neither self nor spouse. Recommended if married with working spouse or multiple jobs." },
                    { value: "1", title: "1 - Self Only", desc: "Claim yourself only. Also used for Single filers and Head of Household." },
                    { value: "2", title: "2 - Self + Spouse", desc: "Claim yourself and your spouse. Check 'Married' under Line 3 below." }
                  ].map(opt => {
                    const isSelected = formData.l4_personal_exemptions === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleChange({ target: { name: 'l4_personal_exemptions', value: opt.value } })}
                        style={isSelected ? { borderColor: activeHexColor, backgroundColor: `${activeHexColor}10` } : {}}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'shadow-md' 
                            : isDarkMode ? 'border-zinc-800 bg-[#12141a]/60 hover:border-zinc-700' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-xs">{opt.title}</span>
                          <div 
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-400'
                            }`}
                            style={isSelected ? { backgroundColor: activeHexColor, borderColor: activeHexColor } : {}}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BLOCK B: DEPENDENTS */}
              <div className={`p-4 sm:p-5 rounded-xl border ${
                isDarkMode ? 'bg-[#12141a] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelClass}>
                    Block B: Number of Dependents (Line 7)
                  </label>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Form Line 7
                  </span>
                </div>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter number of qualifying dependents claimed on your return (do not include yourself or spouse). If none, enter 0.
                </p>
                <div className="max-w-xs">
                  <input 
                    type="number" 
                    name="dependents" 
                    min="0" 
                    max="20"
                    value={formData.dependents} 
                    onChange={handleChange} 
                    className={inputClass} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. FILING STATUS (LINE 3) */}
          <div className={cardClass}>
            <div className={sectionHeaderClass}>
              <Shield size={18} style={{ color: activeHexColor }} />
              <span>4. Filing Status (Line 3)</span>
            </div>

            <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Select one status matching your Block A exemptions per official Form L-4 instructions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: "1", title: "No Exemptions / Dependents", desc: "Corresponds to Block A = 0." },
                { code: "2", title: "Single", desc: "Corresponds to Block A = 1 (also Single / Head of Household)." },
                { code: "3", title: "Married", desc: "Corresponds to Block A = 2." }
              ].map(st => {
                const isSelected = formData.l4_filing_status === st.code;
                return (
                  <div
                    key={st.code}
                    onClick={() => setFormData(prev => ({ ...prev, l4_filing_status: st.code }))}
                    style={isSelected ? { borderColor: activeHexColor, backgroundColor: `${activeHexColor}10` } : {}}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'shadow-md' 
                        : isDarkMode ? 'border-zinc-800 bg-[#12141a]/60 hover:border-zinc-700' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs">{st.title}</span>
                      <div 
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'text-white' : 'border-zinc-400'
                        }`}
                        style={isSelected ? { backgroundColor: activeHexColor, borderColor: activeHexColor } : {}}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. ADDITIONAL WITHHOLDING ADJUSTMENT (LINE 8) */}
          <div className={cardClass}>
            <div className={sectionHeaderClass}>
              <DollarSign size={18} style={{ color: activeHexColor }} />
              <span>5. Increase or Decrease in Withholding (Line 8)</span>
            </div>

            <div className="space-y-4">
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  <strong>Statutory Form L-4 Line 8:</strong> Use this line to increase or decrease the tax withheld for each pay period. Decreases should be indicated as a negative amount.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, withholding_adjustment_type: 'increase' }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    formData.withholding_adjustment_type === 'increase'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : isDarkMode ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-600'
                  }`}
                  style={formData.withholding_adjustment_type === 'increase' ? { backgroundColor: activeHexColor, borderColor: activeHexColor } : {}}
                >
                  <PlusCircle size={14} />
                  <span>Increase (Extra Withholding)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, withholding_adjustment_type: 'decrease' }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    formData.withholding_adjustment_type === 'decrease'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                      : isDarkMode ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <MinusCircle size={14} />
                  <span>Decrease (Negative Amount)</span>
                </button>
              </div>

              <div className="max-w-xs">
                <label className={labelClass}>
                  {formData.withholding_adjustment_type === 'decrease' ? 'Decrease Amount ($)' : 'Increase Amount ($)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    {formData.withholding_adjustment_type === 'decrease' ? '-$' : '$'}
                  </span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    name="additional_withholding" 
                    value={formData.additional_withholding} 
                    onChange={handleChange} 
                    placeholder="0.00"
                    className={`${inputClass} pl-9`} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 6. ATTESTATION & DIGITAL SIGNATURE */}
          <div className={cardClass}>
            <div className={sectionHeaderClass}>
              <PenTool size={18} style={{ color: activeHexColor }} />
              <span>6. Declaration & Digital Signature</span>
            </div>

            <div className={`p-4 rounded-xl border mb-6 text-xs leading-relaxed font-medium ${
              isDarkMode ? 'bg-[#12141a] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <p>
                <strong>Attestation under penalty of perjury:</strong> I declare under the penalties imposed for filing false reports that the number of exemptions and dependency credits claimed on this certificate do not exceed the number to which I am entitled.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
              <div className="sm:col-span-4">
                <CustomDatePicker 
                  label="Date of Signing *"
                  name="confirmation_date"
                  value={formData.confirmation_date}
                  onChange={handleChange}
                  isDarkMode={isDarkMode}
                  activeHexColor={activeHexColor}
                />
              </div>

              <div className="sm:col-span-8">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Digital Signature *</label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Eraser size={13} />
                    <span>Clear Signature</span>
                  </button>
                </div>

                <div 
                  ref={containerRef}
                  className={`w-full h-44 rounded-2xl border-2 border-dashed relative cursor-crosshair overflow-hidden transition-all ${
                    isDarkMode 
                      ? 'bg-[#12141a] border-zinc-700 hover:border-zinc-500' 
                      : 'bg-white border-slate-300 hover:border-blue-400'
                  }`}
                >
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor={isDarkMode ? '#ffffff' : '#000000'}
                    velocityFilterWeight={0.7}
                    canvasProps={{ className: 'w-full h-full' }}
                    onEnd={handleSignatureEnd}
                  />
                  {!formData.signature_image && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400 gap-1.5">
                      <PenTool size={20} className="opacity-40" />
                      <span className="text-[11px] font-semibold">Sign your legal name here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: activeHexColor }}
              className="px-8 py-3.5 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting Certificate...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Confirm & Complete Form L-4</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default LouisianaTaxForm;