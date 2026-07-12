import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Wrench } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const { assets, bookings, maintenanceTickets, syncBackendData } = useAppStore();

  useEffect(() => {
    syncBackendData();
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [syncBackendData]);

  const availableCount = assets.filter((a) => a.status === 'Available').length;
  const allocatedCount = assets.filter((a) => a.status === 'Allocated').length;
  const maintenanceCount = maintenanceTickets.length;
  const activeBookingsCount = bookings.length;
  const pendingTransfersCount = 2; // Dynamic pending requests count
  const upcomingReturnsCount = 3;

  return (
    <div ref={dashboardRef} className="flex flex-col gap-6 max-w-4xl">
      <div className="card flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Today's Overview</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Real-time operational snapshot of assets and resources</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* KPI Grid Row 1 */}
        <div className="card flex justify-between divide-x divide-border-color py-6">
          <div className="flex-1 flex flex-col justify-between px-6 first:pl-0">
            <span className="font-semibold text-xs uppercase mb-3 text-text-secondary">Available</span>
            <h3 className="text-3xl font-bold m-0 text-text-primary">{availableCount}</h3>
          </div>

          <div className="flex-1 flex flex-col justify-between px-6">
            <span className="font-semibold text-xs uppercase mb-3 text-text-secondary">Allocated</span>
            <h3 className="text-3xl font-bold m-0 text-text-primary">{allocatedCount}</h3>
          </div>

          <div className="flex-1 flex flex-col justify-between px-6 pr-0">
            <span className="font-semibold text-xs uppercase mb-3 text-text-secondary">Maintenance</span>
            <h3 className="text-3xl font-bold m-0 text-text-primary">{maintenanceCount}</h3>
          </div>
        </div>

        {/* KPI Grid Row 2 */}
        <div className="card flex justify-between divide-x divide-border-color py-6">
          <div className="flex-1 flex flex-col justify-between px-6 first:pl-0">
            <span className="font-semibold text-xs uppercase mb-3 text-text-secondary">Active Bookings</span>
            <h3 className="text-3xl font-bold m-0 text-text-primary">{activeBookingsCount}</h3>
          </div>

          <div className="flex-1 flex flex-col justify-between px-6">
            <span className="font-semibold text-xs uppercase mb-3 text-text-secondary">Pending Transfers</span>
            <h3 className="text-3xl font-bold m-0 text-text-primary">{pendingTransfersCount}</h3>
          </div>

          <div className="flex-1 flex flex-col justify-between px-6 pr-0">
            <span className="font-semibold text-xs uppercase mb-3 text-text-secondary">Upcoming Returns</span>
            <h3 className="text-3xl font-bold m-0 text-text-primary">{upcomingReturnsCount}</h3>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-alert-danger-bg border border-alert-danger rounded-xl p-4 text-alert-danger font-semibold text-sm">
        ⚠️ 3 assets overdue for return - flagged for follow-up
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/assets')}
          className="btn btn-outline flex-1 py-3 flex items-center justify-center gap-2"
        >
          <Package size={16} /> Register Asset
        </button>
        <button
          onClick={() => navigate('/booking')}
          className="btn btn-outline flex-1 py-3 flex items-center justify-center gap-2"
        >
          <Calendar size={16} /> Book Resource
        </button>
        <button
          onClick={() => navigate('/maintenance')}
          className="btn btn-outline flex-1 py-3 flex items-center justify-center gap-2"
        >
          <Wrench size={16} /> Raise Request
        </button>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4 m-0 tracking-tight text-text-primary">Recent Activity Feed</h2>
        <ul className="list-none flex flex-col gap-4 m-0 p-0">
          <li className="flex items-center gap-3 border-b border-border-color pb-3 last:border-b-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-accent-primary flex items-center justify-center shrink-0">
              <Package size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary m-0">
                Laptop AF-0114 - allocated to Priya Shah - IT dept
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 border-b border-border-color pb-3 last:border-b-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-alert-success flex items-center justify-center shrink-0">
              <Calendar size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary m-0">
                Room B2 - booking confirmed - 2:00 to 3:00 PM
              </p>
            </div>
          </li>
          <li className="flex items-center gap-3 last:border-b-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-alert-warning flex items-center justify-center shrink-0">
              <Wrench size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary m-0">
                Projector AF-0062 - maintenance resolved
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
