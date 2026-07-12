import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-all duration-200 cursor-pointer flex items-center justify-center border border-transparent hover:border-border-color ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark/light theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={20} className="text-text-secondary transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
