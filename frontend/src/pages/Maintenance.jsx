import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowRight, XCircle, Wrench, Calendar, FileText } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Maintenance = () => {
  const columns = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved', 'Rejected'];

  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [selectedAssetTag, setSelectedAssetTag] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');

  // Technician assignment state
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  const [technicianName, setTechnicianName] = useState('');

  const titleInputRef = useRef(null);
  const { maintenanceTickets, assets, employees, raiseTicket, updateTicketStatus } = useAppStore();

  useEffect(() => {
    if (isRaiseModalOpen) {
      if (!selectedAssetTag && assets.length > 0) setSelectedAssetTag(assets[0].tag);
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isRaiseModalOpen, assets, selectedAssetTag]);

  const handleRaiseSubmit = (e) => {
    e.preventDefault();
    if (issueTitle.trim() && selectedAssetTag) {
      const payload = {
        title: issueTitle.trim(),
        asset: selectedAssetTag,
        priority: priorityLevel,
        description: issueDescription.trim(),
      };
      raiseTicket(payload);
      setIsRaiseModalOpen(false);
      setIssueTitle('');
      setIssueDescription('');
    }
  };

  const handleAdvance = (ticket, nextStage) => {
    if (nextStage === 'Technician Assigned') {
      setAssigningTicketId(ticket.id);
      setTechnicianName(ticket.technician || '');
    } else {
      updateTicketStatus(ticket.id, nextStage, ticket.technician);
    }
  };

  const handleAssignTechnician = (e, ticketId) => {
    e.preventDefault();
    if (technicianName.trim()) {
      updateTicketStatus(ticketId, 'Technician Assigned', technicianName.trim());
      setAssigningTicketId(null);
      setTechnicianName('');
    }
  };

  const getNextStatus = (currentStatus) => {
    const activeColumns = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];
    const idx = activeColumns.indexOf(currentStatus);
    if (idx !== -1 && idx < activeColumns.length - 1) {
      return activeColumns[idx + 1];
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="card flex justify-between items-center mb-6 shrink-0 flex-row">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Maintenance Pipeline</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Route asset repair requests through status columns</p>
        </div>
        <button onClick={() => setIsRaiseModalOpen(true)} className="btn btn-primary whitespace-nowrap">
          <Plus size={16} /> Raise Request
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="kanban-board flex-1">
        {columns.map((col) => {
          const columnTickets = maintenanceTickets.filter(t => t.status === col);
          return (
            <div key={col} className={`kanban-column ${col === 'Rejected' ? 'bg-alert-danger-bg/20 border-alert-danger/20' : ''}`}>
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-sm font-bold text-text-primary m-0 flex items-center gap-2">
                  {col === 'Rejected' && <XCircle size={14} className="text-alert-danger" />}
                  {col}
                </h3>
                <span className="badge badge-neutral text-[10px]">{columnTickets.length}</span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {columnTickets.map(ticket => {
                  const nextStage = getNextStatus(ticket.status);
                  
                  let priorityStyles = 'badge-neutral';
                  if (ticket.priority === 'High') priorityStyles = 'badge-danger';
                  if (ticket.priority === 'Medium') priorityStyles = 'badge-warning';
                  if (ticket.priority === 'Low') priorityStyles = 'badge-info';

                  const assetInfo = assets.find(a => a.tag === ticket.asset);

                  return (
                    <div key={ticket.id} className="kanban-card group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-accent-primary uppercase tracking-wider">
                          {ticket.asset}
                        </span>
                        <span className={`badge ${priorityStyles} text-[10px]`}>
                          {ticket.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm font-semibold text-text-primary m-0 leading-snug">
                        {ticket.title}
                      </p>
                      
                      <div className="text-[10px] text-text-secondary flex flex-col gap-1 mt-1">
                        <span className="flex items-center gap-1"><FileText size={10} /> {assetInfo?.name || 'Unknown Asset'}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} /> {ticket.requestDate}</span>
                        {ticket.technician && <span className="flex items-center gap-1 font-medium text-text-primary mt-1"><Wrench size={10} className="text-alert-warning" /> Tech: {ticket.technician}</span>}
                      </div>

                      {/* Technician Assignment Form Inline */}
                      {assigningTicketId === ticket.id && col === 'Approved' && (
                        <form onSubmit={(e) => handleAssignTechnician(e, ticket.id)} className="mt-2 flex flex-col gap-2 p-2 bg-bg-primary rounded border border-border-color">
                          <label className="text-[10px] font-bold uppercase text-text-secondary">Assign Technician</label>
                          <select className="select text-xs py-1 px-2 h-auto" value={technicianName} onChange={e => setTechnicianName(e.target.value)} required>
                            <option value="">Select Tech...</option>
                            {employees.filter(e => e.status === 'Active' && e.dept === 'Facilities').map(emp => (
                              <option key={emp.id} value={emp.name}>{emp.name}</option>
                            ))}
                            <option value="External Vendor">External Vendor</option>
                          </select>
                          <div className="flex gap-1">
                            <button type="submit" className="btn btn-primary py-1 !px-2 !gap-1 text-[10px] flex-1 min-w-0">Assign</button>
                            <button type="button" onClick={() => setAssigningTicketId(null)} className="btn btn-outline py-1 !px-2 !gap-1 text-[10px] flex-1 min-w-0">Cancel</button>
                          </div>
                        </form>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {nextStage && assigningTicketId !== ticket.id && (
                          <button 
                            onClick={() => handleAdvance(ticket, nextStage)}
                            className="btn btn-outline flex-1 py-1 !px-2 !gap-1 text-[10px] text-text-secondary hover:text-text-primary min-w-0"
                          >
                            Advance <ArrowRight size={10} className="shrink-0" />
                          </button>
                        )}
                        {col === 'Pending' && (
                          <button 
                            onClick={() => updateTicketStatus(ticket.id, 'Rejected')}
                            className="btn btn-outline flex-1 py-1 !px-2 !gap-1 text-[10px] border-alert-danger text-alert-danger hover:bg-alert-danger hover:text-white min-w-0"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border-color shrink-0 text-xs font-semibold text-text-secondary">
        💡 System workflow: Advancing a ticket to "Approved" automatically sets the asset status to "Under Maintenance". Resolving it returns the asset to "Available".
      </div>

      {/* Raise Ticket Modal */}
      {isRaiseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-xl font-bold mb-6 text-text-primary flex items-center gap-2">
              <Wrench size={22} className="text-alert-warning" /> Raise Maintenance Request
            </h3>

            <form onSubmit={handleRaiseSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Select Asset</label>
                <select className="select" value={selectedAssetTag} onChange={e => setSelectedAssetTag(e.target.value)}>
                  {assets.filter(a => !['Lost', 'Retired', 'Disposed'].includes(a.status)).map(a => <option key={a.id} value={a.tag}>{a.tag} – {a.name} ({a.status})</option>)}
                </select>
              </div>

              <div>
                <label className="label">Issue Title</label>
                <input ref={titleInputRef} type="text" className="input" required placeholder="e.g. Laptop screen flickering" value={issueTitle} onChange={e => setIssueTitle(e.target.value)} />
              </div>

              <div>
                <label className="label">Priority Level</label>
                <select className="select" value={priorityLevel} onChange={e => setPriorityLevel(e.target.value)}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="label">Detailed Issue Description</label>
                <textarea className="input custom-scrollbar" rows={4} placeholder="Provide details of the issue, when it started, and steps to reproduce..." value={issueDescription} onChange={e => setIssueDescription(e.target.value)} />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color">
                <button type="button" onClick={() => setIsRaiseModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
