import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, Eraser, PenTool, FileText, Calculator, 
  Loader2, XCircle, CheckCircle2, AlertTriangle, Info, Sparkles, Building2, 
  MapPin, Check, HeartHandshake, HelpCircle, ArrowRight, RefreshCw, Landmark, Users, Briefcase
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Vermont W-4VT</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Vermont Employee's Withholding Certificate...
      </p>
    </div>
  </div>
);

// --- 2. THEME-AWARE ERROR MODAL ---
const ErrorModal = ({ isOpen, title, message, onClose, isDarkMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border text-center animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-base font-extrabold mb-2">{title || "Validation Alert"}</h3>
        <p className={`text-xs leading-relaxed mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
          {message}
        </p>
        <button 
          type="button"
          onClick={onClose} 
          className="w-full py-3 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-md"
        >
          Review &amp; Complete
        </button>
      </div>
    </div>
  );
};

// --- 3. MAIN COMPONENT: VermontTaxForm ---
const VermontTaxForm = ({ initialData = {}, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#166534'; // Vermont Forest Green default

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    // Employee Demographics
    first_name: initialData.first_name || '',
    middle_initial: initialData.middle_initial || initialData.initial || '',
    last_name: initialData.last_name || '',
    ssn: initialData.ssn || '',

    // Filing Status: 'single', 'married_joint', 'married_separate', 'married_higher_single'
    filing_status: initialData.filing_status || 'single',

    // Vermont Allowances Worksheet (Lines 1 - 4)
    line1: initialData.line1 !== undefined ? Boolean(initialData.line1) : true,
    spouse_works: Boolean(initialData.spouse_works ?? false),
    line2: Boolean(initialData.line2 ?? false),
    line3: parseInt(initialData.line3 ?? initialData.dependents ?? 0, 10) || 0,
    line4: Boolean(initialData.line4 ?? (initialData.filing_status === 'hoh')),

    // Line 6: Additional Withholding ($)
    additional_withholding: initialData.additional_withholding ?? initialData.line6 ?? '',

    // Exemption Claim (Zero liability last year and this year)
    exempt: Boolean(initialData.exempt ?? initialData.is_exempt ?? false),

    // Signature & Date
    signature_image: initialData.signature_image || null,
    confirmation_date: initialData.confirmation_date || new Date().toISOString().split('T')[0]
  });

  const sigCanvasRef = useRef(null);

  // Sync initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || prev.first_name,
        middle_initial: initialData.middle_initial || initialData.initial || prev.middle_initial,
        last_name: initialData.last_name || prev.last_name,
        ssn: initialData.ssn || prev.ssn,
        filing_status: initialData.filing_status || prev.filing_status,
        line1: initialData.line1 !== undefined ? Boolean(initialData.line1) : prev.line1,
        spouse_works: Boolean(initialData.spouse_works ?? prev.spouse_works),
        line2: Boolean(initialData.line2 ?? prev.line2),
        line3: parseInt(initialData.line3 ?? initialData.dependents ?? prev.line3, 10) || 0,
        line4: Boolean(initialData.line4 ?? prev.line4),
        additional_withholding: initialData.additional_withholding ?? initialData.line6 ?? prev.additional_withholding,
        exempt: Boolean(initialData.exempt ?? initialData.is_exempt ?? prev.exempt)
      }));
    }
  }, [initialData]);

  // Derived Line 5 Total Allowances
  const valLine1 = formData.line1 ? 1 : 0;
  const valLine2 = (formData.filing_status === 'married_joint' && !formData.spouse_works && formData.line2) ? 1 : 0;
  const valLine3 = Math.max(0, parseInt(formData.line3, 10) || 0);
  const valLine4 = formData.line4 ? 1 : 0;
  const totalAllowances = formData.exempt ? 0 : (valLine1 + valLine2 + valLine3 + valLine4);

  // SSN Auto-Formatting (XXX-XX-XXXX)
  const handleSSNChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    }
    setFormData(prev => ({ ...prev, ssn: formatted }));
  };

  // Clear Signature Canvas
  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setFormData(prev => ({ ...prev, signature_image: null }));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Name",
        message: "Please enter your legal first and last name."
      });
      return;
    }

    const cleanSSN = formData.ssn.replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      setErrorModal({
        isOpen: true,
        title: "Invalid SSN",
        message: "Please enter a complete 9-digit Social Security Number."
      });
      return;
    }

    // Capture Signature Data
    let sigDataUrl = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sigDataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    }

    if (!sigDataUrl) {
      setErrorModal({
        isOpen: true,
        title: "Signature Required",
        message: "Please sign in the certification box to certify your Vermont Form W-4VT."
      });
      return;
    }

    const payload = {
      ...formData,
      state: 'VT',
      state_code: 'VT',
      signature_image: sigDataUrl,
      line1: valLine1,
      line2: valLine2,
      line3: valLine3,
      line4: valLine4,
      line5: totalAllowances,
      total_allowances: totalAllowances,
      allowances: totalAllowances,
      additional_withholding: parseFloat(formData.additional_withholding) || 0,
      line6: parseFloat(formData.additional_withholding) || 0,
      exempt: formData.exempt,
      is_exempt: formData.exempt
    };

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      }
    } catch (err) {
      setErrorModal({
        isOpen: true,
        title: "Submission Error",
        message: err?.response?.data?.error || err.message || "Failed to submit Vermont Form W-4VT. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto rounded-3xl border transition-all duration-300 p-4 sm:p-8 ${
      isDarkMode 
        ? 'bg-[#101216] border-zinc-800/80 text-zinc-100 shadow-2xl' 
        : 'bg-white border-slate-200/90 text-slate-800 shadow-xl'
    }`}>
      {isLoading && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeColor} />}
      <ErrorModal 
        isOpen={errorModal.isOpen} 
        title={errorModal.title} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        isDarkMode={isDarkMode}
      />

      {/* --- FORM HEADER --- */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-8 border" style={{
        borderColor: `${activeColor}30`,
        background: isDarkMode 
          ? `linear-gradient(135deg, rgba(22, 101, 52, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)`
          : `linear-gradient(135deg, ${activeColor}08 0%, ${activeColor}15 100%)`
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <Landmark size={12} />
                State of Vermont
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-600'
              }`}>
                Department of Taxes &bull; 32 V.S.A. § 5841
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Employee's Withholding Allowance Certificate (Form W-4VT)
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              All Vermont employees should complete this form so that your employer can calculate and withhold the correct Vermont state personal income tax from your pay.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Official Certificate</span>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">Form W-4VT</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* --- STEP 1: PERSONAL INFORMATION --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              1
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 1: Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                }`}
                placeholder="DOE"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                }`}
                placeholder="JOHN"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1">Initial</label>
              <input
                type="text"
                maxLength={1}
                value={formData.middle_initial}
                onChange={e => setFormData({ ...formData, middle_initial: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-center outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                }`}
                placeholder="A"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-bold mb-1">Social Security Number (SSN) *</label>
              <input
                type="text"
                required
                maxLength={11}
                value={formData.ssn}
                onChange={handleSSNChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                }`}
                placeholder="XXX-XX-XXXX"
              />
            </div>
          </div>
        </div>

        {/* --- STEP 2: FILING STATUS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              2
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Filing Status &bull; Check ONE *</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'single',
                title: 'Single',
                desc: 'Single or Head of Household'
              },
              {
                id: 'married_joint',
                title: 'Married / Civil Union Jointly',
                desc: 'Married or Civil Union Filing Jointly'
              },
              {
                id: 'married_separate',
                title: 'Married / Civil Union Separately',
                desc: 'Married or Civil Union Filing Separately'
              },
              {
                id: 'married_higher_single',
                title: 'Married (Higher Single Rate)',
                desc: 'Married, but withhold at higher single rate'
              }
            ].map(opt => {
              const isSelected = formData.filing_status === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, filing_status: opt.id })}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? `border-emerald-500 ring-2 ring-emerald-500/20 shadow-md ${
                          isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50/80'
                        }`
                      : `hover:border-zinc-500 ${
                          isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
                        }`
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-extrabold">{opt.title}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-500 text-white' 
                          : 'border-zinc-400 dark:border-zinc-600'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- STEP 3: VERMONT ALLOWANCES WORKSHEET (LINES 1 - 5) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              3
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Vermont Allowances Worksheet</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Each withholding allowance claimed reduces the amount of income subject to Vermont tax:
          </p>

          <div className="space-y-4">
            {/* Line 1: Yourself */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.line1
                ? `border-emerald-500/60 bg-emerald-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                checked={formData.line1}
                onChange={e => setFormData({ ...formData, line1: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 shrink-0"
              />
              <div className="flex-1 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold block mb-0.5">
                    Line 1: Enter "1" for yourself
                  </span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Claim if no one else can claim you as a dependent on their tax return.
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {valLine1}
                </span>
              </div>
            </label>

            {/* Line 2: Spouse (Conditional on Married Filing Jointly) */}
            {formData.filing_status === 'married_joint' && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    Line 2: Spouse Allowance (Married Jointly)
                  </span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {valLine2}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter "1" if you are filing jointly and your spouse does not work:
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="spouse_works"
                      checked={!formData.spouse_works && formData.line2}
                      onChange={() => setFormData({ ...formData, spouse_works: false, line2: true })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Spouse Does NOT Work (+1 Allowance)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="spouse_works"
                      checked={formData.spouse_works || !formData.line2}
                      onChange={() => setFormData({ ...formData, spouse_works: true, line2: false })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Spouse Works (0 Allowances)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Line 3: Dependents */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <span className="text-xs font-bold block mb-0.5">
                  Line 3: Number of Dependents Planned to Claim
                </span>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Children under 19 (or under 24 if full-time students) and qualifying relatives you support.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={0}
                  value={formData.line3}
                  onChange={e => setFormData({ ...formData, line3: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className={`w-20 px-3 py-2 rounded-xl border text-xs font-bold text-center outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Line 4: Head of Household */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.line4
                ? `border-emerald-500/60 bg-emerald-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                checked={formData.line4}
                onChange={e => setFormData({ ...formData, line4: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-emerald-600 focus:ring-emerald-500 shrink-0"
              />
              <div className="flex-1 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold block mb-0.5">
                    Line 4: Head of Household Allowance
                  </span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Enter "1" if you plan to file as "head of household" on your income tax return.
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {valLine4}
                </span>
              </div>
            </label>

            {/* Line 5: Total Number of Vermont Allowances */}
            <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/25 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">
                  Line 5: Total Number of Vermont Allowances (Lines 1 &ndash; 4):
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Sum of Lines 1 through 4 claimed on your certificate
                </span>
              </div>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-emerald-500/30">
                {totalAllowances}
              </span>
            </div>
          </div>
        </div>

        {/* --- STEP 4: ADDITIONAL WITHHOLDING & EXEMPTION --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              4
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Line 6: Additional Withholding &amp; Exemption</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Line 6: Additional Withholding */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Line 6: Additional Withholding ($)</span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">Per Paycheck</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.additional_withholding}
                  onChange={e => setFormData({ ...formData, additional_withholding: e.target.value })}
                  className={`w-full pl-7 pr-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                  placeholder="0.00"
                />
              </div>
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Tip: If you entered an additional amount on federal W-4, consider entering 30% of that amount here.
              </span>
            </div>

            {/* Exemption Toggle */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              formData.exempt
                ? 'border-amber-500 bg-amber-500/10'
                : isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.exempt}
                  onChange={e => setFormData({ ...formData, exempt: e.target.checked })}
                  className="mt-0.5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 shrink-0"
                />
                <div>
                  <span className="text-xs font-bold block mb-1">
                    Claim Exemption from Vermont Withholding
                  </span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    I had a right to a refund of all Vermont income tax withheld last year because I had no tax liability AND I expect to have no tax liability this year.
                  </p>
                </div>
              </label>
              {formData.exempt && (
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-2 block">
                  &bull; Allowances will be set to 0 and "EXEMPT" will be printed on Form W-4VT.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* --- REAL-TIME VERMONT WITHHOLDING SUMMARY --- */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider">Vermont Withholding Summary</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Form W-4VT
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Filing Status</span>
              <span className="text-xs font-black capitalize">
                {formData.filing_status === 'single' ? 'Single' : (formData.filing_status === 'married_joint' ? 'Married Joint' : (formData.filing_status === 'married_separate' ? 'Married Separate' : 'Higher Single'))}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Total Allowances</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {totalAllowances}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Extra Withholding</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                ${(parseFloat(formData.additional_withholding) || 0).toFixed(2)}/pay
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Withholding Status</span>
              <span className={`text-xs font-black ${formData.exempt ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formData.exempt ? 'EXEMPT' : 'Standard Withholding'}
              </span>
            </div>
          </div>
        </div>

        {/* --- STEP 5: EMPLOYEE CERTIFICATION & DIGITAL SIGNATURE --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              5
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 5: Sign &amp; Certify</h2>
          </div>

          <div className="p-3.5 rounded-xl border mb-6 bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <p className="text-xs leading-relaxed font-medium">
              <strong>Under penalties of perjury</strong>, I certify that I am entitled to the number of withholding allowances claimed on this certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-8">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold flex items-center gap-1.5">
                  <PenTool size={13} style={{ color: activeColor }} />
                  Employee's Signature *
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] font-bold flex items-center gap-1 text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Eraser size={12} />
                  Clear Signature
                </button>
              </div>

              <div className={`h-36 rounded-2xl border-2 border-dashed overflow-hidden transition-all ${
                isDarkMode 
                  ? 'bg-[#181a20] border-zinc-700 hover:border-zinc-500' 
                  : 'bg-white border-slate-300 hover:border-emerald-500'
              }`}>
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? '#ffffff' : '#000000'}
                  canvasProps={{
                    className: 'w-full h-full cursor-crosshair'
                  }}
                />
              </div>
              <span className={`text-[10px] mt-1.5 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Sign within the box above using your mouse, trackpad, or touch screen.
              </span>
            </div>

            <div className="sm:col-span-4 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold mb-1">Date Signed *</label>
                <input
                  type="date"
                  required
                  value={formData.confirmation_date}
                  onChange={e => setFormData({ ...formData, confirmation_date: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider text-white shadow-xl transition-all duration-200 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: activeColor }}
              >
                <span>Confirm &amp; Generate Form W-4VT</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default VermontTaxForm;
