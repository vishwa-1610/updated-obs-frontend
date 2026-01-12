import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, 
  X, 
  Filter,
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import ClientTable from '../Client/ClientTable';
import ClientForm from '../Client/ClientForm';
import ClientDetailsModal from '../Client/ClientDetailsModal';
import Modal from '../common/Modal/Modal';
import ConfirmModal from '../common/Modal/ConfirmModal';
import SuccessModal from '../common/Modal/SuccessModal';

// ✅ Updated Imports to include fetchClientById
import { 
  fetchClients, 
  fetchClientById, // <--- Crucial for getting Employees/Contracts
  createClient, 
  updateClient, 
  deleteClient,
  clearError,
  clearSuccess,
  setCurrentClient,
  clearCurrentClient,
  setPage 
} from '../../store/clientSlice';

const Client = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    clients, 
    currentClient, 
    loading, 
    error, 
    success,
    pagination 
  } = useSelector((state) => state.client);

  // --- STATE MANAGEMENT ---
  const [ordering, setOrdering] = useState('-created_at'); // Default Sort
  
  // Filter State
  const [filters, setFilters] = useState({
    client_name: '',
    email: '',
    city: '',
    industry: '',
    contact_no: ''
  });

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  
  // Feedback States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- FETCH LOGIC ---
  useEffect(() => {
    // 1. SAFETY CHECK: Are we on the Landing Page?
    const hostname = window.location.hostname;
    const mainDomains = ['obs.tiswatech.com', 'www.obs.tiswatech.com', 'tiswatech.com'];

    if (mainDomains.includes(hostname)) {
        console.log("Main Domain Detected: Skipping Client Fetch.");
        return; 
    }

    // 2. Normal Params Setup
    const params = {
      page: pagination.currentPage || 1,
      ordering: ordering,
    };

    if (filters.client_name) params['client_name__icontains'] = filters.client_name;
    if (filters.email) params['email__icontains'] = filters.email;
    if (filters.city) params['city__icontains'] = filters.city;
    if (filters.industry) params['industry__icontains'] = filters.industry;
    if (filters.contact_no) params['contact_no__icontains'] = filters.contact_no;

    // 3. Dispatch
    dispatch(fetchClients(params));

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

  useEffect(() => {
    if (error) {
      setErrorMessage(error.detail || error.message || 'An error occurred');
      setShowErrorModal(true);
      setTimeout(() => {
        dispatch(clearError());
        setShowErrorModal(false);
      }, 5000);
    }
  }, [error, dispatch]);

  // --- HANDLERS ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    dispatch(setPage(1)); 
  };

  const clearFilters = () => {
    setFilters({ 
      client_name: '', email: '', city: '', industry: '', contact_no: '' 
    });
    dispatch(setPage(1));
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(pagination.count / pagination.pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage));
    }
  };

  const handleSort = (field) => {
    setOrdering((prev) => (prev === field ? `-${field}` : field));
    dispatch(setPage(1));
  };

  // ✅ UPDATED: Fetch Full Details for View
  const handleViewDetails = (client) => {
    // Clear old data first to avoid showing wrong client briefly
    dispatch(clearCurrentClient());
    // Fetch full data (including Employees & Contracts) from backend
    dispatch(fetchClientById(client.id));
    setShowDetailsModal(true);
  };

  // ✅ UPDATED: Fetch Full Details for Edit
  const handleEdit = (client) => {
    dispatch(clearCurrentClient());
    dispatch(fetchClientById(client.id));
    setShowEditModal(true);
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      dispatch(deleteClient(clientToDelete.id))
        .unwrap()
        .then(() => {
           setShowDeleteModal(false);
           setClientToDelete(null);
        })
        .catch((err) => {
           setErrorMessage(err.detail || 'Failed to delete client');
           setShowErrorModal(true);
        });
    }
  };

  const handleCreateSubmit = (formData) => {
    dispatch(createClient(formData))
      .unwrap()
      .then(() => {
        setShowCreateModal(false);
      })
      .catch((err) => {
        const msg = err.detail || err.message || 'Failed to create client';
        setErrorMessage(msg);
        setShowErrorModal(true);
      });
  };

  const handleUpdateSubmit = (formData) => {
    if (currentClient) {
      dispatch(updateClient({ id: currentClient.id, data: formData }))
        .unwrap()
        .then(() => {
          setShowEditModal(false);
          dispatch(clearCurrentClient());
        })
        .catch((err) => {
          const msg = err.detail || err.message || 'Failed to update client';
          setErrorMessage(msg);
          setShowErrorModal(true);
        });
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Client Management
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage all your clients and their information
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Client
            </button>
          </div>
        </div>

        {/* Filters */}
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
                { name: 'client_name', placeholder: 'Client Name' },
                { name: 'email', placeholder: 'Email Address' },
                { name: 'city', placeholder: 'City' },
                { name: 'industry', placeholder: 'Industry' },
                { name: 'contact_no', placeholder: 'Phone Number' },
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

        {/* Clients Table */}
        <div className={`rounded-xl overflow-hidden shadow-sm border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <ClientTable
            clients={clients}
            onView={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isLoading={loading}
            currentPage={pagination.currentPage}
            totalPages={Math.ceil(pagination.count / pagination.pageSize)}
            onPageChange={handlePageChange}
            onSort={handleSort}         
            currentOrdering={ordering}  
          />
        </div>

        {/* Create Client Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Client"
        >
          <ClientForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateModal(false)}
            isLoading={loading}
          />
        </Modal>

        {/* Edit Client Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            dispatch(clearCurrentClient());
          }}
          title="Edit Client"
        >
          <ClientForm
            initialData={currentClient}
            onSubmit={handleUpdateSubmit}
            onCancel={() => {
              setShowEditModal(false);
              dispatch(clearCurrentClient());
            }}
            isLoading={loading}
            isEdit={true}
          />
        </Modal>

        {/* Client Details Modal */}
        <ClientDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            dispatch(clearCurrentClient());
          }}
          client={currentClient}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setClientToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Client"
          message={`Are you sure you want to delete "${clientToDelete?.client_name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Success Pop-up */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          type="success"
          title="Success"
          message={successMessage}
          autoClose={3000}
        />

        {/* Error Pop-up */}
        <SuccessModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          type="error"
          title="Error"
          message={errorMessage}
          autoClose={5000}
        />
      </div>
    </div>
  );
};

export default Client;