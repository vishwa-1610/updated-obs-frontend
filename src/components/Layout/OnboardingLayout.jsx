import React, { useEffect, useState } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
// 1. CHANGE IMPORT
import api from '../../api'; // Adjust path to where your api.js is
import { Loader2, ShieldCheck } from 'lucide-react'; 

const OnboardingLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tokenUrl = searchParams.get('token');
  const tokenStorage = localStorage.getItem('onboarding_token');
  const token = tokenUrl || tokenStorage;

  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setTimeout(() => setLoading(false), 500); 
      return;
    }

    // 2. CHANGE API CALL
    // Use api.get() and remove the hardcoded https://secureobs...
    // The api instance automatically adds the correct tenant domain and port
    api.get(`/onboarding/validate/${token}/`)
      .then(res => {
        if (res.data.completed) {
           alert("You have already completed onboarding.");
           // Optional: Navigate to a "Thank You" page instead of alert
        } else {
           setIsValid(true);
           localStorage.setItem('onboarding_token', token);
        }
      })
      .catch(() => {
        // If 404, it means the token doesn't exist in THIS tenant
        alert("This link is invalid or expired.");
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 800);
      });
  }, [token, navigate]);

  // --- LOADING SCREEN ---
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-0 m-0">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/50 flex flex-col items-center text-center max-w-sm w-full animate-in fade-in zoom-in duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 size={48} className="text-blue-600 animate-spin relative z-10" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Verifying Security</h3>
        <p className="text-gray-500 text-sm">Please wait while we validate your secure link...</p>
      </div>
    </div>
  );

  // --- ACCESS DENIED SCREEN ---
  if (!isValid) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-sm w-full">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500 text-sm mb-6">
          We couldn't verify your secure token. The link may have expired or belongs to a different company workspace.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  // --- MAIN CONTENT ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center w-full animate-in fade-in duration-700">
      <Outlet />
    </div>
  );
};

export default OnboardingLayout;