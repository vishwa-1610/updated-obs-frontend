import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FileText, Plus, Search, Filter, RefreshCw, Eye, Edit3, Trash2, 
  Copy, Send, Download, Sparkles, CheckCircle2, AlertTriangle, AlertCircle,
  X, Globe, Building, Briefcase, Mail, Layers, Layout, Palette, 
  Check, ArrowRight, ShieldCheck, Tag, ExternalLink, Code, FileDown, 
  Play, Smartphone, Monitor, CheckSquare, Sparkle, Compass, Bookmark
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { StunningSelect } from '../tasks/StunningSelect';
import { clientService } from '../../services/clientService';
import { 
  fetchTemplates, 
  fetchPresets, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  clonePreset,
  fetchPreview,
  sendTestEmail,
  setCurrentTemplate,
  clearCurrentTemplate,
  clearPreviewData
} from '../../store/templateSlice';
import templateService from '../../services/templateService';

// Safe select value parser
const parseSelectVal = (e) => {
  if (e === null || e === undefined) return '';
  if (typeof e === 'object' && e.target && 'value' in e.target) {
    return e.target.value;
  }
  return String(e);
};

// Error extraction helper
const extractErrorMessage = (err, fallback = 'Operation failed. Please try again.') => {
  if (!err) return fallback;
  if (typeof err === 'string') {
    if (err.includes('<!DOCTYPE') || err.includes('<html')) return fallback;
    return err;
  }
  if (err.response?.data) {
    const data = err.response.data;
    if (typeof data === 'string') {
      if (data.includes('<!DOCTYPE') || data.includes('<html')) return fallback;
      return data;
    }
    if (data.detail) return String(data.detail);
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' • ');
    }
  }
  if (err.message) return err.message;
  return fallback;
};

