import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Briefcase, Calendar, MapPin, Mail, Phone, FileText, Users, Download, Hash, Home, Landmark, CreditCard, Percent } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useTheme } from '../Theme/ThemeProvider';
import { fetchBankDetails, clearBankDetails } from '../../store/onboardingSlice';

const OnboardingDetailsModal = ({ isOpen, onClose, onboarding }) => {
  const [activeTab, setActiveTab] = useState('details');
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();

  // 1. SELECT DATA
  const { bankDetails, bankLoading } = useSelector((state) => state.onboarding);

  // 2. ID RESOLUTION LOGIC (CRITICAL FIX)
  // We need the ID of the original 'Onboarding' model to fetch bank details.
  // - If 'Pending' or 'All' tab passed the standard object, use .id
  // - If 'Confirmed' tab passed the ConfirmedOnboarding object, use .onboarding (which is the FK ID)
  const coreOnboardingId = useMemo(() => {
    if (!onboarding) return null;
    
    // Case A: It has a nested 'onboarding' object (e.g. detailed response)
    if (onboarding.onboarding && typeof onboarding.onboarding === 'object') {
        return onboarding.onboarding.id;
    }
    // Case B: It has 'onboarding' as a flat ID (e.g. ConfirmedOnboarding record)
    if (onboarding.onboarding) {
        return onboarding.onboarding;
    }
    // Case C: It is the Onboarding object itself
    return onboarding.id;
  }, [onboarding]);

  // 3. FETCH EFFECT
  useEffect(() => {
    if (isOpen && coreOnboardingId) {
      dispatch(fetchBankDetails(coreOnboardingId));
    }
    return () => {
      dispatch(clearBankDetails());
    };
  }, [isOpen, coreOnboardingId, dispatch]);

  // 4. MEMOIZE TABS
  const tabs = useMemo(() => {
    if (!onboarding) return [];

    const baseTabs = [
      { id: 'details', label: 'Candidate Info', icon: User },
      { id: 'job', label: 'Job Details', icon: Briefcase },
    ];

    // Always show Bank Details tab if we have an ID to fetch for
    if (coreOnboardingId) {
      baseTabs.push({ id: 'bank', label: 'Bank Details', icon: Landmark });
    }

    // Conditional Tabs
    if (onboarding.ec1_name || onboarding.ec2_name) {
      baseTabs.push({ id: 'emergency', label: 'Emergency', icon: Users });
    }

    if (onboarding.w4_pdf || onboarding.i9_pdf || onboarding.federal_w4_pdf) {
      baseTabs.push({ id: 'documents', label: 'Documents', icon: FileText });
    }

    return baseTabs;
  }, [onboarding, coreOnboardingId]);

  if (!onboarding) return null;

  // Determine if this is a confirmed record for UI display purposes
  const isConfirmed = onboarding.is_confirmed || onboarding.confirmation_status === 'Confirmed' || onboarding.status === 'COMPLETED' || onboarding.status === true;

  // --- RENDER SECTIONS ---

  const renderCandidateInfo = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <User className="w-5 h-5 mr-2 text-blue-500"/> Personal Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailItem icon={User} label="First Name" value={onboarding.first_name} isDarkMode={isDarkMode} />
        <DetailItem icon={User} label="Last Name" value={onboarding.last_name} isDarkMode={isDarkMode} />
        <DetailItem icon={Mail} label="Email" value={onboarding.email} isDarkMode={isDarkMode} />
        <DetailItem icon={Phone} label="Phone" value={onboarding.phone_no} isDarkMode={isDarkMode} />
        
        {isConfirmed && (
          <>
            <div className="md:col-span-2 border-t my-2 opacity-20"></div>
            <DetailItem icon={Hash} label="SSN" value={onboarding.ssn} isDarkMode={isDarkMode} />
            <DetailItem icon={Calendar} label="DOB" value={onboarding.dob || onboarding.start_date} isDarkMode={isDarkMode} />
            <DetailItem icon={Home} label="Address" value={onboarding.address} isDarkMode={isDarkMode} fullWidth />
            <DetailItem icon={MapPin} label="City / State / Zip" value={`${onboarding.city || ''}, ${onboarding.state || ''} ${onboarding.zipcode || ''}`} isDarkMode={isDarkMode} fullWidth />
          </>
        )}
      </div>
    </div>
  );

  const renderJobInfo = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <Briefcase className="w-5 h-5 mr-2 text-blue-500"/> Assignment Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailItem icon={Briefcase} label="Client Name" value={onboarding.client_name} isDarkMode={isDarkMode} />
        <DetailItem icon={Briefcase} label="Job Title" value={onboarding.job_title} isDarkMode={isDarkMode} />
        <DetailItem icon={Calendar} label="Start Date" value={onboarding.start_date} isDarkMode={isDarkMode} />
        <DetailItem icon={Calendar} label="End Date" value={onboarding.end_date} isDarkMode={isDarkMode} />
        <DetailItem icon={MapPin} label="Work State" value={onboarding.state} isDarkMode={isDarkMode} />
      </div>
    </div>
  );

  const renderBankInfo = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <Landmark className="w-5 h-5 mr-2 text-green-500"/> Bank Accounts
      </h3>

      {bankLoading ? (
        <div className="py-8 text-center text-gray-500 animate-pulse">Fetching bank details...</div>
      ) : bankDetails && bankDetails.length > 0 ? (
        <div className="space-y-4">
            {bankDetails.map((acc, index) => (
                <div key={acc.id || index} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                            Account #{index + 1}
                        </span>
                        <div className="flex items-center">
                            <Percent size={14} className="mr-1 text-gray-400"/>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{acc.percentage}% Split</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem icon={Landmark} label="Bank Name" value={acc.bank_name} isDarkMode={isDarkMode} />
                        <DetailItem icon={User} label="Account Holder" value={acc.account_holder_name} isDarkMode={isDarkMode} />
                        <DetailItem icon={Hash} label="Account Number" value={acc.account_number} isDarkMode={isDarkMode} />
                        <DetailItem icon={Hash} label="Routing Number" value={acc.routing_number} isDarkMode={isDarkMode} />
                        <DetailItem icon={CreditCard} label="Account Type" value={acc.account_type} isDarkMode={isDarkMode} />
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 italic flex flex-col items-center">
            <Landmark size={48} className="mb-2 opacity-20"/>
            <p>No bank details available.</p>
        </div>
      )}
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <Users className="w-5 h-5 mr-2 text-rose-500"/> Emergency Contacts
      </h3>
      
      {onboarding.ec1_name && (
        <div className="mb-8">
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDarkMode ? 'text-blue-400 border-gray-700' : 'text-blue-600 border-gray-200'}`}>
                Primary Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem icon={User} label="Name" value={onboarding.ec1_name} isDarkMode={isDarkMode} />
                <DetailItem icon={Users} label="Relationship" value={onboarding.ec1_relationship} isDarkMode={isDarkMode} />
                <DetailItem icon={Phone} label="Phone" value={onboarding.ec1_phone} isDarkMode={isDarkMode} />
                <DetailItem icon={Mail} label="Email" value={onboarding.ec1_email} isDarkMode={isDarkMode} />
            </div>
        </div>
      )}

      {onboarding.ec2_name && (
        <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDarkMode ? 'text-blue-400 border-gray-700' : 'text-blue-600 border-gray-200'}`}>
                Secondary Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem icon={User} label="Name" value={onboarding.ec2_name} isDarkMode={isDarkMode} />
                <DetailItem icon={Users} label="Relationship" value={onboarding.ec2_relationship} isDarkMode={isDarkMode} />
                <DetailItem icon={Phone} label="Phone" value={onboarding.ec2_phone} isDarkMode={isDarkMode} />
                <DetailItem icon={Mail} label="Email" value={onboarding.ec2_email} isDarkMode={isDarkMode} />
            </div>
        </div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <FileText className="w-5 h-5 mr-2 text-purple-500"/> Generated Documents
      </h3>
      <div className="space-y-3">
        {onboarding.federal_w4_pdf && (
            <DocumentItem label="Federal W-4 Form" url={onboarding.federal_w4_pdf} isDarkMode={isDarkMode} />
        )}
        {onboarding.w4_pdf && (
            <DocumentItem label={`State Tax Form (${onboarding.state})`} url={onboarding.w4_pdf} isDarkMode={isDarkMode} />
        )}
        {onboarding.i9_pdf && (
            <DocumentItem label="USCIS I-9 Form" url={onboarding.i9_pdf} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Onboarding: ${onboarding.first_name} ${onboarding.last_name}`} size="xl">
        <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 px-1`}>
            <nav className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center transition-all duration-200 whitespace-nowrap rounded-t-md ${activeTab === tab.id 
                        ? (isDarkMode ? 'border-blue-500 text-blue-400 bg-gray-800' : 'border-blue-600 text-blue-600 bg-blue-50')
                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}`}>
                        <tab.icon className="w-4 h-4 mr-2"/> {tab.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-1 pb-4 custom-scrollbar">
            {activeTab === 'details' && renderCandidateInfo()}
            {activeTab === 'job' && renderJobInfo()}
            {activeTab === 'bank' && renderBankInfo()}
            {activeTab === 'emergency' && renderEmergencyContacts()}
            {activeTab === 'documents' && renderDocuments()}
        </div>
    </Modal>
  );
};

const DetailItem = ({ icon: Icon, label, value, isDarkMode, fullWidth }) => (
  <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${fullWidth ? 'md:col-span-2' : ''} ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
    <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
        <Icon size={18} />
    </div>
    <div className="overflow-hidden">
        <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value || <span className="opacity-50 italic">N/A</span>}</p>
    </div>
  </div>
);

const DocumentItem = ({ label, url, isDarkMode }) => {
    const downloadUrl = url.startsWith('http') ? url : `${process.env.REACT_APP_API_URL || ''}${url}`;
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}>
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <FileText size={20} />
                </div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{label}</span>
            </div>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Download size={14} className="mr-1.5" /> Download
            </a>
        </div>
    );
};

export default OnboardingDetailsModal;