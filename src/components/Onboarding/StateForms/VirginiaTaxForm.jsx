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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Virginia VA-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Virginia Employee's Withholding Exemption Certificate...
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

// --- 3. MAIN COMPONENT: VirginiaTaxForm ---
const VirginiaTaxForm = ({ initialData = {}, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#1e3a8a'; // Virginia Navy default

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
    state: initialData.state || 'VA',
    zipcode: (initialData.zipcode || '').slice(0, 5),

    // Personal Exemption Worksheet (Lines 1 - 3)
    line1: initialData.line1 !== undefined ? Boolean(initialData.line1) : true,
    line2: Boolean(initialData.line2 ?? initialData.claim_spouse ?? false),
    line3: parseInt(initialData.line3 ?? initialData.dependents ?? 0, 10) || 0,

    // Age and Blindness Exemptions (Lines 5 & 6)
    line5a: Boolean(initialData.line5a ?? initialData.age_65_self ?? false),
    line5b: Boolean(initialData.line5b ?? initialData.age_65_spouse ?? false),
    line6a: Boolean(initialData.line6a ?? initialData.blind_self ?? false),
    line6b: Boolean(initialData.line6b ?? initialData.blind_spouse ?? false),

    // Line 2: Additional Withholding ($)
    additional_withholding: initialData.additional_withholding ?? initialData.line2_extra ?? '',

    // Exemption Claims (Lines 3 & 4)
    exempt: Boolean(initialData.exempt ?? initialData.no_withholding ?? false),
    military_exempt: Boolean(initialData.military_exempt ?? initialData.military_spouse ?? false),
    other_state_name: initialData.other_state_name || initialData.military_state || '',

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
        state: initialData.state || prev.state || 'VA',
        zipcode: (initialData.zipcode || prev.zipcode || '').slice(0, 5),
        line1: initialData.line1 !== undefined ? Boolean(initialData.line1) : prev.line1,
        line2: Boolean(initialData.line2 ?? initialData.claim_spouse ?? prev.line2),
        line3: parseInt(initialData.line3 ?? initialData.dependents ?? prev.line3, 10) || 0,
        line5a: Boolean(initialData.line5a ?? initialData.age_65_self ?? prev.line5a),
        line5b: Boolean(initialData.line5b ?? initialData.age_65_spouse ?? prev.line5b),
        line6a: Boolean(initialData.line6a ?? initialData.blind_self ?? prev.line6a),
        line6b: Boolean(initialData.line6b ?? initialData.blind_spouse ?? prev.line6b),
        additional_withholding: initialData.additional_withholding ?? initialData.line2_extra ?? prev.additional_withholding,
        exempt: Boolean(initialData.exempt ?? initialData.no_withholding ?? prev.exempt),
        military_exempt: Boolean(initialData.military_exempt ?? initialData.military_spouse ?? prev.military_exempt),
        other_state_name: initialData.other_state_name || prev.other_state_name
      }));
    }
  }, [initialData]);

  // Derived Calculations
  const valLine1 = formData.line1 ? 1 : 0;
  const valLine2 = formData.line2 ? 1 : 0;
  const valLine3 = Math.max(0, parseInt(formData.line3, 10) || 0);
  const subtotalPersonal = valLine1 + valLine2 + valLine3; // Line 4

  const valLine5a = formData.line5a ? 1 : 0;
  const valLine5b = (valLine2 === 1 && formData.line5b) ? 1 : 0;
  const valLine6a = formData.line6a ? 1 : 0;
  const valLine6b = (valLine2 === 1 && formData.line6b) ? 1 : 0;
  const subtotalAgeBlind = valLine5a + valLine5b + valLine6a + valLine6b; // Line 7

  const totalExemptions = (formData.exempt || formData.military_exempt) 
    ? 0 
    : (subtotalPersonal + subtotalAgeBlind); // Line 8 / Line 1c

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

    if (formData.military_exempt && !formData.other_state_name.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Domicile State Required",
        message: "Please enter your legal state of military domicile outside Virginia to claim MSRRA exemption."
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
        message: "Please sign in the certification box to certify your Virginia Form VA-4."
      });
      return;
    }

    const payload = {
      ...formData,
      state: 'VA',
      state_code: 'VA',
      signature_image: sigDataUrl,
      line1: valLine1,
      line2: valLine2,
      line3: valLine3,
      line4: subtotalPersonal,
      line5a: valLine5a,
      line5b: valLine5b,
      line6a: valLine6a,
      line6b: valLine6b,
      line7: subtotalAgeBlind,
      line8: totalExemptions,
      total_exemptions: totalExemptions,
      exemptions: totalExemptions,
      additional_withholding: parseFloat(formData.additional_withholding) || 0,
      line2_extra: parseFloat(formData.additional_withholding) || 0,
      exempt: formData.exempt,
      no_withholding: formData.exempt,
      military_exempt: formData.military_exempt,
      military_spouse: formData.military_exempt
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
        message: err?.response?.data?.error || err.message || "Failed to submit Virginia Form VA-4. Please try again."
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
                Commonwealth of Virginia
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-600'
              }`}>
                Department of Taxation &bull; Code of Virginia § 58.1-461
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Employee's Withholding Exemption Certificate (Form VA-4)
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Use this form to notify your employer whether you are subject to Virginia income tax withholding and how many personal and age/blindness exemptions you are entitled to claim.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Official Certificate</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">Form VA-4</span>
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
                placeholder="100 MAIN STREET"
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
                placeholder="RICHMOND"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-1">State</label>
              <input
                type="text"
                disabled
                value="VA"
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
                placeholder="23219"
              />
            </div>
          </div>
        </div>

        {/* --- STEP 2: PERSONAL EXEMPTIONS (LINES 1 - 4) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              2
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Personal Exemptions (Lines 1 &ndash; 4)</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Calculate personal exemptions claimed on your Virginia tax return:
          </p>

          <div className="space-y-3">
            {/* Line 1: Yourself */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.line1
                ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                checked={formData.line1}
                onChange={e => setFormData({ ...formData, line1: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div className="flex-1 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold block mb-0.5">Line 1: Exemption for Yourself</span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    If you wish to claim an exemption for yourself, check this box (+1 Exemption).
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  {valLine1}
                </span>
              </div>
            </label>

            {/* Line 2: Spouse */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.line2
                ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                checked={formData.line2}
                onChange={e => setFormData({ ...formData, line2: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div className="flex-1 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold block mb-0.5">Line 2: Exemption for Spouse</span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    If you are married and your spouse is not claimed on his or her own certificate (+1 Exemption).
                  </p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  {valLine2}
                </span>
              </div>
            </label>

            {/* Line 3: Dependents */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <span className="text-xs font-bold block mb-0.5">Line 3: Number of Dependents</span>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Dependents you will be allowed to claim on your Virginia return (do not include your spouse).
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

            {/* Line 4 Subtotal */}
            <div className="p-3.5 rounded-xl border bg-blue-500/5 border-blue-500/20 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Line 4: Subtotal Personal Exemptions (Lines 1 &ndash; 3):
              </span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400 px-3 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-blue-500/30">
                {subtotalPersonal}
              </span>
            </div>
          </div>
        </div>

        {/* --- STEP 3: AGE 65+ AND BLINDNESS EXEMPTIONS (LINES 5 - 7) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              3
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Age 65+ &amp; Blindness Exemptions (Lines 5 &ndash; 7)</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Additional exemptions if you or your spouse are age 65 or older, or legally blind:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Line 5a: Age 65 You */}
            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              formData.line5a
                ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                checked={formData.line5a}
                onChange={e => setFormData({ ...formData, line5a: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">Line 5(a): You are 65 or older</span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>+1 Exemption</span>
              </div>
            </label>

            {/* Line 5b: Age 65 Spouse */}
            <label className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
              !formData.line2
                ? 'opacity-50 cursor-not-allowed bg-zinc-800/20 border-zinc-800'
                : formData.line5b
                  ? `cursor-pointer border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                  : `cursor-pointer border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                disabled={!formData.line2}
                checked={formData.line5b && formData.line2}
                onChange={e => setFormData({ ...formData, line5b: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">Line 5(b): Spouse is 65 or older</span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {formData.line2 ? '+1 Exemption (claimed on Line 2)' : 'Requires Line 2 (Spouse claimed)'}
                </span>
              </div>
            </label>

            {/* Line 6a: Blindness You */}
            <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              formData.line6a
                ? `border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                : `border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                checked={formData.line6a}
                onChange={e => setFormData({ ...formData, line6a: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">Line 6(a): You are legally blind</span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>+1 Exemption</span>
              </div>
            </label>

            {/* Line 6b: Blindness Spouse */}
            <label className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
              !formData.line2
                ? 'opacity-50 cursor-not-allowed bg-zinc-800/20 border-zinc-800'
                : formData.line6b
                  ? `cursor-pointer border-blue-500/60 bg-blue-500/5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`
                  : `cursor-pointer border-zinc-700/60 hover:border-zinc-500 ${isDarkMode ? 'bg-[#1c202a]' : 'bg-white'}`
            }`}>
              <input
                type="checkbox"
                disabled={!formData.line2}
                checked={formData.line6b && formData.line2}
                onChange={e => setFormData({ ...formData, line6b: e.target.checked })}
                className="mt-0.5 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">Line 6(b): Spouse is legally blind</span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {formData.line2 ? '+1 Exemption (claimed on Line 2)' : 'Requires Line 2 (Spouse claimed)'}
                </span>
              </div>
            </label>
          </div>

          {/* Line 7 Subtotal */}
          <div className="p-3.5 rounded-xl border bg-blue-500/5 border-blue-500/20 flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Line 7: Subtotal Age &amp; Blindness Exemptions (Lines 5 &ndash; 6):
            </span>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400 px-3 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-blue-500/30">
              {subtotalAgeBlind}
            </span>
          </div>

          {/* Line 8 Total Exemptions */}
          <div className="p-4 rounded-xl border bg-blue-600/10 border-blue-600/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-blue-700 dark:text-blue-300 block">
                Line 8: Total Number of Exemptions (Line 4 + Line 7):
              </span>
              <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Entered on Certificate Line 1(c)
              </span>
            </div>
            <span className="text-xl font-black text-blue-700 dark:text-blue-300 px-3.5 py-1 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-blue-500/40">
              {totalExemptions}
            </span>
          </div>
        </div>

        {/* --- STEP 4: ADDITIONAL WITHHOLDING & EXEMPTIONS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              4
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Additional Withholding &amp; Exemption Claims</h2>
          </div>

          {/* Line 2: Additional Withholding */}
          <div className={`p-4 rounded-xl border mb-4 ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold">Line 2: Additional Withholding Requested ($)</span>
              <span className="text-[10px] font-extrabold text-blue-500">Per Pay Period</span>
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

          {/* Statutory Exemption Toggles */}
          <div className="space-y-3">
            {/* Line 3: General No Withholding */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.exempt
                ? 'border-amber-500 bg-amber-500/10'
                : isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.exempt}
                  onChange={e => setFormData({ ...formData, exempt: e.target.checked, military_exempt: false })}
                  className="mt-0.5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 shrink-0"
                />
                <div>
                  <span className="text-xs font-bold block mb-0.5">
                    Line 3: I certify that I am not subject to Virginia withholding
                  </span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    I meet the statutory conditions set forth in the Form VA-4 instructions (e.g. zero tax liability or statutory exemption).
                  </p>
                </div>
              </label>
            </div>

            {/* Line 4: Military Spouses Residency Relief Act */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.military_exempt
                ? 'border-amber-500 bg-amber-500/10'
                : isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.military_exempt}
                  onChange={e => setFormData({ ...formData, military_exempt: e.target.checked, exempt: false })}
                  className="mt-0.5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 shrink-0"
                />
                <div>
                  <span className="text-xs font-bold block mb-0.5">
                    Line 4: Military Spouses Residency Relief Act Exemption
                  </span>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Civilian spouse of an active-duty military member stationed in Virginia under military orders who maintains domicile in another state under SCRA / MSRRA.
                  </p>
                </div>
              </label>

              {formData.military_exempt && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 animate-in fade-in">
                  <label className="block text-xs font-bold mb-1">Legal State of Domicile (Outside VA) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.other_state_name}
                    onChange={e => setFormData({ ...formData, other_state_name: e.target.value.toUpperCase() })}
                    className={`w-40 px-3 py-2 rounded-xl border text-xs font-bold uppercase outline-none ${
                      isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                    placeholder="e.g. TX, FL, CA"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- REAL-TIME VIRGINIA WITHHOLDING SUMMARY --- */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">Virginia Form VA-4 Summary</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Certificate Preview
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Personal (1a)</span>
              <span className="text-xs font-black text-blue-500">{subtotalPersonal}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Age/Blind (1b)</span>
              <span className="text-xs font-black text-blue-500">{subtotalAgeBlind}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Total Exempt (1c)</span>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">{totalExemptions}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] block font-semibold mb-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Withholding Status</span>
              <span className={`text-xs font-black ${(formData.exempt || formData.military_exempt) ? 'text-amber-500' : 'text-emerald-500'}`}>
                {formData.exempt ? 'EXEMPT (Line 3)' : (formData.military_exempt ? 'MSRRA EXEMPT' : 'Standard')}
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
              <strong>Under penalties of law</strong>, I certify that I am entitled to the number of withholding exemptions claimed on this certificate, or that I am not subject to Virginia withholding.
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
                <span>Confirm &amp; Generate Form VA-4</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default VirginiaTaxForm;
