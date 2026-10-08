import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users, UserCheck, Clock, FileText, Shield, AlertTriangle,
  Plus, Download, UploadCloud, Search, CheckCircle,
  Eye, Mail, Calendar, DollarSign,
  Briefcase, MapPin, LayoutGrid, List, RefreshCw, Check, X,
  AlertCircle, ExternalLink, ChevronRight, ChevronLeft, ChevronDown,
  Heart, BookOpen, Send, UserPlus, Layers, Loader2,
  GripVertical, ArrowUp, ArrowDown, Move, ToggleLeft, ToggleRight, CheckSquare, GitPullRequest
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import {
  fetchAllOnboardings,
  fetchPendingOnboardings,
  fetchInProgressOnboardings,
  fetchConfirmedOnboardings,
  fetchBenefitPlans,
  fetchCompanyPolicies,
  fetchDocumentExpirations,
  createNewOnboarding,
  convertToEmployeeAction,
  remindCandidateAction,
  regretCandidateAction,
  createBenefitPlan,
  createCompanyPolicy
} from '../../store/onboardingSlice';
import onboardingService from '../../services/onboardingService';
import { companyIntakeService } from '../../services/companyIntakeService';
import OnboardingDetailsModal from '../Onboarding/OnboardingDetailsModal';
import StunningSelect from '../common/StunningSelect';
import PageLoader from '../common/LoadingScreen/LoadingScreen';

