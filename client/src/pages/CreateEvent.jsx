import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Assuming you have an api utility exporting post/put/etc
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, Menu, Calendar, MapPin, Clock, Users, Type, AlignLeft } from 'lucide-react';
import logo from '../assets/logo.png'; 

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});

    // SECURITY CHECK: Allow Alumni AND Admin
    useEffect(() => {
        if (user.role !== 'Alumni' && user.role !== 'Admin') {
            toast.error("Access Denied: Only Alumni and Admins can host events");
            navigate('/events'); 
        }
    }, [user, navigate]);

    useEffect(() => {
        const handleResize = () => {
             setIsSidebarOpen(window.innerWidth > 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [formData, setFormData] = useState({
        title: '', description: '', location: '', date: '', time: '', 
        totalSeats: '', category: 'Webinar', banner: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { 
                toast.error("Image too large. Max 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, banner: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if(!formData.date || !formData.time) throw new Error("Select Date and Time");
            
            // Combine logic or keep separate based on backend model, sending as is for now
            const payload = { ...formData };

            await api.post('/events/create', payload);
            toast.success("Event created successfully!");
            navigate('/events');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    if (user.role !== 'Alumni' && user.role !== 'Admin') return null; 

    const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px', textTransform: 'uppercase' };
    const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 100, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}>
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            <div style={{ flex: 1, marginLeft: isSidebarOpen && window.innerWidth > 768 ? '290px' : '0', width: '100%', transition: 'all 0.4s ease', display: 'flex', flexDirection: 'column' }}>
                <nav style={{ background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', boxShadow: '0 2px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: '#f3f4f6', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#0f284e' }}><Menu size={24} /></button>
                        <h2 style={{ margin: 0, color: '#0f284e', fontSize: '22px', fontWeight: 'bold' }}>Create Event</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', background: '#fffbeb', color: '#92400e', border: `1px solid #fde047`, display: window.innerWidth < 640 ? 'none' : 'block' }}>{user.role}</span>
                        <img src={logo} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d4af37', padding: '2px' }} />
                    </div>
                </nav>

                <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                    <button onClick={() => navigate('/events')} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#666', marginBottom: '20px', fontWeight: '500', gap: '5px' }}><ArrowLeft size={18} /> Back to Events</button>
                    
                    <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '30px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                            <h1 style={{ margin: '0 0 5px 0', color: '#0f284e', fontSize: '24px', fontWeight: 'bold' }}>Host a New Event</h1>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Fill in the details below to organize your session.</p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div><label style={labelStyle}><Type size={16} /> Event Title</label><input type="text" name="title" required onChange={handleChange} style={inputStyle} placeholder="e.g. Alumni Meetup 2025" /></div>
                            <div><label style={labelStyle}><AlignLeft size={16} /> Description</label><textarea name="description" rows="4" required onChange={handleChange} style={{...inputStyle, height: 'auto', fontFamily: 'inherit'}} placeholder="Describe what this event is about..." /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                <div><label style={labelStyle}><Calendar size={16} /> Date</label><input type="date" name="date" required onChange={handleChange} style={inputStyle} /></div>
                                <div><label style={labelStyle}><Clock size={16} /> Time</label><input type="time" name="time" required onChange={handleChange} style={inputStyle} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div><label style={labelStyle}><MapPin size={16} /> Location</label><input type="text" name="location" required onChange={handleChange} style={inputStyle} placeholder="Google Meet / Hall A" /></div>
                                <div><label style={labelStyle}><Users size={16} /> Total Seats</label><input type="number" name="totalSeats" min="1" required onChange={handleChange} style={inputStyle} placeholder="e.g. 50" /></div>
                            </div>
                            <div><label style={labelStyle}>Category</label><select name="category" onChange={handleChange} style={inputStyle} value={formData.category}><option>Webinar</option><option>Workshop</option><option>Meetup</option><option>Hackathon</option><option>Reunion</option></select></div>
                            <div style={{ border: '2px dashed #e0e0e0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}><p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>Upload Event Banner (Max 2MB)</p><input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '14px' }} /></div>
                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: '#0f284e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? "Creating..." : "Create Event"}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CreateEvent;