import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, Sparkles, Building2, UserCheck, 
  ArrowRight, ShieldCheck, Heart, FileCheck, Landmark, Check
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';

const OnboardingCompletePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const { candidateInfo, workflow } = useOnboarding();

  const cardClass = `p-8 sm:p-10 rounded-3xl border text-center transition-all ${
    isDarkMode ? 'bg-[#131722] border-zinc-800 shadow-2xl' : 'bg-white border-slate-200/80 shadow-xl shadow-slate-200/50'
  }`;

  return (
    <div className="w-full max-w-2xl mx-auto my-auto py-8 animate-in fade-in">
      <div className={cardClass}>
        {/* Animated Celebration Icon */}
        <div className="relative mb-6 inline-block">
          <div 
            className="absolute inset-0 blur-2xl opacity-40 rounded-full animate-pulse"
            style={{ backgroundColor: activeHexColor }}
          />
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 relative z-10 shadow-xl shadow-emerald-500/20">
            <Check size={44} strokeWidth={3} />
          </div>
        </div>

        <div className="mb-2">
          <span 
            className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5"
            style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
          >
            <Sparkles size={13} /> Onboarding Complete
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-3">
          You're All Set{candidateInfo?.first_name ? `, ${candidateInfo.first_name}` : ''}!
        </h1>

        <p className={`text-sm leading-relaxed max-w-md mx-auto mb-8 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
          All required employee documentation, tax withholding certificates, and direct deposit details have been securely recorded for <strong>{candidateInfo?.client_name || 'Enterprise Workforce'}</strong>.
        </p>

        {/* Completed Steps Summary List */}
        <div className={`p-5 rounded-2xl border text-left mb-8 space-y-3 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Verified Documents & Profile</h3>
          
          {workflow.map((step, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>{step.step_name}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
                Completed
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.close()}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl border text-xs font-bold transition-all ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Close Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCompletePage;
