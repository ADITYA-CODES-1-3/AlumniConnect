import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Briefcase, Hash, Calendar, Building, GraduationCap, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', role: 'Student', 
    department: 'CSE', batch: '', rollNumber: '', currentCompany: '', jobRole: '' 
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --- LOGIC: SUBMIT DETAILS ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.endsWith('@kgcas.com')) {
        return toast.error('Only @kgcas.com emails are allowed!');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      toast.success(res.data.message);
      setIsOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: VERIFY OTP ---
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp });
      toast.success(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Theme Colors based on Role
  const accentColor = form.role === 'Student' ? 'text-sky-400' : 'text-amber-400';
  const buttonGradient = form.role === 'Student' 
    ? 'from-sky-500 to-blue-600 shadow-sky-500/20' 
    : 'from-amber-400 to-orange-500 shadow-amber-500/20';

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans selection:bg-sky-500/30 py-10">
      
      {/* --- 0. AUTOFILL HACK (Keeps inputs dark) --- */}
      <style>{`
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 30px rgba(2, 6, 23, 0.8) inset !important;
            -webkit-text-fill-color: white !important;
            caret-color: white;
        }
      `}</style>

      {/* --- 1. ANIMATED BACKGROUND GRID (Same as Login) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>

      {/* --- 2. MAIN GLASS CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative z-10 overflow-hidden mx-4"
      >
        
      {/* Header Section */}
<div className="pt-8 pb-6 px-8 text-center border-b border-white/5">
  <div className="flex justify-center mb-6">
     {/* FIX: Changed 'bg-white/5' to 'bg-white'. 
         Now the container is solid white, merging with your logo's background. 
         Added 'overflow-hidden' to clip any square corners.
     */}
     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden border-4 border-slate-900/50">
        <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
     </div>
  </div>
  <h2 className="text-2xl font-bold text-white tracking-wide">Create Account</h2>
  <p className="text-slate-400 text-sm mt-1">Join the KGCAS Alumni Network</p>
</div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            
            {/* --- VIEW 1: REGISTRATION FORM --- */}
            {!isOtpSent ? (
              <motion.form 
                key="register-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegisterSubmit} 
                className="flex flex-col gap-4"
              >
                
                {/* Role Switcher */}
                <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-xl mb-2 border border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setForm({...form, role: 'Student'})}
                    className={`py-2 rounded-lg text-sm font-bold transition-all duration-300 ${form.role === 'Student' ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50' : 'text-slate-400 hover:text-white'}`}
                  >
                    Student
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setForm({...form, role: 'Alumni'})}
                    className={`py-2 rounded-lg text-sm font-bold transition-all duration-300 ${form.role === 'Alumni' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/50' : 'text-slate-400 hover:text-white'}`}
                  >
                    Alumni
                  </button>
                </div>

                {/* Common Inputs */}
                <FormInput icon={<User size={18} />} name="name" placeholder="Full Name" value={form.name} onChange={handleChange} accent={accentColor} />
                <FormInput icon={<Mail size={18} />} name="email" type="email" placeholder="Email (@kgcas.com)" value={form.email} onChange={handleChange} accent={accentColor} />
                <FormInput icon={<Lock size={18} />} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} accent={accentColor} />

                <div className="flex gap-4">
                   <div className="flex-1">
                      <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:${accentColor} transition-colors`}>
                            <Briefcase size={18} />
                        </div>
                        <select 
                            name="department" 
                            onChange={handleChange} 
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-10 py-3.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">Mech</option>
                            <option value="CIVIL">Civil</option>
                            <option value="AIDS">AI & DS</option>
                        </select>
                      </div>
                   </div>
                   <div className="flex-1">
                      <FormInput icon={<Calendar size={18} />} name="batch" placeholder="Batch (2025)" value={form.batch} onChange={handleChange} accent={accentColor} />
                   </div>
                </div>

                {/* Student Specific */}
                {form.role === 'Student' && (
                  <FormInput icon={<Hash size={18} />} name="rollNumber" placeholder="Register Number" value={form.rollNumber} onChange={handleChange} accent={accentColor} />
                )}

                {/* Alumni Specific */}
                {form.role === 'Alumni' && (
                  <>
                    <FormInput icon={<Building size={18} />} name="currentCompany" placeholder="Current Company" value={form.currentCompany} onChange={handleChange} accent={accentColor} />
                    <FormInput icon={<GraduationCap size={18} />} name="jobRole" placeholder="Job Title" value={form.jobRole} onChange={handleChange} accent={accentColor} />
                  </>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`mt-4 py-3.5 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${buttonGradient} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading ? 'Processing...' : <>Get Verification OTP <ArrowRight size={18} /></>}
                </button>

                <div className="text-center mt-2">
                    <p className="text-slate-500 text-sm">
                        Already have an account? <Link to="/login" className={`${accentColor} font-bold hover:underline`}>Login</Link>
                    </p>
                </div>

              </motion.form>
            ) : (

              /* --- VIEW 2: OTP VERIFICATION --- */
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleOtpSubmit} 
                className="flex flex-col gap-6 text-center"
              >
                <div className="bg-sky-500/10 border border-sky-500/20 p-6 rounded-2xl flex flex-col items-center">
                    <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mb-4 text-sky-400">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-white font-bold text-lg">Verify Email</h3>
                    <p className="text-slate-400 text-sm mt-2">
                        We sent a 4-digit code to <br/> 
                        <span className="text-sky-400 font-mono">{form.email}</span>
                    </p>
                </div>

                <div>
                    <input 
                        type="text" 
                        maxLength="4" 
                        placeholder="0 0 0 0" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        autoFocus
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 text-center text-3xl font-bold tracking-[1em] text-white focus:outline-none focus:border-sky-500 focus:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all placeholder:text-slate-700"
                    />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`py-3.5 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${buttonGradient} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </button>

                <button 
                    type="button" 
                    onClick={() => setIsOtpSent(false)}
                    className="text-slate-500 text-sm hover:text-white flex items-center justify-center gap-2 transition-colors"
                >
                    <ArrowLeft size={14} /> Incorrect Email? Go Back
                </button>

              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// --- HELPER COMPONENT FOR CLEANER CODE ---
const FormInput = ({ icon, name, type = "text", placeholder, value, onChange, accent }) => (
  <div className="relative group">
    <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:${accent} transition-colors`}>
      {icon}
    </div>
    <input 
      name={name}
      type={type} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange}
      required
      className={`w-full bg-slate-950/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-${accent === 'text-sky-400' ? 'sky' : 'amber'}-500/50 transition-all placeholder:text-slate-600 font-medium`}
    />
  </div>
);

export default Register;