import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Shield, DollarSign, Calendar, ChevronLeft, ChevronRight, ChevronDown, Eraser, Save, PenTool, FileText, Calculator } from 'lucide-react';

// --- CUSTOM DATE PICKER (Reused) ---
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
        setIsOpen(false);
        setView('calendar');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setCurrentDate(d);
    }
  }, [value]);

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

// --- MAIN CONNECTICUT FORM ---
const ConnecticutTaxForm = ({ initialData, onSubmit }) => {
  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dataLoadedRef = useRef(false);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', initial: '', ssn: '',
    address: '', city: '', state: 'CT', zipcode: '',
    email: '', contact: '',
    filing_status: 'A',
    allowances: '',
    additional_withholding: '',
    new_rehired: 'no',  // Always start as 'no'
    rehire_date: '',
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingCodes = [
    { code: 'A', label: 'Code A: Married Filing Separately / Civil Union Filing Separately' },
    { code: 'B', label: 'Code B: Head of Household' },
    { code: 'C', label: 'Code C: Married Filing Jointly / Civil Union Filing Jointly' },
    { code: 'D', label: 'Code D: Single' },
    { code: 'E', label: 'Code E: Married Filing Jointly (Spouse is non-resident)' },
    { code: 'F', label: 'Code F: Single (Claiming Tax Credit for Elderly/Disabled)' }
  ];

  useEffect(() => {
    if (initialData && !dataLoadedRef.current) {
      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        initial: initialData.initial || '',
        ssn: initialData.ssn || '',
        address: initialData.address || '',
        city: initialData.city || '',
        zipcode: (initialData.zipcode || '').slice(0, 5),
        email: initialData.email || '',
        contact: initialData.phone_no || '',
      }));
      dataLoadedRef.current = true;
    }
  }, [initialData]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
        canvas.width = rect.width;
        canvas.height = rect.height;
        if (savedData) {
          sigCanvasRef.current.fromDataURL(savedData);
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

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    let sig = "";
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }
    onSubmit({ ...formData, signature_image: sig });
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 transition-shadow";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800 tracking-wide";
  const sectionHeader = "text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-6";

  return (
    <div className="bg-white px-4 py-2 text-left">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Connecticut Tax Withholding</h2>
        <p className="text-gray-500 text-sm mt-1">Employee's Withholding Certificate (Form CT-W4)</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-12">

        {/* 1. PERSONAL INFORMATION */}
        <section>
          <h3 className={sectionHeader}><User className="text-blue-600" size={22} /> Employee Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5"><label className={labelClass}>First Name</label><input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className={inputClass} placeholder="First Name" required /></div>
            <div className="md:col-span-2"><label className={labelClass}>M.I.</label><input type="text" name="initial" maxLength="1" value={formData.initial || ''} onChange={handleChange} className={`${inputClass} text-center uppercase`} placeholder="M" /></div>
            <div className="md:col-span-5"><label className={labelClass}>Last Name</label><input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className={inputClass} placeholder="Last Name" required /></div>

            <div className="md:col-span-6 relative"><label className={labelClass}>SSN</label><div className="relative"><input type="text" name="ssn" value={formData.ssn || ''} onChange={handleChange} className={`${inputClass} pl-10 tracking-widest`} placeholder="XXXXXXXXX" required/><Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/></div></div>
            <div className="md:col-span-6"><label className={labelClass}>Email (Optional)</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputClass} placeholder="john@example.com" /></div>

            <div className="md:col-span-6"><label className={labelClass}>Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={inputClass} placeholder="Street Address" required /></div>
            <div className="md:col-span-5"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city || ''} onChange={handleChange} className={inputClass} required /></div>
            <div className="md:col-span-3"><label className={labelClass}>State</label><input type="text" value="CT" readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed text-center`} /></div>
            <div className="md:col-span-4"><label className={labelClass}>Zip Code</label><input type="text" name="zipcode" value={formData.zipcode || ''} onChange={handleChange} className={inputClass} required /></div>
          </div>
        </section>

        {/* NEW: New or Rehired Employee Section - FIXED */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Employment Status</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-800 mb-3">Is this a new or rehired employee?</p>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="new_rehired"
                    value="no"
                    checked={formData.new_rehired === 'no'}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span>No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="new_rehired"
                    value="yes"
                    checked={formData.new_rehired === 'yes'}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span>Yes</span>
                </label>
              </div>
            </div>
            {formData.new_rehired === 'yes' && (
              <div className="max-w-xs">
                <CustomDatePicker label="Date of Rehire" name="rehire_date" value={formData.rehire_date || ''} onChange={handleChange} />
              </div>
            )}
          </div>
        </section>

        {/* 2. WITHHOLDING CODE */}
        <section>
          <h3 className={sectionHeader}><FileText className="text-blue-600" size={22} /> Withholding Code (Line 1)</h3>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
            <label className={labelClass}>Select Filing Status Code</label>
            <div className="relative">
              <select name="filing_status" value={formData.filing_status} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer pr-10`}>
                {filingCodes.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-blue-700 mt-2 flex items-start gap-1">
              <Shield size={12} className="mt-0.5" />
              Determine your code by reading the instructions on page 1 of the CT-W4 PDF form.
            </p>
          </div>
        </section>

        {/* 3. CALCULATIONS */}
        <section>
          <h3 className={sectionHeader}><Calculator className="text-blue-600" size={22} /> Calculations & Additional Amount</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
            <div>
              <label className={labelClass}>Additional Withholding Amount (Line 2)</label>
              <div className="relative max-w-sm">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input type="number" name="additional_withholding" value={formData.additional_withholding || ''} onChange={handleChange} min="0" step="0.01" className={`${inputClass} pl-8`} placeholder="0.00" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the additional amount you want withheld from each paycheck (if applicable).</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className={labelClass}>Reduced Withholding Amount (Line 3)</label>
              <div className="relative max-w-sm">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input type="number" name="allowances" value={formData.allowances || ''} onChange={handleChange} min="0" step="0.01" className={`${inputClass} pl-8`} placeholder="0.00" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the reduced withholding amount (see instructions if applicable). This value will be rounded to the nearest dollar when saved.</p>
            </div>
          </div>
        </section>

        {/* 4. CONFIRMATION / SIGNATURE */}
        <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" size={20}/> Declaration & Signature</h3>
          <p className="text-sm text-gray-700 mb-6 font-medium">
            I declare under penalty of law that I have examined this certificate and, to the best of my knowledge and belief, it is true, correct, and complete.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="max-w-xs">
              <CustomDatePicker label="Date of Signing" name="confirmation_date" value={formData.confirmation_date || ''} onChange={handleChange} />
            </div>
            <div className="max-w-xs">
              <label className={labelClass}>Contact Info (Optional)</label>
              <input type="text" name="contact" value={formData.contact || ''} onChange={handleChange} className={inputClass} placeholder="Phone number" />
            </div>
          </div>

          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <label className={labelClass}>Digital Signature <span className="text-red-600">*</span></label>
              <button type="button" onClick={clearSignature} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"><Eraser size={14}/> Clear</button>
            </div>
            <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white hover:border-blue-500 transition-all h-56 w-full relative cursor-crosshair">
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
                  <span className="font-medium">Sign Here</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-8 pb-4 border-t border-gray-100 mt-6">
          <button type="submit" disabled={!formData.signature_image} className={`px-10 py-3.5 font-bold text-lg rounded-xl shadow-lg transform transition-all flex items-center gap-2 ${formData.signature_image ? 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-0.5 hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            <Save size={22} /> Confirm & Generate PDF
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConnecticutTaxForm;