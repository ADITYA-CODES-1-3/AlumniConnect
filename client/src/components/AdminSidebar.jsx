import React from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Briefcase, 
  Calendar, LogOut, ShieldAlert, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isOpen, toggleSidebar, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
    { id: 'students', label: 'Students List', icon: <Users size={22} /> },
    { id: 'alumni', label: 'Alumni Directory', icon: <GraduationCap size={22} /> },
    { id: 'pending', label: 'Pending Approvals', icon: <ShieldAlert size={22} /> },
    { id: 'jobs', label: 'Manage Jobs', icon: <Briefcase size={22} /> },
    { id: 'events', label: 'Manage Events', icon: <Calendar size={22} /> },
  ];

  return (
    <>
      {/* Mobile Overlay (Darkens background on mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Container - NAVY BLUE THEME */}
      <div 
        className={`
          fixed top-0 left-0 z-50 h-screen w-[290px] flex flex-col
          bg-[#0f284e] text-white shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8 border-b border-white/10">
          <h2 className="text-2xl font-extrabold tracking-wider text-[#d4af37]">
            ADMIN <span className="text-white">PANEL</span>
          </h2>
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={toggleSidebar} 
            className="text-white/70 hover:text-[#d4af37] md:hidden transition-colors"
          >
            <X size={26} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            
            return (
              <div 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) toggleSidebar(); 
                }}
                className={`
                  relative flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer
                  transition-all duration-300 font-medium text-[16px] group
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#d4af37]/20 to-transparent text-[#d4af37] font-bold' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                {/* Gold Active Line (Left Border Effect) */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#d4af37] rounded-r-full shadow-[0_0_10px_#d4af37]"></div>
                )}

                {/* Icon */}
                <div className={`${isActive ? 'text-[#d4af37]' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleLogout} 
            className="
              w-full flex items-center justify-center gap-3 px-4 py-3.5
              bg-transparent border border-[#d4af37] rounded-xl text-[#d4af37] font-bold
              hover:bg-[#d4af37] hover:text-[#0f284e] transition-all duration-300
              shadow-[0_4px_15px_rgba(212,175,55,0.1)] hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)]
            "
          >
            <LogOut size={20} /> 
            <span>Logout</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default AdminSidebar;