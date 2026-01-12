import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, X, Filter } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import OnboardingTable from '../Onboarding/OnboardingTable';
import OnboardingForm from '../Onboarding/OnboardingForm';
import OnboardingDetailsModal from '../Onboarding/OnboardingDetailsModal';
import Modal from '../common/Modal/Modal';
import SuccessModal from '../common/Modal/SuccessModal';
import { 
  fetchOnboardings, 
  createOnboarding, 
  updateOnboarding, 
  clearSuccess,
  setCurrentOnboarding,
  clearCurrentOnboarding,
  setPage 
} from '../../store/onboardingSlice';

const Onboarding = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  const { onboardings = [], currentOnboarding, loading, success, pagination } = useSelector((state) => state.onboarding || {});

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('all'); 
  const [ordering, setOrdering] = useState('-created_at'); // Default: Newest first
  
  // Filter State
  const [filters, setFilters] = useState({
    first_name: '',
    client_name: '',
    email: '',
    phone_no: '',
    state: ''
  });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- CRITICAL FIX 1: SEARCH LOGIC ---
// --- CRITICAL FIX 1: SEARCH LOGIC + MAIN DOMAIN SAFETY ---
  useEffect(() => {
    
    // 1. SAFETY CHECK: STOP if on Main Domain (Landing Page)
    const hostname = window.location.hostname;
    // Add 'localhost' only if testing landing page locally
    const mainDomains = ['obs.tiswatech.com', 'www.obs.tiswatech.com', 'tiswatech.com'];

    if (mainDomains.includes(hostname)) {
        console.log("Main Domain Detected: Skipping Onboarding Fetch.");
        return; // <--- STOP HERE. Do not call the API.
    }

    // 2. Base params (Page & Sort)
    const params = { 
      page: pagination?.currentPage || 1, 
      ordering: ordering,
    };

    // 3. Map Frontend Inputs -> Backend Partial Search
    if (filters.first_name) params['first_name__icontains'] = filters.first_name;
    if (filters.client_name) params['client_name__icontains'] = filters.client_name;
    if (filters.email) params['email__icontains'] = filters.email;
    if (filters.phone_no) params['phone_no__icontains'] = filters.phone_no;
    if (filters.state) params['state__icontains'] = filters.state;
    
    // 4. Dispatch API Call
    dispatch(fetchOnboardings({ tab: activeTab, params }));

  }, [dispatch, pagination?.currentPage, activeTab, filters, ordering]);

  // --- HANDLERS ---
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setPage(1)); 
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    dispatch(setPage(1));
  };

  const clearFilters = () => {
    setFilters({ first_name: '', client_name: '', email: '', phone_no: '', state: '' });
    dispatch(setPage(1));
  };

  const handleSort = (field) => {
    if (ordering === field) {
      setOrdering(`-${field}`);
    } else {
      setOrdering(field);
    }
    dispatch(setPage(1));
  };

  // --- CRITICAL FIX 2: PAGINATION LOGIC ---
  const handlePageChange = (newPage) => {
    // 1. Calculate dynamic total pages based on current pageSize (whether 1 or 10)
    const totalPages = Math.ceil(pagination.count / pagination.pageSize);

    // 2. Allow navigation if page is valid
    if (newPage >= 1 && newPage <= totalPages) {
        dispatch(setPage(newPage));
    }
  };

  const handleCreateSubmit = (formData) => {
    dispatch(createOnboarding(formData)).unwrap().then(() => setShowCreateModal(false));
  };

  const handleUpdateSubmit = (formData) => {
    if (currentOnboarding) {
      dispatch(updateOnboarding({ id: currentOnboarding.id, data: formData }))
        .unwrap()
        .then(() => { setShowEditModal(false); dispatch(clearCurrentOnboarding()); });
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Onboarding</h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage candidate onboardings</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
            <Plus className="h-5 w-5 mr-2" /> Initiate Onboarding
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-xl mb-6 w-fit">
            {['all', 'pending', 'inprogress', 'confirmed', 'rejected'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        activeTab === tab 
                        ? 'bg-white text-blue-600 shadow-sm font-bold' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {tab === 'inprogress' ? 'In Progress' : tab}
                </button>
            ))}
        </div>

        {/* Filter Inputs */}
        <div className={`mb-6 p-5 rounded-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Filter className="w-4 h-4" /> Filters
            </h3>
            {(Object.values(filters).some(x => x)) && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
                    <X className="w-3 h-3" /> Clear All
                </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
                { name: 'first_name', placeholder: 'Candidate Name' },
                { name: 'client_name', placeholder: 'Client Name' },
                { name: 'email', placeholder: 'Email Address' },
                { name: 'phone_no', placeholder: 'Phone Number' },
                { name: 'state', placeholder: 'State' },
            ].map((field) => (
                <input
                    key={field.name}
                    type="text"
                    name={field.name}
                    value={filters[field.name]}
                    onChange={handleFilterChange}
                    placeholder={field.placeholder}
                    className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
                        isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
            ))}
          </div>
        </div>

        {/* ✅ CLEAN CONTAINER (No double borders) */}
        <div className={`rounded-xl overflow-hidden shadow-sm border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <OnboardingTable
            onboardings={onboardings}
            activeTab={activeTab}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSort={handleSort}            
            currentOrdering={ordering}     
            onView={(item) => { dispatch(setCurrentOnboarding(item)); setShowDetailsModal(true); }}
            onEdit={(item) => { dispatch(setCurrentOnboarding(item)); setShowEditModal(true); }}
            isLoading={loading}
          />
        </div>

        {/* Modals */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Initiate Onboarding" size="lg">
          <OnboardingForm onSubmit={handleCreateSubmit} onCancel={() => setShowCreateModal(false)} isLoading={loading} />
        </Modal>

        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Onboarding" size="lg">
          <OnboardingForm initialData={currentOnboarding} onSubmit={handleUpdateSubmit} onCancel={() => setShowEditModal(false)} isLoading={loading} isEdit={true} />
        </Modal>

        <OnboardingDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} onboarding={currentOnboarding} />
        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
      </div>
    </div>
  );
};

export default Onboarding;