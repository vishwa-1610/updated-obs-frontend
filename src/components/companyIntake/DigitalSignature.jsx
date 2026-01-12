import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { 
  PenTool, Type, Upload, CheckCircle2, XCircle, 
  Loader2, ArrowRight, Zap, Layers, Eraser, User, Briefcase
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
            {isSuccess ? 'Signature Saved' : 'Save Failed'}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>
          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Continue to Branding' : 'Try Again'}
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

const DigitalSignature = () => {
  const navigate = useNavigate();
  
  // Refs & State
  const sigPad = useRef({});
  const [activeTab, setActiveTab] = useState('draw'); 
  const [loading, setLoading] = useState(false);
  
  const [signatoryDetails, setSignatoryDetails] = useState({
    first_name: '',
    last_name: '',
    title: '',
    signature_style: 'STYLE_1'
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });

  // ✅ 1. Fetch Existing Signature Info (GET)
  useEffect(() => {
    let mounted = true;
    const fetchSig = async () => {
        try {
            const response = await companyIntakeService.getDigitalSignature();
            if (mounted && response.data) {
                setSignatoryDetails(prev => ({
                    ...prev,
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || '',
                    title: response.data.title || '',
                    signature_style: response.data.signature_style || 'STYLE_1'
                }));
                // Note: We can't pre-fill the canvas with an image URL easily, 
                // but we can show the text fields are filled.
            }
        } catch (error) {
            // Ignore if not found or unauthorized
            console.warn("Signature fetch failed or empty.", error);
        }
    };
    fetchSig();
    return () => { mounted = false; };
  }, []);

  const handleInputChange = (e) => {
    setSignatoryDetails({ ...signatoryDetails, [e.target.name]: e.target.value });
  };

  const clearSignature = () => {
    if (activeTab === 'draw' && sigPad.current) {
      sigPad.current.clear();
    } else {
      setUploadedImage(null);
    }
  };

  // Helper: Convert Base64 to Blob for File Upload
  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  // ✅ 2. Save Logic (PATCH)
  const handleFinish = async () => {
    // Basic Validation
    if (!signatoryDetails.first_name || !signatoryDetails.last_name || !signatoryDetails.title) {
        setModalState({ isOpen: true, type: 'error', message: 'Please fill in all signatory details (Name & Title).' });
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('first_name', signatoryDetails.first_name);
    formData.append('last_name', signatoryDetails.last_name);
    formData.append('title', signatoryDetails.title);
    formData.append('signature_style', signatoryDetails.signature_style);

    // Handle Signature Image
    if (activeTab === 'draw' && sigPad.current && !sigPad.current.isEmpty()) {
        const blob = dataURLtoBlob(sigPad.current.toDataURL('image/png'));
        formData.append('generated_signature_image', blob, 'signature.png');
    } else if (activeTab === 'upload' && uploadedImage) {
        // Assuming uploadedImage is a file object or dataURL. 
        // If it's a dataURL from FileReader:
        const blob = dataURLtoBlob(uploadedImage);
        formData.append('generated_signature_image', blob, 'upload_sig.png');
    }
    // If 'Type' tab, usually we just save the text name, backend generates image or we ignore image.
    // For now, we only send image if Draw/Upload used.

    try {
      await companyIntakeService.saveDigitalSignature(formData); // Note: Service needs to handle FormData if image sent
      setModalState({ isOpen: true, type: 'success', message: 'Authorized signatory saved successfully.' });
    } catch (err) {
      console.error("Signature Save Error:", err);
      setModalState({ isOpen: true, type: 'error', message: 'Failed to save signature.' });
    } finally {
        setLoading(false);
    }
  };

  const handleSkip = () => {
      navigate('/branding');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Styles
  const bgGradient = 'bg-white';
  const textPrimary = 'text-slate-900';
  const textSecondary = 'text-slate-600';
  const cardBg = 'bg-white border-slate-200';
  const inputStyle = `w-full p-3 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white`;
  const tabActive = 'bg-blue-600 text-white shadow-lg shadow-blue-500/30';
  const tabInactive = 'bg-gray-100 text-gray-500 hover:bg-gray-200';

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
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-1/2 flex flex-col px-6 pb-12 lg:px-20 relative z-10">
           <div className="h-28"></div> 

           <div className="max-w-xl mx-auto w-full animate-fade-in-up">
             
             <div className="mb-8">
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-6">
                 <Layers size={16} className="mr-2"/> Step 7 of 8
               </div>
               <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textPrimary}`}>
                 Digital Signature.
               </h1>
               <p className={`text-lg ${textSecondary}`}>
                 Enter details of the authorized signatory for contracts.
               </p>
             </div>

             <div className={`p-8 rounded-3xl border shadow-xl ${cardBg} transition-all duration-300 space-y-6`}>
                
                {/* Signatory Details Form */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={`text-xs font-bold uppercase tracking-wider ml-1 text-gray-600`}>First Name <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                <input name="first_name" value={signatoryDetails.first_name} onChange={handleInputChange} placeholder="John" className={`pl-10 ${inputStyle}`} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={`text-xs font-bold uppercase tracking-wider ml-1 text-gray-600`}>Last Name <span className="text-red-500">*</span></label>
                            <input name="last_name" value={signatoryDetails.last_name} onChange={handleInputChange} placeholder="Doe" className={`${inputStyle}`} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-wider ml-1 text-gray-600`}>Job Title <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Briefcase size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input name="title" value={signatoryDetails.title} onChange={handleInputChange} placeholder="Director of HR" className={`pl-10 ${inputStyle}`} />
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-gray-200"></div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 rounded-2xl bg-gray-100">
                  {[
                    { id: 'draw', label: 'Draw', icon: PenTool },
                    { id: 'type', label: 'Type', icon: Type },
                    { id: 'upload', label: 'Upload', icon: Upload }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === tab.id ? tabActive : tabInactive}`}>
                      <tab.icon size={16} /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Signature Pad */}
                <div className="relative h-48 rounded-2xl border-2 border-dashed border-gray-300 transition-all overflow-hidden flex items-center justify-center bg-white">
                  {activeTab === 'draw' && <SignatureCanvas ref={sigPad} penColor="black" canvasProps={{ className: 'w-full h-full' }} />}
                  
                  {activeTab === 'type' && (
                    <div className={`text-4xl font-cursive text-center ${textPrimary}`} style={{ fontFamily: '"Dancing Script", cursive' }}>
                        {signatoryDetails.first_name} {signatoryDetails.last_name}
                    </div>
                  )}

                  {activeTab === 'upload' && (
                    <div className="text-center w-full h-full relative">
                      {uploadedImage ? <img src={uploadedImage} alt="Sig" className="w-full h-full object-contain p-4" /> : 
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><Upload className="text-gray-400 mb-2" size={32} /><p className="text-sm text-gray-500">Click to browse</p></div>}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  )}

                  <button onClick={clearSignature} className="absolute top-3 right-3 p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 z-10"><Eraser size={18} /></button>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                   <button 
                     onClick={handleFinish} 
                     disabled={loading} 
                     className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70"
                   >
                     {loading ? <Loader2 className="animate-spin mr-2"/> : <>Save & Continue <ArrowRight size={20} className="ml-2"/></>}
                   </button>
                   
                   {/* SKIP BUTTON */}
                   <button 
                      type="button" 
                      onClick={handleSkip} 
                      className="w-full py-3 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                   >
                      Skip for now, I'll sign later
                   </button>
                </div>

             </div>
           </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="hidden lg:block w-1/2 fixed right-0 top-0 h-full z-0 p-6 bg-transparent">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" alt="Signing" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent opacity-90"></div>
                <div className="absolute bottom-20 left-12 right-12 z-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"><PenTool size={24} className="text-blue-400" /></div>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">e-Sign Ready</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Authorize with <br/> confidence.</h2>
                    <p className="text-lg text-gray-300 max-w-md leading-relaxed">Your digital signature is encrypted and stored securely.</p>
                </div>
            </div>
        </div>
      </div>

      <NotificationModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        message={modalState.message}
        onClose={() => setModalState({...modalState, isOpen: false})}
        onAction={() => {
            setModalState({ ...modalState, isOpen: false });
            navigate('/branding'); 
        }}
      />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'); 
        @keyframes fade-in-up { 
          0% { opacity: 0; transform: translateY(20px); } 
          100% { opacity: 1; transform: translateY(0); } 
        } 
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DigitalSignature;