import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Lock, Eye, EyeOff, Mail, Key, CheckCircle, AlertCircle,
  Loader2, Smartphone, ShieldCheck, ArrowLeft,
  Moon, Sun, Shield, FileCheck, Check, Layers
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { setLoginSuccess } from '../../store/authSlice';
import authService from '../../services/authService';
import api from '../../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode, toggleTheme } = useTheme();

  // Form State
  const [formData, setFormData] = useState({
    email: '',
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

  // Derive Tenant Information
  const rawHost = window.location.hostname;
  const isApexIpOrNip = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?:\.nip\.io)?$/.test(rawHost);
  const isSubdomain = rawHost.includes('.') && !rawHost.startsWith('www') && !rawHost.startsWith('127') && !isApexIpOrNip;
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

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/users/login/', {
        username: formData.email,
        email: formData.email,
        password: formData.password
      });

      if (res.data.requires_2fa) {
        setTempToken(res.data.temp_token);
        setTwoFactorStep(true);
        setLoading(false);
        return;
      }

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
      setError(err.response?.data?.error || 'Failed to request password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200 font-sans ${
      isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      
      {/* Top Floating Controls: Dark/Light Mode Switcher */}
      <div className="w-full max-w-4xl flex justify-end mb-3">
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            toggleTheme();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border outline-none focus:outline-none focus-visible:outline-none ring-0 transition-colors cursor-pointer shadow-2xs ${
            isDarkMode 
              ? 'bg-[#18181b] border-zinc-700/80 text-zinc-300 hover:text-white hover:border-zinc-600' 
              : 'bg-white border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
          title="Toggle Light / Dark Mode"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Main Dual-Panel Enterprise Card */}
      <div className={`w-full max-w-4xl rounded-2xl shadow-xl border overflow-hidden transition-all ${
        isDarkMode ? 'bg-[#121217] border-zinc-800 shadow-2xl' : 'bg-white border-slate-200/90 shadow-slate-200/60'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* ======================================================== */}
          {/* LEFT PANEL: AUTH FORM (Clean, Bespoke & Professional)     */}
          {/* ======================================================== */}
          <div className="p-8 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Top Header: Custom OBS Monogram Brand Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-sm tracking-tighter">
                  OBS
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-widest uppercase text-slate-900 dark:text-zinc-100 leading-none">
                    OBS Platform
                  </h2>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    Onboarding & Compliance
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Sign in
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                  to access {tenantDisplayName}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* OTP Sent Notification */}
              {otpSentMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{otpSentMsg}</span>
                </div>
              )}

              {/* 2FA Form or Standard Sign In */}
              {twoFactorStep ? (
                <form onSubmit={handleVerify2FA} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => { setTwoFactorStep(false); setTwoFactorCode(''); setError(''); }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {useBackupCode ? 'Emergency Backup Code' : '6-Digit Authenticator Code'}
                    </label>
                    <input
                      type="text"
                      maxLength={useBackupCode ? 12 : 8}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder={useBackupCode ? "A1B2-C3D4" : "000000"}
                      autoFocus
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-center font-mono text-lg tracking-widest font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:bg-[#1a1b21] dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Verify Code
                  </button>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={handleSendEmailOTP}
                      disabled={otpLoading}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      {otpLoading ? 'Sending...' : 'Send code via email'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUseBackupCode(!useBackupCode); setTwoFactorCode(''); }}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      {useBackupCode ? 'Use App Code' : 'Use Backup Code'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email / Username Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Email address or username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. admin@tiswatech.com"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-[#1a1b21] border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-[#1a1b21] border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-zinc-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  {/* Primary Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Sign In</span>
                  </button>
                </form>
              )}
            </div>

            {/* Enterprise Security Footer */}
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Authorized Personnel Only</span>
              </span>
              <span className="font-mono text-[10px]">
                {window.location.hostname}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL: PRODUCT SHOWCASE & COMPLIANCE HIGHLIGHTS     */}
          {/* ======================================================== */}
          <div className={`p-8 sm:p-10 flex flex-col justify-between border-t md:border-t-0 md:border-l ${
            isDarkMode 
              ? 'border-zinc-800 bg-gradient-to-br from-[#121217] to-[#181820]' 
              : 'border-slate-100 bg-gradient-to-br from-slate-50/70 via-blue-50/30 to-indigo-50/40'
          }`}>
            
            {/* Top Security Pill */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                isDarkMode 
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>SOC-2 & 256-Bit Encrypted</span>
              </span>
              <span className="text-[10px] font-mono opacity-50 text-slate-500">
                v2.0.0
              </span>
            </div>

            {/* Custom SVG Graphic (Enterprise Workforce & Form Verification) */}
            <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
              
              {/* Graphic Composition */}
              <div className="relative w-56 h-40 flex items-center justify-center mb-6">
                
                {/* Modern Laptop Silhouette */}
                <div className={`w-48 h-32 rounded-xl border-4 shadow-xl flex flex-col items-center justify-between p-2 overflow-hidden transition-colors ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-800'
                }`}>
                  <div className="w-full flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-1">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[8px] font-mono opacity-50">I-9 & Tax Portal</span>
                  </div>

                  {/* Document Graphic with Checkmark */}
                  <div className="my-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-zinc-200">
                      Form I-9 & State W-4
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 100% Compliant
                    </span>
                  </div>
                </div>

                {/* Laptop Base Stand */}
                <div className="absolute -bottom-1 w-56 h-2 rounded-b-md bg-slate-700 shadow-sm" />

                {/* Floating Badge Left: Security Shield */}
                <div className="absolute top-2 -left-2 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg -rotate-6">
                  <Shield className="w-4 h-4" />
                </div>

                {/* Floating Badge Right: Multi-State Layers */}
                <div className="absolute top-2 -right-2 w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg rotate-6">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              {/* Showcase Heading */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                Unified Workforce Onboarding
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Streamline employee and subcontractor intake with digital Form I-9, 50-State tax withholding, and audit-ready records.
              </p>
            </div>

            {/* Bottom 3 Highlights */}
            <div className="space-y-2 pt-4 border-t border-slate-200/60 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span className="font-medium text-[11px]">USCIS Form I-9 Section 1 & 2 Verification</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span className="font-medium text-[11px]">Automated 50 US State Withholding Certificates</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span className="font-medium text-[11px]">Multi-tenant isolated data security</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL                                     */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
            isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-base font-bold mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Enter your corporate email address to receive password recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs mb-4">
                {forgotSuccess}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    isDarkMode 
                      ? 'bg-[#1a1b21] border-zinc-700 text-white' 
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {forgotLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Send Link
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full mt-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
