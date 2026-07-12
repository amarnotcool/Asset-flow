import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, Wrench, Calendar, ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { assets, bookings, maintenanceTickets } = useAppStore();

  const availableCount = assets.filter((a) => a.status === 'Available').length;
  const allocatedCount = assets.filter((a) => a.status === 'Allocated').length;
  const maintenanceCount = maintenanceTickets.length;
  const activeBookingsCount = bookings.length;
  const pendingTransfersCount = 2; // Dynamic pending requests count
  const upcomingReturnsCount = 3;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Today's Overview</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time operational snapshot across all assets and resources</p>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="p-4 rounded-xl text-sm border-l-4 bg-alert-danger-bg text-alert-danger border-l-alert-danger flex items-center mb-6">
        <AlertTriangle size={20} className="mr-2 shrink-0" />
        <span><strong>Action Required:</strong> 3 assets overdue for return. Flagged for management follow-up.</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-text-secondary font-medium text-xs uppercase mb-3">
            <span>Available</span>
            <Package size={18} className="text-alert-success" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">{availableCount}</h3>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-text-secondary font-medium text-xs uppercase mb-3">
            <span>Allocated</span>
            <Users size={18} className="text-accent-primary" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">{allocatedCount}</h3>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-text-secondary font-medium text-xs uppercase mb-3">
            <span>Maintenance</span>
            <Wrench size={18} className="text-alert-warning" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">{maintenanceCount}</h3>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-text-secondary font-medium text-xs uppercase mb-3">
            <span>Bookings</span>
            <Calendar size={18} className="text-accent-primary" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">{activeBookingsCount}</h3>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-text-secondary font-medium text-xs uppercase mb-3">
            <span>Transfers</span>
            <ArrowRightLeft size={18} className="text-alert-warning" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">{pendingTransfersCount}</h3>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-text-secondary font-medium text-xs uppercase mb-3">
            <span>Returns Due</span>
            <Clock size={18} className="text-text-secondary" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">{upcomingReturnsCount}</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => navigate('/assets')}
          className="btn btn-outline flex-1 min-w-[160px] py-3 cursor-pointer flex items-center justify-center gap-2"
        >
          <Package size={16} /> + Register Asset
        </button>
        <button
          onClick={() => navigate('/booking')}
          className="btn btn-outline flex-1 min-w-[160px] py-3 cursor-pointer flex items-center justify-center gap-2"
        >
          <Calendar size={16} /> Book Resource
        </button>
        <button
          onClick={() => navigate('/maintenance')}
          className="btn btn-outline flex-1 min-w-[160px] py-3 cursor-pointer flex items-center justify-center gap-2"
        >
          <Wrench size={16} /> Raise Request
        </button>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold border-b border-border-color pb-3">Recent Activity Feed</h2>
        <ul className="list-none flex flex-col gap-4 mt-4">
          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#e0f2fe] text-accent-primary">
              <Package size={16} />
            </div>
            <div>
              <p className="text-sm text-text-primary mb-1">
                <strong>Laptop AF-0114</strong> allocated to Priya Shah - IT dept
              </p>
              <span className="text-xs text-text-secondary">10 mins ago</span>
            </div>
          </li>

          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-alert-success-bg text-alert-success">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-sm text-text-primary mb-1">
                <strong>Room B2</strong> booking confirmed - 2:00 to 3:00 PM
              </p>
              <span className="text-xs text-text-secondary">45 mins ago</span>
            </div>
          </li>

          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-alert-warning-bg text-alert-warning">
              <Wrench size={16} />
            </div>
            <div>
              <p className="text-sm text-text-primary mb-1">
                <strong>Projector AF-0062</strong> maintenance resolved
              </p>
              <span className="text-xs text-text-secondary">2 hours ago</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
