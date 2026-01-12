import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, DollarSign, Calendar, Eraser, Save, PenTool, FileText, Calculator, Building, MapPin, CheckCircle, HelpCircle } from 'lucide-react';

// --- CUSTOM DATE PICKER ---
const CustomDatePicker = ({ label, name, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(value || new Date()));
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold mb-1.5 text-gray-700">{label}</label>
      <div className="relative cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
        <input readOnly type="text" value={value || ''} placeholder="YYYY-MM-DD" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 hover:border-blue-300 text-gray-800" />
      </div>
      {isOpen && (
        <div className="absolute z-50 p-4 rounded-xl shadow-xl border border-gray-100 bg-white mt-2 w-64">
          <div className="flex justify-between mb-4 font-bold text-gray-800">
            <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
              <button key={d} type="button" onClick={() => handleDateClick(d)} className="p-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg">{d}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN NEW YORK FORM ---
const NewYorkTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '', last_name: '', middle_initial: '', ssn: '', 
    address: '', apartment: '', city: '', state: 'NY', zipcode: '',

    // Filing Status
    filing_status: '1', // 1=Single, 2=Married, 3=HOH

    // Residency
    nyc_resident: false,
    yonkers_resident: false,

    // Allowances (Lines 1-5)
    allowances: 0,      // Line 1: NY Allowances
    nyc_allowances: 0,  // Line 2: NYC Allowances
    ny_extra: '',       // Line 3: NY Extra Withholding
    nyc_extra: '',      // Line 4: NYC Extra Withholding
    yonkers_extra: '',  // Line 5: Yonkers Extra Withholding

    // Employer Reporting Section
    over_14: false,     // "Are you 14-17?"
    new_hire: false,    // "Are you a new hire?"
    hire_date: '',
    health_benefits: false,
    benefit_date: '',

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingStatuses = [
    { code: '1', label: 'Single or Head of Household' },
    { code: '2', label: 'Married' },
    { code: '3', label: 'Married, but withhold at higher Single rate' }
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
            state: 'NY' // Force NY
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

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 hover:border-blue-300 text-gray-800";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-700 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-8 flex items-center gap-3";
  const checkboxCardClass = "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-300 bg-white hover:bg-blue-50/30";
  const activeCheckboxClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

  return (
    <div className="bg-white px-8 py-8 max-w-5xl mx-auto shadow-sm rounded-2xl border border-gray-100">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">New York Employee Withholding</h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 font-medium">
            <FileText size={16}/>
            <p className="text-sm">Form IT-2104</p>
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
                <div className="md:col-span-6"><label className={labelClass}>Apartment / Suite</label><input type="text" name="apartment" value={formData.apartment} onChange={handleChange} className={inputClass} placeholder="Optional" /></div>

                <div className="md:col-span-12"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} required /></div>
                
                <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-4"><label className={labelClass}>State</label><input type="text" value="NY" readOnly className={`${inputClass} bg-gray-50 text-gray-500 text-center font-bold`} /></div>
                <div className="md:col-span-4"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} required /></div>
            </div>
        </section>

        {/* FILING STATUS & RESIDENCY */}
        <section>
            <h3 className={sectionHeader}><MapPin className="text-blue-600"/> Status & Residency</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Filing Status */}
                <div className="space-y-3">
                    <label className={labelClass}>Filing Status</label>
                    {filingStatuses.map(status => (
                        <label key={status.code} className={`${checkboxCardClass} ${formData.filing_status === status.code ? activeCheckboxClass : 'border-gray-200'}`}>
                            <input type="radio" name="filing_status" value={status.code} checked={formData.filing_status === status.code} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-900 font-medium">{status.label}</span>
                        </label>
                    ))}
                </div>

                {/* Residency */}
                <div className="space-y-3">
                    <label className={labelClass}>Residency (Check if Yes)</label>
                    <label className={`${checkboxCardClass} ${formData.nyc_resident ? activeCheckboxClass : 'border-gray-200'}`}>
                        <input type="checkbox" name="nyc_resident" checked={formData.nyc_resident} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-900 font-medium">Are you a resident of New York City?</span>
                    </label>
                    <label className={`${checkboxCardClass} ${formData.yonkers_resident ? activeCheckboxClass : 'border-gray-200'}`}>
                        <input type="checkbox" name="yonkers_resident" checked={formData.yonkers_resident} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-900 font-medium">Are you a resident of Yonkers?</span>
                    </label>
                </div>
            </div>
        </section>

        {/* ALLOWANCES (LINES 1-5) */}
        <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600"/> Allowances & Extra Withholding</h3>
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>1. Total NY State Allowances</label>
                        <input type="number" name="allowances" value={formData.allowances} onChange={handleChange} min="0" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>2. Total NYC Allowances</label>
                        <input type="number" name="nyc_allowances" value={formData.nyc_allowances} onChange={handleChange} min="0" className={inputClass} disabled={!formData.nyc_resident} placeholder={!formData.nyc_resident ? "N/A" : "0"}/>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>3. NY State Extra ($)</label>
                        <input type="number" name="ny_extra" value={formData.ny_extra} onChange={handleChange} className={inputClass} placeholder="0.00" />
                    </div>
                    <div>
                        <label className={labelClass}>4. NYC Extra ($)</label>
                        <input type="number" name="nyc_extra" value={formData.nyc_extra} onChange={handleChange} className={inputClass} placeholder="0.00" />
                    </div>
                    <div>
                        <label className={labelClass}>5. Yonkers Extra ($)</label>
                        <input type="number" name="yonkers_extra" value={formData.yonkers_extra} onChange={handleChange} className={inputClass} placeholder="0.00" />
                    </div>
                </div>
            </div>
        </section>

        {/* EMPLOYER REPORTING (BOTTOM OF FORM) */}
        <section>
            <h3 className={sectionHeader}><Building className="text-blue-600"/> Employer Reporting Questions</h3>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                
                <label className="flex items-center gap-3">
                    <input type="checkbox" name="over_14" checked={formData.over_14} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                    <span className="text-gray-800 font-medium">Are you 14-17 years of age?</span>
                </label>

                <div className="border-t border-blue-200 my-2"></div>

                <div className="flex flex-wrap gap-6 items-center">
                    <label className="flex items-center gap-3">
                        <input type="checkbox" name="new_hire" checked={formData.new_hire} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="text-gray-800 font-medium">Are you a new hire?</span>
                    </label>
                    {formData.new_hire && (
                        <div className="w-48 animate-in fade-in">
                            <CustomDatePicker label="Hire Date" name="hire_date" value={formData.hire_date} onChange={handleChange} />
                        </div>
                    )}
                </div>

                <div className="border-t border-blue-200 my-2"></div>

                <div className="flex flex-wrap gap-6 items-center">
                    <label className="flex items-center gap-3">
                        <input type="checkbox" name="health_benefits" checked={formData.health_benefits} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="text-gray-800 font-medium">Dependent Health Insurance Available?</span>
                    </label>
                    {formData.health_benefits && (
                        <div className="w-48 animate-in fade-in">
                            <CustomDatePicker label="Date Qualified" name="benefit_date" value={formData.benefit_date} onChange={handleChange} />
                        </div>
                    )}
                </div>

            </div>
        </section>

        {/* SIGNATURE */}
        <section className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <p className="text-sm text-gray-700 mb-6 font-medium">
                I certify that I am entitled to the number of withholding allowances claimed on this certificate.
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

export default NewYorkTaxForm;