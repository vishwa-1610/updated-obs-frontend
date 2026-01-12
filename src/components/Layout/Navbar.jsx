import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Search, Bell, Sun, Moon, ChevronDown, Briefcase, LogOut, User, Loader2, ArrowRight 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { logout } from '../../store/authSlice';
import { fetchNotifications } from '../../store/onboardingSlice'; // Import the new action

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode, toggleTheme } = useTheme();

  // --- 1. GET DATA ---
  const { user } = useSelector((state) => state.auth);
  const currentUser = user || JSON.parse(localStorage.getItem('user')) || {};
  
  // Use the SEPARATE notifications list, not the main onboardings list
  const { notifications = [] } = useSelector((state) => state.onboarding || {});

  // --- 2. FETCH NOTIFICATIONS ON MOUNT ---
  // This ensures data persists even if you switch tabs in the main app
  useEffect(() => {
    dispatch(fetchNotifications());
    
    // Optional: Poll every 60 seconds to keep fresh
    const interval = setInterval(() => dispatch(fetchNotifications()), 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const displayName = currentUser.first_name 
    ? `${currentUser.first_name} ${currentUser.last_name}` 
    : (currentUser.email || "Guest User");
  const displayRole = currentUser.is_staff ? "Admin" : "Employee";
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser.avatar_seed || 'User'}`;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotifDropdown(false);
    navigate('/onboarding');
  };

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-100'}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30' : 'bg-blue-600 text-white group-hover:bg-blue-700'}`}>
                <Briefcase className="h-5 w-5" />
              </div>
              <span className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                OBS
              </span>
            </Link>

            {/* Search (Hidden on mobile) */}
            <div className="hidden md:block ml-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-4 w-4 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search..."
                  className={`pl-9 pr-4 py-1.5 w-64 rounded-full text-sm border transition-all duration-300 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500/50 focus:bg-gray-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* --- NOTIFICATIONS --- */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowUserDropdown(false); }}
                className={`p-2 rounded-full relative transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} ${showNotifDropdown ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                )}
              </button>

              {/* --- ELEGANT DROPDOWN --- */}
              {showNotifDropdown && (
                <div className={`absolute right-0 mt-4 w-[400px] rounded-2xl shadow-2xl py-2 z-50 ring-1 ring-black/5 origin-top-right transform transition-all animate-in fade-in slide-in-from-top-2 ${isDarkMode ? 'bg-[#111827] ring-white/10' : 'bg-white'}`}>
                    
                    {/* Header */}
                    <div className="px-5 py-3 flex justify-between items-center border-b border-dashed border-gray-200 dark:border-gray-800">
                        <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            {notifications.length} Pending
                        </span>
                    </div>
                    
                    {/* Content List */}
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {notifications.length > 0 ? (
                            notifications.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={handleNotificationClick}
                                    className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-start gap-4 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Avatar */}
                                    <img 
                                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${item.first_name} ${item.last_name}`} 
                                        alt="avatar" 
                                        className={`w-10 h-10 rounded-full border-2 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-white bg-gray-100 shadow-sm'}`} 
                                    />

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                                {item.first_name} {item.last_name}
                                            </p>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                ['IN_PROGRESS', 'In Progress'].includes(item.status)
                                                ? 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400'
                                                : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                            }`}>
                                                {['IN_PROGRESS', 'In Progress'].includes(item.status) ? 'In Progress' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {item.job_title} <span className="opacity-50 mx-1">•</span> {item.client_name || 'No Client'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                            <Loader2 size={10} className={['IN_PROGRESS'].includes(item.status) ? "animate-spin" : "hidden"} />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight size={16} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center opacity-60">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-50 text-gray-300'}`}>
                                    <Bell size={24} />
                                </div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>All caught up!</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className={`px-4 py-3 border-t text-center ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                        <button onClick={handleNotificationClick} className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                            View Pipeline Board
                        </button>
                    </div>
                </div>
              )}
            </div>

            {/* --- USER PROFILE --- */}
            <div className="relative pl-2">
              <button
                onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifDropdown(false); }}
                className={`flex items-center gap-2 p-1 pl-2 pr-3 rounded-full transition-all duration-200 border ${showUserDropdown 
                    ? (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm') 
                    : (isDarkMode ? 'border-transparent hover:bg-gray-800' : 'border-transparent hover:bg-gray-100')}`}
              >
                <img src={avatarUrl} alt="User" className="h-8 w-8 rounded-full bg-gray-200" />
                <ChevronDown size={14} className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-xl py-2 z-50 ring-1 ring-black/5 origin-top-right animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-gray-800 ring-white/10 text-gray-200' : 'bg-white text-gray-700'}`}>
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/profile" className={`flex items-center px-4 py-2.5 text-sm gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`} onClick={() => setShowUserDropdown(false)}>
                        <User size={16} className="opacity-70" /> Profile
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <button onClick={handleLogout} className={`w-full flex items-center px-4 py-2.5 text-sm gap-3 transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;