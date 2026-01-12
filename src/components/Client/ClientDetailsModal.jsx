import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { 
  User, Mail, Phone, MapPin, Building, Calendar, 
  FileText, History, Plus, Trash2, Upload,
  X, Check, AlertCircle, Eye, Edit2, Download,
  UserPlus, Shield, FileCheck, PlayCircle, CheckCircle,
  ChevronDown, FileSignature, Users, Globe
} from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useTheme } from '../Theme/ThemeProvider';
import { clientService } from '../../services/clientService';
import { fetchClientById } from '../../store/clientSlice';
import SuccessModal from '../common/Modal/SuccessModal';

// --- INTERNAL COMPONENT: CUSTOM SELECT ---
const CustomSelect = ({ label, value, onChange, options, placeholder, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => String(opt.value) === String(value))?.label;

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
        } focus:outline-none focus:ring-1 text-sm`}
      >
        <span className={!value ? 'text-gray-400' : ''}>
          {selectedLabel || placeholder || "Select..."}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-xl max-h-48 overflow-y-auto custom-scrollbar ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          {options.map((option) => (
            <div 
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`px-3 py-2 cursor-pointer text-xs flex items-center justify-between transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-200' 
                  : 'hover:bg-blue-50 text-gray-700'
              } ${String(value) === String(option.value) ? (isDarkMode ? 'bg-gray-700 font-medium' : 'bg-blue-50 font-medium') : ''}`}
            >
              {option.label}
              {String(value) === String(option.value) && <Check size={12} className="text-blue-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- STUNNING TABLE COMPONENT ---
const StunningTable = ({ headers, data, onEdit, onDelete, emptyMessage, isDarkMode }) => (
  <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
    <div className={`overflow-x-auto custom-scrollbar`}>
      <table className="w-full">
        <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <tr>
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-600 border-gray-200'
                } border-b`}
              >
                {header}
              </th>
            ))}
            <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-600 border-gray-200'
            } border-b`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {data.length > 0 ? data.map((item, idx) => (
            <tr 
              key={item.id || idx} 
              className={`transition-all duration-200 ${
                isDarkMode 
                  ? 'hover:bg-gray-800/50 text-gray-300' 
                  : 'hover:bg-blue-50/30 text-gray-700'
              }`}
            >
              {Object.values(item).map((value, valIdx) => (
                <td 
                  key={valIdx} 
                  className="px-6 py-4 text-sm whitespace-nowrap"
                >
                  {typeof value === 'boolean' ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      value 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {value ? 'Yes' : 'No'}
                    </span>
                  ) : (
                    value || <span className="italic text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
              ))}
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit && onEdit(item)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:bg-gray-700' 
                        : 'text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-gray-700' 
                        : 'text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {/* <Trash2 size={16} /> */}
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td 
                colSpan={headers.length + 1} 
                className="px-6 py-12 text-center"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className={`p-3 rounded-full mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <AlertCircle className={`h-6 w-6 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {emptyMessage}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// --- FORM MODAL COMPONENT ---
const FormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit, 
  submitText = "Save",
  isDarkMode 
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar py-4">
        {children}
      </div>
      <div className={`sticky bottom-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} pt-4 mt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              isDarkMode 
                ? 'text-gray-300 bg-gray-800 hover:bg-gray-700' 
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  </Modal>
);

