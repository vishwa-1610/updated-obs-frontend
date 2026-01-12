import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import SubcontractorTable from './SubcontractorTable';
import SubcontractorForm from './SubcontractorForm';
import SubcontractorDetailsModal from './SubcontractorDetailsModal';
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
  clearCurrentSubcontractor 
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

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subcontractorToDelete, setSubcontractorToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const params = { page: pagination.currentPage, search: searchQuery };
    dispatch(fetchSubcontractors(params));
  }, [dispatch, pagination.currentPage, searchQuery]);

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
            className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Subcontractor
          </button>
        </div>

        {/* Search Bar */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow border`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subcontractors..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg">
          <SubcontractorTable
            subcontractors={subcontractors}
            onView={(sub) => { dispatch(setCurrentSubcontractor(sub)); setShowDetailsModal(true); }}
            onEdit={(sub) => { dispatch(setCurrentSubcontractor(sub)); setShowEditModal(true); }}
            onDelete={(sub) => { setSubcontractorToDelete(sub); setShowDeleteModal(true); }}
            isLoading={loading}
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
          onUpdate={() => dispatch(fetchSubcontractors({ page: pagination.currentPage, search: searchQuery }))}
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