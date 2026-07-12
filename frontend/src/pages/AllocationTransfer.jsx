import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, ArrowRightLeft, Undo2, Check, Send, XCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const AllocationTransfer = () => {
  const [assetTagInput, setAssetTagInput] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('actions');

  const { assets, users: employees, allocateAsset, returnAsset, syncBackendData } = useAppStore();
  
  // Pending transfers can be fetched from backend if added, mocking for UI
  const pendingTransfers = [];
  const isAdmin = true;

  const tagInputRef = useRef(null);

  useEffect(() => {
    syncBackendData();
  }, []);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const foundAsset = assets.find(a => (a.asset_tag || '').toUpperCase() === assetTagInput.toUpperCase());
  const isConflict = foundAsset && foundAsset.status === 'Allocated';

  const handleAllocateDirect = async (e) => {
    e.preventDefault();
    if (foundAsset && selectedEmployee) {
      // Simulate API logic
      allocateAsset(foundAsset.id, selectedEmployee);
      setActionMessage({
        type: 'success',
        text: `Asset ${foundAsset.asset_tag} successfully allocated to ${selectedEmployee}.`,
      });
      setSelectedEmployee('');
    }
  };

  const handleSubmitTransferRequest = async (e) => {
    e.preventDefault();
    if (foundAsset && selectedEmployee) {
      allocateAsset(foundAsset.id, selectedEmployee);
      setActionMessage({
        type: 'success',
        text: `Transfer request approved: ${foundAsset.asset_tag} re-allocated to ${selectedEmployee}.`,
      });
      setSelectedEmployee('');
      setTransferReason('');
    }
  };

  const handleReturnAsset = () => {
    if (foundAsset) {
      returnAsset(foundAsset.id);
      setActionMessage({
        type: 'success',
        text: `Asset ${foundAsset.asset_tag} returned and checked in. Status reverted to Available.`,
      });
    }
  };

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
        <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-warning'} mb-6 justify-between`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="btn btn-outline border-0 p-1 bg-transparent hover:bg-transparent">
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-4 text-text-primary m-0">1. Select or Enter Asset Tag</h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {assets.slice(0, 8).map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { setAssetTagInput(a.asset_tag); setActionMessage(null); tagInputRef.current?.focus(); }}
                    className={`pill ${assetTagInput.toUpperCase() === (a.asset_tag || '').toUpperCase() ? 'active' : ''}`}
                  >
                    {a.asset_tag} ({a.status})
                  </button>
                ))}
              </div>

              <div className="mb-2">
                <label className="label">Asset Tag Lookup</label>
                <input ref={tagInputRef} type="text" className="input max-w-sm" placeholder="e.g. AF-XXXX" value={assetTagInput} onChange={(e) => { setAssetTagInput(e.target.value); setActionMessage(null); }} />
              </div>

              {foundAsset && (
                <div className="mt-4 p-4 rounded-xl bg-bg-primary border border-border-color text-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-text-primary text-base">{foundAsset.name}</span>
                    <span className="text-text-secondary ml-2">• {foundAsset.category_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">Status:</span>
                    <span className={`badge ${foundAsset.status === 'Available' ? 'badge-success' : 'badge-info'}`}>
                      {foundAsset.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              {!foundAsset ? (
                <div className="p-8 text-center text-text-secondary flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl">
                  <ArrowRightLeft size={32} className="mb-3 text-border-color" />
                  <p className="m-0">Enter or select a valid asset tag above to proceed.</p>
                </div>
              ) : isConflict ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="alert alert-danger mb-6">
                    <AlertCircle size={20} className="shrink-0" />
                    <div>
                      <strong>Already allocated to {foundAsset.holder_name}</strong><br/>
                      Direct allocation is blocked to prevent double-allocation. Use the Transfer Request below or return the asset first.
                    </div>
                  </div>

                  <form onSubmit={handleSubmitTransferRequest} className="flex flex-col gap-5">
                    <h3 className="font-bold text-lg flex items-center gap-2 m-0 text-text-primary">
                      <ArrowRightLeft size={18} className="text-accent-primary" /> Submit Transfer Request
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="label">Current Holder (From)</label>
                        <input type="text" className="input bg-bg-primary text-text-secondary cursor-not-allowed" value={foundAsset.holder_name || ''} disabled readOnly />
                      </div>
                      <div>
                        <label className="label">Transfer To Employee</label>
                        <select className="select" required value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                          <option value="">Select Employee...</option>
                          {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">Transfer Reason</label>
                      <textarea className="input" rows={2} placeholder="e.g. Project reassignment or department transfer" value={transferReason} onChange={(e) => setTransferReason(e.target.value)} />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center mt-2 pt-4 border-t border-border-color gap-3">
                      <button type="button" onClick={handleReturnAsset} className="btn btn-outline text-sm">
                        <Undo2 size={16} /> Mark Returned & Available
                      </button>
                      <button type="submit" className="btn btn-primary w-full sm:w-auto">
                        Approve & Re-allocate
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <form onSubmit={handleAllocateDirect} className="flex flex-col gap-5">
                    <h3 className="font-bold text-lg flex items-center gap-2 m-0 text-text-primary">
                      <Check size={18} className="text-alert-success" /> Allocate Available Asset
                    </h3>

                    <div>
                      <label className="label">Assign To Employee / Department</label>
                      <select className="select max-w-md" required value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                        <option value="">Select Employee...</option>
                        {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                      </select>
                    </div>

                    <div className="mt-2 pt-4 border-t border-border-color">
                      <button type="submit" className="btn btn-primary">
                        Allocate Asset Now
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="card h-full">
              <h3 className="font-bold text-sm mb-5 text-text-secondary uppercase tracking-wider m-0">Recent Actions</h3>
              <ul className="list-none text-sm text-text-primary space-y-4 m-0 p-0 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-color pl-6">
                
                <li className="relative">
                  <div className="absolute w-3 h-3 bg-accent-primary rounded-full -left-[1.35rem] top-1.5 border-2 border-bg-secondary"></div>
                  <div className="font-medium">Recent items will appear here after actions are taken.</div>
                </li>
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
                          <button className="btn btn-outline border-alert-success text-alert-success hover:bg-alert-success hover:text-white py-1 px-3 text-xs">Approve</button>
                          <button className="btn btn-outline border-alert-danger text-alert-danger hover:bg-alert-danger hover:text-white py-1 px-3 text-xs">Reject</button>
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
