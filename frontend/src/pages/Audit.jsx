import React, { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Audit = () => {
  const auditTableRef = useRef(null);
  const { audits, updateAuditItemStatus, closeAuditCycle, syncBackendData } = useAppStore();

  useEffect(() => { syncBackendData(); }, []);

  const currentAudit = audits.length > 0 ? audits[0] : null;

  useEffect(() => {
    auditTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentAudit]);

  const handleCycleItemStatus = (item) => {
    if (!currentAudit || currentAudit.closed) return;
    const nextStatus =
      item.status === 'Verified' ? 'Missing'
      : item.status === 'Missing' ? 'Damaged'
      : 'Verified';
    updateAuditItemStatus(currentAudit.id, item.id, nextStatus);
  };

  const flaggedCount = currentAudit
    ? (currentAudit.items || []).filter((item) => item.status !== 'Verified').length
    : 0;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Asset Audit & Verification</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Run structured verification cycles with assigned auditors and auto-generated discrepancy reports</p>
        </div>
      </div>

      {currentAudit ? (
        <div ref={auditTableRef} className="card mb-6 p-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b border-border-color gap-4 bg-bg-secondary">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-text-primary m-0">{currentAudit.scope || 'Audit Cycle'}</h2>
                {currentAudit.closed && (
                  <span className="badge badge-neutral bg-[#e2e8f0]">
                    <Lock size={12} /> Closed Cycle
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-sm m-0 font-medium">
                Period: {new Date(currentAudit.start_date).toLocaleDateString()} — {new Date(currentAudit.end_date).toLocaleDateString()}
              </p>
            </div>
            
            {!currentAudit.closed ? (
              <button onClick={() => closeAuditCycle(currentAudit.id)} className="btn btn-outline hover:bg-alert-success-bg hover:text-alert-success hover:border-alert-success transition-colors group">
                <ShieldCheck size={18} className="text-text-secondary group-hover:text-alert-success" /> Close Audit Cycle
              </button>
            ) : (
              <span className="text-sm text-text-secondary font-bold uppercase tracking-wider bg-bg-primary px-4 py-2 rounded-lg border border-border-color flex items-center gap-2">
                <Lock size={16} /> Cycle Locked
              </span>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left m-0">
              <thead>
                <tr>
                  <th className="th">Asset Tag & Name</th>
                  <th className="th">Location</th>
                  <th className="th">Verification Status</th>
                  <th className="th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(currentAudit.items || []).map((item) => (
                  <tr key={item.id} className="hover:bg-black/[0.01]">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-accent-primary bg-[#e0f2fe] px-2 py-0.5 rounded text-xs">{item.asset_tag}</span>
                        <span className="font-medium text-text-primary">{item.asset_name}</span>
                      </div>
                    </td>
                    <td className="td">{item.asset_location || '—'}</td>
                    <td className="td">
                      <span className={`badge ${
                        item.status === 'Verified' ? 'badge-success' : 
                        item.status === 'Missing' ? 'badge-danger' : 
                        item.status === 'Damaged' ? 'badge-warning' : 'badge-neutral'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="td text-right">
                      {!currentAudit.closed && (
                        <button
                          onClick={() => handleCycleItemStatus(item)}
                          className="btn btn-outline text-xs py-1.5 px-3"
                          title="Click to cycle status (Verified -> Missing -> Damaged)"
                        >
                          Change Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!currentAudit.items || currentAudit.items.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-secondary text-sm">No assets assigned to this audit cycle.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-bg-primary">
            {flaggedCount > 0 ? (
              <div className="alert alert-warning m-0">
                <AlertCircle size={20} className="shrink-0" />
                <span><strong>{flaggedCount} asset(s) flagged</strong> — discrepancy report generated automatically for management review.</span>
              </div>
            ) : (
              <div className="alert alert-success m-0">
                <CheckCircle size={20} className="shrink-0" />
                <span><strong>All assets verified</strong> — no discrepancies detected in this audit cycle.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-text-secondary opacity-40" />
          <h3 className="text-lg font-bold text-text-primary m-0 mb-2">No Active Audit Cycles</h3>
          <p className="text-sm text-text-secondary m-0">Create an audit cycle through the admin panel to start verifying assets.</p>
        </div>
      )}
    </div>
  );
};

export default Audit;
