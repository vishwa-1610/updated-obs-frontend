import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, AlertCircle, CheckCircle, FileText, 
  MapPin, ShieldCheck, Zap, Sparkles, ArrowRight, Check
} from 'lucide-react';
import StateTaxFormDispatcher from '../Onboarding/StateForms/StateTaxFormDispatcher';

// 1. IMPORT API & CONTEXT
import api from '../../api'; 
import { useOnboarding } from '../../context/OnboardingContext';

// --- COMPONENTS ---

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
  
  // 1. GET DATA FROM URL
  const token = searchParams.get('token');
  const urlState = searchParams.get('state') || ''; 

  // 2. USE CONTEXT FOR WORKFLOW
  const { goToNextStep, workflow } = useOnboarding();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successData, setSuccessData] = useState({ message: '', pdf_url: '' });

  // 3. DYNAMIC STEP CALCULATION
  const stepName = 'State W4'; 
  const currentStepIndex = workflow.findIndex(s => s.step_name === stepName);
  const currentStepNumber = currentStepIndex !== -1 ? currentStepIndex + 1 : 4;
  const totalSteps = workflow.length > 0 ? workflow.length : 5;

  // 4. FETCH USER DATA
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
        
        setUserData({
            ...response.data,
            state: urlState || response.data.state 
        });
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Invalid or expired link. Please contact HR.");
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [token, urlState]);

  // 5. SUBMIT HANDLER
  const handleTaxSubmit = async (formData) => {
    if (!token) {
        alert("Error: Token is missing from the URL. Cannot submit.");
        return;
    }

    try {
      const payload = {
        ...formData, 
        email: userData?.email, 
        client_name: userData?.client_name,
        phone_no: userData?.phone_no,
        job_title: userData?.job_title,
        state: userData?.state,
        token: token 
      };

      const response = await api.post('/confirm-onboarding/', payload);

      if (response.status === 200 || response.status === 201) {
        setSuccessData({
          message: response.data.message,
          pdf_url: response.data.pdf_url
        });
        setModalOpen(true);
      }

    } catch (err) {
      console.error("❌ API Error:", err);
      let errorMsg = "An error occurred.";
      if (err.response?.data?.error) {
          errorMsg = err.response.data.error;
      } else if (err.response?.data) {
          errorMsg = JSON.stringify(err.response.data);
      }
      alert(`Submission Failed: ${errorMsg}`);
    }
  };

  const handleContinue = () => {
      // 6. DYNAMIC NAVIGATION
      // Finds the next active step in the company workflow
      goToNextStep();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-blue-600">
      <Loader2 size={48} className="animate-spin mb-4" />
      <p className="font-medium text-slate-600">Loading your profile...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-red-600 p-6 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-4"><AlertCircle size={48} /></div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Error</h2>
      <p className="text-slate-600 max-w-md mx-auto">{error}</p>
    </div>
  );

  const stateCode = userData?.state || 'Unknown';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 relative">
      <SuccessModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onContinue={handleContinue} 
        message={successData.message}
        pdfUrl={successData.pdf_url}
      />

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDE */}
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
                <h1 className="text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    State Tax <br/> Setup.
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
                    We've detected you are in <strong>{stateCode}</strong>. Let's get your local withholding sorted out.
                </p>
                <div className="space-y-4 mb-8">
                    <FeatureItem icon={MapPin} title="State Specific" desc={`Tailored forms for ${stateCode} compliance.`} />
                    <FeatureItem icon={ShieldCheck} title="Regulatory Ready" desc="Meets local state tax regulations." />
                    <FeatureItem icon={Zap} title="Instant Filing" desc="Digital submission for payroll setup." />
                </div>
                <div className="w-full max-w-sm mt-4 transform hover:scale-105 transition-transform duration-500 opacity-80">
                    <img src="https://illustrations.popsy.co/amber/finance-analysis.svg" alt="State Tax Illustration" className="w-full h-auto drop-shadow-2xl" />
                </div>
            </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-7/12 p-6 md:p-12 bg-slate-50 flex flex-col relative z-0">
            <div className="lg:hidden mb-8 text-center mt-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4 shadow-lg text-white">
                    <MapPin size={28} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">{stateCode} State Tax</h1>
                <p className="text-slate-500 mt-2 text-sm px-6">Complete your local withholding forms.</p>
            </div>

            <div className="w-full max-w-3xl mx-auto relative">
                <div className="hidden lg:flex justify-between items-end mb-6">
                    <div><h2 className="text-3xl font-bold text-slate-900">{stateCode} Tax Form</h2><p className="text-slate-500 mt-1">Please complete the state-specific withholding details.</p></div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Step {currentStepNumber}/{totalSteps}
                    </span>
                </div>

                <div className="w-full">
                    {/* DISPATCHER */}
                    <StateTaxFormDispatcher 
                        userState={stateCode} 
                        initialData={userData} 
                        onSubmit={handleTaxSubmit} 
                    />
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