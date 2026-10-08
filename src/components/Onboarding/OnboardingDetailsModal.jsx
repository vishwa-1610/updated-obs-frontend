import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User, Briefcase, Calendar, MapPin, Mail, Phone, FileText, 
  Users, Download, Hash, Home, Landmark, CreditCard, Percent,
  ShieldCheck, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle,
  FileCheck2, Shield, Sparkles, X, ChevronRight, Building2, Check, Globe,
  Send, UserCheck, Loader2, Edit3, Save, RefreshCw, Layers, DollarSign,
  Sliders, ArrowRight
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { fetchBankDetails, clearBankDetails } from '../../store/onboardingSlice';
import api from '../../api';
import StateTaxFormDispatcher from './StateForms/StateTaxFormDispatcher';

// Helper to ensure full backend URL for media PDFs
const formatPdfUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const { hostname, protocol } = window.location;
  let backendOrigin = `${protocol}//${hostname}:8000`;
  if (hostname.includes('obs.tiswatech.com')) {
    backendOrigin = `https://${hostname.replace('obs.tiswatech.com', 'secureobs.tiswatech.com')}`;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendOrigin}${cleanPath}`;
};

// Safe Error Formatter ensuring no raw objects are ever returned to React renderers
const formatErrorMessage = (err) => {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;

  const extractString = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.map(extractString).filter(Boolean).join(', ');
    if (typeof val === 'object') {
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${extractString(v)}`)
        .filter(Boolean)
        .join(' | ');
    }
    return String(val);
  };

  const resData = err.response?.data;
  if (resData) {
    if (typeof resData === 'string') return resData;
    if (resData.error) return extractString(resData.error);
    if (resData.message) return extractString(resData.message);
    if (resData.detail) return extractString(resData.detail);
    return extractString(resData);
  }
  return err.message ? String(err.message) : 'An unexpected error occurred.';
};

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' }
];

