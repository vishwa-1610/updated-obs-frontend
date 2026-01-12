import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitPullRequest, CheckCircle2, XCircle, Loader2, 
  ArrowRight, Zap, Layers, GripVertical, FileText, 
  UserCircle, Building, ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react';




// Import Service directly
import { companyIntakeService } from '../../services/companyIntakeService';

// --- VISUAL COMPONENTS ---

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none fixed z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[130px] opacity-[0.15] animate-pulse bg-blue-400"></div>
    <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full blur-[120px] opacity-[0.15] animate-pulse bg-blue-300"></div>
  </div>
);

// --- MINIMAL & CRISP MODAL ---

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
            {isSuccess ? 'Workflow Configured' : 'Error'}
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
            {message}
          </p>
          <button 
            onClick={isSuccess ? onAction : onClose} 
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${buttonClass}`}
          >
            {isSuccess ? 'Go to Documents' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const WorkflowSteps = () => {
  const navigate = useNavigate();

  // Local State
  const [localSteps, setLocalSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'success', message: '' });
  const [fetchError, setFetchError] = useState(null);
  
  // Drag & Drop State
  const [dragItem, setDragItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    let mounted = true;
    const loadSteps = async () => {
        try {
            // ✅ FIX: No companyId needed. Backend uses request.tenant (from subdomain)
            const response = await companyIntakeService.getWorkflowSteps();
            if (mounted) {
                const steps = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setLocalSteps(steps);
            }
        } catch (err) {
            console.error("WorkflowSteps: API Error", err);
            if (mounted) setFetchError("Unable to load workflow steps. Ensure you are accessing via the correct Tenant URL.");
        } finally {
            if (mounted) setLoading(false);
        }
    };
    loadSteps();
    return () => { mounted = false; };
  }, []);

  // --- 2. HANDLE REORDER ---
  const handleSort = () => {
    let _steps = [...localSteps];
    const draggedItemContent = _steps.splice(dragItem, 1)[0];
    _steps.splice(dragOverItem, 0, draggedItemContent);
    setLocalSteps(_steps);
    
    setDragItem(null);
    setDragOverItem(null);

    const reorderPayload = _steps.map((step, index) => ({
      id: step.id,
      sort_order: index + 1
    }));

    companyIntakeService.reorderWorkflowSteps(reorderPayload).catch(err => {
        console.error("Reorder failed", err);
    });
  };

  // --- 3. HANDLE TOGGLE ---
  const toggleStep = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Optimistic Update
    setLocalSteps(prev => prev.map(s => s.id === id ? { ...s, is_active: newStatus } : s));
    
    try {
      await companyIntakeService.toggleWorkflowStep(id, newStatus);
    } catch (err) {
      console.error("Toggle failed", err);
      // Revert on error
      setLocalSteps(prev => prev.map(s => s.id === id ? { ...s, is_active: currentStatus } : s));
    }
  };

  // --- 4. FINISH / SKIP ---
  const handleFinish = () => {
     setModalState({ isOpen: true, type: 'success', message: 'Your onboarding workflow order has been saved.' });
  };

  const handleSkip = () => {
     navigate('/company-documents');
  };

  // Styles Helpers
  const getStepBadge = (type) => {
    if (type === 'STANDARD_FIELD') {
      return <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest ml-2">Standard</span>;
    }
    if (type === 'COMPANY_SPECIFIC') {
      return <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest ml-2">Custom</span>;
    }
    return <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest ml-2">Form</span>;
  };

  const getStepIcon = (type) => {
    if (type === 'STANDARD_FIELD') return <UserCircle size={20} className="text-blue-500" />;
    if (type === 'COMPANY_SPECIFIC') return <Building size={20} className="text-purple-500" />;
    return <FileText size={20} className="text-emerald-500" />;
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <AnimatedBackground />

      <nav className="absolute top-0 left-0 w-full z-50 p-6 lg:w-1/2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30"><Zap size={20} fill="currentColor" /></div>
            <span className="text-xl font-bold tracking-tight text-slate-900">OnboardFlow</span>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col px-6 pb-12 lg:px-20 relative z-10">
           <div className="h-28"></div> 
           <div className="max-w-xl mx-auto w-full animate-fade-in-up">
             
             <div className="mb-8">
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-6">
                 <Layers size={16} className="mr-2"/> Step 4 of 4
               </div>
               <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">Workflow Order.</h1>
               <p className="text-lg text-slate-600">Drag to reorder steps. Toggle to enable or disable specific forms.</p>
             </div>

             <div className="p-6 rounded-3xl border border-slate-200 shadow-xl bg-white transition-all duration-300">
                
                {/* Error Banner */}
                {fetchError && (
                  <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                    <AlertTriangle className="text-red-500" size={20} />
                    <p className="text-red-600 text-sm font-medium">{fetchError}</p>
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                      <p className="text-sm text-slate-500">Loading steps...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.isArray(localSteps) && localSteps.map((step, index) => (
                      <div 
                        key={step.id || index} 
                        draggable 
                        onDragStart={() => setDragItem(index)} 
                        onDragEnter={() => setDragOverItem(index)} 
                        onDragEnd={handleSort} 
                        onDragOver={(e) => e.preventDefault()}
                        className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-move bg-white border-gray-200 hover:bg-slate-50 ${!step.is_active ? 'opacity-50 grayscale' : ''} ${dragItem === index ? 'opacity-40 border-blue-500 border-dashed' : ''}`}
                      >
                        
                        <div className="flex items-center gap-4">
                          <div className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-blue-500 transition-colors"><GripVertical size={20} /></div>
                          
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100">
                             {getStepIcon(step.form_type)}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center">
                                <span className="font-bold text-sm text-slate-900">{step.step_name}</span>
                                {getStepBadge(step.form_type)}
                            </div>
                            <span className="text-[10px] text-slate-500 mt-0.5">Step Sequence: {index + 1}</span>
                          </div>
                        </div>

                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleStep(step.id, step.is_active); }} 
                            className={`transition-colors hover:scale-110 active:scale-95 ${step.is_active ? 'text-blue-600' : 'text-gray-300'}`}
                        >
                          {step.is_active ? <ToggleRight size={34} fill="currentColor" className="opacity-100" /> : <ToggleLeft size={34} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-8 flex flex-col gap-3">
                   <button 
                     onClick={handleFinish} 
                     disabled={loading || !!fetchError} 
                     className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     Save & Finish <ArrowRight size={20} className="ml-2"/>
                   </button>
                   
                   {/* ✅ SKIP BUTTON */}
                   <button 
                      type="button" 
                      onClick={handleSkip} 
                      className="w-full py-3 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
                   >
                      Skip for now, I'll manage this later
                   </button>
                </div>

             </div>
           </div>
        </div>

        {/* Right Content */}
        <div className="hidden lg:block w-1/2 fixed right-0 top-0 h-full z-0 p-6 bg-transparent">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" alt="Abstract Data Flow" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/40 to-transparent opacity-90"></div>
                <div className="absolute bottom-20 left-12 right-12 z-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"><GitPullRequest className="text-blue-400" size={24} /></div>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">Process Automation</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Orchestrate your <br/> operations.</h2>
                    <p className="text-lg text-gray-300 max-w-md leading-relaxed">Design linear or parallel workflows that ensure compliance and speed up your time-to-hire.</p>
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
            navigate('/company-documents'); 
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

export default WorkflowSteps;