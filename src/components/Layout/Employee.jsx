import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, UserPlus, UserCheck, UserX, UserMinus, Search, Filter, Plus, 
  Briefcase, Building, Building2, MapPin, DollarSign, Calendar, Clock, 
  Laptop, ShieldCheck, ShieldAlert, Key, RefreshCw, Eye, Edit3, Trash2, 
  CheckCircle, AlertCircle, AlertTriangle, XCircle, CheckCircle2, ChevronDown, 
  ChevronRight, ArrowRight, Download, Upload, Share2, Mail, Phone, 
  FileText, ExternalLink, Sparkles, MessageSquare, Video, Check, X,
  HardDrive, Cpu, Smartphone, Monitor, Globe, Award, TrendingUp, Layers,
  Lock, Unlock, HelpCircle, FileCheck, Send, CheckSquare, Square, ChevronLeft
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { StunningSelect, StunningDatePicker } from '../tasks/StunningSelect';
import PageLoader from '../common/LoadingScreen/LoadingScreen';
import { 
  fetchEmployeeStats,
  fetchEmployees,
  fetchEmployeeDetail,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchHardwareAssets,
  createHardwareAsset,
  updateHardwareAsset,
  deleteHardwareAsset,
  fetchSaaSAccounts,
  createSaaSAccount,
  updateSaaSAccount,
  deleteSaaSAccount,
  revokeSaaSAccess,
  fetchOneOnOnes,
  createOneOnOne,
  updateOneOnOne,
  deleteOneOnOne,
  fetchOffboardingCases,
  createOffboardingCase,
  updateOffboardingCase,
  deleteOffboardingCase,
  calculateFinalPayAction,
  hrSignoffAction,
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  setSelectedEmployee,
  clearSuccess,
  clearError
} from '../../store/employeeSlice';

// Helper for backend error extraction
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

// Safe select value parser
const parseSelectVal = (e) => {
  if (e === null || e === undefined) return '';
  if (typeof e === 'object' && e.target && 'value' in e.target) {
    return e.target.value;
  }
  return String(e);
};

