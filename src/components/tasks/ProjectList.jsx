import React, { useState } from 'react';
import { 
  FolderKanban, Plus, Users, Calendar, DollarSign, Clock, 
  BarChart3, MoreVertical, Edit2, Trash2, Eye, Search, 
  LayoutGrid, List, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';
import { StunningSelect } from './StunningSelect';

const STATUS_PILLS = {
  PLANNING: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200',
  ACTIVE: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200',
  ON_HOLD: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200',
  COMPLETED: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200',
  CANCELLED: 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200',
};

const ProjectList = ({ 
  projects = [], 
  onProjectUpdated, 
  onOpenCreateProject, 
  onOpenProjectDetail,
  onOpenEditProject 
}) => {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState('grid'); // grid, table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredProjects = projects.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchClient = (p.client_name || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchClient) return false;
    }
    return true;
  });

  const handleDeleteProject = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await taskService.deleteProject(id);
        if (onProjectUpdated) onProjectUpdated();
      } catch (err) {
        console.error('Failed to delete project', err);
      }
    }
  };

  const statusFilterOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PLANNING', label: 'Planning' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="space-y-4">
      
      {/* ACTION & SEARCH BAR */}
      <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-medium ${
                isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5] placeholder:text-[#52525b]' : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a] placeholder:text-[#94a3b8] shadow-xs'
              }`}
            />
          </div>

          <div className="min-w-[160px]">
            <StunningSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusFilterOptions}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / Table Toggle */}
          <div className={`flex rounded-xl border p-0.5 ${isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-slate-100'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'theme-bg-primary text-white shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'theme-bg-primary text-white shadow-sm' : 'text-slate-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onOpenCreateProject()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(proj => {
            const progress = proj.progress || 0;
            return (
              <div
                key={proj.id}
                className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
                  isDarkMode 
                    ? 'bg-[#121217] border-zinc-800/80 hover:border-zinc-700 text-slate-100' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                }`}
              >
                <div>
                  {/* Top Bar: Client & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300">
                      {proj.client_name || 'Internal'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_PILLS[proj.status] || 'bg-slate-100'}`}>
                      {proj.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 
                    onClick={() => onOpenProjectDetail(proj.id)}
                    className="text-base font-bold cursor-pointer hover:underline truncate"
                  >
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400 text-[11px]">Sprint Progress</span>
                      <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full theme-bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {/* Effort & Budget Gauges */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Hours</div>
                      <div className="font-semibold mt-0.5">
                        {proj.actual_hours || 0} / {proj.budget_hours || 0}h
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Budget</div>
                      <div className="font-semibold mt-0.5 text-emerald-600 dark:text-emerald-400">
                        ${proj.budget_amount ? Number(proj.budget_amount).toLocaleString() : '0'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Manager & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{proj.manager_name || proj.manager?.email || 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenProjectDetail(proj.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenEditProject(proj)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-xs text-left">
            <thead className={`text-[11px] font-bold text-slate-400 uppercase ${isDarkMode ? 'bg-zinc-900/40' : 'bg-slate-50'}`}>
              <tr>
                <th className="px-5 py-3">Project Name</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Hours Tracked</th>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredProjects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-slate-100 cursor-pointer" onClick={() => onOpenProjectDetail(proj.id)}>
                    {proj.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{proj.client_name || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_PILLS[proj.status] || 'bg-slate-100'}`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold">{proj.progress || 0}%</td>
                  <td className="px-5 py-3 text-slate-500">{proj.actual_hours || 0} / {proj.budget_hours || 0}h</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">${proj.budget_amount || 0}</td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <button onClick={() => onOpenProjectDetail(proj.id)} className="p-1 rounded text-slate-400 hover:text-blue-500">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onOpenEditProject(proj)} className="p-1 rounded text-slate-400 hover:text-amber-500">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteProject(proj.id, proj.name)} className="p-1 rounded text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default ProjectList;
