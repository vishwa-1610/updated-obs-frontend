import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, Eraser, PenTool, FileText, Calculator, 
  Loader2, XCircle, CheckCircle2, AlertTriangle, Info, Building2, 
  MapPin, Check, HeartHandshake, HelpCircle, ArrowRight, RefreshCw, Landmark, Users
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating New York IT-2104</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing New York State, NYC, &amp; Yonkers Employee's Withholding Certificate...
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

// --- 3. MAIN COMPONENT: NewYorkTaxForm ---
const NewYorkTaxForm = ({ initialData = {}, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

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
    apartment: initialData.apartment || '',
    city: initialData.city || '',
    state: initialData.state || 'NY',
    zipcode: initialData.zipcode || '',

    // Filing Status: '1' = Single/HOH, '2' = Married, '3' = Married withhold at higher single rate
    filing_status: initialData.filing_status || '1',

    // Residency Status
    nyc_resident: initialData.nyc_resident || false,
    yonkers_resident: initialData.yonkers_resident || false,

    // Allowances (Lines 1-2)
    allowances: initialData.allowances ?? 1,
    nyc_allowances: initialData.nyc_allowances ?? (initialData.nyc_resident ? 1 : 0),

    // Extra Withholding per Pay Period (Lines 3-5)
    ny_extra: initialData.ny_extra || initialData.additional_withholding || '',
    nyc_extra: initialData.nyc_extra || '',
    yonkers_extra: initialData.yonkers_extra || '',

    // Employer Reporting Questions (Part B)
    over_14: initialData.over_14 || false,
    new_hire: initialData.new_hire || true,
    hire_date: initialData.hire_date || initialData.start_date || new Date().toISOString().split('T')[0],
    health_benefits: initialData.health_benefits || false,
    benefit_date: initialData.benefit_date || '',

    // Signature & Date
    signature_image: initialData.signature_image || null,
    confirmation_date: initialData.confirmation_date || new Date().toISOString().split('T')[0],

    // Employer Info (Auto-populated)
    employer_name: initialData.employer_name || 'Tech Innovators Inc.',
    employer_address: initialData.employer_address || '100 Innovation Way',
    employer_city: initialData.employer_city || 'New York',
    employer_state: initialData.employer_state || 'NY',
    employer_zip: initialData.employer_zip || '10001',
    employer_ein: initialData.employer_ein || '12-3456789'
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
        apartment: initialData.apartment || prev.apartment,
        city: initialData.city || prev.city,
        state: 'NY',
        zipcode: initialData.zipcode || prev.zipcode,
        filing_status: initialData.filing_status || prev.filing_status,
        nyc_resident: initialData.nyc_resident ?? prev.nyc_resident,
        yonkers_resident: initialData.yonkers_resident ?? prev.yonkers_resident,
        allowances: initialData.allowances ?? prev.allowances,
        nyc_allowances: initialData.nyc_allowances ?? prev.nyc_allowances,
        ny_extra: initialData.ny_extra ?? initialData.additional_withholding ?? prev.ny_extra,
        nyc_extra: initialData.nyc_extra ?? prev.nyc_extra,
        yonkers_extra: initialData.yonkers_extra ?? prev.yonkers_extra,
        new_hire: initialData.new_hire ?? prev.new_hire,
        hire_date: initialData.hire_date || initialData.start_date || prev.hire_date,
        health_benefits: initialData.health_benefits ?? prev.health_benefits,
        benefit_date: initialData.benefit_date || prev.benefit_date,
      }));
    }
  }, [initialData]);

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

  // Automatic check for over 14 allowances
  const isOver14 = (parseInt(formData.allowances, 10) || 0) > 14 || formData.over_14;

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
        message: "Please provide your permanent street address, city, and ZIP code."
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
        message: "Please sign in the declaration box to certify your New York withholding certificate."
      });
      return;
    }

    const payload = {
      ...formData,
      state: 'NY',
      state_code: 'NY',
      signature_image: sigDataUrl,
      additional_withholding: formData.ny_extra || 0,
      line1: formData.allowances,
      line2: formData.nyc_resident ? formData.nyc_allowances : 0,
      line3: formData.ny_extra || 0,
      line4: formData.nyc_resident ? (formData.nyc_extra || 0) : 0,
      line5: formData.yonkers_resident ? (formData.yonkers_extra || 0) : 0,
      over_14: isOver14
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
        message: err?.response?.data?.error || err.message || "Failed to submit Form IT-2104. Please try again."
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
                State of New York
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-600'
              }`}>
                Department of Taxation and Finance &bull; Tax Law § 671
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Form IT-2104 Employee's Withholding Certificate
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Complete Form IT-2104 so your employer can withhold the correct New York State, New York City, and City of Yonkers personal income tax from your wages.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Official Form</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">NY IT-2104</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* --- STEP 1: EMPLOYEE INFORMATION --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              1
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Employee Information</h2>
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
                placeholder="John"
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
                placeholder="A"
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
                placeholder="Doe"
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
              <label className="block text-xs font-bold mb-1">Apartment / Suite</label>
              <input
                type="text"
                value={formData.apartment}
                onChange={e => setFormData({ ...formData, apartment: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="Apt 4B"
              />
            </div>

            <div className="sm:col-span-12">
              <label className="block text-xs font-bold mb-1">Permanent Home Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="350 5th Avenue"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">City, Village, or Post Office *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="New York"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-1">State</label>
              <input
                type="text"
                disabled
                value="NY"
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
                placeholder="10118"
              />
            </div>
          </div>
        </div>

        {/* --- STEP 2: MARITAL & FILING STATUS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              2
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Filing Status *</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: '1',
                title: 'Single / Head of Household',
                desc: 'Single, head of household, or married but legally separated'
              },
              {
                id: '2',
                title: 'Married',
                desc: 'Married filing jointly (standard married rate)'
              },
              {
                id: '3',
                title: 'Married (Higher Single Rate)',
                desc: 'Married, but withhold at higher Single rate (recommended if both spouses work)'
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

        {/* --- STEP 3: LOCAL RESIDENCY STATUS (NYC & YONKERS) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              3
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Local Residency (NYC &amp; Yonkers)</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            New York City and the City of Yonkers impose local personal income taxes on residents. Please verify your residency:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NYC Residency Toggle */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.nyc_resident
                ? isDarkMode ? 'bg-blue-500/10 border-blue-500/40' : 'bg-blue-50 border-blue-300'
                : isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={formData.nyc_resident}
                onChange={e => {
                  const val = e.target.checked;
                  setFormData(prev => ({
                    ...prev,
                    nyc_resident: val,
                    nyc_allowances: val ? (prev.nyc_allowances || 1) : 0,
                    nyc_extra: val ? prev.nyc_extra : ''
                  }));
                }}
                className="mt-0.5 rounded border-zinc-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">
                  Resident of New York City
                </span>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Includes the Bronx, Brooklyn, Manhattan, Queens, and Staten Island. Check Yes if your permanent home is in NYC.
                </p>
              </div>
            </label>

            {/* Yonkers Residency Toggle */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.yonkers_resident
                ? isDarkMode ? 'bg-blue-500/10 border-blue-500/40' : 'bg-blue-50 border-blue-300'
                : isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={formData.yonkers_resident}
                onChange={e => {
                  const val = e.target.checked;
                  setFormData(prev => ({
                    ...prev,
                    yonkers_resident: val,
                    yonkers_extra: val ? prev.yonkers_extra : ''
                  }));
                }}
                className="mt-0.5 rounded border-zinc-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold block mb-0.5">
                  Resident of City of Yonkers
                </span>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Check Yes if your permanent home is within the City of Yonkers municipal borders.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* --- STEP 4: ALLOWANCES & ADDITIONAL WITHHOLDING (LINES 1-5) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              4
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Allowances &amp; Additional Withholding</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Enter the number of withholding allowances and optional extra withholding per pay period:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Line 1: NY Allowances */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Line 1: NY State Allowances</span>
                <span className="text-[10px] font-extrabold text-blue-500">NY State &amp; Yonkers</span>
              </div>
              <input
                type="number"
                min={0}
                value={formData.allowances}
                onChange={e => setFormData({ ...formData, allowances: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                  isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Enter total allowances claimed for New York State
              </span>
            </div>

            {/* Line 2: NYC Allowances */}
            <div className={`p-4 rounded-xl border ${
              !formData.nyc_resident 
                ? isDarkMode ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60' : 'bg-slate-100/60 border-slate-200 opacity-60'
                : isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Line 2: NYC Allowances</span>
                <span className="text-[10px] font-extrabold text-emerald-500">NYC Residents Only</span>
              </div>
              <input
                type="number"
                min={0}
                disabled={!formData.nyc_resident}
                value={formData.nyc_allowances}
                onChange={e => setFormData({ ...formData, nyc_allowances: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${
                  isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
              <span className={`text-[10px] mt-1.5 block font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                {formData.nyc_resident ? 'Enter total allowances claimed for NYC' : 'Enabled only if NYC resident'}
              </span>
            </div>
          </div>

          {/* Lines 3, 4, 5 Additional Withholding */}
          <div className="pt-4 border-t border-zinc-700/30">
            <span className="text-xs font-bold block mb-3 uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Additional Withholding Per Pay Period ($)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Line 3: NY State Extra ($)</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={formData.ny_extra}
                  onChange={e => setFormData({ ...formData, ny_extra: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                    isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="0.00"
                />
                <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Additional NY State tax
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Line 4: NYC Extra ($)</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  disabled={!formData.nyc_resident}
                  value={formData.nyc_extra}
                  onChange={e => setFormData({ ...formData, nyc_extra: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                    !formData.nyc_resident ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="0.00"
                />
                <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Additional NYC tax
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Line 5: Yonkers Extra ($)</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  disabled={!formData.yonkers_resident}
                  value={formData.yonkers_extra}
                  onChange={e => setFormData({ ...formData, yonkers_extra: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                    !formData.yonkers_resident ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  placeholder="0.00"
                />
                <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Additional Yonkers tax
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- STEP 5: EMPLOYER REPORTING QUESTIONS (PART B) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              5
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Employer Reporting Questions (Part B)</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Statutory questions required for New York State Department of Taxation and Finance records:
          </p>

          <div className="space-y-4">
            {/* Box A Notice */}
            {isOver14 && (
              <div className="p-3.5 rounded-xl border flex items-center gap-3 bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={18} className="shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                  Box A &mdash; You have claimed more than 14 allowances. Your employer is legally required to send a copy of this certificate to the NYS Tax Department.
                </p>
              </div>
            )}

            {/* Box B: New Hire */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.new_hire}
                  onChange={e => setFormData({ ...formData, new_hire: e.target.checked })}
                  className="mt-0.5 rounded border-zinc-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold block mb-0.5">Box B: New Hire or Rehire</span>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Check if this is a new hire or rehire for New York payroll reporting
                  </span>
                </div>
              </label>

              {formData.new_hire && (
                <div className="sm:w-48 shrink-0">
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">First Work Date</label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={e => setFormData({ ...formData, hire_date: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-medium outline-none ${
                      isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Health Benefits Question */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.health_benefits}
                  onChange={e => setFormData({ ...formData, health_benefits: e.target.checked })}
                  className="mt-0.5 rounded border-zinc-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold block mb-0.5">Dependent Health Insurance Available</span>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Are dependent health insurance benefits available for this employee?
                  </span>
                </div>
              </label>

              {formData.health_benefits && (
                <div className="sm:w-48 shrink-0">
                  <label className="block text-[10px] font-bold uppercase mb-1 text-slate-500">Date Qualified</label>
                  <input
                    type="date"
                    value={formData.benefit_date}
                    onChange={e => setFormData({ ...formData, benefit_date: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-medium outline-none ${
                      isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- STEP 6: EMPLOYER INFORMATION (AUTO-POPULATED) --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider">
                Employer Information (Auto-Populated for NYS Tax Dept)
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className={`p-3 rounded-xl border sm:col-span-2 ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Employer Name &amp; Address</span>
              <span className="font-extrabold block">{formData.employer_name}</span>
              <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} text-[11px]`}>
                {formData.employer_address}, {formData.employer_city}, {formData.employer_state} {formData.employer_zip}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Federal EIN</span>
              <span className="font-extrabold block font-mono">{formData.employer_ein}</span>
              <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} text-[11px]`}>
                NYS Tax Withholding Account
              </span>
            </div>
          </div>
        </div>

        {/* --- STEP 7: EMPLOYEE DECLARATION & SIGNATURE --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              6
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Employee Declaration &amp; Signature</h2>
          </div>

          <div className="p-3.5 rounded-xl border mb-6 bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400">
            <p className="text-xs leading-relaxed font-medium">
              <strong>I certify</strong> that I am entitled to the number of withholding allowances claimed on this certificate.
              <span className="block mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                Penalty &mdash; A penalty of $500 may be imposed for any false statement you make that decreases the amount of money you have withheld from your wages.
              </span>
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
                <label className="block text-xs font-bold mb-1">Confirmation Date *</label>
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
                <span>Confirm &amp; Generate IT-2104</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default NewYorkTaxForm;