import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronDown, Eraser, Save, PenTool, Loader2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// --- COMPONENTS ---
// (LoadingOverlay, ErrorModal, CustomDatePicker remain exactly the same as previous)
const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-300 p-4">
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-50 rounded-full"></div>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-800 tracking-tight">Processing...</h3>
      <p className="text-gray-500 text-sm max-w-xs mx-auto">Securely encrypting and submitting your data</p>
    </div>
  </div>
);

const ErrorModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in slide-in-from-bottom-8 duration-300 transform transition-all border border-gray-100">
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

const CustomDatePicker = ({ label, name, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
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
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide">{label}</label>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
        <input readOnly type="text" value={value || ''} placeholder={placeholder || "YYYY-MM-DD"} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none shadow-sm" />
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 p-4 rounded-xl shadow-2xl border border-gray-200 w-72 max-w-[90vw] bg-white text-gray-800 left-0 sm:left-auto">
           <div className="flex justify-between items-center mb-4">
              {view === 'calendar' && <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={18}/></button>}
              <div className="flex gap-2">
                 <button type="button" onClick={() => setView(view === 'month' ? 'calendar' : 'month')} className="font-bold hover:bg-gray-100 px-2 py-1 rounded text-sm">{monthNames[currentDate.getMonth()]}</button>
                 <button type="button" onClick={() => setView(view === 'year' ? 'calendar' : 'year')} className="font-bold hover:bg-gray-100 px-2 py-1 rounded text-sm">{currentDate.getFullYear()}</button>
              </div>
              {view === 'calendar' && <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={18}/></button>}
           </div>
           {view === 'calendar' && (
             <div className="grid grid-cols-7 gap-1 text-center">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><span key={d} className="text-xs text-gray-400 font-bold py-1">{d}</span>)}
                {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_,i)=><div key={i}/>)}
                {Array.from({length: new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate()}, (_,i)=>i+1).map(d => (
                   <button key={d} type="button" onClick={() => handleDateClick(d)} className="h-8 w-8 text-sm rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center">{d}</button>
                ))}
             </div>
           )}
           {view === 'month' && <div className="grid grid-cols-3 gap-2">{monthNames.map((m,i)=><button key={m} onClick={()=>{setCurrentDate(new Date(currentDate.getFullYear(),i,1));setView('calendar')}} className="p-2 text-sm hover:bg-gray-100 rounded">{m}</button>)}</div>}
           {view === 'year' && <div ref={yearScrollRef} className="h-48 overflow-y-auto grid grid-cols-3 gap-2 custom-scrollbar">{years.map(y=><button key={y} onClick={()=>{setCurrentDate(new Date(y,currentDate.getMonth(),1));setView('calendar')}} className={`p-2 text-sm hover:bg-gray-100 rounded ${y === currentDate.getFullYear() ? 'selected-year bg-blue-50 font-bold text-blue-600' : ''}`}>{y}</button>)}</div>}
        </div>
      )}
    </div>
  );
};

