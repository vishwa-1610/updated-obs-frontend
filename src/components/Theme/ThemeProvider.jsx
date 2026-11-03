import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const THEME_COLORS = [
  { id: 'blue', label: 'Ocean Blue', color: '#2563eb', bgClass: 'bg-blue-600' },
  { id: 'indigo', label: 'Royal Indigo', color: '#4f46e5', bgClass: 'bg-indigo-600' },
  { id: 'emerald', label: 'Emerald Mint', color: '#059669', bgClass: 'bg-emerald-600' },
  { id: 'purple', label: 'Deep Purple', color: '#9333ea', bgClass: 'bg-purple-600' },
  { id: 'rose', label: 'Sunset Rose', color: '#e11d48', bgClass: 'bg-rose-600' },
  { id: 'amber', label: 'Solar Amber', color: '#d97706', bgClass: 'bg-amber-600' },
];

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return false;
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || 'blue';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    root.setAttribute('data-theme', accentColor);
    body.setAttribute('data-theme', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [isDarkMode, accentColor]);

  const toggleTheme = () => {
    // 1. Temporarily disable CSS transitions to prevent fraction-of-a-second ugly black border interpolation
    const root = document.documentElement;
    const body = document.body;
    root.classList.add('no-theme-transition');

    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        root.classList.add('dark');
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });

    // 2. Force DOM reflow so color updates apply synchronously with 0 lag
    try {
      void root.offsetHeight;
    } catch (e) {}

    // 3. Re-enable normal smooth transitions after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-theme-transition');
      });
    });
  };

  const changeAccentColor = (colorId) => {
    setAccentColor(colorId);
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      accentColor, 
      changeAccentColor,
      themeColors: THEME_COLORS 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
