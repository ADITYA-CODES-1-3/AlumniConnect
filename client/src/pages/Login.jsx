import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Hexagon, Terminal } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import logo from '../assets/logo.png';
import Loader from '../components/Loader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const navigate = useNavigate();

  // --- SPOTLIGHT LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const spotlightBg = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(56, 189, 248, 0.1), transparent 80%)`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Access Granted');
      setTimeout(() => {
        const role = res.data.user.role.toLowerCase();
        if (role === 'admin') navigate('/admin-dashboard');
        else navigate('/dashboard');
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Access Denied');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', width: '100%', 
      background: '#020617', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      position: 'relative', overflow: 'hidden', fontFamily: "'Segoe UI', sans-serif"
    }}>

      {/* --- 0. AUTOFILL CSS HACK (Keeps Inputs Dark) --- */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px rgba(2, 6, 23, 0.8) inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: white;
        }
      `}</style>

      {/* --- 1. BACKGROUND: MOVING CYBER GRID --- */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        
        {/* The Grid Floor */}
        <div style={{ 
          position: 'absolute', inset: -100, 
          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)', 
          backgroundSize: '60px 60px', 
          transform: 'perspective(500px) rotateX(60deg) scale(2)',
          opacity: 0.2,
          animation: 'gridMove 20s linear infinite'
        }}></div>
        <style>{`@keyframes gridMove { 0% { transform: perspective(500px) rotateX(60deg) scale(2) translateY(0); } 100% { transform: perspective(500px) rotateX(60deg) scale(2) translateY(60px); } }`}</style>

        {/* Floating Objects */}
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '15%', left: '10%', color: '#38bdf8', opacity: 0.2 }}
        >
          <Hexagon size={180} strokeWidth={0.5} />
        </motion.div>

        <motion.div 
          animate={{ y: [0, 40, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', bottom: '20%', right: '10%', color: '#6366f1', opacity: 0.2 }}
        >
          <Hexagon size={250} strokeWidth={0.5} />
        </motion.div>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader />
        </div>
      )}

      {/* --- 3. MAIN CARD --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
        onMouseMove={handleMouseMove}
        className="group"
        style={{ 
          display: 'flex', 
          width: 'clamp(320px, 90%, 1000px)', 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          flexWrap: 'wrap', // Responsive Wrap
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Spotlight Effect */}
        <motion.div style={{ background: spotlightBg, position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

        {/* LEFT: Branding */}
        <div style={{ 
          flex: '1 1 350px', // Responsive flex basis
          padding: 'clamp(40px, 5vw, 60px)', 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          position: 'relative', zIndex: 1
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <div style={{ background: 'white', padding: '5px', borderRadius: '50%', boxShadow: '0 0 20px rgba(56,189,248,0.4)' }}>
                <img src={logo} alt="Logo" style={{ width: '28px', height: '28px' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>ALUMNI CONNECT</h2>
           </div>
           
           <h1 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: '900', color: 'white', lineHeight: '1.1', marginBottom: '20px' }}>
             Welcome to the <br/>
             <span style={{ color: '#38bdf8' }}>Nexus.</span>
           </h1>
           
           <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px', maxWidth: '340px' }}>
             Secure access to the global alumni network. Connect, mentor, and grow with industry leaders.
           </p>

           <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
             <Badge icon={<ShieldCheck size={13}/>} text="SECURE" />
             <Badge icon={<Zap size={13}/>} text="INSTANT" />
             <Badge icon={<Terminal size={13}/>} text="ENCRYPTED" />
           </div>
        </div>

        {/* RIGHT: Login Form */}
        <div style={{ 
          flex: '1 1 350px', 
          padding: 'clamp(40px, 5vw, 60px)', 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', 
          position: 'relative', zIndex: 1
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Authenticate</h2>
          <p style={{ color: '#64748b', marginBottom: '35px', fontSize: '14px' }}>Enter your credentials to proceed.</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <InputField 
              icon={<Mail size={18} />} 
              type="email" 
              placeholder="admin@college.edu" 
              value={email} 
              setValue={setEmail} 
              isFocused={focusedInput === 'email'} 
              setFocus={() => setFocusedInput('email')} 
              setBlur={() => setFocusedInput(null)} 
            />

            <InputField 
              icon={<Lock size={18} />} 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              setValue={setPassword} 
              isFocused={focusedInput === 'password'} 
              setFocus={() => setFocusedInput('password')} 
              setBlur={() => setFocusedInput(null)} 
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <span style={{ color: '#38bdf8', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Forgot Password?</span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              style={{ 
                marginTop: '10px', padding: '15px', borderRadius: '10px', border: 'none', 
                background: 'linear-gradient(90deg, #38bdf8, #2563eb)', 
                color: 'white', fontWeight: 'bold', fontSize: '15px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)'
              }}
            >
              {loading ? 'Verifying...' : <>Initialize Session <ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <p style={{ marginTop: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
             No access credentials? <span onClick={() => navigate('/register')} style={{ color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>Apply for Access</span>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

// Helper Component for Badges
const Badge = ({ icon, text }) => (
  <div style={{ 
    padding: '6px 12px', background: 'rgba(56,189,248,0.05)', 
    borderRadius: '20px', border: '1px solid rgba(56,189,248,0.1)', 
    color: '#38bdf8', fontSize: '11px', fontWeight: '700', 
    display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.5px' 
  }}>
    {icon} {text}
  </div>
);

// Helper Component for Inputs (Includes visual feedback)
const InputField = ({ icon, type, placeholder, value, setValue, isFocused, setFocus, setBlur }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ 
      display: 'flex', alignItems: 'center', 
      background: 'rgba(2, 6, 23, 0.5)', 
      border: isFocused ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', 
      padding: '0 15px',
      transition: 'all 0.3s ease',
      boxShadow: isFocused ? '0 0 15px rgba(56,189,248,0.1)' : 'none'
    }}>
      <div style={{ color: isFocused ? '#38bdf8' : '#64748b', transition: 'color 0.3s' }}>
        {icon}
      </div>
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        onFocus={setFocus} 
        onBlur={setBlur}
        required
        style={{ 
          width: '100%', padding: '16px 12px', 
          background: 'transparent', border: 'none', 
          color: 'white', fontSize: '14px', outline: 'none' 
        }}
      />
    </div>
  </div>
);

export default Login;