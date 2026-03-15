import { motion } from 'framer-motion';
import { Activity, Shield, FileText, Upload, Plus, ArrowUpRight, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const Widget = ({ children, className = "" }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -5 }}
    className={`glass-light dark:glass-dark p-6 relative overflow-hidden group ${className}`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-gradient/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary-gradient/10 transition-colors" />
    {children}
  </motion.div>
);

export default function Dashboard() {
  const { theme } = useTheme();

  const stats = [
    { label: 'Health Score', value: '92', sub: '+3% improvement', icon: Activity, color: theme === 'dark' ? 'text-cyan-400' : 'text-emerald-500' },
    { label: 'Reports Filed', value: '14', sub: '2 pending review', icon: FileText, color: theme === 'dark' ? 'text-violet-400' : 'text-blue-500' },
    { label: 'Claim Status', value: 'Secured', sub: 'AI Verified', icon: Shield, color: 'text-purple-500' },
  ];

  const recentReports = [
    { title: 'Annual Blood Work', date: 'Mar 12, 2024', type: 'Lab Report', status: 'Verified' },
    { title: 'Dental Screening', date: 'Feb 28, 2024', type: 'Checkup', status: 'Archived' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            Welcome back, <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Siddharth</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's a quick look at your health ecosystem today.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 bg-white/5 dark:bg-black/20 rounded-full px-4 py-2 border border-white/10">
          <Clock size={14} className="text-primary-light" />
          <span>Last Sync: 2 mins ago</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Widget key={i}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {stat.label === 'Health Score' && <span className="text-sm font-bold text-slate-400">%</span>}
                </div>
                <div className={`flex items-center text-xs font-bold ${stat.color}`}>
                   <TrendingUp size={12} className="mr-1" />
                   {stat.sub}
                </div>
              </div>
              <div className={`p-4 rounded-2xl bg-white/50 dark:bg-black/20 shadow-inner ${stat.color}`}>
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
            </div>
          </Widget>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <FileText size={20} className="text-primary-light" />
              <span>Recent Medical Reports</span>
            </h3>
            <Link to="/reports" className="text-sm font-bold text-primary-light flex items-center hover:opacity-80 transition-opacity">
              View All <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentReports.map((report, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-light dark:glass-dark p-5 flex items-center justify-between group hover:border-primary-light/50 cursor-pointer shadow-lg hover:shadow-primary-light/5"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-gradient/10 text-primary-light rounded-2xl group-hover:bg-primary-gradient group-hover:text-white transition-all transform group-hover:rotate-12 shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{report.title}</p>
                    <p className="text-xs text-slate-500 font-medium">{report.type} • {report.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {report.status}
                  </div>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-primary-light transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Plus size={20} className="text-secondary-light" />
            <span>Quick Actions</span>
          </h3>
          <div className="space-y-4">
            <Link to="/upload" className="block">
              <Widget className="hover:border-primary-light/50 py-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Upload Report</p>
                    <p className="text-xs text-slate-500">Secure AI encryption</p>
                  </div>
                </div>
              </Widget>
            </Link>
            
            <Link to="/claims" className="block">
              <Widget className="hover:border-purple-500/50 py-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Claim Analyzer</p>
                    <p className="text-xs text-slate-500">Similarity detector</p>
                  </div>
                </div>
              </Widget>
            </Link>

            <Link to="/profile" className="block">
              <Widget className="hover:border-red-500/50 py-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Emergency Card</p>
                    <p className="text-xs text-slate-500">Fast-access medical ID</p>
                  </div>
                </div>
              </Widget>
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
