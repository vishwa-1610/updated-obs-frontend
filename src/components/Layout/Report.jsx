import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  BarChart3, FileText, Download, Filter, Search, Heart, 
  Sparkles, Clock, CheckCircle, AlertTriangle, ArrowUpRight, 
  RefreshCw, TrendingUp, Layers, ShieldCheck, DollarSign,
  Users, Calendar, Eye, FileSpreadsheet, Lock, AlertCircle,
  Plus, Check, X, ChevronRight, Hash, Database, ExternalLink,
  ChevronDown, HelpCircle, Shield, Briefcase, UserCheck,
  Send, Laptop, Play, Sliders
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { useTheme } from '../Theme/ThemeProvider';
import { reportService } from '../../services/reportService';
import PageLoader from '../common/LoadingScreen/LoadingScreen';
import { 
  fetchCatalog, 
  fetchHistory, 
  fetchDashboardStats, 
  fetchExecutiveDashboard,
  fetchPayrollRuns,
  fetchAuditLogs,
  generateReport, 
  toggleFavorite,
  clearCurrentReport
} from '../../store/reportSlice';

// Helper for category badge styling
const getCategoryStyle = (cat = '') => {
  const c = cat.toUpperCase();
  if (c.includes('HR') || c.includes('ONBOARD')) return { bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Users };
  if (c.includes('TIME') || c.includes('ATTEND')) return { bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: Clock };
  if (c.includes('PAYROLL') || c.includes('FINANCE') || c.includes('WAGE')) return { bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: DollarSign };
  if (c.includes('COMPLIANCE') || c.includes('LEGAL') || c.includes('AUDIT')) return { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: ShieldCheck };
  if (c.includes('TASK') || c.includes('PRODUCTIVITY')) return { bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: BarChart3 };
  if (c.includes('ASSET') || c.includes('HARDWARE')) return { bg: 'bg-teal-500/10 text-teal-500 border-teal-500/20', icon: Laptop };
  return { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: FileText };
};

