import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, ShieldAlert, Save, Loader2, HeartPulse, UserCircle, Droplets, Calendar, Smartphone, PlusCircle, Activity, Mail, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // ... inside Settings()
  const [profile, setProfile] = useState({
    name: '',
    age: 0,
    dob: '',
    mobile: '',
    gender: 'Other',
    blood_group: '',
    allergies: '',
    diseases: '',
    medications: '',
    emergency_contact: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const resp = await axios.get('http://localhost:8000/api/profile/');
      if (resp.data.name) setProfile({ ...profile, ...resp.data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('http://localhost:8000/api/profile/', profile);
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ... (loading state)

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black gradient-text-dark mb-2">Account Settings</h2>
          <p className="text-slate-400">Manage your clinical profile and experimental preferences.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary-dark px-10 flex items-center space-x-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Section */}
          <section className="glass-dark p-8 space-y-6">
             <div className="flex items-center space-x-3 text-cyan-400 mb-2">
                <User size={20} />
                <h3 className="font-black uppercase tracking-widest text-sm">Identity Core</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Legal Name</label>
                   <input 
                     value={profile.name}
                     onChange={(e) => setProfile({...profile, name: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Mobile Access</label>
                   <input 
                     value={profile.mobile}
                     onChange={(e) => setProfile({...profile, mobile: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Date of Birth</label>
                   <input 
                     type="date"
                     value={profile.dob}
                     onChange={(e) => setProfile({...profile, dob: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Age</label>
                     <input 
                       type="number"
                       value={profile.age}
                       onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 0})}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Gender</label>
                     <select 
                       value={profile.gender}
                       onChange={(e) => setProfile({...profile, gender: e.target.value})}
                       className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50"
                     >
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                       <option value="Other">Other</option>
                     </select>
                  </div>
                </div>
             </div>
          </section>

          {/* Medical Records Section */}
          <section className="glass-dark p-8 space-y-6">
             <div className="flex items-center space-x-3 text-red-400 mb-2">
                <HeartPulse size={20} />
                <h3 className="font-black uppercase tracking-widest text-sm">Medical Matrix</h3>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Allergies</label>
                   <textarea 
                     value={profile.allergies}
                     onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                     placeholder="List any known allergies..."
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 h-24 resize-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Chronic Diseases</label>
                   <textarea 
                     value={profile.diseases}
                     onChange={(e) => setProfile({...profile, diseases: e.target.value})}
                     placeholder="Diabetes, Hypertension, etc..."
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 h-24 resize-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Current Medications</label>
                   <textarea 
                     value={profile.medications}
                     onChange={(e) => setProfile({...profile, medications: e.target.value})}
                     placeholder="Dosage and frequency..."
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 h-24 resize-none"
                   />
                </div>
             </div>
          </section>

          {/* Emergency Disclosure Section */}
          <section className="glass-dark p-8 space-y-6">
             <div className="flex items-center space-x-3 text-purple-400 mb-2">
                <ShieldAlert size={20} />
                <h3 className="font-black uppercase tracking-widest text-sm">Emergency Disclosure</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Blood Group</label>
                   <select 
                     value={profile.blood_group}
                     onChange={(e) => setProfile({...profile, blood_group: e.target.value})}
                     className="w-full bg-[#050810] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50"
                   >
                     <option value="">Select Group</option>
                     {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                       <option key={bg} value={bg}>{bg}</option>
                     ))}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Emergency Contact</label>
                   <input 
                     value={profile.emergency_contact}
                     onChange={(e) => setProfile({...profile, emergency_contact: e.target.value})}
                     placeholder="Phone number / Name"
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50"
                   />
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar Mini Profile ... same as before but uses name/age/blood_group) */}
        <div className="space-y-8">
           <div className="glass-dark p-8 text-center space-y-6 relative overflow-hidden group">
              <div className="mx-auto w-24 h-24 rounded-3xl bg-primary-gradient p-[1px]">
                 <div className="w-full h-full rounded-[23px] bg-[#050810] flex items-center justify-center">
                    <UserCircle size={48} className="text-white" />
                 </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">{profile.name || 'Secure User'}</h3>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1">Patient Protocol Active</p>
              </div>
              <div className="flex justify-center space-x-6 pt-6 border-t border-white/5">
                 <div className="text-center">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Age</p>
                    <p className="font-bold text-lg text-slate-300">{profile.age || '--'}</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Type</p>
                    <p className="font-bold text-lg text-slate-300">{profile.blood_group || '--'}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
