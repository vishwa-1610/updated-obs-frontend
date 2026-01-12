import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { 
  User, Mail, Phone, MapPin, Building, Calendar, 
  FileText, History, Plus, Trash2, Upload,
  X, Check, AlertCircle, Eye, Edit2, 
  UserPlus, Shield, Briefcase, DollarSign, ChevronDown
} from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useTheme } from '../Theme/ThemeProvider';
import { subcontractorService } from '../../services/subcontractorService';
import { fetchSubcontractors } from '../../store/subcontractorSlice';
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
                    <Trash2 size={16} />
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

const SubcontractorDetailsModal = ({ isOpen, onClose, subcontractor, onUpdate }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('details');
  
  // Modal states for each form
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successType, setSuccessType] = useState('success');
  const [emailError, setEmailError] = useState('');
  
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (subcontractor) {
      resetFormData();
    }
  }, [subcontractor]);

  const refreshData = () => {
    if (onUpdate) onUpdate(); 
    dispatch(fetchSubcontractors({ page: 1 })); 
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
        company_signature: false,
        individual_signature: false,
        sequence: 0
      },
      contact: {
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        office_number: '',
        title: '',
        location: '',
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
      placement: {
        candidate_first_name: '',
        candidate_last_name: '',
        candidate_email: '',
        candidate_phone: '',
        job_title: '',
        client_name: '',
        start_date: '',
        end_date: '',
        status: 'Active',
        pay_rate: '',
        bill_rate: ''
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

    if (field === 'email') {
        const email = value.toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setEmailError('Invalid email format');
            return;
        }

        if (email && subcontractor.contacts && subcontractor.contacts.length > 0) {
            const isDuplicate = subcontractor.contacts.some(c => {
                if (editingItem?.type === 'contact' && c.id === editingItem.id) return false;
                return c.email?.toLowerCase() === email;
            });

            if (isDuplicate) {
                setEmailError('Email already exists for this subcontractor');
            } else {
                setEmailError('');
            }
        } else {
            setEmailError('');
        }
    }
  };

  const tabs = [
    { id: 'details', label: 'Basic Details', icon: User },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'contacts', label: 'Contacts', icon: UserPlus },
    { id: 'placements', label: 'Placements', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'history', label: 'History', icon: History },
  ];

  const countryOptions = [
    { value: 'USA', label: 'United States' },
    // { value: 'Canada', label: 'Canada' },
    // { value: 'UK', label: 'United Kingdom' },
    // { value: 'Australia', label: 'Australia' },
    // { value: 'India', label: 'India' },
    // { value: 'Germany', label: 'Germany' },
    // { value: 'France', label: 'France' },
    // { value: 'Japan', label: 'Japan' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Ended', label: 'Ended' },
    { value: 'Terminated', label: 'Terminated' },
    { value: 'Pending', label: 'Pending' }
  ];

  // --- FORM HANDLERS ---
  const handleSubmitLocation = async (e) => {
    e?.preventDefault();
    try {
      const locationData = { subcontractor: subcontractor.id, ...formData.location };
      let response;
      if (editingItem?.type === 'location') {
        response = await subcontractorService.updateWorkLocation(editingItem.id, locationData);
        showNotification('success', 'Location updated successfully!');
      } else {
        response = await subcontractorService.createWorkLocation(locationData);
        showNotification('success', 'Location added successfully!');
      }
      if (response.data) { 
        refreshData(); 
        resetFormData(); 
        setShowLocationModal(false);
      }
    } catch (error) { showNotification('error', 'Failed to save location'); }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Delete this location?')) {
      try {
        await subcontractorService.deleteWorkLocation(id);
        refreshData();
        showNotification('success', 'Location deleted');
      } catch (error) { showNotification('error', 'Failed to delete location'); }
    }
  };

  const handleSubmitContact = async (e) => {
    e?.preventDefault();
    if (emailError) return;

    try {
      const contactData = { subcontractor: subcontractor.id, ...formData.contact };
      if (!contactData.work_location) contactData.work_location = null;

      let response;
      if (editingItem?.type === 'contact') {
        response = await subcontractorService.updateSubcontractorContact(editingItem.id, contactData);
        showNotification('success', 'Contact updated successfully!');
      } else {
        response = await subcontractorService.createSubcontractorContact(contactData);
        showNotification('success', 'Contact created successfully!');
      }

      if (response.data) { 
        refreshData(); 
        resetFormData(); 
        setShowContactModal(false);
      }
    } catch (error) { showNotification('error', 'Failed to save contact'); }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Delete this contact?')) {
      try {
        await subcontractorService.deleteSubcontractorContact(contactId);
        refreshData();
        showNotification('success', 'Contact deleted successfully!');
      } catch (error) { showNotification('error', 'Failed to delete contact'); }
    }
  };

  const handleSubmitDocument = async (e) => {
    e?.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subcontractor', subcontractor.id);
      Object.keys(formData.document).forEach(key => formDataToSend.append(key, formData.document[key]));
      if (files.document) formDataToSend.append('document_file', files.document);

      let response;
      if (editingItem?.type === 'document') {
        response = await subcontractorService.updateSubcontractorDocument(editingItem.id, formDataToSend);
        showNotification('success', 'Document updated successfully!');
      } else {
        response = await subcontractorService.createSubcontractorDocument(formDataToSend);
        showNotification('success', 'Document created successfully!');
      }

      if (response.data) { 
        refreshData(); 
        resetFormData(); 
        setShowDocumentModal(false);
      }
    } catch (error) { showNotification('error', 'Failed to save document'); }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Delete this document?')) {
      try {
        await subcontractorService.deleteSubcontractorDocument(documentId);
        refreshData();
        showNotification('success', 'Document deleted successfully!');
      } catch (error) { showNotification('error', 'Failed to delete document'); }
    }
  };

  const handleSubmitPlacement = async (e) => {
    e?.preventDefault();
    try {
      const placementData = { subcontractor: subcontractor.id, ...formData.placement };
      let response;
      if (editingItem?.type === 'placement') {
        response = await subcontractorService.updatePlacement(editingItem.id, placementData);
        showNotification('success', 'Placement updated successfully!');
      } else {
        response = await subcontractorService.createPlacement(placementData);
        showNotification('success', 'Placement created successfully!');
      }

      if (response.data) { 
        refreshData(); 
        resetFormData(); 
        setShowPlacementModal(false);
      }
    } catch (error) { showNotification('error', 'Failed to save placement'); }
  };

  const handleDeletePlacement = async (placementId) => {
    if (window.confirm('Delete this placement?')) {
      try {
        await subcontractorService.deletePlacement(placementId);
        refreshData();
        showNotification('success', 'Placement deleted successfully!');
      } catch (error) { showNotification('error', 'Failed to delete placement'); }
    }
  };

  // --- RENDER FUNCTIONS WITH TABLES ---
  const renderDetails = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <User className="w-5 h-5 mr-2 text-blue-500"/> Subcontractor Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <User size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Subcontractor Name</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{subcontractor.subcontractor_name || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <FileText size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Contract Name</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{subcontractor.contract_name || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <Mail size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{subcontractor.email || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <Phone size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Phone No</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{subcontractor.phone_no || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
              <MapPin size={18} />
          </div>
          <div className="overflow-hidden flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>City</p>
              <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{subcontractor.city || <span className="opacity-50 italic">N/A</span>}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocations = () => {
    const locationData = subcontractor.work_locations?.map(loc => ({
      id: loc.id,
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
              setFormData(prev => ({ ...prev, location: subcontractor.work_locations.find(l => l.id === item.id) }));
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
    const contactData = subcontractor.contacts?.map(contact => ({
      id: contact.id,
      'First Name': contact.first_name,
      'Last Name': contact.last_name,
      Email: contact.email,
      Phone: contact.phone_number,
      Title: contact.title,
      'Work Location': subcontractor.work_locations?.find(l => l.id === contact.work_location)?.location_name || 'N/A'
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
            headers={['First Name', 'Last Name', 'Email', 'Phone', 'Title', 'Work Location']}
            data={contactData}
            onEdit={(item) => {
              setEditingItem({ type: 'contact', id: item.id });
              setFormData(prev => ({ ...prev, contact: subcontractor.contacts.find(c => c.id === item.id) }));
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

  const renderPlacements = () => {
    const placementData = subcontractor.placements?.map(placement => ({
      id: placement.id,
      'Candidate Name': `${placement.candidate_first_name} ${placement.candidate_last_name}`,
      'Job Title': placement.job_title,
      'Client': placement.client_name,
      'Start Date': placement.start_date,
      'End Date': placement.end_date || '-',
      'Status': placement.status,
      'Pay Rate': placement.pay_rate ? `$${placement.pay_rate}` : '-',
      'Bill Rate': placement.bill_rate ? `$${placement.bill_rate}` : '-'
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Briefcase className="w-5 h-5 mr-2 text-purple-500"/> Placements
            </h3>
            <button
              onClick={() => {
                setEditingItem(null);
                resetFormData();
                setShowPlacementModal(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg hover:from-purple-600 hover:to-violet-700 shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Placement
            </button>
          </div>
          
          <StunningTable
            headers={['Candidate Name', 'Job Title', 'Client', 'Start Date', 'End Date', 'Status', 'Pay Rate', 'Bill Rate']}
            data={placementData}
            onEdit={(item) => {
              setEditingItem({ type: 'placement', id: item.id });
              setFormData(prev => ({ ...prev, placement: subcontractor.placements.find(p => p.id === item.id) }));
              setShowPlacementModal(true);
            }}
            onDelete={handleDeletePlacement}
            emptyMessage="No placements added yet"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    const documentData = subcontractor.documents?.map(doc => ({
      id: doc.id,
      'Document Name': doc.document_name,
      'Signature Required': doc.signature_required,
      'Company Signature': doc.company_signature,
      'Individual Signature': doc.individual_signature,
      Sequence: doc.sequence
    })) || [];

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 mr-2 text-blue-500"/> Documents
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
            headers={['Document Name', 'Signature Required', 'Company Signature', 'Individual Signature', 'Sequence']}
            data={documentData}
            onEdit={(item) => {
              setEditingItem({ type: 'document', id: item.id });
              setFormData(prev => ({ ...prev, document: subcontractor.documents.find(d => d.id === item.id) }));
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

  const renderHistory = () => {
    const historyData = subcontractor.subcontractor_history?.map((hist, idx) => ({
      id: idx,
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
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>First Name *</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.contact?.first_name || ''} 
            onChange={e => handleContactChange('first_name', e.target.value)}
            required 
            placeholder="First Name" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.contact?.last_name || ''} 
            onChange={e => handleContactChange('last_name', e.target.value)}
            placeholder="Last Name" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
          <input 
            type="email" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 ${emailError ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
            value={formData.contact?.email || ''} 
            onChange={e => handleContactChange('email', e.target.value)}
            required 
            placeholder="Email" 
          />
          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.contact?.phone_number || ''} 
            onChange={e => handleContactChange('phone_number', e.target.value)}
            placeholder="Phone" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.contact?.title || ''} 
            onChange={e => handleContactChange('title', e.target.value)}
            placeholder="Title" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Work Location</label>
          <select 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.contact?.work_location || ''} 
            onChange={e => handleContactChange('work_location', e.target.value)}
          >
            <option value="">Select Location</option>
            {subcontractor.work_locations?.map(l => (
              <option key={l.id} value={l.id}>{l.location_name} - {l.city}</option>
            ))}
          </select>
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
            {[{l: 'Signature Required', k: 'signature_required'}, {l: 'Company Signature', k: 'company_signature'}, {l: 'Individual Signature', k: 'individual_signature'}].map(opt => (
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

  const renderPlacementModal = () => (
    <FormModal
      isOpen={showPlacementModal}
      onClose={() => {
        setShowPlacementModal(false);
        resetFormData();
      }}
      title={editingItem?.type === 'placement' ? 'Edit Placement' : 'Add New Placement'}
      onSubmit={handleSubmitPlacement}
      submitText={editingItem?.type === 'placement' ? 'Update Placement' : 'Save Placement'}
      isDarkMode={isDarkMode}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Candidate First Name *</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.candidate_first_name || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, candidate_first_name: e.target.value}}))} 
            required 
            placeholder="First Name" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Candidate Last Name *</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.candidate_last_name || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, candidate_last_name: e.target.value}}))} 
            required 
            placeholder="Last Name" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Candidate Email</label>
          <input 
            type="email" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.candidate_email || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, candidate_email: e.target.value}}))} 
            placeholder="Email" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Candidate Phone</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.candidate_phone || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, candidate_phone: e.target.value}}))} 
            placeholder="Phone" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Title</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.job_title || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, job_title: e.target.value}}))} 
            placeholder="Job Title" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.client_name || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, client_name: e.target.value}}))} 
            placeholder="Client Name" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
          <input 
            type="date" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.start_date || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, start_date: e.target.value}}))} 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
          <input 
            type="date" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.end_date || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, end_date: e.target.value}}))} 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
          <CustomSelect
            label=""
            value={formData.placement?.status || 'Active'}
            onChange={(val) => setFormData(p => ({...p, placement: {...p.placement, status: val}}))}
            options={statusOptions}
            placeholder="Select status"
            isDarkMode={isDarkMode}
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pay Rate</label>
          <input 
            type="number" 
            step="0.01" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.pay_rate || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, pay_rate: e.target.value}}))} 
            placeholder="Pay Rate" 
          />
        </div>
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bill Rate</label>
          <input 
            type="number" 
            step="0.01" 
            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
            value={formData.placement?.bill_rate || ''} 
            onChange={e => setFormData(p => ({...p, placement: {...p.placement, bill_rate: e.target.value}}))} 
            placeholder="Bill Rate" 
          />
        </div>
      </div>
    </FormModal>
  );

  // --- MAIN CONTENT SWITCH ---
  const renderContent = () => {
    switch (activeTab) {
      case 'locations': return renderLocations();
      case 'contacts': return renderContacts();
      case 'placements': return renderPlacements();
      case 'documents': return renderDocuments();
      case 'history': return renderHistory();
      default: return renderDetails();
    }
  };

  if (!subcontractor) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Subcontractor: ${subcontractor.subcontractor_name}`} size="xl">
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
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: #{subcontractor.id}</span>
              <div className="flex space-x-3">
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
      {renderPlacementModal()}

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

export default SubcontractorDetailsModal;