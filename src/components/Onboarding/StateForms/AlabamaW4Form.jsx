import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, Loader2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
const AlabamaW4Form = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef({}); 
  const containerRef = useRef(null);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // DATA STATE
  const [localData, setLocalData] = useState({
    onboarding_id: '', first_name: '', last_name: '', ssn: '',
    address: '', city: '', state: 'AL', zipcode: '',
    status_letter: 'S', dependents: 0, additional_withholding: 0,
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  useEffect(() => {
    if (initialData) {
        setLocalData(prev => ({
            ...prev,
            ...initialData,
            state: 'AL', // Force AL
            zipcode: (initialData.zipcode || '').slice(0, 5)
        }));
    }
  }, [initialData]);

  // CANVAS RESIZE
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
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  // --- SIGNATURE HANDLER (Using standard getCanvas) ---
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

  // --- SUBMIT HANDLER (Strict Validation Before API) ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // 1. CAPTURE & CHECK SIGNATURE
      // We grab from canvas directly to ensure it's not stale
      let sigBase64 = null;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sigBase64 = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      // 2. STRICT VALIDATION: If no signature, ERROR MODAL NOW.
      if (!sigBase64) {
          setErrorState({ 
              isOpen: true, 
              title: "Missing Signature",
              message: "Please sign the form in the 'Digital Signature' box before submitting." 
          });
          return; // <--- STOPS EXECUTION HERE. NO API CALL.
      }

      // 3. CHECK REQUIRED FIELDS
      const required = ['first_name', 'last_name', 'ssn', 'address', 'city', 'zipcode'];
      const missing = required.filter(f => !localData[f]);
      
      if (missing.length > 0) {
          setErrorState({
              isOpen: true,
              title: "Missing Fields",
              message: "Please ensure all personal information fields are filled out."
          });
          return; // <--- STOPS EXECUTION HERE.
      }

      // 4. START SUBMISSION (Only reaches here if validation passes)
      setIsSubmitting(true);

      try {
          // Prepare safe payload (truncate zip to 5 chars to prevent backend error)
          const safeZip = (localData.zipcode || '').slice(0, 5);
          const finalData = { ...localData, zipcode: safeZip, signature_image: sigBase64 };

          await onSubmit(finalData);
          
          setIsSubmitting(false);

      } catch (error) {
          console.error("Submission Error:", error);
          setIsSubmitting(false);
          const msg = error.response?.data?.error || error.message || "Something went wrong. Please try again.";
          setErrorState({ isOpen: true, title: "Submission Failed", message: msg });
      }
  };

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";

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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Onboarding Filling for Alabama</h2>
          <p className="text-gray-500 text-sm mt-1">State Tax Withholding Certificate (A-4)</p>
        </div>

        <div className="space-y-12">
          
          {/* Personal Info */}
          <section>
            <h3 className={sectionHeader}><User className="text-blue-600" size={22} /> Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>First Name</label><input type="text" name="first_name" value={localData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" /></div>
                <div><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={localData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" /></div>
                <div className="relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" maxLength="9" value={localData.ssn} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX"/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div><label className={labelClass}>Address</label><input type="text" name="address" value={localData.address} onChange={handleChange} className={inputClass} placeholder="Street Address" /></div>
                <div className="grid grid-cols-6 gap-4 md:col-span-2">
                    <div className="col-span-3"><label className={labelClass}>City</label><input type="text" name="city" value={localData.city} onChange={handleChange} className={inputClass} /></div>
                    <div className="col-span-1"><label className={labelClass}>State</label><input type="text" name="state" value="AL" readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed text-center`} /></div>
                    <div className="col-span-2"><label className={labelClass}>Zip</label><input type="text" name="zipcode" value={localData.zipcode} onChange={handleChange} className={inputClass} /></div>
                </div>
            </div>
          </section>

          {/* Tax Election */}
          <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600" size={22} /> Withholding Election</h3>
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-sm font-semibold text-gray-700 uppercase tracking-wide">Select Filing Status</div>
                    <div className="divide-y divide-gray-100">
                        {[{v:'0',t:'0 - Zero Personal Exemptions'},{v:'S',t:'S - Single'},{v:'MS',t:'MS - Married Filing Separately'},{v:'M',t:'M - Married Filing Jointly'},{v:'H',t:'H - Head of Family'}].map((o)=>(
                            <label key={o.v} className={`flex items-start p-5 cursor-pointer hover:bg-blue-50/50 ${localData.status_letter===o.v?'bg-blue-50/80':''}`}>
                                <input type="radio" name="status_letter" value={o.v} checked={localData.status_letter===o.v} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1" />
                                <span className="ml-4 font-bold text-gray-800">{o.t}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className={labelClass}>Dependents</label><input type="number" name="dependents" min="0" value={localData.dependents} onChange={handleChange} className={inputClass} disabled={localData.status_letter==='0'} /></div>
                    <div><label className={labelClass}>Additional Withholding ($)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="additional_withholding" min="0" step="0.01" value={localData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} /></div></div>
                </div>
            </div>
          </section>

          {/* Signature */}
          <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><PenTool className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <div className="mb-8 max-w-sm">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={localData.confirmation_date} onChange={handleChange} />
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
                    {!localData.signature_image && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 gap-2">
                          <PenTool size={24} className="opacity-50" />
                          <span className="font-medium">Sign Here</span>
                       </div>
                    )}
                </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end pt-8 pb-4 border-t border-gray-100 mt-6">
            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className={`px-10 py-3.5 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all 
                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5'}`}
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default AlabamaW4Form;