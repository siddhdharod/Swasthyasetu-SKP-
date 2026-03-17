import { motion } from 'framer-motion';
import { Activity, Shield, FileText, Upload, Plus, ArrowUpRight, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import Skeleton from '../components/ui/Skeleton';
import { useState, useEffect } from 'react';
import api from '../api/instance';

const Widget = ({ children, className = "" }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -5 }}
    className={`premium-card p-6 relative overflow-hidden group ${className}`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--accent-primary)]/10 transition-colors" />
    {children}
  </motion.div>
);

export default function Dashboard() {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity')
        ]);
        setDashboardData(statsRes.data);
        setActivities(activityRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Health Score', value: dashboardData?.health_score || '0', sub: '+0% improvement', icon: Activity, color: theme === 'dark' ? 'text-cyan-400' : 'text-emerald-500' },
    { label: 'Reports Filed', value: dashboardData?.reports_count || '0', sub: 'Updated live', icon: FileText, color: theme === 'dark' ? 'text-violet-400' : 'text-blue-500' },
    { label: 'Claim Status', value: dashboardData?.status || 'Active', sub: 'AI Audited', icon: Shield, color: 'text-purple-500' },
  ];

  const userName = localStorage.getItem("userName") || "User";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            Welcome back, <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>{userName}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's a quick look at your health ecosystem today.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/5 dark:bg-black/20 rounded-full px-4 py-2 border border-white/10">
          <Clock size={14} className="text-primary-light" />
          <span>Last Sync: {loading ? "Syncing..." : "2 mins ago"}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="glass-light dark:glass-dark p-6 h-32 flex flex-col justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <Widget key={i}>
              <div className="flex items-start justify-between">
                <div className="space-y-2 text-left">
                  <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">{stat.label}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-extrabold text-[var(--text-primary)]">{stat.value}</p>
                    {stat.label === 'Health Score' && <span className="text-base font-bold text-[var(--text-secondary)]">%</span>}
                  </div>
                  <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${stat.color} bg-[var(--bg-primary)] px-3 py-1 rounded-full w-fit border border-[var(--border-main)] shadow-sm`}>
                     <TrendingUp size={12} className="mr-1.5" />
                     {stat.sub}
                  </div>
                </div>
                <div className={`p-4 rounded-[1.5rem] bg-[var(--bg-primary)] border border-[var(--border-main)] shadow-inner ${stat.color}`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
              </div>
            </Widget>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center space-x-2 text-slate-800 dark:text-white">
              <FileText size={20} className="text-blue-600" />
              <span>Diagnostic Timeline</span>
            </h3>
            <Link to="/reports" className="text-sm font-bold text-blue-600 flex items-center hover:underline transition-all">
              Detailed Vault <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="glass-light dark:glass-dark p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              ))
            ) : activities.length > 0 ? (
              activities.map((activity, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 flex items-center justify-between group hover:border-[var(--accent-primary)] hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer rounded-2xl transition-all"
                >
                  <div className="flex items-center space-x-5">
                    <div className="p-4 bg-[var(--bg-primary)] text-[var(--accent-primary)] rounded-2xl group-hover:scale-110 transition-all shadow-inner border border-[var(--border-main)]">
                      <FileText size={22} />
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-lg text-[var(--text-primary)]">{activity.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">{activity.description} • {new Date(activity.timestamp * 1000).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:block px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {activity.status}
                    </div>
                    <ChevronRight size={22} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-12 rounded-2xl text-center">
                <p className="text-[var(--text-secondary)] font-bold">No activity history yet.</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Upload a report or run a claim audit to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2 text-slate-800 dark:text-white">
            <Plus size={20} className="text-teal-600" />
            <span>Clinic Actions</span>
          </h3>
          <div className="space-y-4">
            <Link to="/upload" className="block">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center space-x-4 hover:border-blue-500/50 hover:shadow-lg transition-all group">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Upload size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Vault Upload</p>
                  <p className="text-xs text-slate-500 font-medium">Capture Medical Data</p>
                </div>
              </div>
            </Link>
            
            <Link to="/claims" className="block">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center space-x-4 hover:border-blue-500/50 hover:shadow-lg transition-all group">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Shield size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Clinical Audit</p>
                  <p className="text-xs text-slate-500 font-medium">Verify Documents</p>
                </div>
              </div>
            </Link>

            <Link to="/profile" className="block">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center space-x-4 hover:border-red-500/50 hover:shadow-lg transition-all group">
                <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Emergency ID</p>
                  <p className="text-xs text-slate-500 font-medium">Critical Access</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const ChevronRight = ({ className, size }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
