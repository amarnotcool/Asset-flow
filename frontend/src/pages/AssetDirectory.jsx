import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, QrCode, X, Calendar, Wrench, ArrowRightLeft, Building2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
const AssetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null); // For drawer

  // Register form state
  const [assetName, setAssetName] = useState('');
  const [assetCategoryId, setAssetCategoryId] = useState('');
  const [assetLocation, setAssetLocation] = useState('');
  const [assetCost, setAssetCost] = useState('');
  const [assetCondition, setAssetCondition] = useState('New');
  const [assetSerial, setAssetSerial] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [isShared, setIsShared] = useState(false);

  const searchInputRef = useRef(null);
  const registerNameRef = useRef(null);

  const { assets, categories, registerAsset, syncBackendData, allocationHistory, maintenanceTickets } = useAppStore();
  const { user } = useAuthStore();
  
  const canRegister = ['Admin', 'Asset Manager'].includes(user?.role);

  useEffect(() => {
    syncBackendData();
  }, []);

  useEffect(() => {
    if (isRegisterModalOpen) {
      setTimeout(() => registerNameRef.current?.focus(), 50);
    }
  }, [isRegisterModalOpen]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (assetName.trim()) {
      try {
        await registerAsset({
          name: assetName.trim(),
          category_id: assetCategoryId || null,
          location: assetLocation.trim() || 'HQ - Storage',
          acquisition_cost: assetCost ? parseFloat(assetCost) : null,
          condition: assetCondition,
          serial_number: assetSerial.trim() || null,
          is_shared: isShared,
          acquisition_date: acquisitionDate || new Date().toISOString().split('T')[0],
        });
        setIsRegisterModalOpen(false);
        resetForm();
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to register asset');
      }
    }
  };

  const resetForm = () => {
    setAssetName(''); setAssetLocation(''); setAssetCost('');
    setAssetSerial(''); setAcquisitionDate(''); setIsShared(false);
    setAssetCondition('New'); setAssetCategoryId('');
  };

  const filteredAssets = assets.filter((asset) => {
    // If Employee, only show tools they hold
    if (user?.role === 'Employee' && asset.holder_id !== user.id) {
      return false;
    }
    // If Department Head, theoretically show department assets, but for now we filter by role rules
    // (We'll add Department Head logic later if a user has a department_id, but spec says Employee only sees their own)
    
    // Additional filter logic for Dept Head could go here. 
    // Spec says Dept Head views assets allocated to their department.
    if (user?.role === 'Department Head' && user.department_id) {
        // Need to know department allocation. Wait, asset has `holder_id`, which maps to user.
        // We'll trust the store for now, or just show all if no dept field on asset.
    }

    const matchesSearch =
      (asset.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.asset_tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || asset.category_name === categoryFilter;
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': return 'badge-success';
      case 'Allocated': return 'badge-info';
      case 'Under Maintenance': return 'badge-warning';
      case 'Reserved': return 'badge-neutral';
      case 'Lost': case 'Retired': case 'Disposed': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  // Helper for drawer
  const getAssetHistory = (tag) => {
    return [
      ...allocationHistory.filter(h => h.assetTag === tag).map(h => ({ type: 'allocation', date: h.allocatedDate, data: h })),
      ...maintenanceTickets.filter(t => t.asset === tag).map(t => ({ type: 'maintenance', date: t.requestDate, data: t }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="flex flex-col relative h-full">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Asset Directory</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Search, track, and manage all physical assets across locations</p>
        </div>
        {canRegister && (
          <button onClick={() => setIsRegisterModalOpen(true)} className="btn btn-primary whitespace-nowrap">
            <Plus size={16} /> Register Asset
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 gap-2 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by tag (e.g. AF-0114), asset name, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-11 py-2.5 w-full max-w-lg"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <select className="select w-auto min-w-[140px]" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
            </select>
            <select className="select w-auto min-w-[140px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <optgroup label="Active">
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Reserved">Reserved</option>
              </optgroup>
              <optgroup label="Unavailable">
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Lost">Lost</option>
                <option value="Retired">Retired</option>
                <option value="Disposed">Disposed</option>
              </optgroup>
            </select>
            {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
              <button onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setStatusFilter('All'); }} className="btn btn-outline text-xs px-3">Clear Filters</button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left m-0">
            <thead>
              <tr>
                <th className="th">Asset Tag</th>
                <th className="th">Name</th>
                <th className="th">Category</th>
                <th className="th">Status</th>
                <th className="th">Current Holder</th>
                <th className="th">Location</th>
                <th className="th">Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} onClick={() => setSelectedAsset(asset)} className="hover:bg-bg-primary/50 transition-colors cursor-pointer group">
                    <td className="td">
                      <span className="inline-flex items-center gap-1.5 font-bold text-accent-primary group-hover:underline">
                        <QrCode size={14} /> {asset.asset_tag}
                      </span>
                    </td>
                    <td className="td font-semibold text-text-primary">{asset.name} {asset.is_shared && <span className="badge badge-info ml-2 text-[10px] py-0">Shared</span>}</td>
                    <td className="td text-text-secondary">{asset.category_name || '—'}</td>
                    <td className="td"><span className={`badge ${getStatusBadge(asset.status)}`}>{asset.status}</span></td>
                    <td className="td text-text-primary">{asset.holder_name || '—'}</td>
                    <td className="td text-text-secondary">{asset.location || '—'}</td>
                    <td className="td text-text-primary">
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-bg-primary text-text-secondary border border-border-color">
                        {asset.condition || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary text-sm">
                    {assets.length === 0 ? 'No assets registered yet. Click "Register Asset" to add your first one.' : 'No assets found matching your filter criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ASSET DETAIL DRAWER ===== */}
      {selectedAsset && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedAsset(null)}></div>

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-bg-secondary border-l border-border-color shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-border-color flex justify-between items-center bg-bg-primary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center"><QrCode size={20} /></div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary m-0">{selectedAsset.asset_tag}</h3>
                  <p className="text-sm text-text-secondary m-0">{selectedAsset.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="btn btn-outline border-0 p-2 text-text-secondary hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 custom-scrollbar">

              {/* Core Details */}
              <div>
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Asset Details</h4>
                <div className="bg-bg-primary border border-border-color rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-text-secondary mb-1">Status</span>
                    <span className={`badge ${getStatusBadge(selectedAsset.status)}`}>{selectedAsset.status}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary mb-1">Condition</span>
                    <span className="font-semibold text-text-primary">{selectedAsset.condition || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary mb-1">Location</span>
                    <span className="font-semibold text-text-primary">{selectedAsset.location || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary mb-1">Current Holder</span>
                    <span className="font-semibold text-text-primary">{selectedAsset.holder_name || '—'}</span>
                  </div>
                  <div className="col-span-2 border-t border-border-color pt-3 mt-1"></div>
                  <div>
                    <span className="block text-text-secondary mb-1">Category</span>
                    <span className="font-semibold text-text-primary">{selectedAsset.category_name || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary mb-1">Shared Resource</span>
                    <span className="font-semibold text-text-primary">{selectedAsset.is_shared ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary mb-1">Serial Number</span>
                    <span className="font-semibold text-text-primary">{selectedAsset.serial_number || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-text-secondary mb-1">Acquisition</span>
                    <span className="font-semibold text-text-primary">{selectedAsset.acquisition_date || '—'}</span>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div>
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex justify-between items-center">
                  <span>Lifecycle History</span>
                  <span className="badge badge-neutral text-[10px]">{getAssetHistory(selectedAsset.asset_tag).length} records</span>
                </h4>

                <div className="relative pl-6">
                  {/* Vertical Line */}
                  <div className="absolute left-[0.55rem] top-2 bottom-0 w-px bg-border-color"></div>

                  {getAssetHistory(selectedAsset.asset_tag).length > 0 ? (
                    <div className="flex flex-col gap-5">
                      {getAssetHistory(selectedAsset.asset_tag).map((record, idx) => (
                        <div key={idx} className="relative">
                          {/* Dot */}
                          <div className={`absolute -left-[1.8rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-bg-secondary ${record.type === 'allocation' ? 'bg-accent-primary' : 'bg-alert-warning'}`}></div>

                          {/* Content */}
                          <div className="bg-bg-primary border border-border-color rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                {record.type === 'allocation' ? <ArrowRightLeft size={12} className="text-accent-primary" /> : <Wrench size={12} className="text-alert-warning" />}
                                {record.type === 'allocation' ? 'Allocation Update' : 'Maintenance Ticket'}
                              </span>
                              <span className="text-[10px] text-text-secondary font-medium flex items-center gap-1">
                                <Calendar size={10} /> {record.date}
                              </span>
                            </div>

                            {record.type === 'allocation' ? (
                              <div className="text-xs text-text-secondary">
                                <p className="mb-1"><strong>Action:</strong> <span className={`badge ${record.data.status === 'Active' ? 'badge-info' : 'badge-neutral'} px-1.5 py-0`}>{record.data.status}</span></p>
                                <p className="mb-1"><strong>User:</strong> {record.data.user} {record.data.department !== '--' ? `(${record.data.department})` : ''}</p>
                                {record.data.status === 'Returned' && <p><strong>Returned on:</strong> {record.data.returnedDate} <br /> <strong>Notes:</strong> {record.data.conditionNotes || 'None'}</p>}
                                {record.data.status === 'Active' && record.data.expectedReturn && <p><strong>Expected Return:</strong> {record.data.expectedReturn}</p>}
                              </div>
                            ) : (
                              <div className="text-xs text-text-secondary">
                                <p className="mb-1"><strong>Issue:</strong> {record.data.title}</p>
                                <p className="mb-1"><strong>Status:</strong> <span className={`badge ${record.data.status === 'Pending' ? 'badge-warning' : record.data.status === 'Resolved' ? 'badge-success' : 'badge-neutral'} px-1.5 py-0`}>{record.data.status}</span></p>
                                {record.data.technician && <p><strong>Technician:</strong> {record.data.technician}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary italic">No history records found for this asset.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ===== REGISTER MODAL ===== */}
      {isRegisterModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card max-w-lg">
            <h3 className="text-xl font-bold mb-6 text-text-primary flex items-center gap-2">
              <QrCode className="text-accent-primary" size={22} /> Register New Asset
            </h3>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg border border-alert-danger bg-alert-danger-bg text-alert-danger font-semibold text-xs">{errorMsg}</div>
            )}

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Asset Name / Model</label>
                  <input ref={registerNameRef} type="text" className="input" required placeholder="e.g. ThinkPad X1 Carbon" value={assetName} onChange={e => setAssetName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="select" value={assetCategoryId} onChange={e => setAssetCategoryId(e.target.value)}>
                    <option value="">No Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input type="text" className="input" placeholder="e.g. HQ - Floor 3" value={assetLocation} onChange={e => setAssetLocation(e.target.value)} />
                </div>
                <div>
                  <label className="label">Serial Number</label>
                  <input type="text" className="input" placeholder="e.g. SN-12345ABC" value={assetSerial} onChange={e => setAssetSerial(e.target.value)} />
                </div>
                <div>
                  <label className="label">Acquisition Date</label>
                  <input type="date" className="input" value={acquisitionDate} onChange={e => setAcquisitionDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Acquisition Cost</label>
                  <input type="number" step="0.01" className="input" placeholder="1200.00" value={assetCost} onChange={e => setAssetCost(e.target.value)} />
                </div>
                <div>
                  <label className="label">Initial Condition</label>
                  <select className="select" value={assetCondition} onChange={e => setAssetCondition(e.target.value)}>
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 p-3 bg-bg-primary rounded-lg border border-border-color">
                <input type="checkbox" id="isShared" className="w-4 h-4 rounded border-border-color accent-accent-primary" checked={isShared} onChange={e => setIsShared(e.target.checked)} />
                <label htmlFor="isShared" className="text-sm font-medium text-text-primary cursor-pointer">
                  Mark as Shared Resource
                  <span className="block text-xs text-text-secondary font-normal">Shared resources can be booked by employees in the Resource Booking module.</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-border-color">
                <button type="button" onClick={() => { setIsRegisterModalOpen(false); setErrorMsg(null); }} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDirectory;
