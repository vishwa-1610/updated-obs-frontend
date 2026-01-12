import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import TemplateTable from '../Template/TemplateTable';
import TemplateForm from '../Template/TemplateForm';
import TemplateDetailsModal from '../Template/TemplateDetailsModal';
import Modal from '../common/Modal/Modal';
import ConfirmModal from '../common/Modal/ConfirmModal';
import SuccessModal from '../common/Modal/SuccessModal';
import { clientService } from '../../services/clientService'; // <--- 1. IMPORT CLIENT SERVICE
import { 
  fetchTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  clearSuccess,
  setCurrentTemplate,
  clearCurrentTemplate 
} from '../../store/templateSlice';

const Template = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  const { templates = [], currentTemplate, loading, success, pagination } = useSelector((state) => state.template || {});

  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([]); // <--- 2. STATE FOR CLIENTS
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- 3. FETCH CLIENTS EFFECT ---
  useEffect(() => {
    const loadClients = async () => {
      try {
        // Fetch all clients (adjust page_size if you have pagination)
        const response = await clientService.getClients({ page_size: 100 });
        // Handle DRF pagination (response.data.results) or standard array (response.data)
        const clientList = response.data.results || response.data;
        setClients(clientList);
      } catch (error) {
        console.error("Failed to load clients for dropdown:", error);
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    const params = { page: pagination?.currentPage || 1, search: searchQuery };
    dispatch(fetchTemplates(params));
  }, [dispatch, pagination?.currentPage, searchQuery]);

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
    dispatch(createTemplate(formData)).unwrap().then(() => setShowCreateModal(false));
  };

  const handleUpdateSubmit = (formData) => {
    if (currentTemplate) {
      dispatch(updateTemplate({ id: currentTemplate.id, data: formData }))
        .unwrap()
        .then(() => {
          setShowEditModal(false);
          dispatch(clearCurrentTemplate());
        });
    }
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      dispatch(deleteTemplate(templateToDelete.id));
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Template Management
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your HTML templates, logos, and PDF assets
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Template
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
                placeholder="Search templates..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg">
          <TemplateTable
            templates={templates}
            onView={(item) => { dispatch(setCurrentTemplate(item)); setShowDetailsModal(true); }}
            onEdit={(item) => { dispatch(setCurrentTemplate(item)); setShowEditModal(true); }}
            onDelete={(item) => { setTemplateToDelete(item); setShowDeleteModal(true); }}
            isLoading={loading}
          />
        </div>

        {/* 4. PASS CLIENTS PROP TO FORMS */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Template" size="lg">
          <TemplateForm 
            clients={clients} // <--- Pass Here
            onSubmit={handleCreateSubmit} 
            onCancel={() => setShowCreateModal(false)} 
            isLoading={loading} 
          />
        </Modal>

        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Template" size="lg">
          <TemplateForm 
            clients={clients} // <--- Pass Here
            initialData={currentTemplate} 
            onSubmit={handleUpdateSubmit} 
            onCancel={() => setShowEditModal(false)} 
            isLoading={loading} 
            isEdit={true} 
          />
        </Modal>

        <TemplateDetailsModal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          template={currentTemplate} 
        />

        <ConfirmModal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          onConfirm={handleDeleteConfirm} 
          title="Delete Template" 
          message={`Are you sure you want to delete "${templateToDelete?.name}"?`} 
        />

        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
      </div>
    </div>
  );
};

export default Template;