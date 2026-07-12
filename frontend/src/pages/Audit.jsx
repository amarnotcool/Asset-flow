import React, { useState, useEffect, useRef } from 'react';
import { Plus, AlertCircle, CheckCircle, ShieldCheck, Lock, ChevronDown, ChevronRight, FileWarning, ClipboardCheck, Calendar, Users, Search } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const Audit = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedCycleId, setExpandedCycleId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showReport, setShowReport] = useState(null); // cycleId for discrepancy report
  const titleInputRef = useRef(null);

  // Create Audit form
  const [cycleTitle, setCycleTitle] = useState('');
  const [scopeType, setScopeType] = useState('department');
  const [scopeValue, setScopeValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAuditors, setSelectedAuditors] = useState([]);

  const {
    audits, departments, employees, assets,
    createAudit, updateAuditItemStatus, closeAuditCycle, syncBackendData
  } = useAppStore();
  const { user } = useAuthStore();
  const canManageAudit = ['Admin', 'Asset Manager'].includes(user?.role);

  useEffect(() => { syncBackendData(); }, []);

  // Auto-expand the first open cycle
  useEffect(() => {
    if (!expandedCycleId) {
      const firstOpen = audits.find(c => !c.closed);
      if (firstOpen) setExpandedCycleId(firstOpen.id);
    }
  }, [audits, expandedCycleId]);

  const toggleAuditorSelection = (emp) => {
    setSelectedAuditors(prev =>
      prev.find(a => a.id === emp.id)
        ? prev.filter(a => a.id !== emp.id)
        : [...prev, { id: emp.id, name: emp.name }]
    );
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    if (!cycleTitle.trim() || !startDate || !endDate || selectedAuditors.length === 0) return;

    // Auto-generate audit items from assets in scope
    const scopedAssets = scopeType === 'department'
      ? assets.filter(a => !['Lost', 'Retired', 'Disposed'].includes(a.status))
      : assets.filter(a => a.location?.toLowerCase().includes(scopeValue.toLowerCase()) && !['Lost', 'Retired', 'Disposed'].includes(a.status));

    const items = scopedAssets.map(a => ({
      asset_tag: a.tag || a.asset_tag,
      asset_name: a.name,
      asset_location: a.location,
      status: 'Pending',
    }));

    try {
      await createAudit({
        title: cycleTitle.trim(),
        scope: scopeValue || 'All',
        scopeType,
        start_date: startDate,
        end_date: endDate,
        auditors: selectedAuditors,
        items,
      });
      setIsCreateModalOpen(false);
      setCycleTitle(''); setScopeValue(''); setStartDate(''); setEndDate(''); setSelectedAuditors([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCycleItemStatus = async (cycleId, itemId, currentStatus) => {
    const cycle = audits.find(c => c.id === cycleId);
    if (!cycle || cycle.closed) return;
    const statuses = ['Pending', 'Verified', 'Missing', 'Damaged'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    try {
      await updateAuditItemStatus(cycleId, itemId, statuses[nextIdx]);
    } catch (err) {
       console.error(err);
    }
  };

  const filteredCycles = filterStatus === 'All'
    ? audits
    : audits.filter(c => filterStatus === 'Open' ? !c.closed : c.closed);

  const openCount = audits.filter(c => !c.closed).length;
  const closedCount = audits.filter(c => c.closed).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified': return 'badge-success';
      case 'Missing': return 'badge-danger';
      case 'Damaged': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Asset Audit & Verification</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Run structured verification cycles with assigned auditors and auto-generated discrepancy reports</p>
        </div>
        {canManageAudit && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary whitespace-nowrap">
            <Plus size={16} /> New Audit Cycle
          </button>
        )}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-primary/10 text-accent-primary"><ClipboardCheck size={20} /></div>
          <div>
            <p className="text-2xl font-bold text-text-primary m-0">{audits.length}</p>
            <p className="text-xs text-text-secondary m-0">Total Cycles</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-alert-warning-bg text-alert-warning"><ShieldCheck size={20} /></div>
          <div>
            <p className="text-2xl font-bold text-alert-warning m-0">{openCount}</p>
            <p className="text-xs text-text-secondary m-0">Open Cycles</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-alert-success-bg text-alert-success"><Lock size={20} /></div>
          <div>
            <p className="text-2xl font-bold text-alert-success m-0">{closedCount}</p>
            <p className="text-xs text-text-secondary m-0">Closed Cycles</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-alert-danger-bg text-alert-danger"><FileWarning size={20} /></div>
          <div>
            <p className="text-2xl font-bold text-alert-danger m-0">
              {audits.reduce((sum, c) => sum + (c.items || []).filter(i => i.status === 'Missing' || i.status === 'Damaged').length, 0)}
            </p>
            <p className="text-xs text-text-secondary m-0">Flagged Items</p>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2">
        {['All', 'Open', 'Closed'].map(f => (
          <button key={f} onClick={() => setFilterStatus(f)} className={`pill ${filterStatus === f ? 'active' : ''}`}>
            {f} {f === 'All' ? `(${audits.length})` : f === 'Open' ? `(${openCount})` : `(${closedCount})`}
          </button>
        ))}
      </div>

      {/* Audit Cycles List */}
      <div className="flex flex-col gap-4">
        {filteredCycles.length > 0 ? filteredCycles.map(cycle => {
          const isExpanded = expandedCycleId === cycle.id;
          const cycleItems = cycle.items || [];
          const flaggedCount = cycleItems.filter(i => i.status !== 'Verified' && i.status !== 'Pending').length;
          const verifiedCount = cycleItems.filter(i => i.status === 'Verified').length;
          const pendingCount = cycleItems.filter(i => i.status === 'Pending').length;
          const progress = cycleItems.length > 0 ? Math.round(((verifiedCount + flaggedCount) / cycleItems.length) * 100) : 0;
          const cycleStatusStr = !cycle.closed ? 'Open' : 'Closed';

          return (
            <div key={cycle.id} className="card p-0 overflow-hidden">
              {/* Cycle Header — Clickable */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-bg-primary/50 transition-colors gap-4"
                onClick={() => setExpandedCycleId(isExpanded ? null : cycle.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={18} className="text-text-secondary shrink-0" /> : <ChevronRight size={18} className="text-text-secondary shrink-0" />}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-text-primary m-0">{cycle.title || cycle.scope}</h3>
                      <span className={`badge ${!cycle.closed ? 'badge-warning' : 'badge-success'}`}>
                        {!cycle.closed ? <ShieldCheck size={12} /> : <Lock size={12} />}
                        {cycleStatusStr}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {cycle.start_date || cycle.startDate} → {cycle.end_date || cycle.endDate}</span>
                      {cycle.auditors && <span className="flex items-center gap-1"><Users size={12} /> {cycle.auditors.map(a => a.name).join(', ')}</span>}
                      <span>Scope: <strong className="text-text-primary">{cycle.scope}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Progress bar */}
                  <div className="w-32 flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>{progress}% audited</span>
                      <span>{cycleItems.length} items</span>
                    </div>
                    <div className="w-full h-1.5 bg-border-color rounded-full overflow-hidden">
                      <div className="h-full bg-accent-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  {flaggedCount > 0 && (
                    <span className="badge badge-danger">{flaggedCount} flagged</span>
                  )}
                </div>
              </div>

              {/* Expanded: Audit Items Table */}
              {isExpanded && (
                <div className="border-t border-border-color">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left m-0">
                      <thead>
                        <tr>
                          <th className="th">Asset Tag</th>
                          <th className="th">Asset Name</th>
                          <th className="th">Location</th>
                          <th className="th">Verification</th>
                          <th className="th text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cycleItems.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-bg-primary/50 transition-colors">
                            <td className="td">
                              <span className="font-bold text-accent-primary text-xs bg-accent-primary/10 px-2 py-0.5 rounded">{item.asset_tag || item.tag}</span>
                            </td>
                            <td className="td font-medium text-text-primary">{item.asset_name || item.name}</td>
                            <td className="td text-text-secondary">{item.asset_location || item.location}</td>
                            <td className="td">
                              <span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span>
                            </td>
                            <td className="td text-right">
                              {!cycle.closed && canManageAudit ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCycleItemStatus(cycle.id, item.id, item.status); }}
                                  className="btn btn-outline text-xs py-1 px-2.5"
                                >
                                  Cycle Status
                                </button>
                              ) : (
                                <span className="text-xs text-text-secondary">{!cycle.closed ? 'View Only' : 'Locked'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cycle Footer — Actions + Discrepancy Summary */}
                  <div className="p-5 bg-bg-primary border-t border-border-color flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Discrepancy Summary */}
                    <div className="flex-1">
                      {flaggedCount > 0 ? (
                        <div className="alert alert-warning m-0 text-xs">
                          <AlertCircle size={16} className="shrink-0" />
                          <span><strong>{flaggedCount} asset(s) flagged</strong> — {cycleItems.filter(i => i.status === 'Missing').length} missing, {cycleItems.filter(i => i.status === 'Damaged').length} damaged</span>
                        </div>
                      ) : pendingCount > 0 ? (
                        <div className="alert alert-warning m-0 text-xs" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          <Search size={16} className="shrink-0" />
                          <span>{pendingCount} asset(s) still pending verification</span>
                        </div>
                      ) : (
                        <div className="alert alert-success m-0 text-xs">
                          <CheckCircle size={16} className="shrink-0" />
                          <span><strong>All assets verified</strong> — no discrepancies in this cycle</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {flaggedCount > 0 && (
                        <button onClick={() => setShowReport(showReport === cycle.id ? null : cycle.id)} className="btn btn-outline text-xs">
                          <FileWarning size={14} /> {showReport === cycle.id ? 'Hide' : 'View'} Report
                        </button>
                      )}
                      {!cycle.closed && canManageAudit && (
                        <button
                          onClick={() => { if (window.confirm(`Close this audit cycle? ${cycleItems.filter(i => i.status === 'Missing').length} missing asset(s) will be marked as Lost.`)) closeAuditCycle(cycle.id); }}
                          className="btn btn-primary text-xs"
                        >
                          <Lock size={14} /> Close Cycle
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Discrepancy Report Drawer */}
                  {showReport === cycle.id && flaggedCount > 0 && (
                    <div className="p-5 border-t border-border-color bg-alert-danger-bg/30">
                      <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                        <FileWarning size={16} className="text-alert-danger" /> Discrepancy Report — {cycle.title || cycle.scope}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cycleItems.filter(i => i.status === 'Missing' || i.status === 'Damaged').map((item, idx) => (
                          <div key={item.id || idx} className={`p-3 rounded-lg border-l-4 bg-bg-secondary ${item.status === 'Missing' ? 'border-l-alert-danger' : 'border-l-alert-warning'} border border-border-color`}>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-text-primary">{item.asset_tag || item.tag} — {item.asset_name || item.name}</span>
                              <span className={`badge ${getStatusBadge(item.status)} text-[10px]`}>{item.status}</span>
                            </div>
                            <p className="text-xs text-text-secondary mt-1 m-0">
                              Expected at: <strong>{item.asset_location || item.location}</strong>
                              {item.status === 'Missing' && cycle.closed && <span className="text-alert-danger ml-2">→ Asset marked as Lost</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }) : (
          <div className="card text-center py-12">
            <ClipboardCheck size={40} className="mx-auto text-text-secondary/30 mb-3" />
            <p className="text-text-secondary font-medium">No audit cycles found</p>
            <p className="text-xs text-text-secondary mt-1">Create a new audit cycle to start verifying assets.</p>
          </div>
        )}
      </div>

      {/* ===== CREATE AUDIT CYCLE MODAL ===== */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card max-w-xl">
            <h3 className="text-xl font-bold mb-6 text-text-primary flex items-center gap-2">
              <ClipboardCheck size={22} className="text-accent-primary" /> Create New Audit Cycle
            </h3>

            <form onSubmit={handleCreateCycle} className="flex flex-col gap-5">
              <div>
                <label className="label">Audit Cycle Title</label>
                <input ref={titleInputRef} type="text" className="input" required placeholder="e.g. Q3 Audit — Engineering Dept" value={cycleTitle} onChange={e => setCycleTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Scope Type</label>
                  <select className="select" value={scopeType} onChange={e => setScopeType(e.target.value)}>
                    <option value="department">By Department</option>
                    <option value="location">By Location</option>
                  </select>
                </div>
                <div>
                  <label className="label">{scopeType === 'department' ? 'Department' : 'Location'}</label>
                  {scopeType === 'department' ? (
                    <select className="select" value={scopeValue} onChange={e => setScopeValue(e.target.value)}>
                      <option value="">All Departments</option>
                      {departments.filter(d => d.status === 'Active').map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  ) : (
                    <input type="text" className="input" placeholder="e.g. HQ - Floor 2" value={scopeValue} onChange={e => setScopeValue(e.target.value)} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" className="input" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="date" className="input" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Assign Auditors (select one or more)</label>
                <div className="flex flex-wrap gap-2 mt-1 p-3 border border-border-color rounded-lg bg-bg-primary max-h-36 overflow-y-auto">
                  {employees.filter(e => e.status === 'Active').map(emp => {
                    const isSelected = selectedAuditors.find(a => a.id === emp.id);
                    return (
                      <button key={emp.id} type="button" onClick={() => toggleAuditorSelection(emp)}
                        className={`pill text-xs py-1 px-3 ${isSelected ? 'active' : ''}`}
                      >
                        {emp.name}
                        {isSelected && <CheckCircle size={12} className="ml-1" />}
                      </button>
                    );
                  })}
                </div>
                {selectedAuditors.length > 0 && (
                  <p className="text-xs text-accent-primary mt-2 font-medium">{selectedAuditors.length} auditor(s) selected: {selectedAuditors.map(a => a.name).join(', ')}</p>
                )}
              </div>

              <div className="bg-bg-primary border border-border-color rounded-lg p-3 text-xs text-text-secondary">
                <strong className="text-text-primary">Note:</strong> The system will auto-populate audit items from all active assets{scopeValue ? ` in scope "${scopeValue}"` : ''}.
                Each auditor can then mark assets as Verified, Missing, or Damaged.
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-border-color">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={selectedAuditors.length === 0} className="btn btn-primary disabled:opacity-50">
                  Create Audit Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
