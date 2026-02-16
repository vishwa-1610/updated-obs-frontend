import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronLeft, ChevronRight, 
  ChevronDown, Eraser, Save, PenTool, Calculator, Loader2, XCircle 
} from 'lucide-react';

// --- 1. LOADING OVERLAY ---
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

// --- 2. ERROR MODAL ---
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

// --- 3. CUSTOM DATE PICKER ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder }) => {
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
        <input readOnly type="text" value={value || ''} placeholder={placeholder || "YYYY-MM-DD"} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none" />
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

// --- MAIN DELAWARE FORM ---
const DelawareTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  const [localData, setLocalData] = useState({
    first_name: '', middle_initial: '', last_name: '', ssn: '',
    address: '', city: '', state: 'DE', zipcode: '',
    marital_status: 'single',
    dependents: 0,
    additional_withholding: '',
    self_60_or_older: false, spouse_60_or_older: false,
    is_self_65: false, is_self_blind: false,
    is_spouse_65: false, is_spouse_blind: false,
    child_credit: 0,
    itemized_deductions: '', adjustments_income: '', non_wage_income: '',
    use_non_resident: false,
    nr_self: 1, nr_spouse: 0, nr_dependents: 0,
    nr_wages: '', nr_deductions: '', nr_non_wage: '',
    nr_tax_liability: '', nr_pay_periods: 26,
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // INITIALIZE
  useEffect(() => {
    if (initialData && !dataLoadedRef.current) {
        setLocalData(prev => ({
            ...prev,
            ...initialData,
            state: 'DE',
            zipcode: (initialData.zipcode || '').slice(0, 5),
            first_name: initialData.first_name || '',
            last_name: initialData.last_name || '',
            middle_initial: initialData.initial || '',
            ssn: initialData.ssn || '',
            address: initialData.address || '',
            city: initialData.city || '',
        }));
        dataLoadedRef.current = true;
    }
  }, [initialData]);

  // CANVAS RESIZE
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
        const truncated = value.replace(/\D/g, '').slice(0, 5);
        setLocalData(prev => ({ ...prev, [name]: truncated }));
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

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      
      let sig = localData.signature_image;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      // VALIDATION
      if (!sig) {
          setErrorState({ isOpen: true, title: "Missing Signature", message: "Please sign the form in the 'Digital Signature' box." });
          return;
      }

      if (!localData.first_name || !localData.last_name || !localData.ssn) {
          setErrorState({ isOpen: true, title: "Missing Information", message: "Please ensure First Name, Last Name, and SSN are filled." });
          return;
      }

      setIsSubmitting(true);

      try {
          // --- DATA SANITIZATION (Critical Fix) ---
          // Ensure all numeric fields send '0' instead of '' to prevent backend crashes.
          const cleanNumber = (val) => (val === '' || val === null || isNaN(val)) ? 0 : val;

          const finalData = { 
              ...localData, 
              signature_image: sig,
              dependents: cleanNumber(localData.dependents),
              additional_withholding: cleanNumber(localData.additional_withholding),
              child_credit: cleanNumber(localData.child_credit),
              itemized_deductions: cleanNumber(localData.itemized_deductions),
              adjustments_income: cleanNumber(localData.adjustments_income),
              non_wage_income: cleanNumber(localData.non_wage_income),
              nr_wages: cleanNumber(localData.nr_wages),
              nr_deductions: cleanNumber(localData.nr_deductions),
              nr_non_wage: cleanNumber(localData.nr_non_wage),
              nr_tax_liability: cleanNumber(localData.nr_tax_liability),
              nr_pay_periods: cleanNumber(localData.nr_pay_periods) || 26,
              nr_self: cleanNumber(localData.nr_self),
              nr_spouse: cleanNumber(localData.nr_spouse),
              nr_dependents: cleanNumber(localData.nr_dependents),
          };

          await onSubmit(finalData);
          setIsSubmitting(false);
      } catch (error) {
          console.error("Submission Error:", error);
          setIsSubmitting(false);
          let msg = "Something went wrong. Please try again.";
          if (error.response?.data) {
              if (typeof error.response.data === 'string') msg = error.response.data;
              else if (error.response.data.error) msg = error.response.data.error;
          }
          setErrorState({ isOpen: true, title: "Submission Failed", message: msg });
      }
  };

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all focus:border-transparent";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2";
  const checkboxClass = "flex items-center gap-3 cursor-pointer p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-gray-200 select-none";
  const activeClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

  return (
    <>
      {isSubmitting && <LoadingOverlay />}
      <ErrorModal isOpen={errorState.isOpen} title={errorState.title} message={errorState.message} onClose={() => setErrorState({ isOpen: false, title: '', message: '' })} />

      <div className="bg-white px-6 py-4 max-w-5xl mx-auto relative">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Delaware DE-W4</h2>
          <p className="text-gray-500">Employee's Withholding Allowance Certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* 1. PERSONAL INFO */}
          <section className="p-6 border border-gray-100 rounded-xl shadow-sm">
            <h3 className={sectionHeader}><User className="text-blue-600" size={24}/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={localData.first_name || ''} onChange={handleChange} className={inputClass} required/></div>
              <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" value={localData.middle_initial || ''} onChange={handleChange} className={inputClass}/></div>
              <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={localData.last_name || ''} onChange={handleChange} className={inputClass} required/></div>
              <div className="md:col-span-6 relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={localData.ssn || ''} onChange={handleChange} className={`${inputClass} pl-10`} required/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
              <div className="md:col-span-6"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={localData.zipcode || ''} onChange={handleChange} className={inputClass} required/></div>
              <div className="md:col-span-8"><label className={labelClass}>Address</label><input type="text" name="address" value={localData.address || ''} onChange={handleChange} className={inputClass} required/></div>
              <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={localData.city || ''} onChange={handleChange} className={inputClass} required/></div>
              <div className="md:col-span-4"><label className={labelClass}>State</label><input type="text" value="DE" readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed font-bold text-gray-500`}/></div>
            </div>
          </section>

          {/* 2. STATUS & ALLOWANCES */}
          <section className="p-6 border border-gray-100 rounded-xl shadow-sm">
            <h3 className={sectionHeader}><Shield className="text-blue-600" size={24}/> Status & Allowances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Marital Status</label>
                <div className="flex gap-4 mt-2">
                  <label className={`flex-1 ${checkboxClass} ${localData.marital_status === 'single' ? activeClass : ''}`}>
                      <input type="radio" name="marital_status" value="single" checked={localData.marital_status === 'single'} onChange={handleChange} className="w-5 h-5 text-blue-600"/> <span className="font-medium">Single</span>
                  </label>
                  <label className={`flex-1 ${checkboxClass} ${localData.marital_status === 'married' ? activeClass : ''}`}>
                      <input type="radio" name="marital_status" value="married" checked={localData.marital_status === 'married'} onChange={handleChange} className="w-5 h-5 text-blue-600"/> <span className="font-medium">Married</span>
                  </label>
                </div>
              </div>
              <div><label className={labelClass}>Number of Dependents</label><input type="number" name="dependents" value={localData.dependents} onChange={handleChange} className={inputClass} min="0"/></div>
              <div><label className={labelClass}>Additional Withholding ($)</label><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="additional_withholding" value={localData.additional_withholding} onChange={handleChange} step="0.01" className={`${inputClass} pl-8`} placeholder="0.00"/></div></div>
            </div>
          </section>

          {/* 3. RESIDENT WORKSHEET */}
          <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-900"><Calculator className="text-blue-600"/> Resident Allowances Worksheet</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className={`${checkboxClass} ${localData.self_60_or_older ? activeClass : 'bg-white'}`}><input type="checkbox" name="self_60_or_older" checked={localData.self_60_or_older} onChange={handleChange} className="w-4 h-4"/> Self 60+</label>
              <label className={`${checkboxClass} ${localData.spouse_60_or_older ? activeClass : 'bg-white'}`}><input type="checkbox" name="spouse_60_or_older" checked={localData.spouse_60_or_older} onChange={handleChange} className="w-4 h-4"/> Spouse 60+</label>
              <label className={`${checkboxClass} ${localData.is_self_65 ? activeClass : 'bg-white'}`}><input type="checkbox" name="is_self_65" checked={localData.is_self_65} onChange={handleChange} className="w-4 h-4"/> Self 65+</label>
              <label className={`${checkboxClass} ${localData.is_self_blind ? activeClass : 'bg-white'}`}><input type="checkbox" name="is_self_blind" checked={localData.is_self_blind} onChange={handleChange} className="w-4 h-4"/> Self Blind</label>
              <label className={`${checkboxClass} ${localData.is_spouse_65 ? activeClass : 'bg-white'}`}><input type="checkbox" name="is_spouse_65" checked={localData.is_spouse_65} onChange={handleChange} className="w-4 h-4"/> Spouse 65+</label>
              <label className={`${checkboxClass} ${localData.is_spouse_blind ? activeClass : 'bg-white'}`}><input type="checkbox" name="is_spouse_blind" checked={localData.is_spouse_blind} onChange={handleChange} className="w-4 h-4"/> Spouse Blind</label>
              <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1">Child Credit (Number of children)</label><input type="number" name="child_credit" value={localData.child_credit} onChange={handleChange} min="0" max="2" className={`${inputClass} bg-white`}/></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-blue-200">
              <div><label className={labelClass}>Itemized Deductions ($)</label><input type="number" name="itemized_deductions" value={localData.itemized_deductions} onChange={handleChange} className={`${inputClass} bg-white`} placeholder="0.00"/></div>
              <div><label className={labelClass}>Adjustments to Income ($)</label><input type="number" name="adjustments_income" value={localData.adjustments_income} onChange={handleChange} className={`${inputClass} bg-white`} placeholder="0.00"/></div>
              <div><label className={labelClass}>Non-Wage Income ($)</label><input type="number" name="non_wage_income" value={localData.non_wage_income} onChange={handleChange} className={`${inputClass} bg-white`} placeholder="0.00"/></div>
            </div>
          </section>

          {/* 4. NON-RESIDENT WORKSHEET */}
          <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <label className="flex items-center gap-3 mb-6 text-lg font-bold cursor-pointer select-none">
              <input type="checkbox" name="use_non_resident" checked={localData.use_non_resident} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
              <span>Non-Resident Worksheet (Optional)</span>
            </label>
            
            {localData.use_non_resident && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 border-t border-gray-200 pt-4">
                <div><label className={labelClass}>Wages from DE Sources</label><input type="number" name="nr_wages" value={localData.nr_wages} onChange={handleChange} className={`${inputClass} bg-white`}/></div>
                <div><label className={labelClass}>Non-Wage Income</label><input type="number" name="nr_non_wage" value={localData.nr_non_wage} onChange={handleChange} className={`${inputClass} bg-white`}/></div>
                <div><label className={labelClass}>Deductions</label><input type="number" name="nr_deductions" value={localData.nr_deductions} onChange={handleChange} className={`${inputClass} bg-white`}/></div>
                <div><label className={labelClass}>Gross Tax Liability</label><input type="number" name="nr_tax_liability" value={localData.nr_tax_liability} onChange={handleChange} className={`${inputClass} bg-white`}/></div>
                <div><label className={labelClass}>Pay Periods</label><input type="number" name="nr_pay_periods" value={localData.nr_pay_periods} onChange={handleChange} className={`${inputClass} bg-white`} placeholder="26"/></div>
                <div><label className={labelClass}>Self Exemptions</label><input type="number" name="nr_self" value={localData.nr_self} onChange={handleChange} className={`${inputClass} bg-white`}/></div>
                <div><label className={labelClass}>Spouse Exemptions</label><input type="number" name="nr_spouse" value={localData.nr_spouse} onChange={handleChange} className={`${inputClass} bg-white`}/></div>
                <div><label className={labelClass}>Dependent Exemptions</label><input type="number" name="nr_dependents" value={localData.nr_dependents} onChange={handleChange} className={`${inputClass} bg-white`}/></div>
              </div>
            )}
          </section>

          {/* 5. SIGNATURE */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><PenTool className="text-blue-600"/> Signature</h3>
            <div className="mb-6 max-w-xs">
              <CustomDatePicker label="Date" name="confirmation_date" value={localData.confirmation_date} onChange={handleChange}/>
            </div>
            <div className="flex justify-between mb-2">
              <label className="font-bold text-gray-700">Digital Signature <span className="text-red-600">*</span></label>
              <button type="button" onClick={clearSignature} className="text-red-600 flex items-center gap-1 text-sm font-bold border border-red-200 px-3 py-1 rounded hover:bg-red-50"><Eraser size={14}/> Clear</button>
            </div>
            <div ref={containerRef} className="border-2 border-dashed border-gray-300 bg-white h-48 rounded-xl relative cursor-crosshair hover:border-blue-400 transition-colors">
              <SignatureCanvas ref={sigCanvasRef} penColor="black" velocityFilterWeight={0.7} canvasProps={{className: 'w-full h-full'}} onEnd={handleSignatureEnd} />
              {!localData.signature_image && <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none gap-2"><PenTool size={24}/><span className="font-medium">Sign Here</span></div>}
            </div>
          </section>

          {/* SUBMIT */}
          <div className="flex justify-end pt-6">
            <button type="submit" disabled={isSubmitting} className={`px-10 py-3.5 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5'}`}>
              {isSubmitting ? <Loader2 className="animate-spin" size={22}/> : <Save size={22}/>}
              {isSubmitting ? 'Submitting...' : 'Submit DE-W4'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DelawareTaxForm;