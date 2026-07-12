import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { useAppStore } from './store/appStore';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrganizationSetup from './pages/OrganizationSetup';
import AssetDirectory from './pages/AssetDirectory';
import AllocationTransfer from './pages/AllocationTransfer';
import ResourceBooking from './pages/ResourceBooking';
import Maintenance from './pages/Maintenance';
import Audit from './pages/Audit';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';

function App() {
  const syncBackendData = useAppStore((state) => state.syncBackendData);

  useEffect(() => {
    // Automatically synchronize with backend Express server on mount
    syncBackendData();
  }, [syncBackendData]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Main App Layout */}
        <Route path="/" element={<AppLayout />}>
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
