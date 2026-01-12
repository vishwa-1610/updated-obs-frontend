import React, { useState } from 'react';
import { User, FileText, Briefcase, Calendar } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useTheme } from '../Theme/ThemeProvider';

const EmployeeDetailsModal = ({ isOpen, onClose, employee }) => {
  const [activeTab, setActiveTab] = useState('details');
  const { isDarkMode } = useTheme();

  if (!employee) return null;

  const tabs = [
    { id: 'details', label: 'Details', icon: User },
    { id: 'clients', label: 'Previous Clients', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const renderDetails = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Employee Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailItem icon={User} label="Full Name" value={`${employee.first_name} ${employee.last_name}`} isDarkMode={isDarkMode} />
        <DetailItem icon={Calendar} label="Date of Birth" value={employee.dob} isDarkMode={isDarkMode} />
        <DetailItem icon={Calendar} label="Joined At" value={new Date(employee.joined_at).toLocaleDateString()} isDarkMode={isDarkMode} />
      </div>
    </div>
  );

  const renderJSONTab = (data, title) => (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
        <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        {(!data || data.length === 0) ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data available.</div>
        ) : (
            <pre className={`p-4 rounded-lg overflow-auto text-sm ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                {JSON.stringify(data, null, 2)}
            </pre>
        )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details" size="xl">
        <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 px-1`}>
            <nav className="flex space-x-1 overflow-x-auto">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center transition-all duration-200 whitespace-nowrap ${activeTab === tab.id 
                        ? (isDarkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-600 bg-blue-50/50')
                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}`}>
                        <tab.icon className="w-4 h-4 mr-2"/> {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-1 pb-4 custom-scrollbar">
            {activeTab === 'details' && renderDetails()}
            {activeTab === 'clients' && renderJSONTab(employee.previous_clients, 'Previous Client History')}
            {activeTab === 'documents' && renderJSONTab(employee.documents, 'Employee Documents')}
        </div>
    </Modal>
  );
};

const DetailItem = ({ icon: Icon, label, value, isDarkMode }) => (
  <div className={`flex items-center space-x-3 p-3.5 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/50'}`}>
    <div className={`p-2.5 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-white border border-gray-100 text-blue-600 shadow-sm'}`}>
        <Icon size={18} />
    </div>
    <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value || 'N/A'}</p>
    </div>
  </div>
);

export default EmployeeDetailsModal;