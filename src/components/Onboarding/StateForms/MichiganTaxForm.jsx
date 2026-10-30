import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Sparkles, Building2, MapPin, Check, HeartHandshake,
  HelpCircle, ArrowRight, CreditCard, Flag
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form MI-W4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Michigan Employee's Withholding Exemption Certificate...
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
          <span>{value || 'Select date'}</span>
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

// --- MAIN MICHIGAN FORM COMPONENT ---
const MichiganTaxForm = ({ initialData, onSubmit }) => {
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
      dob: initialData?.dob || initialData?.date_of_birth || '1990-01-01',
      driver_license: initialData?.driver_license || initialData?.dl_number || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: 'MI',
      zipcode: (initialData?.zipcode || '').toString().slice(0, 5),

      // Box 5: Employment Status
      new_employee: initialData?.new_employee !== undefined ? Boolean(initialData.new_employee) : true,
      hire_date: initialData?.hire_date || initialData?.start_date || new Date().toISOString().split('T')[0],

      // Line 6: Personal and Dependent Exemptions
      exemptions: Number(initialData?.exemptions ?? initialData?.allowances ?? 1),

      // Line 7: Additional Withholding
      additional_withholding: initialData?.additional_withholding || initialData?.state_additional_withholding || '',

      // Line 8: Exemption from Withholding
      exempt: Boolean(initialData?.exempt ?? false),
      exempt_type: initialData?.exempt_type || '', // 'a', 'b', 'c'
      exempt_text: initialData?.exempt_text || initialData?.exempt_reason || '',

      // Attestation & Signature
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
        state: 'MI',
        zipcode: (initialData.zipcode || '').toString().slice(0, 5),
        dob: initialData.dob || initialData.date_of_birth || prev.dob,
        driver_license: initialData.driver_license || initialData.dl_number || prev.driver_license,
        new_employee: initialData.new_employee !== undefined ? Boolean(initialData.new_employee) : prev.new_employee,
        hire_date: initialData.hire_date || initialData.start_date || prev.hire_date,
        exemptions: initialData.exemptions !== undefined ? Number(initialData.exemptions) : prev.exemptions,
        exempt: initialData.exempt !== undefined ? Boolean(initialData.exempt) : prev.exempt,
        exempt_type: initialData.exempt_type || prev.exempt_type || '',
        exempt_text: initialData.exempt_text || initialData.exempt_reason || prev.exempt_text
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
    if (name === 'exemptions') {
      const parsed = parseInt(value, 10);
      setFormData(prev => ({ ...prev, exemptions: isNaN(parsed) ? 0 : Math.max(0, parsed) }));
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
      dob: '1990-01-01',
      driver_license: 'V999888777012',
      address: '100 Renaissance Center, Suite 500',
      city: 'Detroit',
      state: 'MI',
      zipcode: '48243',
      new_employee: true,
      hire_date: new Date().toISOString().split('T')[0],
      exemptions: 2,
      additional_withholding: '25.00',
      exempt: false,
      exempt_type: '',
      exempt_text: '',
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
        message: "Please complete your residential street address, city, and 5-digit Michigan ZIP code."
      });
      return;
    }

    if (formData.exempt && !formData.exempt_type) {
      setErrorModal({
        isOpen: true,
        title: "Exemption Reason Required",
        message: "You checked the box to claim exemption from Michigan withholding. Please select either Box 8a, 8b, or 8c."
      });
      return;
    }

    if (formData.exempt && (formData.exempt_type === 'b' || formData.exempt_type === 'c') && !formData.exempt_text?.trim()) {
      setErrorModal({
        isOpen: true,
        title: "Explanation Required",
        message: formData.exempt_type === 'b' 
          ? "Please explain why wages are exempt from Michigan withholding (e.g. MSRRA, reciprocal agreement)."
          : "Please specify the Michigan Renaissance Zone where your permanent domicile is located."
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
        message: "Please sign in the digital signature box to attest to your Form MI-W4 certificate."
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        signature_image: finalSignature,
        state: 'MI'
      });
    } catch (err) {
      setErrorModal({
        isOpen: true,
        title: "Submission Error",
        message: err?.message || "An unexpected error occurred while generating Form MI-W4. Please try again."
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
                State of Michigan
              </span>
              <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Department of Treasury • Form MI-W4
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${headingColor}`}>
              Employee's Michigan Withholding Exemption Certificate
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Submit Form MI-W4 so that your employer can withhold the correct Michigan income tax from your wages.
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
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Employee Information (Boxes 1 – 4)</h2>
              <p className={`text-xs ${labelColor}`}>Provide your legal identifying information registered with the State of Michigan.</p>
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
                1. Social Security Number (SSN) <span className="text-rose-500">*</span>
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
              <CustomDatePicker
                label="2. Date of Birth"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                isDarkMode={isDarkMode}
                activeHexColor={activeHexColor}
              />
            </div>

            <div className="md:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                4. Driver's License or State ID Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="driver_license"
                  value={formData.driver_license}
                  onChange={handleChange}
                  placeholder="e.g. M123456789012"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
                />
                <CreditCard size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
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
                placeholder="48226"
                required
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="md:col-span-8">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                Home Address (Street, Box, or Rural Route) <span className="text-rose-500">*</span>
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
                City or Town <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Detroit"
                required
                className={`w-full px-4 py-3 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: BOX 5 EMPLOYMENT STATUS */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <Flag size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Employment Status (Box 5)</h2>
              <p className={`text-xs ${labelColor}`}>State whether you are a new employee and enter your date of hire if applicable.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${labelColor}`}>
                5. Are you a new employee?
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  formData.new_employee 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300')
                    : subCardBg
                }`}>
                  <input
                    type="radio"
                    name="new_employee"
                    checked={formData.new_employee === true}
                    onChange={() => setFormData(p => ({ ...p, new_employee: true }))}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-black block ${headingColor}`}>Yes</span>
                    <span className={`text-[11px] ${labelColor}`}>New hire / rehire</span>
                  </div>
                </label>

                <label className={`flex-1 p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  !formData.new_employee 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300')
                    : subCardBg
                }`}>
                  <input
                    type="radio"
                    name="new_employee"
                    checked={formData.new_employee === false}
                    onChange={() => setFormData(p => ({ ...p, new_employee: false }))}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-black block ${headingColor}`}>No</span>
                    <span className={`text-[11px] ${labelColor}`}>Existing employee</span>
                  </div>
                </label>
              </div>
            </div>

            {formData.new_employee && (
              <div className="md:col-span-6 animate-in fade-in duration-200">
                <CustomDatePicker
                  label="Date of Hire (MM/DD/YYYY)"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  isDarkMode={isDarkMode}
                  activeHexColor={activeHexColor}
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: EXEMPTIONS & WITHHOLDING (LINES 6 & 7) */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <Calculator size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Exemptions & Additional Withholding (Lines 6 & 7)</h2>
              <p className={`text-xs ${labelColor}`}>Claim your Michigan personal, dependent, and special allowances.</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* LINE 6: EXEMPTIONS */}
            <div className={`p-5 rounded-2xl border ${subCardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ backgroundColor: activeHexColor }}
                    >
                      6
                    </span>
                    <h3 className={`text-sm font-bold ${headingColor}`}>
                      6. Number of Personal and Dependent Exemptions
                    </h3>
                  </div>
                  <p className={`text-xs ${labelColor} max-w-xl leading-relaxed`}>
                    Enter total exemptions claimed: 1 for yourself (unless claimed by someone else), 1 for your spouse, plus 1 for each qualifying dependent. You may also claim special exemptions if age 65 or older, blind, deaf, or paraplegic/quadriplegic.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-xs font-bold ${labelColor}`}>Line 6 Total:</span>
                  <input
                    type="number"
                    min="0"
                    name="exemptions"
                    value={formData.exemptions}
                    onChange={handleChange}
                    className={`w-20 px-3.5 py-2.5 rounded-xl border text-sm font-black text-center outline-none ${inputBg}`}
                  />
                </div>
              </div>
            </div>

            {/* LINE 7: ADDITIONAL WITHHOLDING */}
            <div className={`p-5 rounded-2xl border ${subCardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ backgroundColor: activeHexColor }}
                    >
                      7
                    </span>
                    <h3 className={`text-sm font-bold ${headingColor}`}>
                      7. Additional Amount You Want Deducted From Each Pay
                    </h3>
                  </div>
                  <p className={`text-xs ${labelColor} max-w-xl leading-relaxed`}>
                    Enter any extra dollar amount you want withheld from each paycheck under agreement with your employer.
                  </p>
                </div>

                <div className="relative w-full sm:w-44 self-end sm:self-auto">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    name="additional_withholding"
                    value={formData.additional_withholding}
                    onChange={handleChange}
                    placeholder="0"
                    className={`w-full pl-8 pr-12 py-2.5 rounded-xl border text-xs font-bold outline-none ${inputBg}`}
                  />
                  <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>.00</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 4: EXEMPTION FROM WITHHOLDING (LINE 8) */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Exemption from Withholding (Line 8)</h2>
              <p className={`text-xs ${labelColor}`}>Complete this section only if you claim full exemption from Michigan withholding.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="exempt"
                checked={formData.exempt}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setFormData(prev => ({
                    ...prev,
                    exempt: isChecked,
                    exempt_type: isChecked ? (prev.exempt_type || 'a') : '',
                    exempt_text: isChecked ? prev.exempt_text : ''
                  }));
                }}
                className="w-5 h-5 rounded text-blue-600 cursor-pointer"
              />
              <span className={`text-sm font-black ${headingColor}`}>
                8. I claim exemption from Michigan withholding because:
              </span>
            </label>

            {formData.exempt && (
              <div className="space-y-4 pt-3 pl-2 sm:pl-6 border-l-2 border-blue-500/40 animate-in fade-in duration-200">
                
                {/* 8a */}
                <label className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  formData.exempt_type === 'a' 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300')
                    : subCardBg
                }`}>
                  <input
                    type="radio"
                    name="exempt_type"
                    checked={formData.exempt_type === 'a'}
                    onChange={() => setFormData(p => ({ ...p, exempt_type: 'a', exempt_text: '' }))}
                    className="mt-0.5 w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-black block ${headingColor}`}>
                      a. A Michigan income tax liability is not expected this year.
                    </span>
                    <span className={`text-[11px] ${labelColor} leading-relaxed`}>
                      You had no Michigan tax liability last year and expect none this year.
                    </span>
                  </div>
                </label>

                {/* 8b */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  formData.exempt_type === 'b' 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300')
                    : subCardBg
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exempt_type"
                      checked={formData.exempt_type === 'b'}
                      onChange={() => setFormData(p => ({ ...p, exempt_type: 'b' }))}
                      className="mt-0.5 w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <div>
                      <span className={`text-xs font-black block ${headingColor}`}>
                        b. Wages are exempt from withholding.
                      </span>
                      <span className={`text-[11px] ${labelColor} leading-relaxed`}>
                        e.g. Military Spouses Residency Relief Act (MSRRA), Reciprocal Agreement state resident, or treaty.
                      </span>
                    </div>
                  </label>

                  {formData.exempt_type === 'b' && (
                    <div className="mt-3 pl-7">
                      <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                        Explain Reason for Exemption <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="exempt_text"
                        value={formData.exempt_text}
                        onChange={handleChange}
                        placeholder="e.g. Military Spouses Residency Relief Act (MSRRA)"
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${inputBg}`}
                      />
                    </div>
                  )}
                </div>

                {/* 8c */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  formData.exempt_type === 'c' 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300')
                    : subCardBg
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exempt_type"
                      checked={formData.exempt_type === 'c'}
                      onChange={() => setFormData(p => ({ ...p, exempt_type: 'c' }))}
                      className="mt-0.5 w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <div>
                      <span className={`text-xs font-black block ${headingColor}`}>
                        c. Permanent home (domicile) is located in a Michigan Renaissance Zone.
                      </span>
                      <span className={`text-[11px] ${labelColor} leading-relaxed`}>
                        Employee qualifies under the Michigan Renaissance Zone Act.
                      </span>
                    </div>
                  </label>

                  {formData.exempt_type === 'c' && (
                    <div className="mt-3 pl-7">
                      <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                        Name of Renaissance Zone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="exempt_text"
                        value={formData.exempt_text}
                        onChange={handleChange}
                        placeholder="e.g. Detroit Renaissance Zone 1"
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${inputBg}`}
                      />
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: DECLARATION & DIGITAL SIGNATURE */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <PenTool size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${headingColor}`}>Declaration & Digital Signature (Line 9)</h2>
              <p className={`text-xs ${labelColor}`}>Certify your Michigan withholding exemptions statement under penalties of perjury.</p>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border mb-6 ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs leading-relaxed italic ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
              "Under penalty of perjury, I certify that the number of withholding exemptions claimed on this certificate does not exceed the number I am allowed to claim. If claiming exemption from withholding, I certify that I do not anticipate a Michigan income tax liability this year."
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
                <span>Generating Form MI-W4...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Confirm & Generate Michigan Form MI-W4</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default MichiganTaxForm;