import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Users, Briefcase, GitMerge, FileText, PenTool, 
  Palette, CreditCard, Plus, Edit2, X, ToggleLeft, ToggleRight,
  GripVertical, Download, ShieldCheck, Mail, ChevronDown, Menu, Check,Loader2,ChevronRight ,
  ChevronLeft, ChevronRight as ChevronRightIcon, UploadCloud, CheckCircle
} from 'lucide-react';
import { companyIntakeService } from '../../services/companyIntakeService';
import { useTheme } from '../Theme/ThemeProvider';
import SuccessModal from '../common/Modal/SuccessModal';
import api from '../../api'; // ✅ Using direct API to fix service mismatch

// ==========================================
// 1. UI COMPONENTS (Stunning UI)
// ==========================================

const StunningSelect = ({ label, value, onChange, options, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || "Select an option";

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>
      <div onClick={() => setIsOpen(!isOpen)} className={`w-full px-4 py-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-200 ${isDarkMode ? `bg-slate-900/50 ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-700 hover:border-slate-600'} text-white` : `bg-white ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-200 hover:border-slate-300'} text-slate-900`}`}>
        <span className="font-medium">{selectedLabel}</span>
        <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
      </div>
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 rounded-xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          {options.map((opt) => (
            <div key={opt.value} onClick={() => { onChange({ target: { value: opt.value } }); setIsOpen(false); }} className={`px-4 py-3 cursor-pointer flex items-center justify-between text-sm font-medium transition-colors ${value === opt.value ? (isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600') : (isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50')}`}>
              {opt.label}
              {value === opt.value && <Check size={16} className="text-blue-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ id, label, icon: Icon, active, collapsed, onClick }) => (
  <button onClick={() => onClick(id)} title={collapsed ? label : ''} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm group relative overflow-hidden ${collapsed ? 'w-full justify-center' : 'w-full'} ${active ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
    <Icon size={20} className={`transition-colors shrink-0 ${active ? 'text-white' : 'group-hover:text-white'}`} />
    {!collapsed && <span className="relative z-10 whitespace-nowrap animate-in fade-in duration-300">{label}</span>}
    {!collapsed && active && <ChevronRight size={16} className="ml-auto text-white animate-in slide-in-from-left-2" />}
  </button>
);

const GradientCard = ({ children, className = '', isDarkMode }) => (<div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'} shadow-lg shadow-black/5 transition-all duration-300 ${className}`}><div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? 'from-blue-500/5 to-purple-500/5' : 'from-blue-50/50 to-purple-50/50'}`}></div><div className="relative z-10">{children}</div></div>);
const TableContainer = ({ title, description, onAdd, actionLabel, children, isDarkMode }) => (<GradientCard isDarkMode={isDarkMode} className="h-full flex flex-col"><div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><div><h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h2><p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p></div>{onAdd && (<button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 hover:-translate-y-0.5">{actionLabel === 'Edit' ? <Edit2 size={16}/> : <Plus size={16}/>}{actionLabel || 'Add New'}</button>)}</div><div className="overflow-x-auto w-full flex-1">{children}</div></GradientCard>);
const DetailRow = ({ label, value, isDarkMode }) => (<div className="flex justify-between items-center py-3 border-b border-dashed border-slate-100 dark:border-slate-700/50 last:border-0"><span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span><span className={`font-medium text-sm truncate max-w-[200px] ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{value || '--'}</span></div>);
const CustomInput = ({ label, name, value, onChange, type = "text", placeholder, isDarkMode }) => (<div className="space-y-1.5"><label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label><div className="relative group"><input type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-medium ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-400'}`}/></div></div>);

// ==========================================
// 2. MAIN DASHBOARD
// ==========================================

const CompanyDashboard = () => {
  const { isDarkMode } = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data State
  const [data, setData] = useState({});
  const [listData, setListData] = useState([]);
  const [users, setUsers] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({ name: 'Loading...', companyName: '' });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [modalData, setModalData] = useState({});
  
  // Refs
  const signaturePad = useRef(null);
  const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });
  const [showSecret, setShowSecret] = useState(false);
  
  // Drag & Drop
  const [dragItem, setDragItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        try {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            const subdomain = parts[0];
            let cleanName = subdomain.split('-')[0]; 
            if(cleanName) cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            else cleanName = "Company";
            
            const res = await companyIntakeService.getCompanyContacts();
            setCompanyInfo({ name: cleanName, companyName: res.data.company_name || 'My Company' });
        } catch (e) {
            setCompanyInfo({ name: 'Portal', companyName: 'Company Portal' });
        }
    };
    init();
  }, []);

  // --- DATA LOADING ---
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setFetching(true);
      try {
        if(activeTab === 'users') setUsers([]);
        if(['workflow', 'documents', 'signature'].includes(activeTab)) setListData([]);

        if (activeTab === 'users') {
            const res = await api.get('users/');
            if (mounted) setUsers(Array.isArray(res.data) ? res.data : (res.data.results || []));
        } else if (activeTab === 'workflow') {
            const res = await companyIntakeService.getWorkflowSteps();
            if (mounted) setListData(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'contacts') {
            const res = await companyIntakeService.getCompanyContacts();
            if (mounted) setData(res.data || {});
        } else if (activeTab === 'type') {
            const res = await companyIntakeService.getCompanyType();
            if (mounted) setData(res.data || { industry_type: 'STAFFING' });
        } else if (activeTab === 'documents') {
            const res = await companyIntakeService.getCompanyDocuments();
            if (mounted) setListData(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'signature') {
            const res = await api.get('digital-signatures/'); // ✅ Fixed Endpoint
            if (mounted) setListData(Array.isArray(res.data) ? res.data : (res.data.results || []));
        } else if (activeTab === 'payment') {
            setData({}); 
        }
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        if (mounted) setFetching(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [activeTab]);

  // --- SAVE ACTIONS ---
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (modalType === 'user') {
            let payload = { ...modalData };
            if (modalData.id && !modalData.password) delete payload.password;
            if (payload.role === 'Admin') payload.is_staff = true;
            if (modalData.id) await api.patch(`users/${modalData.id}/`, payload);
            else await api.post('users/signup/', payload);
            const res = await api.get('users/');
            setUsers(Array.isArray(res.data) ? res.data : (res.data.results || []));
        } 
        else if (activeTab === 'contacts') await companyIntakeService.updateCompanyContacts(data);
        else if (activeTab === 'type') await companyIntakeService.setCompanyType(data);
        else if (activeTab === 'payment') await companyIntakeService.savePayment(data);
        else if (activeTab === 'signature') {
            // ✅ FIX: Use API Directly + FormData
            const formData = new FormData();
            formData.append('first_name', modalData.first_name || '');
            formData.append('last_name', modalData.last_name || '');
            formData.append('title', modalData.title || '');
            formData.append('signature_style', modalData.signature_style || 'STYLE_1');

            if (signaturePad.current && !signaturePad.current.isEmpty()) {
                const base64String = signaturePad.current.getTrimmedCanvas().toDataURL('image/png');
                formData.append('signature_image_base64', base64String);
            } else if (modalData.uploadedFile) {
                formData.append('generated_signature_image', modalData.uploadedFile);
            }

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            
            // Call API directly to avoid Service Mismatch
            if (modalData.id) {
                await api.patch(`digital-signatures/${modalData.id}/`, formData, config);
            } else {
                await api.post('digital-signatures/', formData, config);
            }

            const res = await api.get('digital-signatures/');
            setListData(Array.isArray(res.data) ? res.data : res.data.results);
        }

        setShowModal(false);
        setNotification({ show: true, type: 'success', message: 'Saved successfully!' });
    } catch (error) {
        console.error("Save Error:", error);
        setNotification({ show: true, type: 'error', message: error.response?.data?.detail || 'Operation failed.' });
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    try {
        if (activeTab === 'branding') {
            fd.append('letterhead_template', file);
            fd.append('use_letterhead', true);
            await companyIntakeService.saveBranding(fd);
        } else {
            fd.append('attachment', file);
            fd.append('doc_type', type || modalData.doc_type);
            await companyIntakeService.uploadCompanyDocument(fd);
            const res = await companyIntakeService.getCompanyDocuments();
            setListData(res.data);
        }
        setShowModal(false);
        setNotification({ show: true, type: 'success', message: 'Upload success!' });
    } catch(e) {
        setNotification({ show: true, type: 'error', message: 'Upload Failed.' });
    } finally {
        setLoading(false);
    }
  };

  const handleSort = () => {
    let _list = [...listData];
    const item = _list.splice(dragItem, 1)[0];
    _list.splice(dragOverItem, 0, item);
    _list = _list.map((step, idx) => ({ ...step, sort_order: idx + 1 }));
    setDragItem(null); setDragOverItem(null); setListData(_list);
    const payload = _list.map((step) => ({ id: step.id, sort_order: step.sort_order }));
    companyIntakeService.reorderWorkflowSteps(payload).catch(() => setNotification({ show: true, type: 'error', message: 'Reorder failed.' }));
  };

  const handleWorkflowToggle = async (id, status) => {
      const original = [...listData];
      setListData(prev => prev.map(s => s.id === id ? { ...s, is_active: !status } : s));
      try { await companyIntakeService.toggleWorkflowStep(id, !status); } 
      catch(e) { setListData(original); }
  };

  // --- RENDERERS ---
  const renderUsers = () => (
    <div className="animate-in fade-in h-full">
        <TableContainer title="User Management" description="Manage access." onAdd={() => { setModalType('user'); setModalData({ role: 'staff' }); setShowModal(true); }} actionLabel="Add User" isDarkMode={isDarkMode}>
            <table className="w-full text-left border-collapse">
                <thead className={`text-xs uppercase font-bold tracking-wider border-b ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}><tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {users.map(u => (
                        <tr key={u.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                            <td className="p-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">{u.first_name?.[0] || 'U'}{u.last_name?.[0] || 'N'}</div><div><p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.first_name} {u.last_name}</p></div></div></td>
                            <td className="p-4 text-sm text-slate-500">{u.email}</td>
                            <td className="p-4"><span className={`text-xs font-black uppercase tracking-wider ${u.is_staff ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{u.is_staff ? 'Admin' : 'Staff'}</span></td>
                            <td className="p-4 text-right"><button onClick={() => { setModalType('user'); setModalData({...u, password: ''}); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg"><Edit2 size={16}/></button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TableContainer>
    </div>
  );

  const renderContacts = () => (
    <div className="animate-in fade-in h-full">
        <TableContainer title="Company Contacts" description="Primary contacts." onAdd={() => { setModalType('contacts'); setShowModal(true); }} actionLabel="Edit" isDarkMode={isDarkMode}>
            <div className="p-6 grid md:grid-cols-2 gap-8">
                <GradientCard isDarkMode={isDarkMode} className="p-6"><div className="flex items-center gap-3 mb-4 text-blue-600 font-bold"><Users size={20}/> Admin</div><DetailRow label="Name" value={`${data.admin_first_name} ${data.admin_last_name}`} isDarkMode={isDarkMode}/><DetailRow label="Email" value={data.admin_main_email} isDarkMode={isDarkMode}/><DetailRow label="Phone" value={data.admin_mobile} isDarkMode={isDarkMode}/></GradientCard>
                <GradientCard isDarkMode={isDarkMode} className="p-6"><div className="flex items-center gap-3 mb-4 text-emerald-600 font-bold"><CreditCard size={20}/> Billing</div><DetailRow label="Name" value={`${data.billing_first_name} ${data.billing_last_name}`} isDarkMode={isDarkMode}/><DetailRow label="Email" value={data.billing_main_email} isDarkMode={isDarkMode}/><DetailRow label="Phone" value={data.billing_mobile} isDarkMode={isDarkMode}/></GradientCard>
            </div>
        </TableContainer>
    </div>
  );

  const renderType = () => (
      <div className="animate-in fade-in h-full">
          <TableContainer title="Industry Model" description="Operational structure." onAdd={() => { setModalType('type'); setShowModal(true); }} actionLabel="Change" isDarkMode={isDarkMode}>
              <div className="p-10 flex flex-col items-center text-center"><div className="p-5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 mb-6"><Briefcase size={40}/></div><h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{data.industry_type === 'OWN' ? 'Direct Employer' : 'Staffing Agency'}</h3><span className="mt-6 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">Active Mode</span></div>
          </TableContainer>
      </div>
  );

  const renderWorkflow = () => (
    <div className="animate-in fade-in h-full">
        <TableContainer title="Workflow Steps" description="Drag to reorder." isDarkMode={isDarkMode}>
            <table className="w-full text-left border-collapse">
                <thead className={`text-[11px] uppercase font-extrabold tracking-widest border-b ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}><tr><th className="p-5 w-16 text-center">S#</th><th className="p-5">Title</th><th className="p-5">Form Type</th><th className="p-5 text-center w-24">Order</th><th className="p-5 text-center w-24">ReOrder</th><th className="p-5 text-center w-24">Active</th></tr></thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {listData.map((step, idx) => (
                        <tr key={step.id} draggable onDragStart={() => setDragItem(idx)} onDragEnter={() => setDragOverItem(idx)} onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()} className={`transition-all ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} ${!step.is_active ? 'opacity-50 grayscale' : ''} ${dragItem === idx ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <td className="p-5 text-center font-mono text-sm text-slate-500">{idx + 1}</td>
                            <td className="p-5"><div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{step.step_name}</div></td>
                            <td className="p-5"><span className={`text-[11px] font-black uppercase tracking-wider ${step.form_type === 'STANDARD_FIELD' ? 'text-blue-600 dark:text-blue-400' : step.form_type === 'STANDARD_FORM' ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>{(step.form_type || '').replace('_', ' ')}</span></td>
                            <td className="p-5 text-center"><span className={`text-base font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{step.sort_order}</span></td>
                            <td className="p-5 text-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-500"><div className="flex justify-center"><GripVertical size={20}/></div></td>
                            <td className="p-5 text-center"><button onClick={() => handleWorkflowToggle(step.id, step.is_active)} className={`transition-transform active:scale-95 ${step.is_active ? 'text-blue-600' : 'text-slate-300 dark:text-slate-600'}`}>{step.is_active ? <ToggleRight size={36} fill="currentColor"/> : <ToggleLeft size={36}/>}</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TableContainer>
    </div>
  );

  const renderDocuments = () => (
    <div className="animate-in fade-in h-full">
        <TableContainer title="Documents" description="Company files." onAdd={() => { setModalType('upload_doc'); setModalData({}); setShowModal(true); }} actionLabel="Upload" isDarkMode={isDarkMode}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listData.map(doc => (
                    <GradientCard key={doc.id} isDarkMode={isDarkMode} className="p-4 flex flex-col justify-between h-32"><div className="flex items-start justify-between"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><FileText size={20}/></div><span className="text-[10px] font-black px-2 py-1 text-emerald-600 dark:text-emerald-400">DOCX</span></div><div><p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} line-clamp-1`}>{doc.doc_type_display || doc.doc_type}</p><a href={doc.attachment} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">Download <Download size={10}/></a></div></GradientCard>
                ))}
            </div>
        </TableContainer>
    </div>
  );

  const renderSignature = () => (
    <div className="animate-in fade-in h-full">
        <TableContainer title="Signatures" description="Authorized signatories." onAdd={() => { setModalType('signature'); setModalData({ signature_style: 'STYLE_1' }); setShowModal(true); }} actionLabel="Add New" isDarkMode={isDarkMode}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listData.length === 0 && <div className="col-span-full text-center p-12 text-slate-500 italic">No signatures yet.</div>}
                {listData.map((sig) => (
                    <GradientCard key={sig.id} isDarkMode={isDarkMode} className="p-5 flex flex-col items-center text-center relative group">
                        <button onClick={() => { setModalType('signature'); setModalData(sig); setShowModal(true); }} className="absolute top-3 right-3 p-2 text-slate-400 hover:text-blue-500 transition-colors bg-white/50 rounded-full"><Edit2 size={16} /></button>
                        <div className="h-24 w-full flex items-center justify-center mb-4 bg-white/50 rounded-lg border border-slate-200">
                            {sig.generated_signature_image ? <img src={sig.generated_signature_image} alt="Signature" className="h-full object-contain p-2" /> : <span className="text-xs text-slate-400 italic">No image</span>}
                        </div>
                        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sig.first_name} {sig.last_name}</h3>
                        <p className="text-sm text-blue-500 font-medium">{sig.title}</p>
                    </GradientCard>
                ))}
            </div>
        </TableContainer>
    </div>
  );

  // --- RETURN: ✅ FIX - LAYOUT STRUCTURE (PT-16 + Fixed Sidebar Top-16) ---
  return (
    <div className={`flex w-full min-h-screen font-sans pt-16 ${isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Mobile Backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Mobile Toggle */}
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg"><Menu size={24}/></button>

      {/* ✅ SIDEBAR: Fixed BELOW the main navbar (top-16) */}
     {/* ✅ SIDEBAR: Fixed BELOW the Navbar */}
      <aside className={`
          fixed left-0 z-40 flex flex-col 
          bg-slate-900 border-r border-slate-800 shadow-2xl 
          transition-transform duration-300 transform 
          
          /* 1. POSITIONING: Start 4rem (64px) from the top */
          top-32 
          
          /* 2. HEIGHT: Fill the rest of the screen (100vh - 4rem) */
          h-[calc(100vh-4rem)]
          
          /* 3. MOBILE: Slide in/out logic */
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          
          /* 4. WIDTH: Shrink logic */
          ${collapsed ? 'w-20' : 'w-72'} 
      `}>
        {/* Header */}
        <div className={`h-20 flex items-center ${collapsed ? 'justify-center px-0' : 'px-6'} border-b border-slate-800/50 bg-transparent shrink-0 relative transition-all`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">{(companyInfo.name || 'T').charAt(0).toUpperCase()}</div>
            {!collapsed && <div className="overflow-hidden ml-3 animate-in fade-in duration-300"><span className="block font-bold text-white text-sm truncate">{companyInfo.name}</span><span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate">Admin Portal</span></div>}
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex absolute -right-3 top-7 w-6 h-6 bg-blue-600 rounded-full text-white items-center justify-center border-2 border-slate-900 hover:bg-blue-500 transition-transform hover:scale-110 z-50">{collapsed ? <ChevronRightIcon size={12} /> : <ChevronLeft size={12} />}</button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 space-y-2">
            <SidebarItem id="users" label="Users" icon={Users} active={activeTab === 'users'} collapsed={collapsed} onClick={setActiveTab} />
            <SidebarItem id="contacts" label="Contacts" icon={Mail} active={activeTab === 'contacts'} collapsed={collapsed} onClick={setActiveTab} />
            <SidebarItem id="type" label="Industry Type" icon={Briefcase} active={activeTab === 'type'} collapsed={collapsed} onClick={setActiveTab} />
            {!collapsed && <div className="my-4 border-t border-slate-800/50"></div>}
            <SidebarItem id="workflow" label="Workflow" icon={GitMerge} active={activeTab === 'workflow'} collapsed={collapsed} onClick={setActiveTab} />
            <SidebarItem id="documents" label="Documents" icon={FileText} active={activeTab === 'documents'} collapsed={collapsed} onClick={setActiveTab} />
            <SidebarItem id="signature" label="Signatures" icon={PenTool} active={activeTab === 'signature'} collapsed={collapsed} onClick={setActiveTab} />
            {!collapsed && <div className="my-4 border-t border-slate-800/50"></div>}
            <SidebarItem id="branding" label="Branding" icon={Palette} active={activeTab === 'branding'} collapsed={collapsed} onClick={setActiveTab} />
            <SidebarItem id="payment" label="Payment" icon={CreditCard} active={activeTab === 'payment'} collapsed={collapsed} onClick={setActiveTab} />
        </div>
      </aside>

      {/* ✅ MAIN CONTENT: Pushed right to clear sidebar */}
      <main className={`flex-1 min-h-full transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="p-6 md:p-10 pb-24">
            {fetching ? (
                <div className="h-96 flex flex-col items-center justify-center"><Loader2 size={48} className="text-blue-500 animate-spin mb-4" /><p className="text-sm font-medium text-slate-500">Loading...</p></div>
            ) : (
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'contacts' && renderContacts()}
                    {activeTab === 'type' && renderType()}
                    {activeTab === 'workflow' && renderWorkflow()}
                    {activeTab === 'documents' && renderDocuments()}
                    {activeTab === 'signature' && renderSignature()}
                    {activeTab === 'branding' && (<div className="animate-in fade-in"><TableContainer title="Branding" description="Upload letterhead." isDarkMode={isDarkMode}><div className="p-16 text-center"><Palette size={48} className="mx-auto text-blue-500 mb-4"/><input type="file" className="hidden" id="brandUpload" onChange={(e) => handleFileUpload(e, 'branding')} accept=".docx"/><label htmlFor="brandUpload" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl cursor-pointer shadow-lg hover:bg-blue-700 inline-block mt-4">Upload .docx</label></div></TableContainer></div>)}
                    {activeTab === 'payment' && (<div className="animate-in fade-in"><TableContainer title="Payment Gateway" description="Stripe Keys." onAdd={() => { setModalType('payment'); setShowModal(true); }} actionLabel="Edit Keys" isDarkMode={isDarkMode}><div className="p-6"><div className="flex items-center gap-2 mb-2"><ShieldCheck size={20} className="text-emerald-500"/> <span className="font-bold">Stripe Connected</span></div><p className="text-slate-500 text-sm">Key: •••••••••••••••••</p></div></TableContainer></div>)}
                </div>
            )}
        </div>
      </main>

      {/* MODAL SECTION */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
              <div className={`w-full max-w-lg rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto border transform scale-100 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
                  <div className="flex justify-between items-center mb-8">
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {modalType === 'contacts' ? 'Edit Contacts' : modalType === 'user' ? (modalData.id ? 'Edit User' : 'Add User') : modalType === 'payment' ? 'Update Keys' : modalType === 'signature' ? (modalData.id ? 'Edit Signatory' : 'Add Signatory') : 'Edit Settings'}
                      </h3>
                      <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-6">
                      
                      {/* USER FORM */}
                      {modalType === 'user' && (
                          <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <CustomInput label="First Name" name="first_name" value={modalData.first_name} onChange={(e) => setModalData({...modalData, first_name: e.target.value})} isDarkMode={isDarkMode}/>
                                <CustomInput label="Last Name" name="last_name" value={modalData.last_name} onChange={(e) => setModalData({...modalData, last_name: e.target.value})} isDarkMode={isDarkMode}/>
                             </div>
                             <CustomInput label="Email" name="email" value={modalData.email} onChange={(e) => setModalData({...modalData, email: e.target.value})} isDarkMode={isDarkMode}/>
                             <CustomInput label={modalData.id ? "Password (Leave blank)" : "Password"} name="password" type="password" value={modalData.password} onChange={(e) => setModalData({...modalData, password: e.target.value})} isDarkMode={isDarkMode}/>
                             
                             <StunningSelect 
                                label="Role" 
                                value={modalData.is_staff ? 'admin' : 'staff'}
                                onChange={(e) => setModalData({...modalData, is_staff: e.target.value === 'admin'})}
                                isDarkMode={isDarkMode}
                                options={[ { value: 'admin', label: 'Admin (Full Access)' }, { value: 'staff', label: 'Staff (Limited Access)' } ]}
                             />
                          </div>
                       )}

                      {/* SIGNATURE FORM */}
                      {modalType === 'signature' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <CustomInput label="First Name" name="first_name" value={modalData.first_name} onChange={(e) => setModalData({...modalData, first_name: e.target.value})} isDarkMode={isDarkMode}/>
                                <CustomInput label="Last Name" name="last_name" value={modalData.last_name} onChange={(e) => setModalData({...modalData, last_name: e.target.value})} isDarkMode={isDarkMode}/>
                            </div>
                            <CustomInput label="Title" name="title" value={modalData.title} onChange={(e) => setModalData({...modalData, title: e.target.value})} isDarkMode={isDarkMode}/>
                            
                            <StunningSelect 
                                label="Signature Style"
                                value={modalData.signature_style}
                                onChange={(e) => setModalData({...modalData, signature_style: e.target.value})}
                                isDarkMode={isDarkMode}
                                options={[
                                    { value: 'STYLE_1', label: 'Cursive' }, { value: 'STYLE_2', label: 'Modern' }, 
                                    { value: 'STYLE_3', label: 'Bold' }, { value: 'STYLE_4', label: 'Handwritten' }
                                ]}
                            />
                            
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Signature Source</label>
                                <div className="mb-6">
                                    <span className="text-xs font-bold text-blue-500 mb-2 block">Option 1: Draw</span>
                                    <div className="border rounded-xl overflow-hidden bg-white border-slate-300 touch-none shadow-sm"><SignatureCanvas penColor="black" canvasProps={{width: 450, height: 150, className: 'sigCanvas'}} ref={signaturePad} onBegin={() => setModalData(prev => ({ ...prev, uploadedFile: null }))}/></div>
                                    <div className="flex justify-end mt-1"><button type="button" onClick={() => signaturePad.current.clear()} className="text-xs text-red-500 font-bold hover:underline">Clear Pad</button></div>
                                </div>
                                <div className="relative flex items-center py-2"><div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div><span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-bold uppercase">OR</span><div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div></div>
                                <div className="mt-2"><span className="text-xs font-bold text-emerald-500 mb-2 block">Option 2: Upload Image</span><div className="flex items-center gap-4"><label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-300 dark:border-slate-600 transition-colors"><UploadCloud size={16} />Choose File<input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={(e) => { const file = e.target.files[0]; if (file) { setModalData(prev => ({ ...prev, uploadedFile: file })); if(signaturePad.current) signaturePad.current.clear(); } }}/></label>{modalData.uploadedFile && (<span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1"><CheckCircle size={12}/> {modalData.uploadedFile.name}</span>)}</div></div>
                            </div>
                        </div>
                      )}

                       {/* Keep other forms (Contacts, Type, etc) */}
                       {modalType === 'contacts' && (
                          <div className="space-y-4">
                             <h4 className="font-bold text-blue-600 text-xs uppercase">Admin</h4>
                             <div className="grid grid-cols-2 gap-4"><CustomInput label="First Name" name="admin_first_name" value={data.admin_first_name} onChange={(e) => setData({...data, admin_first_name: e.target.value})} isDarkMode={isDarkMode}/><CustomInput label="Last Name" name="admin_last_name" value={data.admin_last_name} onChange={(e) => setData({...data, admin_last_name: e.target.value})} isDarkMode={isDarkMode}/></div>
                             <CustomInput label="Email" name="admin_main_email" value={data.admin_main_email} onChange={(e) => setData({...data, admin_main_email: e.target.value})} isDarkMode={isDarkMode}/><CustomInput label="Phone" name="admin_mobile" value={data.admin_mobile} onChange={(e) => setData({...data, admin_mobile: e.target.value})} isDarkMode={isDarkMode}/>
                             <h4 className="font-bold text-emerald-600 text-xs uppercase pt-4 border-t border-slate-200 dark:border-slate-700">Billing</h4>
                             <div className="grid grid-cols-2 gap-4"><CustomInput label="First Name" name="billing_first_name" value={data.billing_first_name} onChange={(e) => setData({...data, billing_first_name: e.target.value})} isDarkMode={isDarkMode}/><CustomInput label="Last Name" name="billing_last_name" value={data.billing_last_name} onChange={(e) => setData({...data, billing_last_name: e.target.value})} isDarkMode={isDarkMode}/></div>
                             <CustomInput label="Email" name="billing_main_email" value={data.billing_main_email} onChange={(e) => setData({...data, billing_main_email: e.target.value})} isDarkMode={isDarkMode}/><CustomInput label="Phone" name="billing_mobile" value={data.billing_mobile} onChange={(e) => setData({...data, billing_mobile: e.target.value})} isDarkMode={isDarkMode}/>
                          </div>
                       )}

                       {modalType === 'type' && (
                           <div className="grid grid-cols-2 gap-4">{['OWN', 'STAFFING'].map(t => (<div key={t} onClick={() => setData({...data, industry_type: t})} className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${data.industry_type === t ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}><Briefcase className="mx-auto mb-2 text-blue-500"/><span className="font-bold text-sm">{t === 'OWN' ? 'Direct' : 'Staffing'}</span></div>))}</div>
                       )}

                       {modalType === 'upload_doc' ? (
                          <>
                            <StunningSelect label="Document Type" value={modalData.doc_type} onChange={(e) => setModalData({...modalData, doc_type: e.target.value})} isDarkMode={isDarkMode} options={[{ value: 'INSURANCE', label: 'Insurance Guide' }, { value: 'HANDBOOK', label: 'Employee Handbook' }, { value: 'OFFER_LETTER', label: 'Offer Letter Template' }, { value: 'AGREEMENT', label: 'Employment Agreement' }, { value: 'TE_POLICY', label: 'T&E Policy' }, { value: 'CLIENT_DOC', label: 'Client Specific' }]}/>
                            <div className="border-2 border-dashed p-6 rounded-xl text-center hover:bg-slate-50 dark:hover:bg-slate-800/50"><input type="file" onChange={(e) => handleFileUpload(e, modalData.doc_type)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>
                          </>
                       ) : (
                          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">{loading ? 'Saving...' : 'Save Changes'}</button>
                       )}
                  </form>
              </div>
          </div>
      )}

      <SuccessModal isOpen={notification.show} onClose={() => setNotification({...notification, show: false})} type={notification.type} message={notification.message} />
    </div>
  );
};

export default CompanyDashboard;