import React, { useState, useEffect } from 'react';
import { 
  X, FolderKanban, Briefcase, Calendar, DollarSign, Clock, 
  Users, Loader2 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { taskService } from '../../services/taskService';
import { clientService } from '../../services/clientService';
import api from '../../services/api';
import { StunningSelect, CustomInput, StunningDatePicker } from './StunningSelect';

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const STATUSES = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const CreateEditProjectModal = ({ isOpen, onClose, onProjectSaved, initialData = null }) => {
  const { isDarkMode } = useTheme();
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    manager: '',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget_hours: 0,
    budget_amount: 0,
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          client: initialData.client?.id || initialData.client || '',
          manager: initialData.manager?.id || initialData.manager || '',
          priority: initialData.priority || 'MEDIUM',
          status: initialData.status || 'ACTIVE',
          start_date: initialData.start_date || '',
          end_date: initialData.end_date || '',
          budget_hours: initialData.budget_hours || 0,
          budget_amount: initialData.budget_amount || 0,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          client: '',
          manager: '',
          priority: 'MEDIUM',
          status: 'ACTIVE',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          budget_hours: 0,
          budget_amount: 0,
        });
      }
    }
  }, [isOpen, initialData]);

  const loadDropdowns = async () => {
    try {
      const [cliRes, userRes] = await Promise.all([
        clientService.getClients().catch(() => ({ data: [] })),
        api.get('/users/').catch(() => ({ data: [] }))
      ]);
      setClients(cliRes.data?.results || cliRes.data || []);
      setUsers(userRes.data?.results || userRes.data || []);
    } catch (err) {
      console.error('Failed to load dropdowns', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        client: formData.client || null,
        manager: formData.manager || null,
        budget_hours: parseFloat(formData.budget_hours) || 0,
        budget_amount: parseFloat(formData.budget_amount) || 0,
      };

      if (initialData?.id) {
        await taskService.updateProject(initialData.id, payload);
      } else {
        await taskService.createProject(payload);
      }

      if (onProjectSaved) onProjectSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save project', err);
      alert('Error saving project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const clientOptions = [
    { value: '', label: 'Internal / No Client' },
    ...clients.map(c => ({ value: c.id, label: c.name || c.company_name }))
  ];

  const managerOptions = [
    { value: '', label: 'Select Manager' },
    ...users.map(u => ({ value: u.id, label: u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email }))
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDarkMode ? 'bg-[#0e0e11] border-zinc-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* HEADER */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl theme-bg-light theme-text-primary">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {initialData ? 'Edit Workspace Project' : 'Create New Project'}
              </h2>
              <p className="text-xs text-slate-400">
                {initialData ? `Update settings for project #${initialData.id}` : 'Set up a new collaborative project workspace'}
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
          
          {/* PROJECT NAME & CLIENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CustomInput
              label="Project Name"
              required
              name="name"
              placeholder="e.g. Enterprise CRM Redesign"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />

            <StunningSelect
              label="Client (Optional)"
              value={formData.client}
              onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
              options={clientOptions}
              placeholder="Internal / No Client"
            />
          </div>

          {/* MANAGER & STATUS & PRIORITY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StunningSelect
              label="Project Manager"
              value={formData.manager}
              onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
              options={managerOptions}
              placeholder="Select Manager"
            />

            <StunningSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              options={STATUSES}
            />

            <StunningSelect
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              options={PRIORITIES}
            />
          </div>

          {/* DATES & BUDGET */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StunningDatePicker
              label="Start Date"
              name="start_date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            />

            <StunningDatePicker
              label="End Date"
              name="end_date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            />

            <CustomInput
              label="Budget Hours"
              type="number"
              step="1"
              min="0"
              name="budget_hours"
              value={formData.budget_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, budget_hours: e.target.value }))}
            />

            <CustomInput
              label="Budget ($)"
              type="number"
              step="100"
              min="0"
              name="budget_amount"
              value={formData.budget_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, budget_amount: e.target.value }))}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDarkMode ? 'text-[#a1a1aa]' : 'text-[#64748b]'
            }`}>
              Project Description & Goals
            </label>
            <textarea
              rows={3}
              placeholder="Scope, objectives, deliverables, and requirements..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full p-4 rounded-xl border outline-none transition-all text-xs sm:text-sm font-medium leading-relaxed ${
                isDarkMode 
                  ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-[#52525b]' 
                  : 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-[#94a3b8] shadow-xs'
              }`}
            />
          </div>

          {/* FOOTER */}
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
              {initialData ? 'Save Changes' : 'Create Project'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEditProjectModal;
