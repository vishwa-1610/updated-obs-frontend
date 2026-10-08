import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User, Mail, MapPin, Building, Phone, Hash, Shield, Globe, 
  Edit2, X, Loader2, RefreshCw, Camera, Users, ChevronDown, Check,
  ShieldCheck, ShieldAlert, QrCode, Copy, Key, Download, Smartphone,
  AlertTriangle, Lock, ArrowRight, CheckCircle, Briefcase, Calendar,
  Sparkles, ShieldQuestion, Fingerprint, Award, Layers, Palette,
  ExternalLink, CheckCircle2, ShieldOff
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import { authService } from '../../services/authService';
import { updateUser } from '../../store/authSlice';
import Modal from '../common/Modal/Modal';
import SuccessModal from '../common/Modal/SuccessModal';

import PageLoader from '../common/LoadingScreen/LoadingScreen';

// Helper for Avatar URL
const getAvatarUrl = (seed) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed || 'admin'}`;

const AVATAR_PRESETS = [
  'admin', 'alex', 'sarah', 'michael', 'elena', 'david', 'sophia', 'marcus'
];

// --- SUB-COMPONENTS ---

const InfoCard = ({ icon: Icon, label, value, isDarkMode }) => (
  <div className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 hover:scale-[1.008] ${
    isDarkMode 
      ? 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700' 
      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
  }`}>
    <div className="flex items-start gap-3.5">
      <div className="p-2.5 rounded-xl shrink-0 mt-0.5 theme-bg-light theme-text-primary border border-current/15">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
          isDarkMode ? 'text-zinc-400' : 'text-slate-500'
        }`}>
          {label}
        </p>
        <p className={`text-xs sm:text-sm font-bold truncate ${
          isDarkMode ? 'text-zinc-100' : 'text-slate-900'
        }`}>
          {value || '—'}
        </p>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, subtitle, icon: Icon, onEdit, isDarkMode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-200 dark:border-zinc-800">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl theme-bg-light theme-text-primary border border-current/15">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        {subtitle && <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
    {onEdit && (
      <button
        type="button"
        onClick={onEdit}
        className={`self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
          isDarkMode 
            ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
            : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
        }`}
      >
        <Edit2 size={12} className="theme-text-primary" /> Edit Section
      </button>
    )}
  </div>
);

// --- MAIN COMPONENT ---

const Profile = () => {
  const { isDarkMode, accentColor, changeAccentColor, themeColors = THEME_COLORS } = useTheme();
  const dispatch = useDispatch();

  // Active Accent Color Object for Dynamic Hex Styling
  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { id: 'blue', color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);

  const activeHex = activeColorObj.color;
  
  // Redux User State
  const { user } = useSelector((state) => state.auth || {});
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'company', 'security', 'appearance'
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSectionTab, setEditSectionTab] = useState('personal'); // 'personal', 'location', 'company', 'avatar'
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 2FA State
  const [twoFactorStatus, setTwoFactorStatus] = useState({ enabled: false, primary_method: null, backup_codes_count: 0 });
  const [is2FASetupModalOpen, setIs2FASetupModalOpen] = useState(false);
  const [is2FADisableModalOpen, setIs2FADisableModalOpen] = useState(false);
  const [isBackupCodesModalOpen, setIsBackupCodesModalOpen] = useState(false);
  
  const [setup2FAData, setSetup2FAData] = useState(null); // { secret, provisioning_uri, instructions }
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [backupCodesList, setBackupCodesList] = useState([]);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    avatar_seed: 'admin',
    custom_avatar_url: '',
    // Company details
    company_name: '',
    schema_name: '',
    role: '',
    designation: '',
    employee_id: '',
    department: '',
    joining_date: '',
    // Address
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States'
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial profile & 2FA status
  const fetchProfileAnd2FA = async () => {
    try {
      setLoading(true);
      const res = await authService.getProfile();
      const profileData = res.data || res;
      
      setFormData(prev => ({
        ...prev,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        avatar_seed: profileData.avatar_seed || 'admin',
        custom_avatar_url: profileData.custom_avatar_url || '',
        company_name: profileData.company_name || profileData.tenant_name || '',
        schema_name: profileData.schema_name || '',
        role: profileData.role || (profileData.is_superuser ? 'Super Admin' : 'Administrator'),
        designation: profileData.designation || 'Lead Administrator',
        employee_id: profileData.employee_id || 'EMP-001',
        department: profileData.department || 'Management / Operations',
        joining_date: profileData.joining_date || profileData.date_joined || '2024-01-15',
        address_line_1: profileData.employer_address || profileData.address_line_1 || '',
        address_line_2: profileData.address_line_2 || '',
        city: profileData.city || profileData.employer_city || '',
        state: profileData.state || profileData.employer_state || '',
        postal_code: profileData.pincode || profileData.postal_code || profileData.employer_zipcode || '',
        country: profileData.country || 'United States'
      }));

      // Set 2FA status from profile
      setTwoFactorStatus({
        enabled: Boolean(profileData.is_two_factor_enabled),
        primary_method: profileData.is_two_factor_enabled ? 'Authenticator App (TOTP)' : null,
        backup_codes_count: profileData.is_two_factor_enabled ? 8 : 0
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAnd2FA();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  // Submit Profile Changes
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authService.updateProfile(formData);
      const updated = res.data?.data || res.data || res;
      dispatch(updateUser(updated));
      setIsEditModalOpen(false);
      setSuccessMsg('Profile updated successfully!');
      setShowSuccess(true);
    } catch (err) {
      console.error('Update failed:', err);
      alert(err.response?.data?.message || 'Failed to update profile. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Password Change
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setIsPasswordModalOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setSuccessMsg('Password changed successfully!');
      setShowSuccess(true);
    } catch (err) {
      const errorMsg = err.response?.data?.old_password?.[0] || 
                       err.response?.data?.new_password?.[0] || 
                       err.response?.data?.detail || 
                       err.response?.data?.message || 
                       'Failed to change password. Please verify your current password.';
      setPasswordError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 2FA Handlers ---
  const handleStart2FASetup = async () => {
    setIs2FALoading(true);
    setTwoFAError('');
    try {
      const res = await authService.setup2FA();
      const data = res.data || res;
      setSetup2FAData(data);
      setVerificationCode('');
      setIs2FASetupModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initiate 2FA setup. Please try again.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FASetup = async (e) => {
    e.preventDefault();
    const cleanCode = verificationCode.trim().replace(/\s/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setTwoFAError('Please enter a valid 6-digit code from your authenticator app');
      return;
    }

    setIs2FALoading(true);
    setTwoFAError('');
    try {
      const res = await authService.enable2FA({ code: cleanCode });
      const data = res.data || res;
      const backupCodes = data.backup_codes || [];
      
      setTwoFactorStatus({
        enabled: true,
        primary_method: 'authenticator',
        backup_codes_count: backupCodes.length || 8
      });
      setBackupCodesList(backupCodes);
      setIs2FASetupModalOpen(false);
      setIsBackupCodesModalOpen(true);
      setSuccessMsg('Two-Factor Authentication is now enabled!');
      setShowSuccess(true);
    } catch (err) {
      setTwoFAError(err.response?.data?.error || 'Invalid authentication code. Make sure your device time is synchronized and try again.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      setTwoFAError('Password is required to disable 2FA');
      return;
    }

    setIs2FALoading(true);
    setTwoFAError('');
    try {
      await authService.disable2FA({ password: disablePassword });
      setTwoFactorStatus({ enabled: false, primary_method: null, backup_codes_count: 0 });
      setIs2FADisableModalOpen(false);
      setDisablePassword('');
      setSuccessMsg('Two-Factor Authentication has been disabled.');
      setShowSuccess(true);
    } catch (err) {
      setTwoFAError(err.response?.data?.password?.[0] || err.response?.data?.error || 'Failed to disable 2FA. Incorrect password.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!window.confirm('Generating new backup codes will invalidate any existing codes. Proceed?')) return;
    setIs2FALoading(true);
    try {
      const res = await authService.regenerateBackupCodes();
      const data = res.data || res;
      const codes = data.backup_codes || [];
      setBackupCodesList(codes);
      setTwoFactorStatus(prev => ({ ...prev, backup_codes_count: codes.length || 8 }));
      setIsBackupCodesModalOpen(true);
      setSuccessMsg('Fresh recovery codes generated successfully!');
      setShowSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate backup codes.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const copyToClipboard = (text, type = 'secret') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([backupCodesList.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `backup-codes-${formData.email || 'account'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const currentAvatarUrl = formData.custom_avatar_url || getAvatarUrl(formData.avatar_seed || user?.username || 'admin');
  const qrUri = setup2FAData?.provisioning_uri || setup2FAData?.uri || '';
  const secretKey = setup2FAData?.secret || setup2FAData?.secret_key || '';

  if (loading) {
    return (
      <PageLoader 
        message="Loading Profile & Security Settings..."
        subMessage="Fetching identity records, two-factor status, and company tenant data"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* --- HERO BANNER & HEADER (Reacts Dynamically to Accent Color) --- */}
      <div className={`relative overflow-hidden rounded-3xl border transition-all duration-200 shadow-sm ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-white border-slate-200 shadow-slate-100'
      }`}>
        {/* Dynamic Hero Banner Gradient using active accent color */}
        <div 
          className="h-36 sm:h-44 w-full relative overflow-hidden transition-all duration-300"
          style={{
            background: isDarkMode
              ? `linear-gradient(135deg, ${activeHex}ee 0%, #0f172a 100%)`
              : `linear-gradient(135deg, ${activeHex} 0%, ${activeHex}dd 50%, #1e293b 100%)`
          }}
        >
          <div className="absolute inset-0 bg-radial from-white/15 to-transparent mix-blend-overlay" />
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold shadow-sm">
            <Sparkles size={13} className="text-yellow-300" />
            <span>{formData.company_name || 'Organization Workspace'}</span>
          </div>
        </div>

        {/* Profile Card Main Row */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-16 sm:-mt-20 mb-4">
            
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1.5 bg-white dark:bg-zinc-900 border-4 ${
                  isDarkMode ? 'border-zinc-900 shadow-2xl' : 'border-white shadow-xl'
                }`}>
                  <img
                    src={currentAvatarUrl}
                    alt="User Avatar"
                    className="w-full h-full rounded-2xl object-cover bg-slate-100 dark:bg-zinc-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditSectionTab('avatar');
                    setIsEditModalOpen(true);
                  }}
                  title="Change Avatar"
                  className="absolute bottom-1 right-1 p-2 rounded-xl theme-bg-primary text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div className="sm:pb-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {formData.first_name || formData.last_name 
                      ? `${formData.first_name} ${formData.last_name}`.trim()
                      : user?.username || 'Administrator'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold theme-bg-light theme-text-primary border border-current/20">
                    {formData.role || 'Admin'}
                  </span>
                  {twoFactorStatus.enabled && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck size={11} /> 2FA Active
                    </span>
                  )}
                </div>
                <p className={`text-xs font-semibold flex items-center justify-center sm:justify-start gap-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  <Mail size={13} className="text-slate-400" /> {formData.email || user?.email || 'admin@mail.com'}
                </p>
              </div>
            </div>

            {/* Actions: Clean high-contrast buttons with theme responsiveness */}
            <div className="flex items-center justify-center sm:justify-end gap-2.5 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-2xs ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white' 
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                <Lock size={14} className="text-slate-500 dark:text-zinc-400" />
                Change Password
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditSectionTab('personal');
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold theme-bg-primary text-white transition-all duration-150 flex items-center gap-2 theme-shadow-primary cursor-pointer hover:opacity-95"
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            </div>

          </div>

          {/* Navigation Tabs: Dynamic theme active indicator */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-zinc-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'personal'
                  ? 'theme-bg-primary text-white theme-shadow-primary'
                  : isDarkMode
                    ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <User size={14} /> Personal Details
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('company')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'company'
                  ? 'theme-bg-primary text-white theme-shadow-primary'
                  : isDarkMode
                    ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <Building size={14} /> Company & Employer
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'theme-bg-primary text-white theme-shadow-primary'
                  : isDarkMode
                    ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <ShieldCheck size={14} /> Security & 2FA
              {twoFactorStatus.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'theme-bg-primary text-white theme-shadow-primary'
                  : isDarkMode
                    ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <Palette size={14} /> Theme & Colors
            </button>
          </div>

        </div>
      </div>

      {/* --- TAB CONTENT AREA --- */}

      {/* 1. PERSONAL DETAILS TAB */}
      {activeTab === 'personal' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Identity & Basic Info */}
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <SectionHeader
              title="Personal Information"
              subtitle="Your basic identity details and direct contact points"
              icon={User}
              onEdit={() => {
                setEditSectionTab('personal');
                setIsEditModalOpen(true);
              }}
              isDarkMode={isDarkMode}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard icon={User} label="First Name" value={formData.first_name} isDarkMode={isDarkMode} />
              <InfoCard icon={User} label="Last Name" value={formData.last_name} isDarkMode={isDarkMode} />
              <InfoCard icon={Mail} label="Email Address" value={formData.email} isDarkMode={isDarkMode} />
              <InfoCard icon={Phone} label="Phone Number" value={formData.phone_number} isDarkMode={isDarkMode} />
              <InfoCard icon={Briefcase} label="Designation" value={formData.designation} isDarkMode={isDarkMode} />
              <InfoCard icon={Award} label="System Role" value={formData.role} isDarkMode={isDarkMode} />
            </div>
          </div>

          {/* Location & Address */}
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <SectionHeader
              title="Residential / Mailing Address"
              subtitle="Registered location for taxation, notices, and correspondence"
              icon={MapPin}
              onEdit={() => {
                setEditSectionTab('location');
                setIsEditModalOpen(true);
              }}
              isDarkMode={isDarkMode}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard icon={MapPin} label="Street Address Line 1" value={formData.address_line_1} isDarkMode={isDarkMode} />
              <InfoCard icon={MapPin} label="Street Address Line 2" value={formData.address_line_2} isDarkMode={isDarkMode} />
              <InfoCard icon={Building} label="City" value={formData.city} isDarkMode={isDarkMode} />
              <InfoCard icon={MapPin} label="State / Province" value={formData.state} isDarkMode={isDarkMode} />
              <InfoCard icon={Hash} label="Postal / ZIP Code" value={formData.postal_code} isDarkMode={isDarkMode} />
              <InfoCard icon={Globe} label="Country" value={formData.country} isDarkMode={isDarkMode} />
            </div>
          </div>

        </div>
      )}

      {/* 2. COMPANY & EMPLOYER TAB */}
      {activeTab === 'company' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <SectionHeader
              title="Company & Workspace Details"
              subtitle="Organization structure and workspace tenant configuration"
              icon={Building}
              onEdit={() => {
                setEditSectionTab('company');
                setIsEditModalOpen(true);
              }}
              isDarkMode={isDarkMode}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard icon={Building} label="Organization Name" value={formData.company_name} isDarkMode={isDarkMode} />
              <InfoCard icon={Layers} label="Workspace Tenant Domain" value={formData.schema_name ? `${formData.schema_name}.domain.com` : 'Default'} isDarkMode={isDarkMode} />
              <InfoCard icon={Hash} label="Employee ID" value={formData.employee_id} isDarkMode={isDarkMode} />
              <InfoCard icon={Users} label="Department" value={formData.department} isDarkMode={isDarkMode} />
              <InfoCard icon={Calendar} label="Date of Joining" value={formData.joining_date} isDarkMode={isDarkMode} />
              <InfoCard icon={Shield} label="Access Permissions" value="Full Multi-Tenant Admin" isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      )}

      {/* 3. SECURITY & 2FA TAB */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Two-Factor Authentication Box */}
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl ${
                  twoFactorStatus.enabled 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {twoFactorStatus.enabled ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Two-Factor Authentication (2FA)
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                      twoFactorStatus.enabled
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {twoFactorStatus.enabled ? <CheckCircle2 size={11} /> : <ShieldAlert size={11} />}
                      {twoFactorStatus.enabled ? 'Active & Protected' : 'Disabled'}
                    </span>
                  </div>
                  <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Protect your administrator credentials with TOTP time-based one-time passwords (Google Authenticator, Microsoft Authenticator, 1Password, Authy).
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                {twoFactorStatus.enabled ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIs2FADisableModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldOff size={13} />
                      Disable 2FA
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerateBackupCodes}
                      disabled={is2FALoading}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        isDarkMode 
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
                          : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <RefreshCw size={13} className={is2FALoading ? 'animate-spin' : ''} />
                      Recovery Codes
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStart2FASetup}
                    disabled={is2FALoading}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white transition-all theme-shadow-primary flex items-center gap-2 cursor-pointer hover:opacity-95"
                  >
                    {is2FALoading ? <Loader2 size={15} className="animate-spin" /> : <Smartphone size={15} />}
                    Setup Authenticator App
                  </button>
                )}
              </div>
            </div>

            {/* 2FA Status summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone size={18} className="theme-text-primary" />
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Primary Method</span>
                </div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                  {twoFactorStatus.enabled ? 'Authenticator App (TOTP)' : 'None Configured'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Key size={18} className="theme-text-primary" />
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Backup Codes</span>
                </div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                  {twoFactorStatus.enabled ? `${twoFactorStatus.backup_codes_count || 8} codes available` : 'Not generated'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Lock size={18} className="text-emerald-500" />
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Protection Level</span>
                </div>
                <p className={`text-sm font-bold ${twoFactorStatus.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {twoFactorStatus.enabled ? 'High Security' : 'Standard Password Only'}
                </p>
              </div>
            </div>
          </div>

          {/* Account Password Card */}
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl theme-bg-light theme-text-primary border border-current/15">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Account Password
                  </h3>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Ensure your account is using a strong, unique alphanumeric passphrase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-2xs ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white' 
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                <Edit2 size={13} className="theme-text-primary" /> Update Password
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4. THEME & APPEARANCE TAB */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <SectionHeader
              title="Application Theme & Accent Colors"
              subtitle="Select your preferred brand accent color to personalize your interface across all modules"
              icon={Palette}
              isDarkMode={isDarkMode}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
              {themeColors.map((color) => {
                const isSelected = accentColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => changeAccentColor(color.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 relative group ${
                      isSelected
                        ? isDarkMode
                          ? 'border-zinc-500 bg-zinc-800 shadow-lg scale-102'
                          : 'border-slate-400 bg-slate-50 shadow-md scale-102'
                        : isDarkMode
                          ? 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/60'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color.color }}
                    >
                      {isSelected && <Check size={20} className="stroke-[3]" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                        {color.label}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5 uppercase">
                        {color.color}
                      </p>
                    </div>

                    {isSelected && (
                      <span 
                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: color.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-2xl theme-bg-light border border-current/15 flex items-center gap-3">
              <Sparkles size={20} className="theme-text-primary shrink-0" />
              <p className="text-xs font-semibold theme-text-primary">
                Changing your accent color instantly updates navbar highlights, sidebar active items, buttons, badges, and card indicators across the entire workspace.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL 1: EDIT PROFILE (Personal / Location / Company / Avatar) --- */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Information"
        maxWidth="max-w-2xl"
      >
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* Sub-tab Switcher within Modal */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl mb-6 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 overflow-x-auto">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'location', label: 'Location', icon: MapPin },
              { id: 'company', label: 'Company / Employer', icon: Building },
              { id: 'avatar', label: 'Avatar Studio', icon: Camera }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = editSectionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditSectionTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'theme-bg-primary text-white shadow-sm'
                      : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 hover:bg-slate-200/70 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* 1. PERSONAL TAB */}
            {editSectionTab === 'personal' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Email (Read Only)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Designation / Title</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g. Lead Administrator"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g. Human Resources"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. LOCATION TAB */}
            {editSectionTab === 'location' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Street Address Line 1</label>
                  <input
                    type="text"
                    name="address_line_1"
                    value={formData.address_line_1}
                    onChange={handleInputChange}
                    placeholder="123 Corporate Blvd"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Street Address Line 2 (Suite / Apt)</label>
                  <input
                    type="text"
                    name="address_line_2"
                    value={formData.address_line_2}
                    onChange={handleInputChange}
                    placeholder="Suite 400"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">State / Region</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Postal / ZIP</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. COMPANY TAB */}
            {editSectionTab === 'company' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Company Name</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Employee ID</label>
                    <input
                      type="text"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Tenant Workspace ID (Schema)</label>
                  <input
                    type="text"
                    value={formData.schema_name}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* 4. AVATAR STUDIO */}
            {editSectionTab === 'avatar' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Choose a profile preset character or generate a custom seed avatar:</p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar_seed: preset, custom_avatar_url: '' }))}
                      className={`p-1.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        formData.avatar_seed === preset && !formData.custom_avatar_url
                          ? 'theme-border-primary theme-bg-light scale-105'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <img src={getAvatarUrl(preset)} alt={preset} className="w-full h-auto rounded-xl" />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Custom Seed Text</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="avatar_seed"
                      value={formData.avatar_seed}
                      onChange={handleInputChange}
                      placeholder="e.g. superhero, coder, admin"
                      className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar_seed: Math.random().toString(36).substring(7) }))}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw size={13} /> Randomize
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-zinc-800 mt-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white transition-all theme-shadow-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:opacity-95"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* --- MODAL 2: CHANGE PASSWORD --- */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordError('');
        }}
        title="Change Account Password"
        maxWidth="max-w-md"
      >
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSavePassword} className="space-y-4">
            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Current Password</label>
              <input
                type="password"
                name="current_password"
                required
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">New Password</label>
              <input
                type="password"
                name="new_password"
                required
                minLength={8}
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Confirm New Password</label>
              <input
                type="password"
                name="confirm_password"
                required
                minLength={8}
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:theme-border outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white transition-all theme-shadow-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:opacity-95"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* --- MODAL 3: SETUP AUTHENTICATOR APP (TOTP 2FA) --- */}
      {/* ========================================================================= */}
      <Modal
        isOpen={is2FASetupModalOpen}
        onClose={() => {
          setIs2FASetupModalOpen(false);
          setTwoFAError('');
        }}
        title="Setup Authenticator App (2FA)"
        maxWidth="max-w-lg"
      >
        <div className="p-6 overflow-y-auto space-y-5">
          {twoFAError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{twoFAError}</span>
            </div>
          )}

          {/* Supported Apps pill list */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
            <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Smartphone size={13} className="theme-text-primary" /> Supported Authenticator Apps:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Google Authenticator', 'Microsoft Authenticator', '1Password', 'Authy', 'Bitwarden'].map((app) => (
                <span key={app} className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                  {app}
                </span>
              ))}
            </div>
          </div>

          {/* Step 1: QR Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full theme-bg-primary text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Scan QR Code with your Authenticator App
              </h4>
            </div>

            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xs">
              {qrUri ? (
                <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                  <QRCodeSVG 
                    value={qrUri} 
                    size={175} 
                    level="M" 
                    includeMargin={false}
                  />
                </div>
              ) : (
                <div className="w-44 h-44 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <Loader2 className="w-6 h-6 animate-spin theme-text-primary" />
                  <span className="text-[11px] font-semibold text-slate-400">Generating QR code...</span>
                </div>
              )}

              {/* Secret Key Manual Entry */}
              <div className="mt-4 w-full text-center">
                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1.5">
                  Cannot scan QR? Enter this Secret Key manually:
                </p>
                <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                  <code className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-xs font-mono font-bold text-slate-900 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 select-all tracking-wider">
                    {secretKey || '—'}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(secretKey, 'secret')}
                    className="p-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 hover:text-slate-900 text-xs flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                    title="Copy Secret Key"
                  >
                    {copiedSecret ? <Check size={14} className="text-emerald-500 stroke-[3]" /> : <Copy size={14} />}
                  </button>
                </div>
                {copiedSecret && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                    ✓ Secret Key copied to clipboard!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Verification Input */}
          <form onSubmit={handleVerify2FASetup} className="space-y-4 pt-1 border-t border-slate-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full theme-bg-primary text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Enter the 6-Digit Code generated by your app
                </label>
              </div>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-black focus:theme-border outline-none transition-all shadow-inner"
              />
              <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500 mt-1 font-medium">
                Codes change every 30 seconds.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIs2FASetupModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={is2FALoading || verificationCode.length !== 6}
                className="px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white transition-all theme-shadow-primary flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:opacity-95"
              >
                {is2FALoading && <Loader2 size={14} className="animate-spin" />}
                Confirm & Enable 2FA
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* --- MODAL 4: BACKUP RECOVERY CODES DISPLAY --- */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isBackupCodesModalOpen}
        onClose={() => setIsBackupCodesModalOpen(false)}
        title="Two-Factor Recovery Codes"
        maxWidth="max-w-md"
      >
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-medium leading-relaxed flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <strong className="font-bold block mb-0.5 text-amber-900 dark:text-amber-200">Store these codes safely!</strong>
              Each recovery code can be used once to log in if you ever lose access to your authenticator app.
            </div>
          </div>

          {/* Grid of codes */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-2.5 font-mono text-xs font-black text-center">
            {backupCodesList.map((code, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 select-all tracking-wider shadow-2xs">
                {code}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => copyToClipboard(backupCodesList.join('\n'), 'codes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isDarkMode 
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {copiedCodes ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copiedCodes ? 'Copied!' : 'Copy Codes'}
            </button>

            <button
              type="button"
              onClick={downloadBackupCodes}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isDarkMode 
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Download size={13} />
              Download .txt
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={() => setIsBackupCodesModalOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white transition-all theme-shadow-primary cursor-pointer hover:opacity-95"
            >
              I Have Saved My Recovery Codes
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* --- MODAL 5: DISABLE 2FA CONFIRMATION --- */}
      {/* ========================================================================= */}
      <Modal
        isOpen={is2FADisableModalOpen}
        onClose={() => {
          setIs2FADisableModalOpen(false);
          setTwoFAError('');
          setDisablePassword('');
        }}
        title="Disable Two-Factor Authentication"
        maxWidth="max-w-md"
      >
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleDisable2FA} className="space-y-4">
            {twoFAError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{twoFAError}</span>
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Disabling 2FA reduces account security. Please enter your account password to confirm:
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-zinc-300">Confirm Account Password</label>
              <input
                type="password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIs2FADisableModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' 
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={is2FALoading || !disablePassword}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md shadow-rose-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {is2FALoading && <Loader2 size={14} className="animate-spin" />}
                Confirm Disable
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* SUCCESS MODAL */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
      />

    </div>
  );
};

export default Profile;
