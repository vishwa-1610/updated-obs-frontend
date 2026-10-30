import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, Eraser, PenTool, FileText, Calculator, 
  Loader2, XCircle, CheckCircle2, AlertTriangle, Info, Building2, 
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Wisconsin WT-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Employee's Wisconsin Withholding Exemption Certificate...
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

// --- 3. MAIN COMPONENT: WisconsinTaxForm ---
const WisconsinTaxForm = ({ initialData = {}, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#b91c1c'; // Wisconsin Badger Red default

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
    state: initialData.state || 'WI',
    zipcode: (initialData.zipcode || '').slice(0, 5),
    date_of_birth: initialData.date_of_birth || initialData.dob || '',
    date_of_hire: initialData.date_of_hire || initialData.doh || new Date().toISOString().split('T')[0],

    // Filing Status: '1' = Single, '2' = Married, '3' = Married at Higher Single Rate
    filing_status_wi: initialData.filing_status_wi || initialData.filing_status || '1',

    // Line 1: Exemptions
    claim_self: initialData.claim_self !== undefined ? Boolean(initialData.claim_self) : true,
    claim_spouse: Boolean(initialData.claim_spouse ?? false),
    spouse_works: Boolean(initialData.spouse_works ?? false),
    dependents: parseInt(initialData.dependents ?? initialData.line1c ?? 0, 10) || 0,

    // Line 2: Additional Withholding ($)
    additional_withholding: initialData.additional_withholding ?? initialData.line2 ?? '',

    // Line 3: Complete Exemption
    exempt: Boolean(initialData.exempt ?? initialData.line3 ?? false),

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
        state: initialData.state || prev.state || 'WI',
        zipcode: (initialData.zipcode || prev.zipcode || '').slice(0, 5),
        date_of_birth: initialData.date_of_birth || initialData.dob || prev.date_of_birth,
        date_of_hire: initialData.date_of_hire || initialData.doh || prev.date_of_hire,
        filing_status_wi: initialData.filing_status_wi || initialData.filing_status || prev.filing_status_wi,
        claim_self: initialData.claim_self !== undefined ? Boolean(initialData.claim_self) : prev.claim_self,
        claim_spouse: Boolean(initialData.claim_spouse ?? prev.claim_spouse),
        spouse_works: Boolean(initialData.spouse_works ?? prev.spouse_works),
        dependents: parseInt(initialData.dependents ?? initialData.line1c ?? prev.dependents, 10) || 0,
        additional_withholding: initialData.additional_withholding ?? initialData.line2 ?? prev.additional_withholding,
        exempt: Boolean(initialData.exempt ?? initialData.line3 ?? prev.exempt)
      }));
    }
  }, [initialData]);

  // Derived Calculations
  const isSingle = formData.filing_status_wi === '1';
  const isMarried = formData.filing_status_wi === '2';
  const isHigherSingle = formData.filing_status_wi === '3';

  // Line 1(a): Self
  const line1aVal = formData.claim_self ? 1 : 0;

  // Line 1(b): Spouse (1 if married and spouse doesn't claim on own certificate)
  const line1bVal = isMarried && formData.claim_spouse ? 1 : 0;

  // Line 1(c): Dependents
  const line1cVal = Math.max(0, parseInt(formData.dependents, 10) || 0);

  // Line 1(d): Total Exemptions
  const totalExemptions = formData.exempt ? 0 : (line1aVal + line1bVal + line1cVal);

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

    // Capture Signature Data
    let sigDataUrl = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sigDataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    }

    if (!sigDataUrl) {
      setErrorModal({
        isOpen: true,
        title: "Signature Required",
        message: "Please sign in the certification box to certify your Wisconsin Form WT-4."
      });
      return;
    }

    const payload = {
      ...formData,
      state: 'WI',
      state_code: 'WI',
      signature_image: sigDataUrl,
      line1a: line1aVal,
      line1b: line1bVal,
      line1c: line1cVal,
      line1d: totalExemptions,
      total_exemptions: totalExemptions,
      exemptions: totalExemptions,
      additional_withholding: parseFloat(formData.additional_withholding) || 0,
      line2: parseFloat(formData.additional_withholding) || 0,
      exempt: formData.exempt,
      line3: formData.exempt ? 'EXEMPT' : ''
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
        message: err?.response?.data?.error || err.message || "Failed to submit Wisconsin Form WT-4. Please try again."
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
          ? `linear-gradient(135deg, rgba(185, 28, 28, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)`
          : `linear-gradient(135deg, ${activeColor}08 0%, ${activeColor}15 100%)`
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-red-500 bg-red-500/10 border border-red-500/20">
                <Landmark size={12} />
                State of Wisconsin
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-600'
              }`}>
                Department of Revenue &bull; Wis. Stats. Chapter 71 &amp; 103
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Employee's Wisconsin Withholding Exemption Certificate (Form WT-4)
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Every newly hired employee in Wisconsin must complete Form WT-4 for New Hire Reporting and to determine the amount of Wisconsin income tax to be withheld from wages.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl border border-red-500/20 bg-red-500/5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">Official Certificate</span>
            <span className="text-xs font-black text-red-600 dark:text-red-400">Form WT-4 / W-204</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* --- STEP 1: PERSONAL INFORMATION & NEW HIRE REPORTING --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              1
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 1: Employee's Section</h2>
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
                }`}
                placeholder="XXX-XX-XXXX"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-bold mb-1">Date of Birth (DOB) *</label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
                }`}
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
                }`}
                placeholder="100 STATE STREET"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-bold mb-1">Date of Hire (DOH) *</label>
              <input
                type="date"
                required
                value={formData.date_of_hire}
                onChange={e => setFormData({ ...formData, date_of_hire: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
                }`}
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
                }`}
                placeholder="MADISON"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-1">State</label>
              <input
                type="text"
                disabled
                value="WI"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-center ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-200 border-slate-300 text-slate-600'
                }`}
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
                }`}
                placeholder="53703"
              />
            </div>
          </div>
        </div>

        {/* --- STEP 2: MARITAL / FILING STATUS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              2
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 2: Marital Status</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Check the box that corresponds to your Wisconsin withholding filing status:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              formData.filing_status_wi === '1'
                ? `border-red-500/80 bg-red-500/10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="radio"
                name="filing_status_wi"
                value="1"
                checked={formData.filing_status_wi === '1'}
                onChange={e => setFormData({ ...formData, filing_status_wi: e.target.value })}
                className="mt-0.5 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">Single</span>
                <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Single or legally separated
                </span>
              </div>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              formData.filing_status_wi === '2'
                ? `border-red-500/80 bg-red-500/10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="radio"
                name="filing_status_wi"
                value="2"
                checked={formData.filing_status_wi === '2'}
                onChange={e => setFormData({ ...formData, filing_status_wi: e.target.value })}
                className="mt-0.5 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">Married</span>
                <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Standard married rate
                </span>
              </div>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              formData.filing_status_wi === '3'
                ? `border-red-500/80 bg-red-500/10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="radio"
                name="filing_status_wi"
                value="3"
                checked={formData.filing_status_wi === '3'}
                onChange={e => setFormData({ ...formData, filing_status_wi: e.target.value })}
                className="mt-0.5 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">Married (Higher Single Rate)</span>
                <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Both spouses work / multiple jobs
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* --- STEP 3: FIGURE TOTAL WITHHOLDING EXEMPTIONS (LINES 1a - 1d) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              3
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Figure Total Withholding Exemptions (Line 1)</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Complete Lines 1(a) through 1(d) to calculate your total Wisconsin withholding exemptions:
          </p>

          <div className="space-y-3">
            {/* Line 1(a): Yourself */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.claim_self
                ? `border-red-500/60 bg-red-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                checked={formData.claim_self}
                onChange={e => setFormData({ ...formData, claim_self: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-red-600 focus:ring-red-500 shrink-0"
              />
              <div className="flex-1 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold block mb-0.5">Line 1(a): Exemption for Yourself</span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Enter 1 for yourself if no one else claims you as a dependent (+1 Exemption).
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                  {line1aVal}
                </span>
              </div>
            </label>

            {/* Line 1(b): Spouse */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
              !isMarried
                ? 'opacity-50 cursor-not-allowed bg-zinc-800/20 border-zinc-800'
                : formData.claim_spouse
                  ? `cursor-pointer border-red-500/60 bg-red-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                  : `cursor-pointer border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                disabled={!isMarried}
                checked={isMarried && formData.claim_spouse}
                onChange={e => setFormData({ ...formData, claim_spouse: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-red-600 focus:ring-red-500 shrink-0"
              />
              <div className="flex-1 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold block mb-0.5">Line 1(b): Exemption for Your Spouse</span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {isMarried 
                      ? "Enter 1 for your spouse if not claimed on your spouse's own Form WT-4 (+1 Exemption)." 
                      : "Only applicable if filing status is Married."}
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                  {line1bVal}
                </span>
              </div>
            </label>

            {/* Line 1(c): Dependents */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <span className="text-xs font-bold block mb-0.5">Line 1(c): Exemption(s) for Dependent(s)</span>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  You are entitled to claim an exemption for each dependent you claim on your Wisconsin return.
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

            {/* Line 1(d): Total Exemptions */}
            <div className="p-4 rounded-xl border bg-red-600/10 border-red-600/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-red-700 dark:text-red-300 block">
                  Line 1(d): Total Withholding Exemptions (Add lines a through c):
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Wisconsin standard withholding total
                </span>
              </div>
              <span className="text-xl font-black text-red-700 dark:text-red-300 px-3.5 py-1 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-red-500/40">
                {totalExemptions}
              </span>
            </div>
          </div>
        </div>

        {/* --- STEP 4: ADDITIONAL WITHHOLDING & COMPLETE EXEMPTION (LINES 2 - 3) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              4
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Additional Withholding &amp; Exemption (Lines 2 &ndash; 3)</h2>
          </div>

          <div className="space-y-4">
            {/* Line 2: Additional Withholding */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Line 2: Additional Amount per Pay Period Deducted ($)</span>
                <span className="text-[10px] font-extrabold text-red-500">Employer Agreement</span>
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

            {/* Line 3: Complete Exemption */}
            <div className={`p-4 rounded-xl border transition-all ${
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
                  <span className="text-xs font-bold block mb-0.5">
                    Line 3: I claim complete exemption from Wisconsin withholding (Enter "Exempt")
                  </span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    I certify that I incurred no liability for Wisconsin income tax for last year and that I anticipate that I will incur no liability for Wisconsin income tax for this year.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* --- REAL-TIME WISCONSIN WITHHOLDING SUMMARY --- */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-red-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">Wisconsin Form WT-4 Summary</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              Certificate Preview
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Filing Status</span>
              <span className="text-xs font-black text-red-500">
                {isSingle ? 'Single' : (isMarried ? 'Married' : 'Higher Single')}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Total Exemptions (1d)</span>
              <span className="text-xs font-black text-red-600 dark:text-red-400">{totalExemptions}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Extra Deduction (2)</span>
              <span className="text-xs font-black text-slate-800 dark:text-zinc-100">
                ${parseFloat(formData.additional_withholding || 0).toFixed(2)}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Withholding Status</span>
              <span className={`text-xs font-black ${formData.exempt ? 'text-amber-500' : 'text-emerald-500'}`}>
                {formData.exempt ? 'EXEMPT (Line 3)' : 'Standard Withholding'}
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

          <div className="p-3.5 rounded-xl border mb-6 bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400">
            <p className="text-xs leading-relaxed font-medium">
              <strong>I CERTIFY</strong> that the number of withholding exemptions claimed on this certificate does not exceed the number to which I am entitled. If claiming complete exemption from withholding, I certify that I incurred no liability for Wisconsin income tax for last year and that I anticipate that I will incur no liability for Wisconsin income tax for this year.
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
                  : 'bg-white border-slate-300 hover:border-red-400'
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
                    isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-red-500' : 'bg-white border-slate-300 text-slate-800 focus:border-red-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider text-white shadow-xl transition-all duration-200 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: activeColor }}
              >
                <span>Confirm &amp; Generate Form WT-4</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default WisconsinTaxForm;
