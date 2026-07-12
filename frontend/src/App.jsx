import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { useAuthStore } from './store/authStore';

import Login from './pages/Login';

import Dashboard from './pages/Dashboard';

import OrganizationSetup from './pages/OrganizationSetup';

// Temporary Mock Pages
import AssetDirectory from './pages/AssetDirectory';
import AllocationTransfer from './pages/AllocationTransfer';
import ResourceBooking from './pages/ResourceBooking';
import Maintenance from './pages/Maintenance';
import { Audit, Reports, Notifications } from './pages/Stubs';

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
