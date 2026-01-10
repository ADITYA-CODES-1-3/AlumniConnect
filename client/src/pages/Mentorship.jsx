import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { 
  User, CheckCircle, XCircle, Send, Menu, Search, 
  MessageSquare, Clock, Trash2, Shield, Briefcase 
} from 'lucide-react';

// Components & Utils
import api, { SERVER_URL } from '../utils/api';
import Sidebar from '../components/Sidebar';
import BlueLightsBackground from '../components/BlueLightsBackground'; // Theme Standard
import Loader from '../components/Loader'; // Assuming you have a loader or use inline

// --- SOCKET CONNECTION ---
const socket = io.connect(SERVER_URL); 

const Mentorship = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  // State
  const [dataList, setDataList] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // --- RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- SOCKET & DATA SYNC ---
  useEffect(() => {
    if (!user?._id) return;

    // 1. Join Room
    socket.emit("join_room", user._id);

    // 2. Notification Listener
    const handleNotification = () => {
      toast.success('Mentorship Update Received!', { icon: '🔔' });
      refreshData();
    };

    socket.on("receive_notification", handleNotification);

    // 3. Initial Fetch
    refreshData();

    return () => {
      socket.off("receive_notification", handleNotification);
    };
  }, [user]);

  const refreshData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'Student') {
        const [alumniRes, requestsRes] = await Promise.all([
          api.get('/auth/users?role=Alumni'),
          api.get('/mentorship/my-requests')
        ]);
        setDataList(alumniRes.data);
        setMyRequests(requestsRes.data);
      } else if (user?.role === 'Alumni') {
        const res = await api.get('/mentorship/my-requests');
        // Filter out rejected to keep list clean
        setDataList(res.data.filter(req => req.status !== 'Rejected'));
      }
    } catch (err) {
      console.error("Data Load Error", err);
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleSendRequest = async (alumniId) => {
    const toastId = toast.loading("Sending request...");
    try {
      await api.post('/mentorship/request', { alumniId, message: "I am interested in your guidance." });
      socket.emit("send_notification", { receiverId: alumniId });
      await refreshData();
      toast.success('Request Sent Successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request', { id: toastId });
    }
  };

  const handleStatusUpdate = async (id, status, studentId) => {
    try {
      // Optimistic UI Update
      setDataList(prev => prev.filter(req => req._id !== id)); 
      
      await api.put(`/mentorship/update/${id}`, { status });
      socket.emit("send_notification", { receiverId: studentId });
      toast.success(`Request ${status}`);
      
      // Background refresh to ensure consistency
      refreshData();
    } catch (err) {
      toast.error('Update failed');
      refreshData(); // Revert on error
    }
  };

  const handleRemoveConnection = async (requestId, otherUserId) => {
    if (!window.confirm("Disconnect from this user?")) return;
    try {
      await api.delete(`/mentorship/remove/${requestId}`);
      socket.emit("send_notification", { receiverId: otherUserId });
      await refreshData();
      toast.success('Connection Removed');
    } catch (err) {
      toast.error('Failed to remove connection');
    }
  };

  // --- HELPERS ---
  const getRequestInfo = (alumniId) => myRequests.find(req => req.alumniId?._id === alumniId);

  const filteredData = dataList.filter(item => {
    const name = item.name || item.studentId?.name || '';
    const company = item.currentCompany || '';
    const role = item.jobRole || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Animation Variants
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
                <Briefcase size={20} className="text-cyan-400"/> Mentorship
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64 focus-within:border-cyan-500/50 transition-colors">
                <Search size={16} className="text-slate-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search mentors..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 w-full"
                />
              </div>

              {/* User Badge */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${user.role === 'Student' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {user.role}
                 </span>
              </div>
            </div>
          </nav>

          {/* PAGE CONTENT */}
          <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.role === 'Student' ? 'Find Your Mentor' : 'Mentorship Requests'}
              </h1>
              <p className="text-slate-400">
                {user?.role === 'Student' 
                  ? 'Connect with alumni to accelerate your career and gain industry insights.' 
                  : 'Empower the next generation. Manage your incoming mentorship requests here.'}
              </p>
            </motion.div>

            {/* LOADING STATE */}
            {loading ? (
              <div className="flex justify-center py-20"><Loader /></div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredData.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-500 border border-white/5 rounded-2xl border-dashed">
                    <User size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No records found matching your criteria.</p>
                  </div>
                ) : (
                  filteredData.map((item) => {
                    // Logic differentiation based on role
                    const isStudentView = user.role === 'Student';
                    const targetUser = isStudentView ? item : item.studentId;
                    const request = isStudentView ? getRequestInfo(item._id) : item;
                    const status = request ? request.status : null;

                    return (
                      <GlassCard 
                        key={item._id}
                        item={item}
                        targetUser={targetUser}
                        isStudentView={isStudentView}
                        status={status}
                        request={request}
                        navigate={navigate}
                        actions={{ handleSendRequest, handleStatusUpdate, handleRemoveConnection }}
                      />
                    );
                  })
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: GLASS CARD ---
const GlassCard = ({ item, targetUser, isStudentView, status, request, navigate, actions }) => {
  const { handleSendRequest, handleStatusUpdate, handleRemoveConnection } = actions;

  // Determine Badge Colors
  const getStatusBadge = (s) => {
    switch (s) {
      case 'Accepted': return <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20"><CheckCircle size={12} /> Connected</span>;
      case 'Pending': return <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20"><Clock size={12} /> Pending</span>;
      default: return null;
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(6, 182, 212, 0.15)" }}
      className="group relative bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 overflow-hidden flex flex-col h-full"
    >
      {/* Decorative Gradient Top */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${status === 'Accepted' ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} />

      {/* Header Profile */}
      <div className="flex items-start justify-between mb-4">
        <div 
          onClick={() => navigate(`/profile/${targetUser?._id}`)} 
          className="flex items-center gap-4 cursor-pointer"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-transparent">
              <img 
                src={targetUser?.profileImage || `https://ui-avatars.com/api/?name=${targetUser?.name}&background=0f172a&color=22d3ee`} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover border-2 border-slate-900 bg-slate-900"
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
              {targetUser?.name}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              {targetUser?.role === 'Alumni' && <Briefcase size={10} />}
              {targetUser?.currentCompany || targetUser?.department || 'User'}
            </p>
          </div>
        </div>
        <div>
          {getStatusBadge(status)}
        </div>
      </div>

      {/* Info / Message */}
      <div className="flex-1">
        {/* If Alumni View: Show Message */}
        {!isStudentView && (
           <div className="bg-black/20 p-3 rounded-lg mb-4 text-sm text-slate-300 italic border border-white/5">
             "{item.message}"
           </div>
        )}

        {/* If Student View: Show Skills */}
        {isStudentView && targetUser?.skills && (
          <div className="flex flex-wrap gap-2 mb-4">
            {targetUser.skills.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400 border border-white/5">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-white/10">
        
        {/* SCENARIO 1: ALUMNI VIEW - PENDING */}
        {!isStudentView && status === 'Pending' && (
          <div className="grid grid-cols-2 gap-3">
            <ActionBtn 
              onClick={() => handleStatusUpdate(item._id, 'Accepted', targetUser?._id)} 
              icon={<CheckCircle size={16} />} 
              label="Accept" 
              variant="success" 
            />
            <ActionBtn 
              onClick={() => handleStatusUpdate(item._id, 'Rejected', targetUser?._id)} 
              icon={<XCircle size={16} />} 
              label="Reject" 
              variant="danger" 
            />
          </div>
        )}

        {/* SCENARIO 2: ALUMNI VIEW - ACCEPTED */}
        {!isStudentView && status === 'Accepted' && (
           <div className="grid grid-cols-2 gap-3">
             <ActionBtn 
               onClick={() => navigate(`/chat/${targetUser?._id}`)}
               icon={<MessageSquare size={16} />}
               label="Chat"
               variant="primary"
             />
             <ActionBtn 
               onClick={() => handleRemoveConnection(item._id, targetUser?._id)}
               icon={<Trash2 size={16} />}
               label="Remove"
               variant="outline-danger"
             />
           </div>
        )}

        {/* SCENARIO 3: STUDENT VIEW - NO REQUEST */}
        {isStudentView && !status && (
          <ActionBtn 
            onClick={() => handleSendRequest(targetUser?._id)}
            icon={<Send size={16} />}
            label="Request Mentorship"
            variant="glow"
            fullWidth
          />
        )}

        {/* SCENARIO 4: STUDENT VIEW - PENDING */}
        {isStudentView && status === 'Pending' && (
          <div className="grid grid-cols-2 gap-3">
            <button disabled className="flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-semibold opacity-75 cursor-not-allowed">
               <Clock size={16} /> Waiting
            </button>
            <ActionBtn 
               onClick={() => handleRemoveConnection(request._id, targetUser?._id)}
               icon={<XCircle size={16} />}
               label="Cancel"
               variant="outline-danger"
             />
          </div>
        )}

        {/* SCENARIO 5: STUDENT VIEW - ACCEPTED */}
        {isStudentView && status === 'Accepted' && (
           <div className="grid grid-cols-2 gap-3">
             <ActionBtn 
               onClick={() => navigate(`/chat/${targetUser?._id}`)}
               icon={<MessageSquare size={16} />}
               label="Chat Now"
               variant="success-glow"
             />
             <ActionBtn 
               onClick={() => handleRemoveConnection(request._id, targetUser?._id)}
               icon={<Trash2 size={16} />}
               label="Disconnect"
               variant="outline-danger"
             />
           </div>
        )}

      </div>
    </motion.div>
  );
};

// --- BUTTON UTILITY ---
const ActionBtn = ({ onClick, icon, label, variant, fullWidth }) => {
  const base = "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95";
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20",
    glow: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20",
    "success-glow": "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white",
    "outline-danger": "bg-transparent text-rose-400 border border-rose-500/20 hover:bg-rose-500/10",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''}`}>
      {icon} {label}
    </button>
  );
};

export default Mentorship;