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
import './AppLayout.css'; // We'll create this to handle specific layout styles

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>AssetFlow</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          
          {/* Admin Only */}
          {user?.role === 'Admin' && (
            <NavLink to="/organization-setup" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} /> Organization Setup
            </NavLink>
          )}

          <NavLink to="/assets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Assets
          </NavLink>

          <NavLink to="/allocation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ArrowRightLeft size={20} /> Allocation & Transfer
          </NavLink>

          <NavLink to="/booking" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CalendarDays size={20} /> Resource Booking
          </NavLink>

          <NavLink to="/maintenance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Wrench size={20} /> Maintenance
          </NavLink>

          {['Admin', 'Asset Manager'].includes(user?.role) && (
            <NavLink to="/audit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} /> Audit
            </NavLink>
          )}

          <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <PieChart size={20} /> Reports
          </NavLink>
          
          <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bell size={20} /> Notifications
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Role'}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          {/* We can place contextual title or search here later */}
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
