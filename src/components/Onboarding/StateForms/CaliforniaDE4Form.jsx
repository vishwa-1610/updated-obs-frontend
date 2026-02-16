import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronLeft, ChevronRight, 
  ChevronDown, Eraser, Save, PenTool, Loader2, XCircle, CheckCircle, Calculator 
} from 'lucide-react';

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
        <input readOnly type="text" value={value || ''} placeholder={placeholder || "YYYY-MM-DD"} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer placeholder-gray-400 shadow-sm" />
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mb-2 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 bg-white w-72 bottom-full left-0 text-gray-800">
           <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              {view === 'calendar' && <button type="button" onClick={() => changeMonth(-1)}><ChevronLeft size={18}/></button>}
              <div className="flex gap-2">
                 <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className="font-bold hover:bg-gray-100 px-2 rounded">{monthNames[currentDate.getMonth()]}</button>
                 <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className="font-bold hover:bg-gray-100 px-2 rounded">{currentDate.getFullYear()}</button>
              </div>
              {view === 'calendar' && <button type="button" onClick={() => changeMonth(1)}><ChevronRight size={18}/></button>}
           </div>
           {view === 'calendar' && (
             <div className="grid grid-cols-7 gap-1 text-center">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><span key={d} className="text-[10px] font-bold text-gray-400 uppercase mb-1">{d}</span>)}
                {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_,i)=><div key={i}/>)}
                {Array.from({length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate()}, (_,i)=>i+1).map(d => (
                   <button key={d} type="button" onClick={() => handleDateClick(d)} className="h-8 w-8 text-sm rounded-lg hover:bg-blue-100 transition-colors">{d}</button>
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

// --- MAIN CALIFORNIA FORM ---
const CaliforniaDE4Form = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWorksheetB, setShowWorksheetB] = useState(false); // ✅ Added Toggle State
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // DATA STATE
  const [localData, setLocalData] = useState({
    onboarding_id: '',
    first_name: '', middle_initial: '', last_name: '', ssn: '',
    address: '', city: '', state: 'CA', zipcode: '',
    
    // Page 1 Fields
    filing_status: '1', 
    additional_withholding: '',
    exempt: false,
    military_spouse_exempt: false,

    // Worksheet A (Regular Allowances)
    allow_self: 1, allow_spouse: 0, allow_blind_self: 0, allow_blind_spouse: 0, allow_dependents: 0,
    
    // Worksheet B (Deductions)
    itemized_deductions: '',
    adjustments_income: '',
    non_wage_income: '',

    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // Initialize Data
  useEffect(() => {
    if (initialData && !dataLoadedRef.current) {
        setLocalData(prev => ({
            ...prev,
            ...initialData,
            state: 'CA',
            zipcode: (initialData.zipcode || '').slice(0, 5),
            allow_self: 1, 
        }));
        dataLoadedRef.current = true;
    }
  }, [initialData]);

  // Canvas Resize Logic
  useEffect(() => {
    const resizeCanvas = () => {
        if (containerRef.current && sigCanvasRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const rect = containerRef.current.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                const saved = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
                canvas.width = rect.width;
                canvas.height = rect.height;
                if (saved) sigCanvasRef.current.fromDataURL(saved);
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
        setLocalData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 5) }));
        return;
    }
    setLocalData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        const sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
        setLocalData(prev => ({ ...prev, signature_image: sig }));
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setLocalData(prev => ({ ...prev, signature_image: null }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      let sig = localData.signature_image;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      if (!sig) {
          setErrorState({ isOpen: true, title: "Missing Signature", message: "Please sign the form in the 'Digital Signature' box before submitting." });
          return;
      }

      if (!localData.first_name || !localData.last_name || !localData.ssn) {
          setErrorState({ isOpen: true, title: "Missing Information", message: "Please ensure your First Name, Last Name, and SSN are filled out." });
          return;
      }

      setIsSubmitting(true);

      try {
          const cleanNumber = (val) => (val === '' || val === null || isNaN(val)) ? 0 : val;

          const finalData = { 
              ...localData, 
              itemized_deductions: cleanNumber(localData.itemized_deductions),
              adjustments_income: cleanNumber(localData.adjustments_income),
              non_wage_income: cleanNumber(localData.non_wage_income),
              additional_withholding: cleanNumber(localData.additional_withholding),
              allow_self: cleanNumber(localData.allow_self),
              allow_spouse: cleanNumber(localData.allow_spouse),
              allow_blind_self: cleanNumber(localData.allow_blind_self),
              allow_blind_spouse: cleanNumber(localData.allow_blind_spouse),
              allow_dependents: cleanNumber(localData.allow_dependents),
              signature_image: sig 
          };

          await onSubmit(finalData);
          setIsSubmitting(false);

      } catch (error) {
          console.error("Submission Error:", error);
          setIsSubmitting(false);
          let msg = "Something went wrong. Please try again.";
          if (error.response?.data) {
              if (typeof error.response.data === 'string') {
                  msg = error.response.data;
              } else if (error.response.data.error) {
                  msg = error.response.data.error;
              }
          }
          setErrorState({ isOpen: true, title: "Submission Failed", message: msg });
      }
  };

  // --- CALCULATIONS ---
  const worksheetATotal = parseInt(localData.allow_self || 0) + parseInt(localData.allow_spouse || 0) + parseInt(localData.allow_blind_self || 0) + parseInt(localData.allow_blind_spouse || 0) + parseInt(localData.allow_dependents || 0);
  const standardDeduction = 5540; 
  const itemized = parseInt(localData.itemized_deductions || 0);
  const adjustments = parseInt(localData.adjustments_income || 0);
  const nonWage = parseInt(localData.non_wage_income || 0);
  
  const line3 = Math.max(itemized - standardDeduction, 0);
  const line5 = line3 + adjustments;
  const line7 = Math.max(line5 - nonWage, 0);
  const worksheetBAllowances = Math.floor(line7 / 1000);
  
  // ✅ GRAND TOTAL
  const totalAllowances = worksheetATotal + worksheetBAllowances;

  // --- STYLES ---
  const sectionClass = "bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-shadow duration-300";
  const headerClass = "text-xl font-bold text-gray-900 flex items-center gap-3 mb-6 pb-4 border-b border-gray-100";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder-gray-400 shadow-sm";
  const checkboxCardClass = "group relative flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/10";

  return (
    <>
      {isSubmitting && <LoadingOverlay />}
      <ErrorModal isOpen={errorState.isOpen} title={errorState.title} message={errorState.message} onClose={() => setErrorState({ isOpen: false, title: '', message: '' })} />

      <div className="bg-white px-4 py-2 text-left max-w-5xl mx-auto relative">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">California DE-4</h2>
          <p className="text-gray-500 font-medium mt-1">Employee's Withholding Allowance Certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* PERSONAL INFO */}
          <section className={sectionClass}>
            <h3 className={headerClass}><User className="text-blue-600" size={24}/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>First Name</label><input type="text" name="first_name" value={localData.first_name} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={localData.last_name} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={localData.ssn} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="XXX-XX-XXXX"/><Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={localData.zipcode} onChange={handleChange} className={inputClass} placeholder="00000" /></div>
                <div className="md:col-span-2"><label className={labelClass}>Address</label><input type="text" name="address" value={localData.address} onChange={handleChange} className={inputClass} /></div>
                <div className="md:col-span-2 grid grid-cols-3 gap-6">
                    <div className="col-span-2"><label className={labelClass}>City</label><input type="text" name="city" value={localData.city} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>State</label><input type="text" value="CA" readOnly className={`${inputClass} bg-gray-100 text-gray-500 text-center font-bold`} /></div>
                </div>
            </div>
          </section>

          {/* FILING STATUS */}
          <section className={sectionClass}>
            <h3 className={headerClass}><DollarSign className="text-blue-600" size={24}/> Filing Status</h3>
            <div className="grid grid-cols-1 gap-4">
                {[
                  {v: '1', l: 'Single or Married (with two or more incomes)'},
                  {v: '2', l: 'Married (one income)'},
                  {v: '3', l: 'Head of Household'}
                ].map(opt => (
                  <label key={opt.v} className={`${checkboxCardClass} ${localData.filing_status === opt.v ? activeCheckboxClass : ''}`}>
                    <input type="radio" name="filing_status" value={opt.v} checked={localData.filing_status === opt.v} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="font-bold text-gray-900">{opt.l}</span>
                  </label>
                ))}
            </div>
          </section>

          {/* WORKSHEET A */}
          <section className={sectionClass}>
            <h3 className={headerClass}><Calculator className="text-blue-600" size={24}/> Worksheet A: Regular Allowances</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div><label className={labelClass}>Allowance for Yourself (0 or 1)</label><input type="number" name="allow_self" value={localData.allow_self} onChange={handleChange} className={inputClass} min="0" max="1" /></div>
                <div><label className={labelClass}>Allowance for Spouse (0 or 1)</label><input type="number" name="allow_spouse" value={localData.allow_spouse} onChange={handleChange} className={inputClass} min="0" max="1" /></div>
                <div><label className={labelClass}>Blind Allowance (Self)</label><input type="number" name="allow_blind_self" value={localData.allow_blind_self} onChange={handleChange} className={inputClass} min="0" max="1" /></div>
                <div><label className={labelClass}>Blind Allowance (Spouse)</label><input type="number" name="allow_blind_spouse" value={localData.allow_blind_spouse} onChange={handleChange} className={inputClass} min="0" max="1" /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Allowance for Dependents</label><input type="number" name="allow_dependents" value={localData.allow_dependents} onChange={handleChange} className={inputClass} min="0" /></div>
            </div>
            
            {/* ✅ UPDATED SUMMARY BOX (A + B) */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <span className="block text-xs font-bold text-gray-500 uppercase">Worksheet A Count</span>
                    <span className="text-xl font-bold text-gray-700">{worksheetATotal}</span>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-100/50 transform -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <span className="block text-xs font-bold text-blue-600 uppercase relative z-10">Total Allowances (Line 1c)</span>
                    <span className="text-2xl font-extrabold text-blue-700 relative z-10">{totalAllowances}</span>
                </div>
            </div>
          </section>

          {/* ✅ WORKSHEET B (OPTIONAL) - ADDED HERE */}
          <section className={sectionClass}>
            <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => setShowWorksheetB(!showWorksheetB)}
            >
                <h3 className={headerClass.replace('mb-6 pb-4 border-b border-gray-100', 'mb-0 pb-0 border-0')}>
                    <Calculator className="text-blue-600" size={24}/> 
                    Worksheet B: Estimated Deductions (Optional)
                </h3>
                <ChevronDown size={20} className={`transform transition-transform ${showWorksheetB ? 'rotate-180' : ''}`}/>
            </div>

            {showWorksheetB && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        Complete this ONLY if you expect to itemize deductions on your California income tax return.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>1. Estimated Itemized Deductions ($)</label>
                            <input type="number" name="itemized_deductions" value={localData.itemized_deductions} onChange={handleChange} className={inputClass} placeholder="0" min="0"/>
                        </div>
                        <div>
                            <label className={labelClass}>2. Adjustments to Income (Alimony, IRA, etc) ($)</label>
                            <input type="number" name="adjustments_income" value={localData.adjustments_income} onChange={handleChange} className={inputClass} placeholder="0" min="0"/>
                        </div>
                        <div>
                            <label className={labelClass}>3. Non-Wage Income (Dividends, Interest) ($)</label>
                            <input type="number" name="non_wage_income" value={localData.non_wage_income} onChange={handleChange} className={inputClass} placeholder="0" min="0"/>
                        </div>

                        {/* RESULT BOX */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
                            <span className="font-bold text-gray-600 text-sm">Additional Allowances Calculated:</span>
                            <span className="text-xl font-bold text-blue-600">{worksheetBAllowances}</span>
                        </div>
                    </div>
                </div>
            )}
          </section>

          {/* WITHHOLDING ADJUSTMENTS */}
          <section className={sectionClass}>
            <h3 className={headerClass}><Shield className="text-blue-600" size={24}/> Adjustments</h3>
            <div className="space-y-6">
                <div>
                    <label className={labelClass}>Additional Amount to Withhold ($)</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input type="number" name="additional_withholding" value={localData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 grid grid-cols-1 gap-4">
                    <label className={`${checkboxCardClass} ${localData.exempt ? 'border-red-500 bg-red-50/10 ring-1 ring-red-500' : ''}`}>
                        <input type="checkbox" name="exempt" checked={localData.exempt} onChange={handleChange} className="mt-1 w-5 h-5 text-red-600 rounded" />
                        <div>
                            <span className="block font-bold text-red-700">Claim Exemption from Withholding</span>
                            <span className="text-xs text-red-600">I certify I meet the conditions for exemption (no tax liability).</span>
                        </div>
                    </label>
                    
                    <label className={`${checkboxCardClass} ${localData.military_spouse_exempt ? activeCheckboxClass : ''}`}>
                        <input type="checkbox" name="military_spouse_exempt" checked={localData.military_spouse_exempt} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                        <div>
                            <span className="block font-bold text-gray-900">Military Spouse Exemption</span>
                            <span className="text-xs text-gray-500">I certify I am exempt under the Military Spouse Residency Relief Act.</span>
                        </div>
                    </label>
                </div>
            </div>
          </section>

          {/* SIGNATURE */}
          <section className={sectionClass}>
            <h3 className={headerClass}><PenTool className="text-blue-600" size={24}/> Declaration & Signature</h3>
            
            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={localData.confirmation_date} onChange={handleChange} />
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center mb-3">
                    <label className={labelClass}>Digital Signature <span className="text-red-500">*</span></label>
                    <button type="button" onClick={clearSignature} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"><Eraser size={14}/> Clear</button>
                </div>
                
                <div ref={containerRef} className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-white h-56 w-full relative hover:border-blue-400 transition-colors shadow-inner group cursor-crosshair">
                    <SignatureCanvas 
                        ref={sigCanvasRef}
                        penColor="black"
                        velocityFilterWeight={0.7}
                        canvasProps={{ className: 'sigCanvas w-full h-full' }}
                        onEnd={handleSignatureEnd}
                    />
                    {!localData.signature_image && (
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

export default CaliforniaDE4Form;