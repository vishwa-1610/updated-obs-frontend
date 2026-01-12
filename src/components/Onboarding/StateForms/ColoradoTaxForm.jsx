import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// --- COMPONENTS ---

// 1. LOADING OVERLAY
const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-50 rounded-full"></div>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-800 tracking-tight">Processing...</h3>
      <p className="text-gray-500 text-sm">Securely encrypting and submitting your data</p>
    </div>
  </div>
);

// 2. ERROR MODAL
const ErrorModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-8 duration-300 transform transition-all border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <XCircle className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title || "Action Required"}</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">{message || "Please check your inputs."}</p>
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg"
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
      <label className="block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide">{label}</label>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
        <input readOnly type="text" value={value || ''} placeholder={placeholder || "YYYY-MM-DD"} className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer placeholder-gray-400 shadow-sm" />
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mb-2 p-4 rounded-xl shadow-2xl border border-gray-200 w-72 bottom-full left-0 bg-white text-gray-800">
           <div className="flex justify-between items-center mb-4">
              {view === 'calendar' && <button type="button" onClick={() => changeMonth(-1)}><ChevronLeft size={18}/></button>}
              <div className="flex gap-2">
                 <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className="font-bold hover:bg-gray-100 px-2 rounded">{monthNames[currentDate.getMonth()]}</button>
                 <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className="font-bold hover:bg-gray-100 px-2 rounded">{currentDate.getFullYear()}</button>
              </div>
              {view === 'calendar' && <button type="button" onClick={() => changeMonth(1)}><ChevronRight size={18}/></button>}
           </div>
           {view === 'calendar' && (
             <div className="grid grid-cols-7 gap-1 text-center">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><span key={d} className="text-xs text-gray-400 font-bold">{d}</span>)}
                {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_,i)=><div key={i}/>)}
                {Array.from({length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate()}, (_,i)=>i+1).map(d => (
                   <button key={d} type="button" onClick={() => handleDateClick(d)} className="h-8 w-8 text-sm rounded-full hover:bg-blue-100">{d}</button>
                ))}
             </div>
           )}
           {view === 'month' && <div className="grid grid-cols-3 gap-2">{monthNames.map((m,i)=><button key={m} onClick={()=>{setCurrentDate(new Date(currentDate.getFullYear(),i,1));setView('calendar')}} className="p-2 text-sm hover:bg-gray-100 rounded">{m}</button>)}</div>}
           {view === 'year' && <div ref={yearScrollRef} className="h-48 overflow-y-auto grid grid-cols-3 gap-2">{years.map(y=><button key={y} onClick={()=>{setCurrentDate(new Date(y,currentDate.getMonth(),1));setView('calendar')}} className="p-2 text-sm hover:bg-gray-100 rounded">{y}</button>)}</div>}
        </div>
      )}
    </div>
  );
};

