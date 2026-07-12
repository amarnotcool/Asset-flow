import React from 'react';

const Maintenance = () => {
  const columns = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];
  
  const mockTickets = [
    { id: 1, title: 'Projector bulb not turning on', asset: 'AF-0062', status: 'Pending' },
    { id: 2, title: 'AC unit noisy compressor', asset: 'AF-0103', status: 'Approved' },
    { id: 3, title: 'Printer jam parts ordered', asset: 'AF-0912', status: 'In Progress' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-6">Maintenance Management</h1>
      
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map(col => (
          <div key={col} className="flex-none w-[280px] bg-[#f1f5f9] rounded-lg p-4 flex flex-col">
            <h3 className="text-[0.95rem] font-semibold text-text-secondary uppercase mb-4">{col}</h3>
            <div className="flex flex-col gap-3">
              {mockTickets.filter(t => t.status === col).map(ticket => (
                <div key={ticket.id} className="bg-bg-secondary p-4 rounded-lg shadow-sm border border-border-color cursor-grab hover:shadow-md transition-shadow">
                  <div className="inline-block text-[0.7rem] font-semibold text-accent-primary bg-bg-primary px-2 py-1 rounded mb-2">{ticket.asset}</div>
                  <p className="text-[0.85rem] text-text-primary leading-snug">{ticket.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-text-secondary text-sm">
        Drag and dropping a card across the lanes will automatically update the underlying asset status (e.g. to 'Under Maintenance' when Approved, and back to 'Available' when Resolved).
      </p>
    </div>
  );
};
export default Maintenance;
