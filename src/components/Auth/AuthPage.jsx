import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, Lock, User, MapPin, Navigation, 
  ArrowRight, Loader2, Sparkles, CheckCircle, 
  Eye, EyeOff, LayoutGrid, Globe, ShieldCheck
} from 'lucide-react';

import api from '../../api';
// --- CONFIGURATION ---
const API_BASE_URL = 'https://secureobs.tiswatech.com';

// --- STYLES ---
const INPUT_GROUP_STYLE = "relative group";
const INPUT_STYLE = "w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all duration-300 placeholder-transparent peer hover:border-blue-200";
const ICON_STYLE = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300";
const LABEL_STYLE = "absolute left-12 -top-2.5 bg-white px-2 text-xs font-bold text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-blue-600 peer-focus:text-xs";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine mode based on URL path
  const isLogin = location.pathname === '/login';

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Clear errors when switching modes
  useEffect(() => {
    setError('');
    setSuccess('');
    setFormData(prev => ({ ...prev, password: '' })); // Optional: clear password on switch
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleModeSwitch = () => {
    if (isLogin) {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        // CHANGE: Use 'api.post' and remove the full URL path
        const res = await api.post('/login/', { 
          email: formData.email,
          password: formData.password
        });
        
        // Note: You don't need to manually setItem here if your 
        // api.js interceptor handles it, but keeping it is fine as a backup.
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        navigate('/profile'); 
      } else {
        // --- SIGNUP LOGIC ---
        // CHANGE: Use 'api.post' and remove the full URL path
        await api.post('/signup/', formData);
        
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      // ... keep your error handling exactly the same ...
      console.error(err);
      if (err.response) {
         // ...
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-blue-200">
      
      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[700px] relative border border-slate-100">
        
        {/* --- DECORATIVE BACKGROUND BLOBS (Subtle) --- */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply"></div>
        </div>

        {/* --- LEFT SIDE: SVG VISUALS (Hidden on mobile) --- */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-16 text-white overflow-hidden">
          {/* Dark Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 z-0"></div>
          
          {/* Header Content */}
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-xl">
              <Sparkles className="text-blue-300" size={24} />
            </div>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Welcome <span className="text-blue-400">Back</span>
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed max-w-md">
              Streamline your workflow with our secure and efficient management portal.
            </p>
          </div>

          {/* SVG Illustration - Centered */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-8">
            <img 
              src={isLogin 
                ? "https://illustrations.popsy.co/amber/working-vacation.svg" 
                : "https://illustrations.popsy.co/amber/surr-signing-contract.svg"
              } 
              alt="Illustration" 
              className="w-full max-w-sm drop-shadow-2xl opacity-90 hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Footer Features */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <ShieldCheck size={20} className="text-blue-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Secure Platform</h3>
                <p className="text-xs text-blue-200/70">Enterprise-grade data encryption.</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: FORM --- */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative z-10 bg-white/80 backdrop-blur-xl">
          
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-slate-500">
                {isLogin ? 'Enter your credentials to access your account.' : 'Fill in your details to get started.'}
              </p>
            </div>

            {/* Error / Success Messages */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* --- SIGNUP EXTRA FIELDS --- */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={INPUT_GROUP_STYLE}>
                    <User size={18} className={ICON_STYLE} />
                    <input name="first_name" placeholder="First Name" className={INPUT_STYLE} value={formData.first_name} onChange={handleChange} required />
                    <label className={LABEL_STYLE}>First Name</label>
                  </div>
                  <div className={INPUT_GROUP_STYLE}>
                    <User size={18} className={ICON_STYLE} />
                    <input name="last_name" placeholder="Last Name" className={INPUT_STYLE} value={formData.last_name} onChange={handleChange} required />
                    <label className={LABEL_STYLE}>Last Name</label>
                  </div>
                </div>
              )}

              {/* --- COMMON FIELDS --- */}
              <div className={INPUT_GROUP_STYLE}>
                <Mail size={18} className={ICON_STYLE} />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  className={INPUT_STYLE} 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
                <label className={LABEL_STYLE}>Email Address</label>
              </div>

              <div className={INPUT_GROUP_STYLE}>
                <Lock size={18} className={ICON_STYLE} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Password" 
                  className={INPUT_STYLE} 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <label className={LABEL_STYLE}>Password</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* --- SIGNUP LOCATION FIELDS --- */}
              {!isLogin && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={INPUT_GROUP_STYLE}>
                      <LayoutGrid size={18} className={ICON_STYLE} />
                      <input name="city" placeholder="City" className={INPUT_STYLE} value={formData.city} onChange={handleChange} required />
                      <label className={LABEL_STYLE}>City</label>
                    </div>
                    <div className={INPUT_GROUP_STYLE}>
                      <MapPin size={18} className={ICON_STYLE} />
                      <input name="state" placeholder="State" className={INPUT_STYLE} value={formData.state} onChange={handleChange} required />
                      <label className={LABEL_STYLE}>State</label>
                    </div>
                  </div>
                  <div className={INPUT_GROUP_STYLE}>
                    <Navigation size={18} className={ICON_STYLE} />
                    <input name="pincode" placeholder="Pincode" className={INPUT_STYLE} value={formData.pincode} onChange={handleChange} required maxLength="6" />
                    <label className={LABEL_STYLE}>Pincode</label>
                  </div>
                </div>
              )}

              {/* --- SUBMIT BUTTON --- */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>

              {/* --- TOGGLE TEXT --- */}
              <div className="text-center mt-6">
                <p className="text-slate-500 font-medium">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={handleModeSwitch}
                    className="text-blue-600 font-bold hover:underline hover:text-blue-700 transition-colors ml-1"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;