import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, CheckCircle2, XCircle, Loader2, 
  ArrowRight, Zap, Layers, Briefcase 
} from 'lucide-react';

// Import Service directly
import { companyIntakeService } from '../../services/companyIntakeService';

// --- 1. MINIMAL & CRISP MODAL ---

const NotificationModal = ({ type, message, isOpen, onClose, onAction }) => {
  if (!isOpen) return null;
  const isSuccess = type === 'success';

  const iconBg = isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600';
  const buttonClass = isSuccess 
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' 
    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20';
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300" 
        onClick={isSuccess ? onAction : onClose}
      ></div>

      <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 max-w-sm w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconBg} ring-4 ring-white shadow-sm`}>
             <Icon size={24} strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mb-1 tracking-tight">
            {isSuccess ? 'Industry Set' : 'Save Failed'}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>
          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Define Workflow' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. MAIN COMPONENT ---

const CompanyType = () => {
  const navigate = useNavigate();
  
  // Logic: Robust ID Retrieval
  const storedCompanyId = localStorage.getItem('onboarding_company_id');
  
  const [loading, setLoading] = useState(false);
  const [industryType, setIndustryType] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });

  // ✅ 1. Fetch Existing Data (GET)
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
        try {
            const response = await companyIntakeService.getCompanyType();
            // Pre-select if data exists
            if (mounted && response.data && response.data.industry_type) {
                setIndustryType(response.data.industry_type);
            }
        } catch (error) {
            // Ignore 404/401 errors for initial fetch
            console.error("Error fetching company type:", error);
        }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // ✅ 2. Handle Skip
  const handleSkip = () => {
      navigate('/workflow-steps');
  };

  // ✅ 3. Handle Submit (PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!industryType) {
      setModalState({ isOpen: true, type: 'error', message: 'Please select an industry type.' });
      return;
    }

    setLoading(true);

    try {
      await companyIntakeService.setCompanyType({ industry_type: industryType });
      
      setModalState({ 
          isOpen: true, 
          type: 'success', 
          message: 'Business model saved successfully. We will now configure your workflows.' 
      });
    } catch (err) {
      setModalState({ 
          isOpen: true, 
          type: 'error', 
          message: err.response?.data?.detail || 'Failed to save industry type.' 
      });
    } finally {
        setLoading(false);
    }
  };

  // Styles (Pure White Theme)
  const activeBorder = 'border-blue-500 ring-1 ring-blue-500 bg-blue-50';
  const inactiveBorder = 'border-gray-200 hover:bg-gray-50';

  const options = [
    { id: 'OWN', title: 'Own Company Onboarding', desc: 'We are hiring employees directly for our own internal teams and projects.', icon: Building2 },
    { id: 'STAFFING', title: 'Staffing / Consulting', desc: 'We are a staffing agency hiring consultants to place at client locations.', icon: Users }
  ];

  return (
    <div className="min-h-screen w-full bg-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-50 p-6 lg:w-1/2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30"><Zap size={20} fill="currentColor" /></div>
            <span className="text-xl font-bold tracking-tight text-slate-900">OnboardFlow</span>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        
        {/* Left Column */}
        <div className="w-full lg:w-1/2 flex flex-col px-6 pb-12 lg:px-20 relative z-10">
           <div className="h-28"></div>
           <div className="max-w-xl mx-auto w-full animate-fade-in-up">
             
             <div className="mb-10">
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-6">
                 <Layers size={16} className="mr-2"/> Step 3 of 4
               </div>
               <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">Business Model.</h1>
               <p className="text-lg text-slate-600">Select how your organization operates to configure the correct workflow.</p>
             </div>

             <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-slate-200 shadow-xl bg-white space-y-8">
                 <div className="grid grid-cols-1 gap-4">
                    <label className="text-xs font-bold uppercase tracking-wider ml-1 mb-2 text-gray-600">Industry Association <span className="text-red-500">*</span></label>
                    
                    {options.map((opt) => (
                      <div 
                        key={opt.id} 
                        onClick={() => setIndustryType(opt.id)} 
                        className={`relative cursor-pointer group p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${industryType === opt.id ? activeBorder : inactiveBorder}`}
                      >
                        <div className={`p-3 rounded-xl transition-colors ${industryType === opt.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:text-blue-500'}`}>
                            <opt.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg mb-1 text-slate-900">{opt.title}</h4>
                            <p className="text-sm leading-relaxed text-slate-600">{opt.desc}</p>
                        </div>
                        {industryType === opt.id && (
                            <div className="absolute top-5 right-5 text-blue-500 animate-in fade-in zoom-in duration-200">
                                <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                            </div>
                        )}
                      </div>
                    ))}
                 </div>

                 <div className="pt-2 flex flex-col gap-3">
                     <button 
                       type="submit" 
                       disabled={loading} 
                       className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {loading ? <Loader2 className="animate-spin mr-2"/> : <>Next: Workflows <ArrowRight size={20} className="ml-2"/></>}
                     </button>
                     
                     {/* ✅ SKIP BUTTON */}
                     <button 
                        type="button" 
                        onClick={handleSkip} 
                        className="w-full py-3 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                     >
                        Skip for now, I'll set this later
                     </button>
                 </div>
             </form>
           </div>
        </div>

        {/* Right Column (Image) */}
        <div className="hidden lg:block w-1/2 fixed right-0 top-0 h-full z-0 p-6 bg-transparent">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1769&q=80" alt="Office Architecture" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent opacity-90"></div>
                <div className="absolute bottom-20 left-12 right-12 z-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"><Briefcase className="text-blue-400" size={24} /></div>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">Architecture</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Define your <br/> business identity.</h2>
                    <p className="text-lg text-gray-300 max-w-md leading-relaxed">Setting your industry type unlocks specialized templates and compliance workflows tailored to your needs.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Standardized Notification Modal */}
      <NotificationModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState({...modalState, isOpen: false})}
        onAction={() => { setModalState({ ...modalState, isOpen: false }); navigate('/workflow-steps'); }}
      />
      
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CompanyType;