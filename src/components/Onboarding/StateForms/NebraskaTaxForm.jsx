import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, FileText, Calculator, Flag } from 'lucide-react';

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
      <label className="block text-sm font-semibold mb-1.5 text-gray-700">{label}</label>
      <div className="relative cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
        <input readOnly type="text" value={value || ''} placeholder={placeholder || "YYYY-MM-DD"} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 hover:border-blue-300 text-gray-800" />
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

// --- MAIN NEBRASKA FORM ---
const NebraskaTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'NE',
    zipcode: '',

    // Filing Status
    filing_status: '1', // 1=Single, 2=Married, 3=Married @ Single

    // Allowances Worksheet (A-F)
    line1a: false, // Yourself
    line1b: false, // Spouse
    line1c: false, // Head of Household
    line1d: 0,     // Dependents
    line1e: false, // >1 Job or Spouse Works

    // Additional Withholding
    additional_withholding: '',

    // Exemption
    exempt: false,

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingStatuses = [
    { code: '1', label: 'Single' },
    { code: '2', label: 'Married' },
    { code: '3', label: 'Married, but withhold at Single Rate' }
  ];

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
            state: 'NE'
        }));
    }
  }, [initialData]);

  // Canvas Resize
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        // --- FIX: USE getCanvas() ---
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

  // Calculate Total Allowances
  const totalAllowances = 
    (formData.line1a ? 1 : 0) + 
    (formData.line1b ? 1 : 0) + 
    (formData.line1c ? 1 : 0) + 
    parseInt(formData.line1d || 0) + 
    (formData.line1e ? 1 : 0);

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 hover:border-blue-300 text-gray-800";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-700 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-8 flex items-center gap-3";
  const checkboxCardClass = "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-300 bg-white hover:bg-blue-50/30";
  const activeCheckboxClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

  return (
    <div className="bg-white px-8 py-8 max-w-5xl mx-auto shadow-sm rounded-2xl border border-gray-100">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nebraska Employee Withholding</h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 font-medium">
            <FileText size={16}/>
            <p className="text-sm">Form W-4N</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* PERSONAL INFO */}
        <section>
            <h3 className={sectionHeader}><User className="text-blue-600"/> Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" value={formData.middle_initial} onChange={handleChange} className={inputClass} maxLength={1} /></div>
                <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} required /></div>
                
                <div className="md:col-span-6"><label className={labelClass}>SSN</label><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={inputClass} placeholder="XXX-XX-XXXX" required/></div>
                <div className="md:col-span-6"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-4"><label className={labelClass}>State</label><input type="text" value="NE" readOnly className={`${inputClass} bg-gray-50 text-gray-500 text-center font-bold`} /></div>
                <div className="md:col-span-4"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} required /></div>
            </div>
        </section>

        {/* FILING STATUS */}
        <section>
            <h3 className={sectionHeader}><FileText className="text-blue-600"/> Filing Status</h3>
            <div className="grid grid-cols-1 gap-4">
                {filingStatuses.map(status => (
                    <label key={status.code} className={`${checkboxCardClass} ${formData.filing_status === status.code ? activeCheckboxClass : 'border-gray-200'}`}>
                        <input type="radio" name="filing_status" value={status.code} checked={formData.filing_status === status.code} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-900 font-medium">{status.label}</span>
                    </label>
                ))}
            </div>
        </section>

        {/* ALLOWANCES */}
        <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600"/> Allowances Worksheet</h3>
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                
                <label className="flex items-center gap-3"><input type="checkbox" name="line1a" checked={formData.line1a} onChange={handleChange} /> A. Enter "1" for yourself.</label>
                <label className="flex items-center gap-3"><input type="checkbox" name="line1b" checked={formData.line1b} onChange={handleChange} /> B. Enter "1" if filing as Married.</label>
                <label className="flex items-center gap-3"><input type="checkbox" name="line1c" checked={formData.line1c} onChange={handleChange} /> C. Enter "1" if Head of Household.</label>
                
                <div className="flex items-center gap-3">
                    <label>D. Dependents:</label>
                    <input type="number" name="line1d" value={formData.line1d} onChange={handleChange} className="w-20 p-1 border rounded" />
                </div>

                <label className="flex items-center gap-3"><input type="checkbox" name="line1e" checked={formData.line1e} onChange={handleChange} /> E. Enter "1" if you have 1 job or spouse works.</label>

                <div className="flex items-center justify-between p-3 bg-blue-100 rounded border border-blue-200 mt-2">
                    <span className="font-bold text-blue-900">Total Allowances (Line 1)</span>
                    <span className="font-bold text-lg text-blue-900">{totalAllowances}</span>
                </div>
            </div>
        </section>

        {/* ADDITIONAL & EXEMPT */}
        <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600"/> Additional Withholding & Exempt</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                
                {/* Line 2 */}
                <div>
                    <label className={labelClass}>Line 2: Additional Amount to Withhold ($)</label>
                    <input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={inputClass} placeholder="0.00" />
                </div>

                {/* Line 3: Exempt */}
                <div className="border-t border-gray-200 pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="exempt" checked={formData.exempt} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="font-bold text-lg text-blue-900">I claim Exemption from withholding (Line 3)</span>
                    </label>
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
  );
};

export default NebraskaTaxForm;