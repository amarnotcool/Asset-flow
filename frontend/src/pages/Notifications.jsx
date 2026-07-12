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
      case 'Allocations':
        return <Package size={16} />;
      case 'Approvals':
        return <Wrench size={16} />;
      case 'Bookings':
        return <Calendar size={16} />;
      case 'Alerts':
        return <AlertTriangle size={16} />;
      default:
        return <ArrowRightLeft size={16} />;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Activity Logs & Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time feed of asset registrations, allocations, maintenance updates, and alerts
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-6">
          {['All', 'Alerts', 'Approvals', 'Bookings', 'Allocations'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`py-1.5 px-4 rounded-full text-sm font-medium transition-colors border cursor-pointer ${
                activeFilter === f
                  ? 'bg-[#e0f2fe] text-accent-primary border-transparent'
                  : 'bg-transparent border-border-color text-text-primary hover:bg-bg-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div ref={listContainerRef} className="max-h-[600px] overflow-y-auto">
          <ul className="list-none flex flex-col">
            {filteredNotifications.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 py-4 border-b border-border-color last:border-b-0"
              >
                <div
                  className={`w-9 h-9 rounded-full flex justify-center items-center shrink-0 ${
                    item.type === 'Alerts'
                      ? 'bg-alert-warning-bg text-alert-warning'
                      : item.type === 'Approvals'
                      ? 'bg-alert-success-bg text-alert-success'
                      : 'bg-[#e0f2fe] text-accent-primary'
                  }`}
                >
                  {getIconForType(item.type)}
                </div>
                <div className="flex-1 flex justify-between items-center w-full">
                  <p className="text-sm font-medium text-text-primary m-0">{item.text}</p>
                  <span className="text-xs text-text-secondary">{item.time}</span>
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
