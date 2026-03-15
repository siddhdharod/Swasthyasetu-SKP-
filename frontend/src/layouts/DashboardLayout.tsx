import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, LayoutDashboard, FileUp, ClipboardList, Shield, Settings, Search, Bell, Menu, X, Lightbulb, MessageSquare, Database, FlaskConical, Map as MapIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ChatbotWidget from '../components/ChatbotWidget';
import LocationPermissionModal from '../components/disease/LocationPermissionModal';
import axios from 'axios';

const SidebarItem = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link to={to} onClick={onClick}>
    <motion.div 
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-primary-gradient text-white shadow-lg' 
          : 'hover:bg-white/10 text-slate-500 dark:text-slate-400'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </motion.div>
  </Link>
);

const BackgroundLayer = () => {
  const { theme } = useTheme();
  return (
    <div className="bg-layer">
      {theme === 'dark' ? (
        <>
          <div className="particle-grid" />
          <div className="binary-code-river" />
          <div className="light-trail left-[15%] opacity-40" style={{ animationDuration: '6s' }} />
          <div className="light-trail left-[45%] opacity-30" style={{ animationDuration: '9s' }} />
          <div className="light-trail left-[75%] opacity-40" style={{ animationDuration: '7s' }} />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.15, 0.05] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[130px] rounded-full" 
          />
        </>
      ) : (
        <>
          <div className="wireframe-geo" />
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.1, 1] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] right-[10%] w-[35%] h-[35%] bg-primary-light/10 blur-[100px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              scale: [1.1, 1, 1.1] 
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: -5 }}
            className="absolute bottom-[20%] left-[5%] w-[30%] h-[30%] bg-secondary-light/10 blur-[100px] rounded-full" 
          />
        </>
      )}
    </div>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setShowLocationModal(false);
        try {
          await axios.post('http://localhost:8000/api/diseases/update-location', {
            latitude,
            longitude
          }, { withCredentials: true });
        } catch (error) {
          console.error("Error updating location:", error);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setShowLocationModal(true);
      }
    );
  };

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: FileUp, label: 'Upload Reports' },
    { to: '/reports', icon: ClipboardList, label: 'My Reports' },
    { to: '/claims', icon: Shield, label: 'AI Claim Analyzer' },
    { to: '/disease-hub', icon: MapIcon, label: 'Disease Hub' },
    { to: '/profile', icon: User, label: 'Emergency Profile' },
    { type: 'divider', label: 'Innovation Lab' },
    { to: '/innovation/problems', icon: FlaskConical, label: 'Problem Hub' },
    { to: '/innovation/ideas', icon: Lightbulb, label: 'Idea Generator' },
    { to: '/innovation/threads', icon: MessageSquare, label: 'Collab Threads' },
    { to: '/innovation/sandbox', icon: Database, label: 'Data Sandbox' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark text-white' : 'text-slate-800'}`}>
      <BackgroundLayer />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 glass-light dark:glass-dark m-0 lg:m-4 p-4 z-50 
        transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="mb-8 p-2 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}`}>
            SwasthyaSetu AI
          </h1>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-hide">
          {menuItems.map((item: any, i: number) => (
            item.type === 'divider' ? (
              <div key={i} className="pt-4 pb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">
                {item.label}
              </div>
            ) : (
              <SidebarItem 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            )
          ))}
        </nav>
        
        <div className="mt-auto border-t border-slate-200 dark:border-white/10 pt-4">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 p-3 w-full hover:bg-red-500/10 text-red-500 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 glass-light dark:glass-dark px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden lg:flex items-center bg-white/10 dark:bg-black/20 rounded-xl px-4 py-2 border border-white/10">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search health records..." 
                className="bg-transparent outline-none w-64 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-4">
            <button className="p-2.5 glass-light dark:glass-dark rounded-xl hover:scale-110 transition-all relative">
              <Bell size={20} className="text-slate-500 dark:text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 glass-light dark:glass-dark rounded-xl hover:scale-110 transition-all group"
            >
              {theme === 'dark' 
                ? <Sun size={20} className="text-yellow-400 transition-transform group-hover:rotate-45" /> 
                : <Moon size={20} className="text-violet-600 transition-transform group-hover:-rotate-12" />
              }
            </button>
            <div className="flex items-center space-x-3 pl-2 border-l border-white/20">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold leading-tight">{user?.name || 'Authorized Guest'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Premium Node</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-gradient p-[2px] flex items-center justify-center">
                <div className="w-full h-full rounded-[10px] bg-white/10 flex items-center justify-center overflow-hidden">
                   <User size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </main>

      {showLocationModal && <LocationPermissionModal onEnable={requestLocation} />}
      <ChatbotWidget />
    </div>
  );
}
