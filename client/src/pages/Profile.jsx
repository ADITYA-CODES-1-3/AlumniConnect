import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';       
import AdminSidebar from '../components/AdminSidebar'; 
import { Briefcase, Code, Link as LinkIcon, Save, Edit2, Github, Linkedin, Menu, Camera, MapPin, Calendar, User as UserIcon, Mail } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for redirection

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  // Get currently logged-in user to check role
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  });
  const [isOwner, setIsOwner] = useState(false); 

  const [formData, setFormData] = useState({
    name: '', bio: '', about: '', location: '', skills: [],
    socialLinks: { github: '', linkedin: '', website: '' },
    profileImage: '', currentCompany: '', jobRole: '', department: '', rollNumber: ''
  });
  
  const fileInputRef = useRef(null);

  // --- RESPONSIVE SIDEBAR HANDLER ---
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) setIsSidebarOpen(false);
        else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- FETCH PROFILE ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let data;
        
        // If viewing own profile (no ID or ID matches current user)
        if (!id || (currentUser && id === currentUser._id)) {
           const res = await api.get('/auth/me');
           data = res.data;
           setIsOwner(true);
        } else {
           // Viewing someone else's profile
           const res = await api.get(`/auth/users?id=${id}`);
           // API returns array for search, extract single user
           data = Array.isArray(res.data) ? res.data.find(u => u._id === id) : res.data;
           setIsOwner(false);
        }

        if (!data) return toast.error("User not found");

        setUser(data);
        
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          about: data.about || '',
          location: data.location || '',
          skills: data.skills || [],
          socialLinks: data.socialLinks || { github: '', linkedin: '', website: '' },
          profileImage: data.profileImage || '',
          currentCompany: data.currentCompany || '',
          jobRole: data.jobRole || '',
          department: data.department || '',
          rollNumber: data.rollNumber || ''
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, [id, currentUser]);

  const handleChange = (e) => {
    if (!isOwner) return; 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSocialChange = (e) => {
    if (!isOwner) return;
    setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [e.target.name]: e.target.value } });
  };

  const handleImageUpload = (e) => {
    if (!isOwner) return;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) return toast.error("Image size too large! Max 4MB.");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setFormData((prev) => ({ ...prev, profileImage: reader.result }));
    }
  };

  const handleSave = async () => {
    if (!isOwner) return;
    try {
      const updatedData = { ...formData };
      if (typeof updatedData.skills === 'string') {
        updatedData.skills = updatedData.skills.split(',').map(s => s.trim()).filter(s => s);
      }
      const res = await api.put('/auth/me/update', updatedData);
      setUser(res.data.user);
      setIsEditing(false);
      toast.success('Profile Updated Successfully!');
    } catch (err) { toast.error('Update Failed.'); }
  };

  // --- FIX: Handle Admin Sidebar Navigation ---
  // When an Admin is on the Profile page and clicks a sidebar link, 
  // we redirect them back to the Admin Dashboard.
  const handleAdminSidebarClick = (tabName) => {
    navigate('/admin-dashboard'); 
  };

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0f284e' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', overflowX: 'hidden' }}>
      
      {/* 1. SMART SIDEBAR SWITCHING */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 100, 
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        {/* If Admin logged in, show AdminSidebar with redirection logic */}
        {currentUser?.role === 'Admin' ? (
            <AdminSidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                activeTab="" // No active tab while on Profile page
                setActiveTab={handleAdminSidebarClick} // Redirect on click
            />
        ) : (
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        )}
      </div>
      
      {/* 2. MAIN CONTENT AREA */}
      <div style={{ 
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '290px' : '0', 
        width: '100%',
        transition: 'all 0.4s ease'
      }}>
        
        {/* Navbar */}
        <nav style={{ background: 'white', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 40 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f284e' }}><Menu size={24} /></button>
            <h2 style={{ margin: 0, color: '#0f284e', fontSize: '18px', fontWeight: 'bold' }}>
               {isOwner ? "My Profile" : `${user.name}'s Profile`}
            </h2>
           </div>
           
           {isOwner && (
               <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                 style={{ 
                   display: 'flex', gap: '8px', padding: '8px 20px', 
                   background: isEditing ? '#10b981' : '#0f284e', 
                   color: 'white', border: 'none', borderRadius: '50px', 
                   fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', fontSize: '14px',
                   boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                 }}>
                 {isEditing ? <><Save size={16}/> Save</> : <><Edit2 size={16}/> Edit</>}
               </button>
           )}
        </nav>

        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
           
           {/* HEADER CARD */}
           <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '25px', position: 'relative' }}>
             
             {/* Cover Banner */}
             <div style={{ height: '140px', background: 'linear-gradient(135deg, #0f284e 0%, #1e3a8a 100%)' }}></div>
             
             <div style={{ padding: '0 30px 30px', display: 'flex', flexDirection: window.innerWidth < 600 ? 'column' : 'row', alignItems: window.innerWidth < 600 ? 'center' : 'flex-end', gap: '25px', marginTop: '-60px' }}>
                 
                 {/* Photo */}
                 <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ padding: '4px', background: 'white', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <img 
                          src={formData.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&size=200`} 
                          alt="Profile" 
                          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #f0f0f0' }} 
                        />
                    </div>
                    {isEditing && isOwner && (
                      <div onClick={() => fileInputRef.current.click()} style={{ position: 'absolute', bottom: '5px', right: '0', background: '#d4af37', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', border: '2px solid white' }}>
                        <Camera size={18} />
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                 </div>
                 
                 {/* Info */}
                 <div style={{ flex: 1, textAlign: window.innerWidth < 600 ? 'center' : 'left', width: '100%' }}>
                    {isEditing ? (
                        <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Full Name</label>
                            <input name="name" value={formData.name || ''} onChange={handleChange} style={{...inputStyle, fontSize: '18px', fontWeight: 'bold'}} />
                        </div>
                    ) : (
                        <h1 style={{ margin: '0 0 5px', fontSize: '28px', color: '#0f284e', fontWeight: 'bold' }}>{user.name}</h1>
                    )}
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: window.innerWidth < 600 ? 'center' : 'flex-start', marginBottom: '10px' }}>
                         <span style={badgeStyle}><Briefcase size={14} /> {user.role}</span>
                         {user.role === 'Student' && user.batch && (
                            <span style={{...badgeStyle, background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a'}}>
                                <Calendar size={14} /> Batch {user.batch}
                            </span>
                         )}
                         <span style={{...badgeStyle, background: 'transparent', border: '1px solid #e5e7eb', color: '#666'}}>
                            <MapPin size={14} /> {user.role === 'Student' ? 'KGCAS Campus' : 'Alumni Network'}
                         </span>
                    </div>

                    <div style={{ color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: window.innerWidth < 600 ? 'center' : 'flex-start' }}>
                        <Mail size={14} /> {user.email}
                    </div>
                 </div>
             </div>
           </div>

           {/* DETAILS GRID */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
             
             {/* Left */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                 <div style={cardStyle}>
                    <h3 style={sectionTitle}>About Me</h3>
                    {isEditing ? 
                      <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="4" style={{...inputStyle, height: 'auto'}} placeholder="Write a short bio..." /> : 
                      <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '14px' }}>{user.bio || 'No bio added yet.'}</p>
                    }
                 </div>

                 <div style={cardStyle}>
                    <h3 style={sectionTitle}><UserIcon size={18} style={{marginRight:'8px'}}/> {user.role === 'Alumni' ? 'Experience' : 'Academic Details'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                       <div>
                          <label style={labelStyle}>{user.role === 'Alumni' ? 'Company' : 'Department'}</label>
                          {isEditing ? 
                             <input name={user.role === 'Alumni' ? 'currentCompany' : 'department'} value={user.role === 'Alumni' ? formData.currentCompany : formData.department} onChange={handleChange} style={inputStyle} /> :
                             <p style={valueStyle}>{user.role === 'Alumni' ? user.currentCompany : user.department || 'N/A'}</p>
                          }
                       </div>
                       <div>
                          <label style={labelStyle}>{user.role === 'Alumni' ? 'Role' : 'Roll No.'}</label>
                          {isEditing ? 
                             <input name={user.role === 'Alumni' ? 'jobRole' : 'rollNumber'} value={user.role === 'Alumni' ? formData.jobRole : formData.rollNumber} onChange={handleChange} style={inputStyle} /> :
                             <p style={valueStyle}>{user.role === 'Alumni' ? user.jobRole : user.rollNumber || 'N/A'}</p>
                          }
                       </div>
                    </div>
                 </div>
             </div>

             {/* Right */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                 <div style={cardStyle}>
                    <h3 style={sectionTitle}><Code size={18} style={{marginRight:'8px'}}/> Skills</h3>
                    {isEditing ? 
                       <input name="skills" value={formData.skills || ''} onChange={handleChange} placeholder="e.g. Java, React (Comma separated)" style={inputStyle} /> :
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {user.skills?.length > 0 ? user.skills.map((s, i) => <span key={i} style={skillTag}>{s}</span>) : <span style={{color:'#999', fontSize:'13px'}}>No skills added.</span>}
                       </div>
                    }
                 </div>

                 <div style={cardStyle}>
                    <h3 style={sectionTitle}><LinkIcon size={18} style={{marginRight:'8px'}}/> Socials</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={socialRow}>
                            <Github size={18}/> 
                            {isEditing ? <input name="github" value={formData.socialLinks?.github || ''} onChange={handleSocialChange} style={inputStyle} placeholder="GitHub URL"/> : 
                            <a href={user.socialLinks?.github || '#'} target="_blank" rel="noreferrer" style={linkStyle}>{user.socialLinks?.github ? 'GitHub Profile' : <span style={{color:'#ccc'}}>Not Added</span>}</a>}
                        </div>
                        <div style={socialRow}>
                            <Linkedin size={18} color="#0077b5"/> 
                            {isEditing ? <input name="linkedin" value={formData.socialLinks?.linkedin || ''} onChange={handleSocialChange} style={inputStyle} placeholder="LinkedIn URL"/> : 
                            <a href={user.socialLinks?.linkedin || '#'} target="_blank" rel="noreferrer" style={linkStyle}>{user.socialLinks?.linkedin ? 'LinkedIn Profile' : <span style={{color:'#ccc'}}>Not Added</span>}</a>}
                        </div>
                    </div>
                 </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const cardStyle = { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' };
const sectionTitle = { fontSize: '15px', fontWeight: 'bold', color: '#0f284e', marginBottom: '15px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', background: '#fff' };
const labelStyle = { display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' };
const valueStyle = { fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 };
const skillTag = { background: '#f0f9ff', color: '#0369a1', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: '1px solid #bae6fd' };
const socialRow = { display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' };
const linkStyle = { color: '#0f284e', textDecoration: 'none', fontSize: '13px', fontWeight: '600', overflow:'hidden', textOverflow:'ellipsis' };
const badgeStyle = { display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };

export default Profile;