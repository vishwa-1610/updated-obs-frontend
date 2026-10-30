import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Sparkles, Building2, MapPin, Check, HeartHandshake,
  HelpCircle, ArrowRight, CreditCard, Flag, Award, RefreshCw, ChevronUp
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form W-4N</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing Nebraska Employee Withholding Allowance Certificate...
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
          <div className="flex justify-between items-center mb-2.5 px-1">
            <button 
              type="button" 
              onClick={() => changeMonth(-1)} 
              className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-extrabold tracking-tight">
              {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <button 
              type="button" 
              onClick={() => changeMonth(1)} 
              className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <span key={d} className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateVal = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = value === dateVal;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`h-7 w-7 text-xs rounded-lg flex items-center justify-center font-medium transition-all ${
                    isSelected
                      ? 'text-white font-bold shadow-sm'
                      : isDarkMode
                        ? 'hover:bg-zinc-800 text-zinc-300'
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

// --- MAIN NEBRASKA FORM COMPONENT ---
const NebraskaTaxForm = ({ initialData, onSubmit, isSubmitting = false }) => {
  const { theme, isDarkMode } = useTheme();
  const activeHexColor = THEME_COLORS[theme]?.hex || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
  const [worksheetOpen, setWorksheetOpen] = useState(true);

  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'NE',
    zipcode: '',

    // Filing Status: '1'=Single / MFS / HOH / Single-Rate, '2'=Married Joint / Surviving Spouse, '3'=Married at Single Rate
    filing_status: '1',

    // Personal Allowances Worksheet (Lines 4a - 4e)
    line1a: true,  // 4a: Yourself
    line1b: false, // 4b: Single with 1 job / Married with non-working spouse
    line1c: false, // 4c: Spouse
    line1d: 0,     // 4d: Dependents count
    line1e: false, // 4e: Head of Household

    // Certificate Lines
    line1: '1',                  // Line 1: Total Allowances claimed
    additional_withholding: '', // Line 2: Extra amount per check ($)
    exempt: false,              // Line 3: Claim exemption from withholding

    // Signature & Date
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // Calculate live total allowances from worksheet
  const calculatedAllowances = 
    (formData.line1a ? 1 : 0) +
    (formData.line1b ? 1 : 0) +
    (formData.line1c ? 1 : 0) +
    (parseInt(formData.line1d, 10) || 0) +
    (formData.line1e ? 1 : 0);

  // Auto-sync Line 1 with worksheet calculation unless user is claiming exempt
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      line1: prev.exempt ? '0' : String(calculatedAllowances)
    }));
  }, [calculatedAllowances, formData.exempt]);

  // Pre-fill initial data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || '',
        middle_initial: initialData.middle_initial || initialData.initial || '',
        last_name: initialData.last_name || '',
        ssn: initialData.ssn || '',
        address: initialData.address || '',
        city: initialData.city || '',
        zipcode: initialData.zipcode || '',
        state: 'NE'
      }));
    }
  }, [initialData]);

  // Canvas auto-resize handling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && sigCanvasRef.current) {
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
    const t = setTimeout(handleResize, 200);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
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

  // 1-Click Autofill Benchmark Data for Instant Demo / Testing
  const handleAutofillSample = () => {
    setFormData(prev => ({
      ...prev,
      first_name: 'Jonathan',
      middle_initial: 'E',
      last_name: 'Carmack-Miller',
      ssn: '123-45-6789',
      address: '1234 Pioneer Boulevard, Suite 500',
      city: 'Lincoln',
      state: 'NE',
      zipcode: '68508',
      filing_status: '2', // Married Joint
      line1a: true,
      line1b: true,
      line1c: true,
      line1d: 1,
      line1e: false,
      additional_withholding: '50.00',
      exempt: false,
      confirmation_date: new Date().toISOString().split('T')[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required fields validation
    const required = [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'ssn', label: 'Social Security Number' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'zipcode', label: 'ZIP Code' },
      { key: 'confirmation_date', label: 'Date of Signing' }
    ];

    for (const field of required) {
      if (!formData[field.key] || !String(formData[field.key]).trim()) {
        setErrorModal({
          isOpen: true,
          title: 'Missing Required Field',
          message: `Please provide your ${field.label} before submitting.`
        });
        return;
      }
    }

    if (!formData.signature_image && sigCanvasRef.current?.isEmpty()) {
      setErrorModal({
        isOpen: true,
        title: 'Signature Required',
        message: 'Please provide your digital signature to authorize Nebraska Form W-4N.'
      });
      return;
    }

    let finalSig = formData.signature_image;
    if (!finalSig && sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      finalSig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    const payload = {
      ...formData,
      signature_image: finalSig,
      total_allowances: calculatedAllowances
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  // Styling helper classes
  const cardBg = isDarkMode 
    ? 'bg-[#12141a] border-zinc-800 text-zinc-100 shadow-xl' 
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const innerCardBg = isDarkMode
    ? 'bg-[#181a20] border-zinc-800/80 text-zinc-100'
    : 'bg-slate-50 border-slate-200 text-slate-800';
  const labelText = isDarkMode ? 'text-zinc-400' : 'text-slate-600';
  const inputStyle = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all outline-none ${
    isDarkMode 
      ? 'bg-[#181a20] border-zinc-700/80 hover:border-zinc-600 focus:border-zinc-500 text-zinc-100' 
      : 'bg-white border-slate-200 hover:border-slate-300 focus:border-slate-400 text-slate-800 shadow-sm'
  }`;

  const filingOptions = [
    {
      code: '1',
      title: 'Single / Head of Household / MFS',
      desc: 'Single, Married Filing Separately, Head of Household, or Married electing higher single rate',
      badge: 'Single Rate'
    },
    {
      code: '2',
      title: 'Married Filing Jointly / Surviving Spouse',
      desc: 'Married couple filing combined joint return or qualifying widow(er)',
      badge: 'Joint Rate'
    },
    {
      code: '3',
      title: 'Married, but withhold at higher Single Rate',
      desc: 'Recommended if both spouses work or you hold multiple concurrent positions to avoid underwithholding',
      badge: 'Single Rate'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {isSubmitting && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeHexColor} />}
      <ErrorModal 
        isOpen={errorModal.isOpen} 
        title={errorModal.title} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} 
        isDarkMode={isDarkMode} 
      />

      {/* HEADER HERO */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}
                >
                  Nebraska Form W-4N
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">Rev. 1-2022</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Nebraska Employee Withholding Allowance Certificate
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${labelText}`}>
                Complete Form W-4N so your employer can withhold the correct Nebraska state income tax from your pay.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutofillSample}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-transform active:scale-95 shadow-sm hover:opacity-90"
            style={{ 
              backgroundColor: isDarkMode ? '#1e2029' : '#f1f5f9',
              borderColor: isDarkMode ? '#2d3139' : '#e2e8f0',
              color: activeHexColor
            }}
          >
            <Sparkles size={14} />
            Autofill Sample
          </button>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <div className={`p-3 rounded-2xl border ${innerCardBg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">Total Allowances (Line 1)</span>
            <span className="text-lg font-black" style={{ color: activeHexColor }}>
              {formData.exempt ? 'Exempt' : calculatedAllowances}
            </span>
          </div>
          <div className={`p-3 rounded-2xl border ${innerCardBg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">Extra Withholding (Line 2)</span>
            <span className="text-lg font-black text-emerald-500">
              {formData.additional_withholding ? `$${parseFloat(formData.additional_withholding || 0).toFixed(2)}` : '$0.00'}
            </span>
          </div>
          <div className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border ${innerCardBg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">Tax Status (Line 3)</span>
            <span className={`text-lg font-black ${formData.exempt ? 'text-amber-500' : 'text-blue-500'}`}>
              {formData.exempt ? 'Exempt Claimed' : (formData.filing_status === '2' ? 'Married Joint' : 'Single / Standard')}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <User size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">1. Employee Identification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>First Name *</label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="First Name" 
                required 
              />
            </div>
            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>M.I.</label>
              <input 
                type="text" 
                name="middle_initial" 
                value={formData.middle_initial} 
                onChange={handleChange} 
                className={inputStyle} 
                maxLength={1} 
                placeholder="M" 
              />
            </div>
            <div className="sm:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>Last Name *</label>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="Last Name" 
                required 
              />
            </div>

            <div className="sm:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>Social Security Number *</label>
              <input 
                type="text" 
                name="ssn" 
                value={formData.ssn} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="XXX-XX-XXXX" 
                required 
              />
            </div>
            <div className="sm:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>Mailing Address *</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="Street address or P.O. Box" 
                required 
              />
            </div>

            <div className="sm:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>City *</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="City" 
                required 
              />
            </div>
            <div className="sm:col-span-3">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>State</label>
              <input 
                type="text" 
                value="NE" 
                readOnly 
                className={`${inputStyle} opacity-70 cursor-not-allowed font-bold text-center`} 
              />
            </div>
            <div className="sm:col-span-4">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>ZIP Code *</label>
              <input 
                type="text" 
                name="zipcode" 
                value={formData.zipcode} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="68508" 
                required 
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: FILING STATUS */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <Shield size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">2. Marital Withholding Status</h3>
          </div>

          <div className="space-y-3">
            {filingOptions.map(option => {
              const isSelected = formData.filing_status === option.code;
              return (
                <div 
                  key={option.code}
                  onClick={() => setFormData(prev => ({ ...prev, filing_status: option.code }))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected 
                      ? 'border-transparent shadow-md' 
                      : isDarkMode 
                        ? 'border-zinc-800/80 hover:border-zinc-700 bg-[#161820]' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  style={isSelected ? { 
                    backgroundColor: `${activeHexColor}10`, 
                    borderColor: activeHexColor 
                  } : {}}
                >
                  <div 
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected ? 'border-transparent' : isDarkMode ? 'border-zinc-600' : 'border-slate-300'
                    }`}
                    style={isSelected ? { backgroundColor: activeHexColor } : {}}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold tracking-tight">{option.title}</span>
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}
                      >
                        {option.badge}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${labelText}`}>
                      {option.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: PERSONAL ALLOWANCES WORKSHEET */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <Calculator size={18} style={{ color: activeHexColor }} />
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider">3. Personal Allowances Worksheet</h3>
                <p className={`text-[11px] ${labelText}`}>Lines 4a - 4e automatically calculate your Total Allowances for Line 1</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWorksheetOpen(!worksheetOpen)}
              className="p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors text-zinc-400"
            >
              {worksheetOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {worksheetOpen && (
            <div className="space-y-4">
              {/* 4a: Yourself */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                formData.line1a 
                  ? `${innerCardBg} border-transparent` 
                  : isDarkMode ? 'border-zinc-800/80' : 'border-slate-200'
              }`}>
                <input 
                  type="checkbox" 
                  name="line1a" 
                  checked={formData.line1a} 
                  onChange={handleChange} 
                  className="w-4 h-4 rounded shrink-0 mt-0.5" 
                  style={{ accentColor: activeHexColor }} 
                />
                <div className="flex-1">
                  <span className="text-xs font-bold block">4a. Enter "1" for yourself</span>
                  <span className={`text-[11px] block mt-0.5 ${labelText}`}>
                    Claim if no one else can claim you as a dependent on their tax return.
                  </span>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                  {formData.line1a ? '1' : '0'}
                </span>
              </label>

              {/* 4b: Single with 1 job */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                formData.line1b 
                  ? `${innerCardBg} border-transparent` 
                  : isDarkMode ? 'border-zinc-800/80' : 'border-slate-200'
              }`}>
                <input 
                  type="checkbox" 
                  name="line1b" 
                  checked={formData.line1b} 
                  onChange={handleChange} 
                  className="w-4 h-4 rounded shrink-0 mt-0.5" 
                  style={{ accentColor: activeHexColor }} 
                />
                <div className="flex-1">
                  <span className="text-xs font-bold block">4b. Enter "1" if single with 1 job, or married with non-working spouse</span>
                  <span className={`text-[11px] block mt-0.5 ${labelText}`}>
                    Or if wages from second job / spouse's wages are $1,500 or less.
                  </span>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                  {formData.line1b ? '1' : '0'}
                </span>
              </label>

              {/* 4c: Spouse */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                formData.line1c 
                  ? `${innerCardBg} border-transparent` 
                  : isDarkMode ? 'border-zinc-800/80' : 'border-slate-200'
              }`}>
                <input 
                  type="checkbox" 
                  name="line1c" 
                  checked={formData.line1c} 
                  onChange={handleChange} 
                  className="w-4 h-4 rounded shrink-0 mt-0.5" 
                  style={{ accentColor: activeHexColor }} 
                />
                <div className="flex-1">
                  <span className="text-xs font-bold block">4c. Enter "1" for your spouse</span>
                  <span className={`text-[11px] block mt-0.5 ${labelText}`}>
                    You may elect "0" if married and both spouses work to avoid underwithholding.
                  </span>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                  {formData.line1c ? '1' : '0'}
                </span>
              </label>

              {/* 4d: Dependents */}
              <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                parseInt(formData.line1d, 10) > 0 
                  ? `${innerCardBg} border-transparent` 
                  : isDarkMode ? 'border-zinc-800/80' : 'border-slate-200'
              }`}>
                <div className="flex-1 pr-4">
                  <span className="text-xs font-bold block">4d. Number of Nebraska Personal Exemptions (Dependents)</span>
                  <span className={`text-[11px] block mt-0.5 ${labelText}`}>
                    Children and qualifying dependents you will claim on your Nebraska return.
                  </span>
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    name="line1d" 
                    min="0" 
                    max="20"
                    value={formData.line1d} 
                    onChange={handleChange} 
                    className={`${inputStyle} text-center font-bold`} 
                  />
                </div>
              </div>

              {/* 4e: Head of Household */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                formData.line1e 
                  ? `${innerCardBg} border-transparent` 
                  : isDarkMode ? 'border-zinc-800/80' : 'border-slate-200'
              }`}>
                <input 
                  type="checkbox" 
                  name="line1e" 
                  checked={formData.line1e} 
                  onChange={handleChange} 
                  className="w-4 h-4 rounded shrink-0 mt-0.5" 
                  style={{ accentColor: activeHexColor }} 
                />
                <div className="flex-1">
                  <span className="text-xs font-bold block">4e. Enter "1" if you will file as Head of Household</span>
                  <span className={`text-[11px] block mt-0.5 ${labelText}`}>
                    Unmarried or legally separated individuals paying more than half cost of maintaining home.
                  </span>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                  {formData.line1e ? '1' : '0'}
                </span>
              </label>

              {/* 4f: Total */}
              <div className="p-4 rounded-2xl flex items-center justify-between border"
                style={{ 
                  backgroundColor: `${activeHexColor}12`,
                  borderColor: `${activeHexColor}40`
                }}
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block" style={{ color: activeHexColor }}>
                    Line 4f: Total Allowances
                  </span>
                  <span className={`text-[11px] ${labelText}`}>Sum of lines 4a through 4e, automatically applied to Line 1 above</span>
                </div>
                <span className="text-2xl font-black" style={{ color: activeHexColor }}>
                  {calculatedAllowances}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: ADDITIONAL WITHHOLDING & EXEMPTION */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <DollarSign size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">4. Certificate Lines (Line 2 & Line 3)</h3>
          </div>

          <div className="space-y-6">
            {/* Line 2: Additional Withholding */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>
                Line 2: Additional amount, if any, you want withheld from each paycheck ($)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  name="additional_withholding" 
                  value={formData.additional_withholding} 
                  onChange={handleChange} 
                  className={`${inputStyle} pl-8`} 
                  placeholder="0.00" 
                />
              </div>
              <p className={`text-[11px] mt-1.5 ${labelText}`}>
                Optional voluntary additional withholding per pay period.
              </p>
            </div>

            {/* Line 3: Exemption Claim */}
            <div className={`p-4 rounded-2xl border transition-all ${
              formData.exempt 
                ? 'border-amber-500/50 bg-amber-500/10' 
                : isDarkMode ? 'border-zinc-800 bg-[#161820]' : 'border-slate-200 bg-slate-50'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="exempt" 
                  checked={formData.exempt} 
                  onChange={handleChange} 
                  className="w-5 h-5 rounded shrink-0 mt-0.5 accent-amber-500" 
                />
                <div>
                  <span className="text-xs font-extrabold text-amber-500 block">
                    Line 3: I claim Exemption from Nebraska withholding
                  </span>
                  <span className={`text-[11px] leading-relaxed block mt-1 ${labelText}`}>
                    Under Nebraska law, you qualify only if: (1) Last year you had a right to a refund of all Nebraska income tax withheld because you had no tax liability; AND (2) This year you expect a full refund because you expect no tax liability.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 5: DECLARATION & SIGNATURE */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <PenTool size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">5. Employee Declaration & Signature</h3>
          </div>

          <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed ${innerCardBg}`}>
            <span className="font-bold block mb-1">Under penalties of perjury:</span>
            I declare that I have examined this certificate and to the best of my knowledge and belief, it is true, correct, and complete.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-4">
              <CustomDatePicker 
                label="Date of Signing *" 
                name="confirmation_date" 
                value={formData.confirmation_date} 
                onChange={handleChange} 
                isDarkMode={isDarkMode} 
                activeHexColor={activeHexColor} 
              />
            </div>

            <div className="sm:col-span-8">
              <div className="flex justify-between items-center mb-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${labelText}`}>
                  Digital Signature *
                </label>
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Eraser size={14} />
                  Clear Signature
                </button>
              </div>

              <div 
                ref={containerRef}
                className={`relative h-44 rounded-2xl border-2 border-dashed overflow-hidden cursor-crosshair transition-all ${
                  isDarkMode 
                    ? 'border-zinc-700 bg-[#161820]' 
                    : 'border-slate-300 bg-white shadow-inner'
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                    <PenTool size={24} style={{ color: activeHexColor }} />
                    <span className="text-[11px] font-bold mt-2">Sign in the box above</span>
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
            disabled={isSubmitting}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: activeHexColor }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Form W-4N...
              </>
            ) : (
              <>
                <Save size={16} />
                Save & Generate Form W-4N
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default NebraskaTaxForm;