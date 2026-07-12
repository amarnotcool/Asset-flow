import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';

const Audit = () => {
  const auditList = [
    { tag: 'AF-0114', name: 'Dell laptop', location: 'Desk 692', status: 'Verified' },
    { tag: 'AF-0912', name: 'Office chair', location: 'Desk 114', status: 'Missing' },
    { tag: 'AF-9823', name: 'Monitor', location: 'Desk 613', status: 'Damaged' },
  ];

  const thClass = "p-4 text-xs uppercase text-text-secondary font-semibold border-b border-border-color";
  const tdClass = "p-4 text-sm border-b border-border-color text-text-primary align-middle";

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Asset Audit</h1>
      
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-color">
          <div>
            <h2 className="text-lg font-semibold">Q3 Audit - Engineering Dept - 1-15 Jul</h2>
            <p className="text-text-secondary text-sm">Auditors: A. Rao, S. Iqbal</p>
          </div>
        </div>

        <div className="w-full overflow-x-auto mb-6">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={thClass}>Asset</th>
                <th className={thClass}>Expected Location</th>
                <th className={thClass}>Verification</th>
              </tr>
            </thead>
            <tbody>
              {auditList.map((item, idx) => (
                <tr key={idx} className="hover:bg-black/[0.01]">
                  <td className={tdClass}><strong>{item.tag}</strong> {item.name}</td>
                  <td className={tdClass}>{item.location}</td>
                  <td className={tdClass}>
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      item.status === 'Verified' ? 'bg-alert-success-bg text-alert-success' :
                      item.status === 'Missing' ? 'bg-alert-danger-bg text-alert-danger' : 
                      'bg-alert-warning-bg text-alert-warning'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-lg text-sm border-l-4 bg-alert-warning-bg text-alert-warning border-l-alert-warning flex items-center gap-2 mb-4">
          <AlertCircle size={20} className="shrink-0" />
          <span><strong>2 assets flagged</strong> - discrepancy report generated automatically</span>
        </div>

        <Button variant="outline">Close audit cycle</Button>
      </Card>
    </div>
  );
};
export default Audit;
