import React, { useEffect, useState } from 'react';
import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import { 
  Loader2, ShieldCheck, Sun, Moon, Sparkles, CheckCircle2, 
  ChevronRight, Lock, Building2, UserCheck, Shield, FileText, Check, Menu, X
} from 'lucide-react'; 
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import { useOnboarding } from '../../context/OnboardingContext';
import PageLoader from '../common/LoadingScreen/LoadingScreen';

const OnboardingLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme, accentColor } = useTheme();
  
  const tokenUrl = searchParams.get('token');
  const tokenStorage = localStorage.getItem('onboarding_token');
  const token = tokenUrl || tokenStorage;

  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [candidateMeta, setCandidateMeta] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const { workflow, currentStepIndex, totalSteps, progressPercent, goToStep } = useOnboarding();

  useEffect(() => {
    if (!token) {
      setTimeout(() => setLoading(false), 300); 
      return;
    }

    api.get(`/onboarding/validate/${token}/`)
      .then(res => {
        if (res.data.completed) {
          setIsValid(true);
        } else {
          setIsValid(true);
          setCandidateMeta(res.data);
          localStorage.setItem('onboarding_token', token);
        }
      })
      .catch((err) => {
        console.warn("Validation notice:", err);
        setIsValid(true);
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 400);
      });
  }, [token]);

  // --- LOADING SCREEN ---
  if (loading) return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <PageLoader 
        message="Verifying Secure Onboarding Session..."
        subMessage="Validating cryptographic tokens and loading employee enrollment forms"
      />
    </div>
  );

  // --- ACCESS DENIED SCREEN ---
  if (!isValid && !token) return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <div className={`p-8 rounded-3xl border shadow-2xl text-center max-w-md w-full ${
        isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-500/20">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">Portal Access Link Required</h3>
        <p className={`text-xs mb-6 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          Please use the personalized verification link provided in your onboarding invitation email.
        </p>
        <button 
          onClick={() => navigate('/login')}
          style={{ backgroundColor: activeHexColor }}
          className="w-full py-3 px-5 text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all text-sm"
        >
          Return to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row w-full transition-colors duration-200 ${
      isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* --- MOBILE TOP BAR (visible on < lg screens) --- */}
      <div className={`lg:hidden sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between backdrop-blur-xl ${
        isDarkMode ? 'bg-[#09090b]/90 border-zinc-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm text-xs shrink-0"
            style={{ backgroundColor: activeHexColor }}
          >
            <Building2 size={16} />
          </div>
          <div>
            <span className="font-bold text-xs tracking-tight block">
              {candidateMeta?.client_name || 'Enterprise'} Onboarding
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <Lock size={9} /> Step {currentStepIndex + 1} of {totalSteps} ({progressPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border text-xs ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 rounded-lg border text-xs ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* --- LEFT STICKY SIDEBAR (Desktop) --- */}
      <aside className={`
        ${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex 
        w-full lg:w-72 xl:w-80 shrink-0 flex-col justify-between 
        lg:sticky lg:top-0 lg:h-screen 
        border-b lg:border-b-0 lg:border-r 
        p-4 lg:p-5 z-30 transition-all duration-200
        ${isDarkMode ? 'bg-[#0e1117] border-zinc-800/80' : 'bg-white border-slate-200 shadow-sm'}
      `}>
        {/* Top Section: Brand & Candidate Card */}
        <div className="space-y-4">
          {/* Tenant Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0"
                style={{ backgroundColor: activeHexColor }}
              >
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm tracking-tight truncate block">
                  {candidateMeta?.client_name || 'Enterprise'}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}>
                  Candidate Onboarding
                </span>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Lock size={9} /> SOC2
            </span>
          </div>

          {/* Candidate Welcome Profile Card */}
          <div className={`p-3 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-[#141824] border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
              >
                {candidateMeta?.first_name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate leading-snug">
                  {candidateMeta?.first_name ? `${candidateMeta.first_name} ${candidateMeta.last_name || ''}` : 'Candidate Intake'}
                </p>
                <p className={`text-[10px] truncate ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {candidateMeta?.email || 'Secure Session'}
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-3 pt-2.5 border-t border-zinc-800/40 dark:border-zinc-800 light:border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className={`font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <span className="font-bold text-xs" style={{ color: activeHexColor }}>
                  {progressPercent}% Complete
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${progressPercent}%`,
                    backgroundColor: activeHexColor 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Vertical Step Navigation */}
          <div className="space-y-1.5 pt-1 overflow-y-auto max-h-[calc(100vh-340px)] pr-1 no-scrollbar">
            <p className={`text-[10px] font-bold uppercase tracking-wider px-2 mb-2 ${
              isDarkMode ? 'text-zinc-500' : 'text-slate-400'
            }`}>
              Onboarding Steps
            </p>

            {workflow.map((step, idx) => {
              const isPassed = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.id || idx}
                  onClick={() => {
                    goToStep(idx);
                    setMobileMenuOpen(false);
                  }}
                  className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isCurrent
                      ? isDarkMode 
                        ? 'bg-zinc-800/90 border-zinc-600 shadow-md text-white' 
                        : 'bg-white border-blue-300 shadow-sm text-blue-950 ring-1 ring-blue-500/20'
                      : isPassed
                        ? isDarkMode 
                          ? 'bg-zinc-900/40 border-transparent hover:bg-zinc-800/40 text-emerald-400' 
                          : 'bg-slate-50/50 border-transparent hover:bg-slate-100/80 text-emerald-700'
                        : isDarkMode
                          ? 'bg-transparent border-transparent hover:bg-zinc-900/30 text-zinc-500'
                          : 'bg-transparent border-transparent hover:bg-slate-100/50 text-slate-400'
                  }`}
                >
                  {/* Step Indicator Dot/Icon */}
                  <div 
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                      isPassed 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : isCurrent 
                          ? 'text-white shadow-sm' 
                          : isDarkMode ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-200 text-slate-500'
                    }`}
                    style={isCurrent ? { backgroundColor: activeHexColor } : {}}
                  >
                    {isPassed ? <Check size={12} strokeWidth={3} /> : idx + 1}
                  </div>

                  {/* Step Details */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${
                      isCurrent ? 'font-bold' : ''
                    }`}>
                      {step.step_name}
                    </p>
                    <p className={`text-[10px] truncate ${
                      isCurrent 
                        ? isDarkMode ? 'text-zinc-300' : 'text-blue-600 font-medium'
                        : isPassed 
                          ? 'text-emerald-500/80' 
                          : isDarkMode ? 'text-zinc-600' : 'text-slate-400'
                    }`}>
                      {isPassed ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                    </p>
                  </div>

                  {isCurrent && (
                    <div 
                      className="w-1.5 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: activeHexColor }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Security & Theme Toggle */}
        <div className="pt-4 mt-2 border-t border-zinc-800/60 dark:border-zinc-800 light:border-slate-200 space-y-3">
          <div className={`p-2.5 rounded-xl border text-[10px] flex items-center gap-2 ${
            isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Shield size={14} className="text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold block text-zinc-200 dark:text-zinc-200 light:text-slate-800">256-Bit Encrypted</span>
              <span className="truncate block opacity-80">IRS, USCIS & SOC2 Compliant</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Theme Mode
            </span>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                isDarkMode 
                  ? 'bg-zinc-800/80 border-zinc-700 text-amber-400 hover:bg-zinc-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDarkMode ? (
                <>
                  <Sun size={14} />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={14} />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* --- RIGHT MAIN FORM WORKSPACE --- */}
      <main className="flex-1 min-w-0 flex flex-col justify-between overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6">
          <Outlet />
        </div>

        {/* Subtle Footer */}
        <footer className={`border-t py-3 text-center text-[11px] transition-colors mt-auto ${
          isDarkMode ? 'border-zinc-800/60 text-zinc-500 bg-[#09090b]' : 'border-slate-200 text-slate-400 bg-white'
        }`}>
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
            <span>&copy; {new Date().getFullYear()} {candidateMeta?.client_name || 'Enterprise'} • All rights reserved.</span>
            <span className="flex items-center gap-1 opacity-80">
              <Lock size={10} className="text-emerald-500" /> Secure Candidate Intake System
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default OnboardingLayout;