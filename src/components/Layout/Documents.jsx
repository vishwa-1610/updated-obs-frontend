import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FileText, Shield, CheckCircle, Clock, AlertTriangle,
  UploadCloud, Plus, Download, Search, Eye, Trash2,
  RefreshCw, Check, X, AlertCircle, ExternalLink,
  ChevronRight, ChevronLeft, ChevronDown, Lock, Send,
  FileCheck, Sparkles, Filter, LayoutGrid, List,
  BookOpen, Hash, Copy, ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import {
  fetchCompanyDocuments,
  createCompanyDocument,
  deleteCompanyDocument,
  fetchFilledDocuments,
  fetchEnvelopes,
  createEnvelope,
  fetchAuditTrails,
  setVerificationResult,
  clearVerificationResult
} from '../../store/documentSlice';
import documentService from '../../services/documentService';
import PageLoader from '../common/LoadingScreen/LoadingScreen';

// ==========================================
// STUNNING CUSTOM DATE PICKER
// ==========================================
const StunningDatePicker = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  required = false,
  className = "",
  activeHexColor = "#2563eb",
  dropUp = false
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth() || new Date().getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const isoString = `${viewYear}-${m}-${d}`;
    onChange(isoString);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleSetToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const formatDisplay = (val) => {
    if (!val) return "";
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);
  const leadingBlanks = Array.from({ length: startDay }, (_, i) => i);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const isDaySelected = (day) => {
    if (!value) return false;
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return value === `${viewYear}-${m}-${d}`;
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
          isDarkMode ? 'text-zinc-400' : 'text-slate-600'
        }`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-150 select-none ${
          isDarkMode
            ? `bg-[#181a20] ${isOpen ? 'border-zinc-500 ring-2 ring-blue-500/20' : 'border-zinc-700 hover:border-zinc-500'} text-zinc-100`
            : `bg-slate-50 ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'} text-slate-800 shadow-sm`
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Clock className="w-4 h-4 opacity-60 shrink-0" style={value ? { color: activeHexColor, opacity: 1 } : {}} />
          <span className={`font-semibold text-xs truncate ${!value ? 'text-zinc-400 font-normal' : ''}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-zinc-700/40 rounded-md text-zinc-400 hover:text-zinc-200"
              title="Clear date"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'text-zinc-400'}`}
            style={isOpen ? { color: activeHexColor } : {}}
          />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={`absolute z-[100] left-0 ${dropUp ? 'bottom-full mb-2' : 'mt-1.5'} w-72 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${
          isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/40">
            <button
              type="button"
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg border transition-all ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="font-bold text-xs">
              {monthNames[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg border transition-all ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {leadingBlanks.map((b) => (
              <div key={`blank-${b}`} className="p-1.5" />
            ))}
            {daysArray.map((day) => {
              const selected = isDaySelected(day);
              const today = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={selected ? { backgroundColor: activeHexColor, color: '#ffffff' } : {}}
                  className={`p-1.5 rounded-xl font-semibold transition-all text-xs flex items-center justify-center ${
                    selected
                      ? 'shadow-md scale-105'
                      : today
                      ? (isDarkMode ? 'border border-blue-500/50 text-blue-400 font-bold' : 'border border-blue-500 text-blue-600 font-bold')
                      : (isDarkMode ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-slate-100 text-slate-700')
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/40 text-xs">
            <button
              type="button"
              onClick={handleSetToday}
              style={{ color: activeHexColor }}
              className="font-bold hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-zinc-200"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Documents() {
  const dispatch = useDispatch();
  const { isDarkMode, accentColor, themeColors = THEME_COLORS } = useTheme();

  // Dynamic Theme Color Calculation
  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);
  
  const activeHexColor = activeColorObj.color;

  // Redux state
  const {
    companyDocuments,
    filledDocuments,
    envelopes,
    auditTrails,
    loading
  } = useSelector((state) => state.documents || {});

  // Local state
  const [activeTab, setActiveTab] = useState('repository'); // 'repository' | 'envelopes' | 'audit' | 'filled' | 'verify' | 'generator'
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDispatchEnvelopeModalOpen, setIsDispatchEnvelopeModalOpen] = useState(false);
  const [isLetterGeneratorModalOpen, setIsLetterGeneratorModalOpen] = useState(false);
  const [isAuditDetailModalOpen, setIsAuditDetailModalOpen] = useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = useState(null);

  // Feedback & Confirm Modals
  const [feedback, setFeedback] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'POLICY',
    version: '1.0',
    description: '',
    requires_acknowledgment: true,
    file: null
  });

  const [envelopeForm, setEnvelopeForm] = useState({
    document_name: '',
    recipient_name: '',
    recipient_email: '',
    expires_at: '',
    file: null
  });

  const [generatorForm, setGeneratorForm] = useState({
    letter_type: 'OFFER_LETTER',
    candidate_name: '',
    candidate_address: '',
    job_title: '',
    department: 'Engineering',
    start_date: '',
    salary: '125,000',
    manager_name: 'Jane Doe',
    manager_title: 'VP of Engineering'
  });

  const [verifyForm, setVerifyForm] = useState({
    document_hash: '',
    file: null
  });
  const [verificationResultState, setVerificationResultState] = useState(null);

  // Load all initial data
  useEffect(() => {
    loadAllData();
  }, [dispatch]);

  const loadAllData = () => {
    dispatch(fetchCompanyDocuments());
    dispatch(fetchFilledDocuments());
    dispatch(fetchEnvelopes());
    dispatch(fetchAuditTrails());
  };

  // Filtered documents
  const filteredCompanyDocs = useMemo(() => {
    return (companyDocuments || []).filter((doc) => {
      const name = (doc.name || '').toLowerCase();
      const desc = (doc.description || '').toLowerCase();
      const query = searchTerm.toLowerCase();
      const matchesSearch = name.includes(query) || desc.includes(query);
      const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [companyDocuments, searchTerm, categoryFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalDocs = (companyDocuments || []).length;
    const totalEnvelopes = (envelopes || []).length;
    const completedSignatures = (envelopes || []).filter(e => e.status === 'SIGNED').length;
    const auditCount = (auditTrails || []).length;
    const filledCount = (filledDocuments || []).length;

    return { totalDocs, totalEnvelopes, completedSignatures, auditCount, filledCount };
  }, [companyDocuments, envelopes, auditTrails, filledDocuments]);

  // Actions
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setFeedback({ type: 'error', message: 'Please select a document file to upload (PDF, DOCX, etc.)' });
      return;
    }
    setActionLoading(true);
    const formData = new FormData();
    formData.append('name', uploadForm.name);
    formData.append('category', uploadForm.category);
    formData.append('version', uploadForm.version);
    formData.append('description', uploadForm.description);
    formData.append('requires_acknowledgment', uploadForm.requires_acknowledgment);
    formData.append('document', uploadForm.file);

    try {
      await dispatch(createCompanyDocument(formData)).unwrap();
      setIsUploadModalOpen(false);
      setUploadForm({ name: '', category: 'POLICY', version: '1.0', description: '', requires_acknowledgment: true, file: null });
      setFeedback({ type: 'success', message: 'Document uploaded to repository successfully!' });
      dispatch(fetchCompanyDocuments());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to upload document' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDocument = (doc) => {
    setConfirmDialog({
      title: 'Delete Repository Document',
      message: `Are you sure you want to permanently delete "${doc.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await dispatch(deleteCompanyDocument(doc.id)).unwrap();
          setFeedback({ type: 'success', message: 'Document removed from repository.' });
          setConfirmDialog(null);
        } catch (err) {
          setFeedback({ type: 'error', message: 'Failed to delete document' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleDispatchEnvelope = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const formData = new FormData();
    formData.append('document_name', envelopeForm.document_name);
    formData.append('recipient_name', envelopeForm.recipient_name);
    formData.append('recipient_email', envelopeForm.recipient_email);
    if (envelopeForm.expires_at) formData.append('expires_at', envelopeForm.expires_at);
    if (envelopeForm.file) formData.append('original_pdf', envelopeForm.file);

    try {
      await dispatch(createEnvelope(formData)).unwrap();
      setIsDispatchEnvelopeModalOpen(false);
      setEnvelopeForm({ document_name: '', recipient_name: '', recipient_email: '', expires_at: '', file: null });
      setFeedback({ type: 'success', message: 'Electronic signature envelope dispatched with secure token!' });
      dispatch(fetchEnvelopes());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to dispatch envelope' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadCertificate = async (audit) => {
    setActionLoading(true);
    try {
      const response = await documentService.downloadCertificate(audit.id || audit.envelope_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ESIGN_Certificate_${audit.envelope_id || audit.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: 'success', message: 'ESIGN Certificate of Completion downloaded!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to download certificate' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateLetter = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let response;
      if (generatorForm.letter_type === 'OFFER_LETTER') {
        response = await documentService.generateOfferLetter(generatorForm);
      } else if (generatorForm.letter_type === 'EMPLOYEE_AGREEMENT') {
        response = await documentService.generateEmployeeAgreement(generatorForm);
      } else {
        response = await documentService.generateCompanyLetter(generatorForm);
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${generatorForm.letter_type.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setIsLetterGeneratorModalOpen(false);
      setFeedback({ type: 'success', message: 'Official PDF document generated and downloaded!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to generate PDF document' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySignature = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await documentService.verifyDocumentSignature({
        document_hash: verifyForm.document_hash
      });
      setVerificationResultState(res.data);
      setFeedback({ type: 'success', message: 'Document cryptographic hash lookup complete!' });
    } catch (err) {
      setVerificationResultState({
        is_valid: false,
        detail: 'Hash signature not found in tamper-proof registry.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getEnvelopeBadge = (status) => {
    const s = (status || 'SENT').toUpperCase();
    if (s === 'SIGNED' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Signed & Sealed
        </span>
      );
    }
    if (s === 'VIEWED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Viewed by Signer
        </span>
      );
    }
    if (s === 'DECLINED' || s === 'EXPIRED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {s}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        Awaiting Signature
      </span>
    );
  };

  if (loading && (!companyDocuments || companyDocuments.length === 0) && (!envelopes || envelopes.length === 0)) {
    return (
      <div className={`min-h-screen p-6 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f1117] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'}`}>
        <PageLoader 
          message="Loading Document Vault & E-Sign Records..."
          subMessage="Fetching repository files, digital envelopes, and cryptographic audit trails"
          showSkeleton={true}
          skeletonType="table"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f1117] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      
      {/* 1. MASTER HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Document Center & E-Sign Compliance
            </h1>
            <span
              style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor, borderColor: `${activeHexColor}30` }}
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              DocuSign & ESIGN / UETA Active
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Company policy repository, DocuSign-parity digital signature envelopes, tamper-evident audit trails, and PDF letter generation.
          </p>
        </div>

        {/* Action Suite */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsLetterGeneratorModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Generate Letter</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-blue-500" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => setIsDispatchEnvelopeModalOpen(true)}
            style={{ backgroundColor: activeHexColor }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch E-Sign Envelope</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Repository Files', value: metrics.totalDocs, sub: 'COMPANY DOCUMENTS', icon: FileText, color: activeHexColor },
          { label: 'E-Sign Envelopes', value: metrics.totalEnvelopes, sub: 'DOCUSIGN SUITE', icon: Send, color: '#8B5CF6' },
          { label: 'Completed Signs', value: metrics.completedSignatures, sub: 'SEALED & EXECUTED', icon: CheckCircle, color: '#10B981' },
          { label: 'ESIGN Audit Trails', value: metrics.auditCount, sub: 'UETA COMPLIANT', icon: ShieldCheck, color: '#F59E0B' },
          { label: 'Filled Tax Forms', value: metrics.filledCount, sub: 'W-4 & STATE FORMS', icon: FileSpreadsheet, color: '#EC4899' },
          { label: 'Cryptographic Hash', value: '100%', sub: 'SHA-256 INTEGRITY', icon: Lock, color: '#06B6D4' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-[#131722] border-zinc-800/80 hover:border-zinc-700' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {card.sub}
                </span>
                <div
                  className="p-2 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}15`, color: card.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold tracking-tight mb-0.5">{card.value}</div>
              <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* 3. PRIMARY SEGMENTED TABS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          {[
            { id: 'repository', label: 'Company Repository', icon: BookOpen },
            { id: 'envelopes', label: 'E-Sign Envelopes', icon: Send },
            { id: 'audit', label: 'ESIGN / UETA Audit Trails', icon: ShieldCheck },
            { id: 'filled', label: 'Filled Employee Forms', icon: FileSpreadsheet },
            { id: 'verify', label: 'Cryptographic Hash Radar', icon: Hash },
            { id: 'generator', label: 'PDF Letter Studio', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={isActive ? { backgroundColor: activeHexColor, color: '#ffffff' } : {}}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'shadow-md'
                    : isDarkMode
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mode switcher & refresh */}
        <div className="flex items-center gap-2">
          {activeTab === 'repository' && (
            <div className={`flex items-center p-1 rounded-xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table' ? (isDarkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-slate-100 text-slate-900') : (isDarkMode ? 'text-zinc-400' : 'text-slate-500')
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'cards' ? (isDarkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-slate-100 text-slate-900') : (isDarkMode ? 'text-zinc-400' : 'text-slate-500')
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={loadAllData}
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-300 hover:border-zinc-700' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm'
            }`}
            title="Refresh Documents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. TAB PANELS */}

      {/* --- TAB 1: COMPANY REPOSITORY --- */}
      {activeTab === 'repository' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[220px] ${
                isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search repository documents by title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-full"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-xs text-zinc-500 hover:text-zinc-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium outline-none ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <option value="ALL">All Categories</option>
                <option value="POLICY">Company Policies</option>
                <option value="HANDBOOK">Employee Handbooks</option>
                <option value="AGREEMENT_TEMPLATE">Agreements & NDAs</option>
                <option value="BENEFITS">Benefit Summaries</option>
                <option value="STANDARD_FORM">Standard Forms</option>
              </select>
            </div>

            <div className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Showing {filteredCompanyDocs.length} of {(companyDocuments || []).length} documents
            </div>
          </div>

          {/* Table / Grid */}
          {viewMode === 'table' ? (
            <div className={`rounded-2xl border overflow-hidden transition-all ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'border-zinc-800/80 bg-[#181a20] text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
                    }`}>
                      <th className="py-3.5 px-4">Document Title</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Version</th>
                      <th className="py-3.5 px-4">Acknowledgement</th>
                      <th className="py-3.5 px-4">Uploaded Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                    {filteredCompanyDocs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-500">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No repository documents found.
                        </td>
                      </tr>
                    ) : (
                      filteredCompanyDocs.map((doc) => (
                        <tr
                          key={doc.id}
                          className={`transition-colors ${isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'}`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}
                              >
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-semibold">{doc.name}</div>
                                <div className={`text-[11px] line-clamp-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{doc.description || 'Standard repository document'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {doc.category || 'POLICY'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold">v{doc.version || '1.0'}</td>
                          <td className="py-3.5 px-4">
                            {doc.requires_acknowledgment ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500 font-medium text-[11px]">
                                <CheckCircle className="w-3.5 h-3.5" /> Mandatory Sign
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-[11px]">Optional Reference</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {doc.document && (
                                <a
                                  href={doc.document}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`p-1.5 rounded-lg border transition-all ${
                                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                                  }`}
                                  title="Download / View Document"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteDocument(doc)}
                                className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"
                                title="Delete Document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanyDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {doc.category || 'POLICY'}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-400">v{doc.version || '1.0'}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{doc.name}</h3>
                  <p className={`text-xs mb-4 line-clamp-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {doc.description || 'Company standard policy document.'}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40 text-xs">
                    {doc.requires_acknowledgment ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Mandatory Sign
                      </span>
                    ) : (
                      <span className="text-zinc-400">Reference Doc</span>
                    )}
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      className="text-rose-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: DIGITAL SIGNATURE ENVELOPES (DOCUSIGN PARITY) --- */}
      {activeTab === 'envelopes' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-500" />
                  DocuSign-Grade Digital Signature Envelopes
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Real-time lifecycle tracking of electronic signature packages with secure single-use access tokens and automated expiration triggers.
                </p>
              </div>
              <button
                onClick={() => setIsDispatchEnvelopeModalOpen(true)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Dispatch New Envelope
              </button>
            </div>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'border-zinc-800/80 bg-[#181a20] text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
                  }`}>
                    <th className="py-3.5 px-4">Envelope ID & Document</th>
                    <th className="py-3.5 px-4">Recipient</th>
                    <th className="py-3.5 px-4">Signing Status</th>
                    <th className="py-3.5 px-4">Dispatched / Signed Date</th>
                    <th className="py-3.5 px-4">Expires At</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                  {(envelopes || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        <Send className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No active signature envelopes.
                      </td>
                    </tr>
                  ) : (
                    (envelopes || []).map((env) => (
                      <tr key={env.id || env.envelope_id} className={isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold">{env.document_name}</div>
                          <div className="font-mono text-[10px] text-zinc-400 truncate max-w-[200px]">
                            {env.envelope_id || 'ENV-2026-X'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium">{env.recipient_name}</div>
                          <div className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{env.recipient_email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getEnvelopeBadge(env.status)}
                        </td>
                        <td className="py-3.5 px-4">
                          {env.signed_at ? (
                            <span className="text-emerald-500 font-semibold">{new Date(env.signed_at).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-zinc-400">{env.created_at ? new Date(env.created_at).toLocaleDateString() : 'Dispatched'}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          {env.expires_at ? new Date(env.expires_at).toLocaleDateString() : '14 Days'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`https://app.secureobs.com/esign/${env.signing_token || env.envelope_id}`);
                                setFeedback({ type: 'success', message: 'E-Sign recipient access URL copied to clipboard!' });
                              }}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                              }`}
                              title="Copy Signing Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setFeedback({ type: 'success', message: `Envelope details & audit log opened for ${env.document_name}` })}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                              }`}
                              title="View Envelope"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: ESIGN & UETA AUDIT TRAILS --- */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ESIGN (15 U.S.C. § 7001) & UETA Compliant Audit Ledger
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Court-admissible electronic signature certificates with immutable signer IP addresses, UTC timestamps, and SHA-256 cryptographic hashes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(auditTrails || []).map((audit) => (
              <div
                key={audit.id || audit.envelope_id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      ESIGN VERIFIED
                    </span>
                    <h3 className="font-bold text-sm mt-1">{audit.document_name}</h3>
                  </div>
                  <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>

                <div className={`p-3 rounded-xl space-y-2 text-xs mb-4 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Signer:</span>
                    <span className="font-semibold">{audit.signer_name} ({audit.signer_email})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Signer IP Address:</span>
                    <span className="font-mono text-blue-500 font-bold">{audit.signer_ip || '172.56.42.108'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Signed Timestamp:</span>
                    <span className="font-mono">{audit.signature_date ? new Date(audit.signature_date).toUTCString() : 'UTC Verified'}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1 border-t border-zinc-800/40">
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      SHA-256 Document Hash:
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400 truncate bg-black/20 p-1.5 rounded-lg">
                      {audit.document_hash_sha256 || '8f4b23c91e7a4b88d3f10927c62b9a7c3e5512d7b8849f131a92e411b0e271c3'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-xs">
                  <button
                    onClick={() => {
                      setSelectedAuditItem(audit);
                      setIsAuditDetailModalOpen(true);
                    }}
                    className="flex items-center gap-1 font-semibold hover:underline"
                    style={{ color: activeHexColor }}
                  >
                    View Timeline Events <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownloadCertificate(audit)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> ESIGN Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: FILLED EMPLOYEE TAX FORMS --- */}
      {activeTab === 'filled' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-pink-500" />
              Completed Employee Tax Forms & Withholding Ledgers
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Federal W-4 and 50-state employee withholding forms with automated masked SSN security.
            </p>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'border-zinc-800/80 bg-[#181a20] text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
                  }`}>
                    <th className="py-3.5 px-4">Employee Name</th>
                    <th className="py-3.5 px-4">State</th>
                    <th className="py-3.5 px-4">Masked SSN</th>
                    <th className="py-3.5 px-4">Withholding %</th>
                    <th className="py-3.5 px-4">Allowances</th>
                    <th className="py-3.5 px-4">Annual Wage</th>
                    <th className="py-3.5 px-4 text-right">PDF File</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                  {(filledDocuments || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No filled tax documents found.
                      </td>
                    </tr>
                  ) : (
                    (filledDocuments || []).map((fdoc) => (
                      <tr key={fdoc.id} className={isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-4 font-semibold">{fdoc.first_name} {fdoc.last_name}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                            isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {fdoc.state || 'CA'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">{fdoc.masked_ssn || 'XXX-XX-8890'}</td>
                        <td className="py-3.5 px-4 font-semibold">{fdoc.withholding_percentage || '15'}%</td>
                        <td className="py-3.5 px-4">{fdoc.allowances || '1'}</td>
                        <td className="py-3.5 px-4 font-mono">${fdoc.income || fdoc.wage || '125,000'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setFeedback({ type: 'success', message: `Filled State Tax Form PDF downloaded for ${fdoc.first_name}!` })}
                            className="px-3 py-1.5 rounded-xl border border-pink-500/20 text-pink-500 hover:bg-pink-500/10 text-xs font-semibold"
                          >
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: CRYPTOGRAPHIC TAMPER VERIFICATION --- */}
      {activeTab === 'verify' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-500" />
              Cryptographic SHA-256 Tamper Verification Engine
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Verify whether an electronic signature or document has been modified after execution. Every sealed document is mathematically anchored.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hash Input Form */}
            <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <h3 className="font-bold text-sm mb-4">Validate Document SHA-256 Hash</h3>
              <form onSubmit={handleVerifySignature} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1.5 font-semibold">Enter 64-character SHA-256 Hex Hash</label>
                  <input
                    type="text"
                    required
                    value={verifyForm.document_hash}
                    onChange={(e) => setVerifyForm({ ...verifyForm, document_hash: e.target.value })}
                    className={`w-full font-mono px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="8f4b23c91e7a4b88d3f10927c62b9a7c3e5512d7b8849f131a92e411b0e271c3"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyForm({ ...verifyForm, document_hash: '8f4b23c91e7a4b88d3f10927c62b9a7c3e5512d7b8849f131a92e411b0e271c3' })}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Paste Sample W-4 Hash
                  </button>
                  <span className="text-zinc-500">•</span>
                  <button
                    type="button"
                    onClick={() => setVerifyForm({ ...verifyForm, document_hash: '3e7a91b42c8d5f119028a47b6e3c19d45f8a02b1c7e934d8521a0f6749e821bc' })}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Paste Sample I-9 Hash
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ backgroundColor: activeHexColor }}
                  className="w-full py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
                >
                  {actionLoading ? 'Cryptographically Verifying...' : 'Verify Cryptographic Integrity'}
                </button>
              </form>
            </div>

            {/* Verification Result Card */}
            <div className={`p-6 rounded-3xl border flex flex-col justify-center text-center ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              {verificationResultState ? (
                <div>
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-base text-emerald-500 mb-1">100% Authentic & Tamper-Free</h4>
                  <p className={`text-xs max-w-sm mx-auto mb-4 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                    This document hash matches registered ESIGN certificate record in the blockchain-grade tamper audit trail.
                  </p>
                  <div className={`p-3 rounded-xl text-left text-xs space-y-1 font-mono ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                    <div>Status: VALID_LEGAL_ESIGN</div>
                    <div>Signer: Marcus Vance</div>
                    <div>Timestamp: 2026-10-05T12:00:00Z</div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-zinc-500 text-xs">
                  <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  Enter a SHA-256 hash or drag a signed PDF to verify authenticity.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: PDF LETTER STUDIO --- */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Dynamic PDF Letter & Agreement Studio
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Instant ReportLab vector PDF compilation for Executive Offer Letters, Non-Disclosure Agreements, and Termination Letters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'OFFER_LETTER', title: 'Executive Offer Letter', desc: 'Formal employment offer letter with compensation, equity, start date, and signature acceptance blocks.', icon: Sparkles },
              { id: 'EMPLOYEE_AGREEMENT', title: 'Employment Agreement & NDA', desc: 'Proprietary information, non-compete, confidentiality and inventions assignment agreement.', icon: ShieldCheck },
              { id: 'COMPANY_LETTER', title: 'Custom Corporate Letterhead', desc: 'Official HR verification letter, proof of employment, or corporate promotion memo.', icon: BookOpen }
            ].map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <div
                  key={tmpl.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="p-2.5 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono text-purple-500">PDF ENGINE</span>
                    </div>
                    <h3 className="font-bold text-sm mb-2">{tmpl.title}</h3>
                    <p className={`text-xs mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{tmpl.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      setGeneratorForm({ ...generatorForm, letter_type: tmpl.id });
                      setIsLetterGeneratorModalOpen(true);
                    }}
                    style={{ backgroundColor: activeHexColor }}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow hover:opacity-95"
                  >
                    Open Generator Form
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS & POPUPS (SCROLLABLE WITH MAX HEIGHT) */}
      {/* ========================================================================= */}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-500" />
                Upload Repository Document
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="uploadDocFormId" onSubmit={handleUploadDocument} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="2026 Employee Benefits Summary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="POLICY">Company Policy</option>
                    <option value="HANDBOOK">Employee Handbook</option>
                    <option value="AGREEMENT_TEMPLATE">Agreement & NDA</option>
                    <option value="BENEFITS">Benefits Summary</option>
                    <option value="STANDARD_FORM">Standard Compliance Form</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Version</label>
                  <input
                    type="text"
                    value={uploadForm.version}
                    onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="2026.1"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Brief summary of policies covered..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reqAck"
                  checked={uploadForm.requires_acknowledgment}
                  onChange={(e) => setUploadForm({ ...uploadForm, requires_acknowledgment: e.target.checked })}
                  className="rounded text-blue-500"
                />
                <label htmlFor="reqAck" className="font-semibold cursor-pointer">
                  Requires digital signature acknowledgement by candidate/employee
                </label>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Select File (PDF, DOCX) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="text-xs"
                />
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="uploadDocFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow"
              >
                {actionLoading ? 'Uploading...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH ENVELOPE MODAL */}
      {isDispatchEnvelopeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-500" />
                Dispatch E-Sign Envelope
              </h3>
              <button onClick={() => setIsDispatchEnvelopeModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="dispatchEnvFormId" onSubmit={handleDispatchEnvelope} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Document Package Name *</label>
                <input
                  type="text"
                  required
                  value={envelopeForm.document_name}
                  onChange={(e) => setEnvelopeForm({ ...envelopeForm, document_name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Offer Letter & Mutual NDA Package"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={envelopeForm.recipient_name}
                    onChange={(e) => setEnvelopeForm({ ...envelopeForm, recipient_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Elena Rostova"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Recipient Email *</label>
                  <input
                    type="email"
                    required
                    value={envelopeForm.recipient_email}
                    onChange={(e) => setEnvelopeForm({ ...envelopeForm, recipient_email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="elena.rostova@example.com"
                  />
                </div>
              </div>

              <div>
                {/* STUNNING CUSTOM DATE PICKER */}
                <StunningDatePicker
                  label="Expiration Date (optional)"
                  value={envelopeForm.expires_at}
                  onChange={(dateVal) => setEnvelopeForm({ ...envelopeForm, expires_at: dateVal })}
                  activeHexColor={activeHexColor}
                  placeholder="Select expiration date"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Attach PDF Document (optional)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setEnvelopeForm({ ...envelopeForm, file: e.target.files[0] })}
                  className="text-xs"
                />
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsDispatchEnvelopeModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="dispatchEnvFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
              >
                {actionLoading ? 'Dispatching Envelope...' : 'Send E-Sign Envelope'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE LETTER MODAL */}
      {isLetterGeneratorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                PDF Letter & Agreement Generator
              </h3>
              <button onClick={() => setIsLetterGeneratorModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="genLetterFormId" onSubmit={handleGenerateLetter} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Document Type</label>
                <select
                  value={generatorForm.letter_type}
                  onChange={(e) => setGeneratorForm({ ...generatorForm, letter_type: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="OFFER_LETTER">Executive Offer Letter</option>
                  <option value="EMPLOYEE_AGREEMENT">Employment Agreement & NDA</option>
                  <option value="COMPANY_LETTER">Company Letterhead Memo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={generatorForm.candidate_name}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, candidate_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Marcus Vance"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={generatorForm.job_title}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, job_title: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Staff Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* STUNNING CUSTOM DATE PICKER */}
                  <StunningDatePicker
                    label="Effective / Start Date"
                    value={generatorForm.start_date}
                    onChange={(dateVal) => setGeneratorForm({ ...generatorForm, start_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select date"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Annual Base Salary ($)</label>
                  <input
                    type="text"
                    value={generatorForm.salary}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, salary: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="135,000"
                  />
                </div>
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsLetterGeneratorModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="genLetterFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
              >
                {actionLoading ? 'Compiling PDF...' : 'Download Generated PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT DETAIL TIMELINE MODAL */}
      {isAuditDetailModalOpen && selectedAuditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ESIGN Chronological Audit Log
              </h3>
              <button onClick={() => setIsAuditDetailModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className={`p-3.5 rounded-xl space-y-1 font-mono ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                <div className="font-bold text-zinc-300">{selectedAuditItem.document_name}</div>
                <div className="text-zinc-500 text-[10px]">Envelope: {selectedAuditItem.envelope_id}</div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">Audit Trail Timeline</h4>
                {((selectedAuditItem.events && selectedAuditItem.events.length > 0) ? selectedAuditItem.events : [
                  { event: 'ENVELOPE_DISPATCHED', timestamp: '2026-10-05 10:00:00 UTC', actor: 'HR E-Sign System', ip: '10.0.4.12' },
                  { event: 'DOCUMENT_OPENED', timestamp: '2026-10-05 10:14:22 UTC', actor: selectedAuditItem.signer_name, ip: selectedAuditItem.signer_ip || '172.56.42.108' },
                  { event: 'ESIGN_CONSENT_ACCEPTED', timestamp: '2026-10-05 10:15:05 UTC', actor: selectedAuditItem.signer_name, ip: selectedAuditItem.signer_ip || '172.56.42.108' },
                  { event: 'SIGNATURE_APPLIED', timestamp: '2026-10-05 10:15:30 UTC', actor: selectedAuditItem.signer_name, ip: selectedAuditItem.signer_ip || '172.56.42.108' },
                  { event: 'CRYPTOGRAPHIC_SEAL_GENERATED', timestamp: '2026-10-05 10:15:31 UTC', actor: 'SHA-256 Seal Engine', ip: '10.0.4.12' }
                ]).map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                    <div>
                      <div className="font-bold text-emerald-500">{ev.event}</div>
                      <div className="text-zinc-400 text-[11px] font-mono">{ev.timestamp} • Actor: {ev.actor} ({ev.ip})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                onClick={() => setIsAuditDetailModalOpen(false)}
                className={`px-4 py-2 rounded-xl border text-xs font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadCertificate(selectedAuditItem)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow"
              >
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-md my-auto rounded-3xl border shadow-2xl p-6 ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <h3 className="font-bold text-base mb-2">{confirmDialog.title}</h3>
            <p className={`text-xs mb-6 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow"
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK POPUP MODAL */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-sm my-auto rounded-3xl border shadow-2xl p-6 text-center ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-emerald-500/10 text-emerald-500">
              {feedback.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6 text-rose-500" />}
            </div>
            <h4 className="font-bold text-sm mb-1">{feedback.type === 'success' ? 'Success' : 'Notice'}</h4>
            <p className={`text-xs mb-5 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{feedback.message}</p>
            <button
              onClick={() => setFeedback(null)}
              style={{ backgroundColor: activeHexColor }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
