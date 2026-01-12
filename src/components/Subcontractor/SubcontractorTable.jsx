import React from 'react';
import { Edit, Trash2 } from 'lucide-react'; // Removed Eye icon import
import { useTheme } from '../Theme/ThemeProvider';

const SubcontractorTable = ({ 
  subcontractors, 
  onView, 
  onEdit, 
  onDelete, 
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onSort,
  currentOrdering 
}) => {
  const { isDarkMode } = useTheme();

  // --- SKELETON LOADER ---
  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className={`h-12 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className={`flex items-center px-6 py-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <div className="flex-1 pr-4"><div className={`h-4 w-3/4 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div></div>
            <div className="flex-1 px-2"><div className={`h-4 w-1/2 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div></div>
            <div className="flex-1 px-2"><div className={`h-4 w-1/2 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div></div>
            <div className="flex-1 px-2"><div className={`h-4 w-2/3 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div></div>
            <div className="w-24 px-2 flex justify-end gap-2">
                <div className={`h-8 w-8 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                <div className={`h-8 w-8 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!subcontractors || subcontractors.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className={`p-4 rounded-full mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
           {/* Placeholder Icon */}
           <div className="h-8 w-8 bg-current opacity-20 rounded"></div>
        </div>
        <p className="text-lg font-medium">No subcontractors found</p>
        <p className="text-sm opacity-70">Add a new subcontractor to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="min-w-full border-separate border-spacing-y-0">
        <thead className={`sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-gray-900/90' : 'bg-gray-50/90'}`}>
          <tr className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            {[
                { label: 'Name', key: 'subcontractor_name' },
                { label: 'Contract', key: 'contract_name' },
                { label: 'City', key: 'city' },
                { label: 'Email', key: 'email' },
                { label: 'Phone', key: 'phone_no' },
                { label: 'Created At', key: 'date_added' }
            ].map((header) => (
              <th 
                key={header.key} 
                onClick={() => onSort(header.key)}
                className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer group hover:text-blue-500 transition-colors ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
              >
                <div className="flex items-center gap-1">
                    {header.label}
                    {/* Sort Indicator */}
                    <span className={`transition-opacity ${currentOrdering?.includes(header.key) ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-30'}`}>
                        {currentOrdering === header.key ? '↑' : '↓'}
                    </span>
                </div>
              </th>
            ))}
            <th className={`px-6 py-4 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Actions
            </th>
          </tr>
        </thead>
        
        <tbody className={isDarkMode ? 'divide-y divide-gray-800' : 'divide-y divide-gray-100'}>
          {subcontractors.map((sub) => (
            <tr 
              key={sub.id} 
              onClick={() => onView(sub)} // ✅ Row Click Trigger
              className={`group transition-all duration-200 cursor-pointer ${isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-blue-50/40'}`}
            >
              <td className={`px-6 py-4 whitespace-nowrap font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {sub.subcontractor_name}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {sub.contract_name || '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {sub.city || '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {sub.email || '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {sub.phone_no || '-'}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {new Date(sub.date_added).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={(e) => { 
                        e.stopPropagation(); // ✅ Prevent row click
                        onEdit(sub); 
                    }} 
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-green-50'}`} 
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => { 
                        e.stopPropagation(); // ✅ Prevent row click
                        onDelete(sub); 
                    }} 
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'}`} 
                    title="Delete"
                  >
                    {/* <Trash2 size={16} /> */}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination (Reused from your existing logic) */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between px-6 py-3 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
             <div className="flex gap-2">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 text-sm rounded border ${isDarkMode ? 'border-gray-600 text-gray-300 disabled:opacity-50' : 'border-gray-300 text-gray-700 disabled:opacity-50'}`}>Prev</button>
                <span className={`text-sm py-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Page {currentPage} of {totalPages}</span>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 text-sm rounded border ${isDarkMode ? 'border-gray-600 text-gray-300 disabled:opacity-50' : 'border-gray-300 text-gray-700 disabled:opacity-50'}`}>Next</button>
             </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractorTable;