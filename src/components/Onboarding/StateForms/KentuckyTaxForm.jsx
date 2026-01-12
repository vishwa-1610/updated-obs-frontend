import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, DollarSign, Calendar, Eraser, Save, PenTool, FileText, Calculator, Flag, MapPin } from 'lucide-react';

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

// --- MAIN KENTUCKY FORM ---
const KentuckyTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '', last_name: '', ssn: '', address: '', city: '', state: 'KY', zipcode: '',
    
    // Withholding
    additional_withholding: '',

    // Exemptions
    exempt: false,
    exempt_reason: 0, // 1=Standard, 2=Fort Campbell, 3=Military Spouse, 4=Reciprocal
    fort_campbell_state: '',
    domicile_state: '',
    reciprocal_state: '',

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const reciprocalStates = ['IL', 'IN', 'MI', 'WV', 'WI', 'VA', 'OH'];

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
            state: 'KY',
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

  const handleExemptReason = (val) => {
      setFormData(prev => ({ ...prev, exempt: true, exempt_reason: parseInt(val) }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        // Correct usage: getCanvas() to avoid cropping
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
  const radioCardClass = "flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-300 bg-white hover:bg-blue-50/30";
  const activeRadioClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

  return (
    <div className="bg-white px-8 py-8 max-w-5xl mx-auto shadow-sm rounded-2xl border border-gray-100">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kentucky Withholding Certificate</h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 font-medium">
            <FileText size={16}/>
            <p className="text-sm">Form K-4</p>
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
                  <div><label className={labelClass}>State</label><input type="text" value="KY" readOnly className={`${inputClass} bg-gray-50 text-gray-500 text-center font-bold`} /></div>
                  <div><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} required /></div>
                </div>
            </div>
        </section>

        {/* ADDITIONAL WITHHOLDING */}
        <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600"/> Additional Withholding</h3>
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <label className={labelClass}>Additional Amount to Withhold ($)</label>
                <div className="relative max-w-sm">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00"/>
                </div>
            </div>
        </section>

        {/* EXEMPTIONS */}
        <section>
            <h3 className={sectionHeader}><Flag className="text-blue-600"/> Exemptions</h3>
            <div className="grid grid-cols-1 gap-4">
                
                {/* Option 1 */}
                <label className={`${radioCardClass} ${formData.exempt_reason === 1 ? activeRadioClass : 'border-gray-200'}`}>
                    <input type="radio" name="exempt_reason" checked={formData.exempt_reason === 1} onChange={() => handleExemptReason(1)} className="mt-1" />
                    <div>
                        <span className="block font-bold text-gray-800">1. Standard Exemption</span>
                        <span className="text-sm text-gray-500">I incurred no tax liability last year and expect none this year.</span>
                    </div>
                </label>

                {/* Option 2 */}
                <label className={`${radioCardClass} ${formData.exempt_reason === 2 ? activeRadioClass : 'border-gray-200'}`}>
                    <input type="radio" name="exempt_reason" checked={formData.exempt_reason === 2} onChange={() => handleExemptReason(2)} className="mt-1" />
                    <div className="w-full">
                        <span className="block font-bold text-gray-800">2. Fort Campbell Exemption</span>
                        <span className="text-sm text-gray-500">I work at Fort Campbell, reside in Tennessee, and pay no KY tax.</span>
                        {formData.exempt_reason === 2 && (
                            <input type="text" name="fort_campbell_state" value={formData.fort_campbell_state} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Enter State of Residence" />
                        )}
                    </div>
                </label>

                {/* Option 3 */}
                <label className={`${radioCardClass} ${formData.exempt_reason === 3 ? activeRadioClass : 'border-gray-200'}`}>
                    <input type="radio" name="exempt_reason" checked={formData.exempt_reason === 3} onChange={() => handleExemptReason(3)} className="mt-1" />
                    <div className="w-full">
                        <span className="block font-bold text-gray-800">3. Military Spouse Exemption</span>
                        <span className="text-sm text-gray-500">I am a civilian spouse of active duty military.</span>
                        {formData.exempt_reason === 3 && (
                            <input type="text" name="domicile_state" value={formData.domicile_state} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Enter State of Domicile" />
                        )}
                    </div>
                </label>

                {/* Option 4 */}
                <label className={`${radioCardClass} ${formData.exempt_reason === 4 ? activeRadioClass : 'border-gray-200'}`}>
                    <input type="radio" name="exempt_reason" checked={formData.exempt_reason === 4} onChange={() => handleExemptReason(4)} className="mt-1" />
                    <div className="w-full">
                        <span className="block font-bold text-gray-800">4. Reciprocal State Exemption</span>
                        <span className="text-sm text-gray-500">I reside in a reciprocal state (IL, IN, MI, WV, WI, VA, OH).</span>
                        {formData.exempt_reason === 4 && (
                            <div className="mt-2 relative">
                                <select name="reciprocal_state" value={formData.reciprocal_state} onChange={handleChange} className={inputClass}>
                                    <option value="">Select State</option>
                                    {reciprocalStates.map(st => <option key={st} value={st}>{st}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </label>

                {/* Clear Exemption */}
                {formData.exempt && (
                    <button type="button" onClick={() => setFormData(prev => ({...prev, exempt: false, exempt_reason: 0}))} className="text-sm text-red-500 underline mt-2 text-left">
                        Clear Exemption Selection
                    </button>
                )}
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

export default KentuckyTaxForm;