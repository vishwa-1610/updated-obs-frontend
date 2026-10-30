import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Sparkles, Building2, MapPin, Check, HeartHandshake,
  HelpCircle, ArrowRight
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form M-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Massachusetts Employee's Withholding Exemption Certificate...
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

// --- 3. THEME-AWARE CUSTOM DATE PICKER ---
const CustomDatePicker = ({ label, name, value, onChange, isDarkMode, activeHexColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
        isDarkMode ? 'text-zinc-400' : 'text-slate-600'
      }`}>
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all shadow-sm ${
          isDarkMode 
            ? 'bg-[#12141a] border-zinc-800 text-zinc-100 hover:border-zinc-700' 
            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar size={15} style={{ color: activeHexColor }} />
          <span>{value || 'Select confirmation date'}</span>
        </div>
        <ChevronDown size={14} className="text-zinc-400" />
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-2 p-4 rounded-2xl shadow-2xl border w-72 left-0 animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <button 
              type="button" 
              onClick={() => changeMonth(-1)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDarkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              type="button" 
              onClick={() => changeMonth(1)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDarkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <span key={d} className="text-[10px] font-bold text-zinc-400 py-1">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array(firstDayOfMonth).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = value === dateStr;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium transition-all ${
                    isSelected 
                      ? 'text-white font-bold shadow-md' 
                      : isDarkMode 
                        ? 'hover:bg-zinc-800 text-zinc-200' 
                        : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  style={isSelected ? { backgroundColor: activeHexColor } : {}}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN MASSACHUSETTS FORM COMPONENT ---
const MassachusettsTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // 1. Form State Initialization
  const [formData, setFormData] = useState(() => {
    const rawSSN = (initialData?.ssn || '').replace(/\D/g, '').slice(0, 9);
    const formattedSSN = rawSSN.length === 9 
      ? `${rawSSN.slice(0, 3)}-${rawSSN.slice(3, 5)}-${rawSSN.slice(5)}` 
      : (initialData?.ssn || '');

    return {
      first_name: initialData?.first_name || '',
      middle_initial: initialData?.middle_initial || initialData?.initial || '',
      last_name: initialData?.last_name || '',
      ssn: formattedSSN,
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: 'MA',
      zipcode: (initialData?.zipcode || '').toString().slice(0, 5),
      
      // Line 1: Personal Exemption
      age_65: Boolean(initialData?.age_65 ?? false),

      // Line 2: Spouse Exemption
      claim_spouse: Boolean(initialData?.claim_spouse ?? false),
      spouse_65: Boolean(initialData?.spouse_65 ?? false),

      // Line 3: Dependents
      dependents: Number(initialData?.dependents ?? 0),
      has_dependent_under_12: Boolean(initialData?.has_dependent_under_12 ?? false),

      // Line 5: Additional Withholding
      additional_withholding: initialData?.additional_withholding || initialData?.state_additional_withholding || '',

      // Checkboxes A-D
      head_of_household: Boolean(initialData?.head_of_household ?? false), // Box A
      blind_self: Boolean(initialData?.blind_self ?? false),               // Box B
      blind_spouse: Boolean(initialData?.blind_spouse ?? false),           // Box C
      exempt: Boolean(initialData?.exempt ?? false),                       // Box D (Student Exempt)

      // Signature & Attestation
      confirmation_date: initialData?.confirmation_date || new Date().toISOString().split('T')[0],
      signature_image: null
    };
  });

  // Sync initialData changes
  useEffect(() => {
    if (initialData) {
      const rawSSN = (initialData.ssn || '').replace(/\D/g, '').slice(0, 9);
      const formattedSSN = rawSSN.length === 9 
        ? `${rawSSN.slice(0, 3)}-${rawSSN.slice(3, 5)}-${rawSSN.slice(5)}` 
        : (initialData.ssn || '');

      setFormData(prev => ({
        ...prev,
        ...initialData,
        ssn: formattedSSN || prev.ssn,
        state: 'MA',
        zipcode: (initialData.zipcode || '').toString().slice(0, 5),
        age_65: initialData.age_65 !== undefined ? Boolean(initialData.age_65) : prev.age_65,
        claim_spouse: initialData.claim_spouse !== undefined ? Boolean(initialData.claim_spouse) : prev.claim_spouse,
        spouse_65: initialData.spouse_65 !== undefined ? Boolean(initialData.spouse_65) : prev.spouse_65,
        dependents: initialData.dependents !== undefined ? Number(initialData.dependents) : prev.dependents,
        has_dependent_under_12: initialData.has_dependent_under_12 !== undefined ? Boolean(initialData.has_dependent_under_12) : prev.has_dependent_under_12,
        head_of_household: initialData.head_of_household !== undefined ? Boolean(initialData.head_of_household) : prev.head_of_household,
        blind_self: initialData.blind_self !== undefined ? Boolean(initialData.blind_self) : prev.blind_self,
        blind_spouse: initialData.blind_spouse !== undefined ? Boolean(initialData.blind_spouse) : prev.blind_spouse,
        exempt: initialData.exempt !== undefined ? Boolean(initialData.exempt) : prev.exempt,
      }));
    }
  }, [initialData]);

  // Handle Canvas Resizing
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

  // --- STATUTORY LINE CALCULATIONS ---
  // Line 1: Personal Exemption (1, or 2 if age 65 or over)
  const line1 = formData.age_65 ? 2 : 1;

  // Line 2: Spouse Exemption (0 if not claimed; 4 if claimed; 5 if spouse is 65+)
  const line2 = formData.claim_spouse ? (formData.spouse_65 ? 5 : 4) : 0;

  // Line 3: Qualified Dependents (+1 if any dependent is under 12)
  const depCount = Math.max(0, parseInt(formData.dependents || 0, 10));
  const line3 = depCount + (formData.has_dependent_under_12 ? 1 : 0);

  // Line 4: Total Exemptions
  const line4 = line1 + line2 + line3;

  // Field Change Handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'ssn') {
      const clean = value.replace(/\D/g, '').slice(0, 9);
      let formatted = clean;
      if (clean.length > 5) formatted = `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5)}`;
      else if (clean.length > 3) formatted = `${clean.slice(0, 3)}-${clean.slice(3)}`;
      setFormData(prev => ({ ...prev, ssn: formatted }));
      return;
    }
    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 5) }));
      return;
    }
    if (name === 'dependents') {
      const parsed = parseInt(value, 10);
      setFormData(prev => ({ ...prev, dependents: isNaN(parsed) ? 0 : Math.max(0, parsed) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Quick Auto-Fill for Testing / Onboarding Sample
  const handleAutoFillSample = () => {
    setFormData(prev => ({
      ...prev,
      first_name: 'vishwa',
      middle_initial: '',
      last_name: 'visu',
      ssn: '999-12-3456',
      address: '100 Seaport Boulevard, Suite 500',
      city: 'Boston',
      state: 'MA',
      zipcode: '02210',
      age_65: false,
      claim_spouse: true,
      spouse_65: false,
      dependents: 1,
      has_dependent_under_12: true,
      additional_withholding: '25.00',
      head_of_household: false,
      blind_self: false,
      blind_spouse: false,
      exempt: false,
      confirmation_date: new Date().toISOString().split('T')[0]
    }));
  };

  // Signature Pad Handlers
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: dataUrl }));
    }
  };

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setFormData(prev => ({ ...prev, signature_image: null }));
    }
  };

  // Submission Validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Name",
        message: "Please enter your legal first and last name as shown on your Social Security card."
      });
      return;
    }

    const cleanSSN = (formData.ssn || '').replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      setErrorModal({
        isOpen: true,
        title: "Invalid Social Security Number",
        message: "Please provide a valid 9-digit Social Security Number."
      });
      return;
    }

    if (!formData.address?.trim() || !formData.city?.trim() || !formData.zipcode?.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Missing Address",
        message: "Please complete your residential address, city, and 5-digit Massachusetts ZIP code."
      });
      return;
    }

    let finalSignature = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      finalSignature = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!finalSignature) {
      setErrorModal({
        isOpen: true,
        title: "Signature Required",
        message: "Please sign in the designated digital signature box to attest to your Form M-4 withholding certificate."
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        signature_image: finalSignature,
        state: 'MA'
      });
    } catch (err) {
      setErrorModal({
        isOpen: true,
        title: "Submission Error",
        message: err?.message || "An unexpected error occurred while generating Form M-4. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Shared Theme Classes
  const cardBg = isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200';
  const subCardBg = isDarkMode ? 'bg-[#12141a] border-zinc-800/80' : 'bg-slate-50 border-slate-200/80';
  const inputBg = isDarkMode 
    ? 'bg-[#12141a] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600' 
    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-400';
  const labelColor = isDarkMode ? 'text-zinc-400' : 'text-slate-600';
  const headingColor = isDarkMode ? 'text-zinc-100' : 'text-slate-900';

  return (
    <div className={`w-full max-w-5xl mx-auto p-4 sm:p-6 transition-colors duration-200 ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>
      {loading && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeHexColor} />}
      
      <ErrorModal 
        isOpen={errorModal.isOpen} 
        title={errorModal.title} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} 
        isDarkMode={isDarkMode} 
      />

      {/* HEADER BANNER */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm mb-8 relative overflow-hidden ${cardBg}`}>
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: activeHexColor }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span 
                className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
              >
                Commonwealth of Massachusetts
              </span>
              <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Department of Revenue • Form M-4
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${headingColor}`}>
              Employee's Withholding Exemption Certificate
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Complete Form M-4 so that your employer can withhold the correct Massachusetts state income tax from your pay.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoFillSample}
            className={`self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 shadow-sm ${
              isDarkMode 
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles size={14} style={{ color: activeHexColor }} />
            <span>Fill Sample Data</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <User size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Employee Information</h2>
              <p className={`text-xs ${labelColor}`}>Provide your personal details exactly as registered with the Social Security Administration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
                required
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                M.I.
              </label>
              <input
                type="text"
                name="middle_initial"
                maxLength="1"
                value={formData.middle_initial}
                onChange={handleChange}
                placeholder="M"
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium text-center uppercase outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="md:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
                required
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="md:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                Social Security Number (SSN) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleChange}
                  placeholder="XXX-XX-XXXX"
                  required
                  maxLength="11"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-mono font-medium outline-none transition-all tracking-wider ${inputBg}`}
                />
                <Shield size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            <div className="md:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                ZIP Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="zipcode"
                maxLength="5"
                value={formData.zipcode}
                onChange={handleChange}
                placeholder="02108"
                required
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="md:col-span-8">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                Home Street Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, apartment, suite, unit"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
                />
                <MapPin size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Boston"
                required
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: WITHHOLDING EXEMPTIONS (LINES 1 TO 4) */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <Calculator size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Withholding Exemptions (Lines 1 – 4)</h2>
              <p className={`text-xs ${labelColor}`}>Calculate your Massachusetts withholding allowances under DOR rules.</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* LINE 1: PERSONAL EXEMPTION */}
            <div className={`p-5 rounded-2xl border transition-all ${subCardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ backgroundColor: activeHexColor }}
                    >
                      1
                    </span>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Personal Exemption</h3>
                  </div>
                  <p className={`text-xs ${labelColor} max-w-xl`}>
                    Standard personal exemption is <strong>1</strong>. If you are age 65 or over (or will be before next year), check the box below to claim <strong>2</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-xs font-bold ${labelColor}`}>Line 1:</span>
                  <span 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm"
                    style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                  >
                    {line1}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    name="age_65"
                    checked={formData.age_65}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className={`text-xs font-semibold group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors ${headingColor}`}>
                    I am age 65 or older (Adds +1 personal exemption)
                  </span>
                </label>
              </div>
            </div>

            {/* LINE 2: SPOUSE EXEMPTION */}
            <div className={`p-5 rounded-2xl border transition-all ${subCardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ backgroundColor: activeHexColor }}
                    >
                      2
                    </span>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Spouse Exemption</h3>
                  </div>
                  <p className={`text-xs ${labelColor} max-w-xl`}>
                    If married and exemption for spouse is allowed, write <strong>4</strong> ($3,850 spouse exemption). If spouse is age 65 or older, write <strong>5</strong>. If not claiming spouse, this line remains <strong>0</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-xs font-bold ${labelColor}`}>Line 2:</span>
                  <span 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm"
                    style={{ backgroundColor: line2 > 0 ? `${activeHexColor}20` : (isDarkMode ? '#27272a' : '#e2e8f0'), color: line2 > 0 ? activeHexColor : (isDarkMode ? '#71717a' : '#64748b') }}
                  >
                    {line2}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    name="claim_spouse"
                    checked={formData.claim_spouse}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className={`text-xs font-semibold group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors ${headingColor}`}>
                    Claim spouse exemption (Sets Line 2 to 4)
                  </span>
                </label>

                {formData.claim_spouse && (
                  <div className="ml-7 animate-in fade-in duration-200">
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        name="spouse_65"
                        checked={formData.spouse_65}
                        onChange={handleChange}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:underline`}>
                        Spouse is age 65 or older (Increases Line 2 to 5)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* LINE 3: QUALIFIED DEPENDENTS & INSTRUCTION D */}
            <div className={`p-5 rounded-2xl border transition-all ${subCardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ backgroundColor: activeHexColor }}
                    >
                      3
                    </span>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Qualified Dependents</h3>
                  </div>
                  <p className={`text-xs ${labelColor} max-w-xl`}>
                    Enter the number of your qualified dependents. Under <strong>Instruction D</strong>, if one or more dependents will be under age 12 at year end, add <strong>1</strong> to your dependents total.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-xs font-bold ${labelColor}`}>Line 3:</span>
                  <span 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm"
                    style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                  >
                    {line3}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    Number of Dependents
                  </label>
                  <input
                    type="number"
                    name="dependents"
                    min="0"
                    value={formData.dependents}
                    onChange={handleChange}
                    className={`w-32 px-4 py-2.5 rounded-xl border text-xs font-bold text-center outline-none ${inputBg}`}
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    name="has_dependent_under_12"
                    checked={formData.has_dependent_under_12}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-semibold group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors ${headingColor}`}>
                      One or more dependents under age 12 (Instruction D)
                    </span>
                    <span className={`block text-[11px] ${labelColor}`}>
                      Adds +1 bonus allowance to Line 3.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* LINE 4: TOTAL EXEMPTIONS BADGE */}
            <div 
              className="p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              style={{ backgroundColor: `${activeHexColor}10`, borderColor: `${activeHexColor}30` }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                  style={{ backgroundColor: activeHexColor }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: activeHexColor }}>Line 4 Total</span>
                    <span className={`text-[11px] ${labelColor}`}>(Line 1 + Line 2 + Line 3)</span>
                  </div>
                  <h4 className={`text-base font-black ${headingColor}`}>Total Withholding Exemptions Claimed</h4>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className={`text-xs font-bold ${labelColor}`}>Boxed Total:</span>
                <span 
                  className="px-6 py-2.5 rounded-2xl font-black text-2xl text-white shadow-md tracking-tight"
                  style={{ backgroundColor: activeHexColor }}
                >
                  {line4}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: ADDITIONAL WITHHOLDING & BOXES A - D */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Additional Withholding & Status (Lines 5 & Boxes A–D)</h2>
              <p className={`text-xs ${labelColor}`}>Specify extra pay-period withholding and special statutory status certifications.</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* LINE 5: ADDITIONAL WITHHOLDING */}
            <div className={`p-5 rounded-2xl border ${subCardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ backgroundColor: activeHexColor }}
                    >
                      5
                    </span>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Line 5: Additional Withholding Per Pay Period</h3>
                  </div>
                  <p className={`text-xs ${labelColor} max-w-lg`}>
                    Enter any extra dollar amount you want withheld from each paycheck under agreement with your employer.
                  </p>
                </div>

                <div className="relative w-full sm:w-48">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="additional_withholding"
                    value={formData.additional_withholding}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none ${inputBg}`}
                  />
                </div>
              </div>
            </div>

            {/* CHECKBOXES A THROUGH D */}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${labelColor}`}>
                Statutory Special Status Checkboxes (Boxes A – D)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* BOX A */}
                <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  formData.head_of_household 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300')
                    : subCardBg
                }`}>
                  <input
                    type="checkbox"
                    name="head_of_household"
                    checked={formData.head_of_household}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-black block ${headingColor}`}>Box A: Head of Household</span>
                    <span className={`text-[11px] ${labelColor} leading-relaxed`}>
                      Check if you will file as head of household on your Massachusetts personal tax return.
                    </span>
                  </div>
                </label>

                {/* BOX B */}
                <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  formData.blind_self 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300')
                    : subCardBg
                }`}>
                  <input
                    type="checkbox"
                    name="blind_self"
                    checked={formData.blind_self}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-black block ${headingColor}`}>Box B: Blind (Self)</span>
                    <span className={`text-[11px] ${labelColor} leading-relaxed`}>
                      Check if you are legally blind.
                    </span>
                  </div>
                </label>

                {/* BOX C */}
                <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  formData.blind_spouse 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300')
                    : subCardBg
                }`}>
                  <input
                    type="checkbox"
                    name="blind_spouse"
                    checked={formData.blind_spouse}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-black block ${headingColor}`}>Box C: Blind (Spouse)</span>
                    <span className={`text-[11px] ${labelColor} leading-relaxed`}>
                      Check if your spouse is legally blind and not subject to withholding.
                    </span>
                  </div>
                </label>

                {/* BOX D */}
                <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  formData.exempt 
                    ? (isDarkMode ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30' : 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300')
                    : subCardBg
                }`}>
                  <input
                    type="checkbox"
                    name="exempt"
                    checked={formData.exempt}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-black block ${headingColor}`}>Box D: Full-Time Student Exempt</span>
                    <span className={`text-[11px] ${labelColor} leading-relaxed`}>
                      Check if you are a full-time student in seasonal/temporary work with estimated income ≤ $8,000. <em>Employer will NOT withhold.</em>
                    </span>
                  </div>
                </label>

              </div>
            </div>

          </div>
        </div>

        {/* SECTION 4: DECLARATION & SIGNATURE */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <PenTool size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Declaration & Digital Signature</h2>
              <p className={`text-xs ${labelColor}`}>Certify your withholding exemption statement under penalties of perjury.</p>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border mb-6 ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs leading-relaxed italic ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
              "I certify that the number of withholding exemptions claimed on this certificate does not exceed the number to which I am entitled."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-6">
            <div className="md:col-span-4">
              <CustomDatePicker
                label="Confirmation Date"
                name="confirmation_date"
                value={formData.confirmation_date}
                onChange={handleChange}
                isDarkMode={isDarkMode}
                activeHexColor={activeHexColor}
              />
            </div>

            <div className="md:col-span-8 flex justify-end">
              <button
                type="button"
                onClick={handleClearSignature}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isDarkMode 
                    ? 'border-zinc-700 hover:bg-zinc-800 text-rose-400 hover:text-rose-300' 
                    : 'border-slate-200 hover:bg-slate-100 text-rose-600 hover:text-rose-700'
                }`}
              >
                <Eraser size={14} />
                <span>Clear Signature</span>
              </button>
            </div>
          </div>

          {/* SIGNATURE CANVAS */}
          <div 
            ref={containerRef}
            className={`w-full h-44 rounded-2xl border-2 border-dashed relative overflow-hidden transition-colors ${
              isDarkMode ? 'bg-[#0f1115] border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-300 hover:border-slate-400'
            }`}
          >
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor={isDarkMode ? '#ffffff' : '#00198c'}
              velocityFilterWeight={0.7}
              canvasProps={{
                className: 'w-full h-full cursor-crosshair'
              }}
              onEnd={handleSignatureEnd}
            />

            {!formData.signature_image && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                <PenTool size={24} className={`opacity-40 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Sign your name here using mouse or touchscreen
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: activeHexColor }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating Form M-4...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Confirm & Generate Massachusetts Form M-4</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default MassachusettsTaxForm;