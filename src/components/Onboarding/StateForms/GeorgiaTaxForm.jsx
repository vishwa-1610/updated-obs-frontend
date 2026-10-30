import React, { useState, useEffect, useRef, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, Eraser, 
  Save, PenTool, FileText, Calculator, Building2, Loader2, 
  XCircle, CheckCircle2, Info, Sparkles, AlertCircle
} from 'lucide-react';
import StunningSelect from '../../common/StunningSelect';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

// --- GEORGIA G-4 OPTIONS ---
const FILING_OPTIONS = [
  { value: 'A', label: 'Single (A)' },
  { value: 'B', label: 'Married Filing Separate or Joint (Both Work) (B)' },
  { value: 'C', label: 'Married Filing Joint (One Spouse Works) (C)' },
  { value: 'D', label: 'Head of Household (D)' }
];

const GeorgiaTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null); 
  const containerRef = useRef(null);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'GA',
    zipcode: '',
    email: '',
    
    // G-4 Specific
    marital_letter: 'A',
    dependents: 0,
    additional_withholding: '',

    // Worksheet (Lines A - H)
    use_worksheet: false,
    itemized_deductions: '',
    allowable_adjustments: '',
    taxable_income_not_subject: '',

    // Exemptions (Line 8)
    exempt_a: false,
    exempt_b: false,
    military_state: '',
    spouse_military_state: '',

    // Signature
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  // Prefill initial data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        state: 'GA',
        zipcode: (initialData.zipcode || '').slice(0, 5)
      }));
    }
  }, [initialData]);

  // Canvas Resize handler
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas && rect.width > 0 && rect.height > 0) {
          const saved = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (saved) sigCanvasRef.current.fromDataURL(saved);
        }
      }
    };
    const timer = setTimeout(resizeCanvas, 250);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'zipcode') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 5) }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: sig }));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) sigCanvasRef.current.clear();
    setFormData(prev => ({ ...prev, signature_image: null }));
  };

  // --- WORKSHEET & ALLOWANCES CALCULATION ENGINE ---
  const calculations = useMemo(() => {
    const isExempt = formData.exempt_a || formData.exempt_b;
    const deps = isExempt ? 0 : Math.max(0, parseInt(formData.dependents || 0, 10) || 0);

    if (isExempt || !formData.use_worksheet) {
      return {
        isExempt,
        valA: 0,
        valB: 0,
        valC: 0,
        valD: 0,
        valE: 0,
        valF: 0,
        valG: 0,
        valH: 0,
        adjustmentsAllowances: 0,
        totalAllowances: isExempt ? 0 : deps
      };
    }

    const valA = parseFloat(formData.itemized_deductions || 0) || 0;
    
    // Official GA Standard Deduction (Rev. 08/15/24):
    // Single (A) or HOH (D): $12,000
    // Married Joint (C): $24,000
    // Married Separate / Both Work (B): $12,000 (separate) or $24,000 (joint)
    let valB = 12000;
    if (formData.marital_letter === 'C') {
      valB = 24000;
    } else if (formData.marital_letter === 'B') {
      valB = 24000;
    } else {
      valB = 12000;
    }

    const valC = Math.max(0, valA - valB);
    const valD = parseFloat(formData.allowable_adjustments || 0) || 0;
    const valE = valC + valD;
    const valF = parseFloat(formData.taxable_income_not_subject || 0) || 0;
    const valG = Math.max(0, valE - valF);

    let valH = 0;
    if (valG > 0) {
      const raw = Math.floor(valG / 4000);
      const rem = valG % 4000;
      valH = raw + (rem > 1500 ? 1 : 0);
    }

    const adjustmentsAllowances = valH;
    const totalAllowances = deps + adjustmentsAllowances;

    return {
      isExempt: false,
      valA,
      valB,
      valC,
      valD,
      valE,
      valF,
      valG,
      valH,
      adjustmentsAllowances,
      totalAllowances
    };
  }, [formData]);

  // --- SUBMISSION ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    let sig = formData.signature_image;
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      sig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!sig) {
      setErrorMessage("Please provide your digital signature before continuing.");
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.ssn) {
      setErrorMessage("First Name, Last Name, and SSN are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanNum = (v) => (v === '' || v === null || isNaN(v) ? 0 : v);
      const selectedOption = FILING_OPTIONS.find(o => o.value === formData.marital_letter);

      const finalPayload = {
        ...formData,
        marital_letter: formData.marital_letter,
        status_letter: formData.marital_letter,
        filing_status: selectedOption ? selectedOption.label : `Married/Single (${formData.marital_letter})`,
        dependents: cleanNum(formData.dependents),
        additional_withholding: cleanNum(formData.additional_withholding),
        itemized_deductions: cleanNum(formData.itemized_deductions),
        allowable_adjustments: cleanNum(formData.allowable_adjustments),
        taxable_income_not_subject: cleanNum(formData.taxable_income_not_subject),
        adjustments_allowances: calculations.adjustmentsAllowances,
        total_allowances: calculations.totalAllowances,
        signature: sig,
        signature_image: sig
      };

      await onSubmit(finalPayload);
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage(err.response?.data?.error || err.message || "Submission failed. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Theme Styles
  const cardBg = isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm';
  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`;
  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
    isDarkMode 
      ? 'bg-zinc-900/60 border-zinc-700/80 text-zinc-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
      : 'bg-slate-50/70 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  }`;
  const sectionTitle = `text-sm font-bold flex items-center gap-2 mb-4 pb-2 border-b ${
    isDarkMode ? 'border-zinc-800 text-zinc-200' : 'border-slate-100 text-slate-800'
  }`;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header Card */}
      <div className={`p-6 rounded-2xl border ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Georgia Form G-4</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Rev. 08/15/24
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                State of Georgia Employee's Withholding Allowance Certificate
              </p>
            </div>
          </div>

          {/* Quick Summary Pill */}
          <div className={`flex items-center gap-4 px-4 py-2.5 rounded-xl border text-xs ${
            isDarkMode ? 'bg-zinc-900/50 border-zinc-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className={`block text-[10px] uppercase font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
                Marital Letter
              </span>
              <span className="font-extrabold text-sm" style={{ color: activeHexColor }}>
                Line 3: {formData.marital_letter}
              </span>
            </div>
            <div className={`h-7 w-px ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'}`} />
            <div>
              <span className={`block text-[10px] uppercase font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
                Total Allowances
              </span>
              <span className="font-extrabold text-sm text-emerald-500">
                {calculations.isExempt ? 'EXEMPT' : calculations.totalAllowances}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 flex items-center gap-3 animate-in fade-in">
          <XCircle size={18} className="shrink-0" />
          <span className="text-xs font-bold">{errorMessage}</span>
        </div>
      )}

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. PERSONAL INFORMATION */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h3 className={sectionTitle}>
            <User size={17} style={{ color: activeHexColor }} />
            <span>1. Employee Personal Information (Boxes 1a - 2b)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className={labelClass}>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" />
            </div>
            <div className="md:col-span-6">
              <label className={labelClass}>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" />
            </div>
            <div className="md:col-span-6">
              <label className={labelClass}>Social Security Number (SSN)</label>
              <input type="text" name="ssn" value={formData.ssn} onChange={handleChange} className={`${inputClass} tracking-widest`} placeholder="XXX-XX-XXXX" />
            </div>
            <div className="md:col-span-6">
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="name@company.com" />
            </div>
            <div className="md:col-span-12">
              <label className={labelClass}>Residential Street Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="123 Peachtree St NW" />
            </div>
            <div className="md:col-span-5">
              <label className={labelClass}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="Atlanta" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>State</label>
              <input type="text" name="state" value="GA" readOnly className={`${inputClass} cursor-not-allowed opacity-80 text-center font-bold`} />
            </div>
            <div className="md:col-span-4">
              <label className={labelClass}>Zip Code</label>
              <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} placeholder="30303" />
            </div>
          </div>
        </div>

        {/* 2. MARITAL STATUS & ALLOWANCES */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h3 className={sectionTitle}>
            <FileText size={17} style={{ color: activeHexColor }} />
            <span>2. Marital Status & Allowances (Lines 3 - 6)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Line 3: Marital Status */}
            <div>
              <label className={labelClass}>Line 3: Marital Status Letter</label>
              <StunningSelect
                label="Select Marital Status Letter"
                value={formData.marital_letter}
                onChange={(e) => handleChange({ target: { name: 'marital_letter', value: e.target.value } })}
                options={FILING_OPTIONS}
                placeholder="Select Marital Letter"
              />
              <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Determines withholding tables: A (Single), B (Separate/Both work), C (Joint one works), D (HOH).
              </p>
            </div>

            {/* Line 4: Dependents */}
            <div>
              <label className={labelClass}>Line 4: Dependent Allowances</label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  disabled={calculations.isExempt}
                  name="dependents" 
                  value={formData.dependents} 
                  onChange={handleChange} 
                  className={`${inputClass} ${calculations.isExempt ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="0"
                />
              </div>
              <p className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Enter the number of qualifying dependents you are entitled to claim.
              </p>
            </div>

            {/* Line 6: Additional Withholding */}
            <div className="md:col-span-2">
              <label className={labelClass}>Line 6: Additional Withholding per Pay Period ($)</label>
              <div className="relative max-w-xs">
                <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  step="any"
                  min="0"
                  disabled={calculations.isExempt}
                  name="additional_withholding" 
                  value={formData.additional_withholding} 
                  onChange={handleChange} 
                  className={`${inputClass} pl-9 ${calculations.isExempt ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. WORKSHEET FOR LINE 5 (ADDITIONAL ALLOWANCES) */}
        <div className={`p-6 rounded-2xl border transition-all ${cardBg}`}>
          <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-inherit">
            <div className="flex items-center gap-2">
              <Calculator size={17} style={{ color: activeHexColor }} />
              <h3 className="text-sm font-bold">3. Worksheet for Additional Allowances (Line 5)</h3>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="use_worksheet" 
                checked={formData.use_worksheet} 
                onChange={handleChange}
                disabled={calculations.isExempt}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Complete Line 5 Worksheet
              </span>
            </label>
          </div>

          {formData.use_worksheet && !calculations.isExempt ? (
            <div className="space-y-4 animate-in fade-in">
              <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <Info size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Official Form G-4 Standard Deduction Rules:</strong> Single / HOH: $12,000 | Married Joint: $24,000. 
                  Line H divides net excess adjustments by $4,000 (rounds up if remainder &gt; $1,500).
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Line A: Est. Itemized Deductions ($)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      name="itemized_deductions" 
                      value={formData.itemized_deductions} 
                      onChange={handleChange} 
                      className={`${inputClass} pl-9`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Line B: Georgia Standard Deduction (Auto)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      readOnly 
                      value={`$${calculations.valB.toLocaleString()}`} 
                      className={`${inputClass} pl-9 cursor-not-allowed opacity-80 font-bold`} 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Line D: Allowable GA Adjustments ($)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      name="allowable_adjustments" 
                      value={formData.allowable_adjustments} 
                      onChange={handleChange} 
                      className={`${inputClass} pl-9`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Line F: Taxable Income Not Subject to Withholding ($)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      name="taxable_income_not_subject" 
                      value={formData.taxable_income_not_subject} 
                      onChange={handleChange} 
                      className={`${inputClass} pl-9`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Live Worksheet Breakdown Inspector */}
              <div className={`p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
                isDarkMode ? 'bg-zinc-900/80 border-zinc-700/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    Line C (A - B)
                  </span>
                  <span className="font-bold">${calculations.valC.toLocaleString()}</span>
                </div>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    Line E (C + D)
                  </span>
                  <span className="font-bold">${calculations.valE.toLocaleString()}</span>
                </div>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    Line G (E - F)
                  </span>
                  <span className="font-bold">${calculations.valG.toLocaleString()}</span>
                </div>
                <div>
                  <span className={`block text-[10px] uppercase font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    Line H Allowances
                  </span>
                  <span className="font-extrabold text-blue-500">{calculations.valH}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Check the box above if you have itemized deductions or state tax adjustments to calculate additional allowances on Line 5.
            </p>
          )}
        </div>

        {/* 4. EXEMPTIONS (LINE 8) */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h3 className={sectionTitle}>
            <Shield size={17} style={{ color: activeHexColor }} />
            <span>4. Exemptions from Withholding (Line 8)</span>
          </h3>
          <div className="space-y-4">
            {/* 8a */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.exempt_a 
                ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300')
                : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
            }`}>
              <input 
                type="checkbox" 
                name="exempt_a" 
                checked={formData.exempt_a} 
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, exempt_a: e.target.checked, exempt_b: e.target.checked ? false : prev.exempt_b }));
                }}
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="block text-xs font-bold">8a) Total Exemption</span>
                <span className={`text-[11px] block mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  I incurred no Georgia tax liability last year and do not expect any Georgia tax liability this year.
                </span>
              </div>
            </label>

            {/* 8b */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.exempt_b 
                ? (isDarkMode ? 'bg-blue-500/10 border-blue-500/40' : 'bg-blue-50 border-blue-300')
                : (isDarkMode ? 'border-zinc-800 hover:border-zinc-700' : 'border-slate-200 hover:border-slate-300')
            }`}>
              <input 
                type="checkbox" 
                name="exempt_b" 
                checked={formData.exempt_b} 
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, exempt_b: e.target.checked, exempt_a: e.target.checked ? false : prev.exempt_a }));
                }}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="w-full">
                <span className="block text-xs font-bold">8b) Military Spouse Exemption</span>
                <span className={`text-[11px] block mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  I meet the conditions under the Servicemembers Civil Relief Act as a spouse of an active-duty servicemember.
                </span>

                {formData.exempt_b && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-inherit">
                    <div>
                      <label className={labelClass}>My State of Residence</label>
                      <input 
                        type="text" 
                        maxLength="2" 
                        name="military_state" 
                        value={formData.military_state} 
                        onChange={handleChange} 
                        className={inputClass} 
                        placeholder="e.g. NC" 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Spouse's State of Residence</label>
                      <input 
                        type="text" 
                        maxLength="2" 
                        name="spouse_military_state" 
                        value={formData.spouse_military_state} 
                        onChange={handleChange} 
                        className={inputClass} 
                        placeholder="e.g. NC" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* 5. ATTESTATION & DIGITAL SIGNATURE */}
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <h3 className={sectionTitle}>
            <PenTool size={17} style={{ color: activeHexColor }} />
            <span>5. Attestation & Digital Signature</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelClass}>Date of Signing</label>
              <input 
                type="date" 
                name="confirmation_date" 
                value={formData.confirmation_date} 
                onChange={handleChange} 
                className={inputClass} 
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>Digital Signature Pad <span className="text-red-500">*</span></label>
              <button 
                type="button" 
                onClick={clearSignature}
                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Eraser size={13} />
                <span>Clear Signature</span>
              </button>
            </div>

            <div 
              ref={containerRef} 
              className={`w-full h-44 rounded-xl border-2 border-dashed relative overflow-hidden transition-all ${
                isDarkMode ? 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor={isDarkMode ? '#ffffff' : '#000000'}
                velocityFilterWeight={0.7}
                canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
                onEnd={handleSignatureEnd}
              />
              {!formData.signature_image && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1.5 opacity-60">
                  <PenTool size={20} />
                  <span className="text-xs font-medium">Draw signature here using mouse, finger or stylus</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: activeHexColor }}
            className="px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSubmitting ? 'Generating Official GA PDF...' : 'Verify & Continue'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeorgiaTaxForm;
