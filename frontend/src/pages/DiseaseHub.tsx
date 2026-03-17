import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Map as MapIcon, 
  Plus, 
  RefreshCcw, 
  Filter, 
  MapPin, 
  ChevronRight,
  ShieldAlert,
  FlameKindling,
  History,
  Activity
} from 'lucide-react';
import api from '../api/instance';
import DiseaseMap from '../components/disease/DiseaseMap';
import ReportDiseaseModal from '../components/disease/ReportDiseaseModal';
import Skeleton from '../components/ui/Skeleton';
import { useTheme } from '../context/ThemeContext';

const DiseaseHub: React.FC = () => {
  const { theme } = useTheme();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [outbreak, setOutbreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<number>(30); // days
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [radius, setRadius] = useState<number>(20000); // meters
  const [centerOnReport, setCenterOnReport] = useState<[number, number] | null>(null);

  const FALLBACK_LOCATION: [number, number] = [19.0760, 72.8777]; // Mumbai fallback

  const fetchLocation = useCallback(() => {
    const fallbackTimer = setTimeout(() => {
      setUserLocation((prev) => prev ?? FALLBACK_LOCATION);
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(fallbackTimer);
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        clearTimeout(fallbackTimer);
        console.warn('Geolocation unavailable, using fallback location:', error.message);
        setUserLocation(FALLBACK_LOCATION);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);


  const fetchData = useCallback(async () => {
    if (!userLocation) return;
    
    try {
      // Fetch nearby diseases with radius selection
      const reportsRes = await api.get(`/diseases/nearby?lat=${userLocation[0]}&lng=${userLocation[1]}&radius=${radius}&time_filter=${timeFilter}`);
      
      let filteredReports = reportsRes.data;
      if (severityFilter !== 'All') {
        filteredReports = filteredReports.filter((r: any) => r.severity === severityFilter);
      }
      setReports(filteredReports);

      // Fetch outbreak analysis
      const outbreakRes = await api.get(`/diseases/outbreaks?lat=${userLocation[0]}&lng=${userLocation[1]}`);
      setOutbreak(outbreakRes.data.analysis);
      
      setLoading(false);
    } catch (err) {
      console.error("Fetch data error:", err);
      setLoading(false);
    }
  }, [userLocation, timeFilter, severityFilter, radius]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    fetchData();
    // 10s polling as requested
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Enhanced loading state with skeletons
  const isAcquiringLocation = !userLocation;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-20 overflow-hidden relative">
      {isAcquiringLocation && (
        <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-center p-4">
           <motion.div 
             initial={{ y: -20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="bg-blue-600 text-white px-6 py-2.5 rounded-full flex items-center space-x-3 shadow-2xl shadow-blue-500/30"
           >
              <Activity className="animate-spin" size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Synchronizing Satellite GPS...</span>
           </motion.div>
        </div>
      )}
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center space-x-3">
            <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg">
              <MapIcon size={28} />
            </span>
            <span>Epidemic <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Intelligence</span></span>
          </h1>
          <p className="text-slate-500 font-medium">Real-time location-based epidemiological surveillance network.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Radius Selection */}
          <div className="flex items-center bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-main)] shadow-sm">
             {[
               { val: 5000, label: '5km' },
               { val: 10000, label: '10km' },
               { val: 20000, label: '20km' },
               { val: 50000, label: '50km' }
             ].map(r => (
               <button
                 key={r.val}
                 onClick={() => setRadius(r.val)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                   radius === r.val 
                     ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20' 
                     : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-primary)] opacity-60 hover:opacity-100'
                 }`}
               >
                 {r.label}
               </button>
             ))}
          </div>

          <div className="flex items-center bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-main)] shadow-sm">
             {[
               { val: 1, label: '24h' },
               { val: 7, label: '7d' },
               { val: 30, label: '30d' }
             ].map(t => (
               <button
                 key={t.val}
                 onClick={() => setTimeFilter(t.val)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                   timeFilter === t.val 
                     ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20' 
                     : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-primary)] opacity-60 hover:opacity-100'
                 }`}
               >
                 {t.label}
               </button>
             ))}
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-2 bg-teal-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span className="uppercase tracking-widest text-xs">Broadcast Incident</span>
          </button>
        </div>
      </div>

      {/* Outbreak Alert */}
      <AnimatePresence>
        {outbreak?.outbreak_detected && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-red-50 border border-red-100 dark:bg-red-500/5 dark:border-red-500/20 p-5 rounded-3xl flex items-center space-x-5 relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                 <ShieldAlert size={80} />
              </div>
              <div className="bg-red-600 p-3.5 rounded-2xl text-white shadow-lg shadow-red-500/30 animate-pulse">
                <ShieldAlert size={28} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-red-600 uppercase tracking-tight text-lg">Bio-Threat Warning: {outbreak.disease}</h4>
                <p className="text-sm text-red-700 dark:text-red-400 font-semibold">{outbreak.alert_message}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-[0.2em]">{outbreak.report_count} Verified Reports</span>
                  <span className="text-[10px] font-black text-red-600/60 uppercase tracking-widest flex items-center">
                    <MapPin size={10} className="mr-1" /> {outbreak.location}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Controls & List */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          {/* Nearby Section */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-8 rounded-[2.5rem] shadow-xl relative group h-[600px] flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-extrabold text-xl flex items-center space-x-3 tracking-tight text-[var(--text-primary)]">
                  <FlameKindling className="text-rose-500" size={24} />
                  <span>Proximity Audit</span>
                </h3>
             </div>

             <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar relative text-left">
               {loading || isAcquiringLocation ? (
                 [1, 2, 3].map(i => (
                   <div key={i} className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[1.5rem] space-y-3">
                     <Skeleton className="h-5 w-32" />
                     <Skeleton className="h-3 w-48" />
                   </div>
                 ))
               ) : reports.length === 0 ? (
                 <div className="text-center py-20 px-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
                   <Activity className="mx-auto text-slate-300 mb-4" size={48} strokeWidth={1} />
                   <p className="text-slate-400 text-sm font-bold italic">No epidemiological activity detected in local mesh.</p>
                 </div>
               ) : (
                 reports.map((report) => (
                   <motion.div
                    key={report._id}
                    layoutId={report._id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCenterOnReport([report.latitude, report.longitude])}
                    className="cursor-pointer p-5 bg-[var(--bg-primary)] border border-[var(--border-main)] rounded-[1.5rem] hover:border-[var(--accent-primary)] transition-all duration-300 relative group"
                   >
                     <div className="flex justify-between items-start mb-3">
                        <span className="font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{report.disease_name}</span>
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          report.severity === 'Severe' ? 'bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse' : 
                          report.severity === 'Moderate' ? 'bg-amber-500' : 
                          'bg-emerald-500'
                        }`} />
                     </div>
                     <div className="flex items-center text-[10px] text-[var(--text-secondary)] space-x-4 font-black">
                        <span className="flex items-center uppercase tracking-widest opacity-60"><History size={12} className="mr-1.5" /> {new Date(report.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="bg-[var(--bg-card)] px-2 py-0.5 rounded text-[var(--accent-primary)] border border-[var(--accent-primary)]/10">SECURE NODE</span>
                     </div>
                   </motion.div>
                 ))
               )}
             </div>
             
             {/* Privacy Disclaimer */}
             <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-600/5 border border-blue-100 dark:border-blue-600/10 rounded-2xl">
                <p className="text-[10px] text-blue-600/70 leading-relaxed font-bold italic">
                   Mesh uses differential privacy for anonymity. Markers indicate general proximity, protecting personal identities.
                </p>
             </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 h-[600px] order-1 lg:order-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none p-2 relative z-0">
           {userLocation ? (
             <div className="w-full h-full rounded-[2rem] overflow-hidden border border-slate-100 dark:border-white/5">
                <DiseaseMap 
                  userLocation={userLocation} 
                  reports={reports} 
                  centerOnReport={centerOnReport}
                />
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing Grid Overlay...</p>
             </div>
           )}
        </div>
      </div>

      <ReportDiseaseModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
};

export default DiseaseHub;
