import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';
import { Users, GraduationCap, Clock, Menu, Search, XCircle, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.png'; 

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ students: 0, alumni: 0, pending: 0 });
  const [dataList, setDataList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    setSearchTerm('');
    if (activeTab === 'students') fetchData('Student');
    if (activeTab === 'alumni') fetchData('Alumni');
    if (activeTab === 'pending') fetchData('Pending');
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/auth/stats');
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchData = async (type) => {
    try {
      let res;
      if (type === 'Pending') res = await api.get('/auth/pending-users');
      else res = await api.get(`/auth/users?role=${type}`);
      setDataList(res.data);
    } catch (err) { console.error(err); }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/auth/approve/${id}`);
      toast.success('Approved Successfully!');
      fetchData('Pending'); 
      fetchStats(); 
    } catch (err) { toast.error('Failed'); }
  };

  const filteredList = dataList.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="animate-fade-in">
             {/* Welcome Banner */}
             <div style={{ 
                background: 'linear-gradient(135deg, #0f284e 0%, #1e3a8a 100%)', 
                borderRadius: '12px', 
                padding: '35px', 
                color: 'white',
                marginBottom: '35px',
                boxShadow: '0 10px 25px rgba(15, 40, 78, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap', // Added wrap for mobile
                gap: '20px'
              }}>
                <div>
                  <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: 'bold' }}>Admin Control Center </h1>
                  <p style={{ opacity: 0.9, fontSize: '16px' }}>Manage users, approvals, and platform activity.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '30px', textAlign: 'center' }}>
                   <div>
                     <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.students}</h2>
                     <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>Students</span>
                   </div>
                   <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                   <div>
                     <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.alumni}</h2>
                     <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>Alumni</span>
                   </div>
                </div>
              </div>

            {/* STATS GRID - Using our CSS class now */}
            <div className="stats-grid">
              <StatCard title="Total Students" count={stats.students} icon={<Users size={32} />} color="#0f284e" />
              <StatCard title="Total Alumni" count={stats.alumni} icon={<GraduationCap size={32} />} color="#d4af37" />
              <StatCard title="Pending Approvals" count={stats.pending} icon={<Clock size={32} />} color="#e11d48" />
            </div>
          </div>
        );

      case 'students':
      case 'alumni':
      case 'pending':
        return (
          <div className="animate-fade-in">
            {/* Header + Search Bar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '30px',
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
              flexWrap: 'wrap', // Mobile Friendly
              gap: '15px'
            }}>
              <h2 style={{ color: '#0f284e', textTransform: 'capitalize', margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeTab === 'pending' ? <Clock size={24} color="#e11d48"/> : (activeTab === 'students' ? <Users size={24} /> : <GraduationCap size={24} />)}
                {activeTab === 'pending' ? 'Pending Requests' : `All ${activeTab}`} 
                <span style={{ background: '#f3f4f6', padding: '2px 10px', borderRadius: '15px', fontSize: '14px', color: '#666' }}>{filteredList.length}</span>
              </h2>
              
              <div style={{ 
                display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '12px 20px', 
                borderRadius: '50px', border: '1px solid #e5e7eb', width: '350px', maxWidth: '100%', transition: 'all 0.3s'
              }}>
                 <Search size={20} color="#999" />
                 <input 
                    type="text" 
                    placeholder={`Search...`} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', outline: 'none', marginLeft: '10px', color: '#333', background: 'transparent', width: '100%', fontSize: '15px' }} 
                 />
                 {searchTerm && <XCircle size={18} color="#ccc" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />}
              </div>
            </div>
            
            {filteredList.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#999', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <p style={{ fontSize: '18px' }}>No records found matching "{searchTerm}"</p>
              </div>
            ) : (
              // Changed to use Grid for lists too
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredList.map(user => (
                  <div key={user._id} className="stat-card" style={{ padding: '25px', display: 'block', borderLeft: `5px solid ${user.role === 'Student' ? '#0f284e' : '#d4af37'}` }}>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                       <div style={{ 
                         width: '50px', height: '50px', borderRadius: '50%', 
                         background: `linear-gradient(135deg, ${user.role === 'Student' ? '#e0f2fe' : '#fffbeb'} 0%, white 100%)`, 
                         display: 'flex', alignItems: 'center', justifyContent: 'center', 
                         fontWeight: 'bold', color: user.role === 'Student' ? '#0f284e' : '#d4af37',
                         fontSize: '20px', border: `1px solid ${user.role === 'Student' ? '#bae6fd' : '#fde047'}`,
                         flexShrink: 0
                       }}>
                         {user.name.charAt(0).toUpperCase()}
                       </div>
                       
                       <div style={{ flex: 1, overflow: 'hidden' }}>
                         <h4 style={{ margin: 0, fontSize: '18px', color: '#333', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h4>
                         <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                         
                         <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', padding: '4px 10px', background: '#f3f4f6', borderRadius: '4px', color: '#555', fontWeight: '500' }}>
                              {user.role}
                            </span>
                            <span style={{ fontSize: '12px', padding: '4px 10px', background: '#f3f4f6', borderRadius: '4px', color: '#555', fontWeight: '500' }}>
                              {user.department || 'N/A'}
                            </span>
                         </div>
                       </div>
                    </div>
                    
                    {activeTab === 'pending' && (
                      <button onClick={() => handleApprove(user._id)} style={{ 
                        marginTop: '20px', width: '100%', padding: '12px', 
                        background: '#10b981', color: 'white', border: 'none', 
                        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' 
                      }}>
                        <CheckCircle size={18} /> Approve User
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      default: return <h2>Coming Soon...</h2>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', overflowX: 'hidden' }}>
      
      {/* 1. Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* 2. Main Content Wrapper - FIXED WIDTH ISSUE */}
      <div 
        style={{ 
          marginLeft: isSidebarOpen ? '290px' : '0', 
          width: 'auto', // ✅ Fix: Auto width prevents scroll
          maxWidth: '100%',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }} 
        className="main-content" // ✅ Fix: Added class for CSS hook
      >

        {/* TOP NAVBAR */}
        <nav style={{ 
          background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '80px', 
          position: 'sticky', top: 0, zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#0f284e', padding: '10px', borderRadius: '8px' }}>
              <Menu size={24} />
            </button>
            <h2 style={{ margin: 0, color: '#0f284e', fontSize: '20px', fontWeight: 'bold' }}>Dashboard</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <span style={{ padding: '8px 16px', borderRadius: '30px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', background: '#0f284e', color: '#d4af37', border: '1px solid #d4af37', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
               SUPER ADMIN
             </span>
             <img src={logo} alt="Profile" style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #d4af37', padding: '2px' }} />
          </div>
        </nav>

        {/* Content Area */}
        <div style={{ padding: '40px', width: '100%' }}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ title, count, icon, color }) => (
  <div className="stat-card" style={{ // ✅ Added class
    background: 'white', padding: '30px', borderRadius: '16px', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderBottom: `5px solid ${color}`,
    display: 'flex', alignItems: 'center', gap: '25px', transition: 'transform 0.3s', cursor: 'pointer'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ padding: '18px', background: `${color}15`, borderRadius: '50%', color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{title}</p>
      <h2 style={{ margin: '8px 0 0', fontSize: '40px', color: '#333', fontWeight: '800' }}>{count}</h2>
    </div>
  </div>
);

export default AdminDashboard;