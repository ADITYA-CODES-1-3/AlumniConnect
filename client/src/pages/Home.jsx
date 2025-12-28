import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Calendar, ArrowRight, ChevronRight, ShieldCheck, Zap, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png'; 
// Use the same NetworkBackground we created earlier
import NetworkBackground from '../components/NetworkBackground'; 

const Home = () => {
  const navigate = useNavigate();

  // Animation Config
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflowX: 'hidden', color: 'white' }}>
      
      {/* 1. INTERACTIVE BACKGROUND (Fixed Layer) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <NetworkBackground />
      </div>

      {/* 2. CONTENT WRAPPER (Z-Index 10 to sit above background) */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* --- NAVBAR (Fixed Mobile Responsiveness) --- */}
        <nav style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          // FIX: Reduced padding for mobile so buttons don't get cut off
          padding: '15px clamp(15px, 5%, 80px)', 
          background: 'rgba(15, 23, 42, 0.7)', 
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          {/* Left: Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{ width: '38px', height: '38px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}
            >
              <img src={logo} alt="Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} onError={(e) => e.target.style.display='none'} />
            </motion.div>
            <h2 style={{ margin: 0, fontWeight: '800', fontSize: 'clamp(18px, 4vw, 22px)', letterSpacing: '0.5px' }}>
              Alumni<span style={{ color: '#38bdf8' }}>Connect</span>
            </h2>
          </div>

          {/* Right: Buttons (Responsive Sizing) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3vw, 20px)' }}>
            <button 
              onClick={() => navigate('/login')} 
              style={{ 
                background: 'transparent', border: 'none', color: '#cbd5e1', fontWeight: '600', cursor: 'pointer', transition: 'color 0.3s',
                fontSize: 'clamp(13px, 2.5vw, 16px)' // Smaller text on mobile
              }}
            >
              Login
            </button>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')} 
              style={{ 
                // FIX: Dynamic padding based on screen size
                padding: '8px clamp(16px, 4vw, 28px)', 
                background: 'linear-gradient(90deg, #38bdf8, #2563eb)', 
                border: 'none', borderRadius: '50px', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                fontSize: 'clamp(13px, 2.5vw, 16px)', whiteSpace: 'nowrap'
              }}
            >
              Join Now
            </motion.button>
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <header style={{ 
          minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
          textAlign: 'center', padding: '0 20px', marginTop: '-40px' // Pull up slightly
        }}>
          <motion.div initial="hidden" animate="visible" variants={stagger} style={{ maxWidth: '1000px' }}>
            
            {/* Badge - Specific to College */}
            <motion.div variants={fadeInUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '30px', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '30px', boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)' }}>
              <GraduationCap size={16} className="animate-pulse" /> OFFICIAL CAMPUS PORTAL
            </motion.div>

            {/* Headline - College Themed */}
            <motion.h1 variants={fadeInUp} style={{ fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: '900', color: 'white', lineHeight: '1.1', marginBottom: '30px', textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              Your Campus. Your <br/>
              <span style={{ 
                background: 'linear-gradient(to right, #38bdf8, #818cf8, #c084fc)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.3))'
              }}>Network.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: '#94a3b8', marginBottom: '50px', maxWidth: '700px', margin: '0 auto 50px', lineHeight: '1.6' }}>
              The exclusive bridge between students and alumni. Get career guidance from seniors, find campus referrals, and stay connected with your alma mater.
            </motion.p>

            <motion.div variants={fadeInUp} style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => navigate('/register')} 
                style={{ padding: '16px 40px', fontSize: '16px', background: 'white', color: '#0f172a', borderRadius: '14px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(255, 255, 255, 0.2)' }}
              >
                Connect Now <ArrowRight size={20} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                onClick={() => navigate('/login')}
                style={{ padding: '16px 40px', fontSize: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '14px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
              >
                Alumni Login
              </motion.button>
            </motion.div>
          </motion.div>
        </header>

        {/* --- STATS SECTION (Floating Glass) --- */}
        <div style={{ marginTop: '-40px', padding: '0 20px', marginBottom: '120px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ 
              maxWidth: '1100px', margin: '0 auto', 
              background: 'rgba(30, 41, 59, 0.6)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: '24px', 
              padding: '50px', 
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <StatItem num="5000+" label="Successful Alumni" icon={<Users size={24} color="#38bdf8"/>} />
            <StatItem num="120+" label="Top Recruiters" icon={<Briefcase size={24} color="#818cf8"/>} />
            <StatItem num="500+" label="Mentorship Sessions" icon={<Zap size={24} color="#fbbf24"/>} />
          </motion.div>
        </div>

        {/* --- FEATURES SECTION --- */}
        <section style={{ padding: '0 20px 150px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ textAlign: 'center', marginBottom: '80px' }}
            >
              <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>Why Join Your <span style={{ color: '#38bdf8' }}>Alma Mater?</span></h2>
              <p style={{ color: '#94a3b8', fontSize: '18px' }}>Designed for Students. Powered by Alumni.</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
              <FeatureCard 
                icon={<Briefcase size={40} color="#38bdf8" />} 
                title="Alumni Referrals" 
                desc="Don't just apply. Get referred by seniors working in top companies like Google, Microsoft, and Zoho." 
              />
              <FeatureCard 
                icon={<Users size={40} color="#c084fc" />} 
                title="Senior Mentorship" 
                desc="Struggling with exams or career path? Book 1-on-1 sessions with experienced seniors." 
              />
              <FeatureCard 
                icon={<Calendar size={40} color="#2dd4bf" />} 
                title="College Reunions" 
                desc="Never miss a campus event. Register for alumni meetups, webinars, and tech talks happening on campus." 
              />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer style={{ background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px', opacity: 0.8 }}>
             <img src={logo} alt="logo" style={{ width: '24px', filter: 'grayscale(100%)' }} />
             <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>AlumniConnect</span>
          </div>
          <p style={{ fontSize: '14px' }}>&copy; 2025 AlumniConnect. Built for the Future.</p>
        </footer>

      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatItem = ({ num, label, icon }) => (
  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%' }}>{icon}</div>
    <h3 style={{ fontSize: '42px', fontWeight: '800', color: 'white', margin: '10px 0 0' }}>{num}</h3>
    <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -15, boxShadow: '0 20px 40px -10px rgba(56, 189, 248, 0.2)' }}
    style={{ 
      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)', 
      backdropFilter: 'blur(10px)',
      padding: '50px', 
      borderRadius: '24px', 
      border: '1px solid rgba(255,255,255,0.05)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Hover Glow Effect */}
    <div className="card-glow" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }}></div>
    
    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>{title}</h3>
    <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '16px' }}>{desc}</p>
    
    <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 'bold', fontSize: '14px' }}>
      Learn more <ChevronRight size={16} />
    </div>
  </motion.div>
);

export default Home;