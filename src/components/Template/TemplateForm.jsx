import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Upload, FileText, Image as ImageIcon, Check, Palette, Globe, Type } from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

const TemplateForm = ({ initialData, clients = [], onSubmit, onCancel, isLoading, isEdit }) => {
  const { isDarkMode } = useTheme();
  
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: '',
    client_name: '', 
    company_name: '',
    
    // Visual Customization
    accent_color: '#2563EB',
    background_color: '#F3F4F6',
    
    // Content Customization
    header_text: 'Welcome Aboard!',
    body_content: '',
    footer_text: '© 2025 All Rights Reserved.',
    website_url: '',
    
    html_code: '', // Optional override
    logo: null,
    pdf_file: null
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- TRANSFORM CLIENTS ---
  const clientOptions = Array.isArray(clients) 
    ? clients
        .filter(client => client && client.client_name)
        .map(client => ({
          label: client.client_name, 
          value: client.client_name
        }))
    : [];

  // --- EFFECTS ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        client_name: typeof initialData.client_name === 'object' ? initialData.client_name?.client_name : initialData.client_name || '',
        company_name: initialData.company_name || '',
        
        accent_color: initialData.accent_color || '#2563EB',
        background_color: initialData.background_color || '#F3F4F6',
        header_text: initialData.header_text || '',
        body_content: initialData.body_content || '',
        footer_text: initialData.footer_text || '',
        website_url: initialData.website_url || '',

        html_code: initialData.html_code || '',
        logo: null,
        pdf_file: null
      });
    }
  }, [initialData]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClientSelect = (value) => {
    setFormData(prev => ({ ...prev, client_name: value }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });
    onSubmit(data);
  };

  // --- STYLES ---
  const labelClass = `block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const inputBaseClass = `w-full px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none`;
  const themeClass = isDarkMode 
      ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-gray-400 shadow-sm';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar p-1">
        
        {/* SECTION 1: BASIC INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-1">
            <label className={labelClass}>Template Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Offer Letter 2025" className={`${inputBaseClass} ${themeClass}`} />
          </div>

          <div className="lg:col-span-1" ref={dropdownRef}>
            <label className={labelClass}>Client Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`${inputBaseClass} ${themeClass} cursor-pointer flex items-center justify-between select-none ${isDropdownOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
                <span className={!formData.client_name ? 'text-gray-400' : ''}>{formData.client_name || "Select a Client"}</span>
                <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              {isDropdownOpen && (
                <div className={`absolute z-50 w-full mt-2 rounded-xl border shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                  {clientOptions.length > 0 ? (
                    clientOptions.map((option, idx) => (
                      <div key={idx} onClick={() => handleClientSelect(option.value)} className={`px-4 py-3 cursor-pointer flex items-center justify-between text-sm transition-colors border-b last:border-0 ${isDarkMode ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-50 text-gray-700 hover:bg-blue-50'} ${formData.client_name === option.value ? (isDarkMode ? 'bg-gray-700 font-semibold' : 'bg-blue-50 text-blue-700 font-semibold') : ''}`}>
                        {option.label}
                        {formData.client_name === option.value && <Check size={16} className="text-blue-500" />}
                      </div>
                    ))
                  ) : <div className={`px-4 py-3 text-sm text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No clients found</div>}
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <label className={labelClass}>Company Name</label>
            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g., Acme Corp" className={`${inputBaseClass} ${themeClass}`} />
          </div>
        </div>

        {/* SECTION 2: VISUAL CUSTOMIZATION */}
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Visual Styling</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
                <label className={labelClass}><Palette size={16} className="inline mr-2"/> Accent Color</label>
                <div className="flex items-center gap-3">
                    <input type="color" name="accent_color" value={formData.accent_color} onChange={handleChange} className="h-10 w-20 rounded cursor-pointer bg-transparent border-0 p-0" />
                    <input type="text" name="accent_color" value={formData.accent_color} onChange={handleChange} className={`${inputBaseClass} ${themeClass}`} />
                </div>
            </div>
            <div>
                <label className={labelClass}><Palette size={16} className="inline mr-2"/> Background Color</label>
                <div className="flex items-center gap-3">
                    <input type="color" name="background_color" value={formData.background_color} onChange={handleChange} className="h-10 w-20 rounded cursor-pointer bg-transparent border-0 p-0" />
                    <input type="text" name="background_color" value={formData.background_color} onChange={handleChange} className={`${inputBaseClass} ${themeClass}`} />
                </div>
            </div>
            <div className="lg:col-span-1">
                <label className={labelClass}>Logo Image</label>
                <div className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors group ${isDarkMode ? 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-750' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center pointer-events-none">
                        {formData.logo ? (
                            <div className="flex items-center gap-2 text-green-600"><ImageIcon size={24} /><p className="text-sm font-medium truncate max-w-[150px]">{formData.logo.name}</p></div>
                        ) : (
                            <><Upload className={`w-8 h-8 mb-2 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} /><p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}><span className="font-semibold">Click to upload</span> logo</p></>
                        )}
                    </div>
                    <input type="file" name="logo" accept="image/*" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
            </div>
        </div>

        {/* SECTION 3: CONTENT */}
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Email Content</h3>
        <div className="grid grid-cols-1 gap-6 mb-8">
            <div>
                <label className={labelClass}><Type size={16} className="inline mr-2"/> Header Text</label>
                <input type="text" name="header_text" value={formData.header_text} onChange={handleChange} placeholder="e.g., Welcome Aboard!" className={`${inputBaseClass} ${themeClass}`} />
            </div>
            <div>
                <label className={labelClass}>Body Content</label>
                <textarea name="body_content" value={formData.body_content} onChange={handleChange} rows={4} placeholder="Main message..." className={`${inputBaseClass} ${themeClass}`} />
            </div>
            <div>
                <label className={labelClass}>Footer Text</label>
                <input type="text" name="footer_text" value={formData.footer_text} onChange={handleChange} placeholder="e.g., Copyright 2025" className={`${inputBaseClass} ${themeClass}`} />
            </div>
            <div>
                <label className={labelClass}><Globe size={16} className="inline mr-2"/> Website URL (for button)</label>
                <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} placeholder="https://example.com" className={`${inputBaseClass} ${themeClass}`} />
            </div>
        </div>

        {/* SECTION 4: ADVANCED */}
        <details className="group">
            <summary className={`list-none flex items-center justify-between cursor-pointer font-medium p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <span>Advanced: Custom HTML Override & PDF</span>
                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="pt-4 space-y-6">
                <div>
                    <label className={labelClass}>Raw HTML Code</label>
                    <textarea name="html_code" value={formData.html_code} onChange={handleChange} rows={6} placeholder="<html>...</html>" className={`${inputBaseClass} ${themeClass} font-mono text-sm`} />
                </div>
                <div>
                    <label className={labelClass}>PDF Attachment</label>
                    <div className={`relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl transition-colors group ${isDarkMode ? 'border-gray-600 bg-gray-800 hover:border-gray-500' : 'border-gray-300 bg-gray-50 hover:border-blue-400'}`}>
                        <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                            {formData.pdf_file ? <div className="flex items-center gap-2 text-red-600"><FileText size={24} /><p className="text-sm font-medium truncate max-w-[150px]">{formData.pdf_file.name}</p></div> : <><FileText className="w-6 h-6 mb-1 text-gray-400" /><p className="text-xs text-gray-500">Upload PDF</p></>}
                        </div>
                        <input type="file" name="pdf_file" accept="application/pdf" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>
            </div>
        </details>

      </div>

      {/* --- STICKY FOOTER BUTTONS --- */}
      <div className={`flex justify-end items-center gap-4 pt-4 mt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button type="button" onClick={onCancel} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>Cancel</button>
        <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200/50 disabled:opacity-50 disabled:shadow-none flex items-center transition-all hover:-translate-y-0.5">
          {isLoading ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>Saving...</> : (isEdit ? 'Update Template' : 'Create Template')}
        </button>
      </div>
    </form>
  );
};

export default TemplateForm;