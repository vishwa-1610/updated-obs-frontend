import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Shield, User, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, FileText, Calculator, Flag, CheckCircle } from 'lucide-react';

// --- CUSTOM DATE PICKER (Reused) ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder }) => {
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

// --- MAIN MISSOURI FORM ---
const MissouriTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  // 1. LOCAL STATE
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'MO',
    zipcode: '',

    // Filing Status (1, 2, 3)
    filing_status_mo: '1',

    // Withholding Adjustments
    additional_withholding: '', // Line 2
    reduced_withholding: '',    // Line 3

    // Exemptions
    exempt: false,
    exempt_reason: '1', // 1=Refund, 2=SCRA/MSRRA, 3=Military

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingStatuses = [
    { code: '1', label: 'Single or Married Spouse Works' },
    { code: '2', label: 'Married Spouse Does Not Work' },
    { code: '3', label: 'Head of Household' }
  ];

  const exemptReasons = [
    { code: '1', label: 'I had a right to a refund of all Missouri income tax withheld last year AND expect a refund of all tax withheld this year.' },
    { code: '2', label: 'I am exempt under the MSRRA (Military Spouse Residency Relief Act).' },
    { code: '3', label: 'I am exempt under the SCRA (Servicemembers Civil Relief Act).' }
  ];

  // 2. INITIALIZE
  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            first_name: initialData.first_name || '',
            last_name: initialData.last_name || '',
            middle_initial: initialData.initial || '',
            ssn: initialData.ssn || '',
            address: initialData.address || '',
            city: initialData.city || '',
            zipcode: initialData.zipcode || '',
        }));
    }
  }, [initialData]);

  // 3. CANVAS RESIZE
  useEffect(() => {
    const resizeCanvas = () => {
        if (containerRef.current && sigCanvasRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const rect = containerRef.current.getBoundingClientRect();
            // Save Data
            const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
            canvas.width = rect.width;
            canvas.height = rect.height;
            // Restore Data
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
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        // --- FIX: USE getCanvas() instead of getTrimmedCanvas() ---
        // This ensures the full drawing area is sent, preventing cutoffs.
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

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";
  const checkboxCardClass = "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 bg-white border-gray-200";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/20";

  return (
    <div className="bg-white px-4 py-2 text-left">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Missouri Employee Withholding</h2>
        <p className="text-gray-500 text-sm mt-1">Form MO W-4</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* 1. PERSONAL INFORMATION */}
        <section>
            <h3 className={sectionHeader}><User className="text-blue-600" size={22} /> Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" required /></div>
                <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" maxLength="1" value={formData.middle_initial} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" /></div>
                <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" required /></div>
                
                <div className="md:col-span-6 relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX" required/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div className="md:col-span-6"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} required /></div>

                <div className="md:col-span-8"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street Address" required /></div>
                <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required /></div>
            </div>
        </section>

        {/* 2. FILING STATUS */}
        <section>
            <h3 className={sectionHeader}><FileText className="text-blue-600" size={22} /> Filing Status</h3>
            <div className="space-y-3">
                {filingStatuses.map((status) => (
                    <label key={status.code} className={`${checkboxCardClass} ${formData.filing_status_mo === status.code ? activeCheckboxClass : ''}`}>
                        <input type="radio" name="filing_status_mo" value={status.code} checked={formData.filing_status_mo === status.code} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600" />
                        <span className="text-gray-900 font-medium">{status.label}</span>
                    </label>
                ))}
            </div>
        </section>

        {/* 3. WITHHOLDING ADJUSTMENTS */}
        <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600" size={22} /> Withholding Adjustments</h3>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-6">
                
                {/* Line 2 */}
                <div>
                    <label className={labelClass}>Line 2: Additional Withholding ($)</label>
                    <div className="relative max-w-sm"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" /></div>
                    <p className="text-xs text-gray-500 mt-1">Enter any additional amount you want deducted from each paycheck.</p>
                </div>

                {/* Line 3 */}
                <div>
                    <label className={labelClass}>Line 3: Reduced Withholding ($)</label>
                    <div className="relative max-w-sm"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="reduced_withholding" value={formData.reduced_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" /></div>
                    <p className="text-xs text-gray-500 mt-1">If you expect a refund, you may reduce your withholding by this amount.</p>
                </div>

            </div>
        </section>

        {/* 4. EXEMPT STATUS */}
        <section>
            <h3 className={sectionHeader}><Flag className="text-blue-600" size={22} /> Exempt Status (Line 4)</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input type="checkbox" name="exempt" checked={formData.exempt} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                    <span className="font-bold text-lg text-blue-900">I claim Exemption from withholding</span>
                </label>

                {formData.exempt && (
                    <div className="space-y-3 mt-4 pl-2 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Select Reason for Exemption:</p>
                        {exemptReasons.map((reason) => (
                            <label key={reason.code} className={`${checkboxCardClass} ${formData.exempt_reason === reason.code ? activeCheckboxClass : ''}`}>
                                <input 
                                    type="radio" 
                                    name="exempt_reason" 
                                    value={reason.code} 
                                    checked={formData.exempt_reason === reason.code} 
                                    onChange={handleChange}
                                    className="mt-1 text-blue-600"
                                />
                                <span className="text-sm text-gray-800">{reason.label}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </section>

        {/* 5. CONFIRMATION / SIGNATURE */}
        <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <p className="text-sm text-gray-700 mb-6 font-medium">
                Under penalties of perjury, I certify that I am entitled to the number of withholding allowances claimed on this certificate, or I am entitled to claim exempt status.
            </p>

            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
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

export default MissouriTaxForm;