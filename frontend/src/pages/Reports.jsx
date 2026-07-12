import React, { useState, useEffect, useRef } from 'react';
import { Download, TrendingUp, PieChart, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const reportRef = useRef(null);
  const { assets, departments, bookings, maintenanceTickets } = useAppStore();

  // useEffect + useRef: Track period changes and scroll report top into view
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

  return (
    <div ref={reportRef} className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports & Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">
            Operational insights, utilization metrics, and maintenance summaries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select w-auto text-sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
          </select>
          <button onClick={handleExport} className="btn btn-primary cursor-pointer flex items-center gap-2">
            <Download size={16} /> Export CSV / PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <span className="text-xs text-text-secondary font-medium uppercase">Total Assets</span>
          <h3 className="text-3xl font-bold text-text-primary mt-2">{totalAssets}</h3>
        </div>
        <div className="card">
          <span className="text-xs text-text-secondary font-medium uppercase">Allocated Rate</span>
          <h3 className="text-3xl font-bold text-accent-primary mt-2">
            {totalAssets > 0 ? Math.round((allocatedCount / totalAssets) * 100) : 0}%
          </h3>
        </div>
        <div className="card">
          <span className="text-xs text-text-secondary font-medium uppercase">Active Bookings</span>
          <h3 className="text-3xl font-bold text-alert-success mt-2">{bookings.length}</h3>
        </div>
        <div className="card">
          <span className="text-xs text-text-secondary font-medium uppercase">Open Maintenance</span>
          <h3 className="text-3xl font-bold text-alert-warning mt-2">{maintenanceTickets.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card flex flex-col">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent-primary" /> Utilization Breakdown
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Allocated Assets</span>
                <span className="font-semibold">{allocatedCount}</span>
              </div>
              <div className="w-full h-2 bg-border-color rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-primary"
                  style={{ width: `${(allocatedCount / (totalAssets || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Available in Storage</span>
                <span className="font-semibold">{availableCount}</span>
              </div>
              <div className="w-full h-2 bg-border-color rounded-full overflow-hidden">
                <div
                  className="h-full bg-alert-success"
                  style={{ width: `${(availableCount / (totalAssets || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Under Maintenance</span>
                <span className="font-semibold">{maintenanceCount}</span>
              </div>
              <div className="w-full h-2 bg-border-color rounded-full overflow-hidden">
                <div
                  className="h-full bg-alert-warning"
                  style={{ width: `${(maintenanceCount / (totalAssets || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-accent-primary" /> Department Allocation Summary
          </h3>
          <div className="flex flex-col gap-3">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="flex justify-between items-center p-3 rounded-lg bg-bg-primary border border-border-color"
              >
                <div>
                  <span className="font-medium text-sm text-text-primary">{dept.name}</span>
                  <p className="text-xs text-text-secondary">Head: {dept.head}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#e0f2fe] text-accent-primary">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg mb-3">Most-Used Assets & Resources</h3>
          <ul className="text-sm text-text-primary space-y-2">
            <li className="flex justify-between border-b border-border-color pb-2">
              <span>Conference room B2</span>
              <span className="text-text-secondary">{bookings.length} bookings</span>
            </li>
            <li className="flex justify-between border-b border-border-color pb-2">
              <span>Dell XPS 15 (AF-0114)</span>
              <span className="text-text-secondary">Allocated • Engineering</span>
            </li>
            <li className="flex justify-between">
              <span>Company Van AF-312</span>
              <span className="text-text-secondary">1 active booking</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <AlertCircle size={18} className="text-alert-warning" /> Assets Nearing Maintenance / Attention
          </h3>
          <ul className="text-sm text-text-primary space-y-2">
            {maintenanceTickets.map((ticket) => (
              <li key={ticket.id} className="flex justify-between border-b border-border-color pb-2">
                <span>
                  <strong>{ticket.asset}</strong> — {ticket.title}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-alert-warning-bg text-alert-warning">
                  {ticket.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
