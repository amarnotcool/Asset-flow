import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Package, 
  ArrowRightLeft, 
  CalendarDays, 
  Wrench, 
  FileText, 
  PieChart, 
  Bell,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Navbar from './Navbar';

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center px-6 py-3 gap-3 text-[0.95rem] font-medium transition-all duration-200 border-l-[3px] ${
      isActive
        ? 'bg-white/10 text-white border-accent-primary'
        : 'text-sidebar-text border-transparent hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-sidebar-bg text-sidebar-text flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">AssetFlow</h2>
        </div>
        
        <nav className="flex flex-col py-4 flex-1 overflow-y-auto">
          <NavLink to="/" className={navItemClass}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          
          {/* Admin Only */}
          {user?.role === 'Admin' && (
            <NavLink to="/organization-setup" className={navItemClass}>
              <Settings size={20} /> Organization Setup
            </NavLink>
          )}

          <NavLink to="/assets" className={navItemClass}>
            <Package size={20} /> Assets
          </NavLink>

          <NavLink to="/allocation" className={navItemClass}>
            <ArrowRightLeft size={20} /> Allocation & Transfer
          </NavLink>

          <NavLink to="/booking" className={navItemClass}>
            <CalendarDays size={20} /> Resource Booking
          </NavLink>

          <NavLink to="/maintenance" className={navItemClass}>
            <Wrench size={20} /> Maintenance
          </NavLink>

          {['Admin', 'Asset Manager'].includes(user?.role) && (
            <NavLink to="/audit" className={navItemClass}>
              <FileText size={20} /> Audit
            </NavLink>
          )}

          <NavLink to="/reports" className={navItemClass}>
            <PieChart size={20} /> Reports
          </NavLink>
          
          <NavLink to="/notifications" className={navItemClass}>
            <Bell size={20} /> Notifications
          </NavLink>
        </nav>

        <div className="p-6 border-t border-white/10 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="font-semibold text-white text-sm">{user?.name || 'User'}</span>
            <span className="text-xs text-white/60">{user?.role || 'Role'}</span>
          </div>
          <button className="bg-transparent border-0 text-white/60 flex items-center transition-colors duration-200 hover:text-white cursor-pointer" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-bg-primary overflow-hidden">
        <Navbar />
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
