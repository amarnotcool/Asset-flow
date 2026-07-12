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

  const thClass = 'p-4 text-xs uppercase text-text-secondary font-semibold border-b border-border-color';
  const tdClass = 'p-4 text-sm border-b border-border-color text-text-primary align-middle';

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Asset Directory</h1>
          <p className="text-sm text-text-secondary mt-1">Search, track, and manage all physical assets across locations</p>
        </div>
        <button onClick={() => setIsRegisterModalOpen(true)} className="btn btn-primary cursor-pointer">
          <Plus size={16} /> Register Asset
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 gap-2 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by tag (e.g. AF-0114), asset name, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className="select w-auto text-sm py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="select w-auto text-sm py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>

            {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('All');
                  setStatusFilter('All');
                }}
                className="btn btn-outline text-xs py-2 px-3 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={thClass}>Asset Tag</th>
                <th className={thClass}>Name</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Current Holder</th>
                <th className={thClass}>Location</th>
                <th className={thClass}>Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-black/[0.01]">
                    <td className={tdClass}>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-accent-primary">
                        <QrCode size={14} /> {asset.tag}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <strong>{asset.name}</strong>
                    </td>
                    <td className={tdClass}>{asset.category}</td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          asset.status === 'Available'
                            ? 'bg-alert-success-bg text-alert-success'
                            : asset.status === 'Allocated'
                            ? 'bg-[#e0f2fe] text-accent-primary'
                            : 'bg-alert-warning-bg text-alert-warning'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className={tdClass}>{asset.holder || '--'}</td>
                    <td className={tdClass}>{asset.location}</td>
                    <td className={tdClass}>{asset.condition}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-bg-secondary rounded-xl shadow-xl max-w-md w-full p-6 border border-border-color">
            <h3 className="text-lg font-bold mb-4">Register New Asset</h3>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">Asset Name / Model</label>
                <input
                  ref={registerNameRef}
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. ThinkPad X1 Carbon"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  className="select"
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. HQ - Floor 3 / Desk 12"
                  value={assetLocation}
                  onChange={(e) => setAssetLocation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Acquisition Cost</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="$1,200"
                    value={assetCost}
                    onChange={(e) => setAssetCost(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Initial Condition</label>
                  <select
                    className="select"
                    value={assetCondition}
                    onChange={(e) => setAssetCondition(e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="btn btn-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary cursor-pointer">
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDirectory;
