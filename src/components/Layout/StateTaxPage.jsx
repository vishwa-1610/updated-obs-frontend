import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, AlertCircle, CheckCircle, MapPin, 
  ShieldCheck, Zap, Sparkles, ArrowRight, Check, Forward, Globe, ChevronDown, FileText, CheckCircle2,
  RefreshCw, Download, ExternalLink
} from 'lucide-react';
import StateTaxFormDispatcher from '../Onboarding/StateForms/StateTaxFormDispatcher';
import api from '../../api'; 
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme, THEME_COLORS } from '../Theme/ThemeProvider';
import StunningSelect from '../common/StunningSelect';
import PageLoader from '../common/LoadingScreen/LoadingScreen';

// --- CONFIGURATION ---
const NO_TAX_FORM_STATES = [
  'AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'
];

const ALL_US_STATES = [
  { value: 'AL', label: 'AL - Alabama' }, { value: 'AK', label: 'AK - Alaska' }, { value: 'AZ', label: 'AZ - Arizona' },
  { value: 'AR', label: 'AR - Arkansas' }, { value: 'CA', label: 'CA - California' }, { value: 'CO', label: 'CO - Colorado' },
  { value: 'CT', label: 'CT - Connecticut' }, { value: 'DE', label: 'DE - Delaware' }, { value: 'FL', label: 'FL - Florida' },
  { value: 'GA', label: 'GA - Georgia' }, { value: 'HI', label: 'HI - Hawaii' }, { value: 'ID', label: 'ID - Idaho' },
  { value: 'IL', label: 'IL - Illinois' }, { value: 'IN', label: 'IN - Indiana' }, { value: 'IA', label: 'IA - Iowa' },
  { value: 'KS', label: 'KS - Kansas' }, { value: 'KY', label: 'KY - Kentucky' }, { value: 'LA', label: 'LA - Louisiana' },
  { value: 'ME', label: 'ME - Maine' }, { value: 'MD', label: 'MD - Maryland' }, { value: 'MA', label: 'MA - Massachusetts' },
  { value: 'MI', label: 'MI - Michigan' }, { value: 'MN', label: 'MN - Minnesota' }, { value: 'MS', label: 'MS - Mississippi' },
  { value: 'MO', label: 'MO - Missouri' }, { value: 'MT', label: 'MT - Montana' }, { value: 'NE', label: 'NE - Nebraska' },
  { value: 'NV', label: 'NV - Nevada' }, { value: 'NH', label: 'NH - New Hampshire' }, { value: 'NJ', label: 'NJ - New Jersey' },
  { value: 'NM', label: 'NM - New Mexico' }, { value: 'NY', label: 'NY - New York' }, { value: 'NC', label: 'NC - North Carolina' },
  { value: 'ND', label: 'ND - North Dakota' }, { value: 'OH', label: 'OH - Ohio' }, { value: 'OK', label: 'OK - Oklahoma' },
  { value: 'OR', label: 'OR - Oregon' }, { value: 'PA', label: 'PA - Pennsylvania' }, { value: 'RI', label: 'RI - Rhode Island' },
  { value: 'SC', label: 'SC - South Carolina' }, { value: 'SD', label: 'SD - South Dakota' }, { value: 'TN', label: 'TN - Tennessee' },
  { value: 'TX', label: 'TX - Texas' }, { value: 'UT', label: 'UT - Utah' }, { value: 'VT', label: 'VT - Vermont' },
  { value: 'VA', label: 'VA - Virginia' }, { value: 'WA', label: 'WA - Washington' }, { value: 'WV', label: 'WV - West Virginia' },
  { value: 'WI', label: 'WI - Wisconsin' }, { value: 'WY', label: 'WY - Wyoming' }
];

const StateTaxPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const urlState = searchParams.get('state') || ''; 

  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const { goToNextStep } = useOnboarding();

  const [userData, setUserData] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [tempState, setTempState] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successData, setSuccessData] = useState({ message: '', pdf_url: '' });
  
  const [isNoTaxState, setIsNoTaxState] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);
  const [isSwitchingState, setIsSwitchingState] = useState(false);

  // 1. Fetch onboarding data & initial state
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No security token found in the current session.");
      return;
    }

    const fetchOnboardingData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/onboarding/validate/${token}/`);
        const userStateCode = urlState || response.data.state || 'AL';

        setUserData({ ...response.data, state: userStateCode, token: token });

        if (userStateCode) {
          setSelectedState(userStateCode.toUpperCase());
          if (NO_TAX_FORM_STATES.includes(userStateCode.toUpperCase())) {
            setIsNoTaxState(true);
          } else {
            setIsNoTaxState(false);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Invalid or expired session. Please contact HR.");
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [token, urlState]);

  // 2. Auto-redirect timer for no-tax states
  useEffect(() => {
    if (isNoTaxState && redirectCount > 0) {
      const timer = setTimeout(() => setRedirectCount(redirectCount - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isNoTaxState && redirectCount === 0) {
      goToNextStep(); 
    }
  }, [isNoTaxState, redirectCount, goToNextStep]);

  const handleConfirmState = (newState) => {
    const targetState = (newState || tempState || '').toUpperCase();
    if (!targetState) return;
    
    setSelectedState(targetState);
    setUserData(prev => ({ ...prev, state: targetState, token: token }));
    setIsSwitchingState(false);

    // Update URL query param cleanly without reload
    const newParams = new URLSearchParams(searchParams);
    newParams.set('state', targetState);
    setSearchParams(newParams);

    if (NO_TAX_FORM_STATES.includes(targetState)) {
      setIsNoTaxState(true);
      setRedirectCount(3); 
    } else {
      setIsNoTaxState(false);
    }
  };

  const handleTaxSubmit = async (formData) => {
    if (!token) return alert("Error: Security token missing from current session.");

    try {
      const rawPayload = {
        email: formData?.email || userData?.email || '', 
        client_name: formData?.client_name || userData?.client_name || '',
        phone_no: formData?.phone_no || userData?.phone_no || '',
        job_title: formData?.job_title || userData?.job_title || '',
        first_name: formData?.first_name || userData?.first_name || '',
        last_name: formData?.last_name || userData?.last_name || '',
        ssn: formData?.ssn || userData?.ssn || '',
        address: formData?.address || userData?.address || '',
        city: formData?.city || userData?.city || '',
        zipcode: formData?.zipcode || userData?.zipcode || '',
        confirmation_date: formData?.confirmation_date || userData?.confirmation_date || new Date().toISOString().split('T')[0],
        ...formData, 
        state: selectedState || formData?.state || userData?.state || 'AL', 
        token: token 
      };

      // Sanitize payload: ensure null/undefined are converted to safe defaults
      const sanitizedPayload = {};
      Object.entries(rawPayload).forEach(([key, val]) => {
        if (val === null || val === undefined) {
          sanitizedPayload[key] = '';
        } else {
          sanitizedPayload[key] = val;
        }
      });

      const response = await api.post('/confirm-onboarding/', sanitizedPayload);
      if (response.status === 200 || response.status === 201) {
        setSuccessData({ 
          message: response.data.message || `${selectedState} State withholding certificate recorded successfully.`, 
          pdf_url: response.data.pdf_url || response.data.w4_pdf || '' 
        });
        setModalOpen(true);
      }
    } catch (err) {
      console.error("API error:", err);
      let errorMsg = "Unable to save state tax form.";
      if (err.response?.data) {
        const d = err.response.data.error || err.response.data;
        if (typeof d === 'string') {
          errorMsg = d;
        } else if (typeof d === 'object') {
          errorMsg = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
        }
      }
      alert(errorMsg);
    }
  };

  const cardClass = `p-4 sm:p-5 rounded-2xl border transition-all ${
    isDarkMode 
      ? 'bg-[#131722] border-zinc-800 text-zinc-100 shadow-xl' 
      : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
  }`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <PageLoader message="Loading State Tax Withholding Form..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-center max-w-sm mx-auto my-6">
        <AlertCircle size={28} className="mx-auto mb-1.5" />
        <p className="text-xs font-bold">{error}</p>
      </div>
    );
  }

  // --- SCENARIO 1: STATE SELECTION REQUIRED ---
  if (!selectedState) {
    return (
      <div className="w-full max-w-lg mx-auto py-4 space-y-4 animate-in fade-in">
        <div className={cardClass}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md" style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}>
            <Globe size={24} />
          </div>
          
          <div className="text-center mb-4">
            <h2 className="text-lg font-extrabold tracking-tight">Confirm Work State</h2>
            <p className={`text-xs mt-0.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Select the state in which you primarily perform work to load your state withholding certificate.
            </p>
          </div>

          <div className="space-y-3">
            <StunningSelect
              label="Work Location State"
              value={tempState}
              onChange={(e) => setTempState(e.target.value)}
              options={ALL_US_STATES}
              searchable
              placeholder="Select state from list..."
              icon={MapPin}
            />

            <button
              type="button"
              onClick={() => handleConfirmState(tempState)}
              disabled={!tempState}
              style={{ backgroundColor: activeHexColor }}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>Confirm & Load State Form</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SCENARIO 2: NO STATE TAX FORM REQUIRED (e.g. TX, FL, WA) ---
  if (isNoTaxState) {
    return (
      <div className="w-full max-w-lg mx-auto py-4 space-y-4 animate-in fade-in">
        <div className={`${cardClass} text-center`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">No {selectedState} State Tax Form Required</h2>
          <p className={`text-xs mt-1 mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            <strong>{selectedState}</strong> does not levy a state personal income tax withholding on wages. No additional state certificate is needed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setIsSwitchingState(!isSwitchingState)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-200' : 'border-slate-300 bg-slate-100 text-slate-700'
              }`}
            >
              <RefreshCw size={12} />
              <span>Switch State Form for Testing</span>
            </button>
          </div>

          {isSwitchingState && (
            <div className="mb-4 p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 text-left space-y-2">
              <StunningSelect
                label="Select Different State to Test"
                value={tempState || selectedState}
                onChange={(e) => handleConfirmState(e.target.value)}
                options={ALL_US_STATES}
                searchable
                icon={MapPin}
              />
            </div>
          )}

          <div className={`p-3 rounded-xl border mb-4 flex items-center justify-center gap-2 ${
            isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Loader2 size={14} className="animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Advancing to next step in {redirectCount}s...</span>
          </div>

          <button
            type="button"
            onClick={() => goToNextStep()}
            style={{ backgroundColor: activeHexColor }}
            className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Continue Immediately</span>
            <Forward size={14} />
          </button>
        </div>
      </div>
    );
  }

  // --- SCENARIO 3: ACTIVE STATE TAX WITHHOLDING DISPATCHER ---
  return (
    <div className="w-full space-y-4">
      {/* Title Header with State Switcher for Smooth Testing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span 
              className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              Step 4 • State Withholding
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {selectedState} State Withholding Certificate
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Tax withholding documentation for employment in the State of {selectedState}.
          </p>
        </div>

        {/* State Switcher Tool for Repeated Testing */}
        <div className="flex items-center gap-2">
          <div className="w-48">
            <StunningSelect
              value={selectedState}
              onChange={(e) => handleConfirmState(e.target.value)}
              options={ALL_US_STATES}
              searchable
              icon={MapPin}
            />
          </div>
        </div>
      </div>

      {/* State Tax Form Dispatcher */}
      <div className={`${cardClass} state-forms-theme-scope`}>
        <StateTaxFormDispatcher
          userState={selectedState}
          initialData={userData}
          onSubmit={handleTaxSubmit}
        />
      </div>

      {/* Success Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className={`p-6 rounded-3xl border shadow-2xl flex flex-col items-center max-w-sm w-full text-center animate-in zoom-in-95 ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-base font-bold mb-1">{selectedState} Tax Form Saved!</h3>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {successData.message || "Your state withholding certificate has been securely recorded."}
            </p>

            <div className="w-full space-y-2">
              {successData.pdf_url && (
                <a
                  href={successData.pdf_url.startsWith('http') ? successData.pdf_url : `http://techinnovatorsinc-6789.lvh.me:8000${successData.pdf_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isDarkMode ? 'border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <FileText size={13} className="text-blue-500" />
                  <span>View Generated Filled PDF</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isDarkMode ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <RefreshCw size={12} />
                <span>Test Another State Form</span>
              </button>

              <button
                type="button"
                onClick={() => goToNextStep()}
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

export default StateTaxPage;
