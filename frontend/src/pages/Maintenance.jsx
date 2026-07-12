import React from 'react';
import './Maintenance.css';

const Maintenance = () => {
  const columns = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];
  
  const mockTickets = [
    { id: 1, title: 'Projector bulb not turning on', asset: 'AF-0062', status: 'Pending' },
    { id: 2, title: 'AC unit noisy compressor', asset: 'AF-0103', status: 'Approved' },
    { id: 3, title: 'Printer jam parts ordered', asset: 'AF-0912', status: 'In Progress' },
  ];

  return (
    <div className="maintenance-page flex-col h-full">
      <h1 className="page-title">Maintenance Management</h1>
      
      <div className="kanban-board">
        {columns.map(col => (
          <div key={col} className="kanban-column">
            <h3 className="kanban-header">{col}</h3>
            <div className="kanban-cards">
              {mockTickets.filter(t => t.status === col).map(ticket => (
                <div key={ticket.id} className="kanban-card">
                  <div className="tag">{ticket.asset}</div>
                  <p>{ticket.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-secondary text-sm">
        Drag and dropping a card across the lanes will automatically update the underlying asset status (e.g. to 'Under Maintenance' when Approved, and back to 'Available' when Resolved).
      </p>
    </div>
  );
};
export default Maintenance;
