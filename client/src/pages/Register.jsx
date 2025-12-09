import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Briefcase, Hash, Calendar, Building, GraduationCap, ShieldCheck } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [isOtpSent, setIsOtpSent] = useState(false); // Controls View
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', role: 'Student', 
    department: 'CSE', batch: '', rollNumber: '', currentCompany: '', jobRole: '' 
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --- STEP 1: SUBMIT DETAILS & GET OTP ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email.endsWith('@kgcas.com')) {
        return toast.error('Only @kgcas.com emails are allowed!');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      toast.success(res.data.message); // "OTP Sent"
      setIsOtpSent(true); // Switch to OTP View
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp });
      toast.success(res.data.message); // "Verified!"
      
      // Redirect to Login
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper" style={{ padding: '20px', minHeight: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      <div className="login-container" style={{ 
        borderTop: `5px solid ${form.role === 'Student' ? '#0f284e' : '#d4af37'}`, 
        maxWidth: '450px',
        width: '100%',
        padding: '30px 25px' // Responsive padding
      }}>
        
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo-img" style={{ width: '80px', marginBottom: '10px' }} />
          <h2 className="brand-title">Create Account</h2>
          <p className="brand-subtitle">Join the KGCAS Alumni Network</p>
        </div>

        {/* --- VIEW 1: REGISTRATION FORM --- */}
        {!isOtpSent ? (
          <form onSubmit={handleRegisterSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Role Toggle */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
              <button 
                type="button" 
                onClick={() => setForm({...form, role: 'Student'})}
                style={{ 
                  flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #0f284e', 
                  background: form.role === 'Student' ? '#0f284e' : 'white', 
                  color: form.role === 'Student' ? 'white' : '#0f284e', cursor: 'pointer', fontWeight: 'bold' 
                }}
              >Student</button>
              <button 
                type="button" 
                onClick={() => setForm({...form, role: 'Alumni'})}
                style={{ 
                  flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d4af37', 
                  background: form.role === 'Alumni' ? '#d4af37' : 'white', 
                  color: form.role === 'Alumni' ? '#0f284e' : '#d4af37', cursor: 'pointer', fontWeight: 'bold' 
                }}
              >Alumni</button>
            </div>

            {/* Inputs */}
            <div className="form-group">
              <User size={18} className="input-icon" />
              <input name="name" type="text" placeholder="Full Name" className="form-input" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <Mail size={18} className="input-icon" />
              <input name="email" type="email" placeholder="Email (@kgcas.com)" className="form-input" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <Lock size={18} className="input-icon" />
              <input name="password" type="password" placeholder="Password" className="form-input" onChange={handleChange} required />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <Briefcase size={18} className="input-icon" />
                <select name="department" className="form-input" onChange={handleChange} style={{ background: 'white', cursor: 'pointer' }}>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">Mech</option>
                  <option value="CIVIL">Civil</option>
                  <option value="AIDS">AI & DS</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <Calendar size={18} className="input-icon" />
                <input name="batch" type="text" placeholder="Batch (2025)" className="form-input" onChange={handleChange} required />
              </div>
            </div>

            {/* Conditional Fields */}
            {form.role === 'Student' && (
              <div className="form-group">
                <Hash size={18} className="input-icon" />
                <input name="rollNumber" type="text" placeholder="Register Number" className="form-input" onChange={handleChange} required />
              </div>
            )}

            {form.role === 'Alumni' && (
              <>
                <div className="form-group">
                  <Building size={18} className="input-icon" />
                  <input name="currentCompany" type="text" placeholder="Current Company" className="form-input" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <GraduationCap size={18} className="input-icon" />
                  <input name="jobRole" type="text" placeholder="Job Title" className="form-input" onChange={handleChange} required />
                </div>
              </>
            )}

            <button type="submit" className="btn-login" disabled={loading} style={{ 
                backgroundColor: form.role === 'Alumni' ? '#d4af37' : '#0f284e', 
                color: form.role === 'Alumni' ? '#0f284e' : 'white',
                marginTop: '10px'
            }}>
              {loading ? 'Sending OTP...' : 'Get Verification OTP'}
            </button>
            
            <p className="footer-text">
              Already have an account? <Link to="/login" className="link-gold">Login</Link>
            </p>
          </form>

        ) : (
          
          /* --- VIEW 2: OTP VERIFICATION --- */
          <form onSubmit={handleOtpSubmit} style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #bfdbfe' }}>
                <ShieldCheck size={40} color="#0f284e" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ color: '#0f284e', fontSize: '18px', fontWeight: 'bold' }}>Verify Email</h3>
                <p style={{ fontSize: '13px', color: '#555', marginTop: '5px' }}>
                  We sent a 4-digit code to <br/>
                  <strong style={{ color: '#0f284e' }}>{form.email}</strong>
                </p>
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
               <input 
                  type="text" 
                  maxLength="4"
                  placeholder="0 0 0 0" 
                  className="form-input" 
                  style={{ 
                    textAlign: 'center', fontSize: '28px', letterSpacing: '10px', 
                    fontWeight: 'bold', padding: '15px' 
                  }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                  required 
                />
            </div>

            <button type="submit" className="btn-login" disabled={loading} style={{ marginBottom: '15px' }}>
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>
            
            <button 
                type="button" 
                onClick={() => setIsOtpSent(false)} 
                style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}
            >
                Incorrect Email? Go Back
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Register;