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
import axios from 'axios';
import DiseaseMap from '../components/disease/DiseaseMap';
import ReportDiseaseModal from '../components/disease/ReportDiseaseModal';

const DiseaseHub: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [outbreak, setOutbreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<number>(30); // days
  const [severityFilter, setSeverityFilter] = useState<string>('All');
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
      // Fetch nearby diseases (2km radius)
      const reportsRes = await axios.get(`http://localhost:8000/api/diseases/nearby?lat=${userLocation[0]}&lng=${userLocation[1]}&radius=2000&time_filter=${timeFilter}`);
      
      let filteredReports = reportsRes.data;
      if (severityFilter !== 'All') {
        filteredReports = filteredReports.filter((r: any) => r.severity === severityFilter);
      }
      setReports(filteredReports);

      // Fetch outbreak analysis
      const outbreakRes = await axios.get(`http://localhost:8000/api/diseases/outbreaks?lat=${userLocation[0]}&lng=${userLocation[1]}`);
      setOutbreak(outbreakRes.data.analysis);
      
      setLoading(false);
    } catch (err) {
      console.error("Fetch data error:", err);
      setLoading(false);
    }
  }, [userLocation, timeFilter, severityFilter]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    fetchData();
    // 10s polling as requested
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Block render until location is available (real or fallback)
  if (!userLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-primary-light/20 dark:bg-primary-neon/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-primary-light/30 dark:bg-primary-neon/30 animate-ping animation-delay-150" />
          <Activity className="relative animate-spin text-primary-light dark:text-primary-neon w-full h-full p-3" size={48} />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg">Acquiring GPS signal...</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs text-center">
          If GPS is denied, Mumbai will be used as fallback location automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-dark dark:gradient-text-light flex items-center space-x-3">
            <MapIcon size={32} />
            <span>Disease Hub</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time location-based epidemiological intelligence.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/50 dark:bg-black/20 p-1 rounded-2xl border border-white/10">
             {[
               { val: 1, label: '24h' },
               { val: 7, label: '7d' },
               { val: 30, label: '30d' }
             ].map(t => (
               <button
                 key={t.val}
                 onClick={() => setTimeFilter(t.val)}
                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                   timeFilter === t.val 
                     ? 'bg-primary-gradient dark:bg-neon-gradient text-white dark:text-near-black shadow-md' 
                     : 'text-slate-500 hover:bg-white/10'
                 }`}
               >
                 {t.label}
               </button>
             ))}
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-gradient dark:bg-neon-gradient text-white dark:text-near-black px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Report Disease</span>
          </button>
        </div>
      </div>

      {/* Outbreak Alert */}
      <AnimatePresence>
        {outbreak?.outbreak_detected && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center space-x-4 mb-4">
              <div className="bg-red-500 p-3 rounded-xl text-white animate-pulse">
                <ShieldAlert size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-500">⚠ Outbreak Detected: {outbreak.disease}</h4>
                <p className="text-sm text-red-500/80">{outbreak.alert_message}</p>
                <p className="text-[10px] mt-1 text-red-500/60 uppercase font-bold tracking-widest">{outbreak.report_count} reports in {outbreak.location}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls & List */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          {/* Nearby Section */}
          <div className="premium-card-light dark:premium-card-dark p-6 border border-white/20 dark:border-white/5 shadow-2xl relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
             <div className="flex items-center justify-between mb-8 relative">
                <h3 className="font-extrabold text-xl flex items-center space-x-3 tracking-tight">
                  <FlameKindling className="text-orange-500 animate-pulse" size={24} />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Nearby Analysis</span>
                </h3>
                <span className="bg-primary-500/10 text-primary-600 dark:text-primary-neon text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-primary-500/20 uppercase">2KM Scan</span>
             </div>

             <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide relative">
               {reports.length === 0 ? (
                 <div className="text-center py-12 px-4 rounded-3xl bg-slate-100/50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10">
                   <Activity className="mx-auto text-slate-300 mb-2" size={32} />
                   <p className="text-slate-400 text-sm font-medium italic">No epidemiological activity in your immediate proximity.</p>
                 </div>
               ) : (
                 reports.map((report) => (
                   <motion.div
                    key={report._id}
                    layoutId={report._id}
                    whileHover={{ scale: 1.03, x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCenterOnReport([report.latitude, report.longitude])}
                    className="group cursor-pointer p-5 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-[1.5rem] hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 relative overflow-hidden"
                   >
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="flex justify-between items-start mb-2">
                        <span className="font-extrabold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-neon transition-colors">{report.disease_name}</span>
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.2)] ${
                          report.severity === 'Severe' ? 'bg-red-500 shadow-red-500/50 animate-pulse' : 
                          report.severity === 'Moderate' ? 'bg-orange-500 shadow-orange-500/50' : 
                          'bg-green-500 shadow-green-500/50'
                        }`} />
                     </div>
                     <div className="flex items-center text-[10px] text-slate-500 dark:text-slate-400 space-x-4">
                        <span className="flex items-center font-bold italic"><History size={12} className="mr-1.5 opacity-70" /> {new Date(report.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center font-black text-primary-500 tracking-tighter"><MapPin size={12} className="mr-1.5" /> GPS VERIFIED</span>
                     </div>
                   </motion.div>
                 ))
               )}
             </div>
          </div>

          {/* Privacy Disclaimer */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
             <p className="text-[10px] text-blue-500/70 leading-relaxed italic">
                SwasthyaSetu Public Health Mesh uses differential privacy to protect user anonymity. Markers indicate areas of infection without revealing precise home addresses or personal identity.
             </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 h-[600px] order-1 lg:order-2">
           {userLocation ? (
             <DiseaseMap 
               userLocation={userLocation} 
               reports={reports} 
               centerOnReport={centerOnReport}
             />
           ) : (
             <div className="h-full bg-slate-100 dark:bg-black/20 rounded-3xl flex items-center justify-center border border-white/10 italic text-slate-500">
                Initializing satellite link...
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
