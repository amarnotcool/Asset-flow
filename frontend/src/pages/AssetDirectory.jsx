import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, QrCode } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const AssetDirectory = () => {
  // Simple action-oriented useState variables
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Electronics');
  const [assetLocation, setAssetLocation] = useState('');
  const [assetCost, setAssetCost] = useState('');
  const [assetCondition, setAssetCondition] = useState('New');

  const searchInputRef = useRef(null);
  const registerNameRef = useRef(null);

  const { assets, categories, registerAsset } = useAppStore();

  // useEffect + useRef: Auto-focus register input when register modal opens
  useEffect(() => {
    if (isRegisterModalOpen) {
      registerNameRef.current?.focus();
    }
  }, [isRegisterModalOpen]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (assetName.trim()) {
      const randomTag = `AF-${Math.floor(1000 + Math.random() * 9000)}`;
      registerAsset({
        tag: randomTag,
        name: assetName.trim(),
        category: assetCategory,
        location: assetLocation.trim() || 'HQ - Storage',
        cost: assetCost.trim() || '$500',
        condition: assetCondition,
      });
      setIsRegisterModalOpen(false);
      setAssetName('');
      setAssetLocation('');
      setAssetCost('');
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Asset Directory</h1>
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
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select className="select w-auto min-w-[140px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>

            {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setStatusFilter('All'); }}
                className="btn btn-outline text-xs px-3"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

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
                  <tr key={asset.id} className="hover:bg-black/[0.01]">
                    <td className="td">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-accent-primary">
                        <QrCode size={14} /> {asset.tag}
                      </span>
                    </td>
                    <td className="td"><strong>{asset.name}</strong></td>
                    <td className="td">{asset.category}</td>
                    <td className="td">
                      <span className={`badge ${
                        asset.status === 'Available' ? 'badge-success' : 
                        asset.status === 'Allocated' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="td">{asset.holder || '--'}</td>
                    <td className="td">{asset.location}</td>
                    <td className="td">{asset.condition}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary">
                    No assets found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-text-primary">Register New Asset</h3>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Asset Name / Model</label>
                <input ref={registerNameRef} type="text" className="input" required placeholder="e.g. ThinkPad X1 Carbon" value={assetName} onChange={e => setAssetName(e.target.value)} />
              </div>

              <div>
                <label className="label">Category</label>
                <select className="select" value={assetCategory} onChange={e => setAssetCategory(e.target.value)}>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Location</label>
                <input type="text" className="input" placeholder="e.g. HQ - Floor 3 / Desk 12" value={assetLocation} onChange={e => setAssetLocation(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Acquisition Cost</label>
                  <input type="text" className="input" placeholder="$1,200" value={assetCost} onChange={e => setAssetCost(e.target.value)} />
                </div>
                <div>
                  <label className="label">Initial Condition</label>
                  <select className="select" value={assetCondition} onChange={e => setAssetCondition(e.target.value)}>
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-color">
                <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="btn btn-outline">Cancel</button>
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
