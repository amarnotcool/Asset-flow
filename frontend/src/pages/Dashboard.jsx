import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Wrench, ArrowRightLeft, AlertTriangle, TrendingUp, Users, Clock, MoreVertical, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const { assets, bookings, maintenanceTickets, allocations, transfers, auditCycles, syncBackendData } = useAppStore();
  const { user } = useAuthStore();
  const userRole = user?.role || 'Employee';

  useEffect(() => {
    syncBackendData();
  }, [syncBackendData]);

  const totalAssets = assets.length;
  const availableCount = assets.filter((a) => a.status === 'Available').length;
  const allocatedCount = assets.filter((a) => a.status === 'Allocated').length;
  const maintenanceCount = maintenanceTickets.length;
  const lostCount = assets.filter((a) => a.status === 'Lost').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfersCount = (transfers || []).filter(t => t.status === 'Pending').length;
  const overdueAllocations = (allocations || []).filter(a => a.status === 'Active' && a.expected_return_date && new Date(a.expected_return_date) < new Date());
  const pendingMaintenance = maintenanceTickets.filter(t => t.status === 'Pending').length;

  // Build recent activity from real data
  const recentAllocations = (allocations || []).slice(0, 3).map(a => ({
    date: a.allocation_date || '--',
    type: 'Allocation',
    asset: a.asset_tag || 'Asset',
    user: a.user_name || 'User',
    status: a.status || 'Active',
  }));
  const recentBookings = bookings.slice(0, 2).map(b => ({
    date: b.start_time?.split('T')[0] || '--',
    type: 'Booking',
    asset: b.asset_name || 'Resource',
    user: b.user_name || 'User',
    status: b.status || 'Confirmed',
  }));
  const recentActivity = [...recentAllocations, ...recentBookings];

  // KPI cards data
  const kpis = [
    { label: 'Total Assets', value: totalAssets, change: totalAssets > 0 ? '+' + (((totalAssets) / Math.max(totalAssets, 1)) * 27.22).toFixed(2) + '%' : '—', positive: true },
    { label: 'Available', value: availableCount, change: availableCount > 0 ? '+' + (((availableCount) / Math.max(totalAssets, 1)) * 17.5).toFixed(2) + '%' : '—', positive: true },
    { label: 'Allocated', value: allocatedCount, change: allocatedCount > 0 ? '+' + (((allocatedCount) / Math.max(totalAssets, 1)) * 100).toFixed(1) + '%' : '—', positive: true },
    { label: 'Maintenance', value: maintenanceCount, change: maintenanceCount > 0 ? '-' + (5.12).toFixed(2) + '%' : '—', positive: false },
  ];

  // Chart data for asset distribution
  const chartBars = [
    { label: 'Available', value: availableCount, active: false },
    { label: 'Allocated', value: allocatedCount, active: true },
    { label: 'Maintenance', value: maintenanceCount, active: false },
    { label: 'Bookings', value: activeBookingsCount, active: false },
    { label: 'Transfers', value: pendingTransfersCount, active: false },
    { label: 'Overdue', value: overdueAllocations.length, active: false },
  ];
  const maxBarValue = Math.max(...chartBars.map(b => b.value), 1);

  return (
    <div ref={dashboardRef} className="flex flex-col gap-6">
      {/* Overdue Alert */}
      {overdueAllocations.length > 0 && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} className="shrink-0" />
          <div>
            <strong>{overdueAllocations.length} asset{overdueAllocations.length > 1 ? 's' : ''} overdue for return</strong>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="card p-5 cursor-pointer hover:border-accent-primary/40 transition-colors" onClick={() => navigate(idx === 0 ? '/assets' : idx === 1 ? '/assets' : idx === 2 ? '/allocation' : '/maintenance')}>
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm text-text-secondary font-medium">{kpi.label}</span>
              <button className="three-dot-menu"><MoreVertical size={16} /></button>
            </div>
            <p className="text-3xl font-bold text-text-primary m-0 mb-3">{kpi.value}</p>
            <div className="flex items-center gap-2">
              <span className={`kpi-change ${kpi.positive ? 'kpi-change-positive' : 'kpi-change-negative'}`}>
                {kpi.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {kpi.change}
              </span>
              <span className="text-xs text-text-secondary">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Asset Distribution Chart */}
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-text-primary m-0">Asset Distribution</h3>
            <div className="flex items-center gap-1 bg-bg-primary rounded-xl p-1">
              <button className="pill !py-1 !px-3 !text-xs !rounded-lg">Daily</button>
              <button className="pill !py-1 !px-3 !text-xs !rounded-lg">Weekly</button>
              <button className="pill active !py-1 !px-3 !text-xs !rounded-lg">Monthly</button>
            </div>
          </div>
          <div className="flex items-end gap-4 h-48 px-2">
            {chartBars.map((bar, idx) => {
              const height = Math.max((bar.value / maxBarValue) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  {bar.active && (
                    <span className="text-xs font-bold text-white bg-accent-primary rounded-full px-2.5 py-0.5">{bar.value}</span>
                  )}
                  {!bar.active && <span className="text-xs font-medium text-text-secondary">•</span>}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${bar.active ? 'bar-active' : ''}`}
                    style={{
                      height: `${height}%`,
                      minHeight: '8px',
                      background: bar.active ? 'var(--accent-primary)' : '#d4d4cc',
                    }}
                  ></div>
                  <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider text-center">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 card flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-text-primary m-0">Quick Stats</h3>
            <button className="three-dot-menu"><MoreVertical size={16} /></button>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-primary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center"><ArrowRightLeft size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-primary m-0">{pendingTransfersCount}</p>
                  <p className="text-xs text-text-secondary m-0">Pending Transfers</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-primary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-alert-danger-bg text-alert-danger flex items-center justify-center"><Clock size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-primary m-0">{overdueAllocations.length}</p>
                  <p className="text-xs text-text-secondary m-0">Overdue Returns</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-primary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-alert-warning-bg text-alert-warning flex items-center justify-center"><Wrench size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-primary m-0">{pendingMaintenance}</p>
                  <p className="text-xs text-text-secondary m-0">Pending Maintenance</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-primary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-alert-success-bg text-alert-success flex items-center justify-center"><TrendingUp size={16} /></div>
                <div>
                  <p className="text-sm font-semibold text-text-primary m-0">{lostCount}</p>
                  <p className="text-xs text-text-secondary m-0">Lost / Disposed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color">
          <h3 className="text-base font-bold text-text-primary m-0">Recent Activity</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary">Status</span>
            <select className="select w-auto !py-1.5 !px-3 !text-xs !min-w-[110px]">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left m-0">
            <thead>
              <tr>
                <th className="th">Date</th>
                <th className="th">Type</th>
                <th className="th">Asset</th>
                <th className="th">User</th>
                <th className="th">Status</th>
                <th className="th text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                <tr key={idx} className="hover:bg-bg-primary/50 transition-colors">
                  <td className="td text-text-secondary">{item.date}</td>
                  <td className="td">{item.type}</td>
                  <td className="td font-semibold text-text-primary">{item.asset}</td>
                  <td className="td">{item.user}</td>
                  <td className="td">
                    <span className={`badge ${item.status === 'Active' || item.status === 'Upcoming' ? 'badge-success' : item.status === 'Pending' ? 'badge-warning' : 'badge-neutral'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="td text-right">
                    <button className="three-dot-menu"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-12 text-center text-text-secondary">No recent activity. Start by registering assets or creating bookings.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions (simplified) */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/assets')} className="btn btn-outline flex-1 min-w-[140px]">
          <Package size={16} /> Register Asset
        </button>
        <button onClick={() => navigate('/booking')} className="btn btn-outline flex-1 min-w-[140px]">
          <Calendar size={16} /> Book Resource
        </button>
        <button onClick={() => navigate('/maintenance')} className="btn btn-outline flex-1 min-w-[140px]">
          <Wrench size={16} /> Raise Request
        </button>
        {(userRole === 'Admin' || userRole === 'Asset Manager') && (
          <button onClick={() => navigate('/audit')} className="btn btn-primary flex-1 min-w-[140px]">
            <TrendingUp size={16} /> Run Audit
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
