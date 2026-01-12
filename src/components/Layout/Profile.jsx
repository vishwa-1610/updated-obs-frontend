import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User, Mail, MapPin, Building, Phone, Hash, Shield, Globe, 
  Edit2, X, Loader2, RefreshCw, Camera, Users, ChevronDown, Check 
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { authService } from '../../services/authService';
import { updateUser } from '../../store/authSlice';
import Modal from '../common/Modal/Modal';
import SuccessModal from '../common/Modal/SuccessModal';

// Helper for Avatar URL
const getAvatarUrl = (seed) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed || 'default'}`;

// --- SUB-COMPONENTS ---

const InfoRow = ({ icon: Icon, label, value, isDarkMode }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${isDarkMode ? 'bg-gray-800/40 border-gray-700 hover:bg-gray-800' : 'bg-white border-slate-100 hover:shadow-md'}`}>
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>{value || 'N/A'}</p>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon, isDarkMode }) => (
  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200 dark:border-gray-800">
    <Icon className={`w-5 h-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
  </div>
);

// --- MAIN COMPONENT ---

const Profile = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  
  // Redux User State
  const { user } = useSelector((state) => state.auth || {});
  
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Forms State
  const [editFormData, setEditFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Custom Dropdown State
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const genderDropdownRef = useRef(null);

  // --- 1. FETCH DATA ---
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access') || localStorage.getItem('token'); 
      if (!token) return;

      const response = await authService.getProfile();
      dispatch(updateUser(response.data)); 
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Sync Form Data
  useEffect(() => {
    if (user) {
        setEditFormData({
            ...user,
            gender: user.gender || '',
            avatar_seed: user.avatar_seed || user.first_name 
        });
    }
  }, [user, isEditModalOpen]);

  // Click Outside Listener for Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
            setIsGenderOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. HANDLERS ---

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleGenderSelect = (value) => {
    setEditFormData({ ...editFormData, gender: value });
    setIsGenderOpen(false);
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setEditFormData({ ...editFormData, avatar_seed: randomSeed });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await authService.updateProfile(editFormData);
      dispatch(updateUser(response.data));
      setIsEditModalOpen(false);
      setSuccessMsg('Profile updated successfully!');
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      setFormError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    if (passwordData.new_password !== passwordData.confirm_password) {
      setFormError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setIsPasswordModalOpen(false);
      setSuccessMsg('Password changed successfully!');
      setShowSuccess(true);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setFormError(error.response?.data?.old_password?.[0] || "Failed to change password. Check old password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0B1120]' : 'bg-slate-50'}`}>
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const glassPanel = `
    rounded-3xl p-8 relative overflow-hidden transition-all duration-300 border
    ${isDarkMode 
      ? 'bg-[#111827]/80 backdrop-blur-xl border-gray-800' 
      : 'bg-white/80 backdrop-blur-xl border-white/60 shadow-xl shadow-slate-200/50'}
  `;

  const inputClass = `w-full px-4 py-2.5 rounded-xl border transition-all outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`;

  // Gender Options
  const genderOptions = ["Male", "Female", "Other"];

  return (
    <div className={`min-h-screen p-6 md:p-10 transition-colors duration-500 font-sans ${isDarkMode ? 'bg-[#0B1120] text-gray-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 animate-in slide-in-from-top-4 fade-in duration-700">
          <div>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {/* My Profile<span className="text-blue-500">.</span> */}
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
               Manage your personal and company details.
            </p>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className={`flex items-center px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
             <Edit2 size={16} className="mr-2" /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
          
          {/* LEFT COL */}
          <div className="lg:col-span-1 space-y-8">
            <div className={`${glassPanel} text-center`}>
              <div className="relative inline-block mb-6 group">
                <div className={`absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
                <img 
                  src={getAvatarUrl(user?.avatar_seed || user?.first_name)} 
                  alt="Avatar" 
                  className={`relative w-32 h-32 rounded-full border-4 shadow-xl object-cover ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-white bg-white'}`}
                />
                
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
                    title="Change Avatar"
                >
                    <Camera size={16} />
                </button>
              </div>
              
              <h2 className={`text-2xl font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {user?.first_name} {user?.last_name}
              </h2>
              <p className={`text-sm font-medium mb-6 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {user?.email}
              </p>

              <div className="flex justify-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {user?.is_staff ? 'Admin' : 'User'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="lg:col-span-2 space-y-8">
            <div className={glassPanel}>
              <SectionHeader title="Personal Information" icon={User} isDarkMode={isDarkMode} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow icon={User} label="First Name" value={user?.first_name} isDarkMode={isDarkMode} />
                <InfoRow icon={User} label="Last Name" value={user?.last_name} isDarkMode={isDarkMode} />
                <InfoRow icon={Mail} label="Email Address" value={user?.email} isDarkMode={isDarkMode} />
                <InfoRow icon={Phone} label="Phone Number" value={user?.employer_phone} isDarkMode={isDarkMode} />
                <InfoRow icon={Users} label="Gender" value={user?.gender} isDarkMode={isDarkMode} />
                <div className="md:col-span-2">
                   <InfoRow icon={MapPin} label="Location" value={`${user?.city || ''}, ${user?.state || ''}`} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>

            <div className={glassPanel}>
               <SectionHeader title="Company Details" icon={Building} isDarkMode={isDarkMode} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <InfoRow icon={Building} label="Company Name" value={user?.company_name} isDarkMode={isDarkMode} />
                 </div>
                 <InfoRow icon={Hash} label="Employer EIN" value={user?.employer_ein} isDarkMode={isDarkMode} />
                 <InfoRow icon={Globe} label="City" value={user?.employer_city} isDarkMode={isDarkMode} />
                 <InfoRow icon={MapPin} label="Address" value={user?.employer_address} isDarkMode={isDarkMode} />
                 <InfoRow icon={MapPin} label="Zip Code" value={user?.employer_zipcode} isDarkMode={isDarkMode} />
               </div>
            </div>

            <div className={glassPanel}>
               <SectionHeader title="Security" icon={Shield} isDarkMode={isDarkMode} />
               <div className="flex items-center justify-between">
                  <div>
                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Password</p>
                     <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Protect your account</p>
                  </div>
                  <button 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                     Change Password
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile" size="lg">
        <form onSubmit={handleUpdateProfile} className="flex flex-col h-full w-full">
            {/* Scrollable Input Area */}
            <div className="flex-1 overflow-y-auto max-h-[60vh] p-1 custom-scrollbar">
                
                {/* AVATAR EDITOR */}
                <div className={`flex flex-col items-center justify-center p-6 mb-6 rounded-2xl border border-dashed ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-blue-50/50 border-blue-200'}`}>
                    <p className={`text-xs font-bold uppercase mb-4 ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`}>Customize Your Look</p>
                    <div className="flex items-center gap-6">
                        <img 
                            src={getAvatarUrl(editFormData.avatar_seed)} 
                            alt="Preview" 
                            className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-md"
                        />
                        <div className="space-y-2">
                            <button 
                                type="button"
                                onClick={handleRandomizeAvatar}
                                className={`flex items-center px-4 py-2 text-sm font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-200'}`}
                            >
                                <RefreshCw size={16} className="mr-2" /> Randomize
                            </button>
                            <p className="text-[10px] text-center opacity-60">Click to generate new style</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>First Name</label>
                        <input name="first_name" value={editFormData.first_name || ''} onChange={handleEditChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Name</label>
                        <input name="last_name" value={editFormData.last_name || ''} onChange={handleEditChange} className={inputClass} />
                    </div>
                    
                    {/* CUSTOM STUNNING GENDER DROPDOWN */}
                    <div className="col-span-2" ref={genderDropdownRef}>
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gender</label>
                        <div className="relative">
                            <div 
                                onClick={() => setIsGenderOpen(!isGenderOpen)}
                                className={`
                                    w-full px-4 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all
                                    ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'}
                                    ${isGenderOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                                `}
                            >
                                <span className={!editFormData.gender ? 'text-gray-500' : ''}>
                                    {editFormData.gender || "Select Gender"}
                                </span>
                                <ChevronDown size={18} className={`transition-transform duration-200 ${isGenderOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>

                            {isGenderOpen && (
                                <div className={`
                                    absolute z-50 w-full mt-2 rounded-xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100
                                    ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}
                                `}>
                                    {genderOptions.map((option) => (
                                        <div 
                                            key={option}
                                            onClick={() => handleGenderSelect(option)}
                                            className={`
                                                px-4 py-3 cursor-pointer flex items-center justify-between text-sm transition-colors border-b last:border-0
                                                ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-50 hover:bg-blue-50'}
                                                ${editFormData.gender === option ? (isDarkMode ? 'bg-gray-700 font-semibold' : 'bg-blue-50 text-blue-700 font-semibold') : ''}
                                            `}
                                        >
                                            {option}
                                            {editFormData.gender === option && <Check size={16} className="text-blue-500" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2 border-t my-2 border-gray-200 dark:border-gray-800"></div>
                    
                    <div className="col-span-2">
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Company Name</label>
                        <input name="company_name" value={editFormData.company_name || ''} onChange={handleEditChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Employer EIN</label>
                        <input name="employer_ein" value={editFormData.employer_ein || ''} onChange={handleEditChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</label>
                        <input name="employer_phone" value={editFormData.employer_phone || ''} onChange={handleEditChange} className={inputClass} />
                    </div>
                    <div className="col-span-2">
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Address</label>
                        <input name="employer_address" value={editFormData.employer_address || ''} onChange={handleEditChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>City</label>
                        <input name="employer_city" value={editFormData.employer_city || ''} onChange={handleEditChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Zipcode</label>
                        <input name="employer_zipcode" value={editFormData.employer_zipcode || ''} onChange={handleEditChange} className={inputClass} />
                    </div>
                </div>
            </div>
            
            {/* Sticky Footer Buttons */}
            <div className={`flex justify-end gap-3 pt-4 mt-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center">
                    {saving ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Saving...</> : 'Save Changes'}
                </button>
            </div>
        </form>
      </Modal>

      {/* --- CHANGE PASSWORD MODAL --- */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password" size="md">
        <form onSubmit={handleSubmitPassword} className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto max-h-[60vh] p-1 custom-scrollbar space-y-4">
                {formError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-center"><X size={16} className="mr-2"/>{formError}</div>}
                
                <div>
                    <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Password</label>
                    <input type="password" name="old_password" value={passwordData.old_password} onChange={handlePasswordChange} className={inputClass} required />
                </div>
                <div>
                    <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>New Password</label>
                    <input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} className={inputClass} required />
                </div>
                <div>
                    <label className={`text-xs font-bold mb-1.5 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirm New Password</label>
                    <input type="password" name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} className={inputClass} required />
                </div>
            </div>

            {/* Sticky Footer Buttons */}
            <div className={`flex justify-end gap-3 pt-4 mt-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center">
                    {saving ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Updating...</> : 'Update Password'}
                </button>
            </div>
        </form>
      </Modal>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message={successMsg} />
    </div>
  );
};

export default Profile;