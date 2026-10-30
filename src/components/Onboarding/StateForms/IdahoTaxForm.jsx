import React, { useState, useEffect, useRef, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronLeft, ChevronRight, ChevronDown, 
  Eraser, Save, PenTool, FileText, Calculator, Building2, CheckCircle2, 
  AlertCircle, Sparkles, HelpCircle, Briefcase, Info, X
} from 'lucide-react';
import StunningSelect from '../../common/StunningSelect';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

// --- CUSTOM DATE PICKER (THEMED) ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const dropdownRef = useRef(null);
  const yearScrollRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); 
        setView('calendar');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { 
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setCurrentDate(d);
    }
  }, [value]);

  useEffect(() => {
    if (view === 'year' && yearScrollRef.current) {
      const selectedYearEl = yearScrollRef.current.querySelector('.selected-year');
      if (selectedYearEl) selectedYearEl.scrollIntoView({ block: 'center' });
    }
  }, [view]);

  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 81 }, (_, i) => 1950 + i);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
          {label}
        </label>
      )}
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
        <input 
          readOnly 
          type="text" 
          value={value || ''} 
          placeholder={placeholder || "YYYY-MM-DD"} 
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium cursor-pointer outline-none transition-all ${
            isDarkMode 
              ? 'bg-zinc-900/60 border-zinc-700/80 text-zinc-100 hover:border-zinc-600' 
              : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300'
          }`} 
        />
        <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
      </div>
      {isOpen && (
        <div className={`absolute z-50 mb-2 p-4 rounded-2xl shadow-2xl border w-72 bottom-full left-0 backdrop-blur-xl ${
          isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center mb-4">
            {view === 'calendar' && (
              <button type="button" onClick={() => changeMonth(-1)} className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                <ChevronLeft size={16}/>
              </button>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className={`font-bold px-2 py-0.5 rounded text-xs ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>
                {monthNames[currentDate.getMonth()]}
              </button>
              <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className={`font-bold px-2 py-0.5 rounded text-xs ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>
                {currentDate.getFullYear()}
              </button>
            </div>
            {view === 'calendar' && (
              <button type="button" onClick={() => changeMonth(1)} className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                <ChevronRight size={16}/>
              </button>
            )}
          </div>
          {view === 'calendar' && (
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <span key={d} className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{d}</span>
              ))}
              {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={i}/>)}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate() }, (_, i) => i+1).map(d => (
                <button 
                  key={d} 
                  type="button" 
                  onClick={() => handleDateClick(d)} 
                  className={`h-7 w-7 text-xs rounded-full font-medium transition-all ${
                    isDarkMode ? 'hover:bg-blue-600/30 text-zinc-200' : 'hover:bg-blue-100 text-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
          {view === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map((m, i) => (
                <button key={m} onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), i, 1)); setView('calendar'); }} className={`p-2 text-xs rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>
                  {m}
                </button>
              ))}
            </div>
          )}
          {view === 'year' && (
            <div ref={yearScrollRef} className="h-44 overflow-y-auto grid grid-cols-3 gap-2">
              {years.map(y => (
                <button key={y} onClick={() => { setCurrentDate(new Date(y, currentDate.getMonth(), 1)); setView('calendar'); }} className={`p-2 text-xs rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- IDAHO STATUS OPTIONS ---
const STATUS_LETTER_OPTIONS = [
  { value: 'A', label: 'Status A - Single or Head of Household' },
  { value: 'B', label: 'Status B - Married (Spouse NOT Working)' },
  { value: 'C', label: 'Status C - Married (Both Work or Single Rate)' }
];

const PAY_PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Weekly (52 periods/year)' },
  { value: 'biweekly', label: 'Bi-Weekly (26 periods/year)' },
  { value: 'semimonthly', label: 'Semi-Monthly (24 periods/year)' },
  { value: 'monthly', label: 'Monthly (12 periods/year)' }
];

// --- MAIN IDAHO FORM ---
const IdahoTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    middle_initial: '',
    ssn: '',
    address: '',
    city: '',
    state: 'ID',
    zipcode: '',
    email: '',
    client_name: 'Tech Innovators Inc',
    job_title: 'Software Engineer',

    // Form ID W-4 Filing Status
    status_letter: 'A', // A, B, or C

    // Line 1: Allowances Inputs
    children_under_17: 0,
    head_of_household: false,

    // Line 2: Additional Withholding Inputs
    additional_withholding: '',
    use_multiple_jobs: false,
    multiple_jobs_count: 0,
    other_income: '',
    itemized_line4: '',
    remaining_pay_periods: 52,

    // Exemption & Non-Resident
    exempt: false,
    non_resident_alien: false,
    pay_period: 'weekly',

    // Digital Signature & Date
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // Pre-fill from initialData
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        middle_initial: initialData.initial || initialData.middle_initial || '',
        ssn: initialData.ssn || '',
        address: initialData.address || '',
        city: initialData.city || '',
        zipcode: (initialData.zipcode || '').slice(0, 5),
        state: 'ID',
        email: initialData.email || '',
        client_name: initialData.client_name || 'Tech Innovators Inc',
        job_title: initialData.job_title || 'Software Engineer'
      }));
    }
  }, [initialData]);

  // Signature Canvas Resize Handler
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) sigCanvasRef.current.fromDataURL(savedData);
        }
      }
    };
    const t = setTimeout(resizeCanvas, 250);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', resizeCanvas);
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

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: sig }));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  // --- LIVE CALCULATION ENGINE (Exact Match to idaho.py) ---
  const calculations = useMemo(() => {
    const kids = parseInt(formData.children_under_17, 10) || 0;
    const isHoH = !!formData.head_of_household;
    const isExempt = !!formData.exempt;
    const isNRA = !!formData.non_resident_alien;

    // Line 1: Allowances
    let line1Allowances = kids + (isHoH ? 2 : 0);
    let line1Text = String(line1Allowances);
    if (isExempt) line1Text = 'Exempt';
    else if (isNRA) line1Text = '0';

    // Line 2: Multiple Jobs Worksheet (Page 2)
    let wsVal2 = 0;
    let wsVal4 = 0;
    let wsVal6 = 0;
    let wsVal7 = 0;
    let wsVal8 = 0;
    let jobsExtra = 0;

    const jobCount = parseInt(formData.multiple_jobs_count, 10) || 0;
    const otherInc = parseFloat(formData.other_income) || 0;
    const item4 = parseFloat(formData.itemized_line4) || 0;
    const remPeriods = parseInt(formData.remaining_pay_periods, 10) || 52;
    const manualAdd = parseFloat(formData.additional_withholding) || 0;

    if (formData.use_multiple_jobs && jobCount > 0) {
      wsVal2 = jobCount * 12550;
      wsVal4 = Math.min(wsVal2, otherInc);
      wsVal6 = item4 * 3154;
      wsVal7 = Math.max(wsVal4 - wsVal6, 0);
      wsVal8 = wsVal7 * 0.065;
      const divisor = remPeriods > 0 ? remPeriods : 52;
      jobsExtra = Math.round(wsVal8 / divisor);
    }

    // Nonresident Alien Fixed Adjustment
    if (isNRA) {
      const fixedRates = { weekly: 16, biweekly: 31, semimonthly: 34, monthly: 68 };
      jobsExtra = fixedRates[formData.pay_period] || 16;
    }

    const totalAdditional = Math.round(manualAdd + jobsExtra);

    return {
      line1Allowances,
      line1Text,
      wsVal2,
      wsVal4,
      wsVal6,
      wsVal7,
      wsVal8,
      jobsExtra,
      manualAdd,
      totalAdditional
    };
  }, [
    formData.children_under_17,
    formData.head_of_household,
    formData.exempt,
    formData.non_resident_alien,
    formData.use_multiple_jobs,
    formData.multiple_jobs_count,
    formData.other_income,
    formData.itemized_line4,
    formData.remaining_pay_periods,
    formData.additional_withholding,
    formData.pay_period
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    let sig = formData.signature_image || '';
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!sig) {
      setValidationError("Please provide your digital signature in the Attestation & Signature box.");
      return;
      return;
    }
    if (!formData.first_name || !formData.last_name || !formData.ssn) {
      setValidationError("Please ensure your First Name, Last Name, and SSN are filled out.");
      return;
      return;
    }

    const cleanNum = (val) => (val === '' || val === null || isNaN(val)) ? 0 : val;

    const payload = {
      ...formData,
      children_under_17: cleanNum(formData.children_under_17),
      additional_withholding: cleanNum(formData.additional_withholding),
      multiple_jobs_count: cleanNum(formData.multiple_jobs_count),
      other_income: cleanNum(formData.other_income),
      itemized_line4: cleanNum(formData.itemized_line4),
      remaining_pay_periods: cleanNum(formData.remaining_pay_periods),
      allowances: calculations.line1Allowances,
      signature: sig,
      signature_image: sig
    };

    onSubmit(payload);
  };

  // Themed Styles
  const cardBg = isDarkMode 
    ? 'bg-[#181a20] border-zinc-800 text-zinc-100 shadow-xl' 
    : 'bg-white border-slate-200/80 text-slate-800 shadow-sm';
  
  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDarkMode ? 'text-zinc-400' : 'text-slate-600'
  }`;

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
    isDarkMode 
      ? 'bg-zinc-900/60 border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
      : 'bg-slate-50/70 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  }`;

  const sectionTitle = (Icon, title, subtitle) => (
    <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-zinc-200/50 dark:border-zinc-800/80">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}>
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-sm font-extrabold tracking-tight">{title}</h3>
        {subtitle && <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
  );

  const toggleCard = (checked, labelText, descText, name) => (
    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
      checked 
        ? (isDarkMode ? 'border-blue-500/80 bg-blue-500/10' : 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/30')
        : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50/40')
    }`}>
      <input 
        type="checkbox" 
        name={name} 
        checked={checked} 
        onChange={handleChange} 
        className="mt-0.5 w-4 h-4 rounded text-blue-600 border-zinc-300 focus:ring-blue-500"
      />
      <div>
        <span className="text-xs font-bold block">{labelText}</span>
        {descText && <span className={`text-[11px] block mt-0.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{descText}</span>}
      </div>
    </label>
  );

  return (
    <div className="w-full space-y-6">
      
      {/* VALIDATION ERROR BANNER */}
      {validationError && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <p className="text-sm font-semibold">{validationError}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setValidationError('')}
            className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. STATE FORM HEADER CARD */}
      <div className={`p-5 rounded-2xl border ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md" style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}>
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold tracking-tight">Idaho Withholding Certificate</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Form ID W-4
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600'}`}>
                  State of Idaho
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Idaho State Tax Commission • Complete so your employer can withhold the correct Idaho income tax.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span>Official 2026 Ready</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MAIN FORM FIELDS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. EMPLOYEE PERSONAL INFORMATION */}
            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              {sectionTitle(User, "1. Employee Identification & Address", "Your personal and contact details matching your legal tax identity.")}
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className={labelClass}>First Name</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>M.I.</label>
                  <input type="text" name="middle_initial" maxLength={2} value={formData.middle_initial} onChange={handleChange} className={`${inputClass} text-center`} placeholder="M" />
                </div>
                <div className="md:col-span-5">
                  <label className={labelClass}>Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" />
                </div>

                <div className="md:col-span-6">
                  <label className={labelClass}>Social Security Number (SSN)</label>
                  <div className="relative">
                    <Shield size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                    <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXX-XX-XXXX" />
                  </div>
                </div>

                <div className="md:col-span-6">
                  <label className={labelClass}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="employee@company.com" />
                </div>

                <div className="md:col-span-12">
                  <label className={labelClass}>Residential Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street address or P.O. Box" />
                </div>

                <div className="md:col-span-5">
                  <label className={labelClass}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="City" />
                </div>

                <div className="md:col-span-3">
                  <label className={labelClass}>State</label>
                  <input type="text" name="state" value="ID" readOnly className={`${inputClass} bg-blue-500/10 text-blue-500 font-bold text-center cursor-not-allowed`} />
                </div>

                <div className="md:col-span-4">
                  <label className={labelClass}>ZIP Code</label>
                  <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} maxLength={5} className={inputClass} placeholder="83702" />
                </div>
              </div>
            </div>

            {/* 2. WITHHOLDING STATUS */}
            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              {sectionTitle(FileText, "2. Withholding Status (Letter A, B, or C)", "Select the status that corresponds with your marital & tax situation.")}

              <div className="space-y-4">
                <StunningSelect
                  label="Idaho Withholding Status Letter"
                  value={formData.status_letter}
                  onChange={(e) => setFormData(prev => ({ ...prev, status_letter: e.target.value }))}
                  options={STATUS_LETTER_OPTIONS}
                  placeholder="Select Status"
                />

                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <p className="font-semibold text-blue-500 mb-1">Status Guidance:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li><strong>Status A:</strong> Single or Head of Household.</li>
                    <li><strong>Status B:</strong> Married with only one working spouse.</li>
                    <li><strong>Status C:</strong> Married with both working, or choosing withholding at the higher Single rate.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. ALLOWANCES & ADJUSTMENTS (LINE 1 & LINE 2) */}
            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              {sectionTitle(Calculator, "3. Allowances & Additional Withholding", "Configure your child allowances and additional withholding amount.")}

              <div className="space-y-4">
                {/* Standard Line 1 Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Children Age 16 or Under (Qualifying)</label>
                    <input 
                      type="number" 
                      name="children_under_17" 
                      min="0" 
                      value={formData.children_under_17} 
                      onChange={handleChange} 
                      className={inputClass} 
                    />
                    <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Each qualifying child adds 1 allowance to Line 1.
                    </span>
                  </div>

                  <div>
                    <label className={labelClass}>Manual Additional Withholding ($/paycheck)</label>
                    <div className="relative">
                      <DollarSign size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                      <input 
                        type="number" 
                        name="additional_withholding" 
                        min="0" 
                        step="1"
                        value={formData.additional_withholding} 
                        onChange={handleChange} 
                        className={`${inputClass} pl-9`} 
                        placeholder="0.00" 
                      />
                    </div>
                    <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Direct extra dollar amount withheld per pay period.
                    </span>
                  </div>
                </div>

                {/* Head of Household Toggle */}
                {toggleCard(
                  formData.head_of_household,
                  "Filing as Head of Household (+2 Allowances)",
                  "Check if you are unmarried and pay more than half the costs of keeping up a home for yourself and a qualifying child or relative.",
                  "head_of_household"
                )}

                {/* Multiple Jobs Worksheet Toggle */}
                {toggleCard(
                  formData.use_multiple_jobs,
                  "Use Multiple Jobs Worksheet (Form ID W-4, Page 2)",
                  "Check if you have more than one job at a time or are married filing jointly and both work.",
                  "use_multiple_jobs"
                )}

                {/* Multiple Jobs Worksheet Detailed Inputs */}
                {formData.use_multiple_jobs && (
                  <div className={`p-4 rounded-xl border space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    isDarkMode ? 'bg-zinc-900/70 border-zinc-700/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-blue-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Page 2 Worksheet Calculations</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>1. Other Jobs Count (Excluding Primary)</label>
                        <input 
                          type="number" 
                          name="multiple_jobs_count" 
                          min="0" 
                          value={formData.multiple_jobs_count} 
                          onChange={handleChange} 
                          className={inputClass} 
                        />
                      </div>

                      <div>
                        <label className={labelClass}>3. Estimated Income from Other Jobs ($)</label>
                        <div className="relative">
                          <DollarSign size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                          <input 
                            type="number" 
                            name="other_income" 
                            min="0" 
                            value={formData.other_income} 
                            onChange={handleChange} 
                            className={`${inputClass} pl-9`} 
                            placeholder="0.00" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>5. Itemized Deduction Line 4 Amount ($)</label>
                        <div className="relative">
                          <DollarSign size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                          <input 
                            type="number" 
                            name="itemized_line4" 
                            min="0" 
                            value={formData.itemized_line4} 
                            onChange={handleChange} 
                            className={`${inputClass} pl-9`} 
                            placeholder="0.00" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>9. Remaining Pay Periods (Default: 52)</label>
                        <input 
                          type="number" 
                          name="remaining_pay_periods" 
                          min="1" 
                          max="52" 
                          value={formData.remaining_pay_periods} 
                          onChange={handleChange} 
                          className={inputClass} 
                        />
                      </div>
                    </div>

                    {/* Worksheet Summary Badges */}
                    <div className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs ${
                      isDarkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-white border-slate-200'
                    }`}>
                      <div>
                        <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Worksheet Line 8 (Annual Extra)</span>
                        <span className="text-sm font-extrabold text-blue-500">${calculations.wsVal8.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Line 9 (Per-Paycheck Addition)</span>
                        <span className="text-sm font-extrabold text-emerald-500">+${calculations.jobsExtra} / paycheck</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exemption & Nonresident Alien */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/60">
                  {toggleCard(
                    formData.exempt,
                    "Claim Total Exemption from Withholding",
                    "Only check if you meet the conditions of having had no Idaho tax liability last year and expect none this year.",
                    "exempt"
                  )}

                  {toggleCard(
                    formData.non_resident_alien,
                    "Nonresident Alien Status",
                    "Requires single withholding status with specific fixed allowance adjustments.",
                    "non_resident_alien"
                  )}
                </div>

                {formData.non_resident_alien && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <StunningSelect
                      label="Pay Period for Nonresident Alien Fixed Rate"
                      value={formData.pay_period}
                      onChange={(e) => setFormData(prev => ({ ...prev, pay_period: e.target.value }))}
                      options={PAY_PERIOD_OPTIONS}
                      placeholder="Select Pay Period"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. ATTESTATION & DIGITAL SIGNATURE */}
            <div className={`p-5 rounded-2xl border ${cardBg}`}>
              {sectionTitle(PenTool, "4. Attestation & Digital Signature", "Under penalties of perjury, certify that all information submitted is true and correct.")}

              <div className="space-y-4">
                <div className="max-w-xs">
                  <CustomDatePicker
                    label="Date of Signing"
                    name="confirmation_date"
                    value={formData.confirmation_date}
                    onChange={handleChange}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>
                      Draw Signature <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                    >
                      <Eraser size={13} />
                      <span>Clear Signature</span>
                    </button>
                  </div>

                  <div 
                    ref={containerRef}
                    className={`h-40 w-full rounded-2xl border-2 border-dashed overflow-hidden relative cursor-crosshair transition-all ${
                      isDarkMode 
                        ? 'bg-zinc-900/60 border-zinc-700 hover:border-zinc-500' 
                        : 'bg-slate-50/70 border-slate-300 hover:border-slate-400'
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400 dark:text-zinc-600 gap-1.5">
                        <PenTool size={20} className="opacity-40" />
                        <span className="text-xs font-medium">Draw your legal signature inside this box</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Action */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    style={{ backgroundColor: activeHexColor }}
                    className="px-8 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-95 hover:shadow-xl transition-all flex items-center gap-2 transform active:scale-95"
                  >
                    <Save size={16} />
                    <span>Confirm & Generate ID W-4 PDF</span>
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: LIVE CALCULATION SUMMARY CARD (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-5 rounded-2xl border sticky top-6 ${cardBg}`}>
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-zinc-200/50 dark:border-zinc-800/80">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">Form ID W-4 Summary</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Official Live Tax Calculation</p>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Line 1 Summary Card */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Line 1: Allowances</span>
                  <span className="text-lg font-extrabold text-blue-500">{calculations.line1Text}</span>
                </div>
                <div className={`space-y-1 text-xs border-t pt-2 ${isDarkMode ? 'border-zinc-800/80 text-zinc-400' : 'border-slate-200 text-slate-600'}`}>
                  <div className="flex justify-between">
                    <span>Qualifying Children:</span>
                    <span className="font-bold">{formData.children_under_17 || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Head of Household:</span>
                    <span className="font-bold">{formData.head_of_household ? '+2' : '0'}</span>
                  </div>
                  {formData.exempt && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>Exempt Status:</span>
                      <span>YES</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line 2 Summary Card */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Line 2: Extra Withholding</span>
                  <span className="text-lg font-extrabold text-emerald-500">${calculations.totalAdditional}</span>
                </div>
                <div className={`space-y-1 text-xs border-t pt-2 ${isDarkMode ? 'border-zinc-800/80 text-zinc-400' : 'border-slate-200 text-slate-600'}`}>
                  <div className="flex justify-between">
                    <span>Manual Extra:</span>
                    <span className="font-bold">${calculations.manualAdd || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multiple Jobs Addition:</span>
                    <span className="font-bold">+${calculations.jobsExtra}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-800/80 text-xs font-extrabold">
                    <span>Total Per Paycheck:</span>
                    <span className="text-emerald-500">${calculations.totalAdditional}</span>
                  </div>
                </div>
              </div>

              {/* Filing Status Summary */}
              <div className={`p-3.5 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-slate-50/60 border-slate-200'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Selected Status</span>
                <span className="font-bold text-sm text-blue-500">Status ({formData.status_letter})</span>
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {formData.status_letter === 'A' && 'Single or Head of Household'}
                  {formData.status_letter === 'B' && 'Married (Spouse Not Working)'}
                  {formData.status_letter === 'C' && 'Married (Both Work / Single Rate)'}
                </p>
              </div>

              {/* Information Notice */}
              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <Info size={15} className="mt-0.5 shrink-0" />
                <span>
                  The generated Form ID W-4 will be recorded and filled directly via the server-side PyMuPDF engine.
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default IdahoTaxForm;
