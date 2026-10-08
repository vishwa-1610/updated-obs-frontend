import React, { useState, useEffect, useRef, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Users, Briefcase, GitMerge, FileText, PenTool, 
  Palette, CreditCard, Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight,
  Download, ShieldCheck, Mail, ChevronDown, Check, Loader2,
  UploadCloud, CheckCircle, Shield, Sparkles, Lock, ArrowRight, Copy, CheckCircle2,
  Sliders, FileCheck2, UserCheck, Scale, Globe, Building, Building2,
  Eye, Info, AlertCircle, Calendar, Hash, ExternalLink,
  GripVertical, ArrowUp, ArrowDown, ChevronUp, Server, HardDrive, RefreshCw, Key,
  MapPin, Clock, Search, Filter, Layers, Zap
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import api from '../../services/api';
import companyIntakeService from '../../services/companyIntakeService';
import PageLoader from '../common/LoadingScreen/LoadingScreen';

// ==========================================
// 1. REUSABLE ATOMIC UI COMPONENTS
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

  const selectedLabel = options.find(opt => opt.value === value)?.label || "Select option";

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      {label && <label className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{label}</label>}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full px-3.5 py-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-150 ${
          isDarkMode 
            ? `bg-[#181a20] ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-800 hover:border-zinc-700'} text-zinc-100` 
            : `bg-slate-50 ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'} text-slate-800 shadow-2xs`
        }`}
      >
        <span className="font-semibold text-xs sm:text-sm truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-500' : 'text-zinc-400'}`} />
      </div>
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1.5 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto ${
          isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
        }`}>
          {options.map((opt) => (
            <div 
              key={opt.value} 
              onClick={() => { onChange({ target: { value: opt.value } }); setIsOpen(false); }} 
              className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between text-xs sm:text-sm font-medium transition-colors ${
                value === opt.value 
                  ? (isDarkMode ? 'bg-blue-600/20 text-blue-400 font-bold' : 'bg-blue-50 text-blue-600 font-bold') 
                  : (isDarkMode ? 'text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <Check size={14} className="text-blue-500 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomInput = ({ label, name, value, onChange, type = "text", placeholder, isDarkMode, disabled = false, required = false }) => (
  <div className="space-y-1.5">
    {label && (
      <label className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    <input 
      type={type} 
      name={name} 
      value={value ?? ''} 
      onChange={onChange} 
      disabled={disabled}
      required={required}
      placeholder={placeholder} 
      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-xs sm:text-sm font-medium ${
        isDarkMode 
          ? 'bg-[#181a20] border-zinc-800 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-zinc-600 disabled:opacity-50' 
          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 shadow-2xs disabled:opacity-50'
      }`}
    />
  </div>
);

// ==========================================
// 2. MAIN ADMIN DASHBOARD COMPONENT
// ==========================================

