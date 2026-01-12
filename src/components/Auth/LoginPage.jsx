import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  Shield, Key, CheckCircle, AlertCircle
} from 'lucide-react';

// --- CHANGE 1: Import your custom API instance ---
import api from '../../api'; // Adjust path if your file is named apiConfig.js or similar

// --- CHANGE 2: Removed Hardcoded URL ---
// const API_BASE_URL = 'https://secureobs.tiswatech.com'; // DELETED

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // --- CHANGE 3: Use api.post instead of axios.post ---
      // Note: We removed `${API_BASE_URL}/api`. 
      // The 'api' instance automatically adds '/api' to the base URL.
      const response = await api.post('/users/login/', formData);
      
      // 2. ✅ Save Tokens (Standard logic)
      if (response.data.access) {
        localStorage.setItem('access', response.data.access);
      }
      if (response.data.refresh) {
        localStorage.setItem('refresh', response.data.refresh);
      }

      // 3. ✅ Save User Details
      if (response.data.user) {
         localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // 4. ✅ Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem('remembered_email', formData.email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      
      // 5. Redirect
      navigate('/');

    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       'Invalid credentials. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            
            {/* === LEFT SIDE === */}
            <div className="lg:w-2/5 bg-indigo-900/100 text-white p-10 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                     {/* Logo or Icon here */}
                  </div>
                  <h2 className="text-2xl font-bold tracking-wide">OBS</h2>
                </div>

                <div className="mb-8">
                  <h1 className="text-4xl font-extrabold leading-tight mb-4">
                    Welcome <span className="text-blue-200">Back</span>
                  </h1>
                  <p className="text-blue-100 text-lg leading-relaxed mb-6">
                    Securely access your HR dashboard and manage your workforce efficiently.
                  </p>
                  
                  <img 
                    src="https://illustrations.popsy.co/amber/working-vacation.svg" 
                    alt="Login Illustration" 
                    className="w-full max-w-[260px] mx-auto drop-shadow-xl opacity-95 hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex items-center gap-4 p-3 bg-indigo-900/100 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-50" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Secure Access</h4>
                    <p className="text-blue-200 text-xs">Enterprise Encryption</p>
                  </div>
                </div>
              </div>
            </div>

            {/* === RIGHT SIDE (Form) === */}
            <div className="lg:w-3/5 p-8 lg:p-12 bg-white">
              <div className="max-w-md mx-auto">
                
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
                    <Key className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
                  <p className="text-gray-500 mt-2">Enter your email and password to continue</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" /> Email Address
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-0 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                        placeholder="name@company.com"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600" /> Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-0 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                        placeholder="••••••••"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 ${rememberMe ? 'bg-indigo-900/100 border-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center transition-all group-hover:border-blue-400`}>
                          {rememberMe && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-blue-600 font-bold hover:text-blue-700 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-900/100 text-white font-bold rounded-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <p className="text-gray-500 font-medium">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4">
                        Sign up now
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 0.9; } }
        .animate-pulse { animation: pulse 4s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default LoginPage;