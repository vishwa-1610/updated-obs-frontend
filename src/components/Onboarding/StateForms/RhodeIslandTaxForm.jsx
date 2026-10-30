import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, Eraser, PenTool, FileText, 
  Loader2, XCircle, CheckCircle2, AlertTriangle, Info, Sparkles, Building2, 
  MapPin, Check, ExternalLink, ArrowRight, Calculator, HelpCircle
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form RI W-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Rhode Island Employee's Withholding Allowance Certificate...
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
            className="w-full py-3 bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
          >
            Review & Fix
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN RHODE ISLAND TAX FORM COMPONENT ---
const RhodeIslandTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // 1. FORM STATE
  const [formData, setFormData] = useState({
    // Employee Personal Info
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'RI',
    zipcode: '',

    // Allowances Worksheet (Line 1A - 1D)
    line1a: true,  // No one else can claim me as dependent (1)
    line1b: false, // Can claim spouse as dependent (1)
    line1c: '0',   // Dependents other than spouse
    line1d: '0',   // Additional allowances

    // Additional Withholding (Line 2)
    additional_withholding: '',

    // Exemption (Line 3)
    exempt: false,
    exempt_type: 'EXEMPT', // 'EXEMPT' or 'EXEMPT-MS'

    // Certification & Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null,
  });

  // Pre-fill initial onboarding data
  useEffect(() => {
    if (initialData && !dataLoadedRef.current) {
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || '',
        middle_initial: initialData.middle_initial || '',
        last_name: initialData.last_name || '',
        ssn: initialData.ssn || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || 'RI',
        zipcode: (initialData.zipcode || '').slice(0, 5),
      }));
      dataLoadedRef.current = true;
    }
  }, [initialData]);

  // Handle signature canvas auto-resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (sigCanvasRef.current && containerRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) {
            sigCanvasRef.current.fromDataURL(savedData);
          }
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'zipcode') {
      const truncated = value.replace(/\D/g, '').slice(0, 5);
      setFormData(prev => ({ ...prev, [name]: truncated }));
      return;
    }
    if (name === 'ssn') {
      const cleaned = value.replace(/\D/g, '').slice(0, 9);
      let formatted = cleaned;
      if (cleaned.length > 5) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
      } else if (cleaned.length > 3) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      }
      setFormData(prev => ({ ...prev, ssn: formatted }));
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

  // Calculate Total Allowances (Line 1E & Line 1, capped at 10)
  const calc1a = formData.line1a ? 1 : 0;
  const calc1b = formData.line1b ? 1 : 0;
  const calc1c = Math.max(0, parseInt(formData.line1c || 0, 10));
  const calc1d = Math.max(0, parseInt(formData.line1d || 0, 10));
  const rawTotal = calc1a + calc1b + calc1c + calc1d;
  const totalAllowances = Math.min(rawTotal, 10);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required Field Validation
    const missing = [];
    if (!formData.first_name.trim()) missing.push("First Name");
    if (!formData.last_name.trim()) missing.push("Last Name");
    if (!formData.ssn.trim()) missing.push("Social Security Number");
    if (!formData.address.trim()) missing.push("Street Address");
    if (!formData.city.trim()) missing.push("City");
    if (!formData.zipcode.trim()) missing.push("Zip Code");

    let finalSig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      finalSig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!finalSig) {
      missing.push("Digital Signature");
    }

    if (missing.length > 0) {
      setErrorModal({
        isOpen: true,
        title: "Required Fields Incomplete",
        message: `Please complete the following required items: ${missing.join(', ')}.`
      });
      return;
    }

    setIsLoading(true);
    try {
      onSubmit({
        ...formData,
        line1a: formData.line1a,
        line1b: formData.line1b,
        line1c: calc1c,
        line1d: calc1d,
        total_allowances: totalAllowances,
        signature_image: finalSig
      });
    } catch (err) {
      setIsLoading(false);
      setErrorModal({
        isOpen: true,
        title: "Submission Error",
        message: err.message || "Failed to process Rhode Island Form RI W-4."
      });
    }
  };

  // Modern Theme Classes
  const cardBgClass = isDarkMode 
    ? 'bg-[#181a20] border-zinc-800 text-zinc-100 shadow-xl' 
    : 'bg-white border-slate-200/80 text-slate-900 shadow-sm';

  const labelClass = `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
    isDarkMode ? 'text-zinc-400' : 'text-slate-600'
  }`;

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
    isDarkMode 
      ? 'bg-zinc-900/60 border-zinc-700/80 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
      : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
  }`;

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0f1117] text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {isLoading && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeColor} />}
      <ErrorModal 
        isOpen={errorModal.isOpen} 
        title={errorModal.title} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} 
        isDarkMode={isDarkMode} 
      />

      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER SECTION */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider rounded-md bg-blue-600 text-white">
                  State of Rhode Island
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  Division of Taxation · Form RI W-4
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Employee’s Withholding Allowance Certificate
              </h1>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Federal Form W-4 cannot be used for Rhode Island tax purposes. Complete this certificate for accurate state withholding.
              </p>
            </div>
            <a 
              href="https://tax.ri.gov" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' 
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>RI Tax Division</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* STATUTORY NOTICE BANNER */}
          <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3 ${
            isDarkMode 
              ? 'bg-blue-950/20 border-blue-800/40 text-blue-300' 
              : 'bg-blue-50/70 border-blue-200 text-blue-900'
          }`}>
            <Info size={20} className="shrink-0 mt-0.5 text-blue-500" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-bold">Rhode Island Withholding Guidance:</p>
              <p>
                If your annual wages exceed $283,250, your personal exemption amount will be phased out and equal zero. 
                Allowances on Line 1 are capped at 10. If claiming EXEMPT or EXEMPT-MS on Line 3, Form RI W-4 must be renewed annually.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION I: EMPLOYEE INFORMATION */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: activeColor }}
              >
                <User size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Employee Information</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Must match your official tax identification records.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>First Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="e.g. Richard"
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Middle Initial</label>
                <input 
                  type="text" 
                  name="middle_initial" 
                  value={formData.middle_initial} 
                  onChange={handleChange} 
                  maxLength={1}
                  className={inputClass} 
                  placeholder="e.g. J"
                />
              </div>

              <div>
                <label className={labelClass}>Last Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="e.g. Reynolds"
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Social Security Number <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="ssn" 
                  value={formData.ssn} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="XXX-XX-XXXX"
                  required 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Present Home Address <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="e.g. 100 Benefit Street, Apt 4B"
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>City / Town <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="e.g. Providence"
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>State <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="RI"
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>ZIP Code (5-digit) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="zipcode" 
                  value={formData.zipcode} 
                  onChange={handleChange} 
                  maxLength={5}
                  className={inputClass} 
                  placeholder="02904"
                  required 
                />
              </div>
            </div>
          </div>

          {/* SECTION II: PERSONAL ALLOWANCES WORKSHEET */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: activeColor }}
              >
                <Calculator size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Line 1: Personal Allowances Worksheet</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Calculate your personal and dependent allowances (entered on certificate Line 1).
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* LINE 1A: YOURSELF */}
              <label className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.line1a 
                  ? (isDarkMode ? 'border-blue-500 bg-blue-950/20' : 'border-blue-600 bg-blue-50/40') 
                  : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
              }`}>
                <input 
                  type="checkbox" 
                  name="line1a" 
                  checked={formData.line1a} 
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-blue-600 rounded" 
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Line 1A: Personal Allowance</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-blue-600 text-white">
                      {formData.line1a ? "1" : "0"}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Enter 1 if no one else can claim you as a dependent on their tax return.
                  </p>
                </div>
              </label>

              {/* LINE 1B: SPOUSE */}
              <label className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.line1b 
                  ? (isDarkMode ? 'border-blue-500 bg-blue-950/20' : 'border-blue-600 bg-blue-50/40') 
                  : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
              }`}>
                <input 
                  type="checkbox" 
                  name="line1b" 
                  checked={formData.line1b} 
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-blue-600 rounded" 
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Line 1B: Spouse Dependent Allowance</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-blue-600 text-white">
                      {formData.line1b ? "1" : "0"}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Enter 1 if you can claim your spouse as a dependent.
                  </p>
                </div>
              </label>

              {/* LINE 1C: OTHER DEPENDENTS */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="space-y-0.5">
                  <span className="font-bold text-sm">Line 1C: Dependents</span>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Number of dependents (other than you or your spouse) you will claim on your tax return.
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <input 
                    type="number" 
                    name="line1c" 
                    value={formData.line1c} 
                    onChange={handleChange} 
                    min="0"
                    max="10"
                    className={`${inputClass} text-center font-bold`} 
                  />
                </div>
              </div>

              {/* LINE 1D: ADDITIONAL ALLOWANCES */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="space-y-0.5">
                  <span className="font-bold text-sm">Line 1D: Additional Allowances</span>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Enter any additional allowances (review carefully to avoid underwithholding).
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <input 
                    type="number" 
                    name="line1d" 
                    value={formData.line1d} 
                    onChange={handleChange} 
                    min="0"
                    max="10"
                    className={`${inputClass} text-center font-bold`} 
                  />
                </div>
              </div>

              {/* TOTAL ALLOWANCES SUMMARY (LINE 1E / CERTIFICATE LINE 1) */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                isDarkMode 
                  ? 'bg-blue-950/30 border-blue-800/50 text-blue-200' 
                  : 'bg-blue-50 border-blue-200 text-blue-950'
              }`}>
                <div className="space-y-0.5">
                  <span className="font-extrabold text-sm block">
                    Line 1E & Line 1: Total Allowances to Claim
                  </span>
                  <span className="text-xs opacity-80">
                    Sum of Lines A + B + C + D (Maximum statutory cap is 10)
                  </span>
                </div>
                <div className="text-2xl font-black px-4 py-1.5 rounded-xl bg-blue-600 text-white shadow-md">
                  {totalAllowances}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION III: ADDITIONAL WITHHOLDING & EXEMPT STATUS */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: activeColor }}
              >
                <DollarSign size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Lines 2 & 3: Additional Withholding & Exemption</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Optional additional withholding or statutory non-withholding exemption.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* LINE 2: ADDITIONAL WITHHOLDING */}
              <div className="max-w-sm">
                <label className={labelClass}>Line 2: Additional Dollar Amount Withheld Per Pay Period ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    name="additional_withholding" 
                    value={formData.additional_withholding} 
                    onChange={handleChange} 
                    className={`${inputClass} pl-8`}
                    placeholder="0.00" 
                  />
                </div>
              </div>

              {/* LINE 3: EXEMPTION CLAIM */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                <label className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.exempt 
                    ? (isDarkMode ? 'border-amber-500 bg-amber-950/20' : 'border-amber-600 bg-amber-50/50') 
                    : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
                }`}>
                  <input 
                    type="checkbox" 
                    name="exempt" 
                    checked={formData.exempt} 
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-amber-600 rounded" 
                  />
                  <div className="space-y-1 w-full">
                    <span className="font-bold text-sm block">Line 3: Claim Exemption from Withholding</span>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      I claim exemption from Rhode Island withholding because I had no tax liability last year and expect none this year, 
                      or qualify under the federal Servicemembers Civil Relief Act.
                    </p>

                    {formData.exempt && (
                      <div className="pt-3 max-w-xs animate-in fade-in">
                        <label className={labelClass}>Exemption Code <span className="text-rose-500">*</span></label>
                        <select
                          name="exempt_type"
                          value={formData.exempt_type}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="EXEMPT">EXEMPT (Standard Tax Exemption)</option>
                          <option value="EXEMPT-MS">EXEMPT-MS (Military Spouse Relief Act)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION IV: DECLARATION & SIGNATURE */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: activeColor }}
              >
                <PenTool size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Declaration & Signature</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Under penalties of perjury, certify your Rhode Island withholding certificate.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                isDarkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                Under penalties of perjury, I declare that I have examined this certificate, and to the best of my knowledge and belief, 
                it is true, correct, and complete.
              </div>

              <div className="max-w-xs">
                <label className={labelClass}>Date Signed <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    name="confirmation_date" 
                    value={formData.confirmation_date} 
                    onChange={handleChange} 
                    className={`${inputClass} pl-10`}
                    required 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={labelClass}>
                    Digital Signature <span className="text-rose-500">*</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={clearSignature} 
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Eraser size={14} /> Clear Signature
                  </button>
                </div>

                <div 
                  ref={containerRef} 
                  className={`border-2 border-dashed rounded-2xl overflow-hidden h-44 w-full relative transition-colors shadow-inner cursor-crosshair ${
                    isDarkMode 
                      ? 'border-zinc-700 bg-zinc-900/40 hover:border-blue-500' 
                      : 'border-slate-300 bg-slate-50/50 hover:border-blue-500'
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 dark:text-zinc-500 gap-2">
                      <PenTool size={20} className="opacity-40" />
                      <span className="font-semibold text-xs tracking-wide">Sign with mouse or touch screen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className="px-8 py-4 rounded-2xl font-extrabold text-sm text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-3"
              style={{ backgroundColor: activeColor }}
            >
              <span>Confirm & Generate RI Form W-4</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RhodeIslandTaxForm;
