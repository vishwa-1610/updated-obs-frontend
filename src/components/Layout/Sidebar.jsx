import { FEATURES } from '../../config/features';
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  UserPlus, 
  CheckSquare, 
  Users, 
  Building2, 
  Briefcase, 
  Clock, 
  FileText,
  Sliders, 
  BarChart3, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  X,
  Menu,
  User,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';

const Sidebar = ({ isOpen, onToggle, isExpanded = true, onToggleExpand }) => {
  const { isDarkMode, accentColor, changeAccentColor, themeColors = THEME_COLORS } = useTheme();
  const location = useLocation();

  const { notifications = [] } = useSelector((state) => state.onboarding || {});

  // Dynamic Theme Color Calculation
  const activeColorObj = useMemo(() => {
    return (themeColors || []).find(c => c.id === accentColor) || themeColors?.[0] || { color: '#2563eb', bgClass: 'bg-blue-600' };
  }, [accentColor, themeColors]);
  const activeHexColor = activeColorObj?.color || '#2563eb';

  // Navigation Structure
  const navSections = [
    {
      group: 'MAIN WORKSPACE',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard, 
          path: '/',
          badge: null
        },
        { 
          id: 'onboarding', 
          label: 'Onboarding & I-9', 
          icon: UserPlus, 
          path: '/onboarding',
          badge: notifications.length > 0 ? `${notifications.length}` : null,
          badgeColor: 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
        },
        { 
          id: 'jobs', 
          label: 'Jobs & Recruitment', 
          icon: Briefcase, 
          path: '/jobs',
          badge: 'ATS',
          badgeColor: 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
        },
        ...(FEATURES.TASKS ? [{ 
          id: 'tasks', 
          label: 'Tasks & Projects', 
          icon: CheckSquare, 
          path: '/tasks',
          badge: 'Live',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
        }] : []),
      ]
    },
    {
      group: 'PEOPLE & DIRECTORY',
      items: [
        { 
          id: 'employee', 
          label: 'Employees', 
          icon: Users, 
          path: '/employee' 
        },
        { 
          id: 'client', 
          label: 'Clients & MSAs', 
          icon: Building2, 
          path: '/client' 
        },
        { 
          id: 'subcontractor', 
          label: 'Subcontractors', 
          icon: Briefcase, 
          path: '/subcontractor' 
        },
      ]
    },
    {
      group: 'OPERATIONS & COMPLIANCE',
      items: [
        ...(FEATURES.ATTENDANCE ? [{ 
          id: 'attendance', 
          label: 'Attendance & PTO', 
          icon: Clock, 
          path: '/attendance' 
        }] : []),
        { 
          id: 'templates', 
          label: 'Document Templates', 
          icon: FileText,
          path: '/templates' 
        },
        ...(FEATURES.FORM_RULES ? [{ 
          id: 'ruleengine', 
          label: 'Form Rules & PDF Mapper', 
          icon: Sliders, 
          path: '/rules',
          badge: 'Pro',
          badgeColor: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
        }] : []),
        { 
          id: 'reports', 
          label: 'Reports & Analytics', 
          icon: BarChart3, 
          path: '/reports' 
        },
      ]
    },
    {
      group: 'ADMINISTRATION',
      items: [
        { 
          id: 'admin', 
          label: 'Settings & Security', 
          icon: ShieldCheck, 
          path: '/admin' 
        },
        { 
          id: 'profile', 
          label: 'My Profile & Tenant', 
          icon: User, 
          path: '/profile' 
        },
      ]
    }
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP VERTICAL SIDEBAR (MD & ABOVE)                 */}
      {/* ======================================================== */}
      <aside 
        className={`hidden md:flex flex-col fixed top-14 sm:top-16 left-0 bottom-0 z-30 transition-all duration-200 select-none border-r ${
          isDarkMode 
            ? 'bg-[#09090b] border-[#27272a] text-[#f4f4f5]' 
            : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]'
        } ${isExpanded ? 'w-60' : 'w-18'}`}
      >
        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {isExpanded && (
                <p className={`px-2.5 text-[10px] font-bold tracking-wider uppercase mb-1.5 ${
                  isDarkMode ? 'text-[#71717a]' : 'text-[#94a3b8]'
                }`}>
                  {section.group}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === '/'}
                    className={`
                      relative group flex items-center transition-all duration-150 rounded-lg font-semibold text-xs
                      ${isExpanded ? 'px-2.5 py-2' : 'p-2 justify-center'}
                      ${isActive 
                        ? isDarkMode 
                          ? 'theme-bg-light text-white font-bold shadow-xs' 
                          : 'theme-bg-light text-[#0f172a] font-bold shadow-xs' 
                        : isDarkMode 
                          ? 'text-[#a1a1aa] hover:bg-[#18181b]/70 hover:text-[#ffffff]' 
                          : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                      }
                    `}
                  >
                    {/* Dynamic Theme Color Active Bar */}
                    {isActive && (
                      <span 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r shadow-sm"
                        style={{ backgroundColor: activeHexColor }}
                      />
                    )}

                    <Icon 
                      className={`shrink-0 transition-colors ${
                        isActive 
                          ? '' 
                          : isDarkMode ? 'text-[#a1a1aa] group-hover:text-[#ffffff]' : 'text-[#64748b] group-hover:text-[#0f172a]'
                      } ${isExpanded ? 'w-4 h-4 mr-2.5' : 'w-4 h-4'}`}
                      style={isActive ? { color: activeHexColor } : {}}
                    />

                    {isExpanded && (
                      <span 
                        className="truncate flex-1 tracking-tight"
                        style={isActive ? { color: activeHexColor } : {}}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Badge */}
                    {isExpanded && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {!isExpanded && (
                      <div className={`absolute left-full ml-3 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg ${
                        isDarkMode ? 'bg-[#09090b] text-[#ffffff] border border-[#27272a]' : 'bg-[#0f172a] text-[#ffffff]'
                      }`}>
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className={`p-2.5 border-t ${
          isDarkMode ? 'border-[#27272a] bg-[#09090b]' : 'border-[#e2e8f0] bg-[#ffffff]'
        }`}>
          <button
            onClick={onToggleExpand}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all ${
              isDarkMode 
                ? 'hover:bg-[#18181b] text-[#a1a1aa] hover:text-[#ffffff]' 
                : 'hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a]'
            }`}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? (
              <>
                <span className="text-[11px] font-medium">Collapse</span>
                <ChevronLeft className="w-4 h-4" />
              </>
            ) : (
              <div className="w-full flex justify-center">
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE BOTTOM NAVIGATION BAR (FIXED BOTTOM DOCK)       */}
      {/* ======================================================== */}
      <nav 
        aria-label="Mobile Navigation Bar"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t select-none transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-[#09090b]/95 border-[#27272a] text-[#a1a1aa] backdrop-blur-lg' 
            : 'bg-[#ffffff]/95 border-[#e2e8f0] text-[#64748b] backdrop-blur-lg shadow-lg'
        }`}
      >
        <div className="h-full max-w-lg mx-auto grid grid-cols-5 px-1 items-center">
          {/* Item 1: Home / Dashboard */}
          {(() => {
            const isActive = location.pathname === '/';
            return (
              <NavLink
                to="/"
                end
                className="relative flex flex-col items-center justify-center h-full py-1 group transition-transform active:scale-95"
              >
                {isActive && (
                  <span 
                    className="absolute top-0 w-8 h-1 rounded-full shadow-sm"
                    style={{ backgroundColor: activeHexColor, boxShadow: `0 0 8px ${activeHexColor}80` }}
                  />
                )}
                <LayoutDashboard 
                  className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-105 opacity-70 group-hover:opacity-100'}`} 
                  style={isActive ? { color: activeHexColor } : {}}
                />
                <span 
                  className={`text-[10px] tracking-tight mt-1 transition-colors duration-150 ${isActive ? 'font-bold' : 'font-medium opacity-70'}`}
                  style={isActive ? { color: activeHexColor } : {}}
                >
                  Home
                </span>
              </NavLink>
            );
          })()}

          {/* Item 2: Onboarding & I-9 */}
          {(() => {
            const isActive = location.pathname.startsWith('/onboarding');
            const badgeCount = notifications.length;
            return (
              <NavLink
                to="/onboarding"
                className="relative flex flex-col items-center justify-center h-full py-1 group transition-transform active:scale-95"
              >
                {isActive && (
                  <span 
                    className="absolute top-0 w-8 h-1 rounded-full shadow-sm"
                    style={{ backgroundColor: activeHexColor, boxShadow: `0 0 8px ${activeHexColor}80` }}
                  />
                )}
                <div className="relative">
                  <UserPlus 
                    className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-105 opacity-70 group-hover:opacity-100'}`} 
                    style={isActive ? { color: activeHexColor } : {}}
                  />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1 min-w-[15px] h-3.5 rounded-full text-[9px] font-black bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      {badgeCount}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-[10px] tracking-tight mt-1 transition-colors duration-150 ${isActive ? 'font-bold' : 'font-medium opacity-70'}`}
                  style={isActive ? { color: activeHexColor } : {}}
                >
                  Onboard
                </span>
              </NavLink>
            );
          })()}

          {/* Item 3: Employees */}
          {(() => {
            const isActive = location.pathname.startsWith('/employee');
            return (
              <NavLink
                to="/employee"
                className="relative flex flex-col items-center justify-center h-full py-1 group transition-transform active:scale-95"
              >
                {isActive && (
                  <span 
                    className="absolute top-0 w-8 h-1 rounded-full shadow-sm"
                    style={{ backgroundColor: activeHexColor, boxShadow: `0 0 8px ${activeHexColor}80` }}
                  />
                )}
                <Users 
                  className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-105 opacity-70 group-hover:opacity-100'}`} 
                  style={isActive ? { color: activeHexColor } : {}}
                />
                <span 
                  className={`text-[10px] tracking-tight mt-1 transition-colors duration-150 ${isActive ? 'font-bold' : 'font-medium opacity-70'}`}
                  style={isActive ? { color: activeHexColor } : {}}
                >
                  Staff
                </span>
              </NavLink>
            );
          })()}

          {/* Item 4: Clients */}
          {(() => {
            const isActive = location.pathname.startsWith('/client');
            return (
              <NavLink
                to="/client"
                className="relative flex flex-col items-center justify-center h-full py-1 group transition-transform active:scale-95"
              >
                {isActive && (
                  <span 
                    className="absolute top-0 w-8 h-1 rounded-full shadow-sm"
                    style={{ backgroundColor: activeHexColor, boxShadow: `0 0 8px ${activeHexColor}80` }}
                  />
                )}
                <Building2 
                  className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-105 opacity-70 group-hover:opacity-100'}`} 
                  style={isActive ? { color: activeHexColor } : {}}
                />
                <span 
                  className={`text-[10px] tracking-tight mt-1 transition-colors duration-150 ${isActive ? 'font-bold' : 'font-medium opacity-70'}`}
                  style={isActive ? { color: activeHexColor } : {}}
                >
                  Clients
                </span>
              </NavLink>
            );
          })()}

          {/* Item 5: More / Menu Drawer */}
          {(() => {
            const isPrimary = ['/', '/onboarding', '/employee', '/client'].some(p => 
              p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
            );
            const isMoreActive = isOpen || !isPrimary;
            return (
              <button
                type="button"
                onClick={onToggle}
                className="relative flex flex-col items-center justify-center h-full py-1 group transition-transform active:scale-95 cursor-pointer"
                aria-label="Open Full Navigation Drawer"
              >
                {isMoreActive && (
                  <span 
                    className="absolute top-0 w-8 h-1 rounded-full shadow-sm"
                    style={{ backgroundColor: activeHexColor, boxShadow: `0 0 8px ${activeHexColor}80` }}
                  />
                )}
                <div className="relative">
                  <Menu 
                    className={`w-5 h-5 transition-transform duration-150 ${isMoreActive ? 'scale-110' : 'group-hover:scale-105 opacity-70 group-hover:opacity-100'}`} 
                    style={isMoreActive ? { color: activeHexColor } : {}}
                  />
                  {!isPrimary && (
                    <span 
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#09090b]"
                      style={{ backgroundColor: activeHexColor }}
                    />
                  )}
                </div>
                <span 
                  className={`text-[10px] tracking-tight mt-1 transition-colors duration-150 ${isMoreActive ? 'font-bold' : 'font-medium opacity-70'}`}
                  style={isMoreActive ? { color: activeHexColor } : {}}
                >
                  More
                </span>
              </button>
            );
          })()}
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 3. MOBILE FULL DRAWER SHEET                               */}
      {/* ======================================================== */}
      <div className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onToggle} />
        <div className={`absolute top-0 left-0 bottom-0 w-[82vw] max-w-[300px] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDarkMode ? 'bg-[#09090b] text-[#f4f4f5] border-r border-[#27272a]' : 'bg-[#ffffff] text-[#0f172a] border-r border-[#e2e8f0]'}`}>
          
          <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-[#27272a]' : 'border-[#e2e8f0]'}`}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-sm"
                style={{ backgroundColor: activeHexColor }}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">Suite Navigation</span>
                <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Workspace & Modules</span>
              </div>
            </div>
            <button 
              onClick={onToggle} 
              className={`p-1.5 rounded-xl transition-colors ${
                isDarkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              aria-label="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className={`px-2.5 text-[10px] font-bold tracking-wider uppercase mb-1.5 ${
                  isDarkMode ? 'text-[#71717a]' : 'text-[#94a3b8]'
                }`}>
                  {section.group}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/' 
                    ? location.pathname === '/' 
                    : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onToggle}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                        ${isActive 
                          ? isDarkMode
                            ? 'bg-zinc-800/80 font-bold shadow-xs'
                            : 'bg-slate-100 font-bold shadow-xs'
                          : isDarkMode ? 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#ffffff]' : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon 
                          className="w-4 h-4 shrink-0" 
                          style={isActive ? { color: activeHexColor } : {}}
                        />
                        <span 
                          className="truncate"
                          style={isActive ? { color: activeHexColor } : {}}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className={`p-3 border-t text-center ${isDarkMode ? 'border-[#27272a] bg-[#09090b]' : 'border-[#e2e8f0] bg-[#ffffff]'}`}>
            {/* Theme Accent Color in Mobile Drawer */}
            <div className="mb-3 px-1 text-left">
              <span className={`text-[10px] font-bold tracking-wider uppercase block mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Theme Accent Color
              </span>
              <div className="flex items-center justify-between gap-1">
                {themeColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => changeAccentColor(color.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                      accentColor === color.id ? 'ring-2 ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  >
                    {accentColor === color.id && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onToggle}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                isDarkMode 
                  ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60' 
                  : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Close Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
