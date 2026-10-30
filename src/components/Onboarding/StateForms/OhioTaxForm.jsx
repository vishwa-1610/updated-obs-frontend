import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, Eraser, PenTool, FileText, Calculator, 
  Loader2, XCircle, CheckCircle2, AlertTriangle, Info, Building2, 
  MapPin, Check, HeartHandshake, HelpCircle, ArrowRight, RefreshCw, Landmark, ExternalLink
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Ohio Form IT 4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Ohio Employee's Withholding Exemption Certificate...
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

// --- MAIN OHIO TAX FORM COMPONENT ---
const OhioTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // 1. FORM STATE
  const [formData, setFormData] = useState({
    // Section I: Personal Information
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'OH',
    zipcode: '',
    school_district: '',
    district_number: '',

    // Section II: Exemptions
    dependent_on_other: false, // Line 1: true -> 0, false -> 1
    single_or_mfs: true,       // Line 2: true -> 0, false (MFJ) -> 1
    dependents: 0,             // Line 3
    extra_withholding: '',     // Line 5: additional withholding

    // Section III: Waivers
    oh_reciprocity: false,
    oh_resident_military: false,
    oh_nonresident_military: false,
    oh_nonresident_spouse: false,
    oh_statutory_exempt: false,

    // Section IV: Signature & Date
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null,
  });

  // 2. INITIALIZE PRE-POPULATED DATA
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        state: 'OH',
        first_name: (initialData.first_name || '').toUpperCase(),
        middle_initial: (initialData.middle_initial || '').toUpperCase().slice(0, 1),
        last_name: (initialData.last_name || '').toUpperCase(),
        zipcode: (initialData.zipcode || '').replace(/\D/g, '').slice(0, 5),
        district_number: (initialData.district_number || '').replace(/\D/g, '').slice(0, 4),
        dependents: initialData.dependents !== undefined ? initialData.dependents : 0,
        extra_withholding: initialData.extra_withholding || '',
      }));
    }
  }, [initialData]);

  // 3. RESPONSIVE SIGNATURE CANVAS RESIZE
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) {
            sigCanvasRef.current.fromDataURL(savedData);
          }
        }
      }
    };
    const timer = setTimeout(handleResize, 200);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 4. SSN FORMATTER
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

  // 5. INPUT CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, zipcode: value.replace(/\D/g, '').slice(0, 5) }));
      return;
    }
    if (name === 'district_number') {
      setFormData(prev => ({ ...prev, district_number: value.replace(/\D/g, '').slice(0, 4) }));
      return;
    }
    if (name === 'dependents') {
      const parsed = Math.max(0, parseInt(value, 10) || 0);
      setFormData(prev => ({ ...prev, dependents: parsed }));
      return;
    }
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 6. CLEAR SIGNATURE
  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setFormData(prev => ({ ...prev, signature_image: null }));
    }
  };

  // 7. REAL-TIME EXEMPTION CALCULATIONS
  const line1_val = formData.dependent_on_other ? 0 : 1;
  const line2_val = formData.single_or_mfs ? 0 : 1;
  const line3_val = Math.max(0, parseInt(formData.dependents, 10) || 0);
  const line4_total = line1_val + line2_val + line3_val;

  const hasAnyWaiver = Boolean(
    formData.oh_reciprocity ||
    formData.oh_resident_military ||
    formData.oh_nonresident_military ||
    formData.oh_nonresident_spouse ||
    formData.oh_statutory_exempt
  );

  // 8. FORM SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Demographics Validations
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Name",
        message: "Please enter your legal first and last name.",
      });
      return;
    }

    const cleanSSN = formData.ssn.replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      setErrorModal({
        isOpen: true,
        title: "Invalid SSN",
        message: "Please enter a valid 9-digit Social Security Number.",
      });
      return;
    }

    if (!formData.address.trim() || !formData.city.trim() || !formData.zipcode.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Address",
        message: "Please enter your street address, city, and 5-digit ZIP code.",
      });
      return;
    }

    // Capture Signature
    let sigDataUrl = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sigDataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!sigDataUrl) {
      setErrorModal({
        isOpen: true,
        title: "Signature Required",
        message: "Please sign in the digital signature box before submitting Ohio Form IT 4.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        state: 'OH',
        state_code: 'OH',
        signature_image: sigDataUrl,
        first_name: formData.first_name.trim().toUpperCase(),
        middle_initial: formData.middle_initial.trim().toUpperCase().slice(0, 1),
        last_name: formData.last_name.trim().toUpperCase(),
        school_district: formData.school_district.trim().toUpperCase(),
        district_number: formData.district_number.trim().slice(0, 4),
        dependents: line3_val,
        extra_withholding: parseFloat(formData.extra_withholding) || 0,
      };

      if (onSubmit) {
        await onSubmit(payload);
      }
    } catch (err) {
      setErrorModal({
        isOpen: true,
        title: "Submission Error",
        message: err?.response?.data?.error || err.message || "Failed to submit Ohio Form IT 4. Please try again.",
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
                State of Ohio
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200/60 text-slate-600'
              }`}>
                Department of Taxation &bull; Rev. 01/24
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Employee's Withholding Exemption Certificate (Form IT 4)
            </h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Complete this certificate so that your employer can accurately withhold Ohio state and school district income tax from your compensation.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Official Form</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">Ohio Form IT 4</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* --- SECTION I: PERSONAL INFORMATION --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              1
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Section I: Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">First Name *</label>
              <input
                type="text"
                required
                name="first_name"
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
                name="middle_initial"
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
                name="last_name"
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
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={formData.ssn}
                  onChange={handleSSNChange}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium tracking-wider outline-none transition-all ${
                    isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                  placeholder="XXX-XX-XXXX"
                />
                <Shield size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-bold mb-1">Street Address *</label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="123 MAIN STREET"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold mb-1">City *</label>
              <input
                type="text"
                required
                name="city"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="COLUMBUS"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold mb-1">State</label>
              <input
                type="text"
                readOnly
                value="OH"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-center outline-none cursor-not-allowed ${
                  isDarkMode ? 'bg-zinc-800/50 border-zinc-700 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold mb-1">ZIP Code *</label>
              <input
                type="text"
                required
                maxLength={5}
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="43215"
              />
            </div>

            {/* School District Information */}
            <div className="sm:col-span-8">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold">School District of Residence</label>
                <a
                  href="https://thefinder.tax.ohio.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <span>Find Your District</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <input
                type="text"
                name="school_district"
                value={formData.school_district}
                onChange={e => setFormData({ ...formData, school_district: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all uppercase ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="E.G. COLUMBUS CITY SD"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold mb-1">District Number (4-Digit ####)</label>
              <input
                type="text"
                maxLength={4}
                name="district_number"
                value={formData.district_number}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
                placeholder="2503"
              />
            </div>
          </div>
        </div>

        {/* --- SECTION II: CLAIMING WITHHOLDING EXEMPTIONS --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              2
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Section II: Claiming Withholding Exemptions</h2>
          </div>

          <div className="space-y-4">
            {/* Line 1: Dependent on another return */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.dependent_on_other 
                ? (isDarkMode ? 'border-amber-500/40 bg-amber-500/5' : 'border-amber-400 bg-amber-50/50')
                : (isDarkMode ? 'border-zinc-800 bg-[#1c202a]' : 'border-slate-200 bg-white')
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="dependent_on_other"
                    name="dependent_on_other"
                    checked={formData.dependent_on_other}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <label htmlFor="dependent_on_other" className="text-xs font-bold block cursor-pointer">
                      Line 1: Dependent on another individual's return?
                    </label>
                    <p className={`text-[11px] leading-relaxed mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Check this box if you can be claimed as a dependent on another individual's Ohio income tax return.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Line 1: {line1_val}
                  </span>
                </div>
              </div>
            </div>

            {/* Line 2: Single / Married Filing Separately vs MFJ */}
            <div className={`p-4 rounded-xl border transition-all ${
              !formData.single_or_mfs 
                ? (isDarkMode ? 'border-blue-500/40 bg-blue-500/5' : 'border-blue-400 bg-blue-50/50')
                : (isDarkMode ? 'border-zinc-800 bg-[#1c202a]' : 'border-slate-200 bg-white')
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold block mb-1">
                    Line 2: Marital & Filing Status
                  </span>
                  <p className={`text-[11px] leading-relaxed mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Enter 0 if Single or if your spouse files a separate Ohio return; otherwise enter 1 (Married Filing Jointly).
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="single_or_mfs"
                        checked={formData.single_or_mfs === true}
                        onChange={() => setFormData({ ...formData, single_or_mfs: true })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Single or Married Filing Separately (0)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="single_or_mfs"
                        checked={formData.single_or_mfs === false}
                        onChange={() => setFormData({ ...formData, single_or_mfs: false })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Married Filing Jointly (1)</span>
                    </label>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Line 2: {line2_val}
                  </span>
                </div>
              </div>
            </div>

            {/* Line 3: Number of Dependents */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <label className="text-xs font-bold block mb-0.5">Line 3: Number of Dependents</label>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter the number of dependents you are claiming on your Ohio return.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="20"
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleChange}
                  className={`w-24 px-3 py-2 rounded-xl border text-center text-sm font-bold font-mono outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  Line 3: {line3_val}
                </span>
              </div>
            </div>

            {/* Line 4: Total Withholding Exemptions Banner */}
            <div className="p-4 rounded-xl border flex items-center justify-between gap-4" style={{
              borderColor: `${activeColor}40`,
              backgroundColor: isDarkMode ? `${activeColor}15` : `${activeColor}08`
            }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: activeColor }}>
                  <Calculator size={16} />
                </div>
                <div>
                  <span className="text-xs font-black block tracking-tight">Line 4: Total Withholding Exemptions</span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Sum of Line 1 ({line1_val}) + Line 2 ({line2_val}) + Line 3 ({line3_val})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono" style={{ color: activeColor }}>
                  {line4_total}
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Exemptions</span>
              </div>
            </div>

            {/* Line 5: Additional Withholding */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#1c202a] border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <label className="text-xs font-bold block mb-0.5">Line 5: Additional Withholding (Optional)</label>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Additional Ohio income tax withholding per pay period ($).
                </p>
              </div>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="extra_withholding"
                  value={formData.extra_withholding}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-36 pl-8 pr-3 py-2 rounded-xl border text-sm font-mono font-bold outline-none ${
                    isDarkMode ? 'bg-[#151820] border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION III: WITHHOLDING WAIVER --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              3
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Section III: Withholding Waiver (Check all that apply)</h2>
          </div>
          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            I am <u>not</u> subject to Ohio or school district income tax withholding because (check any statutory reason below):
          </p>

          <div className="space-y-3">
            {[
              {
                id: 'oh_reciprocity',
                title: 'Reciprocity Agreement',
                desc: 'I am a full-year resident of Indiana, Kentucky, Michigan, Pennsylvania, or West Virginia.',
              },
              {
                id: 'oh_resident_military',
                title: 'Resident Military Servicemember',
                desc: 'I am a resident military servicemember who is stationed outside Ohio on active duty military orders.',
              },
              {
                id: 'oh_nonresident_military',
                title: 'Nonresident Military Servicemember',
                desc: 'I am a nonresident military servicemember who is stationed in Ohio due to military orders.',
              },
              {
                id: 'oh_nonresident_spouse',
                title: 'Nonresident Military Civilian Spouse',
                desc: 'I am a nonresident civilian spouse of a military servicemember and I am present in Ohio solely due to my spouse’s military orders.',
              },
              {
                id: 'oh_statutory_exempt',
                title: 'Statutory Exemption (R.C. § 5747.06)',
                desc: 'I am exempt from Ohio withholding under R.C. 5747.06(A)(1) through (6) (e.g., agricultural labor, domestic services).',
              },
            ].map(item => (
              <label
                key={item.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData[item.id]
                    ? (isDarkMode ? 'border-blue-500/50 bg-blue-500/10' : 'border-blue-500 bg-blue-50/60')
                    : (isDarkMode ? 'border-zinc-800 bg-[#1c202a] hover:border-zinc-700' : 'border-slate-200 bg-white hover:border-slate-300')
                }`}
              >
                <input
                  type="checkbox"
                  name={item.id}
                  checked={Boolean(formData[item.id])}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <span className="text-xs font-bold block">{item.title}</span>
                  <span className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                  }`}>
                    {item.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {hasAnyWaiver && (
            <div className="mt-4 p-3 rounded-xl border border-blue-500/20 bg-blue-500/10 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Withholding Waiver Active: You have selected statutory exemption criteria under Section III.</span>
            </div>
          )}
        </div>

        {/* --- SECTION IV: SIGNATURE & ATTESTATION --- */}
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#151820] border-zinc-800/80' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: activeColor }}>
              4
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Section IV: Signature & Attestation</h2>
          </div>

          <div className={`p-4 rounded-xl border mb-6 text-xs leading-relaxed ${
            isDarkMode ? 'bg-[#1c202a] border-zinc-800 text-zinc-300' : 'bg-slate-100/70 border-slate-200 text-slate-700'
          }`}>
            <strong>Declaration:</strong> Under penalties of perjury, I declare that, to the best of my knowledge and belief, the information is true, correct, and complete.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold mb-1">Date of Signing *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  name="confirmation_date"
                  value={formData.confirmation_date}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isDarkMode ? 'bg-[#1c202a] border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                />
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="sm:col-span-8">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold">Digital Signature *</label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Eraser size={12} />
                  <span>Clear Signature</span>
                </button>
              </div>

              <div 
                ref={containerRef}
                className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-[#1c202a] relative overflow-hidden cursor-crosshair group hover:border-blue-500 transition-colors"
              >
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? 'white' : 'black'}
                  velocityFilterWeight={0.7}
                  canvasProps={{ className: 'w-full h-full' }}
                  onEnd={() => {
                    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
                      const sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
                      setFormData(prev => ({ ...prev, signature_image: sig }));
                    }
                  }}
                />
                {!formData.signature_image && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
                    <PenTool size={20} className="opacity-40 mb-1" />
                    <span className="text-[11px] font-medium opacity-60">Draw signature here</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- SUBMIT ACTION BUTTON --- */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: activeColor }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating Form IT 4...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Confirm & Submit Ohio Form IT 4</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default OhioTaxForm;
