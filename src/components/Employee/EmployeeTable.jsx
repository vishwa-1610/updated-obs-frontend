import React from 'react';
import { Edit, Trash2, Eye, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

const EmployeeTable = ({ 
  employees, 
  onView, 
  onEdit, 
  onDelete, 
  isLoading,
  pagination,      // New Prop
  onPageChange     // New Prop
}) => {
  const { isDarkMode } = useTheme();

  // --- SKELETON LOADER ---
  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className={`h-12 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className={`flex items-center px-6 py-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <div className="w-1/4 flex items-center space-x-3">
              <div className={`h-10 w-10 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className="space-y-2 flex-1">
                <div className={`h-4 w-3/4 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                <div className={`h-3 w-1/2 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              </div>
            </div>
            <div className="w-1/4 px-6"><div className={`h-4 w-1/2 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div></div>
            <div className="w-1/4 px-6"><div className={`h-4 w-1/3 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div></div>
            <div className="w-1/4 px-6 flex space-x-2 justify-end">
              <div className={`h-8 w-8 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
              <div className={`h-8 w-8 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-24 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <User className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-lg font-medium">No employees found</p>
        <p className="text-sm opacity-70">Add a new employee to get started</p>
      </div>
    );
  }

  // Helper variables for pagination
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="flex flex-col h-full relative">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="min-w-full border-separate border-spacing-y-0">
          <thead className={`sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-gray-900/90' : 'bg-gray-50/90'}`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
                Employee Details
              </th>
              <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
                Date of Birth
              </th>
              <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
                Joined Date
              </th>
              <th className={`px-6 py-4 text-right text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={isDarkMode ? 'divide-y divide-gray-800' : 'divide-y divide-gray-100'}>
            {employees.map((emp) => {
              // DiceBear Avatar
              const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${emp.first_name} ${emp.last_name}`;

              return (
                <tr 
                  key={emp.id} 
                  onClick={() => onView(emp)} // <--- ROW CLICK OPENS MODAL
                  className={`group transition-all duration-200 cursor-pointer text-sm ${isDarkMode ? 'hover:bg-gray-800/50 text-gray-300' : 'hover:bg-blue-50/30 text-gray-600'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={avatarUrl} 
                        alt={`${emp.first_name} ${emp.last_name}`} 
                        className={`h-9 w-9 rounded-full mr-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`} 
                      />
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {emp.first_name} {emp.last_name}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ID: #{emp.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {emp.dob || <span className="opacity-50 italic">Not set</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(emp.joined_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {/* Added e.stopPropagation() to prevent row click when clicking buttons */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onView(emp); }} 
                        className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-blue-900/30 text-blue-400' : 'bg-gray-50 hover:bg-blue-100 text-blue-600'}`}
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(emp); }} 
                        className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-green-900/30 text-green-400' : 'bg-gray-50 hover:bg-green-100 text-green-600'}`}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(emp); }} 
                        className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-red-900/30 text-red-400' : 'bg-gray-50 hover:bg-red-100 text-red-600'}`}
                        title="Delete"
                      >
                        {/* <Trash2 size={16} /> */}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && totalPages > 1 && (
        <div className={`mt-6 py-4 flex items-center justify-between border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Showing Page <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{currentPage}</span> of <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{totalPages}</span>
            </div>
            <div className={`flex items-center p-1 rounded-full border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-full transition-all duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><ChevronLeft size={18} /></button>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-full transition-all duration-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><ChevronRight size={18} /></button>
            </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;