import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, Calculator, CheckCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

// --- CUSTOM DATE PICKER ---
const CustomDatePicker = ({ label, name, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(() => {
      const d = new Date(value);
      return isNaN(d.getTime()) ? new Date() : d;
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if(value) setCurrentDate(new Date(value)); }, [value]);

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
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors" />
        <input readOnly type="text" value={value || ''} placeholder="YYYY-MM-DD" className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer placeholder-gray-400 shadow-sm" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 bg-white w-72 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className="text-sm font-bold text-gray-900">{monthNames[currentDate.getMonth()]}</button>
            <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className="text-sm font-bold text-gray-900">{currentDate.getFullYear()}</button>
          </div>
          {view === 'calendar' && (
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate()}, (_,i)=>i+1).map(d => (
                <button key={d} type="button" onClick={() => handleDateClick(d)} className="h-8 w-8 text-sm rounded-lg hover:bg-gray-50 text-gray-700">{d}</button>
              ))}
            </div>
          )}
          {view === 'year' && <div className="h-48 overflow-y-auto grid grid-cols-3 gap-2">{years.map(y=><button key={y} onClick={()=>{setCurrentDate(new Date(y,currentDate.getMonth(),1));setView('calendar')}} className="p-2 text-sm hover:bg-gray-50 rounded-lg text-gray-700">{y}</button>)}</div>}
        </div>
      )}
    </div>
  );
};

// --- MAIN NC FORM ---
const NorthCarolinaTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [formData, setFormData] = useState({
    first_name: '', middle_initial: '', last_name: '', ssn: '',
    address: '', city: '', state: 'NC', zipcode: '', county: '', country: '',
    
    filing_status: '1', // 1=Single/MFS, 2=Head, 3=MFJ/Surviving
    allowances: '0',
    additional_withholding: '',

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
            state: 'NC',
            county: 'Wake' // Default or load from data
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
    const { name, value } = e.target;
    if (name === 'zipcode') {
        setFormData(prev => ({ ...prev, [name]: value.slice(0, 5) }));
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // Styles
  const sectionClass = "bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-shadow duration-300";
  const headerClass = "text-xl font-bold text-gray-900 flex items-center gap-3 mb-6 pb-4 border-b border-gray-100";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder-gray-400 shadow-sm";
  const checkboxCardClass = "group relative flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/10";

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">North Carolina NC-4</h1>
          <p className="text-gray-500 font-medium">Employee's Withholding Allowance Certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. PERSONAL */}
          <section className={sectionClass}>
            <h3 className={headerClass}><User className="text-blue-600" size={24}/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="JOHN" /></div>
                <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" maxLength="1" value={formData.middle_initial} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" /></div>
                <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="DOE" /></div>
                
                <div className="md:col-span-6"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="XXX-XX-XXXX" /><Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div className="md:col-span-6"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} placeholder="00000" /></div>

                <div className="md:col-span-8"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street Address" /></div>
                <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} /></div>
                
                <div className="md:col-span-6"><label className={labelClass}>County (First 5 Letters)</label><input type="text" name="county" value={formData.county} onChange={handleChange} className={inputClass} maxLength="5" placeholder="WAKE" /></div>
                <div className="md:col-span-6"><label className={labelClass}>Country (If not U.S.)</label><input type="text" name="country" value={formData.country} onChange={handleChange} className={inputClass} placeholder="USA" /></div>
            </div>
          </section>

          {/* 2. FILING STATUS */}
          <section className={sectionClass}>
            <h3 className={headerClass}><CheckCircle className="text-blue-600" size={24}/> Filing Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {id: '1', l: 'Single / Married Filing Separately'},
                    {id: '2', l: 'Head of Household'},
                    {id: '3', l: 'Married Filing Jointly / Surviving Spouse'}
                ].map(opt => (
                    <label key={opt.id} className={`${checkboxCardClass} h-full ${formData.filing_status === opt.id ? activeCheckboxClass : ''}`}>
                        <input type="radio" name="filing_status" value={opt.id} checked={formData.filing_status === opt.id} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <div>
                            <span className="block font-bold text-gray-900 text-sm">{opt.l}</span>
                        </div>
                    </label>
                ))}
            </div>
          </section>

          {/* 3. ALLOWANCES */}
          <section className={sectionClass}>
            <h3 className={headerClass}><Calculator className="text-blue-600" size={24}/> Allowances</h3>
            
            <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-800 mb-4 font-medium">
                        Complete the NC-4 Allowance Worksheet to determine your allowances. Enter the total below.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Line 1: Total Allowances</label>
                            <input type="number" name="allowances" value={formData.allowances} onChange={handleChange} className={`${inputClass} text-lg font-bold text-blue-600`} min="0" />
                        </div>
                        <div>
                            <label className={labelClass}>Line 2: Additional Withholding ($)</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                <input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </section>

          {/* 4. SIGNATURE */}
          <section className={sectionClass}>
            <h3 className={headerClass}><PenTool className="text-blue-600" size={24}/> Signature</h3>
            
            <p className="text-gray-600 text-xs mb-6 uppercase tracking-wide font-bold">
                I certify that I am entitled to the number of withholding allowances claimed on this certificate.
            </p>

            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center mb-3">
                    <label className={labelClass}>Digital Signature <span className="text-red-500">*</span></label>
                    <button type="button" onClick={clearSignature} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"><Eraser size={14}/> Clear</button>
                </div>
                
                <div ref={containerRef} className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-white h-56 w-full relative hover:border-blue-400 transition-colors shadow-inner cursor-crosshair">
                    <SignatureCanvas 
                        ref={sigCanvasRef}
                        penColor="black"
                        velocityFilterWeight={0.7}
                        canvasProps={{ className: 'sigCanvas w-full h-full' }}
                        onEnd={handleSignatureEnd}
                    />
                    {!formData.signature_image && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 gap-3">
                          <PenTool size={24} className="opacity-50" />
                          <span className="font-medium text-sm">Sign Here</span>
                       </div>
                    )}
                </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-6">
            <button 
                type="submit" 
                disabled={!formData.signature_image} 
                className={`
                    relative overflow-hidden px-10 py-4 rounded-xl font-bold text-lg shadow-xl transform transition-all duration-200 flex items-center gap-3
                    ${formData.signature_image 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:-translate-y-1 active:scale-95' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
            >
                <Save size={22} className={formData.signature_image ? 'animate-pulse' : ''} />
                <span>Confirm & Generate PDF</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NorthCarolinaTaxForm;