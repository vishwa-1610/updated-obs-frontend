import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Shield, User, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, FileText, Calculator, Flag, CheckCircle } from 'lucide-react';

// --- CUSTOM DATE PICKER (Reused) ---
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
      <label className="block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide">{label}</label>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
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

// --- MAIN OKLAHOMA FORM ---
const OklahomaTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);
  // Ref to track if we have already initialized data to prevent loop
  const dataLoadedRef = useRef(false);

  // 1. STATE INITIALIZATION
  const [formData, setFormData] = useState({
    first_name: '', 
    middle_initial: '',
    last_name: '', 
    ssn: '', 
    address: '', 
    city: '', 
    state: 'OK', 
    zipcode: '',
    filing_status: '1', 
    spouse_works: false,
    line1a: false, 
    line1d: 0, 
    additional_allowances: 0, 
    additional_withholding: '', 
    exempt_7: false, 
    exempt_8: false, 
    exempt_9: false, 
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingStatuses = [
    { code: '1', label: '1. Single' },
    { code: '2', label: '2. Married/Civil Union Filing Jointly' },
    { code: '3', label: '3. Married/Civil Union Filing Separately' },
    { code: '4', label: '4. Head of Household' },
    { code: '5', label: '5. Qualifying Widow(er)' }
  ];

  // 2. LOAD DATA (Fixed to prevent reset loops)
  useEffect(() => {
    // Only load if initialData exists AND we haven't modified the form yet (or first load)
    if (initialData && !dataLoadedRef.current) {
        setFormData(prev => ({
            ...prev,
            first_name: initialData.first_name || '',
            last_name: initialData.last_name || '',
            middle_initial: initialData.initial || '',
            ssn: initialData.ssn || '',
            address: initialData.address || '',
            city: initialData.city || '',
            // Ensure Zip is safe on load
            zipcode: (initialData.zipcode || '').slice(0, 5), 
            state: 'OK'
        }));
        dataLoadedRef.current = true;
    }
  }, [initialData]);

  // 3. CANVAS RESIZE
  useEffect(() => {
    const resizeCanvas = () => {
        if (containerRef.current && sigCanvasRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const rect = containerRef.current.getBoundingClientRect();
            // Save data
            const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
            canvas.width = rect.width;
            canvas.height = rect.height;
            // Restore data
            if (savedData) sigCanvasRef.current.fromDataURL(savedData);
        }
    };
    setTimeout(resizeCanvas, 200);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // 4. HANDLERS
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // --- FIX: Force Zip Code to max 5 digits (prevents DB crash) ---
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

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        // --- FIX: USE getCanvas() instead of getTrimmedCanvas() ---
        const signatureData = sigCanvasRef.current.getCanvas().toDataURL('image/png');
        setFormData(prev => ({ ...prev, signature_image: signatureData }));
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      // Ensure signature is captured on submit
      let sig = "";
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }
      onSubmit({ ...formData, signature_image: sig });
  };

  const calculateTotal = () => {
      const a = formData.line1a ? 1 : 0;
      const b = !formData.spouse_works ? 1 : 0; 
      const c = parseInt(formData.line1d || 0);
      const d = parseInt(formData.additional_allowances || 0);
      return a + b + c + d;
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 hover:border-blue-300 text-gray-800";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-700 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-8 flex items-center gap-3";
  const checkboxCardClass = "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-300 bg-white hover:bg-blue-50/30";
  const activeCheckboxClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

  return (
    <div className="bg-white px-8 py-8 max-w-5xl mx-auto shadow-sm rounded-2xl border border-gray-100">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Oklahoma Employee Withholding</h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 font-medium">
            <FileText size={16}/>
            <p className="text-sm">Form OK-W-4</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* PERSONAL INFO */}
        <section>
            <h3 className={sectionHeader}><User className="text-blue-600"/> Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name ?? ''} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" value={formData.middle_initial ?? ''} onChange={handleChange} className={inputClass} maxLength={1} /></div>
                <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name ?? ''} onChange={handleChange} className={inputClass} required /></div>
                
                <div className="md:col-span-6"><label className={labelClass}>SSN</label><input type="text" name="ssn" value={formData.ssn ?? ''} onChange={handleChange} className={inputClass} placeholder="XXX-XX-XXXX" required/></div>
                <div className="md:col-span-12"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address ?? ''} onChange={handleChange} className={inputClass} required /></div>
                
                <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city ?? ''} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-4"><label className={labelClass}>State</label><input type="text" value="OK" readOnly className={`${inputClass} bg-gray-50 text-gray-500 text-center font-bold`} /></div>
                <div className="md:col-span-4"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode ?? ''} onChange={handleChange} className={inputClass} required /></div>
            </div>
        </section>

        {/* FILING STATUS */}
        <section>
            <h3 className={sectionHeader}><Flag className="text-blue-600"/> Filing Status</h3>
            <div className="grid grid-cols-1 gap-3">
                {filingStatuses.map(status => (
                    <label key={status.code} className={`${checkboxCardClass} ${formData.filing_status === status.code ? activeCheckboxClass : 'border-gray-200'}`}>
                        <input type="radio" name="filing_status" value={status.code} checked={formData.filing_status === status.code} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-900 font-medium">{status.label}</span>
                    </label>
                ))}
            </div>
            
            {(formData.filing_status === '2' || formData.filing_status === '3') && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="flex items-center gap-3">
                        <input type="checkbox" name="spouse_works" checked={formData.spouse_works} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="text-gray-800 font-medium">Does your spouse work?</span>
                    </label>
                </div>
            )}
        </section>

        {/* ALLOWANCES */}
        <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600"/> Allowances</h3>
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                
                <label className="flex items-center gap-3">
                    <input type="checkbox" name="line1a" checked={formData.line1a} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                    <span>Allowance for yourself (Enter 1)</span>
                </label>

                <div className="flex items-center justify-between">
                    <span>Allowance for Spouse (Enter 1 if spouse does not work)</span>
                    <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded border">{(!formData.spouse_works && (formData.filing_status === '2' || formData.filing_status === '3')) ? 1 : 0}</span>
                </div>

                <div className="flex items-center gap-3">
                    <label>Number of Dependents:</label>
                    <input type="number" name="line1d" value={formData.line1d ?? 0} onChange={handleChange} min="0" className="w-20 p-2 border rounded text-center" />
                </div>

                <div className="flex items-center gap-3">
                    <label>Additional Allowances:</label>
                    <input type="number" name="additional_allowances" value={formData.additional_allowances ?? 0} onChange={handleChange} min="0" className="w-20 p-2 border rounded text-center" />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-100 rounded border border-blue-200 mt-2">
                    <span className="font-bold text-blue-900">Total Allowances (Line 5)</span>
                    <span className="font-bold text-xl text-blue-900">{calculateTotal()}</span>
                </div>
            </div>
        </section>

        {/* ADDITIONAL WITHHOLDING & EXEMPT */}
        <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600"/> Withholding & Exemptions</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                
                <div>
                    <label className={labelClass}>6. Additional Withholding ($)</label>
                    <input type="number" name="additional_withholding" value={formData.additional_withholding ?? ''} onChange={handleChange} className={inputClass} placeholder="0.00" />
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <p className="font-bold text-gray-900">Claim Exemption (Check if applicable):</p>
                    
                    <label className="flex items-center gap-3">
                        <input type="checkbox" name="exempt_7" checked={formData.exempt_7} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                        <span>7. I meet conditions for exemption (No tax liability).</span>
                    </label>

                    <label className="flex items-center gap-3">
                        <input type="checkbox" name="exempt_8" checked={formData.exempt_8} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                        <span>8. Exempt under MSRRA (Military Spouse).</span>
                    </label>

                    <label className="flex items-center gap-3">
                        <input type="checkbox" name="exempt_9" checked={formData.exempt_9} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                        <span>9. Exempt (Other).</span>
                    </label>
                </div>

            </div>
        </section>

        {/* SIGNATURE */}
        <section className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <p className="text-sm text-gray-700 mb-6 font-medium">
                Under penalties of perjury, I certify that I am entitled to the number of withholding allowances claimed on this certificate.
            </p>

            <div className="mb-8 max-w-sm">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date ?? ''} onChange={handleChange} />
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
  );
};

export default OklahomaTaxForm;