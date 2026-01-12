import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, Calculator, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// --- CUSTOM DATE PICKER (Stunning Version) ---
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
        <ChevronDown size={16} className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 bg-white w-72 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">{monthNames[currentDate.getMonth()]}</button>
            <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">{currentDate.getFullYear()}</button>
          </div>
          {view === 'calendar' && (
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><span key={d} className="text-[10px] font-bold text-gray-400 uppercase mb-1">{d}</span>)}
              {Array.from({length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate()}, (_,i)=>i+1).map(d => (
                <button key={d} type="button" onClick={() => handleDateClick(d)} className={`h-8 w-8 text-sm rounded-lg transition-all ${value && parseInt(value.split('-')[2]) === d ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}>{d}</button>
              ))}
            </div>
          )}
          {view === 'year' && <div className="h-48 overflow-y-auto grid grid-cols-3 gap-2">{years.map(y=><button key={y} onClick={()=>{setCurrentDate(new Date(y,currentDate.getMonth(),1));setView('calendar')}} className="p-2 text-sm hover:bg-gray-50 rounded-lg text-gray-700">{y}</button>)}</div>}
        </div>
      )}
    </div>
  );
};

// --- MAIN VA FORM ---
const VirginiaTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [formData, setFormData] = useState({
    first_name: '', middle_initial: '', last_name: '', ssn: '',
    address: '', city: '', state: 'VA', zipcode: '',
    
    // Worksheet Flags
    claim_self: true,
    claim_spouse: false,
    dependents: 0,
    
    age_65_self: false,
    age_65_spouse: false,
    blind_self: false,
    blind_spouse: false,

    additional_withholding: '',
    exempt: false,
    military_exempt: false,

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
            state: 'VA'
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

  // Calculations
  const ex1 = formData.claim_self ? 1 : 0;
  const ex2 = formData.claim_spouse ? 1 : 0;
  const ex3 = parseInt(formData.dependents || 0);
  const totalPersonal = ex1 + ex2 + ex3;

  const ex5a = formData.age_65_self ? 1 : 0;
  const ex5b = formData.age_65_spouse ? 1 : 0;
  const ex6a = formData.blind_self ? 1 : 0;
  const ex6b = formData.blind_spouse ? 1 : 0;
  const totalAgeBlind = ex5a + ex5b + ex6a + ex6b;

  const grandTotal = totalPersonal + totalAgeBlind;

  // --- STYLES ---
  const sectionClass = "bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-shadow duration-300";
  const headerClass = "text-xl font-bold text-gray-900 flex items-center gap-3 mb-6 pb-4 border-b border-gray-100";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder-gray-400 shadow-sm";
  const checkboxCardClass = "group relative flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/10";

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Virginia Form VA-4</h1>
          <p className="text-gray-500 font-medium">Employee's Withholding Exemption Certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. PERSONAL */}
          <section className={sectionClass}>
            <h3 className={headerClass}><User className="text-blue-600" size={24}/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" /></div>
                <div><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" /></div>
                <div><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="XXX-XX-XXXX" /><Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                <div><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} placeholder="00000" /></div>
                <div className="md:col-span-2"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Street Address" /></div>
                <div className="md:col-span-2 grid grid-cols-3 gap-6">
                    <div className="col-span-2"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>State</label><input type="text" value="VA" readOnly className={`${inputClass} bg-gray-100 text-gray-500 text-center font-bold`} /></div>
                </div>
            </div>
          </section>

          {/* 2. PERSONAL EXEMPTIONS */}
          <section className={sectionClass}>
            <h3 className={headerClass}><Calculator className="text-blue-600" size={24}/> Personal Exemptions</h3>
            
            {/* Self / Spouse Claims */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <label className={`${checkboxCardClass} ${formData.claim_self ? activeCheckboxClass : ''}`}>
                    <input type="checkbox" name="claim_self" checked={formData.claim_self} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <div>
                        <span className="block font-bold text-gray-900">Claim Exemption for Self</span>
                        <span className="text-xs text-gray-500">Standard personal exemption (1).</span>
                    </div>
                </label>
                <label className={`${checkboxCardClass} ${formData.claim_spouse ? activeCheckboxClass : ''}`}>
                    <input type="checkbox" name="claim_spouse" checked={formData.claim_spouse} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <div>
                        <span className="block font-bold text-gray-900">Claim Exemption for Spouse</span>
                        <span className="text-xs text-gray-500">If not claimed on their own certificate (1).</span>
                    </div>
                </label>
            </div>
            
            {/* Dependents */}
            <div className="mb-8">
                <label className={labelClass}>Number of Dependents</label>
                <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className={inputClass} min="0" placeholder="0" />
            </div>

            {/* Age & Blindness Grid */}
            <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><CheckCircle size={16}/> Age & Blindness Exemptions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={checkboxCardClass}>
                        <input type="checkbox" name="age_65_self" checked={formData.age_65_self} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                        <span className="font-bold text-gray-900">I am 65 or over</span>
                    </label>
                    <label className={checkboxCardClass}>
                        <input type="checkbox" name="blind_self" checked={formData.blind_self} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                        <span className="font-bold text-gray-900">I am Blind</span>
                    </label>
                    <label className={checkboxCardClass}>
                        <input type="checkbox" name="age_65_spouse" checked={formData.age_65_spouse} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                        <span className="font-bold text-gray-900">Spouse is 65 or over</span>
                    </label>
                    <label className={checkboxCardClass}>
                        <input type="checkbox" name="blind_spouse" checked={formData.blind_spouse} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                        <span className="font-bold text-gray-900">Spouse is Blind</span>
                    </label>
                </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white shadow-lg mt-8">
                <div className="flex items-center gap-3">
                    <CheckCircle className="text-blue-200" size={32} />
                    <div>
                        <span className="block text-blue-100 text-sm font-medium uppercase tracking-wider">Total Exemptions</span>
                        <span className="block text-2xl font-bold">Line 8 Total</span>
                    </div>
                </div>
                <span className="text-5xl font-extrabold tracking-tighter">{grandTotal}</span>
            </div>
          </section>

          {/* 3. ADDITIONAL & EXEMPTIONS */}
          <section className={sectionClass}>
            <h3 className={headerClass}><DollarSign className="text-blue-600" size={24}/> Adjustments</h3>
            <div className="space-y-6">
                <div>
                    <label className={labelClass}>Additional Withholding ($)</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                    </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6 grid grid-cols-1 gap-4">
                    <label className={`${checkboxCardClass} ${formData.exempt ? 'border-red-500 bg-red-50/10 ring-1 ring-red-500' : ''}`}>
                        <input type="checkbox" name="exempt" checked={formData.exempt} onChange={handleChange} className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"/>
                        <div>
                            <span className={`block font-bold ${formData.exempt ? 'text-red-700' : 'text-gray-900'}`}>Claim Exemption from Withholding</span>
                            <span className={`text-xs ${formData.exempt ? 'text-red-600' : 'text-gray-500'}`}>Check only if you meet the conditions for full exemption.</span>
                        </div>
                    </label>
                    
                    <label className={`${checkboxCardClass} ${formData.military_exempt ? activeCheckboxClass : ''}`}>
                        <input type="checkbox" name="military_exempt" checked={formData.military_exempt} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded"/>
                        <div>
                            <span className="block font-bold text-gray-900">Military Spouse Exemption (MSRRA)</span>
                            <span className="text-xs text-gray-500">I am the spouse of an active duty service member and we are domiciliaries of the same state.</span>
                        </div>
                    </label>
                </div>
            </div>
          </section>

          {/* 4. SIGNATURE */}
          <section className={sectionClass}>
            <h3 className={headerClass}><PenTool className="text-blue-600" size={24}/> Declaration & Signature</h3>
            
            <p className="text-gray-600 text-sm mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                I certify that the number of withholding exemptions claimed on this certificate does not exceed the number to which I am entitled.
            </p>

            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center mb-3">
                    <label className={labelClass}>Digital Signature <span className="text-red-500">*</span></label>
                    <button type="button" onClick={clearSignature} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"><Eraser size={14}/> CLEAR SIGNATURE</button>
                </div>
                
                <div ref={containerRef} className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-white h-56 w-full relative hover:border-blue-400 transition-colors shadow-inner group cursor-crosshair">
                    <SignatureCanvas 
                        ref={sigCanvasRef}
                        penColor="black"
                        velocityFilterWeight={0.7}
                        canvasProps={{ className: 'sigCanvas w-full h-full' }}
                        onEnd={handleSignatureEnd}
                    />
                    {!formData.signature_image && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 gap-3 group-hover:text-blue-400 transition-colors">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors"><PenTool size={20} className="opacity-50"/></div>
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

export default VirginiaTaxForm;