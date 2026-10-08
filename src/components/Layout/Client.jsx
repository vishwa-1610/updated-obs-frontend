import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Building2, FileText, DollarSign, Users, MapPin, ShieldCheck,
  Plus, Download, UploadCloud, Search, CheckCircle, Clock,
  Eye, Mail, Phone, Calendar, Globe, Briefcase, LayoutGrid,
  List, RefreshCw, Check, X, AlertCircle, ExternalLink,
  ChevronRight, ChevronLeft, ChevronDown, Trash2, Edit,
  Shield, CreditCard, Award, FileSpreadsheet, Layers
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  fetchContractDocuments,
  createContractDocument,
  deleteContractDocument,
  fetchRateCards,
  createRateCard,
  deleteRateCard,
  fetchClientContacts,
  fetchWorkLocations,
  fetchClientVerifications
} from '../../store/clientSlice';
import clientService from '../../services/clientService';
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
          <Calendar className="w-4 h-4 opacity-60 shrink-0" style={value ? { color: activeHexColor, opacity: 1 } : {}} />
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

export default function Client() {
  const dispatch = useDispatch();
  const { isDarkMode, accentColor, themeColors = THEME_COLORS } = useTheme();

  // Dynamic Theme Color Calculation
  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);
  
  const activeHexColor = activeColorObj.color;

  // Redux state
  const {
    clients,
    contracts,
    rateCards,
    contacts,
    workLocations,
    verifications,
    loading
  } = useSelector((state) => state.client || {});

  // Local state
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'contracts' | 'ratecards' | 'contacts' | 'locations' | 'verifications'
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [industryFilter, setIndustryFilter] = useState('ALL');

  // Modals state
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isRateCardModalOpen, setIsRateCardModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Feedback & Confirm Modals
  const [feedback, setFeedback] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [clientForm, setClientForm] = useState({
    client_name: '',
    client_code: '',
    fein_ein: '',
    contact_no: '',
    website: '',
    email: '',
    industry: 'Financial Technology & Banking',
    status: 'ACTIVE',
    payment_terms: 'NET_30',
    billing_currency: 'USD',
    city: '',
    state: 'CA',
    billing_address_line_1: '',
    billing_city: '',
    billing_state: 'CA',
    billing_zip_code: ''
  });

  const [contractForm, setContractForm] = useState({
    client: '',
    document_name: '',
    contract_type: 'MSA',
    sow_number: '',
    contract_value: '',
    start_date: '',
    end_date: '',
    status: 'ACTIVE',
    file: null
  });

  const [rateCardForm, setRateCardForm] = useState({
    client: '',
    job_title: '',
    standard_hourly_rate: '135.00',
    overtime_hourly_rate: '175.00',
    effective_date: '',
    is_active: true
  });

  const [contactForm, setContactForm] = useState({
    client: '',
    contact_type: 'Primary',
    client_first_name: '',
    client_last_name: '',
    client_email: '',
    client_phone_number: '',
    client_title: '',
    client_location: ''
  });

  const [locationForm, setLocationForm] = useState({
    client: '',
    location_name: '',
    address_line_1: '',
    city: '',
    state: 'CA',
    zip_code: '',
    is_primary: true
  });

  // Initial Load
  useEffect(() => {
    loadAllData();
  }, [dispatch]);

  const loadAllData = () => {
    dispatch(fetchClients());
    dispatch(fetchContractDocuments());
    dispatch(fetchRateCards());
    dispatch(fetchClientContacts());
    dispatch(fetchWorkLocations());
    dispatch(fetchClientVerifications());
  };

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return (clients || []).filter((c) => {
      const name = (c.client_name || '').toLowerCase();
      const code = (c.client_code || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const ind = (c.industry || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = name.includes(query) || code.includes(query) || email.includes(query) || ind.includes(query);
      const matchesStatus = statusFilter === 'ALL' || (c.status || '').toUpperCase() === statusFilter.toUpperCase();
      const matchesIndustry = industryFilter === 'ALL' || c.industry === industryFilter;

      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [clients, searchTerm, statusFilter, industryFilter]);

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const totalClients = (clients || []).length;
    const totalContracts = (contracts || []).length;
    const totalRateCards = (rateCards || []).length;
    const totalContractValue = (contracts || []).reduce((sum, c) => sum + parseFloat(c.contract_value || 0), 0);
    const totalLocations = (workLocations || []).length;
    const totalContacts = (contacts || []).length;

    return { totalClients, totalContracts, totalRateCards, totalContractValue, totalLocations, totalContacts };
  }, [clients, contracts, rateCards, workLocations, contacts]);

  // Handlers
  const handleOpenDetail = (client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createClient(clientForm)).unwrap();
      setIsClientModalOpen(false);
      setClientForm({
        client_name: '',
        client_code: '',
        fein_ein: '',
        contact_no: '',
        website: '',
        email: '',
        industry: 'Financial Technology & Banking',
        status: 'ACTIVE',
        payment_terms: 'NET_30',
        billing_currency: 'USD',
        city: '',
        state: 'CA',
        billing_address_line_1: '',
        billing_city: '',
        billing_state: 'CA',
        billing_zip_code: ''
      });
      setFeedback({ type: 'success', message: 'Client account registered successfully!' });
      dispatch(fetchClients());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to register client' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClient = (client) => {
    setConfirmDialog({
      title: 'Remove Client Account',
      message: `Are you sure you want to deactivate and remove "${client.client_name}"? Active SOWs and placements will be impacted.`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await dispatch(deleteClient(client.id)).unwrap();
          setFeedback({ type: 'success', message: 'Client account archived.' });
          setConfirmDialog(null);
          setIsDetailModalOpen(false);
          dispatch(fetchClients());
        } catch (err) {
          setFeedback({ type: 'error', message: 'Failed to delete client account' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const formData = new FormData();
    formData.append('client', contractForm.client);
    formData.append('document_name', contractForm.document_name);
    formData.append('contract_type', contractForm.contract_type);
    if (contractForm.sow_number) formData.append('sow_number', contractForm.sow_number);
    if (contractForm.contract_value) formData.append('contract_value', contractForm.contract_value);
    if (contractForm.start_date) formData.append('start_date', contractForm.start_date);
    if (contractForm.end_date) formData.append('end_date', contractForm.end_date);
    formData.append('status', contractForm.status);
    if (contractForm.file) formData.append('document_file', contractForm.file);

    try {
      await dispatch(createContractDocument(formData)).unwrap();
      setIsContractModalOpen(false);
      setContractForm({ client: '', document_name: '', contract_type: 'MSA', sow_number: '', contract_value: '', start_date: '', end_date: '', status: 'ACTIVE', file: null });
      setFeedback({ type: 'success', message: 'Contract agreement / SOW uploaded and logged!' });
      dispatch(fetchContractDocuments());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to save contract document' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRateCard = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createRateCard(rateCardForm)).unwrap();
      setIsRateCardModalOpen(false);
      setRateCardForm({ client: '', job_title: '', standard_hourly_rate: '135.00', overtime_hourly_rate: '175.00', effective_date: '', is_active: true });
      setFeedback({ type: 'success', message: 'Client bill rate card created!' });
      dispatch(fetchRateCards());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to create rate card' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await clientService.createClientContact(contactForm);
      setIsContactModalOpen(false);
      setContactForm({ client: '', contact_type: 'Primary', client_first_name: '', client_last_name: '', client_email: '', client_phone_number: '', client_title: '', client_location: '' });
      setFeedback({ type: 'success', message: 'Client contact added to directory!' });
      dispatch(fetchClientContacts());
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to add client contact' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await clientService.createWorkLocation(locationForm);
      setIsLocationModalOpen(false);
      setLocationForm({ client: '', location_name: '', address_line_1: '', city: '', state: 'CA', zip_code: '', is_primary: true });
      setFeedback({ type: 'success', message: 'Work location registered!' });
      dispatch(fetchWorkLocations());
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to add location' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'ACTIVE').toUpperCase();
    if (s === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active Client
        </span>
      );
    }
    if (s === 'PROSPECT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Prospect / Lead
        </span>
      );
    }
    if (s === 'TERMINATED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Terminated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
        Inactive
      </span>
    );
  };

  if (loading && (!clients || clients.length === 0)) {
    return (
      <div className={`min-h-screen p-6 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f1117] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'}`}>
        <PageLoader 
          message="Loading Client Directory & Contracts..."
          subMessage="Fetching active corporate accounts, MSA agreements, and rate cards"
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
              Client Accounts & MSA Contract Hub
            </h1>
            <span
              style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor, borderColor: `${activeHexColor}30` }}
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              Enterprise MSAs & Rate Cards Live
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Master services agreements, SOW deliverables, standard bill rate cards, and background verification compliance.
          </p>
        </div>

        {/* Action Suite */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRateCardModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Add Rate Card</span>
          </button>

          <button
            onClick={() => setIsContractModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-500" />
            <span>Upload SOW / MSA</span>
          </button>

          <button
            onClick={() => setIsClientModalOpen(true)}
            style={{ backgroundColor: activeHexColor }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Client</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Client Accounts', value: metrics.totalClients, sub: 'ENTERPRISE ACCOUNTS', icon: Building2, color: activeHexColor },
          { label: 'Active MSAs & SOWs', value: metrics.totalContracts, sub: 'CONTRACT DOCUMENTS', icon: FileText, color: '#8B5CF6' },
          { label: 'Bill Rate Cards', value: metrics.totalRateCards, sub: 'NEGOTIATED RATES', icon: DollarSign, color: '#10B981' },
          { label: 'Total Value', value: `$${metrics.totalContractValue.toLocaleString()}`, sub: 'COMMITTED SOWs', icon: CreditCard, color: '#EC4899' },
          { label: 'Work Locations', value: metrics.totalLocations, sub: 'DELIVERY HUBS', icon: MapPin, color: '#06B6D4' },
          { label: 'Key Contacts', value: metrics.totalContacts, sub: 'PROCUREMENT & AP', icon: Users, color: '#F59E0B' }
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
            { id: 'accounts', label: 'Client Accounts', icon: Building2 },
            { id: 'contracts', label: 'Contracts & SOWs', icon: FileText },
            { id: 'ratecards', label: 'Bill Rate Cards', icon: DollarSign },
            { id: 'contacts', label: 'Client Contacts', icon: Phone },
            { id: 'locations', label: 'Work Locations', icon: MapPin },
            { id: 'verifications', label: 'Compliance & Checks', icon: ShieldCheck }
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

        {/* View Mode & Refresh */}
        <div className="flex items-center gap-2">
          {activeTab === 'accounts' && (
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
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. TAB PANELS */}

      {/* --- TAB 1: CLIENT ACCOUNTS --- */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[220px] ${
                isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search client accounts by name, code, industry..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium outline-none ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Clients</option>
                <option value="PROSPECT">Prospects / Leads</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Showing {filteredClients.length} of {(clients || []).length} accounts
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
                      <th className="py-3.5 px-4">Client Name & Code</th>
                      <th className="py-3.5 px-4">Industry</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Payment Terms</th>
                      <th className="py-3.5 px-4">Billing Contact</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-500">
                          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No client accounts match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          onClick={() => handleOpenDetail(client)}
                          className={`cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase"
                                style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                              >
                                {(client.client_name || 'C')[0]}
                              </div>
                              <div>
                                <div className="font-semibold">{client.client_name}</div>
                                <div className="text-[11px] font-mono text-zinc-400">{client.client_code || `CLI-${1000 + client.id}`}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {client.industry || 'Enterprise'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>{client.city || 'New York'}, {client.state || 'NY'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-blue-500">
                            {client.payment_terms || 'NET_30'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium">{client.email || 'ap@client.com'}</div>
                            <div className="text-zinc-400 text-[11px]">{client.contact_no || '+1 (555) 0100'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(client.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenDetail(client)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                                }`}
                                title="View Client 360 Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClient(client)}
                                className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"
                                title="Archive Client"
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
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleOpenDetail(client)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    isDarkMode ? 'bg-[#131722] border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm uppercase"
                        style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                      >
                        {(client.client_name || 'C')[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{client.client_name}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{client.client_code || `CLI-${1000 + client.id}`}</p>
                      </div>
                    </div>
                    {getStatusBadge(client.status)}
                  </div>

                  <div className={`p-3 rounded-xl mb-4 text-xs space-y-2 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Industry:</span>
                      <span className="font-semibold">{client.industry || 'Technology'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Terms:</span>
                      <span className="font-mono font-semibold">{client.payment_terms || 'NET_30'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Location:</span>
                      <span className="font-semibold">{client.city || 'New York'}, {client.state || 'NY'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-xs">
                    <span className="font-mono text-zinc-400">FEIN: {client.fein_ein || 'Registered'}</span>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: activeHexColor }}>
                      View Account <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: CONTRACTS & SOWs --- */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Master Service Agreements (MSAs) & SOW Deliverables
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Executed client contracts, statements of work, committed budgets, and legal renewal dates.
                </p>
              </div>
              <button
                onClick={() => setIsContractModalOpen(true)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Upload SOW / MSA
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
                    <th className="py-3.5 px-4">Contract Document</th>
                    <th className="py-3.5 px-4">Type & Code</th>
                    <th className="py-3.5 px-4">Start / End Dates</th>
                    <th className="py-3.5 px-4">Committed Value ($)</th>
                    <th className="py-3.5 px-4">Contract Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                  {(contracts || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No contract agreements or SOWs uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    (contracts || []).map((cnt) => (
                      <tr key={cnt.id} className={isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-4 font-semibold">{cnt.document_name}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cnt.contract_type === 'MSA' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {cnt.contract_type} {cnt.sow_number ? `(${cnt.sow_number})` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          {cnt.start_date || 'Active'} to {cnt.end_date || 'Continuous'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-500">
                          ${parseFloat(cnt.contract_value || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {cnt.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setFeedback({ type: 'success', message: `Contract document "${cnt.document_name}" downloaded!` })}
                            className="px-3 py-1.5 rounded-xl border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 text-xs font-semibold"
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

      {/* --- TAB 3: BILL RATE CARDS --- */}
      {activeTab === 'ratecards' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Client Negotiated Billing Rate Cards
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Standardized client role rates, overtime multipliers, and effective contract rate cards.
                </p>
              </div>
              <button
                onClick={() => setIsRateCardModalOpen(true)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Rate Card
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(rateCards || []).map((rc) => (
              <div
                key={rc.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Active Rate Card
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="font-bold text-sm mb-3">{rc.job_title}</h3>
                <div className={`p-3 rounded-xl space-y-2 text-xs mb-4 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Standard Bill Rate:</span>
                    <span className="font-mono font-extrabold text-emerald-500 text-sm">${rc.standard_hourly_rate}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Overtime Rate:</span>
                    <span className="font-mono font-bold text-blue-500">${rc.overtime_hourly_rate || '165.00'}/hr</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-800/40">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Effective Since:</span>
                    <span className="font-mono text-zinc-400">{rc.effective_date || 'Active'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: CLIENT CONTACTS --- */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  Client Stakeholders & Procurement Contacts
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Roster of accounts payable leads, technical hiring managers, and vendor management directors.
                </p>
              </div>
              <button
                onClick={() => setIsContactModalOpen(true)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Client Contact
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(contacts || []).map((ct) => (
              <div
                key={ct.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {ct.contact_type || 'Primary'}
                  </span>
                  <Phone className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="font-bold text-sm mb-1">{ct.client_first_name} {ct.client_last_name}</h3>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{ct.client_title || 'Procurement Lead'}</p>
                <div className={`p-3 rounded-xl space-y-1.5 text-xs ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{ct.client_email || 'client.contact@client.com'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{ct.client_phone_number || '+1 (212) 555-0145'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: WORK LOCATIONS --- */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  Client Headquarters & Physical Delivery Hubs
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Client office facilities, campuses, and deployment locations.
                </p>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Work Location
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(workLocations || []).map((loc) => (
              <div
                key={loc.id}
                className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm">{loc.location_name || 'Wall Street Global HQ'}</h3>
                  {loc.is_primary && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      PRIMARY HQ
                    </span>
                  )}
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {loc.address_line_1} {loc.address_line_2}, {loc.city}, {loc.state} {loc.zip_code}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 6: COMPLIANCE & CHECKS --- */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Client Specific Background Check & Screening Rules
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Pre-employment screening requirements, drug test panels, and vendor compliance rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(verifications || []).map((vf) => (
              <div
                key={vf.id}
                className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Screening Policy Active
                  </span>
                  <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                <div className={`p-3 rounded-xl space-y-2 text-xs mb-4 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Background Check Vendor:</span>
                    <span className="font-semibold">{vf.bg_verification_vendor || 'Checkr Global'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Drug Screening Vendor:</span>
                    <span className="font-semibold">{vf.dt_vendor || 'Quest Diagnostics 10-Panel'}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800/40">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Client Rule Requirements:</span>
                    <p className="mt-1 font-medium">{vf.rules || 'Standard 7-year background and drug test required.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS & POPUPS (SCROLLABLE & MAX-H-90VH) */}
      {/* ========================================================================= */}

      {/* REGISTER CLIENT MODAL */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-3xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: activeHexColor }} />
                Register Enterprise Client Account
              </h3>
              <button onClick={() => setIsClientModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="clientFormId" onSubmit={handleCreateClient} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Client Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.client_name}
                    onChange={(e) => setClientForm({ ...clientForm, client_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="FinTech Prime International"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Client Code</label>
                  <input
                    type="text"
                    value={clientForm.client_code}
                    onChange={(e) => setClientForm({ ...clientForm, client_code: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="CLI-1001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Industry</label>
                  <input
                    type="text"
                    value={clientForm.industry}
                    onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="FinTech & Banking"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">FEIN / Tax ID</label>
                  <input
                    type="text"
                    value={clientForm.fein_ein}
                    onChange={(e) => setClientForm({ ...clientForm, fein_ein: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="13-9876543"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Payment Terms</label>
                  <select
                    value={clientForm.payment_terms}
                    onChange={(e) => setClientForm({ ...clientForm, payment_terms: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="NET_45">Net 45 Days</option>
                    <option value="NET_60">Net 60 Days</option>
                    <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Billing Email *</label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="invoicing@fintechprime.com"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={clientForm.contact_no}
                    onChange={(e) => setClientForm({ ...clientForm, contact_no: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="+1 (212) 555-0144"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pb-2">
                <div className="col-span-2">
                  <label className="block mb-1 font-semibold">Billing Address</label>
                  <input
                    type="text"
                    value={clientForm.billing_address_line_1}
                    onChange={(e) => setClientForm({ ...clientForm, billing_address_line_1: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="100 Wall Street, 28th Floor"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    value={clientForm.billing_city}
                    onChange={(e) => setClientForm({ ...clientForm, billing_city: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="New York"
                  />
                </div>
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="clientFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
              >
                {actionLoading ? 'Saving...' : 'Register Client Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD CONTRACT / SOW MODAL */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Upload Contract / SOW Document
              </h3>
              <button onClick={() => setIsContractModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="contractFormId" onSubmit={handleCreateContract} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Associated Client *</label>
                <select
                  required
                  value={contractForm.client}
                  onChange={(e) => setContractForm({ ...contractForm, client: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">Select Associated Client</option>
                  {(clients || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.client_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Contract Document Title *</label>
                <input
                  type="text"
                  required
                  value={contractForm.document_name}
                  onChange={(e) => setContractForm({ ...contractForm, document_name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Master Service Agreement (MSA 2026)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Contract Type</label>
                  <select
                    value={contractForm.contract_type}
                    onChange={(e) => setContractForm({ ...contractForm, contract_type: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="MSA">Master Service Agreement (MSA)</option>
                    <option value="SOW">Statement of Work (SOW)</option>
                    <option value="NDA">Non-Disclosure Agreement (NDA)</option>
                    <option value="COI">Certificate of Insurance (COI)</option>
                    <option value="AMENDMENT">Contract Amendment</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">SOW Identifier Code</label>
                  <input
                    type="text"
                    value={contractForm.sow_number}
                    onChange={(e) => setContractForm({ ...contractForm, sow_number: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="SOW-042-CORE"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Committed Contract Value ($)</label>
                  <input
                    type="number"
                    value={contractForm.contract_value}
                    onChange={(e) => setContractForm({ ...contractForm, contract_value: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="2500000.00"
                  />
                </div>
                <div>
                  <StunningDatePicker
                    label="Contract End / Expiry Date"
                    value={contractForm.end_date}
                    onChange={(dateVal) => setContractForm({ ...contractForm, end_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select expiry date"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Select Contract File (PDF, DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setContractForm({ ...contractForm, file: e.target.files[0] })}
                  className="text-xs"
                />
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="contractFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
              >
                {actionLoading ? 'Uploading...' : 'Save Contract Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BILL RATE CARD MODAL */}
      {isRateCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Add Client Negotiated Bill Rate Card
              </h3>
              <button onClick={() => setIsRateCardModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="rateCardFormId" onSubmit={handleCreateRateCard} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Associated Client *</label>
                <select
                  required
                  value={rateCardForm.client}
                  onChange={(e) => setRateCardForm({ ...rateCardForm, client: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">Select Associated Client</option>
                  {(clients || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.client_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Role / Job Title *</label>
                <input
                  type="text"
                  required
                  value={rateCardForm.job_title}
                  onChange={(e) => setRateCardForm({ ...rateCardForm, job_title: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Senior Distributed Systems Architect"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Standard Bill Rate ($/hr) *</label>
                  <input
                    type="number"
                    required
                    value={rateCardForm.standard_hourly_rate}
                    onChange={(e) => setRateCardForm({ ...rateCardForm, standard_hourly_rate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono font-bold text-emerald-500 ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Overtime Hourly Rate ($/hr)</label>
                  <input
                    type="number"
                    value={rateCardForm.overtime_hourly_rate}
                    onChange={(e) => setRateCardForm({ ...rateCardForm, overtime_hourly_rate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <StunningDatePicker
                  label="Effective Date"
                  value={rateCardForm.effective_date}
                  onChange={(dateVal) => setRateCardForm({ ...rateCardForm, effective_date: dateVal })}
                  activeHexColor={activeHexColor}
                  placeholder="Select effective date"
                />
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsRateCardModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="rateCardFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
              >
                {actionLoading ? 'Saving...' : 'Save Rate Card'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT 360 DETAIL MODAL */}
      {isDetailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-3xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-6 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base uppercase shrink-0"
                  style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                >
                  {(selectedClient.client_name || 'C')[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedClient.client_name}</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {selectedClient.client_code || 'CLI'} • {selectedClient.industry} • {selectedClient.email}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Client Account Status
                  </span>
                  {getStatusBadge(selectedClient.status)}
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Billing Terms
                  </span>
                  <span className="font-mono font-bold text-sm text-blue-500">{selectedClient.payment_terms || 'NET_30'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2.5 ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-2">Corporate Profile</h4>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>FEIN / Tax ID:</span>
                    <span className="font-mono font-semibold">{selectedClient.fein_ein || 'Registered'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Headquarters:</span>
                    <span className="font-semibold">{selectedClient.city}, {selectedClient.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Phone:</span>
                    <span className="font-semibold">{selectedClient.contact_no || 'N/A'}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2.5 ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-2">Billing Remittance Address</h4>
                  <p className={isDarkMode ? 'text-zinc-300' : 'text-slate-600'}>
                    {selectedClient.billing_address_line_1 || '100 Wall Street'}<br />
                    {selectedClient.billing_city || selectedClient.city}, {selectedClient.billing_state || selectedClient.state} {selectedClient.billing_zip_code || ''}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 border-t shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                onClick={() => handleDeleteClient(selectedClient)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all"
              >
                Archive Client Account
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Close
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
