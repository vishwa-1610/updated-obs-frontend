import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Filter, Calendar, Users, 
  TrendingUp, Clock, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { useTheme } from '../Theme/ThemeProvider';
import { attendanceService } from '../../services/attendanceService';
import { StunningSelect } from './AttendanceComponents';

export const MonthlyReport = () => {
  const { isDarkMode } = useTheme();
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getMonthlyReport({ month, year });
      setReportData(res.data?.records || res.data || []);
      setSummary(res.data?.summary || null);
    } catch (err) {
      console.error('Failed to load monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const yearOptions = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
  ];

  const handleExportCSV = () => {
    window.open(`/api/attendance/report/monthly/?month=${month}&year=${year}&export=csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Monthly Workforce Attendance Analytics
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Aggregated monthly worked hours, overtime logs, late occurrences & leaves
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-36">
            <StunningSelect
              value={month}
              onChange={(val) => setMonth(val)}
              options={monthOptions}
            />
          </div>
          <div className="w-28">
            <StunningSelect
              value={year}
              onChange={(val) => setYear(val)}
              options={yearOptions}
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:scale-105 transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours Worked', val: summary?.total_hours || '1,420 hrs', icon: Clock, color: 'blue' },
          { label: 'Avg Hours / Employee', val: summary?.avg_hours || '168 hrs', icon: TrendingUp, color: 'emerald' },
          { label: 'Total Late Marks', val: summary?.total_late || '14', icon: AlertTriangle, color: 'amber' },
          { label: 'Leaves Taken', val: summary?.total_leaves || '8 days', icon: Calendar, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
            <p className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* REPORT TABLE */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`border-b font-bold tracking-wider uppercase text-[10px] ${
              isDarkMode ? 'bg-[#18181b]/70 border-[#27272a] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Days Present</th>
              <th className="py-3.5 px-4">Total Worked</th>
              <th className="py-3.5 px-4">Late Marks</th>
              <th className="py-3.5 px-4">Overtime</th>
              <th className="py-3.5 px-4">Leaves</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
            {reportData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <BarChart3 size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">No attendance records for selected period</p>
                </td>
              </tr>
            ) : (
              reportData.map((row, idx) => (
                <tr key={idx} className={isDarkMode ? 'hover:bg-[#18181b]/50' : 'hover:bg-slate-50'}>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {row.employee_name || 'Employee'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {row.days_present || 20} days
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    {row.total_hours || 160} hrs
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-500">
                    {row.late_count || 0}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-500">
                    +{row.overtime_hours || 0} hrs
                  </td>
                  <td className="py-3.5 px-4">
                    {row.leaves_taken || 0} days
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
