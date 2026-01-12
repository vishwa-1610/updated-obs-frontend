import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { useTheme } from '../../Theme/ThemeProvider'; // Adjust path as needed

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  const { isDarkMode } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}>
          <AlertTriangle className={`h-6 w-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
        </div>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {message}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-200 ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;