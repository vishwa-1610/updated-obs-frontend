import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, AlertCircle, CheckCircle, MapPin, 
  ShieldCheck, Zap, ArrowRight, Check, Forward, Globe, ChevronDown, FileText, CheckCircle2,
  RefreshCw, Download, ExternalLink, Eye, X, Printer, User, Building, DollarSign, Calendar, Edit3, CheckCheck, ZoomIn, ZoomOut, Maximize2
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
  { value: 'UT', label: 'UT - Utah (Form W-4 Withholding Certificate)' },
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
  
  // Verification Modal State
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [successData, setSuccessData] = useState({ message: '', pdf_url: '', pdf_blob_url: '', page_images: [] });
  const [previewMode, setPreviewMode] = useState('visual'); // 'visual' | 'native'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'fields' | 'pdf'
  
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

        setSubmittedData(sanitizedPayload);
        setSuccessData({ 
          message: response.data.message || `${selectedState} State withholding certificate recorded & filled successfully.`, 
          pdf_url: fullPdfUrl,
          pdf_blob_url: blobUrl || fullPdfUrl,
          page_images: response.data.page_images || []
        });
        setZoomLevel(100);
        if (response.data.page_images && response.data.page_images.length > 0) {
          setPreviewMode('visual');
        }
        setVerificationModalOpen(true);
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

  // Helper to extract state-specific parameters dynamically for the inspector
  const renderFieldRows = () => {
    if (!submittedData) return null;

    // 1. Dynamic Filing Status Resolution
    let filingStatusDisplay = '—';
    if (submittedData.marital_letter) {
      const gaLetterNames = {
        'A': 'Single (Letter A)',
        'B': 'Married Separate / Both Work (Letter B)',
        'C': 'Married Joint - One Works (Letter C)',
        'D': 'Head of Household (Letter D)'
      };
      filingStatusDisplay = gaLetterNames[submittedData.marital_letter] || `Letter ${submittedData.marital_letter}`;
    } else if (submittedData.filing_status_hi) {
      const hiNames = {
        '1': 'Single / Separate / Disabled (Status 1)',
        '2': 'Married Filing Jointly (Status 2)',
        '3': 'Married (Higher Single Rate) (Status 3)'
      };
      filingStatusDisplay = hiNames[submittedData.filing_status_hi] || `Status ${submittedData.filing_status_hi}`;
    } else if (submittedData.allowance_rate) {
      filingStatusDisplay = submittedData.allowance_rate === '2' 
        ? 'Rate 2: Joint (Married - Spouse Not Working)' 
        : 'Rate 1: Single (or Married - Spouse Working)';
    } else if (submittedData.withholding_percentage) {
      filingStatusDisplay = submittedData.zero_withholding ? "Zero Withholding Election" : `${submittedData.withholding_percentage}% Withholding Rate`;
    } else if (submittedData.status_letter) {
      filingStatusDisplay = `Status (${submittedData.status_letter})`;
    } else if (submittedData.filing_status) {
      filingStatusDisplay = submittedData.filing_status;
    } else if (submittedData.marital_status) {
      filingStatusDisplay = submittedData.marital_status;
    }

    // 2. Allowances & Dependents Resolution
    const depVal = submittedData.dependents !== undefined && submittedData.dependents !== '' 
      ? String(submittedData.dependents)
      : (submittedData.allowances !== undefined && submittedData.allowances !== ''
          ? String(submittedData.allowances)
          : (submittedData.exemptions !== undefined && submittedData.exemptions !== ''
              ? String(submittedData.exemptions)
              : '0'));

    // 3. Dynamic Section Categories
    const categories = {
      'Personal': [
        { label: 'Full Legal Name', value: `${submittedData.first_name || ''} ${submittedData.last_name || ''}`.trim() || '—' },
        { label: 'Social Security Number (SSN)', value: submittedData.ssn ? `•••-••-${submittedData.ssn.slice(-4)}` : '—' },
        { label: 'Work State Form', value: `${submittedData.state || selectedState} (Official State Certificate)` },
      ],
      'Address': [
        { label: 'Residential Address', value: submittedData.address || '—' },
        { label: 'City, State, Zip', value: `${submittedData.city || ''}, ${submittedData.state || selectedState} ${submittedData.zipcode || ''}`.trim() },
      ],
      'Filing Status & Core Allowances': [
        { label: 'Confirmation / Sign Date', value: submittedData.confirmation_date || '—' },
        { label: 'Filing Status / Letter', value: filingStatusDisplay },
        { label: 'Dependents / Allowances', value: depVal },
        { label: 'Additional Withholding', value: submittedData.additional_withholding ? `$${Number(submittedData.additional_withholding).toFixed(2)}` : '$0.00' },
        ...(submittedData.total_allowances !== undefined && submittedData.total_allowances !== '' ? [{ label: 'Total Allowances (Line 7)', value: String(submittedData.total_allowances) }] : []),
      ],
      'Employer Information': [
        { label: 'Employer / Company Name', value: submittedData.client_name || 'Tech Innovators Inc' },
        { label: 'Position / Job Title', value: submittedData.job_title || 'Software Engineer' },
      ],
      'Contact Information': [
        { label: 'Contact Email', value: submittedData.email || '—' },
        { label: 'Contact Phone', value: submittedData.phone_no || '—' },
      ]
    };

    // 4. Add Worksheet Calculations if applicable
    const worksheetItems = [];
    const exemptionItems = [];
    if (submittedData.use_worksheet !== undefined) {
      worksheetItems.push({ label: 'Worksheet Used', value: submittedData.use_worksheet ? 'Yes (Completed Line 5)' : 'No' });
    }
    if (submittedData.itemized_deductions && Number(submittedData.itemized_deductions) > 0) {
      worksheetItems.push({ label: 'Est. Itemized Deductions (Line A)', value: `$${Number(submittedData.itemized_deductions).toLocaleString()}` });
    }
    if (submittedData.allowable_adjustments && Number(submittedData.allowable_adjustments) > 0) {
      worksheetItems.push({ label: 'Allowable Adjustments (Line D)', value: `$${Number(submittedData.allowable_adjustments).toLocaleString()}` });
    }
    if (submittedData.taxable_income_not_subject && Number(submittedData.taxable_income_not_subject) > 0) {
      worksheetItems.push({ label: 'Taxable Non-Wage Income (Line F)', value: `$${Number(submittedData.taxable_income_not_subject).toLocaleString()}` });
    }
    if (submittedData.adjustments_allowances !== undefined && submittedData.adjustments_allowances !== '') {
      worksheetItems.push({ label: 'Adjustments Allowances (Line 5)', value: String(submittedData.adjustments_allowances) });
    }
    if (submittedData.use_itemized) {
      worksheetItems.push({ label: 'Itemized Deductions (Line H)', value: 'Yes (Completed Page 2)' });
      if (submittedData.fed_itemized) worksheetItems.push({ label: 'Federal Itemized (Line 1)', value: `$${Number(submittedData.fed_itemized).toLocaleString()}` });
      if (submittedData.adjustments) worksheetItems.push({ label: 'State Adjustments (Line 4)', value: `$${Number(submittedData.adjustments).toLocaleString()}` });
      if (submittedData.nonwage_income) worksheetItems.push({ label: 'Non-Wage Income (Line 6)', value: `$${Number(submittedData.nonwage_income).toLocaleString()}` });
    }
    if (submittedData.tax_credits && Number(submittedData.tax_credits) > 0) {
      worksheetItems.push({ label: 'Estimated Tax Credits (Line G)', value: `$${Number(submittedData.tax_credits).toLocaleString()}` });
    }
    if (submittedData.age_allowances && Number(submittedData.age_allowances) > 0) {
      worksheetItems.push({ label: 'Age 65+ Allowances (Line D)', value: String(submittedData.age_allowances) });
    }
    if (submittedData.state === 'UT' || selectedState === 'UT') {
      if (submittedData.step3_total && Number(submittedData.step3_total) > 0) {
        worksheetItems.push({ label: 'Dependent Credits (Step 3)', value: `$${Number(submittedData.step3_total).toLocaleString()}` });
      }
      if (submittedData.step4_other_income && Number(submittedData.step4_other_income) > 0) {
        worksheetItems.push({ label: 'Other Income (Step 4a)', value: `$${Number(submittedData.step4_other_income).toLocaleString()}` });
      }
      if (submittedData.step4_deductions && Number(submittedData.step4_deductions) > 0) {
        worksheetItems.push({ label: 'Deductions (Step 4b)', value: `$${Number(submittedData.step4_deductions).toLocaleString()}` });
      }
    }
    if (submittedData.state === 'VT' || selectedState === 'VT') {
      if (submittedData.line1 !== undefined) worksheetItems.push({ label: 'Yourself Allowance (Line 1)', value: String(submittedData.line1) });
      if (submittedData.line2 !== undefined) worksheetItems.push({ label: 'Spouse Allowance (Line 2)', value: String(submittedData.line2) });
      if (submittedData.line3 !== undefined) worksheetItems.push({ label: 'Dependents Allowance (Line 3)', value: String(submittedData.line3) });
      if (submittedData.line4 !== undefined) worksheetItems.push({ label: 'Head of Household (Line 4)', value: String(submittedData.line4) });
      if (submittedData.line5 !== undefined || submittedData.total_allowances !== undefined) {
        worksheetItems.push({ label: 'Total Vermont Allowances (Line 5)', value: String(submittedData.line5 ?? submittedData.total_allowances) });
      }
      if (submittedData.exempt) {
        exemptionItems.push({ label: 'Vermont Exemption', value: 'EXEMPT (No Tax Liability)' });
      }
    }
    if (submittedData.state === 'KS' || selectedState === 'KS') {
      if (submittedData.claim_self !== undefined) worksheetItems.push({ label: 'Self Allowance (Line B)', value: submittedData.claim_self ? 'Claimed (+1)' : 'Not Claimed (0)' });
      if (submittedData.married) worksheetItems.push({ label: 'Married Status (Line C)', value: submittedData.spouse_works ? 'Married (Spouse Works)' : 'Married (Spouse Does Not Work - +1)' });
      if (submittedData.head_of_household) worksheetItems.push({ label: 'Head of Household (Line D)', value: 'Yes (+2 Allowances)' });
      if (submittedData.dependents) worksheetItems.push({ label: 'Dependents (Line E)', value: String(submittedData.dependents) });
    }
    if (submittedData.state === 'VA' || selectedState === 'VA') {
      const l1 = submittedData.line1 ?? submittedData.line1_yourself;
      const l2 = submittedData.line2 ?? submittedData.line2_spouse;
      const l3 = submittedData.line3 ?? submittedData.line3_dependents;
      const l4 = submittedData.line4 ?? submittedData.line4_subtotal;
      const l7 = submittedData.line7 ?? submittedData.line7_subtotal_age_blind;
      const l8 = submittedData.line8 ?? submittedData.line8_total_exemptions ?? submittedData.total_exemptions ?? submittedData.cert_line1c;
      if (l1 !== undefined) worksheetItems.push({ label: 'Yourself Exemption (Line 1)', value: String(l1) });
      if (l2 !== undefined) worksheetItems.push({ label: 'Spouse Exemption (Line 2)', value: String(l2) });
      if (l3 !== undefined) worksheetItems.push({ label: 'Dependents (Line 3)', value: String(l3) });
      if (l4 !== undefined) worksheetItems.push({ label: 'Subtotal Personal (Line 4)', value: String(l4) });
      if (l7 !== undefined && Number(l7) > 0) {
        worksheetItems.push({ label: 'Age 65+ & Blindness (Line 7)', value: String(l7) });
      }
      if (l8 !== undefined) {
        worksheetItems.push({ label: 'Total VA Exemptions (Line 8 / Line 1c)', value: String(l8) });
      }
    }
    if (submittedData.state === 'WV' || selectedState === 'WV') {
      if (submittedData.line1 !== undefined) worksheetItems.push({ label: 'Single Exemption (Line 1)', value: String(submittedData.line1) });
      if (submittedData.line2 !== undefined) worksheetItems.push({ label: 'Married Exemptions (Line 2)', value: String(submittedData.line2) });
      if (submittedData.line3 !== undefined || submittedData.dependents !== undefined) {
        worksheetItems.push({ label: 'Dependents (Line 3)', value: String(submittedData.line3 ?? submittedData.dependents) });
      }
      if (submittedData.line4 !== undefined || submittedData.total_exemptions !== undefined) {
        worksheetItems.push({ label: 'Total WV Exemptions (Line 4)', value: String(submittedData.line4 ?? submittedData.total_exemptions) });
      }
      if (submittedData.lower_rate) {
        worksheetItems.push({ label: 'Lower Tax Rate (Line 5)', value: 'Yes (Single / One Job Rate)' });
      }
    }
    if (submittedData.state === 'WI' || selectedState === 'WI') {
      if (submittedData.line1a !== undefined) worksheetItems.push({ label: 'Yourself Exemption (Line 1a)', value: String(submittedData.line1a) });
      if (submittedData.line1b !== undefined) worksheetItems.push({ label: 'Spouse Exemption (Line 1b)', value: String(submittedData.line1b) });
      if (submittedData.line1c !== undefined || submittedData.dependents !== undefined) {
        worksheetItems.push({ label: 'Dependents (Line 1c)', value: String(submittedData.line1c ?? submittedData.dependents) });
      }
      if (submittedData.line1d !== undefined || submittedData.total_exemptions !== undefined) {
        worksheetItems.push({ label: 'Total WI Exemptions (Line 1d)', value: String(submittedData.line1d ?? submittedData.total_exemptions) });
      }
    }
    if (submittedData.state === 'AZ' || selectedState === 'AZ') {
      if (submittedData.zero_withholding) {
        exemptionItems.push({ label: 'Arizona Election (Box 2)', value: 'Zero (0%) Withholding - No AZ Tax Liability Expected' });
      } else {
        worksheetItems.push({ label: 'Arizona Withholding Rate (Box 1)', value: `${submittedData.withholding_percentage || '2.0'}% of Gross Taxable Wages` });
        if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
          worksheetItems.push({ label: 'Extra Withholding per Paycheck', value: `$${Number(submittedData.additional_withholding).toFixed(2)}` });
        }
      }
    }
    if (submittedData.state === 'AR' || selectedState === 'AR') {
      let line1Desc = 'None Claimed (0)';
      if (submittedData.line1a || submittedData.line1_selection === '1a') line1Desc = 'Line 1a: Yourself (1 Exemption)';
      else if (submittedData.line1b || submittedData.line1_selection === '1b') line1Desc = 'Line 1b: Yourself & Spouse (2 Exemptions)';
      else if (submittedData.line1c || submittedData.line1_selection === '1c') line1Desc = 'Line 1c: Head of Household (2 Exemptions)';
      worksheetItems.push({ label: 'Personal Exemption (Line 1)', value: line1Desc });

      if (submittedData.dependents !== undefined) {
        worksheetItems.push({ label: 'Dependents Claimed (Line 2)', value: String(submittedData.dependents) });
      }
      
      const calcTotal = (submittedData.line1a ? 1 : (submittedData.line1b || submittedData.line1c ? 2 : 0)) + Number(submittedData.dependents || 0);
      worksheetItems.push({ label: 'Total AR Exemptions (Line 3)', value: String(submittedData.total_exemptions ?? calcTotal) });

      if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
        worksheetItems.push({ label: 'Additional Withholding (Line 4)', value: `$${Number(submittedData.additional_withholding).toFixed(2)}` });
      }
      worksheetItems.push({ 
        label: 'Low-Income Tax Rates (Line 5)', 
        value: submittedData.low_income ? 'Qualified (Yes)' : 'Standard Rates (No)' 
      });
      const statusLabels = { '1': 'Single', '2': 'Married Filing Jointly', '3': 'Head of Household' };
      if (submittedData.filing_status) {
        worksheetItems.push({ 
          label: 'Arkansas Filing Status', 
          value: statusLabels[submittedData.filing_status] || submittedData.filing_status 
        });
      }
    }
    if (submittedData.state === 'CA' || selectedState === 'CA') {
      const statusLabels = { 
        '1': 'Single / Married (two or more incomes)', 
        '2': 'Married (one income)', 
        '3': 'Head of Household' 
      };
      if (submittedData.filing_status) {
        worksheetItems.push({ 
          label: 'California Filing Status', 
          value: statusLabels[submittedData.filing_status] || submittedData.filing_status 
        });
      }
      const wka = (Number(submittedData.allow_self) || 0) + (Number(submittedData.allow_spouse) || 0) + (Number(submittedData.allow_dependents) || 0) + (Number(submittedData.allow_blind_self) || 0) + (Number(submittedData.allow_blind_spouse) || 0);
      worksheetItems.push({ label: 'Regular Allowances (Line 1a / Worksheet A)', value: String(wka || 1) });
      if (submittedData.total_allowances !== undefined || submittedData.total_allowances_1c !== undefined) {
        worksheetItems.push({ label: 'Total California Allowances (Line 1c)', value: String(submittedData.total_allowances ?? submittedData.total_allowances_1c ?? wka) });
      }
      if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
        worksheetItems.push({ label: 'Additional Withholding per Pay Period (Line 2)', value: `$${Number(submittedData.additional_withholding).toFixed(2)}` });
      }
      if (submittedData.exempt) {
        exemptionItems.push({ label: 'California Exemption (Line 3)', value: 'EXEMPT (No Tax Liability Incurred & None Expected)' });
      }
      if (submittedData.military_spouse_exempt) {
        exemptionItems.push({ label: 'MSRRA Military Spouse Exemption (Line 4)', value: 'EXEMPT (Nonresident Military Spouse)' });
      }
    }
    if (submittedData.state === 'CO' || selectedState === 'CO') {
      const coStatusLabels = {
        '1': 'Single',
        'single': 'Single',
        '2': 'Married Filing Jointly',
        'married': 'Married Filing Jointly',
        '3': 'Married Filing Separately',
        'mfs': 'Married Filing Separately',
        '4': 'Head of Household',
        'hoh': 'Head of Household',
        '5': 'Qualifying Surviving Spouse'
      };
      if (submittedData.filing_status) {
        worksheetItems.push({
          label: 'Colorado Filing Status',
          value: coStatusLabels[submittedData.filing_status] || submittedData.filing_status
        });
      }
      if (submittedData.num_jobs !== undefined) {
        worksheetItems.push({ label: 'Qualifying Jobs in Household', value: String(submittedData.num_jobs) });
      }
      if (submittedData.use_worksheet_1) {
        worksheetItems.push({ label: 'Allowance Method', value: 'Worksheet 1 (Itemized Deductions & Child Tax Credit)' });
        if (submittedData.annual_income) {
          worksheetItems.push({ label: 'Estimated Annual Income', value: `$${Number(submittedData.annual_income).toLocaleString()}` });
        }
        if (submittedData.dependents !== undefined) {
          worksheetItems.push({ label: 'Qualifying Dependents', value: String(submittedData.dependents) });
        }
      } else {
        worksheetItems.push({
          label: 'Allowance Method',
          value: submittedData.use_table_1 !== false ? 'Standard Table 1 Lookup' : 'Manual Annual Allowance'
        });
      }
      if (submittedData.annual_withholding_allowance !== undefined && submittedData.annual_withholding_allowance !== '') {
        worksheetItems.push({
          label: 'Annual Withholding Allowance (Line 2)',
          value: `$${Number(submittedData.annual_withholding_allowance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        });
      }
      if (submittedData.use_worksheet_2) {
        worksheetItems.push({ label: 'Additional Withholding Method', value: 'Worksheet 2 (Non-Wage / Non-Business Income)' });
        if (submittedData.non_business_income) {
          worksheetItems.push({ label: 'Non-Business Income', value: `$${Number(submittedData.non_business_income).toLocaleString()}` });
        }
      }
      if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
        worksheetItems.push({
          label: 'Additional Withholding per Pay Period (Line 3)',
          value: `$${Number(submittedData.additional_withholding).toFixed(2)}`
        });
      }
    }
    if (submittedData.state === 'CT' || selectedState === 'CT') {
      const ctCodeLabels = {
        'A': 'Code A (Married Filing Separately)',
        'B': 'Code B (Head of Household)',
        'C': 'Code C (Married Filing Jointly)',
        'D': 'Code D (Single / High Non-Wage Income)',
        'E': 'Code E (Exempt / Low Income Threshold)',
        'F': 'Code F (Single / Elderly-Disabled Credit)'
      };
      if (submittedData.filing_status) {
        const rawCode = String(submittedData.filing_status).trim().toUpperCase();
        worksheetItems.push({
          label: 'Connecticut Withholding Code (Line 1)',
          value: ctCodeLabels[rawCode] || `Code ${rawCode}`
        });
      }
      if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
        worksheetItems.push({
          label: 'Additional Withholding per Pay Period (Line 2)',
          value: `$${Number(submittedData.additional_withholding).toFixed(2)}`
        });
      }
      const reducedVal = submittedData.reduced_withholding ?? submittedData.allowances;
      if (reducedVal && Number(reducedVal) > 0) {
        worksheetItems.push({
          label: 'Reduced Withholding per Pay Period (Line 3)',
          value: `$${Number(reducedVal).toFixed(2)}`
        });
      }
      if (submittedData.msrra_exempt || submittedData.military_spouse_exempt) {
        const dom = submittedData.military_state || submittedData.domicile_state || 'Non-CT';
        exemptionItems.push({
          label: 'MSRRA Military Spouse Exemption',
          value: `EXEMPT (Legal Domicile: ${dom})`
        });
      }
      worksheetItems.push({
        label: 'New or Rehired Employee',
        value: (submittedData.new_rehired === 'yes' || submittedData.is_new_rehired) 
          ? `Yes (Hire Date: ${submittedData.rehire_date || submittedData.start_date || 'On File'})` 
          : 'No'
      });
    }
    if (submittedData.state === 'DE' || selectedState === 'DE') {
      const maritalLabel = String(submittedData.marital_status || '').toLowerCase() === 'married' ? 'Married' : 'Single';
      worksheetItems.push({
        label: 'Marital Status (Line 3)',
        value: maritalLabel
      });
      worksheetItems.push({
        label: 'Total Dependents Claimed (Line 4)',
        value: String(submittedData.dependents ?? 0)
      });
      if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
        worksheetItems.push({
          label: 'Additional Withholding per Paycheck (Line 5)',
          value: `$${Number(submittedData.additional_withholding).toFixed(2)}`
        });
      }
      if (submittedData.child_credit && Number(submittedData.child_credit) > 0) {
        worksheetItems.push({
          label: 'Child / Dependent Care Credit (Line C)',
          value: `${submittedData.child_credit} child(ren)`
        });
      }
      if (submittedData.self_60_or_older || submittedData.spouse_60_or_older || submittedData.is_self_65 || submittedData.is_spouse_65 || submittedData.is_self_blind || submittedData.is_spouse_blind) {
        const specialFlags = [];
        if (submittedData.self_60_or_older) specialFlags.push('Self 60+');
        if (submittedData.spouse_60_or_older) specialFlags.push('Spouse 60+');
        if (submittedData.is_self_65) specialFlags.push('Self 65+');
        if (submittedData.is_self_blind) specialFlags.push('Self Blind');
        if (submittedData.is_spouse_65) specialFlags.push('Spouse 65+');
        if (submittedData.is_spouse_blind) specialFlags.push('Spouse Blind');
        worksheetItems.push({
          label: 'Age / Special Allowances',
          value: specialFlags.join(', ')
        });
      }
      if (submittedData.itemized_deductions && Number(submittedData.itemized_deductions) > 0) {
        worksheetItems.push({
          label: 'Estimated Itemized Deductions (Line 1)',
          value: `$${Number(submittedData.itemized_deductions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        });
      }
      if (submittedData.use_non_resident) {
        worksheetItems.push({
          label: 'Non-Resident Worksheet (DE-W4NR)',
          value: `Active (DE Wages: $${Number(submittedData.nr_wages || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}, Pay Periods: ${submittedData.nr_pay_periods || 26})`
        });
      }
    }

    if (submittedData.state === 'DC' || selectedState === 'DC') {
      const dcStatusMap = {
        '1': 'Single',
        '2': 'Married / Domestic Partners Filing Jointly',
        '3': 'Married Filing Separately',
        '4': 'Head of Household',
        '5': 'Married Filing Separately on Same Return'
      };
      const rawStatus = String(submittedData.filing_status || '1').trim();
      worksheetItems.push({
        label: 'Filing Status (Line 1)',
        value: dcStatusMap[rawStatus] || `Status ${rawStatus}`
      });

      if (submittedData.dependents !== undefined && submittedData.dependents !== null) {
        worksheetItems.push({
          label: 'Number of Dependents',
          value: String(submittedData.dependents)
        });
      }

      if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
        worksheetItems.push({
          label: 'Additional Withholding per Paycheck (Line 3)',
          value: `$${Number(submittedData.additional_withholding).toFixed(2)}`
        });
      }

      if (submittedData.exempt || submittedData.claiming_exempt) {
        exemptionItems.push({
          label: 'Exemption from Withholding (Line 4)',
          value: submittedData.is_student ? 'EXEMPT (Full-Time Student)' : 'EXEMPT'
        });
      }

      if (submittedData.domicile_other || submittedData.other_state_name) {
        worksheetItems.push({
          label: 'Non-DC Domicile State (Line 5)',
          value: submittedData.other_state_name || submittedData.domicile_state || 'Other State'
        });
      }

      if (submittedData.use_worksheet_2) {
        worksheetItems.push({
          label: 'Section B Additional Allowances',
          value: `Active (Itemized: $${Number(submittedData.itemized_deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})`
        });
      }
    }

    if (submittedData.state === 'GA' || selectedState === 'GA') {
      const gaLetterMap = {
        'A': 'Single (Letter A)',
        'B': 'Married Filing Separate or Joint (Both Spouses Work) (Letter B)',
        'C': 'Married Filing Joint (One Spouse Works) (Letter C)',
        'D': 'Head of Household (Letter D)'
      };
      const rawLetter = String(submittedData.marital_letter || 'A').trim().toUpperCase();
      worksheetItems.push({
        label: 'Marital Status Letter (Line 7)',
        value: gaLetterMap[rawLetter] || `Letter ${rawLetter}`
      });

      if (!submittedData.exempt_a && !submittedData.exempt_b) {
        worksheetItems.push({
          label: 'Dependent Allowances (Line 4)',
          value: String(submittedData.dependents ?? 0)
        });

        if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
          worksheetItems.push({
            label: 'Additional Withholding per Paycheck (Line 6)',
            value: `$${Number(submittedData.additional_withholding).toFixed(2)}`
          });
        }
      }

      if (submittedData.exempt_a) {
        exemptionItems.push({
          label: 'Georgia Income Tax Exemption (Line 8a)',
          value: 'EXEMPT (No Tax Liability Incurred or Expected)'
        });
      }

      if (submittedData.exempt_b) {
        exemptionItems.push({
          label: 'Military Spouse Exemption (Line 8b)',
          value: `EXEMPT (Servicemember State: ${submittedData.military_state || 'N/A'}, Spouse State: ${submittedData.spouse_military_state || submittedData.military_state || 'N/A'})`
        });
      }

      if (submittedData.use_worksheet) {
        worksheetItems.push({
          label: 'Georgia Adjustments Allowance Worksheet',
          value: `Active (Itemized: $${Number(submittedData.itemized_deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})`
        });
      }
    }

    if (submittedData.state === 'HI' || selectedState === 'HI') {
      const hiStatusMap = {
        '1': 'Single / Married Filing Separately / Head of Household (Status 1)',
        '2': 'Married Filing Jointly (Status 2)',
        '3': 'Married Jointly (Higher Single Rate) (Status 3)'
      };
      const rawStatus = String(submittedData.filing_status_hi || submittedData.filing_status || '1');
      worksheetItems.push({
        label: 'Hawaii Filing Status (Line 3)',
        value: hiStatusMap[rawStatus] || `Status ${rawStatus}`
      });

      if (!submittedData.certified_disabled && !submittedData.military_spouse) {
        worksheetItems.push({
          label: 'Dependents Claimed (Line E)',
          value: String(submittedData.dependents ?? 0)
        });

        if (submittedData.age_allowances && Number(submittedData.age_allowances) > 0) {
          worksheetItems.push({
            label: 'Age 65+ Allowances (Line D)',
            value: String(submittedData.age_allowances)
          });
        }

        if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
          worksheetItems.push({
            label: 'Additional Withholding per Paycheck (Line 5)',
            value: `$${Number(submittedData.additional_withholding).toFixed(2)}`
          });
        }
      }

      if (submittedData.certified_disabled) {
        exemptionItems.push({
          label: 'Certified Disabled Person (Line 3)',
          value: 'EXEMPT (Not Subject to Withholding under Booklet A)'
        });
      }

      if (submittedData.military_spouse) {
        exemptionItems.push({
          label: 'Nonresident Military Spouse (Line 3)',
          value: 'EXEMPT (Not Subject to Withholding under Federal Law)'
        });
      }

      if (submittedData.use_itemized || submittedData.use_worksheet) {
        worksheetItems.push({
          label: 'Hawaii Deductions & Adjustments Worksheet',
          value: `Active (Itemized: $${Number(submittedData.fed_itemized || submittedData.itemized_deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})`
        });
      }
    }

    if (submittedData.state === 'IA' || selectedState === 'IA') {
      const iaStatusMap = {
        '1': 'Other (Including Single)',
        '2': 'Head of Household',
        '3': 'Married Filing Jointly'
      };
      const rawStatus = String(submittedData.filing_status_ia || submittedData.filing_status || '1');
      worksheetItems.push({
        label: 'Iowa Filing Status',
        value: iaStatusMap[rawStatus] || `Status ${rawStatus}`
      });

      if (!submittedData.exempt && !submittedData.military_spouse) {
        worksheetItems.push({
          label: 'Personal Allowances (Line 1)',
          value: `$${Number(submittedData.personal_allow ?? 40)}`
        });

        if (submittedData.depend_allow || submittedData.dependents) {
          worksheetItems.push({
            label: 'Allowances for Dependents (Line 2)',
            value: `$${Number(submittedData.depend_allow || (Number(submittedData.dependents || 0) * 40))}`
          });
        }

        if (submittedData.total_allow || submittedData.line6) {
          worksheetItems.push({
            label: 'Total Allowances (Line 6)',
            value: `$${Number(submittedData.total_allow || submittedData.line6 || 0)}`
          });
        }

        if (submittedData.additional_withholding && Number(submittedData.additional_withholding) > 0) {
          worksheetItems.push({
            label: 'Additional Withholding per Pay Period (Line 7)',
            value: `$${Number(submittedData.additional_withholding).toFixed(2)}`
          });
        }
      }

      if (submittedData.exempt) {
        exemptionItems.push({
          label: 'Iowa Income Tax Exemption',
          value: `EXEMPT (Effective Year: ${submittedData.exempt_year || new Date().getFullYear()})`
        });
      }

      if (submittedData.military_spouse) {
        exemptionItems.push({
          label: 'Military Spouses Residency Relief Act',
          value: `EXEMPT (State of Domicile: ${submittedData.domicile_state || 'Other State'})`
        });
      }

      if (submittedData.itemized_allow || submittedData.fed_itemized) {
        worksheetItems.push({
          label: 'Iowa Itemized Deductions Worksheet',
          value: `Active (Allowances: $${Number(submittedData.itemized_allow || 0)})`
        });
      }

      if (submittedData.health_coverage !== undefined) {
        worksheetItems.push({
          label: 'Dependent Health Coverage (Centralized Registry)',
          value: submittedData.health_coverage ? `Available (Qualifies: ${submittedData.coverage_date || 'N/A'})` : 'Not Available'
        });
      }
    }

    if (worksheetItems.length > 0) {
      categories['Worksheet & Deduction Details'] = worksheetItems;
    }

    // 5. Add Exemption details if applicable
    if (submittedData.exempt) {
      exemptionItems.push({ label: 'Tax Exemption Claimed', value: submittedData.is_student ? 'Yes (Full-Time Student Exemption)' : 'Yes (Full Exemption)' });
    }
    if (submittedData.exempt_a) {
      exemptionItems.push({ label: 'Total Exemption (Line 8a)', value: 'Yes (Claimed Full GA Exemption)' });
    }
    if (submittedData.exempt_b) {
      exemptionItems.push({ label: 'Military Exemption (Line 8b)', value: `Yes (Military State: ${submittedData.military_state || 'N/A'})` });
    }
    if (submittedData.domicile_other || submittedData.other_state_name) {
      exemptionItems.push({ label: 'Legal Domicile State', value: submittedData.other_state_name || 'Outside State Domicile' });
    }
    if (submittedData.certified_disabled) {
      exemptionItems.push({ label: 'Certified Disabled Person', value: 'Yes (Exempt under Booklet A)' });
    }
    if (submittedData.military_spouse) {
      exemptionItems.push({ label: 'Military Spouse Exemption', value: 'Yes (Nonresident Military Spouse)' });
    }
    if (submittedData.state === 'VA' || selectedState === 'VA') {
      if (submittedData.exempt || submittedData.is_exempt || submittedData.cert_line3_exempt) {
        exemptionItems.push({ label: 'Virginia Exemption (Line 3)', value: 'EXEMPT (No Tax Liability Incurred & None Expected)' });
      }
      if (submittedData.military_exempt || submittedData.military_spouse_relief || submittedData.cert_line4_msrra) {
        exemptionItems.push({ label: 'MSRRA Military Spouse Relief (Line 4)', value: `EXEMPT (Legal Domicile: ${submittedData.other_state_name || submittedData.domicile_state || 'Other State'})` });
      }
    }
    if (submittedData.state === 'WV' || selectedState === 'WV') {
      if (submittedData.use_nonresidence || submittedData.is_nonresident || submittedData.exempt) {
        const nrState = submittedData.nonresident_state || submittedData.other_state_name || 'Reciprocal State';
        if (submittedData.military_spouse || submittedData.military_exempt) {
          exemptionItems.push({ label: 'MSRRA Nonresident Exemption (WV/IT-104NR)', value: `EXEMPT (Legal Domicile: ${nrState})` });
        } else {
          exemptionItems.push({ label: 'Reciprocal State Nonresident (WV/IT-104NR)', value: `EXEMPT (Resident of: ${nrState})` });
        }
      }
    }
    if (submittedData.state === 'WI' || selectedState === 'WI') {
      if (submittedData.exempt || submittedData.line3 === 'EXEMPT') {
        exemptionItems.push({ label: 'Wisconsin Complete Exemption (Line 3)', value: 'EXEMPT (No Tax Liability Last Year & None Anticipated)' });
      }
    }
    if (submittedData.state === 'MS' || selectedState === 'MS') {
      if (submittedData.total_exemption) {
        exemptionItems.push({ label: 'Total Exemption Claimed (Line 6)', value: `$${Number(submittedData.total_exemption).toLocaleString()}` });
      }
      if (submittedData.spouse_employed) {
        exemptionItems.push({ label: 'Spouse Employed Split (Line 2b)', value: `$${Number(submittedData.spouse_claim_amount || 0).toLocaleString()}` });
      }
      if (submittedData.military_spouse_exempt) {
        exemptionItems.push({ label: 'Military Spouse Relief Act (Line 8)', value: 'EXEMPT' });
      }
      const msAgeBlind = [];
      if (submittedData.age_65) msAgeBlind.push('Taxpayer 65+');
      if (submittedData.blind_self) msAgeBlind.push('Taxpayer Blind');
      if (submittedData.spouse_65) msAgeBlind.push('Spouse 65+');
      if (submittedData.spouse_blind) msAgeBlind.push('Spouse Blind');
      if (msAgeBlind.length > 0) {
        exemptionItems.push({ label: 'Age 65+ / Blindness Exemptions (Line 5)', value: `${msAgeBlind.join(', ')} ($${(msAgeBlind.length * 1500).toLocaleString()})` });
      }
    }
    if (submittedData.state === 'MN' || selectedState === 'MN') {
      if (submittedData.exemption_box) {
        exemptionItems.push({ label: 'Section 2 Exemption Reason', value: `Box ${submittedData.exemption_box.toUpperCase()}` });
      }
      if (submittedData.cdib_number) {
        exemptionItems.push({ label: 'MN Reservation / CDIB', value: `${submittedData.reservation_name || 'Tribal Member'} (CDIB #${submittedData.cdib_number})` });
      }
      if (submittedData.state_of_domicile) {
        exemptionItems.push({ label: 'MN Nonresident Domicile State', value: submittedData.state_of_domicile });
      }
    }
    if (submittedData.state === 'MO' || selectedState === 'MO') {
      const filingLabels = {
        '1': 'Single or Married Spouse Works',
        '2': 'Married (Spouse Does Not Work)',
        '3': 'Head of Household'
      };
      if (submittedData.filing_status_mo) {
        exemptionItems.push({ label: 'MO Filing Status (Line 1)', value: filingLabels[submittedData.filing_status_mo] || submittedData.filing_status_mo });
      }
      if (submittedData.reduced_withholding && Number(submittedData.reduced_withholding) > 0) {
        exemptionItems.push({ label: 'Reduced Withholding (Line 3)', value: `$${Number(submittedData.reduced_withholding).toFixed(2)}` });
      }
      if (submittedData.exempt) {
        const moReasonLabels = {
          '1': 'Zero Tax Liability (Refund last year & expect none)',
          '2': 'SCRA / MSRRA Military Spouse Relief Act',
          '3': 'Active Duty Armed Forces Military Deduction'
        };
        exemptionItems.push({ label: 'Missouri Exemption (Line 4)', value: `EXEMPT (${moReasonLabels[submittedData.exempt_reason] || 'Statutory Exemption'})` });
      }
    }
    if (exemptionItems.length > 0) {
      categories['State Exemptions & Special Conditions'] = exemptionItems;
    }

    return (
      <div className="space-y-4">
        {Object.entries(categories).map(([cat, catRows]) => {
          if (!catRows || catRows.length === 0) return null;
          return (
            <div key={cat} className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/70'}`}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeHexColor }}></span>
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{cat}</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {catRows.map((r, idx) => (
                  <div key={idx} className={`p-2 rounded-xl border flex flex-col justify-center ${r.label.toLowerCase().includes('address') ? 'sm:col-span-2' : ''} ${isDarkMode ? 'bg-[#121217] border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{r.label}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 break-words mt-0.5" title={r.value}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Digital Signature Preview Card */}
        {submittedData.signature_image && (
          <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/70'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Captured Digital Signature</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCheck size={12} /> Verified
              </span>
            </div>
            <div className={`p-3 rounded-xl border flex items-center justify-center ${isDarkMode ? 'bg-white/5 border-zinc-700' : 'bg-white border-slate-200'}`}>
              <img src={submittedData.signature_image} alt="Digital Signature" className="max-h-16 object-contain" />
            </div>
          </div>
        )}
      </div>
    );
  };

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
              Candidate: {userData?.email || 'Candidate'}
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

      {/* COMPREHENSIVE SIDE-BY-SIDE VERIFICATION POPUP MODAL */}
      {verificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`rounded-3xl border shadow-2xl flex flex-col w-full max-w-7xl h-[92vh] overflow-hidden animate-in zoom-in-95 ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Modal Top Header Bar */}
            <div className={`flex flex-wrap items-center justify-between p-4 px-6 border-b gap-3 ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold">{selectedState} Withholding Certificate Verified</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Live Verification Inspector
                    </span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Compare what you submitted on the left against the official generated PDF on the right.
                  </p>
                </div>
              </div>

              {/* View Switcher & Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Tab Switcher on Mobile/Tablet */}
                <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
                  isDarkMode ? 'bg-zinc-800/80 border-zinc-700' : 'bg-slate-200/80 border-slate-300'
                }`}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('split')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'split' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-zinc-300 hover:text-current'
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fields')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'fields' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-zinc-300 hover:text-current'
                    }`}
                  >
                    Submitted Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pdf')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'pdf' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-zinc-300 hover:text-current'
                    }`}
                  >
                    Generated PDF
                  </button>
                </div>

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20 transition-all shadow-sm"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setVerificationModalOpen(false)}
                  className={`p-2 rounded-xl border transition-all ${
                    isDarkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'
                  }`}
                  title="Close Inspector"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Side-by-Side (or Tabbed) Verification View */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
              
              {/* LEFT COLUMN: Submitted Parameters & Input Summary */}
              <div className={`p-4 sm:p-5 overflow-y-auto ${
                activeTab === 'pdf' ? 'hidden lg:block lg:col-span-5' : (activeTab === 'fields' ? 'col-span-12' : 'col-span-12 lg:col-span-5')
              } ${isDarkMode ? 'bg-[#10121a]' : 'bg-slate-50/50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Edit3 size={16} className="text-blue-500" />
                    <h3 className="text-sm font-extrabold">Submitted Form Values</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                    {Object.keys(submittedData || {}).length} Parameters Recorded
                  </span>
                </div>
                
                {/* Form Fields Cards List */}
                {renderFieldRows()}
              </div>

              {/* RIGHT COLUMN: Live Official Generated PDF & Visual Document Inspector */}
              <div className={`flex flex-col relative overflow-hidden ${
                activeTab === 'fields' ? 'hidden lg:flex lg:col-span-7' : (activeTab === 'pdf' ? 'col-span-12' : 'col-span-12 lg:col-span-7')
              } ${isDarkMode ? 'bg-[#0d0f15]' : 'bg-slate-900'}`}>
                {/* Viewer Top Sub-Header */}
                <div className="p-2.5 px-4 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 flex flex-wrap items-center justify-between text-xs text-zinc-300 gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-emerald-400" />
                    <span className="font-bold text-white">Live Official {selectedState} Certificate Preview</span>
                    {successData.page_images && successData.page_images.length > 0 && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        {successData.page_images.length} {successData.page_images.length === 1 ? 'Page' : 'Pages'}
                      </span>
                    )}
                  </div>

                  {/* Mode & Zoom Controls */}
                  <div className="flex items-center gap-2">
                    {/* View Switcher: High-Def Visual vs Native PDF */}
                    {successData.page_images && successData.page_images.length > 0 && (
                      <div className="flex items-center p-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setPreviewMode('visual')}
                          className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                            previewMode === 'visual' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Visual Pages
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode('native')}
                          className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                            previewMode === 'native' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Native PDF
                        </button>
                      </div>
                    )}

                    {/* Zoom Buttons (Visual Mode) */}
                    {previewMode === 'visual' && successData.page_images && successData.page_images.length > 0 && (
                      <div className="flex items-center gap-1 bg-zinc-800/80 border border-zinc-700/80 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setZoomLevel(prev => Math.max(prev - 15, 60))}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-all"
                          title="Zoom Out"
                        >
                          <ZoomOut size={13} />
                        </button>
                        <span className="text-[10px] font-bold text-zinc-300 px-1 min-w-[34px] text-center">
                          {zoomLevel}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setZoomLevel(prev => Math.min(prev + 15, 150))}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-all"
                          title="Zoom In"
                        >
                          <ZoomIn size={13} />
                        </button>
                      </div>
                    )}

                    {/* Open in New Tab Button */}
                    {successData.pdf_url && (
                      <a
                        href={successData.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-700/60"
                        title="Open PDF in New Browser Tab"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Viewer Content Body */}
                <div className="flex-1 w-full h-full relative overflow-hidden bg-[#12141c]">
                  {/* Option A: High-Definition Rendered Pages (100% Reliable, 0% Black Screen) */}
                  {previewMode === 'visual' && successData.page_images && successData.page_images.length > 0 ? (
                    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 flex flex-col items-center gap-6">
                      {successData.page_images.map((imgSrc, idx) => (
                        <div key={idx} className="flex flex-col items-center w-full transition-all duration-200" style={{ maxWidth: `${zoomLevel}%` }}>
                          <div className="w-full flex items-center justify-between text-[11px] text-zinc-400 font-bold mb-1.5 px-1">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                              Page {idx + 1} of {successData.page_images.length}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium">Form ID W-4 Official Document</span>
                          </div>
                          <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-700/60 transition-all">
                            <img
                              src={imgSrc}
                              alt={`Official ${selectedState} Certificate Page ${idx + 1}`}
                              className="w-full h-auto block select-none pointer-events-auto"
                              loading="eager"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Option B: Native Embedded PDF Frame */
                    <div className="w-full h-full relative overflow-hidden bg-zinc-900">
                      <iframe
                        src={`${successData.pdf_url || successData.pdf_blob_url}#toolbar=0&navpanes=0`}
                        title="Filled State Tax PDF"
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Bottom Action Footer Bar */}
            <div className={`p-4 px-6 border-t flex flex-wrap items-center justify-between gap-3 ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVerificationModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isDarkMode ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Edit3 size={14} />
                  <span>Modify Form Fields & Re-Submit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationModalOpen(false);
                    setSelectedState('');
                    setTempState('');
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isDarkMode ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <RefreshCw size={14} />
                  <span>Select Another State Form</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToNextStep()}
                  style={{ backgroundColor: activeHexColor }}
                  className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <span>Approve & Continue to Direct Deposit</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StateTaxPage;
