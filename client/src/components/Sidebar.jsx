import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Briefcase, Calendar, 
  MessageSquare, LogOut, UserCircle, X, Shield, ChevronRight 
} from 'lucide-react';

// Import App Logo
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define Menu Items
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    { name: 'Mentorship', icon: <Users size={22} />, path: '/mentorship' },
    { name: 'Jobs & Internships', icon: <Briefcase size={22} />, path: '/jobs' },
    { name: 'Events', icon: <Calendar size={22} />, path: '/events' },
    { name: 'Community Chat', icon: <MessageSquare size={22} />, path: '/chat' },
    { name: 'My Profile', icon: <UserCircle size={22} />, path: '/profile' },
  ];

  // --- MOBILE SCROLL LOCK LOGIC ---
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && window.innerWidth < 1024) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };

    handleResize(); // Trigger immediately
    window.addEventListener('resize', handleResize);

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar automatically on mobile selection
    if (window.innerWidth < 1024) toggleSidebar();
  };

  // --- ANIMATION VARIANTS ---
  const sidebarVariants = {
    open: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 } 
    },
    closed: { 
      x: "-100%", 
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: (i) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { delay: i * 0.05, type: "spring", stiffness: 50 } 
    })
  };

  return (
    <>
      {/* 1. MOBILE BACKDROP OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. SIDEBAR CONTAINER */}
      <motion.aside 
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        className={`fixed top-0 left-0 h-full w-[290px] bg-[#0f172a]/95 backdrop-blur-2xl border-r border-white/10 z-[1000] flex flex-col shadow-2xl lg:translate-x-0 lg:static lg:h-screen lg:shadow-none`}
      >
        
        {/* HEADER WITH LOGO */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/5 relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

          <div className="flex items-center gap-3.5 z-10">
             {/* Logo Wrapper with Glow */}
             <div className="relative group cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full opacity-75 blur-md group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-10 h-10 rounded-full p-[2px] bg-slate-900 border border-white/10">
                  <img src={logo} alt="Logo" className="w-full h-full rounded-full object-cover" />
                </div>
             </div>
             
             <div className="flex flex-col">
               <h2 className="text-xl font-extrabold text-white tracking-wide leading-none">
                 Alumni<span className="text-cyan-400">Connect</span>
               </h2>
               <span className="text-[10px] text-slate-400 font-mono tracking-widest mt-1">EST. 2024</span>
             </div>
          </div>

          <button 
            onClick={toggleSidebar} 
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* MENU ITEMS */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          {menuItems.map((item, i) => {
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <motion.div
                key={item.name}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="show"
              >
                <div
                  onClick={() => handleNavigation(item.path)}
                  className={`relative flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_-10px_rgba(34,211,238,0.3)]' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                       {item.icon}
                    </div>
                    <span className={`text-[15px] font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                      {item.name}
                    </span>
                  </div>

                  {/* Active Arrow Indicator */}
                  {isActive && (
                    <motion.div layoutId="activeArrow" className="text-cyan-500">
                      <ChevronRight size={16} strokeWidth={3} />
                    </motion.div>
                  )}
                  
                  {/* Hover Light Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </nav>

        {/* FOOTER AREA */}
        <div className="p-5 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl relative">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-300 hover:shadow-[0_0_20px_-10px_rgba(244,63,94,0.3)] transition-all duration-300 font-bold text-sm group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="tracking-wide">Sign Out</span>
          </button>
          
          <div className="mt-4 flex flex-col items-center justify-center gap-1 opacity-50 hover:opacity-90 transition-opacity duration-300">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
               <Shield size={10} className="text-emerald-500" />
               <span className="font-mono tracking-widest text-[9px] uppercase">Secure Connection</span>
            </div>
          </div>
        </div>

      </motion.aside>
    </>
  );
};

export default Sidebar;