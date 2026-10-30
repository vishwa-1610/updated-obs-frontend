import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, Eraser, PenTool, FileText, 
  Loader2, XCircle, CheckCircle2, AlertTriangle, Info, Sparkles, Building2, 
  MapPin, Check, ExternalLink, ArrowRight
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form REV-419</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Pennsylvania Employee's Nonwithholding Application Certificate...
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

// --- RECIPROCAL STATES LIST ---
const RECIPROCAL_STATES = [
  { code: 'IN', name: 'INDIANA' },
  { code: 'MD', name: 'MARYLAND' },
  { code: 'NJ', name: 'NEW JERSEY' },
  { code: 'OH', name: 'OHIO' },
  { code: 'VA', name: 'VIRGINIA' },
  { code: 'WV', name: 'WEST VIRGINIA' },
];

// --- ALL US STATES FOR MILITARY SPOUSE SELECTION ---
const US_STATES = [
  'ALABAMA', 'ALASKA', 'ARIZONA', 'ARKANSAS', 'CALIFORNIA', 'COLORADO', 'CONNECTICUT',
  'DELAWARE', 'FLORIDA', 'GEORGIA', 'HAWAII', 'IDAHO', 'ILLINOIS', 'INDIANA', 'IOWA',
  'KANSAS', 'KENTUCKY', 'LOUISIANA', 'MAINE', 'MARYLAND', 'MASSACHUSETTS', 'MICHIGAN',
  'MINNESOTA', 'MISSISSIPPI', 'MISSOURI', 'MONTANA', 'NEBRASKA', 'NEVADA', 'NEW HAMPSHIRE',
  'NEW JERSEY', 'NEW MEXICO', 'NEW YORK', 'NORTH CAROLINA', 'NORTH DAKOTA', 'OHIO',
  'OKLAHOMA', 'OREGON', 'RHODE ISLAND', 'SOUTH CAROLINA', 'SOUTH DAKOTA', 'TENNESSEE',
  'TEXAS', 'UTAH', 'VERMONT', 'VIRGINIA', 'WASHINGTON', 'WEST VIRGINIA', 'WISCONSIN', 'WYOMING'
];

