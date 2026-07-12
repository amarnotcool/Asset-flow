import React from 'react';
import { AlertCircle, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Audit = () => {
  const { audits, updateAuditItemStatus, closeAuditCycle } = useAppStore();

  const currentAudit = audits[0]; // Active audit cycle

  const handleCycleItemStatus = (item) => {
    if (currentAudit.closed) return;
    const nextStatus =
      item.status === 'Verified'
        ? 'Missing'
        : item.status === 'Missing'
        ? 'Damaged'
        : 'Verified';
    updateAuditItemStatus(currentAudit.id, item.tag, nextStatus);
  };

  const flaggedCount = currentAudit
    ? currentAudit.items.filter((item) => item.status !== 'Verified').length
    : 0;

  const thClass = "p-4 text-xs uppercase text-text-secondary font-semibold border-b border-border-color";
  const tdClass = "p-4 text-sm border-b border-border-color text-text-primary align-middle";

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Asset Audit & Verification</h1>
          <p className="text-sm text-text-secondary mt-1">
            Run structured verification cycles with assigned auditors and auto-generated discrepancy reports
          </p>
        </div>
      </div>

      {currentAudit && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-color">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{currentAudit.title}</h2>
                {currentAudit.closed && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-[#f1f5f9] text-text-secondary">
                    <Lock size={12} /> Closed Cycle
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-sm mt-1">Auditors: {currentAudit.auditors}</p>
            </div>
            {!currentAudit.closed ? (
              <button
                onClick={() => closeAuditCycle(currentAudit.id)}
                className="btn btn-outline cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck size={16} /> Close Audit Cycle
              </button>
            ) : (
              <span className="text-xs text-text-secondary font-medium">
                Cycle completed and locked
              </span>
            )}
          </div>

          <div className="w-full overflow-x-auto mb-6">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className={thClass}>Asset</th>
                  <th className={thClass}>Expected Location</th>
                  <th className={thClass}>Verification Status</th>
                  <th className={`${thClass} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentAudit.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.01]">
                    <td className={tdClass}>
                      <strong>{item.tag}</strong> {item.name}
                    </td>
                    <td className={tdClass}>{item.location}</td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          item.status === 'Verified'
                            ? 'bg-alert-success-bg text-alert-success'
                            : item.status === 'Missing'
                            ? 'bg-alert-danger-bg text-alert-danger'
                            : 'bg-alert-warning-bg text-alert-warning'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      {!currentAudit.closed && (
                        <button
                          onClick={() => handleCycleItemStatus(item)}
                          className="btn btn-outline text-xs py-1 px-2.5 cursor-pointer"
                          title="Click to toggle status (Verified -> Missing -> Damaged)"
                        >
                          Change Verification
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {flaggedCount > 0 ? (
            <div className="p-4 rounded-lg text-sm border-l-4 bg-alert-warning-bg text-alert-warning border-l-alert-warning flex items-center gap-2">
              <AlertCircle size={20} className="shrink-0" />
              <span>
                <strong>{flaggedCount} asset(s) flagged</strong> — discrepancy report generated automatically for management review.
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-lg text-sm border-l-4 bg-alert-success-bg text-alert-success border-l-alert-success flex items-center gap-2">
              <CheckCircle size={20} className="shrink-0" />
              <span>
                <strong>All assets verified</strong> — no discrepancies detected in this audit cycle.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Audit;
