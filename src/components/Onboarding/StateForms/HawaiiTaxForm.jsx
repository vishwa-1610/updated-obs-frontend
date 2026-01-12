import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Shield, User, DollarSign, Calendar, ChevronLeft, ChevronRight, ChevronDown, Eraser, Save, PenTool, FileText, Calculator, Building2 } from 'lucide-react';

// --- CUSTOM DATE PICKER ---
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

// --- MAIN HAWAII FORM ---
const HawaiiTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  // 1. LOCAL STATE
  const [formData, setFormData] = useState({
    // Personal Info (Required)
    first_name: '',
    last_name: '',
    middle_initial: '',
    ssn: '',
    address: '',
    city: '',
    state: 'HI', // <--- FIXED: Default to HI, was GA
    zipcode: '',
    
    // HW-4 Specific Fields
    filing_status_hi: '1',
    
    // Allowances Inputs (A-G)
    spouse_works: false,
    spouse_claimed: false,
    age_allowances: 0,
    dependents: 0,
    head_of_household: false,
    tax_credits: 0,

    // Worksheet Inputs (Line H)
    use_itemized: false,
    fed_itemized: 0,
    adjustments: 0,
    nonwage_income: 0,
    
    // Extras
    additional_withholding: 0,
    certified_disabled: false,
    military_spouse: false,

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingStatuses = [
    { code: '1', label: 'Single / Married Filing Separately / Disabled Person' },
    { code: '2', label: 'Married Filing Jointly' },
    { code: '3', label: 'Married Filing Jointly (Withhold at Higher Single Rate)' }
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
            // Ensure state is set to HI if missing
            state: initialData.state || 'HI' 
        }));
    }
  }, [initialData]);

  // 3. CANVAS RESIZE
  useEffect(() => {
    const resizeCanvas = () => {
        if (containerRef.current && sigCanvasRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const rect = containerRef.current.getBoundingClientRect();
            const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
            canvas.width = rect.width;
            canvas.height = rect.height;
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
        // FIXED: Use getCanvas()
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
      let sig = "";
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }
      onSubmit({ ...formData, signature_image: sig });
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";
  const checkboxCardClass = "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 bg-white border-gray-200";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/20";

  return (
    <div className="bg-white px-4 py-2 text-left">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Hawaii Withholding Certificate</h2>
        <p className="text-gray-500 text-sm mt-1">Form HW-4</p>
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

                <div className="md:col-span-12"><label className={labelClass}>Home Address (in Hawaii)</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street Address" required /></div>
                
                <div className="md:col-span-5"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required /></div>
                
                {/* --- ADDED STATE FIELD (READ ONLY) --- */}
                <div className="md:col-span-3">
                    <label className={labelClass}>State</label>
                    <input type="text" name="state" value={formData.state} readOnly className={`${inputClass} bg-gray-100 text-center cursor-not-allowed`} />
                </div>
            </div>
        </section>

        {/* 2. FILING STATUS */}
        <section>
            <h3 className={sectionHeader}><FileText className="text-blue-600" size={22} /> Filing Status (Line 1)</h3>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
                <label className={labelClass}>Select Filing Status</label>
                <div className="relative">
                    <select name="filing_status_hi" value={formData.filing_status_hi} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer pr-10`}>
                        {filingStatuses.map(({ code, label }) => (
                            <option key={code} value={code}>{label}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Special Status Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <label className={`${checkboxCardClass} ${formData.certified_disabled ? activeCheckboxClass : ''}`}>
                        <input type="checkbox" name="certified_disabled" checked={formData.certified_disabled} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="font-bold text-gray-800">Certified Disabled Person</span>
                    </label>
                    <label className={`${checkboxCardClass} ${formData.military_spouse ? activeCheckboxClass : ''}`}>
                         <input type="checkbox" name="military_spouse" checked={formData.military_spouse} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="font-bold text-gray-800">Military Spouse Exempt</span>
                    </label>
                </div>
            </div>
        </section>

        {/* 3. ALLOWANCES CALCULATION */}
        <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600" size={22} /> Allowances & Worksheet</h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                
                {/* Basic Allowances */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={labelClass}>Total Dependents (Line E)</label>
                        <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} min="0" className={inputClass} />
                    </div>
                    <div>
                         <label className={labelClass}>Age 65+ Allowances (Line D)</label>
                         <input type="number" name="age_allowances" value={formData.age_allowances} onChange={handleChange} min="0" className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                     {/* Line F */}
                     <label className={`${checkboxCardClass} ${formData.head_of_household ? activeCheckboxClass : ''}`}>
                        <input type="checkbox" name="head_of_household" checked={formData.head_of_household} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                        <div>
                             <span className="block font-bold text-gray-900">Head of Household (Line F)</span>
                             <span className="text-xs text-gray-500">Check if you are unmarried and pay 50% of home costs.</span>
                        </div>
                    </label>

                    {/* Conditional Married Logic */}
                    {formData.filing_status_hi === '2' && (
                        <>
                            <label className={`${checkboxCardClass} ${!formData.spouse_works ? activeCheckboxClass : ''}`}>
                                <input type="checkbox" name="spouse_works" checked={!formData.spouse_works} onChange={() => setFormData(prev => ({...prev, spouse_works: !prev.spouse_works}))} className="w-5 h-5 text-blue-600 rounded" />
                                <div>
                                    <span className="block font-bold text-gray-900">Spouse Does NOT Work (Line B)</span>
                                </div>
                            </label>
                             <label className={`${checkboxCardClass} ${!formData.spouse_claimed ? activeCheckboxClass : ''}`}>
                                <input type="checkbox" name="spouse_claimed" checked={!formData.spouse_claimed} onChange={() => setFormData(prev => ({...prev, spouse_claimed: !prev.spouse_claimed}))} className="w-5 h-5 text-blue-600 rounded" />
                                <div>
                                    <span className="block font-bold text-gray-900">Spouse NOT Claimed (Line C)</span>
                                </div>
                            </label>
                        </>
                    )}
                </div>

                {/* Tax Credits Line G */}
                <div className="border-t border-gray-200 pt-4">
                     <label className={labelClass}>Tax Credits (Line G)</label>
                     <div className="relative max-w-sm"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="tax_credits" value={formData.tax_credits} onChange={handleChange} className={`${inputClass} pl-8`} /></div>
                     <p className="text-xs text-gray-500 mt-1">If your tax credits total at least $250, enter amount here.</p>
                </div>

                {/* Worksheet for Itemized Deductions */}
                <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4 mt-6">
                    <label className="flex items-center gap-2 mb-4 cursor-pointer">
                        <input type="checkbox" name="use_itemized" checked={formData.use_itemized} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="font-bold text-blue-900">Use Itemized Deductions Worksheet? (Line H)</span>
                    </label>

                    {formData.use_itemized && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-4 border-blue-400 animate-in fade-in slide-in-from-top-2">
                             <div>
                                <label className={labelClass}>Federal Itemized Deductions</label>
                                <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="fed_itemized" value={formData.fed_itemized} onChange={handleChange} className={`${inputClass} pl-8`} /></div>
                             </div>
                             <div>
                                <label className={labelClass}>Total Adjustments</label>
                                <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="adjustments" value={formData.adjustments} onChange={handleChange} className={`${inputClass} pl-8`} /></div>
                             </div>
                             <div>
                                <label className={labelClass}>Non-Wage Income</label>
                                <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="nonwage_income" value={formData.nonwage_income} onChange={handleChange} className={`${inputClass} pl-8`} /></div>
                             </div>
                          </div>
                    )}
                </div>

                {/* Additional Withholding */}
                <div className="border-t border-gray-200 pt-4">
                    <label className={labelClass}>Additional Withholding (Line 5)</label>
                    <div className="relative max-w-sm"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">$</span><input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" /></div>
                </div>

            </div>
        </section>

        {/* 4. CONFIRMATION / SIGNATURE */}
        <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <p className="text-sm text-gray-700 mb-6 font-medium">
                I declare under the penalties set forth in Section 231-36, HRS, that I have examined this certificate and, to the best of my knowledge and belief, it is true, correct, and complete.
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
            <button type="submit" disabled={!formData.signature_image} className={`px-10 py-3.5 font-bold text-lg rounded-xl shadow-lg transform transition-all flex items-center gap-2 ${formData.signature_image ? 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                <Save size={22} /> Confirm & Generate PDF
            </button>
        </div>

      </form>
    </div>
  );
};

export default HawaiiTaxForm;