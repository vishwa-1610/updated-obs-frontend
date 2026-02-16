import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, AlertCircle, CheckCircle, MapPin, 
  ShieldCheck, Zap, Sparkles, ArrowRight, Check, Forward, Globe, ChevronDown
} from 'lucide-react';
import StateTaxFormDispatcher from '../Onboarding/StateForms/StateTaxFormDispatcher';
import api from '../../api'; 
import { useOnboarding } from '../../context/OnboardingContext';

// --- CONFIGURATION ---
const NO_TAX_FORM_STATES = [
    'AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'
];

const ALL_US_STATES = [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

// --- STUNNING UI COMPONENTS ---

// 1. Custom Dropdown Component
const StunningSelect = ({ options, value, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === value)?.label;

    return (
        <div className="relative w-full z-50" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full px-4 py-4 text-left rounded-xl border transition-all duration-300 flex justify-between items-center shadow-sm
                    ${isOpen 
                        ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white' 
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-md'
                    }
                `}
            >
                <span className={`font-semibold text-base ${selectedLabel ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown 
                    size={20} 
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} 
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 origin-top custom-scrollbar">
                    <div className="p-1">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    px-4 py-3 rounded-lg cursor-pointer flex items-center justify-between text-sm font-medium transition-all duration-200
                                    ${value === opt.value 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                {opt.label}
                                {value === opt.value && <Check size={16} className="text-blue-600" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const SuccessModal = ({ isOpen, onClose, message, pdfUrl, onContinue }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-300 relative border border-white/50">
        <div className="bg-green-50 p-8 flex flex-col items-center justify-center border-b border-green-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <Check size={40} strokeWidth={3} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Submission Successful!</h3>
          <p className="text-slate-500 mt-1 text-center text-sm">{message || "Your tax withholding form has been confirmed."}</p>
        </div>
        <div className="p-6 space-y-3">
            <button 
              onClick={onContinue}
              className="flex items-center justify-center w-full px-4 py-4 text-lg font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
            >
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-300 shadow-inner shrink-0">
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-bold text-white text-sm">{title}</h4>
      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);

// --- MAIN PAGE ---
const StateTaxPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const urlState = searchParams.get('state') || ''; 

  const { goToNextStep, workflow } = useOnboarding();

  const [userData, setUserData] = useState(null);
  
  // State for Selection Logic
  const [selectedState, setSelectedState] = useState(''); // The officially active state
  const [tempState, setTempState] = useState(''); // The state selected in dropdown but NOT confirmed
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successData, setSuccessData] = useState({ message: '', pdf_url: '' });
  
  const [isNoTaxState, setIsNoTaxState] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

  const stepName = 'State W4'; 
  const currentStepIndex = workflow.findIndex(s => s.step_name === stepName);
  const currentStepNumber = currentStepIndex !== -1 ? currentStepIndex + 1 : 4;
  const totalSteps = workflow.length > 0 ? workflow.length : 5;

  // 1. FETCH DATA
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("CRITICAL ERROR: No token found in URL.");
      return;
    }

    const fetchOnboardingData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/onboarding/validate/${token}/`);
        
        const userStateCode = urlState || response.data.state;

        setUserData({ ...response.data, state: userStateCode });

        // If State Exists, Lock it in immediately
        if (userStateCode) {
            setSelectedState(userStateCode);
            if (NO_TAX_FORM_STATES.includes(userStateCode)) {
                setIsNoTaxState(true);
            }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Invalid or expired link. Please contact HR.");
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [token, urlState]);

  // 2. AUTO REDIRECT
  useEffect(() => {
    if (isNoTaxState && redirectCount > 0) {
        const timer = setTimeout(() => setRedirectCount(redirectCount - 1), 1000);
        return () => clearTimeout(timer);
    } else if (isNoTaxState && redirectCount === 0) {
        goToNextStep(); 
    }
  }, [isNoTaxState, redirectCount, goToNextStep]);

  // 3. CONFIRM SELECTION HANDLER
  const handleConfirmState = () => {
      if (!tempState) return;

      setSelectedState(tempState);
      setUserData(prev => ({ ...prev, state: tempState }));

      if (NO_TAX_FORM_STATES.includes(tempState)) {
          setIsNoTaxState(true);
          setRedirectCount(3); 
      } else {
          setIsNoTaxState(false);
      }
  };

  const handleTaxSubmit = async (formData) => {
    if (!token) return alert("Error: Token missing.");

    try {
      const payload = {
        ...formData, 
        email: userData?.email, 
        client_name: userData?.client_name,
        phone_no: userData?.phone_no,
        job_title: userData?.job_title,
        state: selectedState, 
        token: token 
      };

      const response = await api.post('/confirm-onboarding/', payload);
      if (response.status === 200 || response.status === 201) {
        setSuccessData({ message: response.data.message, pdf_url: response.data.pdf_url });
        setModalOpen(true);
      }
    } catch (err) {
      console.error("API Error:", err);
      alert(`Submission Failed: ${err.response?.data?.error || "Unknown Error"}`);
    }
  };

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-blue-600"><Loader2 size={48} className="animate-spin mb-4" /><p>Loading...</p></div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-red-600"><p>{error}</p></div>;

  // ---------------------------------------------------------
  // SCENARIO 1: STATE IS UNKNOWN - SELECTION & CONFIRM UI
  // ---------------------------------------------------------
  if (!selectedState) {
      return (
        // ✅ SCROLL FIX: Changed h-screen to min-h-screen and removed overflow-hidden from parent
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 relative">
            
            {/* Background Decorations (Fixed to not interfere with scroll) */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-blue-900/10 text-center border border-white relative z-10 my-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/30 transform rotate-3">
                    <Globe size={36} strokeWidth={1.5} />
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Where do you work?</h2>
                <p className="text-slate-500 mb-8 text-base leading-relaxed px-4">
                    Please confirm your work state so we can load the correct tax compliance forms for you.
                </p>
                
                <div className="text-left space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Select Work State</label>
                    
                    {/* ✅ STUNNING SELECT COMPONENT */}
                    <StunningSelect 
                        options={ALL_US_STATES}
                        value={tempState} // Controlled by tempState
                        onChange={setTempState}
                        placeholder="Choose a state..."
                    />

                    {/* ✅ CONFIRM BUTTON */}
                    <button
                        onClick={handleConfirmState}
                        disabled={!tempState}
                        className={`
                            w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300
                            ${tempState 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        Confirm Location <ArrowRight size={20} />
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500"/> Secure SSL Connection
                    </p>
                </div>
            </div>
        </div>
      );
  }

  // ---------------------------------------------------------
  // SCENARIO 2: NO TAX FORM REQUIRED (Auto-Redirect)
  // ---------------------------------------------------------
  if (isNoTaxState) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <div className="bg-green-50 p-8 rounded-full mb-6 shadow-sm"><CheckCircle size={64} className="text-green-500" /></div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">No {selectedState} Tax Form Required</h1>
            <p className="text-slate-600 max-w-lg text-lg mb-8 leading-relaxed">
                <strong>{selectedState}</strong> does not require a specific State Withholding Certificate.
            </p>
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-blue-600" />
                <span className="text-slate-600 font-medium">Proceeding to next step in {redirectCount}s...</span>
            </div>
            <button onClick={() => goToNextStep()} className="mt-8 text-blue-600 font-bold hover:underline flex items-center gap-2">Skip immediately <Forward size={16} /></button>
        </div>
      );
  }

  // ---------------------------------------------------------
  // SCENARIO 3: SHOW FORM (Standard)
  // ---------------------------------------------------------
  return (
    // ✅ SCROLL FIX: 'min-h-screen' allows expansion
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 relative">
      <SuccessModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onContinue={() => goToNextStep()} message={successData.message} pdfUrl={successData.pdf_url} />

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT SIDE (Fixed on Desktop) */}
        <div className="hidden lg:flex lg:w-5/12 p-16 sticky top-0 h-screen flex-col bg-slate-900 text-white relative overflow-hidden z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                    <Sparkles size={20} className="text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Onboarding Portal</span>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h1 className="text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">State Tax <br/> Setup.</h1>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">You selected <strong>{selectedState}</strong>. Let's get your local withholding sorted out.</p>
                <div className="space-y-4 mb-8">
                    <FeatureItem icon={MapPin} title="State Specific" desc={`Tailored forms for ${selectedState} compliance.`} />
                    <FeatureItem icon={ShieldCheck} title="Regulatory Ready" desc="Meets local state tax regulations." />
                    <FeatureItem icon={Zap} title="Instant Filing" desc="Digital submission for payroll setup." />
                </div>
            </div>
        </div>

        {/* RIGHT SIDE (Scrollable Content) */}
        {/* ✅ SCROLL FIX: No 'h-screen'. Just 'flex-col' and 'relative' ensures content pushes height. */}
        <div className="w-full lg:w-7/12 p-6 md:p-12 bg-slate-50 flex flex-col relative z-0">
            <div className="w-full max-w-3xl mx-auto relative pb-20">
                <div className="hidden lg:flex justify-between items-end mb-6">
                    <div><h2 className="text-3xl font-bold text-slate-900">{selectedState} Tax Form</h2><p className="text-slate-500 mt-1">Please complete the details.</p></div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Step {currentStepNumber}/{totalSteps}</span>
                </div>
                
                <div className="w-full">
                    {/* DISPATCHER with Manual or Auto State */}
                    <StateTaxFormDispatcher userState={selectedState} initialData={userData} onSubmit={handleTaxSubmit} />
                </div>

                <div className="mt-12 text-center border-t border-slate-200 pt-6">
                    <p className="text-slate-400 text-xs">© TiswaTech Onboarding System • Secure & Encrypted</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StateTaxPage;