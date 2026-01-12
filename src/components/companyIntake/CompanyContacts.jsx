import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Smartphone, CheckCircle2, XCircle, 
  Loader2, ArrowRight, Briefcase, Zap, Layers 
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
            {isSuccess ? 'Contacts Linked' : 'Save Failed'}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>
          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Continue to Industry' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. CUSTOM INPUT COMPONENT (White Theme Only) ---

const ThemeInput = ({ label, name, value, onChange, placeholder, icon: Icon, required = true, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-wider ml-1 text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-gray-400 group-focus-within:text-blue-600">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value || ''} 
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-4 pl-12 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all focus:border-transparent"
      />
    </div>
  </div>
);

// --- 3. MAIN COMPONENT ---

const CompanyContacts = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    admin_first_name: '', admin_last_name: '', admin_main_email: '', admin_alt_email: '',
    admin_mobile: '', admin_office_phone: '', admin_extension: '',
    billing_first_name: '', billing_last_name: '', billing_main_email: '', billing_alt_email: '',
    billing_mobile: '', billing_office_phone: '', billing_extension: ''
  });

  const [sameAsAdmin, setSameAsAdmin] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });

  // 1. Fetch Existing Data
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const response = await companyIntakeService.getCompanyContacts();
        if (mounted && response.data) {
          setFormData(prev => ({ ...prev, ...response.data }));
        }
      } catch (error) {
        if (error.response && error.response.status !== 404 && error.response.status !== 401) {
            console.error("Failed to load contacts", error);
        }
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (sameAsAdmin && name.startsWith('admin_')) {
        const billingField = name.replace('admin_', 'billing_');
        updated[billingField] = value;
      }
      return updated;
    });
  };

  const handleSameAsAdminToggle = () => {
    setSameAsAdmin(!sameAsAdmin);
    if (!sameAsAdmin) {
      setFormData(prev => ({
        ...prev,
        billing_first_name: prev.admin_first_name,
        billing_last_name: prev.admin_last_name,
        billing_main_email: prev.admin_main_email,
        billing_alt_email: prev.admin_alt_email,
        billing_mobile: prev.admin_mobile,
        billing_office_phone: prev.admin_office_phone,
        billing_extension: prev.admin_extension,
      }));
    }
  };

  // 2. Skip Functionality
  const handleSkip = () => {
      navigate('/set-company-type');
  };

  // 3. Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await companyIntakeService.updateCompanyContacts(formData);
      
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        message: 'Administrative and billing contacts have been successfully linked to your account.' 
      });
    } catch (err) {
      setModalState({ 
          isOpen: true, 
          type: 'error', 
          message: err.response?.data?.detail || 'Failed to save contacts. Please try again.' 
      });
    } finally {
        setLoading(false);
    }
  };

  const heroImage = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80";

  return (
    <div className="min-h-screen w-full bg-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-50 p-6 lg:w-1/2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Zap size={20} fill="currentColor" />
            </div>
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
                 <Layers size={16} className="mr-2"/> Step 2 of 4
               </div>
               <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
                 Key Contacts.
               </h1>
               <p className="text-lg text-slate-600">
                 Assign dedicated administrators for smooth communication.
               </p>
             </div>

             <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-slate-200 shadow-xl bg-white space-y-10">
                 
                 {/* ADMIN */}
                 <div>
                   <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><User size={20}/></div>
                     <h3 className="text-xl font-bold text-slate-900">Admin Contact</h3>
                   </div>
                   <div className="space-y-5">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <ThemeInput label="First Name" name="admin_first_name" value={formData.admin_first_name} onChange={handleChange} placeholder="John" icon={User} />
                       <ThemeInput label="Last Name" name="admin_last_name" value={formData.admin_last_name} onChange={handleChange} placeholder="Doe" icon={User} />
                     </div>
                     <ThemeInput label="Main Email" name="admin_main_email" value={formData.admin_main_email} onChange={handleChange} placeholder="john@company.com" icon={Mail} type="email" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <ThemeInput label="Mobile" name="admin_mobile" value={formData.admin_mobile} onChange={handleChange} placeholder="+1 (555) 000-0000" icon={Smartphone} />
                       <ThemeInput label="Office Phone" name="admin_office_phone" value={formData.admin_office_phone} onChange={handleChange} placeholder="Optional" icon={Phone} required={false} />
                     </div>
                   </div>
                 </div>

                 {/* DIVIDER */}
                 <div className="h-px w-full bg-gray-200"></div>

                 {/* BILLING */}
                 <div>
                   <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Briefcase size={20}/></div>
                       <h3 className="text-xl font-bold text-slate-900">Billing Contact</h3>
                     </div>
                     <div 
                       onClick={handleSameAsAdminToggle}
                       className={`cursor-pointer flex items-center gap-3 px-4 py-2 rounded-xl border transition-all select-none ${sameAsAdmin ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-gray-300 text-gray-600'}`}
                     >
                         <div className={`w-4 h-4 rounded border flex items-center justify-center ${sameAsAdmin ? 'border-white bg-white text-blue-600' : 'border-current'}`}>
                           {sameAsAdmin && <CheckCircle2 size={12} />}
                         </div>
                         <span className="text-sm font-bold">Same as Admin</span>
                     </div>
                   </div>

                   <div className={`space-y-5 transition-all duration-300 ${sameAsAdmin ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <ThemeInput label="First Name" name="billing_first_name" value={formData.billing_first_name} onChange={handleChange} placeholder="Jane" icon={User} />
                       <ThemeInput label="Last Name" name="billing_last_name" value={formData.billing_last_name} onChange={handleChange} placeholder="Smith" icon={User} />
                     </div>
                     <ThemeInput label="Main Email" name="billing_main_email" value={formData.billing_main_email} onChange={handleChange} placeholder="billing@company.com" icon={Mail} type="email" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <ThemeInput label="Mobile" name="billing_mobile" value={formData.billing_mobile} onChange={handleChange} placeholder="+1 (555) 000-0000" icon={Smartphone} />
                       <ThemeInput label="Office Phone" name="billing_office_phone" value={formData.billing_office_phone} onChange={handleChange} placeholder="Optional" icon={Phone} required={false} />
                     </div>
                   </div>
                 </div>

                 {/* ACTION */}
                 <div className="pt-4 flex flex-col gap-3">
                     <button 
                       type="submit" 
                       disabled={loading}
                       className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                       {loading ? <Loader2 className="animate-spin mr-2"/> : <>Save & Continue <ArrowRight size={20} className="ml-2"/></>}
                     </button>
                     
                     <button 
                        type="button" 
                        onClick={handleSkip}
                        className="w-full py-3 rounded-xl font-medium text-sm transition-colors hover:underline text-gray-500 hover:text-gray-800"
                     >
                        Skip for now, I'll manage this in the Dashboard
                     </button>
                 </div>
             </form>

           </div>
        </div>

        {/* RIGHT COLUMN: Fixed Image */}
        <div className="hidden lg:block w-1/2 fixed right-0 top-0 h-full z-0 p-6 bg-transparent">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img src={heroImage} alt="Network Connection" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent opacity-90"></div>
                
                <div className="absolute bottom-20 left-12 right-12 z-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                           <Zap className="text-blue-400" size={24} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                          Seamless Handoff
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Connect your <br/> key players.
                    </h2>
                    <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                        We keep your stakeholders aligned with real-time notifications and role-based dashboards.
                    </p>
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
        onAction={() => {
            setModalState({ ...modalState, isOpen: false });
            navigate('/set-company-type'); 
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

export default CompanyContacts;