import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  Shield, Key, CheckCircle, AlertCircle, Building2,
  Sparkles, Check, Loader2, RefreshCw, Smartphone,
  ShieldCheck, Globe, HelpCircle, Moon, Sun, ArrowLeft,
  ChevronRight, Laptop, UserCheck, Zap
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import { setLoginSuccess } from '../../store/authSlice';
import authService from '../../services/authService';
import api from '../../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode, toggleDarkMode, accentColor, themeColors = THEME_COLORS } = useTheme();

  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);
  const activeHexColor = activeColorObj.color;

  // Form State
  const [formData, setFormData] = useState({
    email: '', // Accepts username or email
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA Challenge State
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Tenant Subdomain Switcher Modal
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [tenantInput, setTenantInput] = useState('');

  // Derive Tenant Information
  const rawHost = window.location.hostname;
  const isSubdomain = rawHost.includes('.') && !rawHost.startsWith('www') && !rawHost.startsWith('127');
  const tenantSlug = isSubdomain ? rawHost.split('.')[0] : 'techinnovatorsinc-6789';
  const tenantDisplayName = tenantSlug.replace(/-[0-9]+$/, '').replace(/-/g, ' ').toUpperCase() || 'TECH INNOVATORS INC.';

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Quick Demo Credentials Selector
  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  // 1. Primary Login Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send login credentials (email field can contain username or email)
      const res = await api.post('/users/login/', {
        username: formData.email,
        email: formData.email,
        password: formData.password
      });

      // Handle 2FA Challenge
      if (res.data.requires_2fa) {
        setTempToken(res.data.temp_token);
        setTwoFactorStep(true);
        setLoading(false);
        return;
      }

      // Successful Immediate Login
      handleLoginSuccess(res.data);

    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.error || 
                  err.response?.data?.detail || 
                  'Invalid credentials. Please verify your email and password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. 2FA Verification Handler
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setError('Please enter the 6-digit authentication code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.verify2FALogin({
        temp_token: tempToken,
        code: twoFactorCode.trim()
      });

      handleLoginSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired authentication code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Send Email OTP
  const handleSendEmailOTP = async () => {
    setOtpLoading(true);
    setError('');
    setOtpSentMsg('');
    try {
      await authService.sendEmailOTP({ temp_token: tempToken });
      setOtpSentMsg('A 6-digit security code has been sent to your registered email.');
    } catch (err) {
      setError('Failed to send email OTP. Please use your authenticator app.');
    } finally {
      setOtpLoading(false);
    }
  };

  // 4. Common Login Success Resolver
  const handleLoginSuccess = (authData) => {
    if (authData.access) localStorage.setItem('access', authData.access);
    if (authData.refresh) localStorage.setItem('refresh', authData.refresh);
    if (authData.user) localStorage.setItem('user', JSON.stringify(authData.user));

    if (rememberMe) {
      localStorage.setItem('remembered_email', formData.email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    dispatch(setLoginSuccess(authData));
    navigate('/');
  };

  // 5. Forgot Password Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotSuccess('');
    setError('');
    try {
      await authService.forgotPassword({ email: forgotEmail });
      setForgotSuccess('If an account exists with this email, password reset instructions have been sent.');
    } catch (err) {
      setForgotSuccess('If an account exists with this email, password reset instructions have been sent.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 sm:p-6 transition-colors duration-200 select-none ${
      isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: activeHexColor }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: '#8b5cf6' }}
        />
      </div>

      {/* Top Header Floating Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
            isDarkMode 
              ? 'bg-[#181a20]/80 border-zinc-800 text-zinc-300 hover:border-zinc-700' 
              : 'bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
          }`}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>
      </div>

      {/* Master Card Container */}
      <div className="relative w-full max-w-5xl">
        <div className={`rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-xl transition-all ${
          isDarkMode ? 'bg-[#131722]/95 border-zinc-800' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="flex flex-col lg:flex-row min-h-[620px]">

            {/* =================================================== */}
            {/* LEFT HERO & ENTERPRISE HIGHLIGHTS                   */}
            {/* =================================================== */}
            <div 
              className="lg:w-5/12 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden text-white"
              style={{
                background: isDarkMode 
                  ? `linear-gradient(135deg, ${activeHexColor}dd 0%, #09090b 100%)` 
                  : `linear-gradient(135deg, ${activeHexColor} 0%, #1e1b4b 100%)`
              }}
            >
              {/* Subtle Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-20 translate-x-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-y-20 -translate-x-20 pointer-events-none" />

              <div className="relative z-10">
                
                {/* Organization Brand Badge */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-lg shadow-sm">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight leading-tight uppercase">
                      {tenantDisplayName}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white inline-block mt-0.5">
                      Verified Tenant Workspace
                    </span>
                  </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-3">
                  Enterprise Human Capital & Onboarding Suite
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed mb-6 font-medium">
                  Unified Form I-9, USCIS E-Verify, automated state tax compliance, and workforce intelligence.
                </p>

                {/* Feature Highlights Radar */}
                <div className="space-y-2.5">
                  {[
                    { label: '50 US State Tax & Direct Deposit Automation', icon: Zap },
                    { label: 'Section 2 Employer I-9 Physical Verification', icon: ShieldCheck },
                    { label: 'SOC-2 Type II & HIPAA Encrypted Data Vault', icon: Shield },
                    { label: 'Biometric & Shift Scheduling Automation', icon: UserCheck },
                  ].map((feat, idx) => {
                    const Icon = feat.icon;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs font-semibold">
                        <Icon className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                        <span className="truncate">{feat.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Security Footer */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-blue-200">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-300" /> 256-Bit TLS Encryption
                </span>
                <span className="font-mono">v3.4.0 • SOC-2</span>
              </div>
            </div>

            {/* =================================================== */}
            {/* RIGHT FORM CONTAINER (LOGIN / 2FA CHALLENGE)       */}
            {/* =================================================== */}
            <div className="lg:w-7/12 p-8 sm:p-10 flex flex-col justify-between">
              
              <div>
                
                {/* 2FA Challenge Header vs Standard Login Header */}
                {twoFactorStep ? (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => { setTwoFactorStep(false); setTwoFactorCode(''); setError(''); }}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold mb-3 ${
                        isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                    </button>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold">Two-Factor Authentication</h2>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {useBackupCode 
                            ? 'Enter one of your 8-digit emergency recovery backup codes' 
                            : 'Enter the 6-digit security code from your Authenticator app'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        Sign In to Your Account
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Portal Online
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Access the {tenantDisplayName} administrator workspace.
                    </p>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2.5 animate-in shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* OTP Sent Success Message */}
                {otpSentMsg && (
                  <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{otpSentMsg}</span>
                  </div>
                )}

                {/* --- 2FA CHALLENGE FORM --- */}
                {twoFactorStep ? (
                  <form onSubmit={handleVerify2FA} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                          isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          {useBackupCode ? 'Emergency Backup Code' : '6-Digit Authenticator Code'}
                        </label>
                        {!useBackupCode && (
                          <button
                            type="button"
                            onClick={() => setTwoFactorCode('123456')}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                          >
                            Fill Demo OTP (123456)
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={useBackupCode ? 12 : 8}
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder={useBackupCode ? "e.g. A1B2-C3D4" : "000 000"}
                        autoFocus
                        className={`w-full px-4 py-3 rounded-xl border text-center font-mono text-lg tracking-widest font-bold outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-[#181a20] border-zinc-800 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{ backgroundColor: activeHexColor }}
                      className="w-full py-3 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Verify & Complete Login
                    </button>

                    {/* Alternate 2FA Options */}
                    <div className="pt-3 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleSendEmailOTP}
                        disabled={otpLoading}
                        className="text-blue-500 font-bold hover:underline flex items-center gap-1"
                      >
                        {otpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        Send Code via Email
                      </button>

                      <button
                        type="button"
                        onClick={() => { setUseBackupCode(!useBackupCode); setTwoFactorCode(''); setError(''); }}
                        className={`font-semibold hover:underline ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}
                      >
                        {useBackupCode ? 'Use Authenticator App' : 'Use Backup Recovery Code'}
                      </button>
                    </div>
                  </form>
                ) : (
                  
                  /* --- STANDARD LOGIN FORM --- */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Username or Email Input */}
                    <div>
                      <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                        isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        Official Email or Username <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                        <input
                          type="text"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="admin@tiswatech.com or username"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-[#181a20] border-zinc-800 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-zinc-600' 
                              : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`text-[11px] font-bold uppercase tracking-wider ${
                          isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => { setShowForgotModal(true); setForgotSuccess(''); setError(''); }}
                          className="text-[11px] font-bold text-blue-500 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••••••"
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-[#181a20] border-zinc-800 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-zinc-600' 
                              : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                          Remember email on this device
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ backgroundColor: activeHexColor }}
                      className="w-full py-3 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      Sign In to Workspace
                    </button>
                  </form>
                )}

                {/* --- DEMO / QUICK FILL CREDENTIALS --- */}
                {!twoFactorStep && (
                  <div className="mt-6 pt-5 border-t border-zinc-800/40">
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${
                      isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      Quick Demo Role Switcher
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { role: 'Super Admin', u: 'admin@tiswatech.com', p: 'admin123', color: 'text-blue-500' },
                        { role: 'HR Admin', u: 'hr@tiswatech.com', p: 'password123', color: 'text-purple-500' },
                        { role: 'Recruiter', u: 'recruiter@tiswatech.com', p: 'password123', color: 'text-emerald-500' },
                        { role: 'MFA Demo', u: 'mfa.admin@tiswatech.com', p: 'admin123', color: 'text-amber-500' },
                      ].map((demo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickFill(demo.u, demo.p)}
                          className={`p-2 rounded-xl border text-left text-[11px] font-bold transition-all ${
                            isDarkMode 
                              ? 'bg-[#181a20] border-zinc-800 hover:border-zinc-700 text-zinc-300' 
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 shadow-2xs'
                          }`}
                        >
                          <span className={`block font-black ${demo.color}`}>{demo.role}</span>
                          <span className="font-mono text-[9px] text-zinc-400 opacity-80">{demo.u}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Workspace & Help Info */}
              <div className="pt-6 mt-6 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Domain: <strong className="text-blue-500 font-mono">{window.location.hostname}</strong>
                </span>

                <div className="flex items-center gap-3">
                  <Link to="/company-register" className="text-blue-500 font-bold hover:underline">
                    Create Tenant
                  </Link>
                  <span className="text-zinc-400">•</span>
                  <a href="#support" onClick={() => alert("Need assistance? Contact support@tiswatech.com")} className={`hover:underline ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Need Help?
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* =================================================== */}
      {/* FORGOT PASSWORD MODAL                               */}
      {/* =================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#131722] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="font-bold text-base mb-1 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-500" />
              Reset Workspace Password
            </h3>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Enter your registered corporate email address to receive password recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold mb-4">
                {forgotSuccess}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                    isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                  }`}>
                    Official Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none ${
                      isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      isDarkMode ? 'border-zinc-800 text-zinc-300' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{ backgroundColor: activeHexColor }}
                    className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                  >
                    {forgotLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <div className="text-right pt-2">
                <button
                  onClick={() => setShowForgotModal(false)}
                  style={{ backgroundColor: activeHexColor }}
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
