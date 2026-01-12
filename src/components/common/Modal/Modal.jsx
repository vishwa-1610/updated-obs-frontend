import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../Theme/ThemeProvider';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { isDarkMode } = useTheme();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  // Backdrop based on your theme pattern
  const backdropBg = isDarkMode 
    ? 'bg-gray-900/90'  // Using your gray-900 for dark mode
    : 'bg-gray-500/50'; // Using your gray-500 for light mode

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - using your color pattern */}
      <div
        className={`absolute inset-0 ${backdropBg} backdrop-blur-sm transition-opacity duration-300`}
        onClick={onClose}
      />

      {/* Modal Panel - matching your sidebar styling */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden transform transition-all duration-300`}
      >
        <div className={`relative rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          {/* Header - matching your active state styling */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h2>
                {/* Accent line matching your active border */}
                <div className={`h-1 w-16 mt-2 rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`} />
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {children}
          </div>

          {/* Optional Footer with subtle gradient */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
            <div className="flex justify-end space-x-3">
              {/* <button
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode 
                  ? 'text-gray-300 bg-gray-800 hover:bg-gray-700' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button> */}
              {/* <button
                onClick={() => {
                  // You can pass a prop for primary action if needed
                  console.log('Primary action');
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;