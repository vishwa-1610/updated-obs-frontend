import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Landmark, CreditCard, DollarSign, PenTool, Eraser, 
  Save, Loader2, CheckCircle, ShieldCheck, 
  Zap, FileCheck, Sparkles, UploadCloud, Plus, Trash2, 
  AlertTriangle, User, XCircle, Check, ArrowRight, RotateCcw, Shield
} from 'lucide-react';
import api from '../../api';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import StunningSelect from '../common/StunningSelect';

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'Checking', label: 'Checking Account' },
  { value: 'Savings', label: 'Savings Account' }
];

const DirectDepositPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const { goToNextStep, candidateInfo } = useOnboarding();

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const [signatureImage, setSignatureImage] = useState(null);
  const [isSigned, setIsSigned] = useState(false);

  const [bankAccounts, setBankAccounts] = useState([
    {
      account_holder_name: '',
      bank_name: '',
      account_type: 'Checking',
      routing_number: '',
      account_number: '',
      confirm_account_number: '',
      percentage: '100.00'
    }
  ]);

  const totalPercentage = bankAccounts.reduce((sum, acc) => sum + (parseFloat(acc.percentage) || 0), 0);
  const isTotalValid = Math.abs(totalPercentage - 100.00) < 0.01;

  // Pre-fill account holder name with candidate name
  useEffect(() => {
    if (candidateInfo && bankAccounts[0]?.account_holder_name === '') {
      const fullName = `${candidateInfo.first_name || ''} ${candidateInfo.last_name || ''}`.trim();
      setBankAccounts(prev => [
        { ...prev[0], account_holder_name: fullName }
      ]);
    }
  }, [candidateInfo]);

  // Pre-fetch bank details if any exist
  useEffect(() => {
    if (!token) return;
    api.get(`/bank-details/?token=${token}`)
      .then(res => {
        if (res.data && Array.isArray(res.data.bank_accounts) && res.data.bank_accounts.length > 0) {
          setBankAccounts(res.data.bank_accounts.map(acc => ({
            ...acc,
            confirm_account_number: acc.account_number,
            percentage: String(acc.percentage || '100.00')
          })));
        }
      })
      .catch(() => {});
  }, [token]);

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

  const handleAccountChange = (index, field, value) => {
    const updated = [...bankAccounts];
    updated[index][field] = value;
    setBankAccounts(updated);
  };

  const addAccount = () => {
    if (totalPercentage >= 100) {
      setError("You have already allocated 100%. Please reduce the percentage of your Primary Account first.");
      return;
    }
    setError(null);
    setBankAccounts([
      ...bankAccounts,
      {
        account_holder_name: bankAccounts[0]?.account_holder_name || '',
        bank_name: '',
        account_type: 'Savings',
        routing_number: '',
        account_number: '',
        confirm_account_number: '',
        percentage: String(Math.max(0, 100 - totalPercentage).toFixed(2))
      }
    ]);
  };

  const removeAccount = (index) => {
    if (bankAccounts.length === 1) return;
    const updated = bankAccounts.filter((_, i) => i !== index);
    setBankAccounts(updated);
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setIsSigned(true);
      setSignatureImage(sigCanvasRef.current.getCanvas().toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    setIsSigned(false);
    setSignatureImage(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!isSigned || !signatureImage) { 
      setError("Please provide your digital authorization signature."); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; 
    }
    
    if (!isTotalValid) { 
      setError(`Total percentage allocation is ${totalPercentage.toFixed(2)}%. It must equal exactly 100.00%.`); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; 
    }

    for (let i = 0; i < bankAccounts.length; i++) {
      const acc = bankAccounts[i];
      if (acc.account_number !== acc.confirm_account_number) {
        setError(`Account numbers do not match for Account #${i + 1} (${acc.bank_name || 'Bank'}).`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!acc.bank_name || !acc.routing_number || !acc.account_number || !acc.account_holder_name) {
        setError(`Please fill in all bank details for Account #${i + 1}.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = { 
        token: token,
        bank_accounts: bankAccounts.map(acc => ({
          account_holder_name: acc.account_holder_name,
          bank_name: acc.bank_name,
          account_type: acc.account_type,
          routing_number: acc.routing_number,
          account_number: acc.account_number,
          percentage: parseFloat(acc.percentage)
        })),
        signature_image: signatureImage
      };

      await api.post('/bank-details/', payload);
      setSuccessModalOpen(true);

    } catch (err) {
      console.error(err);
      let msg = err.response?.data?.message || err.response?.data?.error || "Failed to save direct deposit info. Please check your data.";
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
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
              Step 6 • Payroll & Banking
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Direct Deposit & Payment Setup
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Securely configure your bank account for automated payroll deposits.
          </p>
        </div>

        <div className={`self-start sm:self-auto flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
          isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-emerald-50/60 border-emerald-100 text-emerald-800'
        }`}>
          <Landmark size={14} className="text-emerald-500 shrink-0" />
          <span className="text-[10px] font-bold">Encrypted ACH Routing</span>
        </div>
      </div>

      {/* Allocation Progress Bar */}
      <div className={`p-3.5 rounded-xl border ${
        isDarkMode ? 'bg-[#131722] border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span>Deposit Allocation</span>
          <span className={isTotalValid ? 'text-emerald-500' : 'text-rose-500'}>
            {totalPercentage.toFixed(2)}% / 100.00%
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isTotalValid 
                ? 'bg-emerald-500' 
                : totalPercentage > 100 ? 'bg-rose-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
          />
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
        {/* Bank Account Cards */}
        {bankAccounts.map((account, index) => (
          <div key={index} className={cardClass}>
            <div className="flex items-center justify-between gap-2 mb-3.5 pb-2 border-b border-zinc-800/40 dark:border-zinc-800 light:border-slate-100">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
                >
                  <CreditCard size={13} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold">
                    {index === 0 ? 'Primary Bank Account' : `Secondary Account #${index + 1}`}
                  </h2>
                </div>
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeAccount(index)}
                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Remove this account"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {/* Account Holder Name */}
              <div>
                <label className={labelClass}>Account Holder Name</label>
                <input
                  type="text"
                  value={account.account_holder_name}
                  onChange={(e) => handleAccountChange(index, 'account_holder_name', e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className={inputClass}
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className={labelClass}>Bank Name</label>
                <input
                  type="text"
                  value={account.bank_name}
                  onChange={(e) => handleAccountChange(index, 'bank_name', e.target.value)}
                  placeholder="e.g. Chase, Bank of America"
                  required
                  className={inputClass}
                />
              </div>

              {/* Account Type (Custom StunningSelect) */}
              <div>
                <StunningSelect
                  label="Account Type"
                  value={account.account_type}
                  onChange={(e) => handleAccountChange(index, 'account_type', e.target.value)}
                  options={ACCOUNT_TYPE_OPTIONS}
                />
              </div>

              {/* Routing Number */}
              <div>
                <label className={labelClass}>Routing Number (9 Digits)</label>
                <input
                  type="text"
                  maxLength={9}
                  value={account.routing_number}
                  onChange={(e) => handleAccountChange(index, 'routing_number', e.target.value.replace(/\D/g, ''))}
                  placeholder="9-digit Routing #"
                  required
                  className={inputClass}
                />
              </div>

              {/* Split Percentage */}
              <div>
                <label className={labelClass}>Split Percentage (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.01"
                    value={account.percentage}
                    onChange={(e) => handleAccountChange(index, 'percentage', e.target.value)}
                    placeholder="100.00"
                    required
                    className={`${inputClass} pr-7`}
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>%</span>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className={labelClass}>Account Number</label>
                <input
                  type="password"
                  value={account.account_number}
                  onChange={(e) => handleAccountChange(index, 'account_number', e.target.value)}
                  placeholder="Account Number"
                  required
                  className={inputClass}
                />
              </div>

              {/* Confirm Account Number */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className={labelClass}>Confirm Account Number</label>
                <input
                  type="text"
                  value={account.confirm_account_number}
                  onChange={(e) => handleAccountChange(index, 'confirm_account_number', e.target.value)}
                  placeholder="Re-enter Account Number"
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Secondary Account Button */}
        {bankAccounts.length < 2 && (
          <button
            type="button"
            onClick={addAccount}
            className={`w-full py-2.5 rounded-xl border-2 border-dashed font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              isDarkMode 
                ? 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white' 
                : 'border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            <Plus size={14} /> Add Secondary Bank Account (Split Deposit)
          </button>
        )}

        {/* Authorization & Digital Signature Pad */}
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
                <h2 className="text-xs sm:text-sm font-bold">Direct Deposit Authorization Agreement</h2>
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
            {!isSigned && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-[11px] text-slate-400">
                <PenTool size={16} className="mb-0.5 opacity-50" />
                <span>Draw your digital authorization signature in this box</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[11px]">
            <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>
              Direct Deposit Authorization • 256-Bit Financial Encryption
            </span>
            {isSigned && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-500">
                <Check size={13} /> Authorization Signed
              </span>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={submitting || !isTotalValid}
            style={{ backgroundColor: activeHexColor }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Banking Details...</span>
              </>
            ) : (
              <>
                <span>Complete Direct Deposit Setup</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className={`p-6 rounded-3xl border shadow-2xl flex flex-col items-center max-w-xs w-full text-center animate-in zoom-in-95 ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-base font-bold mb-1">Direct Deposit Saved!</h3>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Your payroll banking details have been securely saved.
            </p>

            <button
              type="button"
              onClick={handleFinish}
              style={{ backgroundColor: activeHexColor }}
              className="w-full py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Complete Onboarding</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectDepositPage;

