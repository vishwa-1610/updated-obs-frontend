import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, Calculator, CheckCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

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

const WestVirginiaTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [formData, setFormData] = useState({
    first_name: '', middle_initial: '', last_name: '', ssn: '',
    address: '', city: '', state: 'WV', zipcode: '',
    
    // 1=Single, 2=Married, 3=Head
    filing_status: '1',
    claim_spouse: false,
    dependents: 0,
    
    lower_rate: false,
    additional_withholding: '',

    // Non-Resident (Page 2)
    use_nonresidence: false,
    nonresident_state: '',

    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

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
            state: 'WV' // Default to WV for form context
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
  const line1 = (formData.filing_status === '1' || formData.filing_status === '3' || formData.filing_status === '2') ? 1 : 0; // Simplified base
  const line2 = (formData.filing_status === '2' && formData.claim_spouse) ? 1 : 0;
  const line3 = parseInt(formData.dependents || 0);
  const total = line1 + line2 + line3;

  // Styles
  const sectionClass = "bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all";
  const headerClass = "text-xl font-bold text-gray-900 flex items-center gap-3 mb-6 pb-4 border-b border-gray-100";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50/50 outline-none focus:ring-2 focus:ring-blue-500/20";
  const checkboxCardClass = "group relative flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/10";

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">West Virginia IT-104</h1>
          <p className="text-gray-500 font-medium">Employee's Withholding Exemption Certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. PERSONAL */}
          <section className={sectionClass}>
            <h3 className={headerClass}><User className="text-blue-600" size={24}/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>SSN</label><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} /></div>
                <div className="md:col-span-2"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} /></div>
                <div className="md:col-span-2 grid grid-cols-3 gap-6">
                    <div className="col-span-2"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>State</label><input type="text" value={formData.state} onChange={handleChange} className={inputClass} /></div>
                </div>
            </div>
          </section>

          {/* 2. EXEMPTIONS (IT-104) */}
          <section className={sectionClass}>
            <h3 className={headerClass}><Calculator className="text-blue-600" size={24}/> Withholding Exemptions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                    {id: '1', l: 'Single'},
                    {id: '2', l: 'Married'},
                    {id: '3', l: 'Head of Household'}
                ].map(opt => (
                    <label key={opt.id} className={`${checkboxCardClass} h-full ${formData.filing_status === opt.id ? activeCheckboxClass : ''}`}>
                        <input type="radio" name="filing_status" value={opt.id} checked={formData.filing_status === opt.id} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300" />
                        <span className="font-bold text-gray-900 text-sm">{opt.l}</span>
                    </label>
                ))}
            </div>

            {formData.filing_status === '2' && (
                <div className="mb-6">
                    <label className={`${checkboxCardClass} ${formData.claim_spouse ? activeCheckboxClass : ''}`}>
                        <input type="checkbox" name="claim_spouse" checked={formData.claim_spouse} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                        <div>
                            <span className="block font-bold text-gray-900">Claim Spouse Exemption</span>
                            <span className="text-xs text-gray-500">Only if spouse is not claiming it.</span>
                        </div>
                    </label>
                </div>
            )}

            <div className="mb-6">
                <label className={labelClass}>Number of Dependents</label>
                <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className={inputClass} min="0" placeholder="0" />
            </div>

            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white shadow-lg mb-6">
                <div className="flex items-center gap-3">
                    <CheckCircle className="text-blue-200" size={32} />
                    <div>
                        <span className="block text-blue-100 text-sm font-medium uppercase tracking-wider">Total Exemptions</span>
                        <span className="block text-2xl font-bold">Line 4 Total</span>
                    </div>
                </div>
                <span className="text-5xl font-extrabold tracking-tighter">{total}</span>
            </div>

            <div className="space-y-4">
                <label className={`${checkboxCardClass} ${formData.lower_rate ? activeCheckboxClass : ''}`}>
                    <input type="checkbox" name="lower_rate" checked={formData.lower_rate} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                    <div>
                        <span className="block font-bold text-gray-900">Request Lower Withholding Rate</span>
                        <span className="text-xs text-gray-500">Check if eligible (Single/Head, one job, income limits).</span>
                    </div>
                </label>
                
                <div>
                    <label className={labelClass}>Additional Withholding ($)</label>
                    <input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={inputClass} placeholder="0.00" />
                </div>
            </div>
          </section>

          {/* 3. NON-RESIDENCE (IT-104NR) */}
          <section className={sectionClass}>
            <h3 className={headerClass}><MapPin className="text-blue-600" size={24}/> Non-Residence (Page 2)</h3>
            
            <label className={`${checkboxCardClass} ${formData.use_nonresidence ? activeCheckboxClass : ''}`}>
                <input type="checkbox" name="use_nonresidence" checked={formData.use_nonresidence} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                <div>
                    <span className="block font-bold text-gray-900">Claim Non-Residence Exemption</span>
                    <span className="text-xs text-gray-500">Resident of KY, MD, OH, PA, VA or Military Spouse.</span>
                </div>
            </label>

            {formData.use_nonresidence && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-4">
                    <label className={labelClass}>State of Residence / Domicile</label>
                    <input type="text" name="nonresident_state" value={formData.nonresident_state} onChange={handleChange} className={inputClass} placeholder="e.g. PENNSYLVANIA" />
                    <p className="text-xs text-gray-500 mt-2">Enter your legal state of residence.</p>
                </div>
            )}
          </section>

          {/* 4. SIGNATURE */}
          <section className={sectionClass}>
            <h3 className={headerClass}><PenTool className="text-blue-600" size={24}/> Declaration & Signature</h3>
            
            <div className="mb-8 max-w-xs">
                <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
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

export default WestVirginiaTaxForm;