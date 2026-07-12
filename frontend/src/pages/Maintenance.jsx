import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { operationsApi } from '../api';

const Maintenance = () => {
  const columns = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];

  // Simple action-oriented useState variables
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [selectedAssetTag, setSelectedAssetTag] = useState('AF-0062');
  const [priorityLevel, setPriorityLevel] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');

  const titleInputRef = useRef(null);
  const { maintenanceTickets, assets, raiseTicket, updateTicketStatus } = useAppStore();

  // useEffect + useRef: Auto-focus Issue Title input when Raise Request modal opens
  useEffect(() => {
    if (isRaiseModalOpen) {
      titleInputRef.current?.focus();
    }
  }, [isRaiseModalOpen]);

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (issueTitle.trim() && selectedAssetTag) {
      const payload = {
        title: issueTitle.trim(),
        asset: selectedAssetTag,
        priority: priorityLevel,
        description: issueDescription.trim() || 'Needs inspection',
      };
      try {
        await operationsApi.createMaintenanceRequest(payload);
      } catch {
        // Fallback local update
      }
      raiseTicket(payload);
      setIsRaiseModalOpen(false);
      setIssueTitle('');
      setIssueDescription('');
    }
  };

  const getNextStatus = (currentStatus) => {
    const idx = columns.indexOf(currentStatus);
    if (idx < columns.length - 1) {
      return columns[idx + 1];
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Maintenance Management</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Route asset repair requests through approval workflows before work begins</p>
        </div>
        <button onClick={() => setIsRaiseModalOpen(true)} className="btn btn-primary whitespace-nowrap">
          <Plus size={16} /> Raise Request
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="kanban-board">
        {columns.map((col) => {
          const columnTickets = maintenanceTickets.filter(t => t.status === col);
          return (
            <div key={col} className="kanban-column">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider m-0">{col}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-border-color text-text-primary">
                  {columnTickets.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {columnTickets.map(ticket => {
                  const nextStage = getNextStatus(ticket.status);
                  
                  // Determine priority badge style
                  let prioClass = 'badge-neutral';
                  if (ticket.priority === 'High') prioClass = 'badge-danger';
                  if (ticket.priority === 'Medium') prioClass = 'badge-warning';

                  // Determine card border color
                  let borderClass = 'border-border-color hover:border-text-secondary';
                  if (col === 'Resolved') borderClass = 'border-alert-success';
                  else if (col === 'Pending') borderClass = 'border-accent-primary';
                  else if (col === 'In Progress') borderClass = 'border-alert-warning';

                  return (
                    <div key={ticket.id} className={`kanban-card transition-colors ${borderClass} border-l-4`}>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="badge badge-info tracking-wider">
                            {ticket.asset}
                          </span>
                          <span className={`badge ${prioClass}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary leading-snug m-0">
                          {ticket.title}
                        </p>
                      </div>

                      {nextStage && (
                        <button 
                          onClick={() => updateTicketStatus(ticket.id, nextStage)}
                          className="btn btn-outline text-[11px] py-1.5 px-2 w-full mt-1 flex justify-between group"
                        >
                          <span className="font-semibold text-text-secondary group-hover:text-text-primary transition-colors">Advance</span>
                          <span className="flex items-center gap-1 text-accent-primary font-semibold">
                            {nextStage} <ArrowRight size={12} />
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-text-secondary text-xs shrink-0 bg-bg-secondary p-3 rounded-lg border border-border-color m-0 font-medium">
        <span className="text-accent-primary mr-1">💡 System Note:</span> Advancing a request to 'Approved' sets the asset status to 'Under Maintenance'. Advancing to 'Resolved' restores the asset status to 'Available'.
      </p>

      {/* Raise Ticket Modal */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-text-primary">Raise Maintenance Request</h3>

            <form onSubmit={handleRaiseSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Select Asset</label>
                <select className="select" value={selectedAssetTag} onChange={e => setSelectedAssetTag(e.target.value)}>
                  {assets.map(a => <option key={a.id} value={a.tag}>{a.tag} – {a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Issue Title</label>
                <input ref={titleInputRef} type="text" className="input" required placeholder="e.g. Projector bulb blinking red" value={issueTitle} onChange={e => setIssueTitle(e.target.value)} />
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
                <textarea className="input" rows={3} placeholder="Describe the condition or error observed..." value={issueDescription} onChange={e => setIssueDescription(e.target.value)} />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-color">
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