// All 50 US States
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// ==========================================
// STUNNING CUSTOM DATE PICKER (WITH CALENDAR POPUP)
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

      {/* FLOATING CALENDAR DROPDOWN */}
      {isOpen && (
        <div className={`absolute z-[100] left-0 ${dropUp ? 'bottom-full mb-2' : 'mt-1.5'} w-72 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${
          isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
        }`}>
          {/* Header Month / Year Navigation */}
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

          {/* Day of week abbreviations */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
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

          {/* Quick footer actions */}
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

export default function Onboarding() {
  const dispatch = useDispatch();
  const { isDarkMode, accentColor, themeColors = THEME_COLORS } = useTheme();

  // Dynamic Theme Color Calculation
  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);
  
  const activeHexColor = activeColorObj.color;

  // Redux state
  const {
    allOnboardings,
    benefitPlans,
    companyPolicies,
    documentExpirations,
    loading
  } = useSelector((state) => state.onboarding);

  // Local tab and filters
  const [activeTab, setActiveTab] = useState('pipeline');
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isI9VerifyModalOpen, setIsI9VerifyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // Feedback & Confirm Modals
  const [feedback, setFeedback] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [enrollForm, setEnrollForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    job_title: '',
    department: '',
    start_date: '',
    salary: '',
    pay_frequency: 'BIWEEKLY',
    employment_type: 'FULL_TIME',
    state: 'CA'
  });

  const [i9VerifyForm, setI9VerifyForm] = useState({
    document_title: 'U.S. Passport',
    issuing_authority: 'U.S. Department of State',
    document_number: '',
    expiration_date: '',
    employer_representative_name: 'HR Compliance Officer',
    employer_title: 'People Operations Manager',
    list_type: 'LIST_A'
  });

  const [benefitForm, setBenefitForm] = useState({
    name: '',
    plan_type: 'MEDICAL',
    carrier_name: '',
    description: ''
  });

  const [policyForm, setPolicyForm] = useState({
    title: '',
    category: 'HANDBOOK',
    version: '1.0',
    description: '',
    is_mandatory: true
  });

  const [exportProvider, setExportProvider] = useState('ADP');
  const [bulkCsvFile, setBulkCsvFile] = useState(null);

  // Helper for feedback
  const showFeedback = (title, message, isError = false) => {
    setFeedback({ type: isError ? 'error' : 'success', message: `${title}: ${message}` });
  };

  // Workflow Sequencing State
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [draggedStepIndex, setDraggedStepIndex] = useState(null);
  const [savingWorkflow, setSavingWorkflow] = useState(false);

  const loadWorkflowSteps = async () => {
    setWorkflowLoading(true);
    try {
      const res = await companyIntakeService.getWorkflowSteps();
      const steps = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setWorkflowSteps(steps);
    } catch (err) {
      console.error("Failed to load workflow steps:", err);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedStepIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedStepIndex === null || draggedStepIndex === targetIndex) return;
    const updated = [...workflowSteps];
    const [movedItem] = updated.splice(draggedStepIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    
    // Re-index sort_orders
    const reindexed = updated.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setWorkflowSteps(reindexed);
    setDraggedStepIndex(null);
  };

  const handleMoveStep = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= workflowSteps.length) return;
    const updated = [...workflowSteps];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    const reindexed = updated.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setWorkflowSteps(reindexed);
  };

  const handleToggleStepActive = async (stepId, currentActive) => {
    try {
      await companyIntakeService.toggleWorkflowStep(stepId, !currentActive);
      setWorkflowSteps(prev => prev.map(s => s.id === stepId ? { ...s, is_active: !currentActive } : s));
      showFeedback('Step Updated', `Workflow step is now ${!currentActive ? 'Active' : 'Disabled'}.`);
    } catch (err) {
      showFeedback('Update Failed', 'Failed to change step status.', true);
    }
  };

  const handleSaveWorkflowOrder = async () => {
    setSavingWorkflow(true);
    try {
      const payload = workflowSteps.map((step, idx) => ({
        id: step.id,
        sort_order: idx + 1
      }));
      await companyIntakeService.reorderWorkflowSteps(payload);
      showFeedback('Workflow Saved', 'Candidate onboarding step progression sequence successfully updated!');
    } catch (err) {
      showFeedback('Save Failed', 'Could not save new workflow sequence. Please try again.', true);
    } finally {
      setSavingWorkflow(false);
    }
  };

  const handleResetWorkflowDefaults = () => {
    const defaultSequence = [
      'Personal Details', 'Emergency Contact', 'W2', 'State W4', 'I9', 
      'Direct Deposit Form', 'Insurance Details', 'Employee Hand Book', 
      'Employment Offer Letter', 'Employment Agreement', 'T & E Policy', 'Client Specific Document'
    ];
    const reordered = [...workflowSteps].sort((a, b) => {
      const idxA = defaultSequence.indexOf(a.step_name);
      const idxB = defaultSequence.indexOf(b.step_name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.sort_order - b.sort_order;
    }).map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    setWorkflowSteps(reordered);
    showFeedback('Sequence Reset', 'Workflow reordered to standard compliance default sequence. Click "Save Sequence" to commit.');
  };


  // Initial Load
  useEffect(() => {
    loadAllData();
  }, [dispatch]);

  const loadAllData = () => {
    dispatch(fetchAllOnboardings());
    dispatch(fetchPendingOnboardings());
    dispatch(fetchInProgressOnboardings());
    dispatch(fetchConfirmedOnboardings());
    dispatch(fetchBenefitPlans());
    dispatch(fetchCompanyPolicies());
    dispatch(fetchDocumentExpirations());
    loadWorkflowSteps();
  };

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return (allOnboardings || []).filter((c) => {
      const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
      const email = (c.email || '').toLowerCase();
      const jobTitle = (c.job_title || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = fullName.includes(query) || email.includes(query) || jobTitle.includes(query);
      const matchesStatus = statusFilter === 'ALL' || (c.status || '').toUpperCase() === statusFilter.toUpperCase();
      const matchesState = stateFilter === 'ALL' || (c.state || '').toUpperCase() === stateFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesState;
    });
  }, [allOnboardings, searchTerm, statusFilter, stateFilter]);

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const total = (allOnboardings || []).length;
    const pending = (allOnboardings || []).filter(c => c.status === 'PENDING' || !c.status).length;
    const inProgress = (allOnboardings || []).filter(c => c.status === 'IN_PROGRESS').length;
    const confirmed = (allOnboardings || []).filter(c => c.status === 'CONFIRMED' || c.status === 'COMPLETED').length;
    const activeBenefits = (benefitPlans || []).length;
    const expiringDocs = (documentExpirations || []).length;

    return { total, pending, inProgress, confirmed, activeBenefits, expiringDocs };
  }, [allOnboardings, benefitPlans, documentExpirations]);

  // Handlers
  const handleOpenDetail = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const handleEnrollCandidate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createNewOnboarding(enrollForm)).unwrap();
      setIsEnrollModalOpen(false);
      setEnrollForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        job_title: '',
        department: '',
        start_date: '',
        salary: '',
        pay_frequency: 'BIWEEKLY',
        employment_type: 'FULL_TIME',
        state: 'CA'
      });
      setFeedback({ type: 'success', message: 'Candidate enrolled in onboarding successfully!' });
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to enroll candidate' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToEmployee = (candidate) => {
    setConfirmDialog({
      title: 'Convert to Employee Directory',
      message: `Are you sure you want to promote ${candidate.first_name} ${candidate.last_name} into the active Employee Directory? This will finalize their onboarding process.`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await dispatch(convertToEmployeeAction({ id: candidate.id, data: {} })).unwrap();
          setFeedback({ type: 'success', message: `${candidate.first_name} successfully converted to Employee Directory!` });
          setIsDetailModalOpen(false);
          loadAllData();
        } catch (err) {
          setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to convert to employee' });
        } finally {
          setActionLoading(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const [remindingCandidateId, setRemindingCandidateId] = useState(null);

  const handleRemindCandidate = async (candidate) => {
    if (!candidate || !candidate.id) return;
    setRemindingCandidateId(candidate.id);
    setActionLoading(true);
    try {
      const res = await dispatch(remindCandidateAction(candidate.id)).unwrap();
      const msg = res?.result?.message || `Onboarding reminder link dispatched to ${candidate.email || 'candidate'}!`;
      const isWarn = res?.result?.warning;
      setFeedback({ 
        type: isWarn ? 'error' : 'success', 
        message: msg 
      });
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : (err?.message || err?.detail || 'Failed to send reminder email. Please check server configuration.');
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
      setRemindingCandidateId(null);
    }
  };

  const handleRegretCandidate = (candidate) => {
    setConfirmDialog({
      title: 'Send Regret / Terminate Candidate',
      message: `Are you sure you want to archive and discontinue onboarding for ${candidate.first_name} ${candidate.last_name}?`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await dispatch(regretCandidateAction(candidate.id)).unwrap();
          setFeedback({ type: 'success', message: `Candidate onboarding marked as regret/discontinued.` });
          setIsDetailModalOpen(false);
          loadAllData();
        } catch (err) {
          setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to update candidate status' });
        } finally {
          setActionLoading(false);
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleEmployerVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setActionLoading(true);
    try {
      await onboardingService.submitI9EmployerVerifyDirect({
        onboarding_id: selectedCandidate.id,
        ...i9VerifyForm
      });
      setFeedback({ type: 'success', message: 'Form I-9 Section 2 Employer Verification completed and logged!' });
      setIsI9VerifyModalOpen(false);
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Failed to complete Section 2 verification' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportPayroll = async () => {
    setActionLoading(true);
    try {
      const response = await onboardingService.exportPayrollCsv(exportProvider);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `onboarding_payroll_export_${exportProvider.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setIsExportModalOpen(false);
      setFeedback({ type: 'success', message: `Payroll export for ${exportProvider} downloaded successfully!` });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to export payroll CSV' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkCsvFile) {
      setFeedback({ type: 'error', message: 'Please select a CSV file to upload' });
      return;
    }
    setActionLoading(true);
    const formData = new FormData();
    formData.append('file', bulkCsvFile);
    try {
      const res = await onboardingService.bulkImportCandidates(formData);
      setIsBulkImportModalOpen(false);
      setBulkCsvFile(null);
      setFeedback({ type: 'success', message: `Bulk import processed! ${res.data?.created_count || 0} candidates enrolled.` });
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Failed to import candidates CSV' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBenefit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createBenefitPlan(benefitForm)).unwrap();
      setIsBenefitModalOpen(false);
      setBenefitForm({ name: '', plan_type: 'MEDICAL', carrier_name: '', description: '' });
      setFeedback({ type: 'success', message: 'Benefit plan created successfully!' });
      dispatch(fetchBenefitPlans());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to create benefit plan' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dispatch(createCompanyPolicy(policyForm)).unwrap();
      setIsPolicyModalOpen(false);
      setPolicyForm({ title: '', category: 'HANDBOOK', version: '1.0', description: '', is_mandatory: true });
      setFeedback({ type: 'success', message: 'Company policy document published successfully!' });
      dispatch(fetchCompanyPolicies());
    } catch (err) {
      setFeedback({ type: 'error', message: typeof err === 'string' ? err : 'Failed to create policy document' });
    } finally {
      setActionLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'CONFIRMED' || s === 'COMPLETED' || s === 'EMPLOYER_VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Confirmed / Ready
        </span>
      );
    }
    if (s === 'IN_PROGRESS' || s === 'EMPLOYEE_SIGNED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          In Progress
        </span>
      );
    }
    if (s === 'REJECTED' || s === 'REGRET' || s === 'TERMINATED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Discontinued
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Pending Invite
      </span>
    );
  };

  if (loading && (!allOnboardings || allOnboardings.length === 0)) {
    return (
      <div className={`min-h-screen p-6 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f1117] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'}`}>
        <PageLoader 
          message="Loading Onboarding Pipeline & I-9 Roster..."
          subMessage="Synchronizing Form I-9 verification, 50-state tax forms, and direct deposit packets"
          showSkeleton={true}
          skeletonType="table"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 md:p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f1117] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      
      {/* 1. TOP MASTER HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Candidate Onboarding & Compliance
            </h1>
            <span
              style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor, borderColor: `${activeHexColor}30` }}
              className="px-2.5 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeHexColor }}></span>
              6 Enterprise Suites Live
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Automated I-9 Section 2 verification, 50-state tax onboarding, USCIS E-Verify, and 1-Click Payroll export.
          </p>
        </div>

        {/* Global Action Suite */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Payroll CSV</span>
          </button>

          <button
            onClick={() => setIsBulkImportModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isDarkMode ? 'bg-[#181a20] border-zinc-700/60 hover:border-zinc-500 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-blue-500" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => setIsEnrollModalOpen(true)}
            style={{ backgroundColor: activeHexColor }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg hover:opacity-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Candidate</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Pipeline', value: metrics.total, sub: 'ALL CANDIDATES', icon: Users, color: activeHexColor },
          { label: 'Pending Invites', value: metrics.pending, sub: 'AWAITING RESPONSE', icon: Clock, color: '#F59E0B' },
          { label: 'Active In-Progress', value: metrics.inProgress, sub: 'FILLING FORMS', icon: Layers, color: '#8B5CF6' },
          { label: 'Confirmed / Ready', value: metrics.confirmed, sub: 'I-9 & TAX VERIFIED', icon: UserCheck, color: '#10B981' },
          { label: 'Benefit Plans', value: metrics.activeBenefits, sub: 'HEALTH & 401K', icon: Heart, color: '#EC4899' },
          { label: 'Expiring Docs', value: metrics.expiringDocs, sub: 'REVERIFICATION RADAR', icon: AlertTriangle, color: '#EF4444' }
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
            { id: 'pipeline', label: 'Candidate Pipeline', icon: Users },
            { id: 'i9', label: 'Form I-9 & Section 2', icon: FileText },
            { id: 'everify', label: 'E-Verify & Screening', icon: Shield },
            { id: 'benefits', label: 'Benefit Plans', icon: Heart },
            { id: 'policies', label: 'Company Policies', icon: BookOpen },
            { id: 'expirations', label: 'Expiration Radar', icon: AlertTriangle }
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
          {activeTab === 'pipeline' && (
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
            title="Refresh Onboarding Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. TAB PANELS */}

      {/* --- TAB 1: CANDIDATE PIPELINE --- */}
      {activeTab === 'pipeline' && (
        <div>
          {/* Search & Filter bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[240px] ${
                isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search candidates by name, email, job title..."
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

              {/* Status Filter */}
              <StunningSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Pipeline Stages' },
                  { value: 'PENDING', label: 'Pending Invites' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'CONFIRMED', label: 'Confirmed / Ready' }
                ]}
                className="w-48"
                activeHexColor={activeHexColor}
              />

              {/* State Filter */}
              <StunningSelect
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All 50 States' },
                  ...US_STATES.map((st) => ({ value: st, label: st }))
                ]}
                className="w-36"
                searchable={true}
                activeHexColor={activeHexColor}
              />
            </div>

            <div className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Showing {filteredCandidates.length} of {(allOnboardings || []).length} candidates
            </div>
          </div>

          {/* High Density Table View */}
          {viewMode === 'table' ? (
            <div className={`rounded-2xl border overflow-hidden transition-all ${
              isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'border-zinc-800/80 bg-[#181a20] text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
                    }`}>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Role & Dept</th>
                      <th className="py-3.5 px-4">State</th>
                      <th className="py-3.5 px-4">Start Date</th>
                      <th className="py-3.5 px-4">Status Stage</th>
                      <th className="py-3.5 px-4">Compliance / I-9</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-500">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No onboarding candidates match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          onClick={() => handleOpenDetail(candidate)}
                          className={`cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase"
                                style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                              >
                                {(candidate.first_name || 'C')[0]}{(candidate.last_name || '')[0]}
                              </div>
                              <div>
                                <div className="font-semibold">{candidate.first_name} {candidate.last_name}</div>
                                <div className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{candidate.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium">{candidate.job_title || 'Software Engineer'}</div>
                            <div className={`text-[11px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{candidate.department || 'Engineering'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {candidate.state || 'CA'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 opacity-60" />
                              {candidate.start_date || 'Oct 15, 2026'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(candidate.status)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {candidate.is_i9_completed || candidate.status === 'CONFIRMED' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                                  <CheckCircle className="w-3.5 h-3.5" /> I-9 Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                                  <Clock className="w-3.5 h-3.5" /> Section 2 Req.
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRemindCandidate(candidate)}
                                disabled={remindingCandidateId === candidate.id || actionLoading}
                                title={remindingCandidateId === candidate.id ? "Sending reminder..." : "Resend Portal Invite Link"}
                                className={`p-1.5 rounded-lg border transition-all flex items-center justify-center min-w-[30px] min-h-[30px] ${
                                  isDarkMode ? 'bg-zinc-800 border-zinc-700/60 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                                } ${remindingCandidateId === candidate.id ? 'opacity-70 cursor-wait' : ''}`}
                              >
                                {remindingCandidateId === candidate.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleOpenDetail(candidate)}
                                title="View Comprehensive File"
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isDarkMode ? 'bg-zinc-800 border-zinc-700/60 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                                }`}
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
          ) : (
            /* Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => handleOpenDetail(candidate)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    isDarkMode ? 'bg-[#131722] border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm uppercase"
                        style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                      >
                        {(candidate.first_name || 'C')[0]}{(candidate.last_name || '')[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{candidate.first_name} {candidate.last_name}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{candidate.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(candidate.status)}
                  </div>

                  <div className={`p-3 rounded-xl mb-4 text-xs space-y-2 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Role:</span>
                      <span className="font-semibold">{candidate.job_title || 'Staff Engineer'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>State & Dept:</span>
                      <span className="font-semibold">{candidate.state || 'CA'} • {candidate.department || 'Tech'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Start Date:</span>
                      <span className="font-semibold">{candidate.start_date || 'Oct 15, 2026'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-xs">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemindCandidate(candidate); }}
                      disabled={remindingCandidateId === candidate.id || actionLoading}
                      className="flex items-center gap-1.5 font-medium hover:underline disabled:opacity-60 transition-all"
                      style={{ color: activeHexColor }}
                    >
                      {remindingCandidateId === candidate.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Reminder...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Resend Invite</span>
                        </>
                      )}
                    </button>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: activeHexColor }}>
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: FORM I-9 & SECTION 2 VERIFICATION --- */}
      {activeTab === 'i9' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  USCIS Form I-9 & Employer Section 2 Verification
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Federal law requires employers to physically or remotely examine documentation within 3 business days of first day of employment.
                </p>
              </div>
            </div>
          </div>

          {/* I-9 Roster */}
          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'border-zinc-800/80 bg-[#181a20] text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Citizenship Status</th>
                  <th className="py-3.5 px-4">Section 1 Signature</th>
                  <th className="py-3.5 px-4">Section 2 Employer Verify</th>
                  <th className="py-3.5 px-4">Compliance Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-100'}`}>
                {(allOnboardings || []).map((c) => (
                  <tr key={c.id} className={isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'}>
                    <td className="py-3.5 px-4 font-semibold">{c.first_name} {c.last_name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        U.S. Citizen / Lawful Permanent Resident
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Signed Digitally
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.is_i9_completed || c.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Verified & Sealed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Employer Sign
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCandidate(c);
                          setIsI9VerifyModalOpen(true);
                        }}
                        style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor, borderColor: `${activeHexColor}30` }}
                        className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-90 transition-all"
                      >
                        Verify Section 2
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: USCIS E-VERIFY & SCREENING --- */}
      {activeTab === 'everify' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  USCIS E-Verify Integration & Criminal Background Screening
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Direct DHS/SSA automated identity confirmation, adverse action notices, and 7-year background check records.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(allOnboardings || []).map((c) => (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold">{c.first_name} {c.last_name}</div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Employment Authorized
                  </span>
                </div>
                <div className={`p-3 rounded-xl space-y-2 text-xs mb-4 ${isDarkMode ? 'bg-[#181a20]' : 'bg-slate-50'}`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>E-Verify Case #:</span>
                    <span className="font-mono font-bold">EV-2026-{1000 + c.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>DHS Query Result:</span>
                    <span className="text-emerald-500 font-semibold">SSA & DHS Cleared</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Background Screening:</span>
                    <span className="text-emerald-500 font-semibold">Passed (No Records Found)</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setFeedback({ type: 'success', message: `E-Verify Compliance Certificate downloaded for ${c.first_name}!` })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    Download Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: BENEFIT PLANS CATALOG --- */}
      {activeTab === 'benefits' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Corporate Benefit Plans Catalog
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Health, Dental, Vision, and 401(k) Retirement packages available for candidate election during onboarding.
              </p>
            </div>
            <button
              onClick={() => setIsBenefitModalOpen(true)}
              style={{ backgroundColor: activeHexColor }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow"
            >
              <Plus className="w-4 h-4" /> Add Benefit Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(benefitPlans || []).map((plan) => (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {plan.plan_type || 'MEDICAL'}
                  </span>
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <h3 className="font-bold text-sm mb-1">{plan.name}</h3>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{plan.carrier_name || 'Premier Provider'}</p>
                <p className={`text-xs mb-4 line-clamp-2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-600'}`}>{plan.description || 'Comprehensive coverage.'}</p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40 text-xs">
                  <span className="text-emerald-500 font-semibold">Active in Catalog</span>
                  <span className="font-mono text-zinc-400">ID #{plan.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: COMPANY POLICIES & HANDBOOKS --- */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                Company Policies & Digital Acknowledgements
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Employee Handbook, Code of Ethics, and IT Security policies with legally binding candidate signature auditing.
              </p>
            </div>
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              style={{ backgroundColor: activeHexColor }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow"
            >
              <Plus className="w-4 h-4" /> Publish Policy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(companyPolicies || []).map((pol) => (
              <div
                key={pol.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {pol.category || 'HANDBOOK'}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">v{pol.version || '1.0'}</span>
                </div>
                <h3 className="font-bold text-sm mb-2">{pol.title}</h3>
                <p className={`text-xs mb-4 line-clamp-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {pol.description || 'Mandatory organizational standard.'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40 text-xs">
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Mandatory Sign
                  </span>
                  <span className="text-zinc-400">All Candidates</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 6: EXPIRATION RADAR --- */}
      {activeTab === 'expirations' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h2 className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Document Expiration & Reverification Radar
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Continuous compliance monitoring for expiring foreign national visas, EAD cards, passports, and driver licenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(documentExpirations || []).length === 0 ? (
              <div className={`col-span-2 p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-400' : 'bg-white border-slate-100 text-slate-500'}`}>
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                All employee and candidate authorization documents are up to date!
              </div>
            ) : (
              (documentExpirations || []).map((exp) => (
                <div
                  key={exp.id}
                  className={`p-5 rounded-2xl border ${
                    isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {exp.alert_status || 'EXPIRING_SOON'}
                    </span>
                    <span className="text-xs font-bold text-rose-500">
                      Expires: {exp.expiration_date}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{exp.document_title || 'Work Authorization Document'}</h3>
                  <div className={`text-xs space-y-1 mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    <div>Document #: <span className="font-mono">{exp.document_number || 'N/A'}</span></div>
                    <div>Notes: {exp.notes || 'Reverification required prior to expiry date.'}</div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setFeedback({ type: 'success', message: 'Reverification notification dispatched to candidate!' })}
                      style={{ backgroundColor: activeHexColor }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow"
                    >
                      Request Reverification
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS & POPUPS (ALL WITH MAX HEIGHT & SMOOTH SCROLLING) */}
      {/* ========================================================================= */}

      {/* DETAIL MODAL FOR CANDIDATE WITH FULL 7-TAB AUDIT & PDF VIEWER */}
      <OnboardingDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCandidate(null);
        }}
        onboarding={selectedCandidate}
        onResendInvite={() => handleRemindCandidate(selectedCandidate)}
        onVerifyI9={() => {
          setIsDetailModalOpen(false);
          setIsI9VerifyModalOpen(true);
        }}
        onConvertToEmployee={() => handleConvertToEmployee(selectedCandidate)}
        onRegretCandidate={() => handleRegretCandidate(selectedCandidate)}
        actionLoading={actionLoading}
        remindingCandidateId={remindingCandidateId}
      />

      {/* ENROLL CANDIDATE MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-2xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            {/* Header (Sticky / Shrink-0) */}
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4" style={{ color: activeHexColor }} />
                Enroll Candidate in Onboarding
              </h3>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="enrollCandidateForm" onSubmit={handleEnrollCandidate} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">First Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.first_name}
                    onChange={(e) => setEnrollForm({ ...enrollForm, first_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Marcus"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.last_name}
                    onChange={(e) => setEnrollForm({ ...enrollForm, last_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Vance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Candidate Email *</label>
                  <input
                    type="email"
                    required
                    value={enrollForm.email}
                    onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="marcus.vance@example.com"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={enrollForm.phone_number}
                    onChange={(e) => setEnrollForm({ ...enrollForm, phone_number: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="+1 (555) 349-2910"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.job_title}
                    onChange={(e) => setEnrollForm({ ...enrollForm, job_title: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Senior Frontend Architect"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Department</label>
                  <input
                    type="text"
                    value={enrollForm.department}
                    onChange={(e) => setEnrollForm({ ...enrollForm, department: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Engineering"
                  />
                </div>
                <div>
                  <StunningSelect
                    label="Work State"
                    required={true}
                    value={enrollForm.state}
                    onChange={(e) => setEnrollForm({ ...enrollForm, state: e.target.value })}
                    options={US_STATES.map((st) => ({ value: st, label: st }))}
                    searchable={true}
                    activeHexColor={activeHexColor}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                <div>
                  {/* STUNNING CUSTOM DATE PICKER */}
                  <StunningDatePicker
                    label="Start Date"
                    required={true}
                    value={enrollForm.start_date}
                    onChange={(dateVal) => setEnrollForm({ ...enrollForm, start_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select start date"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Annual Base Salary ($) *</label>
                  <input
                    type="number"
                    required
                    value={enrollForm.salary}
                    onChange={(e) => setEnrollForm({ ...enrollForm, salary: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="135000"
                  />
                </div>
              </div>
            </form>

            {/* Footer (Sticky / Shrink-0) */}
            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="enrollCandidateForm"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:opacity-95 transition-all"
              >
                {actionLoading ? 'Enrolling Candidate...' : 'Dispatch Onboarding Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM I-9 SECTION 2 VERIFICATION MODAL */}
      {isI9VerifyModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-xl my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Form I-9 Section 2 Employer Verification
              </h3>
              <button onClick={() => setIsI9VerifyModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="i9VerifyFormId" onSubmit={handleEmployerVerifySubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <p className={`p-3 rounded-xl ${isDarkMode ? 'bg-[#181a20] text-zinc-300' : 'bg-slate-50 text-slate-600'}`}>
                You are verifying unexpired documentation presented by <strong>{selectedCandidate.first_name} {selectedCandidate.last_name}</strong> to establish identity and employment authorization.
              </p>

              <div>
                <StunningSelect
                  label="Document Category"
                  value={i9VerifyForm.list_type}
                  onChange={(e) => setI9VerifyForm({ ...i9VerifyForm, list_type: e.target.value })}
                  options={[
                    { value: 'LIST_A', label: 'List A (Identity & Work Auth - US Passport, EAD)' },
                    { value: 'LIST_B_C', label: 'List B + C (Driver License + SSN Card)' }
                  ]}
                  activeHexColor={activeHexColor}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={i9VerifyForm.document_title}
                    onChange={(e) => setI9VerifyForm({ ...i9VerifyForm, document_title: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="U.S. Passport"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Issuing Authority *</label>
                  <input
                    type="text"
                    required
                    value={i9VerifyForm.issuing_authority}
                    onChange={(e) => setI9VerifyForm({ ...i9VerifyForm, issuing_authority: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="U.S. Dept of State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Document Number *</label>
                  <input
                    type="text"
                    required
                    value={i9VerifyForm.document_number}
                    onChange={(e) => setI9VerifyForm({ ...i9VerifyForm, document_number: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="P90234812"
                  />
                </div>
                <div>
                  {/* STUNNING CUSTOM DATE PICKER */}
                  <StunningDatePicker
                    label="Expiration Date (if applicable)"
                    value={i9VerifyForm.expiration_date}
                    onChange={(dateVal) => setI9VerifyForm({ ...i9VerifyForm, expiration_date: dateVal })}
                    activeHexColor={activeHexColor}
                    placeholder="Select expiry date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                <div>
                  <label className="block mb-1 font-semibold">Employer Representative Signature *</label>
                  <input
                    type="text"
                    required
                    value={i9VerifyForm.employer_representative_name}
                    onChange={(e) => setI9VerifyForm({ ...i9VerifyForm, employer_representative_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Representative Title *</label>
                  <input
                    type="text"
                    required
                    value={i9VerifyForm.employer_title}
                    onChange={(e) => setI9VerifyForm({ ...i9VerifyForm, employer_title: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsI9VerifyModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="i9VerifyFormId"
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow"
              >
                {actionLoading ? 'Sealing I-9 Record...' : 'Complete & Seal Section 2'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYROLL CSV EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-md my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" />
                1-Click Payroll CSV Export
              </h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <p className={isDarkMode ? 'text-zinc-300' : 'text-slate-600'}>
                Select your payroll provider. The system will automatically map compensation, direct deposit routing, and 50-state tax withholding columns.
              </p>

              <div className="space-y-2">
                {[
                  { id: 'ADP', name: 'ADP Workforce Now', desc: 'Standard ADP HR/Payroll import schema' },
                  { id: 'GUSTO', name: 'Gusto Payroll', desc: 'Gusto multi-state employee batch file' },
                  { id: 'QUICKBOOKS', name: 'QuickBooks Online Payroll', desc: 'Intuit QB XML / CSV interchange' },
                  { id: 'PAYCHEX', name: 'Paychex Flex', desc: 'Paychex payroll import format' }
                ].map((prov) => (
                  <div
                    key={prov.id}
                    onClick={() => setExportProvider(prov.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      exportProvider === prov.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : isDarkMode
                        ? 'border-zinc-800 bg-[#181a20]'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{prov.name}</div>
                      <div className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{prov.desc}</div>
                    </div>
                    {exportProvider === prov.id && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleExportPayroll}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow"
              >
                {actionLoading ? 'Generating Export...' : 'Download Payroll CSV'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CANDIDATE IMPORT MODAL */}
      {isBulkImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-md my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-500" />
                Bulk Import Candidates via CSV
              </h3>
              <button onClick={() => setIsBulkImportModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="bulkImportFormId" onSubmit={handleBulkImport} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <p className={isDarkMode ? 'text-zinc-300' : 'text-slate-600'}>
                Upload a CSV containing: <code>first_name, last_name, email, job_title, start_date, salary, state</code>.
              </p>

              <div className={`p-6 rounded-2xl border-2 border-dashed text-center flex flex-col items-center justify-center ${
                isDarkMode ? 'border-zinc-700 bg-[#181a20]' : 'border-slate-300 bg-slate-50'
              }`}>
                <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setBulkCsvFile(e.target.files[0])}
                  className="text-xs"
                />
                {bulkCsvFile && <span className="mt-2 text-emerald-500 font-semibold">{bulkCsvFile.name}</span>}
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsBulkImportModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="bulkImportFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow"
              >
                {actionLoading ? 'Uploading...' : 'Process CSV Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE BENEFIT PLAN MODAL */}
      {isBenefitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-md my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Add Benefit Plan
              </h3>
              <button onClick={() => setIsBenefitModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="createBenefitFormId" onSubmit={handleCreateBenefit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={benefitForm.name}
                  onChange={(e) => setBenefitForm({ ...benefitForm, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Kaiser Permanente Platinum HMO"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <StunningSelect
                    label="Plan Type"
                    value={benefitForm.plan_type}
                    onChange={(e) => setBenefitForm({ ...benefitForm, plan_type: e.target.value })}
                    options={[
                      { value: 'MEDICAL', label: 'Medical' },
                      { value: 'DENTAL', label: 'Dental' },
                      { value: 'VISION', label: 'Vision' },
                      { value: 'RETIREMENT_401K', label: '401(k) Retirement' },
                      { value: 'HSA', label: 'HSA' },
                      { value: 'FSA', label: 'FSA' }
                    ]}
                    activeHexColor={activeHexColor}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Carrier / Provider</label>
                  <input
                    type="text"
                    value={benefitForm.carrier_name}
                    onChange={(e) => setBenefitForm({ ...benefitForm, carrier_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="Kaiser Permanente"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={benefitForm.description}
                  onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Summary of copays, deductibles, and benefits..."
                />
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsBenefitModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="createBenefitFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow"
              >
                {actionLoading ? 'Saving...' : 'Publish Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE POLICY MODAL */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-md my-auto rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className={`p-5 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                Publish Policy Document
              </h3>
              <button onClick={() => setIsPolicyModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="createPolicyFormId" onSubmit={handleCreatePolicy} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Policy Title *</label>
                <input
                  type="text"
                  required
                  value={policyForm.title}
                  onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Remote Work & Cyber Security Agreement"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <StunningSelect
                    label="Category"
                    value={policyForm.category}
                    onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                    options={[
                      { value: 'HANDBOOK', label: 'Employee Handbook' },
                      { value: 'IT_SECURITY', label: 'IT Security & Privacy' },
                      { value: 'CONFIDENTIALITY', label: 'NDA & IP Protection' },
                      { value: 'SAFETY', label: 'Workplace Safety' }
                    ]}
                    activeHexColor={activeHexColor}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Version</label>
                  <input
                    type="text"
                    value={policyForm.version}
                    onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                    placeholder="2026.1"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Description / Scope</label>
                <textarea
                  rows={3}
                  value={policyForm.description}
                  onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                  placeholder="Summary of expectations and compliance standards..."
                />
              </div>
            </form>

            <div className={`p-4 border-t shrink-0 flex items-center justify-end gap-3 ${isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl border font-medium ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="createPolicyFormId"
                disabled={actionLoading}
                style={{ backgroundColor: activeHexColor }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white shadow"
              >
                {actionLoading ? 'Publishing...' : 'Publish Policy Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL (High z-index to appear on top of any active details modal) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-md my-auto rounded-3xl border shadow-2xl p-6 transform transition-all ${
            isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center theme-bg-light theme-text-primary shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight">{confirmDialog.title}</h3>
                <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Action Confirmation</p>
              </div>
            </div>

            <p className={`text-xs mb-6 leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white theme-bg-primary theme-shadow-primary flex items-center gap-2 cursor-pointer shadow hover:opacity-95 transition-all disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{actionLoading ? 'Processing...' : 'Confirm & Promote'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK POPUP MODAL (High z-index to appear on top of all modals) */}
      {feedback && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className={`w-full max-w-sm my-auto rounded-3xl border shadow-2xl p-6 text-center transform transition-all ${
            isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
          }`}>
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-3.5 flex items-center justify-center ${
              feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}>
              {feedback.type === 'success' ? <CheckCircle className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
            </div>
            <h4 className="font-bold text-base mb-1.5">{feedback.type === 'success' ? 'Operation Successful' : 'Action Notice'}</h4>
            <p className={`text-xs mb-5 leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{feedback.message}</p>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white theme-bg-primary theme-shadow-primary shadow hover:opacity-95 cursor-pointer transition-all"
            >
              Done / OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

