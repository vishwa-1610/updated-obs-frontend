import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Building2, MapPin, Check, HeartHandshake,
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form 89-350</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Mississippi Employee's Withholding Exemption Certificate...
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

// --- MAIN MISSISSIPPI FORM COMPONENT ---
const MississippiTaxForm = ({ initialData, onSubmit }) => {
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
    state: 'MS',
    zipcode: '',

    // Filing Status: '1'=Single ($6,000), '2'=Married ($12,000), '3'=Head of Family ($9,500)
    filing_status: '1',
    spouse_employed: false,
    spouse_claim_amount: '6000',

    // Line 4 Dependents ($1,500 each)
    dependents: 0,

    // Line 5 Age and Blindness ($1,500 each)
    age_65: false,
    blind_self: false,
    spouse_65: false,
    spouse_blind: false,

    // Line 7 Additional dollar amount
    additional_withholding: '',

    // Line 8 Military Spouses Residency Relief Act
    military_spouse_exempt: false,

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null,

    // Employer Info
    employer_name: 'Tech Innovators Inc.',
    employer_ein: '38-1234567',
    employer_address: '100 Innovation Way',
    employer_city: 'Jackson',
    employer_state: 'MS',
    employer_zipcode: '39201'
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
        state: 'MS',
        zipcode: initialData.zipcode ? String(initialData.zipcode).slice(0, 5) : '',
        filing_status: String(initialData.filing_status || initialData.marital_status || '1'),
        additional_withholding: initialData.additional_withholding ? String(initialData.additional_withholding).replace('$', '') : '',
        employer_name: initialData.employer_name || initialData.client_name || prev.employer_name,
        employer_ein: initialData.employer_ein || initialData.fein || prev.employer_ein,
        employer_address: initialData.employer_address || initialData.client_address || prev.employer_address,
        employer_city: initialData.employer_city || initialData.client_city || prev.employer_city,
        employer_state: initialData.employer_state || 'MS',
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
      setFormData(prev => ({ ...prev, [name]: value.slice(0, 5) }));
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
      first_name: 'vishwa',
      middle_initial: '',
      last_name: 'visu',
      ssn: '123-45-6789',
      address: '123 North 1st St, Apt 4A',
      city: 'Jackson',
      state: 'MS',
      zipcode: '39201',
      filing_status: '2',
      spouse_employed: false,
      spouse_claim_amount: '6000',
      dependents: 2,
      age_65: false,
      blind_self: false,
      spouse_65: false,
      spouse_blind: false,
      additional_withholding: '25.00',
      military_spouse_exempt: false,
      confirmation_date: new Date().toISOString().split('T')[0],
      employer_name: 'Tech Innovators Inc.',
      employer_ein: '38-1234567',
      employer_address: '100 Innovation Way',
      employer_city: 'Jackson',
      employer_state: 'MS',
      employer_zipcode: '39201'
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

  // Calculations for Exemption Total
  let personalExemption = 0;
  if (formData.filing_status === '1') personalExemption = 6000;
  else if (formData.filing_status === '3') personalExemption = 9500;
  else if (formData.filing_status === '2') {
    if (formData.spouse_employed) personalExemption = Math.min(12000, Math.max(0, parseInt(formData.spouse_claim_amount, 10) || 0));
    else personalExemption = 12000;
  }

  const depAmount = Math.max(0, parseInt(formData.dependents, 10) || 0) * 1500;

  let ageBlindCount = 0;
  if (formData.age_65) ageBlindCount += 1;
  if (formData.blind_self) ageBlindCount += 1;
  if (formData.filing_status === '2') {
    if (formData.spouse_65) ageBlindCount += 1;
    if (formData.spouse_blind) ageBlindCount += 1;
  }
  const ageBlindAmount = ageBlindCount * 1500;

  const totalExemption = personalExemption + depAmount + ageBlindAmount;

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
      total_exemption: totalExemption,
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
                  Form 89-350
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  Rev. 10/24
                </span>
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Mississippi Dept. of Revenue
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Mississippi Employee's Withholding Exemption Certificate
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Claim personal, dependent, and age/blindness exemptions to determine your Mississippi withholding tax.
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

        {/* 1. PERSONAL INFORMATION */}
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
                placeholder="A"
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
                Permanent Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="e.g. 450 Capitol Street"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                City or Town *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="e.g. Jackson"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                State
              </label>
              <input
                type="text"
                value="MS"
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
                placeholder="39201"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${inputBg}`}
              />
            </div>
          </div>
        </div>

        {/* 2. MARITAL STATUS & PERSONAL EXEMPTIONS (LINES 1-3) */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <HeartHandshake size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              2. Marital Status & Personal Exemption Allowed (Lines 1–3)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              {
                id: '1',
                title: 'Line 1: Single',
                amount: '$6,000',
                desc: 'Single individuals enter $6,000 personal exemption.'
              },
              {
                id: '2',
                title: 'Line 2: Married',
                amount: '$12,000',
                desc: 'Married individuals joint exemption ($12,000 or split if both work).'
              },
              {
                id: '3',
                title: 'Line 3: Head of Family',
                amount: '$9,500',
                desc: 'Single maintaining home for dependent relative ($9,500 exemption).'
              }
            ].map(opt => {
              const isSelected = formData.filing_status === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setFormData(prev => ({ ...prev, filing_status: opt.id }))}
                  style={isSelected ? { borderColor: activeHexColor, backgroundColor: `${activeHexColor}0e` } : {}}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'shadow-sm' 
                      : isDarkMode ? 'bg-[#12141a] border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black tracking-tight">{opt.title}</span>
                    <span className="text-xs font-extrabold text-emerald-500">{opt.amount}</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {opt.desc}
                  </p>
                  <div className="flex items-center justify-end">
                    <div 
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-transparent text-white' : 'border-zinc-400'
                      }`}
                      style={isSelected ? { backgroundColor: activeHexColor } : {}}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Married Sub-Options (Line 2a vs 2b) */}
          {formData.filing_status === '2' && (
            <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in duration-200 ${innerCardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wide block">
                    Spouse Employment Status
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Does your spouse work? If both work, you may divide the $12,000 exemption.
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="spouse_employed"
                    checked={formData.spouse_employed}
                    onChange={handleChange}
                    className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-bold">Spouse is Employed</span>
                </label>
              </div>

              {formData.spouse_employed ? (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                    Line 2(b): Part of $12,000 claimed by you (Multiples of $500, Max $12,000)
                  </label>
                  <div className="relative w-full sm:w-64">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="number"
                      step="500"
                      min="0"
                      max="12000"
                      name="spouse_claim_amount"
                      value={formData.spouse_claim_amount}
                      onChange={handleChange}
                      placeholder="6000"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputBg}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-emerald-500 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Line 2(a) Active: Full $12,000 Joint Exemption claimed by you.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. DEPENDENTS (LINE 4) & AGE/BLINDNESS (LINE 5) */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Calculator size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              3. Additional Exemptions (Lines 4 & 5)
            </h3>
          </div>

          <div className="space-y-6">
            {/* Line 4 Dependents */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${innerCardBg}`}>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wide block mb-0.5">
                  Line 4: Dependents ($1,500 each)
                </span>
                <span className={`text-[11px] leading-relaxed block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Claim $1,500 for each dependent receiving chief support from you (excluding yourself and spouse). Head of Family excludes qualifying dependent.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-zinc-400">Count:</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleChange}
                  className={`w-20 px-3 py-1.5 rounded-xl border text-xs font-black text-center outline-none ${inputBg}`}
                />
                <span className="text-xs font-extrabold text-emerald-500 w-20 text-right">
                  +${depAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Line 5 Age and Blindness */}
            <div className={`p-5 rounded-2xl border ${innerCardBg}`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  Line 5: Age 65+ and Blindness ($1,500 per block checked)
                </span>
                <span className="text-xs font-extrabold text-emerald-500">
                  +${ageBlindAmount.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400 transition-colors">
                  <input
                    type="checkbox"
                    name="age_65"
                    checked={formData.age_65}
                    onChange={handleChange}
                    className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-bold">Taxpayer is Age 65 or Older</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400 transition-colors">
                  <input
                    type="checkbox"
                    name="blind_self"
                    checked={formData.blind_self}
                    onChange={handleChange}
                    className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-bold">Taxpayer is Blind</span>
                </label>

                {formData.filing_status === '2' && (
                  <>
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400 transition-colors">
                      <input
                        type="checkbox"
                        name="spouse_65"
                        checked={formData.spouse_65}
                        onChange={handleChange}
                        className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs font-bold">Spouse is Age 65 or Older</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400 transition-colors">
                      <input
                        type="checkbox"
                        name="spouse_blind"
                        checked={formData.spouse_blind}
                        onChange={handleChange}
                        className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs font-bold">Spouse is Blind</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Total Exemption Banner (Line 6) */}
            <div 
              className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
              style={{ backgroundColor: `${activeHexColor}12`, borderColor: `${activeHexColor}35` }}
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">
                  Line 6: Total Amount of Exemption Claimed
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                  Sum of Lines 1 through 5 (Personal + Dependents + Age/Blindness)
                </span>
              </div>
              <span className="text-2xl font-black tracking-tight" style={{ color: activeHexColor }}>
                ${totalExemption.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 4. LINE 7 ADDITIONAL WITHHOLDING & LINE 8 MSRRA EXEMPT */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <DollarSign size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              4. Additional Withholding & Statutory Exemption (Lines 7 & 8)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${innerCardBg}`}>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${labelColor}`}>
                Line 7: Additional Dollar Amount ($ per pay period)
              </label>
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
                Additional withholding deducted each pay period if agreed with employer.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${innerCardBg}`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Line 8: Military Spouse Exemption
                  </span>
                  <input
                    type="checkbox"
                    name="military_spouse_exempt"
                    checked={formData.military_spouse_exempt}
                    onChange={handleChange}
                    className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                  />
                </div>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Exempt under Military Spouses Residency Relief Act (writes "EXEMPT" on Line 8).
                </p>
              </div>
              {formData.military_spouse_exempt && (
                <span className="text-[11px] font-black text-amber-500 mt-2 block">
                  * Must attach copy of Federal DD-2058 and Military Spouse ID.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 5. DECLARATION & DIGITAL SIGNATURE */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Shield size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              5. Declaration & Employee Digital Signature
            </h3>
          </div>

          <div className={`p-4 rounded-2xl border mb-6 flex items-start gap-3 ${
            isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong>Statutory Certification:</strong> I declare under the penalties imposed for filing false reports that the amount of exemption claimed on this certificate does not exceed the amount to which I am entitled or I am entitled to claim exempt status.
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

        {/* 6. EMPLOYER INFORMATION PREVIEW */}
        <div className={`p-6 sm:p-7 rounded-3xl border ${cardBg}`}>
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Building2 size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              Employer Record (Retained with Payroll Files)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Employer Name</span>
              <span className="text-xs font-bold">{formData.employer_name}</span>
            </div>
            <div className={`p-3 rounded-xl border ${innerCardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Federal EIN</span>
              <span className="text-xs font-bold">{formData.employer_ein}</span>
            </div>
            <div className={`sm:col-span-2 p-3 rounded-xl border ${innerCardBg}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Employer Address</span>
              <span className="text-xs font-bold">{formData.employer_address}, {formData.employer_city}, {formData.employer_state} {formData.employer_zipcode}</span>
            </div>
          </div>
        </div>

        {/* SUBMISSION ACTION BAR */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            style={{ backgroundColor: activeHexColor }}
            className="px-8 py-3.5 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save size={18} />
            <span>Confirm & Generate Form 89-350</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </form>
    </div>
  );
};

export default MississippiTaxForm;