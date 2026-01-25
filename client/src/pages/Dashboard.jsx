import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Briefcase, Users, Calendar, 
  Activity, Bell, ChevronRight, Search, 
  Clock, Zap, Shield 
} from 'lucide-react';

// Components & Utils
import api from '../utils/api';
import Sidebar from '../components/Sidebar'; 
import BlueLightsBackground from '../components/BlueLightsBackground'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [loading, setLoading] = useState(true);

  // Initial Stats
  const [stats, setStats] = useState([
    { title: 'Active Jobs', value: 0, icon: Briefcase, color: 'text-blue-400', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20', link: '/jobs' },
    { title: 'Mentors', value: 0, icon: Users, color: 'text-purple-400', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/20', link: '/mentorship' },
    { title: 'Events', value: 0, icon: Calendar, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20', link: '/events' },
  ]);

  const [recentActivity, setRecentActivity] = useState([]);

  // --- RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- SMART DATA PARSER (The Fix) ---
  // Macha, backend response structure epdi irundhalum idhu handle pannidum.
  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data; // Standard
    if (res.data && Array.isArray(res.data.data)) return res.data.data; // Nested data
    if (res.data && Array.isArray(res.data.jobs)) return res.data.jobs; // Specific keys
    if (res.data && Array.isArray(res.data.events)) return res.data.events;
    if (res.data && Array.isArray(res.data.mentors)) return res.data.mentors;
    return [];
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      setUser(JSON.parse(storedUser));

      try {
        const [jobsRes, eventsRes, mentorsRes] = await Promise.all([
          api.get('/jobs').catch(() => ({ data: [] })),
          api.get('/events').catch(() => ({ data: [] })),
          api.get('/mentorship/mentors').catch(() => ({ data: [] })) // Adjust route if needed
        ]);

        const jobs = extractArray(jobsRes);
        const events = extractArray(eventsRes);
        const mentors = extractArray(mentorsRes);

        setStats([
          { title: 'Active Jobs', value: jobs.length, icon: Briefcase, color: 'text-cyan-400', gradient: 'from-cyan-500/10 to-blue-600/10', border: 'border-cyan-500/20', link: '/jobs' },
          { title: 'Mentors', value: mentors.length, icon: Users, color: 'text-violet-400', gradient: 'from-violet-500/10 to-purple-600/10', border: 'border-violet-500/20', link: '/mentorship' },
          { title: 'Events', value: events.length, icon: Calendar, color: 'text-emerald-400', gradient: 'from-emerald-500/10 to-green-600/10', border: 'border-emerald-500/20', link: '/events' },
        ]);

        // Create Activity Stream
        const recentJobs = jobs.slice(0, 3).map(j => ({ 
          type: 'New Job', 
          title: j.title || j.role || 'Software Engineer', 
          time: 'Recently Added', 
          icon: Briefcase, 
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10' 
        }));

        const recentEvents = events.slice(0, 2).map(e => ({ 
          type: 'Event', 
          title: e.title || 'Tech Meetup', 
          time: new Date(e.date || Date.now()).toLocaleDateString(), 
          icon: Calendar, 
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10'
        }));

        setRecentActivity([...recentJobs, ...recentEvents]);

      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BlueLightsBackground />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-soft-light"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        
        {/* SIDEBAR - Mobile & Desktop handled */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Mobile Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
              />
              
              <motion.aside 
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed lg:relative z-50 w-72 h-full border-r border-white/5 bg-slate-900/90 backdrop-blur-xl"
              >
                <Sidebar isOpen={true} toggleSidebar={() => setIsSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* NAVBAR */}
          <header className="h-20 px-6 flex justify-between items-center sticky top-0 z-30 bg-slate-950/50 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Menu size={24} />
              </button>
              <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Shield size={14} className="text-cyan-500" />
                <span>AlumniConnect Secure Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[2px]">
                  <img 
                    src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=0f172a&color=38bdf8`} 
                    alt="Profile" 
                    className="h-full w-full rounded-full object-cover border-2 border-slate-950"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* SCROLLABLE AREA - "no-scrollbar" class applied here */}
          <main className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-8 space-y-8">
            
            {/* HERO CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-8 shadow-2xl group"
            >
              <div className="relative z-10">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-slate-400 max-w-xl">
                  {user?.role === 'Student' 
                    ? "Track your applications, connect with mentors, and skill up for your dream job."
                    : "Connect with students, share opportunities, and grow the alumni network."}
                </p>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-1000"></div>
            </motion.div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} onClick={() => navigate(stat.link)} delay={idx * 0.1} />
              ))}
            </div>

            {/* BOTTOM SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Activity */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity size={20} className="text-cyan-400" /> Recent Updates
                  </h3>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">View All</button>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-slate-500 text-center py-4">Syncing...</p>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group">
                        <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                          <item.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                          <p className="text-xs text-slate-500">{item.type} • {item.time}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-500">
                      <Clock className="mx-auto mb-2 opacity-50" />
                      <p>No recent activity found.</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-white flex items-center gap-2 px-2">
                  <Zap size={20} className="text-amber-400" /> Quick Actions
                </h3>
                <ActionButton label="Find a Mentor" desc="Get guidance" icon={Users} color="text-purple-400" onClick={() => navigate('/mentorship')} />
                <ActionButton label="Explore Jobs" desc="Apply now" icon={Briefcase} color="text-blue-400" onClick={() => navigate('/jobs')} />
                <ActionButton label="Upcoming Events" desc="Register" icon={Calendar} color="text-emerald-400" onClick={() => navigate('/events')} />
              </motion.div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color, gradient, border, onClick, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    onClick={onClick}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br ${gradient} border ${border} backdrop-blur-xl cursor-pointer group`}
  >
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-4xl font-black text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl bg-slate-950/30 ${color} shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
    {/* Decorative Glow */}
    <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-current opacity-10 blur-2xl rounded-full ${color}`}></div>
  </motion.div>
);

const ActionButton = ({ label, desc, icon: Icon, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 hover:bg-slate-800/80 transition-all text-left group shadow-lg"
  >
    <div className={`p-3 rounded-xl bg-slate-950 ${color} border border-white/5 group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h4 className="text-slate-200 font-semibold group-hover:text-white">{label}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
  </motion.button>
);

export default Dashboard;