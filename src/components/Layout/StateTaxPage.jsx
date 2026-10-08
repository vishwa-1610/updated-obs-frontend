import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, AlertCircle, CheckCircle, MapPin, 
  ShieldCheck, Zap, Sparkles, ArrowRight, Check, Forward, Globe, ChevronDown, FileText, CheckCircle2,
  RefreshCw, Download, ExternalLink, Eye, X, Printer
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
  { value: 'AL', label: 'AL - Alabama (Form A-4)' },
  { value: 'AZ', label: 'AZ - Arizona (Form A-4)' },
  { value: 'AR', label: 'AR - Arkansas (Form AR4EC)' },
  { value: 'CA', label: 'CA - California (Form DE-4)' },
  { value: 'CO', label: 'CO - Colorado (Federal W-4 / DR 0004)' },
  { value: 'CT', label: 'CT - Connecticut (Form CT-W4)' },
  { value: 'DE', label: 'DE - Delaware (Form W-4)' },
  { value: 'DC', label: 'DC - District of Columbia (Form D-4)' },
  { value: 'GA', label: 'GA - Georgia (Form G-4)' },
  { value: 'HI', label: 'HI - Hawaii (Form HW-4)' },
  { value: 'ID', label: 'ID - Idaho (Form ID W-4)' },
  { value: 'IL', label: 'IL - Illinois (Form IL-W-4)' },
  { value: 'IN', label: 'IN - Indiana (Form WH-4)' },
  { value: 'IA', label: 'IA - Iowa (Form IA W-4)' },
  { value: 'KS', label: 'KS - Kansas (Form K-4)' },
  { value: 'KY', label: 'KY - Kentucky (Form K-4)' },
  { value: 'LA', label: 'LA - Louisiana (Form L-4)' },
  { value: 'ME', label: 'ME - Maine (Form W-4ME)' },
  { value: 'MD', label: 'MD - Maryland (Form MW507)' },
  { value: 'MA', label: 'MA - Massachusetts (Form M-4)' },
  { value: 'MI', label: 'MI - Michigan (Form MI-W4)' },
  { value: 'MN', label: 'MN - Minnesota (Form W-4MN)' },
  { value: 'MS', label: 'MS - Mississippi (Form 89-350)' },
  { value: 'MO', label: 'MO - Missouri (Form MO W-4)' },
  { value: 'MT', label: 'MT - Montana (Form MW-4)' },
  { value: 'NE', label: 'NE - Nebraska (Form W-4N)' },
  { value: 'NJ', label: 'NJ - New Jersey (Form NJ-W4)' },
  { value: 'NM', label: 'NM - New Mexico (Federal W-4 Copy)' },
  { value: 'NY', label: 'NY - New York (Form IT-2104)' },
  { value: 'NC', label: 'NC - North Carolina (Form NC-4)' },
  { value: 'ND', label: 'ND - North Dakota (Federal W-4 Copy)' },
  { value: 'OH', label: 'OH - Ohio (Form IT 4)' },
  { value: 'OK', label: 'OK - Oklahoma (Form OK-W-4)' },
  { value: 'OR', label: 'OR - Oregon (Form OR-W-4)' },
  { value: 'PA', label: 'PA - Pennsylvania (Form REV-419)' },
  { value: 'RI', label: 'RI - Rhode Island (Form RI W-4)' },
  { value: 'SC', label: 'SC - South Carolina (Form SC W-4)' },
  { value: 'UT', label: 'UT - Utah (Federal W-4 Copy)' },
  { value: 'VT', label: 'VT - Vermont (Form W-4VT)' },
  { value: 'VA', label: 'VA - Virginia (Form VA-4)' },
  { value: 'WV', label: 'WV - West Virginia (Form WV/IT-104)' },
  { value: 'WI', label: 'WI - Wisconsin (Form WT-4)' },
  // No Personal Income Tax States
  { value: 'AK', label: 'AK - Alaska (No State Tax)' },
  { value: 'FL', label: 'FL - Florida (No State Tax)' },
  { value: 'NV', label: 'NV - Nevada (No State Tax)' },
  { value: 'NH', label: 'NH - New Hampshire (No State Tax)' },
  { value: 'SD', label: 'SD - South Dakota (No State Tax)' },
  { value: 'TN', label: 'TN - Tennessee (No State Tax)' },
  { value: 'TX', label: 'TX - Texas (No State Tax)' },
  { value: 'WA', label: 'WA - Washington (No State Tax)' },
  { value: 'WY', label: 'WY - Wyoming (No State Tax)' }
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
  const [successData, setSuccessData] = useState({ message: '', pdf_url: '', pdf_blob_url: '' });
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false);
  
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
        const userStateCode = (urlState || response.data.state || 'AL').toUpperCase();

        setUserData({ ...response.data, state: userStateCode, token: token });

        if (userStateCode) {
          setSelectedState(userStateCode);
          if (NO_TAX_FORM_STATES.includes(userStateCode)) {
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

  // Convert Base64 Data URI to a local Blob URL for 100% reliable in-browser rendering
  const createBlobFromBase64 = (base64String) => {
    try {
      const parts = base64String.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'application/pdf';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn("Could not create blob from base64:", e);
      return null;
    }
  };

  const handleTaxSubmit = async (formData) => {
    if (!token) return alert("Error: Security token missing from current session.");

    try {
      const signatureVal = formData?.signature || formData?.signature_image || '';
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
        signature: signatureVal,
        signature_image: signatureVal,
        state: selectedState || formData?.state || userData?.state || 'AL', 
        token: token 
      };

      // Sanitize payload
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
        const rawPdfUrl = response.data.pdf_url || response.data.w4_pdf || '';
        const pdfBase64 = response.data.pdf_base64 || '';
        
        let blobUrl = '';
        if (pdfBase64) {
          blobUrl = createBlobFromBase64(pdfBase64);
        }

        const fullPdfUrl = rawPdfUrl 
          ? (rawPdfUrl.startsWith('http') ? rawPdfUrl : `http://techinnovatorsinc-6789.lvh.me:8000${rawPdfUrl}`)
          : '';

        setSuccessData({ 
          message: response.data.message || `${selectedState} State withholding certificate recorded & filled successfully.`, 
          pdf_url: fullPdfUrl,
          pdf_blob_url: blobUrl || fullPdfUrl
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

  const handleDownloadPdf = () => {
    const targetUrl = successData.pdf_blob_url || successData.pdf_url;
    if (!targetUrl) return;

    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `${selectedState}_Withholding_Certificate_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <h2 className="text-lg font-extrabold tracking-tight">Select Work State Form</h2>
            <p className={`text-xs mt-0.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Select the US State certificate you want to test and complete.
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
      {/* Title Header with Dynamic State Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span 
              className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}
            >
              Step 4 • State Withholding
            </span>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Testing for: {userData?.email || 'Candidate'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {selectedState} State Withholding Certificate
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Complete and sign the official state withholding certificate. Change state anytime using the selector on the right.
          </p>
        </div>

        {/* Dynamic State Switcher Tool for Repeated Testing */}
        <div className="flex items-center gap-2 min-w-[240px]">
          <div className="w-full">
            <StunningSelect
              label="Switch State Form"
              value={selectedState}
              onChange={(e) => handleConfirmState(e.target.value)}
              options={ALL_US_STATES}
              searchable
              icon={MapPin}
            />
          </div>
        </div>
      </div>

      {/* State Tax Form Dispatcher (Loads the exact dynamic form for the selected state) */}
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
          <div className={`p-6 rounded-3xl border shadow-2xl flex flex-col items-center max-w-md w-full text-center animate-in zoom-in-95 ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-lg font-bold mb-1">{selectedState} Tax Form Saved & Generated!</h3>
            <p className={`text-xs mb-4 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {successData.message || "Your state withholding certificate has been generated and filed."}
            </p>

            <div className="w-full space-y-2.5">
              {/* PDF Preview & Direct Download Buttons */}
              {(successData.pdf_blob_url || successData.pdf_url) && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewPdfOpen(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                  >
                    <Eye size={14} />
                    <span>Preview Filled PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Download Generated PDF"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                </div>
              )}

              {/* Retest Another State Button */}
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                }}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isDarkMode ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <RefreshCw size={13} />
                <span>Test Another State Form</span>
              </button>

              {/* Continue Progression */}
              <button
                type="button"
                onClick={() => goToNextStep()}
                style={{ backgroundColor: activeHexColor }}
                className="w-full py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Continue to Next Step (Direct Deposit)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded High-Definition PDF Full Preview Modal */}
      {previewPdfOpen && (successData.pdf_blob_url || successData.pdf_url) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`rounded-3xl border shadow-2xl flex flex-col w-full max-w-4xl h-[90vh] overflow-hidden ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                <h3 className="text-sm font-bold">{selectedState} Filled Withholding Certificate Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20 transition-all"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPdfOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-700/50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-zinc-900 overflow-hidden relative">
              <object
                data={successData.pdf_blob_url || successData.pdf_url}
                type="application/pdf"
                className="w-full h-full border-0"
              >
                <iframe
                  src={successData.pdf_blob_url || successData.pdf_url}
                  title="Filled State Tax PDF"
                  className="w-full h-full border-0"
                />
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateTaxPage;
