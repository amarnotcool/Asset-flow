import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, QrCode } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const AssetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [assetName, setAssetName] = useState('');
  const [assetCategoryId, setAssetCategoryId] = useState('');
  const [assetLocation, setAssetLocation] = useState('');
  const [assetCost, setAssetCost] = useState('');
  const [assetCondition, setAssetCondition] = useState('New');
  const [assetSerial, setAssetSerial] = useState('');

  const searchInputRef = useRef(null);
  const registerNameRef = useRef(null);

  const { assets, categories, registerAsset, syncBackendData } = useAppStore();

  useEffect(() => {
    syncBackendData();
  }, []);

  useEffect(() => {
    if (isRegisterModalOpen) registerNameRef.current?.focus();
  }, [isRegisterModalOpen]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (assetName.trim()) {
      try {
        await registerAsset({
          name: assetName.trim(),
          category_id: assetCategoryId || null,
          location: assetLocation.trim() || null,
          acquisition_cost: assetCost ? parseFloat(assetCost) : null,
          condition: assetCondition,
          serial_number: assetSerial.trim() || null,
        });
        setIsRegisterModalOpen(false);
        setAssetName('');
        setAssetLocation('');
        setAssetCost('');
        setAssetSerial('');
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to register asset');
      }
    }
  };

  const filteredAssets = assets.filter((asset) => {
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
      case 'Available': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Allocated': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Under Maintenance': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Reserved': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="flex flex-col">
      <div className="card flex justify-between items-center mb-6 shrink-0 flex-row">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Asset Directory</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Search, track, and manage all physical assets across locations</p>
        </div>
        <button onClick={() => setIsRegisterModalOpen(true)} className="btn btn-primary whitespace-nowrap">
          <Plus size={16} /> Register Asset
        </button>
      </div>

      <div className="card mb-6 p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 gap-2 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input ref={searchInputRef} type="text" placeholder="Search by tag, asset name, or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-11 py-2.5 w-full max-w-lg" />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <select className="select w-auto min-w-[140px]" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
            </select>
            <select className="select w-auto min-w-[140px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>
            {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
              <button onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setStatusFilter('All'); }} className="btn btn-outline text-xs px-3">Clear Filters</button>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left m-0">
            <thead>
              <tr className="bg-bg-secondary border-b border-border-color">
                <th className="th py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Asset Tag</th>
                <th className="th py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                <th className="th py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Category</th>
                <th className="th py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="th py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Current Holder</th>
                <th className="th py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Location</th>
                <th className="th py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-bg-secondary/40 transition-colors border-b border-border-color last:border-b-0">
                    <td className="td py-3 px-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 font-bold text-accent-primary"><QrCode size={14} /> {asset.asset_tag}</span>
                    </td>
                    <td className="td py-3 px-4 text-sm font-semibold text-text-primary">{asset.name}</td>
                    <td className="td py-3 px-4 text-sm text-text-secondary">{asset.category_name || '—'}</td>
                    <td className="td py-3 px-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(asset.status)}`}>{asset.status}</span>
                    </td>
                    <td className="td py-3 px-4 text-sm text-text-primary">{asset.holder_name || '—'}</td>
                    <td className="td py-3 px-4 text-sm text-text-secondary">{asset.location || '—'}</td>
                    <td className="td py-3 px-4 text-sm text-text-primary">
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">{asset.condition || '—'}</span>
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

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="card max-w-md w-full shadow-lg border border-border-color bg-bg-secondary p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-6 text-text-primary">Register New Asset</h3>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg border border-alert-danger bg-alert-danger-bg text-alert-danger font-semibold text-xs">{errorMsg}</div>
            )}

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div>
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
                <label className="label">Serial Number</label>
                <input type="text" className="input" placeholder="e.g. SN-2024-XYZ" value={assetSerial} onChange={e => setAssetSerial(e.target.value)} />
              </div>
              <div>
                <label className="label">Location</label>
                <input type="text" className="input" placeholder="e.g. HQ - Floor 3 / Desk 12" value={assetLocation} onChange={e => setAssetLocation(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-color">
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
