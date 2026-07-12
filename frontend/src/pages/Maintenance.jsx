import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Maintenance = () => {
  const columns = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];

  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const descRef = useRef(null);
  const { maintenanceTickets, assets, raiseTicket, updateTicketStatus, syncBackendData } = useAppStore();

  useEffect(() => { syncBackendData(); }, []);

  useEffect(() => {
    if (isRaiseModalOpen) descRef.current?.focus();
  }, [isRaiseModalOpen]);

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !issueDescription.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await raiseTicket({
        asset_id: parseInt(selectedAssetId),
        issue_description: issueDescription.trim(),
        priority: priorityLevel,
      });
      setIsRaiseModalOpen(false);
      setIssueDescription('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit request');
    }
    setLoading(false);
  };

  const getNextStatus = (currentStatus) => {
    const idx = columns.indexOf(currentStatus);
    if (idx < columns.length - 1) return columns[idx + 1];
    return null;
  };

  const handleAdvance = async (ticketId, nextStatus) => {
    try {
      await updateTicketStatus(ticketId, nextStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="card flex justify-between items-center mb-6 shrink-0 max-w-7xl flex-row">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Maintenance Pipeline</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Route asset repair requests through status columns</p>
        </div>
        <button onClick={() => setIsRaiseModalOpen(true)} className="btn btn-primary whitespace-nowrap">
          <Plus size={16} /> Raise Request
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 flex-1">
        {columns.map((col) => {
          const columnTickets = maintenanceTickets.filter(t => t.status === col);
          return (
            <div key={col} className="flex-none w-[290px] bg-bg-secondary border border-border-color rounded-xl p-4 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-sm font-bold text-text-primary m-0">{col}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-bg-primary text-text-secondary border border-border-color">
                  {columnTickets.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {columnTickets.map(ticket => {
                  const nextStage = getNextStatus(ticket.status);
                  let priorityStyles = 'bg-slate-50 text-slate-600 border-slate-200';
                  if (ticket.priority === 'High') priorityStyles = 'bg-red-50 text-red-600 border-red-100';
                  if (ticket.priority === 'Medium') priorityStyles = 'bg-amber-50 text-amber-600 border-amber-100';
                  if (ticket.priority === 'Low') priorityStyles = 'bg-blue-50 text-blue-600 border-blue-100';

                  return (
                    <div key={ticket.id} className="bg-bg-primary border border-border-color rounded-lg p-3.5 flex flex-col gap-3 shadow-sm hover:shadow transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-accent-primary uppercase tracking-wider">
                          {ticket.asset_tag || `#${ticket.id}`}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityStyles}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text-primary m-0 leading-snug">
                        {ticket.issue_description || ticket.asset_name}
                      </p>
                      <p className="text-xs text-text-secondary m-0">By: {ticket.requester_name || '—'}</p>

                      {nextStage && (
                        <button
                          onClick={() => handleAdvance(ticket.id, nextStage)}
                          className="btn btn-outline w-full py-1.5 text-xs text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 mt-1 border border-border-color"
                        >
                          Advance <ArrowRight size={13} />
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

      <div className="mt-4 pt-4 border-t border-border-color shrink-0 text-xs font-semibold text-text-secondary max-w-7xl">
        💡 System workflow: Advancing cards sets the asset status to "Under Maintenance". Resolving them returns status to "Available".
      </div>

      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="card max-w-md w-full shadow-lg border border-border-color bg-bg-secondary p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-6 text-text-primary">Raise Maintenance Request</h3>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg border border-alert-danger bg-alert-danger-bg text-alert-danger font-semibold text-xs">{errorMsg}</div>
            )}

            <form onSubmit={handleRaiseSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Select Asset</label>
                <select className="select" value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} required>
                  <option value="">Choose an asset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.asset_tag} – {a.name}</option>)}
                </select>
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
                <label className="label">Issue Description</label>
                <textarea ref={descRef} className="input text-sm" rows={3} required placeholder="Describe the issue in detail..." value={issueDescription} onChange={e => setIssueDescription(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-color">
                <button type="button" onClick={() => { setIsRaiseModalOpen(false); setErrorMsg(null); }} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
