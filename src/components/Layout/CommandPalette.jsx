import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  UserPlus, 
  CheckSquare, 
  Users, 
  Building2, 
  Briefcase, 
  Clock, 
  FileText, 
  BarChart3, 
  ShieldCheck,
  PlusCircle,
  FileCheck,
  UserCheck,
  X,
  ArrowRight,
  Command
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // open trigger
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'dash', title: 'Dashboard', category: 'Navigation', icon: LayoutDashboard, path: '/' },
    { id: 'onb', title: 'Onboarding Pipeline & I-9', category: 'Navigation', icon: UserPlus, path: '/onboarding' },
    { id: 'tasks', title: 'Task Manager & Sprints', category: 'Navigation', icon: CheckSquare, path: '/tasks' },
    { id: 'emp', title: 'Employees Directory', category: 'Navigation', icon: Users, path: '/employee' },
    { id: 'clients', title: 'Clients & MSAs', category: 'Navigation', icon: Building2, path: '/client' },
    { id: 'sub', title: 'Subcontractors', category: 'Navigation', icon: Briefcase, path: '/subcontractor' },
    { id: 'att', title: 'Attendance & Timesheets', category: 'Navigation', icon: Clock, path: '/attendance' },
    { id: 'temp', title: 'Document Templates', category: 'Navigation', icon: FileText, path: '/templates' },
    { id: 'rep', title: 'Reports & Compliance Analytics', category: 'Navigation', icon: BarChart3, path: '/reports' },
    { id: 'admin', title: 'Settings & Security Admin', category: 'Navigation', icon: ShieldCheck, path: '/admin' },
    { id: 'new-emp', title: 'Add New Employee', category: 'Quick Actions', icon: UserCheck, path: '/employee' },
    { id: 'new-onb', title: 'Initiate Candidate Onboarding', category: 'Quick Actions', icon: UserPlus, path: '/onboarding' },
    { id: 'new-task', title: 'Create Project Task', category: 'Quick Actions', icon: PlusCircle, path: '/tasks' },
  ];

  const filteredActions = actions.filter(action => 
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-150 ${
        isDarkMode 
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-blue-500/5' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/10'
      } backdrop-blur-xl`}>
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions, employees, or forms..."
            autoFocus
            className="w-full bg-transparent outline-none text-sm placeholder-slate-400 font-medium"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <kbd className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredActions.length > 0 ? (
            filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSelect(action.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-all group ${
                    isDarkMode 
                      ? 'hover:bg-slate-800/80 text-slate-300 hover:text-white' 
                      : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-sm truncate">{action.title}</p>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">{action.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching pages or actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation</span>
            <span>•</span>
            <span>Quick Launcher</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">↵</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
