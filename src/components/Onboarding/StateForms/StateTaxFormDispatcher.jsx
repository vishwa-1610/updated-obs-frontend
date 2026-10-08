import React, { useState } from 'react';
import { FileQuestion, AlertTriangle, Copy, CheckCircle2, ArrowRight, PenTool, ExternalLink } from 'lucide-react';
import { useTheme, THEME_COLORS } from '../../Theme/ThemeProvider';

// --- 1. Import Forms ---
import FederalTaxForm from '../Federal/FederalTaxForm'; // Uses the modernized Federal form
import AlabamaW4Form from './AlabamaW4Form';
import ArizonaW4Form from './ArizonaW4Form';
import ArkansasW4Form from './ArkansasW4Form';
import CaliforniaDE4Form from './CaliforniaDE4Form';
import ColoradoTaxForm from './ColoradoTaxForm';
import ConnecticutTaxForm from './ConnecticutTaxForm';
import DelawareTaxForm from './DelawareTaxForm';
import DCTaxForm from './DCTaxForm';
import GeorgiaTaxForm from './GeorgiaTaxForm';
import HawaiiTaxForm from './HawaiiTaxForm';
import IdahoTaxForm from './IdahoTaxForm';
import IllinoisTaxForm from './IllinoisTaxForm';
import IndianaTaxForm from './IndianaTaxForm';
import IowaTaxForm from './IowaTaxForm';
import KansasTaxForm from './KansasTaxForm';
import KentuckyTaxForm from './KentuckyTaxForm';
import LouisianaTaxForm from './LouisianaTaxForm';
import MaineTaxForm from './MaineTaxForm';
import MarylandTaxForm from './MarylandTaxForm';
import MassachusettsTaxForm from './MassachusettsTaxForm';
import MichiganTaxForm from './MichiganTaxForm';
import MinnesotaTaxForm from './MinnesotaTaxForm';
import MississippiTaxForm from './MississippiTaxForm';
import MissouriTaxForm from './MissouriTaxForm';
import MontanaTaxForm from './MontanaTaxForm';
import NebraskaTaxForm from './NebraskaTaxForm';
import NewJerseyTaxForm from './NewJerseyTaxForm';
import NewYorkTaxForm from './NewYorkTaxForm';
import NorthCarolinaTaxForm from './NorthCarolinaTaxForm';
import OhioTaxForm from './OhioTaxForm';
import OklahomaTaxForm from './OklahomaTaxForm';
import OregonTaxForm from './OregonTaxForm';
import PennsylvaniaTaxForm from './PennsylvaniaTaxForm';
import RhodeIslandTaxForm from './RhodeIslandTaxForm';
import SouthCarolinaTaxForm from './SouthCarolinaTaxForm';
import VermontTaxForm from './VermontTaxForm';
import VirginiaTaxForm from './VirginiaTaxForm';
import WestVirginiaTaxForm from './WestVirginiaTaxForm';
import WisconsinTaxForm from './WisconsinTaxForm';

// --- 2. State Mapping (Specific Forms) ---
const FORM_MAP = {
  'AL': AlabamaW4Form,
  'AZ': ArizonaW4Form,
  'AR': ArkansasW4Form,
  'CA': CaliforniaDE4Form,
  'CT': ConnecticutTaxForm,
  'DE': DelawareTaxForm,
  'DC': DCTaxForm,
  'GA': GeorgiaTaxForm,
  'HI': HawaiiTaxForm,
  'ID': IdahoTaxForm,
  'IL': IllinoisTaxForm,
  'IN': IndianaTaxForm,
  'IA': IowaTaxForm,
  'KS': KansasTaxForm,
  'KY': KentuckyTaxForm,
  'LA': LouisianaTaxForm,
  'ME': MaineTaxForm,
  'MD': MarylandTaxForm,
  'MA': MassachusettsTaxForm,
  'MI': MichiganTaxForm,
  'MN': MinnesotaTaxForm,
  'MS': MississippiTaxForm,
  'MO': MissouriTaxForm,
  'MT': MontanaTaxForm,
  'NE': NebraskaTaxForm,
  'NJ': NewJerseyTaxForm,
  'NY': NewYorkTaxForm,
  'NC': NorthCarolinaTaxForm,
  'OH': OhioTaxForm,
  'OK': OklahomaTaxForm,
  'OR': OregonTaxForm,
  'PA': PennsylvaniaTaxForm,
  'RI': RhodeIslandTaxForm,
  'SC': SouthCarolinaTaxForm,
  'VT': VermontTaxForm,
  'VA': VirginiaTaxForm,
  'WV': WestVirginiaTaxForm,
  'WI': WisconsinTaxForm,
};

