import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Trash2, Download, Search, Filter, Loader2, Upload, ChevronRight, Calendar, MoreVertical, ExternalLink } from 'lucide-react';
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
      const resp = await axios.get('http://localhost:8000/reports/');
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
      await axios.delete(`http://localhost:8000/reports/${id}`);
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
    <div className="space-y-8 py-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Vaulted <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Recordings</span>
          </h2>
          <p className="text-slate-500 font-medium">Manage and access your encrypted medical history.</p>
        </div>
        
        <Link to="/upload">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary-light dark:btn-primary-dark flex items-center space-x-2 py-3 shadow-xl shadow-primary-light/20"
          >
            <Upload size={20} />
            <span>Add New Record</span>
          </motion.button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-light transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search within your secure vault..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-light dark:glass-dark pl-12 pr-4 py-4 outline-none border border-slate-200 dark:border-white/10 focus:ring-2 ring-primary-light transition-all font-medium rounded-2xl"
          />
        </div>
        <div className="flex gap-2 scrollbar-hide overflow-x-auto pb-2 md:pb-0">
          {reportTypes.map((type: any) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                px-5 py-3 rounded-2xl whitespace-nowrap font-bold text-xs uppercase tracking-widest transition-all
                ${filterType === type 
                  ? 'bg-primary-gradient text-white shadow-lg' 
                  : 'glass-light dark:glass-dark text-slate-500 hover:border-primary-light/50'}
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-primary-light" size={48} />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Accessing Encrypted Storage...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-light dark:glass-dark p-20 text-center space-y-6"
        >
          <div className="w-24 h-24 mx-auto bg-slate-500/5 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
            <FileText size={48} strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">No records found</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Your vault is empty or no records match your current search parameters.</p>
          </div>
          <Link to="/upload" className="inline-block text-primary-light font-bold hover:underline">
            Upload your first document
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report, idx) => (
              <motion.div 
                key={report._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass-light dark:glass-dark group hover:border-primary-light/50 transition-all overflow-hidden flex flex-col h-full shadow-lg hover:shadow-primary-light/5"
              >
                {/* Card Header */}
                <div className="p-6 flex justify-between items-start">
                  <div className="p-4 bg-primary-gradient/10 text-primary-light rounded-2xl group-hover:bg-primary-gradient group-hover:text-white transition-all transform group-hover:rotate-6">
                    <FileText size={24} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <a 
                      href={report.cloudinary_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2 hover:bg-primary-light/10 text-slate-400 hover:text-primary-light rounded-xl transition-all"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                    <button 
                      onClick={() => handleDelete(report._id)} 
                      className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 pb-6 flex-1 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl truncate mb-1" title={report.title}>{report.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-light px-2 py-0.5 bg-primary-light/10 rounded-full border border-primary-light/20">
                        {report.report_type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-slate-500 text-xs font-semibold">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(report.upload_date * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-white/30 dark:bg-black/20 border-t border-white/10 mt-auto">
                  <a 
                    href={report.cloudinary_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center space-x-2 py-2 text-sm font-bold text-primary-light hover:bg-primary-light hover:text-white rounded-xl transition-all border border-primary-light/30"
                  >
                    <span>Inspect Document</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