// Status Badges
const getStatusBadge = (status = '') => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return { label: 'Active', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' };
    case 'PROBATION':
      return { label: 'Probation', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500' };
    case 'ON_LEAVE':
      return { label: 'On Leave', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', dot: 'bg-blue-500' };
    case 'NOTICE_PERIOD':
      return { label: 'Notice Period', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20', dot: 'bg-purple-500' };
    case 'TERMINATED':
    case 'SEPARATED':
      return { label: 'Separated', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20', dot: 'bg-rose-500' };
    default:
      return { label: status || 'Active', bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', dot: 'bg-zinc-400' };
  }
};

const getWorkModelBadge = (model = '') => {
  switch (model?.toUpperCase()) {
    case 'REMOTE':
      return { label: 'Remote', bg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' };
    case 'HYBRID':
      return { label: 'Hybrid', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
    case 'ON_SITE':
      return { label: 'On-Site', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    default:
      return { label: model || 'Hybrid', bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  }
};

export default function Employee() {
  const { isDarkMode, accentColor, themeColors } = useTheme();
  const dispatch = useDispatch();

  const activeHexColor = useMemo(() => {
    const match = themeColors?.find(t => t.id === accentColor);
    return match ? match.color : '#2563eb';
  }, [accentColor, themeColors]);

  const { 
    stats, 
    employees = [], 
    selectedEmployee,
    hardwareAssets = [],
    saasAccounts = [],
    oneOnOnes = [],
    offboardingCases = [],
    announcements = [],
    loading, 
    actionLoading,
    error 
  } = useSelector((state) => state.employee || {});

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('DIRECTORY'); // 'DIRECTORY' | 'HARDWARE' | 'SAAS' | 'MEETINGS' | 'OFFBOARDING' | 'ANNOUNCEMENTS'
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' | 'GRID'

  // Pagination for Directory
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters for Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workModelFilter, setWorkModelFilter] = useState('ALL');

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

  // Modals & Detail Popups
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Row-Click Detail Modals
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [dossierEmployee, setDossierEmployee] = useState(null);

  const [showAssetDetailModal, setShowAssetDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [showSaaSDetailModal, setShowSaaSDetailModal] = useState(false);
  const [selectedSaaS, setSelectedSaaS] = useState(null);

  const [showMeetingDetailModal, setShowMeetingDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [showOffboardingDetailModal, setShowOffboardingDetailModal] = useState(false);
  const [selectedOffboarding, setSelectedOffboarding] = useState(null);

  // Sub-entity create/edit modals
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showSaaSModal, setShowSaaSModal] = useState(false);
  const [editingSaaS, setEditingSaaS] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showOffboardingModal, setShowOffboardingModal] = useState(false);
  const [editingOffboarding, setEditingOffboarding] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Form states
  const [employeeFormData, setEmployeeFormData] = useState({
    first_name: '',
    last_name: '',
    work_email: '',
    personal_email: '',
    phone_number: '',
    designation: '',
    department: 'Engineering',
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    work_model: 'HYBRID',
    date_of_joining: new Date().toISOString().split('T')[0],
    compensation_rate: '',
    compensation_frequency: 'HOURLY',
    placement_status: 'DIRECT',
    client_name: '',
    reporting_manager_name: '',
    city: '',
    state: 'CA',
    country: 'United States',
  });

  const [assetFormData, setAssetFormData] = useState({
    asset_tag: '',
    model_name: '',
    category: 'LAPTOP',
    serial_number: '',
    assigned_to: '',
    status: 'ASSIGNED',
    condition: 'EXCELLENT',
    purchase_date: new Date().toISOString().split('T')[0],
    cost: '',
  });

  const [saasFormData, setSaasFormData] = useState({
    app_name: 'Google Workspace',
    app_category: 'IDENTITY',
    assigned_to: '',
    account_email: '',
    role_tier: 'MEMBER',
    status: 'PROVISIONED',
    is_mfa_enforced: true,
    sso_integrated: true,
  });

  const [meetingFormData, setMeetingFormData] = useState({
    title: 'Weekly 1-on-1 Sync',
    employee: '',
    facilitator_name: '',
    scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    meeting_link: 'https://meet.google.com/new',
    status: 'SCHEDULED',
    talking_points: '',
  });

  const [offboardingFormData, setOffboardingFormData] = useState({
    employee: '',
    separation_type: 'VOLUNTARY_RESIGNATION',
    notice_date: new Date().toISOString().split('T')[0],
    effective_last_day: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    us_state_jurisdiction: 'CA',
    status: 'IN_PROGRESS',
    reason_notes: '',
  });

  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    priority: 'GENERAL',
    target_audience: 'ALL_WORKFORCE',
    is_pinned: false,
    author_name: 'HR Operations',
  });

  // Initial Data Fetch
  const reloadAll = () => {
    dispatch(fetchEmployeeStats());
    dispatch(fetchEmployees());
    dispatch(fetchHardwareAssets());
    dispatch(fetchSaaSAccounts());
    dispatch(fetchOneOnOnes());
    dispatch(fetchOffboardingCases());
    dispatch(fetchAnnouncements());
  };

  useEffect(() => {
    reloadAll();
  }, [dispatch]);

  // Employee Dropdown Options (Robust across all backend schemas)
  const employeeSelectOptions = useMemo(() => {
    const opts = [{ value: '', label: 'Select Employee / Direct Report' }];
    employees.forEach(emp => {
      const name = emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || `Employee #${emp.id}`;
      const subtitle = emp.work_email || emp.email || emp.job_title || emp.designation || `ID: ${emp.id}`;
      opts.push({
        value: String(emp.id),
        label: `${name} (${subtitle})`,
      });
    });
    return opts;
  }, [employees]);

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchQuery.toLowerCase().trim();
      const fullName = (emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`).toLowerCase();
      const email = (emp.work_email || emp.email || '').toLowerCase();
      const code = (emp.employee_code || String(emp.id)).toLowerCase();
      const desig = (emp.designation || emp.job_title || '').toLowerCase();
      const client = (emp.client_name || emp.client_details?.client_name || '').toLowerCase();

      const matchesSearch = !q || fullName.includes(q) || email.includes(q) || code.includes(q) || desig.includes(q) || client.includes(q);
      const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
      const matchesStatus = statusFilter === 'ALL' || (emp.status || emp.employment_status) === statusFilter;
      const matchesModel = workModelFilter === 'ALL' || emp.work_model === workModelFilter;

      return matchesSearch && matchesDept && matchesStatus && matchesModel;
    });
  }, [employees, searchQuery, deptFilter, statusFilter, workModelFilter]);

  // Paginated Employees
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;

  // Handlers for Employee Create/Edit
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      first_name: '',
      last_name: '',
      work_email: '',
      personal_email: '',
      phone_number: '',
      designation: '',
      department: 'Engineering',
      employment_type: 'FULL_TIME',
      status: 'ACTIVE',
      work_model: 'HYBRID',
      date_of_joining: new Date().toISOString().split('T')[0],
      compensation_rate: '',
      compensation_frequency: 'HOURLY',
      placement_status: 'DIRECT',
      client_name: '',
      reporting_manager_name: '',
      city: '',
      state: 'CA',
      country: 'United States',
    });
    setShowEmployeeModal(true);
  };

  const handleOpenEditEmployee = (emp, e) => {
    if (e) e.stopPropagation();
    setEditingEmployee(emp);
    setEmployeeFormData({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      work_email: emp.work_email || emp.email || '',
      personal_email: emp.personal_email || '',
      phone_number: emp.phone_number || '',
      designation: emp.designation || emp.job_title || '',
      department: emp.department || 'Engineering',
      employment_type: emp.employment_type || 'FULL_TIME',
      status: emp.status || emp.employment_status || 'ACTIVE',
      work_model: emp.work_model || 'HYBRID',
      date_of_joining: emp.date_of_joining || emp.joined_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      compensation_rate: emp.compensation_rate || emp.hourly_rate || emp.salary || '',
      compensation_frequency: emp.compensation_frequency || (emp.hourly_rate ? 'HOURLY' : 'ANNUAL'),
      placement_status: emp.placement_status || (emp.current_client || emp.client_name ? 'PLACED' : 'DIRECT'),
      client_name: emp.client_name || emp.client_details?.client_name || '',
      reporting_manager_name: emp.reporting_manager_name || '',
      city: emp.city || '',
      state: emp.state || 'CA',
      country: emp.country || 'United States',
    });
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    const payload = {
      ...employeeFormData,
      email: employeeFormData.work_email,
      job_title: employeeFormData.designation,
      employment_status: employeeFormData.status,
      compensation_rate: employeeFormData.compensation_rate ? parseFloat(employeeFormData.compensation_rate) : null,
      hourly_rate: employeeFormData.compensation_frequency === 'HOURLY' && employeeFormData.compensation_rate ? parseFloat(employeeFormData.compensation_rate) : null,
      salary: employeeFormData.compensation_frequency === 'ANNUAL' && employeeFormData.compensation_rate ? parseFloat(employeeFormData.compensation_rate) : null,
    };

    try {
      if (editingEmployee) {
        await dispatch(updateEmployee({ id: editingEmployee.id, data: payload })).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Employee Updated Successfully',
          message: `Workforce profile for ${payload.first_name} ${payload.last_name} has been updated.`,
        });
      } else {
        await dispatch(createEmployee(payload)).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Employee Onboarded Successfully',
          message: `New employee ${payload.first_name} ${payload.last_name} enrolled in workforce directory.`,
        });
      }
      setShowEmployeeModal(false);
      reloadAll();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Error Saving Employee',
        message: extractErrorMessage(err, 'Failed to save employee profile.'),
      });
    }
  };

  const handleDeleteEmployee = (emp, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Decommission Employee Record?',
      message: `Are you sure you want to delete ${emp.first_name} ${emp.last_name} (${emp.employee_code || emp.work_email || emp.email})? All associated records will be archived.`,
      confirmText: 'Delete Employee',
      onConfirm: async () => {
        try {
          await dispatch(deleteEmployee(emp.id)).unwrap();
          setFeedbackModal({
            isOpen: true,
            type: 'success',
            title: 'Employee Deleted',
            message: `${emp.first_name} ${emp.last_name} removed from workforce directory.`,
          });
          reloadAll();
        } catch (err) {
          setFeedbackModal({
            isOpen: true,
            type: 'error',
            title: 'Delete Failed',
            message: extractErrorMessage(err, 'Could not delete employee record.'),
          });
        }
      }
    });
  };

  // Hardware Handlers
  const handleSaveAsset = async (e) => {
    e.preventDefault();
    const payload = {
      ...assetFormData,
      cost: assetFormData.cost ? parseFloat(assetFormData.cost) : null,
      assigned_to: assetFormData.assigned_to ? parseInt(assetFormData.assigned_to) : null,
    };

    try {
      if (editingAsset) {
        await dispatch(updateHardwareAsset({ id: editingAsset.id, data: payload })).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Asset Updated',
          message: `Hardware asset ${payload.asset_tag} (${payload.model_name}) was updated.`,
        });
      } else {
        await dispatch(createHardwareAsset(payload)).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Asset Registered',
          message: `New hardware asset ${payload.asset_tag} registered into inventory.`,
        });
      }
      setShowAssetModal(false);
      reloadAll();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Asset Save Failed',
        message: extractErrorMessage(err, 'Could not save hardware asset.'),
      });
    }
  };

  // SaaS Handlers
  const handleSaveSaaS = async (e) => {
    e.preventDefault();
    const payload = {
      ...saasFormData,
      assigned_to: saasFormData.assigned_to ? parseInt(saasFormData.assigned_to) : null,
    };

    try {
      if (editingSaaS) {
        await dispatch(updateSaaSAccount({ id: editingSaaS.id, data: payload })).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'SaaS Account Updated',
          message: `${payload.app_name} account details updated.`,
        });
      } else {
        await dispatch(createSaaSAccount(payload)).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'SaaS Provisioned',
          message: `${payload.app_name} seat provisioned for ${payload.account_email}.`,
        });
      }
      setShowSaaSModal(false);
      reloadAll();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'SaaS Save Failed',
        message: extractErrorMessage(err, 'Could not provision SaaS account.'),
      });
    }
  };

  const handleRevokeSaaS = (saas, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: `Revoke ${saas.app_name} Access?`,
      message: `Are you sure you want to revoke access for ${saas.account_email}? SSO tokens and cloud permissions will terminate immediately.`,
      confirmText: 'Revoke Access',
      onConfirm: async () => {
        try {
          await dispatch(revokeSaaSAccess(saas.id)).unwrap();
          setFeedbackModal({
            isOpen: true,
            type: 'success',
            title: 'Access Revoked',
            message: `${saas.app_name} access revoked for ${saas.account_email}.`,
          });
          reloadAll();
        } catch (err) {
          setFeedbackModal({
            isOpen: true,
            type: 'error',
            title: 'Revoke Failed',
            message: extractErrorMessage(err, 'Could not revoke SaaS access.'),
          });
        }
      }
    });
  };

  // 1-on-1 Handlers
  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    const payload = {
      ...meetingFormData,
      employee: meetingFormData.employee ? parseInt(meetingFormData.employee) : null,
    };

    try {
      if (editingMeeting) {
        await dispatch(updateOneOnOne({ id: editingMeeting.id, data: payload })).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: '1-on-1 Updated',
          message: 'Meeting schedule and talking points updated.',
        });
      } else {
        await dispatch(createOneOnOne(payload)).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: '1-on-1 Scheduled',
          message: 'Manager sync scheduled with meeting invitations generated.',
        });
      }
      setShowMeetingModal(false);
      reloadAll();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Schedule Failed',
        message: extractErrorMessage(err, 'Could not schedule 1-on-1 meeting.'),
      });
    }
  };

  // Offboarding Handlers
  const handleSaveOffboarding = async (e) => {
    e.preventDefault();
    const payload = {
      ...offboardingFormData,
      employee: offboardingFormData.employee ? parseInt(offboardingFormData.employee) : null,
    };

    try {
      if (editingOffboarding) {
        await dispatch(updateOffboardingCase({ id: editingOffboarding.id, data: payload })).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Offboarding Case Updated',
          message: 'Statutory compliance milestones updated.',
        });
      } else {
        await dispatch(createOffboardingCase(payload)).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Offboarding Initiated',
          message: 'Statutory separation workflow and state notice requirements launched.',
        });
      }
      setShowOffboardingModal(false);
      reloadAll();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Initiation Failed',
        message: extractErrorMessage(err, 'Could not start offboarding case.'),
      });
    }
  };

  // Announcement Handlers
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await dispatch(updateAnnouncement({ id: editingAnnouncement.id, data: announcementFormData })).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Broadcast Updated',
          message: 'Company announcement updated across workforce portals.',
        });
      } else {
        await dispatch(createAnnouncement(announcementFormData)).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Announcement Published',
          message: 'Workforce broadcast is now live on employee dashboards.',
        });
      }
      setShowAnnouncementModal(false);
      reloadAll();
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Publish Failed',
        message: extractErrorMessage(err, 'Could not publish announcement.'),
      });
    }
  };

  if (loading && (!employees || employees.length === 0)) {
    return (
      <div className={`min-h-screen p-4 md:p-8 space-y-6 transition-colors duration-300 font-sans ${
        isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'
      }`}>
        <PageLoader 
          message="Loading Employee Directory & Hardware Assets..."
          subMessage="Fetching active staff rosters, hardware deployments, SaaS licenses, and 1-on-1s"
          showSkeleton={true}
          skeletonType="table"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 space-y-6 transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-400">
              Human Resources & Operations
            </span>
            <span className="text-slate-400 dark:text-zinc-600">•</span>
            <span className="text-[11px] font-bold text-emerald-500">Live Workforce Suite</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Workforce & Employee Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              US Direct & Placed
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage W2 & 1099 talent, client placements, hardware assets, SaaS identity, 1-on-1s & statutory offboarding.
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
            title="Refresh All Workforce Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenAddEmployee}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] theme-bg-primary"
          >
            <UserPlus size={15} />
            <span>Onboard Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Headcount', value: stats?.total_headcount ?? employees.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'Enrolled Staff' },
          { label: 'Active Direct', value: stats?.active_headcount ?? employees.filter(e => (e.status || e.employment_status) === 'ACTIVE' && (e.placement_status === 'DIRECT' || (!e.current_client && !e.client_name))).length, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'In-House Core' },
          { label: 'Client Placed', value: stats?.client_placed ?? employees.filter(e => e.placement_status === 'PLACED' || e.current_client || e.client_name).length, icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10', sub: 'Billable Staff' },
          { label: 'Hardware Deployed', value: stats?.hardware_assigned ?? hardwareAssets.filter(h => h.status === 'ASSIGNED').length, icon: Laptop, color: 'text-cyan-500', bg: 'bg-cyan-500/10', sub: 'Active Assets' },
          { label: 'Active SaaS Seats', value: stats?.saas_provisioned ?? saasAccounts.filter(s => s.status === 'PROVISIONED').length, icon: Key, color: 'text-amber-500', bg: 'bg-amber-500/10', sub: 'Cloud Accounts' },
          { label: 'Pending Offboarding', value: stats?.active_offboardings ?? offboardingCases.filter(o => o.status !== 'COMPLETED').length, icon: UserMinus, color: 'text-rose-500', bg: 'bg-rose-500/10', sub: 'Separations' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                isDarkMode 
                  ? 'bg-[#121217] border-[#27272a]' 
                  : 'bg-white border-slate-200 shadow-xs'
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
          { id: 'DIRECTORY', label: 'Workforce Directory', icon: Users, count: employees.length },
          { id: 'HARDWARE', label: 'Hardware Inventory', icon: Laptop, count: hardwareAssets.length },
          { id: 'SAAS', label: 'SaaS Accounts', icon: Key, count: saasAccounts.length },
          { id: 'MEETINGS', label: '1-on-1 Check-ins', icon: MessageSquare, count: oneOnOnes.length },
          { id: 'OFFBOARDING', label: 'Statutory Offboarding', icon: UserMinus, count: offboardingCases.length },
          { id: 'ANNOUNCEMENTS', label: 'Company Broadcasts', icon: Send, count: announcements.length },
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

      {/* TAB 1: WORKFORCE DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
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
                  placeholder="Search by employee name, email, ID, role, client..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-900/80 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                  }`}
                />
              </div>

              {/* Department Dropdown */}
              <div className="w-full sm:w-44">
                <StunningSelect
                  value={deptFilter}
                  onChange={(e) => { setDeptFilter(parseSelectVal(e)); setCurrentPage(1); }}
                  options={[
                    { value: 'ALL', label: 'All Departments' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Product & Design', label: 'Product & Design' },
                    { value: 'Human Resources', label: 'Human Resources' },
                    { value: 'Finance & Legal', label: 'Finance & Legal' },
                    { value: 'Sales & Marketing', label: 'Sales & Marketing' },
                    { value: 'Client Delivery', label: 'Client Delivery' },
                  ]}
                />
              </div>

              {/* Status Dropdown */}
              <div className="w-full sm:w-36">
                <StunningSelect
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(parseSelectVal(e)); setCurrentPage(1); }}
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'PROBATION', label: 'Probation' },
                    { value: 'ON_LEAVE', label: 'On Leave' },
                    { value: 'SEPARATED', label: 'Separated' },
                  ]}
                />
              </div>

              {/* Work Model Dropdown */}
              <div className="w-full sm:w-36">
                <StunningSelect
                  value={workModelFilter}
                  onChange={(e) => { setWorkModelFilter(parseSelectVal(e)); setCurrentPage(1); }}
                  options={[
                    { value: 'ALL', label: 'All Work Models' },
                    { value: 'REMOTE', label: 'Remote' },
                    { value: 'HYBRID', label: 'Hybrid' },
                    { value: 'ON_SITE', label: 'On-Site' },
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
                <Building2 size={13} />
                <span>Cards</span>
              </button>
            </div>
          </div>

          {/* TABLE VIEW (Row clicks open Modal Popup) */}
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
                      <th className="py-3.5 px-4">Employee / Identity</th>
                      <th className="py-3.5 px-4">Role & Department</th>
                      <th className="py-3.5 px-4">Work Model</th>
                      <th className="py-3.5 px-4">Placement Status</th>
                      <th className="py-3.5 px-4">Compensation</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${
                    isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'
                  }`}>
                    {paginatedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="p-3 rounded-2xl bg-zinc-800/50 text-zinc-400 mb-3">
                              <Users size={24} />
                            </div>
                            <h3 className="text-sm font-bold">No employees found</h3>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                              {searchQuery || deptFilter !== 'ALL' || statusFilter !== 'ALL'
                                ? 'No employee matches the active search filters.'
                                : 'No employees have been enrolled in directory yet.'}
                            </p>
                            <button
                              onClick={handleOpenAddEmployee}
                              className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white theme-bg-primary"
                            >
                              Onboard First Employee
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedEmployees.map((emp) => {
                        const statusB = getStatusBadge(emp.status || emp.employment_status);
                        const modelB = getWorkModelBadge(emp.work_model);
                        const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase() || 'EM';
                        const isPlaced = emp.placement_status === 'PLACED' || emp.current_client || emp.client_name;
                        const clientName = emp.client_name || emp.client_details?.client_name || 'Assigned Client';

                        return (
                          <tr
                            key={emp.id}
                            onClick={() => { setDossierEmployee(emp); setShowDossierModal(true); }}
                            className={`cursor-pointer transition-colors duration-150 ${
                              isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'
                            }`}
                            title="Click row to view full employee dossier popup"
                          >
                            {/* Employee Identity */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs theme-bg-primary text-white shadow-xs">
                                    {initials}
                                  </div>
                                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ${
                                    isDarkMode ? 'ring-[#121217]' : 'ring-white'
                                  } ${statusB.dot}`} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-xs truncate">
                                    {emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-400">
                                    <span className="truncate">{emp.work_email || emp.email}</span>
                                    {(emp.employee_code || emp.id) && (
                                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-800/60 text-zinc-300">
                                        {emp.employee_code || `EMP-${emp.id}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Designation & Department */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-xs">{emp.designation || emp.job_title || 'Team Member'}</span>
                                <span className="text-[11px] text-slate-400 dark:text-zinc-400">{emp.department || 'General'}</span>
                              </div>
                            </td>

                            {/* Work Model */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border w-fit ${modelB.bg}`}>
                                  <Globe size={10} />
                                  <span>{modelB.label}</span>
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-400 truncate">
                                  {emp.city ? `${emp.city}, ${emp.state || 'US'}` : (emp.state || emp.work_location || 'United States')}
                                </span>
                              </div>
                            </td>

                            {/* Clean Professional Placement Column */}
                            <td className="py-3.5 px-4">
                              {isPlaced ? (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 w-fit shadow-xs">
                                    <Briefcase size={11} className="text-purple-500" />
                                    <span>Client Placed</span>
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate max-w-[140px]">
                                    {clientName}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60 w-fit">
                                    <Building size={11} className="text-slate-500 dark:text-zinc-400" />
                                    <span>Direct In-House</span>
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                                    Internal Core Team
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Compensation */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-xs text-emerald-500">
                                  {(emp.compensation_rate || emp.hourly_rate || emp.salary) 
                                    ? `$${parseFloat(emp.compensation_rate || emp.hourly_rate || emp.salary).toLocaleString()}` 
                                    : '—'}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase">
                                  {emp.compensation_frequency || (emp.hourly_rate ? 'HOURLY' : 'ANNUAL')}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusB.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusB.dot}`} />
                                <span>{statusB.label}</span>
                              </span>
                            </td>

                            {/* Joined Date */}
                            <td className="py-3.5 px-4 text-slate-400 dark:text-zinc-400 text-xs whitespace-nowrap">
                              {(emp.date_of_joining || emp.joined_at) 
                                ? new Date(emp.date_of_joining || emp.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                                : '—'}
                            </td>

                            {/* Actions (stop propagation to prevent opening row modal) */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => handleOpenEditEmployee(emp, e)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                                  }`}
                                  title="Edit Employee Information"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteEmployee(emp, e)}
                                  className={`p-1.5 rounded-lg transition-colors text-rose-500/80 hover:text-rose-500 ${
                                    isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'
                                  }`}
                                  title="Decommission Record"
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
              {filteredEmployees.length > 0 && (
                <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                  isDarkMode ? 'border-zinc-800 bg-zinc-900/30 text-zinc-400' : 'border-slate-200 bg-slate-50/50 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>Showing</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {Math.min((currentPage - 1) * pageSize + 1, filteredEmployees.length)}
                    </span>
                    <span>to</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {Math.min(currentPage * pageSize, filteredEmployees.length)}
                    </span>
                    <span>of</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{filteredEmployees.length}</span>
                    <span>employees</span>
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
              {paginatedEmployees.length === 0 ? (
                <div className={`col-span-full p-12 text-center rounded-2xl border ${
                  isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200'
                }`}>
                  <p className="text-slate-400 dark:text-zinc-400">No employees match criteria.</p>
                </div>
              ) : (
                paginatedEmployees.map((emp) => {
                  const statusB = getStatusBadge(emp.status || emp.employment_status);
                  const modelB = getWorkModelBadge(emp.work_model);
                  const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase() || 'EM';
                  const isPlaced = emp.placement_status === 'PLACED' || emp.current_client || emp.client_name;

                  return (
                    <div
                      key={emp.id}
                      onClick={() => { setDossierEmployee(emp); setShowDossierModal(true); }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                        isDarkMode 
                          ? 'bg-[#121217] border-[#27272a] hover:border-zinc-700' 
                          : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs theme-bg-primary text-white shadow-xs">
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm tracking-tight">
                                {emp.full_name || `${emp.first_name} ${emp.last_name}`}
                              </h3>
                              <p className="text-xs text-slate-400 dark:text-zinc-400 font-medium">{emp.designation || emp.job_title || 'Team Member'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusB.bg}`}>
                            {statusB.label}
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${isDarkMode ? "bg-zinc-800/60 text-zinc-300 border-zinc-700/40" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                            {emp.department || 'General'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${modelB.bg}`}>
                            {modelB.label}
                          </span>
                          {isPlaced && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Client: {emp.client_name || emp.client_details?.client_name || 'Placed'}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className={`mt-4 p-3 rounded-xl border space-y-1.5 text-xs ${
                          isDarkMode ? 'bg-zinc-900/50 border-zinc-800/80' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 dark:text-zinc-400">Email:</span>
                            <span className="font-medium truncate max-w-[180px]">{emp.work_email || emp.email}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 dark:text-zinc-400">Rate:</span>
                            <span className="font-mono font-bold text-emerald-500">
                              {(emp.compensation_rate || emp.hourly_rate || emp.salary) 
                                ? `$${parseFloat(emp.compensation_rate || emp.hourly_rate || emp.salary).toLocaleString()} / ${emp.compensation_frequency?.toLowerCase() || 'hr'}` 
                                : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className={`flex items-center justify-between mt-5 pt-3 border-t text-xs ${isDarkMode ? "border-zinc-800/80" : "border-slate-100"}`} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setDossierEmployee(emp); setShowDossierModal(true); }}
                          className="flex items-center gap-1 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
                        >
                          <Eye size={13} />
                          <span>Dossier</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleOpenEditEmployee(emp, e)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteEmployee(emp, e)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"
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

      {/* TAB 2: HARDWARE ASSETS (Row click opens detail modal) */}
      {activeTab === 'HARDWARE' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Physical Equipment & Asset Management</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-400">Track MacBooks, Windows workstations, monitors, and security keys deployed across workforce.</p>
            </div>
            <button
              onClick={() => {
                setEditingAsset(null);
                setAssetFormData({
                  asset_tag: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
                  model_name: '',
                  category: 'LAPTOP',
                  serial_number: '',
                  assigned_to: '',
                  status: 'ASSIGNED',
                  condition: 'EXCELLENT',
                  purchase_date: new Date().toISOString().split('T')[0],
                  cost: '',
                });
                setShowAssetModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white theme-bg-primary"
            >
              <Plus size={14} />
              <span>Register Hardware Asset</span>
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDarkMode ? 'border-zinc-800 text-slate-400 bg-zinc-900/40' : 'border-slate-200 text-slate-600 bg-slate-50'
                  }`}>
                    <th className="py-3.5 px-4">Asset Tag & Model</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Assigned To</th>
                    <th className="py-3.5 px-4">Serial Number</th>
                    <th className="py-3.5 px-4">Condition</th>
                    <th className="py-3.5 px-4">Deployment Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-medium ${isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'}`}>
                  {hardwareAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-zinc-400">
                        No hardware assets registered yet.
                      </td>
                    </tr>
                  ) : (
                    hardwareAssets.map((asset) => (
                      <tr 
                        key={asset.id} 
                        onClick={() => { setSelectedAsset(asset); setShowAssetDetailModal(true); }}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'
                        }`}
                        title="Click row to view hardware asset details"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{asset.model_name}</span>
                            <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-400">{asset.asset_tag}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300">
                            {asset.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {asset.assigned_to_name ? (
                            <span className="font-semibold text-xs text-blue-400">{asset.assigned_to_name}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-500 italic">Unassigned (In Vault)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 dark:text-zinc-400">
                          {asset.serial_number || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {asset.condition}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            asset.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAsset(asset);
                                setAssetFormData({
                                  asset_tag: asset.asset_tag,
                                  model_name: asset.model_name,
                                  category: asset.category,
                                  serial_number: asset.serial_number || '',
                                  assigned_to: asset.assigned_to ? String(asset.assigned_to) : '',
                                  status: asset.status,
                                  condition: asset.condition,
                                  purchase_date: asset.purchase_date || '',
                                  cost: asset.cost || '',
                                });
                                setShowAssetModal(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Hardware Asset?',
                                  message: `Remove asset ${asset.asset_tag} from records?`,
                                  confirmText: 'Delete',
                                  onConfirm: async () => {
                                    await dispatch(deleteHardwareAsset(asset.id)).unwrap();
                                    reloadAll();
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 size={14} />
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

      {/* TAB 3: SAAS ACCOUNTS (Row click opens detail modal) */}
      {activeTab === 'SAAS' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">SaaS Identity & Cloud License Provisioning</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-400">Zero-Trust SSO, Google Workspace, GitHub, Slack, AWS IAM credentials across workforce.</p>
            </div>
            <button
              onClick={() => {
                setEditingSaaS(null);
                setSaasFormData({
                  app_name: 'Google Workspace',
                  app_category: 'IDENTITY',
                  assigned_to: '',
                  account_email: '',
                  role_tier: 'MEMBER',
                  status: 'PROVISIONED',
                  is_mfa_enforced: true,
                  sso_integrated: true,
                });
                setShowSaaSModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white theme-bg-primary"
            >
              <Plus size={14} />
              <span>Provision SaaS Seat</span>
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDarkMode ? 'border-zinc-800 text-slate-400 bg-zinc-900/40' : 'border-slate-200 text-slate-600 bg-slate-50'
                  }`}>
                    <th className="py-3.5 px-4">Application & Category</th>
                    <th className="py-3.5 px-4">Account Email / Identity</th>
                    <th className="py-3.5 px-4">Assigned Member</th>
                    <th className="py-3.5 px-4">License / Role Tier</th>
                    <th className="py-3.5 px-4">Security Policy</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-medium ${isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'}`}>
                  {saasAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-zinc-400">
                        No SaaS cloud seats provisioned.
                      </td>
                    </tr>
                  ) : (
                    saasAccounts.map((account) => (
                      <tr 
                        key={account.id} 
                        onClick={() => { setSelectedSaaS(account); setShowSaaSDetailModal(true); }}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'
                        }`}
                        title="Click row to view SaaS account details"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-zinc-800 text-cyan-400">
                              <Key size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-xs">{account.app_name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-400">{account.app_category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">{account.account_email}</td>
                        <td className="py-3.5 px-4 font-semibold text-xs text-blue-400">
                          {account.assigned_to_name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {account.role_tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {account.is_mfa_enforced && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <ShieldCheck size={12} /> MFA Active
                              </span>
                            )}
                            {account.sso_integrated && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                                <Lock size={12} /> SSO Linked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            account.status === 'PROVISIONED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {account.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {account.status === 'PROVISIONED' && (
                              <button
                                onClick={(e) => handleRevokeSaaS(account, e)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                              >
                                Revoke Access
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete SaaS Seat Record?',
                                  message: `Remove ${account.app_name} account entry?`,
                                  confirmText: 'Delete',
                                  onConfirm: async () => {
                                    await dispatch(deleteSaaSAccount(account.id)).unwrap();
                                    reloadAll();
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 size={14} />
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

      {/* TAB 4: 1-ON-1s (Row click opens detail modal) */}
      {activeTab === 'MEETINGS' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">1-on-1s & Manager Alignment</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-400">Regular sync meetings, progress check-ins, and career feedback notes.</p>
            </div>
            <button
              onClick={() => {
                setEditingMeeting(null);
                setMeetingFormData({
                  title: 'Weekly 1-on-1 Sync',
                  employee: '',
                  facilitator_name: '',
                  scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                  meeting_link: 'https://meet.google.com/new',
                  status: 'SCHEDULED',
                  talking_points: '',
                });
                setShowMeetingModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white theme-bg-primary"
            >
              <Plus size={14} />
              <span>Schedule 1-on-1</span>
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDarkMode ? 'border-zinc-800 text-slate-400 bg-zinc-900/40' : 'border-slate-200 text-slate-600 bg-slate-50'
                  }`}>
                    <th className="py-3.5 px-4">Session & Member</th>
                    <th className="py-3.5 px-4">Facilitator / Manager</th>
                    <th className="py-3.5 px-4">Scheduled Date & Time</th>
                    <th className="py-3.5 px-4">Talking Points</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-medium ${isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'}`}>
                  {oneOnOnes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-zinc-400">
                        No 1-on-1 meetings scheduled yet.
                      </td>
                    </tr>
                  ) : (
                    oneOnOnes.map((meeting) => (
                      <tr 
                        key={meeting.id} 
                        onClick={() => { setSelectedMeeting(meeting); setShowMeetingDetailModal(true); }}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'
                        }`}
                        title="Click row to view 1-on-1 agenda & details"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{meeting.title}</span>
                            <span className="text-[11px] text-blue-400 font-semibold">{meeting.employee_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-xs">{meeting.facilitator_name || 'Manager'}</td>
                        <td className="py-3.5 px-4 text-slate-400 dark:text-zinc-400">
                          {new Date(meeting.scheduled_at).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-zinc-300">
                          {meeting.talking_points || 'General check-in & sprint priorities.'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {meeting.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {meeting.meeting_link && (
                              <a
                                href={meeting.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
                              >
                                <Video size={12} />
                                <span>Join</span>
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Cancel 1-on-1 Sync?',
                                  message: `Remove scheduled session "${meeting.title}"?`,
                                  confirmText: 'Delete',
                                  onConfirm: async () => {
                                    await dispatch(deleteOneOnOne(meeting.id)).unwrap();
                                    reloadAll();
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 size={14} />
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

      {/* TAB 5: STATUTORY OFFBOARDING (Row click opens detail modal) */}
      {activeTab === 'OFFBOARDING' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">US Statutory Offboarding & Separation Governance</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-400">Compliant state final pay calculations (CA, NY, TX), hardware returns, and automated SaaS deprovisioning.</p>
            </div>
            <button
              onClick={() => {
                setEditingOffboarding(null);
                setOffboardingFormData({
                  employee: '',
                  separation_type: 'VOLUNTARY_RESIGNATION',
                  notice_date: new Date().toISOString().split('T')[0],
                  effective_last_day: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                  us_state_jurisdiction: 'CA',
                  status: 'IN_PROGRESS',
                  reason_notes: '',
                });
                setShowOffboardingModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white theme-bg-primary"
            >
              <Plus size={14} />
              <span>Initiate Offboarding Case</span>
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDarkMode ? 'border-zinc-800 text-slate-400 bg-zinc-900/40' : 'border-slate-200 text-slate-600 bg-slate-50'
                  }`}>
                    <th className="py-3.5 px-4">Employee & Separation Type</th>
                    <th className="py-3.5 px-4">US Jurisdiction</th>
                    <th className="py-3.5 px-4">Effective Last Day</th>
                    <th className="py-3.5 px-4">Statutory Compliance Milestones</th>
                    <th className="py-3.5 px-4">Workflow Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-medium ${isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'}`}>
                  {offboardingCases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-zinc-400">
                        No active offboarding separation cases.
                      </td>
                    </tr>
                  ) : (
                    offboardingCases.map((cs) => (
                      <tr 
                        key={cs.id} 
                        onClick={() => { setSelectedOffboarding(cs); setShowOffboardingDetailModal(true); }}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50'
                        }`}
                        title="Click row to view offboarding milestone details"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{cs.employee_name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-400">{cs.separation_type?.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-amber-400 border border-amber-500/20">
                            {cs.us_state_jurisdiction} Statutory
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-rose-400">
                          {cs.effective_last_day}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 text-[10px]">
                            <span className={`inline-flex items-center gap-1 ${cs.hardware_returned ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {cs.hardware_returned ? <CheckCircle2 size={12} /> : <Square size={12} />} Hardware
                            </span>
                            <span className={`inline-flex items-center gap-1 ${cs.saas_access_revoked ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {cs.saas_access_revoked ? <CheckCircle2 size={12} /> : <Square size={12} />} SaaS Revoked
                            </span>
                            <span className={`inline-flex items-center gap-1 ${cs.final_pay_calculated ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {cs.final_pay_calculated ? <CheckCircle2 size={12} /> : <Square size={12} />} Final Pay
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {cs.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Offboarding Case?',
                                  message: `Remove offboarding case for ${cs.employee_name}?`,
                                  confirmText: 'Delete',
                                  onConfirm: async () => {
                                    await dispatch(deleteOffboardingCase(cs.id)).unwrap();
                                    reloadAll();
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 size={14} />
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

      {/* TAB 6: COMPANY BROADCASTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Company Broadcasts & Workforce Announcements</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-400">Post policy updates, benefits enrollment notices, and all-hands announcements.</p>
            </div>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setAnnouncementFormData({
                  title: '',
                  content: '',
                  priority: 'GENERAL',
                  target_audience: 'ALL_WORKFORCE',
                  is_pinned: false,
                  author_name: 'HR Operations',
                });
                setShowAnnouncementModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white theme-bg-primary"
            >
              <Plus size={14} />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.length === 0 ? (
              <div className={`col-span-full p-12 text-center rounded-2xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200'
              }`}>
                <p className="text-slate-400 dark:text-zinc-400">No company announcements published yet.</p>
              </div>
            ) : (
              announcements.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {item.priority}
                      </span>
                      {item.is_pinned && (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          ★ Pinned
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'Delete Announcement?',
                          message: `Remove "${item.title}" from company feed?`,
                          confirmText: 'Delete',
                          onConfirm: async () => {
                            await dispatch(deleteAnnouncement(item.id)).unwrap();
                            reloadAll();
                          }
                        });
                      }}
                      className="text-slate-400 dark:text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm mt-3">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] ${isDarkMode ? "border-zinc-800/80" : "border-slate-100"} text-slate-400 dark:text-zinc-500`}>
                    <span>By {item.author_name}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. MODALS & POPUPS */}

      {/* 5.1 EMPLOYEE DOSSIER MODAL POPUP (Triggered by clicking row) */}
      {showDossierModal && dossierEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 space-y-6 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                  Employee Dossier & Workforce Profile
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ID: #{dossierEmployee.id}
                </span>
              </div>
              <button
                onClick={() => setShowDossierModal(false)}
                className="p-1 rounded-xl text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Banner */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl theme-bg-primary text-white shadow-md">
                  {`${dossierEmployee.first_name?.[0] || ''}${dossierEmployee.last_name?.[0] || ''}`.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    {dossierEmployee.full_name || `${dossierEmployee.first_name} ${dossierEmployee.last_name}`}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-zinc-400 font-semibold mt-0.5">
                    {dossierEmployee.designation || dossierEmployee.job_title || 'Team Member'} • {dossierEmployee.department || 'General'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-zinc-400">
                    <Mail size={12} />
                    <span>{dossierEmployee.work_email || dossierEmployee.email}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(dossierEmployee.status || dossierEmployee.employment_status).bg}`}>
                {getStatusBadge(dossierEmployee.status || dossierEmployee.employment_status).label}
              </span>
            </div>

            {/* Comprehensive Dossier Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-bold text-slate-400 dark:text-zinc-400 uppercase text-[10px]">Employment & Placement</h4>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Work Model:</span>
                  <span className="font-bold">{dossierEmployee.work_model || 'Hybrid'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Location:</span>
                  <span className="font-medium">{dossierEmployee.city ? `${dossierEmployee.city}, ${dossierEmployee.state}` : (dossierEmployee.state || dossierEmployee.work_location || 'United States')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Placement:</span>
                  <span className="font-bold text-purple-400">
                    {(dossierEmployee.placement_status === 'PLACED' || dossierEmployee.current_client || dossierEmployee.client_name)
                      ? `Placed @ ${dossierEmployee.client_name || dossierEmployee.client_details?.client_name || 'Assigned Client'}`
                      : 'Direct In-House Core'}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-bold text-slate-400 dark:text-zinc-400 uppercase text-[10px]">Compensation & Dates</h4>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Compensation:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {(dossierEmployee.compensation_rate || dossierEmployee.hourly_rate || dossierEmployee.salary)
                      ? `$${parseFloat(dossierEmployee.compensation_rate || dossierEmployee.hourly_rate || dossierEmployee.salary).toLocaleString()} / ${dossierEmployee.compensation_frequency?.toLowerCase() || (dossierEmployee.hourly_rate ? 'hr' : 'yr')}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Joined Date:</span>
                  <span className="font-medium">
                    {(dossierEmployee.date_of_joining || dossierEmployee.joined_at)
                      ? new Date(dossierEmployee.date_of_joining || dossierEmployee.joined_at).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Phone:</span>
                  <span className="font-medium">{dossierEmployee.phone_number || '—'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center justify-end gap-2.5 pt-4 border-t ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <button
                onClick={() => setShowDossierModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDossierModal(false);
                  handleOpenEditEmployee(dossierEmployee);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white theme-bg-primary shadow-sm"
              >
                Edit Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5.2 HARDWARE ASSET DETAIL POPUP (Triggered by clicking row) */}
      {showAssetDetailModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <h3 className="text-base font-bold">Hardware Asset Details</h3>
              <button onClick={() => setShowAssetDetailModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Model Name:</span>
                <span className="font-bold">{selectedAsset.model_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Asset Tag:</span>
                <span className="font-mono text-zinc-300">{selectedAsset.asset_tag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold">{selectedAsset.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Serial Number:</span>
                <span className="font-mono">{selectedAsset.serial_number || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned To:</span>
                <span className="font-bold text-blue-400">{selectedAsset.assigned_to_name || 'Unassigned (In Vault)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Condition:</span>
                <span className="font-bold text-emerald-400">{selectedAsset.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold">{selectedAsset.status}</span>
              </div>
            </div>
            <button
              onClick={() => setShowAssetDetailModal(false)}
              className="w-full py-2 rounded-xl text-xs font-bold text-white theme-bg-primary mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 5.3 SAAS ACCOUNT DETAIL POPUP (Triggered by clicking row) */}
      {showSaaSDetailModal && selectedSaaS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <h3 className="text-base font-bold">SaaS Provisioning Details</h3>
              <button onClick={() => setShowSaaSDetailModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Application:</span>
                <span className="font-bold">{selectedSaaS.app_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Email:</span>
                <span className="font-mono text-zinc-300">{selectedSaaS.account_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Member:</span>
                <span className="font-bold text-blue-400">{selectedSaaS.assigned_to_name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role Tier:</span>
                <span className="font-semibold text-purple-400">{selectedSaaS.role_tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MFA Policy:</span>
                <span className="font-bold text-emerald-400">{selectedSaaS.is_mfa_enforced ? 'Enforced' : 'Optional'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SSO Integrated:</span>
                <span className="font-bold text-cyan-400">{selectedSaaS.sso_integrated ? 'Active' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold">{selectedSaaS.status}</span>
              </div>
            </div>
            <button
              onClick={() => setShowSaaSDetailModal(false)}
              className="w-full py-2 rounded-xl text-xs font-bold text-white theme-bg-primary mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 5.4 1-ON-1 MEETING DETAIL POPUP (Triggered by clicking row) */}
      {showMeetingDetailModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <h3 className="text-base font-bold">1-on-1 Meeting Agenda</h3>
              <button onClick={() => setShowMeetingDetailModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Session Title:</span>
                <span className="font-bold">{selectedMeeting.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Direct Report:</span>
                <span className="font-bold text-blue-400">{selectedMeeting.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Facilitator:</span>
                <span className="font-medium">{selectedMeeting.facilitator_name || 'Manager'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scheduled At:</span>
                <span className="font-medium">{new Date(selectedMeeting.scheduled_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Talking Points:</span>
                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {selectedMeeting.talking_points || 'General sync, sprint milestones, and progress check-in.'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              {selectedMeeting.meeting_link && (
                <a
                  href={selectedMeeting.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  <Video size={13} />
                  <span>Launch Google Meet</span>
                </a>
              )}
              <button
                onClick={() => setShowMeetingDetailModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5.5 OFFBOARDING DETAIL POPUP (Triggered by clicking row) */}
      {showOffboardingDetailModal && selectedOffboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <h3 className="text-base font-bold">Statutory Separation Case</h3>
              <button onClick={() => setShowOffboardingDetailModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-blue-400">{selectedOffboarding.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Separation Type:</span>
                <span className="font-semibold">{selectedOffboarding.separation_type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">US State Jurisdiction:</span>
                <span className="font-bold text-amber-400">{selectedOffboarding.us_state_jurisdiction} Statutory</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Effective Last Day:</span>
                <span className="font-bold text-rose-400">{selectedOffboarding.effective_last_day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-amber-400">{selectedOffboarding.status}</span>
              </div>
              <div className={`p-3 rounded-xl border space-y-1.5 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h5 className="font-bold text-[10px] uppercase text-slate-400">Compliance Milestones</h5>
                <div className="flex items-center gap-2">
                  <span className={selectedOffboarding.hardware_returned ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    {selectedOffboarding.hardware_returned ? '✓ Hardware Assets Retrieved' : '○ Pending Hardware Return'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={selectedOffboarding.saas_access_revoked ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    {selectedOffboarding.saas_access_revoked ? '✓ SaaS / Identity Access Revoked' : '○ Pending Access Deprovisioning'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={selectedOffboarding.final_pay_calculated ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    {selectedOffboarding.final_pay_calculated ? '✓ State Statutory Final Pay Computed' : '○ Final Pay Calculation Pending'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowOffboardingDetailModal(false)}
              className="w-full py-2 rounded-xl text-xs font-bold text-white theme-bg-primary mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 5.6 EMPLOYEE CREATE / EDIT MODAL */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 mb-5 ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
              <h2 className="text-lg font-extrabold tracking-tight">
                {editingEmployee ? 'Edit Employee Profile' : 'Onboard New Employee'}
              </h2>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="p-1 rounded-xl text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={employeeFormData.first_name}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, first_name: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-semibold ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={employeeFormData.last_name}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, last_name: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-semibold ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={employeeFormData.work_email}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, work_email: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-semibold ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Designation / Title *</label>
                  <input
                    type="text"
                    required
                    value={employeeFormData.designation}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, designation: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                    className={`w-full p-2.5 rounded-xl border font-semibold ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Department</label>
                  <StunningSelect
                    value={employeeFormData.department}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, department: parseSelectVal(e) })}
                    options={[
                      { value: 'Engineering', label: 'Engineering' },
                      { value: 'Product & Design', label: 'Product & Design' },
                      { value: 'Human Resources', label: 'Human Resources' },
                      { value: 'Finance & Legal', label: 'Finance & Legal' },
                      { value: 'Sales & Marketing', label: 'Sales & Marketing' },
                      { value: 'Client Delivery', label: 'Client Delivery' },
                    ]}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Employment Type</label>
                  <StunningSelect
                    value={employeeFormData.employment_type}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, employment_type: parseSelectVal(e) })}
                    options={[
                      { value: 'FULL_TIME', label: 'Full Time' },
                      { value: 'PART_TIME', label: 'Part Time' },
                      { value: 'CONTRACTOR', label: '1099 Contractor' },
                      { value: 'INTERN', label: 'Intern' },
                    ]}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Work Model</label>
                  <StunningSelect
                    value={employeeFormData.work_model}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, work_model: parseSelectVal(e) })}
                    options={[
                      { value: 'REMOTE', label: 'Remote' },
                      { value: 'HYBRID', label: 'Hybrid' },
                      { value: 'ON_SITE', label: 'On-Site' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Placement Model</label>
                  <StunningSelect
                    value={employeeFormData.placement_status}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, placement_status: parseSelectVal(e) })}
                    options={[
                      { value: 'DIRECT', label: 'Direct / In-House Workforce' },
                      { value: 'PLACED', label: 'Placed with Client Account' },
                    ]}
                  />
                </div>
                {employeeFormData.placement_status === 'PLACED' && (
                  <div>
                    <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Client Name</label>
                    <input
                      type="text"
                      value={employeeFormData.client_name}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, client_name: e.target.value })}
                      placeholder="e.g. Apex Health Systems"
                      className={`w-full p-2.5 rounded-xl border font-semibold ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Compensation Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={employeeFormData.compensation_rate}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, compensation_rate: e.target.value })}
                    placeholder="e.g. 75.00 or 145000"
                    className={`w-full p-2.5 rounded-xl border font-semibold ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Frequency</label>
                  <StunningSelect
                    value={employeeFormData.compensation_frequency}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, compensation_frequency: parseSelectVal(e) })}
                    options={[
                      { value: 'HOURLY', label: 'Hourly ($/hr)' },
                      { value: 'ANNUAL', label: 'Annual ($/year)' },
                      { value: 'MONTHLY', label: 'Monthly' },
                    ]}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white shadow-md theme-bg-primary"
                >
                  {editingEmployee ? 'Save Changes' : 'Enroll Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.7 HARDWARE ASSET MODAL (With working employee select) */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl border p-6 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-bold mb-4">Register Hardware Asset</h2>
            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro M3 Max 16-inch 36GB"
                  value={assetFormData.model_name}
                  onChange={(e) => setAssetFormData({ ...assetFormData, model_name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Asset Tag</label>
                  <input
                    type="text"
                    value={assetFormData.asset_tag}
                    onChange={(e) => setAssetFormData({ ...assetFormData, asset_tag: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Category</label>
                  <StunningSelect
                    value={assetFormData.category}
                    onChange={(e) => setAssetFormData({ ...assetFormData, category: parseSelectVal(e) })}
                    options={[
                      { value: 'LAPTOP', label: 'Laptop' },
                      { value: 'MONITOR', label: 'External Monitor' },
                      { value: 'SECURITY_KEY', label: 'Hardware Key' },
                      { value: 'MOBILE', label: 'Mobile Device' },
                    ]}
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Assign to Employee</label>
                <StunningSelect
                  value={assetFormData.assigned_to ? String(assetFormData.assigned_to) : ''}
                  onChange={(e) => setAssetFormData({ ...assetFormData, assigned_to: parseSelectVal(e) })}
                  options={employeeSelectOptions}
                />
              </div>
              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
                <button type="button" onClick={() => setShowAssetModal(false)} className="px-3 py-2 text-slate-400 dark:text-zinc-400">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-white font-bold theme-bg-primary">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.8 SAAS ACCOUNT MODAL (With working employee select) */}
      {showSaaSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl border p-6 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-bold mb-4">Provision SaaS Account</h2>
            <form onSubmit={handleSaveSaaS} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Application Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS, GitHub, Slack"
                    value={saasFormData.app_name}
                    onChange={(e) => setSaasFormData({ ...saasFormData, app_name: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Category</label>
                  <StunningSelect
                    value={saasFormData.app_category}
                    onChange={(e) => setSaasFormData({ ...saasFormData, app_category: parseSelectVal(e) })}
                    options={[
                      { value: 'IDENTITY', label: 'Identity / SSO' },
                      { value: 'DEV_TOOLS', label: 'Developer Tools' },
                      { value: 'COMMUNICATION', label: 'Communication' },
                      { value: 'FINANCE', label: 'Finance & HR' },
                    ]}
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Assignee</label>
                <StunningSelect
                  value={saasFormData.assigned_to ? String(saasFormData.assigned_to) : ''}
                  onChange={(e) => setSaasFormData({ ...saasFormData, assigned_to: parseSelectVal(e) })}
                  options={employeeSelectOptions}
                />
              </div>
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Account Email *</label>
                <input
                  type="email"
                  required
                  placeholder="user@company.com"
                  value={saasFormData.account_email}
                  onChange={(e) => setSaasFormData({ ...saasFormData, account_email: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
                <button type="button" onClick={() => setShowSaaSModal(false)} className="px-3 py-2 text-slate-400 dark:text-zinc-400">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-white font-bold theme-bg-primary">Provision Seat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.9 1-ON-1 MEETING MODAL (With working employee select) */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl border p-6 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-bold mb-4">Schedule 1-on-1 Check-in</h2>
            <form onSubmit={handleSaveMeeting} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={meetingFormData.title}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Direct Report *</label>
                <StunningSelect
                  value={meetingFormData.employee ? String(meetingFormData.employee) : ''}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, employee: parseSelectVal(e) })}
                  options={employeeSelectOptions}
                />
              </div>
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Agenda / Talking Points</label>
                <textarea
                  rows={3}
                  value={meetingFormData.talking_points}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, talking_points: e.target.value })}
                  placeholder="Key discussion points, performance feedback, blockers..."
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
                <button type="button" onClick={() => setShowMeetingModal(false)} className="px-3 py-2 text-slate-400 dark:text-zinc-400">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-white font-bold theme-bg-primary">Schedule Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.10 STATUTORY OFFBOARDING MODAL (With working employee select) */}
      {showOffboardingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl border p-6 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-bold mb-4">Initiate Statutory Offboarding</h2>
            <form onSubmit={handleSaveOffboarding} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Employee *</label>
                <StunningSelect
                  value={offboardingFormData.employee ? String(offboardingFormData.employee) : ''}
                  onChange={(e) => setOffboardingFormData({ ...offboardingFormData, employee: parseSelectVal(e) })}
                  options={employeeSelectOptions}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Separation Type</label>
                  <StunningSelect
                    value={offboardingFormData.separation_type}
                    onChange={(e) => setOffboardingFormData({ ...offboardingFormData, separation_type: parseSelectVal(e) })}
                    options={[
                      { value: 'VOLUNTARY_RESIGNATION', label: 'Voluntary Resignation' },
                      { value: 'INVOLUNTARY_TERMINATION', label: 'Involuntary Termination' },
                      { value: 'REDUCTION_IN_FORCE', label: 'Reduction in Force' },
                      { value: 'END_OF_CONTRACT', label: 'End of Contract' },
                    ]}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">US Jurisdiction State</label>
                  <StunningSelect
                    value={offboardingFormData.us_state_jurisdiction}
                    onChange={(e) => setOffboardingFormData({ ...offboardingFormData, us_state_jurisdiction: parseSelectVal(e) })}
                    options={[
                      { value: 'CA', label: 'California (CA)' },
                      { value: 'NY', label: 'New York (NY)' },
                      { value: 'TX', label: 'Texas (TX)' },
                      { value: 'WA', label: 'Washington (WA)' },
                      { value: 'IL', label: 'Illinois (IL)' },
                    ]}
                  />
                </div>
              </div>
              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
                <button type="button" onClick={() => setShowOffboardingModal(false)} className="px-3 py-2 text-slate-400 dark:text-zinc-400">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-white font-bold theme-bg-primary">Launch Separation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.11 ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl border p-6 ${
            isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-lg font-bold mb-4">Create Workforce Announcement</h2>
            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Title / Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Company All-Hands & Policy Updates"
                  value={announcementFormData.title}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div>
                <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Announcement Body *</label>
                <textarea
                  rows={4}
                  required
                  value={announcementFormData.content}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 dark:text-zinc-400 block mb-1">Priority</label>
                  <StunningSelect
                    value={announcementFormData.priority}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, priority: parseSelectVal(e) })}
                    options={[
                      { value: 'GENERAL', label: 'General Announcement' },
                      { value: 'CRITICAL', label: 'Critical / Policy Update' },
                    ]}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_pinned"
                    checked={announcementFormData.is_pinned}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, is_pinned: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="is_pinned" className="font-semibold text-slate-700 dark:text-zinc-300">Pin to top of feed</label>
                </div>
              </div>
              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDarkMode ? "border-zinc-800" : "border-slate-100"}`}>
                <button type="button" onClick={() => setShowAnnouncementModal(false)} className="px-3 py-2 text-slate-400 dark:text-zinc-400">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-white font-bold theme-bg-primary">Publish Broadcast</button>
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
