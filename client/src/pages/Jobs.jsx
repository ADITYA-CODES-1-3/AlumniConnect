import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, Building, Menu, Search, 
  Calendar, ArrowRight, DollarSign, Clock, Filter 
} from 'lucide-react';

// Components & Utils
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import BlueLightsBackground from '../components/BlueLightsBackground'; 
import logo from '../assets/logo.png'; 

const Jobs = () => {
  const navigate = useNavigate();
  
  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // --- RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => {
       if(window.innerWidth > 1024) setIsSidebarOpen(true);
       else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/jobs/all');
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // --- FILTER LOGIC ---
  const filteredJobs = jobs.filter(job => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(lowerTerm) ||
      job.company?.toLowerCase().includes(lowerTerm) ||
      job.skills?.toLowerCase().includes(lowerTerm) ||
      job.location?.toLowerCase().includes(lowerTerm)
    );
  });

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* 1. BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BlueLightsBackground />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* 2. SIDEBAR */}
        <AnimatePresence mode='wait'>
          {isSidebarOpen && (
             <>
             {/* Mobile Overlay */}
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsSidebarOpen(false)}
               className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
             />
            <motion.aside 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="fixed lg:relative z-50 w-72 h-full flex-shrink-0 border-r border-white/10 bg-slate-900/90 backdrop-blur-xl"
            >
              <Sidebar isOpen={true} toggleSidebar={() => setIsSidebarOpen(false)} />
            </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* 3. MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          
          {/* NAVBAR */}
          <nav className="h-20 px-6 flex justify-between items-center sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/5 transition-all">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors">
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold tracking-wide text-white hidden sm:flex items-center gap-2">
                <Briefcase size={20} className="text-cyan-400"/> 
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Career Hub</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
               {/* Role Badge */}
              <div className="hidden sm:flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 border border-white/10 text-slate-400">
                 {user?.role} Mode
              </div>
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-cyan-500 to-blue-600">
                <img src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=0f172a&color=38bdf8`} alt="Profile" className="w-full h-full rounded-full bg-slate-950 object-cover border-2 border-slate-950" />
              </div>
            </div>
          </nav>

          {/* CONTENT AREA */}
          <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
            
            {/* HERO SECTION */}
            <div className="relative mb-12 text-center lg:text-left">
              <motion.h1 
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight"
              >
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Dream Job</span>
              </motion.h1>
              <motion.p 
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="text-slate-400 text-lg max-w-2xl mx-auto lg:mx-0"
              >
                Exclusive opportunities from the AlumniConnect network. 
                <span className="text-cyan-400 font-medium"> {jobs.length} active listings</span> waiting for you.
              </motion.p>

              {/* SEARCH BAR (Floating) */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="mt-8 relative max-w-2xl mx-auto lg:mx-0 group z-20"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none backdrop-blur-xl transition-all shadow-lg shadow-black/50"
                  placeholder="Search by title, company, or skills (e.g. 'Java', 'Google')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                    <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
              </motion.div>

              {/* POST JOB BUTTON (Absolute Positioned on Desktop) */}
              {user?.role === 'Alumni' && (
                <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   className="mt-6 lg:mt-0 lg:absolute lg:right-0 lg:bottom-4"
                >
                  <button 
                    onClick={() => navigate('/post-job')}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold shadow-lg shadow-orange-900/20 hover:shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 mx-auto lg:mx-0"
                  >
                    Post a Job <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </div>

            {/* JOBS GRID */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
                <p className="text-slate-500 animate-pulse">Fetching opportunities...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-3xl bg-slate-900/40 border border-white/5 border-dashed">
                <div className="p-6 bg-slate-900 rounded-full mb-4">
                    <Search size={32} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
                <p className="text-slate-500">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </motion.div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

// --- JOB CARD COMPONENT (Clean & Modern) ---
const JobCard = ({ job }) => {
  const skills = job.skills ? (typeof job.skills === 'string' ? job.skills.split(',') : job.skills) : [];
  
  // Smart detection for badges
  const isRemote = job.location?.toLowerCase().includes('remote');
  const isHybrid = job.location?.toLowerCase().includes('hybrid');
  
  return (
    <motion.div
      layout
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      whileHover={{ y: -5 }}
      className="group relative bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col h-full hover:border-cyan-500/30 transition-all duration-300"
    >
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 transition duration-500 blur-lg"></div>

        <div className="relative z-10 flex flex-col h-full">
            
            {/* Header: Company & Date */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                        {job.company.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="text-slate-200 font-bold text-sm leading-tight">{job.company}</h4>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {new Date(job.postedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                {/* Location Badge */}
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    isRemote 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : isHybrid 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                    {isRemote ? 'Remote' : isHybrid ? 'Hybrid' : 'On-site'}
                </div>
            </div>

            {/* Title & Location */}
            <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1" title={job.title}>
                    {job.title}
                </h3>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-500"/> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} className="text-slate-500"/> {job.salary || 'Competitive'}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} className="text-slate-500"/> {job.type || 'Full Time'}</span>
                </div>
            </div>

            {/* Description Preview */}
            <p className="text-sm text-slate-400/80 leading-relaxed line-clamp-2 mb-5 flex-grow">
                {job.description}
            </p>

            {/* Footer: Skills & Button */}
            <div className="mt-auto space-y-4">
                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] text-cyan-200/70">
                            {skill.trim()}
                        </span>
                    ))}
                    {skills.length > 3 && (
                        <span className="px-2 py-1 rounded-md bg-transparent text-[11px] text-slate-500">
                            +{skills.length - 3}
                        </span>
                    )}
                </div>

                {/* Action Button */}
                <a 
                    href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white text-sm font-semibold transition-all group/btn border border-white/5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                    Apply Now <ArrowRight size={16} className="text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                </a>
            </div>
        </div>
    </motion.div>
  );
};

export default Jobs;