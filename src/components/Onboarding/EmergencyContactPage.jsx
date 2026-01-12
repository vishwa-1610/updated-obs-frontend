import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Phone, Mail, Heart, UserPlus, 
  ArrowRight, Loader2, AlertCircle, MapPin, 
  ShieldCheck, Zap, FileCheck, Sparkles, Check
} from 'lucide-react';

import api from '../../api';
// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL; 

// --- STYLES ---
// Added 'text-base' for better readability on mobile inputs
const INPUT_BASE = "w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-base font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all duration-200 placeholder-gray-400 hover:border-blue-300 shadow-sm";
const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
// Adjusted padding for mobile (p-5) vs desktop (p-8)
const CARD_STYLE = "bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/5";

// --- COMPONENTS ---

const SuccessModal = () => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full transform animate-in zoom-in-95 duration-300 border border-white/50">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-lg shadow-green-500/20">
        <Check size={32} strokeWidth={3} />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Contacts Saved!</h3>
      <p className="text-slate-500 text-center mb-2">Proceeding to tax forms...</p>
      <div className="flex gap-1 mt-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-0"></span>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></span>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></span>
      </div>
    </div>
  </div>
);

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center gap-2 mb-8 px-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
    {[...Array(totalSteps)].map((_, i) => (
      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 shrink-0 ${i < currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`} />
    ))}
    <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Step {currentStep} of {totalSteps}</span>
  </div>
);

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

const InputField = ({ label, name, value, onChange, type = "text", placeholder, icon: Icon, required }) => (
  <div className="space-y-1 w-full">
    <label className={LABEL_STYLE}>
      {label} {required && <span className="text-blue-600">*</span>}
    </label>
    <div className="relative group">
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={INPUT_BASE}
      />
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200 pointer-events-none">
            <Icon size={20} strokeWidth={2.5} />
        </div>
      )}
    </div>
  </div>
);

// --- MAIN PAGE ---

const EmergencyContactPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token'); 
  const stateParam = searchParams.get('state');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    ec1_name: '', ec1_relationship: '', ec1_phone: '', ec1_email: '', ec1_address: '',
    ec2_name: '', ec2_relationship: '', ec2_phone: '', ec2_email: '', ec2_address: ''
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ec1_name || !formData.ec1_relationship || !formData.ec1_phone) {
        setError("Please complete the Primary Contact section.");
        window.scrollTo(0,0);
        return;
    }

    setIsSubmitting(true);
    // ✅ NEW
try {
    // 1. Use 'api.post'
    // 2. Remove URL and '/api' prefix
    await api.post('/emergency-contact/', { 
        token: token,
        ...formData 
    });
        
        setShowSuccessModal(true);

        setTimeout(() => {
            const nextUrl = stateParam 
                ? `/federal?token=${token}&state=${stateParam}`
                : `/federal?token=${token}`;
            navigate(nextUrl);
        }, 1500);

    } catch (err) {
        console.error(err);
        setError("Connection failed. Please try again.");
        window.scrollTo(0,0);
        setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .animate-in { animation-duration: 150ms; animation-fill-mode: both; }
      .fade-in { animation-name: fadeIn; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 relative">
      
      {showSuccessModal && <SuccessModal />}

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* --- LEFT SIDE: HIDDEN ON MOBILE (< lg) --- */}
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
                    Emergency <br/> Contacts.
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
                    Who should we contact in case of an emergency? Please provide at least one primary contact.
                </p>

                <div className="space-y-4 mb-8">
                    <FeatureItem icon={ShieldCheck} title="Privacy First" desc="This info is only accessed in emergencies." />
                    <FeatureItem icon={Zap} title="Quick Access" desc="Available to HR and management instantly." />
                </div>
                
                <div className="w-full max-w-sm mt-4 transform hover:scale-105 transition-transform duration-500 opacity-90">
                    <img 
                        src="https://illustrations.popsy.co/amber/social-media.svg"
                        alt="Contact Illustration" 
                        className="w-full h-auto drop-shadow-2xl"
                    />
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDE: FORM (Full Width on Mobile) --- */}
        <div className="w-full lg:w-7/12 p-4 md:p-8 lg:p-16 xl:p-24 bg-slate-50 flex flex-col relative z-0">
            
            {/* Mobile Header (Visible < lg) */}
            <div className="lg:hidden mb-8 text-center mt-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4 shadow-lg text-white">
                    <Users size={28} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Emergency Info</h1>
                <p className="text-slate-500 mt-2 text-sm px-6">Please provide contacts we can reach in case of an emergency.</p>
            </div>

            <div className="max-w-3xl w-full mx-auto relative">
                {/* Desktop Header */}
                <div className="hidden lg:flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Emergency Contacts</h2>
                        <p className="text-slate-500 mt-1">Please provide accurate contact details.</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Step 2/5
                    </span>
                </div>
                
                <StepIndicator currentStep={2} totalSteps={5} />

                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 animate-in fade-in">
                        <AlertCircle className="shrink-0" /> <p className="font-medium text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 relative">
                    
                    {/* --- PRIMARY CONTACT (CARD 1) --- */}
                    <div className={`${CARD_STYLE} ring-4 ring-blue-50/50`}>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
                        
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</span>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900">Primary Contact (Required)</h3>
                        </div>

                        {/* Grid changes from 1 col on mobile to 2 cols on desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <InputField label="Full Name" name="ec1_name" value={formData.ec1_name} onChange={handleChange} icon={UserPlus} required placeholder="e.g. Jane Doe" />
                            </div>
                            <InputField label="Relationship" name="ec1_relationship" value={formData.ec1_relationship} onChange={handleChange} icon={Heart} required placeholder="Spouse" />
                            <InputField label="Phone Number" name="ec1_phone" type="tel" value={formData.ec1_phone} onChange={handleChange} icon={Phone} required placeholder="(555)..." />
                            <InputField label="Email Address" name="ec1_email" type="email" value={formData.ec1_email} onChange={handleChange} icon={Mail} placeholder="Optional" />
                            <InputField label="Address" name="ec1_address" value={formData.ec1_address} onChange={handleChange} icon={MapPin} placeholder="Optional" />
                        </div>
                    </div>

                    {/* --- SECONDARY CONTACT (CARD 2) --- */}
                    <div className={CARD_STYLE}>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-200"></div>

                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <span className="bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</span>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900">Secondary Contact</h3>
                            <span className="ml-auto text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded border border-slate-100">Optional</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 opacity-90">
                            <div className="col-span-1 md:col-span-2">
                                <InputField label="Full Name" name="ec2_name" value={formData.ec2_name} onChange={handleChange} icon={UserPlus} placeholder="e.g. John Doe" />
                            </div>
                            <InputField label="Relationship" name="ec2_relationship" value={formData.ec2_relationship} onChange={handleChange} icon={Heart} placeholder="Parent" />
                            <InputField label="Phone Number" name="ec2_phone" type="tel" value={formData.ec2_phone} onChange={handleChange} icon={Phone} placeholder="(555)..." />
                            <InputField label="Email Address" name="ec2_email" type="email" value={formData.ec2_email} onChange={handleChange} icon={Mail} placeholder="Optional" />
                            <InputField label="Address" name="ec2_address" value={formData.ec2_address} onChange={handleChange} icon={MapPin} placeholder="Optional" />
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-4 flex justify-end relative z-0">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed z-10"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                            ) : (
                                <>Save & Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactPage;