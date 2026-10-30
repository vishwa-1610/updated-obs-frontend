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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating North Dakota W-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing North Dakota Employee's Withholding Certificate...
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
            Review &amp; Complete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN COMPONENT: NorthDakotaTaxForm ---
const NorthDakotaTaxForm = ({ initialData = {}, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#1e3a8a';

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
    state: 'ND',
    zipcode: (initialData.zipcode || '').slice(0, 5),

    // Step 1(c): Filing Status ('single', 'married', 'hoh')
    filing_status: initialData.filing_status || 'single',

    // Step 2: Multiple Jobs or Spouse Works
    step2_multiple_jobs: Boolean(initialData.step2_multiple_jobs || initialData.multiple_jobs || initialData.step2c),

    // Step 3: Claim Dependents
    step3_qualifying_children: initialData.step3_qualifying_children ?? initialData.num_qualifying_children ?? 0,
    step3_other_dependents: initialData.step3_other_dependents ?? initialData.num_other_dependents ?? 0,

    // Step 4: Optional State Withholding Adjustments
    step4_other_income: initialData.step4_other_income ?? initialData.step4a_other_income ?? '',
    step4_deductions: initialData.step4_deductions ?? initialData.step4b_deductions ?? '',
    additional_withholding: initialData.additional_withholding ?? initialData.step4_extra_withholding ?? '',

    // Exemption / Reciprocity Claim (N.D.C.C. § 57-38-59 or MN/MT reciprocity)
    is_exempt: Boolean(initialData.is_exempt || initialData.exempt_status || initialData.exempt),
    exempt_reason: initialData.exempt_reason || 'EXEMPT (N.D.C.C. § 57-38-59)',

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
        state: 'ND',
        zipcode: (initialData.zipcode || prev.zipcode || '').slice(0, 5),
        filing_status: initialData.filing_status || prev.filing_status,
        step2_multiple_jobs: Boolean(initialData.step2_multiple_jobs ?? prev.step2_multiple_jobs),
        step3_qualifying_children: initialData.step3_qualifying_children ?? prev.step3_qualifying_children,
        step3_other_dependents: initialData.step3_other_dependents ?? prev.step3_other_dependents,
        step4_other_income: initialData.step4_other_income ?? prev.step4_other_income,
        step4_deductions: initialData.step4_deductions ?? prev.step4_deductions,
        additional_withholding: initialData.additional_withholding ?? initialData.step4_extra_withholding ?? prev.additional_withholding,
        is_exempt: Boolean(initialData.is_exempt ?? prev.is_exempt)
      }));
    }
  }, [initialData]);

  // Derived Step 3 Dependent Credits
  const childCredit = (parseInt(formData.step3_qualifying_children, 10) || 0) * 2000;
  const otherCredit = (parseInt(formData.step3_other_dependents, 10) || 0) * 500;
  const totalDependentCredit = childCredit + otherCredit;

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

    if (!formData.address.trim() || !formData.city.trim() || !formData.zipcode.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Address",
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
        message: "Please sign in the certification box to certify your North Dakota Withholding Certificate."
      });
      return;
    }

    const payload = {
      ...formData,
      state: 'ND',
      state_code: 'ND',
      signature_image: sigDataUrl,
      step3_qualifying_children: parseInt(formData.step3_qualifying_children, 10) || 0,
      step3_other_dependents: parseInt(formData.step3_other_dependents, 10) || 0,
      step3_children_amount: childCredit,
      step3_other_amount: otherCredit,
      step3_total: totalDependentCredit,
      step4_other_income: parseFloat(formData.step4_other_income) || 0,
      step4_deductions: parseFloat(formData.step4_deductions) || 0,
      additional_withholding: parseFloat(formData.additional_withholding) || 0
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
        message: err?.response?.data?.error || err.message || "Failed to submit North Dakota Form W-4. Please try again."
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-blue-500 bg-blue-500/10 border border-blue-500/20">
                <Landmark size={12} />
                State of North Dakota
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-600'
              }`}>
                Office of State Tax Commissioner &bull; N.D.C.C. § 57-38-59
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Employee's Withholding Certificate (Form W-4)
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Complete this withholding certificate so that your employer can withhold the correct North Dakota state income tax from your wages pursuant to state withholding guidelines.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Official Form</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">ND Tax Form W-4</span>
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
              <label className="block text-xs font-bold mb-1">Permanent Home Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="100 STATE CAPITOL WAY"
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
                placeholder="BISMARCK"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-1">State</label>
              <input
                type="text"
                disabled
                value="ND"
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
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="58501"
              />
            </div>
          </div>
        </div>

        {/* --- STEP 1(c): FILING STATUS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              1c
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 1(c): Marital &amp; Filing Status *</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'single',
                title: 'Single / Separate',
                desc: 'Single or Married filing separately'
              },
              {
                id: 'married',
                title: 'Married Filing Jointly',
                desc: 'Married filing jointly or Qualifying surviving spouse'
              },
              {
                id: 'hoh',
                title: 'Head of Household',
                desc: 'Unmarried and pay more than half the costs of keeping up a home'
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
            Complete this step if you hold more than one job at a time, or you are married filing jointly and your spouse also works:
          </p>

          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            formData.step2_multiple_jobs
              ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
              : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
          }`}>
            <input
              type="checkbox"
              checked={formData.step2_multiple_jobs}
              onChange={e => setFormData({ ...formData, step2_multiple_jobs: e.target.checked })}
              className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
            />
            <div>
              <span className="text-xs font-bold block mb-0.5">
                Step 2(c): Two Jobs Total / Working Spouse
              </span>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Check this box if there are only two jobs total. Both you and your spouse should check this box on each Form W-4 for accurate North Dakota tax withholding.
              </p>
            </div>
          </label>
        </div>

        {/* --- STEP 3: CLAIM DEPENDENTS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              3
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Step 3: Claim Dependents &amp; Tax Credits</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            If your total income will be $200,000 or less ($400,000 or less if married filing jointly), calculate dependent tax credits:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold">Qualifying Children Under 17</span>
                <span className="text-[10px] font-extrabold text-blue-500">&times; $2,000</span>
              </div>
              <input
                type="number"
                min={0}
                value={formData.step3_qualifying_children}
                onChange={e => setFormData({ ...formData, step3_qualifying_children: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                  isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Credit Subtotal: ${childCredit.toLocaleString()}
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold">Other Dependents</span>
                <span className="text-[10px] font-extrabold text-blue-500">&times; $500</span>
              </div>
              <input
                type="number"
                min={0}
                value={formData.step3_other_dependents}
                onChange={e => setFormData({ ...formData, step3_other_dependents: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                  isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Credit Subtotal: ${otherCredit.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border bg-blue-500/5 border-blue-500/20 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Total Dependent Tax Credits (Step 3 Line 3):</span>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400">${totalDependentCredit.toLocaleString()}</span>
          </div>
        </div>

        {/* --- STEP 4: OPTIONAL OTHER ADJUSTMENTS --- */}
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
            Fine-tune your North Dakota state income tax withholding:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 4(a): Other Income */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">4(a): Other Income</span>
                <span className="text-[10px] font-extrabold text-blue-500">Annual ($)</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.step4_other_income}
                  onChange={e => setFormData({ ...formData, step4_other_income: e.target.value })}
                  className={`w-full pl-7 pr-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                  placeholder="0.00"
                />
              </div>
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Interest, dividends, or retirement income
              </span>
            </div>

            {/* Step 4(b): Deductions */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">4(b): Deductions</span>
                <span className="text-[10px] font-extrabold text-blue-500">Annual ($)</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.step4_deductions}
                  onChange={e => setFormData({ ...formData, step4_deductions: e.target.value })}
                  className={`w-full pl-7 pr-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                  placeholder="0.00"
                />
              </div>
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Deductions exceeding standard deduction
              </span>
            </div>

            {/* Step 4(c): Extra Withholding */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">4(c): Extra Withholding</span>
                <span className="text-[10px] font-extrabold text-emerald-500">Per Pay Period ($)</span>
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
                Additional state tax per pay period
              </span>
            </div>
          </div>
        </div>

        {/* --- EXEMPTION / RECIPROCITY CLAIM --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-blue-500" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Statutory Exemption &amp; Reciprocity</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Under N.D.C.C. § 57-38-59 and reciprocity agreements with Minnesota and Montana:
          </p>

          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all mb-3 ${
            formData.is_exempt
              ? `border-amber-500/60 bg-amber-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
              : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
          }`}>
            <input
              type="checkbox"
              checked={formData.is_exempt}
              onChange={e => setFormData({ ...formData, is_exempt: e.target.checked })}
              className="mt-0.5 rounded border-zinc-600 text-amber-600 focus:ring-amber-500 shrink-0"
            />
            <div>
              <span className="text-xs font-bold block mb-0.5">
                Claim Exemption from North Dakota Income Tax Withholding
              </span>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Check this box if you incurred no North Dakota tax liability last year, expect none this year, or qualify under reciprocity.
              </p>
            </div>
          </label>

          {formData.is_exempt && (
            <div className="animate-in fade-in">
              <label className="block text-xs font-bold mb-1">Reason for Exemption</label>
              <input
                type="text"
                value={formData.exempt_reason}
                onChange={e => setFormData({ ...formData, exempt_reason: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
                placeholder="EXEMPT (N.D.C.C. § 57-38-59)"
              />
            </div>
          )}
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
              <strong>Under penalties of perjury</strong>, I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete for North Dakota state tax withholding purposes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-8">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold flex items-center gap-1.5">
                  <PenTool size={13} style={{ color: activeColor }} />
                  Digital Signature *
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
                <span>Confirm &amp; Generate North Dakota W-4</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default NorthDakotaTaxForm;

