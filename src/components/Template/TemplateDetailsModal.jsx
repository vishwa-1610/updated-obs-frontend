import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Import hooks
import { User, FileText, Building, Code, Image as ImageIcon, ExternalLink } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useTheme } from '../Theme/ThemeProvider';
import { fetchPreview, clearPreview } from '../../store/templateSlice'; // Import actions

const TemplateDetailsModal = ({ isOpen, onClose, template }) => {
  const [activeTab, setActiveTab] = useState('details');
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  // Get preview data from Redux
  const { previewHtml, loading } = useSelector((state) => state.template);

  // --- FETCH PREVIEW WHEN TAB IS ACTIVE ---
  useEffect(() => {
    if (isOpen && template?.id && activeTab === 'preview') {
      dispatch(fetchPreview(template.id));
    }
  }, [isOpen, activeTab, template, dispatch]);

  // --- CLEAR PREVIEW ON CLOSE ---
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearPreview());
      setActiveTab('details');
    }
  }, [isOpen, dispatch]);

  if (!template) return null;

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'preview', label: 'Live Preview', icon: Code },
  ];

  const renderDetails = () => (
    <div className={`rounded-xl p-6 transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'} border`}>
      <h3 className={`font-semibold text-lg mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Template Information</h3>
      
      <div className="flex items-start gap-6 mb-6">
          <div className={`h-24 w-24 rounded-lg flex items-center justify-center overflow-hidden border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
             {template.logo ? <img src={template.logo} alt="Logo" className="h-full w-full object-contain" /> : <ImageIcon className="text-gray-400" />}
          </div>
          <div className="flex-1 space-y-4">
             <DetailItem icon={FileText} label="Template Name" value={template.name} isDarkMode={isDarkMode} />
             <DetailItem icon={User} label="Client" value={typeof template.client_name === 'object' ? template.client_name?.client_name : template.client_name} isDarkMode={isDarkMode} />
             <DetailItem icon={Building} label="Company" value={template.company_name} isDarkMode={isDarkMode} />
          </div>
      </div>

      {/* Colors & Text Preview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Accent Color</span>
            <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: template.accent_color || '#2563EB' }}></div>
                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{template.accent_color || '#2563EB'}</span>
            </div>
         </div>
      </div>

      {template.pdf_file && (
          <div className={`p-4 rounded-lg border flex justify-between items-center ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Attached PDF</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{template.pdf_file.split('/').pop()}</p>
              </div>
              <a href={template.pdf_file} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-semibold">
                  View <ExternalLink size={14} />
              </a>
          </div>
      )}
    </div>
  );

  const renderPreview = () => (
    <div className={`rounded-xl overflow-hidden border h-[600px] bg-white relative`}>
       {loading ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
               <p className="text-gray-500 text-sm">Generating Preview...</p>
           </div>
       ) : previewHtml ? (
           <iframe 
             srcDoc={previewHtml} 
             title="Preview" 
             className="w-full h-full border-none"
             sandbox="allow-same-origin" // Security best practice
           />
       ) : (
           <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <Code size={48} className="mb-4 opacity-20" />
               <p>No preview available</p>
           </div>
       )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Template Details" size="xl">
        <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 px-1`}>
            <nav className="flex space-x-1">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center transition-all duration-200 ${activeTab === tab.id 
                        ? (isDarkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-600 bg-blue-50/50')
                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}>
                        <tab.icon className="w-4 h-4 mr-2"/> {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-1 pb-4 custom-scrollbar">
            {activeTab === 'details' && renderDetails()}
            {activeTab === 'preview' && renderPreview()}
        </div>
    </Modal>
  );
};

const DetailItem = ({ icon: Icon, label, value, isDarkMode }) => (
  <div className={`flex items-center space-x-3 p-2 rounded-lg`}>
    <Icon size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
    <div>
        <span className={`text-xs font-medium uppercase tracking-wide mr-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}:</span>
        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value || 'N/A'}</span>
    </div>
  </div>
);

export default TemplateDetailsModal;