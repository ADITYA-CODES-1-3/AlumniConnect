import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  MapPin, Clock, Calendar, Users, ArrowLeft, 
  Mail, Trash2, CheckCircle, Menu, Share2, Shield 
} from 'lucide-react';

// Components & Utils
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import BlueLightsBackground from '../components/BlueLightsBackground'; // Matches Dashboard theme

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data State
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // --- RESPONSIVE LISTENER ---
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

  // --- FETCH DATA ---
  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
      setLoading(false);
    } catch (error) {
      toast.error("Event not found or removed");
      navigate('/events');
    }
  };

  // --- ACTIONS ---
  const handleRSVP = async () => {
    try {
      const { data } = await api.put(`/events/rsvp/${id}`);
      
      if (data.status === 'registered') {
        toast.success("See you there! You've joined.");
      } else if (data.status === 'unregistered') {
        toast.success("RSVP Cancelled.");
      } else {
        toast.success(data.message);
      }
      
      fetchEventDetails(); // Live update
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event successfully removed");
      navigate('/events');
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  // --- RENDER HELPERS ---
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );

  const isOrganizer = (event.organizer?._id === user._id) || (user.role === 'Admin');
  const isAttending = event.attendees.some(att => att._id === user._id);
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BlueLightsBackground />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">

        {/* SIDEBAR */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Mobile Overlay */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.aside 
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed lg:relative z-50 w-72 h-full border-r border-white/10 bg-slate-900/90 backdrop-blur-xl"
              >
                <Sidebar isOpen={true} toggleSidebar={() => setIsSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          
          {/* NAVBAR */}
          <nav className="h-20 px-6 flex justify-between items-center sticky top-0 z-30 bg-slate-950/60 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl text-cyan-400 hover:bg-white/5 transition-colors">
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold text-white hidden sm:block">Event Details</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {user.role}
              </span>
              <img 
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=0f172a&color=38bdf8`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-slate-800"
              />
            </div>
          </nav>

          {/* PAGE CONTENT */}
          <main className="p-4 lg:p-10 max-w-7xl mx-auto w-full">
            
            <button onClick={() => navigate('/events')} className="group flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Events
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: Main Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. HERO BANNER */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="relative group rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl"
                >
                  <div className="h-64 sm:h-80 w-full overflow-hidden">
                    <img 
                      src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070'} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
                    <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-bold uppercase bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/50">
                      {event.category || 'General'}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                      {event.title}
                    </h1>
                    <p className="text-slate-300 flex items-center gap-2 text-sm sm:text-base">
                      <span className="text-cyan-400">By:</span> {event.organizer?.name || 'Alumni Admin'}
                    </p>
                  </div>
                </motion.div>

                {/* 2. DESCRIPTION */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-cyan-400"/> About Event
                  </h3>
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </div>
                </motion.div>

                {/* 3. METADATA GRID (Mobile Responsive) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <InfoCard icon={Calendar} label="Date" value={formattedDate} color="text-emerald-400" bg="bg-emerald-500/10" />
                   <InfoCard icon={Clock} label="Time" value={event.time} color="text-amber-400" bg="bg-amber-500/10" />
                   <InfoCard icon={MapPin} label="Location" value={event.location} color="text-rose-400" bg="bg-rose-500/10" />
                   <InfoCard icon={Users} label="Seats" value={`${event.attendees.length} / ${event.totalSeats} Registered`} color="text-blue-400" bg="bg-blue-500/10" />
                </div>
              </div>

              {/* RIGHT COLUMN: Actions */}
              <div className="space-y-6">
                
                {/* 4. ACTION CARD */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="sticky top-24 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                  
                  {isOrganizer ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center font-medium">
                        You are the organizer
                      </div>
                      <button 
                        onClick={handleDelete}
                        className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} /> Delete Event
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button 
                        onClick={handleRSVP}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
                          isAttending 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] text-white shadow-cyan-500/20'
                        }`}
                      >
                        {isAttending ? <><CheckCircle size={20} /> Registered</> : "Register Now"}
                      </button>
                      <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium border border-white/10 transition-colors flex items-center justify-center gap-2">
                        <Share2 size={18} /> Share Event
                      </button>
                    </div>
                  )}
                </motion.div>

                {/* 5. ATTENDEES LIST (Visible to Admin/Organizer) */}
                {isOrganizer && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-white">Guest List</h3>
                      <span className="text-xs text-slate-500">{event.attendees.length} people</span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                      {event.attendees.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">No registrations yet.</p>
                      ) : (
                        event.attendees.map(student => (
                          <div key={student._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                              {student.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-200 truncate">{student.name}</p>
                              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                <Mail size={10} /> {student.email}
                              </p>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded">
                              {student.role}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT ---
const InfoCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-slate-200 font-semibold">{value}</p>
    </div>
  </div>
);

export default EventDetails;