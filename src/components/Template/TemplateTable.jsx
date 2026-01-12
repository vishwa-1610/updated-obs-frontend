import React from 'react';
import { Edit, Trash2, Eye, FileText, ImageIcon } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

const TemplateTable = ({ templates, onView, onEdit, onDelete, isLoading }) => {
  const { isDarkMode } = useTheme();

  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className={`h-12 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className={`flex items-center px-6 py-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <div className="w-1/4 flex items-center space-x-3">
              <div className={`h-10 w-10 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-1/2 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            </div>
            <div className="w-1/4 px-6"><div className={`h-4 w-1/2 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div></div>
            <div className="w-1/4 px-6"><div className={`h-4 w-1/2 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div></div>
            <div className="w-1/4 px-6 flex justify-end space-x-2">
              <div className={`h-8 w-8 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className={`h-8 w-8 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className={`p-4 rounded-full mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
           <FileText size={32} className="opacity-50" />
        </div>
        <p className="text-lg font-medium">No templates found</p>
        <p className="text-sm opacity-70">Add a new template to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className={isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}>
            {['Template Name', 'Client Name', 'Company Name', 'Date Created', 'Actions'].map((header) => (
              <th key={header} className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={isDarkMode ? 'divide-y divide-gray-800' : 'divide-y divide-gray-200'}>
          {templates.map((template) => (
            <tr key={template.id} className={`transition-colors duration-150 ${isDarkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-blue-50/30'}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded flex items-center justify-center mr-4 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    {template.logo ? (
                      <img src={template.logo} alt="logo" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
                    )}
                  </div>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{template.name}</div>
                </div>
              </td>
              {/* Handling client_name: could be ID or object based on serializer. Displaying safely */}
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {typeof template.client_name === 'object' ? template.client_name?.client_name : template.client_name || '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {template.company_name || '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {new Date(template.date_created).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button onClick={() => onView(template)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-100'}`}><Eye size={18} /></button>
                  <button onClick={() => onEdit(template)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-green-100'}`}><Edit size={18} /></button>
                  {/* <button onClick={() => onDelete(template)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-100'}`}><Trash2 size={18} /></button> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TemplateTable;