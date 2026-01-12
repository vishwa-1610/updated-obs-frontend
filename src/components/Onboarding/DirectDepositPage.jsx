import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Landmark, CreditCard, DollarSign, PenTool, Eraser, 
  Save, Loader2, CheckCircle, ShieldCheck, 
  Zap, FileCheck, Sparkles, UploadCloud, Plus, Trash2, 
  AlertTriangle, User, XCircle
} from 'lucide-react';

import api from '../../api';
// --- CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// --- STYLES ---
const INPUT_BASE = "w-full pl-4 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-base font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all duration-200 placeholder-gray-400 hover:border-blue-300 shadow-sm disabled:bg-gray-50 disabled:text-gray-500";
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

// --- SUCCESS MODAL ---
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-white/50">
        <div className="h-2 bg-green-500 w-full" />
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 ring-4 ring-green-50 shadow-lg shadow-green-500/20">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Setup Complete!</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">Your direct deposit information has been securely saved.</p>
          <button type="button" className="w-full px-4 py-3.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg transition-colors" onClick={onClose}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ERROR MODAL ---
const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-red-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200 border border-white/50">
        <div className="h-2 bg-red-500 w-full" />
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6 ring-4 ring-red-50 shadow-lg shadow-red-500/20">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Submission Failed</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed px-4">{message}</p>
          <button type="button" className="w-full px-4 py-3.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg transition-colors" onClick={onClose}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

