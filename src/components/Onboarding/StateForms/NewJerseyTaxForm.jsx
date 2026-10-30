import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  User, Shield, DollarSign, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Eraser, Save, PenTool, FileText, Calculator, Loader2, XCircle, CheckCircle2,
  AlertTriangle, Info, Building2, MapPin, Check, HeartHandshake,
  HelpCircle, ArrowRight, Table, ChevronUp, RefreshCw
} from 'lucide-react';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

// --- 1. THEME-AWARE LOADING OVERLAY ---
const LoadingOverlay = ({ isDarkMode, activeHexColor }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 p-4 ${
    isDarkMode ? 'bg-[#0d0f15]/80' : 'bg-white/85'
  }`}>
    <div className={`flex flex-col items-center p-8 rounded-3xl shadow-2xl border max-w-sm w-full text-center animate-in zoom-in-95 duration-200 ${
      isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="relative mb-4">
        <div 
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{ borderColor: `${activeHexColor}30`, borderTopColor: activeHexColor }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText size={20} style={{ color: activeHexColor }} />
        </div>
      </div>
      <h3 className="text-base font-extrabold tracking-tight mb-1">Generating Form NJ-W4</h3>
      <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
        Securing New Jersey Employee's Withholding Allowance Certificate...
      </p>
    </div>
  </div>
);

// --- 2. THEME-AWARE ERROR MODAL ---
const ErrorModal = ({ isOpen, title, message, onClose, isDarkMode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border ${
        isDarkMode ? 'bg-[#181a20] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-4 text-rose-500">
            <XCircle size={28} />
          </div>
          <h3 className="text-lg font-extrabold mb-1.5">{title || "Action Required"}</h3>
          <p className={`text-xs mb-6 leading-relaxed max-w-sm ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            {message || "Please review the highlighted fields."}
          </p>
          <button 
            type="button"
            onClick={onClose} 
            className="w-full py-3 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-md"
          >
            Review & Complete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. THEME-AWARE CUSTOM DATE PICKER ---
const CustomDatePicker = ({ label, name, value, onChange, isDarkMode, activeHexColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));

  const handleDateClick = (day) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onChange({ target: { name, value: `${currentDate.getFullYear()}-${month}-${dayStr}` } });
    setIsOpen(false);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
        isDarkMode ? 'text-zinc-400' : 'text-slate-600'
      }`}>
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
          isDarkMode 
            ? 'bg-[#181a20] border-zinc-700/80 hover:border-zinc-600 text-zinc-100' 
            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar size={15} style={{ color: activeHexColor }} />
          <span className="font-semibold">{value || "Select Date"}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-zinc-400' : 'text-zinc-500'}`} />
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-1.5 p-3 rounded-2xl shadow-xl border w-64 animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#181a20] border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-center mb-2.5 px-1">
            <button 
              type="button" 
              onClick={() => changeMonth(-1)} 
              className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-extrabold tracking-tight">
              {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <button 
              type="button" 
              onClick={() => changeMonth(1)} 
              className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <span key={d} className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateVal = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = value === dateVal;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`h-7 w-7 text-xs rounded-lg flex items-center justify-center font-medium transition-all ${
                    isSelected
                      ? 'text-white font-bold shadow-sm'
                      : isDarkMode
                        ? 'hover:bg-zinc-800 text-zinc-300'
                        : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  style={isSelected ? { backgroundColor: activeHexColor } : {}}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- OFFICIAL NEW JERSEY INSTRUCTION A WAGE CHART MATRIX ---
const WAGE_BRACKETS = [
  '$0 - $10,000',
  '$10,001 - $20,000',
  '$20,001 - $30,000',
  '$30,001 - $40,000',
  '$40,001 - $50,000',
  '$50,001 - $60,000',
  '$60,001 - $70,000',
  '$70,001 - $80,000',
  '$80,001 - $90,000',
  'Over $90,000'
];

const WAGE_CHART_MATRIX = [
  // 0-10k, 10-20k, 20-30k, 30-40k, 40-50k, 50-60k, 60-70k, 70-80k, 80-90k, Over 90k
  ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // Row 0
  ['B', 'B', 'B', 'B', 'C', 'C', 'C', 'C', 'C', 'C'], // Row 1
  ['B', 'B', 'B', 'A', 'A', 'D', 'D', 'D', 'D', 'D'], // Row 2
  ['B', 'B', 'A', 'A', 'A', 'A', 'A', 'E', 'E', 'E'], // Row 3
  ['B', 'C', 'A', 'A', 'A', 'A', 'A', 'E', 'E', 'E'], // Row 4
  ['B', 'C', 'D', 'A', 'A', 'A', 'E', 'E', 'E', 'E'], // Row 5
  ['B', 'C', 'D', 'A', 'A', 'E', 'E', 'E', 'E', 'E'], // Row 6
  ['B', 'C', 'D', 'E', 'E', 'E', 'E', 'E', 'E', 'E'], // Row 7
  ['B', 'C', 'D', 'E', 'E', 'E', 'E', 'E', 'E', 'E'], // Row 8
  ['B', 'C', 'D', 'E', 'E', 'E', 'E', 'E', 'E', 'E'], // Row 9
];

// --- MAIN NEW JERSEY FORM COMPONENT ---
const NewJerseyTaxForm = ({ initialData, onSubmit }) => {
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS?.find(c => c.id === accentColor)?.color || '#2563eb';

  const sigCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // Accordion helpers state
  const [showWageChartHelper, setShowWageChartHelper] = useState(false);
  const [wageRowIndex, setWageRowIndex] = useState(3); // Default $30,001 - $40,000
  const [wageColIndex, setWageColIndex] = useState(2); // Default $20,001 - $30,000
  
  const [showAllowancesHelper, setShowAllowancesHelper] = useState(false);
  const [allowanceHelper, setAllowanceHelper] = useState({
    self: true,
    spouse: false,
    dependents: 0,
    college: 0,
    age65_self: false,
    age65_spouse: false,
    blind_self: false,
    blind_spouse: false
  });

  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    middle_initial: '',
    last_name: '',
    ssn: '',
    address: '',
    city: '',
    state: 'NJ',
    zipcode: '',

    // Line 2: Filing Status (1-5)
    filing_status: '1',

    // Line 3: Rate Table Letter (A, B, C, D, E or none)
    line3_letter: '',

    // Line 4: Total Allowances
    allowances: 1,

    // Line 5: Additional Withholding ($)
    additional_withholding: '',

    // Line 6: Exemption from NJ Withholding
    exempt: false,

    // Employer Information (Auto-Populated)
    employer_name: 'Tech Innovators Inc.',
    employer_address: '100 Innovation Way',
    employer_city: 'Newark',
    employer_state: 'NJ',
    employer_zip: '07102',
    employer_ein: '12-3456789',

    // Line 7: Signature & Date
    confirmation_date: new Date().toISOString().split('T')[0],
    signature_image: null
  });

  const filingOptions = [
    {
      code: '1',
      title: '1. Single',
      desc: 'Single individuals or persons legally separated',
      defaultRate: 'Rate Table A'
    },
    {
      code: '2',
      title: '2. Married / Civil Union Couple Joint',
      desc: 'Married couple or civil union partners filing combined joint return',
      defaultRate: 'Rate Table B (or Wage Chart)'
    },
    {
      code: '3',
      title: '3. Married / Civil Union Partner Separate',
      desc: 'Married couple or civil union partners filing separate returns',
      defaultRate: 'Rate Table A'
    },
    {
      code: '4',
      title: '4. Head of Household',
      desc: 'Unmarried individuals paying >50% cost of maintaining a home for qualifying dependent',
      defaultRate: 'Rate Table B (or Wage Chart)'
    },
    {
      code: '5',
      title: '5. Qualifying Widow(er) / Surviving Civil Union Partner',
      desc: 'Qualifying surviving spouse or surviving civil union partner with dependent child',
      defaultRate: 'Rate Table B (or Wage Chart)'
    }
  ];

  const rateTableOptions = [
    { code: '', label: 'Default / Standard Withholding Table', desc: 'Standard withholding based on selected Filing Status' },
    { code: 'A', label: 'Rate Table A', desc: 'Single / Married Separate' },
    { code: 'B', label: 'Rate Table B', desc: 'Married Joint Standard (Moderate)' },
    { code: 'C', label: 'Rate Table C', desc: 'Married Joint Higher Combined' },
    { code: 'D', label: 'Rate Table D', desc: 'Head of Household Mid-Range' },
    { code: 'E', label: 'Rate Table E', desc: 'Two-Earner High Income Protection' }
  ];

  // Initialize initial data
  useEffect(() => {
    if (initialData) {
      const rawSSN = (initialData.ssn || '').replace(/\D/g, '').slice(0, 9);
      const formattedSSN = rawSSN.length === 9 
        ? `${rawSSN.slice(0, 3)}-${rawSSN.slice(3, 5)}-${rawSSN.slice(5)}` 
        : (initialData.ssn || '');

      setFormData(prev => ({
        ...prev,
        first_name: initialData.first_name || prev.first_name,
        middle_initial: initialData.middle_initial || initialData.initial || prev.middle_initial,
        last_name: initialData.last_name || prev.last_name,
        ssn: formattedSSN || prev.ssn,
        address: initialData.address || prev.address,
        city: initialData.city || prev.city,
        zipcode: (initialData.zipcode || '').toString().slice(0, 5) || prev.zipcode,
        state: 'NJ',
        filing_status: String(initialData.filing_status_nj || initialData.filing_status || prev.filing_status || '1'),
        line3_letter: (initialData.line3_letter || initialData.rate_table_letter || prev.line3_letter || '').toUpperCase(),
        allowances: initialData.allowances_nj !== undefined ? Number(initialData.allowances_nj) : (initialData.allowances !== undefined ? Number(initialData.allowances) : prev.allowances),
        additional_withholding: initialData.additional_withholding || initialData.state_additional_withholding || prev.additional_withholding,
        exempt: Boolean(initialData.exempt ?? prev.exempt),
        employer_name: initialData.employer_name || initialData.company_name || initialData.client_name || prev.employer_name,
        employer_address: initialData.employer_address || prev.employer_address,
        employer_city: initialData.employer_city || prev.employer_city,
        employer_state: initialData.employer_state || prev.employer_state,
        employer_zip: initialData.employer_zip || initialData.employer_zipcode || prev.employer_zip,
        employer_ein: initialData.employer_ein || initialData.fein_ein || initialData.fein || prev.employer_ein,
        confirmation_date: initialData.confirmation_date || prev.confirmation_date
      }));
    }
  }, [initialData]);

  // Synchronize Allowance Helper changes
  useEffect(() => {
    let count = 0;
    if (allowanceHelper.self) count += 1;
    if (allowanceHelper.spouse) count += 1;
    count += (parseInt(allowanceHelper.dependents, 10) || 0);
    count += (parseInt(allowanceHelper.college, 10) || 0);
    if (allowanceHelper.age65_self) count += 1;
    if (allowanceHelper.age65_spouse) count += 1;
    if (allowanceHelper.blind_self) count += 1;
    if (allowanceHelper.blind_spouse) count += 1;
    
    if (showAllowancesHelper && !formData.exempt) {
      setFormData(prev => ({ ...prev, allowances: count }));
    }
  }, [allowanceHelper, showAllowancesHelper, formData.exempt]);

  // Canvas auto-resize handling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const savedData = sigCanvasRef.current.isEmpty() ? null : sigCanvasRef.current.toDataURL();
          canvas.width = rect.width;
          canvas.height = rect.height;
          if (savedData) {
            sigCanvasRef.current.fromDataURL(savedData);
          }
        }
      }
    };
    const t = setTimeout(handleResize, 200);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'ssn') {
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

    if (name === 'middle_initial') {
      setFormData(prev => ({ ...prev, middle_initial: value.toUpperCase().slice(0, 1) }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataUrl = sigCanvasRef.current.getCanvas().toDataURL('image/png');
      setFormData(prev => ({ ...prev, signature_image: dataUrl }));
    }
  };

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setFormData(prev => ({ ...prev, signature_image: null }));
    }
  };

  // 1-Click Autofill Benchmark Data for Testing & Instant Demo
  const handleAutofillSample = () => {
    setFormData(prev => ({
      ...prev,
      first_name: 'Jonathan',
      middle_initial: 'E',
      last_name: 'Carmack-Miller',
      ssn: '123-45-6789',
      address: '777 Boardwalk Avenue, Apt 4B',
      city: 'Atlantic City',
      state: 'NJ',
      zipcode: '08401',
      filing_status: '2', // Married Joint
      line3_letter: 'A',
      allowances: 3,
      additional_withholding: '75.50',
      exempt: false,
      employer_name: 'Tech Innovators Inc.',
      employer_address: '100 Innovation Way',
      employer_city: 'Newark',
      employer_state: 'NJ',
      employer_zip: '07102',
      employer_ein: '12-3456789',
      confirmation_date: new Date().toISOString().split('T')[0]
    }));
  };

  const recommendedWageChartLetter = WAGE_CHART_MATRIX[wageRowIndex][wageColIndex];

  const handleApplyWageChartLetter = () => {
    setFormData(prev => ({ ...prev, line3_letter: recommendedWageChartLetter }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields validation
    const required = [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'ssn', label: 'Social Security Number' },
      { key: 'address', label: 'Mailing Address' },
      { key: 'city', label: 'City' },
      { key: 'zipcode', label: 'ZIP Code' },
      { key: 'confirmation_date', label: 'Date of Signing' }
    ];

    for (const field of required) {
      if (!formData[field.key] || !String(formData[field.key]).trim()) {
        setErrorModal({
          isOpen: true,
          title: 'Missing Required Field',
          message: `Please provide your ${field.label} before submitting Form NJ-W4.`
        });
        return;
      }
    }

    const cleanSSN = (formData.ssn || '').replace(/\D/g, '');
    if (cleanSSN.length !== 9) {
      setErrorModal({
        isOpen: true,
        title: 'Invalid Social Security Number',
        message: 'Please provide a valid 9-digit Social Security Number.'
      });
      return;
    }

    let finalSig = formData.signature_image;
    if (!finalSig && sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      finalSig = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    }

    if (!finalSig) {
      setErrorModal({
        isOpen: true,
        title: 'Signature Required',
        message: 'Please provide your digital signature to authorize New Jersey Form NJ-W4.'
      });
      return;
    }

    const payload = {
      ...formData,
      ssn: cleanSSN,
      state: 'NJ',
      signature_image: finalSig
    };

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      }
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setErrorModal({
        isOpen: true,
        title: 'Submission Error',
        message: err?.response?.data?.error || err?.message || 'Failed to generate New Jersey Form NJ-W4. Please verify your entries.'
      });
    }
  };

  // Styling helper classes
  const cardBg = isDarkMode 
    ? 'bg-[#12141a] border-zinc-800 text-zinc-100 shadow-xl' 
    : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const innerCardBg = isDarkMode
    ? 'bg-[#181a20] border-zinc-800/80 text-zinc-100'
    : 'bg-slate-50 border-slate-200 text-slate-800';
  const labelText = isDarkMode ? 'text-zinc-400' : 'text-slate-600';
  const inputStyle = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all outline-none shadow-sm ${
    isDarkMode 
      ? 'bg-[#181a20] border-zinc-700/80 hover:border-zinc-600 focus:border-zinc-500 text-zinc-100 placeholder-zinc-600' 
      : 'bg-white border-slate-200 hover:border-slate-300 focus:border-slate-400 text-slate-800 placeholder-slate-400'
  }`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {isSubmitting && <LoadingOverlay isDarkMode={isDarkMode} activeHexColor={activeHexColor} />}
      <ErrorModal 
        isOpen={errorModal.isOpen} 
        title={errorModal.title} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} 
        isDarkMode={isDarkMode} 
      />

      {/* HEADER HERO */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
            >
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${activeHexColor}15`, color: activeHexColor }}
                >
                  New Jersey Form NJ-W4
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">Rev. 1-21</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Employee's Withholding Allowance Certificate
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${labelText}`}>
                State of New Jersey – Department of the Treasury, Division of Taxation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutofillSample}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-transform active:scale-95 shadow-sm hover:opacity-90"
            style={{ 
              backgroundColor: isDarkMode ? '#1e2029' : '#f1f5f9',
              borderColor: isDarkMode ? '#2d3139' : '#e2e8f0',
              color: activeHexColor
            }}
          >
            Autofill Sample
          </button>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <div className={`p-3 rounded-2xl border ${innerCardBg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">Filing Status</span>
            <span className="text-xs font-black truncate block mt-0.5" style={{ color: activeHexColor }}>
              {filingOptions.find(o => o.code === formData.filing_status)?.title.split('.')[1]?.trim() || 'Single'}
            </span>
          </div>
          <div className={`p-3 rounded-2xl border ${innerCardBg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">Allowances (Line 4)</span>
            <span className="text-lg font-black" style={{ color: activeHexColor }}>
              {formData.exempt ? 'Exempt' : formData.allowances}
            </span>
          </div>
          <div className={`p-3 rounded-2xl border ${innerCardBg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">Rate Table (Line 3)</span>
            <span className="text-lg font-black text-blue-500">
              {formData.line3_letter || 'Standard'}
            </span>
          </div>
          <div className={`p-3 rounded-2xl border ${innerCardBg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">Extra Withholding (Line 5)</span>
            <span className="text-lg font-black text-emerald-500">
              {formData.additional_withholding ? `$${parseFloat(formData.additional_withholding || 0).toFixed(2)}` : '$0.00'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <User size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">1. Employee Identification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>First Name *</label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="First Name" 
                required 
              />
            </div>
            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>M.I.</label>
              <input 
                type="text" 
                name="middle_initial" 
                value={formData.middle_initial} 
                onChange={handleChange} 
                className={inputStyle} 
                maxLength={1} 
                placeholder="M" 
              />
            </div>
            <div className="sm:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>Last Name *</label>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="Last Name" 
                required 
              />
            </div>

            <div className="sm:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>Social Security Number *</label>
              <input 
                type="text" 
                name="ssn" 
                value={formData.ssn} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="XXX-XX-XXXX" 
                maxLength={11}
                required 
              />
            </div>
            <div className="sm:col-span-6">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>Mailing Address *</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="Street address or P.O. Box" 
                required 
              />
            </div>

            <div className="sm:col-span-5">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>City *</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="City" 
                required 
              />
            </div>
            <div className="sm:col-span-3">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>State</label>
              <input 
                type="text" 
                value="NJ" 
                readOnly 
                className={`${inputStyle} opacity-70 cursor-not-allowed font-bold text-center`} 
              />
            </div>
            <div className="sm:col-span-4">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>ZIP Code *</label>
              <input 
                type="text" 
                name="zipcode" 
                value={formData.zipcode} 
                onChange={handleChange} 
                className={inputStyle} 
                placeholder="07302" 
                maxLength={5}
                required 
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: FILING STATUS */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <Shield size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">2. New Jersey Filing Status (Check only one box)</h3>
          </div>

          <div className="space-y-3">
            {filingOptions.map(option => {
              const isSelected = formData.filing_status === option.code;
              return (
                <div 
                  key={option.code}
                  onClick={() => setFormData(prev => ({ ...prev, filing_status: option.code }))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected 
                      ? 'border-transparent shadow-md' 
                      : isDarkMode 
                        ? 'border-zinc-800/80 hover:border-zinc-700 bg-[#161820]' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  style={isSelected ? { 
                    backgroundColor: `${activeHexColor}10`, 
                    borderColor: activeHexColor 
                  } : {}}
                >
                  <div 
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected ? 'border-transparent' : isDarkMode ? 'border-zinc-600' : 'border-slate-300'
                    }`}
                    style={isSelected ? { backgroundColor: activeHexColor } : {}}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-extrabold tracking-tight block">{option.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected 
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                          : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {option.defaultRate}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${labelText}`}>
                      {option.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: WITHHOLDING PARAMETERS & WAGE CHART HELPER (LINES 3 - 6) */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <Calculator size={18} style={{ color: activeHexColor }} />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">3. Withholding Allowances & Wage Rates</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowWageChartHelper(!showWageChartHelper)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all"
              style={{
                backgroundColor: showWageChartHelper ? `${activeHexColor}15` : 'transparent',
                borderColor: showWageChartHelper ? activeHexColor : isDarkMode ? '#27272a' : '#e2e8f0',
                color: showWageChartHelper ? activeHexColor : isDarkMode ? '#a1a1aa' : '#64748b'
              }}
            >
              <Table size={14} />
              {showWageChartHelper ? 'Hide Wage Chart' : 'Wage Chart Helper'}
              {showWageChartHelper ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="space-y-6">

            {/* INTERACTIVE INSTRUCTION A WAGE CHART HELPER */}
            {showWageChartHelper && (
              <div className={`p-5 rounded-2xl border transition-all animate-in fade-in duration-200 ${
                isDarkMode ? 'bg-[#181a20] border-zinc-700/80' : 'bg-blue-50/40 border-blue-200/80'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <Table size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-blue-500 uppercase tracking-wider">
                      Instruction A – Official New Jersey Wage Chart Calculator
                    </h4>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${labelText}`}>
                      Recommended if you are Married Joint (Status 2), Head of Household (Status 4), or Qualifying Widow(er) (Status 5) and combined wages exceed $50,000.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${labelText}`}>
                      Your Wages (Row Bracket)
                    </label>
                    <select
                      value={wageRowIndex}
                      onChange={(e) => setWageRowIndex(parseInt(e.target.value, 10))}
                      className={inputStyle}
                    >
                      {WAGE_BRACKETS.map((b, idx) => (
                        <option key={b} value={idx}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${labelText}`}>
                      Total Other / Spouse Wages (Column Bracket)
                    </label>
                    <select
                      value={wageColIndex}
                      onChange={(e) => setWageColIndex(parseInt(e.target.value, 10))}
                      className={inputStyle}
                    >
                      {WAGE_BRACKETS.map((b, idx) => (
                        <option key={b} value={idx}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resulting intersection letter */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-500">Resulting Rate Letter:</span>
                    <span className="text-2xl font-black px-3 py-1 rounded-lg bg-blue-500 text-white shadow-md">
                      Rate {recommendedWageChartLetter}
                    </span>
                    <span className={`text-[11px] font-medium ${labelText}`}>
                      {rateTableOptions.find(o => o.code === recommendedWageChartLetter)?.desc}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyWageChartLetter}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-transform active:scale-95 hover:opacity-90 shrink-0"
                    style={{ backgroundColor: activeHexColor }}
                  >
                    <Check size={14} />
                    Apply Rate {recommendedWageChartLetter} to Line 3
                  </button>
                </div>
              </div>
            )}

            {/* Line 3: Wage Rate Table Letter */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>
                Line 3: Wage Rate Table Letter (From Instruction A)
              </label>
              <div className="max-w-md">
                <select
                  name="line3_letter"
                  value={formData.line3_letter}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  {rateTableOptions.map(opt => (
                    <option key={opt.code} value={opt.code}>
                      {opt.code ? `${opt.label} – ${opt.desc}` : opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className={`text-[11px] mt-1.5 ${labelText}`}>
                Optional: Enter letter (A, B, C, D, or E) to calculate withholding using the New Jersey Wage Chart.
              </p>
            </div>

            {/* Line 4: Allowances with Interactive Breakdown Helper */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${labelText}`}>
                  Line 4: Total Number of Allowances Claimed
                </label>
                <button
                  type="button"
                  onClick={() => setShowAllowancesHelper(!showAllowancesHelper)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold transition-colors hover:underline"
                  style={{ color: activeHexColor }}
                >
                  <Calculator size={13} />
                  {showAllowancesHelper ? 'Hide Allowance Helper' : 'Calculate Allowances'}
                </button>
              </div>

              {/* Allowances Breakdown Helper */}
              {showAllowancesHelper && (
                <div className={`p-4 rounded-2xl border mb-3 transition-all animate-in fade-in duration-200 ${
                  isDarkMode ? 'bg-[#181a20] border-zinc-700/80' : 'bg-emerald-50/40 border-emerald-200/80'
                }`}>
                  <h4 className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    New Jersey Allowance Worksheet Helper
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowanceHelper.self}
                        onChange={(e) => setAllowanceHelper(prev => ({ ...prev, self: e.target.checked }))}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                      />
                      <span>1 for Yourself (Taxpayer)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowanceHelper.spouse}
                        onChange={(e) => setAllowanceHelper(prev => ({ ...prev, spouse: e.target.checked }))}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                      />
                      <span>1 for Spouse / Partner (if Married Joint)</span>
                    </label>

                    <div className="flex items-center justify-between gap-2">
                      <span>Qualified Dependents (children/relatives):</span>
                      <input
                        type="number"
                        min="0"
                        value={allowanceHelper.dependents}
                        onChange={(e) => setAllowanceHelper(prev => ({ ...prev, dependents: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                        className="w-16 px-2 py-1 rounded-lg border text-center font-bold text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span>Dependents Attending College (+$1,000 ea):</span>
                      <input
                        type="number"
                        min="0"
                        value={allowanceHelper.college}
                        onChange={(e) => setAllowanceHelper(prev => ({ ...prev, college: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                        className="w-16 px-2 py-1 rounded-lg border text-center font-bold text-xs"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowanceHelper.age65_self}
                        onChange={(e) => setAllowanceHelper(prev => ({ ...prev, age65_self: e.target.checked }))}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                      />
                      <span>You are Age 65 or Older (+1)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowanceHelper.age65_spouse}
                        onChange={(e) => setAllowanceHelper(prev => ({ ...prev, age65_spouse: e.target.checked }))}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                      />
                      <span>Spouse is Age 65 or Older (+1)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowanceHelper.blind_self}
                        onChange={(e) => setAllowanceHelper(prev => ({ ...prev, blind_self: e.target.checked }))}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                      />
                      <span>You are Legally Blind (+1)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowanceHelper.blind_spouse}
                        onChange={(e) => setAllowanceHelper(prev => ({ ...prev, blind_spouse: e.target.checked }))}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                      />
                      <span>Spouse is Legally Blind (+1)</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="max-w-xs">
                <input 
                  type="number" 
                  name="allowances" 
                  min="0" 
                  max="30"
                  value={formData.allowances} 
                  onChange={handleChange} 
                  disabled={formData.exempt}
                  className={`${inputStyle} font-bold text-base`} 
                />
              </div>
              <p className={`text-[11px] mt-1.5 ${labelText}`}>
                Each allowance decreases the amount of tax withheld from your wages.
              </p>
            </div>

            {/* Line 5: Additional Withholding */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${labelText}`}>
                Line 5: Additional amount you want deducted from each pay ($)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  name="additional_withholding" 
                  value={formData.additional_withholding} 
                  onChange={handleChange} 
                  className={`${inputStyle} pl-8 text-base font-bold`} 
                  placeholder="0.00" 
                />
              </div>
              <p className={`text-[11px] mt-1.5 ${labelText}`}>
                Voluntary additional deduction withheld per pay period.
              </p>
            </div>

            {/* Line 6: Exemption */}
            <div className={`p-5 rounded-2xl border transition-all ${
              formData.exempt 
                ? 'border-amber-500/50 bg-amber-500/10 shadow-sm' 
                : isDarkMode ? 'border-zinc-800 bg-[#161820]' : 'border-slate-200 bg-slate-50'
            }`}>
              <label className="flex items-start gap-3.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="exempt" 
                  checked={formData.exempt} 
                  onChange={handleChange} 
                  className="w-5 h-5 rounded shrink-0 mt-0.5 accent-amber-500" 
                />
                <div>
                  <span className="text-xs font-extrabold text-amber-500 block">
                    Line 6: I claim Exemption from withholding of NJ Gross Income Tax
                  </span>
                  <span className={`text-[11px] leading-relaxed block mt-1.5 ${labelText}`}>
                    You qualify for exemption only if: (1) Single/Separate filer with wages + nonwage income of $10,000 or less; OR (2) Married Joint / Head of Household / Surviving Partner with wages + nonwage income of $20,000 or less.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 4: EMPLOYER INFORMATION (AUTO-POPULATED) */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <Building2 size={18} style={{ color: activeHexColor }} />
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider">
                4. Employer Information (Auto-Populated)
              </h3>
              <p className={`text-xs mt-0.5 ${labelText}`}>
                Official corporate identification printed directly on Form NJ-W4.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className={`p-4 rounded-2xl border sm:col-span-8 flex items-start gap-3.5 ${innerCardBg}`}>
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
              >
                <Building2 size={18} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-zinc-400 block mb-0.5 uppercase tracking-wider">
                  Employer's Name & Address
                </span>
                <span className="text-sm font-extrabold block">
                  {formData.employer_name}
                </span>
                <span className={`text-xs font-medium block mt-0.5 opacity-80 ${labelText}`}>
                  {formData.employer_address}, {formData.employer_city}, {formData.employer_state} {formData.employer_zip}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border sm:col-span-4 flex items-start gap-3.5 ${innerCardBg}`}>
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${activeHexColor}18`, color: activeHexColor }}
              >
                <Shield size={18} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-zinc-400 block mb-0.5 uppercase tracking-wider">
                  Employer EIN
                </span>
                <span className="text-sm font-mono font-black tracking-wider block">
                  {formData.employer_ein}
                </span>
                <span className={`text-[10px] font-medium block mt-0.5 opacity-70 ${labelText}`}>
                  NJ Withholding Tax ID
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: DECLARATION & DIGITAL SIGNATURE */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${cardBg}`}>
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200/60 dark:border-zinc-800/80">
            <PenTool size={18} style={{ color: activeHexColor }} />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">5. Employee Declaration & Signature</h3>
          </div>

          <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed ${innerCardBg}`}>
            <span className="font-bold block mb-1">Line 7: Under penalties of perjury:</span>
            I certify that I am entitled to the number of withholding allowances claimed on this certificate or entitled to claim exempt status.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            <div className="sm:col-span-4">
              <CustomDatePicker 
                label="Date of Signing *" 
                name="confirmation_date" 
                value={formData.confirmation_date} 
                onChange={handleChange} 
                isDarkMode={isDarkMode} 
                activeHexColor={activeHexColor} 
              />
            </div>

            <div className="sm:col-span-8">
              <div className="flex justify-between items-center mb-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${labelText}`}>
                  Digital Signature *
                </label>
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Eraser size={14} />
                  Clear Signature
                </button>
              </div>

              <div 
                ref={containerRef}
                className={`relative h-44 rounded-2xl border-2 border-dashed overflow-hidden cursor-crosshair transition-all ${
                  isDarkMode 
                    ? 'border-zinc-700 bg-[#161820]' 
                    : 'border-slate-300 bg-white shadow-inner'
                }`}
              >
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor={isDarkMode ? '#60a5fa' : '#00198c'}
                  velocityFilterWeight={0.7}
                  canvasProps={{ className: 'w-full h-full' }}
                  onEnd={handleSignatureEnd}
                />
                {!formData.signature_image && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                    <PenTool size={24} style={{ color: activeHexColor }} />
                    <span className="text-[11px] font-bold mt-2">Sign in the box above</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: activeHexColor }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Form NJ-W4...
              </>
            ) : (
              <>
                <Save size={16} />
                Save & Generate Form NJ-W4
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default NewJerseyTaxForm;