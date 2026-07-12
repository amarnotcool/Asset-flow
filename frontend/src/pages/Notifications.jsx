import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Package, Calendar, Wrench, ArrowRightLeft, Clock, AlertTriangle } from 'lucide-react';

const Notifications = () => {
  const [filter, setFilter] = useState('All');
  
  const notifications = [
    { type: 'Allocations', text: 'Laptop AF-0114 assigned to Priya Shah', time: '12m ago', icon: <Package size={16}/>, bg: 'bg-[#e0f2fe]', textC: 'text-accent-primary' },
    { type: 'Approvals', text: 'Maintenance request AF-0055 approved', time: '18m ago', icon: <Wrench size={16}/>, bg: 'bg-alert-success-bg', textC: 'text-alert-success' },
    { type: 'Bookings', text: 'Booking confirmed: Room B2 : 2:00 to 3:00 PM', time: '1h ago', icon: <Calendar size={16}/>, bg: 'bg-[#e0f2fe]', textC: 'text-accent-primary' },
    { type: 'Approvals', text: 'Transfer approved: AF-0913 to Facilities dept', time: '3h ago', icon: <ArrowRightLeft size={16}/>, bg: 'bg-alert-success-bg', textC: 'text-alert-success' },
    { type: 'Alerts', text: 'Overdue return: AF-0221 was due 3 days ago', time: '1d ago', icon: <Clock size={16}/>, bg: 'bg-alert-warning-bg', textC: 'text-alert-warning' },
    { type: 'Alerts', text: 'Audit discrepancy flagged: AF-0099 damaged', time: '2d ago', icon: <AlertTriangle size={16}/>, bg: 'bg-alert-warning-bg', textC: 'text-alert-warning' },
  ];

  const filtered = filter === 'All' ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Activity Logs & Notifications</h1>
      
      <Card>
        <div className="flex gap-2 mb-6">
          {['All', 'Alerts', 'Approvals', 'Bookings'].map(f => (
            <button key={f} 
               onClick={() => setFilter(f)}
               className={`py-1.5 px-4 rounded-full text-sm font-medium transition-colors border cursor-pointer ${
                  filter === f 
                  ? 'bg-[#e0f2fe] text-accent-primary border-transparent' 
                  : 'bg-transparent border-border-color text-text-primary hover:bg-bg-primary'
               }`}>
              {f}
            </button>
          ))}
        </div>

        <ul className="list-none flex flex-col">
          {filtered.map((item, idx) => (
            <li key={idx} className="flex items-center gap-4 py-4 border-b border-border-color last:border-b-0">
              <div className={`w-8 h-8 rounded-full flex justify-center items-center shrink-0 ${item.bg} ${item.textC}`}>
                {item.icon}
              </div>
              <div className="flex-1 flex justify-between items-center w-full">
                <p className="text-sm font-medium text-text-primary m-0">{item.text}</p>
                <span className="text-xs text-text-secondary">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
export default Notifications;
