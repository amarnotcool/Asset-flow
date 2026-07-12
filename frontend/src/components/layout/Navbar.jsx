import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // useEffect + useRef: Global keyboard shortcut '/' to focus search input
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
      case '/':
        return "Today's Overview";
      case '/organization-setup':
        return 'Organization Setup';
      case '/assets':
        return 'Asset Directory';
      case '/allocation':
        return 'Allocation & Transfer';
      case '/booking':
        return 'Resource Booking';
      case '/maintenance':
        return 'Maintenance Management';
      case '/audit':
        return 'Asset Audit';
      case '/reports':
        return 'Reports & Analytics';
      case '/notifications':
        return 'Activity Logs & Notifications';
      default:
        return 'AssetFlow Enterprise';
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
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{getPageTitle(location.pathname)}</h2>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-64 mr-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search asset (press /)..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-border-color rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
          />
        </form>

        <ThemeToggle />

        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert-danger rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border-color">
          <div className="w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-text-primary leading-tight">{user?.name || 'User'}</span>
            <span className="text-xs text-text-secondary">{user?.role || 'Employee'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