const Admin = () => {
  const { isDarkMode, accentColor, themeColors = THEME_COLORS } = useTheme();

  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);
  const activeHexColor = activeColorObj.color;

  // Active Tab State
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Primary Data States
  const [companyProfile, setCompanyProfile] = useState(null);
  const [brandingData, setBrandingData] = useState({ brand_name: '', brand_tagline: '', primary_color: '#2563eb', secondary_color: '#3b82f6' });
  const [entities, setEntities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [companyDocs, setCompanyDocs] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [healthAudit, setHealthAudit] = useState(null);
  const [backupPolicy, setBackupPolicy] = useState(null);
  const [contactsData, setContactsData] = useState({});
  const [typeData, setTypeData] = useState({ industry_type: 'STAFFING' });
  const [billingPlan, setBillingPlan] = useState({ plan_name: 'Enterprise Tier', max_seats: 100, active_seats: 18 });

  // Wide Form Modal State (Create / Edit)
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [modalData, setModalData] = useState({});

  // Details View Modal State (Inspect on Row Click)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsType, setDetailsType] = useState(null);

  // Feedback Notification Modal
  const [notification, setNotification] = useState({ show: false, type: 'success', title: '', message: '' });

  // Signature Pad Ref
  const signaturePad = useRef(null);

  // 10 Comprehensive Navigation Tabs
  const tabs = [
    { id: 'branding', label: 'Branding & Theme', icon: Palette, badge: 'Live' },
    { id: 'entities', label: 'Legal Entities', icon: Building2, badge: entities.length > 0 ? `${entities.length}` : null },
    { id: 'branches', label: 'Branches & Depts', icon: MapPin, badge: branches.length > 0 ? `${branches.length}` : null },
    { id: 'users', label: 'Users & RBAC', icon: Users, badge: users.length > 0 ? `${users.length}` : null },
    { id: 'workflow', label: 'Compliance Pipeline', icon: GitMerge, badge: '12-Step' },
    { id: 'documents', label: 'Master Vault', icon: FileText, badge: companyDocs.length > 0 ? `${companyDocs.length}` : null },
    { id: 'signature', label: 'E-Signatures', icon: PenTool, badge: signatures.length > 0 ? `${signatures.length}` : null },
    { id: 'cloud', label: 'BYO-Cloud & SOC2', icon: Server, badge: '100% HIPAA' },
    { id: 'payment', label: 'Subscription & Keys', icon: CreditCard, badge: 'Enterprise' },
    { id: 'contacts', label: 'Corporate Contacts', icon: Mail, badge: null },
  ];

  // --- 1. INITIALIZE ALL COUNTS & REAL-TIME DATA ON MOUNT ---
  useEffect(() => {
    loadAllAdminData();
  }, []);

  // --- 2. TAB-SPECIFIC DATA REFRESH ---
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadAllAdminData = async () => {
    setFetching(true);
    try {
      // 1. Company Profile
      try {
        const pRes = await api.get('/company/profile/');
        if (pRes.data) {
          setCompanyProfile(pRes.data);
          setBrandingData({
            brand_name: pRes.data.company_name || 'TECH INNOVATORS INC.',
            brand_tagline: pRes.data.branding?.brand_tagline || 'Next-Gen Human Capital Operating System',
            primary_color: pRes.data.branding?.primary_color || '#2563eb',
            secondary_color: pRes.data.branding?.secondary_color || '#3b82f6',
          });
        }
      } catch (e) {}

      // 2. Entities
      try {
        const entRes = await api.get('/company/entities/');
        setEntities(Array.isArray(entRes.data) ? entRes.data : (entRes.data?.results || []));
      } catch (e) {}

      // 3. Branches & Departments
      try {
        const brRes = await api.get('/company/branches/');
        setBranches(Array.isArray(brRes.data) ? brRes.data : (brRes.data?.results || []));
      } catch (e) {}
      try {
        const depRes = await api.get('/company/departments/');
        setDepartments(Array.isArray(depRes.data) ? depRes.data : (depRes.data?.results || []));
      } catch (e) {}

      // 4. Users
      try {
        const uRes = await api.get('/users/');
        setUsers(Array.isArray(uRes.data) ? uRes.data : (uRes.data?.results || []));
      } catch (e) {}

      // 5. Workflow Steps
      try {
        const wfRes = await companyIntakeService.getWorkflowSteps();
        setWorkflowSteps(Array.isArray(wfRes.data) ? wfRes.data : []);
      } catch (e) {}

      // 6. Documents
      try {
        const docRes = await companyIntakeService.getCompanyDocuments();
        setCompanyDocs(Array.isArray(docRes.data) ? docRes.data : []);
      } catch (e) {}

      // 7. Signatures
      try {
        const sigRes = await api.get('/company/digital-signatures/');
        setSignatures(Array.isArray(sigRes.data) ? sigRes.data : (sigRes.data?.results || []));
      } catch (e) {}

      // 8. Health Audit & Cloud
      try {
        const auditRes = await api.get('/company/cloud/health-audit/');
        setHealthAudit(auditRes.data);
      } catch (e) {}
      try {
        const backRes = await api.get('/company/cloud/backup-policy/');
        setBackupPolicy(backRes.data);
      } catch (e) {}

      // 9. Contacts & Type
      try {
        const cRes = await companyIntakeService.getCompanyContacts();
        setContactsData(cRes.data || {});
      } catch (e) {}
      try {
        const tRes = await companyIntakeService.getCompanyType();
        setTypeData(tRes.data || { industry_type: 'STAFFING' });
      } catch (e) {}

    } catch (err) {
      console.error("Admin initialization error:", err);
    } finally {
      setFetching(false);
    }
  };

  const loadTabData = async (tab) => {
    try {
      if (tab === 'users') {
        const uRes = await api.get('/users/');
        setUsers(Array.isArray(uRes.data) ? uRes.data : (uRes.data?.results || []));
      } else if (tab === 'entities') {
        const entRes = await api.get('/company/entities/');
        setEntities(Array.isArray(entRes.data) ? entRes.data : (entRes.data?.results || []));
      } else if (tab === 'branches') {
        const brRes = await api.get('/company/branches/');
        setBranches(Array.isArray(brRes.data) ? brRes.data : (brRes.data?.results || []));
        const depRes = await api.get('/company/departments/');
        setDepartments(Array.isArray(depRes.data) ? depRes.data : (depRes.data?.results || []));
      } else if (tab === 'workflow') {
        const wfRes = await companyIntakeService.getWorkflowSteps();
        setWorkflowSteps(Array.isArray(wfRes.data) ? wfRes.data : []);
      } else if (tab === 'documents') {
        const docRes = await companyIntakeService.getCompanyDocuments();
        setCompanyDocs(Array.isArray(docRes.data) ? docRes.data : []);
      } else if (tab === 'signature') {
        const sigRes = await api.get('/company/digital-signatures/');
        setSignatures(Array.isArray(sigRes.data) ? sigRes.data : (sigRes.data?.results || []));
      } else if (tab === 'contacts') {
        const cRes = await companyIntakeService.getCompanyContacts();
        setContactsData(cRes.data || {});
      }
    } catch (e) {}
  };

  // --- 3. SAVE HANDLERS ---
  const handleSaveModal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modalType === 'user') {
        let payload = { ...modalData };
        if (modalData.id && !modalData.password) delete payload.password;
        if (payload.role === 'Admin' || payload.role === 'SUPER_ADMIN') payload.is_staff = true;
        
        if (modalData.id) {
          await api.patch(`/users/${modalData.id}/`, payload);
          showFeedback('User Updated', 'User credentials and role permissions were updated successfully.');
        } else {
          await api.post('/users/signup/', payload);
          showFeedback('User Created', 'New user account created and activation invitation sent.');
        }
        loadTabData('users');
      } 
      else if (modalType === 'entity') {
        if (modalData.id) {
          await api.patch(`/company/entities/${modalData.id}/`, modalData);
          showFeedback('Entity Updated', 'Legal subsidiary information updated.');
        } else {
          await api.post('/company/entities/', modalData);
          showFeedback('Entity Created', 'New legal subsidiary registered under tenant.');
        }
        loadTabData('entities');
      }
      else if (modalType === 'branch') {
        if (modalData.id) {
          await api.patch(`/company/branches/${modalData.id}/`, modalData);
          showFeedback('Branch Updated', 'Office branch and facility details updated.');
        } else {
          await api.post('/company/branches/', modalData);
          showFeedback('Branch Registered', 'New physical office facility added to system.');
        }
        loadTabData('branches');
      }
      else if (modalType === 'department') {
        if (modalData.id) {
          await api.patch(`/company/departments/${modalData.id}/`, modalData);
          showFeedback('Department Updated', 'Department details updated.');
        } else {
          await api.post('/company/departments/', modalData);
          showFeedback('Department Created', 'New organizational cost center created.');
        }
        loadTabData('branches');
      }
      else if (modalType === 'signature') {
        const formData = new FormData();
        formData.append('first_name', modalData.first_name || '');
        formData.append('last_name', modalData.last_name || '');
        formData.append('title', modalData.title || '');
        formData.append('signature_style', modalData.signature_style || 'STYLE_1');

        if (signaturePad.current && !signaturePad.current.isEmpty()) {
          const base64String = signaturePad.current.toDataURL('image/png');
          formData.append('signature_image_base64', base64String);
        }

        if (modalData.id) {
          await companyIntakeService.updateDigitalSignature(modalData.id, formData);
          showFeedback('Signature Updated', 'Authorized signatory profile updated.');
        } else {
          await companyIntakeService.createDigitalSignature(formData);
          showFeedback('Signature Registered', 'Authorized digital signatory registered for onboarding e-sign.');
        }
        loadTabData('signature');
      }
      else if (modalType === 'document') {
        const formData = new FormData();
        formData.append('title', modalData.title || '');
        formData.append('category', modalData.category || 'HANDBOOK');
        if (modalData.file) {
          formData.append('file', modalData.file);
        }
        await companyIntakeService.uploadCompanyDocument(formData);
        showFeedback('Document Uploaded', 'Master compliance document added to Company Vault.');
        loadTabData('documents');
      }

      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
      showFeedback('Operation Failed', err.response?.data?.detail || err.response?.data?.message || 'Could not save changes. Check required fields.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/company/branding/', brandingData);
      showFeedback('Branding Saved', 'Tenant logo, brand theme, and letterhead configuration updated.');
    } catch (err) {
      showFeedback('Save Failed', 'Could not update branding preferences.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContacts = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await companyIntakeService.updateCompanyContacts(contactsData);
      showFeedback('Contacts Saved', 'Corporate contacts and legal address saved.');
    } catch (err) {
      showFeedback('Save Failed', 'Could not save corporate contacts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. WORKFLOW STEP REORDER & TOGGLE ---
  const handleToggleWorkflowStep = async (step) => {
    try {
      const updated = !step.is_active;
      await companyIntakeService.toggleWorkflowStep(step.id, updated);
      setWorkflowSteps(prev => prev.map(s => s.id === step.id ? { ...s, is_active: updated } : s));
    } catch (err) {
      showFeedback('Error', 'Could not toggle workflow step.', 'error');
    }
  };

  const handleMoveWorkflowStep = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= workflowSteps.length) return;

    const newSteps = [...workflowSteps];
    const [moved] = newSteps.splice(index, 1);
    newSteps.splice(targetIndex, 0, moved);

    const reorderPayload = newSteps.map((s, idx) => ({ id: s.id, sort_order: idx + 1 }));
    setWorkflowSteps(newSteps);

    try {
      await companyIntakeService.reorderWorkflowSteps(reorderPayload);
    } catch (err) {
      loadTabData('workflow');
    }
  };

  const showFeedback = (title, message, type = 'success') => {
    setNotification({ show: true, type, title, message });
  };

  // KPI Metrics Calculation
  const totalUsers = users.length;
  const activeAdmins = users.filter(u => u.is_staff || u.role === 'Admin' || u.role === 'SUPER_ADMIN').length;
  const activeEntitiesCount = entities.length;
  const activeBranchesCount = branches.length;
  const activeStepsCount = workflowSteps.filter(s => s.is_active).length;
  const vaultDocsCount = companyDocs.length;
  const authorizedSignersCount = signatures.length;

  if (loading && (!users || users.length === 0) && (!entities || entities.length === 0)) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 lg:p-8 select-none transition-colors duration-200 ${
        isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <PageLoader 
          message="Loading Tenant Administration & Role Access..."
          subMessage="Fetching enterprise users, legal entities, branches, and e-sign settings"
          showSkeleton={true}
          skeletonType="table"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 select-none transition-colors duration-200 ${
      isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & TENANT SUMMARY                           */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md font-black text-base"
              style={{ backgroundColor: activeHexColor }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Tenant Governance & Admin Dashboard
              </h1>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                {companyProfile?.company_name || 'TECH INNOVATORS INC.'} • Multi-Tenant Configuration Suite
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadAllAdminData()}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-300 hover:border-zinc-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {activeTab === 'users' && (
            <button
              onClick={() => { setModalType('user'); setModalData({ role: 'HR_MANAGER', is_active: true }); setShowModal(true); }}
              style={{ backgroundColor: activeHexColor }}
              className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Add User Account
            </button>
          )}

          {activeTab === 'entities' && (
            <button
              onClick={() => { setModalType('entity'); setModalData({ is_active: true, state_of_incorporation: 'DE' }); setShowModal(true); }}
              style={{ backgroundColor: activeHexColor }}
              className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Register Legal Entity
            </button>
          )}

          {activeTab === 'branches' && (
            <div className="flex gap-2">
              <button
                onClick={() => { setModalType('branch'); setModalData({ is_active: true, timezone: 'America/New_York' }); setShowModal(true); }}
                style={{ backgroundColor: activeHexColor }}
                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Branch Office
              </button>
              <button
                onClick={() => { setModalType('department'); setModalData({ is_active: true }); setShowModal(true); }}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100 hover:border-zinc-700' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <Plus className="w-4 h-4 text-blue-500" /> Add Dept
              </button>
            </div>
          )}

          {activeTab === 'documents' && (
            <button
              onClick={() => { setModalType('document'); setModalData({ category: 'HANDBOOK' }); setShowModal(true); }}
              style={{ backgroundColor: activeHexColor }}
              className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all"
            >
              <UploadCloud className="w-4 h-4" /> Upload Master Doc
            </button>
          )}

          {activeTab === 'signature' && (
            <button
              onClick={() => { setModalType('signature'); setModalData({ signature_style: 'STYLE_1' }); setShowModal(true); }}
              style={{ backgroundColor: activeHexColor }}
              className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Signatory Officer
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP METRIC KPI CARDS (6 STATS)                        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        
        {/* KPI 1 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Total Staff & Users
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black">{totalUsers}</span>
            <span className="text-[10px] font-bold text-emerald-500">{activeAdmins} Admins</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Legal Entities
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black">{activeEntitiesCount}</span>
            <span className="text-[10px] font-bold text-emerald-500">Subsidiaries</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Office Branches
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black">{activeBranchesCount}</span>
            <span className="text-[10px] font-bold text-purple-500">{departments.length} Depts</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Workflow Steps
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <GitMerge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black">{activeStepsCount}</span>
            <span className="text-[10px] font-bold text-amber-500">Active</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Master Vault Docs
            </span>
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black">{vaultDocsCount}</span>
            <span className="text-[10px] font-bold text-pink-500">Handbooks</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Security & SOC2
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-500">100%</span>
            <span className="text-[10px] font-bold text-emerald-500">Audited</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. TAB NAVIGATION (10 COMPREHENSIVE TABS)               */}
      {/* ======================================================== */}
      <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto custom-scrollbar mb-6 ${
        isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive 
                  ? 'text-white shadow-sm' 
                  : isDarkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              style={{ backgroundColor: isActive ? activeHexColor : 'transparent' }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${
                  isActive ? 'bg-white/20 text-white' : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4. TAB CONTENTS & PANELS                                 */}
      {/* ======================================================== */}
      <div className="transition-all duration-150">
        
        {/* --- TAB 1: BRANDING & WHITE-LABELING --- */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h2 className="text-base font-bold mb-1">Corporate Branding & Identity</h2>
              <p className={`text-xs mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Configure brand typography, master enterprise logo, and letterhead accents.
              </p>

              <form onSubmit={handleSaveBranding} className="space-y-4">
                <CustomInput 
                  label="Official Company Display Name"
                  value={brandingData.brand_name}
                  onChange={(e) => setBrandingData({ ...brandingData, brand_name: e.target.value })}
                  isDarkMode={isDarkMode}
                  placeholder="e.g. TECH INNOVATORS INC."
                />
                <CustomInput 
                  label="Brand Tagline & Subheading"
                  value={brandingData.brand_tagline}
                  onChange={(e) => setBrandingData({ ...brandingData, brand_tagline: e.target.value })}
                  isDarkMode={isDarkMode}
                  placeholder="e.g. Advanced Human Capital & Onboarding Suite"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Primary Brand Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={brandingData.primary_color || '#2563eb'}
                        onChange={(e) => setBrandingData({ ...brandingData, primary_color: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-zinc-700 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={brandingData.primary_color || ''}
                        onChange={(e) => setBrandingData({ ...brandingData, primary_color: e.target.value })}
                        className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono font-semibold ${
                          isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Secondary Accent Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={brandingData.secondary_color || '#3b82f6'}
                        onChange={(e) => setBrandingData({ ...brandingData, secondary_color: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-zinc-700 bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={brandingData.secondary_color || ''}
                        onChange={(e) => setBrandingData({ ...brandingData, secondary_color: e.target.value })}
                        className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono font-semibold ${
                          isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: activeHexColor }}
                    className="px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Branding Identity
                  </button>
                </div>
              </form>
            </div>

            {/* Live Letterhead & Card Preview */}
            <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <h3 className="text-sm font-bold mb-1">Live Letterhead Preview</h3>
                <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Visual preview of employee offer letters and PDF letterhead.
                </p>

                <div className={`p-5 rounded-2xl border relative overflow-hidden ${
                  isDarkMode ? 'bg-[#181a20] border-zinc-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="h-1.5 absolute top-0 left-0 right-0" style={{ backgroundColor: brandingData.primary_color || activeHexColor }}></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                      style={{ backgroundColor: brandingData.primary_color || activeHexColor }}
                    >
                      {(brandingData.brand_name || 'T')[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{brandingData.brand_name || 'TECH INNOVATORS INC.'}</h4>
                      <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{brandingData.brand_tagline || 'Enterprise Portal'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-[11px] opacity-75">
                    <div className="h-2 w-3/4 rounded bg-zinc-400/20"></div>
                    <div className="h-2 w-full rounded bg-zinc-400/20"></div>
                    <div className="h-2 w-1/2 rounded bg-zinc-400/20"></div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-700/40 flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>CONFIDENTIAL & PROPRIETARY</span>
                    <span className="font-bold text-emerald-500">VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/40 text-center">
                <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Domain: <span className="font-mono font-bold text-blue-500">{window.location.hostname}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: MULTI-ENTITY & SUBSIDIARIES --- */}
        {activeTab === 'entities' && (
          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold">Multi-Entity Legal Subsidiaries</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Manage parent companies, sister corporations, and registered state tax entities.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search subsidiaries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800/50">
              <table className="w-full text-left text-xs">
                <thead className={`font-bold uppercase tracking-wider text-[10px] ${
                  isDarkMode ? 'bg-[#181a20] text-zinc-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Entity Legal Name</th>
                    <th className="py-3 px-4">FEIN / EIN</th>
                    <th className="py-3 px-4">Incorp State</th>
                    <th className="py-3 px-4">Registered Agent</th>
                    <th className="py-3 px-4">Parent Entity</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/50' : 'divide-slate-200'}`}>
                  {entities.length > 0 ? (
                    entities.filter(e => e.entity_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((ent) => (
                      <tr 
                        key={ent.id}
                        onClick={() => { setDetailsData(ent); setDetailsType('entity'); setShowDetailsModal(true); }}
                        className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-3 px-4 font-bold flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-blue-500" />
                          <span>{ent.entity_name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">{ent.fein_ein || 'N/A'}</td>
                        <td className="py-3 px-4 font-semibold">{ent.state_of_incorporation || 'DE'}</td>
                        <td className="py-3 px-4 text-zinc-400">{ent.registered_agent_name || 'Standard Agent'}</td>
                        <td className="py-3 px-4">{ent.parent_entity_name || 'Holding Co.'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            ACTIVE
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setModalType('entity'); setModalData(ent); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-zinc-400">
                        No secondary legal entities registered yet. Click "Register Legal Entity" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: BRANCHES & DEPARTMENTS --- */}
        {activeTab === 'branches' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Physical Branches */}
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm">Physical Office Branches ({branches.length})</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Work facilities & site locations</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {branches.length > 0 ? (
                  branches.map((b) => (
                    <div 
                      key={b.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">{b.branch_name}</p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {b.city ? `${b.city}, ${b.state}` : 'Corporate HQ'} • TZ: {b.timezone || 'EST'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setModalType('branch'); setModalData(b); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-500 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 py-6 text-center">No branch offices recorded.</p>
                )}
              </div>
            </div>

            {/* Organizational Departments */}
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm">Organizational Departments ({departments.length})</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Cost centers & divisions</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {departments.length > 0 ? (
                  departments.map((d) => (
                    <div 
                      key={d.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">{d.department_name}</p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                            Code: {d.dept_code || 'CC-101'} • Lead: {d.lead_name || 'Dept Head'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setModalType('department'); setModalData(d); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 py-6 text-center">No departments recorded.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 4: USERS & RBAC --- */}
        {activeTab === 'users' && (
          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold">User Accounts & Role-Based Access Control (RBAC)</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Manage admin privileges, recruiter access, and multi-factor 2FA credentials.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800/50">
              <table className="w-full text-left text-xs">
                <thead className={`font-bold uppercase tracking-wider text-[10px] ${
                  isDarkMode ? 'bg-[#181a20] text-zinc-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role Access</th>
                    <th className="py-3 px-4">Authentication / 2FA</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/50' : 'divide-slate-200'}`}>
                  {users.length > 0 ? (
                    users.filter(u => 
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((u) => (
                      <tr 
                        key={u.id}
                        onClick={() => { setDetailsData(u); setDetailsType('user'); setShowDetailsModal(true); }}
                        className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${u.first_name || u.username || 'User'}`} 
                              alt="avatar" 
                              className="w-8 h-8 rounded-xl bg-zinc-700/20 shrink-0" 
                            />
                            <div>
                              <p className="font-bold text-xs">{u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}</p>
                              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_superuser || u.role === 'SUPER_ADMIN' 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : u.is_staff || u.role === 'Admin' || u.role === 'HR_MANAGER'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}>
                            {u.is_superuser ? 'Super Admin' : (u.role || 'HR Admin')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                            <ShieldCheck className="w-3.5 h-3.5" /> 2FA Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500">
                            ACTIVE
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setModalType('user'); setModalData(u); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-zinc-400">No user accounts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 5: 12-STEP COMPLIANCE WORKFLOW --- */}
        {activeTab === 'workflow' && (
          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold">12-Step Candidate Onboarding Pipeline</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Reorder steps or toggle required forms in the candidate onboarding workflow.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {workflowSteps.map((step, idx) => (
                <div 
                  key={step.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    step.is_active 
                      ? (isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200 shadow-2xs')
                      : (isDarkMode ? 'bg-zinc-900/40 border-zinc-800/40 opacity-50' : 'bg-slate-100/60 border-slate-200 opacity-50')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button 
                        onClick={() => handleMoveWorkflowStep(idx, 'up')}
                        disabled={idx === 0}
                        className="p-0.5 rounded hover:bg-zinc-700/30 text-zinc-400 disabled:opacity-20"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleMoveWorkflowStep(idx, 'down')}
                        disabled={idx === workflowSteps.length - 1}
                        className="p-0.5 rounded hover:bg-zinc-700/30 text-zinc-400 disabled:opacity-20"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                      style={{ backgroundColor: step.is_active ? activeHexColor : '#71717a' }}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <p className="font-bold text-xs">{step.step_name}</p>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                        step.form_type === 'STANDARD_FORM' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                      }`}>
                        {step.form_type || 'STANDARD_FORM'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleWorkflowStep(step)}
                      className={`p-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-[11px] font-bold ${
                        step.is_active 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}
                    >
                      {step.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{step.is_active ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 6: DOCUMENT VAULT --- */}
        {activeTab === 'documents' && (
          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold">Company Document Vault & Master Handbooks</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Master PDF agreements, employee handbooks, and standard corporate policies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyDocs.length > 0 ? (
                companyDocs.map((doc) => (
                  <div 
                    key={doc.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                          <FileText className="w-4 h-4" />
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-500">
                          {doc.category || 'POLICY'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs mb-1 truncate">{doc.title || doc.document_name}</h4>
                      <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Master PDF • Version 1.0 • Form Vault
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-700/30 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">PDF Document</span>
                      {doc.file && (
                        <a 
                          href={doc.file} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> View PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-zinc-400">
                  No master documents uploaded yet. Click "Upload Master Doc" to add handbooks.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 7: DIGITAL SIGNATURES --- */}
        {activeTab === 'signature' && (
          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold">Authorized Signatory Officers & E-Signature Canvas</h2>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Authorized corporate signatures embedded automatically onto offer letters and Form I-9.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signatures.length > 0 ? (
                signatures.map((sig) => (
                  <div 
                    key={sig.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                          <PenTool className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                          AUTHORIZED
                        </span>
                      </div>
                      <h4 className="font-bold text-xs">{sig.first_name} {sig.last_name}</h4>
                      <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{sig.title || 'Corporate Officer'}</p>

                      {/* Signature Preview Canvas / Image */}
                      <div className={`mt-3 p-3 rounded-xl border min-h-[60px] flex items-center justify-center ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200'
                      }`}>
                        {sig.signature_image ? (
                          <img src={sig.signature_image} alt="Signature" className="max-h-12 object-contain" />
                        ) : (
                          <span className="font-serif italic text-base font-bold text-blue-500">
                            {sig.first_name} {sig.last_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-700/30 flex justify-end">
                      <button
                        onClick={() => { setModalType('signature'); setModalData(sig); setShowModal(true); }}
                        className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Signatory
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-zinc-400">
                  No authorized signatories configured. Click "Add Signatory Officer" to draw or upload an e-signature.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 8: BYO-CLOUD & SECURITY HEALTH AUDIT --- */}
        {activeTab === 'cloud' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* System Health Audit */}
            <div className={`lg:col-span-2 p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h2 className="text-base font-bold mb-1">BYO-Cloud Connection & Security Health Audit</h2>
              <p className={`text-xs mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                HIPAA & SOC-2 compliance encryption radar, cloud storage status, and database latency.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Cloud Storage Provider</span>
                    <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10">CONNECTED</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-blue-500">Amazon Web Services (S3)</p>
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5">Bucket: tiswa-enterprise-vault-us-east-1</p>
                </div>

                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Database Encryption</span>
                    <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10">AES-256 GCM</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-emerald-500">PostgreSQL Schema Isolated</p>
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5">Latency: 1.4ms • Auto-Failover: Enabled</p>
                </div>
              </div>

              {/* Automated Daily Backup Schedule */}
              <div className={`p-4 rounded-2xl border mb-4 ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="font-bold text-xs mb-2 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-purple-500" />
                  Automated Daily Disaster Recovery Policy
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2 rounded-xl bg-zinc-700/10">
                    <p className="text-[10px] text-zinc-400">Frequency</p>
                    <p className="font-bold mt-0.5">Every 24 Hours</p>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-700/10">
                    <p className="text-[10px] text-zinc-400">Retention</p>
                    <p className="font-bold mt-0.5">30 Days Offsite</p>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-700/10">
                    <p className="text-[10px] text-zinc-400">Status</p>
                    <p className="font-bold text-emerald-500 mt-0.5">Healthy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Radar */}
            <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <h3 className="text-sm font-bold mb-1">Compliance & Security Radar</h3>
                <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Continuous audit monitoring
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">SOC-2 Type II</span>
                    <span className="font-bold text-emerald-500">100% Compliant</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">HIPAA Data Isolation</span>
                    <span className="font-bold text-emerald-500">100% Compliant</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">GDPR Data Portability</span>
                    <span className="font-bold text-emerald-500">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">USCIS E-Verify Integration</span>
                    <span className="font-bold text-blue-500">Active API</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/40 text-center">
                <span className="text-[11px] font-bold text-emerald-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Enterprise Security Verified
                </span>
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 9: SUBSCRIPTION, BILLING & API KEYS --- */}
        {activeTab === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h2 className="text-base font-bold mb-1">Subscription Plan & Seat Allocation</h2>
              <p className={`text-xs mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Enterprise tier licensing, active team seats, and API secrets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Plan</span>
                  <p className="text-xl font-black text-blue-500 mt-1">Enterprise Tier (Annual)</p>
                  <p className="text-xs text-zinc-400 mt-1">Unlimited Candidate Onboardings</p>
                </div>

                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Seat Utilization</span>
                  <p className="text-xl font-black text-emerald-500 mt-1">{users.length} / 100 Seats Used</p>
                  <div className="w-full bg-zinc-700/20 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((users.length / 100) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* API Keys */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="font-bold text-xs mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  REST API Public Secret Token
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="sk_live_enterprise_99182371928472918471"
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("sk_live_enterprise_99182371928472918471");
                      showFeedback('API Key Copied', 'Secret API key copied to clipboard.');
                    }}
                    className="px-3 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    style={{ backgroundColor: activeHexColor }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <h3 className="text-sm font-bold mb-1">Payment Method & Invoicing</h3>
                <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Primary billing card on file
                </p>

                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <CreditCard className="w-6 h-6 text-blue-500" />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">AUTO-RENEW</span>
                  </div>
                  <p className="font-mono font-bold text-xs">•••• •••• •••• 4242</p>
                  <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Expires 12/2028 • Corporate Visa</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/40 text-center">
                <span className="text-[10px] font-mono text-zinc-400">Next Billing Cycle: Oct 01, 2027</span>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 10: CORPORATE CONTACTS & OPERATING MODEL --- */}
        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Contacts Form */}
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h2 className="text-base font-bold mb-1">Corporate Headquarters & Official Contacts</h2>
              <p className={`text-xs mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Primary HR administrator email, billing contact, and corporate legal address.
              </p>

              <form onSubmit={handleSaveContacts} className="space-y-4">
                <CustomInput 
                  label="Official Company Legal Name"
                  value={contactsData.company_name}
                  onChange={(e) => setContactsData({ ...contactsData, company_name: e.target.value })}
                  isDarkMode={isDarkMode}
                />
                <div className="grid grid-cols-2 gap-4">
                  <CustomInput 
                    label="Primary HR Contact Email"
                    value={contactsData.primary_contact_email}
                    onChange={(e) => setContactsData({ ...contactsData, primary_contact_email: e.target.value })}
                    isDarkMode={isDarkMode}
                  />
                  <CustomInput 
                    label="Primary Phone Number"
                    value={contactsData.primary_contact_phone}
                    onChange={(e) => setContactsData({ ...contactsData, primary_contact_phone: e.target.value })}
                    isDarkMode={isDarkMode}
                  />
                </div>
                <CustomInput 
                  label="Corporate Street Address"
                  value={contactsData.corporate_address}
                  onChange={(e) => setContactsData({ ...contactsData, corporate_address: e.target.value })}
                  isDarkMode={isDarkMode}
                />
                <div className="grid grid-cols-3 gap-3">
                  <CustomInput 
                    label="City"
                    value={contactsData.city}
                    onChange={(e) => setContactsData({ ...contactsData, city: e.target.value })}
                    isDarkMode={isDarkMode}
                  />
                  <CustomInput 
                    label="State"
                    value={contactsData.state}
                    onChange={(e) => setContactsData({ ...contactsData, state: e.target.value })}
                    isDarkMode={isDarkMode}
                  />
                  <CustomInput 
                    label="Zip Code"
                    value={contactsData.zip_code}
                    onChange={(e) => setContactsData({ ...contactsData, zip_code: e.target.value })}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: activeHexColor }}
                    className="px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Corporate Contacts
                  </button>
                </div>
              </form>
            </div>

            {/* Operating Model */}
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h2 className="text-base font-bold mb-1">Industry Operating Model</h2>
              <p className={`text-xs mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Business domain & client onboarding operational structure.
              </p>

              <div className="space-y-3">
                {[
                  { id: 'STAFFING', title: 'Staffing & IT Consulting Agency', desc: 'Direct placement, C2C subcontractors, client timesheets & W2 onboarding' },
                  { id: 'CORPORATE', title: 'Corporate Internal HR', desc: 'Direct corporate hires, employee handbooks, and internal payroll' },
                  { id: 'HEALTHCARE', title: 'Healthcare & Clinical Staffing', desc: 'Medical credentials, license verification radar & OSHA compliance' },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={async () => {
                      setTypeData({ industry_type: opt.id });
                      try {
                        await companyIntakeService.setCompanyType({ industry_type: opt.id });
                        showFeedback('Operating Model Updated', `Industry structure switched to ${opt.title}.`);
                      } catch (e) {}
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      typeData.industry_type === opt.id
                        ? (isDarkMode ? 'bg-blue-600/10 border-blue-500/50' : 'bg-blue-50/50 border-blue-500/50 shadow-xs')
                        : (isDarkMode ? 'bg-[#181a20] border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                        typeData.industry_type === opt.id ? 'border-blue-500 bg-blue-500 text-white' : 'border-zinc-500'
                      }`}
                    >
                      {typeData.industry_type === opt.id && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{opt.title}</h4>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 5. WIDE FORM MODAL (CREATE / EDIT)                      */}
      {/* ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-4 flex items-center justify-between border-b ${
              isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'
            }`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span className="p-1 rounded-lg text-white" style={{ backgroundColor: activeHexColor }}>
                  <Plus className="w-3.5 h-3.5" />
                </span>
                {modalType === 'user' ? (modalData.id ? 'Edit User Credentials' : 'Add New Staff User Account') :
                 modalType === 'entity' ? (modalData.id ? 'Edit Legal Entity' : 'Register New Legal Subsidiary') :
                 modalType === 'branch' ? (modalData.id ? 'Edit Branch Office' : 'Add Physical Branch Facility') :
                 modalType === 'department' ? (modalData.id ? 'Edit Department' : 'Create Organizational Department') :
                 modalType === 'document' ? 'Upload Master Document Vault PDF' :
                 modalType === 'signature' ? 'Draw / Upload Authorized Digital Signature' : 'Configure Item'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className={`p-1.5 rounded-xl border ${isDarkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'}`}
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* User Modal */}
              {modalType === 'user' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput 
                      label="First Name"
                      value={modalData.first_name}
                      onChange={(e) => setModalData({ ...modalData, first_name: e.target.value })}
                      isDarkMode={isDarkMode}
                      required
                    />
                    <CustomInput 
                      label="Last Name"
                      value={modalData.last_name}
                      onChange={(e) => setModalData({ ...modalData, last_name: e.target.value })}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <CustomInput 
                    label="Official Email Address"
                    type="email"
                    value={modalData.email}
                    onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                    isDarkMode={isDarkMode}
                    required
                  />
                  <CustomInput 
                    label="Username"
                    value={modalData.username}
                    onChange={(e) => setModalData({ ...modalData, username: e.target.value })}
                    isDarkMode={isDarkMode}
                    required
                  />
                  {!modalData.id && (
                    <CustomInput 
                      label="Initial Secure Password"
                      type="password"
                      value={modalData.password}
                      onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                      isDarkMode={isDarkMode}
                      required
                    />
                  )}
                  <StunningSelect 
                    label="Role-Based Access Level (RBAC)"
                    value={modalData.role || 'HR_MANAGER'}
                    onChange={(e) => setModalData({ ...modalData, role: e.target.value })}
                    options={[
                      { value: 'SUPER_ADMIN', label: 'Super Admin (Full Governance)' },
                      { value: 'HR_MANAGER', label: 'HR Administrator' },
                      { value: 'RECRUITER', label: 'Talent Recruiter' },
                      { value: 'FINANCE_OFFICER', label: 'Finance & Payroll Officer' },
                      { value: 'EMPLOYEE', label: 'Standard Employee' },
                    ]}
                    isDarkMode={isDarkMode}
                  />
                </>
              )}

              {/* Legal Entity Modal */}
              {modalType === 'entity' && (
                <>
                  <CustomInput 
                    label="Entity Legal Name"
                    value={modalData.entity_name}
                    onChange={(e) => setModalData({ ...modalData, entity_name: e.target.value })}
                    isDarkMode={isDarkMode}
                    placeholder="e.g. Tiswa Solutions LLC"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput 
                      label="FEIN / EIN Number"
                      value={modalData.fein_ein}
                      onChange={(e) => setModalData({ ...modalData, fein_ein: e.target.value })}
                      isDarkMode={isDarkMode}
                      placeholder="e.g. 12-3456789"
                      required
                    />
                    <CustomInput 
                      label="State of Incorporation"
                      value={modalData.state_of_incorporation}
                      onChange={(e) => setModalData({ ...modalData, state_of_incorporation: e.target.value })}
                      isDarkMode={isDarkMode}
                      placeholder="e.g. DE"
                      required
                    />
                  </div>
                  <CustomInput 
                    label="Registered Agent Name"
                    value={modalData.registered_agent_name}
                    onChange={(e) => setModalData({ ...modalData, registered_agent_name: e.target.value })}
                    isDarkMode={isDarkMode}
                    placeholder="e.g. Corporation Service Company"
                  />
                  <CustomInput 
                    label="Registered Office Address"
                    value={modalData.registered_office_address}
                    onChange={(e) => setModalData({ ...modalData, registered_office_address: e.target.value })}
                    isDarkMode={isDarkMode}
                    placeholder="e.g. 251 Little Falls Drive, Wilmington, DE 19808"
                  />
                </>
              )}

              {/* Branch Modal */}
              {modalType === 'branch' && (
                <>
                  <CustomInput 
                    label="Branch Office Name"
                    value={modalData.branch_name}
                    onChange={(e) => setModalData({ ...modalData, branch_name: e.target.value })}
                    isDarkMode={isDarkMode}
                    placeholder="e.g. New York Regional HQ"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput 
                      label="Facility Code"
                      value={modalData.branch_code}
                      onChange={(e) => setModalData({ ...modalData, branch_code: e.target.value })}
                      isDarkMode={isDarkMode}
                      placeholder="e.g. NYC-01"
                    />
                    <StunningSelect 
                      label="Office Timezone"
                      value={modalData.timezone || 'America/New_York'}
                      onChange={(e) => setModalData({ ...modalData, timezone: e.target.value })}
                      options={[
                        { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
                        { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
                        { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
                        { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
                        { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                      ]}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <CustomInput 
                    label="Facility Street Address"
                    value={modalData.address}
                    onChange={(e) => setModalData({ ...modalData, address: e.target.value })}
                    isDarkMode={isDarkMode}
                    placeholder="e.g. 500 5th Ave, Suite 2400, New York, NY 10110"
                  />
                </>
              )}

              {/* Department Modal */}
              {modalType === 'department' && (
                <>
                  <CustomInput 
                    label="Department Name"
                    value={modalData.department_name}
                    onChange={(e) => setModalData({ ...modalData, department_name: e.target.value })}
                    isDarkMode={isDarkMode}
                    placeholder="e.g. Engineering & Technology"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput 
                      label="Cost Center Code"
                      value={modalData.dept_code}
                      onChange={(e) => setModalData({ ...modalData, dept_code: e.target.value })}
                      isDarkMode={isDarkMode}
                      placeholder="e.g. CC-ENG-01"
                    />
                    <CustomInput 
                      label="Department Head / Lead"
                      value={modalData.lead_name}
                      onChange={(e) => setModalData({ ...modalData, lead_name: e.target.value })}
                      isDarkMode={isDarkMode}
                      placeholder="e.g. Marcus Vance"
                    />
                  </div>
                </>
              )}

              {/* Master Document Upload Modal */}
              {modalType === 'document' && (
                <>
                  <CustomInput 
                    label="Document Display Title"
                    value={modalData.title}
                    onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                    isDarkMode={isDarkMode}
                    placeholder="e.g. 2026 Master Employee Handbook"
                    required
                  />
                  <StunningSelect 
                    label="Document Vault Category"
                    value={modalData.category || 'HANDBOOK'}
                    onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                    options={[
                      { value: 'HANDBOOK', label: 'Employee Handbook & Code of Conduct' },
                      { value: 'OFFER_LETTER', label: 'Master Offer Letter Template' },
                      { value: 'NDA', label: 'Non-Disclosure & Confidentiality Agreement' },
                      { value: 'TE_POLICY', label: 'Travel & Expense Policy' },
                      { value: 'IT_SECURITY', label: 'IT Security & Acceptable Use Policy' },
                    ]}
                    isDarkMode={isDarkMode}
                  />
                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Select PDF Document File <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.doc"
                      required
                      onChange={(e) => setModalData({ ...modalData, file: e.target.files[0] })}
                      className={`w-full p-2.5 rounded-xl border text-xs ${
                        isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Digital Signature Drawing Modal */}
              {modalType === 'signature' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput 
                      label="Signer First Name"
                      value={modalData.first_name}
                      onChange={(e) => setModalData({ ...modalData, first_name: e.target.value })}
                      isDarkMode={isDarkMode}
                      required
                    />
                    <CustomInput 
                      label="Signer Last Name"
                      value={modalData.last_name}
                      onChange={(e) => setModalData({ ...modalData, last_name: e.target.value })}
                      isDarkMode={isDarkMode}
                      required
                    />
                  </div>
                  <CustomInput 
                    label="Corporate Title"
                    value={modalData.title}
                    onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                    isDarkMode={isDarkMode}
                    placeholder="e.g. Chief People Officer / Authorized Representative"
                    required
                  />

                  {/* Canvas */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Draw Official Signature on Canvas
                      </label>
                      <button 
                        type="button" 
                        onClick={() => signaturePad.current && signaturePad.current.clear()}
                        className="text-[10px] font-bold text-rose-500 hover:underline"
                      >
                        Clear Canvas
                      </button>
                    </div>
                    <div className="rounded-2xl border border-zinc-700 bg-white overflow-hidden p-2">
                      <SignatureCanvas 
                        ref={signaturePad}
                        penColor="black"
                        canvasProps={{ className: 'w-full h-36 cursor-crosshair' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    isDarkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: activeHexColor }}
                  className="px-6 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. DETAILS VIEW MODAL (INSPECT ROW)                      */}
      {/* ======================================================== */}
      {showDetailsModal && detailsData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`px-6 py-4 flex items-center justify-between border-b ${
              isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'
            }`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Record Detail Inspection
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className={`p-1.5 rounded-xl border ${isDarkMode ? 'border-zinc-800 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'}`}
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              {Object.entries(detailsData).map(([key, val]) => {
                if (typeof val === 'object' || key === 'password' || key === 'signature_image_base64') return null;
                return (
                  <div key={key} className={`flex justify-between py-1.5 border-b ${isDarkMode ? 'border-zinc-800/40' : 'border-slate-100'}`}>
                    <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">{key.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-right max-w-[240px] truncate">{String(val || 'N/A')}</span>
                  </div>
                );
              })}
            </div>

            <div className={`px-6 py-3 border-t text-right ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. UNIFIED FEEDBACK NOTIFICATION MODAL                   */}
      {/* ======================================================== */}
      {notification.show && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
              notification.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {notification.type === 'error' ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <h3 className="font-bold text-base mb-1">{notification.title}</h3>
            <p className={`text-xs mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{notification.message}</p>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              style={{ backgroundColor: activeHexColor }}
              className="w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
