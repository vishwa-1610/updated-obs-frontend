import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, ArrowRight, Activity, Zap, TrendingUp, PieChart, 
  BarChart2, Clock, AlertCircle, Calendar as CalendarIcon, 
  CheckCircle2, Loader2, Send, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

// Import Actions
import { fetchClients } from '../../store/clientSlice';
import { fetchEmployees } from '../../store/employeeSlice';
import { fetchSubcontractors } from '../../store/subcontractorSlice';
import { fetchOnboardings, remindOnboarding } from '../../store/onboardingSlice'; 
import { fetchTemplates } from '../../store/templateSlice';

// --- 1. SKELETON LOADER ---
const DashboardSkeleton = ({ isDarkMode }) => {
  const shimmer = isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200';
  return (
    <div className="animate-pulse space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-3"><div className={`h-10 w-64 rounded-xl ${shimmer}`}></div></div>
        <div className={`h-12 w-48 rounded-xl ${shimmer}`}></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className={`h-48 rounded-3xl ${shimmer}`}></div>)}
      </div>
      <div className={`h-[400px] rounded-3xl ${shimmer}`}></div>
    </div>
  );
};

// --- 2. CHARTS (Donut & Bar) ---
const AnimatedDonutChart = ({ data, size = 180, thickness = 20, isDarkMode }) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) return (
    <div className="flex flex-col items-center justify-center h-full opacity-50">
       <div className={`w-32 h-32 rounded-full border-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}></div>
       <span className="text-xs mt-4">No Data</span>
    </div>
  );

  return (
    <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{total}</span>
        <span className={`text-[10px] uppercase font-bold tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Total</span>
      </div>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xl">
        {data.map((item, index) => {
          const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedOffset;
          accumulatedOffset += (item.value / total) * circumference;
          return (
            <circle
              key={index} cx={size / 2} cy={size / 2} r={radius}
              fill="transparent" stroke={item.color} strokeWidth={thickness}
              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out hover:opacity-90"
            />
          );
        })}
      </svg>
    </div>
  );
};

