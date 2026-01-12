import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, UploadCloud, CheckCircle2, XCircle, 
  Loader2, ArrowRight, Zap, Layers, Trash2, Eye, 
  Briefcase, ShieldCheck, AlertOctagon, Plus
} from 'lucide-react';

// Import Redux actions (Ensure uploadClientDocument is exported from your slice)
// If you don't have a specific thunk for clients yet, you can reuse uploadCompanyDoc or create a new one.
// For this example, I'll assume a generic upload action or similar structure.
import { uploadCompanyDoc } from '../../store/companyIntakeSlice'; 
import { useTheme } from '../Theme/ThemeProvider';

// --- 1. PREMIUM MODAL (Clean, Small Text, Smooth Animation) ---

const PremiumModal = ({ type, message, isOpen, onClose, onAction }) => {
  if (!isOpen) return null;
  const isSuccess = type === 'success';

  const Icon = isSuccess ? ShieldCheck : AlertOctagon;
  const iconColor = isSuccess ? 'text-emerald-500' : 'text-rose-500';
  const buttonClass = isSuccess 
    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300" 
        onClick={isSuccess ? onAction : onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-300 border border-white/20 dark:border-gray-800">
        <div className="flex flex-col items-center text-center">
          
          <div className={`mb-4 p-3 rounded-full bg-slate-50 dark:bg-slate-800/50 ${iconColor} ring-1 ring-black/5 dark:ring-white/10`}>
             <Icon size={32} strokeWidth={2} />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isSuccess ? 'Upload Complete' : 'Upload Failed'}
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-4">
            {message}
          </p>

          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Continue' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AnimatedBackground = ({ isDarkMode }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none fixed z-0">
    <div className={`absolute top-[-10%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[130px] opacity-[0.15] animate-pulse ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
    <div className={`absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full blur-[120px] opacity-[0.15] animate-pulse ${isDarkMode ? 'bg-indigo-600' : 'bg-blue-300'}`}></div>
  </div>
);

// --- 2. MAIN COMPONENT ---

const ClientDocument = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();

  // Redux & Storage
  const reduxCompanyId = useSelector((state) => state.companyIntake.companyId);
  const storedCompanyId = localStorage.getItem('onboarding_company_id');
  const companyId = reduxCompanyId || storedCompanyId;
  const { companyDocs } = useSelector((state) => state.companyIntake);

  // Local State
  const [uploadingDocId, setUploadingDocId] = useState(null); 
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });

  // Client Specific Docs List
  // You can make this dynamic if needed, but here are standard ones
  const clientDocs = [
    { id: 'MSA', label: 'Master Service Agreement', desc: 'Signed MSA with the client.' },
    { id: 'SOW', label: 'Statement of Work', desc: 'Active SOW for the project.' },
    { id: 'VENDOR_AGREEMENT', label: 'Vendor Agreement', desc: 'Vendor onboarding forms.' },
  ];

  const getUploadedFile = (docType) => {
    return companyDocs.find(doc => doc.doc_type === docType);
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!companyId) {
      setModalState({ isOpen: true, type: 'error', message: 'Session expired. Please re-register.' });
      return;
    }

    setUploadingDocId(docType);

    const formData = new FormData();
    formData.append('company_id', companyId);
    formData.append('doc_type', docType);
    formData.append('attachment', file); 

    try {
      // Reusing the upload action - ensure backend accepts these DOC_TYPES
      await dispatch(uploadCompanyDoc(formData)).unwrap();
      // Success triggers re-render with checkmark automatically
    } catch (err) {
      console.error("Upload Error:", err);
      let msg = "Failed to upload document.";
      if (err.doc_type) msg = `Invalid Type: ${err.doc_type}`;
      setModalState({ isOpen: true, type: 'error', message: msg });
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleNext = () => {
    // Redirect to Digital Signature as requested
    navigate('/digital-signature');
  };

  // Styles
  const bgGradient = isDarkMode ? 'bg-gray-900' : 'bg-slate-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = isDarkMode ? 'bg-gray-800/40 border-gray-700 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md';

  return (
    <div className={`min-h-screen w-full ${bgGradient} transition-colors duration-500 font-sans selection:bg-blue-500/30 overflow-x-hidden`}>
      <AnimatedBackground isDarkMode={isDarkMode} />

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
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold uppercase tracking-wider mb-6">
                 <Layers size={16} className="mr-2"/> Step 6 of 8
               </div>
               <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textPrimary}`}>
                 Client Agreements.
               </h1>
               <p className={`text-lg ${textSecondary}`}>
                 Upload MSAs and SOWs to link specific clients to your employee onboarding workflows.
               </p>
             </div>

             <div className={`p-6 rounded-3xl border shadow-xl ${cardBg} transition-all duration-300`}>
                
                <div className="space-y-4">
                  {clientDocs.map((doc) => {
                    const uploadedFile = getUploadedFile(doc.id);
                    const isUploading = uploadingDocId === doc.id;

                    return (
                      <div key={doc.id} className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} ${uploadedFile ? 'border-emerald-500/50 bg-emerald-50/10' : 'hover:border-blue-300'}`}>
                        
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${uploadedFile ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:scale-110'}`}>
                             {isUploading ? <Loader2 className="animate-spin" size={24}/> : (uploadedFile ? <CheckCircle2 size={24}/> : <Briefcase size={24}/>)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base font-bold truncate ${textPrimary}`}>{doc.label}</h4>
                            {uploadedFile ? (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate flex items-center mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                  {uploadedFile.file_name || "Uploaded Successfully"}
                                </p>
                            ) : (
                                <p className={`text-xs truncate ${textSecondary} mt-1`}>{doc.desc}</p>
                            )}
                          </div>
                        </div>

                        <div className="ml-4">
                           {uploadedFile ? (
                             <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Eye size={20}/></button>
                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={20}/></button>
                             </div>
                           ) : (
                             <div className="relative overflow-hidden">
                               <input 
                                 type="file" 
                                 id={`file-${doc.id}`}
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
                  
                  {/* Optional: Add Custom Client Doc Button */}
                  <button className={`w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-all ${isDarkMode ? 'border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-400' : 'border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600'}`}>
                      <Plus size={18} />
                      <span className="text-sm font-bold">Add Another Document</span>
                  </button>
                </div>

                <div className="pt-8">
                   <button 
                     onClick={handleNext}
                     className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                   >
                     Next: Digital Signature <ArrowRight size={20} className="ml-2"/>
                   </button>
                </div>

             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Visuals */}
        <div className="hidden lg:block w-1/2 fixed right-0 top-0 h-full z-0 p-6 bg-transparent">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                {/* Image: Client Handshake / Agreement */}
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80" alt="Client Agreement" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-gray-900 via-gray-900/40' : 'from-blue-900 via-blue-900/40'} to-transparent opacity-90`}></div>
                
                <div className="absolute bottom-20 left-12 right-12 z-20">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                          <Briefcase size={24} className="text-blue-400" />
                       </div>
                       <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                         Client Relations
                       </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Bind your <br/> business partnerships.
                    </h2>
                    <p className="text-lg text-gray-300 max-w-md leading-relaxed">
                        Ensure every project starts on solid ground with fully compliant Master Service Agreements and SOWs.
                    </p>
                </div>
            </div>
        </div>

      </div>

      <PremiumModal 
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

export default ClientDocument;