// --- MAIN ARIZONA FORM ---
const ArizonaW4Form = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // UI STATES
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  // DATA STATE
  const [localData, setLocalData] = useState({
    token: '',
    client_name: '',
    job_title: '',
    email: '',
    phone_no: '',
    
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'AZ',
    zipcode: '',
    withholding_percentage: '2.0',
    additional_withholding: 0,
    zero_withholding: false,
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // Initialize
  useEffect(() => {
    if (initialData) {
      setLocalData(prev => ({
        ...prev,
        ...initialData,
        state: 'AZ',
        zipcode: (initialData.zipcode || '').slice(0, 5),
        token: initialData.token || prev.token
      }));
    }
  }, [initialData]);

  // Canvas Resize - Critical for Responsiveness
  useEffect(() => {
    const resizeCanvas = () => {
      if (!sigCanvasRef.current || !containerRef.current) return;
      const canvas = sigCanvasRef.current.getCanvas();
      const rect = containerRef.current.getBoundingClientRect();
      
      // Only resize if dimensions changed
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) {
            sigCanvasRef.current.fromDataURL(savedData);
          }
      }
    };

    // Initial resize and listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureData = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setLocalData(prev => ({ ...prev, signature_image: signatureData }));
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setLocalData(prev => ({ ...prev, signature_image: null }));
  };

  const handleSubmit = async (e) => {
    if(e) e.preventDefault();

    let sig = localData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!sig) {
        setErrorState({ 
            isOpen: true, 
            title: "Missing Signature", 
            message: "Please sign the form in the 'Digital Signature' box before submitting." 
        });
        return; 
    }

    // Required fields check including Token
    if (!localData.first_name || !localData.last_name || !localData.ssn || !localData.token) {
        setErrorState({
            isOpen: true,
            title: "Missing Information",
            message: "Please ensure your First Name, Last Name, and SSN are filled out."
        });
        return;
    }

    setIsSubmitting(true);

    try {
      const safeZip = (localData.zipcode || '').slice(0, 5);
      const payload = { ...localData, zipcode: safeZip, signature_image: sig };

      await onSubmit(payload);
      setIsSubmitting(false);

    } catch (error) {
      console.error("Submission Error:", error);
      setIsSubmitting(false);
      const msg = error.response?.data?.error || error.message || "Something went wrong. Please try again.";
      setErrorState({ isOpen: true, title: "Submission Failed", message: msg });
    }
  };

  // Responsive Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow shadow-sm";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";
  const percentages = ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5'];

  return (
    <>
      {isSubmitting && <LoadingOverlay />}

      <ErrorModal 
        isOpen={errorState.isOpen} 
        title={errorState.title}
        message={errorState.message} 
        onClose={() => setErrorState({ isOpen: false, title: '', message: '' })} 
      />

      <div className="bg-white px-4 py-6 md:p-8 text-left max-w-5xl mx-auto relative">
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Arizona Withholding Election</h2>
          <p className="text-gray-500 text-sm mt-2">Employee's Arizona Withholding Election (Form A-4)</p>
        </div>

        <div className="space-y-12">
          {/* PERSONAL INFORMATION */}
          <section>
            <h3 className={sectionHeader}><User className="text-blue-600" size={22} /> Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <label className={labelClass}>First Name</label>
                <input type="text" name="first_name" value={localData.first_name} onChange={handleChange} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>M.I.</label>
                <input type="text" name="middle_initial" maxLength="1" value={localData.middle_initial} onChange={handleChange} className={`${inputClass} text-center uppercase`} />
              </div>
              <div className="md:col-span-5">
                <label className={labelClass}>Last Name</label>
                <input type="text" name="last_name" value={localData.last_name} onChange={handleChange} className={inputClass} />
              </div>
              <div className="md:col-span-6 relative">
                <label className={labelClass}>SSN</label>
                <div className="relative">
                  <input type="text" name="ssn" maxLength="11" value={localData.ssn} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXX-XX-XXXX"/>
                  <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                </div>
              </div>
              <div className="md:col-span-6">
                <label className={labelClass}>Address</label>
                <input type="text" name="address" value={localData.address} onChange={handleChange} className={inputClass} />
              </div>
              
              {/* ✅ RESPONSIVE GRID for City/State/Zip: Stacks on mobile, Grid on desktop */}
              <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="sm:col-span-3">
                    <label className={labelClass}>City</label>
                    <input type="text" name="city" value={localData.city} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelClass}>State</label>
                    <input type="text" value="AZ" readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed text-center`} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Zip Code</label>
                    <input type="text" name="zipcode" value={localData.zipcode} onChange={handleChange} className={inputClass} />
                  </div>
              </div>
            </div>
          </section>

          {/* WITHHOLDING ELECTION */}
          <section>
            <h3 className={sectionHeader}><DollarSign className="text-blue-600" size={22} /> Withholding Election</h3>
            <div className="space-y-8">
              <div className={`transition-all duration-300 ${localData.zero_withholding ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                  <label className={`${labelClass} text-blue-900 mb-3`}>1. Select Withholding Percentage</label>
                  <p className="text-xs text-blue-700 mb-4">Check only one box.</p>
                  
                  {/* ✅ Flex wrap for mobile responsiveness */}
                  <div className="flex flex-wrap gap-3">
                    {percentages.map((pct) => (
                      <label key={pct} className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-white border rounded-lg cursor-pointer transition-all hover:border-blue-400 ${localData.withholding_percentage === pct ? 'border-blue-600 ring-1 ring-blue-600 shadow-sm' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="withholding_percentage"
                          value={pct}
                          checked={localData.withholding_percentage === pct}
                          onChange={handleChange}
                          disabled={localData.zero_withholding}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-gray-800 text-sm md:text-base">{pct}%</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className={labelClass}>2. Additional Withholding (Optional)</label>
                  <div className="relative max-w-full md:max-w-sm">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      name="additional_withholding"
                      min="0"
                      step="0.01"
                      value={localData.additional_withholding}
                      onChange={handleChange}
                      disabled={localData.zero_withholding}
                      className={`${inputClass} pl-8`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold uppercase">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className={`p-5 rounded-xl border-2 transition-all ${localData.zero_withholding ? 'border-blue-600 bg-blue-50/30' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      name="zero_withholding"
                      checked={localData.zero_withholding}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-base">3. I elect zero (0%) withholding</span>
                    <p className="text-sm text-gray-600 mt-1">I certify that I expect no Arizona tax liability this year.</p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* SIGNATURE SECTION */}
          <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20}/> Attestation & Signature
            </h3>

            <div className="mb-8 w-full md:max-w-sm">
              <CustomDatePicker
                label="Date of Signing"
                name="confirmation_date"
                value={localData.confirmation_date}
                onChange={handleChange}
              />
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <label className={labelClass}>Digital Signature <span className="text-red-600">*</span></label>
                <button type="button" onClick={clearSignature} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                  <Eraser size={14}/> Clear
                </button>
              </div>

              {/* ✅ TOUCH-NONE: Essential for mobile signing */}
              <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white hover:border-blue-500 transition-all h-48 md:h-56 w-full relative cursor-crosshair touch-none">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor="black"
                  velocityFilterWeight={0.7}
                  canvasProps={{ className: 'sigCanvas w-full h-full' }}
                  onEnd={handleSignatureEnd}
                />
                {!localData.signature_image && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 gap-2">
                    <PenTool size={24} className="opacity-50" />
                    <span className="font-medium text-sm">Sign Here (Finger or Mouse)</span>
                  </div>
                )}
              </div>

              {!localData.signature_image && (
                <p className="text-red-600 text-sm font-medium mt-3">⚠ Please provide your signature before submitting</p>
              )}
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-center md:justify-end pt-8 pb-4 border-t border-gray-100 mt-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full md:w-auto px-10 py-3.5 font-bold text-lg rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArizonaW4Form;