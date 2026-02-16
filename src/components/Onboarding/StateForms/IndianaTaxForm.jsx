import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, DollarSign, Calendar, Eraser, Save, PenTool, FileText, 
  Calculator, MapPin, Loader2, XCircle 
} from 'lucide-react';

// --- 1. LOADING OVERLAY ---
const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-50 rounded-full"></div>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-800 tracking-tight">Processing...</h3>
      <p className="text-gray-500 text-sm">Securely encrypting and submitting your data</p>
    </div>
  </div>
);

// --- 2. ERROR MODAL ---
const ErrorModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-8 duration-300 transform transition-all border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <XCircle className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title || "Action Required"}</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">{message || "Please check your inputs."}</p>
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg"
          >
            Okay, I'll Fix It
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. CUSTOM DATE PICKER ---
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
  const dataLoadedRef = useRef(false);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

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

  // INITIALIZE
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
            state: 'IN', // Force IN
        }));
        dataLoadedRef.current = true;
    }
  }, [initialData]);

  // CANVAS RESIZE
  useEffect(() => {
    const resizeCanvas = () => {
        if (containerRef.current && sigCanvasRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const rect = containerRef.current.getBoundingClientRect();
            
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
                canvas.width = rect.width;
                canvas.height = rect.height;
                if (savedData) sigCanvasRef.current.fromDataURL(savedData);
            }
        }
    };
    setTimeout(resizeCanvas, 200);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'zipcode') {
        const truncated = value.replace(/\D/g, '').slice(0, 5);
        setFormData(prev => ({ ...prev, [name]: truncated }));
        return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        const signatureData = sigCanvasRef.current.getCanvas().toDataURL('image/png');
        setFormData(prev => ({ ...prev, signature_image: signatureData }));
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      
      let sig = formData.signature_image;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      // VALIDATION
      if (!sig) {
          setErrorState({ isOpen: true, title: "Missing Signature", message: "Please sign the form before submitting." });
          return;
      }

      if (!formData.county_residence || !formData.county_employment) {
          setErrorState({ isOpen: true, title: "Missing County Info", message: "Please enter both County of Residence and County of Employment." });
          return;
      }

      setIsSubmitting(true);

      try {
          // --- DATA SANITIZATION ---
          const cleanNumber = (val) => (val === '' || val === null || isNaN(val)) ? 0 : val;

          const finalData = { 
              ...formData, 
              signature_image: sig,
              // Convert numbers/empty strings to integers/floats
              self_exemption: cleanNumber(formData.self_exemption),
              spouse_exemption: cleanNumber(formData.spouse_exemption),
              dependent_exemptions: cleanNumber(formData.dependent_exemptions),
              additional_dependent_exemptions: cleanNumber(formData.additional_dependent_exemptions),
              additional_state_withholding: cleanNumber(formData.additional_state_withholding),
              additional_county_withholding: cleanNumber(formData.additional_county_withholding)
          };

          await onSubmit(finalData);
          setIsSubmitting(false);
      } catch (error) {
          console.error("Submission Error:", error);
          setIsSubmitting(false);
          let msg = "Something went wrong. Please try again.";
          if (error.response?.data) {
              if (typeof error.response.data === 'string') msg = error.response.data;
              else if (error.response.data.error) msg = error.response.data.error;
          }
          setErrorState({ isOpen: true, title: "Submission Failed", message: msg });
      }
  };

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 hover:border-blue-300 text-gray-800";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-700 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-8 flex items-center gap-3";
  const checkboxCardClass = "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-300 bg-white hover:bg-blue-50/30";
  const activeCheckboxClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

  return (
    <>
      {isSubmitting && <LoadingOverlay />}
      <ErrorModal isOpen={errorState.isOpen} title={errorState.title} message={errorState.message} onClose={() => setErrorState({ isOpen: false, title: '', message: '' })} />

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
              
              <div className="mb-8 max-w-sm">
                  <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
              </div>

              <div className="w-full">
                  <div className="flex justify-between items-center mb-3">
                      <label className={labelClass}>Digital Signature <span className="text-red-500">*</span></label>
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
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`
                    px-12 py-4 font-bold text-lg rounded-xl shadow-lg shadow-blue-500/20 transform transition-all duration-200 flex items-center gap-3 
                    ${isSubmitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 hover:shadow-xl'}
                `}
              >
                  {isSubmitting ? <Loader2 className="animate-spin" size={22}/> : <Save size={22}/>}
                  {isSubmitting ? 'Submitting...' : 'Confirm & Generate PDF'}
              </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default IndianaTaxForm;