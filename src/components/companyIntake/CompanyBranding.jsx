import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, UploadCloud, CheckCircle2, XCircle, 
  Loader2, ArrowRight, Zap, Layers, FileType, 
  ToggleLeft, ToggleRight
} from 'lucide-react';

// Import Service directly
import { companyIntakeService } from '../../services/companyIntakeService';
import api from '../../api'; // Need direct api for GET if service doesn't have it explicitly

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
            {isSuccess ? 'Branding Saved' : 'Save Failed'}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>
          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Continue to Hosting' : 'Try Again'}
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

const CompanyBranding = () => {
  const navigate = useNavigate();

  // Local State
  const [loading, setLoading] = useState(false);
  const [useLetterhead, setUseLetterhead] = useState(false);
  const [templateFile, setTemplateFile] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });

  // ✅ 1. Fetch Existing Branding (GET)
  useEffect(() => {
    let mounted = true;
    const fetchBranding = async () => {
        try {
            // Using raw api call if service doesn't have explicit GET for branding
            // or assume companyIntakeService.getBranding exists if added previously
            const response = await api.get('branding/'); 
            if (mounted && response.data) {
                setUseLetterhead(response.data.use_letterhead || false);
                // We cannot set file input value programmatically, but we can show status if needed
            }
        } catch (err) {
             console.warn("Branding fetch skipped (likely public mode)", err);
        }
    };
    fetchBranding();
    return () => { mounted = false; };
  }, []);

  // Handle File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTemplateFile(file);
    }
  };

  // ✅ 2. Handle Skip
  const handleSkip = () => {
      navigate('/hosting');
  };

  // ✅ 3. Handle Submit (PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (useLetterhead && !templateFile) {
        // If enabling letterhead but no file selected, check if one exists on backend? 
        // For simplicity, we might ask for upload if strictly new.
        // Assuming validation handles it.
    }

    const formData = new FormData();
    formData.append('use_letterhead', useLetterhead ? 'true' : 'false');
    
    if (templateFile) {
      formData.append('letterhead_template', templateFile);
    }

    try {
      await companyIntakeService.saveBranding(formData);
      setModalState({ isOpen: true, type: 'success', message: 'Company branding configuration saved.' });
    } catch (err) {
      console.error("Save Error:", err);
      let msg = "Failed to save settings.";
      if (err.response?.data?.detail) msg = err.response.data.detail;
      if (err.response?.data?.letterhead_template) msg = err.response.data.letterhead_template[0];
      setModalState({ isOpen: true, type: 'error', message: msg });
    } finally {
        setLoading(false);
    }
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
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:w-1/2 flex flex-col px-6 pb-12 lg:px-20 relative z-10">
           <div className="h-28"></div> 

           <div className="max-w-xl mx-auto w-full animate-fade-in-up">
             
             <div className="mb-8">
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-6">
                 <Layers size={16} className="mr-2"/> Step 8 of 8
               </div>
               <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textPrimary}`}>
                 Company Branding.
               </h1>
               <p className={`text-lg ${textSecondary}`}>
                 Configure letterhead settings for your automated offer letters and contracts.
               </p>
             </div>

             <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl ${cardBg} transition-all duration-300 space-y-8`}>
                
                {/* 1. Toggle: Use Letterhead? */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                    <div>
                        <h3 className={`font-bold text-lg ${textPrimary}`}>Use Custom Letterhead</h3>
                        <p className={`text-sm ${textSecondary}`}>Apply a header/footer to generated docs.</p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setUseLetterhead(!useLetterhead)}
                        className={`transition-colors ${useLetterhead ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                        {useLetterhead ? <ToggleRight size={48} fill="currentColor" /> : <ToggleLeft size={48} />}
                    </button>
                </div>

                {/* 2. File Upload (Conditional) */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${useLetterhead ? 'max-h-64 opacity-100' : 'max-h-0 opacity-50'}`}>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-3 text-gray-600`}>
                      Upload Word Template (.docx) <span className="text-red-500">*</span>
                  </label>
                  
                  <div className={`relative group w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${templateFile ? 'border-blue-500 bg-blue-50/10' : 'border-gray-300 hover:border-blue-400'}`}>
                    
                    {templateFile ? (
                      <div className="flex flex-col items-center">
                         <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mb-2">
                            <FileText size={24} />
                         </div>
                         <p className={`text-sm font-bold ${textPrimary}`}>{templateFile.name}</p>
                         <p className="text-xs text-blue-500">Click to change</p>
                      </div>
                    ) : (
                      <>
                        <div className={`p-3 rounded-full mb-2 bg-gray-100 text-gray-500`}>
                          <UploadCloud size={24} />
                        </div>
                        <p className={`text-sm font-medium ${textSecondary}`}>Click to upload .doc / .docx</p>
                      </>
                    )}
                    
                    <input 
                      type="file" 
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70"
                   >
                     {loading ? <Loader2 className="animate-spin mr-2"/> : <>Save & Proceed to Hosting <ArrowRight size={20} className="ml-2"/></>}
                   </button>

                   {/* SKIP BUTTON */}
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

        {/* RIGHT COLUMN: Visuals */}
        <div className="hidden lg:flex w-1/2 fixed right-0 top-0 h-full z-0 p-12 bg-transparent items-center justify-center">
            <div className="relative w-full max-w-md h-[600px] rounded-[2.5rem] bg-gray-100 shadow-2xl border-8 border-white overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 flex flex-col items-center justify-center">
                
                {/* Visual Representation of Document */}
                <div className="w-[80%] h-[85%] bg-white shadow-xl rounded-lg p-8 flex flex-col relative overflow-hidden">
                    
                    {/* Mock Header / Letterhead */}
                    {useLetterhead ? (
                        <div className="absolute top-0 left-0 w-full h-24 bg-blue-50 border-b border-blue-100 flex items-center justify-center animate-in slide-in-from-top duration-500">
                            {templateFile ? (
                                <div className="text-center">
                                    <FileType size={32} className="text-blue-500 mx-auto mb-1"/>
                                    <span className="text-[10px] text-blue-600 font-bold uppercase">{templateFile.name}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-blue-300 font-bold uppercase tracking-widest">Header Space</span>
                            )}
                        </div>
                    ) : null}

                    {/* Mock Body Text */}
                    <div className={`space-y-3 mt-${useLetterhead ? '20' : '4'}`}>
                        <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                        <br/>
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                    </div>

                    {/* Mock Signature Line */}
                    <div className="mt-auto">
                        <div className="h-px w-1/3 bg-gray-300 mb-2"></div>
                        <div className="h-2 w-1/4 bg-gray-100 rounded"></div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`absolute bottom-8 px-4 py-2 rounded-full backdrop-blur-md border ${useLetterhead ? 'bg-blue-500/20 border-blue-500/30 text-blue-600' : 'bg-gray-500/20 border-gray-500/30 text-gray-500'}`}>
                    <span className="text-xs font-bold uppercase tracking-wide">
                        {useLetterhead ? 'Custom Letterhead Active' : 'Default Styling'}
                    </span>
                </div>

            </div>
            
            {/* Background Glow */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-[80px]"></div>
        </div>

      </div>

      <NotificationModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState({...modalState, isOpen: false})}
        onAction={() => {
            setModalState({ ...modalState, isOpen: false });
            navigate('/hosting'); // Next Step
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

export default CompanyBranding;