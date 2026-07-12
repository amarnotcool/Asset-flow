import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Check, X, AlertTriangle, AlertCircle } from 'lucide-react';

const Audit = () => {
  const auditList = [
    { tag: 'AF-0114', name: 'Dell laptop', location: 'Desk 692', status: 'Verified' },
    { tag: 'AF-0912', name: 'Office chair', location: 'Desk 114', status: 'Missing' },
    { tag: 'AF-9823', name: 'Monitor', location: 'Desk 613', status: 'Damaged' },
  ];

  return (
    <div className="audit-page flex-col">
      <h1 className="page-title">Asset Audit</h1>
      
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Q3 Audit - Engineering Dept - 1-15 Jul</h2>
            <p className="text-secondary text-sm">Auditors: A. Rao, S. Iqbal</p>
          </div>
        </div>

        <div className="table-responsive mb-6">
          <table className="table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Expected Location</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {auditList.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.tag}</strong> {item.name}</td>
                  <td>{item.location}</td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Verified' ? 'badge-success' :
                      item.status === 'Missing' ? 'badge-danger' : 
                      'badge-warning'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="alert alert-warning mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span><strong>2 assets flagged</strong> - discrepancy report generated automatically</span>
        </div>

        <Button variant="outline">Close audit cycle</Button>
      </Card>
    </div>
  );
};
export default Audit;
