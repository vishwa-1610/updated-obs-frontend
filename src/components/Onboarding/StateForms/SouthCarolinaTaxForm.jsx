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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form SC W-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing South Carolina Employee's Withholding Allowance Certificate...
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

// --- FILING STATUS OPTIONS ---
const FILING_STATUSES = [
  { code: '1', title: 'Single', desc: 'Single or married filing separately (standard rate)' },
  { code: '2', title: 'Married', desc: 'Married filing jointly' },
  { code: '3', title: 'Married (Higher Single Rate)', desc: 'Married, but withhold at higher Single rate or filing separately' },
];

// --- MAIN SOUTH CAROLINA TAX FORM COMPONENT ---
const SouthCarolinaTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // 1. FORM STATE
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'SC',
    zipcode: '',

    // Filing Status
    filing_status: '1',
    last_name_diff: false,

    // Personal Allowances Worksheet (A - G)
    pa_a: true,  // 1 for yourself
    pa_b: false, // 1 for married filing jointly
    pa_c: false, // 1 for head of household
    pa_d: false, // 1 for single job / non-working spouse
    pa_e: '0',   // Dependents
    pa_f: '0',   // Children under age 6

    // Deductions & Adjustments Worksheet
    use_deductions: false,
    ded_1: '0', // Itemized deductions
    ded_2: '14600', // Standard deduction (2025 federal reference)
    ded_4: '0', // Adjustments to income
    ded_6: '0', // Non-wage income

    // Withholding & Exemption
    additional_withholding: '',
    exempt: false,
    exempt_type: '1', // '1' = Standard Tax Liability, '2' = Military Spouse/Servicemember
    domicile_state: '',

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
        state: initialData.state || 'SC',
        zipcode: (initialData.zipcode || '').slice(0, 5),
        filing_status: initialData.filing_status || '1',
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

  // --- CALCULATIONS ---
  // Personal Allowances Worksheet (A - G)
  const valA = formData.pa_a ? 1 : 0;
  const valB = formData.filing_status === '2' || formData.pa_b ? 1 : 0;
  const valC = formData.pa_c ? 1 : 0;
  const valD = formData.pa_d ? 1 : 0;
  const valE = Math.max(0, parseInt(formData.pa_e || 0, 10));
  const valF = Math.max(0, parseInt(formData.pa_f || 0, 10));
  const basicAllowances = valA + valB + valC + valD + valE + valF;

  // Deductions Worksheet Logic
  let calculatedLine10 = 0;
  if (formData.use_deductions) {
    const d1 = parseFloat(formData.ded_1 || 0);
    const d2 = parseFloat(formData.ded_2 || 0);
    const d3 = Math.max(d1 - d2, 0);
    const d4 = parseFloat(formData.ded_4 || 0);
    const d5 = d3 + d4;
    const d6 = parseFloat(formData.ded_6 || 0);
    const d7 = d5 - d6;
    const d8 = d7 > 0 ? Math.floor(d7 / 5050) : 0;
    const d9 = basicAllowances;
    calculatedLine10 = Math.max(d8 + d9, 0);
  }

  const finalTotalAllowances = formData.use_deductions ? calculatedLine10 : basicAllowances;

  const handleSubmit = (e) => {
    e.preventDefault();

    const missing = [];
    if (!formData.first_name.trim()) missing.push("First Name");
    if (!formData.last_name.trim()) missing.push("Last Name");
    if (!formData.ssn.trim()) missing.push("Social Security Number");
    if (!formData.address.trim()) missing.push("Street Address");
    if (!formData.city.trim()) missing.push("City");
    if (!formData.zipcode.trim()) missing.push("Zip Code");

    if (formData.exempt && formData.exempt_type === '2' && !formData.domicile_state.trim()) {
      missing.push("Military Domicile State");
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
        pa_a: formData.pa_a,
        pa_b: valB === 1,
        pa_c: formData.pa_c,
        pa_d: formData.pa_d,
        pa_e: valE,
        pa_f: valF,
        pa_g: basicAllowances,
        ded_10: calculatedLine10,
        total_allowances: finalTotalAllowances,
        signature_image: finalSig
      });
    } catch (err) {
      setIsLoading(false);
      setErrorModal({
        isOpen: true,
        title: "Submission Error",
        message: err.message || "Failed to process South Carolina Form SC W-4."
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
                  State of South Carolina
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  Department of Revenue · Form SC W-4 (2025)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                South Carolina Withholding Allowance Certificate
              </h1>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Determine your statutory withholding allowances for South Carolina individual income tax.
              </p>
            </div>
            <a 
              href="https://dor.sc.gov/forms-site/Forms/SCW4.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' 
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>Official SC DOR</span>
              <ExternalLink size={13} />
            </a>
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
                <h2 className="text-base font-extrabold">Part I: Employee Information</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Must match your Social Security records.
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
                <label className={labelClass}>Home Address <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="e.g. 100 North Main Street, Suite 500"
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
                  placeholder="e.g. Columbia"
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
                  placeholder="SC"
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
                  placeholder="29201"
                  required 
                />
              </div>
            </div>

            {/* MARITAL FILING STATUS */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
              <label className={labelClass}>Box 3: Marital Status for Withholding <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FILING_STATUSES.map(st => {
                  const isSelected = formData.filing_status === st.code;
                  return (
                    <div
                      key={st.code}
                      onClick={() => setFormData(prev => ({ ...prev, filing_status: st.code }))}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? (isDarkMode ? 'border-blue-500 bg-blue-950/20' : 'border-blue-600 bg-blue-50/40') 
                          : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input 
                          type="radio" 
                          name="filing_status" 
                          value={st.code} 
                          checked={isSelected} 
                          onChange={handleChange}
                          className="mt-1 w-4 h-4 text-blue-600" 
                        />
                        <div>
                          <span className="font-bold text-xs block">{st.title}</span>
                          <span className={`text-[11px] leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {st.desc}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOX 4: LAST NAME DIFFERS */}
              <div className="mt-4">
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.last_name_diff 
                    ? (isDarkMode ? 'border-blue-500 bg-blue-950/20' : 'border-blue-600 bg-blue-50/40') 
                    : (isDarkMode ? 'border-zinc-800' : 'border-slate-200')
                }`}>
                  <input 
                    type="checkbox" 
                    name="last_name_diff" 
                    checked={formData.last_name_diff} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded" 
                  />
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                    Box 4: Check if your last name differs from that shown on your Social Security card.
                  </span>
                </label>
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
                <h2 className="text-base font-extrabold">Personal Allowances Worksheet</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Figure your withholding allowances (Lines A through G).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="pa_a" checked={formData.pa_a} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-xs font-bold">Line A: Enter 1 for yourself</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-600 text-white">{valA}</span>
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="pa_b" checked={valB === 1} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-xs font-bold">Line B: Enter 1 if you will file as married filing jointly</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-600 text-white">{valB}</span>
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="pa_c" checked={formData.pa_c} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-xs font-bold">Line C: Enter 1 if you will file as head of household</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-600 text-white">{valC}</span>
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="pa_d" checked={formData.pa_d} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-xs font-bold">Line D: Enter 1 if single or married filing separately with 1 job, or spouse does not work</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-600 text-white">{valD}</span>
              </label>

              <div className="flex items-center justify-between p-3.5 rounded-xl border">
                <div>
                  <span className="text-xs font-bold block">Line E: Dependents on federal return</span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Number of dependents claimed on federal return</span>
                </div>
                <input type="number" min="0" name="pa_e" value={formData.pa_e} onChange={handleChange} className="w-20 px-2 py-1.5 rounded-lg border text-center font-bold text-xs" />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border">
                <div>
                  <span className="text-xs font-bold block">Line F: Dependents under age 6</span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Number of dependents from Line E under age 6 as of Dec 31</span>
                </div>
                <input type="number" min="0" name="pa_f" value={formData.pa_f} onChange={handleChange} className="w-20 px-2 py-1.5 rounded-lg border text-center font-bold text-xs" />
              </div>

              {/* SUMMARY LINE G */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? 'bg-blue-950/20 border-blue-800/40' : 'bg-blue-50/70 border-blue-200'
              }`}>
                <div>
                  <span className="text-xs font-extrabold block">Line G: Total Personal Allowances (Lines A - F)</span>
                  <span className="text-[11px] opacity-75">Used on certificate Line 5 if not itemizing</span>
                </div>
                <span className="text-xl font-black px-3 py-1 rounded-xl bg-blue-600 text-white">
                  {basicAllowances}
                </span>
              </div>
            </div>

            {/* DEDUCTIONS WORKSHEET TOGGLE */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="use_deductions" 
                  checked={formData.use_deductions} 
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded" 
                />
                <span className="text-xs font-extrabold">
                  I plan to itemize deductions or claim adjustments (Deductions Worksheet on Page 3)
                </span>
              </label>

              {formData.use_deductions && (
                <div className="mt-4 p-4 rounded-2xl border space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Line 1: Estimated Itemized Deductions</label>
                      <input type="number" name="ded_1" value={formData.ded_1} onChange={handleChange} className={inputClass} placeholder="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Line 2: Federal Standard Deduction</label>
                      <input type="number" name="ded_2" value={formData.ded_2} onChange={handleChange} className={inputClass} placeholder="14600" />
                    </div>
                    <div>
                      <label className={labelClass}>Line 4: Adjustments to Income</label>
                      <input type="number" name="ded_4" value={formData.ded_4} onChange={handleChange} className={inputClass} placeholder="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Line 6: Estimated Non-Wage Income</label>
                      <input type="number" name="ded_6" value={formData.ded_6} onChange={handleChange} className={inputClass} placeholder="0" />
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <span className="text-xs font-bold">Line 10 Result (Total with Deductions):</span>
                    <span className="text-base font-extrabold text-blue-600">{calculatedLine10}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION III: ADDITIONAL WITHHOLDING & EXEMPTION */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBgClass}`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: activeColor }}
              >
                <DollarSign size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold">Lines 5, 6, and 7: Withholding & Exemption</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Final withholding allowances and optional additional deduction.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Line 5: Total Number of Allowances Claimed</label>
                  <div className={`px-4 py-2.5 rounded-xl border text-sm font-extrabold ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-700 text-blue-400' : 'bg-slate-100 border-slate-200 text-blue-700'
                  }`}>
                    {formData.exempt ? "0 (Exempt)" : finalTotalAllowances}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Line 6: Additional Amount to Withhold Per Paycheck ($)</label>
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
              </div>

              {/* LINE 7: EXEMPT STATUS */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
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
                  <div className="space-y-2 w-full">
                    <span className="font-bold text-sm block">Line 7: Claim Exemption from Withholding</span>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      I claim exemption from withholding because I had no tax liability last year and expect none this year, 
                      or qualify under the federal Servicemembers Civil Relief Act.
                    </p>

                    {formData.exempt && (
                      <div className="pt-2 space-y-3 animate-in fade-in">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                            <input 
                              type="radio" 
                              name="exempt_type" 
                              value="1" 
                              checked={formData.exempt_type === '1'} 
                              onChange={handleChange}
                              className="text-blue-600" 
                            />
                            <span>Standard Tax Exemption (No SC tax liability last year & expect none this year)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                            <input 
                              type="radio" 
                              name="exempt_type" 
                              value="2" 
                              checked={formData.exempt_type === '2'} 
                              onChange={handleChange}
                              className="text-blue-600" 
                            />
                            <span>Military Servicemember or Spouse Exemption (SCRA / MSRRA)</span>
                          </label>
                        </div>

                        {formData.exempt_type === '2' && (
                          <div className="pt-1 max-w-xs">
                            <label className={labelClass}>State of Legal Domicile <span className="text-rose-500">*</span></label>
                            <input 
                              type="text" 
                              name="domicile_state" 
                              value={formData.domicile_state} 
                              onChange={handleChange} 
                              className={inputClass} 
                              placeholder="e.g. TEXAS" 
                              required 
                            />
                          </div>
                        )}
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
                  Under penalty of law, certify your South Carolina withholding certificate.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                isDarkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                Under penalty of law, I certify that this information is correct, true, and complete to the best of my knowledge.
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
              <span>Confirm & Generate SC Form W-4</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SouthCarolinaTaxForm;
