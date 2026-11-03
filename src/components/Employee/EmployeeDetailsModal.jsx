import React, { useState } from 'react';
import api from '../../services/api';
import {
  User,
  Briefcase,
  Landmark,
  FileCheck2,
  ShieldCheck,
  Users,
  FileText,
  X,
  Eye,
  EyeOff,
  Download,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  ExternalLink,
  DollarSign,
  CreditCard,
  ShieldAlert,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';

// Helper to ensure full backend URL for media PDFs
const formatPdfUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  const { hostname, protocol } = window.location;
  let backendOrigin = `${protocol}//${hostname}:8000`;
  if (hostname.includes('obs.tiswatech.com')) {
    backendOrigin = `https://${hostname.replace('obs.tiswatech.com', 'secureobs.tiswatech.com')}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (hostname !== parsed.hostname && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || hostname.endsWith('.lvh.me') || hostname.includes('.nip.io'))) {
        return `${protocol}//${hostname}:8000${parsed.pathname}${parsed.search}`;
      }
    } catch (e) {}
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendOrigin}${cleanPath}`;
};

// Helper to deduplicate employee documents and eliminate redundant copies of canonical forms
const getUniqueDocuments = (docs) => {
  const rawDocs = Array.isArray(docs) ? docs : [];
  const seen = new Set();
  const result = [];

  const normalizeDocKey = (doc) => {
    const name = (doc.title || doc.name || '').trim().toLowerCase();
    const fileUrl = (doc.file_url || doc.url || '').split('?')[0].toLowerCase();
    const basename = fileUrl ? fileUrl.split('/').pop() : '';

    // Supporting uploaded files (passport, license, voided check, specific attachments) stay distinct
    if (name.includes('passport') || basename.includes('passport')) return `doc_passport_${basename || name}`;
    if (name.includes('license') || basename.includes('license')) return `doc_license_${basename || name}`;
    if (name.includes('void') || basename.includes('void')) return `doc_void_${basename || name}`;
    if (name.includes('exemption') || basename.includes('exemption')) return `doc_exemption_${basename || name}`;

    // Canonical government compliance forms collapsed to single best record
    if (name.includes('federal') || name.includes('w4') || name.includes('w-4')) {
      return 'canonical_federal_w4';
    }
    if ((name.includes('state') || name.includes('de4') || name.includes('g4')) && (name.includes('tax') || name.includes('withholding') || name.includes('certificate'))) {
      return 'canonical_state_w4';
    }
    if (name.includes('form i-9') || name.includes('form i9') || name.includes('uscis form i-9') || name.includes('employment eligibility')) {
      return 'canonical_i9';
    }

    // Default dedupe by filename or name
    if (basename) return `file_${basename}`;
    return `name_${name}`;
  };

  // Sort to prioritize documents with real URLs and signed indicators
  const prioritized = [...rawDocs].sort((a, b) => {
    const aScore = (a.file_url || a.url ? 2 : 0) + ((a.title || a.name || '').toLowerCase().includes('signed') ? 1 : 0);
    const bScore = (b.file_url || b.url ? 2 : 0) + ((b.title || b.name || '').toLowerCase().includes('signed') ? 1 : 0);
    return bScore - aScore;
  });

  for (const doc of prioritized) {
    const key = normalizeDocKey(doc);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(doc);
    }
  }

  return result;
};

export default function EmployeeDetailsModal({ isOpen, onClose, employee, onEdit }) {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const [activeTab, setActiveTab] = useState('personal');
  const [showMaskedSSN, setShowMaskedSSN] = useState(false);
  const [showMaskedBank, setShowMaskedBank] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState(null);

  if (!isOpen || !employee) return null;

  // Extract nested or synthesized data
  const personal = employee.personal_info || {};
  const tax = employee.tax_info || {};
  const i9 = employee.i9_info || {};
  const banking = employee.banking_info || {};
  const emergencyList = Array.isArray(employee.emergency_contacts) ? employee.emergency_contacts : [];
  const documentsList = Array.isArray(employee.documents) ? employee.documents : [];
  const clientDetails = employee.client_details || {};

  // Resolved Tax & I-9 PDF URLs with multi-tier fallback
  const fedW4Url = tax.federal_w4_url || documentsList.find(d => {
    const n = (d.title || d.name || '').toLowerCase();
    return (n.includes('w4') || n.includes('w-4') || n.includes('federal')) && !n.includes('california') && !n.includes('georgia') && !n.includes('washington') && !n.includes('state');
  })?.file_url;

  const stateW4Url = tax.state_w4_url || documentsList.find(d => {
    const n = (d.title || d.name || '').toLowerCase();
    return n.includes('state') || n.includes('california') || n.includes('georgia') || n.includes('washington') || n.includes('g4') || n.includes('de4');
  })?.file_url;

  const resolvedI9Url = i9.i9_pdf_url || documentsList.find(d => {
    const n = (d.title || d.name || '').toLowerCase();
    return n.includes('i9') || n.includes('i-9') || n.includes('passport');
  })?.file_url;

  // Formatted values
  const fullName = employee.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Employee';
  const email = employee.email || employee.user_email || personal.email || 'N/A';
  const phone = employee.phone_number || personal.phone_number || personal.phone_no || 'N/A';
  const dob = employee.dob || personal.dob || 'N/A';
  const jobTitle = employee.job_title || personal.job_title || 'Specialist';
  const department = employee.department || 'Engineering';
  const workLocation = employee.work_location || personal.state || 'N/A';
  const joinedDate = employee.joined_at || employee.date_of_joining;

  // Address
  const street = personal.street_address || '';
  const apt = personal.apartment_unit ? `, ${personal.apartment_unit}` : '';
  const city = personal.city || '';
  const state = personal.state || workLocation;
  const zip = personal.zip_code || '';
  const fullAddress = [street + apt, city, state, zip].filter(Boolean).join(', ') || 'Address not on file';

  // Bank values
  const bankName = banking.bank_name || 'Direct Deposit';
  const rawAccountNum = banking.account_number || '';
  const last4Account = banking.account_last4 || (rawAccountNum ? rawAccountNum.slice(-4) : '••••');
  const maskedAccount = showMaskedBank && rawAccountNum ? rawAccountNum : (rawAccountNum ? `••••••••${last4Account}` : `•••• ${last4Account}`);
  const routingNum = banking.routing_number || (banking.routing_last4 ? `••••${banking.routing_last4}` : 'N/A');
  const accountType = banking.account_type || 'Checking';
  const depositPct = banking.deposit_percentage || 100;
  const accountHolder = banking.account_holder || fullName;

  // SSN Masking
  const rawSSN = personal.ssn || '';
  const maskedSSN = personal.ssn_masked || (rawSSN ? `***-**-${rawSSN.slice(-4)}` : '***-**-****');
  const displayedSSN = showMaskedSSN && rawSSN ? rawSSN : maskedSSN;

  // Deduplicate documents using pure helper (no hook order issues)
  const uniqueDocumentsList = getUniqueDocuments(employee?.documents);

  // Tabs definition
  const tabs = [
    { id: 'personal', label: 'Personal & Contact', icon: User },
    { id: 'job', label: 'Job & Placement', icon: Briefcase },
    { id: 'bank', label: 'Direct Deposit', icon: Landmark },
    { id: 'tax', label: 'Tax & W-4', icon: FileCheck2 },
    { id: 'i9', label: 'USCIS Form I-9', icon: ShieldCheck },
    { id: 'emergency', label: 'Emergency Contacts', icon: Users, badge: emergencyList.length },
    { id: 'documents', label: 'Documents & PDFs', icon: FileText, badge: uniqueDocumentsList.length },
  ];

  // Unified PDF Preview Handler with Blob fetch to prevent iframe blocking
  const handleOpenPdfPreview = async (url, title) => {
    const fullUrl = formatPdfUrl(url);
    if (!fullUrl) return;
    setPreviewPdfTitle(title || 'Document Preview');
    setPreviewPdfUrl(fullUrl);
    setPreviewLoading(true);

    try {
      // 1. Fetch through Axios client (handles CORS, auth token, and multi-tenant origins)
      const res = await api.get(fullUrl, { responseType: 'blob' });
      const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(pdfBlob);
      setPreviewBlobUrl(objectUrl);
    } catch (err) {
      console.warn('Axios PDF fetch error, attempting native fetch fallback:', err);
      try {
        const token = localStorage.getItem('access');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const fetchRes = await fetch(fullUrl, { headers });
        if (fetchRes.ok) {
          const blob = await fetchRes.blob();
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(pdfBlob);
          setPreviewBlobUrl(objectUrl);
          return;
        }
      } catch (e) {}
      setPreviewBlobUrl(fullUrl);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePdfPreview = () => {
    if (previewBlobUrl && previewBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewPdfUrl(null);
  };

  // Helper for triggering reliable binary blob download
  const handleDownloadPdf = async (url, filename = 'document.pdf', docId = null) => {
    const targetUrl = formatPdfUrl(url) || previewBlobUrl || previewPdfUrl;
    if (!targetUrl) return;

    if (docId !== null && docId !== undefined) setDownloadingDocId(docId);

    const sanitizeFilename = (name) => {
      let clean = (name || 'document.pdf').trim().replace(/[/\\?%*:|"<>]/g, '_');
      if (!clean.toLowerCase().endsWith('.pdf') && !clean.includes('.')) {
        clean += '.pdf';
      }
      return clean;
    };
    const finalFilename = sanitizeFilename(filename);

    try {
      // 1. If already a local blob URL, download instantly
      if (targetUrl.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      // 2. Fetch binary stream via Axios
      const res = await api.get(targetUrl, { responseType: 'blob' });
      const localBlobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = localBlobUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(localBlobUrl), 10000);
    } catch (err) {
      console.warn('Axios PDF download failed, falling back to direct link:', err);
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = finalFilename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      if (docId !== null && docId !== undefined) setDownloadingDocId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1520px] h-[92vh] max-h-[95vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors duration-150 ${
          isDarkMode ? 'bg-[#12141a] border-zinc-800/80 text-zinc-100 shadow-2xl shadow-black/80' : 'bg-white border-slate-100/90 text-slate-800 shadow-2xl'
        }`}
      >
        {/* HEADER */}
        <div
          className={`px-6 py-5 border-b shrink-0 flex items-center justify-between ${
            isDarkMode ? 'border-zinc-800/80 bg-[#161820]' : 'border-slate-100 bg-white/70 backdrop-blur-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-lg uppercase shadow-sm shrink-0"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor, border: `1px solid ${activeHexColor}40` }}
            >
              {(employee.first_name || 'E')[0]}{(employee.last_name || '')[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold truncate">{fullName}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    employee.employment_status === 'ACTIVE' || employee.is_active
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                  }`}
                >
                  {employee.employment_status || 'Active'}
                </span>
                {employee.onboarding_details && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Onboarded
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                {jobTitle} • {department} • ID #{employee.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(employee)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all shadow-sm"
                style={{ backgroundColor: activeHexColor }}
              >
                Edit Employee
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDarkMode
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="Close Dossier"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TABS SEGMENT */}
        <div
          className={`px-6 py-2.5 border-b shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5 ${
            isDarkMode ? 'border-zinc-800/80 bg-[#14161f]' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={isActive ? { backgroundColor: activeHexColor, color: '#ffffff' } : {}}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'shadow-md ring-2 ring-offset-1 ring-blue-500/30'
                    : isDarkMode
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/25 text-white' : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* TAB 1: PERSONAL & CONTACT */}
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Primary Personal Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                }`}>
                  <User size={16} style={{ color: activeHexColor }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Identity & Contact Info</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Full Legal Name</span>
                    <span className="font-semibold">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Work / Primary Email</span>
                    <span className="font-semibold flex items-center gap-1.5 truncate">
                      <Mail size={13} className="text-blue-500 shrink-0" />
                      <a href={`mailto:${email}`} className="hover:underline truncate">{email}</a>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Phone Number</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-500 shrink-0" />
                      <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Date of Birth</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      <Calendar size={13} className="text-amber-500 shrink-0" />
                      {dob}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Gender</span>
                    <span className="font-semibold capitalize">{personal.gender || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Social Security Number (SSN)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold tracking-wider">{displayedSSN}</span>
                      {rawSSN && (
                        <button
                          type="button"
                          onClick={() => setShowMaskedSSN(!showMaskedSSN)}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
                          title={showMaskedSSN ? 'Hide SSN' : 'Reveal SSN'}
                        >
                          {showMaskedSSN ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Address Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                }`}>
                  <MapPin size={16} className="text-rose-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Primary Residential Address</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-[11px] text-zinc-400 block mb-1">Street Address</span>
                    <span className="font-semibold">{street || 'N/A'}{apt}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">City</span>
                    <span className="font-semibold">{city || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">State & Zip Code</span>
                    <span className="font-semibold">{state} {zip}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB & PLACEMENT */}
          {activeTab === 'job' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                }`}>
                  <Briefcase size={16} style={{ color: activeHexColor }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Employment & Organizational Placement</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Official Job Title</span>
                    <span className="font-bold text-sm">{jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Department</span>
                    <span className="font-semibold">{department}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Work Location / Jurisdiction</span>
                    <span className="font-semibold">{workLocation}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Employment Type</span>
                    <span className="font-semibold capitalize">{employee.employment_type || 'Full Time (W-2)'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Joined Date</span>
                    <span className="font-semibold">
                      {joinedDate ? new Date(joinedDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Compensation / Rate</span>
                    <span className="font-mono font-bold text-emerald-500">
                      {(employee.salary || employee.hourly_rate)
                        ? `$${Number(employee.salary || employee.hourly_rate).toLocaleString()} ${employee.hourly_rate ? '/ hr' : '/ yr'}`
                        : 'Standard Rate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Assignment Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                }`}>
                  <Building size={16} className="text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Client Placement & Account</h3>
                </div>

                {employee.current_client || clientDetails.client_name ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Assigned Client</span>
                      <h4 className="font-bold text-base mt-0.5">{clientDetails.client_name || 'Designated Client Partner'}</h4>
                      {clientDetails.email && (
                        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                          <Mail size={12} /> {clientDetails.email}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 self-start sm:self-auto">
                      Billable On-Site Placement
                    </span>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border text-xs ${
                    isDarkMode ? 'border-zinc-800/70 text-zinc-400 bg-zinc-900/30' : 'border-slate-100 text-slate-500 bg-slate-50/50'
                  }`}>
                    Direct Corporate / Internal Staff (No external client placement assigned)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT DEPOSIT / BANKING */}
          {activeTab === 'bank' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <Landmark size={16} className="text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Primary Direct Deposit Account</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {depositPct}% Net Pay Allocation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Financial Institution</span>
                    <span className={`font-bold text-sm flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
                      <CreditCard size={14} className="text-blue-500 shrink-0" />
                      {bankName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Account Holder Name</span>
                    <span className="font-semibold">{accountHolder}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Account Classification</span>
                    <span className="font-semibold uppercase">{accountType}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Routing Transit Number (ABA)</span>
                    <span className="font-mono font-bold tracking-wider">{routingNum}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold tracking-wider">{maskedAccount}</span>
                      {rawAccountNum && (
                        <button
                          type="button"
                          onClick={() => setShowMaskedBank(!showMaskedBank)}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
                          title={showMaskedBank ? 'Mask account' : 'Reveal account'}
                        >
                          {showMaskedBank ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Deposit Verification</span>
                    <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                      <CheckCircle size={13} /> Electronic Transfer Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Bank Accounts if present */}
              {Array.isArray(banking.accounts) && banking.accounts.length > 1 && (
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Split Deposit Accounts</h4>
                  <div className="space-y-2">
                    {banking.accounts.slice(1).map((acc, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          isDarkMode ? 'bg-[#12141a] border-zinc-800/70' : 'bg-slate-50/80 border-slate-100'
                        }`}
                      >
                        <div>
                          <span className="font-bold">{acc.bank_name || 'Secondary Account'}</span>
                          <span className="text-zinc-400 block text-[11px]">
                            {acc.account_type || 'Checking'} • Routing: {acc.routing_number || '••••'}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-500">{acc.deposit_percentage || 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TAX & W-4 */}
          {activeTab === 'tax' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Federal W-4 Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b gap-2 ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={16} className="text-blue-500" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider">Federal Form W-4 Withholding Certificate</h3>
                      <p className="text-[10px] text-zinc-400">IRS Form W-4 compliance parameters</p>
                    </div>
                  </div>
                  {fedW4Url && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPdfPreview(fedW4Url, 'IRS Form W-4 (Federal)')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDarkMode
                            ? 'border border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                            : 'border border-blue-200/80 text-blue-600 hover:bg-blue-50 bg-blue-50/50 shadow-2xs'
                        }`}
                        title="Preview Federal Form W-4"
                      >
                        <Eye size={13} /> View Federal W-4
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(fedW4Url, `${fullName}_Federal_W4.pdf`, 'fed_w4')}
                        disabled={downloadingDocId === 'fed_w4'}
                        className="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                        title="Download Federal Form W-4"
                      >
                        {downloadingDocId === 'fed_w4' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Federal Filing Status</span>
                    <span className="font-bold text-sm uppercase text-blue-400">
                      {(tax.filing_status || 'SINGLE').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Claim Dependents Deduction</span>
                    <span className="font-mono font-bold">${Number(tax.tax_deductions || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Withholding Allowances / Exemptions</span>
                    <span className="font-mono font-semibold">{tax.tax_exemptions || 0}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">State Withholding Jurisdiction</span>
                    <span className="font-bold uppercase">{tax.state_tax || workLocation}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Electronic Signature Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                      <CheckCircle size={13} /> Certified & Signed Digitally
                    </span>
                  </div>
                </div>
              </div>

              {/* State Tax Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b gap-2 ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-500" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        State Tax Withholding Certificate ({tax.state_tax || workLocation || 'State'})
                      </h3>
                      <p className="text-[10px] text-zinc-400">State Department of Revenue Withholding Form</p>
                    </div>
                  </div>
                  {stateW4Url && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPdfPreview(stateW4Url, `${tax.state_tax || workLocation} State Tax Form`)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDarkMode
                            ? 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            : 'border border-emerald-200/80 text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50 shadow-2xs'
                        }`}
                        title="Preview State Tax Form"
                      >
                        <Eye size={13} /> View State Tax Form
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(stateW4Url, `${fullName}_${tax.state_tax || workLocation}_State_Tax.pdf`, 'state_w4')}
                        disabled={downloadingDocId === 'state_w4'}
                        className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                        title="Download State Tax PDF"
                      >
                        {downloadingDocId === 'state_w4' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">State Jurisdiction</span>
                    <span className="font-bold text-sm uppercase text-emerald-400">
                      {tax.state_tax || workLocation || 'CA'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Allowances / Exemptions</span>
                    <span className="font-mono font-semibold">{tax.tax_exemptions || 0}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">State Additional Withholding</span>
                    <span className="font-mono font-semibold">$0</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Compliance Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                      <CheckCircle size={13} /> Certified & Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USCIS FORM I-9 */}
          {activeTab === 'i9' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#161822] border-zinc-800/70' : 'bg-white border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className={`flex items-center justify-between mb-4 pb-3 border-b ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">USCIS Form I-9 Employment Eligibility</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      i9.is_i9_completed || i9.form_i9_status === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    {i9.is_i9_completed || i9.form_i9_status === 'VERIFIED' ? 'Verified & Sealed' : 'Section 2 Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Citizenship / Work Authorization</span>
                    <span className="font-bold text-emerald-500 uppercase">
                      {(i9.citizenship_status || 'CITIZEN').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">USCIS # / Alien Registration</span>
                    <span className="font-mono font-semibold">{i9.alien_registration_number || 'N/A (U.S. Citizen)'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Section 1 Employee Attestation</span>
                    <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                      <CheckCircle size={13} /> Completed & Signed
                    </span>
                  </div>
                </div>

                {(i9.i9_pdf_url || resolvedI9Url) && (
                  <div className={`mt-5 pt-4 border-t flex items-center justify-between ${
                    isDarkMode ? 'border-zinc-800/60' : 'border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-purple-500" />
                      <span className="text-xs font-semibold">USCIS Form I-9 Verification Document</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPdfPreview(i9.i9_pdf_url || resolvedI9Url, 'USCIS Form I-9')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDarkMode
                            ? 'border border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                            : 'border border-purple-200/80 text-purple-600 hover:bg-purple-50 bg-purple-50/50 shadow-2xs'
                        }`}
                      >
                        <Eye size={13} /> View Form I-9
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(i9.i9_pdf_url || resolvedI9Url, `${fullName}_Form_I9.pdf`, 'i9')}
                        disabled={downloadingDocId === 'i9'}
                        className="p-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {downloadingDocId === 'i9' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: EMERGENCY CONTACTS */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {emergencyList.length === 0 ? (
                <div
                  className={`p-8 rounded-2xl border text-center text-xs ${
                    isDarkMode ? 'bg-[#161822] border-zinc-800/70 text-zinc-400' : 'bg-white border-slate-100 text-slate-500 shadow-xs'
                  }`}
                >
                  <Users size={28} className="mx-auto mb-2 opacity-40 text-blue-500" />
                  <p className="font-semibold">No emergency contacts registered.</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Emergency contacts provided during onboarding will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {emergencyList.map((contact, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDarkMode ? 'bg-[#161822] border-zinc-800/70 hover:border-zinc-700/80' : 'bg-white border-slate-100 hover:border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm">{contact.name || 'Emergency Contact'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                          {contact.relationship || 'Contact'}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-zinc-300">
                        {contact.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-emerald-500 shrink-0" />
                            <a href={`tel:${contact.phone_number}`} className="hover:underline font-semibold">
                              {contact.phone_number}
                            </a>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-blue-500 shrink-0" />
                            <a href={`mailto:${contact.email}`} className="hover:underline truncate">
                              {contact.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: DOCUMENTS & PDFS */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {uniqueDocumentsList.length === 0 ? (
                <div
                  className={`p-8 rounded-2xl border text-center text-xs ${
                    isDarkMode ? 'bg-[#161822] border-zinc-800/70 text-zinc-400' : 'bg-white border-slate-100 text-slate-500 shadow-xs'
                  }`}
                >
                  <FileText size={28} className="mx-auto mb-2 opacity-40 text-blue-500" />
                  <p className="font-semibold">No attached documents found.</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Onboarding signed PDFs, tax forms, and company policies will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {uniqueDocumentsList.map((doc, idx) => {
                    const docTitle = doc.title || doc.name || `Document #${idx + 1}`;
                    const docUrl = doc.file_url || doc.url || (
                      (docTitle.toLowerCase().includes('w4') || docTitle.toLowerCase().includes('w-4') || docTitle.toLowerCase().includes('federal'))
                        ? fedW4Url
                        : (docTitle.toLowerCase().includes('i9') || docTitle.toLowerCase().includes('i-9') || docTitle.toLowerCase().includes('passport'))
                        ? resolvedI9Url
                        : (docTitle.toLowerCase().includes('state') || docTitle.toLowerCase().includes('g4') || docTitle.toLowerCase().includes('de4'))
                        ? stateW4Url
                        : null
                    );
                    const category = doc.category || 'DOCUMENT';
                    return (
                      <div
                        key={idx}
                        className={`group p-4 sm:p-4.5 rounded-2xl border flex items-center justify-between gap-3 transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-[#161822]/90 hover:bg-[#1a1d2b] border-zinc-800/70 hover:border-zinc-700/80 shadow-sm hover:shadow-md'
                            : 'bg-white hover:bg-slate-50/70 border-slate-100/90 hover:border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.06)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className={`font-semibold text-xs sm:text-[13px] truncate transition-colors ${
                              isDarkMode ? 'text-zinc-100 group-hover:text-white' : 'text-slate-800 group-hover:text-blue-950'
                            }`}>
                              {docTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                isDarkMode ? 'text-zinc-500' : 'text-slate-400'
                              }`}>
                                {category}
                              </span>
                              <span className={`text-[10px] font-semibold ${
                                docUrl ? 'text-emerald-500' : 'text-amber-500'
                              }`}>
                                • {docUrl ? 'Verified & Ready' : 'Processing'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {docUrl && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenPdfPreview(docUrl, docTitle)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                isDarkMode
                                  ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50'
                                  : 'bg-slate-100/90 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200/60 hover:border-blue-200/80 shadow-2xs'
                              }`}
                              title="Preview Document"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(docUrl, `${fullName}_${docTitle.replace(/\s+/g, '_')}.pdf`, idx)}
                              disabled={downloadingDocId === idx}
                              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow disabled:opacity-50"
                              title="Download PDF"
                            >
                              {downloadingDocId === idx ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className={`px-6 py-4 border-t shrink-0 flex items-center justify-between ${
            isDarkMode ? 'border-zinc-800/80 bg-[#161820]' : 'border-slate-100 bg-slate-50/60'
          }`}
        >
          <span className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
            Employee ID #{employee.id} • Converted from Candidate Onboarding
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700/60'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60 shadow-2xs'
            }`}
          >
            Close 
          </button>
        </div>
      </div>

      {/* PDF PREVIEW MODAL (BIG & WIDE) */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1520px] h-[94vh] rounded-3xl border border-white/10 bg-zinc-900 flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/5">
            <div className="px-6 py-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-[#13151b] shrink-0">
              <div className="flex items-center gap-2.5 truncate pr-3">
                <FileText size={18} className="text-blue-500 shrink-0" />
                <h3 className="text-sm font-bold text-zinc-100 truncate">{previewPdfTitle || 'Document Preview'}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewBlobUrl || previewPdfUrl, previewPdfTitle)}
                  className="px-3.5 py-1.5 rounded-xl text-xs bg-blue-600 text-white font-semibold hover:bg-blue-500 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
                <a
                  href={previewBlobUrl || previewPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  type="button"
                  onClick={handleClosePdfPreview}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-zinc-950 relative overflow-hidden">
              {previewLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-400">
                  <Loader2 size={36} className="animate-spin text-blue-500" />
                  <span className="text-xs font-semibold">Loading official PDF document...</span>
                </div>
              ) : (
                <iframe
                  src={`${previewBlobUrl || previewPdfUrl}#toolbar=1&navpanes=0`}
                  title={previewPdfTitle || "Document Preview"}
                  className="w-full h-full border-none"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
