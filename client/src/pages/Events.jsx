import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Users, Plus, Menu, Clock, Search, ArrowRight, 
  Calendar, Zap, Filter 
} from 'lucide-react';

// Components & Utils
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import BlueLightsBackground from '../components/BlueLightsBackground'; // Theme Standard
import logo from '../assets/logo.png';

const Events = () => {
  const navigate = useNavigate();
  
  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});

  // --- RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events/all');
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // --- HELPERS ---
  const getEventDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    };
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl text-cyan-400 hover:bg-white/5 transition-colors">
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
                <Calendar size={20} className="text-cyan-400"/> Events & Webinars
              </h2>
            </div>

            <div className="flex items-center gap-4">
               {/* User Badge */}
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
            
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
              <div className="w-full md:w-auto">
                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                  Upcoming Sessions <span className="text-cyan-400">.</span>
                </h1>
                <p className="text-slate-400 text-lg">
                  Join exclusive workshops, meetups, and tech talks.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                {/* Search */}
                <div className="relative group w-full sm:w-72">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                   <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                      <Search className="ml-4 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        placeholder="Find events..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none text-white px-4 py-3 focus:ring-0 placeholder-slate-600 outline-none"
                      />
                   </div>
                </div>

                {/* Host Button (Admin/Alumni Only) */}
                {(user.role === 'Admin' || user.role === 'Alumni') && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/create-event')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all whitespace-nowrap"
                  >
                    <Plus size={20} /> Host Event
                  </motion.button>
                )}
              </div>
            </div>

            {/* Event Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-3xl border-dashed bg-white/5">
                <Zap size={48} className="text-slate-600 mb-4 opacity-50" />
                <p className="text-slate-400 text-lg font-medium">No upcoming events found.</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {filteredEvents.map(event => {
                   const { day, month } = getEventDate(event.date);
                   return (
                     <EventCard 
                       key={event._id} 
                       event={event} 
                       day={day} 
                       month={month} 
                       navigate={navigate} 
                     />
                   );
                })}
              </motion.div>
            )}

          </main>
        </div>
      </div>
      
      {/* Mobile FAB for Creating Event */}
      <AnimatePresence>
        {(user.role === 'Admin' || user.role === 'Alumni') && !isSidebarOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => navigate('/create-event')}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-xl z-50 border-2 border-slate-900"
          >
            <Plus size={28} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT: EVENT CARD ---
const EventCard = ({ event, day, month, navigate }) => (
  <motion.div
    layout
    variants={{
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    }}
    whileHover={{ y: -8 }}
    onClick={() => navigate(`/events/${event._id}`)}
    className="group relative bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-300"
  >
    {/* Image Section */}
    <div className="h-48 overflow-hidden relative">
      <img 
        src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'} 
        alt={event.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
      
      {/* Date Badge */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-2 text-center min-w-[60px] shadow-lg group-hover:border-cyan-500/50 transition-colors">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{month}</div>
        <div className="text-2xl font-extrabold text-white">{day}</div>
      </div>
      
      {/* Category Tag */}
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-blue-600/80 backdrop-blur-md rounded-full shadow-lg border border-white/10">
          {event.category || 'Event'}
        </span>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-6 pt-4">
      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
        {event.title}
      </h3>
      
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock size={16} className="text-amber-500" />
          <span>{event.time || 'TBA'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin size={16} className="text-emerald-500" />
          <span className="truncate">{event.location || 'Online'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <div className="flex -space-x-2">
             {[...Array(3)].map((_,i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">
                  <Users size={10} />
                </div>
             ))}
          </div>
          <span>{event.attendees?.length || 0} Attending</span>
        </div>

        <div className="flex items-center gap-1 text-sm font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
          View <ArrowRight size={16} />
        </div>
      </div>
    </div>
  </motion.div>
);

export default Events;