// --- MAIN COMPONENT ---
const PennsylvaniaTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // 1. FORM STATE
  const [formData, setFormData] = useState({
    // Section I: Employee Information
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    phone_no: '',
    address: '',
    city: '',
    state: 'PA',
    zipcode: '',
    tax_year: new Date().getFullYear().toString(),

    // Section II: Exemption Information
    exemption_type: 'a', // 'a' (Tax Forgiveness), 'b' (Reciprocal State), or 'c' (MSRRA)
    reciprocal_state: 'OHIO',
    military_state: '',

    // Section III: Certification & Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null,

    // Section IV: Optional Compensation
    quarterly_compensation: '',
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
        phone_no: initialData.phone_no || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || 'PA',
        zipcode: (initialData.zipcode || '').slice(0, 5),
        tax_year: initialData.tax_year || new Date().getFullYear().toString(),
        reciprocal_state: initialData.reciprocal_state || 'OHIO',
        military_state: initialData.military_state || '',
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
    const { name, value } = e.target;
    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, [name]: value.slice(0, 5) }));
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
    setFormData(prev => ({ ...prev, [name]: value }));
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

    if (formData.exemption_type === 'b' && !formData.reciprocal_state) {
      missing.push("Reciprocal State Selection");
    }
    if (formData.exemption_type === 'c' && !formData.military_state.trim()) {
      missing.push("Military Spouse Legal State of Residence");
    }

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
        signature_image: finalSig
      });
    } catch (err) {
      setIsLoading(false);
      setErrorModal({
        isOpen: true,
        title: "Submission Error",
        message: err.message || "Failed to process Pennsylvania Form REV-419."
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
                  State of Pennsylvania
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  Form REV-419 EX
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Employee’s Nonwithholding Application Certificate
              </h1>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Statutory exemption certificate for Tax Forgiveness, Reciprocal State residents, or Military Spouses.
              </p>
            </div>
            <a 
              href="https://www.revenue.pa.gov" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' 
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>PA Revenue Info</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* STATUTORY FLAT TAX NOTICE BANNER */}
          <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3 ${
            isDarkMode 
              ? 'bg-blue-950/20 border-blue-800/40 text-blue-300' 
              : 'bg-blue-50/70 border-blue-200 text-blue-900'
          }`}>
            <Info size={20} className="shrink-0 mt-0.5 text-blue-500" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-bold">Pennsylvania Flat Income Tax Notice (3.07%):</p>
              <p>
                Pennsylvania levies a statutory flat personal income tax of 3.07% on all compensation. Employers withhold 
                this amount automatically unless an employee qualifies for and certifies an exemption via Form REV-419.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION I: PERSONAL INFORMATION */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: activeColor }}
              >
                <User size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Section I: Employee Information</h2>
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

              <div>
                <label className={labelClass}>Telephone Number</label>
                <input 
                  type="text" 
                  name="phone_no" 
                  value={formData.phone_no} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="(555) 000-0000"
                />
              </div>

              <div>
                <label className={labelClass}>Tax Year</label>
                <input 
                  type="text" 
                  name="tax_year" 
                  value={formData.tax_year} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="2026"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className={labelClass}>Street Address <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="e.g. 100 North Main Street"
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>City <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="e.g. Philadelphia"
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
                  placeholder="PA"
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Zip Code (5-digit) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="zipcode" 
                  value={formData.zipcode} 
                  onChange={handleChange} 
                  maxLength={5}
                  className={inputClass} 
                  placeholder="19104"
                  required 
                />
              </div>
            </div>
          </div>

          {/* SECTION II: EXEMPTION INFORMATION (REASON A, B, OR C) */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: activeColor }}
              >
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Section II: Exemption Reason (Choose One)</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Select the statutory category that entitles you to non-withholding of PA tax.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* OPTION A: TAX FORGIVENESS */}
              <div 
                onClick={() => setFormData(prev => ({ ...prev, exemption_type: 'a' }))}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  formData.exemption_type === 'a'
                    ? (isDarkMode 
                        ? 'border-blue-500 bg-blue-950/20 shadow-lg' 
                        : 'border-blue-600 bg-blue-50/40 shadow-sm')
                    : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input 
                    type="radio" 
                    name="exemption_type" 
                    value="a" 
                    checked={formData.exemption_type === 'a'} 
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div className="space-y-1">
                    <span className="block font-bold text-sm">
                      Category A: Tax Forgiveness
                    </span>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      I qualified for Tax Forgiveness of my PA personal income tax liability last year (and had a right to a full refund), 
                      and/or I expect to qualify for Tax Forgiveness this year.
                    </p>
                  </div>
                </div>
              </div>

              {/* OPTION B: RECIPROCAL STATE RESIDENT */}
              <div 
                onClick={() => setFormData(prev => ({ ...prev, exemption_type: 'b' }))}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  formData.exemption_type === 'b'
                    ? (isDarkMode 
                        ? 'border-blue-500 bg-blue-950/20 shadow-lg' 
                        : 'border-blue-600 bg-blue-50/40 shadow-sm')
                    : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input 
                    type="radio" 
                    name="exemption_type" 
                    value="b" 
                    checked={formData.exemption_type === 'b'} 
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div className="space-y-3 w-full">
                    <div>
                      <span className="block font-bold text-sm">
                        Category B: Resident of a Reciprocal State
                      </span>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                        I declare I am a resident of one of the 6 reciprocal states below. Pursuant to the reciprocal tax agreement, 
                        I claim exemption from PA tax withholding and authorize my employer to withhold income tax for my resident state instead.
                      </p>
                    </div>

                    {formData.exemption_type === 'b' && (
                      <div className="pt-2">
                        <label className={labelClass}>Select Your Reciprocal State:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {RECIPROCAL_STATES.map(st => {
                            const isSelected = formData.reciprocal_state === st.name;
                            return (
                              <button
                                key={st.code}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({ ...prev, reciprocal_state: st.name }));
                                }}
                                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                    : (isDarkMode 
                                        ? 'bg-zinc-900/60 border-zinc-700 hover:bg-zinc-800 text-zinc-300' 
                                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700')
                                }`}
                              >
                                <span>{st.name}</span>
                                {isSelected && <Check size={14} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* OPTION C: MILITARY SPOUSES RESIDENCY RELIEF ACT */}
              <div 
                onClick={() => setFormData(prev => ({ ...prev, exemption_type: 'c' }))}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  formData.exemption_type === 'c'
                    ? (isDarkMode 
                        ? 'border-blue-500 bg-blue-950/20 shadow-lg' 
                        : 'border-blue-600 bg-blue-50/40 shadow-sm')
                    : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input 
                    type="radio" 
                    name="exemption_type" 
                    value="c" 
                    checked={formData.exemption_type === 'c'} 
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div className="space-y-3 w-full">
                    <div>
                      <span className="block font-bold text-sm">
                        Category C: Military Spouses Residency Relief Act (MSRRA)
                      </span>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                        I certify I am the spouse of an active duty service member and we are legal domiciliaries of the same state 
                        (not PA), meeting the requirements set forth under the Servicemembers Civil Relief Act.
                      </p>
                    </div>

                    {formData.exemption_type === 'c' && (
                      <div className="pt-2 max-w-sm">
                        <label className={labelClass}>
                          Legal State of Residence / Domicile <span className="text-rose-500">*</span>
                        </label>
                        <select
                          name="military_state"
                          value={formData.military_state}
                          onChange={handleChange}
                          onClick={(e) => e.stopPropagation()}
                          className={inputClass}
                          required
                        >
                          <option value="">-- Select Legal Domicile State --</option>
                          {US_STATES.filter(s => s !== 'PENNSYLVANIA').map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION III: CERTIFICATION & SIGNATURE */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: activeColor }}
              >
                <PenTool size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Section III: Certification & Signature</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Under penalties of perjury, certify your eligibility for withholding exemption.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                isDarkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                Under penalties of perjury, I certify that I did not incur any Pennsylvania personal income tax liability during 
                the preceding tax year and/or I do not expect to incur any liability during the current tax year based on the reason(s) indicated above.
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
              <span>Confirm & Generate PA Form REV-419</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PennsylvaniaTaxForm;
