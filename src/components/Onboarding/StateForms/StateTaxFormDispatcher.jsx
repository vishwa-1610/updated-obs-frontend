import React, { useState } from 'react';
import { FileQuestion, AlertTriangle, Copy, CheckCircle } from 'lucide-react';

// --- 1. Import Forms ---
import FederalTaxForm from './FederalTaxForm'; // Required for "Uses Federal" states
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
// These states require a form, but accept the Federal W-4.
const USES_FEDERAL_FORM = [
  'UT', // Utah
  'NM', // New Mexico
  'ND', // North Dakota
  'CO'  // Colorado (Has own form, but often accepts Fed)
];

// --- 4. CATEGORY C: States with NO Income Tax ---
// These states require NO form at all.
const NO_TAX_STATES = [
  'AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'
];

const StateTaxFormDispatcher = ({ userState, initialData, onSubmit }) => {
  const [showFedForm, setShowFedForm] = useState(false);
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
      // If user clicked "Complete Form", show the Federal Form
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You are completing the <strong>Federal W-4</strong> for <strong>{code}</strong> state withholding records.
                </p>
              </div>
            </div>
          </div>
          <FederalTaxForm 
            initialData={{ ...initialData, state: code }} 
            onSubmit={onSubmit} 
          />
        </div>
      );
    }

    // Default View: Show the "Move to Federal" Button
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
        <div className="bg-blue-50 p-4 rounded-full mb-6">
            <Copy size={40} className="text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{code} Uses Federal W-4</h3>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          The state of <span className="font-bold text-gray-800">{code}</span> accepts the Federal W-4 form for state tax withholding. You need to submit a copy for state records.
        </p>
        <button 
          onClick={() => setShowFedForm(true)}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
        >
          <Pen size={18} /> Complete State W-4
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------
  // C. "No Tax" States (TX, FL, WA, etc.)
  // -----------------------------------------------------------
  if (NO_TAX_STATES.includes(code)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
        <div className="bg-green-50 p-4 rounded-full mb-6">
            <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No State Form Required</h3>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          Good news! <span className="font-bold text-gray-800">{code}</span> does not have state income tax on wages. You do not need to file any additional forms.
        </p>
        <button 
          onClick={() => onSubmit({ 
              ...initialData,
              state: code, 
              no_form_required: true,
              exempt: true 
          })}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
        >
          <CheckCircle size={18} /> Confirm & Continue
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------
  // D. Fallback (Unknown State)
  // -----------------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-yellow-50 rounded-2xl border border-yellow-200 text-center">
      <div className="bg-yellow-100 p-4 rounded-full mb-6">
        <AlertTriangle size={32} className="text-yellow-600" />
      </div>
      <h3 className="text-xl font-bold text-yellow-900 mb-2">Form Not Found</h3>
      <p className="text-yellow-800 max-w-lg mb-8">
        We do not currently have a specialized form for <span className="font-bold">{code || 'Unknown State'}</span>.
      </p>
      <button 
        onClick={() => window.open(`https://www.google.com/search?q=${code}+state+withholding+form`, '_blank')}
        className="px-6 py-3 bg-white border-2 border-yellow-400 text-yellow-800 font-bold rounded-xl hover:bg-yellow-100 transition-colors"
      >
        Find Form Online
      </button>
    </div>
  );
};

export default StateTaxFormDispatcher;