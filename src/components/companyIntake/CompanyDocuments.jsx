import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, UploadCloud, CheckCircle2, XCircle, 
  Loader2, ArrowRight, Zap, Layers, Trash2, Eye, File 
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
            {isSuccess ? 'Upload Complete' : 'Upload Failed'}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>
          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Continue' : 'Try Again'}
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

const CompanyDocuments = () => {
  const navigate = useNavigate();

  // Local State for Docs
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loading, setLoading] = useState(false); // Default false to prevent immediate spinner if no token
  const [uploadingDocType, setUploadingDocType] = useState(null); 
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });

  const requiredDocs = [
    { id: 'INSURANCE', label: 'Insurance Details', desc: 'Policy documents or summary.' },
    { id: 'HANDBOOK', label: 'Employee Handbook', desc: 'PDF handbook for new hires.' },
    { id: 'OFFER_LETTER', label: 'Offer Letter Template', desc: 'Standard DOCX/PDF template.' },
    { id: 'AGREEMENT', label: 'Employment Agreement', desc: 'Legal contract template.' },
    { id: 'TE_POLICY', label: 'T & E Policy', desc: 'Travel and Expense policy.' },
  ];

  // ✅ 1. Fetch Existing Docs (Safely)
  useEffect(() => {
    // Check for token first. If missing, DO NOT FETCH (prevents redirect loop).
    const token = localStorage.getItem('access');
    if (!token) return; 

    let mounted = true;
    setLoading(true);

    const fetchDocs = async () => {
        try {
            const response = await companyIntakeService.getCompanyDocuments();
            if (mounted) {
                const docs = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setUploadedDocs(docs);
            }
        } catch (err) {
            console.warn("Skipping doc fetch (Auth required)", err);
        } finally {
            if(mounted) setLoading(false);
        }
    };
    fetchDocs();
    return () => { mounted = false; };
  }, []);

  const getUploadedFile = (docType) => {
    return uploadedDocs.find(doc => doc.doc_type === docType);
  };

  // ✅ 2. Upload Logic (Safely)
  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check Token again before uploading
    const token = localStorage.getItem('access');
    if (!token) {
        setModalState({ isOpen: true, type: 'error', message: 'You must be logged in to upload documents. Please skip this step for now.' });
        return;
    }

    setUploadingDocType(docType);

    const formData = new FormData();
    formData.append('doc_type', docType); 
    formData.append('attachment', file);  

    try {
      await companyIntakeService.uploadCompanyDocument(formData);
      
      // Refresh list
      try {
        const res = await companyIntakeService.getCompanyDocuments();
        setUploadedDocs(Array.isArray(res.data) ? res.data : (res.data.results || []));
      } catch (refreshErr) { console.warn("Refresh failed", refreshErr); }
      
    } catch (err) {
      console.error("Upload Error:", err);
      let msg = "Failed to upload document.";
      if (err.response?.data?.attachment) msg = err.response.data.attachment[0];
      
      setModalState({ isOpen: true, type: 'error', message: msg });
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleNext = () => {
    navigate('/digital-signature'); 
  };

  const handleSkip = () => {
      navigate('/digital-signature');
  };

  // Styles - Pure White Background
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
        
        {/* LEFT COLUMN: Upload List */}
        <div className="w-full lg:w-1/2 flex flex-col px-6 pb-12 lg:px-20 relative z-10">
           <div className="h-28"></div> 

           <div className="max-w-xl mx-auto w-full animate-fade-in-up">
             
             <div className="mb-8">
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-6">
                 <Layers size={16} className="mr-2"/> Step 5 of 8
               </div>
               <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textPrimary}`}>
                 Company Docs.
               </h1>
               <p className={`text-lg ${textSecondary}`}>
                 Upload the standard documents required for your onboarding workflow.
               </p>
             </div>

             <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} transition-all duration-300`}>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p className="text-sm text-slate-500">Loading documents...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {requiredDocs.map((doc) => {
                        const uploadedFile = getUploadedFile(doc.id);
                        const isUploading = uploadingDocType === doc.id;

                        return (
                        <div key={doc.id} className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 bg-white border-gray-200 ${uploadedFile ? 'border-emerald-500/50 bg-emerald-50/10' : 'hover:border-blue-300'}`}>
                            
                            <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${uploadedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600 group-hover:scale-110'}`}>
                                {isUploading ? <Loader2 className="animate-spin" size={24}/> : (uploadedFile ? <CheckCircle2 size={24}/> : <FileText size={24}/>)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-bold truncate ${textPrimary}`}>{doc.label}</h4>
                                {uploadedFile ? (
                                    <p className="text-xs text-emerald-600 font-medium truncate flex items-center mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                    File Uploaded
                                    </p>
                                ) : (
                                    <p className={`text-xs truncate ${textSecondary} mt-1`}>{doc.desc}</p>
                                )}
                            </div>
                            </div>

                            <div className="ml-4">
                                {uploadedFile ? (
                                    <div className="flex items-center gap-2">
                                        <a 
                                            href={uploadedFile.attachment} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-transparent hover:bg-blue-50 rounded-lg"
                                        >
                                            <Eye size={20}/>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="relative overflow-hidden">
                                    <input 
                                        type="file" 
                                        id={`file-${doc.id}`}
                                        accept=".doc,.docx"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => handleFileUpload(e, doc.id)}
                                        disabled={isUploading}
                                    />
                                    <label htmlFor={`file-${doc.id}`} className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">
                                        <UploadCloud size={18}/> Upload
                                    </label>
                                    </div>
                                )}
                            </div>

                        </div>
                        );
                    })}
                    </div>
                )}

                <div className="pt-8 flex flex-col gap-3">
                   <button 
                     onClick={handleNext}
                     className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                   >
                     Next: Signature <ArrowRight size={20} className="ml-2"/>
                   </button>
                   
                   {/* SKIP BUTTON */}
                   <button 
                      type="button" 
                      onClick={handleSkip} 
                      className="w-full py-3 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                   >
                      Skip for now, I'll upload later
                   </button>
                </div>

             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Visuals */}
        <div className="hidden lg:block w-1/2 fixed right-0 top-0 h-full z-0 p-6 bg-transparent">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img src="https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" alt="Document Organization" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent opacity-90"></div>
                
                <div className="absolute bottom-20 left-12 right-12 z-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                           <File size={24} className="text-blue-400" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                          Digital Compliance
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Centralize your <br/> critical records.
                    </h2>
                    <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                        Securely upload and manage your organization's policy documents, templates, and legal agreements in one place.
                    </p>
                </div>
            </div>
        </div>

      </div>

      <NotificationModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState({...modalState, isOpen: false})}
        onAction={() => setModalState({ ...modalState, isOpen: false })}
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

export default CompanyDocuments;