import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, ArrowRightLeft, Undo2, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { operationsApi } from '../api';

const AllocationTransfer = () => {
  // Simple action-oriented useState variables
  const [assetTagInput, setAssetTagInput] = useState('AF-0114');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const tagInputRef = useRef(null);
  const { assets, employees, allocateAsset, returnAsset } = useAppStore();

  // useEffect + useRef: Auto-dismiss messages after 6 seconds
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
      } catch {
        // Fallback local update
      }
      allocateAsset(foundAsset.tag, selectedEmployee);
      setActionMessage({
        type: 'success',
        text: `Asset ${foundAsset.tag} successfully allocated to ${selectedEmployee}.`,
      });
      setSelectedEmployee('');
    }
  };

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    if (foundAsset && selectedEmployee) {
      try {
        await operationsApi.allocateAsset({
          assetTag: foundAsset.tag,
          fromUser: foundAsset.holder,
          toUser: selectedEmployee,
          reason: transferReason || 'Transfer Request',
        });
      } catch {
        // Fallback
      }
      allocateAsset(foundAsset.tag, selectedEmployee);
      setActionMessage({
        type: 'success',
        text: `Transfer request approved: ${foundAsset.tag} re-allocated to ${selectedEmployee}.`,
      });
      setSelectedEmployee('');
      setTransferReason('');
    }
  };

  const handleReturnAsset = () => {
    if (foundAsset) {
      returnAsset(foundAsset.tag);
      setActionMessage({
        type: 'success',
        text: `Asset ${foundAsset.tag} returned and checked in. Status reverted to Available.`,
      });
    }
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-text-primary mb-2 m-0">Asset Allocation & Transfer</h1>
      <p className="text-sm text-text-secondary mb-6 m-0">Allocate available assets, submit transfer requests for held assets, or process asset returns</p>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-text-primary m-0">1. Select or Enter Asset Tag</h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {assets.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => { setAssetTagInput(a.tag); setActionMessage(null); tagInputRef.current?.focus(); }}
                  className={`pill ${assetTagInput.toUpperCase() === a.tag.toUpperCase() ? 'active' : ''}`}
                >
                  {a.tag} ({a.status})
                </button>
              ))}
            </div>

            <div className="mb-2">
              <label className="label">Asset Tag Lookup</label>
              <input ref={tagInputRef} type="text" className="input max-w-sm" placeholder="e.g. AF-0114" value={assetTagInput} onChange={(e) => { setAssetTagInput(e.target.value); setActionMessage(null); }} />
            </div>

            {foundAsset && (
              <div className="mt-4 p-4 rounded-xl bg-bg-primary border border-border-color text-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="font-bold text-text-primary text-base">{foundAsset.name}</span>
                  <span className="text-text-secondary ml-2">• {foundAsset.category}</span>
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
                    <strong>Already allocated to {foundAsset.holder}</strong><br/>
                    Direct allocation is blocked to prevent double-allocation. Use the Transfer Request below or return the asset first.
                  </div>
                </div>

                <form onSubmit={handleTransferRequest} className="flex flex-col gap-5">
                  <h3 className="font-bold text-lg flex items-center gap-2 m-0 text-text-primary">
                    <ArrowRightLeft size={18} className="text-accent-primary" /> Submit Transfer Request
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="label">Current Holder (From)</label>
                      <input type="text" className="input bg-[#f1f5f9] text-text-secondary cursor-not-allowed" value={foundAsset.holder} disabled readOnly />
                    </div>
                    <div>
                      <label className="label">Transfer To Employee</label>
                      <select className="select" required value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                        <option value="">Select Employee...</option>
                        {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
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
                      {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
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
            <h3 className="font-bold text-sm mb-5 text-text-secondary uppercase tracking-wider m-0">Allocation & Transfer History</h3>
            <ul className="list-none text-sm text-text-primary space-y-4 m-0 p-0 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-color pl-6">
              
              <li className="relative">
                <div className="absolute w-3 h-3 bg-accent-primary rounded-full -left-[1.35rem] top-1.5 border-2 border-bg-secondary"></div>
                <div className="font-medium"><strong>AF-0114</strong> allocated to Priya Shah (Engineering)</div>
                <div className="text-xs text-text-secondary mt-1">Mar 12, 2026 • Approved by Admin</div>
              </li>
              
              <li className="relative">
                <div className="absolute w-3 h-3 bg-text-secondary rounded-full -left-[1.35rem] top-1.5 border-2 border-bg-secondary"></div>
                <div className="font-medium"><strong>AF-0062</strong> allocated to Facilities Dept</div>
                <div className="text-xs text-text-secondary mt-1">Feb 20, 2026 • Approved by A. Rao</div>
              </li>

              <li className="relative">
                <div className="absolute w-3 h-3 bg-alert-success rounded-full -left-[1.35rem] top-1.5 border-2 border-bg-secondary"></div>
                <div className="font-medium"><strong>AF-0201</strong> returned & inspected</div>
                <div className="text-xs text-text-secondary mt-1">Jan 04, 2026 • Condition: Excellent</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationTransfer;
