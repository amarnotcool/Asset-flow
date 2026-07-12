import React, { useState, useEffect, useRef } from 'react';
import { Package, Calendar, Wrench, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Notifications = () => {
  // Simple action-oriented useState variable
  const [activeFilter, setActiveFilter] = useState('All');
  const listContainerRef = useRef(null);
  const { notifications } = useAppStore();

  // useEffect + useRef: Scroll list to top when tab filter changes
  useEffect(() => {
    listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeFilter]);

  const extraAlerts = [
    { id: 101, type: 'Alerts', text: 'Overdue return: AF-0221 was due 3 days ago', time: '1d ago' },
    { id: 102, type: 'Alerts', text: 'Audit discrepancy flagged: AF-0099 damaged', time: '2d ago' },
  ];

  const allNotifications = [...notifications, ...extraAlerts];

  const filteredNotifications =
    activeFilter === 'All'
      ? allNotifications
      : allNotifications.filter((n) => n.type === activeFilter);

  const getIconForType = (type) => {
    switch (type) {
      case 'Allocations': return <Package size={16} />;
      case 'Approvals': return <Wrench size={16} />;
      case 'Bookings': return <Calendar size={16} />;
      case 'Alerts': return <AlertTriangle size={16} />;
      default: return <ArrowRightLeft size={16} />;
    }
  };

  const getBadgeClassForType = (type) => {
    switch (type) {
      case 'Alerts': return 'bg-alert-warning-bg text-alert-warning border-alert-warning/30';
      case 'Approvals': return 'bg-alert-success-bg text-alert-success border-alert-success/30';
      case 'Bookings': return 'bg-[#f1f5f9] text-text-secondary border-border-color';
      case 'Allocations': return 'bg-[#e0f2fe] text-accent-primary border-accent-primary/30';
      default: return 'bg-bg-primary text-text-primary border-border-color';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Activity Logs & Notifications</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Real-time feed of asset registrations, allocations, maintenance updates, and alerts</p>
        </div>
      </div>

      <div className="card flex flex-col flex-1 overflow-hidden p-0">
        <div className="flex gap-3 p-6 border-b border-border-color shrink-0 bg-bg-secondary flex-wrap">
          {['All', 'Alerts', 'Approvals', 'Bookings', 'Allocations'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`pill ${activeFilter === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div ref={listContainerRef} className="overflow-y-auto flex-1 bg-[#f8fafc] p-6">
          <ul className="list-none flex flex-col m-0 p-0 relative before:absolute before:inset-0 before:ml-[1.4rem] before:h-full before:w-0.5 before:bg-border-color gap-1">
            {filteredNotifications.map((item) => (
              <li key={item.id} className="relative pl-14 py-3 group">
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex justify-center items-center border-4 border-[#f8fafc] z-10 transition-transform group-hover:scale-110 ${getBadgeClassForType(item.type)}`}>
                  {getIconForType(item.type)}
                </div>
                <div className="bg-bg-secondary border border-border-color rounded-xl p-4 shadow-sm group-hover:border-accent-primary transition-colors flex justify-between items-center">
                  <p className="text-sm font-semibold text-text-primary m-0">{item.text}</p>
                  <span className="text-xs font-medium text-text-secondary bg-[#f1f5f9] px-2 py-1 rounded-md">{item.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
