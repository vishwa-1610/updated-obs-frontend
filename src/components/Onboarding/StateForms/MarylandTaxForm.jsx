import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, FileText, Calculator, Building2, Flag, Loader2, XCircle } from 'lucide-react';

// --- COMPONENTS ---

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
          <button onClick={onClose} className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg">Okay, I'll Fix It</button>
        </div>
      </div>
    </div>
  );
};

const CustomDatePicker = ({ label, name, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(() => {
      const d = new Date(value);
      return isNaN(d.getTime()) ? new Date() : d;
  });
  const dropdownRef = useRef(null);
  
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
           {view === 'year' && <div className="h-48 overflow-y-auto grid grid-cols-3 gap-2">{years.map(y=><button key={y} onClick={()=>{setCurrentDate(new Date(y,currentDate.getMonth(),1));setView('calendar')}} className="p-2 text-sm hover:bg-gray-100 rounded">{y}</button>)}</div>}
        </div>
      )}
    </div>
  );
};

// --- MAIN MARYLAND FORM ---
const MarylandTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '', last_name: '', ssn: '', address: '', city: '', state: 'MD', zipcode: '',
    county: '', 

    // Payroll System & Agency
    payroll_system: 'RG', 
    agency_number: '', // LIMIT THIS TO 3-5 CHARS
    agency_name: '',

    // Step 1: Filing Status
    filing_status: '1',

    // Step 2: Multiple Jobs
    multiple_jobs: false,
    step2_method: 'C', 

    // Step 3: Dependents
    income_limit: true,
    kids_under_17: 0,
    other_dependents: 0,
    other_credits: '',

    // Step 4: Other Adjustments
    step4_other_income: '',
    step4_deductions: '',
    step4_extra_withholding: '',

    // Exemption
    exempt: false,
    exempt_reason: 'A',

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            ...initialData,
            state: 'MD',
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
    
    // Strict Length Validation for "value too long" errors
    if (name === 'zipcode') {
        setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 5) }));
        return;
    }
    if (name === 'agency_number') {
        // Limit Agency Number to 5 chars max
        setFormData(prev => ({ ...prev, [name]: value.slice(0, 5) }));
        return;
    }

    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

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

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      let sig = formData.signature_image;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      if (!sig) {
          setErrorState({ isOpen: true, title: "Missing Signature", message: "Please sign the form in the 'Digital Signature' box before submitting." });
          return;
      }

      if (!formData.first_name || !formData.last_name || !formData.ssn) {
          setErrorState({ isOpen: true, title: "Missing Information", message: "Please ensure your Name and SSN are filled out." });
          return;
      }

      setIsSubmitting(true);

      try {
          const cleanNumber = (val) => (val === '' || val === null || isNaN(val)) ? 0 : val;

          // Prepare data with truncation for safety
          const finalData = { 
              ...formData,
              // Truncate fields that cause DB errors if too long
              agency_number: formData.agency_number.slice(0, 5), 
              payroll_system: formData.payroll_system.slice(0, 5),
              exempt_reason: formData.exempt_reason.slice(0, 5),
              
              // Numeric cleanups
              kids_under_17: cleanNumber(formData.kids_under_17),
              other_dependents: cleanNumber(formData.other_dependents),
              other_credits: cleanNumber(formData.other_credits),
              step4_other_income: cleanNumber(formData.step4_other_income),
              step4_deductions: cleanNumber(formData.step4_deductions),
              step4_extra_withholding: cleanNumber(formData.step4_extra_withholding),
              
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

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";
  const checkboxCardClass = "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 bg-white border-gray-200";
  const activeCheckboxClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

  return (
    <>
      {isSubmitting && <LoadingOverlay />}
      <ErrorModal isOpen={errorState.isOpen} title={errorState.title} message={errorState.message} onClose={() => setErrorState({ isOpen: false, title: '', message: '' })} />

      <div className="bg-white px-8 py-8 max-w-5xl mx-auto shadow-sm rounded-2xl border border-gray-100">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Maryland Employee Withholding</h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 font-medium">
              <FileText size={16}/>
              <p className="text-sm">Form MW507</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* PERSONAL INFO */}
          <section>
              <h3 className={sectionHeader}><User className="text-blue-600"/> Employee Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} required /></div>
                  <div><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} required /></div>
                  <div><label className={labelClass}>SSN</label><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={inputClass} placeholder="XXX-XX-XXXX" required/></div>
                  <div><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} required /></div>
                  
                  <div><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>State</label><input type="text" value="MD" readOnly className={`${inputClass} bg-gray-50 text-gray-500 text-center font-bold`} /></div>
                    <div><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} required /></div>
                  </div>

                  <div className="md:col-span-2">
                      <label className={labelClass}>Maryland County of Residence</label>
                      <input type="text" name="county" value={formData.county} onChange={handleChange} className={inputClass} placeholder="e.g. Baltimore County" />
                  </div>
              </div>
          </section>

          {/* AGENCY & PAYROLL */}
          <section>
              <h3 className={sectionHeader}><Building2 className="text-blue-600"/> Agency & Payroll</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <div>
                      <label className={labelClass}>Payroll System</label>
                      <select name="payroll_system" value={formData.payroll_system} onChange={handleChange} className={inputClass}>
                          <option value="RG">Regular (RG)</option>
                          <option value="CT">Contract (CT)</option>
                          <option value="UM">University of Maryland (UM)</option>
                      </select>
                  </div>
                  <div>
                      <label className={labelClass}>Agency Number (Max 5)</label>
                      <input type="text" name="agency_number" value={formData.agency_number} onChange={handleChange} className={inputClass} placeholder="999" />
                  </div>
                  <div>
                      <label className={labelClass}>Agency Name</label>
                      <input type="text" name="agency_name" value={formData.agency_name} onChange={handleChange} className={inputClass} placeholder="Employing Agency" />
                  </div>
              </div>
          </section>

          {/* STEP 1: FILING STATUS */}
          <section>
              <h3 className={sectionHeader}><FileText className="text-blue-600"/> Step 1: Filing Status</h3>
              <div className="grid grid-cols-1 gap-4">
                  <label className={`${checkboxCardClass} ${formData.filing_status === '1' ? activeCheckboxClass : 'border-gray-200'}`}>
                      <input type="radio" name="filing_status" value="1" checked={formData.filing_status === '1'} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">Single or Married Filing Separately</span>
                  </label>
                  <label className={`${checkboxCardClass} ${formData.filing_status === '2' ? activeCheckboxClass : 'border-gray-200'}`}>
                      <input type="radio" name="filing_status" value="2" checked={formData.filing_status === '2'} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">Married Filing Jointly or Qualifying Surviving Spouse</span>
                  </label>
                  <label className={`${checkboxCardClass} ${formData.filing_status === '3' ? activeCheckboxClass : 'border-gray-200'}`}>
                      <input type="radio" name="filing_status" value="3" checked={formData.filing_status === '3'} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-800">Head of Household</span>
                  </label>
              </div>
          </section>

          {/* STEP 2: MULTIPLE JOBS */}
          <section>
              <h3 className={sectionHeader}><Flag className="text-blue-600"/> Step 2: Multiple Jobs</h3>
              <label className={`${checkboxCardClass} ${formData.multiple_jobs ? activeCheckboxClass : 'border-gray-200'}`}>
                  <input type="checkbox" name="multiple_jobs" checked={formData.multiple_jobs} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <div>
                      <span className="block font-bold text-gray-900">Check if you have multiple jobs</span>
                      <span className="text-xs text-gray-500">Do only if you hold more than one job at a time.</span>
                  </div>
              </label>
          </section>

          {/* STEP 3: CLAIM DEPENDENTS */}
          <section>
              <h3 className={sectionHeader}><User className="text-blue-600"/> Step 3: Claim Dependents</h3>
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Is income ≤ $200k ($400k if joint)?</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="income_limit" checked={formData.income_limit} onChange={handleChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                  </div>

                  {formData.income_limit && (
                      <div className="space-y-4 animate-in fade-in">
                          <div>
                              <label className={labelClass}>Number of Children under 17</label>
                              <input type="number" name="kids_under_17" value={formData.kids_under_17} onChange={handleChange} min="0" className={inputClass} />
                          </div>
                          <div>
                              <label className={labelClass}>Number of Other Dependents</label>
                              <input type="number" name="other_dependents" value={formData.other_dependents} onChange={handleChange} min="0" className={inputClass} />
                          </div>
                          <div>
                              <label className={labelClass}>Other Credits ($)</label>
                              <input type="number" name="other_credits" value={formData.other_credits} onChange={handleChange} className={inputClass} placeholder="0.00" />
                          </div>
                      </div>
                  )}
              </div>
          </section>

          {/* STEP 4: ADJUSTMENTS */}
          <section>
              <h3 className={sectionHeader}><DollarSign className="text-blue-600"/> Step 4: Other Adjustments</h3>
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <div>
                      <label className={labelClass}>4(a) Other Income ($)</label>
                      <input type="number" name="step4_other_income" value={formData.step4_other_income} onChange={handleChange} className={inputClass} placeholder="0.00" />
                  </div>
                  <div>
                      <label className={labelClass}>4(b) Deductions ($)</label>
                      <input type="number" name="step4_deductions" value={formData.step4_deductions} onChange={handleChange} className={inputClass} placeholder="0.00" />
                  </div>
                  <div>
                      <label className={labelClass}>4(c) Extra Withholding ($)</label>
                      <input type="number" name="step4_extra_withholding" value={formData.step4_extra_withholding} onChange={handleChange} className={inputClass} placeholder="0.00" />
                  </div>
              </div>
          </section>

          {/* SIGNATURE */}
          <section className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
              
              <p className="text-sm text-gray-700 mb-6 font-medium">
                  Under penalties of perjury, I declare that I have examined this certificate and to the best of my knowledge and belief, it is true, correct, and complete.
              </p>

              <div className="mb-8 max-w-sm">
                  <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
              </div>

              <div className="w-full">
                  <div className="flex justify-between items-center mb-3">
                      <label className={labelClass}>Digital Signature</label>
                      <button type="button" onClick={clearSignature} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors bg-white"><Eraser size={14}/> Clear Signature</button>
                  </div>
                  
                  <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden bg-white hover:border-blue-400 transition-all h-64 w-full relative cursor-crosshair shadow-sm">
                      <SignatureCanvas 
                          ref={sigCanvasRef}
                          penColor="black"
                          velocityFilterWeight={0.7}
                          canvasProps={{ className: 'sigCanvas w-full h-full' }}
                          onEnd={handleSignatureEnd}
                      />
                      {!formData.signature_image && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-300 gap-3">
                            <div className="p-3 bg-gray-50 rounded-full"><PenTool size={28} className="opacity-50" /></div>
                            <span className="font-medium">Sign Here</span>
                         </div>
                      )}
                  </div>
              </div>
          </section>

          {/* SUBMIT */}
          <div className="flex justify-end pt-8 pb-4 border-t border-gray-100">
              <button type="submit" disabled={!formData.signature_image} className={`px-12 py-4 font-bold text-lg rounded-xl shadow-lg shadow-blue-500/20 transform transition-all duration-200 flex items-center gap-3 ${formData.signature_image ? 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 hover:shadow-xl' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  <Save size={22} /> Confirm & Generate PDF
              </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default MarylandTaxForm;