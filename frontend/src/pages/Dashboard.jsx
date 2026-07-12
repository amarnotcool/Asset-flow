import React from 'react';
import { Package, Users, Wrench, Calendar, ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Today's Overview</h1>
      
      {/* Alert Banner */}
      <div className="p-4 rounded-lg text-sm border-l-4 bg-alert-danger-bg text-alert-danger border-l-alert-danger flex items-center mb-4">
        <AlertTriangle size={20} className="mr-2 shrink-0" />
        <span><strong>Action Required:</strong> 3 assets overdue for return. Flagged for Follow-up.</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
        <div className="card p-5 flex flex-col">
          <div className="flex justify-between items-center text-text-secondary font-medium text-sm mb-3">
            <span>Available</span>
            <Package size={20} className="text-alert-success" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">128</h3>
        </div>
        <div className="card p-5 flex flex-col">
          <div className="flex justify-between items-center text-text-secondary font-medium text-sm mb-3">
            <span>Allocated</span>
            <Users size={20} className="text-accent-primary" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">76</h3>
        </div>
        <div className="card p-5 flex flex-col">
          <div className="flex justify-between items-center text-text-secondary font-medium text-sm mb-3">
            <span>Maintenance</span>
            <Wrench size={20} className="text-alert-warning" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">4</h3>
        </div>
        <div className="card p-5 flex flex-col">
          <div className="flex justify-between items-center text-text-secondary font-medium text-sm mb-3">
            <span>Active Bookings</span>
            <Calendar size={20} className="text-accent-primary" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">4</h3>
        </div>
        <div className="card p-5 flex flex-col">
          <div className="flex justify-between items-center text-text-secondary font-medium text-sm mb-3">
            <span>Pending Transfers</span>
            <ArrowRightLeft size={20} className="text-alert-warning" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">3</h3>
        </div>
        <div className="card p-5 flex flex-col">
          <div className="flex justify-between items-center text-text-secondary font-medium text-sm mb-3">
            <span>Upcoming Returns</span>
            <Clock size={20} className="text-text-secondary" />
          </div>
          <h3 className="text-3xl font-bold text-text-primary">12</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <button className="btn btn-outline flex-1">
          <Package size={16} /> + Register asset
        </button>
        <button className="btn btn-outline flex-1">
          <Calendar size={16} /> Book resource
        </button>
        <button className="btn btn-outline flex-1">
          <Wrench size={16} /> Raise request
        </button>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold border-b border-border-color pb-3">Recent Activity</h2>
        <ul className="list-none flex flex-col gap-4 mt-4">
          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#e0f2fe] text-accent-primary">
              <Package size={16} />
            </div>
            <div>
              <p className="text-sm text-text-primary mb-1"><strong>Laptop AF-0114</strong> allocated to Priya Shah - IT dept</p>
              <span className="text-xs text-text-secondary">10 mins ago</span>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-alert-success-bg text-alert-success">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-sm text-text-primary mb-1"><strong>Room B2</strong> booking confirmed - 2:00 to 3:00 PM</p>
              <span className="text-xs text-text-secondary">45 mins ago</span>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-alert-warning-bg text-alert-warning">
              <Wrench size={16} />
            </div>
            <div>
              <p className="text-sm text-text-primary mb-1"><strong>Projector AF-0062</strong> maintenance resolved</p>
              <span className="text-xs text-text-secondary">2 hours ago</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
