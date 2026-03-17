import { useState, useEffect } from 'react';
import api from '../api/instance';
import { FileText, Trash2, Download, Search, Filter, Loader2, Upload, ChevronRight, Calendar, MoreVertical, ExternalLink, Shield, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function MyReports() {
  const { theme } = useTheme();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const fetchReports = async () => {
    try {
      const resp = await api.get('/reports/');
      setReports(resp.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.report_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || r.report_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const reportTypes = ['All', ...new Set(reports.map(r => r.report_type))];

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-4 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Medical <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Records Vault</span>
          </h2>
          <p className="text-slate-500 font-medium">Securely access and manage your clinical data history.</p>
        </div>
        
        <Link to="/upload">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-blue-600 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center space-x-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <Upload size={20} />
            <span className="uppercase tracking-widest text-xs">Upload New record</span>
          </motion.button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors z-10" size={20} />
          <input 
            type="text" 
            placeholder="Search by diagnosis, hospital, or document type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-card)] pl-12 pr-4 py-4 outline-none border border-[var(--border-main)] focus:border-[var(--accent-primary)] focus:ring-4 ring-[var(--accent-primary)]/5 transition-all font-bold text-sm rounded-2xl shadow-sm text-[var(--text-primary)]"
          />
        </div>
        <div className="flex gap-2 scrollbar-hide overflow-x-auto pb-2 lg:pb-0">
          {reportTypes.map((type: any) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                px-6 py-3 rounded-2xl whitespace-nowrap font-bold text-[10px] uppercase tracking-[0.2em] transition-all
                ${filterType === type 
                  ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'}
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-20 h-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full shadow-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield size={24} className="text-[var(--accent-primary)]" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] animate-pulse">Syncing with Health Vault...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-[var(--border-main)] p-20 text-center rounded-[3rem] shadow-xl"
        >
          <div className="w-24 h-24 mx-auto bg-[var(--bg-primary)] rounded-[2rem] flex items-center justify-center text-[var(--text-secondary)] mb-6 opacity-30">
            <FileText size={48} strokeWidth={1} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Vault Empty</h3>
            <p className="text-[var(--text-secondary)] max-w-sm mx-auto font-bold opacity-60">Your clinical history is empty or no records match your search.</p>
          </div>
          <Link to="/upload" className="inline-block mt-8 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-xl hover:bg-[var(--accent-primary)] hover:text-white transition-all">
            Securely Upload First Document
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report, idx) => {
              const isRaw = report.cloudinary_url?.includes('/raw/upload/');
              const downloadUrl = isRaw 
                ? report.cloudinary_url.replace('/upload/', '/upload/fl_attachment/')
                : report.cloudinary_url;

              return (
                <motion.div 
                  key={report._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] p-4 flex flex-col group hover:border-[var(--accent-primary)] hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
                >
                  <div className="bg-[var(--bg-primary)] rounded-[2rem] p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3.5 bg-[var(--accent-primary)] text-white rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg shadow-blue-500/30">
                        <FileText size={24} />
                      </div>
                      <div className="flex items-center space-x-1">
                        <motion.button 
                          onClick={() => handleDelete(report._id)} 
                          whileHover={{ scale: 1.1 }}
                          className="p-2.5 text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Purge Record"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] px-3 py-1 bg-[var(--accent-primary)]/10 rounded-full border border-[var(--accent-primary)]/20">
                            {report.report_type}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-[var(--border-main)]" />
                          <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Verified</span>
                        </div>
                        <h3 className="font-extrabold text-xl text-[var(--text-primary)] leading-tight line-clamp-2 min-h-[3.5rem]" title={report.title}>
                          {report.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-main)] opacity-80">
                        <div className="flex items-center space-x-2 text-[var(--text-secondary)] font-bold">
                          <Calendar size={14} className="text-[var(--accent-primary)]" />
                          <span className="text-xs">{new Date(report.upload_date * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                           <ShieldCheck size={14} className="text-emerald-500" />
                           <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Signed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 p-3">
                    <a 
                      href={report.cloudinary_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center space-x-2 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-card)] rounded-2xl transition-all border border-transparent hover:border-[var(--border-main)]"
                    >
                      <ExternalLink size={14} />
                      <span>Review</span>
                    </a>
                    <a 
                      href={downloadUrl} 
                      download
                      className="flex items-center justify-center space-x-2 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--accent-primary)] bg-[var(--bg-card)] rounded-2xl transition-all border border-[var(--border-main)] hover:bg-[var(--accent-primary)] hover:text-white hover:border-[var(--accent-primary)] shadow-sm"
                    >
                      <Download size={14} />
                      <span>Archive</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
