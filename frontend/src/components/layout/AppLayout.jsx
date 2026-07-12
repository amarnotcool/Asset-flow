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
  LogOut,
  Zap
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
    `sidebar-nav-item ${isActive ? 'active' : ''}`;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-sidebar-bg border-r border-border-color flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-6 shrink-0 flex items-center gap-3">
          <div className="bg-sidebar-active-bg rounded-xl w-9 h-9 flex items-center justify-center text-white">
            <Zap size={18} />
          </div>
          <h2 className="text-lg font-bold text-text-primary m-0 tracking-tight">AssetFlow</h2>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex flex-col px-3 flex-1 overflow-y-auto gap-1 mt-2">
          <NavLink to="/" end className={navItemClass}>
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          
          <NavLink to="/assets" className={navItemClass}>
            <Package size={18} /> Assets
          </NavLink>

          <NavLink to="/allocation" className={navItemClass}>
            <ArrowRightLeft size={18} /> Allocation
          </NavLink>

          <NavLink to="/booking" className={navItemClass}>
            <CalendarDays size={18} /> Booking
          </NavLink>

          <NavLink to="/maintenance" className={navItemClass}>
            <Wrench size={18} /> Maintenance
          </NavLink>

          {['Admin', 'Asset Manager'].includes(user?.role) && (
            <NavLink to="/audit" className={navItemClass}>
              <FileText size={18} /> Audit
            </NavLink>
          )}

          <NavLink to="/reports" className={navItemClass}>
            <PieChart size={18} /> Reports
          </NavLink>

          <NavLink to="/notifications" className={navItemClass}>
            <Bell size={18} /> Notifications
          </NavLink>

          {user?.role === 'Admin' && (
            <NavLink to="/organization-setup" className={navItemClass}>
              <Settings size={18} /> Organization
            </NavLink>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-5 pt-3 border-t border-border-color shrink-0 flex flex-col gap-1">
          <NavLink to="/organization-setup" className={navItemClass}>
            <Settings size={18} /> Settings
          </NavLink>
          <button
            className="sidebar-nav-item text-alert-danger hover:bg-alert-danger-bg w-full border-0"
            onClick={handleLogout}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-bg-primary overflow-hidden">
        <Navbar />
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
