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
          <h1 className="text-2xl font-bold text-text-primary">Maintenance Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Route asset repair requests through approval workflows before work begins
          </p>
        </div>
        <button
          onClick={() => setIsRaiseModalOpen(true)}
          className="btn btn-primary cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} /> Raise Request
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map((col) => {
          const columnTickets = maintenanceTickets.filter((t) => t.status === col);
          return (
            <div
              key={col}
              className="flex-none w-[280px] bg-[#f8fafc] rounded-xl p-4 flex flex-col border border-border-color"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-text-secondary uppercase">{col}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-border-color text-text-primary">
                  {columnTickets.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto flex-1">
                {columnTickets.map((ticket) => {
                  const nextStage = getNextStatus(ticket.status);
                  return (
                    <div
                      key={ticket.id}
                      className="bg-bg-secondary p-4 rounded-lg shadow-sm border border-border-color flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="inline-block text-[0.7rem] font-bold text-accent-primary bg-[#e0f2fe] px-2 py-0.5 rounded">
                            {ticket.asset}
                          </span>
                          <span
                            className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${
                              ticket.priority === 'High'
                                ? 'bg-alert-danger-bg text-alert-danger'
                                : ticket.priority === 'Medium'
                                ? 'bg-alert-warning-bg text-alert-warning'
                                : 'bg-[#f1f5f9] text-text-secondary'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary leading-snug">
                          {ticket.title}
                        </p>
                      </div>

                      {nextStage && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, nextStage)}
                          className="btn btn-outline text-xs py-1 px-2.5 flex items-center justify-center gap-1 cursor-pointer w-full mt-2"
                        >
                          Advance to {nextStage} <ArrowRight size={13} />
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

      <p className="mt-4 text-text-secondary text-xs shrink-0">
        💡 Advancing a request to 'Approved' sets the asset status to 'Under Maintenance'. Advancing to
        'Resolved' restores the asset status to 'Available'.
      </p>

      {/* Raise Ticket Modal */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-bg-secondary rounded-xl shadow-xl max-w-md w-full p-6 border border-border-color">
            <h3 className="text-lg font-bold mb-4">Raise Maintenance Request</h3>

            <form onSubmit={handleRaiseSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Select Asset</label>
                <select
                  className="select"
                  value={selectedAssetTag}
                  onChange={(e) => setSelectedAssetTag(e.target.value)}
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.tag}>
                      {a.tag} – {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Issue Title</label>
                <input
                  ref={titleInputRef}
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Projector bulb blinking red"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Priority Level</label>
                <select
                  className="select"
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="label">Detailed Issue Description</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Describe the condition or error observed..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="btn btn-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary cursor-pointer">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
