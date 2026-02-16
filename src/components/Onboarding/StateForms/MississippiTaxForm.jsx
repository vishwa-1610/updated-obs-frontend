import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
// ✅ ADDED ChevronLeft, ChevronRight, Loader2 to imports
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, CheckCircle, Loader2, XCircle 
} from 'lucide-react';

// --- CUSTOM DATE PICKER (Standard Style) ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(() => {
      const d = new Date(value);
      return isNaN(d.getTime()) ? new Date() : d;
  });
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
      <label className="block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide">{label}</label>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input readOnly type="text" value={value || ''} placeholder={placeholder || "YYYY-MM-DD"} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none" />
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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

// --- MAIN MISSISSIPPI FORM ---
const MississippiTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ isOpen: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    first_name: '', middle_initial: '', last_name: '', ssn: '',
    address: '', city: '', state: 'MS', zipcode: '',
    
    // 1=Single, 2=Married, 3=Head
    filing_status: '1',
    spouse_employed: false,
    spouse_claim_amount: '',

    age_65: false,
    blind_self: false,
    spouse_65: false,
    spouse_blind: false,

    dependents: 0,
    additional_withholding: '',
    military_spouse_exempt: false,

    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // Initialize
  useEffect(() => {
    if (initialData && !dataLoadedRef.current) {
        setFormData(prev => ({
            ...prev,
            ...initialData,
            first_name: initialData.first_name || '',
            last_name: initialData.last_name || '',
            middle_initial: initialData.initial || '',
            ssn: initialData.ssn || '',
            address: initialData.address || '',
            city: initialData.city || '',
            zipcode: (initialData.zipcode || '').slice(0, 5),
            state: 'MS'
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

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      let sig = formData.signature_image;
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
          sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      }

      if (!sig) {
          setErrorState({ isOpen: true, title: "Missing Signature", message: "Please sign the form in the 'Digital Signature' box before submitting." });
          return;
      }

      setIsSubmitting(true);

      try {
          await onSubmit({ ...formData, signature_image: sig });
          setIsSubmitting(false);
      } catch (error) {
          console.error("Submission Error:", error);
          setIsSubmitting(false);
          const msg = error.response?.data?.error || error.message || "Something went wrong. Please try again.";
          setErrorState({ isOpen: true, title: "Submission Failed", message: msg });
      }
  };

  // Calculations for Display
  let exemption = 0;
  if (formData.filing_status === '1') exemption = 6000;
  if (formData.filing_status === '3') exemption = 9500;
  if (formData.filing_status === '2') {
      if (formData.spouse_employed) exemption = parseInt(formData.spouse_claim_amount || 0);
      else exemption = 12000;
  }
  
  const depAmount = parseInt(formData.dependents || 0) * 1500;
  
  let ageBlind = 0;
  if(formData.age_65) ageBlind += 1500;
  if(formData.blind_self) ageBlind += 1500;
  if(formData.filing_status === '2') {
      if(formData.spouse_65) ageBlind += 1500;
      if(formData.spouse_blind) ageBlind += 1500;
  }

  const totalExemption = exemption + depAmount + ageBlind;

  // --- STYLES (Clean & Standard) ---
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";
  const checkboxCardClass = "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 bg-white border-gray-200";
  const activeCheckboxClass = "border-blue-600 ring-1 ring-blue-600 bg-blue-50/20";

  return (
    <>
      {isSubmitting && (
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
      )}
      
      <ErrorModal isOpen={errorState.isOpen} title={errorState.title} message={errorState.message} onClose={() => setErrorState({ isOpen: false, title: '', message: '' })} />

      <div className="bg-white px-4 py-2 text-left">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Mississippi Form 89-350</h2>
          <p className="text-gray-500 text-sm mt-1">Employee's Withholding Exemption Certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* 1. PERSONAL INFORMATION */}
          <section>
              <h3 className={sectionHeader}><User className="text-blue-600" size={22}/> Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className={inputClass} placeholder="First Name" required /></div>
                  <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="middle_initial" maxLength="1" value={formData.middle_initial || ''} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" /></div>
                  <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className={inputClass} placeholder="Last Name" required /></div>
                  
                  <div className="md:col-span-6 relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn || ''} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX" required/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
                  <div className="md:col-span-6"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode || ''} onChange={handleChange} className={inputClass} required /></div>

                  <div className="md:col-span-8"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={inputClass} placeholder="Street Address" required /></div>
                  <div className="md:col-span-4"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} className={inputClass} required /></div>
                  <div className="md:col-span-4"><label className={labelClass}>State</label><input type="text" value="MS" readOnly className={`${inputClass} bg-gray-100 text-gray-500 text-center font-bold`} /></div>
              </div>
          </section>

          {/* 2. MARITAL STATUS & EXEMPTIONS */}
          <section>
              <h3 className={sectionHeader}><CheckCircle className="text-blue-600" size={22}/> Filing Status & Exemptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                      {id: '1', l: 'Single ($6,000)'},
                      {id: '2', l: 'Married ($12,000)'},
                      {id: '3', l: 'Head of Family ($9,500)'}
                  ].map(opt => (
                      <label key={opt.id} className={`${checkboxCardClass} h-full ${formData.filing_status === opt.id ? activeCheckboxClass : ''}`}>
                          <input type="radio" name="filing_status" value={opt.id} checked={formData.filing_status === opt.id} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300" />
                          <span className="font-bold text-gray-900 text-sm ml-2">{opt.l}</span>
                      </label>
                  ))}
              </div>

              {/* Spouse Employed Logic */}
              {formData.filing_status === '2' && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mb-6">
                      <label className={`${checkboxCardClass} mb-4 ${formData.spouse_employed ? activeCheckboxClass : 'bg-white'}`}>
                          <input type="checkbox" name="spouse_employed" checked={formData.spouse_employed} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                          <div className="ml-2">
                              <span className="block font-bold text-gray-900">Spouse is Employed?</span>
                              <span className="text-xs text-gray-500 block">Check if spouse works. You must divide the $12,000 exemption.</span>
                          </div>
                      </label>
                      {formData.spouse_employed && (
                          <div>
                              <label className={labelClass}>Amount YOU are claiming (Max $12,000)</label>
                              <div className="relative">
                                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                  <input type="number" name="spouse_claim_amount" value={formData.spouse_claim_amount} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="6000" max="12000" />
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* Age & Blind Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                  <label className={checkboxCardClass}>
                      <input type="checkbox" name="age_65" checked={formData.age_65} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded"/>
                      <span className="font-medium text-gray-900 ml-2">I am 65 or over</span>
                  </label>
                  <label className={checkboxCardClass}>
                      <input type="checkbox" name="blind_self" checked={formData.blind_self} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded"/>
                      <span className="font-medium text-gray-900 ml-2">I am blind</span>
                  </label>
                  {formData.filing_status === '2' && (
                      <>
                          <label className={checkboxCardClass}>
                              <input type="checkbox" name="spouse_65" checked={formData.spouse_65} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded"/>
                              <span className="font-medium text-gray-900 ml-2">Spouse is 65 or over</span>
                          </label>
                          <label className={checkboxCardClass}>
                              <input type="checkbox" name="spouse_blind" checked={formData.spouse_blind} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded"/>
                              <span className="font-medium text-gray-900 ml-2">Spouse is blind</span>
                          </label>
                      </>
                  )}
              </div>

              {/* Dependents & Total */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-200 pt-6">
                  <div>
                      <label className={labelClass}>Dependents</label>
                      <input type="number" name="dependents" value={formData.dependents || 0} onChange={handleChange} className={inputClass} min="0" placeholder="0" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded border border-blue-200 shadow-sm mt-1">
                      <span className="text-sm font-bold text-gray-600 uppercase">Total Exemption</span>
                      <span className="text-2xl font-bold text-blue-600">${totalExemption.toLocaleString()}</span>
                  </div>
              </div>
          </section>

          {/* 3. ADDITIONAL & MILITARY */}
          <section>
              <h3 className={sectionHeader}><DollarSign className="text-blue-600" size={22}/> Additional Info</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                  <div>
                      <label className={labelClass}>Additional Withholding ($)</label>
                      <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                          <input type="number" name="additional_withholding" value={formData.additional_withholding} onChange={handleChange} className={`${inputClass} pl-8`} placeholder="0.00" />
                      </div>
                  </div>
                  
                  <label className={`${checkboxCardClass} ${formData.military_spouse_exempt ? activeCheckboxClass : ''}`}>
                      <input type="checkbox" name="military_spouse_exempt" checked={formData.military_spouse_exempt} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded" />
                      <div className="ml-2">
                          <span className="block font-bold text-gray-900">Military Spouse Exemption</span>
                          <span className="text-xs text-gray-500 block">Check if claiming exemption under the Residency Relief Act.</span>
                      </div>
                  </label>
              </div>
          </section>

          {/* 4. SIGNATURE */}
          <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><PenTool className="text-blue-600" size={20}/> Declaration & Signature</h3>
              
              <div className="mb-8 max-w-xs">
                  <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} />
              </div>
              
              <div className="w-full">
                  <div className="flex justify-between items-center mb-3">
                      <label className={labelClass}>Digital Signature <span className="text-red-500">*</span></label>
                      <button type="button" onClick={clearSignature} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"><Eraser size={14}/> Clear</button>
                  </div>
                  
                  <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white h-56 w-full relative hover:border-blue-400 transition-colors shadow-inner cursor-crosshair">
                      <SignatureCanvas 
                          ref={sigCanvasRef}
                          penColor="black"
                          velocityFilterWeight={0.7}
                          canvasProps={{ className: 'sigCanvas w-full h-full' }}
                          onEnd={handleSignatureEnd}
                      />
                      {!formData.signature_image && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 gap-2">
                            <PenTool size={24} className="opacity-50" />
                            <span className="font-medium text-sm">Sign Here</span>
                          </div>
                      )}
                  </div>
              </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-8 pb-4 border-t border-gray-100 mt-6">
              <button type="submit" disabled={isSubmitting || !formData.signature_image} className={`px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : formData.signature_image ? 'bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={22}/> : <Save size={22}/>}
                  {isSubmitting ? 'Submitting...' : 'Confirm & Generate PDF'}
              </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default MississippiTaxForm;