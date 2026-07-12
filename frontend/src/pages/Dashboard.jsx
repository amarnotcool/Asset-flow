import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Wrench, ArrowRightLeft, AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const { assets, bookings, maintenanceTickets, transferRequests, allocationHistory, auditCycles, syncBackendData, getOverdueAllocations, getPendingTransferCount } = useAppStore();
  const { user } = useAuthStore();
  const userRole = user?.role || 'Employee';

  useEffect(() => {
    syncBackendData();
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [syncBackendData]);

  // Computed KPIs
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const lostCount = assets.filter(a => a.status === 'Lost').length;
  const activeBookingsCount = bookings.filter(b => b.status !== 'Cancelled').length;
  const pendingTransfersCount = getPendingTransferCount();
  const overdueAllocations = getOverdueAllocations();
  const pendingMaintenance = maintenanceTickets.filter(t => t.status === 'Pending').length;
  const openAuditCycles = auditCycles.filter(c => c.status === 'Open').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div ref={dashboardRef} className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="card flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">{getGreeting()}, {user?.name || 'User'}</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">
            {userRole === 'Admin' || userRole === 'Asset Manager'
              ? 'Organization-wide operational snapshot'
              : userRole === 'Department Head'
              ? 'Your department\'s asset overview'
              : 'Your personal asset & booking overview'
            }
          </p>
        </div>
        <span className="badge badge-info text-xs">{userRole}</span>
      </div>

      {/* Overdue Alert */}
      {overdueAllocations.length > 0 && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} className="shrink-0" />
          <div>
            <strong>{overdueAllocations.length} asset{overdueAllocations.length > 1 ? 's' : ''} overdue for return</strong>
            <span className="block text-xs mt-0.5 opacity-80">
              {overdueAllocations.map(h => `${h.assetTag} (held by ${h.user})`).join(' • ')}
            </span>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 cursor-pointer hover:border-accent-primary transition-colors" onClick={() => navigate('/assets')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-alert-success-bg text-alert-success flex items-center justify-center"><Package size={18} /></div>
            <span className="text-xs font-semibold text-text-secondary uppercase">Available</span>
          </div>
          <p className="text-3xl font-bold text-text-primary m-0">{availableCount}</p>
        </div>

        <div className="card p-4 cursor-pointer hover:border-accent-primary transition-colors" onClick={() => navigate('/allocation')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center"><Users size={18} /></div>
            <span className="text-xs font-semibold text-text-secondary uppercase">Allocated</span>
          </div>
          <p className="text-3xl font-bold text-text-primary m-0">{allocatedCount}</p>
        </div>

        <div className="card p-4 cursor-pointer hover:border-accent-primary transition-colors" onClick={() => navigate('/maintenance')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-alert-warning-bg text-alert-warning flex items-center justify-center"><Wrench size={18} /></div>
            <span className="text-xs font-semibold text-text-secondary uppercase">Maintenance</span>
          </div>
          <p className="text-3xl font-bold text-text-primary m-0">{maintenanceCount}</p>
        </div>

        <div className="card p-4 cursor-pointer hover:border-accent-primary transition-colors" onClick={() => navigate('/booking')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center"><Calendar size={18} /></div>
            <span className="text-xs font-semibold text-text-secondary uppercase">Bookings</span>
          </div>
          <p className="text-3xl font-bold text-text-primary m-0">{activeBookingsCount}</p>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <ArrowRightLeft size={18} className="text-accent-primary shrink-0" />
          <div>
            <p className="text-lg font-bold text-text-primary m-0">{pendingTransfersCount}</p>
            <p className="text-xs text-text-secondary m-0">Pending Transfers</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Clock size={18} className="text-alert-danger shrink-0" />
          <div>
            <p className="text-lg font-bold text-alert-danger m-0">{overdueAllocations.length}</p>
            <p className="text-xs text-text-secondary m-0">Overdue Returns</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-alert-warning shrink-0" />
          <div>
            <p className="text-lg font-bold text-text-primary m-0">{pendingMaintenance}</p>
            <p className="text-xs text-text-secondary m-0">Pending Requests</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <TrendingUp size={18} className="text-alert-success shrink-0" />
          <div>
            <p className="text-lg font-bold text-text-primary m-0">{openAuditCycles}</p>
            <p className="text-xs text-text-secondary m-0">Open Audit Cycles</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/assets')} className="btn btn-outline flex-1 min-w-[140px] py-3 flex items-center justify-center gap-2">
          <Package size={16} /> Register Asset
        </button>
        <button onClick={() => navigate('/booking')} className="btn btn-outline flex-1 min-w-[140px] py-3 flex items-center justify-center gap-2">
          <Calendar size={16} /> Book Resource
        </button>
        <button onClick={() => navigate('/maintenance')} className="btn btn-outline flex-1 min-w-[140px] py-3 flex items-center justify-center gap-2">
          <Wrench size={16} /> Raise Request
        </button>
        {(userRole === 'Admin' || userRole === 'Asset Manager') && (
          <button onClick={() => navigate('/audit')} className="btn btn-outline flex-1 min-w-[140px] py-3 flex items-center justify-center gap-2">
            <TrendingUp size={16} /> Run Audit
          </button>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4 m-0 tracking-tight text-text-primary">Recent Activity Feed</h2>
        <ul className="list-none flex flex-col gap-4 m-0 p-0">
          {[
            { icon: <Package size={15} />, bg: 'bg-accent-primary/10', color: 'text-accent-primary', text: `Laptop AF-0114 allocated to Priya Shah — Engineering` },
            { icon: <Calendar size={15} />, bg: 'bg-alert-success-bg', color: 'text-alert-success', text: 'Room B2 — booking confirmed — 2:00 to 3:00 PM' },
            { icon: <Wrench size={15} />, bg: 'bg-alert-warning-bg', color: 'text-alert-warning', text: 'Projector AF-0062 — maintenance resolved' },
            { icon: <ArrowRightLeft size={15} />, bg: 'bg-accent-primary/10', color: 'text-accent-primary', text: `${pendingTransfersCount} transfer request(s) pending approval` },
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 border-b border-border-color pb-3 last:border-b-0 last:pb-0">
              <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <p className="text-sm font-medium text-text-primary m-0">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Asset Status Distribution (mini chart) */}
      {(userRole === 'Admin' || userRole === 'Asset Manager') && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4 m-0 tracking-tight text-text-primary">Asset Status Distribution</h2>
          <div className="flex items-end gap-6 h-36">
            {[
              { label: 'Available', count: availableCount, color: '#10b981' },
              { label: 'Allocated', count: allocatedCount, color: '#3b82f6' },
              { label: 'Maintenance', count: maintenanceCount, color: '#f59e0b' },
              { label: 'Lost', count: lostCount, color: '#ef4444' },
            ].map((bar, idx) => {
              const maxCount = Math.max(availableCount, allocatedCount, maintenanceCount, lostCount, 1);
              const height = Math.max((bar.count / maxCount) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-lg font-bold text-text-primary">{bar.count}</span>
                  <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: `${height}%`, background: bar.color, minHeight: '8px' }}></div>
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider text-center">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
