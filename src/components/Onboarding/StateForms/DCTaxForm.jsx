import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, Calculator, CheckCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

// --- CUSTOM DATE PICKER (Standard Style) ---
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

// --- MAIN DC FORM ---
const DCTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [formData, setFormData] = useState({
    first_name: '', middle_initial: '', last_name: '', ssn: '',
    address: '', city: '', state: 'DC', zipcode: '',
    
    // Filing Status (1-5)
    filing_status: '1',

    // Section A
    is_self_65: false,
    is_self_blind: false,
    is_spouse_65: false,
    is_spouse_blind: false,
    dependents: 0,

    // Section B
    use_worksheet_2: false,
    itemized_deductions: '',

    // Line 3 & 4
    additional_withholding: '',
    exempt: false,
    is_student: false,

    // Line 5
    domicile_other: false,
    other_state_name: '',

    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // Initialize
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
            zipcode: (initialData.zipcode || '').slice(0, 5),
            state: 'DC'
        }));
        dataLoadedRef.current = true;
    }
  }, [initialData]);

  // Resize Canvas
  useEffect(() => {
    const resize = () => {
        if (sigCanvasRef.current && containerRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const rect = containerRef.current.getBoundingClientRect();
            const saved = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
            canvas.width = rect.width;
            canvas.height = rect.height;
            if (saved) sigCanvasRef.current.fromDataURL(saved);
        }
    };
    setTimeout(resize, 200);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'zipcode') {
        setFormData(prev => ({ ...prev, [name]: value.slice(0, 5) }));
        return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

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

  const handleSubmit = (e) => {
      e.preventDefault();
      let sig = "";
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      onSubmit({ ...formData, signature_image: sig });
  };

  // Calculations for display
  const hasSpouse = ['2', '5'].includes(formData.filing_status);
  const a = 1; // Self
  const b = formData.filing_status === '4' ? 1 : 0; // HOH
  const c = formData.is_self_65 ? 1 : 0;
  const d = formData.is_self_blind ? 1 : 0;
  const eVal = parseInt(formData.dependents || 0);
  const f = hasSpouse ? 1 : 0;
  const g = (hasSpouse && formData.is_spouse_65) ? 1 : 0;
  const h = (hasSpouse && formData.is_spouse_blind) ? 1 : 0;
  
  const totalA = a + b + c + d + eVal + f + g + h;

  // --- STYLES (MATCHING STANDARD PATTERN) ---
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";
  const checkboxCardClass = "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 bg-white border-gray-200";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/20";

  return (
    <div className="bg-white px-4 py-2 text-left">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">District of Columbia D-4</h2>
        <p className="text-gray-500 text-sm mt-1">Employee Withholding Allowance Certificate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* 1. PERSONAL */}
        <section>
            <h3 className={sectionHeader}><User className="text-blue-600" size={22}/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className={inputClass} placeholder="First Name" required /></div>
                <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" maxLength="1" value={formData.middle_initial || ''} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" /></div>
                <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className={inputClass} placeholder="Last Name" required /></div>
                
                <div className="md:col-span-6 relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn || ''} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX" required/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div className="md:col-span-6"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode || ''} onChange={handleChange} className={inputClass} required /></div>

                <div className="md:col-span-8"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={inputClass} placeholder="Street Address" required /></div>
                <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-4"><label className={labelClass}>State</label><input type="text" value="DC" readOnly className={`${inputClass} bg-gray-100 text-gray-500 text-center font-bold`} /></div>
            </div>
        </section>

        {/* 2. FILING STATUS */}
        <section>
            <h3 className={sectionHeader}><CheckCircle className="text-blue-600" size={22}/> Filing Status</h3>
            <div className="space-y-3">
                {[
                    {id: '1', l: 'Single'},
                    {id: '2', l: 'Married/Domestic Partners Filing Jointly'},
                    {id: '3', l: 'Married Filing Separately'},
                    {id: '4', l: 'Head of Household'},
                    {id: '5', l: 'Married Filing Separately on Same Return'}
                ].map(opt => (
                    <label key={opt.id} className={`${checkboxCardClass} ${formData.filing_status === opt.id ? activeCheckboxClass : ''}`}>
                        <input type="radio" name="filing_status" value={opt.id} checked={formData.filing_status === opt.id} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <div>
                            <span className="block font-bold text-gray-900">{opt.l}</span>
                            <span className="text-xs text-gray-500">Status Code: {opt.id}</span>
                        </div>
                    </label>
                ))}
            </div>
        </section>

        {/* 3. SECTION A (Allowances) */}
        <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600" size={22}/> Section A: Allowances</h3>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`${checkboxCardClass} ${formData.is_self_65 ? activeCheckboxClass : ''}`}>
                        <input type="checkbox" name="is_self_65" checked={formData.is_self_65} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded"/>
                        <span className="font-bold text-gray-900">I am 65 or over</span>
                    </label>
                    <label className={`${checkboxCardClass} ${formData.is_self_blind ? activeCheckboxClass : ''}`}>
                        <input type="checkbox" name="is_self_blind" checked={formData.is_self_blind} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded"/>
                        <span className="font-bold text-gray-900">I am blind</span>
                    </label>
                </div>

                {hasSpouse && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-blue-200 pt-4">
                        <label className={`${checkboxCardClass} ${formData.is_spouse_65 ? activeCheckboxClass : ''}`}>
                            <input type="checkbox" name="is_spouse_65" checked={formData.is_spouse_65} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded"/>
                            <span className="font-bold text-gray-900">Spouse is 65 or over</span>
                        </label>
                        <label className={`${checkboxCardClass} ${formData.is_spouse_blind ? activeCheckboxClass : ''}`}>
                            <input type="checkbox" name="is_spouse_blind" checked={formData.is_spouse_blind} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded"/>
                            <span className="font-bold text-gray-900">Spouse is blind</span>
                        </label>
                    </div>
                )}

                <div className="border-t border-blue-200 pt-4">
                    <label className={labelClass}>Number of Dependents</label>
                    <input type="number" name="dependents" value={formData.dependents || 0} onChange={handleChange} className={inputClass} min="0" placeholder="0" />
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded border border-blue-200 mt-2">
                    <span className="font-bold text-blue-900">Total Section A Allowances</span>
                    <span className="text-xl font-bold text-blue-900">{totalA}</span>
                </div>
            </div>
        </section>

        {/* 4. SECTION B & EXEMPT */}
        <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600" size={22}/> Adjustments & Exemptions</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                
                {/* Section B Toggle */}
                <label className={`${checkboxCardClass} ${formData.use_worksheet_2 ? activeCheckboxClass : ''}`}>
                    <input type="checkbox" name="use_worksheet_2" checked={formData.use_worksheet_2} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                    <div>
                        <span className="block font-bold text-gray-900">Use Section B (Itemized Deductions)</span>
                        <span className="text-xs text-gray-500">Check if you plan to itemize deductions on your DC return.</span>
                    </div>
                </label>

                {formData.use_worksheet_2 && (
                    <div className="pl-4 border-l-4 border-blue-500 ml-4">
                        <label className={labelClass}>Estimated Itemized Deductions ($)</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input type="number" name="itemized_deductions" value={formData.itemized_deductions} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                        </div>
                    </div>
                )}

                {/* Additional Withholding */}
                <div>
                    <label className={labelClass}>Additional Withholding per Paycheck ($)</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input type="number" name="additional_withholding" value={formData.additional_withholding || ''} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                    </div>
                </div>

                {/* Exempt */}
                <div className="border-t border-gray-200 pt-6">
                    <label className={`${checkboxCardClass} ${formData.exempt ? 'border-red-500 bg-red-50/10 ring-1 ring-red-500' : ''}`}>
                        <input type="checkbox" name="exempt" checked={formData.exempt} onChange={handleChange} className="mt-1 w-5 h-5 text-red-600 rounded" />
                        <div>
                            <span className={`block font-bold ${formData.exempt ? 'text-red-700' : 'text-gray-900'}`}>Claim Exemption from Withholding</span>
                            <span className={`text-xs ${formData.exempt ? 'text-red-600' : 'text-gray-500'}`}>Check ONLY if you meet all conditions for full exemption.</span>
                        </div>
                    </label>
                    
                    {formData.exempt && (
                        <div className="mt-3 pl-8">
                            <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                                <input type="checkbox" name="is_student" checked={formData.is_student} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                                <span>I am a full-time student</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Domicile */}
                <div className="border-t border-gray-200 pt-6">
                    <label className={`${checkboxCardClass} ${formData.domicile_other ? activeCheckboxClass : ''}`}>
                        <input type="checkbox" name="domicile_other" checked={formData.domicile_other} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded" />
                        <div>
                            <span className="block font-bold text-gray-900">Domicile outside DC</span>
                            <span className="text-xs text-gray-500">Check if your legal domicile is a state other than DC.</span>
                        </div>
                    </label>
                    
                    {formData.domicile_other && (
                        <div className="mt-3 pl-4">
                            <label className={labelClass}>State of Domicile</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" name="other_state_name" value={formData.other_state_name} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="e.g. Virginia" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* 5. SIGNATURE */}
        <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><PenTool className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
            </div>
            
            <div className="w-full">
                <div className="flex justify-between items-center mb-3">
                    <label className={labelClass}>Digital Signature <span className="text-red-500">*</span></label>
                    <button type="button" onClick={clearSignature} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"><Eraser size={14}/> Clear</button>
                </div>
                
                <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white h-56 w-full relative hover:border-blue-400 transition-colors shadow-inner cursor-crosshair">
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
                          <span className="font-medium text-sm">Sign Here</span>
                       </div>
                    )}
                </div>
            </div>
        </section>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-8 pb-4 border-t border-gray-100 mt-6">
            <button type="submit" disabled={!formData.signature_image} className={`px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 ${formData.signature_image ? 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                <Save size={22} /> Confirm & Generate PDF
            </button>
        </div>

      </form>
    </div>
  );
};

export default DCTaxForm;