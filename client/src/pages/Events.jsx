import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import { MapPin, Users, Plus, Menu, Clock, Search, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events/all');
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events", error);
      setLoading(false);
    }
  };

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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ 
        position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 100,
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease'
      }}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      <div style={{ 
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '290px' : '0', 
        width: isSidebarOpen && window.innerWidth > 768 ? 'calc(100% - 290px)' : '100%',
        transition: 'all 0.4s ease'
      }}>
        {/* Top Nav */}
        <nav style={{ background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', boxShadow: '0 2px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 50 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: '#f3f4f6', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#0f284e' }}><Menu size={24} /></button>
             <h2 style={{ margin: 0, color: '#0f284e', fontSize: '22px', fontWeight: 'bold' }}>Events</h2>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             {user.role && (
                 <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', background: user.role === 'Student' ? '#e0f2fe' : '#fffbeb', color: user.role === 'Student' ? '#0369a1' : '#92400e', border: `1px solid ${user.role === 'Student' ? '#bae6fd' : '#fde047'}`, display: window.innerWidth < 640 ? 'none' : 'block' }}>{user.role}</span>
             )}
             <img src={logo} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d4af37', padding: '2px', objectFit: 'cover' }} />
           </div>
        </nav>

        <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', color: '#0f284e', marginBottom: '5px', fontWeight: 'bold' }}>Upcoming Events</h1>
                    <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Join webinars, workshops, and meetups.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '12px 20px', borderRadius: '30px', width: window.innerWidth < 640 ? '100%' : '300px', border: '1px solid #e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                       <Search size={18} color="#999" />
                       <input type="text" placeholder="Search events..." onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%', color: '#333', fontSize: '15px' }} />
                    </div>
                    {/* Only Show "Host Event" to Admin and Alumni */}
                    {(user.role === 'Admin' || user.role === 'Alumni') && (
                        <button onClick={() => navigate('/create-event')} style={{ backgroundColor: '#d4af37', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', display: window.innerWidth < 768 ? 'none' : 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(212, 175, 55, 0.2)' }}>
                            <Plus size={20} /> Host Event
                        </button>
                    )}
                </div>
            </div>

            {loading ? <p>Loading events...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                    {filteredEvents.map(event => {
                        const { day, month } = getEventDate(event.date);
                        return (
                            <div key={event._id} onClick={() => navigate(`/events/${event._id}`)} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', position: 'relative', border: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.3s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'white', borderRadius: '12px', padding: '8px 14px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10 }}>
                                    <div style={{ color: '#d4af37', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>{month}</div>
                                    <div style={{ color: '#0f284e', fontSize: '24px', fontWeight: '900', lineHeight: '1' }}>{day}</div>
                                </div>
                                <div style={{ height: '180px', backgroundImage: `url(${event.banner || 'https://via.placeholder.com/400x200?text=Event'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                <div style={{ padding: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <span style={{ backgroundColor: '#f0f4ff', color: '#0f284e', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', border: '1px solid #e0e7ff' }}>{event.category}</span>
                                    </div>
                                    <h3 style={{ margin: '0 0 10px', color: '#0f284e', fontSize: '20px', fontWeight: '700' }}>{event.title}</h3>
                                    <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '13px', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} color="#d4af37" /> {event.time}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="#d4af37" /> {event.location}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '13px' }}>
                                            <Users size={16} /> {event.attendees.length} Going
                                        </div>
                                        <span style={{ color: '#0f284e', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            View Details <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        
        {/* Mobile FAB for Admin/Alumni */}
        {window.innerWidth < 768 && (user.role === 'Admin' || user.role === 'Alumni') && (
            <button onClick={() => navigate('/create-event')} style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#d4af37', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)', zIndex: 1000, border: 'none', cursor: 'pointer' }}>
                <Plus size={28} strokeWidth={3} />
            </button>
        )}
      </div>
    </div>
  );
};

export default Events;