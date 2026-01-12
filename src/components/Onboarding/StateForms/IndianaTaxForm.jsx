import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, DollarSign, Calendar, Eraser, Save, PenTool, FileText, Calculator, MapPin, Eye, Clock } from 'lucide-react';

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

// --- MAIN INDIANA FORM ---
const IndianaTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '', last_name: '', ssn: '', address: '', city: '', state: 'IN', zipcode: '',
    
    // Indiana Specifics
    county_residence: '',
    county_employment: '',

    // Exemptions (Lines 1-3)
    self_exemption: 1,
    spouse_exemption: 0,
    dependent_exemptions: 0,

    // Additional Checkboxes (Line 4)
    is_self_65: false, is_self_blind: false,
    is_spouse_65: false, is_spouse_blind: false,

    // Other Lines
    additional_dependent_exemptions: 0, // Line 6
    additional_state_withholding: '',   // Line 7
    additional_county_withholding: '',  // Line 8

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            first_name: initialData.first_name || '',
            last_name: initialData.last_name || '',
            ssn: initialData.ssn || '',
            address: initialData.address || '',
            city: initialData.city || '',
            zipcode: initialData.zipcode || '',
            state: 'IN', // Force IN
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
        // Use getCanvas() to avoid cropping
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

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 hover:border-blue-300 text-gray-800";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-700 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-8 flex items-center gap-3";
  const checkboxCardClass = "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-300 bg-white hover:bg-blue-50/30";
  const activeCheckboxClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

  return (
    <div className="bg-white px-8 py-8 max-w-5xl mx-auto shadow-sm rounded-2xl border border-gray-100">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Indiana Employee Withholding</h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 font-medium">
            <FileText size={16}/>
            <p className="text-sm">Form WH-4</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* PERSONAL INFO */}
        <section>
            <h3 className={sectionHeader}><User className="text-blue-600"/> Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} required /></div>
                <div><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} required /></div>
                <div><label className={labelClass}>SSN</label><input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={inputClass} placeholder="XXX-XX-XXXX" required/></div>
                <div><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} required /></div>
                <div><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>State</label><input type="text" value="IN" readOnly className={`${inputClass} bg-gray-50 text-gray-500 text-center font-bold`} /></div>
                  <div><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} required /></div>
                </div>
            </div>
        </section>

        {/* INDIANA COUNTIES */}
        <section>
            <h3 className={sectionHeader}><MapPin className="text-blue-600"/> County Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-6 rounded-xl border border-blue-100">
                <div>
                    <label className={labelClass}>County of Residence</label>
                    <input type="text" name="county_residence" value={formData.county_residence} onChange={handleChange} className={inputClass} placeholder="Enter Indiana County" required />
                    <p className="text-xs text-gray-500 mt-1">Where you lived on Jan 1 of this year.</p>
                </div>
                <div>
                    <label className={labelClass}>County of Employment</label>
                    <input type="text" name="county_employment" value={formData.county_employment} onChange={handleChange} className={inputClass} placeholder="Enter Indiana County" required />
                    <p className="text-xs text-gray-500 mt-1">Where you work (as of Jan 1).</p>
                </div>
            </div>
        </section>

        {/* EXEMPTIONS */}
        <section>
            <h3 className={sectionHeader}><Calculator className="text-blue-600"/> Exemptions (Lines 1-4)</h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Yourself (Line 1)</label>
                        <input type="number" name="self_exemption" value={formData.self_exemption} onChange={handleChange} className={inputClass} min="0" max="1"/>
                    </div>
                    <div>
                        <label className={labelClass}>Spouse (Line 2)</label>
                        <input type="number" name="spouse_exemption" value={formData.spouse_exemption} onChange={handleChange} className={inputClass} min="0" max="1"/>
                    </div>
                    <div>
                        <label className={labelClass}>Dependents (Line 3)</label>
                        <input type="number" name="dependent_exemptions" value={formData.dependent_exemptions} onChange={handleChange} className={inputClass} min="0"/>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <label className={labelClass}>Additional Exemptions (Age 65+ / Blind)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <label className={`${checkboxCardClass} ${formData.is_self_65 ? activeCheckboxClass : 'border-gray-200'}`}>
                            <input type="checkbox" name="is_self_65" checked={formData.is_self_65} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-800 font-medium">You are 65 or older</span>
                        </label>
                        <label className={`${checkboxCardClass} ${formData.is_self_blind ? activeCheckboxClass : 'border-gray-200'}`}>
                            <input type="checkbox" name="is_self_blind" checked={formData.is_self_blind} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-800 font-medium">You are blind</span>
                        </label>
                        <label className={`${checkboxCardClass} ${formData.is_spouse_65 ? activeCheckboxClass : 'border-gray-200'}`}>
                            <input type="checkbox" name="is_spouse_65" checked={formData.is_spouse_65} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-800 font-medium">Spouse is 65 or older</span>
                        </label>
                        <label className={`${checkboxCardClass} ${formData.is_spouse_blind ? activeCheckboxClass : 'border-gray-200'}`}>
                            <input type="checkbox" name="is_spouse_blind" checked={formData.is_spouse_blind} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-800 font-medium">Spouse is blind</span>
                        </label>
                    </div>
                </div>
            </div>
        </section>

        {/* ADDITIONAL WITHHOLDING */}
        <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600"/> Additional Withholding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div>
                    <label className={labelClass}>Add'l State Withholding ($)</label>
                    <input type="number" name="additional_state_withholding" value={formData.additional_state_withholding} onChange={handleChange} className={inputClass} placeholder="0.00"/>
                </div>
                <div>
                    <label className={labelClass}>Add'l County Withholding ($)</label>
                    <input type="number" name="additional_county_withholding" value={formData.additional_county_withholding} onChange={handleChange} className={inputClass} placeholder="0.00"/>
                </div>
            </div>
        </section>

        {/* SIGNATURE */}
        <section className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
            
            <p className="text-sm text-gray-700 mb-6 font-medium">
                I hereby declare that to the best of my knowledge the above statements are true.
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

export default IndianaTaxForm;