import { motion } from 'framer-motion';
import { Database, ExternalLink, Globe, Beaker, Pill, ShieldCheck, Search, Filter, Activity } from 'lucide-react';
import { useState } from 'react';
import AIAutocompleteInput from '../../components/AIAutocompleteInput';
import { useTheme } from '../../context/ThemeContext';

const datasets = [
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'} mb-2`}>Data Sandbox</h2>
          <p className="text-slate-400">Explore premium medical datasets to fuel your clinical research.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10 pointer-events-none" />
             <AIAutocompleteInput 
               value={searchTerm}
               onChange={setSearchTerm}
               context="dataset_search"
               placeholder="Search datasets..."
               className={`w-full bg-white/5 border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-cyan-500/50`}
             />
          </div>
          <button className="p-2 glass-dark border-white/10 rounded-xl hover:bg-white/5 transition-all">
             <Filter size={20} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((ds, i) => (
          <motion.div 
            key={ds.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative glass-dark p-8 border-white/5 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${ds.color}-500/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-700`} />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl bg-${ds.color}-500/10 border border-${ds.color}-500/20 text-${ds.color}-400`}>
                  <ds.icon size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                  {ds.category}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">{ds.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {ds.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="space-y-0.5">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Source Provider</p>
                   <p className="text-xs font-bold text-slate-300">{ds.source}</p>
                </div>
                <motion.a 
                  href={ds.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 text-cyan-400 text-xs font-bold hover:underline"
                >
                  <span>Explore</span>
                  <ExternalLink size={14} />
                </motion.a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Card */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-dark p-8 border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-1 text-center md:text-left">
           <h3 className="text-xl font-bold">Have a Dataset to share?</h3>
           <p className="text-slate-400 text-sm">Contribute to the healthcare innovation community by listing verified datasets.</p>
        </div>
        <button className="btn-primary-dark whitespace-nowrap">
           Register New Dataset
        </button>
      </motion.div>
    </div>
  );
}
