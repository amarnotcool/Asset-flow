import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { useAuthStore } from './store/authStore';

import Login from './pages/Login';

import Dashboard from './pages/Dashboard';

import OrganizationSetup from './pages/OrganizationSetup';

// Temporary Mock Pages
const AssetDirectory = () => <div><h2>Asset Directory</h2></div>;
const AllocationTransfer = () => <div><h2>Allocation & Transfer</h2></div>;
const ResourceBooking = () => <div><h2>Resource Booking</h2></div>;
const Maintenance = () => <div><h2>Maintenance Management</h2></div>;
const Audit = () => <div><h2>Audits</h2></div>;
const Reports = () => <div><h2>Reports</h2></div>;
const Notifications = () => <div><h2>Notifications</h2></div>;

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // for now, bypass for testing by always rendering children or checking state.
  // if (!isAuthenticated) { return <Navigate to="/login" replace />; }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Main App Layout */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="organization-setup" element={<OrganizationSetup />} />
          <Route path="assets" element={<AssetDirectory />} />
          <Route path="allocation" element={<AllocationTransfer />} />
          <Route path="booking" element={<ResourceBooking />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="audit" element={<Audit />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
