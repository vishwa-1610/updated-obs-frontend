import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, DollarSign, Calculator, 
  PenTool, AlertCircle, Sparkles,
  ArrowRight, Check, Loader2
} from 'lucide-react';
import api from '../../../api';

// 1. IMPORT CONTEXT HOOK
import { useOnboarding } from '../../../context/OnboardingContext';

// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL; 

// --- STYLES ---
const INPUT_BASE = "w-full pl-4 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-base font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all duration-200 placeholder-gray-400 hover:border-blue-300 shadow-sm disabled:bg-gray-100 disabled:text-gray-500";
const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
const CARD_STYLE = "bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 relative transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/5";

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

const SuccessModal = ({ isOpen, onContinue, pdfUrl }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-300 relative border border-white/50">
        <div className="bg-green-50 p-8 flex flex-col items-center justify-center border-b border-green-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <Check size={40} strokeWidth={3} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Done</h3>
          <p className="text-slate-500 mt-1 text-center">Your document has been securely signed.</p>
        </div>
        <div className="p-6 space-y-4">
            <button type="button" onClick={onContinue} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <span>Continue </span>
                <ArrowRight size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", placeholder, className = "", maxLength, disabled=false }) => (
  <div className={`space-y-1 ${className}`}>
    <label className={LABEL_STYLE}>{label}</label>
    <div className="relative group">
        <input 
        type={type} name={name} value={value} onChange={onChange} 
        placeholder={placeholder} maxLength={maxLength} disabled={disabled}
        className={INPUT_BASE} 
        />
    </div>
  </div>
);

// --- MAIN PAGE ---

const FederalTaxPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 1. GET TOKEN AND STATE
  const token = searchParams.get('token');
  const urlState = searchParams.get('state') || '';

  // 2. USE CONTEXT FOR WORKFLOW
  const { goToNextStep, workflow } = useOnboarding();

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [formData, setFormData] = useState({
    // --- Personal ---
    first_name: '', last_name: '', middle_initial: '', ssn: '',
    address: '', city: '', state: urlState, zipcode: '',
    filing_status: '1', 
    
    // --- Step 2 ---
    multiple_jobs_two: false, 
    use_step2b: false, // For worksheet
    mj_higher_annual_wages: '',
    mj_lower_annual_wages: '',
    mj_pay_periods: 26,
    
    // --- Step 3 ---
    kids_under_17: 0, other_dependents: 0, other_credits: '',

    // --- Step 4 ---
    step4_other_income: '', 
    step4_deductions: '', 
    step4_extra_withholding: '', 

    // --- Deductions Worksheet ---
    use_deductions_worksheet: false,
    deductions_1a: '', deductions_1b: '', deductions_1c: '',
    deductions_3a: '', deductions_3b: '',
    deductions_5: '',
    deductions_6a: '', deductions_6b: '', deductions_6c: '', deductions_6d: '', deductions_6e: '',
    deductions_8a: '', deductions_12: '', 

    // --- Exemption ---
    federal_exempt: false,

    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // 3. DYNAMIC STEP CALCULATION
  // Assumes backend step_name is "W2" based on context mapping, or "Federal W4"
  const stepName = 'W2'; 
  const currentStepIndex = workflow.findIndex(s => s.step_name === stepName);
  const currentStepNumber = currentStepIndex !== -1 ? currentStepIndex + 1 : 3;
  const totalSteps = workflow.length > 0 ? workflow.length : 5;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = name === 'state' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : finalValue }));
  };

  // Signature handling
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) { canvas.width = rect.width; canvas.height = rect.height; }
      }
    };
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 100);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setFormData(prev => ({ ...prev, signature_image: sigCanvasRef.current.getCanvas().toDataURL('image/png') }));
    }
  };
  
  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.signature_image) { setError("Please sign the document."); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (!formData.state) { setError("Please enter your State."); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = { 
          token: token, 
          ...formData 
      };
      
      const response = await api.post('/federal-tax/', payload, { 
        responseType: 'blob', 
        validateStatus: (status) => status < 500 
      });

      if (response.headers['content-type'].includes('application/json')) {
          const text = await response.data.text();
          throw new Error(JSON.parse(text).error || "Server Validation Failed");
      }

      const file = new Blob([response.data], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(file));
      setShowSuccessModal(true);

    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (err.response && err.response.data instanceof Blob) { try { const t = await err.response.data.text(); msg = JSON.parse(t).error; } catch(e){} }
      setError(`Failed to save: ${msg}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
      // 4. DYNAMIC NAVIGATION
      // This automatically finds the next step configured in the company dashboard
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
      <SuccessModal isOpen={showSuccessModal} onContinue={handleContinue} pdfUrl={pdfUrl} />
      
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* --- LEFT PANEL (Hidden on Mobile) --- */}
        <div className="hidden lg:flex lg:w-5/12 p-16 sticky top-0 h-screen flex-col bg-slate-900 text-white relative overflow-hidden z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50"><Sparkles size={20} className="text-white" /></div>
                <span className="font-bold text-xl tracking-tight text-white">Onboarding Portal</span>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h1 className="text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Federal Tax <br/> Setup.</h1>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">Complete your W-4 form accurately to ensure correct federal tax withholding.</p>
                <div className="space-y-4 mb-8">
                    <FeatureItem icon={Loader2} title="Auto-Generated PDF" desc="We create the official IRS W-4 form for you." />
                    <FeatureItem icon={AlertCircle} title="Legally Binding" desc="Secure digital signature compliant." />
                    <FeatureItem icon={Calculator} title="Tax Calculator" desc="Built-in worksheets for accuracy." />
                </div>
                <div className="w-full max-w-sm mt-4 transform hover:scale-105 transition-transform duration-500 opacity-80"><img src="https://illustrations.popsy.co/amber/finance.svg" alt="Finance Illustration" className="w-full h-auto drop-shadow-2xl"/></div>
            </div>
        </div>

        {/* --- RIGHT SIDE: FORM --- */}
        <div className="w-full lg:w-7/12 p-4 md:p-8 lg:p-16 xl:p-24 bg-slate-50 flex flex-col relative z-0">
            
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center mt-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4 shadow-lg text-white"><DollarSign size={28} /></div>
                <h1 className="text-3xl font-extrabold text-slate-900">Federal W-4</h1>
                <p className="text-slate-500 mt-2 text-sm px-6">Employee's Withholding Certificate.</p>
            </div>

            <div className="max-w-3xl w-full mx-auto relative">
                {/* Desktop Header */}
                <div className="hidden lg:flex justify-between items-end mb-6">
                    <div><h2 className="text-3xl font-bold text-slate-900">Federal Tax (W-4)</h2><p className="text-slate-500 mt-1">Employee's Withholding Certificate.</p></div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Step {currentStepNumber}/{totalSteps}
                    </span>
                </div>
                
                {/* DYNAMIC INDICATOR */}
                <StepIndicator currentStep={currentStepNumber} totalSteps={totalSteps} />
                
                {error && <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 animate-in fade-in"><AlertCircle className="shrink-0" /> <p className="font-medium text-sm">{error}</p></div>}

                <form onSubmit={handleSubmit} className="space-y-8 relative">
                    
                    {/* --- STEP 1: PERSONAL INFO --- */}
                    <div className={CARD_STYLE}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Step 1: Personal Info</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
                            <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                            <InputField label="Middle Initial" name="middle_initial" value={formData.middle_initial} onChange={handleChange} maxLength={3} className="md:w-1/2" />
                            <InputField label="SSN" name="ssn" value={formData.ssn} onChange={handleChange} placeholder="XXX-XX-XXXX" />
                            <div className="md:col-span-2"><InputField label="Address" name="address" value={formData.address} onChange={handleChange} /></div>
                            <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="State" name="state" value={formData.state} onChange={handleChange} maxLength={2} className="uppercase" />
                                <InputField label="Zip Code" name="zipcode" value={formData.zipcode} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Step 1(c): Filing Status</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[{ id: '1', label: "Single / Sep." }, { id: '2', label: "Married Jointly" }, { id: '3', label: "Head of Household" }].map((s) => (
                                    <label key={s.id} className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.filing_status === s.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-blue-200'}`}>
                                        <input type="radio" name="filing_status" value={s.id} checked={formData.filing_status === s.id} onChange={handleChange} className="w-5 h-5 text-blue-600 mb-2" />
                                        <span className="text-sm font-bold text-center">{s.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- STEP 2: MULTIPLE JOBS --- */}
                    <div className={CARD_STYLE}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calculator size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Step 2: Multiple Jobs</h3>
                        </div>
                        <div className="space-y-4">
                            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${formData.multiple_jobs_two ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <input type="checkbox" name="multiple_jobs_two" checked={formData.multiple_jobs_two} onChange={handleChange} className="w-6 h-6 rounded text-blue-600 mt-0.5" />
                                <div><span className="font-bold text-gray-900 block text-sm">Step 2(c): Only two jobs total?</span><span className="text-xs text-gray-500">Check this if there are only two jobs total (you and spouse) with similar pay.</span></div>
                            </label>

                            {/* --- MULTIPLE JOBS WORKSHEET TOGGLE --- */}
                            {!formData.multiple_jobs_two && (
                                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 animate-in fade-in">
                                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                                        <input type="checkbox" name="use_step2b" checked={formData.use_step2b} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                                        <span className="font-bold text-blue-900 text-sm">Use Multiple Jobs Worksheet?</span>
                                    </label>
                                    {formData.use_step2b && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField label="Higher Job Wages ($)" name="mj_higher_annual_wages" value={formData.mj_higher_annual_wages} onChange={handleChange} type="number" placeholder="0.00" />
                                            <InputField label="Lower Job Wages ($)" name="mj_lower_annual_wages" value={formData.mj_lower_annual_wages} onChange={handleChange} type="number" placeholder="0.00" />
                                            <InputField label="Pay Periods (Year)" name="mj_pay_periods" value={formData.mj_pay_periods} onChange={handleChange} type="number" placeholder="52" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- STEP 3: DEPENDENTS --- */}
                    <div className={CARD_STYLE}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Step 3: Dependents</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <label className="text-sm font-bold text-gray-700">Children &lt; 17 (x $2000)</label>
                                <div className="w-24 md:w-32"><InputField name="kids_under_17" value={formData.kids_under_17} onChange={handleChange} type="number" /></div>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <label className="text-sm font-bold text-gray-700">Other Dependents (x $500)</label>
                                <div className="w-24 md:w-32"><InputField name="other_dependents" value={formData.other_dependents} onChange={handleChange} type="number" /></div>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <label className="text-sm font-bold text-gray-700">Other Credits ($)</label>
                                <div className="w-24 md:w-32"><InputField name="other_credits" value={formData.other_credits} onChange={handleChange} type="number" /></div>
                            </div>
                        </div>
                    </div>

                    {/* --- STEP 4: ADJUSTMENTS --- */}
                    <div className={CARD_STYLE}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Step 4: Other Adjustments</h3>
                        </div>
                        
                        {/* --- DEDUCTIONS WORKSHEET TOGGLE --- */}
                        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="use_deductions_worksheet" checked={formData.use_deductions_worksheet} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                                <span className="font-bold text-slate-700 text-sm">Calculate Deductions using Worksheet?</span>
                            </label>
                            
                            {formData.use_deductions_worksheet && (
                                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                                    <InputField label="1a: Tips" name="deductions_1a" value={formData.deductions_1a} onChange={handleChange} type="number" />
                                    <InputField label="6a: Medical" name="deductions_6a" value={formData.deductions_6a} onChange={handleChange} type="number" />
                                    <InputField label="6b: Taxes" name="deductions_6b" value={formData.deductions_6b} onChange={handleChange} type="number" />
                                    <InputField label="6c: Mortgage" name="deductions_6c" value={formData.deductions_6c} onChange={handleChange} type="number" />
                                    <InputField label="6d: Charity" name="deductions_6d" value={formData.deductions_6d} onChange={handleChange} type="number" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="4(a): Other Income" name="step4_other_income" value={formData.step4_other_income} onChange={handleChange} type="number" placeholder="0.00" />
                            <InputField 
                                label={formData.use_deductions_worksheet ? "4(b): Deductions (Auto)" : "4(b): Deductions"} 
                                name="step4_deductions" 
                                value={formData.use_deductions_worksheet ? "" : formData.step4_deductions} 
                                onChange={handleChange} 
                                type="number" 
                                placeholder={formData.use_deductions_worksheet ? "Calculated by System" : "0.00"}
                                disabled={formData.use_deductions_worksheet} 
                            />
                            <InputField label="4(c): Extra Withholding" name="step4_extra_withholding" value={formData.step4_extra_withholding} onChange={handleChange} type="number" placeholder="0.00" />
                        </div>
                    </div>

                    {/* --- EXEMPTION CARD --- */}
                    <div className="bg-amber-50 p-5 md:p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                        <input type="checkbox" name="federal_exempt" checked={formData.federal_exempt} onChange={handleChange} className="w-6 h-6 text-amber-600 rounded mt-1" />
                        <div>
                            <h4 className="font-bold text-amber-900 text-sm md:text-base">Claim Exemption</h4>
                            <p className="text-xs md:text-sm text-amber-800/80 mt-1">I certify that I had no federal income tax liability in the previous year and I expect to have no federal income tax liability this year.</p>
                        </div>
                    </div>

                    {/* --- SIGNATURE --- */}
                    <div className={CARD_STYLE}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PenTool size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Step 5: Sign Here</h3>
                        </div>
                        <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-xl h-40 md:h-48 relative bg-gray-50/50 cursor-crosshair hover:bg-gray-50 transition-colors">
                            <SignatureCanvas ref={sigCanvasRef} penColor="black" velocityFilterWeight={0.7} canvasProps={{ className: 'w-full h-full' }} onEnd={handleSignatureEnd} />
                            {!formData.signature_image && <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-gray-400 font-medium">Sign in this box</div>}
                        </div>
                        <button type="button" onClick={clearSignature} className="text-sm text-red-500 font-bold mt-3 hover:text-red-700 transition-colors">Clear Signature</button>
                    </div>

                    {/* --- ACTION BAR --- */}
                    <div className="pt-4 flex justify-end relative z-0">
                        <button type="submit" disabled={isSubmitting} className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed z-10">
                            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <>Save & Generate W-4 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FederalTaxPage;