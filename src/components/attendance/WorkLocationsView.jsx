import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Trash2, Edit3, ShieldCheck, 
  Navigation, CheckCircle2, AlertCircle, Compass, Radio
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';
import { attendanceService } from '../../services/attendanceService';
import { StunningSelect, FeedbackModal } from './AttendanceComponents';

export const WorkLocationsView = () => {
  const { isDarkMode } = useTheme();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [feedback, setFeedback] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    latitude: '',
    longitude: '',
    radius_meters: 150,
    is_active: true,
    is_wfh_allowed: true,
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getLocations();
      setLocations(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load work locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenCreate = () => {
    setEditingLoc(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      country: 'United States',
      latitude: '',
      longitude: '',
      radius_meters: 150,
      is_active: true,
      is_wfh_allowed: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setFormData({
      name: loc.name || '',
      code: loc.code || '',
      address: loc.address || '',
      city: loc.city || '',
      state: loc.state || '',
      country: loc.country || 'United States',
      latitude: loc.latitude || '',
      longitude: loc.longitude || '',
      radius_meters: loc.radius_meters || 150,
      is_active: loc.is_active !== undefined ? loc.is_active : true,
      is_wfh_allowed: loc.is_wfh_allowed !== undefined ? loc.is_wfh_allowed : true,
    });
    setShowModal(true);
  };

  const handleGetCurrentGps = async () => {
    // Check if secure context for hardware GPS
    const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (navigator.geolocation && isSecure) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          }));
          setFeedback({
            isOpen: true,
            title: 'GPS Coordinates Captured',
            message: `Accurate hardware GPS coordinates detected (Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}).`,
            type: 'success'
          });
        },
        async (err) => {
          await fallbackNetworkLocation(err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      await fallbackNetworkLocation('Browser requires HTTPS for hardware GPS');
    }
  };

  const fallbackNetworkLocation = async (reason) => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setFormData(prev => ({
          ...prev,
          latitude: Number(data.latitude).toFixed(6),
          longitude: Number(data.longitude).toFixed(6),
          city: data.city || prev.city,
          state: data.region || prev.state,
          country: data.country_name || prev.country
        }));
        setFeedback({
          isOpen: true,
          title: 'Network IP Location Applied',
          message: `Hardware GPS was restricted on HTTP (${reason}). Filled approximate coordinates from network IP (${data.city || 'Local Area'}). You can fine-tune coordinates manually.`,
          type: 'info'
        });
        return;
      }
    } catch (e) {
      // Ignore network error
    }

    // Default fallback coordinates if network fails
    setFormData(prev => ({
      ...prev,
      latitude: prev.latitude || '37.774929',
      longitude: prev.longitude || '-122.419416',
    }));
    setFeedback({
      isOpen: true,
      title: 'Location Mode Notice',
      message: `Hardware GPS requires an HTTPS domain or localhost. Default coordinates populated; feel free to edit the latitude/longitude manually.`,
      type: 'warning'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLoc) {
        await attendanceService.updateLocation(editingLoc.id, formData);
      } else {
        await attendanceService.createLocation(formData);
      }
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      console.error('Failed to save location:', err);
      setFeedback({ isOpen: true, title: 'Save Location Error', message: err.response?.data?.detail || err.message, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work location?')) {
      try {
        await attendanceService.deleteLocation(id);
        fetchLocations();
      } catch (err) {
        console.error('Failed to delete location:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Work Locations & Geofencing
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Configure physical office branches, GPS geofence radius & WFH permissions
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs theme-bg-primary text-white shadow-md hover:scale-105 transition-all"
        >
          <Plus size={16} />
          Add Location
        </button>
      </div>

      {/* LOCATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <div 
            key={loc.id} 
            className={`p-5 rounded-2xl border transition-all hover:shadow-lg flex flex-col justify-between ${
              isDarkMode ? 'bg-[#121217] border-[#27272a]' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {loc.name}
                    </h4>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      CODE: {loc.code || 'LOC-' + loc.id}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  loc.is_active 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {loc.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                {loc.address ? `${loc.address}, ${loc.city || ''} ${loc.state || ''}` : 'No address set'}
              </p>

              {/* Geofence specs */}
              <div className={`p-3 rounded-xl border mb-4 space-y-1.5 text-xs ${
                isDarkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1"><Radio size={12} /> Geofence Radius:</span>
                  <span className="font-bold font-mono">{loc.radius_meters || 150} meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1"><Compass size={12} /> GPS Pin:</span>
                  <span className="font-mono text-[11px]">
                    {loc.latitude && loc.longitude ? `${loc.latitude}, ${loc.longitude}` : 'Not pinned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WFH Permitted:</span>
                  <span className={`font-bold ${loc.is_wfh_allowed ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {loc.is_wfh_allowed ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => handleOpenEdit(loc)}
                className={`p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1 ${
                  isDarkMode 
                    ? 'border-zinc-700 hover:bg-zinc-800 text-slate-300' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(loc.id)}
                className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-xs font-bold"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-xl rounded-3xl border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-[#09090b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-slate-200 text-[#0f172a]'
          }`}>
            <h3 className="text-lg font-black tracking-tight">
              {editingLoc ? 'Edit Work Location' : 'Add New Work Location'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Headquarters NYC"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Location Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HQ-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123 Tech Boulevard, Suite 400"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                    isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">City</label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">State</label>
                  <input
                    type="text"
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* GPS Lat/Lng & Detect Button */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    GPS Coordinates & Geofence Radius
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentGps}
                    className="text-[11px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <Navigation size={12} /> Detect Current GPS
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Radius (m)"
                    value={formData.radius_meters}
                    onChange={(e) => setFormData({ ...formData, radius_meters: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold ${
                      isDarkMode ? 'bg-[#18181b] border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-xs">Active Branch</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_wfh_allowed}
                    onChange={(e) => setFormData({ ...formData, is_wfh_allowed: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-xs">Allow WFH for this Location</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs border ${
                    isDarkMode ? 'border-zinc-700 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs theme-bg-primary text-white shadow-md"
                >
                  {editingLoc ? 'Update Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <FeedbackModal isOpen={feedback.isOpen} modal={feedback} title={feedback.title} message={feedback.message} type={feedback.type} onClose={() => setFeedback({ ...feedback, isOpen: false })} />
    </div>
  );
};
