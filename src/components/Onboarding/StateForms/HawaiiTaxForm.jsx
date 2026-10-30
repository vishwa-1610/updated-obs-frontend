import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronLeft, ChevronRight, ChevronDown, 
  Eraser, Save, PenTool, FileText, Calculator, Building2, CheckCircle2, 
  AlertCircle, Sparkles, HelpCircle
} from 'lucide-react';
import StunningSelect from '../../common/StunningSelect';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

// --- CUSTOM DATE PICKER (THEMED) ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date(value || new Date()));
  const dropdownRef = useRef(null);
  const yearScrollRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); setView('calendar');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (value) setCurrentDate(new Date(value)); }, [value]);

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
      {label && <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{label}</label>}
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
            {view === 'calendar' && <button type="button" onClick={() => changeMonth(-1)} className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronLeft size={16}/></button>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className={`font-bold px-2 py-0.5 rounded text-xs ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>{monthNames[currentDate.getMonth()]}</button>
              <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className={`font-bold px-2 py-0.5 rounded text-xs ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>{currentDate.getFullYear()}</button>
            </div>
            {view === 'calendar' && <button type="button" onClick={() => changeMonth(1)} className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronRight size={16}/></button>}
          </div>
          {view === 'calendar' && (
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d} className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{d}</span>)}
              {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={i}/>)}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate() }, (_, i) => i+1).map(d => (
                <button key={d} type="button" onClick={() => handleDateClick(d)} className={`h-7 w-7 text-xs rounded-full font-medium transition-all ${isDarkMode ? 'hover:bg-blue-600/30 text-zinc-200' : 'hover:bg-blue-100 text-slate-700'}`}>{d}</button>
              ))}
            </div>
          )}
          {view === 'month' && <div className="grid grid-cols-3 gap-2">{monthNames.map((m, i) => <button key={m} onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), i, 1)); setView('calendar'); }} className={`p-2 text-xs rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>{m}</button>)}</div>}
          {view === 'year' && <div ref={yearScrollRef} className="h-44 overflow-y-auto grid grid-cols-3 gap-2">{years.map(y => <button key={y} onClick={() => { setCurrentDate(new Date(y, currentDate.getMonth(), 1)); setView('calendar'); }} className={`p-2 text-xs rounded-lg ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}>{y}</button>)}</div>}
        </div>
      )}
    </div>
  );
};

// --- FILING STATUS OPTIONS ---
const FILING_STATUS_OPTIONS = [
  { value: '1', label: 'Single / Married Filing Separately / Disabled Person (Status 1)' },
  { value: '2', label: 'Married Filing Jointly (Status 2)' },
  { value: '3', label: 'Married Jointly (Withhold at Higher Single Rate) (Status 3)' }
];

