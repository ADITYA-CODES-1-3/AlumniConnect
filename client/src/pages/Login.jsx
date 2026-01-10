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
  const navigate = useNavigate();

  // --- SPOTLIGHT MOUSE TRACKING ---
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
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans selection:bg-sky-500/30">
      
      {/* --- 0. AUTOFILL HACK (Keeps inputs dark) --- */}
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

      {/* --- 1. ANIMATED BACKGROUND GRID --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Moving Grid Floor */}
        <div 
          className="absolute -inset-[100%] opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s linear infinite',
            transform: 'perspective(500px) rotateX(60deg) scale(2)'
          }}
        />
        <style>{`@keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 0 60px; } }`}</style>

        {/* Floating Hexagons */}
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] text-sky-400/20"
        >
          <Hexagon size={180} strokeWidth={0.5} />
        </motion.div>

        <motion.div 
          animate={{ y: [0, 40, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[10%] text-indigo-500/20"
        >
          <Hexagon size={250} strokeWidth={0.5} />
        </motion.div>
      </div>

      {/* --- 2. LOADING OVERLAY --- */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <Loader />
        </div>
      )}

      {/* --- 3. MAIN GLASS CARD --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        onMouseMove={handleMouseMove}
        className="group relative w-full max-w-5xl m-4 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row z-10"
      >
        
        {/* Spotlight Overlay */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: spotlightBg }} 
        />

        {/* --- LEFT SIDE: BRANDING --- */}
        <div className="relative z-10 lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center bg-gradient-to-b from-white/5 to-transparent border-b lg:border-b-0 lg:border-r border-white/5">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white p-1.5 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              <img src={logo} alt="Logo" className="w-7 h-7 object-cover" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-widest">ALUMNI CONNECT</h2>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            Welcome to the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
              Nexus.
            </span>
          </h1>
          
          <p className="text-slate-400 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
            Secure access to the global alumni network. Connect, mentor, and grow with industry leaders in a next-gen ecosystem.
          </p>

          <div className="mt-auto flex gap-3 flex-wrap">
            <Badge icon={<ShieldCheck size={14}/>} text="SECURE" />
            <Badge icon={<Zap size={14}/>} text="INSTANT" />
            <Badge icon={<Terminal size={14}/>} text="ENCRYPTED" />
          </div>
        </div>

        {/* --- RIGHT SIDE: LOGIN FORM --- */}
        <div className="relative z-10 lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center bg-transparent">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Authenticate</h2>
            <p className="text-slate-500 text-sm">Enter your credentials to access the terminal.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            <InputField 
              icon={<Mail size={20} />} 
              type="email" 
              placeholder="admin@college.edu" 
              value={email} 
              setValue={setEmail} 
            />

            <InputField 
              icon={<Lock size={20} />} 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              setValue={setPassword} 
            />

            <div className="flex justify-end">
               <span className="text-sky-400 text-xs font-semibold hover:text-sky-300 cursor-pointer transition-colors">
                 Forgot Password?
               </span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }} 
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className={`
                mt-2 py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20
                bg-gradient-to-r from-sky-500 to-blue-600 text-white
                hover:shadow-sky-500/40 hover:from-sky-400 hover:to-blue-500 transition-all duration-300
                disabled:opacity-70 disabled:cursor-not-allowed
              `}
            >
              {loading ? 'Verifying Credentials...' : <>Initialize Session <ArrowRight size={18} /></>}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-xs">
              No access credentials? <span onClick={() => navigate('/register')} className="text-sky-400 font-bold cursor-pointer hover:underline">Apply for Access</span>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

// --- SUB COMPONENTS (CLEAN & REUSABLE) ---

const Badge = ({ icon, text }) => (
  <div className="px-3 py-1.5 bg-sky-500/10 rounded-full border border-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center gap-1.5 tracking-wider">
    {icon} {text}
  </div>
);

const InputField = ({ icon, type, placeholder, value, setValue }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative group">
      <div 
        className={`
          flex items-center px-4 bg-slate-950/50 rounded-xl border transition-all duration-300
          ${isFocused 
            ? 'border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
            : 'border-white/10 group-hover:border-white/20'
          }
        `}
      >
        <div className={`transition-colors duration-300 ${isFocused ? 'text-sky-400' : 'text-slate-500'}`}>
          {icon}
        </div>
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)} 
          onBlur={() => setIsFocused(false)}
          required
          className="w-full bg-transparent border-none text-white text-sm px-3 py-4 focus:outline-none placeholder:text-slate-600 font-medium"
        />
      </div>
    </div>
  );
};

export default Login;