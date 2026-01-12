import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, X, ChevronLeft, ChevronRight, CreditCard, 
  MapPin, User, ChevronDown, Check 
} from 'lucide-react';
import FormField from '../common/Form/FormField';
import { useTheme } from '../Theme/ThemeProvider'; // Assuming you have this hook

// --- INTERNAL COMPONENT: STUNNING CUSTOM SELECT ---
const StunningSelect = ({ label, name, value, onChange, options, error, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const { isDarkMode } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    // Mimic the event object so the parent's handleChange works properly
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label;

  return (
    <div className="mb-1 relative" ref={ref}>
      <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </label>
      
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600' 
            : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 shadow-sm'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
        `}
      >
        <span className={!value ? 'text-gray-400' : ''}>
          {selectedLabel || placeholder || "Select..."}
        </span>
        <ChevronDown 
          size={18} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} 
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute z-50 w-full mt-2 rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200
          ${isDarkMode ? 'bg-gray-800/95 backdrop-blur-xl border-gray-700' : 'bg-white/95 backdrop-blur-xl border-gray-100'}
        `}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {options.map((option) => (
              <div 
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  px-4 py-3 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-all
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-200' 
                    : 'hover:bg-blue-50 text-gray-700'}
                  ${value === option.value ? (isDarkMode ? 'bg-gray-700 font-semibold text-white' : 'bg-blue-50 font-semibold text-blue-600') : ''}
                `}
              >
                {option.label}
                {value === option.value && <Check size={16} className="text-blue-500" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

const ClientForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false
}) => {
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    client_name: '',
    contact_no: '',
    city: '',
    email: '',
    industry: '',
    
    client_location: '',
    work_location: '',
    office_address: '',
    billing_address: '',
    shipping_address: '',
    
    payee_name: '',
    credit_card_number: '',
    card_expiry: '',
    card_cvv: '',
    billing_cycle: 'monthly',
    
    initiated_onboarding: [],
    onboarding_data: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        client_name: initialData.client_name || '',
        contact_no: initialData.contact_no || '',
        city: initialData.city || '',
        email: initialData.email || '',
        industry: initialData.industry || '',
        initiated_onboarding: initialData.initiated_onboarding || [],
        onboarding_data: initialData.onboarding_data || [],
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.client_name?.trim()) {
        newErrors.client_name = 'Client name is required';
      }

      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      if (formData.contact_no && !/^\d+$/.test(formData.contact_no)) {
        newErrors.contact_no = 'Contact number must contain only digits';
      }
    }

    if (step === 2) {
      if (!formData.client_location?.trim()) {
        newErrors.client_location = 'Client location is required';
      }
      
      if (!formData.work_location?.trim()) {
        newErrors.work_location = 'Work location is required';
      }
    }

    if (step === 3) {
      if (!formData.payee_name?.trim()) {
        newErrors.payee_name = 'Payee name is required';
      }

      if (!formData.credit_card_number?.trim()) {
        newErrors.credit_card_number = 'Credit card number is required';
      } else if (!/^\d{16}$/.test(formData.credit_card_number.replace(/\s/g, ''))) {
        newErrors.credit_card_number = 'Please enter a valid 16-digit card number';
      }

      if (!formData.card_expiry?.trim()) {
        newErrors.card_expiry = 'Card expiry is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.card_expiry)) {
        newErrors.card_expiry = 'Please enter expiry in MM/YY format';
      }

      if (!formData.card_cvv?.trim()) {
        newErrors.card_cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.card_cvv)) {
        newErrors.card_cvv = 'Please enter valid CVV (3-4 digits)';
      }
    }

    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let allErrors = {};
    for (let step = 1; step <= totalSteps; step++) {
      const stepErrors = validateStep(step);
      allErrors = { ...allErrors, ...stepErrors };
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstErrorStep = Object.keys(allErrors).reduce((minStep, field) => {
        const fieldStep = getStepForField(field);
        return fieldStep < minStep ? fieldStep : minStep;
      }, totalSteps);
      setCurrentStep(firstErrorStep);
      return;
    }

    const apiData = {
      client_name: formData.client_name,
      contact_no: formData.contact_no,
      city: formData.city,
      email: formData.email,
      industry: formData.industry,
    };

    onSubmit(apiData);
  };

  const getStepForField = (fieldName) => {
    const step1Fields = ['client_name', 'contact_no', 'city', 'email', 'industry'];
    const step2Fields = ['client_location', 'work_location', 'office_address', 'billing_address', 'shipping_address'];
    
    if (step1Fields.includes(fieldName)) return 1;
    if (step2Fields.includes(fieldName)) return 2;
    return 3;
  };

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
  ];

  const billingCycleOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'one_time', label: 'One Time' },
  ];

  const handleCreditCardChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substr(0, 16);
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    
    handleChange({
      target: {
        name: 'credit_card_number',
        value: value
      }
    });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substr(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    handleChange({
      target: {
        name: 'card_expiry',
        value: value
      }
    });
  };

  // Step 1: Client Details
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Client Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Basic information about the client</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Client Name"
          name="client_name"
          value={formData.client_name}
          onChange={handleChange}
          error={errors.client_name}
          required
          placeholder="Enter client name"
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="Enter email address"
        />

        <FormField
          label="Contact Number"
          name="contact_no"
          type="tel"
          value={formData.contact_no}
          onChange={handleChange}
          error={errors.contact_no}
          placeholder="Enter contact number"
        />

        <FormField
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
          placeholder="Enter city"
        />

        {/* CUSTOM STUNNING DROPDOWN FOR INDUSTRY */}
        <StunningSelect
          label="Industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          error={errors.industry}
          options={industryOptions}
          placeholder="Select industry"
        />
      </div>
    </div>
  );

  // Step 2: Client Location
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Client Location</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Location and address information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Client Location"
          name="client_location"
          value={formData.client_location}
          onChange={handleChange}
          error={errors.client_location}
          required
          placeholder="Enter client location"
        />

        <FormField
          label="Work Location"
          name="work_location"
          value={formData.work_location}
          onChange={handleChange}
          error={errors.work_location}
          required
          placeholder="Enter work location"
        />

        <div className="md:col-span-2">
          <FormField
            label="Office Address"
            name="office_address"
            type="textarea"
            value={formData.office_address}
            onChange={handleChange}
            error={errors.office_address}
            placeholder="Enter full office address"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <FormField
            label="Billing Address"
            name="billing_address"
            type="textarea"
            value={formData.billing_address}
            onChange={handleChange}
            error={errors.billing_address}
            placeholder="Enter billing address"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <FormField
            label="Shipping Address"
            name="shipping_address"
            type="textarea"
            value={formData.shipping_address}
            onChange={handleChange}
            error={errors.shipping_address}
            placeholder="Enter shipping address (if different)"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Payment Information
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3">
          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Billing and payment details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Payee Name"
          name="payee_name"
          value={formData.payee_name}
          onChange={handleChange}
          error={errors.payee_name}
          required
          placeholder="Enter payee name"
        />

        <div>
          <FormField
            label="Credit Card Number"
            name="credit_card_number"
            value={formData.credit_card_number}
            onChange={handleCreditCardChange}
            error={errors.credit_card_number}
            required
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>

        <FormField
          label="Expiry Date (MM/YY)"
          name="card_expiry"
          value={formData.card_expiry}
          onChange={handleExpiryChange}
          error={errors.card_expiry}
          required
          placeholder="MM/YY"
          maxLength={5}
        />

        <FormField
          label="CVV"
          name="card_cvv"
          type="password"
          value={formData.card_cvv}
          onChange={handleChange}
          error={errors.card_cvv}
          required
          placeholder="123"
          maxLength={4}
        />

        {/* CUSTOM STUNNING DROPDOWN FOR BILLING CYCLE */}
        <StunningSelect
          label="Billing Cycle"
          name="billing_cycle"
          value={formData.billing_cycle}
          onChange={handleChange}
          error={errors.billing_cycle}
          options={billingCycleOptions}
          placeholder="Select cycle"
        />
      </div>

      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Note: Payment information is stored securely and encrypted.
        </p>
      </div>
    </div>
  );

  // Progress indicator
  const renderProgress = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            1
          </div>
          <div className={`ml-2 text-sm font-medium ${currentStep >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Details
          </div>
        </div>

        <div className="flex-1 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            2
          </div>
          <div className={`ml-2 text-sm font-medium ${currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Location
          </div>
        </div>

        <div className="flex-1 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            3
          </div>
          <div className={`ml-2 text-sm font-medium ${currentStep >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Payment
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-h-[70vh] flex flex-col">
      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderProgress()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </form>
      </div>

      {/* Fixed navigation buttons at bottom */}
      <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                disabled={isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-1" />
                {isLoading ? 'Submitting...' : isEdit ? 'Update Client' : 'Create Client'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;