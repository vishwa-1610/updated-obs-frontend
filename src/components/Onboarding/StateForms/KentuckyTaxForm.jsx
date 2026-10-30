import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Building2, MapPin, Check, Flag, HeartHandshake,
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
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Certificate</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Finalizing official Kentucky Form K-4 and formatting withholding certificate...
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
        isDarkMode ? 'text-zinc-300' : 'text-slate-700'
      }`}>
        {label} <span className="text-rose-500">*</span>
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all shadow-sm ${
          isDarkMode 
            ? 'bg-[#181a20] border-zinc-800 text-zinc-100 hover:border-zinc-700' 
            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
        }`}
      >
        <Calendar size={16} style={{ color: activeHexColor }} />
        <span>{value || 'Select date'}</span>
        <ChevronDown size={14} className="ml-auto opacity-50" />
      </div>

      {isOpen && (
        <div className={`absolute z-50 p-4 rounded-2xl shadow-2xl border mt-2 w-72 animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
              const dateVal = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
              const isSelected = value === dateVal;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDateClick(d)}
                  style={isSelected ? { backgroundColor: activeHexColor, color: '#fff' } : {}}
                  className={`p-2 rounded-lg font-medium transition-all ${
                    isSelected ? 'shadow-md font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- US STATES LIST ---
const US_STATES = [
  { code: 'KY', name: 'Kentucky' },
  { code: 'IN', name: 'Indiana (Reciprocal)' },
  { code: 'OH', name: 'Ohio (Reciprocal)' },
  { code: 'IL', name: 'Illinois (Reciprocal)' },
  { code: 'MI', name: 'Michigan (Reciprocal)' },
  { code: 'WV', name: 'West Virginia (Reciprocal)' },
  { code: 'WI', name: 'Wisconsin (Reciprocal)' },
  { code: 'VA', name: 'Virginia (Reciprocal)' },
  { code: 'TN', name: 'Tennessee (Fort Campbell)' },
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'WA', name: 'Washington' }, { code: 'WY', name: 'Wyoming' }
];

// --- RECIPROCAL STATES WITH CONDITIONS ---
const RECIPROCAL_STATES = [
  { code: 'IL', name: 'Illinois', note: 'Standard Reciprocal Agreement' },
  { code: 'IN', name: 'Indiana', note: 'Standard Reciprocal Agreement' },
  { code: 'MI', name: 'Michigan', note: 'Standard Reciprocal Agreement' },
  { code: 'WV', name: 'West Virginia', note: 'Standard Reciprocal Agreement' },
  { code: 'WI', name: 'Wisconsin', note: 'Standard Reciprocal Agreement' },
  { code: 'VA', name: 'Virginia', note: 'Must commute daily to employment in Kentucky' },
  { code: 'OH', name: 'Ohio', note: 'Must not be a 20%+ direct or indirect equity investor in an S corporation' }
];

// --- MAIN KENTUCKY FORM COMPONENT ---
const KentuckyTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // FORM DATA STATE
  const [formData, setFormData] = useState(() => ({
    // Personal Details (Page 0 Header: Name—Last, First, Middle Initial)
    first_name: initialData?.first_name || '',
    middle_name: initialData?.middle_name || initialData?.middle_initial || '',
    last_name: initialData?.last_name || '',
    ssn: initialData?.ssn || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || 'KY',
    zipcode: (initialData?.zipcode || '').toString().slice(0, 10),

    // Additional Withholding per pay period under agreement with employer
    additional_withholding: initialData?.additional_withholding || '',

    // Statutory Exemptions (Boxes 1-4)
    exempt: !!initialData?.exempt,
    exempt_reason: parseInt(initialData?.exempt_reason, 10) || 0, // 0=None, 1=Low Income, 2=Fort Campbell, 3=Military Spouse, 4=Reciprocal
    fort_campbell_state: initialData?.fort_campbell_state || '',
    domicile_state: initialData?.domicile_state || '',
    reciprocal_state: initialData?.reciprocal_state || '',

    // Military Spouse Worksheet Q1-Q6 Checkbox confirmations
    mil_spouse_q1: true,
    mil_spouse_q2: true,
    mil_spouse_q3: true,
    mil_spouse_q4: true,
    mil_spouse_q5: true,
    mil_spouse_q6: true,

    // Employer Information
    employer_name: initialData?.employer_name || 'Tech Innovators Inc.',
    employer_ein: initialData?.employer_ein || '42-1234567',
    employer_address: initialData?.employer_address || '500 Locust Street, Suite 400',
    employer_city: initialData?.employer_city || 'Frankfort',
    employer_state: initialData?.employer_state || 'KY',
    employer_zipcode: initialData?.employer_zipcode || '40601',

    // Declaration & Signature
    confirmation_date: initialData?.confirmation_date || new Date().toISOString().split('T')[0],
    signature_image: initialData?.signature_image || null
  }));

  // SYNC FROM INITIAL DATA IF PROPS UPDATE ASYNCHRONOUSLY
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || '',
        middle_name: initialData.middle_name || initialData.middle_initial || '',
        last_name: initialData.last_name || '',
        ssn: initialData.ssn || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || 'KY',
        zipcode: (initialData.zipcode || '').toString().slice(0, 10),
        additional_withholding: initialData.additional_withholding || '',
        exempt: !!initialData.exempt,
        exempt_reason: parseInt(initialData.exempt_reason, 10) || 0,
        fort_campbell_state: initialData.fort_campbell_state || '',
        domicile_state: initialData.domicile_state || '',
        reciprocal_state: initialData.reciprocal_state || '',
        employer_name: initialData.employer_name || 'Tech Innovators Inc.',
        employer_ein: initialData.employer_ein || '42-1234567',
        employer_address: initialData.employer_address || '500 Locust Street, Suite 400',
        employer_city: initialData.employer_city || 'Frankfort',
        employer_state: initialData.employer_state || 'KY',
        employer_zipcode: initialData.employer_zipcode || '40601',
        confirmation_date: initialData.confirmation_date || new Date().toISOString().split('T')[0],
        signature_image: initialData.signature_image || null
      }));
    }
  }, [initialData]);

  // CANVAS RESIZE HANDLER WITH PRESERVATION
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
        canvas.width = rect.width;
        canvas.height = rect.height;
        if (savedData) sigCanvasRef.current.fromDataURL(savedData);
      }
    };
    const t = setTimeout(resizeCanvas, 200);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExemptReasonSelect = (reasonId) => {
    if (reasonId === 0) {
      setFormData(prev => ({
        ...prev,
        exempt: false,
        exempt_reason: 0,
        fort_campbell_state: '',
        domicile_state: '',
        reciprocal_state: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        exempt: true,
        exempt_reason: reasonId,
        // Set defaults if switching to specific exemption
        fort_campbell_state: reasonId === 2 ? (prev.fort_campbell_state || 'Tennessee') : prev.fort_campbell_state,
        reciprocal_state: reasonId === 4 ? (prev.reciprocal_state || 'IN') : prev.reciprocal_state
      }));
    }
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureData = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: signatureData }));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation checks
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorState({ isOpen: true, title: "Missing Legal Name", message: "Please provide your first and last name as requested on Form K-4." });
      return;
    }

    if (!formData.ssn.trim()) {
      setErrorState({ isOpen: true, title: "Missing SSN", message: "Social Security Number is required for tax identification." });
      return;
    }

    if (!formData.address.trim() || !formData.city.trim() || !formData.zipcode.trim()) {
      setErrorState({ isOpen: true, title: "Incomplete Address", message: "Please provide your full residential mailing address, city, and ZIP code." });
      return;
    }

    if (formData.exempt) {
      if (formData.exempt_reason === 2 && !formData.fort_campbell_state.trim()) {
        setErrorState({ isOpen: true, title: "Missing Fort Campbell State", message: "Please specify your state of legal residence for the Fort Campbell exemption." });
        return;
      }
      if (formData.exempt_reason === 3 && !formData.domicile_state.trim()) {
        setErrorState({ isOpen: true, title: "Missing Domicile State", message: "Please enter the 2-letter state code of your servicemember spouse's state of domicile." });
        return;
      }
      if (formData.exempt_reason === 4 && !formData.reciprocal_state.trim()) {
        setErrorState({ isOpen: true, title: "Select Reciprocal State", message: "Please select the reciprocal state in which you reside (IL, IN, MI, WV, WI, VA, OH)." });
        return;
      }
    }

    let finalSig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      finalSig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!finalSig) {
      setErrorState({ isOpen: true, title: "Digital Signature Required", message: "Please draw your signature in the designated signature box to attest to your Form K-4." });
      return;
    }

    setIsSubmitting(true);
    const submissionPayload = {
      ...formData,
      signature_image: finalSig
    };

    try {
      onSubmit(submissionPayload);
    } catch (err) {
      console.error("Submission failed:", err);
      setIsSubmitting(false);
      setErrorState({ isOpen: true, title: "Submission Error", message: err.message || "An unexpected error occurred while generating your Kentucky Form K-4." });
    }
  };

  // Reusable CSS styles matching theme
  const cardBg = isDarkMode ? 'bg-[#12141a] border-zinc-800' : 'bg-white border-slate-200';
  const subCardBg = isDarkMode ? 'bg-[#181a20] border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/80';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-zinc-400' : 'text-slate-500';
  const inputStyle = `w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
    isDarkMode 
      ? 'bg-[#181a20] border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/50' 
      : 'bg-white border-slate-200 text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
  }`;
  const labelStyle = `block text-xs font-bold uppercase tracking-wider mb-2 ${
    isDarkMode ? 'text-zinc-300' : 'text-slate-700'
  }`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* LOADING OVERLAY */}
      {isSubmitting && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeHexColor} />}

      {/* ERROR MODAL */}
      <ErrorModal 
        isOpen={errorState.isOpen}
        title={errorState.title}
        message={errorState.message}
        onClose={() => setErrorState({ isOpen: false, title: '', message: '' })}
        isDarkMode={isDarkMode}
      />

      {/* 1. FORM HEADER */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6 mb-6 dark:border-zinc-800 border-slate-100">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <FileText size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Form 42A804 (K-4)
                </span>
                <span className="text-xs font-bold text-slate-400">Commonwealth of Kentucky</span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight mt-1 ${textPrimary}`}>
                Kentucky Withholding Exemption Certificate
              </h2>
            </div>
          </div>
          <div className="flex flex-col sm:items-end text-xs">
            <span className="font-bold text-slate-400">Department of Revenue</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={12} /> Flat 4.0% Standard Tax Rate
            </span>
          </div>
        </div>

        {/* STATUTORY TAX FRAMEWORK CALLOUT */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 'bg-blue-50/80 border-blue-200/80 text-blue-900'
        }`}>
          <Info size={20} className="shrink-0 mt-0.5 text-blue-500" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold mb-0.5">Kentucky Individual Income Tax Structure (KRS 141.081):</p>
            <p className="opacity-90">
              All Kentucky wage earners are taxed at a <strong>flat 4% tax rate</strong> with a standard deduction allowance of <strong>$3,160</strong>. Kentucky does not use bracket deductions. Use this form to specify additional withholding or to certify statutory exemptions.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 2. EMPLOYEE PERSONAL DETAILS (PAGE 0 HEADER) */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <User size={20} />
            </div>
            <div>
              <h3 className={`text-base font-extrabold ${textPrimary}`}>Employee Identification</h3>
              <p className={`text-xs ${textSecondary}`}>Enter your legal name and residential address as required on Form K-4</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            {/* Last Name */}
            <div className="sm:col-span-5">
              <label className={labelStyle}>Last Name <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange} 
                placeholder="e.g. Vance"
                className={inputStyle} 
                required 
              />
            </div>

            {/* First Name */}
            <div className="sm:col-span-5">
              <label className={labelStyle}>First Name <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
                placeholder="e.g. Marcus"
                className={inputStyle} 
                required 
              />
            </div>

            {/* Middle Initial */}
            <div className="sm:col-span-2">
              <label className={labelStyle}>Middle Initial</label>
              <input 
                type="text" 
                name="middle_name" 
                value={formData.middle_name} 
                onChange={handleChange} 
                maxLength={2}
                placeholder="e.g. D"
                className={`${inputStyle} text-center uppercase`} 
              />
            </div>

            {/* Social Security Number */}
            <div className="sm:col-span-6">
              <label className={labelStyle}>Social Security Number <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  name="ssn" 
                  value={formData.ssn} 
                  onChange={handleChange} 
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  className={`${inputStyle} font-mono`} 
                  required 
                />
                <Shield size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Mailing Address */}
            <div className="sm:col-span-6">
              <label className={labelStyle}>Mailing Address (Street & Apt/Suite) <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="e.g. 1044 West Main Street, Suite 300"
                className={inputStyle} 
                required 
              />
            </div>

            {/* City */}
            <div className="sm:col-span-5">
              <label className={labelStyle}>City, Town or Post Office <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="e.g. Frankfort"
                className={inputStyle} 
                required 
              />
            </div>

            {/* State */}
            <div className="sm:col-span-4">
              <label className={labelStyle}>State <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                  className={`${inputStyle} appearance-none pr-8 cursor-pointer font-bold`}
                >
                  {US_STATES.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* ZIP Code */}
            <div className="sm:col-span-3">
              <label className={labelStyle}>ZIP Code <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="zipcode" 
                value={formData.zipcode} 
                onChange={handleChange} 
                placeholder="40601"
                maxLength={10}
                className={inputStyle} 
                required 
              />
            </div>
          </div>
        </div>

        {/* 3. ADDITIONAL WITHHOLDING (PAGE 0 LINE) */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className={`text-base font-extrabold ${textPrimary}`}>Additional Withholding Agreement</h3>
              <p className={`text-xs ${textSecondary}`}>Agreement with employer for additional tax deducted per pay period</p>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${subCardBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5`}>
            <div className="max-w-md">
              <p className={`text-xs font-bold ${textPrimary} mb-1`}>
                Additional Withholding per Pay Period ($)
              </p>
              <p className={`text-xs leading-relaxed ${textSecondary}`}>
                Enter any additional dollar amount you wish to have withheld from your check under voluntary agreement with your employer. Leave at 0 if no extra withholding is requested.
              </p>
            </div>
            <div className="relative w-full sm:w-48 shrink-0">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                name="additional_withholding" 
                value={formData.additional_withholding} 
                onChange={handleChange} 
                placeholder="0.00"
                className={`${inputStyle} pl-8 text-right font-bold text-base`}
              />
            </div>
          </div>
        </div>

        {/* 4. STATUTORY EXEMPTIONS SECTION (PAGE 0 BOXES 1-4 & PAGE 1 WORKSHEETS) */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Flag size={20} />
              </div>
              <div>
                <h3 className={`text-base font-extrabold ${textPrimary}`}>Exemption Status Certificate</h3>
                <p className={`text-xs ${textSecondary}`}>Select if you meet one of the four statutory Kentucky withholding exemptions</p>
              </div>
            </div>
            {formData.exempt && (
              <button 
                type="button" 
                onClick={() => handleExemptReasonSelect(0)}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline"
              >
                <Eraser size={13} />
                <span>Clear Exemption</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            
            {/* OPTION 0: STANDARD (NOT EXEMPT) */}
            <div 
              onClick={() => handleExemptReasonSelect(0)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !formData.exempt 
                  ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-500/20' 
                  : `${subCardBg} hover:border-slate-300 dark:hover:border-zinc-700`
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                !formData.exempt ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
              }`}>
                {!formData.exempt && <Check size={12} strokeWidth={3} />}
              </div>
              <div>
                <span className={`block text-sm font-extrabold ${textPrimary}`}>
                  Standard Wage Earner (Not Exempt)
                </span>
                <span className={`text-xs block mt-0.5 leading-relaxed ${textSecondary}`}>
                  I do not claim any exemption from Kentucky withholding. My employer will withhold tax at the standard flat 4% rate.
                </span>
              </div>
            </div>

            {/* OPTION 1: LOW INCOME EXEMPTION */}
            <div 
              onClick={() => handleExemptReasonSelect(1)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                formData.exempt && formData.exempt_reason === 1 
                  ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-500/20' 
                  : `${subCardBg} hover:border-slate-300 dark:hover:border-zinc-700`
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                formData.exempt && formData.exempt_reason === 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
              }`}>
                {formData.exempt && formData.exempt_reason === 1 && <Check size={12} strokeWidth={3} />}
              </div>
              <div className="w-full">
                <span className={`block text-sm font-extrabold ${textPrimary}`}>
                  1. Kentucky Income Tax Liability is Not Expected This Year
                </span>
                <span className={`text-xs block mt-0.5 leading-relaxed ${textSecondary}`}>
                  You are exempt if for 2023 you had a right to a refund of all KY income tax withheld AND for 2024 expect a full refund based on family income thresholds.
                </span>

                {formData.exempt && formData.exempt_reason === 1 && (
                  <div className="mt-4 pt-4 border-t dark:border-zinc-800 border-slate-200">
                    <p className="text-xs font-bold text-slate-500 mb-2">2024 Kentucky Income Tax Filing Threshold Amounts:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                        <span className="block text-[10px] text-slate-400">Single</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">$14,580</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                        <span className="block text-[10px] text-slate-400">Family of 2</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">$19,720</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                        <span className="block text-[10px] text-slate-400">Family of 3</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">$24,860</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                        <span className="block text-[10px] text-slate-400">Family of 4+</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">$30,000</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OPTION 2: FORT CAMPBELL EXEMPTION */}
            <div 
              onClick={() => handleExemptReasonSelect(2)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                formData.exempt && formData.exempt_reason === 2 
                  ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-500/20' 
                  : `${subCardBg} hover:border-slate-300 dark:hover:border-zinc-700`
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                formData.exempt && formData.exempt_reason === 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
              }`}>
                {formData.exempt && formData.exempt_reason === 2 && <Check size={12} strokeWidth={3} />}
              </div>
              <div className="w-full">
                <span className={`block text-sm font-extrabold ${textPrimary}`}>
                  2. Fort Campbell Exemption Certificate (Public Law 105–261)
                </span>
                <span className={`text-xs block mt-0.5 leading-relaxed ${textSecondary}`}>
                  Check box 2 if you certify that you are not a resident of Kentucky and only earn wages as an employee at Fort Campbell, Kentucky.
                </span>

                {formData.exempt && formData.exempt_reason === 2 && (
                  <div className="mt-4 pt-4 border-t dark:border-zinc-800 border-slate-200">
                    <label className={labelStyle}>State of Legal Residence / Domicile <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      name="fort_campbell_state" 
                      value={formData.fort_campbell_state} 
                      onChange={handleChange} 
                      placeholder="e.g. Tennessee"
                      className={`${inputStyle} max-w-sm`}
                      required
                    />
                    <p className={`text-[11px] mt-1.5 ${textSecondary}`}>
                      This state will be recorded on the official line: <em>"I am a resident of ________ State"</em> on Form K-4.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* OPTION 3: NONRESIDENT MILITARY SPOUSE EXEMPTION */}
            <div 
              onClick={() => handleExemptReasonSelect(3)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                formData.exempt && formData.exempt_reason === 3 
                  ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-500/20' 
                  : `${subCardBg} hover:border-slate-300 dark:hover:border-zinc-700`
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                formData.exempt && formData.exempt_reason === 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
              }`}>
                {formData.exempt && formData.exempt_reason === 3 && <Check size={12} strokeWidth={3} />}
              </div>
              <div className="w-full">
                <span className={`block text-sm font-extrabold ${textPrimary}`}>
                  3. Nonresident Military Spouse Exemption (SCRA / MSRRA)
                </span>
                <span className={`text-xs block mt-0.5 leading-relaxed ${textSecondary}`}>
                  Civilian spouse of an active duty military servicemember stationed in Kentucky claiming exemption under the Servicemembers Civil Relief Act.
                </span>

                {formData.exempt && formData.exempt_reason === 3 && (
                  <div className="mt-4 pt-4 border-t dark:border-zinc-800 border-slate-200 space-y-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                      <p className="text-xs font-bold text-slate-700 dark:text-zinc-200 mb-3 flex items-center gap-2">
                        <HeartHandshake size={16} className="text-blue-500" />
                        Page 1 Military Spouse Qualification Worksheet:
                      </p>
                      
                      <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>1. My spouse is an active duty military servicemember.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>2. I am NOT a military servicemember.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>3. My spouse has current military orders assigning them to a location in Kentucky.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>4. I and my military servicemember spouse live at the same address.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>5. My spouse's state of domicile is other than KY and I elect to use that state.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>6. I am present in Kentucky solely to be with my military servicemember spouse.</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Servicemember's 2-Letter State Code of Domicile <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        name="domicile_state" 
                        value={formData.domicile_state} 
                        onChange={handleChange} 
                        placeholder="e.g. TX"
                        maxLength={2}
                        className={`${inputStyle} max-w-xs uppercase font-bold`}
                        required
                      />
                      <p className={`text-[11px] mt-1.5 ${textSecondary}`}>
                        Enter the 2-letter state code of your servicemember spouse's legal domicile (e.g. TX, TN, FL).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OPTION 4: RECIPROCAL STATE EXEMPTION */}
            <div 
              onClick={() => handleExemptReasonSelect(4)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                formData.exempt && formData.exempt_reason === 4 
                  ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-500/10 ring-2 ring-blue-500/20' 
                  : `${subCardBg} hover:border-slate-300 dark:hover:border-zinc-700`
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                formData.exempt && formData.exempt_reason === 4 ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
              }`}>
                {formData.exempt && formData.exempt_reason === 4 && <Check size={12} strokeWidth={3} />}
              </div>
              <div className="w-full">
                <span className={`block text-sm font-extrabold ${textPrimary}`}>
                  4. Reciprocal State Resident (Illinois, Indiana, Michigan, West Virginia, Wisconsin, Virginia, Ohio)
                </span>
                <span className={`text-xs block mt-0.5 leading-relaxed ${textSecondary}`}>
                  You work in Kentucky but reside in a reciprocal agreement state. Wages earned in Kentucky are exempt from Kentucky withholding and taxed in your home state.
                </span>

                {formData.exempt && formData.exempt_reason === 4 && (
                  <div className="mt-4 pt-4 border-t dark:border-zinc-800 border-slate-200">
                    <label className={labelStyle}>Select Reciprocal State of Residence <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {RECIPROCAL_STATES.map(st => {
                        const isSelected = formData.reciprocal_state.toUpperCase() === st.code;
                        return (
                          <div 
                            key={st.code}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, reciprocal_state: st.code, state: st.code }));
                            }}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600 font-bold' 
                                : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300 bg-white dark:bg-zinc-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-sm">{st.name} ({st.code})</span>
                              {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block leading-tight">
                              {st.note}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 5. EMPLOYER INFORMATION CONFIRMATION */}
        {formData.employer_name && (
          <div className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className={`text-sm font-extrabold ${textPrimary}`}>Employer Details</h3>
                <p className={`text-xs ${textSecondary}`}>Official record on file with Department of Revenue</p>
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${subCardBg} grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs`}>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employer Name</span>
                <span className="font-bold">{formData.employer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employer EIN</span>
                <span className="font-mono font-bold">{formData.employer_ein}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                <span>{formData.employer_city}, {formData.employer_state} {formData.employer_zipcode}</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. DECLARATION & SIGNATURE */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PenTool size={20} />
            </div>
            <div>
              <h3 className={`text-base font-extrabold ${textPrimary}`}>Perjury Declaration & Signature</h3>
              <p className={`text-xs ${textSecondary}`}>Sign digitally to certify your Kentucky Withholding Exemption Certificate</p>
            </div>
          </div>

          {/* PERJURY ATTESTATION */}
          <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed italic ${
            isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            "Under penalties of perjury, I declare that I have examined this certificate and, to the best of my knowledge and belief, it is true, correct, and complete."
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            
            {/* Signing Date */}
            <div className="sm:col-span-5">
              <CustomDatePicker 
                label="Date of Signing" 
                name="confirmation_date" 
                value={formData.confirmation_date} 
                onChange={handleChange} 
                isDarkMode={isDarkMode} 
                activeHexColor={activeHexColor} 
              />
              <p className={`text-[11px] mt-2 leading-relaxed ${textSecondary}`}>
                Official confirmation date stamped on the certificate and archived for employer tax audit compliance.
              </p>
            </div>

            {/* Signature Canvas */}
            <div className="sm:col-span-7">
              <div className="flex items-center justify-between mb-2">
                <label className={labelStyle}>Digital Signature <span className="text-rose-500">*</span></label>
                <button 
                  type="button" 
                  onClick={clearSignature} 
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Eraser size={13} />
                  <span>Clear Signature</span>
                </button>
              </div>

              <div 
                ref={containerRef} 
                className={`border-2 border-dashed rounded-2xl overflow-hidden relative cursor-crosshair h-40 shadow-inner transition-colors ${
                  isDarkMode 
                    ? 'bg-[#181a20] border-zinc-700 hover:border-zinc-500' 
                    : 'bg-white border-slate-300 hover:border-blue-400'
                }`}
              >
                <SignatureCanvas 
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? '#60a5fa' : '#001482'}
                  velocityFilterWeight={0.7}
                  canvasProps={{ className: 'w-full h-full' }}
                  onEnd={handleSignatureEnd}
                />
                
                {!formData.signature_image && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 dark:text-zinc-600 gap-2">
                    <PenTool size={24} className="opacity-40 animate-pulse" />
                    <span className="text-xs font-semibold">Draw your signature here using mouse, stylus, or touch</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 7. SUBMIT BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12 border-t dark:border-zinc-800 border-slate-200">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Shield size={14} className="text-emerald-500" />
            <span>Official Form K-4 (42A804) Withholding Certificate</span>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ backgroundColor: activeHexColor }}
            className="w-full sm:w-auto px-8 py-4 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/20 hover:opacity-95 transform active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating Form K-4 PDF...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Confirm & Generate Kentucky K-4</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default KentuckyTaxForm;