// --- 3. CATEGORY B: States that USE the Federal Form ---
const USES_FEDERAL_FORM = [
  'UT', // Utah
  'NM', // New Mexico
  'ND', // North Dakota
  'CO'  // Colorado
];

// --- 4. CATEGORY C: States with NO Income Tax ---
const NO_TAX_STATES = [
  'AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'
];

const StateTaxFormDispatcher = ({ userState, initialData, onSubmit }) => {
  const [showFedForm, setShowFedForm] = useState(false);
  const { isDarkMode, accentColor } = useTheme();
  const activeHexColor = THEME_COLORS.find(c => c.id === accentColor)?.color || '#2563eb';
  const code = userState ? userState.toUpperCase().trim() : '';

  // -----------------------------------------------------------
  // A. Check for Specific State Form (Normal Path)
  // -----------------------------------------------------------
  const SpecificForm = FORM_MAP[code];
  if (SpecificForm) {
    return <SpecificForm initialData={initialData} onSubmit={onSubmit} />;
  }

  // -----------------------------------------------------------
  // B. "Uses Federal Form" States (UT, NM, CO, ND)
  // -----------------------------------------------------------
  if (USES_FEDERAL_FORM.includes(code)) {
    if (showFedForm) {
      return (
        <div className="space-y-4 animate-in fade-in">
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <Copy size={16} className="text-blue-500 shrink-0" />
            <p className="text-xs">
              Completing the <strong>Federal W-4</strong> for <strong>{code}</strong> state withholding records.
            </p>
          </div>
          <FederalTaxForm 
            initialData={{ ...initialData, state: code }} 
            onSubmit={onSubmit} 
          />
        </div>
      );
    }

    return (
      <div className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border text-center ${
        isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md" style={{ backgroundColor: `${activeHexColor}20`, color: activeHexColor }}>
          <Copy size={24} />
        </div>
        <h3 className="text-base font-extrabold mb-1">{code} Uses Federal W-4</h3>
        <p className={`text-xs max-w-sm mb-5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          The state of <strong className="text-current">{code}</strong> accepts the Federal W-4 form for state tax withholding.
        </p>
        <button 
          onClick={() => setShowFedForm(true)}
          style={{ backgroundColor: activeHexColor }}
          className="px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
        >
          <PenTool size={14} />
          <span>Complete State W-4 Copy</span>
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------
  // C. "No Tax" States (TX, FL, WA, etc.)
  // -----------------------------------------------------------
  if (NO_TAX_STATES.includes(code)) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border text-center ${
        isDarkMode ? 'bg-[#181a20] border-zinc-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-3">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="text-base font-extrabold mb-1">No State Form Required</h3>
        <p className={`text-xs max-w-sm mb-5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          <strong className="text-current">{code}</strong> does not have state personal income tax on wages.
        </p>
        <button 
          onClick={() => onSubmit({ 
            ...initialData,
            state: code, 
            no_form_required: true,
            exempt: true 
          })}
          style={{ backgroundColor: activeHexColor }}
          className="px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
        >
          <CheckCircle2 size={14} />
          <span>Confirm & Continue</span>
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------
  // D. Fallback (Unknown State)
  // -----------------------------------------------------------
  return (
    <div className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border text-center ${
      isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-base font-extrabold mb-1 text-amber-600 dark:text-amber-400">Form Not Available</h3>
      <p className={`text-xs max-w-sm mb-5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
        We do not currently have an automated online withholding form for <strong>{code || 'Unknown State'}</strong>.
      </p>
      <button 
        onClick={() => window.open(`https://www.google.com/search?q=${code}+state+withholding+form`, '_blank')}
        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl hover:bg-amber-50 transition-all flex items-center gap-1.5 shadow-sm"
      >
        <span>Search Official Form Online</span>
        <ExternalLink size={13} />
      </button>
    </div>
  );
};

export default StateTaxFormDispatcher;