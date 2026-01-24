import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Heart, 
  ArrowRight, Loader2, AlertCircle, ShieldCheck, 
  CheckCircle2, Sparkles, ChevronDown, Fingerprint,
  ChevronLeft, ChevronRight, Zap, FileCheck, Hash, Home, Building2, Check
} from 'lucide-react';
import api from '../../api';

// IMPORT THE CONTEXT HOOK
import { useOnboarding } from '../../context/OnboardingContext';

// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL; 

// --- STYLES ---
const INPUT_BASE = "w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all duration-200 placeholder-gray-400 hover:border-blue-300 shadow-sm";
const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
const CARD_STYLE = "bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 relative transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/5";

// --- FULL US STATES LIST ---
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

// --- COMPONENTS ---

const SuccessModal = () => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-auto transform animate-in zoom-in-95 duration-300 border border-white/50">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-lg shadow-green-500/20">
        <Check size={32} strokeWidth={3} />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Details Saved!</h3>
      <p className="text-slate-500 text-center mb-2">Proceeding to next step...</p>
      <div className="flex gap-1 mt-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-0"></span>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></span>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></span>
      </div>
    </div>
  </div>
);

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center gap-2 mb-8 px-1">
    {[...Array(totalSteps)].map((_, i) => (
      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i < currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`} />
    ))}
    <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Step {currentStep} of {totalSteps}</span>
  </div>
);

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-300 shadow-inner">
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-bold text-white text-sm">{title}</h4>
      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, type = "text", placeholder, icon: Icon, required, width = "full" }) => (
  <div className={`space-y-1 w-full ${width === 'half' ? 'col-span-1' : 'col-span-1 md:col-span-2'}`}>
    <label className={LABEL_STYLE}>{label} {required && <span className="text-blue-600">*</span>}</label>
    <div className="relative group">
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={INPUT_BASE} />
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200">
            <Icon size={20} strokeWidth={2.5} />
        </div>
      )}
    </div>
  </div>
);

// --- IMPROVED DATE PICKER (Responsive + Year Selection) ---
const CustomDatePicker = ({ label, name, value, onChange, required, icon: Icon, width = "half" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('days'); // 'days' or 'years'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Ref to detect clicks outside
  const containerRef = useRef(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDateSelect = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Adjust for timezone offset to prevent "day before" bug
    const offset = selected.getTimezoneOffset();
    const adjustedDate = new Date(selected.getTime() - (offset * 60 * 1000));
    onChange({ target: { name, value: adjustedDate.toISOString().split('T')[0] } });
    setIsOpen(false);
  };

  const handleYearSelect = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setViewMode('days');
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    for (let i = 0; i < getFirstDayOfMonth(year, month); i++) days.push({ day: '', disabled: true });
    for (let day = 1; day <= getDaysInMonth(year, month); day++) {
        const currentStr = new Date(year, month, day).toLocaleDateString('en-CA');
        days.push({ day, isSelected: value === currentStr });
    }
    return days;
  };

  // Generate years for year picker (e.g., 1950 - Current Year + 5)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years.reverse(); // Newest first
  };

  return (
    <div className={`space-y-1 w-full ${width === 'half' ? 'col-span-1' : 'col-span-1 md:col-span-2'}`} ref={containerRef}>
      <label className={LABEL_STYLE}>{label} {required && <span className="text-blue-600">*</span>}</label>
      <div className="relative">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={`${INPUT_BASE} text-left cursor-pointer flex items-center justify-between ${isOpen ? 'border-blue-600 ring-2 ring-blue-500/20' : ''}`}>
          <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>{value || 'Select date...'}</span>
          <Calendar size={18} className={`transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} />
        </button>
        {Icon && <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`}><Icon size={20} strokeWidth={2.5} /></div>}
        
        {isOpen && (
           <div className="fixed inset-0 md:absolute md:inset-auto md:top-full md:left-0 md:w-80 md:mt-2 z-[9999] flex items-center justify-center md:block">
             
             {/* Backdrop for Mobile */}
             <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)}></div>
             
             {/* Calendar Container */}
             <div className="relative bg-white md:rounded-xl rounded-2xl border-2 border-gray-200 shadow-2xl p-4 w-[90%] max-w-sm md:w-full animate-in fade-in zoom-in-95 flex flex-col max-h-[500px]">
               
               {/* Header */}
               <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                   <button type="button" className="p-1 hover:bg-gray-100 rounded-lg" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><ChevronLeft size={20} /></button>
                   
                   {/* Toggle between Month/Year View */}
                   <button 
                     type="button" 
                     onClick={() => setViewMode(viewMode === 'days' ? 'years' : 'days')}
                     className="font-bold text-gray-900 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                   >
                     {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                     <ChevronDown size={14} className={`transform transition-transform ${viewMode === 'years' ? 'rotate-180' : ''}`}/>
                   </button>

                   <button type="button" className="p-1 hover:bg-gray-100 rounded-lg" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><ChevronRight size={20} /></button>
               </div>

               {/* Days View */}
               {viewMode === 'days' && (
                 <>
                   <div className="grid grid-cols-7 gap-1 text-center mb-2">
                       {daysOfWeek.map(d => <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>)}
                   </div>
                   <div className="grid grid-cols-7 gap-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                       {generateCalendarDays().map((d, i) => ( 
                         <button 
                           key={i} 
                           type="button" 
                           disabled={d.disabled} 
                           onClick={() => d.day && handleDateSelect(d.day)} 
                           className={`h-9 w-full rounded-lg text-sm font-medium flex items-center justify-center transition-colors
                             ${!d.day ? 'invisible' : ''} 
                             ${d.isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'hover:bg-gray-100 text-gray-700'}
                           `}
                         >
                           {d.day}
                         </button>
                       ))}
                   </div>
                 </>
               )}

               {/* Years View */}
               {viewMode === 'years' && (
                 <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[300px] custom-scrollbar p-1">
                   {generateYears().map(year => (
                     <button
                       key={year}
                       type="button"
                       onClick={() => handleYearSelect(year)}
                       className={`py-2 rounded-lg text-sm font-medium transition-colors ${year === currentDate.getFullYear() ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}`}
                     >
                       {year}
                     </button>
                   ))}
                 </div>
               )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

// --- CUSTOM DROPDOWN (Responsive) ---
const CustomDropdown = ({ label, name, value, onChange, options, required, icon: Icon, width = "half", placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { 
        if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); 
    };
    document.addEventListener('mousedown', handleClickOutside); 
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => { onChange({ target: { name, value: val } }); setIsOpen(false); };
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`space-y-1 w-full ${width === 'half' ? 'col-span-1' : 'col-span-1 md:col-span-2'}`} ref={containerRef}>
      <label className={LABEL_STYLE}>{label} {required && <span className="text-blue-600">*</span>}</label>
      <div className="relative">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={`${INPUT_BASE} text-left cursor-pointer flex items-center justify-between ${isOpen ? 'border-blue-600 ring-2 ring-blue-500/20' : ''}`}>
          <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'} shrink-0`} />
        </button>
        {Icon && <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`}><Icon size={20} strokeWidth={2.5} /></div>}
        
        {isOpen && (
          <div className="absolute z-[50] mt-2 w-full bg-white rounded-xl border-2 border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[250px] overflow-y-auto custom-scrollbar">
            <div className="py-1">
            {options.map((opt) => (
                <button key={opt.value} type="button" onClick={() => handleSelect(opt.value)} className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between hover:bg-blue-50 ${value === opt.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}>
                <span>{opt.label}</span> {value === opt.value && <CheckCircle2 size={16} className="text-blue-600" />}
                </button>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

const PersonalDetailsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 1. GET DATA FROM URL
  const token = searchParams.get('token'); 
  const urlState = searchParams.get('state'); 

  // 2. USE ONBOARDING CONTEXT
  const { goToNextStep, workflow } = useOnboarding();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 3. INITIALIZE STATE (Including State from URL)
  const [formData, setFormData] = useState({
    first_name: '', middle_initial: '', last_name: '', dob: '', 
    ssn: '', marital_status: '', gender: '',
    email: '', phone_no: '', address: '', city: '', 
    state: urlState || '', // This auto-selects the state in the dropdown
    zipcode: ''
  });

  // 4. Calculate Dynamic Steps
  // If workflow is empty (loading), default to 1/1 to prevent NaN
  const stepName = 'Personal Details';
  const currentStepIndex = workflow.findIndex(s => s.step_name === stepName);
  const currentStepNumber = currentStepIndex !== -1 ? currentStepIndex + 1 : 1;
  const totalSteps = workflow.length > 0 ? workflow.length : 5; // Fallback to 5 if loading

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.ssn || !formData.gender || !formData.marital_status || !formData.dob) { 
      setError("Please fill in all required fields."); 
      window.scrollTo(0,0); 
      return; 
    }
    
    setIsSubmitting(true);
    
    try {
      // 5. API CALL (Include Token)
      await api.post('/personal-details/', { token: token, ...formData });
      
      setShowSuccessModal(true);
      
      // 6. DYNAMIC NAVIGATION
      setTimeout(() => {
          goToNextStep(); // This uses the company workflow
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Connection failed. Please try again.");
      window.scrollTo(0,0);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Add custom scrollbar styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      .animate-in { animation-duration: 150ms; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); animation-fill-mode: both; }
      .fade-in { animation-name: fadeIn; }
      .zoom-in-95 { animation-name: zoomIn; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 relative">
      
      {showSuccessModal && <SuccessModal />}

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* --- LEFT SIDE (Visuals) --- */}
        <div className="hidden lg:flex lg:w-5/12 p-16 sticky top-0 h-screen flex-col bg-slate-900 text-white relative overflow-hidden z-0">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50"><Sparkles size={20} className="text-white" /></div>
                <span className="font-bold text-xl tracking-tight text-white">Onboarding Portal</span>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h1 className="text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Let's get you <br/> started.</h1>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">Complete your profile securely to unlock your dashboard and benefits.</p>
                <div className="space-y-4 mb-8">
                    <FeatureItem icon={ShieldCheck} title="Secure Encryption" desc="Your personal data is encrypted end-to-end." />
                    <FeatureItem icon={Zap} title="Instant Verification" desc="Real-time validation for accuracy." />
                    <FeatureItem icon={FileCheck} title="Digital Compliance" desc="Automated tax & legal form generation." />
                </div>
                <div className="w-full max-w-sm mt-4 transform hover:scale-105 transition-transform duration-500 opacity-80">
                    <img 
                        src="https://illustrations.popsy.co/amber/working-vacation.svg"
                        alt="Onboarding Illustration" 
                        className="w-full h-auto drop-shadow-2xl"
                    />
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDE (Form) --- */}
        <div className="w-full lg:w-7/12 p-4 md:p-8 lg:p-16 xl:p-24 bg-slate-50 flex flex-col relative z-0">
            <div className="lg:hidden mb-8 text-center mt-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl mb-4 shadow-lg text-white"><Sparkles size={24} /></div>
                <h1 className="text-3xl font-extrabold text-slate-900">Let's get started.</h1>
            </div>
            <div className="max-w-2xl w-full mx-auto relative">
                <div className="hidden lg:flex justify-between items-end mb-6">
                    <div><h2 className="text-3xl font-bold text-slate-900">Personal Details</h2><p className="text-slate-500 mt-1">Please enter your details exactly as on your ID.</p></div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Step {currentStepNumber}/{totalSteps}
                    </span>
                </div>
                
                {/* DYNAMIC STEP INDICATOR */}
                <StepIndicator currentStep={currentStepNumber} totalSteps={totalSteps} />
                
                {error && <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 animate-in fade-in"><AlertCircle className="shrink-0" /> <p className="font-medium text-sm">{error}</p></div>}
                
                <form onSubmit={handleSubmit} className="space-y-8 relative">
                    <div className={CARD_STYLE}>
                        {/* CHANGED: grid-cols-1 for mobile, md:grid-cols-2 for desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required icon={User} width="half" />
                            <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required icon={User} width="half" />
                            <InputField label="Middle Initial" name="middle_initial" value={formData.middle_initial} onChange={handleChange} placeholder="A" width="half" />
                            <CustomDatePicker label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} required icon={Calendar} width="half" />
                            <InputField label="Social Security Number" name="ssn" value={formData.ssn} onChange={handleChange} placeholder="XXX-XX-XXXX" required icon={Fingerprint} width="full" />
                            <CustomDropdown label="Gender" name="gender" value={formData.gender} onChange={handleChange} required icon={User} width="half" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'non-binary', label: 'Non-binary' }]} />
                            <CustomDropdown label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} required icon={Heart} width="half" options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' }]} />
                        </div>
                    </div>
                    <div className={CARD_STYLE}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required icon={Mail} width="half" />
                            <InputField label="Phone Number" name="phone_no" type="tel" value={formData.phone_no} onChange={handleChange} required icon={Phone} width="half" />
                            <div className="col-span-1 md:col-span-2 h-px bg-gray-100 my-2"></div>
                            <InputField label="Street Address" name="address" value={formData.address} onChange={handleChange} required icon={Home} width="full" />
                            <InputField label="City" name="city" value={formData.city} onChange={handleChange} required icon={Building2} width="half" />
                            
                            <CustomDropdown 
                                label="State" 
                                name="state" 
                                value={formData.state} 
                                onChange={handleChange} 
                                required 
                                icon={MapPin} 
                                width="half" 
                                options={US_STATES.map(s => ({ value: s.code, label: s.name }))} 
                            />
                            
                            <InputField label="Zip Code" name="zipcode" value={formData.zipcode} onChange={handleChange} required width="full" icon={Hash} />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end relative z-0">
                        <button type="submit" disabled={isSubmitting} className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed z-10">
                            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <>Save & Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsPage;