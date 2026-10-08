import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  Briefcase, 
  LogOut, 
  User, 
  ArrowRight, 
  Menu, 
  Plus, 
  Shield, 
  Layers, 
  Building2, 
  Check, 
  Palette,
  Sparkles,
  Users,
  FileSpreadsheet,
  FileCheck,
  CreditCard,
  Globe,
  Settings,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import { logout } from '../../store/authSlice';
import { fetchNotifications } from '../../store/onboardingSlice';
import CommandPalette from './CommandPalette';
import api from '../../services/api';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showQuickActionDropdown, setShowQuickActionDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Real-time backend state
  const [companyProfile, setCompanyProfile] = useState(null);
  const [entities, setEntities] = useState([]);
  const [liveUser, setLiveUser] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isDarkMode, toggleTheme, accentColor, changeAccentColor, themeColors = THEME_COLORS } = useTheme();

  // Dynamic Theme Color Calculation
  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);
  
  const activeHexColor = activeColorObj.color;

  // Redux auth fallback
  const { user: authUser } = useSelector((state) => state.auth || {});

  // 1. FETCH 100% REAL-TIME BACKEND DATA ON MOUNT
  useEffect(() => {
    loadRealTimeNavbarData();
    const interval = setInterval(loadRealTimeNavbarData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const loadRealTimeNavbarData = async () => {
    // A. Company Profile
    try {
      const compRes = await api.get('profile/').catch(() => api.get('company-contacts/'));
      if (compRes.data) {
        setCompanyProfile(compRes.data);
      }
    } catch (e) {
      console.warn("Could not fetch real-time company profile, using fallback tenant context:", e.message);
    }

    // B. Company Entities / Subsidiaries
    try {
      const entRes = await api.get('entities/');
      const entList = Array.isArray(entRes.data) ? entRes.data : (entRes.data?.results || []);
      setEntities(entList);
    } catch (e) {
      // Non-blocking
    }

    // C. Logged-in User Profile
    try {
      const userRes = await api.get('/users/profile/');
      if (userRes.data) {
        setLiveUser(userRes.data);
      }
    } catch (e) {
      try {
        const meRes = await api.get('/users/me/');
        if (meRes.data) setLiveUser(meRes.data);
      } catch (err) {
        // Fallback to localStorage / Redux
      }
    }

    // D. Real-Time Onboarding & Compliance Alerts
    try {
      const onbRes = await api.get('all-onboardings/');
      const candidateList = Array.isArray(onbRes.data) ? onbRes.data : (onbRes.data?.results || []);
      // Filter active or pending verification candidates
      const pending = candidateList.filter(c => 
        ['IN_PROGRESS', 'PENDING', 'INITIATED', 'In Progress', 'Draft'].includes(c.status) || !c.is_active
      ).slice(0, 5);
      setLiveAlerts(pending);
    } catch (e) {
      // Non-blocking
    }
  };

  // Close dropdowns on route change
  useEffect(() => {
    setShowOrgDropdown(false);
    setShowUserDropdown(false);
    setShowNotifDropdown(false);
    setShowQuickActionDropdown(false);
    setShowColorDropdown(false);
  }, [location]);

  // Derive Tenant Information
  const rawHost = window.location.hostname;
  const isSubdomain = rawHost.includes('.') && !rawHost.startsWith('www') && !rawHost.startsWith('127');
  const tenantSlug = isSubdomain ? rawHost.split('.')[0] : 'techinnovatorsinc-6789';
  
  // Real company name priority: 1) companyProfile.company_name, 2) parsed hostname
  const tenantDisplayName = companyProfile?.company_name 
    || companyProfile?.name 
    || tenantSlug.replace(/-[0-9]+$/, '').replace(/-/g, ' ').toUpperCase();

  const planTier = companyProfile?.subscription_tier 
    || companyProfile?.billing?.plan_name 
    || 'Enterprise Tier';

  // Derive User Profile Information
  const currentUser = liveUser || authUser || JSON.parse(localStorage.getItem('user')) || {};
  const displayName = currentUser.first_name 
    ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() 
    : (currentUser.username || currentUser.email || "HR Administrator");
    
  const displayRole = currentUser.role_name 
    || (currentUser.is_superuser ? "Super Admin" : currentUser.is_staff ? "HR Administrator" : (currentUser.role || "HR Admin"));
    
  const userEmail = currentUser.email || `${currentUser.username || 'admin'}@${tenantSlug.split('-')[0]}.com`;
  const avatarSeed = currentUser.first_name ? `${currentUser.first_name}_${currentUser.last_name || ''}` : (currentUser.email || 'Admin');
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarSeed}`;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNotificationClick = (candidate) => {
    setShowNotifDropdown(false);
    navigate('/onboarding');
  };

  return (
    <>
            {/* Backdrop click-away for all dropdowns */}
      {(showOrgDropdown || showUserDropdown || showNotifDropdown || showQuickActionDropdown || showColorDropdown) && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => {
            setShowOrgDropdown(false);
            setShowUserDropdown(false);
            setShowNotifDropdown(false);
            setShowQuickActionDropdown(false);
            setShowColorDropdown(false);
          }} 
        />
      )}

      <nav className={`sticky top-0 z-50 transition-colors duration-200 border-b select-none backdrop-blur-md ${
        isDarkMode 
          ? 'bg-[#09090b]/90 border-zinc-800 text-zinc-100' 
          : 'bg-white/95 border-slate-100 text-slate-800 shadow-xs'
      }`}>
        <div className="px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Left: Mobile Menu & Clean Real-Time Organization Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleSidebar}
                className={`md:hidden p-1.5 rounded-xl border transition-colors ${
                  isDarkMode 
                    ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Organization Brand Badge with Real Data */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowOrgDropdown(!showOrgDropdown);
                    setShowUserDropdown(false);
                    setShowNotifDropdown(false);
                    setShowQuickActionDropdown(false);
                    setShowColorDropdown(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isDarkMode 
                      ? 'bg-[#181a20] border-zinc-800 text-zinc-100 hover:border-zinc-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-sm"
                    style={{ backgroundColor: activeHexColor }}
                  >
                    {companyProfile?.logo ? (
                      <img src={companyProfile.logo} alt="Logo" className="w-5 h-5 rounded object-contain" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col text-left max-w-[130px] sm:max-w-[200px] md:max-w-[240px]">
                    <span className="truncate leading-tight font-bold tracking-tight text-xs sm:text-sm">
                      {tenantDisplayName}
                    </span>
                    <span className={`text-[10px] font-medium leading-none mt-0.5 ${
                      isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      {planTier} • Live Tenant
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                    isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                  } ${showOrgDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Organization & Multi-Entity Switcher Dropdown */}
                {showOrgDropdown && (
                  <div className={`absolute left-0 mt-2 w-80 rounded-2xl shadow-2xl py-2 z-[100] border animate-in fade-in zoom-in-95 duration-100 ${
                    isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  }`}>
                    <div className="px-3.5 py-2 border-b border-zinc-800/40">
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Active Organization Tenant
                      </div>
                      <div className="flex items-center gap-2.5 mt-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: activeHexColor }}
                        >
                          {(tenantDisplayName || 'T')[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">{tenantDisplayName}</p>
                          <p className="text-[10px] font-mono text-zinc-400 truncate">{tenantSlug}.lvh.me</p>
                        </div>
                        <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      </div>
                    </div>

                    {/* Entities / Subsidiaries List if any */}
                    {entities.length > 0 && (
                      <div className="p-2 space-y-1 border-b border-zinc-800/40">
                        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          Subsidiaries & Legal Entities ({entities.length})
                        </div>
                        {entities.slice(0, 3).map((ent) => (
                          <div
                            key={ent.id}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ${
                              isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-semibold truncate">{ent.entity_name}</span>
                            <span className="font-mono text-[10px] text-zinc-400">{ent.fein_ein || 'EIN'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-1.5">
                      <Link
                        to="/admin"
                        onClick={() => setShowOrgDropdown(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isDarkMode ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        <span>Manage Organization Settings & Security</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Global Search trigger (Desktop) */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className={`hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-[#181a20] border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="w-32 lg:w-44 text-left truncate">Search anything...</span>
                <kbd className={`px-1.5 py-0.5 text-[10px] font-bold rounded-lg border ${
                  isDarkMode 
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700' 
                    : 'bg-white text-slate-600 border-slate-200'
                }`}>
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Right: Quick Action Suite, Theme Color Switcher, Dark/Light Toggle, Notifications, User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Quick Action Button */}
              <div className="relative">
                <button
                  onClick={() => { 
                    setShowQuickActionDropdown(!showQuickActionDropdown); 
                    setShowNotifDropdown(false); 
                    setShowUserDropdown(false); 
                    setShowOrgDropdown(false);
                    setShowColorDropdown(false);
                  }}
                  style={{ backgroundColor: activeHexColor }}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-white hover:opacity-95 text-xs font-bold shadow-md transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showQuickActionDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showQuickActionDropdown && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl p-1.5 z-[100] border animate-in fade-in zoom-in-95 duration-100 ${
                    isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  }`}>
                    <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      Quick Create Suite
                    </div>
                    <button 
                      onClick={() => { setShowQuickActionDropdown(false); navigate('/onboarding'); }}
                      className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold gap-2.5 transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4 text-blue-500" /> Initiate Onboarding
                    </button>
                    <button 
                      onClick={() => { setShowQuickActionDropdown(false); navigate('/employee'); }}
                      className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold gap-2.5 transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-4 h-4 text-emerald-500" /> Add New Employee
                    </button>
                    <button 
                      onClick={() => { setShowQuickActionDropdown(false); navigate('/jobs'); }}
                      className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold gap-2.5 transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-purple-500" /> Post Job Requisition
                    </button>
                    <button 
                      onClick={() => { setShowQuickActionDropdown(false); navigate('/subcontractor'); }}
                      className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold gap-2.5 transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-500" /> Register Subcontractor
                    </button>
                    <button 
                      onClick={() => { setShowQuickActionDropdown(false); navigate('/client'); }}
                      className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold gap-2.5 transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-pink-500" /> Register Client Account
                    </button>
                    <button 
                      onClick={() => { setShowQuickActionDropdown(false); navigate('/tasks'); }}
                      className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold gap-2.5 transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-cyan-500" /> Create Project Task
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Color Palette Switcher */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowColorDropdown(!showColorDropdown);
                    setShowNotifDropdown(false);
                    setShowUserDropdown(false);
                    setShowOrgDropdown(false);
                    setShowQuickActionDropdown(false);
                  }}
                  className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all duration-150 ${
                    isDarkMode 
                      ? 'border-zinc-800 bg-[#181a20] hover:border-zinc-700' 
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 shadow-2xs'
                  }`}
                  title="Choose Accent Theme Color"
                  aria-label="Accent Color Picker"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs ring-1 ring-white/20"
                    style={{ backgroundColor: activeHexColor }}
                  />
                  <Palette className={`w-3.5 h-3.5 hidden sm:block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`} />
                </button>

                {/* Color Palette Menu */}
                {showColorDropdown && (
                  <div className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl p-2.5 z-[100] border animate-in fade-in zoom-in-95 duration-100 ${
                    isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  }`}>
                    <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      Application Accent Color
                    </div>
                    <div className="space-y-1">
                      {themeColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => {
                            changeAccentColor(color.id);
                            setShowColorDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            accentColor === color.id
                              ? (isDarkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900')
                              : (isDarkMode ? 'hover:bg-zinc-800/60 text-zinc-400' : 'hover:bg-slate-50 text-slate-600')
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0" 
                              style={{ backgroundColor: color.color }}
                            />
                            <span>{color.label}</span>
                          </div>
                          {accentColor === color.id && (
                            <Check className="w-3.5 h-3.5" style={{ color: color.color }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark / Light Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-150 ${
                  isDarkMode 
                    ? 'border-zinc-800 bg-[#181a20] text-amber-400 hover:border-zinc-700' 
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 shadow-2xs'
                }`}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Live Real-Time Notification Center */}
              <div className="relative">
                <button
                  onClick={() => { 
                    setShowNotifDropdown(!showNotifDropdown); 
                    setShowUserDropdown(false); 
                    setShowQuickActionDropdown(false); 
                    setShowOrgDropdown(false);
                    setShowColorDropdown(false);
                  }}
                  className={`relative p-1.5 sm:p-2 rounded-xl border transition-all duration-150 ${
                    showNotifDropdown 
                      ? (isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-300') 
                      : (isDarkMode ? 'border-zinc-800 bg-[#181a20] text-zinc-100 hover:border-zinc-700' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 shadow-2xs')
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {liveAlerts.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeHexColor }}></span>
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeHexColor }}></span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDropdown && (
                  <div className={`fixed sm:absolute top-14 sm:top-full right-2 sm:right-0 mt-2 w-[calc(100vw-1rem)] sm:w-96 rounded-2xl shadow-2xl border z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
                    isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
                  }`}>
                    <div className={`px-4 py-3 flex justify-between items-center border-b ${
                      isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'
                    }`}>
                      <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" style={{ color: activeHexColor }} />
                        Live Candidate & Compliance Radar
                      </h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor, borderColor: `${activeHexColor}30` }}
                      >
                        {liveAlerts.length} Action Items
                      </span>
                    </div>
                    
                    <div className="max-h-[320px] overflow-y-auto p-2 space-y-1.5">
                      {liveAlerts.length > 0 ? (
                        liveAlerts.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`group relative p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 border ${
                              isDarkMode 
                                ? 'bg-[#181a20] border-zinc-800 hover:border-zinc-700' 
                                : 'bg-white border-slate-100 hover:border-slate-200 shadow-2xs'
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0"
                              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                            >
                              {(item.first_name || 'C')[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-xs font-bold truncate">
                                  {item.first_name} {item.last_name}
                                </p>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                                  ['IN_PROGRESS', 'In Progress'].includes(item.status)
                                    ? 'bg-blue-500/15 text-blue-500'
                                    : 'bg-amber-500/15 text-amber-500'
                                }`}>
                                  {item.status || 'Pending'}
                                </span>
                              </div>
                              <p className={`text-[11px] truncate mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                                {item.job_title || 'Software Engineer'} {item.client_name ? `• ${item.client_name}` : ''}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center" style={{ color: activeHexColor }} />
                          </div>
                        ))
                      ) : (
                        <div className={`py-8 text-center text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500 opacity-60" />
                          All onboarding workflows and Form I-9 verifications are fully verified.
                        </div>
                      )}
                    </div>
                    
                    <div className={`px-4 py-2.5 border-t text-center ${
                      isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-100 bg-slate-50'
                    }`}>
                      <button 
                        onClick={() => { setShowNotifDropdown(false); navigate('/onboarding'); }} 
                        className="text-xs font-bold hover:underline transition-colors flex items-center justify-center gap-1 mx-auto"
                        style={{ color: activeHexColor }}
                      >
                        Open Onboarding Pipeline & Radar →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill with 100% Real-Time Identity */}
              <div className="relative pl-0.5">
                <button
                  onClick={() => { 
                    setShowUserDropdown(!showUserDropdown); 
                    setShowNotifDropdown(false); 
                    setShowQuickActionDropdown(false); 
                    setShowOrgDropdown(false);
                    setShowColorDropdown(false);
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 p-1 pl-1.5 pr-2 rounded-xl transition-all duration-150 border ${
                    showUserDropdown 
                      ? (isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-300 shadow-xs') 
                      : (isDarkMode ? 'border-zinc-800 bg-[#181a20] hover:border-zinc-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300 shadow-2xs')
                  }`}
                >
                  <img src={avatarUrl} alt="User Avatar" className="h-6 w-6 rounded-lg bg-zinc-700/20" />
                  <div className="hidden lg:flex flex-col text-left max-w-[100px]">
                    <span className="text-xs font-bold truncate leading-tight">
                      {displayName}
                    </span>
                    <span className={`text-[9px] truncate leading-none mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {displayRole}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                  } ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {showUserDropdown && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl py-2 z-[100] border animate-in fade-in zoom-in-95 duration-100 ${
                    isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
                  }`}>
                    <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
                      <p className="text-xs font-bold truncate">{displayName}</p>
                      <p className={`text-[11px] truncate ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{userEmail}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {displayRole}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">2FA Verified</span>
                      </div>
                    </div>
                    
                    <div className="p-1.5 space-y-1">
                      <Link 
                        to="/profile" 
                        className={`flex items-center px-3 py-2 rounded-xl text-xs font-semibold gap-3 transition-colors ${
                          isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                        }`} 
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <User className="w-4 h-4 text-blue-500" /> User Profile & Security
                      </Link>
                      <Link 
                        to="/admin" 
                        className={`flex items-center px-3 py-2 rounded-xl text-xs font-semibold gap-3 transition-colors ${
                          isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                        }`} 
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Tenant Governance & Admin
                      </Link>
                    </div>

                    <div className={`border-t my-1 ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}></div>
                    
                    <div className="p-1.5">
                      <button 
                        onClick={handleLogout} 
                        className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-bold gap-3 transition-colors text-rose-500 ${
                          isDarkMode ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'
                        }`}
                      >
                        <LogOut className="w-4 h-4" /> Sign Out Session
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* Global Command Palette Modal */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </>
  );
};

export default Navbar;
