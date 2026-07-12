import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Package, Calendar, Wrench, ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';

const Notifications = () => {
  const [filter, setFilter] = useState('All');
  
  const notifications = [
    { type: 'Allocations', text: 'Laptop AF-0114 assigned to Priya Shah', time: '12m ago', icon: <Package size={16}/>, bg: 'bg-primary-light' },
    { type: 'Approvals', text: 'Maintenance request AF-0055 approved', time: '18m ago', icon: <Wrench size={16}/>, bg: 'bg-success-light' },
    { type: 'Bookings', text: 'Booking confirmed: Room B2 : 2:00 to 3:00 PM', time: '1h ago', icon: <Calendar size={16}/>, bg: 'bg-primary-light' },
    { type: 'Approvals', text: 'Transfer approved: AF-0913 to Facilities dept', time: '3h ago', icon: <ArrowRightLeft size={16}/>, bg: 'bg-success-light' },
    { type: 'Alerts', text: 'Overdue return: AF-0221 was due 3 days ago', time: '1d ago', icon: <Clock size={16}/>, bg: 'bg-warning-light' },
    { type: 'Alerts', text: 'Audit discrepancy flagged: AF-0099 damaged', time: '2d ago', icon: <AlertTriangle size={16}/>, bg: 'bg-warning-light' },
  ];

  const filtered = filter === 'All' ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div className="notifications-page flex-col">
      <h1 className="page-title">Activity Logs & Notifications</h1>
      
      <Card>
        <div className="flex gap-2 mb-6">
          {['All', 'Alerts', 'Approvals', 'Bookings'].map(f => (
            <button key={f} 
               onClick={() => setFilter(f)}
               className={`badge ${filter === f ? 'badge-primary' : 'badge-outline'}`}
               style={{cursor: 'pointer', padding: '0.4rem 1rem'}}>
              {f}
            </button>
          ))}
        </div>

        <ul className="activity-list">
          {filtered.map((item, idx) => (
            <li key={idx} className="activity-item border-b" style={{paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)'}}>
              <div className={`activity-icon ${item.bg}`}>
                {item.icon}
              </div>
              <div className="activity-content flex-1 flex justify-between items-center w-full">
                <p style={{margin: 0}}>{item.text}</p>
                <span className="activity-time">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
export default Notifications;
