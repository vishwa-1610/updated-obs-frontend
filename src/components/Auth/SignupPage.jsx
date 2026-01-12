import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  Sparkles, User, MapPin, Navigation, LayoutGrid,
  AlertCircle, Users
} from 'lucide-react';

// --- CHANGE 1: Import your custom API instance ---
// Ensure this path points to the file where you defined the interceptors
import api from '../../api';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '', city: '', state: '', pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // --- CHANGE 2: Use api.post and remove the domain name ---
      // The 'api' instance automatically handles the base URL (localhost vs production)
      await api.post('/users/signup/', formData);
      
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
          const data = err.response.data;
          if (data.email) setError(data.email[0]);
          else if (data.password) setError(data.password[0]);
          else setError("Registration failed. Please check your details.");
      } else {
          setError("Network error. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  // Shared input class string
  const inputClassName = "w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-0 outline-none transition-all font-medium placeholder:text-gray-400";
  const iconInputClassName = "w-full pl-10 pr-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-0 outline-none transition-all font-medium placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            
            {/* === LEFT SIDE === */}
            <div className="lg:w-2/5 bg-indigo-900 text-white p-10 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-wide">Portal Pro</h2>
                </div>

                <div className="mb-8">
                  <h1 className="text-4xl font-extrabold leading-tight mb-4">
                    Join the <span className="text-blue-200">Future</span>
                  </h1>
                  <p className="text-blue-100/90 text-lg leading-relaxed mb-6">
                    Create an account to streamline your workflow and unlock exclusive features today.
                  </p>
                  
                  <img 
                    src="https://illustrations.popsy.co/amber/surr-signing-contract.svg" 
                    alt="Signup Illustration" 
                    className="w-full max-w-[260px] mx-auto drop-shadow-xl opacity-95 hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex items-center gap-4 p-3 bg-blue-700/50 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-50" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Collaboration</h4>
                    <p className="text-blue-200 text-xs">Seamless connection</p>
                  </div>
                </div>
              </div>
            </div>

            {/* === RIGHT SIDE (Form) === */}
            <div className="lg:w-3/5 p-8 lg:p-12 bg-white">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-gray-500 mt-2">Fill in your details to get started</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">First Name</label>
                      <input 
                        name="first_name" 
                        value={formData.first_name} 
                        onChange={handleChange} 
                        className={inputClassName} 
                        placeholder="John" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Last Name</label>
                      <input 
                        name="last_name" 
                        value={formData.last_name} 
                        onChange={handleChange} 
                        className={inputClassName} 
                        placeholder="Doe" 
                        required 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email Address</label>
                    <div className="relative group">
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className={iconInputClassName} 
                        placeholder="name@company.com" 
                        required 
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Password</label>
                    <div className="relative group">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className={`${iconInputClassName} pr-10`} 
                        placeholder="••••••••" 
                        required 
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Location Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <input 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        className={`${iconInputClassName} pl-9`} 
                        placeholder="City" 
                        required 
                      />
                      <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                    </div>
                    <div className="relative group">
                      <input 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange} 
                        className={`${iconInputClassName} pl-9`} 
                        placeholder="State" 
                        required 
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                    </div>
                  </div>
                  <div className="relative group">
                    <input 
                      name="pincode" 
                      value={formData.pincode} 
                      onChange={handleChange} 
                      className={`${iconInputClassName} pl-9`} 
                      placeholder="Pincode / Zip Code" 
                      required 
                      maxLength="10" 
                    />
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600" />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-4 bg-indigo-900 text-white font-bold rounded-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Creating Account...' : (
                      <>
                        Create Account <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <p className="text-gray-500 font-medium">
                      Already have an account?{' '}
                      <Link to="/login" className="text-blue-600 font-bold hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4">
                        Sign in now
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animation Styles */}
      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 0.9; } }
        .animate-pulse { animation: pulse 4s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default SignupPage;