const ClientDetailsModal = ({ isOpen, onClose, client, onEdit, onUpdate }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('details');
  
  // Modal states for each form
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showContractDocModal, setShowContractDocModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successType, setSuccessType] = useState('success');
  const [emailError, setEmailError] = useState('');
  
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (client) {
      resetFormData();
    }
  }, [client]);

  const refreshClientData = () => {
    if (client?.id) {
        dispatch(fetchClientById(client.id));
    }
    if (onUpdate) onUpdate();
  };

  const showNotification = (type, message) => {
    setSuccessType(type);
    setSuccessMessage(message);
    setShowSuccess(true);
  };

  const resetFormData = () => {
    setFormData({
      document: {
        document_name: '',
        signature_required: false,
        company_sign: false,
        individual_sign: false,
        sequence: 0
      },
      contact: {
        client_first_name: '',
        client_middle_name: '',
        client_last_name: '',
        client_email: '',
        client_phone_number: '',
        client_office_number: '',
        client_title: '',
        client_location: '',
        contact_type: '',
        work_location: '' 
      },
      location: {
        location_name: '',
        address_line_1: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA' // Default to USA
      },
      verification: {
        bg_verification_vendor: '',
        dt_vendor: '',
        rules: '',
        consent_given: false
      },
      contractDocument: {
        document_name: '',
      }
    });
    setFiles({});
    setEditingItem(null);
    setEmailError('');
  };

  const handleContactChange = (field, value) => {
    setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
    }));

    if (field === 'client_email') {
        const email = value.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setEmailError('Invalid email format');
            return;
        }

        if (email && client.contacts && client.contacts.length > 0) {
            const isDuplicate = client.contacts.some(c => {
                if (editingItem?.type === 'contact' && c.id === editingItem.id) return false;
                return c.client_email?.toLowerCase() === email;
            });

            if (isDuplicate) {
                setEmailError('Email already exists for this client');
            } else {
                setEmailError('');
            }
        } else {
            setEmailError('');
        }
    }
  };

  // Updated tabs with new additions
  const tabs = [
    { id: 'details', label: 'Basic Details', icon: User },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'contacts', label: 'Contacts', icon: UserPlus },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'documents', label: 'Onboarding Docs', icon: FileText },
    { id: 'contracts', label: 'Contract Docs', icon: FileSignature },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'history', label: 'History', icon: History },
  ];

  const contactTypeOptions = [
    { value: 'HR', label: 'Human Resources (HR)' },
    { value: 'Admin', label: 'Administrator' },
    { value: 'CEO', label: 'CEO / Executive' },
    { value: 'Billing', label: 'Billing / Finance' },
    { value: 'Primary', label: 'Primary Contact' },
    { value: 'Technical', label: 'Technical / IT' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Sales', label: 'Sales / Account Manager' },
    { value: 'Legal', label: 'Legal' },
  ];

  const countryOptions = [
    { value: 'USA', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
    { value: 'India', label: 'India' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' },
  ];

  // --- FORM HANDLERS ---
  const handleSubmitLocation = async (e) => {
    e?.preventDefault();
    try {
        const locationData = { client: client.id, ...formData.location };
        let response;
        if (editingItem?.type === 'location') {
            response = await clientService.updateWorkLocation(editingItem.id, locationData);
            showNotification('success', 'Location updated successfully!');
        } else {
            response = await clientService.createWorkLocation(locationData);
            showNotification('success', 'Location added successfully!');
        }
        if (response.data) { 
          refreshClientData(); 
          resetFormData(); 
          setShowLocationModal(false);
        }
    } catch (error) { showNotification('error', 'Failed to save location'); }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Delete this location?')) {
        try {
            await clientService.deleteWorkLocation(id);
            refreshClientData();
            showNotification('success', 'Location deleted');
        } catch (error) { showNotification('error', 'Failed to delete location'); }
    }
  };

  const handleSubmitContact = async (e) => {
    e?.preventDefault();
    if (emailError) return;

    try {
      const contactData = { client: client.id, ...formData.contact };
      if (!contactData.work_location) contactData.work_location = null;

      let response;
      if (editingItem?.type === 'contact') {
        response = await clientService.updateClientContact(editingItem.id, contactData);
        showNotification('success', 'Contact updated successfully!');
      } else {
        response = await clientService.createClientContact(contactData);
        showNotification('success', 'Contact created successfully!');
      }

      if (response.data) { 
        refreshClientData(); 
        resetFormData(); 
        setShowContactModal(false);
      }
    } catch (error) { showNotification('error', 'Failed to save contact'); }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Delete this contact?')) {
      try {
        await clientService.deleteClientContact(contactId);
        refreshClientData();
        showNotification('success', 'Contact deleted successfully!');
      } catch (error) { showNotification('error', 'Failed to delete contact'); }
    }
  };

  const handleSubmitDocument = async (e) => {
    e?.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('client', client.id);
      Object.keys(formData.document).forEach(key => formDataToSend.append(key, formData.document[key]));
      if (files.document) formDataToSend.append('document_file', files.document);

      let response;
      if (editingItem?.type === 'document') {
        response = await clientService.updateClientDocument(editingItem.id, formDataToSend);
        showNotification('success', 'Document updated successfully!');
      } else {
        response = await clientService.createClientDocument(formDataToSend);
        showNotification('success', 'Document created successfully!');
      }

      if (response.data) { 
        refreshClientData(); 
        resetFormData(); 
        setShowDocumentModal(false);
      }
    } catch (error) { showNotification('error', 'Failed to save document'); }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Delete this document?')) {
      try {
        await clientService.deleteClientDocument(documentId);
        refreshClientData();
        showNotification('success', 'Document deleted successfully!');
      } catch (error) { showNotification('error', 'Failed to delete document'); }
    }
  };

  const handleSubmitContractDocument = async (e) => {
    e?.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('client', client.id);
      formDataToSend.append('document_name', formData.contractDocument.document_name);
      if (files.contractDocument) formDataToSend.append('document_file', files.contractDocument);

      let response;
      if (editingItem?.type === 'contractDocument') {
        // Update contract document
        // response = await clientService.updateContractDocument(editingItem.id, formDataToSend);
        showNotification('success', 'Contract document updated successfully!');
      } else {
        // Create contract document
        // response = await clientService.createContractDocument(formDataToSend);
        showNotification('success', 'Contract document created successfully!');
      }

      if (response?.data) { 
        refreshClientData(); 
        resetFormData(); 
        setShowContractDocModal(false);
      }
    } catch (error) { showNotification('error', 'Failed to save contract document'); }
  };

  const handleDeleteContractDocument = async (documentId) => {
    if (window.confirm('Delete this contract document?')) {
      try {
        // await clientService.deleteContractDocument(documentId);
        refreshClientData();
        showNotification('success', 'Contract document deleted successfully!');
      } catch (error) { showNotification('error', 'Failed to delete contract document'); }
    }
  };

  const handleSubmitVerification = async (e) => {
    e?.preventDefault();
    try {
      const vData = { client: client.id, ...formData.verification };
      let res;
      if(editingItem?.type === 'verification') res = await clientService.updateClientVerification(editingItem.id, vData);
      else res = await clientService.createClientVerification(vData);
      if(res.data) { 
        refreshClientData(); 
        resetFormData(); 
        setShowVerificationModal(false);
        showNotification('success', 'Verification saved!'); 
      }
    } catch(e) { showNotification('error', 'Failed to save'); }
  };

  // --- RENDER FUNCTIONS WITH TABLES ---
  const renderDetails = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <User className="w-5 h-5 mr-2 text-blue-500"/> Client Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <User size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Client Name</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{client.client_name || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <Mail size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{client.email || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <Phone size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Contact Number</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{client.contact_no || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <Building size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Industry</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{client.industry || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocations = () => {
    const locationData = client.work_locations?.map(loc => ({
      // id: loc.id,
      'Location Name': loc.location_name,
      Address: loc.address_line_1,
      City: loc.city,
      State: loc.state,
      'Zip Code': loc.zip_code,
      Country: loc.country
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <MapPin className="w-5 h-5 mr-2 text-orange-500"/> Work Locations
            </h3>
            <button
              onClick={() => {
                setEditingItem(null);
                resetFormData();
                setShowLocationModal(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Location
            </button>
          </div>
          
          <StunningTable
            headers={['Location Name', 'Address', 'City', 'State', 'Zip Code', 'Country']}
            data={locationData}
            onEdit={(item) => {
              setEditingItem({ type: 'location', id: item.id });
              setFormData(prev => ({ ...prev, location: client.work_locations.find(l => l.id === item.id) }));
              setShowLocationModal(true);
            }}
            onDelete={handleDeleteLocation}
            emptyMessage="No locations added yet"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    );
  };

  const renderContacts = () => {
    const contactData = client.contacts?.map(contact => ({
      // id: contact.id,
      'First Name': contact.client_first_name,
      'Last Name': contact.client_last_name,
      Email: contact.client_email,
      Phone: contact.client_phone_number,
      Title: contact.client_title,
      Type: contact.contact_type,
      'Work Location': client.work_locations?.find(l => l.id === contact.work_location)?.location_name || 'N/A'
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <UserPlus className="w-5 h-5 mr-2 text-green-500"/> Contact Persons
            </h3>
            <button
              onClick={() => {
                setEditingItem(null);
                resetFormData();
                setShowContactModal(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </button>
          </div>
          
          <StunningTable
            headers={['First Name', 'Last Name', 'Email', 'Phone', 'Title', 'Type', 'Work Location']}
            data={contactData}
            onEdit={(item) => {
              setEditingItem({ type: 'contact', id: item.id });
              setFormData(prev => ({ ...prev, contact: client.contacts.find(c => c.id === item.id) }));
              setShowContactModal(true);
            }}
            onDelete={handleDeleteContact}
            emptyMessage="No contacts added yet"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    );
  };

  const renderEmployees = () => {
    const employeeData = client.employees?.map(employee => ({
      // id: employee.id,
      'First Name': employee.first_name,
      'Last Name': employee.last_name,
      Email: employee.email,
      'Join Date': new Date(employee.joined_at).toLocaleDateString(),
      Status: employee.status || 'Active'
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Users className="w-5 h-5 mr-2 text-purple-500"/> Employees
            </h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {employeeData.length} employees
            </span>
          </div>
          
          <StunningTable
            headers={['First Name', 'Last Name', 'Email', 'Join Date', 'Status']}
            data={employeeData}
            emptyMessage="No employees found for this client"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    const documentData = client.documents?.map(doc => ({
      // id: doc.id,
      'Document Name': doc.document_name,
      'Signature Required': doc.signature_required,
      'Company Sign': doc.company_sign,
      'Individual Sign': doc.individual_sign,
      Sequence: doc.sequence
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 mr-2 text-blue-500"/> Onboarding Documents
            </h3>
            <button
              onClick={() => {
                setEditingItem(null);
                resetFormData();
                setShowDocumentModal(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Document
            </button>
          </div>
          
          <StunningTable
            headers={['Document Name', 'Signature Required', 'Company Sign', 'Individual Sign', 'Sequence']}
            data={documentData}
            onEdit={(item) => {
              setEditingItem({ type: 'document', id: item.id });
              setFormData(prev => ({ ...prev, document: client.documents.find(d => d.id === item.id) }));
              setShowDocumentModal(true);
            }}
            onDelete={handleDeleteDocument}
            emptyMessage="No documents added yet"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    );
  };

  const renderContractDocuments = () => {
    const contractDocData = client.contract_documents?.map(doc => ({
      // id: doc.id,
      'Document Name': doc.document_name,
      'Uploaded At': new Date(doc.uploaded_at).toLocaleDateString(),
      'File': doc.document_file ? 'Available' : 'Not uploaded'
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FileSignature className="w-5 h-5 mr-2 text-amber-500"/> Contract Documents
            </h3>
            <button
              onClick={() => {
                setEditingItem(null);
                resetFormData();
                setShowContractDocModal(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Contract
            </button>
          </div>
          
          <StunningTable
            headers={['Document Name', 'Uploaded At', 'File']}
            data={contractDocData}
            onEdit={(item) => {
              setEditingItem({ type: 'contractDocument', id: item.id });
              setFormData(prev => ({ ...prev, contractDocument: client.contract_documents.find(d => d.id === item.id) }));
              setShowContractDocModal(true);
            }}
            onDelete={handleDeleteContractDocument}
            emptyMessage="No contract documents added yet"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    );
  };

  const renderVerification = () => {
    const verificationData = client.verifications?.map(ver => ({
      // id: ver.id,
      'BG Vendor': ver.bg_verification_vendor,
      'DT Vendor': ver.dt_vendor,
      'Consent Given': ver.consent_given,
      'Rules': ver.rules ? 'Yes' : 'No'
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Shield className="w-5 h-5 mr-2 text-rose-500"/> Verification Details
            </h3>
            <button
              onClick={() => {
                setEditingItem(null);
                resetFormData();
                setShowVerificationModal(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Verification
            </button>
          </div>
          
          <StunningTable
            headers={['BG Vendor', 'DT Vendor', 'Consent Given', 'Rules']}
            data={verificationData}
            onEdit={(item) => {
              setEditingItem({ type: 'verification', id: item.id });
              setFormData(prev => ({ ...prev, verification: client.verifications.find(v => v.id === item.id) }));
              setShowVerificationModal(true);
            }}
            emptyMessage="No verification records found"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const historyData = client.client_history?.map((hist, idx) => ({
      // id: idx,
      Action: hist.purpose || hist.action,
      Timestamp: hist.timestamp || hist.created_at,
      Changes: hist.changes?.length || 0,
      'Updated By': hist.updated_by_model || 'System'
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <h3 className={`font-semibold text-lg mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <History className="w-5 h-5 mr-2 text-gray-500"/> Activity Log
          </h3>
          
          <StunningTable
            headers={['Action', 'Timestamp', 'Changes', 'Updated By']}
            data={historyData}
            emptyMessage="No history available"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    );
  };

  // --- FORM MODALS ---
  const renderLocationModal = () => (
    <FormModal
      isOpen={showLocationModal}
      onClose={() => {
        setShowLocationModal(false);
        resetFormData();
      }}
      title={editingItem?.type === 'location' ? 'Edit Location' : 'Add New Location'}
      onSubmit={handleSubmitLocation}
      submitText={editingItem?.type === 'location' ? 'Update Location' : 'Save Location'}
      isDarkMode={isDarkMode}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location Name *</label>
          <input 
            type="text" 
            placeholder="e.g. Headquarters" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.location?.location_name || ''} 
            onChange={e => setFormData(p => ({...p, location: {...p.location, location_name: e.target.value}}))} 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
          <input 
            type="text" 
            placeholder="Street Address" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.location?.address_line_1 || ''} 
            onChange={e => setFormData(p => ({...p, location: {...p.location, address_line_1: e.target.value}}))} 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>City</label>
          <input 
            type="text" 
            placeholder="City" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.location?.city || ''} 
            onChange={e => setFormData(p => ({...p, location: {...p.location, city: e.target.value}}))} 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>State</label>
          <input 
            type="text" 
            placeholder="State" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.location?.state || ''} 
            onChange={e => setFormData(p => ({...p, location: {...p.location, state: e.target.value}}))} 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Zip Code</label>
          <input 
            type="text" 
            placeholder="Zip Code" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.location?.zip_code || ''} 
            onChange={e => setFormData(p => ({...p, location: {...p.location, zip_code: e.target.value}}))} 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Country</label>
          <CustomSelect
            label=""
            value={formData.location?.country || 'USA'}
            onChange={(val) => setFormData(p => ({...p, location: {...p.location, country: val}}))}
            options={countryOptions}
            placeholder="Select country"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </FormModal>
  );

  const renderContactModal = () => (
    <FormModal
      isOpen={showContactModal}
      onClose={() => {
        setShowContactModal(false);
        resetFormData();
      }}
      title={editingItem?.type === 'contact' ? 'Edit Contact' : 'Add New Contact'}
      onSubmit={handleSubmitContact}
      submitText={editingItem?.type === 'contact' ? 'Update Contact' : 'Save Contact'}
      isDarkMode={isDarkMode}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{ l: 'First Name *', k: 'client_first_name' }, { l: 'Middle Name', k: 'client_middle_name' }, { l: 'Last Name *', k: 'client_last_name' }, { l: 'Email *', k: 'client_email', t: 'email' }, { l: 'Phone *', k: 'client_phone_number' }, { l: 'Office Number', k: 'client_office_number' }, { l: 'Title', k: 'client_title' }].map(f => (
          <div key={f.k} className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{f.l}</label>
            <input 
              type={f.t || 'text'} 
              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${f.k === 'client_email' && emailError ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
              value={formData.contact?.[f.k] || ''} 
              onChange={e => handleContactChange(f.k, e.target.value)}
              required={f.l.includes('*')} 
              placeholder={f.l.replace('*','')} 
            />
            {f.k === 'client_email' && emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
        ))}

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contact Type</label>
          <CustomSelect
            label=""
            value={formData.contact?.contact_type}
            onChange={(val) => setFormData(p => ({...p, contact: {...p.contact, contact_type: val}}))}
            options={contactTypeOptions}
            placeholder="Select type"
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Work Location</label>
          <CustomSelect
            label=""
            value={formData.contact?.work_location}
            onChange={(val) => setFormData(p => ({...p, contact: {...p.contact, work_location: val}}))}
            options={client.work_locations?.map(loc => ({ value: loc.id, label: `${loc.location_name} - ${loc.city}` })) || []}
            placeholder="Select location"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </FormModal>
  );

  const renderDocumentModal = () => (
    <FormModal
      isOpen={showDocumentModal}
      onClose={() => {
        setShowDocumentModal(false);
        resetFormData();
      }}
      title={editingItem?.type === 'document' ? 'Edit Document' : 'Add New Document'}
      onSubmit={handleSubmitDocument}
      submitText={editingItem?.type === 'document' ? 'Update Document' : 'Save Document'}
      isDarkMode={isDarkMode}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Document Name *</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.document?.document_name || ''} 
            onChange={(e) => setFormData(prev => ({ ...prev, document: { ...prev.document, document_name: e.target.value } }))} 
            required 
            placeholder="Enter document name" 
          />
        </div>
        
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sequence *</label>
          <input 
            type="number" 
            min="0" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.document?.sequence || 0} 
            onChange={(e) => setFormData(prev => ({ ...prev, document: { ...prev.document, sequence: parseInt(e.target.value) || 0 } }))} 
            required 
          />
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Signature Options</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{l: 'Signature Required', k: 'signature_required'}, {l: 'Company Sign', k: 'company_sign'}, {l: 'Individual Sign', k: 'individual_sign'}].map(opt => (
              <label 
                key={opt.k} 
                className={`flex items-center p-3 rounded-lg cursor-pointer border transition-colors ${
                  formData.document?.[opt.k] 
                    ? (isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200') 
                    : (isDarkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={formData.document?.[opt.k] || false} 
                  onChange={(e) => setFormData(p => ({...p, document: {...p.document, [opt.k]: e.target.checked}}))} 
                  className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500" 
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{opt.l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Upload Document</label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-800/30 hover:border-blue-500' : 'border-gray-300 bg-gray-50 hover:border-blue-400'}`}>
            <input type="file" onChange={(e) => setFiles(prev => ({ ...prev, document: e.target.files[0] }))} className="hidden" id="document-upload" />
            <label htmlFor="document-upload" className="cursor-pointer">
              <div className={`p-4 rounded-full inline-flex ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Upload className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {files.document ? 
                  <span className="font-medium text-blue-500">{files.document.name}</span> : 
                  <><span className="font-medium">Click to upload</span> or drag and drop</>
                }
              </p>
            </label>
          </div>
        </div>
      </div>
    </FormModal>
  );

  const renderContractDocumentModal = () => (
    <FormModal
      isOpen={showContractDocModal}
      onClose={() => {
        setShowContractDocModal(false);
        resetFormData();
      }}
      title={editingItem?.type === 'contractDocument' ? 'Edit Contract Document' : 'Add New Contract Document'}
      onSubmit={handleSubmitContractDocument}
      submitText={editingItem?.type === 'contractDocument' ? 'Update Contract' : 'Save Contract'}
      isDarkMode={isDarkMode}
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Document Name *</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.contractDocument?.document_name || ''} 
            onChange={(e) => setFormData(prev => ({ ...prev, contractDocument: { ...prev.contractDocument, document_name: e.target.value } }))} 
            required 
            placeholder="Enter contract document name" 
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Upload Contract Document</label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-800/30 hover:border-amber-500' : 'border-gray-300 bg-gray-50 hover:border-amber-400'}`}>
            <input type="file" onChange={(e) => setFiles(prev => ({ ...prev, contractDocument: e.target.files[0] }))} className="hidden" id="contract-document-upload" />
            <label htmlFor="contract-document-upload" className="cursor-pointer">
              <div className={`p-4 rounded-full inline-flex ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <FileSignature className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {files.contractDocument ? 
                  <span className="font-medium text-amber-500">{files.contractDocument.name}</span> : 
                  <><span className="font-medium">Click to upload</span> or drag and drop</>
                }
              </p>
            </label>
          </div>
        </div>
      </div>
    </FormModal>
  );

  const renderVerificationModal = () => (
    <FormModal
      isOpen={showVerificationModal}
      onClose={() => {
        setShowVerificationModal(false);
        resetFormData();
      }}
      title={editingItem?.type === 'verification' ? 'Edit Verification' : 'Add New Verification'}
      onSubmit={handleSubmitVerification}
      submitText={editingItem?.type === 'verification' ? 'Update Verification' : 'Save Verification'}
      isDarkMode={isDarkMode}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>BG Verification Vendor</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.verification?.bg_verification_vendor || ''} 
            onChange={(e) => setFormData(prev => ({...prev, verification: { ...prev.verification, bg_verification_vendor: e.target.value }}))} 
            placeholder="Vendor Name" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>DT Vendor</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.verification?.dt_vendor || ''} 
            onChange={(e) => setFormData(prev => ({...prev, verification: { ...prev.verification, dt_vendor: e.target.value }}))} 
            placeholder="Vendor Name" 
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rules</label>
          <textarea 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.verification?.rules || ''} 
            onChange={(e) => setFormData(prev => ({...prev, verification: { ...prev.verification, rules: e.target.value }}))} 
            rows="3" 
            placeholder="Rules & Regulations" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center cursor-pointer p-3 rounded-lg border border-gray-300 dark:border-gray-600">
            <input 
              type="checkbox" 
              checked={formData.verification?.consent_given || false} 
              onChange={(e) => setFormData(p => ({...p, verification: {...p.verification, consent_given: e.target.checked}}))} 
              className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500" 
            />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Consent Given</span>
          </label>
        </div>
      </div>
    </FormModal>
  );

  // --- MAIN CONTENT SWITCH ---
  const renderContent = () => {
    switch (activeTab) {
      case 'locations': return renderLocations();
      case 'contacts': return renderContacts();
      case 'employees': return renderEmployees();
      case 'documents': return renderDocuments();
      case 'contracts': return renderContractDocuments();
      case 'verification': return renderVerification();
      case 'history': return renderHistory();
      default: return renderDetails();
    }
  };

  if (!client) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Client: ${client.client_name}`} size="xl">
        <div className="flex flex-col h-full">
          <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 px-1`}>
            <nav className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => { setActiveTab(tab.id); setEditingItem(null); resetFormData(); }}
                    className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center whitespace-nowrap transition-all duration-200 ${
                      isActive 
                        ? (isDarkMode 
                            ? 'border-blue-500 text-blue-400 bg-gradient-to-r from-gray-800 to-gray-900' 
                            : 'border-blue-600 text-blue-600 bg-gradient-to-r from-blue-50 to-white') 
                        : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" /> {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-1 max-h-[60vh] custom-scrollbar">
            {renderContent()}
          </div>
          <div className={`sticky bottom-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: #{client.id}</span>
              <div className="flex space-x-3">
                {onEdit && activeTab === 'details' && (
                  <button 
                    onClick={() => { onEdit(); onClose(); }} 
                    className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Edit Client
                  </button>
                )}
                <button 
                  onClick={() => { onClose(); resetFormData(); }} 
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg ${
                    isDarkMode 
                      ? 'text-gray-300 bg-gray-800 hover:bg-gray-700' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Form Modals */}
      {renderLocationModal()}
      {renderContactModal()}
      {renderDocumentModal()}
      {renderContractDocumentModal()}
      {renderVerificationModal()}

      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        type={successType} 
        title={successType === 'success' ? 'Success' : 'Error'} 
        message={successMessage} 
        autoClose={4000} 
      />
    </>
  );
};

export default ClientDetailsModal;