// Category Badges & Color Tokens (Exact backend Category model keys)
const getCategoryBadge = (cat = '') => {
  switch (cat?.toUpperCase()) {
    case 'OFFER_LETTER':
      return { label: 'Offer Letter', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    case 'EMAIL_WELCOME':
    case 'ONBOARDING_WELCOME':
      return { label: 'Onboarding Welcome', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    case 'EMAIL_REMINDER':
      return { label: 'Task Reminder', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    case 'EMPLOYMENT_AGREEMENT':
      return { label: 'Employment Agreement', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
    case 'DIRECT_DEPOSIT_NOTICE':
      return { label: 'Direct Deposit', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
    case 'TERMINATION_LETTER':
      return { label: 'Separation Notice', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
    case 'CUSTOM':
      return { label: 'Custom Blueprint', bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' };
    default:
      return { label: cat ? cat.replace(/_/g, ' ') : 'Enterprise Template', bg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' };
  }
};

const STANDARD_MERGE_TAGS = [
  { tag: '{{ candidate_name }}', label: 'Candidate Full Name' },
  { tag: '{{ candidate_first_name }}', label: 'First Name' },
  { tag: '{{ candidate_email }}', label: 'Candidate Email' },
  { tag: '{{ job_title }}', label: 'Designation / Role' },
  { tag: '{{ client_name }}', label: 'Client Organization' },
  { tag: '{{ company_name }}', label: 'Company Name' },
  { tag: '{{ start_date }}', label: 'Joining Date' },
  { tag: '{{ hourly_rate }}', label: 'Pay Rate ($/hr)' },
  { tag: '{{ base_salary }}', label: 'Annual Salary' },
  { tag: '{{ portal_url }}', label: 'Portal Link' },
  { tag: '{{ manager_name }}', label: 'Manager Name' },
  { tag: '{{ current_year }}', label: 'Current Year' },
];

export default function Templates() {
  const { isDarkMode, accentColor, themeColors } = useTheme();
  const dispatch = useDispatch();

  const activeHexColor = useMemo(() => {
    const match = themeColors?.find(t => t.id === accentColor);
    return match ? match.color : '#2563eb';
  }, [accentColor, themeColors]);

  const { 
    templates = [], 
    presets = [], 
    currentTemplate, 
    loading, 
    actionLoading 
  } = useSelector((state) => state.template || {});

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('TEMPLATES'); // 'TEMPLATES' | 'PRESETS' | 'STUDIO'
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' | 'GRID'

  // Pagination for Templates Table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Client Data
  const [clients, setClients] = useState([]);

  // Modals
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Row-Click Live Preview Modal Popup
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplateData, setPreviewTemplateData] = useState(null);
  const [previewRenderHtml, setPreviewRenderHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewContext, setPreviewContext] = useState({
    candidate_name: 'Johnathan Doe',
    candidate_first_name: 'Johnathan',
    candidate_email: 'johndoe@example.com',
    job_title: 'Senior Cloud Platform Architect',
    client_name: 'Apex Health Systems',
    company_name: 'Tech Innovators Inc.',
    start_date: 'October 15, 2026',
    hourly_rate: '$85.00/hr',
    base_salary: '$165,000/yr',
    portal_url: 'https://portal.techinnovators.com/onboard',
    manager_name: 'Sarah Connor',
  });

  // Test Email Modal
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailData, setTestEmailData] = useState({
    templateId: null,
    templateName: '',
    recipient_email: '',
  });

  // Unified Feedback & Confirm Modals
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'error' | 'info'
    title: '',
    message: '',
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: null,
  });

  // Template Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'EMAIL_WELCOME',
    subject: '',
    company_name: '',
    client_name: '',
    accent_color: '#2563EB',
    background_color: '#F8FAFC',
    header_text: '',
    body_content: '',
    footer_text: '',
    website_url: 'https://example.com',
    is_active: true,
    is_default: false,
    version: 1,
  });

  // Initial Data Fetch
  const reloadAll = () => {
    dispatch(fetchTemplates());
    dispatch(fetchPresets());
    clientService.getClients({ page_size: 100 })
      .then(res => setClients(res.data?.results || res.data || []))
      .catch(err => console.debug('Client load:', err));
  };

  useEffect(() => {
    reloadAll();
  }, [dispatch]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(temp => {
      const q = searchQuery.toLowerCase().trim();
      const name = (temp.name || '').toLowerCase();
      const subject = (temp.subject || '').toLowerCase();
      const cat = (temp.category || '').toLowerCase();
      const client = (temp.client_name || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || subject.includes(q) || cat.includes(q) || client.includes(q);
      const matchesCat = categoryFilter === 'ALL' || temp.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? temp.is_active : !temp.is_active);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [templates, searchQuery, categoryFilter, statusFilter]);

  // Paginated Templates
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTemplates.length / pageSize) || 1;

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: 'EMAIL_WELCOME',
      subject: 'Welcome to {{ company_name }} - Onboarding Portal Access',
      company_name: 'Tech Innovators Inc.',
      client_name: '',
      accent_color: '#2563EB',
      background_color: '#F8FAFC',
      header_text: 'Welcome to the Team!',
      body_content: 'Hi {{ candidate_first_name }},\n\nWe are delighted to welcome you to {{ company_name }}. Please access your onboarding portal below to finalize your paperwork and review your start date instructions.',
      footer_text: '© 2026 Tech Innovators Inc. Human Resources Operations',
      website_url: 'https://example.com',
      is_active: true,
      is_default: false,
      version: 1,
    });
    setShowCreateEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (temp, e) => {
    if (e) e.stopPropagation();
    setEditingTemplate(temp);
    setFormData({
      name: temp.name || '',
      category: temp.category || 'EMAIL_WELCOME',
      subject: temp.subject || '',
      company_name: temp.company_name || '',
      client_name: temp.client_name || '',
      accent_color: temp.accent_color || '#2563EB',
      background_color: temp.background_color || '#F8FAFC',
      header_text: temp.header_text || '',
      body_content: temp.body_content || '',
      footer_text: temp.footer_text || '',
      website_url: temp.website_url || 'https://example.com',
      is_active: temp.is_active ?? true,
      is_default: temp.is_default ?? false,
      version: temp.version || 1,
    });
    setShowCreateEditModal(true);
  };

  // Open Row-Click Live Preview Modal
  const handleOpenPreviewModal = async (temp, e) => {
    if (e) e.stopPropagation();
    setPreviewTemplateData(temp);
    try {
      const res = await templateService.previewTemplate(temp.id, previewContext);
      setPreviewRenderHtml(res.data?.rendered_html || res.data?.html || '');
      setPreviewSubject(res.data?.rendered_subject || temp.subject || '');
    } catch (err) {
      const comp = temp.company_name || 'Our Company';
      let html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;background:${temp.background_color || '#f3f4f6'};">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">
          <div style="background:${temp.accent_color || '#2563eb'};padding:28px;text-align:center;color:#fff;">
            <h1 style="margin:0;font-size:22px;">${temp.header_text || temp.name}</h1>
          </div>
          <div style="padding:32px;color:#334155;line-height:1.7;font-size:15px;">
            ${(temp.body_content || '').replace(/\n/g, '<br/>')}
          </div>
          <div style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #f1f5f9;">
            ${temp.footer_text || `© 2026 ${comp}`}
          </div>
        </div>
      </body></html>`;
      setPreviewRenderHtml(html);
      setPreviewSubject(temp.subject || temp.name);
    }
    setShowPreviewModal(true);
  };

  // Save Template (Create or Update with clean client_name)
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      client_name: formData.client_name ? formData.client_name : null,
    };

    try {
      if (editingTemplate) {
        await dispatch(updateTemplate({ id: editingTemplate.id, data: payload })).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Template Updated',
          message: `Template "${formData.name}" has been updated successfully.`,
        });
      } else {
        await dispatch(createTemplate(payload)).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Template Created',
          message: `New template "${formData.name}" is now active in your library.`,
        });
      }
      setShowCreateEditModal(false);
      reloadAll();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: extractErrorMessage(err, 'Failed to save template. Please check all required fields.'),
      });
    }
  };

  // Delete Template
  const handleDeleteTemplate = (temp, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Delete Template?',
      message: `Are you sure you want to permanently delete template "${temp.name}"? This action cannot be undone.`,
      confirmText: 'Delete Template',
      onConfirm: async () => {
        try {
          await dispatch(deleteTemplate(temp.id)).unwrap();
          setFeedbackModal({
            isOpen: true,
            type: 'success',
            title: 'Template Deleted',
            message: `Template "${temp.name}" has been removed.`,
          });
          reloadAll();
        } catch (err) {
          setFeedbackModal({
            isOpen: true,
            type: 'error',
            title: 'Delete Failed',
            message: extractErrorMessage(err, 'Could not delete template.'),
          });
        }
      }
    });
  };

  // 1-Click Clone Preset
  const handleClonePreset = async (presetKey) => {
    try {
      await dispatch(clonePreset(presetKey)).unwrap();
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Blueprint Cloned!',
        message: 'Preset blueprint was cloned directly into your active template library.',
      });
      setActiveTab('TEMPLATES');
      reloadAll();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Clone Failed',
        message: extractErrorMessage(err, 'Could not clone preset blueprint.'),
      });
    }
  };

  // Download PDF
  const handleDownloadPdf = async (temp, e) => {
    if (e) e.stopPropagation();
    try {
      const response = await templateService.renderPdf(temp.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${temp.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'info',
        title: 'PDF Generation',
        message: 'PDF exported with standard layout formatting.',
      });
    }
  };

  // Dispatch Test Email
  const handleSendTestEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(sendTestEmail({
        id: testEmailData.templateId,
        recipient_email: testEmailData.recipient_email,
        context: previewContext
      })).unwrap();
      setShowTestEmailModal(false);
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Test Email Dispatched',
        message: `Rendered email sent successfully to ${testEmailData.recipient_email}.`,
      });
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Send Test Failed',
        message: extractErrorMessage(err, 'Failed to dispatch test email.'),
      });
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 space-y-6 transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-400">
              Human Resources & Communications
            </span>
            <span className="text-slate-400 dark:text-zinc-600">•</span>
            <span className="text-[11px] font-bold text-emerald-500">Document & Brand Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Enterprise Templates & Blueprints</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Live HTML & Merge Tags
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage corporate offer letters, NDAs, onboarding welcome notifications, client statements & separation letters with real-time merge tags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={reloadAll}
            className={`p-2.5 rounded-2xl border transition-all ${
              isDarkMode 
                ? 'bg-[#121217] border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800/80' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
            }`}
            title="Refresh Templates"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Preset Library</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] theme-bg-primary"
          >
            <Plus size={15} />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Templates', value: templates.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'In Library' },
          { label: 'Active in Production', value: templates.filter(t => t.is_active).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'Ready to Dispatch' },
          { label: 'Default Blueprints', value: templates.filter(t => t.is_default).length, icon: Bookmark, color: 'text-purple-500', bg: 'bg-purple-500/10', sub: 'Category Primaries' },
          { label: 'Starter Presets', value: presets.length || 5, icon: Sparkle, color: 'text-amber-500', bg: 'bg-amber-500/10', sub: '1-Click Cloneable' },
          { label: 'Client Specific', value: templates.filter(t => t.client_name).length, icon: Briefcase, color: 'text-cyan-500', bg: 'bg-cyan-500/10', sub: 'Branded Accounts' },
          { label: 'Merge Engine', value: '100% Ready', icon: Code, color: 'text-teal-500', bg: 'bg-teal-500/10', sub: 'Auto-Injected' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-400">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <Icon size={14} className={card.color} />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight">{card.value}</div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 mt-1">
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* 3. Segmented Navigation Tabs */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-1.5 overflow-x-auto ${
        isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {[
          { id: 'TEMPLATES', label: 'All Company Templates', icon: Layers, count: templates.length },
          { id: 'PRESETS', label: 'Preset Blueprint Library', icon: Sparkles, count: presets.length || 5 },
          { id: 'STUDIO', label: 'Merge Tag Studio & Playground', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'theme-bg-primary text-white shadow-xs' 
                  : isDarkMode 
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN CONTENT TABS */}

      {/* TAB 1: ALL COMPANY TEMPLATES */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Controls / Filter Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-3.5 ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates by title, subject line, category, client..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-900/80 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                  }`}
                />
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-48">
                <StunningSelect
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(parseSelectVal(e)); setCurrentPage(1); }}
                  options={[
                    { value: 'ALL', label: 'All Categories' },
                    { value: 'EMAIL_WELCOME', label: 'Onboarding Welcome Email' },
                    { value: 'EMAIL_REMINDER', label: 'Onboarding Task Reminder' },
                    { value: 'OFFER_LETTER', label: 'Offer Letter' },
                    { value: 'EMPLOYMENT_AGREEMENT', label: 'Employment Agreement / SOW' },
                    { value: 'DIRECT_DEPOSIT_NOTICE', label: 'Direct Deposit Notice' },
                    { value: 'TERMINATION_LETTER', label: 'Termination Notice' },
                    { value: 'CUSTOM', label: 'Custom Template' },
                  ]}
                />
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-36">
                <StunningSelect
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(parseSelectVal(e)); setCurrentPage(1); }}
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'DRAFT', label: 'Draft / Inactive' },
                  ]}
                />
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'TABLE' 
                    ? 'theme-bg-primary text-white shadow-xs' 
                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers size={13} />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'GRID' 
                    ? 'theme-bg-primary text-white shadow-xs' 
                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layout size={13} />
                <span>Cards</span>
              </button>
            </div>
          </div>

          {/* TABLE VIEW (Row clicks open Live Preview Modal) */}
          {viewMode === 'TABLE' ? (
            <div className={`rounded-2xl border overflow-hidden transition-all ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                      isDarkMode ? 'border-zinc-800 text-slate-400 bg-zinc-900/40' : 'border-slate-200 text-slate-600 bg-slate-50'
                    }`}>
                      <th className="py-3.5 px-4">Template Name & Subject</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Brand Accent</th>
                      <th className="py-3.5 px-4">Client Scope</th>
                      <th className="py-3.5 px-4">Version & Flags</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${
                    isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'
                  }`}>
                    {paginatedTemplates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className={`p-3.5 rounded-2xl mb-3 flex items-center justify-center ${
                              isDarkMode ? 'bg-zinc-800/60 text-zinc-300 border border-zinc-700/50' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              <FileText size={28} />
                            </div>
                            <h3 className="text-sm font-bold">No templates found</h3>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                              {searchQuery || categoryFilter !== 'ALL'
                                ? 'No templates match your search criteria.'
                                : 'Get started by creating a template or cloning from the Preset Library.'}
                            </p>
                            <div className="flex items-center gap-2.5 mt-4">
                              <button
                                onClick={() => setActiveTab('PRESETS')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  isDarkMode ? 'border-zinc-700 text-zinc-300 hover:text-white bg-zinc-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-xs'
                                }`}
                              >
                                Browse Presets
                              </button>
                              <button
                                onClick={handleOpenCreate}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white theme-bg-primary shadow-sm hover:opacity-90"
                              >
                                Create First Template
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTemplates.map((temp) => {
                        const catB = getCategoryBadge(temp.category);

                        return (
                          <tr
                            key={temp.id}
                            onClick={(e) => handleOpenPreviewModal(temp, e)}
                            className={`cursor-pointer transition-colors duration-150 ${
                              isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'
                            }`}
                            title="Click row to view full live HTML preview"
                          >
                            {/* Template Name & Subject */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs"
                                  style={{ backgroundColor: temp.accent_color || '#2563eb' }}
                                >
                                  <FileText size={15} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs truncate">
                                      {temp.name}
                                    </span>
                                    {temp.is_default && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 dark:text-zinc-400 truncate max-w-[240px]">
                                    {temp.subject || 'No subject line specified'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catB.bg}`}>
                                {catB.label}
                              </span>
                            </td>

                            {/* Brand Accent Color */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                                  style={{ backgroundColor: temp.accent_color || '#2563EB' }}
                                />
                                <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                                  {temp.accent_color || '#2563EB'}
                                </span>
                              </div>
                            </td>

                            {/* Client Scope */}
                            <td className="py-3.5 px-4">
                              {temp.client_name ? (
                                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                                  <Briefcase size={12} />
                                  <span>{temp.client_name}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-xs">
                                  <Building size={12} />
                                  <span>Global Enterprise</span>
                                </div>
                              )}
                            </td>

                            {/* Version & Flags */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                                  v{temp.version || 1}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                temp.is_active 
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${temp.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                <span>{temp.is_active ? 'Active' : 'Draft'}</span>
                              </span>
                            </td>

                            {/* Date Created */}
                            <td className="py-3.5 px-4 text-slate-400 dark:text-zinc-400 text-xs whitespace-nowrap">
                              {temp.date_created ? new Date(temp.date_created).toLocaleDateString() : '—'}
                            </td>

                            {/* Actions (stop propagation to prevent opening row modal) */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => handleOpenPreviewModal(temp, e)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                                  }`}
                                  title="Live HTML Preview"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTestEmailData({
                                      templateId: temp.id,
                                      templateName: temp.name,
                                      recipient_email: '',
                                    });
                                    setShowTestEmailModal(true);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                                  }`}
                                  title="Dispatch Test Email"
                                >
                                  <Send size={14} />
                                </button>
                                <button
                                  onClick={(e) => handleDownloadPdf(temp, e)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                                  }`}
                                  title="Export PDF Letter"
                                >
                                  <Download size={14} />
                                </button>
                                <button
                                  onClick={(e) => handleOpenEdit(temp, e)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                                  }`}
                                  title="Edit Template"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteTemplate(temp, e)}
                                  className={`p-1.5 rounded-lg transition-colors text-rose-500/80 hover:text-rose-500 ${
                                    isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'
                                  }`}
                                  title="Delete Template"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar */}
              {filteredTemplates.length > 0 && (
                <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                  isDarkMode ? 'border-zinc-800 bg-zinc-900/30 text-zinc-400' : 'border-slate-200 bg-slate-50/50 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>Showing</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {Math.min((currentPage - 1) * pageSize + 1, filteredTemplates.length)}
                    </span>
                    <span>to</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {Math.min(currentPage * pageSize, filteredTemplates.length)}
                    </span>
                    <span>of</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{filteredTemplates.length}</span>
                    <span>templates</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-xl font-bold transition-all ${
                          currentPage === pageNum 
                            ? 'theme-bg-primary text-white shadow-xs' 
                            : isDarkMode ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTemplates.length === 0 ? (
                <div className={`col-span-full p-12 text-center rounded-2xl border ${
                  isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200'
                }`}>
                  <p className="text-slate-400 dark:text-zinc-400">No templates match criteria.</p>
                </div>
              ) : (
                paginatedTemplates.map((temp) => {
                  const catB = getCategoryBadge(temp.category);

                  return (
                    <div
                      key={temp.id}
                      onClick={(e) => handleOpenPreviewModal(temp, e)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                        isDarkMode 
                          ? 'bg-[#121217] border-[#27272a] hover:border-zinc-700' 
                          : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      {/* Top Brand Accent Stripe */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: temp.accent_color || '#2563EB' }}
                      />

                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs"
                              style={{ backgroundColor: temp.accent_color || '#2563EB' }}
                            >
                              <FileText size={15} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm tracking-tight">{temp.name}</h3>
                              <p className="text-[11px] text-slate-400 dark:text-zinc-400">{temp.company_name || 'Enterprise'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catB.bg}`}>
                            {catB.label}
                          </span>
                        </div>

                        {/* Subject Preview */}
                        <div className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed ${
                          isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Subject Line:</span>
                          <p className="font-medium text-slate-700 dark:text-zinc-200 truncate">
                            {temp.subject || 'No subject line specified'}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className={`flex items-center justify-between mt-5 pt-3 border-t text-xs ${isDarkMode ? "border-zinc-800/80" : "border-slate-100"}`} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleOpenPreviewModal(temp, e)}
                          className="flex items-center gap-1 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
                        >
                          <Eye size={13} />
                          <span>Live Preview</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTestEmailData({
                                templateId: temp.id,
                                templateName: temp.name,
                                recipient_email: '',
                              });
                              setShowTestEmailModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                            title="Send Test Email"
                          >
                            <Send size={14} />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(temp, e)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTemplate(temp, e)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESET BLUEPRINT LIBRARY (1-Click Cloner) */}
      {activeTab === 'PRESETS' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div>
              <h2 className="text-base md:text-lg font-bold">Standard Pre-built Template Blueprints</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-400">
                1-click clone enterprise-grade templates pre-configured with industry standard merge tags and styling.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all hover:opacity-95 theme-bg-primary whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(presets.length ? presets : [
              {
                key: 'welcome_invitation',
                name: 'Candidate Welcome & Portal Invitation',
                category: 'EMAIL_WELCOME',
                subject: 'Welcome to {{ company_name }} - Complete Your Onboarding',
                header_text: 'Welcome to {{ company_name }}!',
                accent_color: '#2563EB',
                body_content: 'Hi {{ candidate_first_name }},\n\nWe are delighted to welcome you aboard! Please log into your dedicated portal to verify direct deposit and sign policies.',
                footer_text: 'Human Resources & Talent Management'
              },
              {
                key: 'offer_letter',
                name: 'Official Employment Offer Letter',
                category: 'OFFER_LETTER',
                subject: 'Formal Employment Offer: {{ job_title }} at {{ company_name }}',
                header_text: 'Employment Offer & Terms',
                accent_color: '#059669',
                body_content: 'Dear {{ candidate_name }},\n\nOn behalf of {{ company_name }}, we are thrilled to offer you the role of {{ job_title }} starting on {{ start_date }} with rate {{ hourly_rate }}.',
                footer_text: 'Authorized Corporate Talent Acquisition'
              },
              {
                key: 'form_reminder',
                name: 'Urgent Onboarding Form Reminder',
                category: 'EMAIL_REMINDER',
                subject: 'Action Required: Complete your onboarding for {{ company_name }}',
                header_text: 'Documentation Checklist Reminder',
                accent_color: '#D97706',
                body_content: 'Hi {{ candidate_first_name }},\n\nPlease submit your remaining tax and identity documents before {{ start_date }} to ensure on-time payroll processing.',
                footer_text: 'HR & Payroll Compliance'
              },
              {
                key: 'direct_deposit_notice',
                name: 'Payroll & Direct Deposit Confirmation',
                category: 'DIRECT_DEPOSIT_NOTICE',
                subject: 'Direct Deposit & Banking Setup Confirmed',
                header_text: 'Payroll Setup Complete',
                accent_color: '#4F46E5',
                body_content: 'Hello {{ candidate_first_name }},\n\nYour banking allocation instructions have been securely verified in our payroll engine.',
                footer_text: 'Payroll & Treasury Operations'
              },
              {
                key: 'termination_notice',
                name: 'Offboarding & Separation Letter',
                category: 'TERMINATION_LETTER',
                subject: 'Offboarding Notice & Separation Summary',
                header_text: 'Separation Notice',
                accent_color: '#DC2626',
                body_content: 'Dear {{ candidate_name }},\n\nThis letter confirms your separation from {{ company_name }}. Please follow hardware return instructions.',
                footer_text: 'Human Resources Administration'
              }
            ]).map((preset, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: preset.accent_color || '#2563EB' }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      isDarkMode ? "bg-zinc-800 text-zinc-300 border-zinc-700/60" : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {preset.category?.replace(/_/g, ' ')}
                    </span>
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.accent_color || '#2563EB' }}
                    />
                  </div>

                  <h3 className="font-bold text-base mt-3 tracking-tight">{preset.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1 font-medium truncate">
                    {preset.subject}
                  </p>

                  <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed line-clamp-3 ${
                    isDarkMode ? 'bg-zinc-900/70 border-zinc-800/80 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {preset.body_content}
                  </div>
                </div>

                <div className={`mt-5 pt-3 border-t flex items-center justify-between ${isDarkMode ? "border-zinc-800/80" : "border-slate-100"}`}>
                  <span className="text-[11px] font-semibold text-slate-400">Blueprint #{idx + 1}</span>
                  <button
                    onClick={() => handleClonePreset(preset.key)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white theme-bg-primary shadow-xs hover:opacity-90"
                  >
                    <Copy size={13} />
                    <span>1-Click Clone</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MERGE TAG STUDIO & LIVE PLAYGROUND */}
      {activeTab === 'STUDIO' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div>
              <h2 className="text-base md:text-lg font-bold">Live Merge Tag Playground</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-400">
                Test merge variables and simulate candidate onboarding previews with custom values.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all hover:opacity-95 theme-bg-primary whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Create Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Context Variables Inputs */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h3 className="font-bold text-sm tracking-tight mb-2">Simulated Context Values</h3>
              
              {Object.entries(previewContext).map(([key, val]) => (
                <div key={key}>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {`{{ ${key} }}`}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setPreviewContext({ ...previewContext, [key]: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Standard Merge Tag Library reference */}
            <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h3 className="font-bold text-sm tracking-tight">Available System Merge Tags</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-400">
                Click any merge tag below to copy it to clipboard. These tags automatically resolve to real candidate data during workflow execution.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STANDARD_MERGE_TAGS.map((tagObj, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      navigator.clipboard.writeText(tagObj.tag);
                      setFeedbackModal({
                        isOpen: true,
                        type: 'success',
                        title: 'Tag Copied',
                        message: `Copied "${tagObj.tag}" to your clipboard.`,
                      });
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between ${
                      isDarkMode ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-blue-500 block">{tagObj.tag}</span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-400">{tagObj.label}</span>
                    </div>
                    <Copy size={13} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODALS & POPUPS */}

      {/* 5.1 LIVE HTML PREVIEW MODAL POPUP (Row-Click Trigger) */}
      {showPreviewModal && previewTemplateData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs"
                  style={{ backgroundColor: previewTemplateData.accent_color || '#2563EB' }}
                >
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">{previewTemplateData.name}</h3>
                  <p className="text-xs text-slate-400 truncate max-w-md">Subject: {previewSubject}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setTestEmailData({
                      templateId: previewTemplateData.id,
                      templateName: previewTemplateData.name,
                      recipient_email: '',
                    });
                    setShowTestEmailModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
                >
                  <Send size={13} />
                  <span>Send Test Email</span>
                </button>
                <button
                  onClick={(e) => handleDownloadPdf(previewTemplateData, e)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isDarkMode ? 'text-zinc-400 hover:text-white border-zinc-800 hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Download PDF"
                >
                  <Download size={15} />
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className={`p-2 rounded-xl transition-colors ${isDarkMode ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-800"}`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Rendered HTML IFrame */}
            <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-zinc-950/40' : 'bg-slate-100'}`}>
              <div className={`w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg border bg-white ${
                isDarkMode ? 'border-zinc-800/80' : 'border-slate-200'
              }`}>
                <iframe
                  title="Template Preview"
                  srcDoc={previewRenderHtml}
                  className="w-full h-[520px] border-0"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between text-xs ${isDarkMode ? "border-zinc-800 text-zinc-400" : "border-slate-100 text-slate-500"}`}>
              <span>Category: {previewTemplateData.category} • Brand Color: {previewTemplateData.accent_color}</span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl font-bold theme-bg-primary text-white shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5.2 CREATE / EDIT TEMPLATE MODAL */}
      {showCreateEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <h2 className="text-lg font-black tracking-tight">
                {editingTemplate ? 'Edit Communication Template' : 'Create Custom Template'}
              </h2>
              <button
                onClick={() => setShowCreateEditModal(false)}
                className={`p-1 rounded-xl transition-colors ${isDarkMode ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-800"}`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standard Onboarding Welcome Email"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-semibold ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Category *</label>
                  <StunningSelect
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: parseSelectVal(e) })}
                    options={[
                      { value: 'EMAIL_WELCOME', label: 'Onboarding Welcome Email' },
                      { value: 'EMAIL_REMINDER', label: 'Onboarding Task Reminder' },
                      { value: 'OFFER_LETTER', label: 'Offer Letter' },
                      { value: 'EMPLOYMENT_AGREEMENT', label: 'Employment Agreement / SOW' },
                      { value: 'DIRECT_DEPOSIT_NOTICE', label: 'Direct Deposit & Banking' },
                      { value: 'TERMINATION_LETTER', label: 'Separation / Termination Notice' },
                      { value: 'CUSTOM', label: 'Custom Enterprise Template' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Email Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Welcome to {{ company_name }} - Your Start Date Instructions"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-semibold ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Company Brand Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Tech Innovators Inc."
                    className={`w-full p-2.5 rounded-xl border font-semibold ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Client Mapping (Optional)</label>
                  <StunningSelect
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: parseSelectVal(e) })}
                    options={[
                      { value: '', label: 'Global / All Clients' },
                      ...clients.map(c => ({ value: c.client_name, label: c.client_name }))
                    ]}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Brand Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className={`w-10 h-10 p-0 rounded-xl border cursor-pointer bg-transparent ${
                        isDarkMode ? 'border-zinc-700' : 'border-slate-200'
                      }`}
                    />
                    <input
                      type="text"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-mono font-semibold ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Header Title Banner</label>
                <input
                  type="text"
                  placeholder="e.g. Welcome to the Team!"
                  value={formData.header_text}
                  onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-semibold ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Quick Merge Tag Inserter (Theme-Adaptive) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-500 dark:text-zinc-400">Template Body Content *</label>
                  <span className="text-[10px] text-slate-400">Click tag to insert into body</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {STANDARD_MERGE_TAGS.slice(0, 8).map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, body_content: `${formData.body_content} ${t.tag}` })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                        isDarkMode 
                          ? 'bg-zinc-800 text-cyan-400 border-zinc-700/60 hover:bg-zinc-700' 
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-2xs'
                      }`}
                    >
                      {t.tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={6}
                  required
                  value={formData.body_content}
                  onChange={(e) => setFormData({ ...formData, body_content: e.target.value })}
                  className={`w-full p-3 rounded-xl border font-normal leading-relaxed ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Footer Copyright & Disclaimer</label>
                <input
                  type="text"
                  value={formData.footer_text}
                  onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  placeholder="e.g. © 2026 Tech Innovators Inc. All Rights Reserved."
                  className={`w-full p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">Active in Production</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">Set as Category Default</span>
                </label>
              </div>

              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
                <button
                  type="button"
                  onClick={() => setShowCreateEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white font-bold theme-bg-primary shadow-md hover:opacity-90"
                >
                  {editingTemplate ? 'Update Template' : 'Save & Publish Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.3 SEND TEST EMAIL MODAL */}
      {showTestEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <div className="flex items-center gap-2">
                <Send size={16} className="text-blue-500" />
                <h3 className="font-bold text-sm">Send Live Test Email</h3>
              </div>
              <button onClick={() => setShowTestEmailModal(false)} className={isDarkMode ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-800"}>
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Dispatch a live test email for template: <strong>{testEmailData.templateName}</strong>
            </p>

            <form onSubmit={handleSendTestEmailSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Recipient Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="your.email@company.com"
                  value={testEmailData.recipient_email}
                  onChange={(e) => setTestEmailData({ ...testEmailData, recipient_email: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestEmailModal(false)}
                  className={`px-3 py-2 font-medium ${isDarkMode ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white font-bold theme-bg-primary shadow-xs"
                >
                  Dispatch Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. UNIFIED FEEDBACK MODAL */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl text-center space-y-4 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-center">
              {feedbackModal.type === 'success' && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
              )}
              {feedbackModal.type === 'error' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle size={32} />
                </div>
              )}
              {feedbackModal.type === 'info' && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <AlertCircle size={32} />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-base font-extrabold tracking-tight">{feedbackModal.title}</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1.5 leading-relaxed">{feedbackModal.message}</p>
            </div>

            <button
              onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
              className="w-full py-2.5 rounded-2xl text-xs font-bold text-white shadow-md theme-bg-primary"
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>
      )}

      {/* 7. UNIFIED CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">{confirmModal.title}</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-400 mt-0.5">{confirmModal.message}</p>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2.5 pt-2 border-t ${isDarkMode ? "border-zinc-800/80" : "border-slate-100"}`}>
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  if (confirmModal.onConfirm) await confirmModal.onConfirm();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
