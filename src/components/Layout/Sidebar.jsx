import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Briefcase, 
  UserCircle, 
  LayoutTemplate, 
  Shield,
  Menu,
  X,
  Building
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

const Sidebar = ({ isOpen, onToggle }) => {
  const { isDarkMode } = useTheme();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'onboarding', label: 'Onboarding', icon: UserCircle, path: '/onboarding' },
    { id: 'client', label: 'Client', icon: Users, path: '/client' },
    { id: 'employee', label: 'Employee', icon: Briefcase, path: '/employee' },
    { id: 'subcontractor', label: 'Subcontractor', icon: Building, path: '/subcontractor' },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate, path: '/templates' },
    { id: 'admin', label: 'Admin', icon: Shield, path: '/admin' },
  ];

  return (
    <>
      {/* Desktop Horizontal Navigation Bar */}
      <div className="hidden md:block fixed top-16 left-0 right-0 z-40">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-md`}>
          <div className="container mx-auto px-4">
            <nav className="flex space-x-1 py-2 overflow-x-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => {
                      const baseClasses = "flex items-center px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap";
                      const activeClasses = isActive
                        ? (isDarkMode 
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-blue-50 text-blue-700')
                        : (isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900');
                      
                      return `${baseClasses} ${activeClasses}`;
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`h-5 w-5 mr-2 ${isActive 
                          ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') 
                          : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`} 
                        />
                        <span className="font-medium">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
          <nav className="flex justify-between items-center px-2 py-2">
            {menuItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => {
                    const baseClasses = "flex flex-col items-center p-2 rounded-lg flex-1 mx-1";
                    const activeClasses = isActive
                      ? (isDarkMode 
                        ? 'bg-blue-900 text-blue-300' 
                        : 'bg-blue-50 text-blue-700')
                      : (isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100');
                    
                    return `${baseClasses} ${activeClasses}`;
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-5 w-5 ${isActive 
                        ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') 
                        : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`} 
                      />
                      <span className="text-xs mt-1">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
            
            <button
              onClick={onToggle}
              className={`flex flex-col items-center p-2 rounded-lg flex-1 mx-1 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs mt-1">More</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onToggle}
          />
          
          <div className={`absolute inset-y-0 right-0 w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Menu
                </span>
                <button
                  onClick={onToggle}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onToggle}
                      className={({ isActive }) => {
                        const baseClasses = "w-full flex items-center px-3 py-3 rounded-lg";
                        const activeClasses = isActive
                          ? (isDarkMode 
                            ? 'bg-blue-900 text-blue-300' 
                            : 'bg-blue-50 text-blue-700')
                          : (isDarkMode 
                            ? 'text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-600 hover:bg-gray-100');
                        
                        return `${baseClasses} ${activeClasses}`;
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`p-2 rounded-lg ${
                            isActive 
                              ? (isDarkMode ? 'bg-blue-800' : 'bg-blue-100') 
                              : (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              isActive 
                                ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') 
                                : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                            }`} />
                          </div>
                          <span className="ml-3 font-medium">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;