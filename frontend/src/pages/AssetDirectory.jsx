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

  return (
    <div className="asset-dir-page flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{marginBottom: 0}}>Asset Directory</h1>
        <Button><Plus size={16} /> Register Asset</Button>
      </div>

      <Card className="mb-4 flex items-center justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <Input 
            placeholder="Search by Tag, serial, or QR code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline"><Search size={16}/></Button>
        </div>
        <div className="flex gap-2">
          <select className="select"><option>Category</option></select>
          <select className="select"><option>Status</option></select>
          <select className="select"><option>Department</option></select>
          <Button variant="outline"><Filter size={16}/> Filter</Button>
        </div>
      </Card>

      <Card>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td><strong>{asset.tag}</strong></td>
                  <td>{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>
                    <span className={`badge ${asset.status === 'Available' ? 'badge-success' : asset.status === 'Allocated' ? 'badge-primary' : 'badge-warning'}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.location}</td>
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
