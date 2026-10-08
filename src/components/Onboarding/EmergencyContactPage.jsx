import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, Phone, Mail, Heart, UserPlus, 
  ArrowRight, Loader2, AlertCircle, MapPin, 
  ShieldCheck, Zap, FileCheck, Sparkles, Check,
  Home, Plus, Trash2, Shield
} from 'lucide-react';
import api from '../../api';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import StunningSelect from '../common/StunningSelect';

const RELATIONSHIP_OPTIONS = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Child', label: 'Child' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Other', label: 'Other' }
];

const EmergencyContactPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const { goToNextStep } = useOnboarding();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    ec1_name: '', ec1_relationship: '', ec1_phone: '', ec1_email: '', ec1_address: '',
    ec2_name: '', ec2_relationship: '', ec2_phone: '', ec2_email: '', ec2_address: ''
  });

  // Fetch pre-existing emergency contact details if any
  useEffect(() => {
    if (!token) return;
    api.get(`/emergency-contact/?token=${token}`)
      .then(res => {
        if (res.data && Object.keys(res.data).length > 0) {
          setFormData(prev => ({ ...prev, ...res.data }));
          if (res.data.ec2_name || res.data.ec2_phone) {
            setShowSecondary(true);
          }
        }
      })
      .catch(() => {});
  }, [token]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const setRelationship = (field, rel) => {
    setFormData(prev => ({ ...prev, [field]: rel }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ec1_name || !formData.ec1_relationship || !formData.ec1_phone) {
      setError("Please complete all required fields for your Primary Emergency Contact.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await api.post('/emergency-contact/', { 
        token: token,
        ...formData 
      });
        
      setShowSuccessModal(true);

      setTimeout(() => {
        goToNextStep();
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to save emergency contact info. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all duration-200 ${
    isDarkMode 
      ? 'bg-[#181a20] border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20' 
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm'
  }`;

  const labelClass = `block text-[10px] font-bold uppercase tracking-wider mb-1 ${
    isDarkMode ? 'text-zinc-400' : 'text-slate-600'
  }`;

  const cardClass = `p-4 sm:p-5 rounded-2xl border transition-all ${
    isDarkMode ? 'bg-[#131722] border-zinc-800/80 shadow-md' : 'bg-white border-slate-200/80 shadow-sm'
  }`;

  const relationshipPresets = ['Spouse', 'Parent', 'Sibling', 'Child', 'Partner', 'Friend'];

  return (
    <div className="w-full space-y-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span 
              className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              Step 2 • Safety & Care
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Emergency Contacts
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Who should your employer contact in case of an urgent medical emergency or critical notice?
          </p>
        </div>

        <div className={`self-start sm:self-auto flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
          isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-emerald-50/60 border-emerald-100 text-emerald-800'
        }`}>
          <Shield size={14} className="text-emerald-500 shrink-0" />
          <span className="text-[10px] font-bold">Strict Confidentiality</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card 1: Primary Emergency Contact (Required) */}
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
              >
                <Users size={13} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold">Primary Emergency Contact</h2>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Full Name */}
            <div>
              <label className={labelClass}>
                Contact Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="ec1_name"
                  value={formData.ec1_name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  required
                  className={inputClass}
                />
                <UserPlus size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Relationship (Custom StunningSelect) */}
            <div>
              <StunningSelect
                name="ec1_relationship"
                label="Relationship"
                value={formData.ec1_relationship}
                onChange={handleChange}
                options={RELATIONSHIP_OPTIONS}
                required
                placeholder="Select Relationship..."
                icon={Heart}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className={labelClass}>
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="ec1_phone"
                  value={formData.ec1_phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  required
                  className={inputClass}
                />
                <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className={labelClass}>Email Address (Optional)</label>
              <div className="relative">
                <input
                  type="email"
                  name="ec1_email"
                  value={formData.ec1_email}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  className={inputClass}
                />
                <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Address (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  name="ec1_address"
                  value={formData.ec1_address}
                  onChange={handleChange}
                  placeholder="City, State or Full Address"
                  className={inputClass}
                />
                <MapPin size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Secondary Emergency Contact (Optional) */}
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: isDarkMode ? '#27272a' : '#f1f5f9', color: isDarkMode ? '#a1a1aa' : '#64748b' }}
              >
                <Users size={13} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold">Secondary Emergency Contact (Optional)</h2>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowSecondary(!showSecondary)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                showSecondary
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20'
              }`}
            >
              {showSecondary ? 'Collapse' : '+ Add Backup Contact'}
            </button>
          </div>

          {showSecondary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 animate-in fade-in">
              {/* Full Name */}
              <div>
                <label className={labelClass}>Contact Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="ec2_name"
                    value={formData.ec2_name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className={inputClass}
                  />
                  <UserPlus size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                </div>
              </div>

              {/* Relationship */}
              <div>
                <StunningSelect
                  name="ec2_relationship"
                  label="Relationship"
                  value={formData.ec2_relationship}
                  onChange={handleChange}
                  options={RELATIONSHIP_OPTIONS}
                  placeholder="Select Relationship..."
                  icon={Heart}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="ec2_phone"
                    value={formData.ec2_phone}
                    onChange={handleChange}
                    placeholder="(555) 000-0000"
                    className={inputClass}
                  />
                  <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className={labelClass}>Email Address (Optional)</label>
                <div className="relative">
                  <input
                    type="email"
                    name="ec2_email"
                    value={formData.ec2_email}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                    className={inputClass}
                  />
                  <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                </div>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Address (Optional)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="ec2_address"
                    value={formData.ec2_address}
                    onChange={handleChange}
                    placeholder="City, State or Full Address"
                    className={inputClass}
                  />
                  <MapPin size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                </div>
              </div>
            </div>
          ) : (
            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
              Click <strong>+ Add Backup Contact</strong> above if you wish to provide a second emergency contact.
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: activeHexColor }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Contacts...</span>
              </>
            ) : (
              <>
                <span>Save & Continue to Next Step</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Celebratory Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className={`p-6 rounded-3xl border shadow-2xl flex flex-col items-center max-w-xs w-full text-center animate-in zoom-in-95 ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-base font-bold mb-0.5">Emergency Contacts Saved!</h3>
            <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Proceeding to the next onboarding step...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactPage;