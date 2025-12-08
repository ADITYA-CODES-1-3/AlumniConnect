import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { User, CheckCircle, XCircle, Send, Menu, Search, MessageSquare, Clock, Trash2 } from 'lucide-react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// Initialize Socket outside to prevent multiple connections
const socket = io.connect("http://localhost:5000");

const Mentorship = () => {
  const [dataList, setDataList] = useState([]); 
  const [myRequests, setMyRequests] = useState([]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate(); 

  // --- 1. ROBUST SOCKET CONNECTION ---
  useEffect(() => {
    // Function to join specific user room
    const joinRoom = () => {
      if (user?._id) {
        socket.emit("join_room", user._id);
      }
    };

    // Join on load
    joinRoom();

    // Listener for data refresh
    const handleNotification = () => {
      toast('List Updated', { icon: 'Hz' });
      refreshData();
    };

    // Re-join on reconnect (Fixes the "refresh required" issue)
    socket.on("connect", joinRoom);
    socket.on("receive_notification", handleNotification);

    // Cleanup listeners
    return () => {
      socket.off("connect", joinRoom);
      socket.off("receive_notification", handleNotification);
    };
  }, [user]);

  // Initial Fetch
  useEffect(() => {
    refreshData();
  }, [user]);

  const refreshData = () => {
    if (user?.role === 'Student') {
      fetchAlumni();
      fetchMyRequests();
    } else if (user?.role === 'Alumni') {
      fetchRequests();
    }
  };

  const fetchAlumni = async () => {
    try {
      const res = await api.get('/auth/users?role=Alumni');
      setDataList(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/mentorship/my-requests');
      setMyRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/mentorship/my-requests');
      // Show all requests except Rejected ones
      const activeRequests = res.data.filter(req => req.status !== 'Rejected');
      setDataList(activeRequests);
    } catch (err) { console.error(err); }
  };

  // --- ACTIONS ---

  const handleSendRequest = async (alumniId) => {
    try {
      await api.post('/mentorship/request', { alumniId, message: "I am interested in your guidance." });
      toast.success('Request Sent!');
      refreshData();
      socket.emit("send_notification", { receiverId: alumniId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleStatusUpdate = async (id, status, studentId) => {
    try {
      await api.put(`/mentorship/update/${id}`, { status });
      toast.success(`Request ${status}!`);
      
      if (status === 'Rejected') {
        setDataList(prev => prev.filter(req => req._id !== id));
      } else {
        fetchRequests();
      }
      
      // Notify Student
      if (studentId) socket.emit("send_notification", { receiverId: studentId });

    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // --- NEW: REMOVE CONNECTION (Cancel/Delete) ---
  const handleRemoveConnection = async (requestId, otherUserId) => {
    if (!window.confirm("Are you sure you want to remove this connection?")) return;

    try {
      await api.delete(`/mentorship/remove/${requestId}`);
      toast.success('Connection Removed');
      refreshData();
      
      // Notify the other person (Alumni or Student)
      if (otherUserId) socket.emit("send_notification", { receiverId: otherUserId });

    } catch (err) {
      toast.error('Failed to remove connection');
    }
  };

  const getRequestInfo = (alumniId) => {
    return myRequests.find(req => req.alumniId?._id === alumniId);
  };

  const filteredData = dataList.filter(item => {
    const name = item.name || item.studentId?.name || '';
    const company = item.currentCompany || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || company.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div style={{ 
        marginLeft: isSidebarOpen ? '290px' : '0', 
        width: isSidebarOpen ? 'calc(100% - 290px)' : '100%',
        transition: 'all 0.4s ease'
      }}>
        
        {/* Navbar */}
        <nav style={{ background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', boxShadow: '0 2px 15px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 50 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: '#f3f4f6', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#0f284e' }}><Menu size={24} /></button>
             <h2 style={{ margin: 0, color: '#0f284e', fontSize: '22px', fontWeight: 'bold' }}>Mentorship</h2>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', background: user.role === 'Student' ? '#e0f2fe' : '#fffbeb', color: user.role === 'Student' ? '#0369a1' : '#92400e', border: `1px solid ${user.role === 'Student' ? '#bae6fd' : '#fde047'}` }}>
                {user.role}
             </span>
             <img src={logo} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d4af37', padding: '2px' }} />
           </div>
        </nav>

        <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '28px', color: '#0f284e', marginBottom: '5px', fontWeight: 'bold' }}>
                 {user?.role === 'Student' ? 'Find Your Mentor' : 'Mentorship Requests'}
              </h1>
              <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                 {user?.role === 'Student' ? 'Connect with alumni for career guidance.' : 'Guide the next generation of students.'}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '12px 20px', borderRadius: '30px', width: '350px', border: '1px solid #e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
               <Search size={18} color="#999" />
               <input type="text" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%', color: '#333', fontSize: '15px' }} />
            </div>
          </div>

          {/* --- ALUMNI VIEW --- */}
          {user?.role === 'Alumni' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
              {filteredData.length === 0 ? <p style={{color: '#999', fontSize: '18px'}}>No pending requests.</p> : filteredData.map((req) => (
                <div key={req._id} style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: `6px solid ${req.status === 'Accepted' ? '#10b981' : '#fbbf24'}`, position: 'relative' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div 
                        onClick={() => navigate(`/profile/${req.studentId?._id}`)}
                        style={{ display: 'flex', gap: '15px', cursor: 'pointer' }}
                        title="View Profile"
                    >
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
                         {req.studentId?.profileImage ? (
                            <img src={req.studentId.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         ) : (
                            <span style={{ color: '#555', fontSize: '20px', fontWeight: 'bold' }}>
                               {req.studentId?.name?.charAt(0)}
                            </span>
                         )}
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 5px', color: '#0f284e', fontSize: '18px', fontWeight: 'bold' }}>{req.studentId?.name}</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{req.studentId?.department} Student</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', background: req.status === 'Pending' ? '#fffbeb' : '#f0fdf4', color: req.status === 'Pending' ? '#b45309' : '#15803d', border: `1px solid ${req.status === 'Pending' ? '#fde68a' : '#bbf7d0'}` }}>{req.status}</span>
                  </div>
                  
                  <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', fontSize: '15px', color: '#555', marginBottom: '25px', lineHeight: '1.6', fontStyle: 'italic', border: '1px solid #f3f4f6' }}>"{req.message}"</div>
                  
                  {req.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={() => handleStatusUpdate(req._id, 'Accepted', req.studentId?._id)} style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> Accept</button>
                      <button onClick={() => handleStatusUpdate(req._id, 'Rejected', req.studentId?._id)} style={{ flex: 1, padding: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><XCircle size={18} /> Reject</button>
                    </div>
                  ) : (
                    // --- ALUMNI: Chat + Remove Connection ---
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => navigate(`/chat/${req.studentId._id}`)} style={{ flex: 1, padding: '12px', background: '#0f284e', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(15, 40, 78, 0.2)' }}>
                            <MessageSquare size={18} /> Chat
                        </button>
                        <button onClick={() => handleRemoveConnection(req._id, req.studentId?._id)} style={{ padding: '12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove Connection">
                            <Trash2 size={20} />
                        </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* --- STUDENT VIEW --- */}
          {user?.role === 'Student' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
              {filteredData.length === 0 ? <p style={{color: '#999', fontSize: '18px'}}>No alumni found matching your search.</p> : filteredData.map((alum) => {
                const request = getRequestInfo(alum._id);
                const status = request ? request.status : null; 

                return (
                  <div key={alum._id} style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderTop: '5px solid #0f284e', textAlign: 'center', transition: 'transform 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    
                    <div onClick={() => navigate(`/profile/${alum._id}`)} style={{ cursor: 'pointer' }} title="View Profile">
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px', overflow: 'hidden', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e0f2fe' }}>
                          {alum.profileImage ? (
                            <img src={alum.profileImage} alt={alum.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={40} color="#0f284e" />
                          )}
                        </div>
                        
                        <h3 style={{ margin: '0 0 5px', color: '#0f284e', fontSize: '20px', fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: 'transparent', transition: '0.3s' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecorationColor = '#0f284e'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecorationColor = 'transparent'}
                        >
                            {alum.name}
                        </h3>
                    </div>

                    <p style={{ margin: 0, color: '#555', fontWeight: '600', fontSize: '15px' }}>{alum.currentCompany || 'N/A'}</p>
                    <p style={{ margin: '2px 0 15px', color: '#888', fontSize: '13px' }}>{alum.jobRole || 'Professional'}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
                       {alum.skills?.slice(0,3).map((skill, i) => (
                         <span key={i} style={{ background: '#f3f4f6', color: '#4b5563', fontSize: '12px', padding: '5px 12px', borderRadius: '15px', fontWeight: '500' }}>{skill}</span>
                       ))}
                    </div>

                    {status === 'Accepted' ? (
                        // --- ACCEPTED: Chat + Remove ---
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => navigate(`/chat/${alum._id}`)}
                              style={{ flex: 1, padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                            >
                              <MessageSquare size={18} /> Chat Now
                            </button>
                            <button 
                              onClick={() => handleRemoveConnection(request._id, alum._id)}
                              style={{ padding: '14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                              title="Remove Connection"
                            >
                              <Trash2 size={20} />
                            </button>
                        </div>
                    ) : status === 'Pending' ? (
                        // --- PENDING: Pending Button + Cancel (Trash) ---
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              disabled
                              style={{ flex: 1, padding: '14px', background: '#fbbf24', color: 'white', border: 'none', borderRadius: '10px', cursor: 'not-allowed', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                              <Clock size={18} /> Request Pending
                            </button>
                            <button 
                              onClick={() => handleRemoveConnection(request._id, alum._id)}
                              style={{ padding: '14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                              title="Cancel Request"
                            >
                              <Trash2 size={20} />
                            </button>
                        </div>
                    ) : (
                        <button 
                          onClick={() => handleSendRequest(alum._id)}
                          style={{ width: '100%', padding: '14px', background: '#0f284e', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.3s' }}
                        >
                          <Send size={18} /> Request Mentorship
                        </button>
                    )}
                    
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Mentorship;