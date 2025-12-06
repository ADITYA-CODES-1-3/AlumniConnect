import React, { useEffect } from 'react'; // 1. IMPORT useEffect HERE
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, Calendar, MessageSquare, LogOut, UserCircle, X 
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={24} />, path: '/dashboard' },
    { name: 'Mentorship', icon: <Users size={24} />, path: '/mentorship' },
    { name: 'Jobs & Internships', icon: <Briefcase size={24} />, path: '/jobs' },
    { name: 'Events', icon: <Calendar size={24} />, path: '/events' },
    { name: 'Community Chat', icon: <MessageSquare size={24} />, path: '/chat' },
    { name: 'My Profile', icon: <UserCircle size={24} />, path: '/profile' },
  ];

  // --- 2. NEW CODE: SCROLL LOCK LOGIC START ---
useEffect(() => {
    const handleResize = () => {
      if (isOpen && window.innerWidth < 768) {
        // HTML & BODY rendayum lock panrom - ithu dhan mukkiyam!
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        // Release lock
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };

    // Trigger immediately when Sidebar opens/closes
    handleResize();

    window.addEventListener('resize', handleResize);

    // Cleanup: Sidebar mooduna udane lock release aaganum
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);
  // --- NEW CODE END ---

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay - Mobile Only */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          className="md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <div style={{ 
        width: '280px', 
        background: '#0f284e', 
        color: 'white',
        position: 'fixed', 
        top: 0, 
        bottom: 0, 
        left: 0, 
        zIndex: 1000,
        boxShadow: isOpen ? '10px 0 25px rgba(0,0,0,0.15)' : 'none',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', 
        flexDirection: 'column',
      }}>
        
        {/* Header */}
        <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ color: '#d4af37', fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px', margin: 0 }}>
            Alumni<span style={{ color: 'white' }}>Connect</span>
          </h2>
          <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
             <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '10px 15px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px' 
        }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.name}
                onClick={() => { 
                  navigate(item.path); 
                  if(window.innerWidth < 768) toggleSidebar(); 
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px',
                  borderRadius: '10px', cursor: 'pointer',
                  background: isActive ? 'linear-gradient(90deg, rgba(212,175,55,0.15) 0%, rgba(15,40,78,0) 100%)' : 'transparent',
                  color: isActive ? '#d4af37' : '#b0b8c4',
                  borderLeft: isActive ? '4px solid #d4af37' : '4px solid transparent',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? '600' : '500', fontSize: '15px'
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          flexShrink: 0,
          marginBottom: 'safe-area-inset-bottom'
        }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '12px', background: 'rgba(212, 175, 55, 0.1)', 
              color: '#d4af37', border: '1px solid #d4af37', borderRadius: '10px', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              gap: '10px', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.3s'
            }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;