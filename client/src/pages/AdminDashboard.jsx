import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, GraduationCap, Clock, Menu, Search, XCircle, 
  CheckCircle, TrendingUp, Loader, AlertCircle, Shield, ChevronRight
} from 'lucide-react';

// Components & Assets
import api from '../utils/api';
import AdminSidebar from '../components/AdminSidebar';
import BlueLightsBackground from '../components/BlueLightsBackground'; // Matching Login Theme
import logo from '../assets/logo.png'; 

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on large screens
  const [stats, setStats] = useState({ students: 0, alumni: 0, pending: 0 });
  const [dataList, setDataList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Responsive Sidebar Handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    // Set initial state
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Stats on Mount
  useEffect(() => { fetchStats(); }, []);

  // Fetch Data when Tab Changes
  useEffect(() => {
    setSearchTerm('');
    if (activeTab !== 'dashboard') {
      const type = activeTab === 'students' ? 'Student' : activeTab === 'alumni' ? 'Alumni' : 'Pending';
      fetchData(type);
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/auth/stats');
      setStats(res.data);
    } catch (err) { 
      console.error("Stats Error:", err);
    }
  };

  const fetchData = async (type) => {
    setLoading(true);
    try {
      const endpoint = type === 'Pending' ? '/auth/pending-users' : `/auth/users?role=${type}`;
      const res = await api.get(endpoint);
      setDataList(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error(`Failed to load ${type} data`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      // Optimistic Update
      setDataList(prev => prev.filter(u => u._id !== id));
      setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
      
      await api.put(`/auth/approve/${id}`);
      toast.success('User Approved Successfully');
      fetchStats(); 
    } catch (err) {
      toast.error('Approval Failed');
      fetchData('Pending'); 
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this user?")) return;
    try {
      setDataList(prev => prev.filter(u => u._id !== id));
      setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
      await api.delete(`/auth/reject/${id}`);
      toast.success('User Rejected');
      fetchStats();
    } catch (err) {
      toast.error('Rejection Failed');
      fetchData('Pending');
    }
  };

  const filteredList = dataList.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. BACKGROUND LAYER - Matches Login/Register */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BlueLightsBackground />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]" />
      </div>

      {/* 2. MAIN LAYOUT */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* SIDEBAR WRAPPER */}
        <AnimatePresence mode='wait'>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="absolute lg:relative z-50 w-72 h-full flex-shrink-0"
            >
              <div className="h-full border-r border-cyan-500/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                 <AdminSidebar 
                   isOpen={true} 
                   toggleSidebar={() => setIsSidebarOpen(false)} 
                   activeTab={activeTab} 
                   setActiveTab={setActiveTab} 
                 />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          
          {/* TOP NAVIGATION BAR */}
          <header className="h-20 px-8 flex items-center justify-between border-b border-cyan-500/10 bg-slate-900/30 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 rounded-xl hover:bg-white/5 transition-colors text-cyan-400"
              >
                <Menu size={24} />
              </button>
              <div className="hidden sm:flex flex-col">
                <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <Shield size={18} className="text-cyan-400" /> Admin Console
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-white">Super Admin</span>
                <span className="text-xs text-cyan-400 font-mono">system.root</span>
              </div>
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                <img src={logo} alt="Admin" className="relative w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-900" />
              </div>
            </div>
          </header>

          {/* SCROLLABLE MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {activeTab === 'dashboard' ? (
                <DashboardStats stats={stats} />
              ) : (
                <DirectoryView 
                  title={activeTab} 
                  data={filteredList} 
                  loading={loading} 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  navigate={navigate}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                />
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS FOR CLEANLINESS ---

const DashboardStats = ({ stats }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.4 }}
    className="space-y-8"
  >
    {/* Welcome Banner */}
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-8 lg:p-12 shadow-2xl">
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          System Overview
        </h1>
        <p className="text-cyan-100/70 max-w-2xl text-lg leading-relaxed">
          Welcome back, Admin. You have full control over the AlumniConnect ecosystem. 
          Manage users, verify requests, and monitor platform growth efficiently.
        </p>
      </div>
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
    </div>

    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Active Students" 
        count={stats.students} 
        icon={<Users className="w-6 h-6 text-emerald-400" />} 
        accentColor="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      />
      <StatCard 
        title="Alumni Network" 
        count={stats.alumni} 
        icon={<GraduationCap className="w-6 h-6 text-amber-400" />} 
        accentColor="bg-amber-500/10 border-amber-500/20 text-amber-400"
      />
      <StatCard 
        title="Pending Actions" 
        count={stats.pending} 
        icon={<Clock className="w-6 h-6 text-rose-400" />} 
        accentColor="bg-rose-500/10 border-rose-500/20 text-rose-400"
      />
    </div>
  </motion.div>
);

const StatCard = ({ title, count, icon, accentColor }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={`p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between h-40 transition-all shadow-lg ${accentColor}`}
  >
    <div className="flex justify-between items-start">
      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
        {icon}
      </div>
      <TrendingUp size={20} className="opacity-50" />
    </div>
    <div>
      <h3 className="text-sm font-medium uppercase tracking-wider opacity-80">{title}</h3>
      <p className="text-4xl font-extrabold mt-1">{count}</p>
    </div>
  </motion.div>
);

const DirectoryView = ({ title, data, loading, searchTerm, setSearchTerm, navigate, handleApprove, handleReject }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    
    {/* Header & Controls */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
      <div>
        <h2 className="text-3xl font-bold text-white capitalize flex items-center gap-3">
          {title} <span className="text-slate-500 text-xl font-normal">Management</span>
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          {loading ? 'Synchronizing database...' : `Found ${data.length} records matching your criteria.`}
        </p>
      </div>

      <div className="relative group w-full md:w-80">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
        <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
          <div className="pl-4 text-slate-500"><Search size={18} /></div>
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-white px-4 py-3 focus:ring-0 placeholder-slate-600 outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="pr-4 text-slate-500 hover:text-white transition-colors">
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Content Area */}
    {loading ? (
      <div className="h-64 flex items-center justify-center">
        <Loader className="animate-spin text-cyan-400" size={40} />
      </div>
    ) : data.length === 0 ? (
      <div className="h-64 flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 border-dashed">
        <AlertCircle size={40} className="text-slate-600 mb-3" />
        <p className="text-slate-400">No records found.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {data.map(user => (
            <UserCard 
              key={user._id} 
              user={user} 
              navigate={navigate} 
              isPending={title === 'pending'}
              onApprove={() => handleApprove(user._id)}
              onReject={() => handleReject(user._id)}
            />
          ))}
        </AnimatePresence>
      </div>
    )}
  </motion.div>
);

const UserCard = ({ user, navigate, isPending, onApprove, onReject }) => {
  const roleColor = user.role === 'Student' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' 
                  : user.role === 'Alumni' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                  : 'text-rose-400 bg-rose-400/10 border-rose-400/20';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => navigate(`/profile/${user._id}`)}
      className="group relative bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={20} className="text-cyan-500" />
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg font-bold text-white border border-white/10 shadow-inner">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold truncate group-hover:text-cyan-400 transition-colors">{user.name}</h4>
          <p className="text-slate-500 text-xs truncate mb-2">{user.email}</p>
          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${roleColor}`}>
            {user.role} {user.department ? `• ${user.department}` : ''}
          </span>
        </div>
      </div>

      {isPending && (
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/10">
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
          >
            <CheckCircle size={14} /> Approve
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
          >
            <XCircle size={14} /> Reject
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;