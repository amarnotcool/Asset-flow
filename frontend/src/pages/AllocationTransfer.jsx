import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, ArrowRightLeft, Undo2, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const AllocationTransfer = () => {
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { assets, employees, allocations, allocateAsset, returnAsset, transferAsset, syncBackendData } = useAppStore();

  useEffect(() => { syncBackendData(); }, []);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const foundAsset = assets.find(a => a.id === selectedAssetId);
  const isConflict = foundAsset && foundAsset.status === 'Allocated';

  const handleAllocateDirect = async (e) => {
    e.preventDefault();
    if (!foundAsset || !selectedEmployeeId) return;
    setLoading(true);
    try {
      await allocateAsset({ asset_id: foundAsset.id, user_id: parseInt(selectedEmployeeId) });
      setActionMessage({ type: 'success', text: `Asset ${foundAsset.asset_tag} successfully allocated.` });
      setSelectedEmployeeId('');
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Allocation failed' });
    }
    setLoading(false);
  };

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    if (!foundAsset || !selectedEmployeeId) return;
    setLoading(true);
    try {
      await transferAsset({
        asset_id: foundAsset.id,
        from_user_id: foundAsset.holder_id,
        to_user_id: parseInt(selectedEmployeeId),
        reason: transferReason || 'Transfer Request',
      });
      setActionMessage({ type: 'success', text: `Transfer completed for ${foundAsset.asset_tag}.` });
      setSelectedEmployeeId('');
      setTransferReason('');
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Transfer failed' });
    }
    setLoading(false);
  };

  const handleReturnAsset = async () => {
    if (!foundAsset) return;
    setLoading(true);
    try {
      await returnAsset(foundAsset.id);
      setActionMessage({ type: 'success', text: `Asset ${foundAsset.asset_tag} returned. Status reverted to Available.` });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Return failed' });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-text-primary mb-2 m-0">Asset Allocation & Transfer</h1>
      <p className="text-sm text-text-secondary mb-6 m-0">Allocate available assets, submit transfer requests for held assets, or process asset returns</p>

      {actionMessage && (
        <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-danger'} mb-6 justify-between`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="btn btn-outline border-0 p-1 bg-transparent hover:bg-transparent">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-text-primary m-0">1. Select Asset</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {assets.map(a => (
                <button key={a.id} type="button" onClick={() => { setSelectedAssetId(a.id); setActionMessage(null); }}
                  className={`pill ${selectedAssetId === a.id ? 'active' : ''}`}>
                  {a.asset_tag} ({a.status})
                </button>
              ))}
              {assets.length === 0 && <p className="text-sm text-text-secondary">No assets registered yet.</p>}
            </div>

            {foundAsset && (
              <div className="mt-4 p-4 rounded-xl bg-bg-primary border border-border-color text-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="font-bold text-text-primary text-base">{foundAsset.name}</span>
                  <span className="text-text-secondary ml-2">• {foundAsset.category_name || 'Uncategorized'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">Status:</span>
                  <span className={`badge ${foundAsset.status === 'Available' ? 'badge-success' : 'badge-info'}`}>{foundAsset.status}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            {!foundAsset ? (
              <div className="p-8 text-center text-text-secondary flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl">
                <ArrowRightLeft size={32} className="mb-3 text-border-color" />
                <p className="m-0">Select an asset above to proceed.</p>
              </div>
            ) : isConflict ? (
              <div>
                <div className="alert alert-danger mb-6">
                  <AlertCircle size={20} className="shrink-0" />
                  <div>
                    <strong>Already allocated to {foundAsset.holder_name || 'someone'}</strong><br/>
                    Direct allocation is blocked. Use the Transfer Request below or return the asset first.
                  </div>
                </div>
                <form onSubmit={handleTransferRequest} className="flex flex-col gap-5">
                  <h3 className="font-bold text-lg flex items-center gap-2 m-0 text-text-primary">
                    <ArrowRightLeft size={18} className="text-accent-primary" /> Submit Transfer Request
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="label">Current Holder (From)</label>
                      <input type="text" className="input bg-[#f1f5f9] text-text-secondary cursor-not-allowed" value={foundAsset.holder_name || '—'} disabled readOnly />
                    </div>
                    <div>
                      <label className="label">Transfer To Employee</label>
                      <select className="select" required value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
                        <option value="">Select Employee...</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.department_name || emp.role})</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Transfer Reason</label>
                    <textarea className="input" rows={2} placeholder="e.g. Project reassignment" value={transferReason} onChange={(e) => setTransferReason(e.target.value)} />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-2 pt-4 border-t border-border-color gap-3">
                    <button type="button" onClick={handleReturnAsset} disabled={loading} className="btn btn-outline text-sm">
                      <Undo2 size={16} /> Mark Returned & Available
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto">
                      {loading ? 'Processing...' : 'Approve & Re-allocate'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <form onSubmit={handleAllocateDirect} className="flex flex-col gap-5">
                  <h3 className="font-bold text-lg flex items-center gap-2 m-0 text-text-primary">
                    <Check size={18} className="text-alert-success" /> Allocate Available Asset
                  </h3>
                  <div>
                    <label className="label">Assign To Employee</label>
                    <select className="select max-w-md" required value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
                      <option value="">Select Employee...</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.department_name || emp.role})</option>)}
                    </select>
                  </div>
                  <div className="mt-2 pt-4 border-t border-border-color">
                    <button type="submit" disabled={loading} className="btn btn-primary">
                      {loading ? 'Allocating...' : 'Allocate Asset Now'}
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
            {allocations.length > 0 ? (
              <ul className="list-none text-sm text-text-primary space-y-4 m-0 p-0 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-color pl-6">
                {allocations.slice(0, 5).map((a) => (
                  <li key={a.id} className="relative">
                    <div className={`absolute w-3 h-3 rounded-full -left-[1.35rem] top-1.5 border-2 border-bg-secondary ${a.status === 'Active' ? 'bg-accent-primary' : a.status === 'Returned' ? 'bg-alert-success' : 'bg-text-secondary'}`}></div>
                    <div className="font-medium"><strong>{a.asset_tag}</strong> {a.asset_name} → {a.user_name}</div>
                    <div className="text-xs text-text-secondary mt-1">{new Date(a.allocated_date).toLocaleDateString()} • {a.status}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary m-0">No allocation history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationTransfer;
