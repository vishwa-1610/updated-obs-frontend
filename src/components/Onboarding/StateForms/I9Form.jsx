import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, MapPin, Mail, Phone, Calendar, 
  CheckCircle, FileText, ChevronDown, ChevronLeft, ChevronRight, 
  Briefcase, Globe, PenTool, Eraser, Save, AlertCircle, Loader2,
  ShieldCheck, Zap, FileJson, Sparkles, Check, ArrowRight, RotateCcw
} from 'lucide-react';
import api from '../../../api';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';
import StunningDatePicker from '../../common/StunningDatePicker';
import StunningSelect from '../../common/StunningSelect';

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

const I9FormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const { goToNextStep } = useOnboarding();

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', middle_initial: '', other_last_names: '',
    address: '', apt_number: '', city: '', state: '', zipcode: '',
    dob: '', ssn: '', email: '', phone: '',
    citizenship_status: 'citizen',
    uscis_a_number: '', auth_expire_date: '', form_i94_number: '', foreign_passport_number: '', country_of_issuance: '',
    document_list_type: 'A',
    document_title: '', issuing_authority: '', document_number: '', expiration_date: '',
    doc_title_b: '', doc_authority_b: '', doc_number_b: '', doc_expire_b: '',
    doc_title_c: '', doc_authority_c: '', doc_number_c: '', doc_expire_c: '',
    first_day_employment: '', employer_name: '', company_name: '', company_address: '',
    has_preparer: false, prep_name: '', prep_first_name: '', prep_last_name: '', prep_address: '', prep_city: '', prep_state: '', prep_zip: '',
    is_rehire: false, rehire_date: '', rehire_last_name: '', rehire_first_name: '', rehire_doc_title: '', rehire_doc_number: '', rehire_doc_expire: '',
    signature_date: new Date().toISOString().split('T')[0],
    is_signed: false,
    signature_image: null
  });

  // Pre-fill user data from onboarding
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [validateRes, personalRes] = await Promise.allSettled([
          api.get(`/onboarding/validate/${token}/`),
          api.get(`/personal-details/?token=${token}`)
        ]);

        const data = validateRes.status === 'fulfilled' ? validateRes.value.data : {};
        const pData = personalRes.status === 'fulfilled' ? personalRes.value.data : {};
        
        setFormData(prev => ({
          ...prev,
          first_name: pData.first_name || data.first_name || '',
          last_name: pData.last_name || data.last_name || '',
          middle_initial: pData.middle_initial || '',
          email: pData.email || data.email || '',
          phone: pData.phone_no || '', 
          address: pData.address || '',
          city: pData.city || '',
          state: pData.state || '',
          zipcode: pData.zipcode || '',
          dob: pData.dob || '',
          ssn: pData.ssn || '',
          employer_name: 'HR Team', 
          company_name: data.client_name || 'Enterprise',
          first_day_employment: data.start_date || ''
        }));
      } catch (err) {
        console.warn("I-9 profile load notice:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Resize Canvas
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width; 
          canvas.height = rect.height;
        }
      }
    };
    const timer = setTimeout(resizeCanvas, 150);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(timer);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setFormData(prev => ({ 
        ...prev, 
        is_signed: true, 
        signature_image: sigCanvasRef.current.getCanvas().toDataURL('image/png') 
      }));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    setFormData(prev => ({ ...prev, is_signed: false, signature_image: null }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!formData.is_signed || !formData.signature_image) { 
      setError("Please provide your digital signature in the signature box."); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; 
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = { ...formData, token: token };
      const res = await api.post('/submit-i9/', payload);
      setSuccessData(res.data || {});
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      let msg = "Failed to submit Form I-9. Please verify required fields.";
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          if (err.response.data.error) {
            msg = typeof err.response.data.error === 'object'
              ? Object.entries(err.response.data.error).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
              : err.response.data.error;
          } else if (err.response.data.message) {
            msg = err.response.data.message;
          } else {
            msg = Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ');
          }
        } else if (typeof err.response.data === 'string') {
          msg = err.response.data;
        }
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    goToNextStep();
  };

  const inputClass = `w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none transition-all duration-200 ${
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
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span 
              className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              Step 5 • Employment Eligibility
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Form I-9 (USCIS Verification)
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            U.S. Citizenship and Immigration Services Employment Eligibility Verification.
          </p>
        </div>

        <div className={`self-start sm:self-auto flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
          isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-blue-50/60 border-blue-100 text-blue-800'
        }`}>
          <ShieldCheck size={14} className="text-blue-500 shrink-0" />
          <span className="text-[10px] font-bold">Section 1 Attestation</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* Main Form I-9 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card 1: Section 1 Employee Information */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              <User size={13} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold">Section 1: Employee Information and Attestation</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Middle Initial</label>
              <input type="text" name="middle_initial" value={formData.middle_initial} onChange={handleChange} maxLength={2} placeholder="N/A" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Other Last Names (If any)</label>
              <input type="text" name="other_last_names" value={formData.other_last_names} onChange={handleChange} placeholder="N/A" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>SSN</label>
              <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} placeholder="XXX-XX-XXXX" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Street Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Apt / Suite #</label>
              <input type="text" name="apt_number" value={formData.apt_number} onChange={handleChange} placeholder="Apt 101" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required className={inputClass} />
            </div>
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
            <div>
              <label className={labelClass}>ZIP Code</label>
              <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} required className={inputClass} />
            </div>
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
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={inputClass} />
            </div>
          </div>
        </div>

        {/* Card 2: Citizenship Status Attestation */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              <Globe size={13} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold">Citizenship & Employment Authorization Status</h2>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { v: 'citizen', l: '1. A citizen of the United States' },
              { v: 'noncitizen_national', l: '2. A noncitizen national of the United States (8 U.S.C. 1101(a)(22))' },
              { v: 'lawful_permanent_resident', l: '3. A lawful permanent resident (Enter USCIS / A-Number)' },
              { v: 'alien_authorized', l: '4. An alien authorized to work in the United States' }
            ].map((opt) => {
              const isSelected = formData.citizenship_status === opt.v;
              return (
                <label
                  key={opt.v}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? isDarkMode ? 'bg-blue-500/10 border-blue-500/60 text-white' : 'bg-blue-50/70 border-blue-400 text-blue-950 font-medium'
                      : isDarkMode ? 'bg-[#181a20] border-zinc-800 hover:border-zinc-700 text-zinc-300' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="citizenship_status"
                    value={opt.v}
                    checked={isSelected}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 text-blue-600 focus:ring-0 mt-0.5"
                  />
                  <span className="text-xs font-semibold">{opt.l}</span>
                </label>
              );
            })}
          </div>

          {['lawful_permanent_resident', 'alien_authorized'].includes(formData.citizenship_status) && (
            <div className="mt-3.5 pt-3 border-t border-zinc-800/40 dark:border-zinc-800 light:border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-in fade-in">
              <div>
                <label className={labelClass}>USCIS / A-Number</label>
                <input
                  type="text"
                  name="uscis_a_number"
                  value={formData.uscis_a_number}
                  onChange={handleChange}
                  placeholder="e.g. A123456789"
                  className={inputClass}
                />
              </div>

              {formData.citizenship_status === 'alien_authorized' && (
                <div>
                  <StunningDatePicker
                    name="auth_expire_date"
                    label="Work Authorization Expiration Date"
                    value={formData.auth_expire_date}
                    onChange={handleChange}
                    placeholder="Select Expiration Date"
                    minYear={new Date().getFullYear()}
                    maxYear={new Date().getFullYear() + 20}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 3: Document Verification (List A or List B + C) */}
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
              >
                <Briefcase size={13} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold">Document Identification</h2>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-3.5">
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, document_list_type: 'A' }))}
              className={`flex-1 py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                formData.document_list_type === 'A'
                  ? 'bg-blue-500/15 border-blue-500 text-blue-500'
                  : isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              List A (Identity & Employment)
            </button>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, document_list_type: 'BC' }))}
              className={`flex-1 py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                formData.document_list_type === 'BC'
                  ? 'bg-blue-500/15 border-blue-500 text-blue-500'
                  : isDarkMode ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              List B (Identity) + List C (Authorization)
            </button>
          </div>

          {formData.document_list_type === 'A' ? (
            <div className={`p-3.5 rounded-xl border space-y-3 ${
              isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-500">List A Document (e.g., U.S. Passport or Permanent Resident Card)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Document Title</label>
                  <input type="text" name="document_title" value={formData.document_title} onChange={handleChange} placeholder="e.g. U.S. Passport" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Issuing Authority</label>
                  <input type="text" name="issuing_authority" value={formData.issuing_authority} onChange={handleChange} placeholder="e.g. Dept of State" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Document Number</label>
                  <input type="text" name="document_number" value={formData.document_number} onChange={handleChange} placeholder="e.g. 123456789" className={inputClass} />
                </div>
                <div>
                  <StunningDatePicker
                    name="expiration_date"
                    label="Expiration Date"
                    value={formData.expiration_date}
                    onChange={handleChange}
                    placeholder="Select Expiration"
                    minYear={new Date().getFullYear()}
                    maxYear={new Date().getFullYear() + 20}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-500">List B (Identity)</h4>
                <div>
                  <label className={labelClass}>Document Title</label>
                  <input type="text" name="doc_title_b" value={formData.doc_title_b} onChange={handleChange} placeholder="Driver's License" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Issuing Authority</label>
                  <input type="text" name="doc_authority_b" value={formData.doc_authority_b} onChange={handleChange} placeholder="State DMV" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Document Number</label>
                  <input type="text" name="doc_number_b" value={formData.doc_number_b} onChange={handleChange} placeholder="DL Number" className={inputClass} />
                </div>
                <div>
                  <StunningDatePicker
                    name="doc_expire_b"
                    label="Expiration Date"
                    value={formData.doc_expire_b}
                    onChange={handleChange}
                    placeholder="Select Expiration"
                    minYear={new Date().getFullYear()}
                    maxYear={new Date().getFullYear() + 20}
                  />
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-500">List C (Authorization)</h4>
                <div>
                  <label className={labelClass}>Document Title</label>
                  <input type="text" name="doc_title_c" value={formData.doc_title_c} onChange={handleChange} placeholder="Social Security Card" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Issuing Authority</label>
                  <input type="text" name="doc_authority_c" value={formData.doc_authority_c} onChange={handleChange} placeholder="SSA" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Document Number</label>
                  <input type="text" name="doc_number_c" value={formData.doc_number_c} onChange={handleChange} placeholder="Card / Doc Number" className={inputClass} />
                </div>
                <div>
                  <StunningDatePicker
                    name="doc_expire_c"
                    label="Expiration Date"
                    value={formData.doc_expire_c}
                    onChange={handleChange}
                    placeholder="Select Expiration"
                    minYear={new Date().getFullYear()}
                    maxYear={new Date().getFullYear() + 20}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Digital Signature */}
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
              >
                <PenTool size={13} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold">Employee Attestation & Digital Signature</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={clearSignature}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <RotateCcw size={11} /> Clear
            </button>
          </div>

          <div
            ref={containerRef}
            className={`border-2 border-dashed rounded-xl h-32 relative cursor-crosshair transition-all overflow-hidden ${
              isDarkMode 
                ? 'bg-zinc-900/60 border-zinc-700 hover:border-zinc-500' 
                : 'bg-slate-50/80 border-slate-300 hover:border-blue-400'
            }`}
          >
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor={isDarkMode ? '#60a5fa' : '#0f172a'}
              velocityFilterWeight={0.7}
              canvasProps={{ className: 'w-full h-full' }}
              onEnd={handleSignatureEnd}
            />
            {!formData.signature_image && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-[11px] text-slate-400">
                <PenTool size={16} className="mb-0.5 opacity-50" />
                <span>Draw your signature inside this box</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px]">
            <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>
              Attestation Date: <strong>{formData.signature_date}</strong> • USCIS Form I-9
            </span>
            {formData.signature_image && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                <Check size={13} /> Signature Verified
              </span>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: activeHexColor }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Submitting Form I-9...</span>
              </>
            ) : (
              <>
                <span>Save & Submit Form I-9</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className={`p-6 rounded-3xl border shadow-2xl flex flex-col items-center max-w-xs w-full text-center animate-in zoom-in-95 ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-base font-bold mb-1">Form I-9 Completed!</h3>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {successData.message || "Your Employment Eligibility Verification Section 1 has been recorded."}
            </p>

            <button
              type="button"
              onClick={handleNext}
              style={{ backgroundColor: activeHexColor }}
              className="w-full py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Continue to Next Step</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default I9FormPage;