const DirectDepositPage = () => {
  const [searchParams] = useSearchParams();
  
  // 1. GET TOKEN
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const sigCanvasRef = useRef({});
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal States
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [signatureImage, setSignatureImage] = useState(null);
  const [isSigned, setIsSigned] = useState(false);

  const [bankAccounts, setBankAccounts] = useState([
    {
      account_holder_name: '',
      bank_name: '',
      account_type: 'Checking',
      routing_number: '',
      account_number: '',
      confirm_account_number: '',
      percentage: '100.00'
    }
  ]);

  const totalPercentage = bankAccounts.reduce((sum, acc) => sum + (parseFloat(acc.percentage) || 0), 0);
  const isTotalValid = Math.abs(totalPercentage - 100.00) < 0.01;

  useEffect(() => {
    // Check if token exists
    if(!token) {
        setErrorMessage("Invalid Session. Please use the link from your email.");
        setErrorModalOpen(true);
        return;
    }

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
  }, [token]);

  // Helper to show errors
  const triggerError = (msg) => {
      setErrorMessage(msg);
      setErrorModalOpen(true);
  };

  const handleAccountChange = (index, field, value) => {
    const updatedAccounts = [...bankAccounts];
    updatedAccounts[index][field] = value;
    setBankAccounts(updatedAccounts);
  };

  const addAccount = () => {
    if (totalPercentage >= 100) {
        triggerError("You have already allocated 100%. Reduce the percentage of an existing account first.");
        return;
    }
    setBankAccounts([
      ...bankAccounts,
      {
        account_holder_name: '',
        bank_name: '',
        account_type: 'Checking',
        routing_number: '',
        account_number: '',
        confirm_account_number: '',
        percentage: ''
      }
    ]);
  };

  const removeAccount = (index) => {
    if (bankAccounts.length === 1) return;
    const updatedAccounts = bankAccounts.filter((_, i) => i !== index);
    setBankAccounts(updatedAccounts);
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
       setIsSigned(true);
       setSignatureImage(sigCanvasRef.current.getCanvas().toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setIsSigned(false);
    setSignatureImage(null);
  };

  const handleSubmit = async () => {
    if (!isSigned) { triggerError("Please sign the form in the box provided."); return; }
    
    if (!isTotalValid) { 
        triggerError(`Total allocation is ${totalPercentage.toFixed(2)}%. It must be exactly 100.00%.`); 
        return; 
    }

    for (let acc of bankAccounts) {
        if (acc.account_number !== acc.confirm_account_number) {
            triggerError(`Account numbers do not match for ${acc.bank_name || 'one of your accounts'}.`);
            return;
        }
        if (!acc.bank_name || !acc.routing_number || !acc.account_number || !acc.account_holder_name) {
            triggerError("Please fill in all bank details, including the Account Holder Name.");
            return;
        }
    }

    setSubmitting(true);
    try {
      const payload = { 
          token: token, // Send Token
          bank_accounts: bankAccounts.map(acc => ({
              account_holder_name: acc.account_holder_name,
              bank_name: acc.bank_name,
              account_type: acc.account_type,
              routing_number: acc.routing_number,
              account_number: acc.account_number,
              percentage: parseFloat(acc.percentage)
          })),
          signature_image: signatureImage // Send signature if backend saves it
      };

      // ✅ NEW
await api.post('/bank-details/', payload);
      setSuccessModalOpen(true); // Open Success Modal

    } catch (err) {
      console.error("Backend Error:", err);
      let msg = "Something went wrong. Please try again.";

      // --- ROBUST ERROR PARSING LOGIC ---
      if (err.response && err.response.data) {
          const data = err.response.data;

          // Case 1: "Duplicate account numbers" (Array of Strings)
          if (data.bank_accounts && Array.isArray(data.bank_accounts)) {
              if (typeof data.bank_accounts[0] === 'string') {
                  msg = data.bank_accounts[0]; 
              } 
              else if (typeof data.bank_accounts[0] === 'object') {
                  const firstErrorObj = data.bank_accounts.find(obj => obj && Object.keys(obj).length > 0);
                  if (firstErrorObj) {
                      const firstKey = Object.keys(firstErrorObj)[0];
                      const errorVal = firstErrorObj[firstKey];
                      msg = `${firstKey.replace(/_/g, ' ')}: ${Array.isArray(errorVal) ? errorVal[0] : errorVal}`;
                  }
              }
          } 
          else if (data.message) { msg = data.message; } 
          else if (data.error) { msg = data.error; }
      }
      triggerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
      // Redirect to home or login after success
      window.location.href = '/login'; 
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
      
      <SuccessModal isOpen={successModalOpen} onClose={handleFinish} />
      <ErrorModal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} message={errorMessage} />

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
                <h1 className="text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Direct Deposit.</h1>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">Set up your payment details to get paid fast and securely.</p>
                <div className="space-y-4 mb-8">
                    <FeatureItem icon={ShieldCheck} title="Bank-Grade Security" desc="Your financial data is encrypted." />
                    <FeatureItem icon={Zap} title="Fast Payments" desc="Get paid on time, every time." />
                    <FeatureItem icon={FileCheck} title="Digital Confirmation" desc="Instant verification of details." />
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDE --- */}
        <div className="w-full lg:w-7/12 p-6 md:p-12 bg-slate-50 flex flex-col relative z-0">
            
            <div className="w-full relative max-w-3xl mx-auto">
                <div className="hidden lg:flex justify-between items-end mb-6">
                    <div><h2 className="text-3xl font-bold text-slate-900">Direct Deposit Setup</h2><p className="text-slate-500 mt-1">Configure your payment preferences.</p></div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Step 6/6</span>
                </div>
                <StepIndicator currentStep={6} totalSteps={6} />
                
                {/* --- TOTAL ALLOCATION BAR --- */}
                <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm sticky top-4 z-20">
                    <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-slate-600">Total Allocation</span>
                        <span className={`${isTotalValid ? 'text-green-600' : 'text-blue-600'}`}>{totalPercentage.toFixed(2)}% / 100%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${totalPercentage > 100 ? 'bg-red-500' : isTotalValid ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                        />
                    </div>
                    {!isTotalValid && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 font-medium">
                            <AlertTriangle size={14} />
                            <span>Allocation must equal exactly 100% before saving.</span>
                        </div>
                    )}
                </div>

                <div className="space-y-8 w-full">
                    
                    {bankAccounts.map((account, index) => (
                        <div key={index} className={CARD_STYLE}>
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{index + 1}</span>
                                    <h3 className="text-lg font-bold text-gray-900">{index === 0 ? 'Primary Account' : `Secondary Account`}</h3>
                                </div>
                                {index > 0 && (
                                    <button onClick={() => removeAccount(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="md:col-span-2">
                                    <label className={LABEL_STYLE}>Account Holder Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input 
                                            className={`${INPUT_BASE} pl-11`} 
                                            value={account.account_holder_name} 
                                            onChange={(e) => handleAccountChange(index, 'account_holder_name', e.target.value)} 
                                            placeholder="Full Name as it appears on account" 
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={LABEL_STYLE}>Bank Name</label>
                                    <input className={INPUT_BASE} value={account.bank_name} onChange={(e) => handleAccountChange(index, 'bank_name', e.target.value)} placeholder="e.g. Chase, Bank of America" />
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}>Account Type</label>
                                    <select className={INPUT_BASE} value={account.account_type} onChange={(e) => handleAccountChange(index, 'account_type', e.target.value)}>
                                        <option value="Checking">Checking Account</option>
                                        <option value="Savings">Savings Account</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}>Split Percentage (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            className={`${INPUT_BASE} pr-8`} 
                                            value={account.percentage} 
                                            onChange={(e) => handleAccountChange(index, 'percentage', e.target.value)} 
                                            placeholder="0.00" 
                                            min="0" max="100"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className={LABEL_STYLE}>Routing Number</label>
                                    <input className={INPUT_BASE} value={account.routing_number} onChange={(e) => handleAccountChange(index, 'routing_number', e.target.value)} placeholder="9 Digits" maxLength="9" />
                                </div>
                                <div></div> {/* Spacer */}
                                <div>
                                    <label className={LABEL_STYLE}>Account Number</label>
                                    <input className={INPUT_BASE} type="password" value={account.account_number} onChange={(e) => handleAccountChange(index, 'account_number', e.target.value)} placeholder="Account Number" />
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}>Confirm Number</label>
                                    <input className={INPUT_BASE} value={account.confirm_account_number} onChange={(e) => handleAccountChange(index, 'confirm_account_number', e.target.value)} placeholder="Confirm Account Number" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* --- ADD ACCOUNT BUTTON --- */}
                    <button 
                        onClick={addAccount}
                        disabled={totalPercentage >= 100}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} /> Add Another Account
                    </button>

                    {/* --- SIGNATURE --- */}
                    <div className={CARD_STYLE}>
                        <div className={SECTION_HEADER_STYLE}>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PenTool size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">Authorization</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">I authorize the company to deposit my wages/salary to the accounts specified above according to the percentages listed.</p>
                        <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white hover:border-blue-500 transition-all h-40 w-full relative cursor-crosshair">
                            <SignatureCanvas ref={sigCanvasRef} penColor="black" velocityFilterWeight={0.7} canvasProps={{ className: 'w-full h-full' }} onEnd={handleSignatureEnd} />
                            {!isSigned && <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-gray-400 font-medium">Sign in this box</div>}
                        </div>
                        <button type="button" onClick={clearSignature} className="text-sm text-red-500 font-bold mt-3 hover:text-red-700 transition-colors flex items-center gap-1"><Eraser size={14}/> Clear Signature</button>
                    </div>

                    {/* --- ACTION BAR --- */}
                    <div className="pt-4 flex justify-end relative z-0 pb-12">
                        <button type="button" onClick={handleSubmit} disabled={submitting || !isTotalValid} className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed z-10">
                            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <>Finish Setup <Save size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DirectDepositPage;