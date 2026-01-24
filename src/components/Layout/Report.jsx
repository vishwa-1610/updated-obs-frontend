import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, Download, Search, Loader2, BarChart3, AlertCircle, 
  CheckCircle, History, ArrowUpRight, Shield, Users, Wallet, 
  ChevronRight, X, Activity, LayoutGrid, SortAsc, SortDesc, Heart 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../components/Theme/ThemeProvider';
import { 
  fetchCatalog, 
  fetchHistory, 
  fetchDashboardStats, 
  generateReport, 
  toggleFavorite, 
  clearError, 
  clearSuccess 
} from '../../store/reportSlice';

// --- VISUAL PALETTES ---
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

const ReportsDashboard = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  // --- REDUX STATE ---
  const { 
    catalog, history, stats, 
    loading, error, success, currentReportResult 
  } = useSelector((state) => state.reports);

  // --- LOCAL STATE ---
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [sortOrder, setSortOrder] = useState('ASC');
  const [generatingSlug, setGeneratingSlug] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // ✅ Favorites Filter

  // --- INIT ---
  useEffect(() => {
    dispatch(fetchCatalog());
    dispatch(fetchHistory());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // --- AUTO OPEN PREVIEW ---
  useEffect(() => {
    if (success) {
        dispatch(fetchHistory()); 
        dispatch(fetchDashboardStats());
        if (currentReportResult?.data) setShowPreview(true);
        setGeneratingSlug(null);
        setTimeout(() => dispatch(clearSuccess()), 4000);
    }
  }, [success, currentReportResult, dispatch]);

  useEffect(() => { if (error) setGeneratingSlug(null); }, [error]);

  const handleGenerate = (slug) => {
    setGeneratingSlug(slug);
    dispatch(generateReport({ slug }));
  };

  // --- FILTERING & SORTING ---
  const categories = ['ALL', ...new Set(catalog.map(item => item.category))];
  
  const filteredReports = catalog
    .filter(report => {
      const matchesCategory = selectedCategory === 'ALL' || report.category === selectedCategory;
      const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // ✅ FIXED: Filter logic for Favorites
      if (showFavoritesOnly && !report.is_favorite) {
          return false;
      }
      
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'ASC') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

  const getIcon = (cat) => {
    if (cat.includes('PAYROLL')) return <Wallet size={20} />;
    if (cat.includes('SECURITY')) return <Shield size={20} />;
    if (cat.includes('HR')) return <Users size={20} />;
    return <FileText size={20} />;
  };

  // Safe Data
  const pieData = stats?.category_breakdown?.length > 0 ? stats.category_breakdown : [{name: 'No Data', value: 1}];
  const topReportsData = stats?.top_reports_data || [];

  return (
    <div className={`min-h-screen p-6 md:p-10 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0b0c15] text-gray-100' : 'bg-[#f8f9fc] text-gray-900'}`}>
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
             <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                <BarChart3 size={28} />
             </div>
             Compliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Center</span>
          </h1>
          <p className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Live regulatory reporting & analytics engine.
          </p>
        </div>

        <div className={`flex p-1.5 rounded-2xl ${isDarkMode ? 'bg-[#1a1d26]' : 'bg-white shadow-sm ring-1 ring-gray-100'}`}>
          {['DASHBOARD', 'CATALOG', 'HISTORY'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- ALERTS --- */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3">
             <AlertCircle size={20} /> <span className="font-semibold">{error}</span>
             <button onClick={() => dispatch(clearError())} className="ml-auto underline text-xs">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VIEW: DASHBOARD --- */}
      {activeTab === 'DASHBOARD' && (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
          
          {/* 1. KEY METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="Total Reports" 
              value={stats.total_generated || 0} 
              icon={<FileText className="text-white" />} 
              gradient="from-blue-500 to-cyan-500"
              trend={`+${stats.generated_today || 0} Today`}
              isDarkMode={isDarkMode}
            />
            <StatsCard 
              title="Top Report" 
              value={stats.most_popular || 'N/A'} 
              icon={<Activity className="text-white" />} 
              gradient="from-purple-500 to-pink-500"
              trend={`${stats.most_popular_count || 0} Runs`}
              isDarkMode={isDarkMode}
              isText
            />
            <StatsCard 
              title="Unique Reports Used" 
              value={`${stats.unique_reports_run || 0} / ${stats.total_definitions || 0}`} 
              icon={<LayoutGrid className="text-white" />} 
              gradient="from-emerald-500 to-teal-500"
              trend="Usage Coverage"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* 2. ANALYTICS ROW */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* AREA CHART: TREND */}
            <div className={`col-span-2 p-8 rounded-[2rem] flex flex-col ${isDarkMode ? 'bg-[#151720]' : 'bg-white shadow-xl shadow-gray-200/50'}`}>
              <h3 className="text-lg font-bold mb-6">Activity Trend <span className="text-xs font-normal text-gray-400 ml-2">(Last 7 Days)</span></h3>
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chart_data}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, dy: 10}} />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', border: 'none', 
                            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                            color: isDarkMode ? '#fff' : '#000',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                        }}
                    />
                    <Area type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BAR CHART: TOP 5 */}
            <div className={`p-8 rounded-[2rem] flex flex-col ${isDarkMode ? 'bg-[#151720]' : 'bg-white shadow-xl shadow-gray-200/50'}`}>
               <h3 className="text-lg font-bold mb-6">Top 5 Reports</h3>
               <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topReportsData} margin={{ left: 0, right: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#9ca3af'}} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ 
                            borderRadius: '12px', border: 'none', 
                            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                            color: isDarkMode ? '#fff' : '#000'
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* PIE CHART */}
            <div className={`p-8 rounded-[2rem] flex flex-col items-center justify-center relative ${isDarkMode ? 'bg-[#151720]' : 'bg-white shadow-xl shadow-gray-200/50'}`}>
               <h3 className="absolute top-8 left-8 text-lg font-bold">Categories</h3>
               <div className="w-full h-[200px] mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', border: 'none', 
                            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                            color: isDarkMode ? '#fff' : '#000'
                        }}
                      />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="flex gap-2 justify-center w-full flex-wrap">
                  {pieData.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500">
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: PIE_COLORS[i]}}></span>
                        {d.name.split(' ')[0]}
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* 3. RECENT ACTIVITY TABLE */}
          <div className={`rounded-[2rem] overflow-hidden ${isDarkMode ? 'bg-[#151720]' : 'bg-white shadow-xl shadow-gray-200/50'}`}>
              <div className={`px-8 py-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-gray-50'}`}>
                 <h3 className="text-lg font-bold flex items-center gap-2"><History size={18}/> Recent Activity</h3>
                 <button onClick={() => setActiveTab('HISTORY')} className="text-xs font-bold text-blue-500 hover:underline">View All</button>
              </div>
              <table className="w-full text-left">
                <thead className={`text-xs uppercase font-bold tracking-wider ${isDarkMode ? 'bg-black/20 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                   <tr>
                      <th className="px-8 py-5">Report</th>
                      <th className="px-8 py-5">Generated By</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5 text-right">Status</th>
                   </tr>
                </thead>
                <tbody className={`divide-y text-sm font-medium ${isDarkMode ? 'divide-white/5 text-gray-300' : 'divide-gray-100 text-gray-600'}`}>
                   {history.slice(0, 5).map(item => (
                      <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-blue-50/30'}`}>
                         <td className="px-8 py-5 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50 text-blue-600'}`}><FileText size={14}/></div>
                            {item.report_name}
                         </td>
                         <td className="px-8 py-5">{item.requested_by_name || 'System Admin'}</td>
                         <td className="px-8 py-5 opacity-70">{new Date(item.created_at).toLocaleDateString()}</td>
                         <td className="px-8 py-5 text-right">
                            <span className="px-3 py-1 rounded-full text-[10px] bg-green-500/10 text-green-500 font-bold">COMPLETED</span>
                         </td>
                      </tr>
                   ))}
                </tbody>
              </table>
          </div>

        </motion.div>
      )}

      {/* --- VIEW: CATALOG (HEART & ANIMATION FIX) --- */}
      {activeTab === 'CATALOG' && (
        <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} transition={{duration:0.3}}>
          
          {/* FILTER BAR */}
          <div className={`sticky top-4 z-20 mb-8 p-2 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-4 backdrop-blur-xl border ${
            isDarkMode ? 'bg-[#1a1d26]/80 border-white/5' : 'bg-white/80 border-white/40 shadow-xl shadow-blue-900/5'
          }`}>
            <div className="flex flex-wrap gap-2 px-2 justify-center xl:justify-start">
              
              {/* ✅ FAVORITES FILTER BUTTON */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                   showFavoritesOnly
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-2 ring-rose-500/20'
                      : (isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-rose-400 border border-transparent' : 'bg-white text-gray-500 hover:text-rose-500 border border-gray-200')
                }`}
              >
                 <Heart size={14} fill={showFavoritesOnly ? "currentColor" : "none"} className={showFavoritesOnly ? "animate-pulse" : ""} /> 
                 Favorites
              </button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2 self-center hidden md:block"></div>

              {/* Categories */}
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : (isDarkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100')
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full xl:w-auto px-2">
               <div className="relative group flex-1 xl:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" placeholder="Search catalog..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all ${
                      isDarkMode ? 'bg-black/20 focus:bg-black/40 text-white' : 'bg-gray-50 focus:bg-white text-gray-900 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
               </div>
               <button onClick={() => setSortOrder(p => p === 'ASC' ? 'DESC' : 'ASC')} className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${isDarkMode ? 'bg-black/20 hover:bg-black/40' : 'bg-gray-50 hover:bg-gray-100'}`}>
                 {sortOrder === 'ASC' ? <SortAsc size={18}/> : <SortDesc size={18}/>}
               </button>
            </div>
          </div>

          {/* GRID */}
          {loading ? (
             <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-500 h-12 w-12"/></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              <AnimatePresence>
                {filteredReports.map((report) => (
                    <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={report.id} 
                    className={`group relative p-6 rounded-[2rem] transition-all duration-300 hover:-translate-y-2 ${isDarkMode ? 'bg-[#151720] hover:bg-[#1a1d26]' : 'bg-white shadow-lg shadow-gray-200/40 hover:shadow-2xl hover:shadow-blue-500/10'}`}
                    >
                    
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-br shadow-inner ${isDarkMode ? 'from-gray-800 to-gray-900 text-gray-300' : 'from-blue-50 to-indigo-50 text-blue-600'}`}>
                            {getIcon(report.category)}
                        </div>
                        
                        <div className="flex gap-2">
                            {/* ✅ HEART BUTTON (Stunning Animation) */}
                            <motion.button 
                                whileTap={{ scale: 0.7 }}
                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    dispatch(toggleFavorite(report.slug)); 
                                }}
                                className={`p-2.5 rounded-full transition-all duration-300 shadow-sm ${
                                    report.is_favorite 
                                        ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                                        : (isDarkMode ? 'bg-gray-800 text-gray-600 hover:text-rose-400' : 'bg-gray-50 text-gray-300 hover:text-rose-400')
                                }`}
                            >
                                <Heart 
                                    size={18} 
                                    fill={report.is_favorite ? "currentColor" : "none"} 
                                    strokeWidth={report.is_favorite ? 0 : 2}
                                />
                            </motion.button>

                            <button 
                                onClick={() => handleGenerate(report.slug)} 
                                disabled={generatingSlug !== null} 
                                className={`p-2.5 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white' : 'bg-gray-50 hover:bg-blue-600 text-gray-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30'}`}
                            >
                                {generatingSlug === report.slug ? <Loader2 className="animate-spin h-4 w-4 text-blue-500 group-hover:text-white"/> : <ArrowUpRight size={18} />}
                            </button>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2 group-hover:text-blue-500 transition-colors">{report.name}</h3>
                    <p className={`text-xs leading-relaxed h-10 line-clamp-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{report.description || "Standard compliance report."}</p>
                    
                    <div className={`mt-6 pt-4 border-t flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-gray-50'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{report.category.split('_')[0]}</span>
                    </div>
                    </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Empty State for Favorites */}
              {filteredReports.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                      <Heart size={48} className="text-gray-300 mb-4" />
                      <p>No reports found.</p>
                  </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* --- VIEW: HISTORY --- */}
      {activeTab === 'HISTORY' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className={`rounded-[2rem] overflow-hidden ${isDarkMode ? 'bg-[#151720]' : 'bg-white shadow-xl shadow-gray-200/50'}`}>
            <table className="w-full text-left">
              <thead className={`text-xs uppercase font-bold tracking-wider ${isDarkMode ? 'bg-black/20 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                 <tr><th className="px-8 py-5">Report</th><th className="px-8 py-5">Generated By</th><th className="px-8 py-5">Date</th><th className="px-8 py-5 text-right">Action</th></tr>
              </thead>
              <tbody className={`divide-y text-sm font-medium ${isDarkMode ? 'divide-white/5 text-gray-300' : 'divide-gray-100 text-gray-600'}`}>
                 {history.map(item => (
                    <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-blue-50/30'}`}>
                       <td className="px-8 py-5 flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50 text-blue-600'}`}><FileText size={14}/></div>
                          {item.report_name}
                       </td>
                       <td className="px-8 py-5">{item.requested_by_name || 'System Admin'}</td>
                       <td className="px-8 py-5 opacity-70">{new Date(item.created_at).toLocaleDateString()}</td>
                       <td className="px-8 py-5 text-right">
                          <a href={item.file_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 font-bold text-xs inline-flex items-center gap-1"><Download size={12}/> Download</a>
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>
        </motion.div>
      )}

      {/* --- PREVIEW SLIDE-UP --- */}
      <AnimatePresence>
        {showPreview && currentReportResult?.data && (
           <motion.div 
             initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className={`fixed inset-x-0 bottom-0 top-32 z-50 rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#1a1d26] border-t border-white/10' : 'bg-white border-t border-blue-100'}`}
           >
              <div className={`px-10 py-6 flex justify-between items-center ${isDarkMode ? 'bg-[#151720]' : 'bg-white border-b border-gray-100'}`}>
                 <div>
                    <h2 className="text-xl font-bold flex items-center gap-2"><div className="p-1 rounded-full bg-green-500/20"><CheckCircle className="text-green-500" size={20}/></div>{currentReportResult.report_name}</h2>
                    <p className="text-xs text-gray-500 mt-1 ml-9">{currentReportResult.data.length} Records Found</p>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => window.open(currentReportResult.download_url, '_blank')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2"><Download size={16}/> Export CSV</button>
                    <button onClick={() => setShowPreview(false)} className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}><X size={20}/></button>
                 </div>
              </div>
              <div className="flex-1 overflow-auto p-0 bg-opacity-50 custom-scrollbar">
                 <table className="w-full text-left">
                    <thead className={`text-xs uppercase sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-[#151720]/90 text-gray-500' : 'bg-white/90 text-gray-400'}`}>
                       <tr>{Object.keys(currentReportResult.data[0] || {}).map(k => <th key={k} className="px-10 py-4 font-semibold">{k.replace(/_/g, ' ')}</th>)}</tr>
                    </thead>
                    <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-white/5 text-gray-300' : 'divide-gray-50 text-gray-600'}`}>
                       {currentReportResult.data.map((row, i) => (
                          <tr key={i} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-blue-50/30'}`}>{Object.values(row).map((val, j) => <td key={j} className="px-10 py-4">{val}</td>)}</tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatsCard = ({ title, value, icon, gradient, trend, isDarkMode, isText }) => (
  <div className={`relative overflow-hidden p-8 rounded-[2rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${isDarkMode ? 'bg-[#151720]' : 'bg-white shadow-xl shadow-gray-200/50'}`}>
    <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${gradient}`}></div>
    <div className="flex justify-between items-start mb-6 relative z-10">
       <div className={`p-4 rounded-2xl bg-gradient-to-br shadow-lg ${gradient}`}>{icon}</div>
       <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{trend}</span>
    </div>
    <div className="relative z-10">
       <h3 className={`font-black tracking-tight mb-1 ${isText ? 'text-xl leading-tight' : 'text-4xl'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
       <p className={`text-xs font-bold uppercase tracking-widest opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
    </div>
  </div>
);

export default ReportsDashboard;