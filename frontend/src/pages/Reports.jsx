import React, { useState, useEffect, useRef } from 'react';
import { Download, TrendingUp, PieChart, AlertCircle, Clock, Wrench } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const reportRef = useRef(null);
  const { assets, departments, bookings, maintenanceTickets, allocationHistory, syncBackendData } = useAppStore();

  useEffect(() => { syncBackendData(); }, []);

  useEffect(() => {
    reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedPeriod]);

  const totalAssets = assets.length;
  const availableCount = assets.filter((a) => a.status === 'Available').length;
  const allocatedCount = assets.filter((a) => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter((a) => a.status === 'Under Maintenance').length;
  const lostCount = assets.filter((a) => ['Lost', 'Retired', 'Disposed'].includes(a.status)).length;

  // Compute Idle Assets (Available and no allocation history in the last X days)
  const idleAssets = assets.filter(a => {
    if (a.status !== 'Available') return false;
    const recentHistory = allocationHistory.filter(h => h.assetTag === a.tag);
    // simplified: if it's available and has no history or last returned a long time ago (mock logic)
    return recentHistory.length === 0 || recentHistory[0].status === 'Returned';
  }).slice(0, 5); // top 5

  // Compute Maintenance Frequency
  const maintenanceFreq = Object.entries(
    maintenanceTickets.reduce((acc, t) => {
      acc[t.asset] = (acc[t.asset] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5); // top 5 most frequently repaired

  const handleExport = () => {
    // Generate CSV content
    const headers = 'Asset Tag,Name,Category,Status,Location,Holder,Condition\n';
    const csvContent = headers + assets.map(a => 
      `${a.tag},"${a.name}",${a.category},${a.status},"${a.location}","${a.holder || ''}",${a.condition}`
    ).join('\n');

    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `AssetFlow_Report_${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div ref={reportRef} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Reports & Analytics</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Operational insights, utilization metrics, and maintenance summaries</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="select w-auto min-w-[140px]" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year</option>
          </select>
          <button onClick={handleExport} className="btn btn-primary whitespace-nowrap">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center p-5 border-b-4 border-text-secondary">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Assets</span>
          <h3 className="text-4xl font-black text-text-primary mt-2 m-0">{totalAssets}</h3>
        </div>
        <div className="card text-center p-5 border-b-4 border-accent-primary">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Allocated Rate</span>
          <h3 className="text-4xl font-black text-accent-primary mt-2 m-0">
            {totalAssets > 0 ? Math.round((allocatedCount / (totalAssets - lostCount)) * 100) : 0}%
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
        {/* CSS-only Bar Chart implementation for Utilization */}
        <div className="card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2 m-0 text-text-primary">
              <TrendingUp size={18} className="text-accent-primary" /> Utilization Trends
            </h3>
          </div>
          <div className="chart-container flex-1">
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
              <div className="chart-bar" style={{ background: 'var(--alert-warning)', height: `${(maintenanceCount / (totalAssets || 1)) * 100}%` }}></div>
              <span className="chart-bar-value">{maintenanceCount}</span>
              <span className="chart-bar-label">Maintenance</span>
            </div>
            
            <div className="chart-bar-group">
              <div className="chart-bar" style={{ background: 'var(--alert-danger)', height: `${(lostCount / (totalAssets || 1)) * 100}%` }}></div>
              <span className="chart-bar-value">{lostCount}</span>
              <span className="chart-bar-label">Lost/Retired</span>
            </div>
          </div>
        </div>

        <div className="card flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 m-0 text-text-primary">
            <PieChart size={18} className="text-accent-primary" /> Department Summary
          </h3>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-64">
            {departments.length > 0 ? departments.map(dept => (
              <div key={dept.id} className="flex justify-between items-center p-3 rounded-lg bg-bg-primary border border-border-color">
                <div>
                  <span className="font-bold text-sm text-text-primary block">{dept.name}</span>
                  <span className="text-xs text-text-secondary">Head: {dept.head_name || 'Unassigned'}</span>
                </div>
                <span className={`badge ${dept.status === 'Active' ? 'badge-success' : 'badge-neutral'} uppercase tracking-wider text-[10px]`}>{dept.status}</span>
              </div>
            )) : (
              <p className="text-sm text-text-secondary">No departments configured yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Idle Assets List */}
        <div className="card">
          <h3 className="font-bold text-base mb-4 text-text-primary m-0 uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} className="text-text-secondary" /> Potentially Idle Assets
          </h3>
          <ul className="list-none text-sm text-text-primary space-y-3 m-0 p-0">
            {topResources.length > 0 ? topResources.map(([name, count], idx) => (
              <li key={idx} className="flex justify-between items-center border-b border-border-color pb-3 last:border-0 last:pb-0">
                <div className="font-bold text-accent-primary block">{name}</div>
                <div className="text-right">
                  <span className="badge badge-success text-[10px]">{count} booking{count > 1 ? 's' : ''}</span>
                </div>
              </li>
            )) : (
              <li className="text-xs text-text-secondary italic">No bookings recorded yet.</li>
            )}
          </ul>
        </div>

        {/* Maintenance Frequency */}
        <div className="card bg-alert-warning-bg/30 border-alert-warning/50">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2 m-0 text-alert-warning uppercase tracking-wider">
            <Wrench size={16} /> Highest Maintenance Frequency
          </h3>
          <ul className="list-none text-sm text-text-primary space-y-3 m-0 p-0">
            {maintenanceTickets.filter(t => t.status !== 'Resolved').length > 0 ? (
              maintenanceTickets.filter(t => t.status !== 'Resolved').map(ticket => (
                <li key={ticket.id} className="flex justify-between border-b border-alert-warning/20 pb-3 last:border-b-0 last:pb-0">
                  <div className="w-[70%]">
                    <span className="font-bold text-text-primary block">{ticket.asset_tag}</span>
                    <span className="text-xs text-text-secondary truncate block">{ticket.issue_description || ticket.asset_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-warning text-[10px] border-alert-warning/30">{ticket.status}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-xs text-text-secondary italic">No open maintenance issues.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
