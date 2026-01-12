import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Building2, MapPin, FileText, ChevronRight, 
  CheckCircle2, XCircle, Loader2, Globe, ArrowLeft, Zap, Layers
} from 'lucide-react';

// Import your Redux actions
import { registerCompany } from '../../store/companyIntakeSlice'; 
import { useTheme } from '../Theme/ThemeProvider';

// --- 1. MINIMAL & CRISP MODAL ---

const NotificationModal = ({ type, message, isOpen, onClose, onAction }) => {
  if (!isOpen) return null;
  const isSuccess = type === 'success';

  // Crisp Styling Config
  const iconBg = isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600';
  const buttonClass = isSuccess 
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' 
    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20';
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Light Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300" 
        onClick={isSuccess ? onAction : onClose}
      ></div>

      {/* The Card */}
      <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 max-w-sm w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          
          {/* Icon Bubble */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconBg} ring-4 ring-white shadow-sm`}>
             <Icon size={24} strokeWidth={2.5} />
          </div>

          <h3 className="text-lg font-extrabold text-slate-800 mb-1 tracking-tight">
            {isSuccess ? 'HQ Registered' : 'Registration Failed'}
          </h3>
          
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>

          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Add Key Contacts' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. REUSED COMPONENTS ---

const AnimatedBackground = ({ isDarkMode }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none fixed z-0">
    <div className={`absolute top-[-10%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[130px] opacity-[0.15] animate-pulse ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
    <div className={`absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full blur-[120px] opacity-[0.15] animate-pulse ${isDarkMode ? 'bg-indigo-600' : 'bg-blue-300'}`}></div>
  </div>
);

const ThemeInput = ({ label, name, value, onChange, placeholder, icon: Icon, isDarkMode }) => (
  <div className="space-y-2">
    <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-600'}`}>
        <Icon size={18} />
      </div>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-4 pl-12 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          isDarkMode 
            ? 'border-gray-700 text-white placeholder:text-gray-600 focus:bg-gray-800/50' 
            : 'border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white'
        }`}
      />
    </div>
  </div>
);

// --- 3. MAIN COMPONENT ---

const CompanyRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  
  // Theme Variables
  const bgGradient = isDarkMode ? 'bg-gray-900' : 'bg-slate-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = isDarkMode ? 'bg-gray-800/40 border-gray-700 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md';

  const [formData, setFormData] = useState({
    company_name: '', fein_dba_number: '', address_1: '', address_2: '',
    city: '', county: '', state: '', zipcode: ''
  });

  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });
  const { loading } = useSelector((state) => state.companyIntake);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ UPDATED: Handle Submit Logic for Backend Integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const responseData = await dispatch(registerCompany(formData)).unwrap();
      
      console.log("Registration Success:", responseData);

      if (responseData && responseData.id) {
        // 1. Store ID for API calls in Steps 2-4
        localStorage.setItem('onboarding_company_id', responseData.id);
        
        // 2. Store the Tenant URL (Backend returns this)
        // You will need this to redirect the user after the wizard finishes!
        if (responseData.tenant_url) {
            localStorage.setItem('onboarding_tenant_url', responseData.tenant_url);
        }
      }

      setModalState({ 
        isOpen: true, 
        type: 'success', 
        message: 'Your company HQ has been successfully established.' 
      });
      
    } catch (err) {
      console.error("Registration Error:", err);
      
      // ✅ UPDATED: Better Error parsing for Django DRF
      // DRF returns errors like { "fein_dba_number": ["This field must be unique."] }
      let errorMsg = 'Failed to register company.';
      
      if (typeof err === 'object' && err !== null && !err.detail) {
          // Flatten field errors into a string
          const fieldErrors = Object.keys(err).map(key => {
              const val = Array.isArray(err[key]) ? err[key][0] : err[key];
              return `${key.replace(/_/g, ' ').toUpperCase()}: ${val}`;
          });
          if (fieldErrors.length > 0) errorMsg = fieldErrors[0]; // Show first error
      } else if (err?.detail) {
          errorMsg = err.detail;
      }

      setModalState({ 
        isOpen: true, 
        type: 'error', 
        message: errorMsg 
      });
    }
  };

  const sideImage = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className={`min-h-screen flex ${bgGradient} transition-colors duration-500 font-sans selection:bg-blue-500/30 overflow-hidden relative`}>
      
      <AnimatedBackground isDarkMode={isDarkMode} />

      {/* --- Navbar --- */}
      <nav className="absolute top-0 w-full z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                    <Zap size={20} fill="currentColor" />
                </div>
                <span className={`text-xl font-bold tracking-tight ${textPrimary}`}>OnboardFlow</span>
            </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 pt-24 lg:pt-0">
        
        {/* LEFT COLUMN: Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:p-20 overflow-y-auto">
           <div className="max-w-xl mx-auto w-full animate-fade-in-up">
             
             <div className="mb-10">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold uppercase tracking-wider mb-6">
                  <Layers size={16} className="mr-2"/> Step 1 of 4
                </div>
               <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textPrimary}`}>
                 Let's Setup Your HQ.
               </h1>
               <p className={`text-lg ${textSecondary}`}>
                 Establish your official entity details to get started.
               </p>
             </div>

             <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl ${cardBg} transition-all duration-300`}>
                 <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <ThemeInput label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Acme Inc." icon={Building2} isDarkMode={isDarkMode} />
                         <ThemeInput label="FEIN / DBA" name="fein_dba_number" value={formData.fein_dba_number} onChange={handleChange} placeholder="XX-XXXXXXX" icon={FileText} isDarkMode={isDarkMode} />
                     </div>

                     <ThemeInput label="Address Line 1" name="address_1" value={formData.address_1} onChange={handleChange} placeholder="123 Corporate Blvd" icon={MapPin} isDarkMode={isDarkMode} />

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <ThemeInput label="Address Line 2" name="address_2" value={formData.address_2} onChange={handleChange} placeholder="Suite 400" icon={MapPin} isDarkMode={isDarkMode} />
                         <ThemeInput label="City" name="city" value={formData.city} onChange={handleChange} placeholder="New York" icon={Building2} isDarkMode={isDarkMode} />
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                         <ThemeInput label="State" name="state" value={formData.state} onChange={handleChange} placeholder="NY" icon={Globe} isDarkMode={isDarkMode} />
                         <ThemeInput label="County" name="county" value={formData.county} onChange={handleChange} placeholder="NYC" icon={MapPin} isDarkMode={isDarkMode} />
                         <ThemeInput label="Zip" name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="10001" icon={MapPin} isDarkMode={isDarkMode} />
                     </div>
                 </div>

                 <div className="mt-10">
                     <button 
                       type="submit" 
                       disabled={loading}
                       className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                       {loading ? <Loader2 className="animate-spin mr-2"/> : <>Next Step <ChevronRight size={20} className="ml-2"/></>}
                     </button>
                 </div>
             </form>

           </div>
        </div>

        {/* RIGHT COLUMN: Visuals */}
        <div className="hidden lg:block w-1/2 relative h-screen sticky top-0 p-6">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img 
                  src={sideImage} 
                  alt="Modern Leadership" 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-gray-900 via-gray-900/40' : 'from-blue-900 via-blue-900/40'} to-transparent opacity-90`}></div>
                
                <div className="absolute bottom-20 left-12 right-12 z-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Lead with vision. <br/> Automate the rest.
                    </h2>
                    <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                        Set up your digital headquarters once. We handle compliance, payroll, and onboarding for every hire thereafter.
                    </p>
                </div>
            </div>
        </div>

      </div>
      
      {/* Minimal & Crisp Modal */}
      <NotificationModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState({...modalState, isOpen: false})}
        onAction={() => {
            setModalState({ ...modalState, isOpen: false });
            if (modalState.type === 'success') {
                navigate('/add-company-contacts');
            }
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

export default CompanyRegister;