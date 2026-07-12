import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ArrowRightLeft, Undo2, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const AllocationTransfer = () => {
  // Simple action-oriented useState variables
  const [assetTagInput, setAssetTagInput] = useState('AF-0114');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const { assets, employees, allocateAsset, returnAsset } = useAppStore();

  const foundAsset = assets.find(
    (a) => a.tag.toUpperCase() === assetTagInput.trim().toUpperCase()
  );

  const isConflict = foundAsset && foundAsset.status === 'Allocated';

  const handleAllocateDirect = (e) => {
    e.preventDefault();
    if (foundAsset && selectedEmployee) {
      allocateAsset(foundAsset.tag, selectedEmployee);
      setActionMessage({
        type: 'success',
        text: `Asset ${foundAsset.tag} successfully allocated to ${selectedEmployee}.`,
      });
      setSelectedEmployee('');
    }
  };

  const handleTransferRequest = (e) => {
    e.preventDefault();
    if (foundAsset && selectedEmployee) {
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
      <h1 className="text-2xl font-bold text-text-primary mb-2">Asset Allocation & Transfer</h1>
      <p className="text-sm text-text-secondary mb-6">
        Allocate available assets, submit transfer requests for held assets, or process asset returns
      </p>

      {actionMessage && (
        <div
          className={`p-4 rounded-lg text-sm border-l-4 mb-6 flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-alert-success-bg text-alert-success border-l-alert-success'
              : 'bg-alert-warning-bg text-alert-warning border-l-alert-warning'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">1. Select or Enter Asset Tag</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {assets.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setAssetTagInput(a.tag);
                    setActionMessage(null);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                    assetTagInput.toUpperCase() === a.tag.toUpperCase()
                      ? 'bg-[#e0f2fe] text-accent-primary border-accent-primary font-bold'
                      : 'bg-bg-primary border-border-color text-text-primary hover:bg-black/5'
                  }`}
                >
                  {a.tag} ({a.status})
                </button>
              ))}
            </div>

            <div>
              <label className="label">Asset Tag Lookup</label>
              <input
                type="text"
                className="input max-w-sm"
                placeholder="e.g. AF-0114"
                value={assetTagInput}
                onChange={(e) => {
                  setAssetTagInput(e.target.value);
                  setActionMessage(null);
                }}
              />
            </div>

            {foundAsset && (
              <div className="mt-4 p-4 rounded-lg bg-bg-primary border border-border-color text-sm flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-text-primary">{foundAsset.name}</span>
                  <span className="text-text-secondary"> • {foundAsset.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Current Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      foundAsset.status === 'Available'
                        ? 'bg-alert-success-bg text-alert-success'
                        : 'bg-[#e0f2fe] text-accent-primary'
                    }`}
                  >
                    {foundAsset.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Allocation / Transfer Section */}
          <div className="card">
            {!foundAsset ? (
              <p className="text-sm text-text-secondary p-4 text-center">
                Enter or select a valid asset tag above to proceed.
              </p>
            ) : isConflict ? (
              <div>
                <div className="p-4 rounded-lg text-sm border-l-4 bg-alert-danger-bg text-alert-danger border-l-alert-danger flex items-center gap-3 mb-6">
                  <AlertCircle size={20} className="shrink-0" />
                  <div>
                    <strong>Already allocated to {foundAsset.holder}</strong>
                    <br />
                    Direct allocation is blocked to prevent double-allocation. Use the Transfer Request below or return the asset first.
                  </div>
                </div>

                <form onSubmit={handleTransferRequest} className="flex flex-col gap-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ArrowRightLeft size={18} className="text-accent-primary" /> Submit Transfer Request
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Current Holder (From)</label>
                      <input
                        type="text"
                        className="input bg-bg-primary text-text-secondary cursor-not-allowed"
                        value={foundAsset.holder}
                        disabled
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="label">Transfer To Employee</label>
                      <select
                        className="select"
                        required
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                      >
                        <option value="">Select Employee...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.name}>
                            {emp.name} ({emp.dept})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Transfer Reason</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="e.g. Project reassignment or department transfer"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      onClick={handleReturnAsset}
                      className="btn btn-outline text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Undo2 size={14} /> Mark Returned & Available
                    </button>
                    <button type="submit" className="btn btn-primary cursor-pointer">
                      Approve & Re-allocate
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleAllocateDirect} className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Check size={18} className="text-alert-success" /> Allocate Available Asset
                </h3>

                <div>
                  <label className="label">Assign To Employee / Department</label>
                  <select
                    className="select max-w-md"
                    required
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.dept})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <button type="submit" className="btn btn-primary cursor-pointer">
                    Allocate Asset Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* History / Info Column */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 className="font-semibold text-sm mb-4 text-text-secondary uppercase">
              Allocation & Transfer History
            </h3>
            <ul className="list-none text-sm text-text-primary space-y-3">
              <li className="pb-3 border-b border-border-color">
                <strong>AF-0114</strong> allocated to Priya Shah (Engineering)
                <div className="text-xs text-text-secondary mt-0.5">Mar 12, 2026 • Approved by Admin</div>
              </li>
              <li className="pb-3 border-b border-border-color">
                <strong>AF-0062</strong> allocated to Facilities Dept
                <div className="text-xs text-text-secondary mt-0.5">Feb 20, 2026 • Approved by A. Rao</div>
              </li>
              <li>
                <strong>AF-0201</strong> returned & inspected
                <div className="text-xs text-text-secondary mt-0.5">Jan 04, 2026 • Condition: Excellent</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationTransfer;
