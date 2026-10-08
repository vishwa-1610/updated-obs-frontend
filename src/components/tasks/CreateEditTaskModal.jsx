import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, Flag, Tag, User, Briefcase, Plus, Loader2, 
  RefreshCw 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';
import api from '../../services/api';
import { StunningSelect, CustomInput, StunningDatePicker } from './StunningSelect';

const TASK_TYPES = [
  { value: 'TASK', label: 'Task' },
  { value: 'FEATURE', label: 'Feature' },
  { value: 'BUG', label: 'Bug' },
  { value: 'IMPROVEMENT', label: 'Improvement' },
  { value: 'EPIC', label: 'Epic' },
  { value: 'SUBTASK', label: 'Subtask' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const STATUSES = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const RECURRENCE_CHOICES = [
  { value: 'NONE', label: 'None (One-Off)' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
];

const CreateEditTaskModal = ({ isOpen, onClose, onTaskSaved, initialData = null, defaultProjectId = null }) => {
  const { isDarkMode } = useTheme();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: defaultProjectId || '',
    milestone: '',
    task_type: 'TASK',
    priority: 'MEDIUM',
    status: 'TODO',
    assignee: '',
    department: '',
    estimated_hours: 0,
    is_billable: true,
    due_date: '',
    start_date: '',
    is_recurring: false,
    recurrence_interval: 'NONE',
    tags: [],
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          project: initialData.project?.id || initialData.project || defaultProjectId || '',
          milestone: initialData.milestone?.id || initialData.milestone || '',
          task_type: initialData.task_type || 'TASK',
          priority: initialData.priority || 'MEDIUM',
          status: initialData.status || 'TODO',
          assignee: initialData.assignee?.id || initialData.assignee || '',
          department: initialData.department || '',
          estimated_hours: initialData.estimated_hours || 0,
          is_billable: initialData.is_billable !== undefined ? initialData.is_billable : true,
          due_date: initialData.due_date || '',
          start_date: initialData.start_date || '',
          is_recurring: initialData.is_recurring || false,
          recurrence_interval: initialData.recurrence_interval || 'NONE',
          tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        });
      } else {
        setFormData({
          title: '',
          description: '',
          project: defaultProjectId || '',
          milestone: '',
          task_type: 'TASK',
          priority: 'MEDIUM',
          status: 'TODO',
          assignee: '',
          department: '',
          estimated_hours: 0,
          is_billable: true,
          due_date: '',
          start_date: new Date().toISOString().split('T')[0],
          is_recurring: false,
          recurrence_interval: 'NONE',
          tags: [],
        });
      }
    }
  }, [isOpen, initialData, defaultProjectId]);

  const loadDropdowns = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        taskService.getProjects().catch(() => ({ data: [] })),
        api.get('/users/').catch(() => ({ data: [] }))
      ]);
      const projs = projRes.data?.results || projRes.data || [];
      setProjects(projs);
      const userList = usersRes.data?.results || usersRes.data || [];
      setUsers(userList);
    } catch (err) {
      console.error('Error loading dropdowns', err);
    }
  };

  const handleProjectChange = async (projId) => {
    setFormData(prev => ({ ...prev, project: projId, milestone: '' }));
    if (projId) {
      try {
        const res = await taskService.getMilestones({ project: projId });
        setMilestones(res.data?.results || res.data || []);
      } catch (err) {
        setMilestones([]);
      }
    } else {
      setMilestones([]);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && !formData.tags.includes(val)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project) {
      alert('Please fill in Task Title and select a Project');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        assignee: formData.assignee || null,
        milestone: formData.milestone || null,
        estimated_hours: parseFloat(formData.estimated_hours) || 0,
        is_recurring: formData.recurrence_interval !== 'NONE',
      };

      if (initialData?.id) {
        await taskService.updateTask(initialData.id, payload);
      } else {
        await taskService.createTask(payload);
      }

      if (onTaskSaved) onTaskSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save task', err);
      alert('Error saving task. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const projectOptions = projects.map(p => ({ value: p.id, label: p.name }));
  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map(u => ({ value: u.id, label: u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email }))
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDarkMode ? 'bg-[#0e0e11] border-zinc-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* HEADER */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl theme-bg-light theme-text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {initialData ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-xs text-slate-400">
                {initialData ? `Update task #${initialData.id}` : 'Add a task to sprint or backlog'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors ${
              isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TOP ROW: PROJECT & TITLE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StunningSelect
              label="Project"
              required
              value={formData.project}
              onChange={(e) => handleProjectChange(e.target.value)}
              options={projectOptions}
              placeholder="Select Project"
            />

            <div className="md:col-span-2">
              <CustomInput
                label="Task Title"
                required
                name="title"
                placeholder="e.g., Implement OAuth2 integration"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
          </div>

          {/* 4-COLUMN ATTRIBUTES ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StunningSelect
              label="Type"
              value={formData.task_type}
              onChange={(e) => setFormData(prev => ({ ...prev, task_type: e.target.value }))}
              options={TASK_TYPES}
            />

            <StunningSelect
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              options={PRIORITIES}
            />

            <StunningSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              options={STATUSES}
            />

            <StunningSelect
              label="Assignee"
              value={formData.assignee}
              onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
              options={userOptions}
              placeholder="Unassigned"
            />
          </div>

          {/* DATES & EFFORT ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StunningDatePicker
              label="Start Date"
              name="start_date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            />

            <StunningDatePicker
              label="Due Date"
              name="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />

            <CustomInput
              label="Estimated Hours"
              type="number"
              step="0.5"
              min="0"
              name="estimated_hours"
              value={formData.estimated_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
            />

            <StunningSelect
              label="Recurrence Schedule"
              value={formData.recurrence_interval}
              onChange={(e) => setFormData(prev => ({ ...prev, recurrence_interval: e.target.value }))}
              options={RECURRENCE_CHOICES}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDarkMode ? 'text-[#a1a1aa]' : 'text-[#64748b]'
            }`}>
              Description & Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Outline acceptance criteria, specifications, or blockers..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full p-4 rounded-xl border outline-none transition-all text-xs sm:text-sm font-medium leading-relaxed ${
                isDarkMode 
                  ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-[#52525b]' 
                  : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-[#94a3b8] shadow-xs'
              }`}
            />
          </div>

          {/* TAGS & BILLABLE ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 space-y-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-wider block ${
                isDarkMode ? 'text-[#a1a1aa]' : 'text-[#64748b]'
              }`}>
                Tags (Press Enter or comma to add)
              </label>
              <div className={`p-2.5 rounded-xl border flex flex-wrap items-center gap-1.5 min-h-[46px] ${
                isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-[#ffffff] border-[#e2e8f0]'
              }`}>
                {formData.tags.map((t, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                  >
                    #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="e.g. backend, ui..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 min-w-[120px] bg-transparent text-xs sm:text-sm outline-none px-2 py-1 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_billable}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_billable: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  Billable Task
                </span>
              </label>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold theme-bg-primary text-white hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {initialData ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEditTaskModal;
