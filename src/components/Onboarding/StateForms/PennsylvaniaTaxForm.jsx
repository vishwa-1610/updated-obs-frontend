import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, CheckCircle, MapPin } from 'lucide-react';

const CustomDatePicker = ({ label, name, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(value || new Date()));
  
  useEffect(() => { if(value) setCurrentDate(new Date(value)); }, [value]);

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
        <input readOnly type="text" value={value || ''} placeholder="YYYY-MM-DD" className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50/50 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 rounded-xl shadow-xl border border-gray-100 bg-white w-64">
          <div className="flex justify-between font-bold mb-2"><span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span></div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({length: 31}, (_,i)=>i+1).map(d => (
              <button key={d} type="button" onClick={() => handleDateClick(d)} className="p-1 hover:bg-blue-50 rounded text-sm">{d}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PennsylvaniaTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', ssn: '',
    address: '', city: '', state: 'PA', zipcode: '',
    phone_no: '', tax_year: new Date().getFullYear().toString(),
    
    exemption_type: '', // a, b, or c
    reciprocal_state: '', // INDIANA, MARYLAND, etc.

    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  useEffect(() => {
    if (initialData && !dataLoadedRef.current) {
        setFormData(prev => ({
            ...prev,
            first_name: initialData.first_name || '',
            last_name: initialData.last_name || '',
            ssn: initialData.ssn || '',
            address: initialData.address || '',
            city: initialData.city || '',
            zipcode: (initialData.zipcode || '').slice(0, 5),
            phone_no: initialData.phone_no || '',
            // If user is from reciprocal state, maybe set state here? Keeping PA default for form context.
            state: initialData.state || 'PA' 
        }));
        dataLoadedRef.current = true;
    }
  }, [initialData]);

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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pennsylvania REV-419</h1>
          <p className="text-gray-500 font-medium">Employee’s Nonwithholding Application Certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. PERSONAL */}
          <section className={sectionClass}>
            <h3 className={headerClass}><User className="text-blue-600" size={24}/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>SSN</label><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Phone</label><input type="text" name="phone_no" value={formData.phone_no} onChange={handleChange} className={inputClass} /></div>
                
                <div className="md:col-span-2"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} /></div>
                
                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                    <div><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>State</label><input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Zip</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} /></div>
                </div>

                <div><label className={labelClass}>Tax Year</label><input type="text" name="tax_year" value={formData.tax_year} onChange={handleChange} className={inputClass} /></div>
            </div>
          </section>

          {/* 2. EXEMPTION SELECTION */}
          <section className={sectionClass}>
            <h3 className={headerClass}><CheckCircle className="text-blue-600" size={24}/> Exemption Reason (Choose One)</h3>
            <div className="space-y-4">
                
                {/* Option A */}
                <label className={`${checkboxCardClass} ${formData.exemption_type === 'a' ? activeCheckboxClass : ''}`}>
                    <input type="radio" name="exemption_type" value="a" checked={formData.exemption_type === 'a'} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300" />
                    <div>
                        <span className="block font-bold text-gray-900">A. Tax Forgiveness</span>
                        <span className="text-xs text-gray-500">I certify that I will incur no PA income tax liability because I am eligible for tax forgiveness.</span>
                    </div>
                </label>

                {/* Option B */}
                <label className={`${checkboxCardClass} ${formData.exemption_type === 'b' ? activeCheckboxClass : ''}`}>
                    <input type="radio" name="exemption_type" value="b" checked={formData.exemption_type === 'b'} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300" />
                    <div className="w-full">
                        <span className="block font-bold text-gray-900">B. Resident of Reciprocal State</span>
                        <span className="text-xs text-gray-500">I certify that I reside in the state selected below.</span>
                        
                        {formData.exemption_type === 'b' && (
                            <div className="mt-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                                {['INDIANA', 'MARYLAND', 'NEW JERSEY', 'OHIO', 'VIRGINIA', 'WEST VIRGINIA'].map(st => (
                                    <label key={st} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${formData.reciprocal_state === st ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                        <input type="radio" name="reciprocal_state" value={st} checked={formData.reciprocal_state === st} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-bold text-gray-700">{st}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </label>

                {/* Option C */}
                <label className={`${checkboxCardClass} ${formData.exemption_type === 'c' ? activeCheckboxClass : ''}`}>
                    <input type="radio" name="exemption_type" value="c" checked={formData.exemption_type === 'c'} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300" />
                    <div>
                        <span className="block font-bold text-gray-900">C. Military Spouses Residency Relief Act</span>
                        <span className="text-xs text-gray-500">I certify I am the spouse of an active duty service member and we are domiciliaries of the same state (not PA).</span>
                    </div>
                </label>

            </div>
          </section>

          {/* 3. SIGNATURE */}
          <section className={sectionClass}>
            <h3 className={headerClass}><PenTool className="text-blue-600" size={24}/> Declaration & Signature</h3>
            
            <p className="text-gray-600 text-xs mb-6 uppercase tracking-wide font-bold">
                I declare that this certificate has been examined by me and to the best of my knowledge and belief is true, correct, and complete.
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

export default PennsylvaniaTaxForm;