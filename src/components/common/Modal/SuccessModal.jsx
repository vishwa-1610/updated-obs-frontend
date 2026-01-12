import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useTheme } from '../../Theme/ThemeProvider';

const SuccessModal = ({ isOpen, onClose, type = 'success', title, message, autoClose = 3000 }) => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    let timer;
    if (isOpen && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, autoClose);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  // Use conditional classes based on theme
  const bgColor = type === 'success' 
    ? (isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200')
    : (isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200');

  const iconColor = type === 'success'
    ? (isDarkMode ? 'text-green-300' : 'text-green-500')
    : (isDarkMode ? 'text-red-300' : 'text-red-500');

  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
      {/* FIX: Removed 'ring-1 ring-black ring-opacity-5' 
          Added 'shadow-lg' for a clean drop shadow instead 
      */}
      <div className={`max-w-sm w-full rounded-xl pointer-events-auto shadow-lg overflow-hidden ${bgColor} border transition-all transform duration-300 ease-out`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </p>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;