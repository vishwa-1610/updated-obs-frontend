import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Heart, 
  ArrowRight, Loader2, AlertCircle, ShieldCheck, 
  CheckCircle2, Sparkles, ChevronDown, Fingerprint,
  Eye, EyeOff, Hash, Home, Building2, Check, Shield, Lock, FileText
} from 'lucide-react';
import api from '../../api';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import StunningDatePicker from '../common/StunningDatePicker';
import StunningSelect from '../common/StunningSelect';

// --- FULL US STATES LIST ---
const US_STATES = [
  { value: 'AL', label: 'AL - Alabama' }, { value: 'AK', label: 'AK - Alaska' }, { value: 'AZ', label: 'AZ - Arizona' },
  { value: 'AR', label: 'AR - Arkansas' }, { value: 'CA', label: 'CA - California' }, { value: 'CO', label: 'CO - Colorado' },
  { value: 'CT', label: 'CT - Connecticut' }, { value: 'DE', label: 'DE - Delaware' }, { value: 'DC', label: 'DC - District of Columbia' },
  { value: 'FL', label: 'FL - Florida' }, { value: 'GA', label: 'GA - Georgia' }, { value: 'HI', label: 'HI - Hawaii' },
  { value: 'ID', label: 'ID - Idaho' }, { value: 'IL', label: 'IL - Illinois' }, { value: 'IN', label: 'IN - Indiana' },
  { value: 'IA', label: 'IA - Iowa' }, { value: 'KS', label: 'KS - Kansas' }, { value: 'KY', label: 'KY - Kentucky' },
  { value: 'LA', label: 'LA - Louisiana' }, { value: 'ME', label: 'ME - Maine' }, { value: 'MD', label: 'MD - Maryland' },
  { value: 'MA', label: 'MA - Massachusetts' }, { value: 'MI', label: 'MI - Michigan' }, { value: 'MN', label: 'MN - Minnesota' },
  { value: 'MS', label: 'MS - Mississippi' }, { value: 'MO', label: 'MO - Missouri' }, { value: 'MT', label: 'MT - Montana' },
  { value: 'NE', label: 'NE - Nebraska' }, { value: 'NV', label: 'NV - Nevada' }, { value: 'NH', label: 'NH - New Hampshire' },
  { value: 'NJ', label: 'NJ - New Jersey' }, { value: 'NM', label: 'NM - New Mexico' }, { value: 'NY', label: 'NY - New York' },
  { value: 'NC', label: 'NC - North Carolina' }, { value: 'ND', label: 'ND - North Dakota' }, { value: 'OH', label: 'OH - Ohio' },
  { value: 'OK', label: 'OK - Oklahoma' }, { value: 'OR', label: 'OR - Oregon' }, { value: 'PA', label: 'PA - Pennsylvania' },
  { value: 'RI', label: 'RI - Rhode Island' }, { value: 'SC', label: 'SC - South Carolina' }, { value: 'SD', label: 'SD - South Dakota' },
  { value: 'TN', label: 'TN - Tennessee' }, { value: 'TX', label: 'TX - Texas' }, { value: 'UT', label: 'UT - Utah' },
  { value: 'VT', label: 'VT - Vermont' }, { value: 'VA', label: 'VA - Virginia' }, { value: 'WA', label: 'WA - Washington' },
  { value: 'WV', label: 'WV - West Virginia' }, { value: 'WI', label: 'WI - Wisconsin' }, { value: 'WY', label: 'WY - Wyoming' }
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single / Unmarried' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' }
];

const PersonalDetailsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  const urlState = searchParams.get('state'); 

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  
  const { goToNextStep, candidateInfo } = useOnboarding();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSSN, setShowSSN] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '', 
    middle_initial: '', 
    last_name: '', 
    dob: '', 
    ssn: '', 
    marital_status: '', 
    gender: '',
    email: '', 
    phone_no: '', 
    address: '', 
    city: '', 
    state: urlState || '',
    zipcode: ''
  });

  // Pre-fill candidate info if returned from token validation
  useEffect(() => {
    if (candidateInfo) {
      setFormData(prev => ({
        ...prev,
        first_name: prev.first_name || candidateInfo.first_name || '',
        last_name: prev.last_name || candidateInfo.last_name || '',
        email: prev.email || candidateInfo.email || '',
      }));
    }
  }, [candidateInfo]);

  // Fetch pre-existing personal details if already started
  useEffect(() => {
    if (!token) return;
    api.get(`/personal-details/?token=${token}`)
      .then(res => {
        if (res.data && Object.keys(res.data).length > 0) {
          setFormData(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ssn') {
      // Auto-format SSN XXX-XX-XXXX
      const digits = value.replace(/\D/g, '').slice(0, 9);
      let formatted = digits;
      if (digits.length > 5) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
      } else if (digits.length > 3) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      }
      setFormData(prev => ({ ...prev, ssn: formatted }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.ssn || !formData.gender || !formData.marital_status || !formData.dob) { 
      setError("Please fill in all required personal identification fields."); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; 
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await api.post('/personal-details/', { token: token, ...formData });
      setShowSuccessModal(true);
      
      setTimeout(() => {
        goToNextStep();
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "Connection failed. Please check your data and try again.");
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

  return (
    <div className="w-full space-y-4">
      {/* Title & Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span 
              className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              Step 1 • Profile Identification
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Personal Details & Identity
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Please verify your legal identity, contact info, and tax residence as on official documents.
          </p>
        </div>

        <div className={`self-start sm:self-auto flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
          isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-blue-50/60 border-blue-100 text-blue-800'
        }`}>
          <Lock size={14} className="text-emerald-500 shrink-0" />
          <span className="text-[10px] font-bold">SOC2 Protected PII</span>
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
        {/* Card 1: Legal Identity & Personal Details */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              <User size={13} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold">Legal Identity & Personal Information</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* First Name */}
            <div>
              <label className={labelClass}>
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. John"
                  required
                  className={inputClass}
                />
                <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Middle Initial */}
            <div>
              <label className={labelClass}>Middle Initial</label>
              <div className="relative">
                <input
                  type="text"
                  name="middle_initial"
                  value={formData.middle_initial}
                  onChange={handleChange}
                  placeholder="e.g. A"
                  maxLength={2}
                  className={inputClass}
                />
                <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className={labelClass}>
                Last Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Doe"
                  required
                  className={inputClass}
                />
                <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Date of Birth (Custom StunningDatePicker) */}
            <div>
              <StunningDatePicker
                name="dob"
                label="Date of Birth"
                value={formData.dob}
                onChange={handleChange}
                required
                placeholder="Select Date of Birth"
                minYear={1940}
                maxYear={new Date().getFullYear() - 15}
              />
            </div>

            {/* SSN / Tax ID */}
            <div>
              <label className={labelClass}>
                Social Security Number (SSN) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSSN ? "text" : "password"}
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleChange}
                  placeholder="XXX-XX-XXXX"
                  required
                  maxLength={11}
                  className={`${inputClass} pr-10`}
                />
                <Fingerprint size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                <button
                  type="button"
                  onClick={() => setShowSSN(!showSSN)}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                    isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {showSSN ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Gender (Custom StunningSelect) */}
            <div>
              <StunningSelect
                name="gender"
                label="Gender Identity"
                value={formData.gender}
                onChange={handleChange}
                options={GENDER_OPTIONS}
                required
                placeholder="Select Gender..."
              />
            </div>

            {/* Marital Status (Custom StunningSelect) */}
            <div className="sm:col-span-2 md:col-span-3">
              <StunningSelect
                name="marital_status"
                label="Marital Status"
                value={formData.marital_status}
                onChange={handleChange}
                options={MARITAL_OPTIONS}
                required
                placeholder="Select Marital Status..."
                icon={Heart}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact & Residential Address */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              <Home size={13} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold">Contact & Residential Address</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Email Address */}
            <div>
              <label className={labelClass}>
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="candidate@example.com"
                  required
                  className={inputClass}
                />
                <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className={labelClass}>
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  required
                  className={inputClass}
                />
                <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className={labelClass}>
                Street Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, Apt 4"
                  required
                  className={inputClass}
                />
                <Home size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* City */}
            <div>
              <label className={labelClass}>
                City <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="San Francisco"
                  required
                  className={inputClass}
                />
                <Building2 size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* State (Custom Searchable StunningSelect) */}
            <div>
              <StunningSelect
                name="state"
                label="State"
                value={formData.state}
                onChange={handleChange}
                options={US_STATES}
                searchable
                required
                placeholder="Select State..."
                icon={MapPin}
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className={labelClass}>
                ZIP / Postal Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                  placeholder="94107"
                  required
                  maxLength={10}
                  className={inputClass}
                />
                <Hash size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>
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
                <span>Saving Details...</span>
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
            <h3 className="text-base font-bold mb-0.5">Personal Details Saved!</h3>
            <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Proceeding to the next onboarding step...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDetailsPage;