import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Sparkles, Building2, MapPin, Check, HeartHandshake,
  HelpCircle, ArrowRight, CreditCard, Flag, Award
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form MO W-4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Missouri Employee's Withholding Certificate...
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

// --- MAIN MISSOURI FORM COMPONENT ---
const MissouriTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'MO',
    zipcode: '',

    // Line 1: Filing Status ('1'=Single/Married Spouse Works, '2'=Married Spouse No Work, '3'=Head of Household)
    filing_status_mo: '1',

    // Line 2: Additional withholding
    additional_withholding: '',

    // Line 3: Reduced withholding
    reduced_withholding: '',

    // Line 4: Exemption from withholding
    exempt: false,
    exempt_reason: '1', // '1'=Refund, '2'=SCRA/MSRRA, '3'=Military

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null,

    // Employer Information
    employer_name: 'Tech Innovators Inc.',
    employer_ein: '12-3456789',
    employer_state_tax_id: '12345678',
    employer_address: '100 Innovation Way',
    employer_city: 'St. Louis',
    employer_state: 'MO',
    employer_zipcode: '63101',
    first_day_worked: new Date().toISOString().split('T')[0]
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
        state: 'MO',
        zipcode: initialData.zipcode ? String(initialData.zipcode).slice(0, 5) : '',
        filing_status_mo: String(initialData.filing_status_mo || initialData.filing_status || '1'),
        additional_withholding: initialData.additional_withholding ? String(initialData.additional_withholding).replace('$', '') : '',
        reduced_withholding: initialData.reduced_withholding ? String(initialData.reduced_withholding).replace('$', '') : '',
        exempt: Boolean(initialData.exempt),
        exempt_reason: String(initialData.exempt_reason || '1'),
        employer_name: initialData.employer_name || initialData.client_name || prev.employer_name,
        employer_ein: initialData.employer_ein || initialData.fein || prev.employer_ein,
        employer_state_tax_id: initialData.employer_state_tax_id || initialData.mo_tax_id || prev.employer_state_tax_id,
        employer_address: initialData.employer_address || initialData.client_address || prev.employer_address,
        employer_city: initialData.employer_city || initialData.client_city || prev.employer_city,
        employer_state: initialData.employer_state || 'MO',
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
    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 5) }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Quick Autofill Benchmark
  const handleQuickAutofill = () => {
    setFormData(prev => ({
      ...prev,
      first_name: 'Vishwa',
      middle_initial: 'K',
      last_name: 'Visu',
      ssn: '123-45-6789',
      address: '456 Gateway Blvd, Apt 10A',
      city: 'Kansas City',
      state: 'MO',
      zipcode: '64108',
      filing_status_mo: '1',
      additional_withholding: '45.00',
      reduced_withholding: '',
      exempt: false,
      exempt_reason: '1',
      confirmation_date: new Date().toISOString().split('T')[0],
      employer_name: 'Tech Innovators Inc.',
      employer_ein: '12-3456789',
      employer_state_tax_id: '12345678',
      employer_address: '100 Innovation Way',
      employer_city: 'St. Louis',
      employer_state: 'MO',
      employer_zipcode: '63101',
      first_day_worked: new Date().toISOString().split('T')[0]
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

  const handleSubmit = (e) => {
    e.preventDefault();

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
      setErrorModal({ isOpen: true, title: "Incomplete Address", message: "Please complete street address, city, and 5-digit ZIP code." });
      return;
    }

    let finalSig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      finalSig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    setIsLoading(true);

    const payload = {
      ...formData,
      additional_withholding: formData.additional_withholding ? parseFloat(formData.additional_withholding) || 0 : 0,
      reduced_withholding: formData.reduced_withholding ? parseFloat(formData.reduced_withholding) || 0 : 0,
      signature_image: finalSig
    };

    onSubmit(payload);
  };

  // Styling helper tokens
  const cardBg = isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const innerCardBg = isDarkMode ? 'bg-[#12141a] border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/80';
  const labelColor = isDarkMode ? 'text-zinc-400' : 'text-slate-600';
  const inputBg = isDarkMode 
    ? 'bg-[#12141a] border-zinc-700/80 text-zinc-100 focus:border-zinc-500' 
    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500 shadow-sm';

  const filingStatusOptions = [
    {
      code: '1',
      title: 'Single or Married Spouse Works',
      subtitle: 'Also applies to Married Filing Separate taxpayers.',
      rateBadge: 'Standard Single Rate'
    },
    {
      code: '2',
      title: 'Married (Spouse does not work)',
      subtitle: 'Applies when spouse has no earned income or income under the standard threshold.',
      rateBadge: 'Full Joint Rate'
    },
    {
      code: '3',
      title: 'Head of Household',
      subtitle: 'For unmarried individuals providing over half the cost of maintaining a home for a qualifying dependent.',
      rateBadge: 'Head of Household Rate'
    }
  ];

  const exemptReasonOptions = [
    {
      code: '1',
      title: 'Prior & Current Year Zero Tax Liability (Line 4a)',
      description: 'I had a right to a refund of all Missouri income tax withheld last year and expect to have no tax liability this year. (Must be renewed annually)'
    },
    {
      code: '2',
      title: 'Servicemembers Civil Relief Act / MSRRA (Line 4b)',
      description: 'I meet the conditions set forth under the Servicemembers Civil Relief Act, as amended by the Military Spouses Residency Relief Act, and have no Missouri tax liability.'
    },
    {
      code: '3',
      title: 'Active Duty Armed Forces Military Deduction (Line 4c)',
      description: 'My income is earned as a member of any active duty component of the Armed Forces of the United States and I am eligible for the military income deduction.'
    }
  ];

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
                  Form MO W-4
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  Rev. 12-2024
                </span>
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Missouri Department of Revenue
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Missouri Employee's Withholding Certificate
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Complete this certificate for Missouri state income tax withholding and child support enforcement.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAutofill}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all shadow-sm shrink-0 self-start md:self-center ${
              isDarkMode 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={14} style={{ color: activeHexColor }} />
            <span>Autofill Sample</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. PERSONAL INFORMATION */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <User size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              1. Employee Identification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${inputBg}`}
                placeholder="First name"
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                M.I.
              </label>
              <input
                type="text"
                name="middle_initial"
                maxLength="1"
                value={formData.middle_initial}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-center uppercase ${inputBg}`}
                placeholder="M"
              />
            </div>

            <div className="md:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${inputBg}`}
                placeholder="Last name"
              />
            </div>

            <div className="md:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                Social Security Number (SSN) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleChange}
                  required
                  maxLength="11"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold tracking-wider ${inputBg}`}
                  placeholder="XXX-XX-XXXX"
                />
                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="md:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${inputBg}`}
                placeholder="Street address or P.O. Box"
              />
            </div>

            <div className="md:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                City or Town *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${inputBg}`}
                placeholder="City"
              />
            </div>

            <div className="md:col-span-3">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                State
              </label>
              <input
                type="text"
                name="state"
                readOnly
                value="MO"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-center ${
                  isDarkMode ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              />
            </div>

            <div className="md:col-span-4">
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
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${inputBg}`}
                placeholder="64108"
              />
            </div>
          </div>
        </div>

        {/* 2. FILING STATUS (LINE 1) */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <FileText size={18} style={{ color: activeHexColor }} />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">
                2. Line 1: Filing Status
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isDarkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {filingStatusOptions.map(opt => {
              const isSelected = formData.filing_status_mo === opt.code;
              return (
                <div
                  key={opt.code}
                  onClick={() => setFormData(prev => ({ ...prev, filing_status_mo: opt.code }))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                    isSelected 
                      ? 'border-transparent shadow-md' 
                      : isDarkMode ? 'border-zinc-800 hover:border-zinc-700 bg-[#12141a]' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  style={isSelected ? { 
                    backgroundColor: isDarkMode ? `${activeHexColor}18` : `${activeHexColor}0c`, 
                    borderColor: activeHexColor 
                  } : {}}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'border-transparent' : 'border-zinc-400'
                      }`} style={isSelected ? { backgroundColor: activeHexColor } : {}}>
                        {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {opt.rateBadge}
                      </span>
                    </div>
                    <h4 className="text-xs font-black mb-1">{opt.title}</h4>
                    <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {opt.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. WITHHOLDING ADJUSTMENTS (LINES 2 & 3) */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Calculator size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              3. Withholding Adjustments (Lines 2 & 3)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Line 2: Additional Withholding */}
            <div className={`p-4 rounded-2xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black">Line 2: Additional Withholding ($)</span>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Expected Balance Due
                </span>
              </div>
              <p className={`text-[11px] mb-3 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                If you expect a balance due (from investment income, side gig, etc.), divide the expected tax by the number of pay periods in a year.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="additional_withholding"
                  value={formData.additional_withholding}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-7 pr-3.5 py-2.5 rounded-xl border text-xs font-bold ${inputBg}`}
                />
              </div>
            </div>

            {/* Line 3: Reduced Withholding */}
            <div className={`p-4 rounded-2xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black">Line 3: Reduced Withholding ($)</span>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  Expected Refund
                </span>
              </div>
              <p className={`text-[11px] mb-3 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                If you expect a refund (itemized deductions, modifications, tax credits), enter the exact dollar amount to withhold per pay period instead of standard calculations.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="reduced_withholding"
                  value={formData.reduced_withholding}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-7 pr-3.5 py-2.5 rounded-xl border text-xs font-bold ${inputBg}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. EXEMPT STATUS (LINE 4) */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Flag size={18} style={{ color: activeHexColor }} />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">
                4. Line 4: Exemption from Withholding
              </h3>
            </div>
            {formData.exempt && (
              <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                EXEMPT Claimed
              </span>
            )}
          </div>

          <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
            formData.exempt 
              ? 'border-amber-500/40 bg-amber-500/5' 
              : isDarkMode ? 'border-zinc-800 hover:border-zinc-700 bg-[#12141a]' : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}>
            <input
              type="checkbox"
              name="exempt"
              checked={formData.exempt}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-xs font-extrabold tracking-wide">
                I claim exemption from Missouri income tax withholding
              </span>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Indicates "EXEMPT" on Line 4. Select your qualifying statutory exemption reason below.
              </p>
            </div>
          </label>

          {formData.exempt && (
            <div className="mt-4 space-y-3 animate-in fade-in duration-200">
              <span className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelColor}`}>
                Select Missouri Statutory Reason:
              </span>
              {exemptReasonOptions.map(reason => {
                const isSelected = formData.exempt_reason === reason.code;
                return (
                  <div
                    key={reason.code}
                    onClick={() => setFormData(prev => ({ ...prev, exempt_reason: reason.code }))}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected 
                        ? 'border-transparent shadow-sm' 
                        : isDarkMode ? 'border-zinc-800 hover:border-zinc-700 bg-[#12141a]' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                    style={isSelected ? { 
                      backgroundColor: isDarkMode ? `${activeHexColor}18` : `${activeHexColor}0c`, 
                      borderColor: activeHexColor 
                    } : {}}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-transparent' : 'border-zinc-400'
                    }`} style={isSelected ? { backgroundColor: activeHexColor } : {}}>
                      {isSelected && <Check size={10} className="text-white stroke-[3]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold mb-0.5">{reason.title}</h4>
                      <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {reason.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. EMPLOYER INFORMATION REVIEW */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Building2 size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              5. Employer Information (Auto-Populated)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className="text-[10px] font-bold text-zinc-400 block mb-0.5">Employer Name</span>
              <span className="text-xs font-bold">{formData.employer_name}</span>
            </div>
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className="text-[10px] font-bold text-zinc-400 block mb-0.5">Federal EIN</span>
              <span className="text-xs font-bold">{formData.employer_ein}</span>
            </div>
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className="text-[10px] font-bold text-zinc-400 block mb-0.5">MO Tax ID</span>
              <span className="text-xs font-bold">{formData.employer_state_tax_id}</span>
            </div>
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className="text-[10px] font-bold text-zinc-400 block mb-0.5">First Day Worked</span>
              <span className="text-xs font-bold">{formData.first_day_worked}</span>
            </div>
          </div>
        </div>

        {/* 6. DECLARATION & SIGNATURE */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <PenTool size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              6. Employee Declaration & Digital Signature
            </h3>
          </div>

          <p className={`text-xs mb-5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Under penalties of perjury, I certify that the information provided on this form is true and accurate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-8">
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${labelColor}`}>
                  Digital Signature Canvas *
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Eraser size={13} />
                  <span>Clear</span>
                </button>
              </div>

              <div 
                ref={containerRef}
                className={`h-36 rounded-2xl border relative overflow-hidden transition-all ${
                  isDarkMode ? 'bg-[#12141a] border-zinc-700/80 hover:border-zinc-600' : 'bg-white border-slate-300 hover:border-slate-400 shadow-sm'
                }`}
              >
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? '#ffffff' : '#000000'}
                  velocityFilterWeight={0.7}
                  canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
                  onEnd={handleSignatureEnd}
                />
                {!formData.signature_image && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30 gap-1.5">
                    <PenTool size={22} style={{ color: activeHexColor }} />
                    <span className="text-[11px] font-extrabold tracking-wide uppercase">Sign With Mouse or Finger</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-4">
              <CustomDatePicker
                label="Date Signed *"
                name="confirmation_date"
                value={formData.confirmation_date}
                onChange={handleChange}
                isDarkMode={isDarkMode}
                activeHexColor={activeHexColor}
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-4 pt-3 pb-8">
          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: activeHexColor }}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Confirm & Generate MO W-4 PDF</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default MissouriTaxForm;