import React from 'react';
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
  FileCheck,
  Sliders, 
  BarChart3, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Building,
  X
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

const Sidebar = ({ isOpen, onToggle, isExpanded = true, onToggleExpand }) => {
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const { notifications = [] } = useSelector((state) => state.onboarding || {});

  // High-Contrast Structure
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
        { 
          id: 'tasks', 
          label: 'Tasks & Projects', 
          icon: CheckSquare, 
          path: '/tasks',
          badge: 'Live',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
        },
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
        { 
          id: 'attendance', 
          label: 'Attendance & PTO', 
          icon: Clock, 
          path: '/attendance' 
        },
        { 
          id: 'templates', 
          label: 'Document Templates', 
          icon: FileText,
  FileCheck, 
          path: '/templates' 
        },
        { 
          id: 'ruleengine', 
          label: 'Form Rules & PDF Mapper', 
          icon: Sliders, 
          path: '/rules',
          badge: 'Pro',
          badgeColor: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
        },
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
      ]
    }
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* DESKTOP VERTICAL SIDEBAR                                 */}
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
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r theme-bg-primary shadow-sm" />
                    )}

                    <Icon className={`shrink-0 transition-colors ${
                      isActive 
                        ? 'theme-text-primary' 
                        : isDarkMode ? 'text-[#a1a1aa] group-hover:text-[#ffffff]' : 'text-[#64748b] group-hover:text-[#0f172a]'
                    } ${isExpanded ? 'w-4 h-4 mr-2.5' : 'w-4 h-4'}`} />

                    {isExpanded && (
                      <span className={`truncate flex-1 tracking-tight ${isActive ? 'theme-text-primary' : ''}`}>
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

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onToggle} />
        <div className={`absolute top-0 left-0 bottom-0 w-[270px] shadow-2xl transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDarkMode ? 'bg-[#09090b] text-[#f4f4f5] border-r border-[#27272a]' : 'bg-[#ffffff] text-[#0f172a] border-r border-[#e2e8f0]'}`}>
          
          <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-[#27272a]' : 'border-[#e2e8f0]'}`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded theme-bg-primary text-white flex items-center justify-center font-bold text-xs">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm tracking-tight">Navigation</span>
            </div>
            <button onClick={onToggle} className="p-1.5 rounded-lg text-[#64748b] hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className={`px-2 text-[10px] font-bold tracking-wider uppercase mb-1 ${
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
                        flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all
                        ${isActive 
                          ? 'theme-bg-light theme-text-primary font-bold' 
                          : isDarkMode ? 'text-[#a1a1aa] hover:bg-[#18181b]' : 'text-[#64748b] hover:bg-[#f8fafc]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'theme-text-primary' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
