import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar'; 
import { Menu } from 'lucide-react'; 

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Default stats to avoid "Loading..." stuck issue
  const [stats, setStats] = useState({ 
    card1: { label: "Active Jobs", value: 0 }, 
    card2: { label: "Mentorships", value: 0 }, 
    card3: { label: "Events", value: 0 } 
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Load User from LocalStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // 2. Silent Profile Refresh (To get latest image if updated)
        api.get('/auth/me')
           .then(res => {
              setUser(res.data);
              localStorage.setItem('user', JSON.stringify(res.data));
           })
           .catch(err => console.log("Silent refresh failed", err));

        fetchStats(); 
      } catch (e) {
        console.error("User Parse Error", e);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/auth/dashboard-stats');
      if(res.data && res.data.card1) {
          setStats(res.data);
      }
    } catch (err) {
      console.error("Stats fetch failed", err);
      // Fallback is already set in initial state, so no need to do anything
    }
  };

  // Helper to ensure valid image source
  const getProfileImage = () => {
    if (user?.profileImage && user.profileImage.startsWith('data:image')) {
        return user.profileImage;
    }
    // Fallback UI Avatar
    return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', overflowX: 'hidden' }}>
      
      {/* Sidebar Overlay Logic */}
      <div className={isSidebarOpen ? "sidebar-open" : "sidebar-closed"}>
         <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

     <div style={{ 
   marginLeft: isSidebarOpen ? '290px' : '0', 
   width: 'auto', 
   maxWidth: '100%', /* ✅ ADD THIS LINE */
   transition: 'all 0.4s ease-in-out', 
   minHeight: '100vh'
}} className="main-content">
        
        {/* Navbar */}
        <nav style={{ 
          background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 2px 15px rgba(0,0,0,0.03)', height: '80px', position: 'sticky', top: 0, zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: '#f3f4f6', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: '#0f284e' }}>
              <Menu size={24} />
            </button>
            <h2 style={{ margin: 0, color: '#0f284e', fontSize: '22px', fontWeight: 'bold' }}>Dashboard</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {user && (
              <span style={{ 
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                background: user.role === 'Student' ? '#e0f2fe' : '#fffbeb', 
                color: user.role === 'Student' ? '#0369a1' : '#92400e',
                border: `1px solid ${user.role === 'Student' ? '#bae6fd' : '#fde047'}`
              }}>
                {user.role}
              </span>
            )}
            
            <div style={{ textAlign: 'right', display: window.innerWidth < 768 ? 'none' : 'block' }}>
               <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>Welcome back,</p>
               <h3 style={{ margin: 0, color: '#0f284e', fontSize: '16px' }}>{user?.name}</h3>
            </div>
            
            <div style={{ padding: '2px', border: '2px solid #d4af37', borderRadius: '50%' }}>
              <img 
                src={getProfileImage()} 
                alt="Profile" 
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div style={{ padding: '30px' }}>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #0f284e 0%, #1e3a8a 100%)', 
            borderRadius: '16px', padding: '40px', color: 'white', marginBottom: '30px',
            boxShadow: '0 10px 25px rgba(15, 40, 78, 0.2)'
          }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Hello, {user?.name}! 👋</h1>
            <p style={{ opacity: 0.9, fontSize: '16px' }}>
                {user?.role === 'Student' 
                    ? 'Explore new job opportunities and connect with mentors today.' 
                    : 'Thank you for guiding the next generation of students.'}
            </p>
          </div>

          <div className="stats-grid">
            <StatCard label={stats.card1?.label} value={stats.card1?.value} color="#0f284e" />
            <StatCard label={stats.card2?.label} value={stats.card2?.value} color="#d4af37" />
            <StatCard label={stats.card3?.label} value={stats.card3?.value} color="#10b981" />
            <StatCard label="Account Status" value="Active" color="green" isText={true} />
          </div>

          <div>
            <h3 style={{ color: '#0f284e', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Recent Activity</h3>
            <div style={{ background: 'white', padding: '60px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb' }}>
              No recent activity found. Start by exploring the side menu!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Reusable Card
const StatCard = ({ label, value, color, isText = false }) => (
  <div className="stat-card" style={{ borderLeft: `6px solid ${color}` }}>
    <p className="stat-label">{label || "Loading..."}</p>
    <h2 className="stat-value" style={{ color: isText ? color : '#0f284e' }}>
      {value !== undefined ? value : 0}
    </h2>
  </div>
);

export default Dashboard;