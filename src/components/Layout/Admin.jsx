import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Users, Briefcase, GitMerge, FileText, PenTool, 
  Palette, CreditCard, Save, Upload, CheckCircle, 
  AlertCircle, Loader2, ChevronRight, Plus,
  Eye, EyeOff, Edit2, X, ToggleLeft, ToggleRight,
  GripVertical, FileCheck, Download, Search, Shield, 
  UserCheck, Clock, Filter, UploadCloud, ShieldCheck,
  Mail, Phone, Building, ChevronDown, Menu // ✅ Added Menu Icon
} from 'lucide-react';
import { companyIntakeService } from '../../services/companyIntakeService';
import { useTheme } from '../Theme/ThemeProvider';
import SuccessModal from '../common/Modal/SuccessModal';
import api from '../../api';

// ==========================================
// 1. STYLED UI COMPONENTS
// ==========================================

const SidebarItem = ({ id, label, icon: Icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm group relative overflow-hidden ${
      active
        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 translate-x-1'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    <Icon size={18} className={`transition-colors ${active ? 'text-white' : 'group-hover:text-white'}`} />
    <span className="relative z-10">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto text-white animate-in slide-in-from-left-2" />}
  </button>
);

const GradientCard = ({ children, className = '', isDarkMode }) => (
  <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'} shadow-lg shadow-black/5 transition-all duration-300 ${className}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? 'from-blue-500/5 to-purple-500/5' : 'from-blue-50/50 to-purple-50/50'}`}></div>
    <div className="relative z-10">{children}</div>
  </div>
);

const TableContainer = ({ title, description, onAdd, actionLabel, children, isDarkMode }) => (
    <GradientCard isDarkMode={isDarkMode} className="h-full flex flex-col">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
            </div>
            {onAdd && (
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 hover:-translate-y-0.5"
                >
                    {actionLabel === 'Edit' ? <Edit2 size={16}/> : <Plus size={16}/>}
                    {actionLabel || 'Add New'}
                </button>
            )}
        </div>
        <div className="overflow-x-auto w-full flex-1">
            {children}
        </div>
    </GradientCard>
);

const DetailRow = ({ label, value, isDarkMode }) => (
    <div className="flex justify-between items-center py-3 border-b border-dashed border-slate-100 dark:border-slate-700/50 last:border-0">
        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
        <span className={`font-medium text-sm truncate max-w-[200px] ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{value || '--'}</span>
    </div>
);

// --- CUSTOM INPUT COMPONENTS ---

const CustomInput = ({ label, name, value, onChange, type = "text", placeholder, isDarkMode }) => (
  <div className="space-y-1.5">
    <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
      {label}
    </label>
    <div className="relative group">
        <input
            type={type} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            placeholder={placeholder}
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-medium 
                ${isDarkMode 
                    ? 'bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-600' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-400'
                }`}
        />
    </div>
  </div>
);

const CustomSelect = ({ label, name, value, onChange, options, isDarkMode }) => (
  <div className="space-y-1.5">
    <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
      {label}
    </label>
    <div className="relative group">
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className={`w-full px-4 py-3 pr-10 rounded-xl border outline-none appearance-none transition-all font-medium cursor-pointer shadow-sm
                ${isDarkMode 
                    ? 'bg-slate-900/50 border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 hover:border-slate-600' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 hover:border-slate-300'
                }`}
        >
            <option value="" disabled className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>Select an option</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value} className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>
                    {opt.label}
                </option>
            ))}
        </select>
        {/* Custom Arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
            <ChevronDown size={18} />
        </div>
    </div>
  </div>
);

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

const CompanyDashboard = () => {
  const { isDarkMode } = useTheme();
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // ✅ Responsive Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data Buckets
  const [data, setData] = useState({});
  const [listData, setListData] = useState([]);
  const [users, setUsers] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({ name: 'Loading...', companyName: '' });

  // UI Control
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [modalData, setModalData] = useState({});
  
  // Drag & Drop
  const [dragItem, setDragItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  // References
  const signaturePad = useRef(null);

  // Notifications
  const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });
  const [showSecret, setShowSecret] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
        try {
            const res = await companyIntakeService.getCompanyContacts();
            setCompanyInfo({ 
                name: window.location.hostname, 
                companyName: res.data.company_name || 'My Company' 
            });
        } catch (e) {
            setCompanyInfo({ name: window.location.hostname, companyName: 'Company Portal' });
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
        if(activeTab === 'workflow' || activeTab === 'documents') setListData([]);

        if (activeTab === 'users') {
            const res = await api.get('users/');
            if (mounted) {
                const userList = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setUsers(userList);
            }
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
            const res = await companyIntakeService.getDigitalSignature();
            if (mounted) setData(res.data || {});
        } else if (activeTab === 'payment') {
            setData({}); 
        }
      } catch (error) {
        if (error.response?.status !== 404) console.error("Error loading tab data", error);
      } finally {
        if (mounted) setFetching(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [activeTab]);

  // --- ACTIONS ---

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (modalType === 'user') {
            let payload = { ...modalData };
            
            if (modalData.id && !modalData.password) {
                delete payload.password;
            }

            if (payload.role === 'Admin') payload.is_staff = true;

            if (modalData.id) {
                await api.patch(`users/${modalData.id}/`, payload);
            } else {
                await api.post('users/signup/', payload);
            }
            
            const res = await api.get('users/');
            const userList = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setUsers(userList);
        } 
        else if (activeTab === 'contacts') {
            await companyIntakeService.updateCompanyContacts(data);
        } 
        else if (activeTab === 'type') {
            await companyIntakeService.setCompanyType(data);
        } 
        else if (activeTab === 'payment') {
            await companyIntakeService.savePayment(data);
        } 
        else if (activeTab === 'signature') {
            if (signaturePad.current && !signaturePad.current.isEmpty()) {
                const sigData = signaturePad.current.toDataURL();
                await companyIntakeService.saveDigitalSignature({ ...data, signature_image_base64: sigData });
            } else {
                await companyIntakeService.saveDigitalSignature(data);
            }
        }

        setShowModal(false);
        setNotification({ show: true, type: 'success', message: 'Saved successfully!' });
    } catch (error) {
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
        setNotification({ show: true, type: 'success', message: 'File uploaded successfully!' });
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
    setDragItem(null); setDragOverItem(null); setListData(_list);
    
    const payload = _list.map((step, idx) => ({ id: step.id, sort_order: idx + 1 }));
    companyIntakeService.reorderWorkflowSteps(payload).catch(() => {
        setNotification({ show: true, type: 'error', message: 'Reorder failed.' });
    });
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
        <TableContainer 
            title="User Management" 
            description="Manage employee access and roles." 
            onAdd={() => { setModalType('user'); setModalData({ role: 'staff' }); setShowModal(true); }}
            actionLabel="Add User"
            isDarkMode={isDarkMode}
        >
            <table className="w-full text-left border-collapse">
                <thead className={`text-xs uppercase font-bold tracking-wider border-b ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {users && users.length === 0 && (
                        <tr>
                            <td colSpan="4" className="p-8 text-center text-slate-400 italic">
                                No users found. Click 'Add User' to create one.
                            </td>
                        </tr>
                    )}
                    {users && users.map(u => (
                        <tr key={u.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                        {u.first_name?.[0] || 'U'}{u.last_name?.[0] || 'N'}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.first_name} {u.last_name}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-sm text-slate-500">{u.email}</td>
                            <td className="p-4">
                                {/* ✅ FIX: VIBRANT TEXT ONLY (No Background Box) */}
                                <span className={`text-xs font-black uppercase tracking-wider ${u.is_staff ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {u.is_staff ? 'Admin' : 'Staff'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button onClick={() => { setModalType('user'); setModalData({...u, password: ''}); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg"><Edit2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TableContainer>
    </div>
  );

  const renderContacts = () => (
    <div className="animate-in fade-in h-full">
        <TableContainer 
            title="Company Contacts" 
            description="Manage administrative and billing points of contact." 
            onAdd={() => { setModalType('contacts'); setShowModal(true); }}
            actionLabel="Edit Contacts"
            isDarkMode={isDarkMode}
        >
            <div className="p-6 grid md:grid-cols-2 gap-8">
                <GradientCard isDarkMode={isDarkMode} className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-blue-600 font-bold"><Users size={20}/> Admin Contact</div>
                    <DetailRow label="Name" value={`${data.admin_first_name} ${data.admin_last_name}`} isDarkMode={isDarkMode}/>
                    <DetailRow label="Email" value={data.admin_main_email} isDarkMode={isDarkMode}/>
                    <DetailRow label="Phone" value={data.admin_mobile} isDarkMode={isDarkMode}/>
                </GradientCard>
                <GradientCard isDarkMode={isDarkMode} className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-emerald-600 font-bold"><CreditCard size={20}/> Billing Contact</div>
                    <DetailRow label="Name" value={`${data.billing_first_name} ${data.billing_last_name}`} isDarkMode={isDarkMode}/>
                    <DetailRow label="Email" value={data.billing_main_email} isDarkMode={isDarkMode}/>
                    <DetailRow label="Phone" value={data.billing_mobile} isDarkMode={isDarkMode}/>
                </GradientCard>
            </div>
        </TableContainer>
    </div>
  );

  const renderType = () => (
      <div className="animate-in fade-in h-full">
          <TableContainer title="Industry Model" description="Operational structure." onAdd={() => { setModalType('type'); setShowModal(true); }} actionLabel="Change Model" isDarkMode={isDarkMode}>
              <div className="p-10 flex flex-col items-center text-center">
                  <div className="p-5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 mb-6"><Briefcase size={40}/></div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {data.industry_type === 'OWN' ? 'Direct Employer' : 'Staffing Agency'}
                  </h3>
                  <p className="text-slate-500 mt-2 max-w-md">
                      {data.industry_type === 'OWN' ? 'Your company hires employees directly for internal roles.' : 'Your company hires candidates for placement at client sites.'}
                  </p>
                  <span className="mt-6 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">Active Mode</span>
              </div>
          </TableContainer>
      </div>
  );

  const renderWorkflow = () => (
    <div className="animate-in fade-in h-full">
        <TableContainer title="Onboarding Steps Order" description="Drag rows to reorder. Toggle 'Active' switch to remove/hide." isDarkMode={isDarkMode}>
            <table className="w-full text-left border-collapse">
                {/* ✅ NO BACKGROUND HEADER */}
                <thead className={`text-[11px] uppercase font-extrabold tracking-widest border-b ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <tr>
                        <th className="p-5 w-16 text-center">S#</th>
                        <th className="p-5">Title</th>
                        <th className="p-5">Form Type</th>
                        <th className="p-5 text-center w-24">Order</th>
                        <th className="p-5 text-center w-24">ReOrder</th>
                        <th className="p-5 text-center w-24">Active</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {listData.map((step, idx) => (
                        <tr 
                            key={step.id} 
                            draggable 
                            onDragStart={() => setDragItem(idx)}
                            onDragEnter={() => setDragOverItem(idx)}
                            onDragEnd={handleSort}
                            onDragOver={(e) => e.preventDefault()}
                            className={`transition-all ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} ${!step.is_active ? 'opacity-50 grayscale' : ''} ${dragItem === idx ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                            <td className="p-5 text-center font-mono text-sm text-slate-500">{idx + 1}</td>
                            <td className="p-5">
                                <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{step.step_name}</div>
                                {step.form_type === 'COMPANY_SPECIFIC' && (
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 font-bold">
                                        <FileCheck size={12}/> Needs Upload
                                    </div>
                                )}
                            </td>
                            {/* ✅ VIBRANT TEXT - NO BACKGROUND BOX */}
                            <td className="p-5">
                                <span className={`text-[11px] font-black uppercase tracking-wider ${
                                    step.form_type === 'STANDARD_FIELD' ? 'text-blue-600 dark:text-blue-400' :
                                    step.form_type === 'STANDARD_FORM' ? 'text-emerald-600 dark:text-emerald-400' :
                                    'text-purple-600 dark:text-purple-400'
                                }`}>
                                    {/* ✅ FIX: Safety check for form_type */}
                                    {(step.form_type || '').replace('_', ' ')}
                                </span>
                            </td>
                            <td className="p-5 text-center">
                                <span className={`text-base font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{step.sort_order}</span>
                            </td>
                            <td className="p-5 text-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-500">
                                <div className="flex justify-center"><GripVertical size={20}/></div>
                            </td>
                            <td className="p-5 text-center">
                                <button onClick={() => handleWorkflowToggle(step.id, step.is_active)} className={`transition-transform active:scale-95 ${step.is_active ? 'text-blue-600' : 'text-slate-300 dark:text-slate-600'}`}>
                                    {step.is_active ? <ToggleRight size={36} fill="currentColor"/> : <ToggleLeft size={36}/>}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TableContainer>
    </div>
  );

  const renderDocuments = () => (
    <div className="animate-in fade-in h-full">
        <TableContainer title="Documents" description="Templates." onAdd={() => { setModalType('upload_doc'); setModalData({}); setShowModal(true); }} actionLabel="Add Document" isDarkMode={isDarkMode}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listData.length === 0 && <div className="col-span-full p-12 text-center text-slate-500">No documents found.</div>}
                {listData.map(doc => (
                    <GradientCard key={doc.id} isDarkMode={isDarkMode} className="p-4 flex flex-col justify-between h-32">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><FileText size={20}/></div>
                            {/* ✅ FIX: Vibrant Text Only - NO Background */}
                            <span className="text-[10px] font-black px-2 py-1 text-emerald-600 dark:text-emerald-400">DOCX</span>
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} line-clamp-1`}>{doc.doc_type_display || doc.doc_type}</p>
                            <a href={doc.attachment} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">Download <Download size={10}/></a>
                        </div>
                    </GradientCard>
                ))}
            </div>
        </TableContainer>
    </div>
  );

  const renderSignature = () => (
      <div className="animate-in fade-in h-full">
          <TableContainer title="Authorized Signatory" description="Digital signature configuration." onAdd={() => { setModalType('signature'); setShowModal(true); }} actionLabel="Update" isDarkMode={isDarkMode}>
              <div className="p-8 flex flex-col items-center justify-center">
                  <div className="p-6 bg-white rounded-xl border border-slate-200 mb-6 w-full max-w-md flex justify-center shadow-sm">
                      {/* ✅ FIX: Show Image OR Placeholder */}
                      {data.generated_signature_image ? (
                          <img 
                            src={data.generated_signature_image} 
                            className="h-24 object-contain" 
                            alt="Signature" 
                            onError={(e) => { e.target.style.display = 'none'; }} 
                          />
                      ) : (
                          <div className="text-center">
                              <PenTool className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <span className="text-slate-400 italic text-sm">No digital signature uploaded</span>
                          </div>
                      )}
                  </div>
                  <div className="text-center space-y-1">
                      <p className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{data.first_name || 'Signatory Name'} {data.last_name}</p>
                      <p className="text-slate-500 font-medium">{data.title || 'Designation'}</p>
                  </div>
              </div>
          </TableContainer>
      </div>
  );

  // --- RETURN ---
  return (
    <div className={`flex min-h-screen font-sans ${isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* 1. ✅ MOBILE HEADER (New) */}
      <div className={`lg:hidden fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 border-b backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
          <div className="font-bold text-lg">
             <span className="text-blue-600">Company</span>Portal
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
      </div>

      {/* 2. SIDEBAR OVERLAY (Mobile) */}
      {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* 3. SIDEBAR */}
      <aside className={`w-72 fixed h-full z-50 flex flex-col bg-slate-900 border-r border-slate-800 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-24 flex items-center px-6 border-b border-slate-800/50 bg-transparent">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mr-3 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {(companyInfo.name || 'T').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
                <span className="block font-bold text-white text-sm truncate">{companyInfo.name}</span>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate">{companyInfo.companyName}</span>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar py-8 px-4 space-y-2">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">General</p>
            <SidebarItem id="users" label="Users" icon={Users} active={activeTab === 'users'} onClick={(id) => {setActiveTab(id); setSidebarOpen(false);}} />
            <SidebarItem id="contacts" label="Contacts" icon={Mail} active={activeTab === 'contacts'} onClick={(id) => {setActiveTab(id); setSidebarOpen(false);}} />
            <SidebarItem id="type" label="Industry Type" icon={Briefcase} active={activeTab === 'type'} onClick={(id) => {setActiveTab(id); setSidebarOpen(false);}} />
            
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2">Workflow</p>
            <SidebarItem id="workflow" label="Steps Order" icon={GitMerge} active={activeTab === 'workflow'} onClick={(id) => {setActiveTab(id); setSidebarOpen(false);}} />
            <SidebarItem id="documents" label="Documents" icon={FileText} active={activeTab === 'documents'} onClick={(id) => {setActiveTab(id); setSidebarOpen(false);}} />
            <SidebarItem id="signature" label="E-Signature" icon={PenTool} active={activeTab === 'signature'} onClick={(id) => {setActiveTab(id); setSidebarOpen(false);}} />
            
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2">System</p>
            <SidebarItem id="branding" label="Branding" icon={Palette} active={activeTab === 'branding'} onClick={(id) => {setActiveTab(id); setSidebarOpen(false);}} />
            <SidebarItem id="payment" label="Billing" icon={CreditCard} active={activeTab === 'payment'} onClick={(id) => {setActiveTab(id); setSidebarOpen(false);}} />
        </div>
      </aside>

      {/* 4. CONTENT */}
      <main className="flex-1 lg:ml-72 p-8 lg:p-12 overflow-y-auto min-h-screen relative pt-24 lg:pt-12">
        {fetching ? (
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500">Loading configuration...</p>
            </div>
        ) : (
            <div className="max-w-6xl mx-auto pb-20 h-full">
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'contacts' && renderContacts()}
                {activeTab === 'type' && renderType()}
                {activeTab === 'workflow' && renderWorkflow()}
                {activeTab === 'documents' && renderDocuments()}
                {activeTab === 'signature' && renderSignature()}
                
                {/* Branding Logic */}
                {activeTab === 'branding' && (
                    <div className="animate-in fade-in">
                        <TableContainer title="Branding" description="Upload letterhead." isDarkMode={isDarkMode}>
                            <div className="p-16 text-center">
                                <Palette size={48} className="mx-auto text-blue-500 mb-4"/>
                                <input type="file" className="hidden" id="brandUpload" onChange={(e) => handleFileUpload(e, 'branding')} accept=".docx"/>
                                <label htmlFor="brandUpload" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl cursor-pointer shadow-lg hover:bg-blue-700 inline-block mt-4">Upload .docx</label>
                            </div>
                        </TableContainer>
                    </div>
                )}

                {/* Payment Logic */}
                {activeTab === 'payment' && (
                    <div className="animate-in fade-in">
                        <TableContainer title="Payment Gateway" description="Stripe Keys." onAdd={() => { setModalType('payment'); setShowModal(true); }} actionLabel="Edit Keys" isDarkMode={isDarkMode}>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-2"><ShieldCheck size={20} className="text-emerald-500"/> <span className="font-bold">Stripe Connected</span></div>
                                <p className="text-slate-500 text-sm">Key: •••••••••••••••••</p>
                            </div>
                        </TableContainer>
                    </div>
                )}
            </div>
        )}
      </main>

      {/* --- PREMIUM MODAL --- */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
              <div className={`w-full max-w-lg rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto border transform scale-100 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
                  <div className="flex justify-between items-center mb-8">
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {modalType === 'contacts' ? 'Edit Contacts' : 
                           modalType === 'user' ? (modalData.id ? 'Edit User' : 'Add User') : 
                           modalType === 'payment' ? 'Update Keys' : 'Edit Settings'}
                      </h3>
                      <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-6">
                      {/* USER FORM */}
                      {modalType === 'user' && (
                          <>
                              <div className="grid grid-cols-2 gap-4">
                                  <CustomInput label="First Name" name="first_name" value={modalData.first_name} onChange={(e) => setModalData({...modalData, first_name: e.target.value})} isDarkMode={isDarkMode}/>
                                  <CustomInput label="Last Name" name="last_name" value={modalData.last_name} onChange={(e) => setModalData({...modalData, last_name: e.target.value})} isDarkMode={isDarkMode}/>
                              </div>
                              <CustomInput label="Email" name="email" value={modalData.email} onChange={(e) => setModalData({...modalData, email: e.target.value})} isDarkMode={isDarkMode}/>
                              
                              <CustomInput 
                                  label={modalData.id ? "Password (Leave blank to keep)" : "Password"} 
                                  name="password" 
                                  type="password" 
                                  value={modalData.password} 
                                  onChange={(e) => setModalData({...modalData, password: e.target.value})} 
                                  isDarkMode={isDarkMode}
                              />
                              
                              <CustomSelect 
                                  label="Role" 
                                  name="role" 
                                  options={[{value:'admin', label:'Admin'}, {value:'staff', label:'Staff'}]} 
                                  value={modalData.is_staff ? 'admin' : 'staff'} 
                                  onChange={(e) => setModalData({...modalData, is_staff: e.target.value === 'admin'})} 
                                  isDarkMode={isDarkMode}
                              />
                          </>
                      )}

                      {/* CONTACTS FORM */}
                      {modalType === 'contacts' && (
                          <>
                              <h4 className="font-bold text-blue-600 text-xs uppercase">Admin</h4>
                              <div className="grid grid-cols-2 gap-4">
                                  <CustomInput label="First Name" name="admin_first_name" value={data.admin_first_name} onChange={(e) => setData({...data, admin_first_name: e.target.value})} isDarkMode={isDarkMode}/>
                                  <CustomInput label="Last Name" name="admin_last_name" value={data.admin_last_name} onChange={(e) => setData({...data, admin_last_name: e.target.value})} isDarkMode={isDarkMode}/>
                              </div>
                              <CustomInput label="Email" name="admin_main_email" value={data.admin_main_email} onChange={(e) => setData({...data, admin_main_email: e.target.value})} isDarkMode={isDarkMode}/>
                              <CustomInput label="Phone" name="admin_mobile" value={data.admin_mobile} onChange={(e) => setData({...data, admin_mobile: e.target.value})} isDarkMode={isDarkMode}/>
                              
                              <h4 className="font-bold text-emerald-600 text-xs uppercase pt-4 border-t border-slate-200 dark:border-slate-700">Billing</h4>
                              <div className="grid grid-cols-2 gap-4">
                                  <CustomInput label="First Name" name="billing_first_name" value={data.billing_first_name} onChange={(e) => setData({...data, billing_first_name: e.target.value})} isDarkMode={isDarkMode}/>
                                  <CustomInput label="Last Name" name="billing_last_name" value={data.billing_last_name} onChange={(e) => setData({...data, billing_last_name: e.target.value})} isDarkMode={isDarkMode}/>
                              </div>
                              <CustomInput label="Email" name="billing_main_email" value={data.billing_main_email} onChange={(e) => setData({...data, billing_main_email: e.target.value})} isDarkMode={isDarkMode}/>
                              <CustomInput label="Phone" name="billing_mobile" value={data.billing_mobile} onChange={(e) => setData({...data, billing_mobile: e.target.value})} isDarkMode={isDarkMode}/>
                          </>
                      )}

                      {/* PAYMENT FORM */}
                      {modalType === 'payment' && (
                          <div className="relative">
                              <CustomInput label="Gateway Secret Key" name="gateway_token" type={showSecret ? "text" : "password"} value={data.gateway_token} onChange={(e) => setData({...data, [e.target.name]: e.target.value})} isDarkMode={isDarkMode}/>
                              <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-4 top-9 text-slate-400 hover:text-slate-600">{showSecret ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                          </div>
                      )}

                      {/* SIGNATURE FORM */}
                      {modalType === 'signature' && (
                          <>
                              <div className="grid grid-cols-2 gap-4">
                                  <CustomInput label="First Name" name="first_name" value={data.first_name} onChange={(e) => setData({...data, first_name: e.target.value})} isDarkMode={isDarkMode}/>
                                  <CustomInput label="Last Name" name="last_name" value={data.last_name} onChange={(e) => setData({...data, last_name: e.target.value})} isDarkMode={isDarkMode}/>
                              </div>
                              <CustomInput label="Title" name="title" value={data.title} onChange={(e) => setData({...data, title: e.target.value})} isDarkMode={isDarkMode}/>
                              
                              <CustomSelect 
                                  label="Signature Style" 
                                  name="signature_style" 
                                  value={data.signature_style} 
                                  onChange={(e) => setData({...data, signature_style: e.target.value})} 
                                  isDarkMode={isDarkMode}
                                  options={[
                                      { value: 'STYLE_1', label: 'Cursive' },
                                      { value: 'STYLE_2', label: 'Modern' },
                                      { value: 'STYLE_3', label: 'Bold' },
                                      { value: 'STYLE_4', label: 'Handwritten' }
                                  ]}
                              />

                              <div className="border rounded-xl overflow-hidden bg-white border-slate-300">
                                  <SignatureCanvas penColor="black" canvasProps={{width: 450, height: 150, className: 'sigCanvas'}} ref={signaturePad} />
                              </div>
                              <div className="flex justify-end">
                                  <button type="button" onClick={() => signaturePad.current.clear()} className="text-xs text-red-500 font-bold hover:underline">Clear Signature</button>
                              </div>
                          </>
                      )}

                      {/* INDUSTRY TYPE FORM */}
                      {modalType === 'type' && (
                          <div className="grid grid-cols-2 gap-4">
                              {['OWN', 'STAFFING'].map(t => (
                                  <div key={t} onClick={() => setData({...data, industry_type: t})} className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${data.industry_type === t ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                      <Briefcase className="mx-auto mb-2 text-blue-500"/>
                                      <span className="font-bold text-sm">{t === 'OWN' ? 'Direct' : 'Staffing'}</span>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* DOCUMENT UPLOAD FORM */}
                      {modalType === 'upload_doc' && (
                          <>
                              <CustomSelect 
                                  label="Document Type" 
                                  name="doc_type" 
                                  value={modalData.doc_type} 
                                  onChange={(e) => setModalData({...modalData, doc_type: e.target.value})} 
                                  isDarkMode={isDarkMode}
                                  options={[
                                      { value: 'INSURANCE', label: 'Insurance Guide' },
                                      { value: 'HANDBOOK', label: 'Employee Handbook' },
                                      { value: 'OFFER_LETTER', label: 'Offer Letter Template' },
                                      { value: 'AGREEMENT', label: 'Employment Agreement' },
                                      { value: 'TE_POLICY', label: 'T&E Policy' },
                                      { value: 'CLIENT_DOC', label: 'Client Specific' }
                                  ]}
                              />
                              <div className="border-2 border-dashed p-6 rounded-xl text-center hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <input type="file" onChange={(e) => handleFileUpload(e, modalData.doc_type)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                              </div>
                          </>
                      )}

                      {modalType !== 'upload_doc' ? (
                          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                              {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                      ) : (
                          <button type="button" onClick={() => handleFileUpload(null, modalData.doc_type)} disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg">
                              {loading ? 'Uploading...' : 'Upload File'}
                          </button>
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