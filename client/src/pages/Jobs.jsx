import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, ExternalLink, PlusCircle, Building, 
  Menu, Search, Calendar, Globe, ArrowRight 
} from 'lucide-react';

// Components & Utils
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import BlueLightsBackground from '../components/BlueLightsBackground'; // Theme Standard
import logo from '../assets/logo.png'; 

const Jobs = () => {
  const navigate = useNavigate();
  
  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // --- RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
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
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <motion.aside 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="absolute lg:relative z-50 w-72 h-full flex-shrink-0 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl"
            >
              <Sidebar isOpen={true} toggleSidebar={() => setIsSidebarOpen(false)} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 3. MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          
          {/* NAVBAR */}
          <nav className="h-20 px-6 flex justify-between items-center sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl text-cyan-400 hover:bg-white/5 transition-colors">
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
                <Briefcase size={20} className="text-cyan-400"/> Career Hub
              </h2>
            </div>

            <div className="flex items-center gap-4">
               {/* Search Bar (Desktop) */}
               <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-72 focus-within:border-cyan-500/50 transition-colors">
                <Search size={16} className="text-slate-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search jobs, skills, companies..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 w-full"
                />
              </div>

              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${user?.role === 'Student' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {user?.role}
                 </span>
                 <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-r from-cyan-500 to-blue-500">
                    <img src={logo} alt="Profile" className="w-full h-full rounded-full bg-slate-900 object-cover" />
                 </div>
              </div>
            </div>
          </nav>

          {/* CONTENT AREA */}
          <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
              <div>
                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                  Explore Opportunities <span className="text-cyan-400">.</span>
                </h1>
                <p className="text-slate-400 text-lg">
                  Curated roles posted by our trusted alumni network.
                </p>
              </div>

              {user?.role === 'Alumni' && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/post-job')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all"
                >
                  <PlusCircle size={20} /> Post Opportunity
                </motion.button>
              )}
            </div>

            {/* Mobile Search (Visible only on small screens) */}
            <div className="md:hidden mb-8 relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={20}/>
              <input 
                type="text" 
                placeholder="Search jobs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Jobs Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-3xl border-dashed bg-white/5">
                <Briefcase size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg font-medium">No jobs found matching your search.</p>
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

// --- SUB-COMPONENT: JOB CARD ---
const JobCard = ({ job }) => {
  const skills = job.skills ? (typeof job.skills === 'string' ? job.skills.split(',') : job.skills) : [];

  return (
    <motion.div
      layout
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      whileHover={{ y: -5 }}
      className="group relative bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden flex flex-col justify-between h-full hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300"
    >
      {/* Decorative Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
            <Building size={24} />
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/5">
            <Calendar size={10} /> {new Date(job.postedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Job Details */}
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1" title={job.title}>
          {job.title}
        </h3>
        <p className="text-sm text-slate-400 font-medium mb-3 flex items-center gap-2">
          {job.company} <span className="w-1 h-1 bg-slate-600 rounded-full"></span> 
          <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
        </p>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index} 
              className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/10"
            >
              {skill.trim()}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="text-xs px-2 py-1 text-slate-500">+{skills.length - 3}</span>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <a 
        href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-auto w-full group/btn relative flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-sm hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/20"
      >
        Apply Now 
        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
      </a>

    </motion.div>
  );
};

export default Jobs;