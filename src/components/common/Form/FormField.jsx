import React from 'react';
import { useTheme } from '../../Theme/ThemeProvider';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = [],
  rows = 3,
}) => {
  const { isDarkMode } = useTheme();

  // Shared input classes
  const getInputClasses = () => {
    let classes =
      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ';

    // Error border
    if (error) {
      classes += 'border-red-500 focus:border-red-500 focus:ring-red-500 ';
    } else {
      classes += isDarkMode ? 'border-gray-600 ' : 'border-gray-300 ';
    }

    // Disabled mode
    if (disabled) {
      classes += isDarkMode
        ? 'bg-gray-700 text-gray-400 cursor-not-allowed '
        : 'bg-gray-100 text-gray-500 cursor-not-allowed ';
    } else {
      classes += isDarkMode
        ? 'bg-gray-800 text-white '
        : 'bg-white text-gray-900 ';
    }

    return classes.trim();
  };

  const inputClasses = getInputClasses();
  const inputValue = value ?? '';

  return (
    <div className="mb-4">
      <label
        className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Textarea */}
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={inputValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={inputClasses}
        />
      ) : type === 'select' ? (
        // Select Dropdown
        <div className="relative">
          <select
            name={name}
            value={inputValue}
            onChange={onChange}
            disabled={disabled}
            className={`
              w-full pl-3 pr-10 py-2 rounded-lg border appearance-none cursor-pointer
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all

              ${
                error
                  ? 'border-red-500'
                  : isDarkMode
                  ? 'border-gray-600'
                  : 'border-gray-300'
              }

              ${
                disabled
                  ? isDarkMode
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-900'
              }
            `}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Arrow */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        // Normal input
        <input
          type={type}
          name={name}
          value={inputValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
        />
      )}

      {/* Error text */}
      {error && (
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
