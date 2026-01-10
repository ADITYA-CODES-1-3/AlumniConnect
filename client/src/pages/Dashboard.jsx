import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, TrendingUp, Briefcase, Users, Calendar, 
  Activity, Bell, ChevronRight, Search 
} from 'lucide-react';

// Components & Utils
import api from '../utils/api';
import Sidebar from '../components/Sidebar'; 
import BlueLightsBackground from '../components/BlueLightsBackground'; // Theme Standard

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [loading, setLoading] = useState(true);

  // Initialize stats with specific keys to match API structure
  const [stats, setStats] = useState({ 
    card1: { label: "Active Jobs", value: 0 }, 
    card2: { label: "Mentorships", value: 0 }, 
    card3: { label: "Events", value: 0 } 
  });

  // --- RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    const initDashboard = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        navigate('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Parallel Fetch: Profile Refresh + Stats
        const [profileRes, statsRes] = await Promise.allSettled([
          api.get('/auth/me'),
          api.get('/auth/dashboard-stats')
        ]);

        // Handle Profile Update
        if (profileRes.status === 'fulfilled') {
          setUser(profileRes.value.data);
          localStorage.setItem('user', JSON.stringify(profileRes.value.data));
        }

        // Handle Stats Update
        if (statsRes.status === 'fulfilled' && statsRes.value.data?.card1) {
          setStats(statsRes.value.data);
        }

      } catch (e) {
        console.error("Dashboard Init Error", e);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  const getProfileImage = () => {
    if (user?.profileImage?.startsWith('data:image')) return user.profileImage;
    return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0f172a&color=38bdf8`;
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* 1. BACKGROUND LAYER */}
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
          
          {/* GLASS NAVBAR */}
          <nav className="h-20 px-6 flex justify-between items-center sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 rounded-xl text-cyan-400 hover:bg-white/5 transition-colors"
              >
                <Menu size={24} />
              </button>
              
              {/* Search Bar (Visual Only) */}
              <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64 focus-within:border-cyan-500/50 transition-colors">
                <Search size={16} className="text-slate-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search network..." 
                  className="bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white leading-none">{user?.name}</p>
                  <p className="text-xs text-cyan-400 mt-1 uppercase tracking-wider font-semibold">{user?.role}</p>
                </div>
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600">
                  <img 
                    src={getProfileImage()} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-900"
                  />
                </div>
              </div>
            </div>
          </nav>

          <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              
              {/* 4. WELCOME BANNER */}
              <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-slate-900/40 border border-white/10 p-8 lg:p-10 shadow-2xl group">
                <div className="relative z-10">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3">
                    Hello, {user?.name?.split(' ')[0]}! <span className="text-cyan-400">👋</span>
                  </h1>
                  <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                    {user?.role === 'Student' 
                      ? "Your future awaits. Explore internships, connect with alumni, and track your application status all in one place."
                      : "Welcome back to the network. Connect with aspiring students and share your valuable industry experience."}
                  </p>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none"></div>
              </motion.div>

              {/* 5. STATS GRID */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  label={stats.card1.label} 
                  value={stats.card1.value} 
                  icon={<Briefcase size={24} />} 
                  color="text-cyan-400" 
                  bg="bg-cyan-500/10 border-cyan-500/20"
                />
                <StatCard 
                  label={stats.card2.label} 
                  value={stats.card2.value} 
                  icon={<Users size={24} />} 
                  color="text-amber-400" 
                  bg="bg-amber-500/10 border-amber-500/20"
                />
                <StatCard 
                  label={stats.card3.label} 
                  value={stats.card3.value} 
                  icon={<Calendar size={24} />} 
                  color="text-emerald-400" 
                  bg="bg-emerald-500/10 border-emerald-500/20"
                />
                <StatCard 
                  label="Status" 
                  value="Active" 
                  icon={<Activity size={24} />} 
                  color="text-white" 
                  bg="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-emerald-500/30"
                  isText
                />
              </motion.div>

              {/* 6. RECENT ACTIVITY SECTION */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" size={20}/> Recent Activity
                  </h3>
                  <button className="text-xs text-slate-400 hover:text-white transition-colors">View History</button>
                </div>

                <div className="min-h-[250px] flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 border-dashed backdrop-blur-sm group hover:border-cyan-500/30 transition-colors cursor-default">
                  <div className="p-4 rounded-full bg-slate-800/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Activity size={32} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <p className="text-slate-400 font-medium">No recent activity detected.</p>
                  <p className="text-slate-600 text-sm mt-1">Start by exploring Jobs or Mentorships.</p>
                  
                  <button 
                    onClick={() => navigate(user?.role === 'Student' ? '/jobs' : '/mentorship')}
                    className="mt-6 px-6 py-2 rounded-full bg-white/10 hover:bg-cyan-500 hover:text-slate-900 border border-white/10 text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    Explore Now <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>

            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

// --- REUSABLE COMPONENT ---

const StatCard = ({ label, value, icon, color, bg, isText }) => (
  <motion.div 
    whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
    className={`p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between h-32 transition-all ${bg}`}
  >
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</span>
        {isText ? (
           <span className={`text-2xl font-bold ${color}`}>{value}</span>
        ) : (
           <span className={`text-4xl font-extrabold text-white`}>{value}</span>
        )}
      </div>
      <div className={`p-2 rounded-lg bg-slate-950/30 ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default Dashboard;