// --- MAIN HAWAII HW-4 COMPONENT ---
const HawaiiTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_initial: '',
    ssn: '',
    address: '',
    city: '',
    state: 'HI',
    zipcode: '',
    client_name: 'Tech Innovators Inc',
    job_title: 'Software Engineer',
    
    // HW-4 Specific Fields
    filing_status_hi: '1',
    
    // Allowances Inputs
    spouse_works: false,
    spouse_claimed: false,
    age_allowances: 0,
    dependents: 0,
    head_of_household: false,
    tax_credits: 0,

    // Worksheet Inputs (Line H)
    use_itemized: false,
    fed_itemized: 0,
    adjustments: 0,
    nonwage_income: 0,
    
    // Extras
    additional_withholding: 0,
    certified_disabled: false,
    military_spouse: false,

    // Signature & Date
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
        zipcode: initialData.zipcode || '',
        state: initialData.state || 'HI',
        client_name: initialData.client_name || 'Tech Innovators Inc',
        job_title: initialData.job_title || 'Software Engineer'
      }));
    }
  }, [initialData]);

  // Canvas Resize Handler
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
    const t = setTimeout(resizeCanvas, 250);
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
    let sig = formData.signature_image || "";
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }
    onSubmit({ ...formData, signature_image: sig });
  };

  // Reusable Theme Styles
  const cardBg = isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm';
  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`;
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
    isDarkMode 
      ? 'bg-zinc-900/60 border-zinc-700/80 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
      : 'bg-slate-50/70 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  }`;
  const sectionTitle = `text-sm font-bold flex items-center gap-2 mb-4 pb-2 border-b ${
    isDarkMode ? 'border-zinc-800 text-zinc-200' : 'border-slate-100 text-slate-800'
  }`;
  const toggleCard = (active) => `flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
    active 
      ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/60 ring-1 ring-blue-500/30' : 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-200')
      : (isDarkMode ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300')
  }`;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header Card */}
      <div className={`p-6 rounded-2xl border ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-xl font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                  Hawaii Withholding Certificate
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Form HW-4
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Dept of Taxation
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Employee's Withholding Allowance and Status Certificate • HRS §231-36
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border self-start sm:self-auto bg-blue-500/5 text-blue-500 border-blue-500/20">
            <Sparkles size={14} />
            <span>Official State Withholding</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. EMPLOYEE INFORMATION */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h3 className={sectionTitle}>
            <User size={18} style={{ color: activeHexColor }} />
            <span>Employee Information (Section A)</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className={labelClass}>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="Legal First Name" required />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>M.I.</label>
              <input type="text" name="middle_initial" maxLength="1" value={formData.middle_initial} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" />
            </div>
            <div className="md:col-span-5">
              <label className={labelClass}>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Legal Last Name" required />
            </div>
            
            <div className="md:col-span-6">
              <label className={labelClass}>Social Security Number (SSN)</label>
              <div className="relative">
                <Shield size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXX-XX-XXXX" required />
              </div>
            </div>
            <div className="md:col-span-6">
              <label className={labelClass}>Postal / Zip Code</label>
              <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} placeholder="e.g. 96815" required />
            </div>

            <div className="md:col-span-12">
              <label className={labelClass}>Home Address (in Hawaii)</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street Address, Apt, Suite, etc." required />
            </div>
            
            <div className="md:col-span-8">
              <label className={labelClass}>City or Town</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="e.g. Honolulu" required />
            </div>
            <div className="md:col-span-4">
              <label className={labelClass}>State</label>
              <input type="text" name="state" value={formData.state} readOnly className={`${inputClass} font-bold text-center opacity-80 cursor-not-allowed`} />
            </div>
          </div>
        </div>

        {/* 2. FILING STATUS (LINE 1) */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h3 className={sectionTitle}>
            <FileText size={18} style={{ color: activeHexColor }} />
            <span>Filing Status & Exempt Conditions (Line 1)</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Select Official Hawaii Filing Status</label>
              <StunningSelect
                value={formData.filing_status_hi}
                onChange={(e) => handleChange({ target: { name: 'filing_status_hi', value: e.target.value } })}
                options={FILING_STATUS_OPTIONS}
                placeholder="Select Filing Status..."
                isDarkMode={isDarkMode}
                activeHexColor={activeHexColor}
              />
            </div>
            
            {/* Special Status Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <label className={toggleCard(formData.certified_disabled)}>
                <input 
                  type="checkbox" 
                  name="certified_disabled" 
                  checked={formData.certified_disabled} 
                  onChange={handleChange} 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                />
                <div>
                  <span className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                    Certified Disabled Person
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Exempt under Booklet A (Employer's Tax Guide)
                  </span>
                </div>
              </label>

              <label className={toggleCard(formData.military_spouse)}>
                <input 
                  type="checkbox" 
                  name="military_spouse" 
                  checked={formData.military_spouse} 
                  onChange={handleChange} 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                />
                <div>
                  <span className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                    Military Spouse Exempt
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Nonresident military spouse under federal law
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. ALLOWANCES & WORKSHEET */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h3 className={sectionTitle}>
            <Calculator size={18} style={{ color: activeHexColor }} />
            <span>Allowances & Deductions Worksheet</span>
          </h3>
          
          <div className="space-y-5">
            {/* Basic Allowances Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Total Dependents (Line E)</label>
                <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} min="0" className={inputClass} placeholder="0" />
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Enter number of qualifying dependents.</p>
              </div>
              <div>
                <label className={labelClass}>Age 65+ Allowances (Line D)</label>
                <input type="number" name="age_allowances" value={formData.age_allowances} onChange={handleChange} min="0" className={inputClass} placeholder="0" />
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Enter 1 if you or spouse is 65 or older (2 if both qualify).</p>
              </div>
            </div>

            {/* Checkboxes Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <label className={toggleCard(formData.head_of_household)}>
                <input 
                  type="checkbox" 
                  name="head_of_household" 
                  checked={formData.head_of_household} 
                  onChange={handleChange} 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                />
                <div>
                  <span className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                    Head of Household (Line F)
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Unmarried and pay more than 50% of home costs.
                  </span>
                </div>
              </label>

              {/* Conditional Married Options */}
              {formData.filing_status_hi === '2' && (
                <>
                  <label className={toggleCard(!formData.spouse_works)}>
                    <input 
                      type="checkbox" 
                      name="spouse_works" 
                      checked={!formData.spouse_works} 
                      onChange={() => setFormData(prev => ({ ...prev, spouse_works: !prev.spouse_works }))} 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <div>
                      <span className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                        Spouse Does NOT Work (Line B)
                      </span>
                      <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Married and spouse does not earn income.
                      </span>
                    </div>
                  </label>

                  <label className={toggleCard(!formData.spouse_claimed)}>
                    <input 
                      type="checkbox" 
                      name="spouse_claimed" 
                      checked={!formData.spouse_claimed} 
                      onChange={() => setFormData(prev => ({ ...prev, spouse_claimed: !prev.spouse_claimed }))} 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <div>
                      <span className={`block text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                        Spouse NOT Claimed (Line C)
                      </span>
                      <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Spouse is not claiming themselves on their own HW-4.
                      </span>
                    </div>
                  </label>
                </>
              )}
            </div>

            {/* Tax Credits (Line G) */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50/50 border-slate-200'}`}>
              <label className={labelClass}>Estimated Tax Credits (Line G)</label>
              <div className="relative max-w-sm">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
                <input 
                  type="number" 
                  name="tax_credits" 
                  value={formData.tax_credits} 
                  onChange={handleChange} 
                  className={`${inputClass} pl-8`} 
                  placeholder="0" 
                />
              </div>
              <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                If your total tax credits equal at least $250, enter estimated amount here (adds allowance if &gt;= $250).
              </p>
            </div>

            {/* Deductions and Adjustments Worksheet (Line H) */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.use_itemized 
                ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/50' : 'bg-blue-50/40 border-blue-200')
                : (isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50/50 border-slate-200')
            }`}>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="use_itemized" 
                  checked={formData.use_itemized} 
                  onChange={handleChange} 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                />
                <div>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                    Use Itemized Deductions & Adjustments Worksheet (Line H)
                  </span>
                  <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Calculate estimated itemized deductions, state adjustments, and non-wage income.
                  </p>
                </div>
              </label>

              {formData.use_itemized && (
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4 pt-3 border-t ${isDarkMode ? 'border-zinc-800' : 'border-blue-100'}`}>
                  <div>
                    <label className={labelClass}>Federal Itemized Deductions</label>
                    <div className="relative">
                      <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
                      <input type="number" name="fed_itemized" value={formData.fed_itemized} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Total State Adjustments</label>
                    <div className="relative">
                      <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
                      <input type="number" name="adjustments" value={formData.adjustments} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Non-Wage Income</label>
                    <div className="relative">
                      <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
                      <input type="number" name="nonwage_income" value={formData.nonwage_income} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Withholding (Line 5) */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50/50 border-slate-200'}`}>
              <label className={labelClass}>Additional Withholding Per Pay Period (Line 5)</label>
              <div className="relative max-w-sm">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>$</span>
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
              <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Enter any additional dollar amount you want withheld from each paycheck.
              </p>
            </div>
          </div>
        </div>

        {/* 4. DECLARATION & SIGNATURE */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h3 className={sectionTitle}>
            <Calendar size={18} style={{ color: activeHexColor }} />
            <span>Declaration & Employee Signature</span>
          </h3>
          
          <div className={`p-4 rounded-xl border mb-6 text-xs leading-relaxed ${
            isDarkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-300' : 'bg-slate-50/70 border-slate-200 text-slate-700'
          }`}>
            <p className="font-medium">
              I declare under the penalties set forth in Section 231-36, HRS, that I have examined this certificate and, to the best of my knowledge and belief, it is true, correct, and complete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4">
              <CustomDatePicker 
                label="Date of Signing" 
                name="confirmation_date" 
                value={formData.confirmation_date} 
                onChange={handleChange} 
                isDarkMode={isDarkMode}
              />
            </div>

            <div className="md:col-span-8">
              <div className="flex justify-between items-center mb-1.5">
                <label className={labelClass}>Digital Signature</label>
                <button 
                  type="button" 
                  onClick={clearSignature} 
                  className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
                >
                  <Eraser size={13} />
                  <span>Clear Signature</span>
                </button>
              </div>
              
              <div 
                ref={containerRef} 
                className={`border-2 border-dashed rounded-xl overflow-hidden h-40 w-full relative cursor-crosshair transition-all ${
                  isDarkMode 
                    ? 'border-zinc-700 bg-zinc-950/80 hover:border-blue-500' 
                    : 'border-slate-300 bg-white hover:border-blue-500'
                }`}
              >
                <SignatureCanvas 
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? '#ffffff' : '#000000'}
                  velocityFilterWeight={0.7}
                  canvasProps={{ className: 'sigCanvas w-full h-full' }}
                  onEnd={handleSignatureEnd}
                />
                {!formData.signature_image && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 dark:text-zinc-500 gap-1.5">
                    <PenTool size={20} className="opacity-60" />
                    <span className="text-xs font-semibold">Draw your digital signature here</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={!formData.signature_image} 
            style={formData.signature_image ? { backgroundColor: activeHexColor } : {}}
            className={`px-8 py-3.5 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 ${
              formData.signature_image 
                ? 'text-white hover:opacity-95 hover:shadow-xl hover:-translate-y-0.5' 
                : 'bg-zinc-700/50 text-zinc-400 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <CheckCircle2 size={18} />
            <span>Confirm & Generate Official HW-4 PDF</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default HawaiiTaxForm;
