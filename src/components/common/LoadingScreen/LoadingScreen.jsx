import React, { useMemo } from 'react';
import { Sparkles, Layers, ShieldCheck, RefreshCw, Loader2, Users, FileText, CheckCircle2 } from 'lucide-react';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

/**
 * 1. FULL PAGE / ROUTE LOADER
 * An ultra-modern, aesthetic loading screen with pulsing orbital glows, 
 * dynamic brand accent reactivity, and smooth animations.
 */
export const PageLoader = ({ 
  message = "Loading workspace data...", 
  subMessage = "Synchronizing real-time records and compliance modules",
  showSkeleton = false,
  skeletonType = "table" // "table" | "dashboard" | "cards"
}) => {
  const { isDarkMode, accentColor, themeColors = THEME_COLORS } = useTheme();

  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);

  const activeHex = activeColorObj.color;

  return (
    <div className={`relative w-full min-h-[65vh] flex flex-col items-center justify-center p-6 transition-all duration-300 ${
      isDarkMode ? 'text-zinc-100' : 'text-slate-800'
    }`}>
      
      {/* Background Soft Glow Aura */}
      <div 
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none animate-pulse"
        style={{ backgroundColor: activeHex }}
      />

      {/* Main Animated Loader Core */}
      <div className="relative flex flex-col items-center justify-center z-10 space-y-6">
        
        {/* Multi-Ring Orbital Spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          
          {/* Outer Ring */}
          <div 
            className="absolute inset-0 rounded-full border-3 border-transparent border-t-current animate-spin opacity-80"
            style={{ 
              color: activeHex,
              animationDuration: '1.2s'
            }}
          />

          {/* Middle Counter-Spinning Ring */}
          <div 
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-current opacity-50"
            style={{ 
              color: activeHex,
              animation: 'spin 1.8s linear infinite reverse'
            }}
          />

          {/* Center Glowing Hub with Icon */}
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform animate-bounce"
            style={{ 
              backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
              border: `1.5px solid ${isDarkMode ? '#27272a' : '#e2e8f0'}`,
              boxShadow: `0 8px 24px -4px ${activeHex}40`
            }}
          >
            <Sparkles 
              className="w-5 h-5 animate-pulse" 
              style={{ color: activeHex }} 
            />
          </div>
        </div>

        {/* Text Status & Progress Indicator */}
        <div className="text-center space-y-1.5 max-w-sm">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-sm sm:text-base font-bold tracking-tight">
              {message}
            </h3>
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" style={{ animationDelay: '200ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" style={{ animationDelay: '400ms' }} />
            </span>
          </div>

          {subMessage && (
            <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {subMessage}
            </p>
          )}
        </div>

        {/* Live System Badge */}
        <div className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-2 shadow-2xs ${
          isDarkMode 
            ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' 
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Multi-Tenant System Connected</span>
        </div>

      </div>

      {/* Optional Skeleton Preview Overlay behind */}
      {showSkeleton && (
        <div className="w-full max-w-6xl mt-8 opacity-25 pointer-events-none select-none">
          <ScreenSkeleton type={skeletonType} isDarkMode={isDarkMode} />
        </div>
      )}

    </div>
  );
};

/**
 * 2. REUSABLE SCREEN SKELETON PLACEHOLDER
 * Beautiful shimmering placeholders for high-fidelity loading states
 */
export const ScreenSkeleton = ({ type = "table", isDarkMode = false }) => {
  const shimmerClass = isDarkMode ? 'bg-zinc-800/70' : 'bg-slate-200';
  const cardBg = isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200';

  return (
    <div className="w-full space-y-6 animate-pulse">
      
      {/* Header Bar Skeleton */}
      <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div className="space-y-2">
          <div className={`h-7 w-48 rounded-xl ${shimmerClass}`} />
          <div className={`h-4 w-72 rounded-lg ${shimmerClass}`} />
        </div>
        <div className="flex gap-2.5">
          <div className={`h-10 w-28 rounded-xl ${shimmerClass}`} />
          <div className={`h-10 w-32 rounded-xl ${shimmerClass}`} />
        </div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-5 rounded-2xl border ${cardBg} space-y-3`}>
            <div className="flex justify-between items-center">
              <div className={`h-3.5 w-24 rounded-md ${shimmerClass}`} />
              <div className={`w-8 h-8 rounded-xl ${shimmerClass}`} />
            </div>
            <div className={`h-8 w-20 rounded-xl ${shimmerClass}`} />
            <div className={`h-3 w-32 rounded-md ${shimmerClass}`} />
          </div>
        ))}
      </div>

      {/* Main Table / Grid Skeleton */}
      <div className={`p-6 rounded-3xl border ${cardBg} space-y-4`}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className={`h-9 w-64 rounded-xl ${shimmerClass}`} />
          <div className={`h-9 w-40 rounded-xl ${shimmerClass}`} />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
              <div className={`w-10 h-10 rounded-2xl shrink-0 ${shimmerClass}`} />
              <div className="flex-1 space-y-1.5">
                <div className={`h-4 w-40 rounded-md ${shimmerClass}`} />
                <div className={`h-3 w-60 rounded-md ${shimmerClass}`} />
              </div>
              <div className={`h-6 w-24 rounded-full ${shimmerClass} hidden sm:block`} />
              <div className={`h-8 w-20 rounded-xl ${shimmerClass}`} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

/**
 * 3. COMPACT INLINE LOADER (For Modals & Widgets)
 */
export const InlineLoader = ({ text = "Processing..." }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="flex items-center justify-center gap-2.5 py-8 text-xs font-bold">
      <Loader2 className="w-5 h-5 animate-spin theme-text-primary" />
      <span className={isDarkMode ? 'text-zinc-300' : 'text-slate-700'}>{text}</span>
    </div>
  );
};

export default PageLoader;
