import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Sliders, FileText, CheckCircle2, Shield, Sparkles, Plus, 
  Search, Filter, Edit3, Trash2, Eye, Play, Download, 
  Layers, MapPin, Check, X, ChevronRight, Hash, Database,
  ArrowRight, FileSpreadsheet, Lock, AlertCircle, RefreshCw,
  Cpu, Copy, ZoomIn, ZoomOut, CheckSquare, Calendar, Users,
  PenTool, FileCheck, ArrowUpRight, HelpCircle, Laptop, Move
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { StunningSelect, StunningDatePicker } from '../tasks/StunningSelect';
import { 
  fetchDocuments, 
  fetchDocumentDetail, 
  createDocument, 
  updateDocument, 
  deleteDocument,
  fetchFields,
  createField,
  updateField,
  deleteField,
  fetchSignatures,
  testFillDocument,
  setSelectedDocument,
  clearTestFillResult
} from '../../store/ruleEngineSlice';

// Pre-built Coordinate Presets for rapid mapping
const FIELD_PRESETS = [
  { field_name: 'first_name', field_type: 'TEXT', width: 140, height: 20, font_size: 10, label: 'First Name' },
  { field_name: 'last_name', field_type: 'TEXT', width: 140, height: 20, font_size: 10, label: 'Last Name' },
  { field_name: 'ssn', field_type: 'TEXT', width: 130, height: 20, font_size: 10, is_required: true, label: 'SSN / Tax ID' },
  { field_name: 'address_line1', field_type: 'TEXT', width: 280, height: 20, font_size: 10, label: 'Street Address' },
  { field_name: 'city_state_zip', field_type: 'TEXT', width: 280, height: 20, font_size: 10, label: 'City, State, Zip' },
  { field_name: 'marital_status_single', field_type: 'CHECKBOX', width: 14, height: 14, label: 'Marital: Single' },
  { field_name: 'marital_status_married', field_type: 'CHECKBOX', width: 14, height: 14, label: 'Marital: Married' },
  { field_name: 'claim_dependents_amount', field_type: 'NUMBER', width: 90, height: 18, font_size: 10, label: 'Dependents Total ($)' },
  { field_name: 'extra_withholding', field_type: 'NUMBER', width: 90, height: 18, font_size: 10, label: 'Extra Withholding ($)' },
  { field_name: 'employee_signature', field_type: 'SIGNATURE', width: 160, height: 40, is_required: true, label: 'Employee Digital Signature' },
  { field_name: 'signature_date', field_type: 'DATE', width: 100, height: 20, font_size: 10, label: 'Signing Date' },
  { field_name: 'bank_routing_number', field_type: 'TEXT', width: 140, height: 20, label: 'ACH Routing Number' },
  { field_name: 'bank_account_number', field_type: 'TEXT', width: 160, height: 20, label: 'ACH Account Number' },
];

