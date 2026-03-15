import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, ShieldAlert, Save, Loader2, HeartPulse, UserCircle, Droplets, Calendar, Smartphone, PlusCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function EmergencyProfile() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: 0,
    blood_group: '',
    allergies: '',
    diseases: '',
    medications: '',
    emergency_contact: ''
  });

  const fetchProfile = async () => {
    try {
      const resp = await axios.get('http://localhost:8000/profile/');
      if (resp.data.name) setProfile(resp.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('http://localhost:8000/profile/', profile);
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary-light/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Decrypting Profile...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-full w-fit text-[10px] font-black uppercase tracking-widest"
          >
            <ShieldAlert size={14} />
            <span>Critical Access Protocol</span>
          </motion.div>
          <h2 className="text-5xl font-extrabold tracking-tight">
            Emergency <span className={theme === 'dark' ? 'gradient-text-dark' : 'gradient-text-light'}>Health Profile</span>
          </h2>
          <p className="text-slate-500 font-medium">This encrypted data is prioritized for emergency responders.</p>
        </div>
        
        {/* Digital ID Card Preview (Mini) */}
        <motion.div 
          initial={{ rotate: 5, scale: 0.9, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          className="hidden lg:block w-72 h-44 bg-primary-gradient rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-primary-light/30 border border-white/20"
        >
          <div className="relative z-10 flex flex-col h-full justify-between text-white">
            <div className="flex justify-between items-start">
              <Activity size={24} className="opacity-80" />
              <span className="text-[8px] font-black tracking-widest bg-black/20 px-2 py-1 rounded">SWASTHYASETU SECURE</span>
            </div>
            <div>
              <p className="text-[10px] opacity-60 uppercase font-bold leading-none mb-1">Holder</p>
              <p className="text-xl font-black truncate">{profile.name || 'Siddharth Sharma'}</p>
            </div>
            <div className="flex space-x-6">
              <div>
                <p className="text-[7px] opacity-60 uppercase font-bold">Blood</p>
                <p className="text-sm font-black">{profile.blood_group || 'O+'}</p>
              </div>
              <div>
                <p className="text-[7px] opacity-60 uppercase font-bold">Age</p>
                <p className="text-sm font-black">{profile.age || '24'}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info */}
        <div className="lg:col-span-2 space-y-8">
          <Section title="Personal Information" icon={UserCircle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
              <Field label="Full Identity Name" icon={User}>
                <input 
                  type="text" 
                  required
                  placeholder="Legal name as per DNA record"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="input-field"
                />
              </Field>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Age" icon={Calendar}>
                  <input 
                    type="number" 
                    required
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 0})}
                    className="input-field"
                  />
                </Field>
                <Field label="Blood Type" icon={Droplets}>
                  <select 
                    required
                    value={profile.blood_group}
                    onChange={(e) => setProfile({...profile, blood_group: e.target.value})}
                    className="input-field appearance-none"
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Emergency Contact Channel" icon={Smartphone}>
                  <input 
                    type="text" 
                    required
                    placeholder="+91 XXXX XXX XXX"
                    value={profile.emergency_contact}
                    onChange={(e) => setProfile({...profile, emergency_contact: e.target.value})}
                    className="input-field"
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Medical Disclosure" icon={HeartPulse} color="text-red-500">
            <div className="space-y-6">
              <Field label="Known Allegies" icon={ShieldAlert}>
                <textarea 
                  value={profile.allergies}
                  onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                  placeholder="e.g. Penicillin, Peanuts, Latex..."
                  className="input-field h-24 pt-4"
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Existing Conditions" icon={Activity}>
                  <textarea 
                    value={profile.diseases}
                    onChange={(e) => setProfile({...profile, diseases: e.target.value})}
                    placeholder="e.g. Type 2 Diabetes, Asthma"
                    className="input-field h-32 pt-4"
                  />
                </Field>
                <Field label="Active Medications" icon={PlusCircle}>
                  <textarea 
                    value={profile.medications}
                    onChange={(e) => setProfile({...profile, medications: e.target.value})}
                    placeholder="e.g. Metformin 500mg, Albuterol"
                    className="input-field h-32 pt-4"
                  />
                </Field>
              </div>
            </div>
          </Section>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          <div className="sticky top-24 space-y-8">
            <button 
              type="submit" 
              disabled={saving}
              className={`
                w-full flex items-center justify-center space-x-3 py-6 rounded-3xl text-xl font-bold transition-all shadow-2xl
                ${saving ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-white/5' : 'bg-primary-gradient text-white hover:scale-[1.02] shadow-primary-light/20'}
              `}
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              <span>{saving ? 'SYNCHRONIZING...' : 'UPDATE SECURE ID'}</span>
            </button>

            <div className="glass-light dark:glass-dark p-8 space-y-6">
              <h3 className="text-xl font-bold">Profile Status</h3>
              <div className="space-y-4">
                <StatusItem label="Encryption Status" value="Active (AES-256)" active />
                <StatusItem label="Biometric Linked" value="Verified" active />
                <StatusItem label="Global ID Ready" value="Syncing" />
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Protocol Integrity</p>
                <div className="flex justify-center space-x-1">
                  {[...Array(12)].map((_, i) => <div key={i} className={`w-1 h-3 rounded-full ${i < 8 ? 'bg-primary-light' : 'bg-slate-200 dark:bg-white/10'}`} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

const Section = ({ title, icon: Icon, children, color = "text-primary-light" }: any) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="glass-light dark:glass-dark p-8 space-y-8"
  >
    <div className="flex items-center space-x-3">
      <div className={`p-3 rounded-2xl bg-white/50 dark:bg-black/20 ${color}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const Field = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2 text-slate-500 font-bold uppercase tracking-[0.15em] text-[10px]">
      <Icon size={12} />
      <span>{label}</span>
    </div>
    {children}
  </div>
);

const StatusItem = ({ label, value, active = false }: any) => (
  <div className="flex justify-between items-center text-sm font-medium">
    <span className="text-slate-500">{label}</span>
    <span className={active ? 'text-primary-light font-bold' : 'text-slate-400'}>{value}</span>
  </div>
);
