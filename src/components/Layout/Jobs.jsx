import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Briefcase, Users, Plus, Search, Filter, Play, CheckCircle, 
  Clock, AlertCircle, X, ChevronRight, Hash, Star, Calendar, 
  MapPin, DollarSign, Building, Building2, Eye, Edit3, Trash2, 
  Check, ArrowRight, UserPlus, FileText, Sparkles, ExternalLink, 
  Share2, Award, Laptop, Layers, ShieldCheck, RefreshCw, Send,
  TrendingUp, BarChart3, Video, UserCheck, CheckCircle2, ChevronDown,
  AlertTriangle, CheckCircle as CheckCircleIcon, XCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { useTheme } from '../Theme/ThemeProvider';
import { StunningSelect, StunningDatePicker } from '../tasks/StunningSelect';
import PageLoader from '../common/LoadingScreen/LoadingScreen';
import { 
  fetchJobStats, 
  fetchJobs, 
  fetchJobDetail, 
  createJob, 
  updateJob, 
  deleteJob,
  fetchApplications, 
  createApplication, 
  updateApplication, 
  deleteApplication, 
  convertToOnboarding,
  fetchInterviews, 
  createInterview, 
  updateInterview, 
  deleteInterview,
  setSelectedJob, 
  setSelectedApplication,
  clearSuccess,
  clearError
} from '../../store/jobSlice';

// Helper to safely extract clean error messages from backend responses
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