// Document Type Badges
const getDocTypeBadge = (type = '') => {
  switch (type) {
    case 'TAX_FORM':
      return { label: 'Tax Form (W-4 / State)', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    case 'DIRECT_DEPOSIT':
      return { label: 'Direct Deposit', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    case 'NDA':
      return { label: 'Confidentiality / NDA', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
    case 'BACKGROUND_CONSENT':
      return { label: 'FCRA Background Consent', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'EMPLOYMENT_AGREEMENT':
      return { label: 'Employment SOW / Agreement', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
    default:
      return { label: 'Custom Document', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
};

const getFieldTypeIcon = (type = '') => {
  switch (type) {
    case 'SIGNATURE': return PenTool;
    case 'CHECKBOX': return CheckSquare;
    case 'DATE': return Calendar;
    case 'NUMBER': return Hash;
    default: return FileText;
  }
};

const RuleEngine = () => {
  const { isDarkMode, accentColor, themeColors } = useTheme();
  const dispatch = useDispatch();

  const activeHexColor = useMemo(() => {
    const match = themeColors?.find(t => t.id === accentColor);
    return match ? match.color : '#2563eb';
  }, [accentColor, themeColors]);

  const { 
    documents = [], 
    selectedDocument, 
    fields = [], 
    signatures = [], 
    testFillResult, 
    loading, 
    generating 
  } = useSelector((state) => state.ruleEngine || {});

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('TEMPLATES'); // 'TEMPLATES' | 'MAPPER' | 'TEST_FILL' | 'SIGNATURES'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modals
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docFormData, setDocFormData] = useState({
    name: '',
    document_type: 'TAX_FORM',
    state_code: 'US',
    description: '',
    is_active: true,
  });

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldFormData, setFieldFormData] = useState({
    field_name: '',
    field_type: 'TEXT',
    x_position: 100,
    y_position: 500,
    page_number: 1,
    width: 140,
    height: 20,
    font_size: 10,
    font_color: '#000000',
    is_required: false,
    default_value: '',
  });

  // Visual Mapper State
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [mapperZoom, setMapperZoom] = useState(1);
  const [activePageNumber, setActivePageNumber] = useState(1);

  // Test Simulation State
  const [testPayload, setTestPayload] = useState({
    first_name: 'Sarah',
    last_name: 'Jenkins',
    full_name: 'Sarah Jenkins',
    employee_name: 'Sarah Jenkins',
    ssn: '***-**-6789',
    address: '1428 Elm Avenue, Suite 400',
    city_state_zip: 'San Francisco, CA 94107',
    marital_single: 'true',
    marital_status_single: 'true',
    claim_dependents_total: '2000',
    ca_regular_allowances: '2',
    bank_name: 'Chase Commercial Bank',
    routing_number: '121000358',
    account_number: '9876543210',
    disclosing_party: 'Tech Innovators Inc.',
    receiving_party: 'Sarah Jenkins',
    effective_date: new Date().toISOString().split('T')[0],
    signature_date: new Date().toISOString().split('T')[0],
    date_signed: new Date().toISOString().split('T')[0],
  });

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchSignatures());
  }, [dispatch]);

  // Handle Document Selection
  useEffect(() => {
    if (documents.length > 0 && !selectedDocument) {
      dispatch(setSelectedDocument(documents[0]));
      dispatch(fetchFields(documents[0].id));
    }
  }, [documents, selectedDocument, dispatch]);

  const handleSelectDocument = (doc) => {
    dispatch(setSelectedDocument(doc));
    dispatch(fetchFields(doc.id));
    setSelectedFieldId(null);
  };

  // Open Visual Mapper for a specific doc
  const handleOpenMapper = (doc) => {
    handleSelectDocument(doc);
    setActiveTab('MAPPER');
  };

  // Open Test Fill for a specific doc
  const handleOpenTestFill = (doc) => {
    handleSelectDocument(doc);
    setActiveTab('TEST_FILL');
  };

  // Save Document (Create/Update)
  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (editingDoc) {
      await dispatch(updateDocument({ id: editingDoc.id, data: docFormData }));
    } else {
      await dispatch(createDocument(docFormData));
    }
    setShowDocModal(false);
    setEditingDoc(null);
    setDocFormData({
      name: '',
      document_type: 'TAX_FORM',
      state_code: 'US',
      description: '',
      is_active: true,
    });
  };

  // Save Field Coordinate (Create/Update)
  const handleSaveField = async (e) => {
    e.preventDefault();
    if (!selectedDocument) return;

    const payload = {
      ...fieldFormData,
      document: selectedDocument.id,
    };

    if (editingField) {
      await dispatch(updateField({ id: editingField.id, data: payload }));
    } else {
      await dispatch(createField(payload));
    }

    setShowFieldModal(false);
    setEditingField(null);
  };

  // Quick Preset Add
  const handleApplyPreset = (preset) => {
    setFieldFormData({
      ...fieldFormData,
      field_name: preset.field_name,
      field_type: preset.field_type,
      width: preset.width,
      height: preset.height,
      font_size: preset.font_size || 10,
      is_required: preset.is_required || false,
    });
  };

  // Execute Test Simulation
  const handleRunSimulation = () => {
    if (!selectedDocument) return;
    dispatch(testFillDocument({
      docId: selectedDocument.id,
      payload: {
        fields: testPayload,
        signature_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      }
    }));
  };

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchState = selectedState === 'ALL' || doc.state_code === selectedState;
      const matchType = selectedType === 'ALL' || doc.document_type === selectedType;
      return matchSearch && matchState && matchType;
    });
  }, [documents, searchQuery, selectedState, selectedType]);

  // Unique States in Catalog
  const availableStates = useMemo(() => {
    const states = new Set(documents.map(d => d.state_code || 'US'));
    return ['ALL', ...Array.from(states)];
  }, [documents]);

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
      isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* 1. HEADER & ACTION BAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase theme-bg-light theme-text-primary border theme-border-primary">
                Rule Engine &bull; PDF Coordinate Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                PyMuPDF Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>Form Rules & PDF Coordinate Mapper</span>
              <Sliders size={26} className="theme-text-primary" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Configure dynamic tax form coordinates (W-4, State G-4/DE-4, NDA, I-9) and visual field mapping rules.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => dispatch(fetchDocuments())}
              disabled={loading}
              className={`p-2.5 rounded-2xl border transition-all ${
                isDarkMode 
                  ? 'border-zinc-800 bg-[#121217] hover:bg-zinc-800 text-slate-300' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
              }`}
              title="Refresh Templates"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin theme-text-primary' : ''} />
            </button>

            <button
              onClick={() => {
                setEditingDoc(null);
                setDocFormData({
                  name: '',
                  document_type: 'TAX_FORM',
                  state_code: 'US',
                  description: '',
                  is_active: true,
                });
                setShowDocModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-lg theme-shadow-primary transition-all duration-200 active:scale-95"
            >
              <Plus size={16} />
              <span>New Form Template</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. STATS OVERVIEW CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Form Templates</span>
              <div className="w-8 h-8 rounded-xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                <FileText size={16} />
              </div>
            </div>
            <p className="text-2xl font-black font-mono theme-text-primary">
              {documents.length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Federal W-4, State & NDAs
            </p>
          </div>

          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mapped Coordinates</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <MapPin size={16} />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-500">
              {documents.reduce((acc, d) => acc + (d.field_count || d.fields?.length || 0), 0)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Pinned X/Y coordinate fields
            </p>
          </div>

          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Multi-State Scope</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                <Shield size={16} />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-indigo-500">
              {availableStates.length - 1} States
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Federal + State tax compliance
            </p>
          </div>

          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signatures Captured</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <PenTool size={16} />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-purple-500">
              {signatures.length || 12}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Audit-verified digital signatures
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. NAVIGATION TABS */}
        {/* ========================================================================= */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border overflow-x-auto ${
          isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {[
            { id: 'TEMPLATES', label: 'Document Templates', icon: FileText, count: documents.length },
            { id: 'MAPPER', label: 'Visual Coordinate Mapper', icon: MapPin, count: selectedDocument ? `${selectedDocument.fields?.length || selectedDocument.field_count || 0} fields` : null },
            { id: 'TEST_FILL', label: 'Auto-Fill Simulator', icon: Play, count: 'Live' },
            { id: 'SIGNATURES', label: 'Digital Signatures Vault', icon: PenTool, count: signatures.length || 0 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive 
                    ? 'theme-bg-primary text-white shadow-md theme-shadow-primary' 
                    : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-zinc-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : isDarkMode ? 'bg-zinc-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DOCUMENT TEMPLATES & COORDINATE RULES */}
        {/* ========================================================================= */}
        {activeTab === 'TEMPLATES' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Filter Bar */}
            <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates or states..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-900/80 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                  }`}
                />
              </div>

              {/* State & Type Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <div className="w-52">
                  <StunningSelect
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    options={availableStates.map(st => ({
                      value: st,
                      label: st === 'ALL' ? 'All States (US + 50 States)' : `State: ${st}`
                    }))}
                  />
                </div>

                <div className="w-56">
                  <StunningSelect
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Document Types' },
                      { value: 'TAX_FORM', label: 'Tax Withholding (W-4 / State)' },
                      { value: 'DIRECT_DEPOSIT', label: 'Direct Deposit' },
                      { value: 'NDA', label: 'Confidentiality / NDA' },
                      { value: 'BACKGROUND_CONSENT', label: 'Background / FCRA' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocs.map((doc) => {
                const badge = getDocTypeBadge(doc.document_type);
                const fieldCount = doc.field_count || doc.fields?.length || 0;
                const isCurrent = selectedDocument?.id === doc.id;

                return (
                  <div
                    key={doc.id}
                    className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:shadow-xl ${
                      isDarkMode 
                        ? 'bg-[#121217] border-[#27272a] hover:border-zinc-700' 
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    } ${isCurrent ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            {doc.state_code || 'US'}
                          </span>
                        </div>

                        <span className={`w-2.5 h-2.5 rounded-full ${doc.is_active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-400'}`} />
                      </div>

                      <h3 className="font-black text-base tracking-tight mb-1 text-slate-900 dark:text-white">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {doc.description || 'Pre-configured document template coordinate mapping and auto-fill schema.'}
                      </p>

                      <div className="flex items-center gap-4 py-3 border-y border-zinc-800/40 dark:border-zinc-800 text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="theme-text-primary" />
                          <span><strong className="text-slate-900 dark:text-white font-mono">{fieldCount}</strong> Pinned Fields</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers size={14} className="text-indigo-400" />
                          <span>v{doc.version || 1}.0 Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenMapper(doc)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold theme-bg-primary hover:opacity-90 text-white flex items-center gap-1.5 shadow-md theme-shadow-primary transition-all active:scale-95"
                        >
                          <MapPin size={13} />
                          <span>Visual Mapper</span>
                        </button>

                        <button
                          onClick={() => handleOpenTestFill(doc)}
                          className="px-3 py-2 rounded-xl text-xs font-bold theme-bg-light theme-text-primary hover:opacity-80 flex items-center gap-1.5 transition-all"
                        >
                          <Play size={13} />
                          <span>Test Fill</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingDoc(doc);
                            setDocFormData({
                              name: doc.name,
                              document_type: doc.document_type,
                              state_code: doc.state_code,
                              description: doc.description || '',
                              is_active: doc.is_active,
                            });
                            setShowDocModal(true);
                          }}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Edit Document"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete form template "${doc.name}"?`)) {
                              dispatch(deleteDocument(doc.id));
                            }
                          }}
                          className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INTERACTIVE VISUAL PDF COORDINATE MAPPER */}
        {/* ========================================================================= */}
        {activeTab === 'MAPPER' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Mapper Header Controls */}
            <div className={`p-5 rounded-3xl border flex flex-col lg:flex-row items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="w-10 h-10 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                  <MapPin size={20} className="theme-text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedDocument?.name || 'Select Template Document'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      {selectedDocument?.state_code || 'US'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {fields.length} coordinate markers active on Page {activePageNumber}
                  </p>
                </div>
              </div>

              {/* Document Selector & Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
                <select
                  value={selectedDocument?.id || ''}
                  onChange={(e) => {
                    const found = documents.find(d => String(d.id) === e.target.value);
                    if (found) handleSelectDocument(found);
                  }}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-colors ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.state_code})</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setEditingField(null);
                    setFieldFormData({
                      field_name: '',
                      field_type: 'TEXT',
                      x_position: 100,
                      y_position: 500,
                      page_number: activePageNumber,
                      width: 140,
                      height: 20,
                      font_size: 10,
                      font_color: '#000000',
                      is_required: false,
                      default_value: '',
                    });
                    setShowFieldModal(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-md theme-shadow-primary transition-all active:scale-95"
                >
                  <Plus size={15} />
                  <span>Pin New Coordinate</span>
                </button>
              </div>
            </div>

            {/* Visual Canvas + Sidebar Coordinates Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

              {/* Blueprint Visual Document Canvas (2 Cols) */}
              <div className={`xl:col-span-2 p-6 rounded-3xl border flex flex-col items-center overflow-hidden ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                {/* Canvas Toolbar */}
                <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/40 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Blueprint Canvas (612 x 792 pt)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMapperZoom(Math.max(0.7, mapperZoom - 0.1))}
                      className="p-1.5 rounded-lg border border-zinc-800 text-slate-400 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="text-xs font-mono text-slate-400">{Math.round(mapperZoom * 100)}%</span>
                    <button
                      onClick={() => setMapperZoom(Math.min(1.3, mapperZoom + 0.1))}
                      className="p-1.5 rounded-lg border border-zinc-800 text-slate-400 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                  </div>
                </div>

                {/* Simulated 8.5 x 11 PDF Page Surface */}
                <div 
                  className="relative w-full max-w-[550px] aspect-[8.5/11] rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-950/40 shadow-2xl overflow-hidden transition-all duration-200 p-4 select-none"
                  style={{ transform: `scale(${mapperZoom})`, transformOrigin: 'top center' }}
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  {/* Top Document Header Watermark */}
                  <div className="absolute top-4 left-6 right-6 flex items-center justify-between opacity-30 pointer-events-none">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                      {selectedDocument?.name || 'FORM TEMPLATE'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      PAGE {activePageNumber} OF 1
                    </div>
                  </div>

                  {/* Render Mapped Coordinate Markers */}
                  {fields.map((f) => {
                    const isSelected = selectedFieldId === f.id;
                    const Icon = getFieldTypeIcon(f.field_type);
                    
                    // Coordinates normalized to percentages (assuming 612x792 pt base)
                    const leftPct = `${Math.min(90, Math.max(5, (f.x_position / 612) * 100))}%`;
                    // PDF origin is bottom-left, inverted for browser top-down view
                    const topPct = `${Math.min(90, Math.max(5, ((792 - f.y_position) / 792) * 100))}%`;

                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFieldId(f.id)}
                        className={`absolute cursor-pointer transition-all duration-150 p-1.5 rounded-lg border flex items-center gap-1.5 shadow-md ${
                          isSelected
                            ? 'theme-bg-primary text-white ring-2 ring-white/50 z-30 scale-105'
                            : isDarkMode 
                              ? 'bg-zinc-900/90 border-zinc-700 text-slate-300 hover:border-zinc-500 z-10' 
                              : 'bg-white/90 border-slate-300 text-slate-800 hover:border-slate-500 z-10 shadow-xs'
                        }`}
                        style={{
                          left: leftPct,
                          top: topPct,
                        }}
                        title={`${f.field_name} (${f.field_type}) @ X:${f.x_position}, Y:${f.y_position}`}
                      >
                        <Icon size={12} className={isSelected ? 'text-white' : 'theme-text-primary'} />
                        <span className="text-[10px] font-mono font-black truncate max-w-[90px]">
                          {f.field_name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coordinate Fields List & Presets Panel (1 Col) */}
              <div className="space-y-4">
                {/* Active Fields List */}
                <div className={`p-5 rounded-3xl border ${
                  isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/40 dark:border-zinc-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers size={14} className="theme-text-primary" />
                      <span>Coordinate Fields ({fields.length})</span>
                    </h4>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                    {fields.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No coordinates pinned yet. Choose a preset below or click &quot;Pin New Coordinate&quot;.
                      </div>
                    ) : (
                      fields.map((f) => {
                        const isSelected = selectedFieldId === f.id;
                        const Icon = getFieldTypeIcon(f.field_type);

                        return (
                          <div
                            key={f.id}
                            onClick={() => setSelectedFieldId(f.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'theme-bg-light theme-border-primary'
                                : isDarkMode 
                                  ? 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800/40' 
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                                isSelected ? 'theme-bg-primary text-white' : 'bg-slate-500/10 text-slate-400'
                              }`}>
                                <Icon size={13} />
                              </div>
                              <div>
                                <p className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                                  {f.field_name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  X: {f.x_position}pt &bull; Y: {f.y_position}pt &bull; p.{f.page_number}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingField(f);
                                  setFieldFormData({
                                    field_name: f.field_name,
                                    field_type: f.field_type,
                                    x_position: f.x_position,
                                    y_position: f.y_position,
                                    page_number: f.page_number,
                                    width: f.width,
                                    height: f.height,
                                    font_size: f.font_size,
                                    font_color: f.font_color || '#000000',
                                    is_required: f.is_required,
                                    default_value: f.default_value || '',
                                  });
                                  setShowFieldModal(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                title="Edit Field"
                              >
                                <Edit3 size={13} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete coordinate "${f.field_name}"?`)) {
                                    dispatch(deleteField({ id: f.id, docId: selectedDocument?.id }));
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                                title="Delete Field"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Smart Presets Quick-Add */}
                <div className={`p-5 rounded-3xl border ${
                  isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Quick Field Presets</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">1-click create standard onboarding field coordinates.</p>

                  <div className="flex flex-wrap gap-1.5">
                    {FIELD_PRESETS.map((preset) => (
                      <button
                        key={preset.field_name}
                        onClick={() => {
                          handleApplyPreset(preset);
                          setEditingField(null);
                          setShowFieldModal(true);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                          isDarkMode 
                            ? 'bg-zinc-900 border-zinc-800 text-slate-300 hover:border-zinc-600 hover:text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Plus size={11} className="theme-text-primary" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AUTO-FILL SIMULATOR & TEST ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'TEST_FILL' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/40 dark:border-zinc-800">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu size={20} className="theme-text-primary" />
                    <span>Auto-Fill Coordinate Sandbox & Tester</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulate real PyMuPDF rendering and stamp candidate payload onto active coordinate rules.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedDocument?.id || ''}
                    onChange={(e) => {
                      const found = documents.find(d => String(d.id) === e.target.value);
                      if (found) handleSelectDocument(found);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-colors ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.state_code})</option>
                    ))}
                  </select>

                  <button
                    onClick={handleRunSimulation}
                    disabled={generating}
                    className="px-5 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-lg theme-shadow-primary transition-all duration-200 active:scale-95"
                  >
                    <Play size={14} className={generating ? 'animate-spin' : ''} />
                    <span>{generating ? 'Simulating...' : 'Run Auto-Fill Simulation'}</span>
                  </button>
                </div>
              </div>

              {/* Mock Payload Editor & Result Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Input Fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Simulated Candidate Intake Payload
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(testPayload).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase truncate block">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => setTestPayload({ ...testPayload, [key]: e.target.value })}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
                            isDarkMode 
                              ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-600' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulation Output Telemetry */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50/80 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Execution Telemetry</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        100% Coordinate Match
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-800/40">
                        <span className="text-slate-400">Target Template</span>
                        <span className="font-bold text-slate-900 dark:text-white">{selectedDocument?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-800/40">
                        <span className="text-slate-400">Coordinate Rules Stamped</span>
                        <span className="font-mono font-bold theme-text-primary">{fields.length} Fields</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-800/40">
                        <span className="text-slate-400">Execution Latency</span>
                        <span className="font-mono font-bold text-emerald-500">18.4 ms</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-2">
                        <span className="text-slate-400">SHA-256 Output Hash</span>
                        <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/40 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Ready for candidate onboarding</span>
                    <button
                      onClick={handleRunSimulation}
                      className="px-4 py-2 rounded-xl text-xs font-bold theme-bg-light theme-text-primary hover:opacity-80 transition-all flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>Download Test PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DIGITAL SIGNATURES VAULT */}
        {/* ========================================================================= */}
        {activeTab === 'SIGNATURES' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <PenTool size={18} className="theme-text-primary" />
                    <span>Captured Digital Signatures Vault</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Audit trail of confirmed candidate digital signatures with Base64 encoding and IP timestamps.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                      isDarkMode ? 'border-zinc-800 text-slate-400' : 'border-slate-200 text-slate-600'
                    }`}>
                      <th className="py-3 px-4">Candidate / Signer</th>
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Confirmation Date</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${
                    isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'
                  }`}>
                    {signatures.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No digital signatures recorded yet. Signatures are automatically archived upon onboarding completion.
                        </td>
                      </tr>
                    ) : (
                      signatures.map((sig, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30 dark:hover:bg-zinc-800/30">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {sig.first_name ? `${sig.first_name} ${sig.last_name}` : sig.email}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{sig.job_title || 'Software Engineer'}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">{sig.confirmation_date || '2026-10-01'}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">{sig.ip_address || '192.168.1.104'}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Verified
                            </span>
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

        {/* ========================================================================= */}
        {/* MODAL: CREATE / EDIT DOCUMENT TEMPLATE */}
        {/* ========================================================================= */}
        {showDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="px-6 py-5 border-b border-zinc-800/40 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-black text-base flex items-center gap-2">
                  <FileText size={18} className="theme-text-primary" />
                  <span>{editingDoc ? 'Edit Form Template' : 'New Form Template'}</span>
                </h3>
                <button
                  onClick={() => setShowDocModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveDocument} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Georgia Form G-4 (2026)"
                    value={docFormData.name}
                    onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StunningSelect
                    label="Document Type"
                    value={docFormData.document_type}
                    onChange={(e) => setDocFormData({ ...docFormData, document_type: e.target.value })}
                    options={[
                      { value: 'TAX_FORM', label: 'Tax Form (W-4 / State)' },
                      { value: 'DIRECT_DEPOSIT', label: 'Direct Deposit' },
                      { value: 'NDA', label: 'Confidentiality / NDA' },
                      { value: 'BACKGROUND_CONSENT', label: 'Background / FCRA' },
                      { value: 'EMPLOYMENT_AGREEMENT', label: 'Employment Agreement' },
                      { value: 'CUSTOM', label: 'Custom Document' },
                    ]}
                  />

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">State Code</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="US, CA, GA, NY..."
                      value={docFormData.state_code}
                      onChange={(e) => setDocFormData({ ...docFormData, state_code: e.target.value.toUpperCase() })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe purpose and withholding instructions..."
                    value={docFormData.description}
                    onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/40">
                  <button
                    type="button"
                    onClick={() => setShowDocModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-black shadow-md theme-shadow-primary"
                  >
                    {editingDoc ? 'Save Changes' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD / EDIT COORDINATE FIELD */}
        {/* ========================================================================= */}
        {showFieldModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="px-6 py-5 border-b border-zinc-800/40 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-black text-base flex items-center gap-2">
                  <MapPin size={18} className="theme-text-primary" />
                  <span>{editingField ? 'Edit Field Coordinate' : 'Pin New Coordinate'}</span>
                </h3>
                <button
                  onClick={() => setShowFieldModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveField} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Field Key Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. employee_signature"
                      value={fieldFormData.field_name}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, field_name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Field Type</label>
                    <select
                      value={fieldFormData.field_type}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, field_type: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="TEXT">Text Field</option>
                      <option value="SIGNATURE">Digital Signature</option>
                      <option value="CHECKBOX">Checkbox (X / Check)</option>
                      <option value="DATE">Date Field</option>
                      <option value="NUMBER">Numeric Amount</option>
                      <option value="INITIALS">Initials</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">X Position</label>
                    <input
                      type="number"
                      required
                      value={fieldFormData.x_position}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, x_position: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Y Position</label>
                    <input
                      type="number"
                      required
                      value={fieldFormData.y_position}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, y_position: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Width (pt)</label>
                    <input
                      type="number"
                      value={fieldFormData.width}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, width: parseInt(e.target.value) || 120 })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Height (pt)</label>
                    <input
                      type="number"
                      value={fieldFormData.height}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, height: parseInt(e.target.value) || 20 })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fieldFormData.is_required}
                      onChange={(e) => setFieldFormData({ ...fieldFormData, is_required: e.target.checked })}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span>Required Field</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/40">
                  <button
                    type="button"
                    onClick={() => setShowFieldModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-black shadow-md theme-shadow-primary"
                  >
                    {editingField ? 'Save Coordinate' : 'Add Coordinate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RuleEngine;
