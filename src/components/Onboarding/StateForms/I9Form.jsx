import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, MapPin, Mail, Phone, Calendar, 
  CheckCircle, FileText, ChevronDown, ChevronLeft, ChevronRight, 
  Briefcase, Globe, PenTool, Eraser, Save, AlertCircle, Loader2,
  ShieldCheck, Zap, FileJson, Sparkles, Check,ArrowRight 
} from 'lucide-react';

import api from '../../../api';

// 1. IMPORT CONTEXT HOOK
import { useOnboarding } from '../../../context/OnboardingContext';

// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// --- STYLES ---
const INPUT_BASE = "w-full pl-4 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all duration-200 placeholder-gray-400 hover:border-blue-300 shadow-sm disabled:bg-gray-50 disabled:text-gray-500";
const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
const CARD_STYLE = "w-full bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 relative transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/5";
const SECTION_HEADER_STYLE = "flex items-center gap-3 mb-6 pb-4 border-b border-gray-100";

// --- COMPONENTS ---

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

const SuccessModal = ({ isOpen, onClose, message, pdfUrl, onNext }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-white/50">
        <div className="bg-green-50 p-8 flex flex-col items-center justify-center border-b border-green-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <Check size={40} strokeWidth={3} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">I-9 Submitted!</h3>
          <p className="text-sm text-slate-500 mb-0 leading-relaxed text-center">{message || "Your Employment Eligibility form has been successfully generated."}</p>
        </div>
        <div className="p-6 space-y-3">
            <button type="button" className="w-full px-4 py-3.5 text-lg font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg transition-colors flex items-center justify-center" onClick={onNext}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

// --- CUSTOM DATE PICKER (FIXED Z-INDEX & MOBILE CENTERING) ---
const CustomDatePicker = ({ label, name, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const calendarRef = useRef(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target) && calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position on open
  useEffect(() => {
    if (isOpen && triggerRef.current) {
        const updatePosition = () => {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let style = { position: 'fixed', zIndex: 10005 }; // High Z-Index to stay on top

            if (viewportWidth < 768) {
                // MOBILE: Dead Center
                style.top = '50%';
                style.left = '50%';
                style.transform = 'translate(-50%, -50%)';
                style.width = '320px';
                style.maxWidth = '90vw';
            } else {
                // DESKTOP: Align to input
                style.left = `${rect.left}px`;
                style.width = '320px';
                style.transform = 'none';

                // Check space below
                const spaceBelow = viewportHeight - rect.bottom;
                if (spaceBelow < 350 && rect.top > 350) {
                    // Open UPWARDS if no space below
                    style.bottom = `${viewportHeight - rect.top + 8}px`;
                    style.top = 'auto';
                } else {
                    // Open DOWNWARDS
                    style.top = `${rect.bottom + 8}px`;
                    style.bottom = 'auto';
                }
            }
            setMenuStyle(style);
        };
        
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }
  }, [isOpen]);

  useEffect(() => { if (value) setCurrentDate(new Date(value)); }, [value]);

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="relative w-full" ref={triggerRef}>
      <label className={LABEL_STYLE}>{label}</label>
      <div className="relative cursor-pointer group">
        {/* Added pr-12 to prevent text overlapping icon */}
        <input 
            readOnly 
            type="text" 
            value={value || ''} 
            placeholder={placeholder || "YYYY-MM-DD"} 
            className={`${INPUT_BASE} pr-12 cursor-pointer group-hover:border-blue-400`} 
            onClick={() => setIsOpen(!isOpen)} 
        />
        <Calendar 
            size={20} 
            className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} 
        />
      </div>
      
      {isOpen && (
        <>
         {/* Backdrop for Mobile */}
         <div className="fixed inset-0 bg-black/40 z-[10004]" onClick={() => setIsOpen(false)}></div>
         
         <div ref={calendarRef} style={menuStyle} className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
               <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20}/></button>
               <span className="font-bold text-gray-800 text-lg">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
               <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
               {['S','M','T','W','T','F','S'].map(d=><span key={d} className="text-xs text-gray-400 font-bold uppercase">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
               {Array(firstDay).fill(null).map((_,i)=><div key={`e-${i}`}/>)}
               {Array.from({length: daysInMonth}, (_,i)=>i+1).map(d => (
                  <button 
                    key={d} 
                    type="button" 
                    onClick={() => handleDateClick(d)} 
                    className={`h-9 w-9 text-sm rounded-lg flex items-center justify-center font-medium transition-all ${
                        value && parseInt(value.split('-')[2]) === d && new Date(value).getMonth() === currentDate.getMonth()
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {d}
                  </button>
               ))}
            </div>
         </div>
        </>
      )}
    </div>
  );
};

// --- MAIN PAGE ---

const I9FormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. GET TOKEN
  const token = searchParams.get('token');

  // 2. USE CONTEXT FOR WORKFLOW
  const { goToNextStep, workflow } = useOnboarding();

  const sigCanvasRef = useRef({});
  const containerRef = useRef(null);

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [error, setError] = useState(null);

  // 3. DYNAMIC STEP CALCULATION
  const stepName = 'I9'; 
  const currentStepIndex = workflow.findIndex(s => s.step_name === stepName);
  const currentStepNumber = currentStepIndex !== -1 ? currentStepIndex + 1 : 5;
  const totalSteps = workflow.length > 0 ? workflow.length : 5;

  // Form State
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', middle_initial: '', other_last_names: '',
    address: '', apt_number: '', city: '', state: '', zipcode: '',
    dob: '', ssn: '', email: '', phone: '',
    citizenship_status: 'citizen',
    uscis_a_number: '', auth_expire_date: '', form_i94_number: '', foreign_passport_number: '', country_of_issuance: '',
    document_list_type: 'A',
    document_title: '', issuing_authority: '', document_number: '', expiration_date: '',
    doc_title_b: '', doc_authority_b: '', doc_number_b: '', doc_expire_b: '',
    doc_title_c: '', doc_authority_c: '', doc_number_c: '', doc_expire_c: '',
    first_day_employment: '', employer_name: '', company_name: '', company_address: '',
    has_preparer: false, prep_name: '', prep_first_name: '', prep_last_name: '', prep_address: '', prep_city: '', prep_state: '', prep_zip: '',
    is_rehire: false, rehire_date: '', rehire_last_name: '', rehire_first_name: '', rehire_doc_title: '', rehire_doc_number: '', rehire_doc_expire: '',
    signature_date: new Date().toISOString().split('T')[0],
    is_signed: false,
    signature_image: null
  });

  // 4. Fetch Data using Token
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the public validate endpoint
        const res = await api.get(`/onboarding/validate/${token}/`);
        const data = res.data;
        
        setFormData(prev => ({
          ...prev,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone_no || '', 
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipcode: data.zipcode || '',
          employer_name: 'HR Manager', 
          company_name: data.client_name || 'Tech Corp',
          first_day_employment: data.start_date || ''
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // 5. Resize Canvas
  useEffect(() => {
    const resizeCanvas = () => {
        if (containerRef.current && sigCanvasRef.current) {
            const canvas = sigCanvasRef.current.getCanvas();
            const rect = containerRef.current.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                const saved = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
                canvas.width = rect.width; canvas.height = rect.height;
                if (saved) sigCanvasRef.current.fromDataURL(saved);
            }
        }
    };
    setTimeout(resizeCanvas, 200);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
       setFormData(prev => ({ ...prev, is_signed: true, signature_image: sigCanvasRef.current.getCanvas().toDataURL('image/png') }));
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, is_signed: false, signature_image: null }));
  };

  const handleSubmit = async () => {
    if (!formData.is_signed) { alert("Please sign the form before submitting."); return; }

    setSubmitting(true);
    try {
      // Send TOKEN instead of ID
      const payload = { ...formData, token: token };
      const res = await api.post('/submit-i9/', payload);
      setSuccessData(res.data);
      setModalOpen(true);
    } catch (err) {
      alert("Submission failed. Check console.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
      // 6. DYNAMIC NAVIGATION
      // Finds the next active step in the company workflow
      goToNextStep();
  };

  // Add scrollbar styles
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
      <SuccessModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        message={successData.message} 
        pdfUrl={successData.pdf_url} 
        onNext={handleNext} 
      />

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* --- LEFT SIDE (Hidden on Mobile) --- */}
        <div className="hidden lg:flex lg:w-5/12 p-16 sticky top-0 h-screen flex-col bg-slate-900 text-white relative overflow-hidden z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50"><Sparkles size={20} className="text-white" /></div>
                <span className="font-bold text-xl tracking-tight text-white">Onboarding Portal</span>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h1 className="text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">I-9 Verification.</h1>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">Verify your identity and employment authorization. This is the final step.</p>
                <div className="space-y-4 mb-8">
                    <FeatureItem icon={ShieldCheck} title="Identity Verified" desc="Secure verification for employment eligibility." />
                    <FeatureItem icon={FileJson} title="Homeland Security" desc="Official Form I-9 Generation." />
                    <FeatureItem icon={Zap} title="Instant Processing" desc="Submits directly to HR records." />
                </div>
                <div className="w-full max-w-sm mt-4 transform hover:scale-105 transition-transform duration-500 opacity-80">
                    <img src="https://illustrations.popsy.co/amber/security.svg" alt="I-9 Illustration" className="w-full h-auto drop-shadow-2xl"/>
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDE --- */}
        <div className="w-full lg:w-7/12 p-6 lg:p-12 bg-slate-50 flex flex-col relative z-0">
            
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center mt-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4 shadow-lg text-white"><Shield size={28} /></div>
                <h1 className="text-3xl font-extrabold text-slate-900">Form I-9</h1>
                <p className="text-slate-500 mt-2 text-sm px-6">Employment Eligibility Verification.</p>
            </div>

            <div className="w-full relative max-w-3xl mx-auto">
                <div className="hidden lg:flex justify-between items-end mb-6">
                    <div><h2 className="text-3xl font-bold text-slate-900">Employment Eligibility (I-9)</h2><p className="text-slate-500 mt-1">Please complete all sections accurately.</p></div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Step {currentStepNumber}/{totalSteps}
                    </span>
                </div>
                
                {/* DYNAMIC INDICATOR */}
                <StepIndicator currentStep={currentStepNumber} totalSteps={totalSteps} />
                
                {error && <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 animate-in fade-in"><AlertCircle className="shrink-0" /> <p className="font-medium text-sm">{error}</p></div>}

                <div className="space-y-8 w-full">
                    
                    {/* --- CARD 1: EMPLOYEE INFO --- */}
                    <div className={CARD_STYLE}>
                        <div className={SECTION_HEADER_STYLE}>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Section 1: Employee Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <input className={INPUT_BASE} name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" />
                            <input className={INPUT_BASE} name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" />
                            <input className={INPUT_BASE} name="middle_initial" value={formData.middle_initial} onChange={handleChange} placeholder="M.I." maxLength="1" />
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input className={INPUT_BASE} name="other_last_names" value={formData.other_last_names} onChange={handleChange} placeholder="Other Last Names Used" />
                            <input className={INPUT_BASE} name="ssn" value={formData.ssn} onChange={handleChange} placeholder="SSN (XXX-XX-XXXX)" />
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2"><input className={INPUT_BASE} name="address" value={formData.address} onChange={handleChange} placeholder="Address" /></div>
                            <input className={INPUT_BASE} name="apt_number" value={formData.apt_number} onChange={handleChange} placeholder="Apt #" />
                            <input className={INPUT_BASE} name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                            <input className={INPUT_BASE} name="state" value={formData.state} onChange={handleChange} placeholder="State" maxLength="2" />
                            <input className={INPUT_BASE} name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zip Code" />
                            <div className="md:col-span-2"><CustomDatePicker label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} /></div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input className={INPUT_BASE} name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                            <input className={INPUT_BASE} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                        </div>
                    </div>

                    {/* --- CARD 2: CITIZENSHIP --- */}
                    <div className={CARD_STYLE}>
                        <div className={SECTION_HEADER_STYLE}>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Globe size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Citizenship Status</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                {v:'citizen', l:'1. A citizen of the United States'},
                                {v:'noncitizen_national', l:'2. A noncitizen national of the United States'},
                                {v:'lawful_permanent_resident', l:'3. A lawful permanent resident'},
                                {v:'alien_authorized', l:'4. A noncitizen authorized to work'}
                            ].map((opt) => (
                                <label key={opt.v} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${formData.citizenship_status === opt.v ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                                    <input type="radio" name="citizenship_status" value={opt.v} checked={formData.citizenship_status === opt.v} onChange={handleChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                    <span className="ml-3 font-medium text-gray-800">{opt.l}</span>
                                </label>
                            ))}
                        </div>
                        {['lawful_permanent_resident', 'alien_authorized'].includes(formData.citizenship_status) && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                {formData.citizenship_status === 'alien_authorized' && <CustomDatePicker label="Authorized Until Date" name="auth_expire_date" value={formData.auth_expire_date} onChange={handleChange} />}
                                <div className={formData.citizenship_status !== 'alien_authorized' ? "md:col-span-2" : ""}><input className={INPUT_BASE} name="uscis_a_number" value={formData.uscis_a_number} onChange={handleChange} placeholder="USCIS / A-Number" /></div>
                            </div>
                        )}
                    </div>

                    {/* --- CARD 3: DOCUMENTS --- */}
                    <div className={CARD_STYLE}>
                        <div className={SECTION_HEADER_STYLE}>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Section 2: Documents</h3>
                        </div>
                        <div className="mb-6 flex gap-4">
                            <button type="button" onClick={() => setFormData(p => ({...p, document_list_type: 'A'}))} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.document_list_type === 'A' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>List A (Identity & Auth)</button>
                            <button type="button" onClick={() => setFormData(p => ({...p, document_list_type: 'BC'}))} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.document_list_type === 'BC' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>List B + List C</button>
                        </div>
                        {formData.document_list_type === 'A' ? (
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in">
                                <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">List A Document (e.g. Passport)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2"><input className={INPUT_BASE} name="document_title" value={formData.document_title} onChange={handleChange} placeholder="Document Title" /></div>
                                    <input className={INPUT_BASE} name="issuing_authority" value={formData.issuing_authority} onChange={handleChange} placeholder="Issuing Authority" />
                                    <input className={INPUT_BASE} name="document_number" value={formData.document_number} onChange={handleChange} placeholder="Document Number" />
                                    <div className="md:col-span-2"><CustomDatePicker label="Expiration Date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} /></div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">List B (Identity)</h4>
                                    <div className="space-y-4">
                                        <input className={INPUT_BASE} name="doc_title_b" value={formData.doc_title_b} onChange={handleChange} placeholder="Title (e.g. License)" />
                                        <input className={INPUT_BASE} name="doc_authority_b" value={formData.doc_authority_b} onChange={handleChange} placeholder="Authority" />
                                        <input className={INPUT_BASE} name="doc_number_b" value={formData.doc_number_b} onChange={handleChange} placeholder="Number" />
                                        <CustomDatePicker label="Expiration" name="doc_expire_b" value={formData.doc_expire_b} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">List C (Authorization)</h4>
                                    <div className="space-y-4">
                                        <input className={INPUT_BASE} name="doc_title_c" value={formData.doc_title_c} onChange={handleChange} placeholder="Title (e.g. SS Card)" />
                                        <input className={INPUT_BASE} name="doc_authority_c" value={formData.doc_authority_c} onChange={handleChange} placeholder="Authority" />
                                        <input className={INPUT_BASE} name="doc_number_c" value={formData.doc_number_c} onChange={handleChange} placeholder="Number" />
                                        <CustomDatePicker label="Expiration" name="doc_expire_c" value={formData.doc_expire_c} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- CARD 4: SIGNATURE --- */}
                    <div className={CARD_STYLE}>
                        <div className={SECTION_HEADER_STYLE}>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PenTool size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Sign Here</h3>
                        </div>
                        <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white hover:border-blue-500 transition-all h-48 w-full relative cursor-crosshair">
                            <SignatureCanvas ref={sigCanvasRef} penColor="black" velocityFilterWeight={0.7} canvasProps={{ className: 'w-full h-full' }} onEnd={handleSignatureEnd} />
                            {!formData.signature_image && <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-gray-400 font-medium">Sign in this box</div>}
                        </div>
                        <button type="button" onClick={clearSignature} className="text-sm text-red-500 font-bold mt-3 hover:text-red-700 transition-colors flex items-center gap-1"><Eraser size={14}/> Clear Signature</button>
                    </div>

                    {/* --- ACTION BAR --- */}
                    <div className="pt-4 flex justify-end relative z-0">
                        <button type="button" onClick={handleSubmit} disabled={submitting} className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed z-10">
                            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <>Submit I-9 <Save size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default I9FormPage;