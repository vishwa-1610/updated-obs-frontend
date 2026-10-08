import React, { useState, useEffect } from 'react';
import { 
  X, FolderKanban, Users, Calendar, DollarSign, Clock, 
  BarChart3, CheckCircle2, AlertCircle, RefreshCw, Plus, Edit2 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';

const ProjectDetailModal = ({ projectId, isOpen, onClose, onEditProject }) => {
  const { isDarkMode } = useTheme();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectInfo();
    } else {
      setProject(null);
      setStats(null);
    }
  }, [isOpen, projectId]);

  const loadProjectInfo = async () => {
    setLoading(true);
    try {
      const [projRes, statsRes] = await Promise.all([
        taskService.getProject(projectId),
        taskService.getProjectStats(projectId).catch(() => ({ data: null }))
      ]);
      setProject(projRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load project details', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDarkMode ? 'bg-[#0e0e11] border-zinc-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* HEADER */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg theme-bg-light theme-text-primary">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">{project?.name || 'Project Details'}</h2>
              <p className="text-xs text-slate-400">
                {project?.client_name ? `Client: ${project.client_name}` : 'Internal Workspace'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {project && (
              <button
                onClick={() => { onClose(); onEditProject(project); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold theme-bg-light theme-text-primary hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Project
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs font-medium text-slate-400">Loading project analytics...</p>
          </div>
        ) : project ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* KPI STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progress</div>
                <div className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400">{project.progress || 0}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 mt-2 overflow-hidden">
                  <div className="h-full theme-bg-primary rounded-full" style={{ width: `${project.progress || 0}%` }} />
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hours Tracked</div>
                <div className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
                  {project.actual_hours || 0} <span className="text-xs font-normal text-slate-400">/ {project.budget_hours || 0} hrs</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Budget Burn</div>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Budget Amount</div>
                <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                  ${project.budget_amount ? Number(project.budget_amount).toLocaleString() : '0'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Allocated Capital</div>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
                <div className="text-lg font-bold mt-1.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  {project.status}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Priority: {project.priority}</div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description & Scope</h3>
              <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                {project.description || 'No detailed description specified.'}
              </p>
            </div>

            {/* DATES & TEAM DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border space-y-3 ${isDarkMode ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Timeline</h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Start Date:</span>
                  <span className="font-semibold">{project.start_date || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Target End Date:</span>
                  <span className="font-semibold">{project.end_date || 'Not set'}</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-3 ${isDarkMode ? 'bg-zinc-900/30 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Leadership & Team</h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Manager:</span>
                  <span className="font-semibold">{project.manager?.email || project.manager_name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Team Size:</span>
                  <span className="font-semibold">{project.team_members?.length || 0} members</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Project details unavailable.</div>
        )}

        {/* FOOTER */}
        <div className={`px-6 py-3 border-t flex justify-end ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
