import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';
import { Users, GraduationCap, Clock, Menu, Search, XCircle, CheckCircle, TrendingUp, Loader } from 'lucide-react';
import logo from '../assets/logo.png'; 
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [stats, setStats] = useState({ students: 0, alumni: 0, pending: 0 });
  const [dataList, setDataList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // Added Loading State

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Stats on Mount
  useEffect(() => { fetchStats(); }, []);

  // Fetch Data when Tab Changes
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
    setLoading(true);
    try {
      let res;
      if (type === 'Pending') res = await api.get('/auth/pending-users');
      else res = await api.get(`/auth/users?role=${type}`);
      setDataList(res.data);
    } catch (err) { 
      console.error(err); 
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/auth/approve/${id}`);
      toast.success('User Approved');
      
      // Update UI Immediately (Optimistic Update)
      if (activeTab === 'pending') {
         setDataList(prevList => prevList.filter(u => u._id !== id));
      }
      
      fetchStats(); // Refresh stats counters in background
    } catch (err) { toast.error('Failed to Approve'); }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Reject and remove this user?")) return;
    try {
      await api.delete(`/auth/reject/${id}`);
      toast.success('User Rejected');
      
      // Update UI Immediately
      setDataList(prevList => prevList.filter(u => u._id !== id));
      
      fetchStats();
    } catch (err) { toast.error('Failed to Reject'); }
  };

  const filteredList = dataList.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') {
        return (
          <div className="animate-fade-in">
             {/* Modern Banner */}
             <div style={{ 
                background: 'linear-gradient(120deg, #0f284e 0%, #1e3a8a 100%)', 
                borderRadius: '20px', padding: '40px', color: 'white', marginBottom: '40px',
                boxShadow: '0 20px 40px -10px rgba(15, 40, 78, 0.4)', position: 'relative', overflow: 'hidden'
             }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h1 style={{ fontSize: '32px', marginBottom: '10px', fontWeight: '800', letterSpacing: '-1px' }}>Welcome Back, Admin</h1>
                  <p style={{ opacity: 0.9, fontSize: '16px', maxWidth: '600px' }}>
                    Monitor your university network performance, manage verification requests, and oversee alumni connections.
                  </p>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'white', opacity: 0.1, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-80px', right: '50px', width: '150px', height: '150px', background: '#d4af37', opacity: 0.2, borderRadius: '50%' }}></div>
             </div>

            {/* STATS GRID */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
              <StatCard 
                title="Total Students" 
                count={stats.students} 
                icon={<Users size={28} color="white" />} 
                color1="#3b82f6" color2="#2563eb" 
                trend="+8% this month"
              />
              <StatCard 
                title="Total Alumni" 
                count={stats.alumni} 
                icon={<GraduationCap size={28} color="white" />} 
                color1="#f59e0b" color2="#d97706" 
                trend="+5% this month"
              />
              <StatCard 
                title="Pending Requests" 
                count={stats.pending} 
                icon={<Clock size={28} color="white" />} 
                color1="#ef4444" color2="#dc2626" 
                trend="Action Required"
              />
            </div>
          </div>
        );
    }

    // LIST VIEWS (Students, Alumni, Pending)
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ color: '#0f284e', fontSize: '28px', fontWeight: '800', margin: 0, textTransform: 'capitalize' }}>
              {activeTab === 'pending' ? 'Pending Approvals' : `${activeTab} Directory`}
            </h2>
            <p style={{ color: '#666', marginTop: '5px' }}>
              {loading ? 'Updating list...' : `Showing ${filteredList.length} ${activeTab === 'pending' ? 'requests' : 'users'}`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '12px 20px', borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '350px', maxWidth: '100%' }}>
             <Search size={20} color="#9ca3af" />
             <input 
               type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
               style={{ border: 'none', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '15px' }} 
             />
             {searchTerm && <XCircle size={18} color="#ccc" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />}
          </div>
        </div>
        
        {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Loader className="animate-spin" size={40} color="#0f284e" />
            </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
            <p style={{ color: '#9ca3af', fontSize: '18px' }}>No records found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
            {filteredList.map(user => (
              <div 
                key={user._id} 
                onClick={() => navigate(`/profile/${user._id}`)}
                style={{ 
                  background: 'white', padding: '25px', borderRadius: '16px', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f3f4f6', transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Top Stripe */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: user.role === 'Student' ? '#3b82f6' : '#f59e0b' }}></div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                   <div style={{ 
                     width: '56px', height: '56px', borderRadius: '16px', background: '#f8fafc',
                     display: 'flex', alignItems: 'center', justifyContent: 'center', 
                     color: '#0f284e', fontSize: '22px', fontWeight: 'bold', border: '1px solid #e2e8f0'
                   }}>
                     {user.name.charAt(0).toUpperCase()}
                   </div>
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h4>
                     <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                     <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', fontWeight: '600', display: 'inline-block', marginTop: '5px' }}>
                        {user.department || 'General'} • {user.batch || 'N/A'}
                     </span>
                   </div>
                </div>
                
                {activeTab === 'pending' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '25px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleApprove(user._id); }}
                        style={{ 
                        padding: '12px', background: '#dcfce7', color: '#166534', border: 'none', 
                        borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}>
                        <CheckCircle size={18} /> Approve
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleReject(user._id); }}
                        style={{ 
                        padding: '12px', background: '#fee2e2', color: '#991b1b', border: 'none', 
                        borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}>
                        <XCircle size={18} /> Reject
                      </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', overflowX: 'hidden' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 100, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}>
        <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div style={{ marginLeft: isSidebarOpen && window.innerWidth > 768 ? '290px' : '0', transition: 'all 0.3s' }}>
        <nav style={{ background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', position: 'sticky', top: 0, zIndex: 90, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><Menu size={24} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f284e', background: '#f1f5f9', padding: '8px 16px', borderRadius: '30px' }}>SUPER ADMIN</span>
              <img src={logo} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #e2e8f0' }} />
          </div>
        </nav>
        <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// IMPROVED STAT CARD COMPONENT
const StatCard = ({ title, count, icon, color1, color2, trend }) => (
  <div style={{ 
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`, 
    padding: '25px', borderRadius: '20px', color: 'white',
    boxShadow: '0 10px 20px -5px rgba(0,0,0,0.15)', cursor: 'pointer',
    position: 'relative', overflow: 'hidden', transition: 'transform 0.3s'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>{title}</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '42px', fontWeight: '800' }}>{count}</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
          {icon}
        </div>
      </div>
      <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', opacity: 0.9 }}>
        <TrendingUp size={16} /> <span>{trend}</span>
      </div>
    </div>
    {/* Decorative Circles */}
    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'white', opacity: 0.1, borderRadius: '50%' }}></div>
  </div>
);

export default AdminDashboard;