import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Lock, CheckCircle2, ShieldCheck, 
  Loader2, ArrowRight, Zap, Layers, AlertOctagon, 
  Wallet, Calendar, User
} from 'lucide-react';

// Import Service directly
import { companyIntakeService } from '../../services/companyIntakeService';
import api from '../../api'; 

// --- 1. MINIMAL & CRISP MODAL ---

const NotificationModal = ({ type, message, isOpen, onClose, onAction }) => {
  if (!isOpen) return null;
  const isSuccess = type === 'success';

  const iconBg = isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600';
  const buttonClass = isSuccess 
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' 
    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20';
  const Icon = isSuccess ? ShieldCheck : AlertOctagon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Light Backdrop with Blur */}
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
            {isSuccess ? 'Payment Verified' : 'Setup Failed'}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>
          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Go to Dashboard' : 'Try Again'}
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

const CompanyPayment = () => {
  const navigate = useNavigate();

  // Local State
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });

  // ✅ 1. Check for Existing Payment (Safely)
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) return; // Prevent redirect loop in public mode

    const checkPayment = async () => {
        try {
            // RetrieveUpdateAPIView allows GET
            await api.get('payment-setup/');
            // If successful, maybe show a "Payment on file" badge, 
            // but for security we usually don't populate CC fields.
        } catch (err) {
            console.warn("Payment fetch skipped/failed", err);
        }
    };
    checkPayment();
  }, []);

  // Formatters
  const handleCardInput = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(value);
  };

  const handleExpiryInput = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
    setExpiry(value);
  };

  const handleFinishRedirect = () => {
      // ✅ Redirect to Tenant URL if available, else generic dashboard
      const tenantUrl = localStorage.getItem('onboarding_tenant_url');
      if (tenantUrl) {
          window.location.href = tenantUrl; // Hard redirect to subdomain
      } else {
          navigate('/dashboard');
      }
  };

  const handleSkip = () => {
      handleFinishRedirect();
  };

  // ✅ 2. Handle Submit (PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      setModalState({ isOpen: true, type: 'error', message: 'You must agree to the recurring billing terms.' });
      return;
    }

    if (cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3 || !cardName) {
       setModalState({ isOpen: true, type: 'error', message: 'Please complete all card details.' });
       return;
    }

    setLoading(true);
    
    // Simulate "Bank Verification" delay
    setTimeout(async () => {
        try {
            // Mock Token (In production, use Stripe Elements to get this)
            const mockToken = `tok_visa_${Math.random().toString(36).substring(7)}`;

            // Call Service
            await companyIntakeService.savePayment({
                gateway_token: mockToken,
                // Add any other billing fields your model expects if needed
            });

            setModalState({ 
                isOpen: true, 
                type: 'success', 
                message: 'Your payment method has been verified. Setup Complete!' 
            });

        } catch (err) {
            console.error(err);
            let msg = "Payment setup failed.";
            if (err.response?.data?.detail) msg = err.response.data.detail;
            setModalState({ isOpen: true, type: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    }, 1500); 
  };

  // Styles (Pure White)
  const bgGradient = 'bg-white';
  const textPrimary = 'text-slate-900';
  const textSecondary = 'text-slate-600';
  const cardBg = 'bg-white border-slate-200';
  const inputBg = 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400';

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
        
        {/* LEFT COLUMN: Payment Form */}
        <div className="w-full lg:w-1/2 flex flex-col px-6 pb-12 lg:px-20 relative z-10">
           <div className="h-28"></div> 

           <div className="max-w-xl mx-auto w-full animate-fade-in-up">
             
             <div className="mb-8">
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-6">
                 <Layers size={16} className="mr-2"/> Step 10 of 10
               </div>
               <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textPrimary}`}>
                 Secure Verification.
               </h1>
               <p className={`text-lg ${textSecondary}`}>
                 Verify your identity with a valid payment method. You won't be charged until you activate your first employee.
               </p>
             </div>

             <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl ${cardBg} transition-all duration-300 space-y-6`}>
                
                {/* Visual Card Representation */}
                <div className="relative w-full h-56 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-6 shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-700 group perspective-1000">
                    
                    {/* Metallic Shine */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    
                    <div className="flex justify-between items-start z-10">
                        <Wallet className="text-blue-400" size={32} />
                        <span className="text-slate-500 font-mono text-[10px] tracking-[0.2em] font-bold">SECURE PAYMENT</span>
                    </div>
                    
                    <div className="z-10 mt-2">
                        {/* Chip */}
                        <div className="w-12 h-9 rounded bg-gradient-to-tr from-yellow-200 to-yellow-500 mb-4 opacity-90 border border-yellow-600/50 shadow-sm relative overflow-hidden">
                            <div className="absolute top-1/2 w-full h-[1px] bg-black/20"></div>
                            <div className="absolute left-1/2 h-full w-[1px] bg-black/20"></div>
                        </div>

                        <div className="text-white font-mono text-2xl tracking-widest mb-6 tabular-nums drop-shadow-md">
                            {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div className="text-xs text-slate-300">
                                <p className="uppercase text-[9px] text-slate-500 font-bold mb-0.5 tracking-wider">Card Holder</p>
                                <p className="text-white font-bold tracking-widest uppercase truncate max-w-[180px]">
                                    {cardName || 'YOUR NAME'}
                                </p>
                            </div>
                            <div className="text-xs text-slate-300 text-right">
                                <p className="uppercase text-[9px] text-slate-500 font-bold mb-0.5 tracking-wider">Expires</p>
                                <p className="text-white font-bold tracking-widest">{expiry || 'MM/YY'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                    
                    {/* Cardholder Name */}
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 text-gray-600`}>Cardholder Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                placeholder="JOHN DOE"
                                className={`w-full pl-12 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium border ${inputBg}`}
                            />
                        </div>
                    </div>

                    {/* Card Number */}
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 text-gray-600`}>Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={cardNumber}
                                onChange={handleCardInput}
                                placeholder="0000 0000 0000 0000"
                                className={`w-full pl-12 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono border ${inputBg}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 text-gray-600`}>Expiry Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={expiry}
                                    onChange={handleExpiryInput}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    className={`w-full pl-12 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono border ${inputBg}`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 text-gray-600`}>CVC</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                    placeholder="123"
                                    className={`w-full pl-12 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono border ${inputBg}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms Toggle */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${agreed ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div 
                        onClick={() => setAgreed(!agreed)}
                        className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-all ${agreed ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-400'}`}
                    >
                        {agreed && <CheckCircle2 size={14} strokeWidth={3} />}
                    </div>
                    <p className={`text-xs leading-relaxed ${textSecondary}`}>
                        I authorize a recurring charge of <span className="font-bold text-gray-900">$5.00 per active user/month</span>. I agree to the <span className="underline cursor-pointer hover:text-blue-500">Terms of Service</span> and <span className="underline cursor-pointer hover:text-blue-500">Privacy Policy</span>.
                    </p>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70 group"
                   >
                     {loading ? <Loader2 className="animate-spin mr-2"/> : (
                       <>
                           <ShieldCheck size={18} className="mr-2 group-hover:scale-110 transition-transform" /> 
                           Verify & Activate Account
                       </>
                     )}
                   </button>

                   {/* ✅ SKIP BUTTON */}
                   <button 
                      type="button" 
                      onClick={handleSkip} 
                      className="w-full py-3 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                   >
                      Skip Payment Setup (Free Tier)
                   </button>
                </div>

             </form>
           </div>
        </div>

        {/* RIGHT COLUMN: Summary Visuals */}
        <div className="hidden lg:flex w-1/2 fixed right-0 top-0 h-full z-0 p-12 bg-transparent items-center justify-center">
            
            <div className="relative w-full max-w-md space-y-6">
                
                {/* Plan Card */}
                <div className="relative p-8 rounded-[2rem] bg-white shadow-2xl border border-slate-100 overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Lock size={120} className="text-blue-500 rotate-12" />
                    </div>
                    
                    <div className="relative z-10">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest">
                            Enterprise Plan
                        </span>
                        <h2 className="text-4xl font-extrabold text-gray-900 mt-4 mb-2">
                            $5.00 <span className="text-lg font-medium text-gray-500">/ user</span>
                        </h2>
                        <p className="text-sm text-gray-500 mb-8">
                            Simple, usage-based pricing. No hidden setup fees. Cancel anytime.
                        </p>

                        <ul className="space-y-3">
                            {['Unlimited Workflows', 'Custom Branding', 'Digital Signatures', 'Cloud Hosting'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 size={12} strokeWidth={3} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 backdrop-blur-sm border border-gray-200">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="text-xs font-semibold text-gray-600">
                        256-bit SSL Encrypted Payment
                    </span>
                </div>

            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 blur-[100px]"></div>
        </div>

      </div>

      <NotificationModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState({...modalState, isOpen: false})}
        onAction={() => {
            setModalState({ ...modalState, isOpen: false });
            handleFinishRedirect(); 
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

export default CompanyPayment;