const SimpleBarChart = ({ data, isDarkMode }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    if (data.length === 0) return <div className="w-full h-48 flex items-center justify-center opacity-40 text-sm">No analytics available</div>;
    return (
        <div className="flex items-end justify-between space-x-4 h-48 w-full px-2">
            {data.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-end h-full flex-1 group">
                    <div className="relative w-full flex justify-end flex-col items-center h-full">
                        <div className={`absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold py-1 px-2 rounded mb-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}`}>{item.value}</div>
                        <div style={{ height: `${(item.value / maxVal) * 100}%`, backgroundColor: item.color }} className="w-full max-w-[40px] rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-500"></div>
                    </div>
                    <span className={`text-[10px] font-semibold mt-3 text-center truncate w-full ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.name}</span>
                </div>
            ))}
        </div>
    );
};

// --- 3. STAT CARD ---
const StatCard = ({ title, value, icon: Icon, color, gradient, isDarkMode, navigate, link, subtext }) => (
  <div onClick={() => navigate(link)} className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? 'bg-[#111827] border border-gray-800 hover:border-gray-700' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50'}`}>
    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 blur-2xl transition-all duration-500`}></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-${color}-500/20 transform group-hover:scale-110 transition-transform duration-300`}><Icon size={24} /></div>
        <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-slate-100 text-slate-500'}`}><ArrowRight size={12} className="mr-1 group-hover:translate-x-1 transition-transform" /> View</div>
      </div>
      <h3 className={`text-4xl font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{value}</h3>
      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>{title}</p>
      {subtext && <p className={`text-xs mt-3 font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{subtext}</p>}
    </div>
  </div>
);

// --- 4. CALENDAR COMPONENTS ---
const CalendarModal = ({ isOpen, onClose, date, events, isDarkMode }) => {
    if (!isOpen || !date) return null;

    const initiated = events?.initiated || [];
    const completed = events?.completed || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#111827] border border-gray-700' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Activity Report</p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Initiated Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Initiated ({initiated.length})</h3>
                        </div>
                        {initiated.length > 0 ? (
                            <div className="space-y-2">
                                {initiated.map((item) => (
                                    <div key={item.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                                        <div>
                                            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.first_name} {item.last_name}</p>
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.client_name}</p>
                                        </div>
                                        <span className="text-[10px] font-mono opacity-70">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs italic opacity-50 ml-4">No onboardings initiated.</p>
                        )}
                    </div>

                    {/* Completed Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completed ({completed.length})</h3>
                        </div>
                        {completed.length > 0 ? (
                            <div className="space-y-2">
                                {completed.map((item) => (
                                    <div key={item.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-emerald-50 border-emerald-100'}`}>
                                        <div>
                                            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.first_name} {item.last_name}</p>
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.job_title}</p>
                                        </div>
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs italic opacity-50 ml-4">No onboardings completed.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN HOME COMPONENT ---
const Home = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sendingReminderId, setSendingReminderId] = useState(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const { clients = [] } = useSelector((state) => state.client);
  const { employees = [] } = useSelector((state) => state.employee);
  const { onboardings = [] } = useSelector((state) => state.onboarding);

useEffect(() => {
    const loadData = async () => {
      
      // --- 1. SAFETY CHECK: Are we on the Main Landing Page? ---
      const hostname = window.location.hostname;
      // Add 'localhost' to this list ONLY if you are testing the Landing Page locally.
      const mainDomains = ['obs.tiswatech.com', 'www.obs.tiswatech.com', 'tiswatech.com'];

      if (mainDomains.includes(hostname)) {
          console.log("Main Domain Detected: Skipping Dashboard Data Fetch.");
          setIsLoading(false); // Stop the loading skeleton immediately
          return; // <--- STOP HERE. Do not call the APIs.
      }

      // --- 2. TENANT MODE: Fetch Data ---
      setIsLoading(true);
      try {
        await Promise.all([
          dispatch(fetchClients({})),
          dispatch(fetchEmployees({})),
          dispatch(fetchSubcontractors({})),
          dispatch(fetchOnboardings({})),
          dispatch(fetchTemplates({}))
        ]);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    loadData();
  }, [dispatch]);

  const handleSendReminder = async (e, id) => {
    e.stopPropagation();
    setSendingReminderId(id);
    try { await dispatch(remindOnboarding(id)).unwrap(); } 
    catch (error) { console.error(error); } 
    finally { setSendingReminderId(null); }
  };

  // --- ANALYTICS & CALENDAR DATA PROCESSING ---
  const analytics = useMemo(() => {
    // 1. Status Counts
    const confirmed = onboardings.filter(o => ['Confirmed', 'COMPLETED'].includes(o.status)).length;
    // Include IN_PROGRESS in active stats
    const inProgress = onboardings.filter(o => ['IN_PROGRESS', 'In Progress'].includes(o.status)).length;
    const pending = onboardings.filter(o => ['Pending', 'PENDING', 'False', false].includes(o.status)).length;
    const totalPending = pending + inProgress;
    const rejected = onboardings.length - (confirmed + totalPending);

    // 2. Calendar Event Mapping
    const eventsByDate = {};
    
    onboardings.forEach(o => {
        // Map Initiated
        const initDate = new Date(o.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (!eventsByDate[initDate]) eventsByDate[initDate] = { initiated: [], completed: [] };
        eventsByDate[initDate].initiated.push(o);

        // Map Completed (Only if confirmed)
        if (['Confirmed', 'COMPLETED'].includes(o.status)) {
            const compDate = o.updated_at ? new Date(o.updated_at).toLocaleDateString('en-CA') : initDate;
            if (!eventsByDate[compDate]) eventsByDate[compDate] = { initiated: [], completed: [] };
            eventsByDate[compDate].completed.push(o);
        }
    });

    // 3. Industry Data
    const industryMap = clients.reduce((acc, curr) => {
        const ind = curr.industry || 'Unknown';
        acc[ind] = (acc[ind] || 0) + 1;
        return acc;
    }, {});
    
    const industryChartData = Object.entries(industryMap)
        .sort(([,a], [,b]) => b - a).slice(0, 5)
        .map(([name, value], i) => ({ name, value, color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][i % 5] }));

    // 4. Activity Feed
    const activities = [
        ...clients.map(c => ({ type: 'client', name: c.client_name, date: new Date(c.created_at), status: 'New Client' })),
        ...onboardings.map(o => ({ 
            type: 'onboarding', 
            name: `${o.first_name} ${o.last_name}`, 
            date: new Date(o.created_at), 
            status: o.status === 'COMPLETED' ? 'Completed' : (o.status === 'IN_PROGRESS' ? 'In Progress' : 'Initiated') 
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);

    return {
        onboardingStats: [
            { name: 'Completed', value: confirmed, color: '#10B981' },
            { name: 'In Progress', value: inProgress, color: '#3B82F6' }, // Added Blue for In Progress
            { name: 'Pending', value: pending, color: '#F59E0B' },
            { name: 'Rejected', value: rejected > 0 ? rejected : 0, color: '#EF4444' }
        ],
        industryData: industryChartData,
        recentActivity: activities,
        eventsByDate, // Export for calendar
        conversionRate: onboardings.length ? Math.round((confirmed / onboardings.length) * 100) : 0,
        avgOnboardingDays: 5
    };
  }, [clients, onboardings]);

  // --- CALENDAR HELPERS ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const { days, firstDay, year, month } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const handleDateClick = (day) => {
    const dateStr = new Date(year, month, day).toLocaleDateString('en-CA'); // Local string match
    // Check if any events exist for this date
    if (analytics.eventsByDate[dateStr]) {
        setSelectedDate(new Date(year, month, day));
        setIsCalendarModalOpen(true);
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  if (isLoading) return <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-slate-50'}`}><DashboardSkeleton isDarkMode={isDarkMode} /></div>;

  const glassClass = `rounded-3xl p-8 border ${isDarkMode ? 'bg-[#111827]/80 backdrop-blur-xl border-gray-800' : 'bg-white/80 backdrop-blur-xl border-white/60 shadow-lg shadow-slate-200/50'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen p-6 md:p-10 transition-colors duration-500 font-sans ${isDarkMode ? 'bg-[#0B1120] text-gray-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <div><p className={`text-lg ${textSub}`}>Operational overview & real-time metrics.</p></div>
          <div className={`flex items-center px-5 py-2.5 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-slate-200 text-slate-600'} shadow-sm`}>
             <Clock size={18} className="mr-2.5 text-blue-500" />
             <span className="text-sm font-bold font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* 1. KEY METRICS (Added In Progress Context) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Clients" value={clients.length} icon={Briefcase} color="blue" gradient="from-blue-500 to-cyan-400" isDarkMode={isDarkMode} navigate={navigate} link="/clients" subtext="Active accounts" />
            <StatCard title="Total Employees" value={employees.length} icon={Users} color="violet" gradient="from-violet-500 to-fuchsia-400" isDarkMode={isDarkMode} navigate={navigate} link="/employees" subtext="Across all departments" />
            <StatCard title="Pipeline" value={onboardings.length} icon={Zap} color="amber" gradient="from-amber-400 to-orange-500" isDarkMode={isDarkMode} navigate={navigate} link="/onboarding" subtext={`${analytics.onboardingStats[1].value} In Progress`} />
            <StatCard title="Completion Rate" value={`${analytics.conversionRate}%`} icon={TrendingUp} color="emerald" gradient="from-emerald-400 to-teal-500" isDarkMode={isDarkMode} navigate={navigate} link="/onboarding" subtext="From invite to confirmed" />
        </div>

        {/* 2. ANALYTICS & CALENDAR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* DONUT CHART */}
            <div className={`${glassClass} flex flex-col justify-between min-h-[400px]`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className={`text-xl font-bold ${textMain}`}>Pipeline Health</h3>
                        <p className={`text-xs ${textSub}`}>Status distribution</p>
                    </div>
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}><PieChart size={20}/></div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnimatedDonutChart data={analytics.onboardingStats} isDarkMode={isDarkMode} />
                    <div className="grid grid-cols-2 gap-3 w-full mt-8">
                        {analytics.onboardingStats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-500/5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                                <div className="text-left">
                                    <div className={`text-sm font-bold ${textMain}`}>{stat.value}</div>
                                    <div className={`text-[10px] uppercase ${textSub}`}>{stat.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CUSTOM CALENDAR --- */}
            <div className={`${glassClass} lg:col-span-2 flex flex-col`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className={`text-xl font-bold ${textMain}`}>Onboarding Calendar</h3>
                        <p className={`text-xs ${textSub}`}>Initiated & Completed Dates</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeMonth(-1)} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><ChevronLeft size={18}/></button>
                        <span className={`text-sm font-bold min-w-[100px] text-center ${textMain}`}>{monthName} {year}</span>
                        <button onClick={() => changeMonth(1)} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><ChevronRight size={18}/></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 flex-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className={`text-center text-[10px] uppercase font-bold py-2 ${textSub}`}>{d}</div>
                    ))}
                    {/* Empty cells for padding */}
                    {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
                    
                    {/* Days */}
                    {[...Array(days)].map((_, i) => {
                        const day = i + 1;
                        const dateStr = new Date(year, month, day).toLocaleDateString('en-CA');
                        const data = analytics.eventsByDate[dateStr];
                        const hasInit = data?.initiated?.length > 0;
                        const hasComp = data?.completed?.length > 0;
                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                        return (
                            <div 
                                key={day} 
                                onClick={() => handleDateClick(day)}
                                className={`
                                    relative h-14 rounded-xl border flex flex-col items-center justify-start pt-2 transition-all cursor-pointer
                                    ${isDarkMode ? 'border-gray-800 bg-gray-900/30 hover:bg-gray-800' : 'border-slate-100 bg-slate-50 hover:bg-white hover:shadow'}
                                    ${(hasInit || hasComp) ? 'ring-1 ring-blue-500/20' : ''}
                                `}
                            >
                                <span className={`text-xs font-medium ${isToday ? 'bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-full' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                    {day}
                                </span>
                                
                                {/* Dots for events */}
                                <div className="flex gap-1 mt-auto mb-2">
                                    {hasInit && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Initiated"></div>}
                                    {hasComp && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Completed"></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* 3. LISTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending & In Progress Tasks */}
            <div className={glassClass}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-600'}`}><Activity size={20} /></div>
                    <div>
                        <h3 className={`text-lg font-bold ${textMain}`}>Action Required</h3>
                        <p className={`text-xs ${textSub}`}>Pending & In Progress</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {/* Include IN_PROGRESS in the filter */}
                    {onboardings.filter(o => ['Pending', 'PENDING', 'IN_PROGRESS', 'In Progress'].includes(o.status)).slice(0, 4).map((item) => (
                        <div key={item.id} onClick={() => navigate('/onboarding')} className={`cursor-pointer group flex items-center justify-between p-4 rounded-2xl border transition-all hover:translate-x-1 ${isDarkMode ? 'bg-gray-800/40 border-gray-700 hover:bg-gray-800' : 'bg-white border-slate-100 hover:shadow-md'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-xs font-bold bg-white/5 ${item.status === 'IN_PROGRESS' ? 'border-blue-500/30 text-blue-500' : 'border-amber-500/30 text-amber-500'}`}>
                                    {item.status === 'IN_PROGRESS' ? <Loader2 size={16} className="animate-spin"/> : <AlertCircle size={16} />}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${textMain}`}>{item.first_name} {item.last_name}</p>
                                    <p className={`text-xs ${textSub}`}>{item.status === 'IN_PROGRESS' ? 'Forms in progress' : 'Invite Sent'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => handleSendReminder(e, item.id)} disabled={sendingReminderId === item.id} className={`p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-blue-600 text-gray-300' : 'bg-gray-100 hover:bg-blue-500 text-gray-500 hover:text-white'}`}>
                                    {sendingReminderId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    {onboardings.filter(o => ['Pending', 'PENDING', 'IN_PROGRESS'].includes(o.status)).length === 0 && (
                        <div className="py-8 text-center opacity-50 text-sm">You're all caught up!</div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className={glassClass}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-100 text-blue-600'}`}><Clock size={20} /></div>
                    <div>
                        <h3 className={`text-lg font-bold ${textMain}`}>Recent Activity</h3>
                        <p className={`text-xs ${textSub}`}>System timeline</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {analytics.recentActivity.map((activity, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'client' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                                {i !== analytics.recentActivity.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>}
                            </div>
                            <div className={`flex-1 p-3 rounded-xl border mb-1 ${isDarkMode ? 'bg-gray-900/30 border-gray-800' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                         <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${activity.name}`} alt="av" className="w-6 h-6 rounded-full border border-gray-500/20"/>
                                         <p className={`text-sm font-bold ${textMain}`}>{activity.name}</p>
                                    </div>
                                    <span className={`text-[10px] font-mono opacity-60 ${textSub}`}>{activity.date.toLocaleDateString()}</span>
                                </div>
                                <p className={`text-xs mt-1 ml-8 ${textSub}`}>{activity.status} <span className="lowercase">{activity.type}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* MODAL FOR CALENDAR */}
        <CalendarModal 
            isOpen={isCalendarModalOpen} 
            onClose={() => setIsCalendarModalOpen(false)} 
            date={selectedDate} 
            events={selectedDate ? analytics.eventsByDate[selectedDate.toLocaleDateString('en-CA')] : null} 
            isDarkMode={isDarkMode} 
        />

      </div>
    </div>
  );
};

export default Home;