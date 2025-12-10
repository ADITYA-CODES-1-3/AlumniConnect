import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-hot-toast';
import { MapPin, Clock, Calendar, Users, ArrowLeft, Mail, Trash2, CheckCircle, Menu } from 'lucide-react';
import logo from '../assets/logo.png';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});

    useEffect(() => {
        const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const { data } = await api.get(`/events/${id}`);
            setEvent(data);
            setLoading(false);
        } catch (error) {
            toast.error("Could not load event details");
            navigate('/events');
        }
    };

    const handleRSVP = async () => {
    try {
        const { data } = await api.put(`/events/rsvp/${id}`);
        
        // Show different messages based on the action performed
        if (data.status === 'registered') {
            toast.success("You have joined the event!");
        } else if (data.status === 'unregistered') {
            toast.success("You have left the event.");
        } else {
            toast.success(data.message);
        }
        
        // Refresh the event details to update the "Going" count and button state
        fetchEventDetails(); 
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to update RSVP");
    }
};

    const handleDelete = async () => {
        if(!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
        try {
            await api.delete(`/events/${id}`);
            toast.success("Event Deleted");
            navigate('/events');
        } catch (error) {
            toast.error("Delete Failed");
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;

    const isOrganizer = (event.organizer._id === user._id) || (user.role === 'Admin');
    // Check if the current user is in the attendees list (attendees is an array of objects now due to populate, so map to IDs)
    const isAttending = event.attendees.some(attendee => attendee._id === user._id);
    
    // Date Formatting
    const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 100, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}>
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            <div style={{ marginLeft: isSidebarOpen && window.innerWidth > 768 ? '290px' : '0', width: isSidebarOpen && window.innerWidth > 768 ? 'calc(100% - 290px)' : '100%', transition: 'all 0.4s ease' }}>
                
                {/* Navbar */}
                <nav style={{ background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', boxShadow: '0 2px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: '#f3f4f6', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#0f284e' }}><Menu size={24} /></button>
                        <h2 style={{ margin: 0, color: '#0f284e', fontSize: '22px', fontWeight: 'bold' }}>Event Details</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', background: '#fffbeb', color: '#92400e', border: `1px solid #fde047`, display: window.innerWidth < 640 ? 'none' : 'block' }}>{user.role}</span>
                        <img src={logo} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d4af37', padding: '2px' }} />
                    </div>
                </nav>

                {/* Content */}
                <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                    <button onClick={() => navigate('/events')} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#666', marginBottom: '20px', fontWeight: '500', gap: '5px' }}><ArrowLeft size={18} /> Back to Events</button>

                    {/* Main Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '2fr 1fr', gap: '30px' }}>
                        
                        {/* Left Column: Details */}
                        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <div style={{ height: '300px', backgroundImage: `url(${event.banner || 'https://via.placeholder.com/800x400?text=Event'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <div style={{ padding: '30px' }}>
                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{event.category}</span>
                                <h1 style={{ fontSize: '32px', color: '#0f284e', margin: '15px 0', fontWeight: '800' }}>{event.title}</h1>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', color: '#555' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar color="#d4af37" /> <strong>Date:</strong> {eventDate}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock color="#d4af37" /> <strong>Time:</strong> {event.time}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin color="#d4af37" /> <strong>Location:</strong> {event.location}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users color="#d4af37" /> <strong>Registered:</strong> {event.attendees.length} / {event.totalSeats}</div>
                                </div>

                                <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
                                    <h3 style={{ color: '#0f284e', marginBottom: '15px' }}>About this Event</h3>
                                    <p style={{ lineHeight: '1.8', color: '#444' }}>{event.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & Dashboard */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {/* Action Card */}
                            <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                <h3 style={{ marginTop: 0, color: '#0f284e' }}>Actions</h3>
                                {isOrganizer ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ padding: '10px', background: '#f0fdf4', color: '#166534', borderRadius: '8px', fontSize: '14px' }}>You are the organizer</div>
                                        <button onClick={handleDelete} style={{ width: '100%', padding: '12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Trash2 size={18} /> Delete Event</button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleRSVP} 
                                        style={{ 
                                            width: '100%', padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
                                            backgroundColor: isAttending ? '#10b981' : '#0f284e', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        {isAttending ? <><CheckCircle size={20} /> Registered</> : "Register Now"}
                                    </button>
                                )}
                            </div>

                            {/* ATTENDEE DASHBOARD (Visible Only to Admin/Organizer) */}
                            {isOrganizer && (
                                <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ marginTop: 0, color: '#0f284e', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Attendee Dashboard</h3>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {event.attendees.length === 0 ? (
                                            <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>No registrations yet.</p>
                                        ) : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                                <thead>
                                                    <tr style={{ textAlign: 'left', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>
                                                        <th style={{ padding: '10px 5px' }}>Name</th>
                                                        <th style={{ padding: '10px 5px' }}>Role</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {event.attendees.map(student => (
                                                        <tr key={student._id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                            <td style={{ padding: '12px 5px', fontSize: '14px' }}>
                                                                <div style={{ fontWeight: '600', color: '#333' }}>{student.name}</div>
                                                                <div style={{ fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={10} /> {student.email}</div>
                                                            </td>
                                                            <td style={{ padding: '12px 5px' }}>
                                                                <span style={{ fontSize: '11px', background: '#f3f4f6', padding: '3px 8px', borderRadius: '10px', color: '#555' }}>{student.role}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;