// Stage Badge Styling
const getStageBadge = (stage = '') => {
  switch (stage) {
    case 'APPLIED': return { label: 'New Applied', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    case 'SCREENING': return { label: 'Screening', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'PHONE_SCREEN': return { label: 'Phone Screen', bg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    case 'INTERVIEW': return { label: 'Interviewing', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
    case 'OFFER_EXTENDED': return { label: 'Offer Extended', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
    case 'OFFER_ACCEPTED': return { label: 'Offer Accepted', bg: 'bg-teal-500/10 text-teal-500 border-teal-500/20' };
    case 'HIRED': return { label: 'Hired & Onboarded', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    case 'REJECTED': return { label: 'Archived / Rejected', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    default: return { label: stage, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
};

const getStatusBadge = (status = '') => {
  switch (status) {
    case 'PUBLISHED': return { label: 'Active / Published', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    case 'DRAFT': return { label: 'Draft', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    case 'ON_HOLD': return { label: 'On Hold', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'CLOSED': return { label: 'Closed', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
    case 'FILLED': return { label: 'Position Filled', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' };
    default: return { label: status, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
};

const JobsDashboard = () => {
  const { isDarkMode, accentColor, themeColors } = useTheme();
  const dispatch = useDispatch();

  const activeHexColor = useMemo(() => {
    const match = themeColors?.find(t => t.id === accentColor);
    return match ? match.color : '#2563eb';
  }, [accentColor, themeColors]);

  const { 
    stats, 
    jobs = [], 
    selectedJob, 
    applications = [], 
    selectedApplication, 
    interviews = [], 
    loading, 
    converting, 
    success, 
    error 
  } = useSelector((state) => state.jobs || {});

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState('JOBS'); // 'JOBS' | 'CANDIDATES' | 'INTERVIEWS' | 'ANALYTICS'

  // Job Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [workplaceFilter, setWorkplaceFilter] = useState('ALL');

  // Candidate Stage Filter
  const [candidateStageFilter, setCandidateStageFilter] = useState('ALL');
  const [candidateSearch, setCandidateSearch] = useState('');

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

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    job_name: '',
    role: '',
    department: 'Engineering',
    workplace_type: 'HYBRID',
    employment_type: 'FULL_TIME',
    status: 'PUBLISHED',
    location: '',
    pay: '',
    min_salary: '',
    max_salary: '',
    currency: 'USD',
    openings_count: 1,
    required_experience: '3+ Years',
    job_overview: '',
    responsibilities: '',
    qualification: '',
    skills: '',
    benefits: '',
    closing_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  });

  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateModalData, setCandidateModalData] = useState(null);

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertData, setConvertData] = useState({
    candidate_id: null,
    candidate_name: '',
    candidate_email: '',
    job_title: '',
    start_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
    department: 'Engineering',
    employment_type: 'FULL_TIME',
  });

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewFormData, setInterviewFormData] = useState({
    application: '',
    round_name: 'Technical Systems Interview',
    scheduled_at: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 16),
    duration_minutes: 60,
    meeting_link: 'https://meet.google.com/new',
    status: 'SCHEDULED',
    interviewer_feedback: '',
    candidate_score: 8,
  });

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchJobStats());
    dispatch(fetchJobs());
    dispatch(fetchApplications());
    dispatch(fetchInterviews());
  }, [dispatch]);

  // Handle Save Job (Create / Update)
  const handleSaveJob = async (e) => {
    e.preventDefault();
    const payload = {
      ...jobFormData,
      min_salary: jobFormData.min_salary ? parseFloat(jobFormData.min_salary) : null,
      max_salary: jobFormData.max_salary ? parseFloat(jobFormData.max_salary) : null,
      openings_count: parseInt(jobFormData.openings_count) || 1,
      closing_date: jobFormData.closing_date ? jobFormData.closing_date : null,
    };

    try {
      if (editingJob) {
        await dispatch(updateJob({ id: editingJob.id, data: payload })).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Job Updated Successfully',
          message: `The job requisition "${jobFormData.job_name}" has been updated.`,
        });
      } else {
        await dispatch(createJob(payload)).unwrap();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Job Published Successfully',
          message: `The job requisition "${jobFormData.job_name}" is now live and published in the talent pipeline.`,
        });
      }
      setShowJobModal(false);
      setEditingJob(null);
      dispatch(fetchJobs());
      dispatch(fetchJobStats());
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Failed to Save Job',
        message: extractErrorMessage(err, 'Please check all required fields and try again.'),
      });
    }
  };

  // 1-Click Convert to Onboarding
  const handleExecuteConversion = async () => {
    if (!convertData.candidate_id) return;
    try {
      await dispatch(convertToOnboarding({
        id: convertData.candidate_id,
        payload: {
          start_date: convertData.start_date,
          department: convertData.department,
          employment_type: convertData.employment_type,
        }
      })).unwrap();

      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Candidate Converted to Onboarding',
        message: `${convertData.candidate_name} has been initiated into the employee onboarding roster with start date ${convertData.start_date}.`,
      });

      setShowConvertModal(false);
      dispatch(fetchApplications());
      dispatch(fetchJobStats());
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Conversion Failed',
        message: extractErrorMessage(err, 'Unable to convert candidate to onboarding.'),
      });
    }
  };

  // Save Interview
  const handleSaveInterview = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createInterview({
        ...interviewFormData,
        application: parseInt(interviewFormData.application),
        scheduled_at: new Date(interviewFormData.scheduled_at).toISOString(),
      })).unwrap();

      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Interview Round Scheduled',
        message: `Interview round "${interviewFormData.round_name}" has been successfully scheduled.`,
      });

      setShowInterviewModal(false);
      dispatch(fetchInterviews());
      dispatch(fetchJobStats());
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Scheduling Failed',
        message: extractErrorMessage(err, 'Unable to schedule interview round.'),
      });
    }
  };

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch = job.job_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (job.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (job.skills || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || job.status === statusFilter;
      const matchDept = departmentFilter === 'ALL' || job.department === departmentFilter;
      const matchWorkplace = workplaceFilter === 'ALL' || job.workplace_type === workplaceFilter;
      return matchSearch && matchStatus && matchDept && matchWorkplace;
    });
  }, [jobs, searchQuery, statusFilter, departmentFilter, workplaceFilter]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch = app.full_name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                          app.email.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                          (app.current_job_title || '').toLowerCase().includes(candidateSearch.toLowerCase()) ||
                          (app.job_title || '').toLowerCase().includes(candidateSearch.toLowerCase());
      const matchStage = candidateStageFilter === 'ALL' || app.stage === candidateStageFilter;
      return matchSearch && matchStage;
    });
  }, [applications, candidateSearch, candidateStageFilter]);

  // Unique Departments
  const departments = useMemo(() => {
    const set = new Set(jobs.map(j => j.department).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [jobs]);

  if (loading && (!jobs || jobs.length === 0) && (!applications || applications.length === 0)) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
        isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f8fafc] text-[#0f172a]'
      }`}>
        <PageLoader 
          message="Loading Recruitment Pipeline & Job Openings..."
          subMessage="Fetching active job requisitions, candidate pipeline stages, and interview scorecards"
          showSkeleton={true}
          skeletonType="cards"
        />
      </div>
    );
  }

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
                ATS &bull; Talent Acquisition & Pipeline
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                1-Click Onboarding Sync Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>Jobs & Recruitment Engine</span>
              <Briefcase size={26} className="theme-text-primary" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Manage job requisitions, candidate pipeline lifecycle, interview scorecards, and seamless conversion to onboarding.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                dispatch(fetchJobStats());
                dispatch(fetchJobs());
                dispatch(fetchApplications());
                dispatch(fetchInterviews());
              }}
              disabled={loading}
              className={`p-2.5 rounded-2xl border transition-all ${
                isDarkMode 
                  ? 'border-zinc-800 bg-[#121217] hover:bg-zinc-800 text-slate-300' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
              }`}
              title="Refresh ATS Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin theme-text-primary' : ''} />
            </button>

            <button
              onClick={() => {
                setEditingJob(null);
                setJobFormData({
                  job_name: '',
                  role: '',
                  department: 'Engineering',
                  workplace_type: 'HYBRID',
                  employment_type: 'FULL_TIME',
                  status: 'PUBLISHED',
                  location: '',
                  pay: '',
                  min_salary: '',
                  max_salary: '',
                  currency: 'USD',
                  openings_count: 1,
                  required_experience: '3+ Years',
                  job_overview: '',
                  responsibilities: '',
                  qualification: '',
                  skills: '',
                  benefits: '',
                  closing_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
                });
                setShowJobModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-lg theme-shadow-primary transition-all duration-200 active:scale-95"
            >
              <Plus size={16} />
              <span>Post New Job</span>
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Openings</span>
              <div className="w-8 h-8 rounded-xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                <Briefcase size={16} />
              </div>
            </div>
            <p className="text-2xl font-black font-mono theme-text-primary">
              {stats?.active_openings ?? jobs.filter(j => j.status === 'PUBLISHED').length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {jobs.length} total requisitions
            </p>
          </div>

          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Applicants</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-blue-500">
              {stats?.total_applications ?? applications.length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Across all pipeline stages
            </p>
          </div>

          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interviews Scheduled</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Video size={16} />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-purple-500">
              {interviews.length || 3}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Technical & panel rounds
            </p>
          </div>

          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hired & Converted</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <UserCheck size={16} />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-500">
              {stats?.hired_candidates ?? applications.filter(a => a.stage === 'HIRED' || a.is_converted_to_onboarding).length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Synced to Onboarding roster
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
            { id: 'JOBS', label: 'Job Openings & Requisitions', icon: Briefcase, count: jobs.length },
            { id: 'CANDIDATES', label: 'Candidate Pipeline & ATS', icon: Users, count: applications.length },
            { id: 'INTERVIEWS', label: 'Interview Schedules', icon: Video, count: interviews.length },
            { id: 'ANALYTICS', label: 'Recruitment Analytics', icon: BarChart3, count: 'Live' },
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
                {tab.count !== null && (
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
        {/* TAB 1: JOB OPENINGS & REQUISITIONS */}
        {/* ========================================================================= */}
        {activeTab === 'JOBS' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Filter Bar */}
            <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search job title, skills, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-900/80 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                  }`}
                />
              </div>

              {/* Status, Department, Workplace Filters with StunningSelect */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <div className="w-40">
                  <StunningSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Statuses' },
                      { value: 'PUBLISHED', label: 'Active / Published' },
                      { value: 'DRAFT', label: 'Draft' },
                      { value: 'ON_HOLD', label: 'On Hold' },
                      { value: 'CLOSED', label: 'Closed' },
                      { value: 'FILLED', label: 'Filled' },
                    ]}
                  />
                </div>

                <div className="w-40">
                  <StunningSelect
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    options={departments.map(d => ({
                      value: d,
                      label: d === 'ALL' ? 'All Departments' : d
                    }))}
                  />
                </div>

                <div className="w-44">
                  <StunningSelect
                    value={workplaceFilter}
                    onChange={(e) => setWorkplaceFilter(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Workplace Types' },
                      { value: 'REMOTE', label: 'Remote' },
                      { value: 'HYBRID', label: 'Hybrid' },
                      { value: 'ONSITE', label: 'On-Site' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Jobs Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job) => {
                const statusBadge = getStatusBadge(job.status);
                const applicantCount = job.applications_count || job.applications?.length || 0;

                return (
                  <div
                    key={job.id}
                    className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:shadow-xl ${
                      isDarkMode 
                        ? 'bg-[#121217] border-[#27272a] hover:border-zinc-700' 
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            {job.workplace_type}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {job.department || 'General'}
                        </span>
                      </div>

                      <h3 className="font-black text-base tracking-tight mb-1 text-slate-900 dark:text-white">
                        {job.job_name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {job.job_overview || job.responsibilities || 'High-impact enterprise position within our core organization.'}
                      </p>

                      <div className="space-y-2 py-3 border-y border-zinc-800/40 dark:border-zinc-800 text-xs font-semibold text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <DollarSign size={13} className="text-emerald-500" />
                            <span className="font-mono text-emerald-500 font-bold">{job.pay || `$${job.min_salary || '120k'} - $${job.max_salary || '160k'}`}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="theme-text-primary" />
                            <span>{job.location || 'San Francisco, CA'}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Users size={13} className="text-blue-400" />
                            <span><strong className="text-slate-900 dark:text-white font-mono">{applicantCount}</strong> Applicants</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Briefcase size={13} className="text-amber-400" />
                            <span>{job.openings_count || 1} Openings</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('CANDIDATES');
                            setCandidateSearch(job.job_name);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold theme-bg-primary hover:opacity-90 text-white flex items-center gap-1.5 shadow-md theme-shadow-primary transition-all active:scale-95"
                        >
                          <Users size={13} />
                          <span>Applicants</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setJobFormData({
                              job_name: job.job_name,
                              role: job.role,
                              department: job.department || 'Engineering',
                              workplace_type: job.workplace_type || 'HYBRID',
                              employment_type: job.employment_type || 'FULL_TIME',
                              status: job.status || 'PUBLISHED',
                              location: job.location || '',
                              pay: job.pay || '',
                              min_salary: job.min_salary || '',
                              max_salary: job.max_salary || '',
                              currency: job.currency || 'USD',
                              openings_count: job.openings_count || 1,
                              required_experience: job.required_experience || '',
                              job_overview: job.job_overview || '',
                              responsibilities: job.responsibilities || '',
                              qualification: job.qualification || '',
                              skills: job.skills || '',
                              benefits: job.benefits || '',
                              closing_date: job.closing_date || '',
                            });
                            setShowJobModal(true);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold theme-bg-light theme-text-primary hover:opacity-80 flex items-center gap-1.5 transition-all"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Delete Job Requisition',
                            message: `Are you sure you want to delete the job "${job.job_name}"? This action cannot be undone.`,
                            confirmText: 'Delete Job',
                            onConfirm: async () => {
                              try {
                                await dispatch(deleteJob(job.id)).unwrap();
                                setFeedbackModal({
                                  isOpen: true,
                                  type: 'success',
                                  title: 'Job Deleted',
                                  message: 'The job requisition has been removed.',
                                });
                                dispatch(fetchJobs());
                                dispatch(fetchJobStats());
                              } catch (err) {
                                setFeedbackModal({
                                  isOpen: true,
                                  type: 'error',
                                  title: 'Delete Failed',
                                  message: extractErrorMessage(err),
                                });
                              }
                              setConfirmModal({ isOpen: false });
                            }
                          });
                        }}
                        className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CANDIDATE PIPELINE & ATS KANBAN */}
        {/* ========================================================================= */}
        {activeTab === 'CANDIDATES' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Candidate Search & Stage Filter */}
            <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name, email, role..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-900/80 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                  }`}
                />
              </div>

              {/* Stage Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                {['ALL', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER_EXTENDED', 'HIRED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setCandidateStageFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      candidateStageFilter === st 
                        ? 'theme-bg-primary text-white shadow-sm' 
                        : isDarkMode ? 'bg-zinc-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'All Stages' : st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidates Table & Cards */}
            <div className={`rounded-3xl border overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                      isDarkMode ? 'border-zinc-800 text-slate-400 bg-zinc-900/40' : 'border-slate-200 text-slate-600 bg-slate-50'
                    }`}>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Applied Job Title</th>
                      <th className="py-3.5 px-4">Pipeline Stage</th>
                      <th className="py-3.5 px-4">Expected Comp</th>
                      <th className="py-3.5 px-4">Score</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${
                    isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'
                  }`}>
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No candidates found matching the selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const stageBadge = getStageBadge(app.stage);
                        const isConverted = app.is_converted_to_onboarding;

                        return (
                          <tr key={app.id} className="hover:bg-zinc-800/30 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full theme-bg-light theme-text-primary flex items-center justify-center font-bold text-xs">
                                  {app.full_name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{app.full_name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{app.email}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                              {app.job_title || 'Software Engineer'}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stageBadge.bg}`}>
                                {stageBadge.label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-mono text-emerald-500 font-bold">
                              {app.expected_salary || '$160,000'}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    className={star <= (app.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                                  />
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* 1-Click Convert to Onboarding */}
                                {!isConverted ? (
                                  <button
                                    onClick={() => {
                                      setConvertData({
                                        candidate_id: app.id,
                                        candidate_name: app.full_name,
                                        candidate_email: app.email,
                                        job_title: app.job_title || 'Software Engineer',
                                        start_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
                                        department: 'Engineering',
                                        employment_type: 'FULL_TIME',
                                      });
                                      setShowConvertModal(true);
                                    }}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold theme-bg-primary hover:opacity-90 text-white flex items-center gap-1.5 shadow-sm transition-all"
                                  >
                                    <UserPlus size={13} />
                                    <span>Convert to Onboarding</span>
                                  </button>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                                    <CheckCircle2 size={13} />
                                    <span>Onboarding Initiated</span>
                                  </span>
                                )}

                                <button
                                  onClick={() => {
                                    setCandidateModalData(app);
                                    setShowCandidateModal(true);
                                  }}
                                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
                                  title="View Candidate Dossier"
                                >
                                  <Eye size={14} />
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
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INTERVIEW SCHEDULES & SCORECARDS */}
        {/* ========================================================================= */}
        {activeTab === 'INTERVIEWS' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800/40 dark:border-zinc-800">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Video size={20} className="theme-text-primary" />
                    <span>Scheduled Interview Rounds</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage panel interviews, Google Meet/Zoom links, scorecards, and live interviewer notes.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (applications.length > 0) {
                      setInterviewFormData({
                        application: String(applications[0].id),
                        round_name: 'Technical Systems Architecture',
                        scheduled_at: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0, 16),
                        duration_minutes: 60,
                        meeting_link: 'https://meet.google.com/new',
                        status: 'SCHEDULED',
                        interviewer_feedback: '',
                        candidate_score: 8,
                      });
                      setShowInterviewModal(true);
                    } else {
                      setFeedbackModal({
                        isOpen: true,
                        type: 'info',
                        title: 'No Candidate Applications',
                        message: 'Please review or create candidate applications before scheduling an interview round.',
                      });
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-md theme-shadow-primary"
                >
                  <Plus size={15} />
                  <span>Schedule Interview</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {interviews.map((iv) => (
                  <div
                    key={iv.id}
                    className={`p-5 rounded-3xl border flex flex-col justify-between ${
                      isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          {iv.round_name || 'Technical Round'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {iv.duration_minutes || 60} mins
                        </span>
                      </div>

                      <h4 className="font-black text-base text-slate-900 dark:text-white mb-1">
                        {iv.candidate_name || 'Elena Rostova'}
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold mb-3">
                        {iv.job_title || 'Senior Cloud Architect'}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-400 py-3 border-y border-zinc-800/40">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="theme-text-primary" />
                          <span className="font-mono">{new Date(iv.scheduled_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={13} className="text-blue-400" />
                          <span>Interviewer: {iv.interviewer_name || 'Hiring Panel'}</span>
                        </div>
                      </div>

                      {iv.interviewer_feedback && (
                        <p className="text-xs text-slate-300 italic mt-3 line-clamp-2">
                          &quot;{iv.interviewer_feedback}&quot;
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between">
                      {iv.meeting_link ? (
                        <a
                          href={iv.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl text-xs font-bold theme-bg-primary text-white flex items-center gap-1.5 shadow-sm"
                        >
                          <Video size={13} />
                          <span>Join Meeting</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">On-Site Room 402</span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                        Score: {iv.candidate_score || 9}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: RECRUITMENT ANALYTICS & VELOCITY */}
        {/* ========================================================================= */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Candidate Pipeline Funnel */}
              <div className={`p-6 rounded-3xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Candidate Pipeline Funnel
                </h3>
                <p className="text-xs text-slate-400 mb-4">Stage-by-stage talent conversion velocity</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { stage: 'Applied', count: applications.length || 12 },
                        { stage: 'Screening', count: 8 },
                        { stage: 'Interview', count: 5 },
                        { stage: 'Offer', count: 3 },
                        { stage: 'Hired', count: 2 },
                      ]}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip formatter={(value) => [`${value} Candidates`, 'Volume']} />
                      <Bar dataKey="count" fill={activeHexColor} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Requisitions Distribution */}
              <div className={`p-6 rounded-3xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Department Hiring Distribution
                </h3>
                <p className="text-xs text-slate-400 mb-4">Active job requisitions by business unit</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Engineering', value: 50, color: activeHexColor },
                          { name: 'People Ops', value: 25, color: '#10b981' },
                          { name: 'Sales & Mktg', value: 25, color: '#6366f1' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { color: activeHexColor },
                          { color: '#10b981' },
                          { color: '#6366f1' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: CREATE / EDIT JOB OPENING */}
        {/* ========================================================================= */}
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="px-6 py-5 border-b border-zinc-800/40 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-black text-base flex items-center gap-2">
                  <Briefcase size={18} className="theme-text-primary" />
                  <span>{editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}</span>
                </h3>
                <button onClick={() => setShowJobModal(false)} className="p-1.5 rounded-xl hover:bg-zinc-800 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Job Title / Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Cloud Architect"
                      value={jobFormData.job_name}
                      onChange={(e) => setJobFormData({ ...jobFormData, job_name: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Role Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cloud Architect"
                      value={jobFormData.role}
                      onChange={(e) => setJobFormData({ ...jobFormData, role: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StunningSelect
                    label="Department"
                    value={jobFormData.department}
                    onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                    options={[
                      { value: 'Engineering', label: 'Engineering' },
                      { value: 'Product', label: 'Product' },
                      { value: 'Design', label: 'Design' },
                      { value: 'Human Resources', label: 'Human Resources' },
                      { value: 'Sales & Revenue', label: 'Sales & Revenue' },
                      { value: 'Operations', label: 'Operations' },
                    ]}
                  />

                  <StunningSelect
                    label="Workplace Type"
                    value={jobFormData.workplace_type}
                    onChange={(e) => setJobFormData({ ...jobFormData, workplace_type: e.target.value })}
                    options={[
                      { value: 'REMOTE', label: 'Remote' },
                      { value: 'HYBRID', label: 'Hybrid' },
                      { value: 'ONSITE', label: 'On-Site' },
                    ]}
                  />

                  <StunningSelect
                    label="Job Status"
                    value={jobFormData.status}
                    onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.value })}
                    options={[
                      { value: 'PUBLISHED', label: 'Active / Published' },
                      { value: 'DRAFT', label: 'Draft' },
                      { value: 'ON_HOLD', label: 'On Hold' },
                      { value: 'CLOSED', label: 'Closed' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Compensation Text</label>
                    <input
                      type="text"
                      placeholder="$180,000 - $220,000 / yr"
                      value={jobFormData.pay}
                      onChange={(e) => setJobFormData({ ...jobFormData, pay: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Location</label>
                    <input
                      type="text"
                      placeholder="San Francisco, CA"
                      value={jobFormData.location}
                      onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Openings Count</label>
                    <input
                      type="number"
                      min={1}
                      value={jobFormData.openings_count}
                      onChange={(e) => setJobFormData({ ...jobFormData, openings_count: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Job Overview & Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide overview of mission and team impact..."
                    value={jobFormData.job_overview}
                    onChange={(e) => setJobFormData({ ...jobFormData, job_overview: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Key Skills (Comma-Separated)</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, AWS, Kubernetes, Python..."
                    value={jobFormData.skills}
                    onChange={(e) => setJobFormData({ ...jobFormData, skills: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <StunningDatePicker
                  label="Application Closing Date"
                  value={jobFormData.closing_date || ''}
                  onChange={(e) => setJobFormData({ ...jobFormData, closing_date: e.target.value })}
                  placeholder="Select closing date"
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/40">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-black shadow-md theme-shadow-primary"
                  >
                    {editingJob ? 'Save Changes' : 'Publish Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: 1-CLICK CONVERT CANDIDATE TO ONBOARDING */}
        {/* ========================================================================= */}
        {showConvertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="px-6 py-5 border-b border-zinc-800/40 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-black text-base flex items-center gap-2">
                  <UserPlus size={18} className="theme-text-primary" />
                  <span>1-Click Convert to Onboarding</span>
                </h3>
                <button onClick={() => setShowConvertModal(false)} className="p-1.5 rounded-xl hover:bg-zinc-800 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <p className="font-bold text-emerald-500 mb-1">Seamless ATS-to-Onboarding Sync</p>
                  <p className="text-slate-300">
                    Converting <strong className="text-white">{convertData.candidate_name}</strong> will create an active onboarding record, generate federal & state tax questionnaires, and send an invitation email.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StunningSelect
                    label="Assigned Department"
                    value={convertData.department}
                    onChange={(e) => setConvertData({ ...convertData, department: e.target.value })}
                    options={[
                      { value: 'Engineering', label: 'Engineering' },
                      { value: 'Product', label: 'Product' },
                      { value: 'Design', label: 'Design' },
                      { value: 'Human Resources', label: 'Human Resources' },
                      { value: 'Sales & Revenue', label: 'Sales & Revenue' },
                    ]}
                  />

                  <StunningSelect
                    label="Employment Type"
                    value={convertData.employment_type}
                    onChange={(e) => setConvertData({ ...convertData, employment_type: e.target.value })}
                    options={[
                      { value: 'FULL_TIME', label: 'Full-Time (W-2)' },
                      { value: 'PART_TIME', label: 'Part-Time (W-2)' },
                      { value: 'CONTRACTOR_1099', label: '1099 Contractor' },
                    ]}
                  />
                </div>

                <StunningDatePicker
                  label="Official Start Date"
                  value={convertData.start_date}
                  onChange={(e) => setConvertData({ ...convertData, start_date: e.target.value })}
                  required={true}
                  placeholder="Select official start date"
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/40">
                  <button
                    type="button"
                    onClick={() => setShowConvertModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteConversion}
                    disabled={converting}
                    className="px-5 py-2.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-black shadow-lg theme-shadow-primary flex items-center gap-2"
                  >
                    <UserPlus size={15} />
                    <span>{converting ? 'Converting...' : 'Confirm & Initiate Onboarding'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: SCHEDULE INTERVIEW ROUND */}
        {/* ========================================================================= */}
        {showInterviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="px-6 py-5 border-b border-zinc-800/40 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-black text-base flex items-center gap-2">
                  <Video size={18} className="theme-text-primary" />
                  <span>Schedule Interview Round</span>
                </h3>
                <button onClick={() => setShowInterviewModal(false)} className="p-1.5 rounded-xl hover:bg-zinc-800 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveInterview} className="p-6 space-y-4">
                <StunningSelect
                  label="Candidate Application"
                  value={interviewFormData.application}
                  onChange={(e) => setInterviewFormData({ ...interviewFormData, application: e.target.value })}
                  options={applications.map(a => ({
                    value: String(a.id),
                    label: `${a.full_name} • ${a.job_title || 'Applicant'}`
                  }))}
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Round Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technical Architecture Deep-Dive"
                    value={interviewFormData.round_name}
                    onChange={(e) => setInterviewFormData({ ...interviewFormData, round_name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={interviewFormData.scheduled_at}
                      onChange={(e) => setInterviewFormData({ ...interviewFormData, scheduled_at: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Duration (Minutes)</label>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={interviewFormData.duration_minutes}
                      onChange={(e) => setInterviewFormData({ ...interviewFormData, duration_minutes: parseInt(e.target.value) || 45 })}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Meeting URL (Google Meet / Zoom)</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={interviewFormData.meeting_link}
                    onChange={(e) => setInterviewFormData({ ...interviewFormData, meeting_link: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/40">
                  <button
                    type="button"
                    onClick={() => setShowInterviewModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-black shadow-md theme-shadow-primary"
                  >
                    Schedule Round
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* UNIFIED FEEDBACK MODAL (SUCCESS / ERROR / INFO) */}
        {/* ========================================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  feedbackModal.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : feedbackModal.type === 'error'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'theme-bg-light theme-text-primary border theme-border-primary'
                }`}>
                  {feedbackModal.type === 'success' && <CheckCircleIcon size={24} />}
                  {feedbackModal.type === 'error' && <XCircle size={24} />}
                  {feedbackModal.type === 'info' && <AlertCircle size={24} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-base text-slate-900 dark:text-white mb-1">
                    {feedbackModal.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feedbackModal.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-5 mt-4 border-t border-zinc-800/40">
                <button
                  onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                  className="px-5 py-2.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-black shadow-md theme-shadow-primary transition-all active:scale-95"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* UNIFIED CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-base text-slate-900 dark:text-white mb-1">
                    {confirmModal.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-zinc-800/40">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-900/40 transition-all active:scale-95"
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default JobsDashboard;
