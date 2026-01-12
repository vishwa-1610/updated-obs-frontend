import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Shield, User, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, FileText, Calculator, Flag, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// --- CUSTOM DATE PICKER (Reused) ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  // Safe date initialization
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
  const years = Array.from({ length: 100 }, (_, i) => 1940 + i);

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

// --- MAIN WISCONSIN FORM ---
const WisconsinTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  // 1. LOCAL STATE
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'WI',
    zipcode: '',
    date_of_birth: '',
    date_of_hire: '',

    // Filing Status
    filing_status_wi: '1', // 1=Single, 2=Married, 3=Higher Single Rate

    // Exemptions (Line 1)
    claim_self: true,   // Line 1a
    spouse_works: false, // Affects Line 1b (If Married)
    dependents: 0,      // Line 1c

    // Withholding (Line 2)
    additional_withholding: '',

    // Exempt (Line 3)
    exempt: false,

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingStatuses = [
    { code: '1', label: 'Single' },
    { code: '2', label: 'Married' },
    { code: '3', label: 'Married, but withhold at higher Single rate' }
  ];

  // 2. INITIALIZE (Fixed Reset Loop)
  useEffect(() => {
    if (initialData && !dataLoadedRef.current) {
        setFormData(prev => ({
            ...prev,
            first_name: initialData.first_name || '',
            last_name: initialData.last_name || '',
            middle_initial: initialData.initial || '',
            ssn: initialData.ssn || '',
            address: initialData.address || '',
            city: initialData.city || '',
            zipcode: (initialData.zipcode || '').slice(0, 5), // Safe Zip Load
            date_of_birth: initialData.dob || '',
            state: 'WI'
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
    
    // --- FIX: Force Zip Code to max 5 digits (Prevents DB Crash) ---
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

  // Calculate Total Exemptions (Line 1d)
  const calculateTotal = () => {
      let total = 0;
      if (formData.claim_self) total += 1;
      
      // Line 1b: If Married (2) AND Spouse Does NOT Work, add 1
      if (formData.filing_status_wi === '2' && !formData.spouse_works) {
          total += 1;
      }
      
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
    <div className="bg-white px-4 py-2 text-left">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Wisconsin Withholding Exemption</h2>
        <p className="text-gray-500 text-sm mt-1">Form WT-4</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* 1. PERSONAL INFORMATION */}
        <section>
            <h3 className={sectionHeader}><User className="text-blue-600" size={22} /> Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className={inputClass} placeholder="First Name" required /></div>
                <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" maxLength="1" value={formData.middle_initial || ''} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" /></div>
                <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className={inputClass} placeholder="Last Name" required /></div>
                
                <div className="md:col-span-6 relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn || ''} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX" required/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div className="md:col-span-6"><label className={labelClass}>Date of Birth</label><CustomDatePicker name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} placeholder="YYYY-MM-DD" /></div>

                <div className="md:col-span-8"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={inputClass} placeholder="Street Address" required /></div>
                <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-4"><label className={labelClass}>State</label><input type="text" name="state" value="WI" readOnly className={`${inputClass} bg-gray-50`} /></div>
                <div className="md:col-span-4"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode || ''} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-4"><label className={labelClass}>Date of Hire</label><CustomDatePicker name="date_of_hire" value={formData.date_of_hire || ''} onChange={handleChange} placeholder="YYYY-MM-DD" /></div>
            </div>
        </section>

        {/* 2. FILING STATUS */}
        <section>
            <h3 className={sectionHeader}><FileText className="text-blue-600" size={22} /> Filing Status</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    {filingStatuses.map((status) => (
                        <label key={status.code} className={`${checkboxCardClass} ${formData.filing_status_wi === status.code ? activeCheckboxClass : ''}`}>
                            <input type="radio" name="filing_status_wi" value={status.code} checked={formData.filing_status_wi === status.code} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600" />
                            <span className="text-gray-900 font-medium">{status.label}</span>
                        </label>
                    ))}
                </div>

                {formData.filing_status_wi === '2' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 animate-in fade-in">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="spouse_works" checked={formData.spouse_works} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                            <div>
                                <span className="block font-bold text-gray-900">Does your spouse work?</span>
                                <span className="text-xs text-gray-500">Uncheck this if your spouse does NOT work (Adds +1 Exemption).</span>
                            </div>
                        </label>
                    </div>
                )}
            </div>
        </section>

        {/* 3. EXEMPTIONS WORKSHEET */}
        <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600" size={22} /> Exemptions (Line 1)</h3>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-4">
                
                {/* Line 1a */}
                <label className={`${checkboxCardClass} ${formData.claim_self ? activeCheckboxClass : ''}`}>
                    <input type="checkbox" name="claim_self" checked={formData.claim_self} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                    <div>
                        <span className="block font-bold text-gray-900">1a. Yourself</span>
                        <span className="text-xs text-gray-500">Enter "1" for yourself.</span>
                    </div>
                </label>

                {/* Line 1b (Calculated Display) */}
                <div className="p-3 bg-white rounded border border-gray-200 flex justify-between items-center text-gray-500">
                    <span className="text-sm">1b. Spouse (Calculated from status)</span>
                    <span className="font-bold">{(formData.filing_status_wi === '2' && !formData.spouse_works) ? "1" : "0"}</span>
                </div>

                {/* Line 1c */}
                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                      <div className="flex-1 pr-4">
                        <label className="text-sm font-semibold text-gray-800">1c. Number of Dependents</label>
                      </div>
                      <input type="number" name="dependents" value={formData.dependents || ''} onChange={handleChange} min="0" className="w-20 px-3 py-2 border rounded text-center" />
                </div>

                {/* Total Line 1d */}
                <div className="flex items-center justify-between p-4 bg-white rounded border border-blue-200 mt-4">
                    <div className="flex items-center gap-2">
                         <CheckCircle className="text-blue-600" size={20}/>
                         <label className="font-bold text-blue-900">Line 1d: Total Exemptions</label>
                    </div>
                    <span className="font-bold text-xl text-blue-900 bg-white px-4 py-1 rounded border border-blue-200">{totalExemptions}</span>
                </div>
            </div>
        </section>

        {/* 4. WITHHOLDING & EXEMPT */}
        <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600" size={22} /> Additional & Exempt</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                
                {/* Line 2 */}
                <div>
                    <label className={labelClass}>Line 2: Additional Withholding ($)</label>
                    <div className="relative max-w-sm"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="additional_withholding" value={formData.additional_withholding || ''} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" /></div>
                </div>

                {/* Line 3: Exempt */}
                <div className="border-t border-gray-200 pt-6">
                    <label className={`${checkboxCardClass} ${formData.exempt ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : ''}`}>
                        <input type="checkbox" name="exempt" checked={formData.exempt} onChange={handleChange} className="w-5 h-5 text-red-600 rounded" />
                        <div>
                             <span className="block font-bold text-gray-900">Line 3: Claim Exemption</span>
                             <span className="text-xs text-gray-500">I claim exemption from withholding (must meet conditions).</span>
                        </div>
                    </label>
                </div>

            </div>
        </section>

        {/* 5. SIGNATURE */}
        <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <p className="text-sm text-gray-700 mb-6 font-medium">
                Under penalties of perjury, I declare that this certificate is true, correct, and complete to the best of my knowledge and belief.
            </p>

            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date || ''} onChange={handleChange} />
            </div>

            {/* BIG SIGNATURE ROW */}
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
            <button type="submit" disabled={!formData.signature_image} className={`px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 ${formData.signature_image ? 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                <Save size={22} /> Confirm & Generate PDF
            </button>
        </div>

      </form>
    </div>
  );
};

export default WisconsinTaxForm;