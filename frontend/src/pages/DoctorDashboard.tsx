import { motion } from 'framer-motion';
import { Users, Calendar, Activity, ClipboardList, Clock, ArrowUpRight, Search, Menu, Filter, CheckCircle2, AlertCircle, Droplets, Stethoscope, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/instance';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({ label, value, sub, icon: Icon, color }: any) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    className="glass-dark p-6 relative overflow-hidden group border-transparent hover:border-cyan-500/30"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 -mr-16 -mt-16 group-hover:opacity-10 transition-all ${color}`} />
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-4xl font-black tracking-tight">{value}</p>
        <p className={`text-[10px] font-bold ${color}`}>{sub}</p>
      </div>
      <div className={`p-4 rounded-2xl bg-white/5 shadow-inner ${color}`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
    </div>
  </motion.div>
);

export default function DoctorDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity')
        ]);
        setDashboardData(statsRes.data);
        setRecentReports(activityRes.data);
      } catch (error) {
        console.error("Error fetching doctor dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Network Reports', value: dashboardData?.reports_count || '0', sub: 'Synchronized live', icon: Users, color: 'text-cyan-400' },
    { label: 'Clinical Audits', value: dashboardData?.claims_count || '0', sub: 'High urgency detected', icon: Stethoscope, color: 'text-rose-400' },
    { label: 'Mesh Integrity', value: '99.9%', sub: 'Decentralized Sync', icon: Activity, color: 'text-emerald-400' },
  ];

  const appointments = [
    { name: 'Aarav Mehta', time: '10:30 AM', type: 'Clinical Review', status: 'Confirmed', severity: 'High' },
    { name: 'Sana Khan', time: '11:15 AM', type: 'Lab Analysis', status: 'Pending', severity: 'Moderate' },
    { name: 'Ishaan Verma', time: '12:00 PM', type: 'Routine Checkup', status: 'Confirmed', severity: 'Low' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <ShieldCheck size={14} />
            <span>Medical Professional Node</span>
          </motion.div>
          <h2 className="text-5xl font-extrabold tracking-tight">
            Welcome, <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Dr. {localStorage.getItem("userName") || "Siddharth"}</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">The clinical diagnostic engine is operating at peak physiological fidelity.</p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Connectivity</p>
            <p className="text-teal-600 font-black uppercase text-xs">Synchronized</p>
          </div>
          <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center text-blue-600 shadow-xl shadow-blue-500/10">
            <Activity size={32} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-[var(--bg-card)] h-40 rounded-[2.5rem] animate-pulse border border-[var(--border-main)]" />
          ))
        ) : (
          stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="premium-card p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">{stat.label}</p>
                  <p className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">{stat.value}</p>
                  <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.color} bg-[var(--bg-primary)] border border-[var(--border-main)]`}>
                    <TrendingUp size={12} />
                    <span>{stat.sub}</span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-main)] ${stat.color}`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Main Content: Patient Flow */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-extrabold flex items-center space-x-3 text-slate-800 dark:text-white">
              <Calendar size={20} className="text-blue-600" />
              <span>Diagnostic Pipeline</span>
            </h3>
            <button className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline transition-all">Schedule Master</button>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="bg-[var(--bg-card)] h-24 rounded-2xl animate-pulse" />)
            ) : (
              appointments.map((apt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--bg-card)] p-6 flex items-center justify-between group cursor-pointer border border-[var(--border-main)] rounded-[1.8rem] hover:border-[var(--accent-primary)] hover:shadow-xl transition-all"
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-inner ${apt.severity === 'High' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' :
                      apt.severity === 'Moderate' ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10' :
                        'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'
                      }`}>
                      {apt.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-[var(--text-primary)]">{apt.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">{apt.type} • {apt.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${apt.status === 'Confirmed' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-[var(--border-main)] text-[var(--text-secondary)] bg-[var(--bg-primary)]'
                      }`}>
                      {apt.status}
                    </div>
                    <ArrowUpRight size={22} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Clinical Insights */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-xl font-extrabold flex items-center space-x-3 px-2 text-slate-800 dark:text-white">
            <Sparkles size={20} className="text-blue-600" />
            <span>AI Clinical Insights</span>
          </h3>

          <div className="premium-card p-10 space-y-8 relative overflow-hidden group rounded-[2.5rem] shadow-xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent-primary)]/5 blur-3xl -mr-20 -mt-20 group-hover:bg-[var(--accent-primary)]/10 transition-all" />
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-2xl">
                <Activity size={24} />
              </div>
              <h4 className="font-black uppercase tracking-widest text-sm text-[var(--text-secondary)]">Outbreak Radar</h4>
            </div>
            <p className="text-[15px] font-bold text-[var(--text-primary)] leading-relaxed italic opacity-80">
              "Anomalous surge in Respiratory infections detected within a 5km radius of your clinical node. 7 cases flagged via Symptom Sync in the last 48h."
            </p>
            <button className="w-full py-5 text-[12px] font-black uppercase tracking-[0.2em] bg-[var(--accent-primary)] text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
              Initiate Protocol
            </button>
          </div>

          <div className="premium-card p-8 space-y-6 rounded-[2rem] bg-[var(--bg-primary)]">
            <h4 className="text-[12px] font-black uppercase tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-main)] pb-4 opacity-70">Recent Analytics Stream</h4>
            <div className="space-y-5">
              {recentReports.length > 0 ? (
                recentReports.slice(0, 3).map((report: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                      <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate max-w-[150px]">{report.title}</span>
                    </div>
                    <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">{new Date(report.timestamp * 1000).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-[var(--text-secondary)] font-bold">No recent analytics found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
