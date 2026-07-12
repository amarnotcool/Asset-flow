import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Global keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Overview';
      case '/organization-setup': return 'Organization Setup';
      case '/assets': return 'Asset Directory';
      case '/allocation': return 'Allocation & Transfer';
      case '/booking': return 'Resource Booking';
      case '/maintenance': return 'Maintenance';
      case '/audit': return 'Asset Audit';
      case '/reports': return 'Reports';
      case '/notifications': return 'Notifications';
      default: return 'AssetFlow';
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/assets');
    }
  };

  return (
    <header className="h-16 border-b border-border-color bg-bg-secondary px-8 flex items-center justify-between shrink-0">
      {/* Page Title */}
      <h2 className="text-xl font-bold text-text-primary m-0 tracking-tight">{getPageTitle(location.pathname)}</h2>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-56">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-border-color rounded-xl bg-bg-primary text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent-primary transition-colors"
          />
        </form>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="relative p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors cursor-pointer border-0 bg-transparent"
          title="Notifications"
        >
          <Bell size={19} />
        </button>

        {/* Mail Icon */}
        <button
          type="button"
          className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors cursor-pointer border-0 bg-transparent"
          title="Messages"
        >
          <Mail size={19} />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-border-color mx-1"></div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/organization-setup')}>
          <div className="w-9 h-9 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
