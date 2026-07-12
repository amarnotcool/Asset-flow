import React, { useState, useEffect, useRef } from 'react';
import { Download, TrendingUp, PieChart, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const reportRef = useRef(null);
  const { assets, departments, bookings, maintenanceTickets, syncBackendData } = useAppStore();

  useEffect(() => { syncBackendData(); }, []);

  useEffect(() => {
    reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedPeriod]);

  const totalAssets = assets.length;
  const availableCount = assets.filter((a) => a.status === 'Available').length;
  const allocatedCount = assets.filter((a) => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter((a) => a.status === 'Under Maintenance').length;

  const handleExport = () => {
    alert(`Exporting AssetFlow operational summary report for ${selectedPeriod}...`);
  };

  // Build most-used resources from real bookings
  const bookingCountByAsset = {};
  bookings.forEach(b => {
    const key = b.asset_name || `Asset #${b.asset_id}`;
    bookingCountByAsset[key] = (bookingCountByAsset[key] || 0) + 1;
  });
  const topResources = Object.entries(bookingCountByAsset)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div ref={reportRef} className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Reports & Analytics</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Operational insights, utilization metrics, and maintenance summaries</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="select w-auto min-w-[140px]" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
          </select>
          <button onClick={handleExport} className="btn btn-primary whitespace-nowrap">
            <Download size={16} /> Export CSV / PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center p-5">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Assets</span>
          <h3 className="text-4xl font-black text-text-primary mt-2 m-0">{totalAssets}</h3>
        </div>
        <div className="card text-center p-5 border-b-4 border-accent-primary">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Allocated Rate</span>
          <h3 className="text-4xl font-black text-accent-primary mt-2 m-0">
            {totalAssets > 0 ? Math.round((allocatedCount / totalAssets) * 100) : 0}%
          </h3>
        </div>
        <div className="card text-center p-5 border-b-4 border-alert-success">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Bookings</span>
          <h3 className="text-4xl font-black text-alert-success mt-2 m-0">{bookings.length}</h3>
        </div>
        <div className="card text-center p-5 border-b-4 border-alert-warning">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Open Maintenance</span>
          <h3 className="text-4xl font-black text-alert-warning mt-2 m-0">{maintenanceTickets.filter(t => t.status !== 'Resolved').length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2 m-0 text-text-primary">
              <TrendingUp size={18} className="text-accent-primary" /> Utilization Trends
            </h3>
          </div>
          <div className="chart-container">
            <div className="chart-bar-group">
              <div className="chart-bar" style={{ height: `${(allocatedCount / (totalAssets || 1)) * 100}%` }}></div>
              <span className="chart-bar-value">{allocatedCount}</span>
              <span className="chart-bar-label">Allocated</span>
            </div>
            <div className="chart-bar-group">
              <div className="chart-bar bar-secondary" style={{ height: `${(availableCount / (totalAssets || 1)) * 100}%` }}></div>
              <span className="chart-bar-value">{availableCount}</span>
              <span className="chart-bar-label">Available</span>
            </div>
            <div className="chart-bar-group">
              <div className="chart-bar" style={{ background: 'linear-gradient(180deg, var(--alert-warning), #fcd34d)', height: `${(maintenanceCount / (totalAssets || 1)) * 100}%` }}></div>
              <span className="chart-bar-value">{maintenanceCount}</span>
              <span className="chart-bar-label">Maintenance</span>
            </div>
          </div>
        </div>

        <div className="card flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 m-0 text-text-primary">
            <PieChart size={18} className="text-accent-primary" /> Department Summary
          </h3>
          <div className="flex flex-col gap-3">
            {departments.length > 0 ? departments.map(dept => (
              <div key={dept.id} className="flex justify-between items-center p-3 rounded-lg bg-bg-primary border border-border-color">
                <div>
                  <span className="font-bold text-sm text-text-primary block">{dept.name}</span>
                  <span className="text-xs text-text-secondary">Head: {dept.head_name || 'Unassigned'}</span>
                </div>
                <span className={`badge ${dept.status === 'Active' ? 'badge-info' : 'badge-neutral'} uppercase tracking-wider text-[10px]`}>{dept.status}</span>
              </div>
            )) : (
              <p className="text-sm text-text-secondary">No departments configured yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-base mb-4 text-text-primary m-0 uppercase tracking-wider">Most-Used Resources</h3>
          <ul className="list-none text-sm text-text-primary space-y-3 m-0 p-0">
            {topResources.length > 0 ? topResources.map(([name, count], idx) => (
              <li key={idx} className="flex justify-between border-b border-border-color pb-3 last:border-b-0 last:pb-0">
                <span className="font-medium">{name}</span>
                <span className="text-text-secondary font-semibold bg-bg-primary px-2 py-0.5 rounded text-xs">{count} booking{count > 1 ? 's' : ''}</span>
              </li>
            )) : (
              <li className="text-text-secondary">No bookings recorded yet.</li>
            )}
          </ul>
        </div>

        <div className="card bg-alert-warning-bg border-alert-warning">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2 m-0 text-alert-warning uppercase tracking-wider">
            <AlertCircle size={18} /> Needs Attention
          </h3>
          <ul className="list-none text-sm text-text-primary space-y-3 m-0 p-0">
            {maintenanceTickets.filter(t => t.status !== 'Resolved').length > 0 ? (
              maintenanceTickets.filter(t => t.status !== 'Resolved').map(ticket => (
                <li key={ticket.id} className="flex justify-between border-b border-alert-warning/20 pb-3 last:border-b-0 last:pb-0">
                  <span className="font-medium">
                    <strong className="text-alert-warning">{ticket.asset_tag}</strong> — {ticket.issue_description || ticket.asset_name}
                  </span>
                  <span className="badge bg-white text-alert-warning border border-alert-warning/30 shadow-sm">{ticket.status}</span>
                </li>
              ))
            ) : (
              <li className="text-text-primary font-medium">✅ No open maintenance issues. Everything looks good!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
