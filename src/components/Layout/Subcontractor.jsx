import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Briefcase, Building2, Users, FileText, Shield, DollarSign,
  Plus, Download, UploadCloud, Search, CheckCircle, Clock,
  Eye, Mail, Phone, Calendar, MapPin, LayoutGrid, List,
  RefreshCw, Check, X, AlertCircle, ExternalLink, ChevronRight,
  ChevronLeft, ChevronDown, Trash2, Edit, FileSpreadsheet,
  FileCheck, Globe, CreditCard, ShieldAlert, Award
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import {
  fetchSubcontractors,
  createSubcontractor,
  updateSubcontractor,
  deleteSubcontractor,
  fetchPlacements,
  createPlacement,
  fetchInvoices,
  createInvoice,
  fetchW9Forms,
  createW9Form,
  fetchContacts,
  fetchWorkLocations
} from '../../store/subcontractorSlice';
import subcontractorService from '../../services/subcontractorService';
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

export default function Subcontractor() {
  const dispatch = useDispatch();
  const { isDarkMode, accentColor, themeColors = THEME_COLORS } = useTheme();

  // Dynamic Theme Color Calculation
  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);
  
  const activeHexColor = activeColorObj.color;

  // Redux state
  const {
    subcontractors,
    placements,
    invoices,
    w9Forms,
    contacts,
    workLocations,
    loading
  } = useSelector((state) => state.subcontractor || {});

  // Local tab and filters
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'placements' | 'invoices' | 'w9' | 'contacts' | 'locations'
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [selectedSubcontractor, setSelectedSubcontractor] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isW9ModalOpen, setIsW9ModalOpen] = useState(false);

  // Feedback & Confirm Modals
  const [feedback, setFeedback] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [vendorForm, setVendorForm] = useState({
    subcontractor_name: '',
    vendor_code: '',
    fein_ein: '',
    contract_name: '',
    vendor_type: 'STAFFING_AGENCY',
    status: 'ACTIVE',
    payment_terms: 'NET_30',
    payment_method: 'DIRECT_DEPOSIT_ACH',
    city: '',
    state: 'CA',
    email: '',
    phone_no: '',
    website: '',
    bank_name: '',
    routing_number_aba: '',
    account_number: '',
    account_holder_name: '',
    general_liability_coverage: '1000000',
    workers_comp_coverage: '1000000',
    insurance_expiry_date: ''
  });

  const [placementForm, setPlacementForm] = useState({
    subcontractor: '',
    candidate_first_name: '',
    candidate_last_name: '',
    candidate_email: '',
    candidate_phone: '',
    job_title: '',
    client_name: '',
    start_date: '',
    end_date: '',
    pay_rate: '85.00',
    bill_rate: '125.00',
    status: 'Active'
  });

  const [invoiceForm, setInvoiceForm] = useState({
    subcontractor: '',
    invoice_number: '',
    invoice_date: '',
    due_date: '',
    period_start: '',
    period_end: '',
    total_hours: '160',
    total_amount: '13600.00',
    status: 'SUBMITTED',
    notes: ''
  });

  const [w9FormState, setW9FormState] = useState({
    subcontractor: '',
    name: '',
    business_name: '',
    tax_classification: 'LLC',
    llc_classification: 'C',
    address: '',
    city: '',
    state: 'CA',
    zip_code: '',
    tin_type: 'EIN',
    ein: '',
    signature_name: '',
    signature_date: '',
    is_signed: true
  });

  // Initial Load
  useEffect(() => {
    loadAllData();
  }, [dispatch]);

  const loadAllData = () => {
    dispatch(fetchSubcontractors());
    dispatch(fetchPlacements());
    dispatch(fetchInvoices());
    dispatch(fetchW9Forms());
    dispatch(fetchContacts());
    dispatch(fetchWorkLocations());
  };

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return (subcontractors || []).filter((sub) => {
      const name = (sub.subcontractor_name || '').toLowerCase();
      const code = (sub.vendor_code || '').toLowerCase();
      const email = (sub.email || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = name.includes(query) || code.includes(query) || email.includes(query);
      const matchesType = vendorTypeFilter === 'ALL' || sub.vendor_type === vendorTypeFilter;
      const matchesStatus = statusFilter === 'ALL' || (sub.status || '').toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [subcontractors, searchTerm, vendorTypeFilter, statusFilter]);

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const totalVendors = (subcontractors || []).length;
    const activePlacements = (placements || []).filter(p => p.status === 'Active').length;
    const pendingCompliance = (subcontractors || []).filter(s => s.status === 'PENDING_COMPLIANCE').length;
    const totalInvoiced = (invoices || []).reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
    const certifiedW9 = (w9Forms || []).filter(w => w.is_signed).length;
    const totalLocations = (workLocations || []).length;

    return { totalVendors, activePlacements, pendingCompliance, totalInvoiced, certifiedW9, totalLocations };
  }, [subcontractors, placements, invoices, w9Forms, workLocations]);

  // Actions
  const handleOpenDetail = (sub) => {
    setSelectedSubcontractor(sub);
    setIsDetailModalOpen(true);
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createSubcontractor(vendorForm)).unwrap();
      setIsVendorModalOpen(false);
      setVendorForm({
        subcontractor_name: '',
        vendor_code: '',
        fein_ein: '',
        contract_name: '',
        vendor_type: 'STAFFING_AGENCY',
        status: 'ACTIVE',
        payment_terms: 'NET_30',
        payment_method: 'DIRECT_DEPOSIT_ACH',
        city: '',
        state: 'CA',
        email: '',
        phone_no: '',
        website: '',
        bank_name: '',
        routing_number_aba: '',
        account_number: '',
        account_holder_name: '',
        general_liability_coverage: '1000000',
        workers_comp_coverage: '1000000',
        insurance_expiry_date: ''
      });
      setFeedback({ type: 'success', message: 'Subcontractor vendor registered in directory!' });
      dispatch(fetchSubcontractors());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to register vendor' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVendor = (sub) => {
    setConfirmDialog({
      title: 'Remove Subcontractor Vendor',
      message: `Are you sure you want to deactivate and remove "${sub.subcontractor_name}" from active operations?`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await dispatch(deleteSubcontractor(sub.id)).unwrap();
          setFeedback({ type: 'success', message: 'Vendor archived successfully.' });
          setConfirmDialog(null);
          setIsDetailModalOpen(false);
          dispatch(fetchSubcontractors());
        } catch (err) {
          setFeedback({ type: 'error', message: 'Failed to delete vendor' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleCreatePlacement = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createPlacement(placementForm)).unwrap();
      setIsPlacementModalOpen(false);
      setPlacementForm({
        subcontractor: '',
        candidate_first_name: '',
        candidate_last_name: '',
        candidate_email: '',
        candidate_phone: '',
        job_title: '',
        client_name: '',
        start_date: '',
        end_date: '',
        pay_rate: '85.00',
        bill_rate: '125.00',
        status: 'Active'
      });
      setFeedback({ type: 'success', message: '1099 Placement recorded and mapped!' });
      dispatch(fetchPlacements());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to record placement' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createInvoice(invoiceForm)).unwrap();
      setIsInvoiceModalOpen(false);
      setInvoiceForm({
        subcontractor: '',
        invoice_number: '',
        invoice_date: '',
        due_date: '',
        period_start: '',
        period_end: '',
        total_hours: '160',
        total_amount: '13600.00',
        status: 'SUBMITTED',
        notes: ''
      });
      setFeedback({ type: 'success', message: 'Vendor invoice submitted for payment approval!' });
      dispatch(fetchInvoices());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to submit invoice' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateW9 = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createW9Form(w9FormState)).unwrap();
      setIsW9ModalOpen(false);
      setFeedback({ type: 'success', message: 'Form W-9 certification registered and saved!' });
      dispatch(fetchW9Forms());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to save W-9 Form' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadW9 = async (w9) => {
    setActionLoading(true);
    try {
      const response = await subcontractorService.downloadW9Pdf(w9.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Form_W9_${w9.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: 'success', message: 'IRS Form W-9 PDF downloaded!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to download W-9 PDF' });
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
          Active Vendor
        </span>
      );
    }
    if (s === 'PENDING_COMPLIANCE' || s === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Pending Compliance
        </span>
      );
    }
    if (s === 'BLACKLISTED' || s === 'TERMINATED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Blacklisted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
        Inactive
      </span>
    );
  };

  if (loading && (!subcontractors || subcontractors.length === 0)) {
    return (
      <div className={`min-h-screen p-6 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f1117] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'}`}>
        <PageLoader 
          message="Loading Subcontractor Roster & 1099 Records..."
          subMessage="Fetching C2C vendor agreements, COI insurance records, and W-9 certificates"
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
              Subcontractors & 1099 Vendor Hub
            </h1>
            <span
              style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor, borderColor: `${activeHexColor}30` }}
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              C2C, 1099 & Staffing Suite Live
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Master services agreements, COI insurance monitoring, 1099 placement tracking, vendor remittances, and IRS Form W-9 certification.
          </p>
        </div>

        {/* Global Action Suite */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsW9ModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Certify W-9</span>
          </button>

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <DollarSign className="w-4 h-4 text-pink-500" />
            <span>Submit Invoice</span>
          </button>

          <button
            onClick={() => setIsPlacementModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <Users className="w-4 h-4 text-purple-500" />
            <span>Add 1099 Placement</span>
          </button>

          <button
            onClick={() => setIsVendorModalOpen(true)}
            style={{ backgroundColor: activeHexColor }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Vendor</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Active Vendors', value: metrics.totalVendors, sub: 'STAFFING & C2C', icon: Building2, color: activeHexColor },
          { label: '1099 Placements', value: metrics.activePlacements, sub: 'PLACED TALENT', icon: Users, color: '#8B5CF6' },
          { label: 'Pending Review', value: metrics.pendingCompliance, sub: 'COI & COMPLIANCE', icon: ShieldAlert, color: '#F59E0B' },
          { label: 'Total Invoiced', value: `$${metrics.totalInvoiced.toLocaleString()}`, sub: 'REMITTANCES', icon: DollarSign, color: '#EC4899' },
          { label: 'Certified W-9s', value: metrics.certifiedW9, sub: 'IRS TAX LEDGER', icon: FileCheck, color: '#10B981' },
          { label: 'Work Locations', value: metrics.totalLocations, sub: 'SATELLITE HUBS', icon: MapPin, color: '#06B6D4' }
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
            { id: 'vendors', label: 'Vendor Directory', icon: Building2 },
            { id: 'placements', label: '1099 Placements', icon: Users },
            { id: 'invoices', label: 'Invoices & Remittances', icon: DollarSign },
            { id: 'w9', label: 'Form W-9 Tax Suite', icon: FileSpreadsheet },
            { id: 'contacts', label: 'Vendor Contacts', icon: Phone },
            { id: 'locations', label: 'Work Locations', icon: MapPin }
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
          {activeTab === 'vendors' && (
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

      {/* --- TAB 1: VENDOR DIRECTORY --- */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[220px] ${
                isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search vendors by name, code, email..."
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
                value={vendorTypeFilter}
                onChange={(e) => setVendorTypeFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium outline-none ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <option value="ALL">All Vendor Types</option>
                <option value="STAFFING_AGENCY">Staffing Agency</option>
                <option value="1099_INDEPENDENT_CONTRACTOR">1099 Contractor</option>
                <option value="C2C_CORP_TO_CORP">C2C Corp-to-Corp</option>
                <option value="CONSULTING_FIRM">Consulting Firm</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium outline-none ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Vendors</option>
                <option value="PENDING_COMPLIANCE">Pending Compliance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Showing {filteredVendors.length} of {(subcontractors || []).length} vendors
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
                      <th className="py-3.5 px-4">Vendor & Code</th>
                      <th className="py-3.5 px-4">Vendor Type</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Payment Terms</th>
                      <th className="py-3.5 px-4">Insurance COI</th>
                      <th className="py-3.5 px-4">Compliance Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                    {filteredVendors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-500">
                          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No subcontractor vendors match filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map((sub) => (
                        <tr
                          key={sub.id}
                          onClick={() => handleOpenDetail(sub)}
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
                                {(sub.subcontractor_name || 'V')[0]}
                              </div>
                              <div>
                                <div className="font-semibold">{sub.subcontractor_name}</div>
                                <div className="text-[11px] font-mono text-zinc-400">{sub.vendor_code || `VEND-${100 + sub.id}`}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {sub.vendor_type || 'STAFFING_AGENCY'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>{sub.city || 'San Jose'}, {sub.state || 'CA'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold">
                            {sub.payment_terms || 'NET_30'}
                          </td>
                          <td className="py-3.5 px-4">
                            {sub.insurance_expiry_date ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500 font-medium text-[11px]">
                                <CheckCircle className="w-3.5 h-3.5" /> Covered ({sub.insurance_expiry_date})
                              </span>
                            ) : (
                              <span className="text-amber-500 text-[11px] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> COI Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(sub.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenDetail(sub)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                                }`}
                                title="View 360 Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteVendor(sub)}
                                className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"
                                title="Archive Vendor"
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
              {filteredVendors.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleOpenDetail(sub)}
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
                        {(sub.subcontractor_name || 'V')[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{sub.subcontractor_name}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{sub.vendor_code || `VEND-${100 + sub.id}`}</p>
                      </div>
                    </div>
                    {getStatusBadge(sub.status)}
                  </div>

                  <div className={`p-3 rounded-xl mb-4 text-xs space-y-2 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Type:</span>
                      <span className="font-semibold">{sub.vendor_type || 'STAFFING_AGENCY'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Payment Terms:</span>
                      <span className="font-mono font-semibold">{sub.payment_terms || 'NET_30'} ({sub.payment_method || 'ACH'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Location:</span>
                      <span className="font-semibold">{sub.city || 'San Jose'}, {sub.state || 'CA'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-xs">
                    <span className="font-mono text-zinc-400">FEIN: {sub.fein_ein || 'Registered'}</span>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: activeHexColor }}>
                      View Profile <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: 1099 PLACEMENTS --- */}
      {activeTab === 'placements' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  1099 Placed Candidates & Gross Margin Ledgers
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Live contract rate cards, bill rates, pay rates, and active client deployment status.
                </p>
              </div>
              <button
                onClick={() => setIsPlacementModalOpen(true)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Record New Placement
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
                    <th className="py-3.5 px-4">Placed Talent</th>
                    <th className="py-3.5 px-4">Role & Client</th>
                    <th className="py-3.5 px-4">Start / End Dates</th>
                    <th className="py-3.5 px-4">Pay Rate ($/hr)</th>
                    <th className="py-3.5 px-4">Bill Rate ($/hr)</th>
                    <th className="py-3.5 px-4">Gross Margin</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                  {(placements || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No 1099 candidate placements found.
                      </td>
                    </tr>
                  ) : (
                    (placements || []).map((pl) => {
                      const pay = parseFloat(pl.pay_rate || 0);
                      const bill = parseFloat(pl.bill_rate || 0);
                      const margin = bill > 0 ? (((bill - pay) / bill) * 100).toFixed(1) : '0';
                      return (
                        <tr key={pl.id} className={isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'}>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold">{pl.candidate_first_name} {pl.candidate_last_name}</div>
                            <div className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{pl.candidate_email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium">{pl.job_title}</div>
                            <div className="text-zinc-400 text-[11px]">Client: {pl.client_name || 'FinTech Prime'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-400">
                            {pl.start_date} to {pl.end_date || 'Present'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-rose-500">${pl.pay_rate}/hr</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">${pl.bill_rate}/hr</td>
                          <td className="py-3.5 px-4 font-mono font-extrabold text-blue-500">
                            +{margin}%
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              {pl.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: INVOICES & REMITTANCES --- */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-pink-500" />
                  Vendor Invoices & Remittance Ledgers
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Bi-weekly and monthly contractor billing approvals, hours auditing, and ACH payment release.
                </p>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Submit New Invoice
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
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Invoice Date</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Hours Logged</th>
                    <th className="py-3.5 px-4">Total Amount ($)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                  {(invoices || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No vendor invoices submitted yet.
                      </td>
                    </tr>
                  ) : (
                    (invoices || []).map((inv) => (
                      <tr key={inv.id} className={isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-500">{inv.invoice_number}</td>
                        <td className="py-3.5 px-4">{inv.invoice_date}</td>
                        <td className="py-3.5 px-4">{inv.due_date || 'Net 30'}</td>
                        <td className="py-3.5 px-4 font-mono">{inv.total_hours} hrs</td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-500">${parseFloat(inv.total_amount).toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            inv.status === 'APPROVED' || inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setFeedback({ type: 'success', message: `Invoice #${inv.invoice_number} approved for ACH wire batch!` })}
                            className="px-3 py-1.5 rounded-xl border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-xs font-semibold"
                          >
                            Approve Payment
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

      {/* --- TAB 4: FORM W-9 TAX CERTIFICATION --- */}
      {activeTab === 'w9' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  IRS Form W-9 (Request for Taxpayer ID & Certification)
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Legally binding taxpayer identification, FATCA reporting codes, backup withholding exemptions, and digital e-signatures.
                </p>
              </div>
              <button
                onClick={() => setIsW9ModalOpen(true)}
                style={{ backgroundColor: activeHexColor }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Certify New Form W-9
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(w9Forms || []).map((w9) => (
              <div
                key={w9.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      IRS W-9 CERTIFIED
                    </span>
                    <h3 className="font-bold text-sm mt-1">{w9.name}</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{w9.business_name || 'Disregarded Entity'}</p>
                  </div>
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                </div>

                <div className={`p-3 rounded-xl space-y-2 text-xs mb-4 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Federal Classification:</span>
                    <span className="font-semibold">{w9.tax_classification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Tax ID ({w9.tin_type}):</span>
                    <span className="font-mono font-bold">{w9.ein || w9.ssn || 'XX-XXXXXXX'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Registered Address:</span>
                    <span className="font-semibold truncate max-w-[200px]">{w9.address}, {w9.city}, {w9.state} {w9.zip_code}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-800/40">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Digitally Signed By:</span>
                    <span className="text-emerald-500 font-semibold">{w9.signature_name || 'Authorized Signer'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-xs">
                  <span className="text-zinc-400 font-mono">Date: {w9.signature_date || 'Certified'}</span>
                  <button
                    onClick={() => handleDownloadW9(w9)}
                    style={{ color: activeHexColor }}
                    className="font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Official W-9 PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: VENDOR CONTACTS --- */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" />
              Vendor Account Managers & Recruiter Roster
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Direct point of contact directory for staffing agency recruiters, account directors, and billing specialists.
            </p>
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
                    {ct.contact_type || 'Account Manager'}
                  </span>
                  <Phone className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="font-bold text-sm mb-1">{ct.first_name} {ct.last_name}</h3>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{ct.title || 'Client Partner'}</p>
                <div className={`p-3 rounded-xl space-y-1.5 text-xs ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{ct.email || 'contact@vendor.com'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{ct.phone_number || ct.office_number || '+1 (555) 019-2810'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 6: WORK LOCATIONS --- */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500" />
              Vendor Headquarters & Satellite Offices
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Geographic delivery centers and compliance work locations.
            </p>
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
                  <h3 className="font-bold text-sm">{loc.location_name || 'Primary Delivery Center'}</h3>
                  {loc.is_primary && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      HEADQUARTERS
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

      {/* ========================================================================= */}
      {/* 5. MODALS & POPUPS (ALL SCROLLABLE & MAX-H-90VH) */}
      {/* ========================================================================= */}

      {/* REGISTER VENDOR MODAL */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-3xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: activeHexColor }} />
                Register Subcontractor / 1099 Vendor
              </h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="vendorFormId" onSubmit={handleCreateVendor} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Vendor / Legal Business Name *</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.subcontractor_name}
                    onChange={(e) => setVendorForm({ ...vendorForm, subcontractor_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Apex Global Talent Solutions"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Vendor Code</label>
                  <input
                    type="text"
                    value={vendorForm.vendor_code}
                    onChange={(e) => setVendorForm({ ...vendorForm, vendor_code: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="VEND-501"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Vendor Type</label>
                  <select
                    value={vendorForm.vendor_type}
                    onChange={(e) => setVendorForm({ ...vendorForm, vendor_type: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="STAFFING_AGENCY">Staffing / Recruitment Agency</option>
                    <option value="1099_INDEPENDENT_CONTRACTOR">1099 Independent Contractor</option>
                    <option value="C2C_CORP_TO_CORP">C2C Corp-to-Corp Vendor</option>
                    <option value="CONSULTING_FIRM">Consulting Firm</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">FEIN / Tax ID</label>
                  <input
                    type="text"
                    value={vendorForm.fein_ein}
                    onChange={(e) => setVendorForm({ ...vendorForm, fein_ein: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="12-3456789"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Payment Terms</label>
                  <select
                    value={vendorForm.payment_terms}
                    onChange={(e) => setVendorForm({ ...vendorForm, payment_terms: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="NET_45">Net 45 Days</option>
                    <option value="NET_60">Net 60 Days</option>
                    <option value="BI_WEEKLY">Bi-Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Billing Email *</label>
                  <input
                    type="email"
                    required
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="billing@apextechstaffing.com"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={vendorForm.phone_no}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone_no: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="+1 (408) 555-0199"
                  />
                </div>
              </div>

              {/* Remittance & Banking */}
              <div className={`p-4 rounded-2xl space-y-3 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-blue-500">ACH Direct Deposit & Remittance</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={vendorForm.bank_name}
                      onChange={(e) => setVendorForm({ ...vendorForm, bank_name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDarkMode ? 'bg-[#131722] border-zinc-700' : 'bg-white border-slate-200'
                      }`}
                      placeholder="JPMorgan Chase"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">9-Digit ABA Routing</label>
                    <input
                      type="text"
                      value={vendorForm.routing_number_aba}
                      onChange={(e) => setVendorForm({ ...vendorForm, routing_number_aba: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDarkMode ? 'bg-[#131722] border-zinc-700' : 'bg-white border-slate-200'
                      }`}
                      placeholder="121000358"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={vendorForm.account_number}
                      onChange={(e) => setVendorForm({ ...vendorForm, account_number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDarkMode ? 'bg-[#131722] border-zinc-700' : 'bg-white border-slate-200'
                      }`}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance COI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                <div>
                  <label className="block mb-1 font-semibold">General Liability Coverage ($)</label>
                  <input
                    type="number"
                    value={vendorForm.general_liability_coverage}
                    onChange={(e) => setVendorForm({ ...vendorForm, general_liability_coverage: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  {/* STUNNING CUSTOM DATE PICKER */}
                  <StunningDatePicker
                    label="COI Insurance Expiry Date"
                    value={vendorForm.insurance_expiry_date}
                    onChange={(dateVal) => setVendorForm({ ...vendorForm, insurance_expiry_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select expiry date"
                  />
                </div>
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsVendorModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="vendorFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
              >
                {actionLoading ? 'Registering...' : 'Register Vendor in Directory'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PLACEMENT MODAL */}
      {isPlacementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Record 1099 Placed Candidate
              </h3>
              <button onClick={() => setIsPlacementModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="placementFormId" onSubmit={handleCreatePlacement} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Subcontractor Vendor *</label>
                <select
                  required
                  value={placementForm.subcontractor}
                  onChange={(e) => setPlacementForm({ ...placementForm, subcontractor: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">Select Associated Subcontractor</option>
                  {(subcontractors || []).map((s) => (
                    <option key={s.id} value={s.id}>{s.subcontractor_name} ({s.vendor_code || 'VEND'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Candidate First Name *</label>
                  <input
                    type="text"
                    required
                    value={placementForm.candidate_first_name}
                    onChange={(e) => setPlacementForm({ ...placementForm, candidate_first_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Elena"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Candidate Last Name *</label>
                  <input
                    type="text"
                    required
                    value={placementForm.candidate_last_name}
                    onChange={(e) => setPlacementForm({ ...placementForm, candidate_last_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Rostova"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={placementForm.job_title}
                    onChange={(e) => setPlacementForm({ ...placementForm, job_title: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Senior Distributed Systems Architect"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Client Name</label>
                  <input
                    type="text"
                    value={placementForm.client_name}
                    onChange={(e) => setPlacementForm({ ...placementForm, client_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="FinTech Prime International"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Contract Pay Rate ($/hr) *</label>
                  <input
                    type="number"
                    required
                    value={placementForm.pay_rate}
                    onChange={(e) => setPlacementForm({ ...placementForm, pay_rate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Client Bill Rate ($/hr) *</label>
                  <input
                    type="number"
                    required
                    value={placementForm.bill_rate}
                    onChange={(e) => setPlacementForm({ ...placementForm, bill_rate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2">
                <div>
                  <StunningDatePicker
                    label="Contract Start Date"
                    value={placementForm.start_date}
                    onChange={(dateVal) => setPlacementForm({ ...placementForm, start_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select start date"
                  />
                </div>
                <div>
                  <StunningDatePicker
                    label="Contract End Date (optional)"
                    value={placementForm.end_date}
                    onChange={(dateVal) => setPlacementForm({ ...placementForm, end_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select end date"
                  />
                </div>
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsPlacementModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="placementFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
              >
                {actionLoading ? 'Saving...' : 'Save Placement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-pink-500" />
                Submit Vendor Invoice
              </h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="invoiceFormId" onSubmit={handleCreateInvoice} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Subcontractor Vendor *</label>
                <select
                  required
                  value={invoiceForm.subcontractor}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, subcontractor: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">Select Associated Subcontractor</option>
                  {(subcontractors || []).map((s) => (
                    <option key={s.id} value={s.id}>{s.subcontractor_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.invoice_number}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="INV-2026-009"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Total Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.total_amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, total_amount: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono font-bold ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="13600.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Total Hours Logged</label>
                  <input
                    type="number"
                    value={invoiceForm.total_hours}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, total_hours: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="160"
                  />
                </div>
                <div>
                  <StunningDatePicker
                    label="Due Date"
                    value={invoiceForm.due_date}
                    onChange={(dateVal) => setInvoiceForm({ ...invoiceForm, due_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select due date"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Notes / Scope Summary</label>
                <textarea
                  rows={2}
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Sprint milestone and deliverables summary..."
                />
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="invoiceFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95"
              >
                {actionLoading ? 'Submitting...' : 'Submit Invoice for Remittance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFY FORM W-9 MODAL */}
      {isW9ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-2xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Certify IRS Form W-9
              </h3>
              <button onClick={() => setIsW9ModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="w9FormId" onSubmit={handleCreateW9} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Name (as on Tax Return) *</label>
                  <input
                    type="text"
                    required
                    value={w9FormState.name}
                    onChange={(e) => setW9FormState({ ...w9FormState, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Apex Global Talent Solutions LLC"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Business / Disregarded Entity Name</label>
                  <input
                    type="text"
                    value={w9FormState.business_name}
                    onChange={(e) => setW9FormState({ ...w9FormState, business_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Apex Global"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Federal Tax Classification</label>
                  <select
                    value={w9FormState.tax_classification}
                    onChange={(e) => setW9FormState({ ...w9FormState, tax_classification: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="INDIVIDUAL">Individual / Sole Proprietor</option>
                    <option value="C_CORP">C Corporation</option>
                    <option value="S_CORP">S Corporation</option>
                    <option value="PARTNERSHIP">Partnership</option>
                    <option value="LLC">Limited Liability Company (LLC)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Employer ID Number (EIN) / SSN *</label>
                  <input
                    type="text"
                    required
                    value={w9FormState.ein}
                    onChange={(e) => setW9FormState({ ...w9FormState, ein: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="12-3456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block mb-1 font-semibold">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={w9FormState.address}
                    onChange={(e) => setW9FormState({ ...w9FormState, address: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="100 Innovation Way, Suite 400"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">City *</label>
                  <input
                    type="text"
                    required
                    value={w9FormState.city}
                    onChange={(e) => setW9FormState({ ...w9FormState, city: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="San Jose"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2">
                <div>
                  <label className="block mb-1 font-semibold">Authorized Signature Name *</label>
                  <input
                    type="text"
                    required
                    value={w9FormState.signature_name}
                    onChange={(e) => setW9FormState({ ...w9FormState, signature_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Robert Vance (Managing Partner)"
                  />
                </div>
                <div>
                  <StunningDatePicker
                    label="Signature Date"
                    value={w9FormState.signature_date}
                    onChange={(dateVal) => setW9FormState({ ...w9FormState, signature_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select signature date"
                  />
                </div>
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsW9ModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="w9FormId"
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow"
              >
                {actionLoading ? 'Saving...' : 'Certify & Save Form W-9'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR 360 DETAIL MODAL */}
      {isDetailModalOpen && selectedSubcontractor && (
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
                  {(selectedSubcontractor.subcontractor_name || 'V')[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedSubcontractor.subcontractor_name}</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {selectedSubcontractor.vendor_code || 'VEND'} • {selectedSubcontractor.email} • {selectedSubcontractor.phone_no}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Status bar */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Vendor Compliance Status
                  </span>
                  {getStatusBadge(selectedSubcontractor.status)}
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Payment Terms
                  </span>
                  <span className="font-mono font-bold text-sm text-emerald-500">{selectedSubcontractor.payment_terms || 'NET_30'}</span>
                </div>
              </div>

              {/* Grid sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2.5 ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-2">Corporate Profile</h4>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Vendor Type:</span>
                    <span className="font-semibold">{selectedSubcontractor.vendor_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>FEIN / Tax ID:</span>
                    <span className="font-mono font-semibold">{selectedSubcontractor.fein_ein || 'On File'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Headquarters:</span>
                    <span className="font-semibold">{selectedSubcontractor.city}, {selectedSubcontractor.state}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2.5 ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-2">COI Insurance & Remittance</h4>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>General Liability:</span>
                    <span className="text-emerald-500 font-semibold font-mono">${selectedSubcontractor.general_liability_coverage || '1,000,000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>COI Expiry:</span>
                    <span className="font-semibold">{selectedSubcontractor.insurance_expiry_date || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Bank / ACH:</span>
                    <span className="font-mono font-semibold">{selectedSubcontractor.bank_name || 'ACH Direct Deposit'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 border-t shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                onClick={() => handleDeleteVendor(selectedSubcontractor)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all"
              >
                Archive Vendor
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
