import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, X, Filter } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import SubcontractorTable from '../Subcontractor/SubcontractorTable';
import SubcontractorForm from '../Subcontractor/SubcontractorForm';
import SubcontractorDetailsModal from '../Subcontractor/SubcontractorDetailsModal';
import Modal from '../common/Modal/Modal';
import ConfirmModal from '../common/Modal/ConfirmModal';
import SuccessModal from '../common/Modal/SuccessModal';
import { 
  fetchSubcontractors, 
  createSubcontractor, 
  updateSubcontractor, 
  deleteSubcontractor,
  clearError,
  clearSuccess,
  setCurrentSubcontractor,
  clearCurrentSubcontractor,
  setPage // Assuming you added setPage to your slice like in Client
} from '../../store/subcontractorSlice';

const Subcontractor = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  const { 
    subcontractors, 
    currentSubcontractor, 
    loading, 
    error, 
    success,
    pagination 
  } = useSelector((state) => state.subcontractor);

  // --- STATE MANAGEMENT ---
  const [ordering, setOrdering] = useState('-date_added'); // Default Sort
  
  // ✅ 1. NEW: Filter State (Replaces single searchQuery)
  const [filters, setFilters] = useState({
    subcontractor_name: '',
    contract_name: '',
    city: '',
    email: '',
    phone_no: ''
  });

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subcontractorToDelete, setSubcontractorToDelete] = useState(null);
  
  // Feedback States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- 2. UPDATED FETCH LOGIC ---
  useEffect(() => {
    // A. Base Params
    const params = {
      page: pagination.currentPage || 1,
      ordering: ordering,
    };

    // B. Map Filters to Backend Partial Search (__icontains)
    if (filters.subcontractor_name) params['subcontractor_name__icontains'] = filters.subcontractor_name;
    if (filters.contract_name) params['contract_name__icontains'] = filters.contract_name;
    if (filters.city) params['city__icontains'] = filters.city;
    if (filters.email) params['email__icontains'] = filters.email;
    if (filters.phone_no) params['phone_no__icontains'] = filters.phone_no;

    // C. Dispatch
    dispatch(fetchSubcontractors(params));

  }, [dispatch, pagination.currentPage, filters, ordering]);

  // --- FEEDBACK HANDLERS ---
  useEffect(() => {
    if (success) {
      setSuccessMessage(success);
      setShowSuccessModal(true);
      setTimeout(() => {
        dispatch(clearSuccess());
        setShowSuccessModal(false);
      }, 3000);
    }
  }, [success, dispatch]);

  // --- HANDLERS ---

  // ✅ Handle Filter Input Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to page 1 when filtering (if setPage action exists)
    if (setPage) dispatch(setPage(1)); 
  };

  // ✅ Clear All Filters
  const clearFilters = () => {
    setFilters({ 
      subcontractor_name: '', 
      contract_name: '', 
      city: '', 
      email: '', 
      phone_no: '' 
    });
    if (setPage) dispatch(setPage(1));
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(pagination.count / pagination.pageSize) || 1;
    if (newPage >= 1 && newPage <= totalPages) {
        if (setPage) dispatch(setPage(newPage));
    }
  };

  const handleSort = (field) => {
    setOrdering((prev) => (prev === field ? `-${field}` : field));
    if (setPage) dispatch(setPage(1));
  };

  const handleCreateSubmit = (formData) => {
    dispatch(createSubcontractor(formData)).unwrap().then(() => setShowCreateModal(false));
  };

  const handleUpdateSubmit = (formData) => {
    if (currentSubcontractor) {
      dispatch(updateSubcontractor({ id: currentSubcontractor.id, data: formData }))
        .unwrap()
        .then(() => {
          setShowEditModal(false);
          dispatch(clearCurrentSubcontractor());
        });
    }
  };

  const handleDeleteConfirm = () => {
    if (subcontractorToDelete) {
      dispatch(deleteSubcontractor(subcontractorToDelete.id));
      setShowDeleteModal(false);
      setSubcontractorToDelete(null);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Subcontractor Management
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your subcontractors, contracts, and documents
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Subcontractor
          </button>
        </div>

        {/* ✅ 3. NEW: SEPARATE FILTER INPUTS GRID */}
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
                { name: 'subcontractor_name', placeholder: 'Subcontractor Name' },
                { name: 'contract_name', placeholder: 'Contract Name' },
                { name: 'city', placeholder: 'City' },
                { name: 'email', placeholder: 'Email Address' },
                { name: 'phone_no', placeholder: 'Phone Number' },
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

        {/* Table Container */}
        <div className={`rounded-xl overflow-hidden shadow-sm border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <SubcontractorTable
            subcontractors={subcontractors}
            onView={(sub) => { dispatch(setCurrentSubcontractor(sub)); setShowDetailsModal(true); }}
            onEdit={(sub) => { dispatch(setCurrentSubcontractor(sub)); setShowEditModal(true); }}
            onDelete={(sub) => { setSubcontractorToDelete(sub); setShowDeleteModal(true); }}
            isLoading={loading}
            
            // Pass Pagination & Sorting Props
            currentPage={pagination.currentPage}
            totalPages={Math.ceil(pagination.count / 10) || 1}
            onPageChange={handlePageChange}
            onSort={handleSort}
            currentOrdering={ordering}
          />
        </div>

        {/* Modals */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Subcontractor">
          <SubcontractorForm onSubmit={handleCreateSubmit} onCancel={() => setShowCreateModal(false)} isLoading={loading} />
        </Modal>

        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Subcontractor">
          <SubcontractorForm initialData={currentSubcontractor} onSubmit={handleUpdateSubmit} onCancel={() => setShowEditModal(false)} isLoading={loading} isEdit={true} />
        </Modal>

        <SubcontractorDetailsModal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          subcontractor={currentSubcontractor} 
          // Trigger a refresh with current filters when an item is updated inside modal
          onUpdate={() => {
             const params = { page: pagination.currentPage, ordering: ordering };
             if (filters.subcontractor_name) params['subcontractor_name__icontains'] = filters.subcontractor_name;
             // ... map other filters ...
             dispatch(fetchSubcontractors(params));
          }}
        />

        <ConfirmModal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={handleDeleteConfirm} 
          title="Delete Subcontractor" 
          message={`Are you sure you want to delete "${subcontractorToDelete?.subcontractor_name}"?`} 
        />

        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
      </div>
    </div>
  );
};

export default Subcontractor;