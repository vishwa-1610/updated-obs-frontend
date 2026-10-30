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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating West Virginia IT-104</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing West Virginia Employee's Withholding Exemption Certificate...
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

// --- 3. MAIN COMPONENT: WestVirginiaTaxForm ---
const WestVirginiaTaxForm = ({ initialData = {}, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#1e3a8a'; // WV Navy default

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    // Employee Demographics
    first_name: initialData.first_name || '',
    middle_initial: initialData.middle_initial || initialData.initial || '',
    last_name: initialData.last_name || '',
    ssn: initialData.ssn || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || 'WV',
    zipcode: (initialData.zipcode || '').slice(0, 5),

    // Filing Status: '1' = Single, '2' = Married, '3' = Head of Household
    filing_status: initialData.filing_status || '1',
    claim_self: initialData.claim_self !== undefined ? Boolean(initialData.claim_self) : true,
    claim_spouse: Boolean(initialData.claim_spouse ?? false),
    dependents: parseInt(initialData.dependents ?? initialData.line3 ?? 0, 10) || 0,

    // Line 5: Lower Rate / Single Job
    lower_rate: Boolean(initialData.lower_rate ?? false),

    // Line 6: Additional Withholding ($)
    additional_withholding: initialData.additional_withholding ?? initialData.line6_extra ?? '',

    // Nonresident Exemption (Form WV/IT-104NR)
    use_nonresidence: Boolean(initialData.use_nonresidence ?? initialData.is_nonresident ?? initialData.exempt ?? false),
    nonresident_type: initialData.military_exempt ? 'military' : 'reciprocal',
    nonresident_state: initialData.nonresident_state || initialData.other_state_name || '',

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
        address: initialData.address || prev.address,
        city: initialData.city || prev.city,
        state: initialData.state || prev.state || 'WV',
        zipcode: (initialData.zipcode || prev.zipcode || '').slice(0, 5),
        filing_status: initialData.filing_status || prev.filing_status,
        claim_self: initialData.claim_self !== undefined ? Boolean(initialData.claim_self) : prev.claim_self,
        claim_spouse: Boolean(initialData.claim_spouse ?? prev.claim_spouse),
        dependents: parseInt(initialData.dependents ?? prev.dependents, 10) || 0,
        lower_rate: Boolean(initialData.lower_rate ?? prev.lower_rate),
        additional_withholding: initialData.additional_withholding ?? prev.additional_withholding,
        use_nonresidence: Boolean(initialData.use_nonresidence ?? initialData.is_nonresident ?? initialData.exempt ?? prev.use_nonresidence),
        nonresident_state: initialData.nonresident_state || initialData.other_state_name || prev.nonresident_state
      }));
    }
  }, [initialData]);

  // Derived Calculations
  const isSingle = formData.filing_status === '1';
  const isMarried = formData.filing_status === '2';
  const isHOH = formData.filing_status === '3';

  // Line 1: Single Exemption (1 if single/HOH claiming self, else 0)
  const line1Val = (isSingle || isHOH) ? (formData.claim_self ? 1 : 0) : 0;

  // Line 2: Married Exemptions (2 if both claimed, 1 if one claimed, 0 if neither)
  let line2Val = 0;
  if (isMarried) {
    if (formData.claim_self && formData.claim_spouse) {
      line2Val = 2;
    } else if (formData.claim_self || formData.claim_spouse) {
      line2Val = 1;
    } else {
      line2Val = 0;
    }
  }

  // Line 3: Dependents
  const line3Val = Math.max(0, parseInt(formData.dependents, 10) || 0);

  // Line 4: Total Exemptions
  const totalExemptions = formData.use_nonresidence ? 0 : (line1Val + line2Val + line3Val);

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
        message: "Please enter your first and last legal name."
      });
      return;
    }

    const cleanSSN = formData.ssn.replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      setErrorModal({
        isOpen: true,
        title: "Invalid SSN",
        message: "Please enter a valid 9-digit Social Security Number."
      });
      return;
    }

    if (!formData.address.trim() || !formData.city.trim() || formData.zipcode.length < 5) {
      setErrorModal({
        isOpen: true,
        title: "Incomplete Address",
        message: "Please provide your permanent street address, city, and 5-digit ZIP code."
      });
      return;
    }

    if (formData.use_nonresidence) {
      if (!formData.nonresident_state.trim()) {
        setErrorModal({
          isOpen: true,
          title: "Nonresident State Required",
          message: "Please enter or select your legal state of nonresidence to claim Form WV/IT-104NR exemption."
        });
        return;
      }
      if (formData.nonresident_type === 'reciprocal' && !['KY', 'MD', 'OH', 'PA', 'VA'].includes(formData.nonresident_state)) {
        setErrorModal({
          isOpen: true,
          title: "Invalid Reciprocal State",
          message: "West Virginia reciprocity only applies to residents of Kentucky (KY), Maryland (MD), Ohio (OH), Pennsylvania (PA), or Virginia (VA)."
        });
        return;
      }
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
        message: "Please sign in the certification box to certify your West Virginia withholding certificate."
      });
      return;
    }

    const payload = {
      ...formData,
      state: 'WV',
      state_code: 'WV',
      signature_image: sigDataUrl,
      line1: line1Val,
      line2: line2Val,
      line3: line3Val,
      line4: totalExemptions,
      total_exemptions: totalExemptions,
      exemptions: totalExemptions,
      lower_rate: formData.lower_rate,
      additional_withholding: parseFloat(formData.additional_withholding) || 0,
      line6_extra: parseFloat(formData.additional_withholding) || 0,
      use_nonresidence: formData.use_nonresidence,
      is_nonresident: formData.use_nonresidence,
      exempt: formData.use_nonresidence,
      military_spouse: formData.use_nonresidence && formData.nonresident_type === 'military',
      military_exempt: formData.use_nonresidence && formData.nonresident_type === 'military',
      nonresident_state: formData.nonresident_state.toUpperCase()
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
        message: err?.response?.data?.error || err.message || "Failed to submit West Virginia Form WV IT-104. Please try again."
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
          ? `linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)`
          : `linear-gradient(135deg, ${activeColor}08 0%, ${activeColor}15 100%)`
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-blue-500 bg-blue-500/10 border border-blue-500/20">
                <Landmark size={12} />
                State of West Virginia
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-600'
              }`}>
                State Tax Department &bull; W. Va. Code § 11-21-71
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Employee's Withholding Exemption Certificate (Form WV IT-104)
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Complete this form and present it to your employer to determine your West Virginia state income tax withholding, or certify nonresidence under reciprocal state agreements or military spouse relief.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Official Certificate</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">WV IT-104 / IT-104NR</span>
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
              <label className="block text-xs font-bold mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="JOHN"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1">M.I.</label>
              <input
                type="text"
                maxLength={1}
                value={formData.middle_initial}
                onChange={e => setFormData({ ...formData, middle_initial: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-center outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="A"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="DOE"
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
              <label className="block text-xs font-bold mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="100 KANAWHA BLVD"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="CHARLESTON"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-1">State</label>
              <input
                type="text"
                maxLength={2}
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-center uppercase outline-none ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="WV"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold mb-1">ZIP Code (5 Digits) *</label>
              <input
                type="text"
                required
                maxLength={5}
                value={formData.zipcode}
                onChange={e => setFormData({ ...formData, zipcode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="25301"
              />
            </div>
          </div>
        </div>

        {/* --- STEP 2: FILING STATUS & EXEMPTIONS (LINES 1 - 4) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              2
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Filing Status &amp; Exemptions (Lines 1 &ndash; 4)</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Select your marital status and exemptions to calculate Line 4 total withholding exemptions:
          </p>

          {/* Filing Status Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              formData.filing_status === '1'
                ? `border-blue-500/80 bg-blue-500/10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="filing_status"
                  value="1"
                  checked={formData.filing_status === '1'}
                  onChange={e => setFormData({ ...formData, filing_status: e.target.value })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold block">Single</span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Line 1 Applies</span>
                </div>
              </div>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              formData.filing_status === '2'
                ? `border-blue-500/80 bg-blue-500/10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="filing_status"
                  value="2"
                  checked={formData.filing_status === '2'}
                  onChange={e => setFormData({ ...formData, filing_status: e.target.value })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold block">Married</span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Line 2 Applies</span>
                </div>
              </div>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              formData.filing_status === '3'
                ? `border-blue-500/80 bg-blue-500/10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="filing_status"
                  value="3"
                  checked={formData.filing_status === '3'}
                  onChange={e => setFormData({ ...formData, filing_status: e.target.value })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold block">Head of Household</span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Single Rate</span>
                </div>
              </div>
            </label>
          </div>

          <div className="space-y-3">
            {/* If Single or Head of Household */}
            {(isSingle || isHOH) && (
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                formData.claim_self
                  ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                  : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
              }`}>
                <input
                  type="checkbox"
                  checked={formData.claim_self}
                  onChange={e => setFormData({ ...formData, claim_self: e.target.checked })}
                  className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <div className="flex-1 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold block mb-0.5">Line 1: Exemption for Yourself</span>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      If you are single/head of household and claim an exemption, enter '1'; if you do not, enter '0'.
                    </p>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    {line1Val}
                  </span>
                </div>
              </label>
            )}

            {/* If Married */}
            {isMarried && (
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.claim_self
                    ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                    : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.claim_self}
                    onChange={e => setFormData({ ...formData, claim_self: e.target.checked })}
                    className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold block mb-0.5">Line 2(a/b): Claim Exemption for Yourself</span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>+1 Exemption</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.claim_spouse
                    ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                    : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.claim_spouse}
                    onChange={e => setFormData({ ...formData, claim_spouse: e.target.checked })}
                    className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold block mb-0.5">Line 2(a/b): Claim Exemption for Spouse</span>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      If spouse does not claim exemption on another certificate (+1 Exemption).
                    </p>
                  </div>
                </label>

                <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Line 2: Total Married Exemptions:
                  </span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 px-3 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-blue-500/30">
                    {line2Val}
                  </span>
                </div>
              </div>
            )}

            {/* Line 3: Dependents */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <span className="text-xs font-bold block mb-0.5">Line 3: Exemptions for Dependents</span>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter number of qualifying dependents you will claim on your West Virginia return.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={0}
                  value={formData.dependents}
                  onChange={e => setFormData({ ...formData, dependents: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className={`w-20 px-3 py-2 rounded-xl border text-xs font-bold text-center outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Line 4: Total Exemptions */}
            <div className="p-4 rounded-xl border bg-blue-600/10 border-blue-600/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 block">
                  Line 4: Total Exemptions Claimed (Lines 1 + 2 + 3):
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  West Virginia withholding allowance total
                </span>
              </div>
              <span className="text-xl font-black text-blue-700 dark:text-blue-300 px-3.5 py-1 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-blue-500/40">
                {totalExemptions}
              </span>
            </div>
          </div>
        </div>

        {/* --- STEP 3: LOWER RATE & ADDITIONAL WITHHOLDING (LINES 5 - 6) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              3
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Withholding Rate Adjustments (Lines 5 &ndash; 6)</h2>
          </div>

          <div className="space-y-4">
            {/* Line 5: Lower Rate */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.lower_rate
                ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                checked={formData.lower_rate}
                onChange={e => setFormData({ ...formData, lower_rate: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">
                  Line 5: Withhold at a Lower Rate (Check Box)
                </span>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Check this box if you are Single, Head of Household, or Married and your spouse does not work, and you are receiving wages from only one job.
                </p>
              </div>
            </label>

            {/* Line 6: Additional Withholding */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Line 6: Additional Withholding per Pay Period ($)</span>
                <span className="text-[10px] font-extrabold text-blue-500">Voluntary Agreement</span>
              </div>
              <div className="relative max-w-xs">
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
            </div>
          </div>
        </div>

        {/* --- STEP 4: NONRESIDENT EXEMPTION (FORM WV/IT-104NR) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          formData.use_nonresidence
            ? 'border-amber-500 bg-amber-500/10'
            : isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              4
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">
              Certificate of Nonresidence (Form WV/IT-104NR)
            </h2>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={formData.use_nonresidence}
              onChange={e => setFormData({ ...formData, use_nonresidence: e.target.checked })}
              className="mt-0.5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 shrink-0"
            />
            <div>
              <span className="text-xs font-bold block mb-0.5">
                I certify that I am a Nonresident and exempt from West Virginia income tax withholding
              </span>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Qualifies under a Reciprocal State Agreement (KY, MD, OH, PA, VA) or as a Military Spouse under the Servicemembers Civil Relief Act (SCRA / MSRRA).
              </p>
            </div>
          </label>

          {formData.use_nonresidence && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold mb-2">Exemption Category *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 ${
                    formData.nonresident_type === 'reciprocal' 
                      ? 'border-amber-500 bg-amber-500/20 font-bold' 
                      : 'border-zinc-700/60'
                  }`}>
                    <input
                      type="radio"
                      name="nonresident_type"
                      value="reciprocal"
                      checked={formData.nonresident_type === 'reciprocal'}
                      onChange={e => setFormData({ ...formData, nonresident_type: e.target.value })}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs">Reciprocal State Resident (KY, MD, OH, PA, VA)</span>
                  </label>

                  <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 ${
                    formData.nonresident_type === 'military' 
                      ? 'border-amber-500 bg-amber-500/20 font-bold' 
                      : 'border-zinc-700/60'
                  }`}>
                    <input
                      type="radio"
                      name="nonresident_type"
                      value="military"
                      checked={formData.nonresident_type === 'military'}
                      onChange={e => setFormData({ ...formData, nonresident_type: e.target.value })}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs">Military Spouse Relief Act (MSRRA / SCRA)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {formData.nonresident_type === 'reciprocal' ? 'Reciprocal State of Residence *' : 'Legal Domicile State Outside WV *'}
                </label>
                {formData.nonresident_type === 'reciprocal' ? (
                  <select
                    required
                    value={formData.nonresident_state}
                    onChange={e => setFormData({ ...formData, nonresident_state: e.target.value })}
                    className={`w-64 px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                      isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="">Select Reciprocal State...</option>
                    <option value="KY">KY - Kentucky</option>
                    <option value="MD">MD - Maryland</option>
                    <option value="OH">OH - Ohio</option>
                    <option value="PA">PA - Pennsylvania</option>
                    <option value="VA">VA - Virginia</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.nonresident_state}
                    onChange={e => setFormData({ ...formData, nonresident_state: e.target.value.toUpperCase() })}
                    className={`w-40 px-3.5 py-2.5 rounded-xl border text-xs font-bold uppercase outline-none ${
                      isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                    placeholder="e.g. TX, CA, NC"
                  />
                )}
                <span className={`text-[10px] mt-1.5 block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {formData.nonresident_type === 'reciprocal' 
                    ? 'West Virginia reciprocity agreement applies exclusively to KY, MD, OH, PA, and VA.' 
                    : 'Civilian spouse domicile maintained under federal SCRA guidelines.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* --- REAL-TIME WEST VIRGINIA WITHHOLDING SUMMARY --- */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">West Virginia IT-104 Summary</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Certificate Preview
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Filing Status</span>
              <span className="text-xs font-black text-blue-500">
                {isSingle ? 'Single (Line 1)' : (isMarried ? 'Married (Line 2)' : 'HOH (Line 1)')}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Total Exempt (Line 4)</span>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">{totalExemptions}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Lower Rate (Line 5)</span>
              <span className={`text-xs font-black ${formData.lower_rate ? 'text-emerald-500' : 'text-slate-400'}`}>
                {formData.lower_rate ? 'Yes (Checked)' : 'No'}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Certificate Type</span>
              <span className={`text-xs font-black ${formData.use_nonresidence ? 'text-amber-500' : 'text-emerald-500'}`}>
                {formData.use_nonresidence ? `IT-104NR (${formData.nonresident_state || 'Exempt'})` : 'WV IT-104 (Resident)'}
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

          <div className="p-3.5 rounded-xl border mb-6 bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400">
            <p className="text-xs leading-relaxed font-medium">
              <strong>I certify, under penalties provided by law</strong>, that the number of exemptions claimed in this certificate is not in excess of those to which I am entitled, or that I am exempt as a certified nonresident.
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
                  : 'bg-white border-slate-300 hover:border-blue-400'
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
                    isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider text-white shadow-xl transition-all duration-200 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: activeColor }}
              >
                <span>Confirm &amp; Generate Form WV IT-104</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default WestVirginiaTaxForm;
