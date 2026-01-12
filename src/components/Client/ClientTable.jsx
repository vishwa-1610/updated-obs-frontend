import React from 'react';
import { Edit, Trash2, Eye, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Building2 } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

const ClientTable = ({ 
  clients, 
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

  // Helper to render sort arrows
  const renderSortIcon = (field) => {
    if (currentOrdering === field) return <ArrowUp size={14} className="inline ml-1 text-blue-500" />;
    if (currentOrdering === `-${field}`) return <ArrowDown size={14} className="inline ml-1 text-blue-500" />;
    return <ArrowUp size={14} className="inline ml-1 opacity-0 group-hover:opacity-30 transition-opacity" />;
  };

  // --- SKELETON LOADER ---
  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className={`h-12 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className={`flex items-center px-6 py-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
            <div className="flex-1 pr-4 flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                <div className="space-y-2 flex-1">
                    <div className={`h-4 w-3/4 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                    <div className={`h-3 w-1/2 rounded animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                </div>
            </div>
            {/* ... other skeleton parts ... */}
          </div>
        ))}
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`p-4 rounded-full inline-block mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
           <Eye size={32} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
        </div>
        <div className={`mb-2 font-medium text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          No clients found
        </div>
        <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
          Create your first client to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto min-h-[400px]"> {/* Added min-h to match onboarding style */}
      <table className="min-w-full border-separate border-spacing-y-0"> {/* Updated table styles */}
        <thead className={`sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-gray-900/90' : 'bg-gray-50/90'}`}>
          <tr>
            {/* Sortable Header: Name */}
            <th 
              onClick={() => onSort('client_name')}
              className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Client Name {renderSortIcon('client_name')}
            </th>

            {/* Sortable Header: Contact */}
            <th 
               onClick={() => onSort('contact_no')}
               className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Contact {renderSortIcon('contact_no')}
            </th>

            {/* Sortable Header: Email */}
            <th 
              onClick={() => onSort('email')}
              className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Email {renderSortIcon('email')}
            </th>

            {/* Sortable Header: City */}
            <th 
              onClick={() => onSort('city')}
              className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              City {renderSortIcon('city')}
            </th>

            {/* Sortable Header: Industry */}
            <th 
              onClick={() => onSort('industry')}
              className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Industry {renderSortIcon('industry')}
            </th>

            {/* Sortable Header: Created At */}
            <th 
              onClick={() => onSort('created_at')}
              className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Created At {renderSortIcon('created_at')}
            </th>

            <th className={`px-6 py-4 text-right text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody className={isDarkMode ? 'divide-y divide-gray-800' : 'divide-y divide-gray-100'}>
          {clients.map((client) => {
            // Generate Avatar based on Client Name
            const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${client.client_name}`;

            return (
              <tr 
                key={client.id} 
                onClick={() => onView(client)} // Row click triggers View Details
                className={`group transition-all duration-200 cursor-pointer text-sm ${isDarkMode ? 'hover:bg-gray-800/50 text-gray-300' : 'hover:bg-blue-50/30 text-gray-600'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* Added Avatar Image */}
                    <img src={avatarUrl} alt="" className={`h-9 w-9 rounded-full mr-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`} />
                    
                    <div className="ml-0"> {/* Removed unnecessary margin since image has margin-right */}
                      <div className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {client.client_name || 'Unnamed Client'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{client.contact_no || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.city || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Updated Industry Badge Style */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {client.industry || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {/* Updated Action Buttons Style */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(client); }} 
                        className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-blue-900/30 text-blue-400' : 'bg-gray-50 hover:bg-blue-100 text-blue-600'}`}
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(client); }} 
                        className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-red-900/30 text-red-400' : 'bg-gray-50 hover:bg-red-100 text-red-600'}`}
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

      {/* Pagination Footer - Kept exactly as yours */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between px-6 py-3 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-gray-600 text-gray-400 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  const isActive = currentPage === pageNumber;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium hover:bg-gray-50 ${isDarkMode 
                        ? isActive 
                          ? 'z-10 bg-blue-900 border-blue-700 text-blue-300' 
                          : 'border-gray-600 text-gray-400 bg-gray-800 hover:bg-gray-700'
                        : isActive 
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                          : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'border-gray-600 text-gray-400 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientTable;