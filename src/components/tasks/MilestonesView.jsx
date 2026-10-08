import React, { useState, useEffect } from 'react';
import { 
  Target, Calendar, CheckCircle2, Clock, Plus, Loader2, 
  ChevronRight, AlertCircle, Sparkles, Flag, Trash2, Edit2, X 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';
import { StunningSelect, CustomInput, StunningDatePicker } from './StunningSelect';

const MILESTONE_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ACHIEVED', label: 'Achieved' },
  { value: 'MISSED', label: 'Missed' },
];

const MilestonesView = ({ projects = [], onOpenTaskDetail }) => {
  const { isDarkMode } = useTheme();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    due_date: '',
    status: 'PENDING',
  });

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestones();
    }
  }, [selectedProjectId]);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const res = await taskService.getMilestones({ project: selectedProjectId });
      setMilestones(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load milestones', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.name.trim() || !selectedProjectId) return;
    try {
      await taskService.createMilestone({
        ...newMilestone,
        project: selectedProjectId
      });
      setShowAddModal(false);
      setNewMilestone({ name: '', description: '', due_date: '', status: 'PENDING' });
      loadMilestones();
    } catch (err) {
      console.error('Failed to create milestone', err);
    }
  };

  const handleStatusChange = async (mId, newStatus) => {
    try {
      await taskService.updateMilestone(mId, { status: newStatus });
      loadMilestones();
    } catch (err) {
      console.error('Failed to update milestone status', err);
    }
  };

  const projectOptions = projects.map(p => ({ value: p.id, label: p.name }));

  return (
    <div className="space-y-4">
      {/* TOP CONTROLS */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 min-w-[260px]">
          <div className="flex-1">
            <StunningSelect
              label="Project Workspace"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              options={projectOptions}
            />
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> New Milestone
        </button>
      </div>

      {/* MILESTONE LIST */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading project milestones roadmap...</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className={`p-12 rounded-2xl border text-center ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-200'}`}>
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Milestones Defined Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Set key deliverables, sprint markers, and roadmap checkpoints for this project.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white"
          >
            Create First Milestone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map(m => (
            <div 
              key={m.id}
              className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg ${
                isDarkMode ? 'bg-[#121217] border-zinc-800/80 hover:border-zinc-700' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    m.status === 'ACHIEVED' 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' 
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                  }`}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{m.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Due: {m.due_date ? new Date(m.due_date).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>

                {/* Status Switcher with StunningSelect */}
                <div className="min-w-[130px]">
                  <StunningSelect
                    value={m.status}
                    onChange={(e) => handleStatusChange(m.id, e.target.value)}
                    options={MILESTONE_STATUS_OPTIONS}
                  />
                </div>
              </div>

              {m.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {m.description}
                </p>
              )}

              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Milestone Completion</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{m.progress || (m.status === 'ACHIEVED' ? 100 : 0)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 mt-1.5 overflow-hidden">
                <div 
                  className="h-full rounded-full theme-bg-primary transition-all duration-300"
                  style={{ width: `${m.progress || (m.status === 'ACHIEVED' ? 100 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MILESTONE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl ${
            isDarkMode ? 'bg-[#0e0e11] border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">New Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <CustomInput
                label="Milestone Name"
                required
                name="name"
                placeholder="e.g. Beta MVP Release"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
              />
              <StunningDatePicker
                label="Target Due Date"
                name="due_date"
                value={newMilestone.due_date}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, due_date: e.target.value }))}
              />
              <div className="space-y-1.5">
                <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                  isDarkMode ? 'text-[#a1a1aa]' : 'text-[#64748b]'
                }`}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key criteria for milestone sign-off..."
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full p-3.5 rounded-xl border outline-none transition-all text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestonesView;
