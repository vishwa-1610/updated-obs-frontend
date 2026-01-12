import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ContentArea = ({ activeTab, isDarkMode }) => {
  const contentMap = {
    home: {
      title: "Dashboard Overview",
      icon: BarChart3,
      stats: [
        { label: "Total Revenue", value: "$42,580", change: "+12.5%", icon: DollarSign, color: "green" },
        { label: "Active Users", value: "3,847", change: "+8.2%", icon: Users, color: "blue" },
        { label: "Avg. Session", value: "24m 18s", change: "+15.3%", icon: Clock, color: "purple" },
        { label: "Conversion Rate", value: "4.7%", change: "+3.1%", icon: TrendingUp, color: "orange" },
      ]
    },
    onboarding: {
      title: "Onboarding Process",
      icon: Users,
      stats: [
        { label: "Pending Onboarding", value: "24", change: "3 new today", icon: AlertCircle, color: "yellow" },
        { label: "Completed", value: "156", change: "12 today", icon: CheckCircle, color: "green" },
        { label: "In Progress", value: "8", change: "Active", icon: Activity, color: "blue" },
      ]
    },
    client: {
      title: "Client Management",
      icon: Users,
      stats: [
        { label: "Total Clients", value: "142", change: "+5 this month", icon: Users, color: "blue" },
        { label: "Active Projects", value: "24", change: "Ongoing", icon: Activity, color: "green" },
        { label: "Client Satisfaction", value: "94%", change: "+2%", icon: TrendingUp, color: "purple" },
      ]
    },
    employee: {
      title: "Employee Directory",
      icon: Users,
      stats: [
        { label: "Total Employees", value: "247", change: "+8 this month", icon: Users, color: "blue" },
        { label: "On Leave", value: "12", change: "Currently", icon: AlertCircle, color: "yellow" },
        { label: "Avg. Rating", value: "4.7/5", change: "+0.2", icon: TrendingUp, color: "green" },
      ]
    },
    subcontractor: {
      title: "Subcontractor Management",
      icon: Users,
      stats: [
        { label: "Active Contractors", value: "56", change: "+4 this week", icon: Users, color: "blue" },
        { label: "Pending Approvals", value: "8", change: "Needs review", icon: AlertCircle, color: "yellow" },
        { label: "Avg. Rating", value: "4.3/5", change: "+0.1", icon: TrendingUp, color: "green" },
      ]
    },
    templates: {
      title: "Template Library",
      icon: Users,
      stats: [
        { label: "Total Templates", value: "84", change: "+12 this month", icon: Users, color: "blue" },
        { label: "Most Used", value: "Onboarding", change: "142 uses", icon: TrendingUp, color: "green" },
        { label: "Downloads", value: "1,247", change: "+156", icon: TrendingUp, color: "purple" },
      ]
    },
    admin: {
      title: "Admin Panel",
      icon: Users,
      stats: [
        { label: "System Health", value: "98%", change: "Optimal", icon: CheckCircle, color: "green" },
        { label: "Active Sessions", value: "42", change: "Current", icon: Activity, color: "blue" },
        { label: "Storage Used", value: "74%", change: "3.2GB free", icon: AlertCircle, color: "yellow" },
      ]
    },
  };

  const content = contentMap[activeTab] || contentMap.home;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <content.icon className={`h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {content.title}
              </h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeTab === 'home' ? 'Welcome back to your dashboard' : `Manage your ${activeTab} activities`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {content.stats.map((stat, index) => (
            <div 
              key={index}
              className={`rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.change}
                </span>
                <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  from last period
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Table */}
        <div className={`rounded-2xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    User
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Action
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Time
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((item) => (
                  <tr key={item} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {['AJ', 'MB', 'SR', 'KT'][item-1]}
                        </div>
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {['Alex Johnson', 'Maria Brown', 'Sam Rivera', 'Kelly Turner'][item-1]}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            {['Admin', 'Employee', 'Client', 'Subcontractor'][item-1]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {['Created new project', 'Updated profile', 'Submitted document', 'Completed task'][item-1]}
                    </td>
                    <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {['2 hours ago', '4 hours ago', 'Yesterday', '2 days ago'][item-1]}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item % 2 === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {item % 2 === 0 ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentArea;