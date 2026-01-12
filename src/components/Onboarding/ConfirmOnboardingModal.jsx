import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FileCheck2 } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import SuccessModal from '../common/Modal/SuccessModal';
import { confirmOnboarding } from '../../store/onboardingSlice';

// Import State Forms
import AlabamaW4Form from './StateForms/AlabamaW4Form';
import ArizonaW4Form from './StateForms/ArizonaW4Form';

const ConfirmOnboardingModal = ({ isOpen, onClose, onboarding }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = (finalFormData) => {
    setLoading(true);
    setErrorMsg('');
    
    // Safety check for ID
    const payload = {
        ...finalFormData,
        onboarding_id: finalFormData.onboarding_id || onboarding?.id
    };

    dispatch(confirmOnboarding(payload))
      .unwrap()
      .then((msg) => {
        setLoading(false);
        setSuccessMsg(msg || "Onboarding Confirmed Successfully!");
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err.detail || err.message || "Failed to confirm onboarding.");
      });
  };

  const handleCloseSuccess = () => {
    setSuccessMsg('');
    onClose();
  };

  // --- DYNAMIC FORM RENDERER ---
  const renderStateForm = () => {
    // Default to AL if state is missing, otherwise uppercase for comparison
    const stateCode = (onboarding?.state || 'AL').toUpperCase();

    switch (stateCode) {
      case 'AZ':
        return (
          <ArizonaW4Form 
            initialData={onboarding} 
            onSubmit={handleConfirm} 
          />
        );
      case 'AL':
      default:
        return (
          <AlabamaW4Form 
            initialData={onboarding} 
            onSubmit={handleConfirm} 
          />
        );
    }
  };

  // Helper for dynamic title
  const getStateName = () => {
    const code = (onboarding?.state || 'AL').toUpperCase();
    const names = { AL: 'Alabama', AZ: 'Arizona' };
    return names[code] || code;
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Complete Onboarding" size="2xl">
        <div className="bg-white text-gray-900 rounded-lg">
            
            {/* Dynamic Header */}
            <div className="mx-6 mt-6 mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FileCheck2 size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">{getStateName()} Tax Withholding</h3>
                    <p className="text-blue-100 text-sm mt-1">
                        Please review details and complete the tax election below.
                    </p>
                </div>
            </div>

            {/* Scrollable Form Area */}
            <div className="max-h-[65vh] overflow-y-auto custom-scrollbar px-6 pb-6">
                {renderStateForm()}
            </div>
        </div>
      </Modal>

      <SuccessModal isOpen={!!successMsg} onClose={handleCloseSuccess} title="Success" message={successMsg} type="success" />
      <SuccessModal isOpen={!!errorMsg} onClose={() => setErrorMsg('')} title="Error" message={errorMsg} type="error" autoClose={5000} />
    </>
  );
};

export default ConfirmOnboardingModal;