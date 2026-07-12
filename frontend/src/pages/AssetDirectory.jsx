import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const AssetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Asset Data
  const assets = [
    { id: 1, tag: 'AF-0114', name: 'Dell XPS 15', category: 'Electronics', status: 'Allocated', location: 'HQ - Floor 2' },
    { id: 2, tag: 'AF-0062', name: 'Epson Projector', category: 'Electronics', status: 'Maintenance', location: 'Room B2' },
    { id: 3, tag: 'AF-0201', name: 'Ergo Chair', category: 'Furniture', status: 'Available', location: 'Warehouse' },
  ];

  const thClass = "p-4 text-xs uppercase text-text-secondary font-semibold border-b border-border-color";
  const tdClass = "p-4 text-sm border-b border-border-color text-text-primary align-middle";

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Asset Directory</h1>
        <Button><Plus size={16} /> Register Asset</Button>
      </div>

      <Card className="mb-4 flex items-center justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <Input 
            placeholder="Search by Tag, serial, or QR code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            containerClassName="flex-1"
          />
          <Button variant="outline"><Search size={16}/></Button>
        </div>
        <div className="flex gap-2">
          <select className="select w-auto"><option>Category</option></select>
          <select className="select w-auto"><option>Status</option></select>
          <select className="select w-auto"><option>Department</option></select>
          <Button variant="outline"><Filter size={16}/> Filter</Button>
        </div>
      </Card>

      <Card>
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={thClass}>Tag</th>
                <th className={thClass}>Name</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Location</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-black/[0.01]">
                  <td className={tdClass}><strong>{asset.tag}</strong></td>
                  <td className={tdClass}>{asset.name}</td>
                  <td className={tdClass}>{asset.category}</td>
                  <td className={tdClass}>
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      asset.status === 'Available' ? 'bg-alert-success-bg text-alert-success' : 
                      asset.status === 'Allocated' ? 'bg-[#e0f2fe] text-accent-primary' : 
                      'bg-alert-warning-bg text-alert-warning'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className={tdClass}>{asset.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default AssetDirectory;
