import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, Eraser, PenTool, FileText, Calculator, 
  Loader2, XCircle, CheckCircle2, AlertTriangle, Info, Sparkles, Building2, 
  MapPin, Check, HeartHandshake, HelpCircle, ArrowRight, RefreshCw, Sun, Users
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating New Mexico W-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing New Mexico Employee's Withholding Certificate...
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

// --- 3. MAIN COMPONENT: NewMexicoTaxForm ---
const NewMexicoTaxForm = ({ initialData = {}, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    first_name: initialData.first_name || '',
    middle_initial: initialData.middle_initial || '',
    last_name: initialData.last_name || '',
    ssn: initialData.ssn || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || 'NM',
    zipcode: initialData.zipcode || '',

    // Step 1(c) Filing Status: "1" = Single/Separate, "2" = Married Joint, "3" = Head of Household
    filing_status: initialData.filing_status || '1',

    // Step 2(c) Multiple Jobs Checkbox
    multiple_jobs_two: initialData.multiple_jobs_two || false,

    // Step 3 Claim Dependents & Other Credits
    kids_under_17: initialData.kids_under_17 || 0,
    other_dependents: initialData.other_dependents || 0,
    other_credits: initialData.other_credits || '',

    // Step 4 Optional State Adjustments
    step4_other_income: initialData.step4_other_income || '',
    step4_deductions: initialData.step4_deductions || '',
    step4_extra_withholding: initialData.step4_extra_withholding || initialData.additional_withholding || '',

    // Exemption
    exempt: initialData.exempt || false,

    // Signature & Date
    signature_image: initialData.signature_image || null,
    confirmation_date: initialData.confirmation_date || new Date().toISOString().split('T')[0],

    // Employer Details (Auto-populated)
    employer_name: initialData.employer_name || 'Tech Innovators Inc.',
    employer_address: initialData.employer_address || '100 Innovation Way',
    employer_city: initialData.employer_city || 'Albuquerque',
    employer_state: initialData.employer_state || 'NM',
    employer_zip: initialData.employer_zip || '87101',
    employer_ein: initialData.employer_ein || '12-3456789',
    employer_date: initialData.employer_date || '01/10/2026'
  });

  const sigCanvasRef = useRef(null);

  // Sync initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || prev.first_name,
        middle_initial: initialData.middle_initial || prev.middle_initial,
        last_name: initialData.last_name || prev.last_name,
        ssn: initialData.ssn || prev.ssn,
        address: initialData.address || prev.address,
        city: initialData.city || prev.city,
        state: initialData.state || 'NM',
        zipcode: initialData.zipcode || prev.zipcode,
        filing_status: initialData.filing_status || prev.filing_status,
        multiple_jobs_two: initialData.multiple_jobs_two ?? prev.multiple_jobs_two,
        kids_under_17: initialData.kids_under_17 ?? prev.kids_under_17,
        other_dependents: initialData.other_dependents ?? prev.other_dependents,
        other_credits: initialData.other_credits ?? prev.other_credits,
        step4_other_income: initialData.step4_other_income ?? prev.step4_other_income,
        step4_deductions: initialData.step4_deductions ?? prev.step4_deductions,
        step4_extra_withholding: initialData.step4_extra_withholding ?? initialData.additional_withholding ?? prev.step4_extra_withholding,
        exempt: initialData.exempt ?? prev.exempt,
      }));
    }
  }, [initialData]);

  // SSN Auto-Formatting
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

  // Step 3 Live Calculations
  const kidsCount = Math.max(0, parseInt(formData.kids_under_17, 10) || 0);
  const othersCount = Math.max(0, parseInt(formData.other_dependents, 10) || 0);
  const otherCreditsVal = Math.max(0, parseFloat(formData.other_credits) || 0);

  const valKids = kidsCount * 2000;
  const valOthers = othersCount * 500;
  const totalStep3 = valKids + valOthers + otherCreditsVal;

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

    // Validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Name",
        message: "Please enter your first and last name."
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

    if (!formData.address.trim() || !formData.city.trim() || !formData.zipcode.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Address",
        message: "Please provide your street address, city, and ZIP code."
      });
      return;
    }

    // Capture signature
    let sigDataUrl = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sigDataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    }

    if (!sigDataUrl) {
      setErrorModal({
        isOpen: true,
        title: "Signature Required",
        message: "Please provide your digital signature to certify this withholding certificate."
      });
      return;
    }

    const payload = {
      ...formData,
      state: 'NM',
      state_code: 'NM',
      signature_image: sigDataUrl,
      step3_total: totalStep3,
      additional_withholding: formData.step4_extra_withholding,
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
        message: err?.response?.data?.error || err.message || "Failed to submit New Mexico W-4 form. Please try again."
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
          ? `linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)`
          : `linear-gradient(135deg, ${activeColor}08 0%, ${activeColor}15 100%)`
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20">
                <Sun size={12} />
                State of New Mexico
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-600'
              }`}>
                NMSA 1978 § 7-3-3 &bull; FYI-104
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Form W-4 State Withholding Certificate
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              The State of New Mexico Taxation and Revenue Department uses the Federal Form W-4 to determine state personal income tax withholding. This form certifies your withholding status and allowances for New Mexico state payroll records.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Official NM Policy</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">Uses Federal W-4</span>
          </div>
        </div>

        {/* Prominent NM TRD Banner Indicator */}
        <div className="mt-4 p-3 rounded-xl border flex items-center gap-3 bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400">
          <Sparkles size={16} className="shrink-0" />
          <p className="text-xs font-bold">
            *** FOR NEW MEXICO STATE WITHHOLDING ONLY *** &mdash; Your selections will be stamped directly on your official state certificate copy.
          </p>
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
              <label className="block text-xs font-bold mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="Elena"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1">M.I.</label>
              <input
                type="text"
                maxLength={1}
                value={formData.middle_initial}
                onChange={e => setFormData({ ...formData, middle_initial: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-center outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="M"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="Chavez"
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="XXX-XX-XXXX"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-bold mb-1">Home Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="412 Central Avenue SE"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="Albuquerque"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-1">State</label>
              <input
                type="text"
                disabled
                value="NM"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-center ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-200 border-slate-300 text-slate-600'
                }`}
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold mb-1">ZIP Code *</label>
              <input
                type="text"
                required
                maxLength={5}
                value={formData.zipcode}
                onChange={e => setFormData({ ...formData, zipcode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="87102"
              />
            </div>
          </div>

          {/* Step 1(c) Filing Status Interactive Selector */}
          <div className="mt-6 pt-5 border-t border-zinc-700/40">
            <label className="block text-xs font-bold mb-3 uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Step 1(c): Marital &amp; Filing Status *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: '1',
                  title: 'Single / Married Separate',
                  desc: 'Single, or married filing separately from your spouse'
                },
                {
                  id: '2',
                  title: 'Married Filing Jointly',
                  desc: 'Married filing jointly or qualifying surviving spouse'
                },
                {
                  id: '3',
                  title: 'Head of Household',
                  desc: 'Unmarried and paying more than half costs of keeping up home for dependent'
                }
              ].map(opt => {
                const isSelected = formData.filing_status === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, filing_status: opt.id })}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? `border-blue-500 ring-2 ring-blue-500/20 shadow-md ${
                            isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50/80'
                          }`
                        : `hover:border-zinc-500 ${
                            isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
                          }`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-extrabold">{opt.title}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : 'border-zinc-400 dark:border-zinc-600'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
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
        </div>

        {/* --- STEP 2: MULTIPLE JOBS OR SPOUSE WORKS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              2
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 2: Multiple Jobs or Spouse Works</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Complete this step if you (1) hold more than one job at a time, or (2) are married filing jointly and your spouse also works.
          </p>

          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            formData.multiple_jobs_two
              ? isDarkMode ? 'bg-blue-500/10 border-blue-500/40' : 'bg-blue-50 border-blue-300'
              : isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={formData.multiple_jobs_two}
              onChange={e => setFormData({ ...formData, multiple_jobs_two: e.target.checked })}
              className="mt-0.5 rounded border-zinc-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <div>
              <span className="text-xs font-bold block mb-0.5">
                Step 2(c): Two Jobs Total Checkbox
              </span>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Check this box if there are only two jobs total between you and your spouse. This adjusts withholding tables so that sufficient state income tax is withheld across both jobs.
              </p>
            </div>
          </label>
        </div>

        {/* --- STEP 3: CLAIM DEPENDENTS & OTHER CREDITS (INTERACTIVE CALCULATOR) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
                3
              </div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 3: Claim Dependents &amp; Credits</h2>
            </div>
            
            {/* Live Computed Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Calculator size={13} />
              <span className="text-xs font-black">
                Total Credits: ${totalStep3.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            If your income will be $200,000 or less ($400,000 or less if married filing jointly), calculate dependent credits below to reduce withholding:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Qualifying Children (&lt; 17)</span>
                <span className="text-[10px] font-extrabold text-blue-500">$2,000 each</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={formData.kids_under_17}
                  onChange={e => setFormData({ ...formData, kids_under_17: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Subtotal: ${valKids.toLocaleString()}
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Other Dependents</span>
                <span className="text-[10px] font-extrabold text-blue-500">$500 each</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={formData.other_dependents}
                  onChange={e => setFormData({ ...formData, other_dependents: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Subtotal: ${valOthers.toLocaleString()}
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Other Tax Credits ($)</span>
                <span className="text-[10px] font-extrabold text-blue-500">Education, etc.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={formData.other_credits}
                  onChange={e => setFormData({ ...formData, other_credits: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                  placeholder="0.00"
                />
              </div>
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Subtotal: ${otherCreditsVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* --- STEP 4: OPTIONAL STATE ADJUSTMENTS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              4
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 4: Optional State Adjustments</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Fine-tune your New Mexico state withholding amount with optional adjustments below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                4(a): Other Income ($)
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.step4_other_income}
                onChange={e => setFormData({ ...formData, step4_other_income: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
                placeholder="0.00"
              />
              <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Interest, dividends, retirement
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                4(b): Deductions ($)
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.step4_deductions}
                onChange={e => setFormData({ ...formData, step4_deductions: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
                placeholder="0.00"
              />
              <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Excess over standard deduction
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-blue-600 dark:text-blue-400">
                4(c): Extra Withholding ($)
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={formData.step4_extra_withholding}
                onChange={e => setFormData({ ...formData, step4_extra_withholding: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none border-blue-400 ${
                  isDarkMode ? 'bg-[#1c202a] text-white' : 'bg-white text-slate-800'
                }`}
                placeholder="0.00"
              />
              <span className={`text-[10px] mt-1 block font-bold text-blue-500`}>
                Additional NM tax per pay period
              </span>
            </div>
          </div>
        </div>

        {/* --- EXEMPTION FROM WITHHOLDING --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          formData.exempt 
            ? isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50/80 border-amber-300'
            : isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.exempt}
              onChange={e => setFormData({ ...formData, exempt: e.target.checked })}
              className="mt-0.5 rounded border-zinc-400 text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <div>
              <span className="text-xs font-black uppercase tracking-wider block text-amber-600 dark:text-amber-400 mb-1">
                Claim Exemption from New Mexico State Withholding
              </span>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                Check here only if you had no New Mexico tax liability last year and expect to have no tax liability this year (or qualify under the Military Spouses Residency Relief Act / tribal exemption). When claimed, "EXEMPT" will be stamped under Step 4(c) on your form.
              </p>
            </div>
          </label>
        </div>

        {/* --- STEP 5: EMPLOYER INFORMATION (AUTO-POPULATED) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider">
                Employer Section (Auto-Populated for NM TRD Records)
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Employer Name &amp; Address</span>
              <span className="font-extrabold block">{formData.employer_name}</span>
              <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} text-[11px]`}>
                {formData.employer_address}, {formData.employer_city}, {formData.employer_state} {formData.employer_zip}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">First Date of Employment</span>
              <span className="font-extrabold block">{formData.employer_date}</span>
              <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} text-[11px]`}>
                Statutory Payroll Start
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Employer Identification Number (EIN)</span>
              <span className="font-extrabold font-mono block">{formData.employer_ein}</span>
              <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} text-[11px]`}>
                Federal / NM FEIN
              </span>
            </div>
          </div>
        </div>

        {/* --- STEP 6: DIGITAL SIGNATURE & DECLARATION --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <PenTool size={18} className="text-blue-500" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 5: Employee Declaration &amp; Signature</h2>
          </div>

          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Under penalties of perjury, I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete for New Mexico state withholding purposes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
            <div className="sm:col-span-8">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold">Draw Signature Below *</label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Eraser size={12} />
                  <span>Clear Pad</span>
                </button>
              </div>

              <div className={`rounded-xl border overflow-hidden ${
                isDarkMode ? 'bg-[#1c202a] border-zinc-700' : 'bg-white border-slate-300'
              }`}>
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? '#60a5fa' : '#00198c'}
                  canvasProps={{
                    className: 'w-full h-28 cursor-crosshair'
                  }}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold mb-1">Confirmation Date *</label>
              <input
                type="date"
                required
                value={formData.confirmation_date}
                onChange={e => setFormData({ ...formData, confirmation_date: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Date signed by employee
              </span>
            </div>
          </div>
        </div>

        {/* --- SUBMIT ACTION BUTTON --- */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: activeColor }}
            className="w-full sm:w-auto px-8 py-3.5 text-white font-extrabold text-sm rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating Certificate...</span>
              </>
            ) : (
              <>
                <FileText size={16} />
                <span>Complete New Mexico W-4</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default NewMexicoTaxForm;
