import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Briefcase, Code, Link as LinkIcon, Save, Edit2, Github, Linkedin, 
  Menu, Camera, MapPin, Calendar, User as UserIcon, Mail, Globe, 
  X, Plus, Shield, CheckCircle, Loader 
} from 'lucide-react';

// Components & Utils
import api from '../utils/api';
import Sidebar from '../components/Sidebar';       
import AdminSidebar from '../components/AdminSidebar'; 
import BlueLightsBackground from '../components/BlueLightsBackground'; // Consistent Theme

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- State Management ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // New Skill Input State
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    name: '', bio: '', about: '', location: '', skills: [],
    socialLinks: { github: '', linkedin: '', website: '' },
    profileImage: '', currentCompany: '', jobRole: '', department: '', rollNumber: ''
  });

  // --- Init ---
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(storedUser);

    const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let data;
        // Determine if we are fetching "me" or a specific ID
        const targetId = id || currentUser?._id;
        
        if (!id && !currentUser) return; // Wait for auth

        if (currentUser && targetId === currentUser._id) {
           const res = await api.get('/auth/me');
           data = res.data;
           setIsOwner(true);
        } else {
           const res = await api.get(`/auth/users?id=${targetId}`);
           // Handle array response if search endpoint returns list
           const foundUser = Array.isArray(res.data) ? res.data.find(u => u._id === targetId) : res.data;
           data = foundUser || res.data; // Fallback
           setIsOwner(false);
        }

        if (!data) throw new Error("User data not found");

        setUser(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          about: data.about || '',
          location: data.location || '',
          skills: data.skills || [],
          socialLinks: {
            github: data.socialLinks?.github || '',
            linkedin: data.socialLinks?.linkedin || '',
            website: data.socialLinks?.website || ''
          },
          profileImage: data.profileImage || '',
          currentCompany: data.currentCompany || '',
          jobRole: data.jobRole || '',
          department: data.department || '',
          rollNumber: data.rollNumber || ''
        });

      } catch (err) {
        console.error("Profile Load Error:", err);
        toast.error("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser || id) fetchProfile();
  }, [id, currentUser]);

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e) => {
    setFormData({ 
      ...formData, 
      socialLinks: { ...formData.socialLinks, [e.target.name]: e.target.value } 
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setFormData(prev => ({ ...prev, profileImage: reader.result }));
    }
  };

  // Advanced Skill Handler
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(newSkill.trim())) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleSave = async () => {
    const toastId = toast.loading("Saving changes...");
    try {
      const res = await api.put('/auth/me/update', formData);
      setUser(res.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to update profile.', { id: toastId });
    }
  };

  // Navigation Logic for Admin sidebar interaction
  const handleSidebarNavigation = (tab) => {
    if (currentUser?.role === 'Admin') {
      navigate('/admin-dashboard');
    } else {
      navigate(tab === 'jobs' ? '/jobs' : tab === 'events' ? '/events' : '/dashboard');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
      <Loader className="animate-spin" size={40} />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BlueLightsBackground />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* SIDEBAR */}
        <AnimatePresence mode='wait'>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              className="absolute lg:relative z-50 w-72 h-full flex-shrink-0 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl"
            >
              {currentUser?.role === 'Admin' ? (
                <AdminSidebar 
                  isOpen={true} 
                  toggleSidebar={() => setIsSidebarOpen(false)}
                  activeTab="" 
                  setActiveTab={handleSidebarNavigation} 
                />
              ) : (
                <Sidebar 
                  isOpen={true} 
                  toggleSidebar={() => setIsSidebarOpen(false)} 
                />
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          
          {/* GLASS NAVBAR */}
          <nav className="h-20 px-6 flex justify-between items-center sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 rounded-xl text-cyan-400 hover:bg-white/5 transition-colors"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold tracking-wide text-white">
                {isOwner ? "My Profile" : "User Profile"}
              </h2>
            </div>

            {isOwner && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm shadow-lg transition-all border ${
                  isEditing 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30' 
                    : 'bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500'
                }`}
              >
                {isEditing ? <><Save size={16}/> Save Changes</> : <><Edit2 size={16}/> Edit Profile</>}
              </motion.button>
            )}
          </nav>

          <main className="p-4 lg:p-8 max-w-5xl mx-auto w-full">
            
            {/* 1. HEADER PROFILE CARD */}
            <div className="relative rounded-3xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-md shadow-2xl mb-8">
              {/* Cover Gradient */}
              <div className="h-40 bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              </div>

              <div className="px-8 pb-8 pt-0 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12">
                
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full p-1 bg-slate-950 ring-4 ring-slate-900/50 relative overflow-hidden">
                    <img 
                      src={formData.profileImage || user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=22d3ee`} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                    {isEditing && (
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="text-white" size={24} />
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>

                {/* Name & Basic Info */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      {isEditing ? (
                        <input 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          className="text-3xl font-bold bg-transparent border-b border-white/20 focus:border-cyan-400 outline-none text-white w-full md:w-96"
                          placeholder="Your Name"
                        />
                      ) : (
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                          {user.name}
                          {user.role === 'Admin' && <Shield size={20} className="text-amber-400" />}
                        </h1>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                          {user.role}
                        </span>
                        {user.role === 'Student' && user.batch && (
                           <span className="flex items-center gap-1"><Calendar size={14}/> Batch {user.batch}</span>
                        )}
                        <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* About Me */}
                <GlassCard title="About Me" icon={<UserIcon size={18} className="text-cyan-400"/>}>
                   {isEditing ? (
                     <textarea 
                       name="bio" 
                       value={formData.bio} 
                       onChange={handleChange} 
                       rows={4}
                       className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-slate-300 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none"
                       placeholder="Tell us about yourself..."
                     />
                   ) : (
                     <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                       {user.bio || "No bio information provided yet."}
                     </p>
                   )}
                </GlassCard>

                {/* Professional / Academic Info */}
                <GlassCard 
                  title={user.role === 'Alumni' ? 'Work Experience' : 'Academic Details'} 
                  icon={<Briefcase size={18} className="text-cyan-400"/>}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup 
                      label={user.role === 'Alumni' ? 'Current Company' : 'Department'}
                      name={user.role === 'Alumni' ? 'currentCompany' : 'department'}
                      value={user.role === 'Alumni' ? formData.currentCompany : formData.department}
                      isEditing={isEditing}
                      onChange={handleChange}
                    />
                    <InputGroup 
                      label={user.role === 'Alumni' ? 'Job Role' : 'Roll Number'}
                      name={user.role === 'Alumni' ? 'jobRole' : 'rollNumber'}
                      value={user.role === 'Alumni' ? formData.jobRole : formData.rollNumber}
                      isEditing={isEditing}
                      onChange={handleChange}
                    />
                    <InputGroup 
                      label="Location"
                      name="location"
                      value={formData.location}
                      isEditing={isEditing}
                      onChange={handleChange}
                      icon={<MapPin size={14}/>}
                    />
                  </div>
                </GlassCard>

              </div>

              {/* Right Column: Skills & Socials */}
              <div className="space-y-6">
                
                {/* Skills */}
                <GlassCard title="Skills" icon={<Code size={18} className="text-cyan-400"/>}>
                   {isEditing && (
                     <div className="relative mb-4">
                       <input 
                         type="text" 
                         value={newSkill}
                         onChange={(e) => setNewSkill(e.target.value)}
                         onKeyDown={handleAddSkill}
                         placeholder="Type skill & press Enter"
                         className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                       />
                       <Plus size={16} className="absolute right-3 top-2.5 text-slate-500" />
                     </div>
                   )}
                   <div className="flex flex-wrap gap-2">
                     {formData.skills.length > 0 ? (
                       formData.skills.map((skill, index) => (
                         <motion.span 
                           key={index} 
                           initial={{ scale: 0.8, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-lg text-xs font-semibold flex items-center gap-2 group"
                         >
                           {skill}
                           {isEditing && (
                             <X 
                               size={12} 
                               className="cursor-pointer hover:text-white"
                               onClick={() => removeSkill(skill)}
                             />
                           )}
                         </motion.span>
                       ))
                     ) : (
                       <span className="text-slate-500 text-sm italic">No skills listed yet.</span>
                     )}
                   </div>
                </GlassCard>

                {/* Social Links */}
                <GlassCard title="Connect" icon={<LinkIcon size={18} className="text-cyan-400"/>}>
                  <div className="space-y-4">
                    <SocialInput 
                      icon={<Github size={18} />} 
                      label="GitHub"
                      name="github"
                      value={formData.socialLinks.github}
                      isEditing={isEditing}
                      onChange={handleSocialChange}
                    />
                    <SocialInput 
                      icon={<Linkedin size={18} className="text-blue-400"/>} 
                      label="LinkedIn"
                      name="linkedin"
                      value={formData.socialLinks.linkedin}
                      isEditing={isEditing}
                      onChange={handleSocialChange}
                    />
                    <SocialInput 
                      icon={<Globe size={18} className="text-emerald-400"/>} 
                      label="Website"
                      name="website"
                      value={formData.socialLinks.website}
                      isEditing={isEditing}
                      onChange={handleSocialChange}
                    />
                  </div>
                </GlassCard>

              </div>
            </div>
            
          </main>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components for Clean Code ---

const GlassCard = ({ title, icon, children }) => (
  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
      {icon}
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const InputGroup = ({ label, name, value, isEditing, onChange, icon }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1">
      {icon} {label}
    </label>
    {isEditing ? (
      <input 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none transition-colors"
      />
    ) : (
      <p className="text-slate-200 font-medium">{value || <span className="text-slate-600 italic">N/A</span>}</p>
    )}
  </div>
);

const SocialInput = ({ icon, label, name, value, isEditing, onChange }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 border border-white/5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      {isEditing ? (
        <input 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={`Add ${label} URL`}
          className="w-full bg-transparent border-b border-white/10 text-sm text-cyan-300 focus:border-cyan-500 outline-none py-1 placeholder-slate-600"
        />
      ) : (
        value ? (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`} 
            target="_blank" 
            rel="noreferrer" 
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm text-slate-600 italic">Not connected</span>
        )
      )}
    </div>
  </div>
);

export default Profile;