const OnboardingDetailsModal = ({ 
  isOpen, 
  onClose, 
  onboarding,
  onResendInvite,
  onVerifyI9,
  onConvertToEmployee,
  onRegretCandidate,
  actionLoading = false,
  remindingCandidateId = null
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [extraDetails, setExtraDetails] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [revealedBankFields, setRevealedBankFields] = useState({});
  const { isDarkMode, accentColor, themeColors } = useTheme();
  const dispatch = useDispatch();

  // --- EDIT FORMS & DYNAMIC REGENERATION STATE ---
  const [isEditingForms, setIsEditingForms] = useState(false);
  const [editTab, setEditTab] = useState('federal_w4');
  const [isSavingForms, setIsSavingForms] = useState(false);
  const [editFeedback, setEditFeedback] = useState({ type: null, message: '' });
  const [editFormState, setEditFormState] = useState({});
  const [useInteractiveStateDispatcher, setUseInteractiveStateDispatcher] = useState(false);

  const activeThemeHex = useMemo(() => {
    return themeColors && themeColors[accentColor] ? themeColors[accentColor].primary : '#2563eb';
  }, [themeColors, accentColor]);

  // Unified PDF Preview Handler with Blob fetch to prevent iframe blocking
  const handleOpenPdfPreview = async (url, title) => {
    const fullUrl = formatPdfUrl(url);
    if (!fullUrl) return;
    setPreviewPdfTitle(title || 'Document Preview');
    setPreviewPdfUrl(fullUrl);
    setPreviewLoading(true);

    try {
      const res = await fetch(fullUrl);
      if (!res.ok) {
        throw new Error(`Failed to load PDF (${res.status})`);
      }
      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(pdfBlob);
      setPreviewBlobUrl(objectUrl);
    } catch (err) {
      console.warn('PDF blob loading fallback to direct link:', err);
      setPreviewBlobUrl(fullUrl);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePdfPreview = () => {
    if (previewBlobUrl && previewBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewPdfUrl(null);
  };

  // 1. SELECT BANK DATA FROM STORE
  const { bankDetails, bankLoading } = useSelector((state) => state.onboarding);

  // 2. ID RESOLUTION LOGIC
  const coreOnboardingId = useMemo(() => {
    if (!onboarding) return null;
    if (onboarding.onboarding && typeof onboarding.onboarding === 'object') {
        return onboarding.onboarding.id;
    }
    if (onboarding.onboarding) {
        return onboarding.onboarding;
    }
    return onboarding.id;
  }, [onboarding]);

  const loadDetailedData = async () => {
    if (!coreOnboardingId) return;
    try {
      setLoadingExtra(true);
      const res = await api.get(`/onboarding/${coreOnboardingId}/`);
      if (res.data) {
        setExtraDetails(res.data);
      }
    } catch (err) {
      // Fallback to existing onboarding object
    } finally {
      setLoadingExtra(false);
    }
  };

  // Fetch full details if token or ID available to get all sub-forms
  useEffect(() => {
    if (!isOpen || !coreOnboardingId) return;

    dispatch(fetchBankDetails(coreOnboardingId));
    loadDetailedData();

    return () => {
      dispatch(clearBankDetails());
      setExtraDetails(null);
      handleClosePdfPreview();
      setIsEditingForms(false);
    };
  }, [isOpen, coreOnboardingId, dispatch]);

  // Merged onboarding data
  const data = useMemo(() => {
    return {
      ...(onboarding || {}),
      ...(extraDetails || {}),
    };
  }, [onboarding, extraDetails]);

  // Initialize edit form values from current data
  const initEditFormState = (candidateData) => {
    const fedData = candidateData?.w4_data || candidateData?.federal_w4_data || {};
    const stData = candidateData?.state_w4_data || {};
    return {
      // Personal Info
      first_name: candidateData?.first_name || '',
      middle_initial: candidateData?.middle_initial || '',
      last_name: candidateData?.last_name || '',
      email: candidateData?.email || '',
      phone_no: candidateData?.phone_no || '',
      ssn: candidateData?.ssn || fedData?.ssn || stData?.ssn || '',
      address: candidateData?.address || fedData?.address || stData?.address || '',
      city: candidateData?.city || fedData?.city || stData?.city || '',
      state: candidateData?.state || fedData?.state || stData?.state || 'NC',
      zipcode: candidateData?.zipcode || fedData?.zipcode || stData?.zipcode || '',

      // Federal W-4 Form
      filing_status: String(fedData?.filing_status || candidateData?.filing_status || '1'),
      multiple_jobs_two: Boolean(fedData?.multiple_jobs_two || candidateData?.multiple_jobs_two || false),
      kids_under_17: fedData?.kids_under_17 ?? candidateData?.dependents ?? 0,
      other_dependents: fedData?.other_dependents ?? 0,
      other_credits: fedData?.other_credits ?? 0,
      step4_other_income: fedData?.step4_other_income ?? 0,
      step4_deductions: fedData?.step4_deductions ?? candidateData?.federal_deductions ?? 0,
      step4_extra_withholding: fedData?.step4_extra_withholding ?? candidateData?.additional_withholding ?? 0,
      federal_exempt: Boolean(fedData?.federal_exempt || candidateData?.exempt || false),

      // State Tax Form (Flexible State-Specific Keys)
      state_code: (candidateData?.state || stData?.state || 'NC').toUpperCase(),
      allowances: stData?.allowances ?? candidateData?.allowances ?? 0,
      state_additional_withholding: stData?.additional_withholding ?? candidateData?.additional_withholding ?? 0,
      status_letter: (stData?.status_letter && String(stData.status_letter).length <= 2) ? String(stData.status_letter) : '',
      county: stData?.county || candidateData?.county || '',
      blind_claim: Boolean(stData?.blind_claim),
      spouse_blind: Boolean(stData?.spouse_blind),
      head_of_household: Boolean(stData?.head_of_household || stData?.is_head_of_household),
      exempt_status: Boolean(stData?.exempt_status || stData?.exempt),
      custom_state_data: { ...stData },

      // Direct Deposit / Bank
      bank_name: candidateData?.bank_name || (candidateData?.bank_accounts?.[0]?.bank_name) || '',
      account_holder_name: candidateData?.account_holder_name || `${candidateData?.first_name || ''} ${candidateData?.last_name || ''}`.trim(),
      routing_number: candidateData?.routing_number || (candidateData?.bank_accounts?.[0]?.routing_number) || '',
      account_number: candidateData?.account_number || (candidateData?.bank_accounts?.[0]?.account_number) || '',
      account_type: candidateData?.account_type || (candidateData?.bank_accounts?.[0]?.account_type) || 'Checking',
      percentage: candidateData?.percentage || 100,

      // Emergency Contacts
      ec1_name: candidateData?.ec1_name || '',
      ec1_relationship: candidateData?.ec1_relationship || '',
      ec1_phone: candidateData?.ec1_phone || '',
      ec1_email: candidateData?.ec1_email || '',
      ec2_name: candidateData?.ec2_name || '',
      ec2_relationship: candidateData?.ec2_relationship || '',
      ec2_phone: candidateData?.ec2_phone || '',
      ec2_email: candidateData?.ec2_email || '',
    };
  };

  const handleOpenEditModal = (targetTab = 'federal_w4') => {
    setEditFormState(initEditFormState(data));
    setEditTab(targetTab);
    setEditFeedback({ type: null, message: '' });
    setUseInteractiveStateDispatcher(false);
    setIsEditingForms(true);
  };

  const handleEditFieldChange = (field, value) => {
    setEditFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // SAVE & REGENERATE FORMS & PDFS
  const handleSaveAndRegenerate = async (e, customPayload = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSavingForms(true);
    setEditFeedback({ type: null, message: '' });

    try {
      const baseState = customPayload || editFormState;
      const candidateToken = data.token || (data.onboarding && data.onboarding.token) || extraDetails?.token || null;
      const candidateEmail = baseState.email || data.email || (data.onboarding && data.onboarding.email) || extraDetails?.email || '';
      const candidateId = coreOnboardingId;
      const token = candidateToken || String(candidateId);
      const stateCode = (baseState.state_code || baseState.state || data.state || 'NC').toUpperCase();

      // Clean status_letter ensuring max_length is respected
      let cleanStatusLetter = '';
      if (baseState.status_letter && typeof baseState.status_letter === 'string' && baseState.status_letter.length <= 2) {
        cleanStatusLetter = baseState.status_letter.toUpperCase();
      }

      const confirmDate = data.confirmation_date || data.completed_at || new Date().toISOString().split('T')[0];
      const cleanZip = String(baseState.zipcode || '').replace(/[^0-9]/g, '').slice(0, 5) || String(baseState.zipcode || '').slice(0, 5);

      // 1. Submit Federal Form W-4 Payload
      const federalPayload = {
        token: token,
        onboarding_id: candidateId,
        email: candidateEmail,
        first_name: baseState.first_name,
        last_name: baseState.last_name,
        phone_no: baseState.phone_no,
        address: baseState.address,
        city: baseState.city,
        state: stateCode,
        zipcode: cleanZip,
        ssn: baseState.ssn,
        filing_status: String(baseState.filing_status || '1'),
        kids_under_17: Number(baseState.kids_under_17 || 0),
        other_dependents: Number(baseState.other_dependents || 0),
        step4_other_income: Number(baseState.step4_other_income || 0),
        step4_deductions: Number(baseState.step4_deductions || 0),
        step4_extra_withholding: Number(baseState.step4_extra_withholding || 0),
        federal_exempt: Boolean(baseState.federal_exempt),
        multiple_jobs_two: Boolean(baseState.multiple_jobs_two),
        confirmation_date: confirmDate,
      };
      await api.post('/federal-tax/', federalPayload);

      // 2. Submit State Tax Form Payload
      try {
        const statePayload = {
          token: token,
          onboarding_id: candidateId,
          email: candidateEmail,
          first_name: baseState.first_name,
          last_name: baseState.last_name,
          phone_no: baseState.phone_no,
          address: baseState.address,
          city: baseState.city,
          state: stateCode,
          zipcode: cleanZip,
          ssn: baseState.ssn,
          filing_status: baseState.filing_status || 'Single',
          allowances: Number(baseState.allowances || 0),
          additional_withholding: Number(baseState.state_additional_withholding || baseState.step4_extra_withholding || 0),
          status_letter: cleanStatusLetter,
          confirmation_date: confirmDate,
          ...(baseState.custom_state_data || {}),
        };
        await api.post('/confirm-onboarding/', statePayload);
      } catch (stErr) {
        console.warn('State form PDF sync note:', stErr);
      }

      // 3. Submit Personal Details
      try {
        await api.post('/personal-details/', {
          token: token,
          onboarding_id: candidateId,
          email: candidateEmail,
          first_name: baseState.first_name,
          last_name: baseState.last_name,
          phone_no: baseState.phone_no,
          address: baseState.address,
          city: baseState.city,
          state: stateCode,
          zipcode: cleanZip,
          ssn: baseState.ssn,
          confirmation_date: confirmDate,
        });
      } catch (pdErr) {
        console.warn('Personal details sync note:', pdErr);
      }

      // 4. Submit Bank Details if present
      if (baseState.routing_number || baseState.account_number) {
        try {
          await api.post('/bank-details/', {
            token: token,
            onboarding_id: candidateId,
            email: candidateEmail,
            bank_accounts: [{
              bank_name: baseState.bank_name || '',
              account_holder_name: baseState.account_holder_name || `${baseState.first_name || ''} ${baseState.last_name || ''}`.trim(),
              routing_number: baseState.routing_number || '',
              account_number: baseState.account_number || '',
              account_type: baseState.account_type || 'Checking',
              percentage: Number(baseState.percentage || 100),
            }]
          });
        } catch (bkErr) {
          console.warn('Bank details sync note:', bkErr);
        }
      }

      // 5. Submit Emergency Contacts if present
      if (baseState.ec1_name) {
        try {
          await api.post('/emergency-contact/', {
            token: token,
            onboarding_id: candidateId,
            email: candidateEmail,
            ec1_name: baseState.ec1_name,
            ec1_relationship: baseState.ec1_relationship || 'Emergency Contact',
            ec1_phone: baseState.ec1_phone,
            ec1_email: baseState.ec1_email,
            ec2_name: baseState.ec2_name,
            ec2_relationship: baseState.ec2_relationship,
            ec2_phone: baseState.ec2_phone,
            ec2_email: baseState.ec2_email,
          });
        } catch (ecErr) {
          console.warn('Emergency contact sync note:', ecErr);
        }
      }

      // 6. Reload updated detailed data and add cache buster for instant PDF refresh
      if (coreOnboardingId) {
        const res = await api.get(`/onboarding/${coreOnboardingId}/`);
        if (res.data) {
          const timestamp = Date.now();
          const refreshed = { ...res.data };
          if (refreshed.federal_w4_pdf) refreshed.federal_w4_pdf += `?t=${timestamp}`;
          if (refreshed.w4_pdf) refreshed.w4_pdf += `?t=${timestamp}`;
          setExtraDetails(refreshed);
        }
        dispatch(fetchBankDetails(coreOnboardingId));
      }

      setEditFeedback({
        type: 'success',
        message: `${stateCode} State & Federal W-4 forms updated and official PDFs re-rendered successfully!`
      });

      setTimeout(() => {
        setIsEditingForms(false);
        setEditFeedback({ type: null, message: '' });
      }, 1200);

    } catch (err) {
      console.error('Error updating form details and regenerating PDF:', err);
      setEditFeedback({
        type: 'error',
        message: formatErrorMessage(err)
      });
    } finally {
      setIsSavingForms(false);
    }
  };

  // Extract all available documents
  const documentsList = useMemo(() => {
    if (!data) return [];
    const docs = [];

    const fedUrl = formatPdfUrl(data.federal_w4_pdf);
    if (fedUrl) {
      docs.push({
        id: 'fed_w4',
        name: 'IRS Form W-4 (Federal Tax Withholding)',
        type: 'Federal Tax',
        url: fedUrl,
        status: 'Generated & Signed'
      });
    }

    const stateUrl = formatPdfUrl(data.w4_pdf);
    if (stateUrl) {
      const stateLabel = data.state ? `${data.state.toUpperCase()} State Withholding Certificate` : 'State Tax Withholding Form';
      docs.push({
        id: 'state_w4',
        name: stateLabel,
        type: 'State Tax',
        url: stateUrl,
        status: 'Generated & Signed'
      });
    }

    const rawI9Url = data.i9_pdf || data.i9_data?.pdf_file;
    const i9Url = formatPdfUrl(rawI9Url);
    if (i9Url) {
      docs.push({
        id: 'i9_form',
        name: 'USCIS Form I-9 (Employment Eligibility)',
        type: 'Compliance',
        url: i9Url,
        status: data.i9_data?.status || 'Signed'
      });
    }

    if (Array.isArray(data.all_documents)) {
      data.all_documents.forEach((d, idx) => {
        const docUrl = formatPdfUrl(d.url);
        if (docUrl && !docs.some(existing => existing.url === docUrl)) {
          docs.push({
            id: d.id || `doc_${idx}`,
            name: d.name || `Document #${idx + 1}`,
            type: d.category || 'Compliance',
            url: docUrl,
            status: d.status || 'Available'
          });
        }
      });
    }

    return docs;
  }, [data]);

  // Unified Bank Accounts List
  const allBankAccounts = useMemo(() => {
    if (bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0) {
      return bankDetails;
    }
    if (data?.bank_accounts && Array.isArray(data.bank_accounts) && data.bank_accounts.length > 0) {
      return data.bank_accounts;
    }
    if (data?.bank_details && Array.isArray(data.bank_details) && data.bank_details.length > 0) {
      return data.bank_details;
    }
    if (data?.bank_name || data?.account_number) {
      return [{
        id: 'primary_bank',
        bank_name: data.bank_name,
        account_holder_name: data.account_holder_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        account_number: data.account_number,
        routing_number: data.routing_number,
        account_type: data.account_type || 'Checking',
        percentage: data.percentage || 100
      }];
    }
    return [];
  }, [bankDetails, data]);

  // Unified Emergency Contacts List
  const allEmergencyContacts = useMemo(() => {
    if (data?.emergency_contacts && Array.isArray(data.emergency_contacts) && data.emergency_contacts.length > 0) {
      return data.emergency_contacts;
    }
    const list = [];
    if (data?.ec1_name) {
      list.push({
        id: 'ec1',
        name: data.ec1_name,
        relationship: data.ec1_relationship || 'Emergency Contact',
        phone: data.ec1_phone,
        phone_number: data.ec1_phone,
        email: data.ec1_email,
        address: data.ec1_address,
        is_primary: true
      });
    }
    if (data?.ec2_name) {
      list.push({
        id: 'ec2',
        name: data.ec2_name,
        relationship: data.ec2_relationship || 'Secondary Contact',
        phone: data.ec2_phone,
        phone_number: data.ec2_phone,
        email: data.ec2_email,
        address: data.ec2_address,
        is_primary: false
      });
    }
    return list;
  }, [data]);

  // 4. MEMOIZE TABS
  const tabs = useMemo(() => {
    if (!data) return [];

    const list = [
      { id: 'details', label: 'Candidate Info', icon: User, count: null },
      { id: 'job', label: 'Assignment & Job', icon: Briefcase, count: null },
      { id: 'tax', label: 'Tax & Withholding (W-4)', icon: FileCheck2, count: null },
      { id: 'i9', label: 'USCIS Form I-9', icon: ShieldCheck, count: null },
      { id: 'bank', label: 'Direct Deposit', icon: Landmark, count: allBankAccounts.length || null },
      { id: 'emergency', label: 'Emergency Contacts', icon: Users, count: allEmergencyContacts.length || null },
      { id: 'documents', label: 'All Documents (PDFs)', icon: FileText, count: documentsList.length || null },
    ];

    return list;
  }, [data, allBankAccounts, allEmergencyContacts, documentsList]);

  if (!data || !isOpen) return null;

  const isConfirmed = data.is_confirmed || data.confirmation_status === 'Confirmed' || data.status === 'COMPLETED' || data.status === true;

  // --- TAB CONTENT RENDERERS ---

  const renderCandidateInfo = () => (
    <div className="space-y-4">
      {/* DIGITAL SIGNATURE AUDIT CERTIFICATE */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDarkMode ? 'bg-gradient-to-r from-blue-950/20 via-zinc-900 to-emerald-950/20 border-zinc-800' : 'bg-gradient-to-r from-blue-50/70 via-white to-emerald-50/70 border-blue-100 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0 border border-emerald-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm">Digital Signature Verification</h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  IRS & USCIS Certified
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Electronically signed under penalties of perjury by <span className="font-semibold text-zinc-800 dark:text-zinc-200">{data.first_name} {data.last_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono">
            <div className={`px-3 py-1.5 rounded-xl border text-[11px] flex items-center gap-1.5 ${
              isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}>
              <Calendar size={13} className="text-blue-500" />
              <span>Signed: {data.confirmation_date || data.completed_at || data.start_date || 'Enrolled'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL PROFILE CARD */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
        <div className={`flex items-center justify-between pb-3 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
              <User size={15} />
            </div>
            <h3 className="font-bold text-sm">Personal Identity</h3>
          </div>
          <button
            type="button"
            onClick={() => handleOpenEditModal('personal')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 size={13} /> Edit Personal Info
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          <DetailItem icon={User} label="Legal Full Name" value={`${data.first_name || ''} ${data.middle_initial || ''} ${data.last_name || ''}`.trim()} isDarkMode={isDarkMode} />
          <DetailItem icon={Mail} label="Email Address" value={data.email} isDarkMode={isDarkMode} />
          <DetailItem icon={Phone} label="Primary Phone" value={data.phone_no} isDarkMode={isDarkMode} />
          <DetailItem icon={Hash} label="Social Security Number (SSN)" value={data.ssn ? `•••-••-${String(data.ssn).slice(-4)}` : null} isDarkMode={isDarkMode} />
          <DetailItem icon={Calendar} label="Date of Birth" value={data.dob || data.date_of_birth} isDarkMode={isDarkMode} />
          <DetailItem icon={Shield} label="Gender" value={data.gender} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* RESIDENTIAL ADDRESS CARD */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
        <div className={`flex items-center justify-between pb-3 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
              <MapPin size={15} />
            </div>
            <h3 className="font-bold text-sm">Residential Address</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <DetailItem icon={Home} label="Street Address" value={data.address} isDarkMode={isDarkMode} fullWidth />
          <DetailItem icon={MapPin} label="City" value={data.city} isDarkMode={isDarkMode} />
          <DetailItem icon={MapPin} label="State" value={data.state} isDarkMode={isDarkMode} />
          <DetailItem icon={Hash} label="Zip Code" value={data.zipcode} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );

  const renderJobInfo = () => (
    <div className="space-y-4">
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
        <div className={`flex items-center gap-2 pb-3 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
            <Briefcase size={15} />
          </div>
          <h3 className="font-bold text-sm">Assignment & Client Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          <DetailItem icon={Building2} label="Client Name" value={data.client_name || data.client?.client_name} isDarkMode={isDarkMode} />
          <DetailItem icon={Briefcase} label="Job Title" value={data.job_title} isDarkMode={isDarkMode} />
          <DetailItem icon={MapPin} label="Work / Resident State" value={data.state} isDarkMode={isDarkMode} />
          <DetailItem icon={Calendar} label="Assignment Start Date" value={data.start_date} isDarkMode={isDarkMode} />
          <DetailItem icon={Calendar} label="Assignment End Date" value={data.end_date} isDarkMode={isDarkMode} />
          <DetailItem icon={Calendar} label="Confirmation Date" value={data.confirmation_date} isDarkMode={isDarkMode} />
          {data.notes && (
            <DetailItem icon={FileText} label="Compliance Notes" value={data.notes} isDarkMode={isDarkMode} fullWidth />
          )}
        </div>
      </div>
    </div>
  );

  const renderTaxInfo = () => {
    const fedData = data.w4_data || data.federal_w4_data || {};
    const stData = data.state_w4_data || {};
    const stateCode = (data.state || stData.state || fedData.state || 'State').toUpperCase();
    const displayStatusLetter = typeof stData.status_letter === 'object' 
      ? JSON.stringify(stData.status_letter) 
      : (stData.status_letter || data.status_letter || (typeof stData.filing_status === 'object' ? JSON.stringify(stData.filing_status) : stData.filing_status) || 'Standard');

    const formatFilingStatus = (val) => {
      if (val === '1' || val === 1 || val === 'Single') return 'Single / Separate';
      if (val === '2' || val === 2 || val === 'Married') return 'Married Jointly';
      if (val === '3' || val === 3 || val === 'Head of Household') return 'Head of Household';
      return val || 'Single';
    };

    return (
      <div className="space-y-5">
        {/* Federal W-4 Summary */}
        <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className={`flex items-center justify-between pb-3.5 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                <FileCheck2 size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Federal W-4 Withholding Election</h3>
                <p className="text-[11px] text-zinc-400">IRS Form W-4 compliance parameters</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditModal('federal_w4')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={13} /> Edit Federal W-4
              </button>
              {data.federal_w4_pdf && (
                <button
                  type="button"
                  onClick={() => handleOpenPdfPreview(data.federal_w4_pdf, "IRS Form W-4 (Federal)")}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={13} /> View Federal W-4
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <DetailItem 
              icon={Hash} 
              label="Filing Status" 
              value={formatFilingStatus(fedData.filing_status || data.filing_status)} 
              isDarkMode={isDarkMode} 
            />
            <DetailItem 
              icon={Users} 
              label="Dependents (<17)" 
              value={fedData.kids_under_17 !== undefined && fedData.kids_under_17 !== null ? String(fedData.kids_under_17) : (data.dependents !== undefined && data.dependents !== null ? String(data.dependents) : '0')} 
              isDarkMode={isDarkMode} 
            />
            <DetailItem 
              icon={Users} 
              label="Other Dependents" 
              value={fedData.other_dependents !== undefined && fedData.other_dependents !== null ? String(fedData.other_dependents) : '0'} 
              isDarkMode={isDarkMode} 
            />
            <DetailItem 
              icon={Percent} 
              label="Extra Withholding" 
              value={fedData.step4_extra_withholding !== undefined && fedData.step4_extra_withholding !== null ? `$${fedData.step4_extra_withholding}` : (data.additional_withholding ? `$${data.additional_withholding}` : '$0')} 
              isDarkMode={isDarkMode} 
            />
            <DetailItem 
              icon={Hash} 
              label="Other Income" 
              value={fedData.step4_other_income !== undefined && fedData.step4_other_income !== null ? `$${fedData.step4_other_income}` : '$0'} 
              isDarkMode={isDarkMode} 
            />
            <DetailItem 
              icon={Hash} 
              label="Deductions" 
              value={fedData.step4_deductions !== undefined && fedData.step4_deductions !== null ? `$${fedData.step4_deductions}` : (data.federal_deductions ? `$${data.federal_deductions}` : '$0')} 
              isDarkMode={isDarkMode} 
            />
            <DetailItem 
              icon={ShieldCheck} 
              label="Claim Exempt" 
              value={fedData.federal_exempt || data.exempt ? 'Yes (Exempt)' : 'No'} 
              isDarkMode={isDarkMode} 
            />
            <DetailItem 
              icon={Briefcase} 
              label="Two Jobs Option" 
              value={fedData.multiple_jobs_two ? 'Yes' : 'No'} 
              isDarkMode={isDarkMode} 
            />
          </div>
        </div>

        {/* Dynamic State Tax Withholding Summary */}
        <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className={`flex items-center justify-between pb-3.5 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                <MapPin size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm">State Tax Withholding ({stateCode})</h3>
                <p className="text-[11px] text-zinc-400">Department of Revenue state-specific tax parameters</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditModal('state_w4')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={13} /> Edit State Tax Form
              </button>
              {data.w4_pdf && (
                <button
                  type="button"
                  onClick={() => handleOpenPdfPreview(data.w4_pdf, `${stateCode} State Tax Withholding`)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={13} /> View State Tax Form
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <DetailItem icon={MapPin} label="State Code" value={stateCode} isDarkMode={isDarkMode} />
            <DetailItem icon={Hash} label="Allowances / Exemptions" value={data.allowances || stData.allowances || '0'} isDarkMode={isDarkMode} />
            <DetailItem icon={Percent} label="Additional Withholding" value={data.additional_withholding || stData.additional_withholding ? `$${data.additional_withholding || stData.additional_withholding}` : '$0'} isDarkMode={isDarkMode} />
            <DetailItem icon={FileText} label="Filing Status / Code" value={displayStatusLetter} isDarkMode={isDarkMode} />
          </div>

          {/* DYNAMIC STATE-SPECIFIC SUBMITTED FIELDS */}
          {Object.keys(stData).length > 0 && (
            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-zinc-800/80' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <Sliders size={13} />
                  All State-Specific ({stateCode}) Form Values
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Dynamic State Parameters</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {Object.entries(stData)
                  .filter(([k, v]) => v !== '' && v !== null && v !== undefined && k !== 'signature_image' && k !== 'token' && k !== 'w4_data')
                  .map(([key, val]) => {
                    const safeVal = typeof val === 'object' && val !== null 
                      ? JSON.stringify(val) 
                      : typeof val === 'boolean' 
                        ? (val ? 'Yes' : 'No') 
                        : String(val);
                    return (
                      <div key={key} className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-[#12141a] border-zinc-800' : 'bg-slate-50 border-slate-200/90'}`}>
                        <span className="text-[9px] font-bold uppercase text-zinc-400 block truncate mb-0.5">{key.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-xs truncate block text-zinc-800 dark:text-zinc-200">
                          {safeVal}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderI9Info = () => {
    const i9 = data.i9_data || {};
    const rawI9 = data.i9_pdf || i9.pdf_file;
    return (
      <div className="space-y-4">
        <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className={`flex items-center justify-between pb-3.5 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm">USCIS Form I-9 (Employment Eligibility)</h3>
                <p className="text-[11px] text-zinc-400">Section 1 & 2 Verification Status</p>
              </div>
            </div>
            {rawI9 && (
              <button
                type="button"
                onClick={() => handleOpenPdfPreview(rawI9, "USCIS Form I-9")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye size={13} /> View I-9 PDF
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <DetailItem icon={ShieldCheck} label="Citizenship Status" value={i9.citizenship_status ? i9.citizenship_status.replace(/_/g, ' ').toUpperCase() : 'Citizen'} isDarkMode={isDarkMode} />
            <DetailItem icon={FileText} label="Document List Choice" value={i9.document_list_type === 'A' ? 'List A (Identity & Work Auth)' : 'List B & C (Combined)'} isDarkMode={isDarkMode} />
            <DetailItem icon={Calendar} label="e-Signature Date" value={i9.signature_date || data.confirmation_date} isDarkMode={isDarkMode} />
            
            {i9.document_list_type === 'A' ? (
              <>
                <DetailItem icon={FileText} label="List A: Doc Title" value={i9.document_title} isDarkMode={isDarkMode} />
                <DetailItem icon={Hash} label="List A: Doc Number" value={i9.document_number} isDarkMode={isDarkMode} />
                <DetailItem icon={Calendar} label="List A: Expiration" value={i9.expiration_date} isDarkMode={isDarkMode} />
                <DetailItem icon={Building2} label="List A: Authority" value={i9.issuing_authority} isDarkMode={isDarkMode} />
              </>
            ) : (
              <>
                <DetailItem icon={FileText} label="List B: Title" value={i9.doc_b_title || i9.document_title} isDarkMode={isDarkMode} />
                <DetailItem icon={Hash} label="List B: Number" value={i9.doc_b_number || i9.document_number} isDarkMode={isDarkMode} />
                <DetailItem icon={FileText} label="List C: Title" value={i9.doc_c_title} isDarkMode={isDarkMode} />
                <DetailItem icon={Hash} label="List C: Number" value={i9.doc_c_number} isDarkMode={isDarkMode} />
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBankInfo = () => (
    <div className="space-y-4">
      <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
        <div className={`flex items-center justify-between pb-3.5 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
              <Landmark size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Direct Deposit Accounts</h3>
              <p className="text-[11px] text-zinc-400">Payroll ACH Direct Deposit allocations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenEditModal('bank')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 size={13} /> Edit Bank Info
          </button>
        </div>

        {allBankAccounts.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-xs">
            No bank accounts recorded for this candidate.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allBankAccounts.map((acc, index) => {
              const accKey = acc.id || `bank_${index}`;
              const isRevealed = revealedBankFields[accKey];
              return (
                <div key={accKey} className={`p-4 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-[#12141a] border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/40">
                    <div className="flex items-center gap-2">
                      <CreditCard size={15} className="text-emerald-500" />
                      <span className="font-bold text-xs">{acc.bank_name || 'Primary Bank'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-500">
                      {acc.percentage ? `${acc.percentage}% Allocation` : '100%'}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Account Holder:</span>
                      <span className="font-semibold">{acc.account_holder_name || `${data.first_name} ${data.last_name}`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Routing Number:</span>
                      <span className="font-mono font-semibold">{acc.routing_number || '•••••••••'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Account Number:</span>
                      <div className="flex items-center gap-1.5 font-mono font-semibold">
                        <span>{isRevealed ? acc.account_number : `••••••••${String(acc.account_number || '').slice(-4)}`}</span>
                        <button
                          type="button"
                          onClick={() => setRevealedBankFields(prev => ({ ...prev, [accKey]: !prev[accKey] }))}
                          className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Account Type:</span>
                      <span className="font-semibold">{acc.account_type || 'Checking'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="space-y-4">
      <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
        <div className={`flex items-center justify-between pb-3.5 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs">
              <Users size={16} />
            </div>
            <h3 className="font-bold text-sm">Emergency Contacts</h3>
          </div>
          <button
            type="button"
            onClick={() => handleOpenEditModal('emergency')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 size={13} /> Edit Contacts
          </button>
        </div>

        {allEmergencyContacts.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-xs">
            No emergency contacts recorded for this candidate.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allEmergencyContacts.map((contact, idx) => (
              <div key={contact.id || idx} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#12141a] border-zinc-800' : 'bg-slate-50 border-slate-200/80'}`}>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/40">
                  <span className="font-bold text-xs text-rose-500">{contact.relationship || `Contact #${idx + 1}`}</span>
                  {contact.is_primary && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-500/15 text-rose-500">
                      Primary
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Full Name:</span>
                    <span className="font-semibold">{contact.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Phone:</span>
                    <span className="font-semibold">{contact.phone || contact.phone_number || 'N/A'}</span>
                  </div>
                  {contact.email && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Email:</span>
                      <span className="font-semibold truncate max-w-[160px]">{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
        <div className={`flex items-center justify-between pb-3.5 mb-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Official Signed PDFs & Compliance Documents</h3>
              <p className="text-[11px] text-zinc-400">Federal, State, and USCIS Document Archive</p>
            </div>
          </div>
        </div>

        {documentsList.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-xs">
            No generated documents found for this candidate yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {documentsList.map((doc) => (
              <div key={doc.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                isDarkMode ? 'bg-[#12141a] border-zinc-800 hover:border-zinc-700' : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs truncate">{doc.name}</h4>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{doc.type} • {doc.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenPdfPreview(doc.url, doc.name)}
                    className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-colors"
                    title="View PDF"
                  >
                    <Eye size={15} />
                  </button>
                  <a
                    href={doc.url}
                    download
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/30 transition-colors"
                    title="Download"
                  >
                    <Download size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* MAIN ONBOARDING DETAILS MODAL CONTAINER WITH DEDICATED OVERLAY */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in">
        <div className={`w-full max-w-5xl h-[88vh] max-h-[850px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}>
          {/* Top Main Header */}
          <div className={`px-5 py-4 border-b shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3.5">
              <div 
                className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-extrabold text-lg shadow-lg shrink-0"
                style={{ backgroundColor: activeThemeHex }}
              >
                {(data.first_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight">{data.first_name} {data.last_name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isConfirmed ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                  }`}>
                    {isConfirmed ? 'Verified & Complete' : 'Onboarding in Progress'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{data.job_title || 'Candidate'} • {data.email}</p>
              </div>
            </div>

            {/* Top Action Buttons + Close */}
            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenEditModal('federal_w4')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                style={{ backgroundColor: activeThemeHex }}
              >
                <Edit3 size={14} />
                Edit Forms & PDFs
              </button>

              {onResendInvite && !isConfirmed && (
                <button
                  type="button"
                  onClick={onResendInvite}
                  disabled={actionLoading || remindingCandidateId === coreOnboardingId}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800 shadow-sm'
                  }`}
                >
                  <Send size={13} className="text-blue-500" />
                  {remindingCandidateId === coreOnboardingId ? 'Sending...' : 'Resend Invite'}
                </button>
              )}

              {onVerifyI9 && (
                <button
                  type="button"
                  onClick={onVerifyI9}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800 shadow-sm'
                  }`}
                >
                  <ShieldCheck size={14} className="text-emerald-500" />
                  Verify I-9
                </button>
              )}

              {onConvertToEmployee && (
                <button
                  type="button"
                  onClick={onConvertToEmployee}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserCheck size={14} />
                  )}
                  Convert to Employee
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl border transition-all ml-1 cursor-pointer ${
                  isDarkMode ? 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600 shadow-xs'
                }`}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`shrink-0 z-10 ${isDarkMode ? 'bg-[#151924]' : 'bg-slate-50'} border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-200'} px-5 pt-2.5 pb-2`}>
            <nav className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-white shadow-md'
                        : isDarkMode
                          ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                    style={isActive ? { backgroundColor: activeThemeHex } : {}}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Scrollable Tab Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 custom-scrollbar space-y-5">
            {activeTab === 'details' && renderCandidateInfo()}
            {activeTab === 'job' && renderJobInfo()}
            {activeTab === 'tax' && renderTaxInfo()}
            {activeTab === 'i9' && renderI9Info()}
            {activeTab === 'bank' && renderBankInfo()}
            {activeTab === 'emergency' && renderEmergencyContacts()}
            {activeTab === 'documents' && renderDocuments()}
          </div>

          {/* Modal Footer with perfect spacing */}
          <div className={`px-6 py-3.5 border-t shrink-0 flex items-center justify-between ${
            isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {onRegretCandidate ? (
              <button
                type="button"
                onClick={onRegretCandidate}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-all cursor-pointer"
              >
                Discontinue / Send Regret
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800 shadow-sm'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE & DYNAMIC STATE-AWARE FORM EDITING MODAL */}
      {/* ========================================================================= */}
      {isEditingForms && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
              isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shrink-0 shadow-md"
                  style={{ backgroundColor: activeThemeHex }}
                >
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Form Data & Dynamic PDF Regenerator</h3>
                  <p className="text-xs text-zinc-400">Modifications automatically update database fields and re-stamp state & federal PDFs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingForms(false)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Edit Sub-Tabs */}
            <div className={`flex space-x-1.5 overflow-x-auto px-5 py-2.5 border-b shrink-0 ${
              isDarkMode ? 'bg-[#151924] border-zinc-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {[
                { id: 'federal_w4', label: '🏛️ Federal Form W-4' },
                { id: 'state_w4', label: `🗺️ State Tax (${editFormState.state_code || data.state || 'State'})` },
                { id: 'personal', label: '👤 Personal & Address' },
                { id: 'bank', label: '🏦 Direct Deposit' },
                { id: 'emergency', label: '📞 Emergency Contacts' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    editTab === t.id
                      ? 'text-white shadow-sm'
                      : isDarkMode
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                  style={editTab === t.id ? { backgroundColor: activeThemeHex } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Feedback Alert */}
            {editFeedback.message && (
              <div className={`mx-6 mt-4 p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold ${
                editFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              }`}>
                {editFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{String(editFeedback.message)}</span>
              </div>
            )}

            {/* Edit Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              
              {/* TAB 1: FEDERAL W-4 */}
              {editTab === 'federal_w4' && (
                <form onSubmit={handleSaveAndRegenerate} className="space-y-4">
                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-500 mb-3">Step 1: Federal Filing Status</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { val: '1', title: 'Single / Married Separate' },
                        { val: '2', title: 'Married Filing Jointly' },
                        { val: '3', title: 'Head of Household' }
                      ].map(opt => (
                        <label
                          key={opt.val}
                          className={`p-3.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            editFormState.filing_status === opt.val
                              ? 'border-blue-500 bg-blue-500/10 font-bold text-blue-500'
                              : isDarkMode ? 'border-zinc-700 bg-zinc-800/40 text-zinc-300' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="filing_status"
                            value={opt.val}
                            checked={editFormState.filing_status === opt.val}
                            onChange={(e) => handleEditFieldChange('filing_status', e.target.value)}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            editFormState.filing_status === opt.val ? 'border-blue-500 bg-blue-500' : 'border-zinc-500'
                          }`}>
                            {editFormState.filing_status === opt.val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-xs">{opt.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-500 mb-3">Step 2: Multiple Jobs or Spouse Works</h4>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editFormState.multiple_jobs_two)}
                        onChange={(e) => handleEditFieldChange('multiple_jobs_two', e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Check here if you hold more than one job at all times, or are married filing jointly and spouse works
                      </span>
                    </label>
                  </div>

                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-500 mb-3">Step 3: Claim Dependents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Qualifying Children Under 17 ($2,000 each)</label>
                        <input
                          type="number"
                          min="0"
                          value={editFormState.kids_under_17 ?? 0}
                          onChange={(e) => handleEditFieldChange('kids_under_17', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Other Dependents ($500 each)</label>
                        <input
                          type="number"
                          min="0"
                          value={editFormState.other_dependents ?? 0}
                          onChange={(e) => handleEditFieldChange('other_dependents', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-500 mb-3">Step 4: Other Adjustments ($)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">4(a) Other Income ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={editFormState.step4_other_income ?? 0}
                          onChange={(e) => handleEditFieldChange('step4_other_income', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">4(b) Deductions ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={editFormState.step4_deductions ?? 0}
                          onChange={(e) => handleEditFieldChange('step4_deductions', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">4(c) Extra Withholding / Period ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={editFormState.step4_extra_withholding ?? 0}
                          onChange={(e) => handleEditFieldChange('step4_extra_withholding', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editFormState.federal_exempt)}
                        onChange={(e) => handleEditFieldChange('federal_exempt', e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-rose-500 block">Claim Exemption from Federal Withholding</span>
                        <span className="text-[11px] text-zinc-400 block">I had no tax liability last year and expect none this year.</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingForms}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: activeThemeHex }}
                    >
                      {isSavingForms ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Federal W-4 & Regenerate PDF
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: DYNAMIC STATE TAX WITHHOLDING */}
              {editTab === 'state_w4' && (
                <div className="space-y-4">
                  {/* Mode Selector: Quick Parameter Editor vs Full Dynamic State Form */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <h4 className="font-bold text-xs">Target Jurisdiction: {editFormState.state_code || 'NC'} State Tax</h4>
                      <p className="text-[11px] text-zinc-400">Switch state to generate state-specific certificates</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={editFormState.state_code || 'NC'}
                        onChange={(e) => handleEditFieldChange('state_code', e.target.value)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                          isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        {US_STATES.map(st => (
                          <option key={st.code} value={st.code}>{st.code} - {st.name}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setUseInteractiveStateDispatcher(!useInteractiveStateDispatcher)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          useInteractiveStateDispatcher
                            ? 'bg-blue-600 text-white border-blue-600'
                            : isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        {useInteractiveStateDispatcher ? 'Standard Mode' : 'Full Interactive Form'}
                      </button>
                    </div>
                  </div>

                  {useInteractiveStateDispatcher ? (
                    <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-white border-slate-200'}`}>
                      <StateTaxFormDispatcher
                        userState={editFormState.state_code || data.state || 'NC'}
                        initialData={{ ...data, ...editFormState }}
                        onSubmit={(submittedData) => {
                          handleSaveAndRegenerate(null, { ...editFormState, ...submittedData, state_code: editFormState.state_code });
                        }}
                      />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAndRegenerate} className="space-y-4">
                      <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-500 mb-3">
                          {editFormState.state_code || 'NC'} State Tax Parameters
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">State Allowances / Exemptions</label>
                            <input
                              type="number"
                              min="0"
                              value={editFormState.allowances ?? 0}
                              onChange={(e) => handleEditFieldChange('allowances', e.target.value)}
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                                isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">Additional State Withholding ($)</label>
                            <input
                              type="number"
                              min="0"
                              value={editFormState.state_additional_withholding ?? 0}
                              onChange={(e) => handleEditFieldChange('state_additional_withholding', e.target.value)}
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                                isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">State Filing Status / Schedule Letter</label>
                            <input
                              type="text"
                              maxLength="2"
                              value={editFormState.status_letter || ''}
                              onChange={(e) => handleEditFieldChange('status_letter', e.target.value.toUpperCase())}
                              placeholder="e.g. S, M, H, A, B"
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                                isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-zinc-400 block mb-1">County / City Jurisdiction (if applicable)</label>
                            <input
                              type="text"
                              value={editFormState.county || ''}
                              onChange={(e) => handleEditFieldChange('county', e.target.value)}
                              placeholder="e.g. Montgomery, Wake, NYC"
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                                isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* State Specific Exemptions */}
                      <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-500 mb-3">State Exemption & Special Status</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editFormState.exempt_status)}
                              onChange={(e) => handleEditFieldChange('exempt_status', e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Claim State Tax Exemption</span>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editFormState.blind_claim)}
                              onChange={(e) => handleEditFieldChange('blind_claim', e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Blindness Exemption</span>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editFormState.spouse_blind)}
                              onChange={(e) => handleEditFieldChange('spouse_blind', e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Spouse Blindness</span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingForms}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                        >
                          {isSavingForms ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Save {editFormState.state_code || 'State'} Tax Form & Regenerate PDF
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: PERSONAL & ADDRESS */}
              {editTab === 'personal' && (
                <form onSubmit={handleSaveAndRegenerate} className="space-y-4">
                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-500 mb-3">Personal Identification</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">First Name</label>
                        <input
                          type="text"
                          value={editFormState.first_name || ''}
                          onChange={(e) => handleEditFieldChange('first_name', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Middle Initial</label>
                        <input
                          type="text"
                          maxLength="2"
                          value={editFormState.middle_initial || ''}
                          onChange={(e) => handleEditFieldChange('middle_initial', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editFormState.last_name || ''}
                          onChange={(e) => handleEditFieldChange('last_name', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={editFormState.email || ''}
                          onChange={(e) => handleEditFieldChange('email', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editFormState.phone_no || ''}
                          onChange={(e) => handleEditFieldChange('phone_no', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Social Security Number (SSN)</label>
                        <input
                          type="text"
                          value={editFormState.ssn || ''}
                          onChange={(e) => handleEditFieldChange('ssn', e.target.value)}
                          placeholder="XXX-XX-XXXX"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-500 mb-3">Residential Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Street Address</label>
                        <input
                          type="text"
                          value={editFormState.address || ''}
                          onChange={(e) => handleEditFieldChange('address', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">City</label>
                        <input
                          type="text"
                          value={editFormState.city || ''}
                          onChange={(e) => handleEditFieldChange('city', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Zip Code</label>
                        <input
                          type="text"
                          value={editFormState.zipcode || ''}
                          onChange={(e) => handleEditFieldChange('zipcode', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingForms}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: activeThemeHex }}
                    >
                      {isSavingForms ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Personal Info
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: DIRECT DEPOSIT / BANK */}
              {editTab === 'bank' && (
                <form onSubmit={handleSaveAndRegenerate} className="space-y-4">
                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-500 mb-3">Primary Direct Deposit Account</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={editFormState.bank_name || ''}
                          onChange={(e) => handleEditFieldChange('bank_name', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          value={editFormState.account_holder_name || ''}
                          onChange={(e) => handleEditFieldChange('account_holder_name', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">ABA 9-Digit Routing Number</label>
                        <input
                          type="text"
                          maxLength="9"
                          value={editFormState.routing_number || ''}
                          onChange={(e) => handleEditFieldChange('routing_number', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Account Number</label>
                        <input
                          type="text"
                          value={editFormState.account_number || ''}
                          onChange={(e) => handleEditFieldChange('account_number', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Account Type</label>
                        <select
                          value={editFormState.account_type || 'Checking'}
                          onChange={(e) => handleEditFieldChange('account_type', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="Checking">Checking Account</option>
                          <option value="Savings">Savings Account</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Allocation Percentage (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={editFormState.percentage || 100}
                          onChange={(e) => handleEditFieldChange('percentage', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingForms}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingForms ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Bank Details
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: EMERGENCY CONTACTS */}
              {editTab === 'emergency' && (
                <form onSubmit={handleSaveAndRegenerate} className="space-y-4">
                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-rose-500 mb-3">Primary Emergency Contact</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Contact Name</label>
                        <input
                          type="text"
                          value={editFormState.ec1_name || ''}
                          onChange={(e) => handleEditFieldChange('ec1_name', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Relationship</label>
                        <input
                          type="text"
                          value={editFormState.ec1_relationship || ''}
                          onChange={(e) => handleEditFieldChange('ec1_relationship', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editFormState.ec1_phone || ''}
                          onChange={(e) => handleEditFieldChange('ec1_phone', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={editFormState.ec1_email || ''}
                          onChange={(e) => handleEditFieldChange('ec1_email', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-rose-500 mb-3">Secondary Contact (Optional)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Contact Name</label>
                        <input
                          type="text"
                          value={editFormState.ec2_name || ''}
                          onChange={(e) => handleEditFieldChange('ec2_name', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Relationship</label>
                        <input
                          type="text"
                          value={editFormState.ec2_relationship || ''}
                          onChange={(e) => handleEditFieldChange('ec2_relationship', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editFormState.ec2_phone || ''}
                          onChange={(e) => handleEditFieldChange('ec2_phone', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={editFormState.ec2_email || ''}
                          onChange={(e) => handleEditFieldChange('ec2_email', e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                            isDarkMode ? 'bg-[#12141a] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingForms}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingForms ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Contacts
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Embedded PDF Preview Modal (Topmost Layer) */}
      {/* ========================================================================= */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-5xl h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
            isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
              isDarkMode ? 'border-zinc-800 bg-[#181a20]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2 truncate pr-2">
                <FileText size={18} className="text-blue-500 shrink-0" />
                <h3 className="font-bold text-sm truncate">{previewPdfTitle || 'Document Preview'}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewPdfUrl}
                  download
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
                  style={{ backgroundColor: activeThemeHex }}
                >
                  <Download size={13} /> Download
                </a>
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <ExternalLink size={13} /> Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={handleClosePdfPreview}
                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-900 relative flex flex-col items-center justify-center overflow-hidden">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3 text-white">
                  <Loader2 size={36} className="animate-spin text-blue-500" />
                  <p className="text-xs font-semibold text-zinc-300">Rendering high-resolution document preview...</p>
                </div>
              ) : (
                <iframe
                  src={`${previewBlobUrl || previewPdfUrl}#toolbar=1&navpanes=0`}
                  title={previewPdfTitle || "Document Preview"}
                  className="w-full h-full border-none"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const DetailItem = ({ icon: Icon, label, value, isDarkMode, fullWidth }) => {
  const displayValue = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;

  return (
    <div className={`p-3.5 rounded-xl border transition-all ${
      fullWidth ? 'sm:col-span-2 md:col-span-3' : ''
    } ${isDarkMode ? 'bg-[#12141a] border-zinc-800/80 hover:border-zinc-700' : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'}`}>
      <div className="flex items-start gap-2.5">
        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
          isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
        }`}>
          <Icon size={14} />
        </div>
        <div className="overflow-hidden w-full">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block truncate mb-0.5">
            {label}
          </span>
          <span className={`font-semibold text-xs truncate block ${
            isDarkMode ? 'text-zinc-100' : 'text-slate-800'
          }`}>
            {displayValue || <span className="opacity-40 font-normal italic">Not specified</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDetailsModal;