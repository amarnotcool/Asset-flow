import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, ArrowRightLeft, Undo2, Check, Send, XCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { operationsApi } from '../api';

const AllocationTransfer = () => {
  const [activeTab, setActiveTab] = useState('actions'); // 'actions' | 'transfers'
  const [assetTagInput, setAssetTagInput] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [returnCondition, setReturnCondition] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const tagInputRef = useRef(null);
  
  const { 
    assets, employees, transferRequests, allocationHistory,
    allocateAsset, returnAsset, createTransferRequest, approveTransferRequest, rejectTransferRequest
  } = useAppStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Asset Manager';

  // Auto-dismiss messages
  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const foundAsset = assets.find(
    (a) => a.tag.toUpperCase() === assetTagInput.trim().toUpperCase()
  );

  const isConflict = foundAsset && foundAsset.status === 'Allocated';

  const handleAllocateDirect = async (e) => {
    e.preventDefault();
    if (foundAsset && selectedEmployee) {
      try {
        await operationsApi.allocateAsset({
          assetTag: foundAsset.tag,
          toUser: selectedEmployee,
          reason: 'Direct Allocation',
        });
      } catch {}
      allocateAsset(foundAsset.tag, selectedEmployee, expectedReturn);
      setActionMessage({
        type: 'success',
        text: `Asset ${foundAsset.tag} successfully allocated to ${selectedEmployee}.`,
      });
      setSelectedEmployee('');
      setExpectedReturn('');
      setAssetTagInput('');
    }
  };

  const handleSubmitTransferRequest = async (e) => {
    e.preventDefault();
    if (foundAsset && selectedEmployee) {
      createTransferRequest({
        assetTag: foundAsset.tag,
        fromUser: foundAsset.holder,
        toUser: selectedEmployee,
        reason: transferReason || 'Reassignment',
      });
      setActionMessage({
        type: 'success',
        text: `Transfer request submitted for ${foundAsset.tag} to ${selectedEmployee}. Awaiting approval.`,
      });
      setSelectedEmployee('');
      setTransferReason('');
      setAssetTagInput('');
    }
  };

  const handleReturnAsset = (e) => {
    e?.preventDefault();
    if (foundAsset) {
      returnAsset(foundAsset.tag, returnCondition);
      setActionMessage({
        type: 'success',
        text: `Asset ${foundAsset.tag} returned and checked in.`,
      });
      setReturnCondition('');
      setAssetTagInput('');
    }
  };

  const handleApproveTransfer = (id) => {
    approveTransferRequest(id);
    setActionMessage({ type: 'success', text: 'Transfer request approved and asset re-allocated.' });
  };

  const handleRejectTransfer = (id) => {
    rejectTransferRequest(id);
    setActionMessage({ type: 'success', text: 'Transfer request rejected.' });
  };

  const pendingTransfers = transferRequests.filter(r => r.status === 'Pending');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Allocation & Transfer</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Allocate available assets, submit transfer requests, and manage returns</p>
        </div>
        <div className="tab-bar border-b-0 bg-transparent gap-2">
          <button className={`pill ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>
            Actions
          </button>
          <button className={`pill ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => setActiveTab('transfers')}>
            Pending Transfers {pendingTransfers.length > 0 && <span className="badge badge-danger ml-2">{pendingTransfers.length}</span>}
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-warning'} justify-between`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-inherit opacity-70 hover:opacity-100 cursor-pointer bg-transparent border-0">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Main Actions Tab */}
      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Asset Lookup */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4 text-text-primary m-0">1. Lookup Asset</h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {assets.slice(0, 8).map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { setAssetTagInput(a.tag); setActionMessage(null); tagInputRef.current?.focus(); }}
                    className={`pill text-xs py-1 px-3 ${assetTagInput.toUpperCase() === a.tag.toUpperCase() ? 'active' : ''}`}
                  >
                    {a.tag}
                  </button>
                ))}
              </div>

              <div className="mb-2">
                <input ref={tagInputRef} type="text" className="input max-w-sm" placeholder="Enter Asset Tag (e.g. AF-0114)" value={assetTagInput} onChange={(e) => { setAssetTagInput(e.target.value); setActionMessage(null); }} />
              </div>

              {foundAsset && (
                <div className="mt-4 p-4 rounded-xl bg-bg-primary border border-border-color text-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <span className="font-bold text-text-primary text-base">{foundAsset.name}</span>
                    <span className="text-text-secondary ml-2">• {foundAsset.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">Status:</span>
                    <span className={`badge ${foundAsset.status === 'Available' ? 'badge-success' : foundAsset.status === 'Allocated' ? 'badge-info' : 'badge-warning'}`}>
                      {foundAsset.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Form Based on Status */}
            <div className="card">
              {!foundAsset ? (
                <div className="py-12 text-center text-text-secondary flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl bg-bg-primary/50">
                  <ArrowRightLeft size={32} className="mb-3 text-text-secondary/50" />
                  <p className="m-0 font-medium">Enter or select a valid asset tag above</p>
                </div>
              ) : isConflict ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="alert alert-warning mb-6">
                    <AlertCircle size={20} className="shrink-0" />
                    <div>
                      <strong>Currently allocated to: {foundAsset.holder}</strong><br/>
                      To reassign this asset, submit a transfer request or mark it as returned.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transfer Request Flow */}
                    <div className="border border-border-color rounded-xl p-5 bg-bg-primary">
                      <form onSubmit={handleSubmitTransferRequest} className="flex flex-col gap-4">
                        <h3 className="font-bold text-base flex items-center gap-2 m-0 text-text-primary mb-2">
                          <Send size={16} className="text-accent-primary" /> Request Transfer
                        </h3>

                        <div>
                          <label className="label">Transfer To Employee</label>
                          <select className="select" required value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                            <option value="">Select Employee...</option>
                            {employees.filter(e => e.status === 'Active' && e.name !== foundAsset.holder).map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label">Transfer Reason</label>
                          <input type="text" className="input" required placeholder="Why is this being transferred?" value={transferReason} onChange={(e) => setTransferReason(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary mt-2">Submit Request</button>
                      </form>
                    </div>

                    {/* Return Flow */}
                    <div className="border border-border-color rounded-xl p-5 bg-bg-primary">
                      <form onSubmit={handleReturnAsset} className="flex flex-col gap-4">
                        <h3 className="font-bold text-base flex items-center gap-2 m-0 text-text-primary mb-2">
                          <Undo2 size={16} className="text-alert-success" /> Process Return
                        </h3>
                        
                        <div>
                          <label className="label">Condition Notes (Optional)</label>
                          <textarea className="input custom-scrollbar" rows={4} placeholder="e.g. Scratched screen, missing charger..." value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-outline text-alert-success border-alert-success hover:bg-alert-success hover:text-white mt-2">
                          Mark Returned
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <form onSubmit={handleAllocateDirect} className="flex flex-col gap-5 max-w-lg mx-auto">
                    <h3 className="font-bold text-xl flex justify-center items-center gap-2 m-0 text-text-primary mb-4">
                      <Check size={24} className="text-alert-success" /> Allocate Available Asset
                    </h3>

                    <div>
                      <label className="label">Assign To Employee</label>
                      <select className="select" required value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                        <option value="">Select Employee...</option>
                        {employees.filter(e => e.status === 'Active').map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="label">Expected Return Date (Optional)</label>
                      <input type="date" className="input" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    </div>

                    <button type="submit" className="btn btn-primary mt-4 py-3 text-base">
                      Allocate Asset
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="card h-full">
              <h3 className="font-bold text-sm mb-5 text-text-secondary uppercase tracking-wider m-0">Recent Activity</h3>
              <ul className="list-none text-sm text-text-primary space-y-4 m-0 p-0 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-color pl-6">
                
                {allocationHistory.slice(0, 6).map(h => (
                  <li key={h.id} className="relative">
                    <div className={`absolute w-3 h-3 rounded-full -left-[1.35rem] top-1.5 border-2 border-bg-secondary ${h.status === 'Active' ? 'bg-accent-primary' : h.status === 'Returned' ? 'bg-alert-success' : 'bg-alert-warning'}`}></div>
                    <div className="font-medium">
                      <strong>{h.assetTag}</strong> 
                      {h.status === 'Active' ? ` allocated to ${h.user}` : h.status === 'Returned' ? ` returned by ${h.user}` : ` transferred to ${h.user}`}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {h.status === 'Active' ? h.allocatedDate : h.returnedDate}
                      {h.conditionNotes && <span className="block italic mt-0.5 opacity-80 text-alert-warning">Note: {h.conditionNotes}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Pending Transfers Tab */}
      {activeTab === 'transfers' && (
        <div className="card p-0 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left m-0">
              <thead>
                <tr>
                  <th className="th">Asset Tag</th>
                  <th className="th">From User</th>
                  <th className="th">To User</th>
                  <th className="th">Reason</th>
                  <th className="th">Date</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransfers.length > 0 ? pendingTransfers.map(req => (
                  <tr key={req.id} className="hover:bg-bg-primary/50 transition-colors">
                    <td className="td font-bold text-accent-primary">{req.assetTag}</td>
                    <td className="td text-text-primary">{req.fromUser}</td>
                    <td className="td font-bold text-text-primary">{req.toUser}</td>
                    <td className="td text-text-secondary">{req.reason}</td>
                    <td className="td text-text-secondary">{req.requestDate}</td>
                    <td className="td text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleApproveTransfer(req.id)} className="btn btn-outline border-alert-success text-alert-success hover:bg-alert-success hover:text-white py-1 px-3 text-xs">Approve</button>
                          <button onClick={() => handleRejectTransfer(req.id)} className="btn btn-outline border-alert-danger text-alert-danger hover:bg-alert-danger hover:text-white py-1 px-3 text-xs">Reject</button>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary italic">Awaiting Manager</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="p-12 text-center text-text-secondary">No pending transfer requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationTransfer;
