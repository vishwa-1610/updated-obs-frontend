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
        className={`relative w-full ${sizeClasses[size]} max-h-[92vh] flex flex-col overflow-hidden transform transition-all duration-300`}
      >
        <div className={`relative rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${isDarkMode ? 'bg-[#131722] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'} border`}>
          {/* Header */}
          <div className={`px-6 py-3.5 border-b shrink-0 ${isDarkMode ? 'border-zinc-800/80 bg-[#131722]' : 'border-slate-100 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {title}
                </h2>
                {/* Accent line matching active theme */}
                <div className="h-0.5 w-12 mt-1.5 rounded-full theme-bg-primary" />
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode 
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                }`}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;