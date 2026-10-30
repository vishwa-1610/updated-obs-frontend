import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Building2, MapPin, Check, HeartHandshake,
  HelpCircle, ArrowRight, CreditCard, Flag, ChevronUp
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form W-4MN</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Minnesota Withholding Allowance/Exemption Certificate...
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
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
          isDarkMode 
            ? 'bg-[#181a20] border-zinc-700/80 hover:border-zinc-600 text-zinc-100' 
            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar size={15} style={{ color: activeHexColor }} />
          <span className="font-semibold">{value || "Select Date"}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-400' : 'text-zinc-500'}`} />
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-1.5 p-3 rounded-2xl shadow-xl border w-64 animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-extrabold tracking-wide">
              {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <div className="flex gap-1">
              <button 
                type="button" 
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                type="button" 
                onClick={() => changeMonth(1)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-zinc-400">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDayOfMonth).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="h-6" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = value === dateStr;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  style={isSelected ? { backgroundColor: activeHexColor, color: '#fff' } : {}}
                  className={`h-6 text-[11px] font-semibold rounded-lg flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'shadow-sm font-bold' 
                      : isDarkMode 
                        ? 'hover:bg-zinc-800 text-zinc-300' 
                        : 'hover:bg-slate-100 text-slate-700'
                  }`}
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

// --- MAIN MINNESOTA FORM COMPONENT ---
const MinnesotaTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
  const [showItemizedWorksheet, setShowItemizedWorksheet] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'MN',
    zipcode: '',
    phone: '',

    // Marital Status (1=Single, 2=Married, 3=Married Higher Single Rate)
    marital_status: '1',

    // Section 1: Allowances Worksheet (A-F)
    line1a: true,   // Yourself
    line1b: false,  // Single/1 job or Married 1 job spouse doesn't work
    line1c: false,  // Married (or 0 if working spouse)
    line1d: 0,      // Dependents count
    line1e: false,  // Head of Household

    // Additional Withholding
    additional_withholding: '',

    // Page 2: Itemized Deductions & Additional Income Worksheet
    itemized_deductions: 0,
    nonwage_income: 0,

    // Section 2: Exemption from Withholding
    exempt: false,
    exempt_type: '', // A, B, C, D, E, F
    state_of_domicile: '',
    reservation_name: '',
    cdib_number: '',

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null,

    // Employer Details
    employer_name: 'Tech Innovators Inc.',
    employer_mn_id: '9876543',
    employer_ein: '38-1234567',
    employer_address: '100 Innovation Way, Suite 300',
    employer_city: 'Minneapolis',
    employer_state: 'MN',
    employer_zipcode: '55401'
  });

  // Load Initial Data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || '',
        middle_initial: initialData.middle_initial || initialData.middle_name || initialData.initial || '',
        last_name: initialData.last_name || '',
        ssn: initialData.ssn || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: 'MN',
        zipcode: initialData.zipcode ? String(initialData.zipcode).slice(0, 5) : '',
        phone: initialData.phone || initialData.phone_number || '',
        marital_status: String(initialData.marital_status || initialData.filing_status || '1'),
        additional_withholding: initialData.additional_withholding ? String(initialData.additional_withholding).replace('$', '') : '',
        employer_name: initialData.employer_name || initialData.client_name || prev.employer_name,
        employer_ein: initialData.employer_ein || initialData.fein || prev.employer_ein,
        employer_mn_id: initialData.employer_mn_id || initialData.state_tax_id || prev.employer_mn_id,
        employer_address: initialData.employer_address || initialData.client_address || prev.employer_address,
        employer_city: initialData.employer_city || initialData.client_city || prev.employer_city,
        employer_state: initialData.employer_state || 'MN',
        employer_zipcode: initialData.employer_zipcode || initialData.client_zipcode || prev.employer_zipcode
      }));
    }
  }, [initialData]);

  // Handle Resize of Signature Canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) sigCanvasRef.current.fromDataURL(savedData);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Quick Autofill Benchmark
  const handleQuickAutofill = () => {
    setFormData(prev => ({
      ...prev,
      first_name: 'vishwa',
      middle_initial: '',
      last_name: 'visu',
      ssn: '123-45-6789',
      address: '123 North 1st St, Apt 4A',
      city: 'Minneapolis',
      state: 'MN',
      zipcode: '55401',
      phone: '(612) 555-0199',
      marital_status: '2',
      line1a: true,
      line1b: true,
      line1c: true,
      line1d: 2,
      line1e: false,
      additional_withholding: '25.00',
      exempt: false,
      exempt_type: '',
      confirmation_date: new Date().toISOString().split('T')[0],
      employer_name: 'Tech Innovators Inc.',
      employer_ein: '38-1234567',
      employer_mn_id: '9876543',
      employer_address: '100 Innovation Way, Suite 300',
      employer_city: 'Minneapolis',
      employer_state: 'MN',
      employer_zipcode: '55401'
    }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: dataUrl }));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setFormData(prev => ({ ...prev, signature_image: null }));
    }
  };

  // Calculations for Section 1 Worksheet
  const aVal = formData.line1a ? 1 : 0;
  const bVal = formData.line1b ? 1 : 0;
  const cVal = formData.line1c ? 1 : 0;
  const dVal = Math.max(0, parseInt(formData.line1d, 10) || 0);
  const eVal = formData.line1e ? 1 : 0;
  const fVal = aVal + bVal + cVal + dVal + eVal;

  // Page 2 Worksheet Calculation
  const itemizedVal = Math.max(0, parseInt(formData.itemized_deductions, 10) || 0);
  const nonwageVal = Math.max(0, parseInt(formData.nonwage_income, 10) || 0);
  const stdDedMap = { '1': 14950, '2': 29900, '3': 22500 };
  const stdDed = stdDedMap[formData.marital_status] || 14950;
  const step3 = Math.max(0, itemizedVal - stdDed);
  const step5 = step3;
  const step7 = step5 - nonwageVal;
  const step8 = step7 >= 0 ? Math.floor(step7 / 5200) : 0;
  const step10 = Math.max(0, fVal + step8);

  const calculatedAllowances = showItemizedWorksheet && itemizedVal > 0 ? step10 : fVal;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorModal({ isOpen: true, title: "Name Required", message: "Please provide employee first and last name." });
      return;
    }
    const cleanSSN = formData.ssn.replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      setErrorModal({ isOpen: true, title: "Invalid SSN", message: "Please enter a valid 9-digit Social Security Number." });
      return;
    }
    if (!formData.address.trim() || !formData.city.trim() || !formData.zipcode.trim()) {
      setErrorModal({ isOpen: true, title: "Incomplete Address", message: "Please complete permanent street address, city, and 5-digit ZIP code." });
      return;
    }

    if (formData.exempt) {
      if (!formData.exempt_type) {
        setErrorModal({ isOpen: true, title: "Exemption Reason Required", message: "Please select an exemption option (Box A - F) in Section 2." });
        return;
      }
      if (formData.exempt_type === 'C' && !formData.state_of_domicile.trim()) {
        setErrorModal({ isOpen: true, title: "State of Domicile Required", message: "Under Box C (Military Spouse MSRRA), you must provide your legal State of Domicile." });
        return;
      }
      if (formData.exempt_type === 'D' && (!formData.reservation_name.trim() || !formData.cdib_number.trim())) {
        setErrorModal({ isOpen: true, title: "Tribal Details Required", message: "Under Box D (American Indian Exemption), you must enter your Reservation Name and CDIB / Enrollment Number." });
        return;
      }
    }

    let finalSig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      finalSig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    setIsLoading(true);

    const payload = {
      ...formData,
      allowances: calculatedAllowances,
      line1: calculatedAllowances,
      line1_final: calculatedAllowances,
      total_allowances: calculatedAllowances,
      signature_image: finalSig,
      exempt_text: formData.exempt_type === 'C' ? formData.state_of_domicile : formData.reservation_name,
      exempt_cdib: formData.cdib_number
    };

    onSubmit(payload);
  };

  // Styling helper tokens
  const cardBg = isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const innerCardBg = isDarkMode ? 'bg-[#12141a] border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/80';
  const labelColor = isDarkMode ? 'text-zinc-400' : 'text-slate-600';
  const textColor = isDarkMode ? 'text-zinc-100' : 'text-slate-800';
  const inputBg = isDarkMode 
    ? 'bg-[#12141a] border-zinc-700/80 text-zinc-100 focus:border-zinc-500' 
    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500 shadow-sm';

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0d0f15] text-zinc-100' : 'bg-slate-50/50 text-slate-900'
    }`}>
      {isLoading && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeHexColor} />}
      <ErrorModal 
        isOpen={errorModal.isOpen} 
        title={errorModal.title} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} 
        isDarkMode={isDarkMode} 
      />

      {/* HEADER BANNER */}
      <div className={`p-6 sm:p-8 rounded-3xl border mb-6 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <FileText size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-sm"
                  style={{ backgroundColor: activeHexColor }}
                >
                  Form W-4MN
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  Tax Year 2025
                </span>
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Minnesota Dept. of Revenue
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Minnesota Withholding Allowance/Exemption Certificate
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Complete Section 1 or Section 2, then sign and certify to determine accurate Minnesota withholding.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAutofill}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all self-start md:self-center shrink-0 ${
              isDarkMode 
                ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <span>Autofill Sample (vishwa visu)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <User size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              1. Employee Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="e.g. Sarah"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                M.I.
              </label>
              <input
                type="text"
                name="middle_initial"
                maxLength="2"
                value={formData.middle_initial}
                onChange={handleChange}
                placeholder="M"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-center outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="e.g. Jenkins"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                Social Security Number (SSN) *
              </label>
              <input
                type="text"
                name="ssn"
                value={formData.ssn}
                onChange={handleChange}
                required
                placeholder="XXX-XX-XXXX"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                Daytime Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(612) 555-0144"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-12">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                Permanent Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="e.g. 452 Hennepin Ave, Apt 12A"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="e.g. Minneapolis"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                State
              </label>
              <input
                type="text"
                value="MN"
                readOnly
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-black text-center opacity-80 cursor-not-allowed ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-4">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipcode"
                maxLength="5"
                value={formData.zipcode}
                onChange={handleChange}
                required
                placeholder="55403"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: MARITAL STATUS */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <HeartHandshake size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              2. Marital Status (Check one)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                code: '1',
                title: 'Single / Married Separate',
                desc: 'Single; Married, but legally separated; or Spouse is a nonresident alien'
              },
              {
                code: '2',
                title: 'Married',
                desc: 'Married filing jointly on Minnesota return'
              },
              {
                code: '3',
                title: 'Married at Higher Single Rate',
                desc: 'Married, but withhold at higher Single rate (recommended if both work)'
              }
            ].map((status) => {
              const isSelected = formData.marital_status === status.code;
              return (
                <div
                  key={status.code}
                  onClick={() => setFormData(prev => ({ ...prev, marital_status: status.code }))}
                  style={isSelected ? { borderColor: activeHexColor, backgroundColor: `${activeHexColor}0e` } : {}}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'shadow-sm' 
                      : isDarkMode ? 'bg-[#12141a] border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black tracking-tight">{status.title}</span>
                    <div 
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-transparent text-white' : 'border-zinc-400'
                      }`}
                      style={isSelected ? { backgroundColor: activeHexColor } : {}}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {status.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: SECTION 1 ALLOWANCES WORKSHEET */}
        <div className={`p-6 sm:p-7 rounded-3xl border transition-opacity ${cardBg} ${formData.exempt ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Calculator size={18} style={{ color: activeHexColor }} />
              <h3 className="text-sm font-extrabold tracking-wide uppercase">
                Section 1 — Determining Minnesota Allowances
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400">Total Calculated:</span>
              <span 
                className="px-3 py-1 rounded-full text-xs font-black text-white shadow-sm"
                style={{ backgroundColor: activeHexColor }}
              >
                {calculatedAllowances} Allowances
              </span>
            </div>
          </div>

          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Complete lines A through F below to calculate your personal withholding allowances. If claiming exemption in Section 2, this section will be skipped.
          </p>

          <div className="space-y-3 mb-6">
            {/* Step A */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${innerCardBg}`}>
              <div className="flex-1">
                <span className="text-xs font-bold block mb-0.5">
                  Step A — Enter "1" if no one else can claim you as a dependent
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Personal allowance for yourself.
                </span>
              </div>
              <input
                type="checkbox"
                name="line1a"
                checked={formData.line1a}
                onChange={handleChange}
                className="w-5 h-5 rounded-md cursor-pointer accent-blue-600"
              />
            </div>

            {/* Step B */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${innerCardBg}`}>
              <div className="flex-1">
                <span className="text-xs font-bold block mb-0.5">
                  Step B — Enter "1" if single with 1 job, or married with 1 job and spouse doesn't work
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Applies if wages from second job or spouse wages are $1,500 or less.
                </span>
              </div>
              <input
                type="checkbox"
                name="line1b"
                checked={formData.line1b}
                onChange={handleChange}
                className="w-5 h-5 rounded-md cursor-pointer accent-blue-600"
              />
            </div>

            {/* Step C */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${innerCardBg}`}>
              <div className="flex-1">
                <span className="text-xs font-bold block mb-0.5">
                  Step C — Enter "1" if you are married
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Or choose "0" if working spouse or multiple jobs to avoid under-withholding.
                </span>
              </div>
              <input
                type="checkbox"
                name="line1c"
                checked={formData.line1c}
                onChange={handleChange}
                className="w-5 h-5 rounded-md cursor-pointer accent-blue-600"
              />
            </div>

            {/* Step D */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${innerCardBg}`}>
              <div className="flex-1">
                <span className="text-xs font-bold block mb-0.5">
                  Step D — Number of dependents you will claim on tax return
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Count qualifying children and relatives (other than yourself or spouse).
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="20"
                name="line1d"
                value={formData.line1d}
                onChange={handleChange}
                className={`w-20 px-3 py-1.5 rounded-xl border text-xs font-bold text-center outline-none ${inputBg}`}
              />
            </div>

            {/* Step E */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${innerCardBg}`}>
              <div className="flex-1">
                <span className="text-xs font-bold block mb-0.5">
                  Step E — Enter "1" if you will file as Head of Household
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Unmarried maintaining a home for qualifying child or dependent.
                </span>
              </div>
              <input
                type="checkbox"
                name="line1e"
                checked={formData.line1e}
                onChange={handleChange}
                className="w-5 h-5 rounded-md cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Line 1 & Line 2 Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className={`p-4 rounded-2xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  Line 1: Minnesota Allowances
                </span>
                <span className="text-base font-black" style={{ color: activeHexColor }}>
                  {calculatedAllowances}
                </span>
              </div>
              <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Total allowances claimed from Step F above or Step 10 of Itemized Deductions Worksheet.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  Line 2: Additional Withholding ($)
                </span>
              </div>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="additional_withholding"
                  value={formData.additional_withholding}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputBg}`}
                />
              </div>
              <p className={`text-[10px] mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Additional amount deducted from each paycheck.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: ITEMIZED DEDUCTIONS WORKSHEET (PAGE 2) */}
        <div className={`rounded-3xl border overflow-hidden ${cardBg} ${formData.exempt ? 'opacity-40 pointer-events-none' : ''}`}>
          <button
            type="button"
            onClick={() => setShowItemizedWorksheet(!showItemizedWorksheet)}
            className={`w-full p-5 sm:p-6 flex items-center justify-between text-left transition-colors ${
              isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <Calculator size={18} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold tracking-wide uppercase">
                  Itemized Deductions & Additional Income Worksheet (Page 2)
                </h4>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Optional: If you anticipate large itemized deductions exceeding standard deduction.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                showItemizedWorksheet ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {showItemizedWorksheet ? 'Active' : 'Expand'}
              </span>
              {showItemizedWorksheet ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {showItemizedWorksheet && (
            <div className="p-6 sm:p-7 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    Step 1 — Estimated Minnesota Itemized Deductions ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="itemized_deductions"
                    value={formData.itemized_deductions}
                    onChange={handleChange}
                    placeholder="e.g. 45500"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    Step 6 — Estimated Taxable Nonwage Income ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nonwage_income"
                    value={formData.nonwage_income}
                    onChange={handleChange}
                    placeholder="0"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none ${inputBg}`}
                  />
                </div>
              </div>

              {/* Live Page 2 calculation summary */}
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${innerCardBg}`}>
                <div className="flex justify-between">
                  <span className={labelColor}>Step 2: Standard Deduction (Status {formData.marital_status}):</span>
                  <span className="font-bold">${stdDed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={labelColor}>Step 3: Excess Deductions (Step 1 - Step 2):</span>
                  <span className="font-bold">${step3.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={labelColor}>Step 8: Divide Step 7 by $5,200:</span>
                  <span className="font-bold">+{step8} Allowances</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-2">
                  <span className="font-extrabold">Step 10: Final Allowances (Step 9 [{fVal}] + Step 8 [{step8}]):</span>
                  <span className="font-black" style={{ color: activeHexColor }}>{step10}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: SECTION 2 EXEMPTION FROM WITHHOLDING */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Flag size={18} className="text-amber-500" />
              <h3 className="text-sm font-extrabold tracking-wide uppercase">
                Section 2 — Exemption From Minnesota Withholding
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="exempt"
                checked={formData.exempt}
                onChange={handleChange}
                className="w-4 h-4 rounded cursor-pointer accent-blue-600"
              />
              <span className="text-xs font-black">Claim Exemption</span>
            </label>
          </div>

          <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            If you claim exemption, no Minnesota income tax will be withheld from your wages. You must meet statutory qualifications under Box A, B, C, D, E, or F.
          </p>

          {formData.exempt ? (
            <div className="space-y-3 animate-in fade-in duration-200">
              {[
                {
                  code: 'A',
                  title: 'Box A — Exempt from Both Federal & Minnesota Withholding',
                  desc: 'You meet federal exempt rules, had no MN tax liability last year (full refund), and anticipate zero MN liability this year.'
                },
                {
                  code: 'B',
                  title: 'Box B — Minnesota Only Exemption (No Tax Liability)',
                  desc: 'Did not claim exempt federally, but had no MN tax liability last year and anticipate zero MN liability this year.'
                },
                {
                  code: 'C',
                  title: 'Box C — Military Spouses Residency Relief Act (MSRRA)',
                  desc: 'Spouse is military service member assigned to MN, and legal domicile is in another state.'
                },
                {
                  code: 'D',
                  title: 'Box D — American Indian Living & Working on Reservation',
                  desc: 'Enrolled tribal member that resides and performs work on the reservation of which you are enrolled.'
                },
                {
                  code: 'E',
                  title: 'Box E — Minnesota National Guard or Active Duty Military',
                  desc: 'Active service member claiming exempt from MN withholding on military pay.'
                },
                {
                  code: 'F',
                  title: 'Box F — Military Retirement or Pension Pay',
                  desc: 'Receiving military pension or retirement pay under US Code Title 10.'
                }
              ].map((opt) => {
                const isSelected = formData.exempt_type === opt.code;
                return (
                  <div
                    key={opt.code}
                    onClick={() => setFormData(prev => ({ ...prev, exempt_type: opt.code }))}
                    style={isSelected ? { borderColor: activeHexColor, backgroundColor: `${activeHexColor}0e` } : {}}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'shadow-sm' 
                        : isDarkMode ? 'bg-[#12141a] border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black">{opt.title}</span>
                      <div 
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-transparent text-white' : 'border-zinc-400'
                        }`}
                        style={isSelected ? { backgroundColor: activeHexColor } : {}}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {opt.desc}
                    </p>

                    {/* Specific Sub-Inputs for Box C */}
                    {isSelected && opt.code === 'C' && (
                      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${labelColor}`}>
                          Legal State of Domicile *
                        </label>
                        <input
                          type="text"
                          name="state_of_domicile"
                          value={formData.state_of_domicile}
                          onChange={handleChange}
                          placeholder="e.g. Texas"
                          className={`w-full sm:w-64 px-3 py-1.5 rounded-xl border text-xs font-medium outline-none ${inputBg}`}
                        />
                      </div>
                    )}

                    {/* Specific Sub-Inputs for Box D */}
                    {isSelected && opt.code === 'D' && (
                      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                        <div>
                          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${labelColor}`}>
                            Reservation Name *
                          </label>
                          <input
                            type="text"
                            name="reservation_name"
                            value={formData.reservation_name}
                            onChange={handleChange}
                            placeholder="e.g. Mille Lacs Reservation"
                            className={`w-full px-3 py-1.5 rounded-xl border text-xs font-medium outline-none ${inputBg}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${labelColor}`}>
                            CDIB / Tribal Enrollment Number *
                          </label>
                          <input
                            type="text"
                            name="cdib_number"
                            value={formData.cdib_number}
                            onChange={handleChange}
                            placeholder="e.g. ML-98765-X"
                            className={`w-full px-3 py-1.5 rounded-xl border text-xs font-medium outline-none ${inputBg}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-4 rounded-2xl border text-center ${innerCardBg}`}>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Section 1 is active. If you qualify for Minnesota tax exemption, check <strong>"Claim Exemption"</strong> above.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 6: DECLARATION & SIGNATURE */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Shield size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              3. Declaration & Employee Digital Signature
            </h3>
          </div>

          <div className={`p-4 rounded-2xl border mb-6 flex items-start gap-3 ${
            isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong>Statutory Certification:</strong> I certify that all information provided in Section 1 OR Section 2 is correct. I understand there is a <strong>$500 penalty</strong> for filing a false Form W-4MN.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <CustomDatePicker
              label="Date of Signing *"
              name="confirmation_date"
              value={formData.confirmation_date}
              onChange={handleChange}
              isDarkMode={isDarkMode}
              activeHexColor={activeHexColor}
            />

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                Full Legal Name for Certificate
              </label>
              <input
                type="text"
                readOnly
                value={`${formData.first_name} ${formData.middle_initial ? formData.middle_initial + ' ' : ''}${formData.last_name}`.trim() || 'Employee Name'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold opacity-80 cursor-not-allowed ${inputBg}`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${labelColor}`}>
                Digital Signature * (Sign within box)
              </label>
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
              >
                <Eraser size={13} /> Clear Canvas
              </button>
            </div>

            <div 
              ref={containerRef}
              className={`border-2 border-dashed rounded-2xl overflow-hidden h-44 w-full relative cursor-crosshair shadow-inner ${
                isDarkMode ? 'bg-[#12141a] border-zinc-700' : 'bg-white border-slate-300'
              }`}
            >
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor={isDarkMode ? '#ffffff' : '#002060'}
                velocityFilterWeight={0.7}
                canvasProps={{ className: 'sigCanvas w-full h-full' }}
                onEnd={handleSignatureEnd}
              />
              {!formData.signature_image && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400 gap-2">
                  <PenTool size={22} className="opacity-40 animate-pulse" />
                  <span className="text-xs font-semibold">Draw signature here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 7: EMPLOYER SECTION PREVIEW */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Building2 size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              Employer Information (Auto-Populated for Form Lines 10–11)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Employer Name</span>
              <span className="text-xs font-bold">{formData.employer_name}</span>
            </div>
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Minnesota Tax ID</span>
              <span className="text-xs font-bold">{formData.employer_mn_id}</span>
            </div>
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Federal EIN</span>
              <span className="text-xs font-bold">{formData.employer_ein}</span>
            </div>
            <div className={`sm:col-span-3 p-3 rounded-xl border ${innerCardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Employer Address</span>
              <span className="text-xs font-bold">{formData.employer_address}, {formData.employer_city}, {formData.employer_state} {formData.employer_zipcode}</span>
            </div>
          </div>
        </div>

        {/* SUBMISSION BAR */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            style={{ backgroundColor: activeHexColor }}
            className="px-8 py-3.5 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save size={18} />
            <span>Confirm & Generate Form W-4MN</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </form>
    </div>
  );
};

export default MinnesotaTaxForm;