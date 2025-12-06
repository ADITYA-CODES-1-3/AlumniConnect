import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Calendar, ArrowRight, ChevronRight, ShieldCheck } from 'lucide-react';
// IMPORTANT: Ensure logo.png is in client/src/assets/ folder
import logo from '../assets/logo.png'; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#ffffff', color: '#333', overflowX: 'hidden' }}>
      
      {/* 1. Glassmorphism Navbar (Sticky & Clean) */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        /* FIX 1: Responsive Padding using clamp (Mobile: 20px, Laptop: 6%) */
        padding: '15px clamp(20px, 6%, 80px)', 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(15px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          {/* LOGO IMAGE */}
          <img 
            src={logo} 
            alt="AlumniConnect Logo" 
            /* FIX 2: Logo scaling for mobile */
            style={{ width: 'clamp(35px, 5vw, 45px)', height: 'clamp(35px, 5vw, 45px)', objectFit: 'contain' }} 
            onError={(e) => { e.target.style.display='none'; }} 
          />
          {/* Text Logo */}
          <h2 style={{ margin: 0, color: '#0f284e', fontWeight: '800', fontSize: 'clamp(18px, 2.5vw, 24px)', letterSpacing: '-0.5px' }}>
            Alumni<span style={{ color: '#d4af37' }}>Connect</span>
          </h2>
        </div>
        
        <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 20px)', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/login')} 
            style={{ 
              padding: '10px 25px', background: 'transparent', color: '#0f284e', 
              fontWeight: '700', fontSize: '15px', border: '2px solid transparent', 
              cursor: 'pointer', transition: 'all 0.3s', borderRadius: '8px',
              /* Hide login text on very small screens if needed, otherwise keep it */
              display: 'block' 
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#0f284e'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')} 
            style={{ 
              padding: '10px clamp(15px, 3vw, 30px)', background: '#0f284e', border: 'none', 
              color: 'white', borderRadius: '50px', fontWeight: 'bold', 
              cursor: 'pointer', boxShadow: '0 8px 20px rgba(15, 40, 78, 0.25)', 
              transition: 'all 0.3s', fontSize: '15px', whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(15, 40, 78, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 40, 78, 0.25)';
            }}
          >
            Join
          </button>
        </div>
      </nav>

      {/* 2. Massive Hero Section */}
      <header style={{ 
        textAlign: 'center', 
        /* FIX 3: Responsive Padding (Less on mobile, More on Laptop) */
        padding: 'clamp(80px, 10vh, 120px) 20px clamp(100px, 12vh, 140px)', 
        background: 'radial-gradient(circle at 50% 50%, #fcfcfc 0%, #f1f5f9 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '600px', height: '600px', background: 'rgba(212,175,55,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'rgba(15,40,78,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', 
            borderRadius: '30px', fontSize: '13px', fontWeight: '800', marginBottom: '30px', 
            letterSpacing: '0.5px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}>
            <ShieldCheck size={16} /> The Official Alumni Portal
          </div>
          
          {/* BIGGER HEADER TEXT */}
          <h1 style={{ 
            /* FIX 4: Clamp Font Size (Mobile: 36px, Laptop: 64px) */
            fontSize: 'clamp(36px, 8vw, 64px)', 
            color: '#0f284e', 
            marginBottom: '25px', 
            lineHeight: '1.1', 
            fontWeight: '900', 
            letterSpacing: '-2px' 
          }}>
            Your Network is your <br/> 
            <span style={{ 
              background: 'linear-gradient(90deg, #d4af37 0%, #b4860b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textDecoration: 'underline', 
              textDecorationColor: 'rgba(212, 175, 55, 0.3)', 
              textDecorationThickness: '6px' 
            }}>
              Net Worth.
            </span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)', /* Responsive Paragraph */
            color: '#555', 
            marginBottom: '50px', 
            maxWidth: '700px', 
            margin: '0 auto 50px', 
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Reconnect with seniors, mentor juniors, find exclusive job opportunities, and build a lasting legacy with your institution.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/register')} 
              style={{ 
                padding: '18px 45px', fontSize: '18px', background: '#d4af37', 
                color: '#0f284e', border: 'none', borderRadius: '12px', 
                fontWeight: 'bold', cursor: 'pointer', display: 'flex', 
                alignItems: 'center', gap: '10px', transition: 'all 0.3s', 
                boxShadow: '0 15px 30px rgba(212, 175, 55, 0.3)' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(212, 175, 55, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(212, 175, 55, 0.3)';
              }}
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '18px 40px', fontSize: '18px', background: 'white', 
                color: '#0f284e', border: '2px solid #e5e7eb', borderRadius: '12px', 
                fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' 
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = '#0f284e'; 
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = '#e5e7eb'; 
                e.currentTarget.style.background = 'white';
              }}
            >
              Member Login
            </button>
          </div>
        </div>
      </header>

      {/* 3. Stats Section (Floating Bar) */}
      <div style={{ maxWidth: '1100px', margin: '-60px auto 0', position: 'relative', zIndex: 10, padding: '0 20px' }}>
        <div style={{ 
          background: '#0f284e', padding: '40px', borderRadius: '20px', 
          /* FIX 5: Reduced min-width to 200px so it fits mobile screen */
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          textAlign: 'center', color: 'white', boxShadow: '0 20px 50px rgba(15, 40, 78, 0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          gap: '20px' /* Added gap so stacked items don't touch */
        }}>
          <div style={{ borderRight: window.innerWidth > 768 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0, color: '#d4af37' }}>5000+</h2>
            <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: '14px', letterSpacing: '2px', fontWeight: '600' }}>ALUMNI CONNECTED</p>
          </div>
          <div style={{ borderRight: window.innerWidth > 768 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0, color: '#d4af37' }}>120+</h2>
            <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: '14px', letterSpacing: '2px', fontWeight: '600' }}>TOP COMPANIES</p>
          </div>
          <div>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0, color: '#d4af37' }}>50+</h2>
            <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: '14px', letterSpacing: '2px', fontWeight: '600' }}>YEARLY EVENTS</p>
          </div>
        </div>
      </div>

      {/* 4. Features Grid - Clean & Spacious */}
      <section style={{ padding: '120px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '70px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 36px)', color: '#0f284e', fontWeight: '900', marginBottom: '15px' }}>Why Join AlumniConnect?</h2>
            <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>Unlock the power of your institution's global network with tools designed for your growth.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <FeatureCard 
              icon={<Briefcase size={36} />} 
              title="Exclusive Job Portal" 
              desc="Access high-paying jobs and internships posted directly by alumni working in top MNCs like Google and Zoho." 
            />
            <FeatureCard 
              icon={<Users size={36} />} 
              title="1-on-1 Mentorship" 
              desc="Book private sessions with seniors for career guidance, resume reviews, and mock interviews to crack your dream job." 
            />
            <FeatureCard 
              icon={<Calendar size={36} />} 
              title="Reunions & Events" 
              desc="Never miss a college event. RSVP for tech talks, workshops, and alumni meetups happening near you." 
            />
          </div>
        </div>
      </section>

      {/* 5. Footer - Compact & Mobile Friendly */}
      <footer style={{ background: '#0b1e3b', color: 'white', borderTop: '4px solid #d4af37' }}>
        <div style={{ 
            maxWidth: '1200px', margin: '0 auto', 
            /* REDUCED PADDING: 20px on mobile, 40px on laptop */
            padding: 'clamp(20px, 4vh, 40px) 20px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            flexWrap: 'wrap', gap: '15px' 
        }}>
            
            {/* Left: Brand Identity & Copyright */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: 'white', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Reduced Logo Size: 20px */}
                        <img src={logo} alt="Logo" style={{ width: '20px', height: '20px' }} onError={(e) => e.target.style.display='none'} />
                    </div>
                    {/* Reduced Font Size: 16px */}
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>AlumniConnect</h3>
                </div>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginLeft: '2px' }}>
                    &copy; 2025 AlumniConnect.
                </p>
            </div>

            {/* Right: Legal & Support Links */}
            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', fontWeight: '600', color: '#d4af37', flexWrap: 'wrap' }}>
                <span style={{ cursor: 'pointer', opacity: 0.8 }}>Privacy</span>
                <span style={{ cursor: 'pointer', opacity: 0.8 }}>Terms</span>
                <span style={{ cursor: 'pointer', opacity: 0.8 }}>Support</span>
            </div>
        </div>
      </footer>

    </div>
  );
};

// Polished Feature Card Component
const FeatureCard = ({ icon, title, desc }) => (
  <div style={{ 
    background: 'white', 
    padding: '40px 30px', 
    borderRadius: '20px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)', 
    transition: 'all 0.3s ease',
    cursor: 'default',
    border: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    height: '100%'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-10px)';
    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.06)';
    e.currentTarget.style.borderColor = '#d4af37';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
    e.currentTarget.style.borderColor = '#f0f0f0';
  }}
  >
    <div style={{ 
      width: '70px', height: '70px', background: '#f0f4ff', borderRadius: '18px', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', color: '#0f284e' 
    }}>
      {icon}
    </div>
    <h3 style={{ margin: '0 0 15px', color: '#0f284e', fontSize: '22px', fontWeight: '800' }}>{title}</h3>
    <p style={{ color: '#666', lineHeight: '1.7', fontSize: '15px', margin: 0 }}>{desc}</p>
    <div style={{ marginTop: 'auto', paddingTop: '25px', display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
      Learn more <ChevronRight size={16} />
    </div>
  </div>
);

export default Home;