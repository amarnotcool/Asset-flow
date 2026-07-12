import React from 'react';
import { Package, Users, Wrench, Calendar, ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1 className="page-title">Today's Overview</h1>
      
      {/* Alert Banner */}
      <div className="alert alert-danger flex items-center mb-4">
        <AlertTriangle size={20} className="mr-2" />
        <span><strong>Action Required:</strong> 3 assets overdue for return. Flagged for Follow-up.</span>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid mb-4">
        <div className="kpi-card card">
          <div className="kpi-header">
            <span>Available</span>
            <Package size={20} className="text-success" />
          </div>
          <h3>128</h3>
        </div>
        <div className="kpi-card card">
          <div className="kpi-header">
            <span>Allocated</span>
            <Users size={20} className="text-primary" />
          </div>
          <h3>76</h3>
        </div>
        <div className="kpi-card card">
          <div className="kpi-header">
            <span>Maintenance</span>
            <Wrench size={20} className="text-warning" />
          </div>
          <h3>4</h3>
        </div>
        <div className="kpi-card card">
          <div className="kpi-header">
            <span>Active Bookings</span>
            <Calendar size={20} className="text-primary" />
          </div>
          <h3>4</h3>
        </div>
        <div className="kpi-card card">
          <div className="kpi-header">
            <span>Pending Transfers</span>
            <ArrowRightLeft size={20} className="text-warning" />
          </div>
          <h3>3</h3>
        </div>
        <div className="kpi-card card">
          <div className="kpi-header">
            <span>Upcoming Returns</span>
            <Clock size={20} className="text-secondary" />
          </div>
          <h3>12</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-bar flex gap-4 mb-4">
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
      <div className="card recent-activity">
        <h2>Recent Activity</h2>
        <ul className="activity-list mt-4">
          <li className="activity-item">
            <div className="activity-icon bg-primary-light">
              <Package size={16} />
            </div>
            <div className="activity-content">
              <p><strong>Laptop AF-0114</strong> allocated to Priya Shah - IT dept</p>
              <span className="activity-time">10 mins ago</span>
            </div>
          </li>
          <li className="activity-item">
            <div className="activity-icon bg-success-light">
              <Calendar size={16} />
            </div>
            <div className="activity-content">
              <p><strong>Room B2</strong> booking confirmed - 2:00 to 3:00 PM</p>
              <span className="activity-time">45 mins ago</span>
            </div>
          </li>
          <li className="activity-item">
            <div className="activity-icon bg-warning-light">
              <Wrench size={16} />
            </div>
            <div className="activity-content">
              <p><strong>Projector AF-0062</strong> maintenance resolved</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
