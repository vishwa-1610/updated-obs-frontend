import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, DollarSign, Calculator, 
  PenTool, AlertCircle, Sparkles,
  ArrowRight, Check, Loader2, FileText,
  ShieldCheck, HelpCircle, RotateCcw, Download, Eye, MapPin
} from 'lucide-react';
import api from '../../../api';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';
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

const FederalTaxPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const urlState = searchParams.get('state') || '';

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const { goToNextStep, candidateInfo } = useOnboarding();

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Personal
    first_name: '', last_name: '', middle_initial: '', ssn: '',
    address: '', city: '', state: urlState, zipcode: '',
    filing_status: '1', 
    
    // Step 2: Multiple Jobs
    multiple_jobs_two: false, 
    use_step2b: false,
    mj_higher_annual_wages: '',
    mj_lower_annual_wages: '',
    mj_pay_periods: 26,
    
    // Step 3: Dependents
    kids_under_17: 0, other_dependents: 0, other_credits: '',

    // Step 4: Other Adjustments
    step4_other_income: '', 
    step4_deductions: '', 
    step4_extra_withholding: '', 

    // Deductions Worksheet
    use_deductions_worksheet: false,
    deductions_1a: '', deductions_1b: '', deductions_1c: '',
    deductions_3a: '', deductions_3b: '',
    deductions_5: '',
    deductions_6a: '', deductions_6b: '', deductions_6c: '', deductions_6d: '', deductions_6e: '',
    deductions_8a: '', deductions_12: '', 

    // Exemption & Signature
    federal_exempt: false,
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // Pre-populate data from Personal Details or Candidate Info
  useEffect(() => {
    if (!token) return;
    api.get(`/personal-details/?token=${token}`)
      .then(res => {
        if (res.data && Object.keys(res.data).length > 0) {
          setFormData(prev => ({
            ...prev,
            first_name: prev.first_name || res.data.first_name || '',
            last_name: prev.last_name || res.data.last_name || '',
            middle_initial: prev.middle_initial || res.data.middle_initial || '',
            ssn: prev.ssn || res.data.ssn || '',
            address: prev.address || res.data.address || '',
            city: prev.city || res.data.city || '',
            state: prev.state || res.data.state || urlState || '',
            zipcode: prev.zipcode || res.data.zipcode || '',
          }));
        }
      })
      .catch(() => {});
  }, [token, urlState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = name === 'state' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : finalValue }));
  };

  // Resize canvas dynamically
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
    window.addEventListener('resize', resizeCanvas);
    const t = setTimeout(resizeCanvas, 150);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(t);
    };
  }, []);

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setFormData(prev => ({ ...prev, signature_image: sigCanvasRef.current.getCanvas().toDataURL('image/png') }));
    }
  };
  
  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.signature_image) { 
      setError("Please sign the digital signature pad in Step 5."); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      return; 
    }
    if (!formData.state) { 
      setError("Please specify your resident State."); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      return; 
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Clean and sanitize payload to prevent null errors
      const cleanedData = { ...formData };
      Object.keys(cleanedData).forEach(k => {
        if (cleanedData[k] === null || cleanedData[k] === undefined) {
          cleanedData[k] = '';
        }
      });

      const payload = { 
        token: token || '', 
        ...cleanedData 
      };
      
      const response = await api.post('/federal-tax/', payload);

      if (response.data && response.data.pdf_url) {
        setPdfUrl(response.data.pdf_url);
        setShowSuccessModal(true);
      } else if (response.data instanceof Blob) {
        const file = new Blob([response.data], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(file));
        setShowSuccessModal(true);
      } else {
        setShowSuccessModal(true);
      }

    } catch (err) {
      console.error(err);
      let msg = "Failed to generate Federal W-4 form.";
      if (err.response?.data?.error) {
        if (typeof err.response.data.error === 'object') {
          msg = Object.entries(err.response.data.error)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ');
        } else {
          msg = err.response.data.error;
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
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

  // Calculated Step 3 dependent credits
  const totalDependentCredits = (Number(formData.kids_under_17 || 0) * 2000) + 
                                (Number(formData.other_dependents || 0) * 500) + 
                                Number(formData.other_credits || 0);

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
              Step 3 • Federal Compliance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            IRS Form W-4 (Federal Tax)
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Employee's Withholding Certificate for federal income tax calculations.
          </p>
        </div>

        <div className={`self-start sm:self-auto flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
          isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-blue-50/60 border-blue-100 text-blue-800'
        }`}>
          <FileText size={14} className="text-blue-500 shrink-0" />
          <span className="text-[10px] font-bold">Automated PDF Generator</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* Main W-4 Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Personal Information & Filing Status */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              <User size={13} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold">Step 1: Personal Information & Filing Status</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-3.5">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Middle Initial</label>
              <input type="text" name="middle_initial" value={formData.middle_initial} onChange={handleChange} maxLength={2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>SSN</label>
              <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} placeholder="XXX-XX-XXXX" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Residential Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required className={inputClass} />
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
              <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} maxLength={10} required className={inputClass} />
            </div>
          </div>

          {/* Filing Status Selection */}
          <div className="pt-3 border-t border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <label className={labelClass}>Step 1(c): Marital & Filing Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1.5">
              {[
                { id: '1', title: 'Single', desc: 'Single or Married filing separately' },
                { id: '2', title: 'Married Jointly', desc: 'Married filing jointly / Qualifying widow(er)' },
                { id: '3', title: 'Head of Household', desc: 'Unmarried and paying > half household costs' },
              ].map((s) => {
                const isSelected = formData.filing_status === s.id;
                return (
                  <label
                    key={s.id}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-blue-600 bg-blue-50/70 text-blue-950'
                        : isDarkMode
                          ? 'border-zinc-800 bg-[#181a20] hover:border-zinc-700 text-zinc-300'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{s.title}</span>
                      <input
                        type="radio"
                        name="filing_status"
                        value={s.id}
                        checked={isSelected}
                        onChange={handleChange}
                        className="w-3.5 h-3.5 text-blue-600 focus:ring-0"
                      />
                    </div>
                    <span className={`text-[10px] leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {s.desc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Multiple Jobs or Spouse Works */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              <Calculator size={13} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold">Step 2: Multiple Jobs or Spouse Works</h2>
            </div>
          </div>

          <div className="space-y-3">
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              formData.multiple_jobs_two
                ? isDarkMode ? 'bg-blue-500/10 border-blue-500/50' : 'bg-blue-50 border-blue-300'
                : isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                name="multiple_jobs_two"
                checked={formData.multiple_jobs_two}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded mt-0.5"
              />
              <div>
                <span className="font-bold text-xs block">Step 2(c): Two Jobs Total with Similar Pay</span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Check this box if there are only two jobs total across your household with similar wage levels.
                </span>
              </div>
            </label>

            {!formData.multiple_jobs_two && (
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-center gap-2.5 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    name="use_step2b"
                    checked={formData.use_step2b}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <span className="font-bold text-xs">Use Step 2(b) Multiple Jobs Worksheet?</span>
                </label>

                {formData.use_step2b && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-zinc-800/40 dark:border-zinc-800 light:border-slate-200 animate-in fade-in">
                    <div>
                      <label className={labelClass}>Higher Annual Wages ($)</label>
                      <input type="number" name="mj_higher_annual_wages" value={formData.mj_higher_annual_wages} onChange={handleChange} placeholder="0.00" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Lower Annual Wages ($)</label>
                      <input type="number" name="mj_lower_annual_wages" value={formData.mj_lower_annual_wages} onChange={handleChange} placeholder="0.00" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Pay Periods / Year</label>
                      <input type="number" name="mj_pay_periods" value={formData.mj_pay_periods} onChange={handleChange} placeholder="26" className={inputClass} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Claim Dependents */}
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
              >
                <DollarSign size={13} />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold">Step 3: Claim Dependents & Child Tax Credit</h2>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-500">${totalDependentCredits.toLocaleString()} Credit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <label className="text-[11px] font-bold block mb-1">Children Under 17 ($2,000)</label>
              <input
                type="number"
                min="0"
                name="kids_under_17"
                value={formData.kids_under_17}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <label className="text-[11px] font-bold block mb-1">Other Dependents ($500)</label>
              <input
                type="number"
                min="0"
                name="other_dependents"
                value={formData.other_dependents}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <label className="text-[11px] font-bold block mb-1">Other Tax Credits ($)</label>
              <input
                type="number"
                min="0"
                name="other_credits"
                value={formData.other_credits}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Step 4: Other Adjustments */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              <DollarSign size={13} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold">Step 4: Other Adjustments (Optional)</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className={labelClass}>4(a) Other Income ($)</label>
              <input
                type="number"
                name="step4_other_income"
                value={formData.step4_other_income}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>4(b) Deductions ($)</label>
              <input
                type="number"
                name="step4_deductions"
                value={formData.step4_deductions}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>4(c) Extra Withholding ($)</label>
              <input
                type="number"
                name="step4_extra_withholding"
                value={formData.step4_extra_withholding}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Exemption Card */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          formData.federal_exempt 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
            : isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <input
            type="checkbox"
            name="federal_exempt"
            checked={formData.federal_exempt}
            onChange={handleChange}
            className="w-4 h-4 text-amber-600 rounded mt-0.5"
          />
          <div>
            <h4 className="font-bold text-xs">Claim Exemption from Withholding</h4>
            <p className={`text-[10px] leading-tight mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              I certify under penalties of perjury that I had no federal income tax liability in the previous tax year and I expect to have no federal income tax liability this year.
            </p>
          </div>
        </div>

        {/* Step 5: Digital Signature Pad */}
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
                <h2 className="text-xs sm:text-sm font-bold">Step 5: Sign & Certify (Penalties of Perjury)</h2>
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
                <span>Draw your digital signature inside this box</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px]">
            <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>
              Date: <strong>{formData.confirmation_date}</strong> • Digital e-Sign Verified
            </span>
            {formData.signature_image && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                <Check size={13} /> Recorded
              </span>
            )}
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
                <span>Generating & Submitting W-4...</span>
              </>
            ) : (
              <>
                <span>Save & Generate Form W-4</span>
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
            <h3 className="text-base font-bold mb-1">Form W-4 Signed!</h3>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Your IRS W-4 document has been securely stamped.
            </p>

            <div className="w-full space-y-2">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Eye size={13} /> View Signed PDF
                </a>
              )}
              <button
                type="button"
                onClick={handleContinue}
                style={{ backgroundColor: activeHexColor }}
                className="w-full py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Continue to Next Step</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FederalTaxPage;