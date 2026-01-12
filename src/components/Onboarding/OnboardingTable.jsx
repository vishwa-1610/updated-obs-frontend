import React, { useState, useEffect } from 'react';
import { Edit, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, Clock, Loader2, XCircle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

const OnboardingTable = ({ 
  onboardings, 
  activeTab, 
  onView, 
  onEdit, 
  isLoading,
  pagination, 
  onPageChange,
  onSort,            // Received Prop
  currentOrdering    // Received Prop
}) => {
  const { isDarkMode } = useTheme();
  const [pageInput, setPageInput] = useState(1);

  useEffect(() => {
    if (pagination?.currentPage) setPageInput(pagination.currentPage);
  }, [pagination?.currentPage]);

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
          </div>
        ))}
      </div>
    );
  }

  // --- DATA NORMALIZATION ---
  const getRowData = (item) => {
    let source = item;        
    let extraField = '-';     
    let statusLabel = 'Pending'; 
    let originalItem = item;  

    if (activeTab === 'confirmed') {
        source = item; 
        statusLabel = 'Confirmed';
        const dateStr = item.confirmation_date || item.created_at; 
        extraField = dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
        originalItem = item;
    } else if (activeTab === 'rejected') {
        source = item;
        originalItem = item;
        if (item.status === 'REGRET') {
            statusLabel = 'Regret';
            extraField = item.regret_reason || 'No reason provided';
        } else if (item.status === 'TERMINATED') {
            statusLabel = 'Terminated';
            extraField = item.termination_reason || 'No reason provided';
        } else {
            statusLabel = 'Rejected';
            extraField = '-';
        }
    } else if (activeTab === 'inprogress') {
        source = item;
        originalItem = item;
        statusLabel = 'In Progress';
        extraField = item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Active';
    } else {
        if (item.onboarding) {
            source = item.onboarding;
            originalItem = item.onboarding;
            extraField = item.reason_pending || 'Incomplete Profile';
        } else {
            source = item;
            originalItem = item;
            statusLabel = item.status === 'PENDING' ? 'Pending' : item.status;
            extraField = activeTab === 'all' ? item.status : 'Invited';
        }
        
        if(statusLabel === 'PENDING') statusLabel = 'Pending';
        if(statusLabel === 'IN_PROGRESS') statusLabel = 'In Progress';
        if(statusLabel === 'COMPLETED') statusLabel = 'Confirmed';
    }

    return {
        id: source.id,           
        displayId: item.id,      
        first_name: source.first_name,
        last_name: source.last_name,
        email: source.email,
        client_name: source.client_name,
        job_title: source.job_title,
        status: statusLabel,
        extraField: extraField,
        originalItem: originalItem 
    };
  };

  // --- PAGINATION LOGIC ---
  const pageSize = pagination?.pageSize || 10;
  const currentPage = pagination?.currentPage || 1;
  const count = pagination?.count || 0;
  const totalPages = Math.ceil(count / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, count);

  const handlePageSubmit = (e) => {
    if (e.key === 'Enter') {
      let page = parseInt(pageInput);
      if (page >= 1 && page <= totalPages) onPageChange(page);
      else setPageInput(currentPage);
    }
  };

  if (!onboardings || onboardings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`p-4 rounded-full inline-block mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
           <MoreHorizontal size={32} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
        </div>
        <div className={`mb-2 font-medium text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          No records found
        </div>
        <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
          Initiate onboarding to get started
        </p>
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const baseClasses = "flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-semibold border";
    
    if (status === 'Confirmed' || status === 'COMPLETED') return (
      <span className={`${baseClasses} ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
        <CheckCircle2 className="w-3 h-3 mr-1.5" /> Confirmed
      </span>
    );
    if (status === 'In Progress' || status === 'IN_PROGRESS') return (
      <span className={`${baseClasses} ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> In Progress
      </span>
    );
    if (status === 'Regret' || status === 'REGRET') return (
      <span className={`${baseClasses} ${isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
        <XCircle className="w-3 h-3 mr-1.5" /> Regret
      </span>
    );
    if (status === 'Terminated' || status === 'TERMINATED') return (
      <span className={`${baseClasses} ${isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200'}`}>
        <AlertCircle className="w-3 h-3 mr-1.5" /> Terminated
      </span>
    );
    return (
      <span className={`${baseClasses} ${isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
        <Clock className="w-3 h-3 mr-1.5" /> Pending
      </span>
    );
  };

  let dynamicHeaderLabel = 'Status Info';
  if (activeTab === 'confirmed') dynamicHeaderLabel = 'Confirmed Date';
  else if (activeTab === 'inprogress') dynamicHeaderLabel = 'Last Active';
  else if (activeTab === 'rejected') dynamicHeaderLabel = 'Reason'; 
  else dynamicHeaderLabel = 'Status Detail';

  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="min-w-full border-separate border-spacing-y-0">
        <thead className={`sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-gray-900/90' : 'bg-gray-50/90'}`}>
          <tr>
            {/* Sortable Headers */}
            <th 
                onClick={() => onSort('first_name')} 
                className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Candidate {renderSortIcon('first_name')}
            </th>

            <th 
                onClick={() => onSort('client_name')} 
                className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Client {renderSortIcon('client_name')}
            </th>

            <th 
                onClick={() => onSort('job_title')} 
                className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Job Title {renderSortIcon('job_title')}
            </th>

            <th 
                onClick={() => onSort('email')} 
                className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Email {renderSortIcon('email')}
            </th>

            <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
              {dynamicHeaderLabel}
            </th>

            <th 
                onClick={() => onSort('status')} 
                className={`group px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}
            >
              Status {renderSortIcon('status')}
            </th>

            <th className={`px-6 py-4 text-right text-xs font-bold uppercase tracking-wider border-b ${isDarkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody className={isDarkMode ? 'divide-y divide-gray-800' : 'divide-y divide-gray-100'}>
          {onboardings.map((item) => {
            const data = getRowData(item);
            const seed = (data.first_name || '') + (data.last_name || '');
            const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

            return (
              <tr 
                  key={data.displayId} 
                  onClick={() => onView(data.originalItem)}
                  className={`group transition-all duration-200 cursor-pointer text-sm ${isDarkMode ? 'hover:bg-gray-800/50 text-gray-300' : 'hover:bg-blue-50/30 text-gray-600'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img src={avatarUrl} alt="" className={`h-9 w-9 rounded-full mr-3 border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`} />
                    <div><div className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{data.first_name} {data.last_name}</div></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{data.client_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{data.job_title || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{data.email}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-medium max-w-[200px] truncate ${activeTab === 'pending' ? 'text-amber-500' : ''}`} title={data.extraField}>
                  {data.extraField}
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={data.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(data.originalItem); }} 
                        className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-blue-900/30 text-blue-400' : 'bg-gray-50 hover:bg-blue-100 text-blue-600'}`}
                    >
                        <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Footer */}
      {pagination && count > 0 && (
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

export default OnboardingTable;