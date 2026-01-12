import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, Server, Database, CheckCircle2, XCircle, 
  Loader2, ArrowRight, Zap, Layers, Info, Globe, Cpu, HardDrive
} from 'lucide-react';

// Import Service directly
import { companyIntakeService } from '../../services/companyIntakeService';
import api from '../../api'; // Direct API access for GET if service method missing

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
            {isSuccess ? 'Environment Configured' : 'Setup Failed'}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>
          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Proceed to Payment' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. REUSED COMPONENTS ---

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none fixed z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[130px] opacity-[0.15] animate-pulse bg-blue-400"></div>
    <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full blur-[120px] opacity-[0.15] animate-pulse bg-blue-300"></div>
  </div>
);

// --- 3. MAIN COMPONENT ---

const CompanyHosting = () => {
  const navigate = useNavigate();

  // Local State
  const [selectedProvider, setSelectedProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });

  // Provider Options
  const providers = [
    { 
      id: 'AWS', 
      name: 'Amazon Web Services', 
      icon: Cloud, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      features: ['99.99% Uptime', 'Global Regions', 'Elastic Scaling']
    },
    { 
      id: 'AZURE', 
      name: 'Microsoft Azure', 
      icon: Server, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      features: ['Enterprise Security', 'Hybrid Cloud', 'Active Directory']
    },
    { 
      id: 'GCP', 
      name: 'Google Cloud Platform', 
      icon: Database, 
      color: 'text-green-500', 
      bg: 'bg-green-50',
      border: 'border-green-500',
      features: ['High Performance', 'AI/ML Ready', 'Live Migration']
    },
  ];

  // ✅ 1. Fetch Existing Hosting (GET)
  useEffect(() => {
    let mounted = true;
    const fetchHosting = async () => {
        try {
            // Using raw api call if service doesn't have explicit GET method in list
            // Assuming 'hosting/' endpoint is RetrieveUpdateAPIView
            const response = await api.get('hosting/'); 
            if (mounted && response.data && response.data.provider) {
                setSelectedProvider(response.data.provider);
            }
        } catch (err) {
             console.warn("Hosting fetch skipped (likely public/unauthorized)", err);
        }
    };
    fetchHosting();
    return () => { mounted = false; };
  }, []);

  // ✅ 2. Handle Submit (PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProvider) {
      setModalState({ isOpen: true, type: 'error', message: 'Please select a hosting provider.' });
      return;
    }

    setLoading(true);

    try {
      // Direct service call, no company_id needed
      await companyIntakeService.saveHosting({ provider: selectedProvider });
      
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        message: 'Hosting environment provisioning initiated successfully.' 
      });
    } catch (err) {
      console.error(err);
      let msg = "Failed to configure hosting.";
      if (err.response?.data?.detail) msg = err.response.data.detail;
      setModalState({ isOpen: true, type: 'error', message: msg });
    } finally {
        setLoading(false);
    }
  };

  // ✅ 3. Skip Functionality
  const handleSkip = () => {
      navigate('/payment');
  };

  // Styles (Pure White)
  const bgGradient = 'bg-white';
  const textPrimary = 'text-slate-900';
  const textSecondary = 'text-slate-600';
  const cardBg = 'bg-white border-slate-200';

  return (
    <div className={`min-h-screen w-full ${bgGradient} font-sans selection:bg-blue-500/30 overflow-x-hidden`}>
      <AnimatedBackground />

      <nav className="absolute top-0 left-0 w-full z-50 p-6 lg:w-1/2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30"><Zap size={20} fill="currentColor" /></div>
            <span className={`text-xl font-bold tracking-tight ${textPrimary}`}>OnboardFlow</span>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        
        {/* LEFT COLUMN: Form */}
        <div className="w-full lg:w-1/2 flex flex-col px-6 pb-12 lg:px-20 relative z-10">
           <div className="h-28"></div> 

           <div className="max-w-xl mx-auto w-full animate-fade-in-up">
             
             <div className="mb-8">
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-6">
                 <Layers size={16} className="mr-2"/> Step 9 of 10
               </div>
               <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textPrimary}`}>
                 Cloud Hosting.
               </h1>
               <p className={`text-lg ${textSecondary}`}>
                 Select the dedicated cloud infrastructure where your employee data will be securely stored.
               </p>
             </div>

             <div className={`p-8 rounded-3xl border shadow-xl ${cardBg} transition-all duration-300 space-y-6`}>
                
                {/* Provider Selection Grid */}
                <div className="space-y-4">
                  {providers.map((p) => {
                    const isSelected = selectedProvider === p.id;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedProvider(p.id)}
                        className={`cursor-pointer relative p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${isSelected ? `${p.border} ${p.bg}` : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-white ${p.color}`}>
                              <p.icon size={24} />
                            </div>
                            <div>
                              <h3 className={`text-lg font-bold ${textPrimary}`}>{p.name}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {p.features.map((feat, i) => (
                                  <span key={i} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? `border-current ${p.color} bg-current` : 'border-gray-400'}`}>
                             {isSelected && <CheckCircle2 size={16} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pricing Disclaimer Box */}
                <div className="p-4 rounded-xl border flex gap-3 bg-blue-50 border-blue-100 text-blue-800">
                   <Info className="shrink-0" size={20} />
                   <div className="text-xs leading-relaxed font-medium">
                      <span className="block font-bold mb-1 text-sm">Pricing Breakdown</span>
                      Onboarding Charge: $5/Employee/Candidate + Standard Cloud Hosting Fees applied by the selected provider. By continuing, you agree to these terms.
                   </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                   <button 
                     onClick={handleSubmit}
                     disabled={loading}
                     className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70"
                   >
                     {loading ? <Loader2 className="animate-spin mr-2"/> : <>Deploy Environment <ArrowRight size={20} className="ml-2"/></>}
                   </button>

                   {/* SKIP BUTTON */}
                   <button 
                      type="button" 
                      onClick={handleSkip} 
                      className="w-full py-3 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                   >
                      Skip for now, I'll select later
                   </button>
                </div>

             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Visuals */}
        <div className="hidden lg:flex w-1/2 fixed right-0 top-0 h-full z-0 p-12 bg-transparent items-center justify-center">
            
            {/* Visual Container */}
            <div className="relative w-full max-w-md aspect-square rounded-[3rem] overflow-hidden flex items-center justify-center">
                
                {/* Central Server Graphic */}
                <div className="relative z-10 flex flex-col items-center">
                   {/* Floating Icons Animation */}
                   <div className="relative mb-8">
                      <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-40 animate-pulse"></div>
                      <Globe size={120} className="text-blue-400 relative z-10 animate-[spin_20s_linear_infinite]" strokeWidth={0.5} />
                      
                      {/* Satellites */}
                      <div className="absolute top-0 right-0 p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-xl animate-bounce" style={{ animationDelay: '0s' }}>
                         <Cpu className="text-green-400" size={24} />
                      </div>
                      <div className="absolute bottom-0 left-0 p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-xl animate-bounce" style={{ animationDelay: '1s' }}>
                         <HardDrive className="text-purple-400" size={24} />
                      </div>
                   </div>

                   <h2 className="text-3xl font-bold text-white text-center mb-4">Enterprise Grade <br/> Infrastructure</h2>
                   <p className="text-gray-400 text-center text-sm max-w-xs leading-relaxed">
                      Your data is isolated, encrypted, and backed up across multiple availability zones automatically. 

[Image of Cloud Server Architecture]

                   </p>
                </div>

                {/* Abstract Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20" 
                     style={{ 
                       backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`, 
                       backgroundSize: '30px 30px' 
                     }}>
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent"></div>

            </div>
        </div>

      </div>

      <NotificationModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState({...modalState, isOpen: false})}
        onAction={() => {
            setModalState({ ...modalState, isOpen: false });
            navigate('/payment'); 
        }}
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

export default CompanyHosting;