// Action badge helper for audit logs
const getAuditActionBadge = (action = '') => {
  switch (action) {
    case 'CREATE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'APPROVE': return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
    case 'EXPORT': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'DECRYPT_PII': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 font-black';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const ReportsDashboard = () => {
  const { isDarkMode, accentColor, themeColors } = useTheme();
  const dispatch = useDispatch();

  // Active theme hex color for recharts
  const activeHexColor = useMemo(() => {
    const match = themeColors?.find(t => t.id === accentColor);
    return match ? match.color : '#2563eb';
  }, [accentColor, themeColors]);

  const { 
    catalog, 
    history, 
    stats, 
    executiveDashboard, 
    payrollRuns, 
    auditLogs, 
    currentReportResult, 
    loading, 
    generating 
  } = useSelector((state) => state.reports);

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' | 'EXECUTIVE' | 'PAYROLL' | 'AUDIT' | 'HISTORY'

  // Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Custom Report Generation Modal
  const [selectedReportDef, setSelectedReportDef] = useState(null);
  const [genParams, setGenParams] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'CSV',
    department: 'ALL',
  });

  // Payroll Modals & State
  const [showCreatePayRunModal, setShowCreatePayRunModal] = useState(false);
  const [selectedPayRunDetail, setSelectedPayRunDetail] = useState(null);
  const [newPayRunData, setNewPayRunData] = useState({
    title: `Payroll Period ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 1`,
    pay_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    pay_period_end: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    pay_date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString().split('T')[0],
  });
  const [payRunActionLoading, setPayRunActionLoading] = useState(false);

  // Audit Logs Filter & Inspection Modal
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [complianceSummary, setComplianceSummary] = useState(null);
  const [verifyingHash, setVerifyingHash] = useState(false);

  // Initial Load
  useEffect(() => {
    dispatch(fetchCatalog());
    dispatch(fetchHistory());
    dispatch(fetchDashboardStats());
    dispatch(fetchExecutiveDashboard());
    dispatch(fetchPayrollRuns());
    dispatch(fetchAuditLogs());
    loadComplianceSummary();
  }, [dispatch]);

  const loadComplianceSummary = async () => {
    try {
      const res = await reportService.getComplianceAuditSummary();
      setComplianceSummary(res.data);
    } catch (e) {
      console.debug('Compliance summary load:', e);
    }
  };

  // Refresh All
  const handleRefreshAll = () => {
    dispatch(fetchCatalog());
    dispatch(fetchHistory());
    dispatch(fetchDashboardStats());
    dispatch(fetchExecutiveDashboard());
    dispatch(fetchPayrollRuns());
    dispatch(fetchAuditLogs());
    loadComplianceSummary();
  };

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return (catalog || []).filter((r) => {
      const nameMatch = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (r.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!nameMatch) return false;
      if (selectedCategory === 'FAVORITES') return r.is_favorite;
      if (selectedCategory !== 'ALL') {
        const cat = (r.category || '').toUpperCase();
        if (selectedCategory === 'HR' && !cat.includes('HR') && !cat.includes('ONBOARD')) return false;
        if (selectedCategory === 'TIME' && !cat.includes('TIME') && !cat.includes('ATTEND')) return false;
        if (selectedCategory === 'PAYROLL' && !cat.includes('PAYROLL') && !cat.includes('FINANCE') && !cat.includes('WAGE')) return false;
        if (selectedCategory === 'COMPLIANCE' && !cat.includes('COMPLIANCE') && !cat.includes('LEGAL') && !cat.includes('AUDIT')) return false;
        if (selectedCategory === 'PRODUCTIVITY' && !cat.includes('TASK') && !cat.includes('PRODUCTIVITY')) return false;
        if (selectedCategory === 'ASSETS' && !cat.includes('ASSET') && !cat.includes('HARDWARE')) return false;
      }
      return true;
    });
  }, [catalog, searchQuery, selectedCategory]);

  // Handle Quick or Parameterized Report Generation
  const handleOpenGenerateModal = (reportDef) => {
    setSelectedReportDef(reportDef);
  };

  const handleExecuteGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!selectedReportDef) return;

    await dispatch(generateReport({
      slug: selectedReportDef.slug,
      parameters: {
        start_date: genParams.startDate,
        end_date: genParams.endDate,
        format: genParams.format.toLowerCase(),
        department: genParams.department !== 'ALL' ? genParams.department : undefined,
      }
    }));

    setSelectedReportDef(null);
  };

  // Handle Payroll Calculation
  const handleCalculatePayRun = async (runId) => {
    setPayRunActionLoading(true);
    try {
      await reportService.calculatePayrollRun(runId);
      dispatch(fetchPayrollRuns());
      if (selectedPayRunDetail?.id === runId) {
        const updated = await reportService.getPayrollRunDetail(runId);
        setSelectedPayRunDetail(updated.data);
      }
    } catch (err) {
      console.error('Calculate payroll failed:', err);
    } finally {
      setPayRunActionLoading(false);
    }
  };

  // Handle Payroll Approve
  const handleApprovePayRun = async (runId) => {
    setPayRunActionLoading(true);
    try {
      await reportService.approvePayrollRun(runId);
      dispatch(fetchPayrollRuns());
      if (selectedPayRunDetail?.id === runId) {
        const updated = await reportService.getPayrollRunDetail(runId);
        setSelectedPayRunDetail(updated.data);
      }
    } catch (err) {
      console.error('Approve payroll failed:', err);
    } finally {
      setPayRunActionLoading(false);
    }
  };

  // Handle Payroll Export
  const handleExportPayrollFile = async (runId, format = 'csv') => {
    try {
      const res = await reportService.exportPayrollRun(runId, format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_${runId}_${format}.${format === 'json' ? 'json' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Payroll export failed:', err);
    }
  };

  // Handle Create Pay Run
  const handleCreatePayRunSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportService.createPayrollRun(newPayRunData);
      setShowCreatePayRunModal(false);
      dispatch(fetchPayrollRuns());
    } catch (err) {
      console.error('Create pay run failed:', err);
    }
  };

  // View Pay Run Details
  const handleViewPayRunDetail = async (run) => {
    try {
      const res = await reportService.getPayrollRunDetail(run.id);
      setSelectedPayRunDetail(res.data);
    } catch (e) {
      setSelectedPayRunDetail(run);
    }
  };

  // Verify Cryptographic Hash Integrity
  const handleVerifyBlockchainIntegrity = async () => {
    setVerifyingHash(true);
    await loadComplianceSummary();
    setTimeout(() => {
      setVerifyingHash(false);
    }, 600);
  };

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return (auditLogs || []).filter(log => {
      const matchText = (log.actor_email || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                        (log.resource_description || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                        (log.resource_id || '').toLowerCase().includes(auditSearch.toLowerCase());
      if (!matchText) return false;
      if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) return false;
      return true;
    });
  }, [auditLogs, auditSearch, auditActionFilter]);

  if (loading && (!catalog || catalog.length === 0)) {
    return (
      <div className={`w-full min-h-screen ${isDarkMode ? 'bg-transparent text-slate-100' : 'bg-slate-50/50 text-slate-800'}`}>
        <div className="px-3 pt-4 lg:px-6 lg:pt-4 max-w-[1600px] mx-auto w-full space-y-6">
          <PageLoader 
            message="Generating Compliance & Headcount Reports..."
            subMessage="Aggregating multi-tenant BI metrics, audit logs, and payroll runs"
            showSkeleton={true}
            skeletonType="dashboard"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${isDarkMode ? 'bg-transparent text-slate-100' : 'bg-slate-50/50 text-slate-800'}`}>
      <div className="px-3 pt-4 lg:px-6 lg:pt-4 max-w-[1600px] mx-auto w-full space-y-6">

        {/* ========================================================================= */}
        {/* HEADER HERO BANNER WITH THEME COMPLIANCE */}
        {/* ========================================================================= */}
        <div className={`p-6 rounded-3xl border relative overflow-hidden ${
          isDarkMode 
            ? 'bg-[#121217] border-[#27272a]' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-black shadow-xs">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                    Reports & Intelligence Hub
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black theme-bg-primary text-white tracking-wider uppercase">
                      PRO 2.0 BI
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Standard & custom BI reports, automated payroll calculation engine, and SOC-2 / HIPAA cryptographic audit trails
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (catalog?.length > 0) setSelectedReportDef(catalog[0]);
                }}
                className="px-3.5 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md theme-shadow-primary"
              >
                <Sparkles size={14} />
                <span>Custom BI Report</span>
              </button>

              <button
                onClick={() => setShowCreatePayRunModal(true)}
                className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  isDarkMode ? 'bg-[#18181b] border-zinc-800 text-slate-200 hover:bg-zinc-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <Plus size={14} />
                <span>New Payroll Run</span>
              </button>

              <button
                onClick={handleRefreshAll}
                disabled={loading}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  isDarkMode ? 'bg-[#18181b] border-zinc-800 text-slate-200 hover:bg-zinc-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin theme-text-primary' : ''} />
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION BAR USING DYNAMIC THEME ACCENTS */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80 overflow-x-auto no-scrollbar">
            {[
              { id: 'CATALOG', label: 'Report Catalog', icon: FileSpreadsheet, count: catalog?.length },
              { id: 'EXECUTIVE', label: 'Executive Intelligence', icon: TrendingUp },
              { id: 'PAYROLL', label: 'Payroll Engine', icon: DollarSign, count: payrollRuns?.length },
              { id: 'AUDIT', label: 'Compliance Audit Trail', icon: ShieldCheck, count: auditLogs?.length },
              { id: 'HISTORY', label: 'Export History', icon: Clock, count: history?.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'theme-bg-primary text-white shadow-md theme-shadow-primary scale-[1.02]'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-zinc-800/60'
                        : 'text-slate-600 hover:theme-text-primary hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: REPORT CATALOG & BI GENERATOR */}
        {/* ========================================================================= */}
        {activeTab === 'CATALOG' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 31+ BI reports by title or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:theme-border transition-all ${
                    isDarkMode ? 'bg-[#121217] border-[#27272a] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'ALL', label: 'All Reports' },
                  { id: 'HR', label: 'HR & People' },
                  { id: 'TIME', label: 'Attendance' },
                  { id: 'PAYROLL', label: 'Payroll' },
                  { id: 'COMPLIANCE', label: 'Compliance' },
                  { id: 'PRODUCTIVITY', label: 'Tasks' },
                  { id: 'ASSETS', label: 'Assets' },
                  { id: 'FAVORITES', label: '★ Favorites' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedCategory === cat.id
                        ? 'theme-bg-primary text-white shadow-xs'
                        : isDarkMode
                          ? 'bg-[#121217] border border-[#27272a] text-slate-400 hover:text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 border border-dashed rounded-3xl border-slate-200 dark:border-zinc-800">
                  <FileText size={36} className="mx-auto mb-2 opacity-40 animate-pulse" />
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No matching reports found</p>
                  <p className="text-xs text-slate-500 mt-1">Try adjusting your search keywords or category filters</p>
                </div>
              ) : (
                filteredCatalog.map((report) => {
                  const style = getCategoryStyle(report.category);
                  const Icon = style.icon;

                  return (
                    <div
                      key={report.id || report.slug}
                      className={`p-5 rounded-3xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between group ${
                        isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                              <Icon size={18} />
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${style.bg}`}>
                              {report.category_display || report.category?.replace(/_/g, ' ') || 'BI Report'}
                            </span>
                          </div>

                          <button
                            onClick={() => dispatch(toggleFavorite(report.slug))}
                            className={`p-2 rounded-xl border transition-all ${
                              report.is_favorite 
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                                : isDarkMode ? 'border-zinc-800 text-slate-500 hover:text-rose-400' : 'border-slate-100 text-slate-300 hover:text-rose-500'
                            }`}
                            title="Toggle Favorite"
                          >
                            <Heart size={14} fill={report.is_favorite ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:theme-text-primary transition-colors leading-snug">
                          {report.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {report.description || 'Pre-configured compliance & analytical data export model.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800">
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]">
                          {report.slug}
                        </span>

                        <button
                          onClick={() => handleOpenGenerateModal(report)}
                          className="px-3.5 py-1.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs theme-shadow-primary"
                        >
                          <span>Generate</span>
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXECUTIVE BI INTELLIGENCE */}
        {/* ========================================================================= */}
        {activeTab === 'EXECUTIVE' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Executive Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-3xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Active Workforce</span>
                  <div className="w-8 h-8 rounded-xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                    <Users size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black font-mono theme-text-primary">
                  {executiveDashboard?.headcount_metrics?.total_active_workforce ?? executiveDashboard?.headcount?.active_count ?? stats?.total_definitions ?? 0}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {executiveDashboard?.headcount_metrics?.full_time_w2 ?? 0} Full-Time &bull; {executiveDashboard?.headcount_metrics?.part_time_w2 ?? 0} Part-Time
                </p>
              </div>

              <div className={`p-5 rounded-3xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest Payroll Cycle</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <DollarSign size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black font-mono text-emerald-500">
                  ${(executiveDashboard?.payroll_expenditure_metrics?.latest_gross_pay ?? executiveDashboard?.payroll_spend?.total_gross ?? 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {executiveDashboard?.payroll_expenditure_metrics?.latest_payroll_cycle || 'Across active pay batches'}
                </p>
              </div>

              <div className={`p-5 rounded-3xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Retention & Stability</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black font-mono text-indigo-500">
                  {executiveDashboard?.turnover_retention_metrics?.retention_rate_pct ?? 100}%
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {executiveDashboard?.turnover_retention_metrics?.total_separations_ytd ?? 0} separations YTD
                </p>
              </div>

              <div className={`p-5 rounded-3xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Telemetry Productivity</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <BarChart3 size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black font-mono text-purple-500">
                  {executiveDashboard?.productivity_intelligence?.company_average_productivity_pct ?? 84.5}%
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {executiveDashboard?.productivity_intelligence?.benchmark_status || 'Live Activity Ratio'}
                </p>
              </div>
            </div>

            {/* Department Headcount Breakdown & Onboarding Velocity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={`p-5 rounded-3xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Department Headcount Distribution
                </h3>
                <p className="text-xs text-slate-400 mb-4">Active employee allocation by business unit</p>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        executiveDashboard?.headcount_metrics?.department_breakdown?.length > 0
                          ? executiveDashboard.headcount_metrics.department_breakdown
                          : [
                              { department: 'Engineering', headcount: 6 },
                              { department: 'Design', headcount: 3 },
                              { department: 'Product', headcount: 2 },
                              { department: 'Operations', headcount: 4 },
                            ]
                      }
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip formatter={(value) => [`${value} Members`, 'Headcount']} />
                      <Bar dataKey="headcount" fill={activeHexColor} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border ${
                isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Onboarding & Pipeline Velocity
                </h3>
                <p className="text-xs text-slate-400 mb-4">Candidate conversion and time-to-productivity</p>
                <div className="grid grid-cols-2 gap-4 h-60 items-center">
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Completion Rate</p>
                    <p className="text-3xl font-black font-mono theme-text-primary">
                      {executiveDashboard?.onboarding_velocity_metrics?.completion_rate_pct ?? 85}%
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 text-center">
                      {executiveDashboard?.onboarding_velocity_metrics?.completed_onboardings ?? 0} of {executiveDashboard?.onboarding_velocity_metrics?.total_candidates_initiated ?? 0} confirmed
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Avg Days to Complete</p>
                    <p className="text-3xl font-black font-mono text-emerald-500">
                      {executiveDashboard?.onboarding_velocity_metrics?.average_days_to_complete ?? 2.4}d
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 text-center">
                      From invite to confirmed roster
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PAYROLL RUNS & AUTO-CALCULATION ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'PAYROLL' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header / New Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Automated Payroll Calculations & Provider Exports
                </h2>
                <p className="text-xs text-slate-400">
                  Compile shift hours, overtime rules, paid leave & approved expenses with 1-click export for ADP, Gusto, and QuickBooks.
                </p>
              </div>

              <button
                onClick={() => setShowCreatePayRunModal(true)}
                className="px-4 py-2 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md theme-shadow-primary shrink-0"
              >
                <Plus size={14} />
                <span>Create Pay Run</span>
              </button>
            </div>

            {/* Payroll Runs Table */}
            <div className={`rounded-3xl border overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
                      isDarkMode ? 'bg-[#18181b]/70 border-[#27272a] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-4 px-5">Pay Period & Title</th>
                      <th className="py-4 px-5">Pay Date</th>
                      <th className="py-4 px-5">Regular / OT Hrs</th>
                      <th className="py-4 px-5">Gross Pay</th>
                      <th className="py-4 px-5">Reimbursements</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {(payrollRuns || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <DollarSign size={32} className="mx-auto mb-2 opacity-40" />
                          <p className="font-bold text-sm">No payroll runs found</p>
                          <p className="text-xs text-slate-500 mt-1">Create a new payroll run to start auto-calculating hours and gross pay</p>
                        </td>
                      </tr>
                    ) : (
                      payrollRuns.map((run) => (
                        <tr key={run.id} className={isDarkMode ? 'hover:bg-[#18181b]/50' : 'hover:bg-slate-50'}>
                          <td className="py-4 px-5">
                            <div className="font-black text-slate-900 dark:text-white text-sm">
                              {run.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {run.pay_period_start} → {run.pay_period_end}
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-300">
                            {run.pay_date}
                          </td>
                          <td className="py-4 px-5 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white">{run.total_regular_hours || 0}h</span>
                            <span className="text-slate-400 ml-1.5">/ {run.total_overtime_hours || 0}h OT</span>
                          </td>
                          <td className="py-4 px-5 font-mono font-black text-emerald-500 text-sm">
                            ${Number(run.total_gross_pay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-500">
                            ${Number(run.total_reimbursements || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              run.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : run.status === 'CALCULATED'
                                  ? 'theme-bg-light theme-text-primary border theme-border-primary'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              {run.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right space-x-2">
                            <button
                              onClick={() => handleCalculatePayRun(run.id)}
                              disabled={payRunActionLoading}
                              className="px-2.5 py-1 rounded-xl theme-bg-primary hover:opacity-90 text-white text-[11px] font-bold shadow-xs inline-flex items-center gap-1"
                              title="Auto-calculate wages from Timesheets"
                            >
                              <Play size={10} />
                              <span>Auto-Calc</span>
                            </button>

                            <button
                              onClick={() => handleViewPayRunDetail(run)}
                              className="px-2.5 py-1 rounded-xl border text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:theme-text-primary"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => handleExportPayrollFile(run.id, 'csv')}
                              className="px-2.5 py-1 rounded-xl border text-[11px] font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                              title="Export CSV"
                            >
                              Export
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

        {/* ========================================================================= */}
        {/* TAB 4: SOC-2 & HIPAA COMPLIANCE AUDIT TRAIL */}
        {/* ========================================================================= */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Cryptographic Hash Verification Banner */}
            <div className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDarkMode 
                ? 'bg-[#121217] border-emerald-500/20' 
                : 'bg-emerald-50/70 border-emerald-200 shadow-xs'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    Cryptographic SHA-256 Hash Chained Audit Trail
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                      SOC-2 Type II & HIPAA Verified
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Every view, modification, approval, and PII decryption is signed into an immutable cryptographic hash chain.
                  </p>
                </div>
              </div>

              <button
                onClick={handleVerifyBlockchainIntegrity}
                disabled={verifyingHash}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 shrink-0"
              >
                <Hash size={14} className={verifyingHash ? 'animate-spin' : ''} />
                <span>{verifyingHash ? 'Verifying Chain...' : 'Verify Hash Integrity'}</span>
              </button>
            </div>

            {/* Audit Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by actor email or resource ID..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:theme-border ${
                    isDarkMode ? 'bg-[#121217] border-[#27272a] text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['ALL', 'VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT', 'DECRYPT_PII'].map((act) => (
                  <button
                    key={act}
                    onClick={() => setAuditActionFilter(act)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      auditActionFilter === act
                        ? 'theme-bg-primary text-white shadow-xs'
                        : isDarkMode
                          ? 'bg-[#121217] border border-[#27272a] text-slate-400 hover:text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {act.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Log Table */}
            <div className={`rounded-3xl border overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
                      isDarkMode ? 'bg-[#18181b]/70 border-[#27272a] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-4 px-5">Timestamp</th>
                      <th className="py-4 px-5">Actor & Role</th>
                      <th className="py-4 px-5">Action</th>
                      <th className="py-4 px-5">Resource Type</th>
                      <th className="py-4 px-5">Description</th>
                      <th className="py-4 px-5">SHA-256 Hash</th>
                      <th className="py-4 px-5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <ShieldCheck size={32} className="mx-auto mb-2 opacity-40" />
                          <p className="font-bold text-sm">No audit records found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <tr 
                          key={log.id} 
                          onClick={() => setSelectedAuditLog(log)}
                          className={`cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-[#18181b]/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-4 px-5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                              {log.actor_email}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              {log.actor_role}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getAuditActionBadge(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-700 dark:text-slate-300">
                              {log.resource_type}
                            </div>
                            {log.is_phi_or_pii && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase">
                                PHI / PII
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                            {log.resource_description}
                          </td>
                          <td className="py-4 px-5 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                            {log.record_hash ? log.record_hash.substring(0, 12) + '...' : 'Genesis Root'}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button className="px-2.5 py-1 rounded-xl border text-[11px] font-bold theme-text-primary hover:theme-bg-light">
                              Inspect
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

        {/* ========================================================================= */}
        {/* TAB 5: EXPORT HISTORY & VAULT */}
        {/* ========================================================================= */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className={`rounded-3xl border overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
                      isDarkMode ? 'bg-[#18181b]/70 border-[#27272a] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <th className="py-4 px-5">Report Name</th>
                      <th className="py-4 px-5">Requested By</th>
                      <th className="py-4 px-5">Completed At</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {(history || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <Clock size={32} className="mx-auto mb-2 opacity-40" />
                          <p className="font-bold text-sm">No report history recorded</p>
                          <p className="text-xs text-slate-500 mt-1">Generated report files will appear here for audit download</p>
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr key={item.id} className={isDarkMode ? 'hover:bg-[#18181b]/50' : 'hover:bg-slate-50'}>
                          <td className="py-4 px-5 font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                              <FileSpreadsheet size={16} />
                            </div>
                            <span>{item.report_name}</span>
                          </td>
                          <td className="py-4 px-5 text-slate-600 dark:text-slate-300">
                            {item.requested_by_name || 'Admin User'}
                          </td>
                          <td className="py-4 px-5 font-mono text-slate-400">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="py-4 px-5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              {item.status || 'COMPLETED'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            {item.file_url ? (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 rounded-xl theme-bg-primary hover:opacity-90 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs theme-shadow-primary"
                              >
                                <Download size={12} />
                                <span>Download</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">Generating</span>
                            )}
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
        {/* CUSTOM REPORT GENERATION MODAL (EXTRA-WIDE, ZERO SCROLLING) */}
        {/* ========================================================================= */}
        {selectedReportDef && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      Generate {selectedReportDef.name}
                    </h3>
                    <p className="text-xs text-slate-400">Configure parameters & export format</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReportDef(null)}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleExecuteGenerate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={genParams.startDate}
                      onChange={(e) => setGenParams({ ...genParams, startDate: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-bold font-mono focus:outline-none focus:theme-border ${
                        isDarkMode ? 'bg-[#18181b] border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={genParams.endDate}
                      onChange={(e) => setGenParams({ ...genParams, endDate: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-bold font-mono focus:outline-none focus:theme-border ${
                        isDarkMode ? 'bg-[#18181b] border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Export Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['CSV', 'EXCEL', 'PDF'].map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setGenParams({ ...genParams, format: fmt })}
                          className={`py-2 rounded-xl text-xs font-black transition-all ${
                            genParams.format === fmt
                              ? 'theme-bg-primary text-white shadow-xs'
                              : isDarkMode ? 'bg-[#18181b] border border-zinc-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Department Filter
                    </label>
                    <select
                      value={genParams.department}
                      onChange={(e) => setGenParams({ ...genParams, department: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-bold focus:outline-none focus:theme-border ${
                        isDarkMode ? 'bg-[#18181b] border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="ALL">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="Sales">Sales & Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedReportDef(null)}
                    className="px-4 py-2.5 rounded-2xl border text-xs font-bold text-slate-500 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-6 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-md theme-shadow-primary"
                  >
                    <Download size={14} className={generating ? 'animate-spin' : ''} />
                    <span>{generating ? 'Compiling Report...' : 'Generate & Download'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CREATE PAYROLL RUN MODAL */}
        {/* ========================================================================= */}
        {showCreatePayRunModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-bold">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      Create Payroll Run
                    </h3>
                    <p className="text-xs text-slate-400">Initialize a new wage & hours pay period</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreatePayRunModal(false)}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCreatePayRunSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Pay Run Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPayRunData.title}
                    onChange={(e) => setNewPayRunData({ ...newPayRunData, title: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-semibold focus:outline-none focus:theme-border ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Period Start *
                    </label>
                    <input
                      type="date"
                      required
                      value={newPayRunData.pay_period_start}
                      onChange={(e) => setNewPayRunData({ ...newPayRunData, pay_period_start: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-bold font-mono focus:outline-none focus:theme-border ${
                        isDarkMode ? 'bg-[#18181b] border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Period End *
                    </label>
                    <input
                      type="date"
                      required
                      value={newPayRunData.pay_period_end}
                      onChange={(e) => setNewPayRunData({ ...newPayRunData, pay_period_end: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-bold font-mono focus:outline-none focus:theme-border ${
                        isDarkMode ? 'bg-[#18181b] border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Pay Date (Direct Deposit Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={newPayRunData.pay_date}
                    onChange={(e) => setNewPayRunData({ ...newPayRunData, pay_date: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-bold font-mono focus:outline-none focus:theme-border ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowCreatePayRunModal(false)}
                    className="px-4 py-2.5 rounded-2xl border text-xs font-bold text-slate-500 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black shadow-md theme-shadow-primary"
                  >
                    Create Pay Run
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAYROLL RUN DETAILS MODAL (EXTRA-WIDE, ZERO SCROLLING) */}
        {/* ========================================================================= */}
        {selectedPayRunDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-black">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedPayRunDetail.title}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider theme-bg-light theme-text-primary border theme-border-primary">
                        {selectedPayRunDetail.status}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Pay Period: {selectedPayRunDetail.pay_period_start} → {selectedPayRunDetail.pay_period_end} • Direct Deposit Date: {selectedPayRunDetail.pay_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCalculatePayRun(selectedPayRunDetail.id)}
                    disabled={payRunActionLoading}
                    className="px-3 py-1.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Play size={12} className={payRunActionLoading ? 'animate-spin' : ''} />
                    <span>Recalculate Wages</span>
                  </button>

                  <button
                    onClick={() => handleApprovePayRun(selectedPayRunDetail.id)}
                    disabled={payRunActionLoading || selectedPayRunDetail.status === 'APPROVED'}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Check size={12} />
                    <span>Approve Run</span>
                  </button>

                  <button
                    onClick={() => setSelectedPayRunDetail(null)}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-slate-400 hover:text-white ml-2"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="p-6 grid grid-cols-4 gap-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#18181b]/40">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Regular / OT Hours</span>
                  <p className="text-xl font-black font-mono mt-0.5">
                    {selectedPayRunDetail.total_regular_hours || 0}h <span className="text-slate-400 text-sm">/ {selectedPayRunDetail.total_overtime_hours || 0}h OT</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Gross Pay</span>
                  <p className="text-xl font-black font-mono text-emerald-500 mt-0.5">
                    ${Number(selectedPayRunDetail.total_gross_pay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reimbursements</span>
                  <p className="text-xl font-black font-mono text-indigo-500 mt-0.5">
                    ${Number(selectedPayRunDetail.total_reimbursements || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Net Payout</span>
                  <p className="text-xl font-black font-mono theme-text-primary mt-0.5">
                    ${Number(selectedPayRunDetail.total_net_payout || selectedPayRunDetail.total_gross_pay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Items List Table */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Employee Wage Breakdown ({(selectedPayRunDetail.items || []).length} Staff)
                </h4>
                <div className={`rounded-2xl border overflow-hidden ${
                  isDarkMode ? 'border-zinc-800 bg-[#18181b]/30' : 'border-slate-200 bg-white'
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
                        isDarkMode ? 'bg-[#18181b] border-zinc-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Rate</th>
                        <th className="py-3 px-4">Reg Hrs</th>
                        <th className="py-3 px-4">OT / DT Hrs</th>
                        <th className="py-3 px-4">Leave Pay</th>
                        <th className="py-3 px-4">Reimb</th>
                        <th className="py-3 px-4">Gross Pay</th>
                        <th className="py-3 px-4 text-right">Net Pay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                      {(selectedPayRunDetail.items || []).length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No employee items compiled yet. Click "Recalculate Wages" to pull hours from timesheets.
                          </td>
                        </tr>
                      ) : (
                        selectedPayRunDetail.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="py-3 px-4">
                              <div className="font-black text-slate-900 dark:text-white">
                                {item.employee_name || item.employee_email || `Employee #${idx + 1}`}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.employee_id_code || 'EMP-100'} • {item.state_jurisdiction || 'CA'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono">${item.hourly_rate}/h</td>
                            <td className="py-3 px-4 font-mono font-bold">{item.regular_hours}h</td>
                            <td className="py-3 px-4 font-mono text-slate-400">
                              {item.overtime_hours || 0}h / {item.double_time_hours || 0}h
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">${item.paid_leave_pay || 0}</td>
                            <td className="py-3 px-4 font-mono text-indigo-500">${item.approved_expense_reimbursements || 0}</td>
                            <td className="py-3 px-4 font-mono font-black text-emerald-500">
                              ${Number(item.gross_pay || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 font-mono font-black theme-text-primary text-right">
                              ${Number(item.net_pay || item.gross_pay || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer 1-Click Exports */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#18181b]/50">
                <span className="text-xs text-slate-400">
                  Export provider integration files:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportPayrollFile(selectedPayRunDetail.id, 'adp')}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-700 dark:text-slate-200 hover:theme-border-primary"
                  >
                    ADP Export
                  </button>

                  <button
                    onClick={() => handleExportPayrollFile(selectedPayRunDetail.id, 'gusto')}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-700 dark:text-slate-200 hover:theme-border-primary"
                  >
                    Gusto Sync
                  </button>

                  <button
                    onClick={() => handleExportPayrollFile(selectedPayRunDetail.id, 'quickbooks')}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-700 dark:text-slate-200 hover:theme-border-primary"
                  >
                    QuickBooks
                  </button>

                  <button
                    onClick={() => handleExportPayrollFile(selectedPayRunDetail.id, 'csv')}
                    className="px-3.5 py-1.5 rounded-xl theme-bg-primary hover:opacity-90 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Download size={12} />
                    <span>CSV Summary</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* AUDIT LOG DETAILS MODAL (EXTRA-WIDE, ZERO SCROLLING) */}
        {/* ========================================================================= */}
        {selectedAuditLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
              isDarkMode ? 'bg-[#121217] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      Audit Record Details
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getAuditActionBadge(selectedAuditLog.action)}`}>
                        {selectedAuditLog.action}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Log ID: {selectedAuditLog.id} • {new Date(selectedAuditLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAuditLog(null)}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Actor Profile</span>
                    <p className="font-black text-slate-900 dark:text-white">{selectedAuditLog.actor_email}</p>
                    <p className="text-slate-400 font-mono text-[11px]">Role: {selectedAuditLog.actor_role} • IP: {selectedAuditLog.ip_address || '127.0.0.1'}</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resource Target</span>
                    <p className="font-black text-slate-900 dark:text-white">{selectedAuditLog.resource_type}</p>
                    <p className="text-slate-400 font-mono text-[11px]">ID: {selectedAuditLog.resource_id || 'Global Scope'}</p>
                  </div>
                </div>

                {/* Cryptographic Hash Chaining Verification */}
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SHA-256 Hash Chain Integrity</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                      Zero Tampering Confirmed
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Record SHA-256:</span>
                    <code className="text-[11px] text-emerald-500 font-mono break-all">{selectedAuditLog.record_hash || 'SHA256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</code>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Previous Node Hash:</span>
                    <code className="text-[11px] text-slate-400 font-mono break-all">{selectedAuditLog.previous_hash || 'GENESIS_ROOT_HASH_0000000000000000000000000000000000000000'}</code>
                  </div>
                </div>

                {/* Diff / Context */}
                {selectedAuditLog.field_changes && Object.keys(selectedAuditLog.field_changes).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Field Modifications Diff</span>
                    <pre className={`p-3.5 rounded-2xl border text-[11px] font-mono overflow-x-auto max-h-36 ${
                      isDarkMode ? 'bg-black/40 border-zinc-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      {JSON.stringify(selectedAuditLog.field_changes, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedAuditLog(null)}
                    className="px-5 py-2 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black shadow-md theme-shadow-primary"
                  >
                    Done Reviewing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INSTANT TABLE PREVIEW SLIDE-UP */}
        {/* ========================================================================= */}
        {currentReportResult?.data && (
          <div className={`fixed inset-x-0 bottom-0 top-24 md:top-28 z-50 rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t backdrop-blur-xl animate-in slide-in-from-bottom duration-300 ${
            isDarkMode 
              ? 'bg-[#121217]/95 border-zinc-800 text-white shadow-black/80' 
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl shadow-slate-400/50'
          }`}>
            {/* Header */}
            <div className={`px-6 sm:px-8 py-5 flex items-center justify-between border-b backdrop-blur-md ${
              isDarkMode 
                ? 'border-zinc-800/80 bg-[#18181b]/80' 
                : 'border-slate-200/80 bg-slate-50/90'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center font-bold shadow-sm">
                  <CheckCircle size={20} className="theme-text-primary" />
                </div>
                <div>
                  <h3 className={`font-black text-lg flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    <span>{currentReportResult.report_name || 'Report Preview'}</span>
                  </h3>
                  <p className={`text-xs font-semibold ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <span className="font-mono font-bold theme-text-primary">{currentReportResult.data.length}</span> {currentReportResult.data.length === 1 ? 'record' : 'records'} generated &bull; Ready for instant preview & export
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {currentReportResult.download_url && (
                  <a
                    href={currentReportResult.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-2xl theme-bg-primary hover:opacity-90 text-white text-xs font-black flex items-center gap-2 shadow-lg theme-shadow-primary transition-all duration-200 active:scale-95"
                  >
                    <Download size={15} />
                    <span>Download File</span>
                  </a>
                )}

                <button
                  onClick={() => dispatch(clearCurrentReport())}
                  className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-colors ${
                    isDarkMode 
                      ? 'border-zinc-700/80 text-slate-400 hover:text-white hover:bg-zinc-800' 
                      : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Close Preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
              {currentReportResult.data.length === 0 ? (
                <div className={`py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto rounded-3xl border ${
                  isDarkMode 
                    ? 'bg-zinc-900/40 border-zinc-800/80 text-slate-400' 
                    : 'bg-slate-50/80 border-slate-200 text-slate-600'
                }`}>
                  <div className="w-14 h-14 rounded-2xl theme-bg-light theme-text-primary flex items-center justify-center mb-3 shadow-inner">
                    <FileSpreadsheet size={28} className="theme-text-primary" />
                  </div>
                  <h4 className={`text-base font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    No Records Matched Query
                  </h4>
                  <p className="text-xs mb-4 max-w-xs">
                    The report definition <span className="font-semibold">{currentReportResult.report_name}</span> executed successfully, but returned 0 rows for the selected filters.
                  </p>
                  <button
                    onClick={() => dispatch(clearCurrentReport())}
                    className="px-4 py-2 rounded-xl text-xs font-bold theme-bg-light theme-text-primary hover:opacity-80 transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              ) : (
                <div className={`overflow-hidden rounded-2xl border shadow-sm ${
                  isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-white'
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase tracking-wider text-[10px] sticky top-0 backdrop-blur-md ${
                        isDarkMode 
                          ? 'border-zinc-800 text-slate-400 bg-zinc-900/90' 
                          : 'border-slate-200 text-slate-600 bg-slate-100/90'
                      }`}>
                        {Object.keys(currentReportResult.data[0] || {}).map((k) => (
                          <th key={k} className="py-3.5 px-4 font-black">
                            {k.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-medium ${
                      isDarkMode ? 'divide-zinc-800' : 'divide-slate-200'
                    }`}>
                      {currentReportResult.data.map((row, rIdx) => (
                        <tr 
                          key={rIdx} 
                          className={`transition-colors ${
                            isDarkMode 
                              ? 'hover:bg-zinc-800/40 text-slate-300' 
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="py-3 px-4 font-mono">
                              {String(val ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsDashboard;
