import { motion, AnimatePresence } from 'framer-motion';
import { Database, ExternalLink, Globe, Beaker, Pill, ShieldCheck, Search, Filter, Activity, Plus, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import AIAutocompleteInput from '../../components/AIAutocompleteInput';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/instance';

const staticDatasets = [
  {
    title: "WHO Healthcare Datasets",
    description: "Global health observatory data covering mortality, disease outbreaks, and health systems.",
    source: "World Health Organization",
    url: "https://www.who.int/data/gho",
    icon: Globe,
    category: "Public Health",
    color: "cyan"
  },
  {
    title: "Kaggle Medical Datasets",
    description: "Diverse collection of medical imaging, electronic health records, and clinical research data.",
    source: "Kaggle Community",
    url: "https://www.kaggle.com/datasets?search=medical",
    icon: Database,
    category: "ML / Research",
    color: "purple"
  },
  {
    title: "NIMH Mental Health Data",
    description: "Extensive repository of mental health research data, clinical trials, and genomic studies.",
    source: "National Institute of Mental Health",
    url: "https://www.nimh.nih.gov/research/resources/data-sharing",
    icon: Beaker,
    category: "Mental Health",
    color: "blue"
  },
  {
    title: "DrugBank Pharmaceutical DB",
    description: "Comprehensive database of drug, drug target, and drug action information.",
    source: "DrugBank Online",
    url: "https://go.drugbank.com/",
    icon: Pill,
    category: "Pharmacy",
    color: "green"
  },
  {
    title: "NHS Digital Datasets",
    description: "Aggregated health and care data from across the United Kingdom's national health system.",
    source: "NHS Digital",
    url: "https://digital.nhs.uk/data-and-information",
    icon: ShieldCheck,
    category: "National Health",
    color: "red"
  },
  {
    title: "CDC WONDER Database",
    description: "Wide-ranging online data for epidemiologic research from the Center for Disease Control.",
    source: "CDC Gov",
    url: "https://wonder.cdc.gov/",
    icon: Activity,
    category: "Epidemiology",
    color: "orange"
  }
];

export default function DataSandbox() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [datasetsList, setDatasetsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', link: '', category: 'Research' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await api.get('/problems/datasets/list');
      setDatasetsList(response.data);
    } catch (err) {
      console.error("Failed to fetch datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.link) {
      setError("Information Protocol Incomplete: All fields are required.");
      return;
    }

    try {
      // URL Validation
      new URL(formData.link);
    } catch (e) {
      setError("Invalid Protocol: Please enter a valid dataset URL.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post('/problems/datasets', formData);
      setDatasetsList([response.data, ...datasetsList]);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', link: '', category: 'Research' });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Neural Uplink Failure: Could not register dataset.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDatasets = [...datasetsList, ...staticDatasets].filter(ds => 
    ds.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ds.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ds.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'} mb-2`}>Data Sandbox</h2>
          <p className="text-slate-400">Explore premium medical datasets to fuel your clinical research.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative w-64 lg:w-96">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] z-10 pointer-events-none" />
             <AIAutocompleteInput 
               value={searchTerm}
               onChange={setSearchTerm}
               context="dataset_search"
               placeholder="Search clinical datasets..."
               className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-[var(--accent-primary)] focus:ring-4 ring-[var(--accent-primary)]/5 transition-all font-bold text-[var(--text-primary)]"
             />
          </div>
          <button className="p-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl hover:bg-[var(--bg-primary)] transition-all shadow-sm">
             <Filter size={20} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} />
            <p className="text-[var(--text-secondary)] font-bold animate-pulse">Syncing clinical repositories...</p>
          </div>
        ) : filteredDatasets.length > 0 ? (
          filteredDatasets.map((ds, i) => (
            <motion.div 
              key={ds.id || ds.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative premium-card p-10 hover:border-[var(--accent-primary)] transition-all duration-500 overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${ds.color || 'blue'}-500/5 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700`} />
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-[1.5rem] bg-${ds.color || 'blue'}-500/10 border border-${ds.color || 'blue'}-500/20 text-${ds.color || 'blue'}-600`}>
                    {typeof ds.icon === 'string' || !ds.icon ? <Database size={28} /> : <ds.icon size={28} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] px-3 py-1.5 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-main)] shadow-sm">
                    {ds.category}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">{ds.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 font-medium h-[4.5rem]">
                    {ds.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[var(--border-main)]">
                  <div className="space-y-1">
                     <p className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-widest opacity-60">Source Provider</p>
                     <p className="text-xs font-extrabold text-[var(--text-primary)] truncate max-w-[120px]">{ds.source}</p>
                  </div>
                  <motion.a 
                    href={ds.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-2 text-[var(--accent-primary)] text-xs font-black uppercase tracking-widest hover:underline"
                  >
                    <span>Explore</span>
                    <ExternalLink size={16} />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[var(--bg-card)] rounded-[2rem] border border-dashed border-[var(--border-main)] space-y-6">
             <div className="p-6 bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] opacity-20">
                <Database size={64} strokeWidth={1} />
             </div>
             <div className="text-center">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">No clinical datasets found</h3>
                <p className="text-[var(--text-secondary)]">Try adjusting your search criteria or register a new repository.</p>
             </div>
          </div>
        )}
      </div>

      {/* Action Card */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="premium-card p-10 bg-gradient-to-r from-[var(--accent-primary)]/5 to-[var(--accent-secondary)]/5 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="space-y-2 text-center md:text-left">
           <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">Have a Dataset to share?</h3>
           <p className="text-[var(--text-secondary)] font-medium">Contribute to the healthcare innovation community by listing verified datasets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-3 bg-[var(--accent-primary)] text-white px-10 py-5 rounded-2xl font-bold font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
        >
           <Plus size={20} />
           <span>Register New Dataset</span>
        </button>
      </motion.div>

      {/* Register Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between bg-gradient-to-r from-[var(--accent-primary)]/5 to-transparent">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-2xl">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Repository Ingress</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">Dataset Registration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-[var(--bg-primary)] rounded-xl transition-all text-[var(--text-secondary)]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddDataset} className="p-8 space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 text-rose-500 text-xs font-bold"
                  >
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Topic / Title</label>
                    <input 
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Genomic Cancer Research DB"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl px-5 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed overview of the clinical data scope..."
                      rows={3}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl px-5 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl px-5 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-all appearance-none cursor-pointer"
                      >
                        <option value="Research">Research</option>
                        <option value="Clinical">Clinical</option>
                        <option value="Genomics">Genomics</option>
                        <option value="Imaging">Imaging</option>
                        <option value="Community">Community</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Dataset Link (URL)</label>
                      <input 
                        type="url"
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl px-5 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-2xl font-black uppercase tracking-widest text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-[var(--accent-primary)] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>INGRESSING...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>INITIALIZE REGISTRATION</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
