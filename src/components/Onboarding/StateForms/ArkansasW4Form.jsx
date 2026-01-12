import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, FileText, Calculator, CheckCircle, Loader2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

// --- MAIN FORM ---
const ArkansasTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // DATA STATE
  const [formData, setFormData] = useState({
    first_name: '', middle_initial: '', last_name: '', ssn: '', 
    address: '', city: '', state: 'AR', zipcode: '',
    filing_status: '1', 
    line1a: false, line1b: false, line1c: false, 
    dependents: 0,
    additional_withholding: '',
    low_income: false,
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingStatuses = [
    { code: '1', label: 'Single' },
    { code: '2', label: 'Married Filing Jointly' },
    { code: '3', label: 'Head of Household' }
  ];

  // Initialize
  useEffect(() => {
    if (initialData && !dataLoadedRef.current) {
        setFormData(prev => ({
            ...prev,
            ...initialData,
            state: 'AR',
            zipcode: (initialData.zipcode || '').slice(0, 5)
        }));
        dataLoadedRef.current = true;
    }
  }, [initialData]);

  // Canvas Resize
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
        const truncated = value.replace(/\D/g, '').slice(0, 5);
        setFormData(prev => ({ ...prev, [name]: truncated }));
        return;
    }
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // --- SIGNATURE HANDLING (Standard getCanvas) ---
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        const sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
        setFormData(prev => ({ ...prev, signature_image: sig }));
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  // --- SUBMIT HANDLER (Strict Validation) ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // 1. Capture Signature
      let sig = formData.signature_image;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      // 2. Validate
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

      // 3. Submit
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

  // Calc Total
  const calculateTotal = () => {
      let total = 0;
      if (formData.line1a) total += 1;
      if (formData.line1b) total += 2; 
      if (formData.line1c) total += 2;
      total += parseInt(formData.dependents || 0);
      return total;
  };
  const totalExemptions = calculateTotal();

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";
  const checkboxCardClass = "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 bg-white border-gray-200";
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Arkansas Employee Withholding</h2>
          <p className="text-gray-500 text-sm mt-1">Form AR4EC</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* 1. PERSONAL INFORMATION */}
          <section>
            <h3 className={sectionHeader}><User className="text-blue-600" size={22} /> Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className={inputClass} placeholder="First Name" /></div>
                <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" maxLength="1" value={formData.middle_initial || ''} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" /></div>
                <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className={inputClass} placeholder="Last Name" /></div>
                
                <div className="md:col-span-6 relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn || ''} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX"/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div className="md:col-span-6"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode || ''} onChange={handleChange} className={inputClass} /></div>

                <div className="md:col-span-8"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={inputClass} placeholder="Street Address" /></div>
                <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} className={inputClass} /></div>
            </div>
          </section>

          {/* 2. FILING STATUS */}
          <section>
            <h3 className={sectionHeader}><FileText className="text-blue-600" size={22} /> Filing Status</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    {filingStatuses.map((status) => (
                        <label key={status.code} className={`${checkboxCardClass} ${formData.filing_status === status.code ? activeCheckboxClass : ''}`}>
                            <input type="radio" name="filing_status" value={status.code} checked={formData.filing_status === status.code} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600" />
                            <span className="text-gray-900 font-medium">{status.label}</span>
                        </label>
                    ))}
                </div>
            </div>
          </section>

          {/* 3. EXEMPTIONS */}
          <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600" size={22} /> Exemptions</h3>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-4">
                
                <label className={`${checkboxCardClass} ${formData.line1a ? activeCheckboxClass : ''}`}>
                    <input type="checkbox" name="line1a" checked={formData.line1a} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                    <div>
                        <span className="block font-bold text-gray-900">Line 1A: Yourself (Select One)</span>
                        <span className="text-xs text-gray-500">Value: 1 Exemption</span>
                    </div>
                </label>

                <label className={`${checkboxCardClass} ${formData.line1b ? activeCheckboxClass : ''}`}>
                    <input type="checkbox" name="line1b" checked={formData.line1b} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                    <div>
                        <span className="block font-bold text-gray-900">Line 1B: Spouse (Select Two)</span>
                        <span className="text-xs text-gray-500">Value: 2 Exemptions</span>
                    </div>
                </label>

                <label className={`${checkboxCardClass} ${formData.line1c ? activeCheckboxClass : ''}`}>
                    <input type="checkbox" name="line1c" checked={formData.line1c} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                    <div>
                        <span className="block font-bold text-gray-900">Line 1C: Head of Household (Select Two)</span>
                        <span className="text-xs text-gray-500">Value: 2 Exemptions</span>
                    </div>
                </label>

                {/* Line 2 Dependents */}
                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                      <div className="flex-1 pr-4">
                        <label className="text-sm font-semibold text-gray-800">Line 2: Number of Dependents</label>
                      </div>
                      <input type="number" name="dependents" value={formData.dependents || ''} onChange={handleChange} min="0" className="w-20 px-3 py-2 border rounded text-center" />
                </div>

                {/* Total Line 3 */}
                <div className="flex items-center justify-between p-4 bg-white rounded border border-blue-200 mt-4">
                    <div className="flex items-center gap-2">
                          <CheckCircle className="text-blue-600" size={20}/>
                          <label className="font-bold text-blue-900">Line 3: Total Exemptions</label>
                    </div>
                    <span className="font-bold text-xl text-blue-900 bg-white px-4 py-1 rounded border border-blue-200">{totalExemptions}</span>
                </div>
            </div>
          </section>

          {/* 4. WITHHOLDING & LOW INCOME */}
          <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600" size={22} /> Additional & Low Income</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                
                {/* Line 4 */}
                <div>
                    <label className={labelClass}>Line 4: Additional Withholding ($)</label>
                    <div className="relative max-w-sm"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="additional_withholding" value={formData.additional_withholding || ''} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" /></div>
                </div>

                {/* Low Income */}
                <div className="border-t border-gray-200 pt-6">
                    <label className={`${checkboxCardClass} ${formData.low_income ? 'border-green-500 ring-1 ring-green-500 bg-green-50/20' : ''}`}>
                        <input type="checkbox" name="low_income" checked={formData.low_income} onChange={handleChange} className="w-5 h-5 text-green-600 rounded" />
                        <div>
                             <span className="block font-bold text-gray-900">Line 5: Low Income Tax Rate</span>
                             <span className="text-xs text-gray-500">I qualify for the Low Income Tax Rate.</span>
                        </div>
                    </label>
                </div>

            </div>
          </section>

          {/* 5. SIGNATURE */}
          <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <p className="text-sm text-gray-700 mb-6 font-medium">
                I certify that the number of exemptions and dependents claimed on this certificate does not exceed the number to which I am entitled.
            </p>

            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                    <label className={labelClass}>Digital Signature</label>
                    <button type="button" onClick={clearSignature} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"><Eraser size={14}/> Clear Signature</button>
                </div>
                
                <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white hover:border-blue-500 transition-all h-56 w-full relative cursor-crosshair">
                    <SignatureCanvas 
                        ref={sigCanvasRef}
                        penColor="black"
                        velocityFilterWeight={0.7}
                        canvasProps={{ className: 'sigCanvas w-full h-full' }}
                        onEnd={handleSignatureEnd}
                    />
                    {!formData.signature_image && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 gap-2">
                          <PenTool size={24} className="opacity-50" />
                          <span className="font-medium">Sign Here</span>
                       </div>
                    )}
                </div>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="flex justify-end pt-8 pb-4 border-t border-gray-100 mt-6">
            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                className={`px-10 py-3.5 font-bold text-lg rounded-xl shadow-lg transform transition-all flex items-center gap-2 ${
                    isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5'
                }`}
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

export default ArkansasTaxForm;