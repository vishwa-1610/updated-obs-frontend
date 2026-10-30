import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, 
  PenTool, FileText, Calculator, Loader2, XCircle, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';
import { StunningSelect } from '../../tasks/StunningSelect';

// 1. LOADING OVERLAY
const LoadingOverlay = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
      isDarkMode ? 'bg-black/80' : 'bg-white/80'
    }`}>
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className={`absolute inset-0 flex items-center justify-center ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            <Calculator size={20} />
          </div>
        </div>
        <h3 className={`mt-4 text-lg font-bold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
          Processing Colorado DR 0004...
        </h3>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          Securely validating allowances and compiling official certificate
        </p>
      </div>
    </div>
  );
};

// 2. ERROR MODAL
const ErrorModal = ({ isOpen, title, message, onClose }) => {
  const { isDarkMode } = useTheme();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-8 duration-300 transform transition-all border ${
        isDarkMode ? 'bg-[#18181b] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="text-rose-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">{title || "Action Required"}</h3>
          <p className={`mb-6 text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            {message || "Please check your inputs."}
          </p>
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg"
          >
            Okay, I'll Fix It
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. CUSTOM DATE PICKER
const CustomDatePicker = ({ label, name, value, onChange, placeholder }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
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
      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
        isDarkMode ? 'text-zinc-400' : 'text-slate-500'
      }`}>{label}</label>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
        <input 
          readOnly 
          type="text" 
          value={value || ''} 
          placeholder={placeholder || "YYYY-MM-DD"} 
          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none cursor-pointer shadow-xs ${
            isDarkMode 
              ? 'bg-[#18181b] border-zinc-800 text-zinc-100 hover:border-zinc-700' 
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`} 
        />
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      </div>
      {isOpen && (
        <div className={`absolute z-50 mb-2 p-4 rounded-2xl shadow-2xl border w-72 bottom-full left-0 animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#18181b] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
           <div className="flex justify-between items-center mb-4">
              {view === 'calendar' && (
                <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-lg hover:bg-zinc-800 transition-colors">
                  <ChevronLeft size={18}/>
                </button>
              )}
              <div className="flex gap-2">
                 <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className="font-bold text-xs px-2 py-1 rounded hover:bg-zinc-500/10">
                   {monthNames[currentDate.getMonth()]}
                 </button>
                 <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className="font-bold text-xs px-2 py-1 rounded hover:bg-zinc-500/10">
                   {currentDate.getFullYear()}
                 </button>
              </div>
              {view === 'calendar' && (
                <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-lg hover:bg-zinc-800 transition-colors">
                  <ChevronRight size={18}/>
                </button>
              )}
           </div>
           {view === 'calendar' && (
             <div className="grid grid-cols-7 gap-1 text-center">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><span key={d} className="text-xs text-zinc-400 font-bold">{d}</span>)}
                {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_,i)=><div key={i}/>)}
                {Array.from({length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate()}, (_,i)=>i+1).map(d => (
                   <button 
                     key={d} 
                     type="button" 
                     onClick={() => handleDateClick(d)} 
                     className="h-8 w-8 text-xs font-semibold rounded-lg hover:bg-blue-600/20 hover:text-blue-500 transition-colors"
                   >
                     {d}
                   </button>
                ))}
             </div>
           )}
           {view === 'month' && (
             <div className="grid grid-cols-3 gap-2">
               {monthNames.map((m,i)=>(
                 <button 
                   key={m} 
                   onClick={()=>{setCurrentDate(new Date(currentDate.getFullYear(),i,1));setView('calendar')}} 
                   className="p-2 text-xs font-semibold hover:bg-blue-600/20 rounded-lg"
                 >
                   {m}
                 </button>
               ))}
             </div>
           )}
           {view === 'year' && (
             <div ref={yearScrollRef} className="h-48 overflow-y-auto grid grid-cols-3 gap-2 custom-scrollbar">
               {years.map(y=>(
                 <button 
                   key={y} 
                   onClick={()=>{setCurrentDate(new Date(y,currentDate.getMonth(),1));setView('calendar')}} 
                   className={`p-2 text-xs font-semibold rounded-lg hover:bg-blue-600/20 ${y === currentDate.getFullYear() ? 'selected-year font-bold text-blue-500' : ''}`}
                 >
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

// --- MAIN COLORADO FORM ---
const ColoradoTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef({}); 
  const containerRef = useRef(null);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // DATA STATE
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '', last_name: '', initial: '', ssn: '',
    address: '', city: '', state: 'CO', zipcode: '', email: '',

    // Filing Status & Jobs
    filing_status: '1', num_jobs: 1,

    // Worksheet 1
    use_worksheet_1: false, annual_income: '', federal_deductions: '',
    dependents: 0, child_tax_credit: false,
    
    // Manual/Standard Override (Line 2)
    use_table_1: true, annual_withholding_allowance: '',

    // Worksheet 2
    use_worksheet_2: false, non_business_income: '',
    other_non_wage_income: '', num_pay_periods: 26,

    // Manual Override (Line 3)
    additional_withholding: '',

    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingStatusOptions = [
    { value: "1", label: "Single" },
    { value: "2", label: "Married Filing Jointly" },
    { value: "3", label: "Married Filing Separately" },
    { value: "4", label: "Head of Household" },
    { value: "5", label: "Qualifying Surviving Spouse" }
  ];

  // Initialize
  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            ...initialData,
            state: 'CO',
            zipcode: (initialData.zipcode || '').slice(0, 5)
        }));
    }
  }, [initialData]);

  // Canvas Resize
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
    setTimeout(resizeCanvas, 200);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
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

  // --- SIGNATURE HANDLING ---
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        const signatureData = sigCanvasRef.current.getCanvas().toDataURL('image/png');
        setFormData(prev => ({ ...prev, signature_image: signatureData }));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current && typeof sigCanvasRef.current.clear === 'function') {
      sigCanvasRef.current.clear();
    }
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
      e?.preventDefault?.();
      
      // 1. CAPTURE SIGNATURE
      let sig = formData.signature_image;
      if (sigCanvasRef.current && typeof sigCanvasRef.current.isEmpty === 'function' && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      // 2. STRICT VALIDATION
      if (!sig) {
          setErrorState({ 
              isOpen: true, 
              title: "Missing Signature",
              message: "Please sign the form in the 'Digital Signature' box before submitting." 
          });
          return;
      }

      if (!formData.first_name || !formData.last_name || !formData.ssn) {
          setErrorState({
              isOpen: true,
              title: "Missing Information",
              message: "Please ensure your First Name, Last Name, and SSN are filled out."
          });
          return;
      }

      // 3. START SUBMISSION
      setIsSubmitting(true);

      try {
          const jobsKey = Math.min(Math.max(Number(formData.num_jobs) || 1, 1), 4);
          let computedAllowance = formData.annual_withholding_allowance;
          if (!formData.use_worksheet_1 && formData.use_table_1) {
            const table1Lookup = {
              "1": { 1: 12500, 2: 6000, 3: 4000, 4: 3000 },
              "2": { 1: 27000, 2: 13500, 3: 9000, 4: 6500 },
              "3": { 1: 12500, 2: 6000, 3: 4000, 4: 3000 },
              "4": { 1: 19500, 2: 10000, 3: 6500, 4: 5000 },
              "5": { 1: 27000, 2: 13500, 3: 9000, 4: 6500 }
            };
            computedAllowance = String((table1Lookup[formData.filing_status] || table1Lookup["1"])[jobsKey]);
          }
          const finalData = { 
            ...formData, 
            annual_withholding_allowance: computedAllowance,
            signature_image: sig 
          };
          await onSubmit(finalData);
          setIsSubmitting(false);
      } catch (error) {
          console.error("Submission Error:", error);
          setIsSubmitting(false);
          const msg = error.response?.data?.error || error.message || "Something went wrong. Please try again.";
          setErrorState({ isOpen: true, title: "Submission Failed", message: msg });
      }
  };

  // --- THEME-REACTIVE STYLES ---
  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none shadow-xs ${
    isDarkMode 
      ? 'bg-[#18181b] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${
    isDarkMode ? 'text-zinc-400' : 'text-slate-500'
  }`;

  const sectionCard = `p-6 sm:p-8 rounded-2xl border transition-all ${
    isDarkMode ? 'bg-[#121217] border-zinc-800 shadow-xl' : 'bg-white border-slate-100 shadow-sm'
  }`;

  const sectionHeader = `text-lg font-bold flex items-center gap-3 mb-6 pb-4 border-b ${
    isDarkMode ? 'border-zinc-800/80 text-zinc-100' : 'border-slate-100 text-slate-900'
  }`;

  const checkboxCardClass = `flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
    isDarkMode ? 'border-zinc-800 hover:border-zinc-700 bg-[#18181b]' : 'border-slate-200 hover:border-slate-300 bg-white'
  }`;

  const activeCheckboxClass = `ring-2 ${
    isDarkMode ? 'border-blue-500 ring-blue-500/30 bg-blue-500/10' : 'border-blue-600 ring-blue-500/20 bg-blue-50/40'
  }`;

  return (
    <>
      {/* 1. LOADING OVERLAY */}
      {isSubmitting && <LoadingOverlay />}

      {/* 2. ERROR MODAL */}
      <ErrorModal 
        isOpen={errorState.isOpen} 
        title={errorState.title}
        message={errorState.message} 
        onClose={() => setErrorState({ isOpen: false, title: '', message: '' })} 
      />

      <div className={`px-2 py-4 text-left relative max-w-5xl mx-auto ${
        isDarkMode ? 'text-zinc-100' : 'text-slate-800'
      }`}>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}>
            <FileText size={13} /> Official State Form
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Colorado Withholding Certificate</h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Form DR 0004 &bull; Colorado Department of Revenue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. PERSONAL INFORMATION */}
          <section className={sectionCard}>
            <h3 className={sectionHeader}>
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}>
                <User size={20} />
              </div>
              <span>Personal Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-5">
                  <label className={labelClass}>First Name</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>M.I.</label>
                  <input type="text" name="initial" maxLength="1" value={formData.initial} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" />
                </div>
                <div className="md:col-span-5">
                  <label className={labelClass}>Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" />
                </div>
                
                <div className="md:col-span-6 relative">
                  <label className={labelClass}>SSN</label>
                  <div className="relative">
                    <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX"/>
                    <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"/>
                  </div>
                </div>
                <div className="md:col-span-6">
                  <label className={labelClass}>Email (Optional)</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="john@example.com" />
                </div>

                <div className="md:col-span-6">
                  <label className={labelClass}>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street Address" />
                </div>
                
                <div className="md:col-span-4">
                  <label className={labelClass}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="City" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>State</label>
                  <input type="text" name="state" value="CO" readOnly className={`${inputClass} opacity-60 cursor-not-allowed text-center font-bold`} />
                </div>
                <div className="md:col-span-6">
                  <label className={labelClass}>Zip Code</label>
                  <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} placeholder="80202" />
                </div>
            </div>
          </section>

          {/* 2. FILING STATUS & JOBS */}
          <section className={sectionCard}>
            <h3 className={sectionHeader}>
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}>
                <FileText size={20} />
              </div>
              <span>Filing Status & Jobs</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <StunningSelect
                      label="Filing Status"
                      value={formData.filing_status}
                      onChange={(e) => handleChange({ target: { name: 'filing_status', value: e.target.value } })}
                      options={filingStatusOptions}
                      placeholder="Select Filing Status"
                      required
                    />
                </div>
                <div>
                    <label className={labelClass}>Number of Jobs</label>
                    <input type="number" name="num_jobs" min="1" value={formData.num_jobs} onChange={handleChange} className={inputClass} />
                    <p className={`text-xs mt-2 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Total qualifying jobs for this household.
                    </p>
                </div>
            </div>
          </section>

          {/* 3. ALLOWANCE CALCULATION (LINE 2) */}
          <section className={sectionCard}>
            <h3 className={sectionHeader}>
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}>
                <Calculator size={20} />
              </div>
              <span>Annual Allowance (Line 2)</span>
            </h3>
            
            <div className={`p-6 rounded-2xl border space-y-6 ${
              isDarkMode ? 'bg-[#18181b]/50 border-zinc-800' : 'bg-slate-50/70 border-slate-200'
            }`}>
                
                {/* Worksheet 1 Toggle */}
                <label className={`${checkboxCardClass} ${formData.use_worksheet_1 ? activeCheckboxClass : ''}`}>
                    <input 
                        type="checkbox" 
                        name="use_worksheet_1" 
                        checked={formData.use_worksheet_1} 
                        onChange={handleChange} 
                        className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                        <span className="block font-bold text-sm">Use Worksheet 1</span>
                        <span className={`text-xs block mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          Calculate based on income, deductions, and dependents.
                        </span>
                    </div>
                </label>

                {/* Logic A: Worksheet 1 Active */}
                {formData.use_worksheet_1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4 border-l-2 border-blue-500 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className={labelClass}>Total Annual Income ($)</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                              <input type="number" name="annual_income" value={formData.annual_income} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="e.g. 75000" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Federal Deductions ($)</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                              <input type="number" name="federal_deductions" value={formData.federal_deductions} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Dependents (Count)</label>
                            <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl transition-colors">
                                <input type="checkbox" name="child_tax_credit" checked={formData.child_tax_credit} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                                <span className="text-xs sm:text-sm font-bold">Claim Child Tax Credit?</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Logic B: Standard/Manual (Only if WS1 is OFF) */}
                {!formData.use_worksheet_1 && (
                    <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
                         <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: activeHexColor }}>
                           <Shield size={13}/> Method Selection
                         </p>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Option 1: Standard Table */}
                            <label className={`${checkboxCardClass} ${formData.use_table_1 ? activeCheckboxClass : ''}`}>
                                <input 
                                    type="radio" 
                                    name="allowance_method" 
                                    checked={formData.use_table_1} 
                                    onChange={() => setFormData(prev => ({ ...prev, use_table_1: true }))}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="font-bold text-xs sm:text-sm ml-2">Use Standard Table</span>
                            </label>

                            {/* Option 2: Manual */}
                            <label className={`${checkboxCardClass} ${!formData.use_table_1 ? activeCheckboxClass : ''}`}>
                                <input 
                                    type="radio" 
                                    name="allowance_method" 
                                    checked={!formData.use_table_1} 
                                    onChange={() => setFormData(prev => ({ ...prev, use_table_1: false }))}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="font-bold text-xs sm:text-sm ml-2">Enter Manually</span>
                            </label>
                         </div>

                         {!formData.use_table_1 && (
                             <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                                <label className={labelClass}>Manual Allowance Amount ($)</label>
                                <div className="relative max-w-sm">
                                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                                  <input type="number" name="annual_withholding_allowance" value={formData.annual_withholding_allowance} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                                </div>
                             </div>
                         )}
                    </div>
                )}
            </div>
          </section>

          {/* 4. ADDITIONAL WITHHOLDING (LINE 3) */}
          <section className={sectionCard}>
            <h3 className={sectionHeader}>
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}>
                <DollarSign size={20} />
              </div>
              <span>Additional Withholding (Line 3)</span>
            </h3>
            
            <div className={`p-6 rounded-2xl border space-y-6 ${
              isDarkMode ? 'bg-[#18181b]/50 border-zinc-800' : 'bg-slate-50/70 border-slate-200'
            }`}>
                 {/* Worksheet 2 Toggle */}
                 <label className={`${checkboxCardClass} ${formData.use_worksheet_2 ? activeCheckboxClass : ''}`}>
                    <input 
                        type="checkbox" 
                        name="use_worksheet_2" 
                        checked={formData.use_worksheet_2} 
                        onChange={handleChange} 
                        className="w-5 h-5 text-emerald-600 rounded"
                    />
                    <div>
                        <span className="block font-bold text-sm">Use Worksheet 2</span>
                        <span className={`text-xs block mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          For non-wage income (interest, dividends, freelance, etc).
                        </span>
                    </div>
                </label>

                {/* Logic A: Worksheet 2 Active */}
                {formData.use_worksheet_2 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4 border-l-2 border-emerald-500 animate-in fade-in slide-in-from-top-2">
                         <div>
                            <label className={labelClass}>Non-Business Income ($)</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                              <input type="number" name="non_business_income" value={formData.non_business_income} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Other Non-Wage Income ($)</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                              <input type="number" name="other_non_wage_income" value={formData.other_non_wage_income} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Pay Periods per Year</label>
                            <input type="number" name="num_pay_periods" value={formData.num_pay_periods} onChange={handleChange} className={inputClass} placeholder="e.g. 26" />
                        </div>
                    </div>
                ) : (
                    /* Logic B: Manual Entry */
                    <div className="pt-2">
                         <label className={labelClass}>Manual Additional Withholding ($)</label>
                         <div className="relative max-w-sm">
                           <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                           <input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                         </div>
                         <p className={`text-xs mt-2 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                           Optional extra amount to withhold per paycheck.
                         </p>
                    </div>
                )}
            </div>
          </section>

          {/* 5. SIGNATURE */}
          <section className={sectionCard}>
            <h3 className={sectionHeader}>
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}>
                <PenTool size={20} />
              </div>
              <span>Attestation & Signature</span>
            </h3>
            
            <div className="mb-6 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center mb-3">
                    <label className={labelClass}>Digital Signature <span className="text-rose-500">*</span></label>
                    <button 
                      type="button" 
                      onClick={clearSignature} 
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
                    >
                      <Eraser size={14}/> Clear Signature
                    </button>
                </div>
                
                <div 
                  ref={containerRef} 
                  className={`border-2 border-dashed rounded-2xl overflow-hidden h-52 w-full relative transition-colors cursor-crosshair group ${
                    isDarkMode 
                      ? 'border-zinc-700 bg-zinc-900/50 hover:border-blue-500' 
                      : 'border-slate-300 bg-slate-50/50 hover:border-blue-500'
                  }`}
                >
                    <SignatureCanvas 
                        ref={sigCanvasRef}
                        penColor={isDarkMode ? 'white' : 'black'}
                        velocityFilterWeight={0.7}
                        canvasProps={{ className: 'sigCanvas w-full h-full' }}
                        onEnd={handleSignatureEnd}
                    />
                    {!formData.signature_image && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400 gap-2 group-hover:text-blue-500 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-zinc-800' : 'bg-white shadow-xs'
                          }`}>
                            <PenTool size={18} className="opacity-70"/>
                          </div>
                          <span className="font-semibold text-xs">Draw signature here</span>
                       </div>
                    )}
                </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4 pb-8">
            <button 
                type="submit"
                disabled={isSubmitting} 
                style={{ backgroundColor: activeHexColor }}
                className={`
                    px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center gap-2.5
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-95'}
                `}
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>{isSubmitting ? 'Processing...' : 'Confirm & Generate PDF'}</span>
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default ColoradoTaxForm;
