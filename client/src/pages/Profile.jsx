import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Import to read ID from URL
import api from '../utils/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { Briefcase, Code, Link as LinkIcon, Save, Edit2, Github, Linkedin, Menu, Camera, MapPin, Calendar, User as UserIcon, Mail } from 'lucide-react';

const Profile = () => {
  const { id } = useParams(); // Get ID from URL parameters
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Track if the logged-in user owns this profile
  const [isOwner, setIsOwner] = useState(false); 

  // Initial Empty State
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    about: '',
    location: '',
    skills: [],
    socialLinks: { github: '', linkedin: '', website: '' },
    profileImage: '',
    currentCompany: '', 
    jobRole: '',
    department: '',
    rollNumber: ''
  });
  
  const fileInputRef = useRef(null);

  // 1. Fetch Profile Data (Logic Updated)
  useEffect(() => {
    fetchProfile();
  }, [id]); // Re-run when ID changes

  const fetchProfile = async () => {
    try {
      let data;
      
      if (id) {
        // CASE A: Viewing someone else (Read-Only)
        const res = await api.get(`/auth/users?id=${id}`);
        
        // The API returns an array for search, so pick the correct user
        if (Array.isArray(res.data)) {
           data = res.data.find(u => u._id === id);
        } else {
           data = res.data;
        }
        
        setIsOwner(false); // It's not my profile
      } else {
        // CASE B: Viewing myself (Editable)
        const res = await api.get('/auth/me');
        data = res.data;
        setIsOwner(true); // It is my profile
      }

      if (!data) {
        toast.error("User not found");
        return;
      }

      setUser(data);
      
      // Initialize Form Data safely
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

  // 2. Handle Text Input (Only if Owner)
  const handleChange = (e) => {
    if (!isOwner) return; 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // 3. Handle Social Links (Only if Owner)
  const handleSocialChange = (e) => {
    if (!isOwner) return;
    setFormData({
      ...formData,
      socialLinks: { 
        ...formData.socialLinks, 
        [e.target.name]: e.target.value 
      }
    });
  };

  // 4. Handle Image Upload (Only if Owner)
  const handleImageUpload = (e) => {
    if (!isOwner) return;

    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Image size too large! Max 4MB.");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
    }
  };

  // 5. Save Changes (Only if Owner)
  const handleSave = async () => {
    if (!isOwner) return;

    try {
      const updatedData = { ...formData };
      
      // Convert skills string to array if edited as text
      if (typeof updatedData.skills === 'string') {
        updatedData.skills = updatedData.skills.split(',').map(s => s.trim()).filter(s => s);
      }
      
      const res = await api.put('/auth/update-profile', updatedData);
      setUser(res.data.user);
      setIsEditing(false);
      toast.success('Profile Updated Successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Update Failed.');
    }
  };

  if (!user) return <div style={{ padding: '50px', textAlign: 'center', color: '#0f284e' }}>Loading Profile...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex' }}>
      
      {/* Sidebar Overlay for Mobile */}
      <div className={isSidebarOpen ? "sidebar-open" : "sidebar-closed"}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>
      
      <div style={{ 
        flex: 1,
        marginLeft: isSidebarOpen ? '290px' : '0', 
        width: '100%',
        transition: 'all 0.4s ease'
      }} className="main-content">
        
        {/* Navbar */}
        <nav style={{ background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 40 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f284e' }}><Menu size={24} /></button>
            <h2 style={{ margin: 0, color: '#0f284e', fontSize: '20px', fontWeight: 'bold' }}>
               {isOwner ? "My Profile" : `${user.name}'s Profile`}
            </h2>
           </div>
           
           {/* Only show Edit button if I am the Owner */}
           {isOwner && (
               <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                 style={{ 
                   display: 'flex', gap: '8px', padding: '10px 24px', 
                   background: isEditing ? '#10b981' : '#0f284e', 
                   color: 'white', border: 'none', borderRadius: '50px', 
                   fontWeight: 'bold', cursor: 'pointer', transition: '0.3s',
                   boxShadow: '0 4px 15px rgba(15, 40, 78, 0.2)'
                 }}>
                 {isEditing ? <><Save size={18}/> Save Changes</> : <><Edit2 size={18}/> Edit Profile</>}
               </button>
           )}
        </nav>

        <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
           
           {/* 1. HEADER CARD */}
           <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '25px', position: 'relative' }}>
             
             {/* Cover Banner */}
             <div style={{ height: '160px', background: '#0f284e' }}></div>
             
             <div style={{ padding: '0 40px 30px', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '30px', flexWrap: 'wrap' }}>
                 
                 {/* Photo Section */}
                 <div style={{ marginTop: '-70px', position: 'relative', flexShrink: 0 }}>
                    <div style={{ padding: '4px', background: 'white', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <img 
                          src={formData.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&size=200`} 
                          alt="Profile" 
                          style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #f0f0f0' }} 
                        />
                    </div>
                    
                    {/* Camera Icon - Only visible to Owner in Edit Mode */}
                    {isEditing && isOwner && (
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        style={{ 
                          position: 'absolute', bottom: '10px', right: '5px', 
                          background: '#d4af37', color: 'white', padding: '10px', 
                          borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          border: '2px solid white'
                        }}
                      >
                        <Camera size={20} />
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                 </div>
                 
                 {/* Info Section */}
                 <div style={{ flex: 1, paddingBottom: '5px', minWidth: '250px' }}>
                    {isEditing ? (
                        <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Full Name</label>
                            <input name="name" value={formData.name || ''} onChange={handleChange} style={{...inputStyle, fontSize: '20px', fontWeight: 'bold'}} />
                        </div>
                    ) : (
                        <h1 style={{ margin: '0 0 8px', fontSize: '32px', color: '#0f284e', fontWeight: 'bold' }}>{user.name}</h1>
                    )}
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                         <span style={badgeStyle}>
                            <Briefcase size={14} /> {user.role}
                         </span>
                         
                         {user.role === 'Student' && user.batch && (
                            <span style={{...badgeStyle, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a'}}>
                                <Calendar size={14} /> Batch of {user.batch}
                            </span>
                         )}

                         <span style={{...badgeStyle, background: 'transparent', border: '1px solid #e5e7eb', color: '#666'}}>
                            <MapPin size={14} /> {user.role === 'Student' ? 'Campus' : 'Alumni Network'}
                         </span>
                    </div>
                 </div>

                 {/* Email Display */}
                 <div style={{ paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px' }}>
                     <Mail size={16} /> {user.email}
                 </div>
             </div>
           </div>

           {/* 2. DETAILS GRID */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
             
             {/* Left Column */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                 
                 {/* About Card */}
                 <div style={cardStyle}>
                    <h3 style={sectionTitle}>About Me</h3>
                    {isEditing ? 
                      <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="4" style={{...inputStyle, height: 'auto', lineHeight: '1.5'}} placeholder="Write a short bio..." /> : 
                      <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '15px' }}>{user.bio || 'No bio added yet.'}</p>
                    }
                 </div>

                 {/* Work/Academic Info */}
                 <div style={cardStyle}>
                    <h3 style={sectionTitle}><UserIcon size={18} style={{marginRight:'8px'}}/> {user.role === 'Alumni' ? 'Work Experience' : 'Academic Details'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                       <div>
                          <label style={labelStyle}>{user.role === 'Alumni' ? 'Current Company' : 'Department'}</label>
                          {isEditing ? 
                             <input name={user.role === 'Alumni' ? 'currentCompany' : 'department'} value={user.role === 'Alumni' ? formData.currentCompany : formData.department} onChange={handleChange} style={inputStyle} /> :
                             <p style={valueStyle}>{user.role === 'Alumni' ? user.currentCompany : user.department || 'N/A'}</p>
                          }
                       </div>
                       <div>
                          <label style={labelStyle}>{user.role === 'Alumni' ? 'Designation' : 'Roll Number'}</label>
                          {isEditing ? 
                             <input name={user.role === 'Alumni' ? 'jobRole' : 'rollNumber'} value={user.role === 'Alumni' ? formData.jobRole : formData.rollNumber} onChange={handleChange} style={inputStyle} /> :
                             <p style={valueStyle}>{user.role === 'Alumni' ? user.jobRole : user.rollNumber || 'N/A'}</p>
                          }
                       </div>
                    </div>
                 </div>
             </div>

             {/* Right Column */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                 
                 {/* Skills Card */}
                 <div style={cardStyle}>
                    <h3 style={sectionTitle}><Code size={18} style={{marginRight:'8px'}}/> Skills</h3>
                    {isEditing ? 
                       <input name="skills" value={formData.skills || ''} onChange={handleChange} placeholder="Java, React, Python (Comma separated)" style={inputStyle} /> :
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {user.skills?.length > 0 ? user.skills.map((s, i) => <span key={i} style={skillTag}>{s}</span>) : <span style={{color:'#9ca3af', fontSize: '14px'}}>No skills added.</span>}
                       </div>
                    }
                 </div>

                 {/* Social Links Card */}
                 <div style={cardStyle}>
                    <h3 style={sectionTitle}><LinkIcon size={18} style={{marginRight:'8px'}}/> Social Links</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        
                        <div style={socialRow}>
                            <Github size={18}/> 
                            {isEditing ? (
                               <input name="github" value={formData.socialLinks?.github || ''} onChange={handleSocialChange} style={inputStyle} placeholder="GitHub URL"/>
                            ) : (
                               <a href={user.socialLinks?.github || '#'} target="_blank" rel="noreferrer" style={linkStyle}>
                                   {user.socialLinks?.github ? 'GitHub Profile' : <span style={{color:'#ccc', fontWeight:'normal'}}>Not Added</span>}
                               </a>
                            )}
                        </div>
                        
                        <div style={socialRow}>
                            <Linkedin size={18} color="#0077b5"/> 
                            {isEditing ? (
                               <input name="linkedin" value={formData.socialLinks?.linkedin || ''} onChange={handleSocialChange} style={inputStyle} placeholder="LinkedIn URL"/>
                            ) : (
                               <a href={user.socialLinks?.linkedin || '#'} target="_blank" rel="noreferrer" style={linkStyle}>
                                   {user.socialLinks?.linkedin ? 'LinkedIn Profile' : <span style={{color:'#ccc', fontWeight:'normal'}}>Not Added</span>}
                               </a>
                            )}
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
const cardStyle = { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' };
const sectionTitle = { fontSize: '16px', fontWeight: 'bold', color: '#0f284e', marginBottom: '20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', background: '#fff', transition: 'border 0.2s', color: '#1f2937' };
const labelStyle = { display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' };
const valueStyle = { fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 };
const skillTag = { background: '#f0f9ff', color: '#0369a1', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #bae6fd' };
const socialRow = { display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' };
const linkStyle = { color: '#0f284e', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'color 0.2s', wordBreak: 'break-all' };
const badgeStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontSize: '13px', fontWeight: '700' };

export default Profile;