// --- MAIN COLORADO FORM ---
const ColoradoTaxForm = ({ initialData, onSubmit }) => {
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
    { code: "1", label: "Single" },
    { code: "2", label: "Married Filing Jointly" },
    { code: "3", label: "Married Filing Separately" },
    { code: "4", label: "Head of Household" },
    { code: "5", label: "Qualifying Surviving Spouse" }
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
    sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // 1. CAPTURE SIGNATURE
      let sig = formData.signature_image;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
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
          const finalData = { ...formData, signature_image: sig };
          await onSubmit(finalData);
          setIsSubmitting(false);
      } catch (error) {
          console.error("Submission Error:", error);
          setIsSubmitting(false);
          const msg = error.response?.data?.error || error.message || "Something went wrong. Please try again.";
          setErrorState({ isOpen: true, title: "Submission Failed", message: msg });
      }
  };

  // --- STYLE DEFINITIONS ---
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder-gray-400 shadow-sm";
  
  // FIX: Force ring/border on focus by overriding browser defaults
  const selectClass = "w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm appearance-none cursor-pointer pr-10";

  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-3 mb-6 pb-4 border-b border-gray-100";
  const checkboxCardClass = "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/20";

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

      <div className="bg-white px-4 py-2 text-left relative">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Colorado Withholding Certificate</h2>
          <p className="text-gray-500 text-sm mt-1">Form DR 0004</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* 1. PERSONAL INFORMATION */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <h3 className={sectionHeader}><User className="text-blue-600" size={24}/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" /></div>
                <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="initial" maxLength="1" value={formData.initial} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" /></div>
                <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" /></div>
                
                <div className="md:col-span-6 relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX"/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div className="md:col-span-6"><label className={labelClass}>Email (Optional)</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="john@example.com" /></div>

                <div className="md:col-span-6"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street Address" /></div>
                
                <div className="md:col-span-5"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} /></div>
                <div className="md:col-span-3"><label className={labelClass}>State</label><input type="text" name="state" value="CO" readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed text-center`} /></div>
                <div className="md:col-span-4"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} /></div>
            </div>
          </section>

          {/* 2. FILING STATUS & JOBS */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <h3 className={sectionHeader}><FileText className="text-blue-600" size={24}/> Filing Status & Jobs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Filing Status</label>
                    <div className="relative">
                        <select name="filing_status" value={formData.filing_status} onChange={handleChange} className={selectClass}>
                            {filingStatusOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Number of Jobs</label>
                    <input type="number" name="num_jobs" min="1" value={formData.num_jobs} onChange={handleChange} className={inputClass} />
                    <p className="text-xs text-gray-500 mt-2 font-medium ml-1">Total qualifying jobs for this household.</p>
                </div>
            </div>
          </section>

          {/* 3. ALLOWANCE CALCULATION (LINE 2) */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <h3 className={sectionHeader}><Calculator className="text-blue-600" size={24}/> Annual Allowance (Line 2)</h3>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-6">
                
                {/* Worksheet 1 Toggle */}
                <label className={`${checkboxCardClass} ${formData.use_worksheet_1 ? activeCheckboxClass : 'bg-white border-gray-200'}`}>
                    <input 
                        type="checkbox" 
                        name="use_worksheet_1" 
                        checked={formData.use_worksheet_1} 
                        onChange={handleChange} 
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                        <span className="block font-bold text-gray-900">Use Worksheet 1</span>
                        <span className="text-xs text-gray-500 block mt-1">Calculate based on income, deductions, and dependents.</span>
                    </div>
                </label>

                {/* Logic A: Worksheet 1 Active */}
                {formData.use_worksheet_1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-4 border-blue-400 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className={labelClass}>Total Annual Income ($)</label>
                            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span><input type="number" name="annual_income" value={formData.annual_income} onChange={handleChange} className={`${inputClass} pl-8`} /></div>
                        </div>
                        <div>
                            <label className={labelClass}>Federal Deductions ($)</label>
                            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span><input type="number" name="federal_deductions" value={formData.federal_deductions} onChange={handleChange} className={`${inputClass} pl-8`} /></div>
                        </div>
                        <div>
                            <label className={labelClass}>Dependents (Count)</label>
                            <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-blue-100/50 p-2 rounded-lg transition-colors">
                                <input type="checkbox" name="child_tax_credit" checked={formData.child_tax_credit} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded border-gray-300" />
                                <span className="text-sm font-bold text-gray-700">Claim Child Tax Credit?</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Logic B: Standard/Manual (Only if WS1 is OFF) */}
                {!formData.use_worksheet_1 && (
                    <div className="space-y-4 pt-4 border-t border-blue-200/50">
                         <p className="text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1"><Shield size={12}/> Method Selection</p>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Option 1: Standard Table */}
                            <label className={`${checkboxCardClass} ${formData.use_table_1 ? activeCheckboxClass : 'bg-white border-gray-200'}`}>
                                <input 
                                    type="radio" 
                                    name="allowance_method" 
                                    checked={formData.use_table_1} 
                                    onChange={() => setFormData(prev => ({ ...prev, use_table_1: true }))}
                                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300"
                                />
                                <span className="font-bold text-gray-900 ml-2">Use Standard Table</span>
                            </label>

                            {/* Option 2: Manual */}
                            <label className={`${checkboxCardClass} ${!formData.use_table_1 ? activeCheckboxClass : 'bg-white border-gray-200'}`}>
                                <input 
                                    type="radio" 
                                    name="allowance_method" 
                                    checked={!formData.use_table_1} 
                                    onChange={() => setFormData(prev => ({ ...prev, use_table_1: false }))}
                                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300"
                                />
                                <span className="font-bold text-gray-900 ml-2">Enter Manually</span>
                            </label>
                         </div>

                         {!formData.use_table_1 && (
                             <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                                <label className={labelClass}>Manual Allowance Amount ($)</label>
                                <div className="relative max-w-sm"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span><input type="number" name="annual_withholding_allowance" value={formData.annual_withholding_allowance} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" /></div>
                             </div>
                         )}
                    </div>
                )}
            </div>
          </section>

          {/* 4. ADDITIONAL WITHHOLDING (LINE 3) */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <h3 className={sectionHeader}><DollarSign className="text-blue-600" size={24}/> Additional Withholding (Line 3)</h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                 {/* Worksheet 2 Toggle */}
                 <label className={`${checkboxCardClass} ${formData.use_worksheet_2 ? 'border-green-500 ring-1 ring-green-500 bg-green-50/10' : 'bg-white border-gray-200'}`}>
                    <input 
                        type="checkbox" 
                        name="use_worksheet_2" 
                        checked={formData.use_worksheet_2} 
                        onChange={handleChange} 
                        className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                        <span className="block font-bold text-gray-900">Use Worksheet 2</span>
                        <span className="text-xs text-gray-500 block mt-1">For non-wage income (interest, dividends, etc).</span>
                    </div>
                </label>

                {/* Logic A: Worksheet 2 Active */}
                {formData.use_worksheet_2 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-4 border-green-400 animate-in fade-in slide-in-from-top-2">
                         <div>
                            <label className={labelClass}>Non-Business Income ($)</label>
                            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span><input type="number" name="non_business_income" value={formData.non_business_income} onChange={handleChange} className={`${inputClass} pl-8`} /></div>
                        </div>
                        <div>
                            <label className={labelClass}>Other Non-Wage Income ($)</label>
                            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span><input type="number" name="other_non_wage_income" value={formData.other_non_wage_income} onChange={handleChange} className={`${inputClass} pl-8`} /></div>
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
                         <div className="relative max-w-sm"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span><input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" /></div>
                         <p className="text-xs text-gray-500 mt-2 font-medium">Optional extra amount to withhold per paycheck.</p>
                    </div>
                )}
            </div>
          </section>

          {/* 5. SIGNATURE */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <h3 className={sectionHeader}><PenTool className="text-blue-600" size={24}/> Attestation & Signature</h3>
            
            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center mb-3">
                    <label className={labelClass}>Digital Signature <span className="text-red-500">*</span></label>
                    <button type="button" onClick={clearSignature} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"><Eraser size={14}/> Clear Signature</button>
                </div>
                
                <div ref={containerRef} className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-white h-56 w-full relative hover:border-blue-400 transition-colors shadow-inner group cursor-crosshair">
                    <SignatureCanvas 
                        ref={sigCanvasRef}
                        penColor="black"
                        velocityFilterWeight={0.7}
                        canvasProps={{ className: 'sigCanvas w-full h-full' }}
                        onEnd={handleSignatureEnd}
                    />
                    {!formData.signature_image && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 gap-3 group-hover:text-blue-400 transition-colors">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors"><PenTool size={20} className="opacity-50"/></div>
                          <span className="font-medium text-sm">Sign Here</span>
                       </div>
                    )}
                </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-6">
            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                className={`
                    relative overflow-hidden px-10 py-4 rounded-xl font-bold text-lg shadow-xl transform transition-all duration-200 flex items-center gap-3
                    ${isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:-translate-y-1 active:scale-95'}
                `}
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                {isSubmitting ? 'Submitting...' : 'Confirm & Generate PDF'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default ColoradoTaxForm;