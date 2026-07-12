import React, { useState, useEffect, useRef } from 'react';
import { Package, Calendar, Wrench, ArrowRightLeft, AlertTriangle, Check, CheckCircle2, History, Bell } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'activity'
  const [activeFilter, setActiveFilter] = useState('All');
  const listContainerRef = useRef(null);
  
  const { notifications, activityLog, markNotificationRead, markAllNotificationsRead } = useAppStore();

  useEffect(() => {
    listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFilter, activeTab]);

  const filteredNotifications = activeFilter === 'All'
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIconForType = (type) => {
    switch (type) {
      case 'Allocations': return <Package size={16} />;
      case 'Approvals': return <Wrench size={16} />;
      case 'Bookings': return <Calendar size={16} />;
      case 'Alerts': return <AlertTriangle size={16} />;
      case 'Transfers': return <ArrowRightLeft size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getBadgeClassForType = (type) => {
    switch (type) {
      case 'Alerts': return 'bg-alert-warning-bg text-alert-warning border-alert-warning/30';
      case 'Approvals': return 'bg-alert-success-bg text-alert-success border-alert-success/30';
      case 'Bookings': return 'bg-bg-primary text-text-secondary border-border-color';
      case 'Allocations': return 'bg-accent-primary/10 text-accent-primary border-accent-primary/30';
      case 'Transfers': return 'bg-accent-primary/10 text-accent-primary border-accent-primary/30';
      default: return 'bg-bg-primary text-text-primary border-border-color';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Activity & Notifications</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Real-time feed of system events and personal alerts</p>
        </div>
        
        <div className="tab-bar border-b-0 bg-transparent gap-2">
          <button className={`pill ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            Notifications {unreadCount > 0 && <span className="badge badge-danger ml-2">{unreadCount}</span>}
          </button>
          <button className={`pill ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
            System Activity Log
          </button>
        </div>
      </div>

      <div className="card flex flex-col flex-1 overflow-hidden p-0">
        
        {/* Filters and Actions */}
        {activeTab === 'notifications' && (
          <div className="flex justify-between items-center p-4 border-b border-border-color shrink-0 bg-bg-secondary flex-wrap gap-4">
            <div className="flex gap-2">
              {['All', 'Alerts', 'Approvals', 'Bookings', 'Transfers', 'Allocations'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`pill text-xs py-1 px-3 ${activeFilter === f ? 'active' : ''}`}
                >
                  {f}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllNotificationsRead} className="btn btn-outline text-xs py-1 px-3">
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
        )}

        {/* List Content */}
        <div ref={listContainerRef} className="overflow-y-auto flex-1 bg-bg-primary p-6 custom-scrollbar">
          
          {activeTab === 'notifications' && (
            <ul className="list-none flex flex-col m-0 p-0 relative before:absolute before:inset-0 before:ml-[1.4rem] before:h-full before:w-0.5 before:bg-border-color gap-1">
              {filteredNotifications.length > 0 ? filteredNotifications.map((item) => (
                <li key={item.id} className="relative pl-14 py-3 group">
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex justify-center items-center border-4 border-bg-primary z-10 transition-transform group-hover:scale-110 ${getBadgeClassForType(item.type)}`}>
                    {getIconForType(item.type)}
                  </div>
                  <div className={`bg-bg-secondary border rounded-xl p-4 shadow-sm transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${!item.read ? 'border-accent-primary' : 'border-border-color'}`}>
                    <div className="flex items-center gap-3">
                      {!item.read && <span className="w-2 h-2 rounded-full bg-accent-primary shrink-0"></span>}
                      <p className={`text-sm m-0 ${!item.read ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>{item.text}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 pl-5 sm:pl-0">
                      <span className="text-xs font-medium text-text-secondary bg-bg-primary px-2 py-1 rounded-md border border-border-color">{item.time}</span>
                      {!item.read && (
                        <button onClick={() => markNotificationRead(item.id)} className="btn btn-outline border-0 p-1 text-text-secondary hover:text-alert-success" title="Mark as read">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )) : (
                <div className="text-center py-12 text-text-secondary">
                  <Bell size={32} className="mx-auto mb-3 opacity-50" />
                  <p>No notifications found.</p>
                </div>
              )}
            </ul>
          )}

          {activeTab === 'activity' && (
            <div className="w-full">
              <table className="w-full border-collapse text-left m-0 bg-bg-secondary rounded-xl overflow-hidden border border-border-color">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="th text-[10px]">Timestamp</th>
                    <th className="th text-[10px]">User</th>
                    <th className="th text-[10px]">Action</th>
                    <th className="th text-[10px]">Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLog.length > 0 ? activityLog.map((log) => (
                    <tr key={log.id} className="border-b border-border-color hover:bg-bg-primary transition-colors last:border-b-0">
                      <td className="td py-2 text-xs text-text-secondary w-32 whitespace-nowrap"><History size={12} className="inline mr-1 opacity-50" />{log.timestamp}</td>
                      <td className="td py-2 text-xs font-semibold text-text-primary w-40">{log.user}</td>
                      <td className="td py-2 text-xs text-text-secondary w-48">{log.action}</td>
                      <td className="td py-2 text-xs font-medium text-text-primary">{log.entity}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-8 text-center text-text-secondary">No activity logs recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Notifications;
