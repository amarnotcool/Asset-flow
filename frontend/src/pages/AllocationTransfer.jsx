import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AlertCircle } from 'lucide-react';

const AllocationTransfer = () => {
  const [assetTag, setAssetTag] = useState('');
  
  // Mock conflict state matching Excalidraw mockup
  const isConflict = assetTag.toUpperCase() === 'AF-0114';

  return (
    <div className="allocation-page flex-col">
      <h1 className="page-title">Asset Allocation & Transfer</h1>
      
      <Card className="max-w-3xl">
        <div className="mb-4">
          <Input 
            label="Asset Tag" 
            placeholder="e.g. AF-0114" 
            value={assetTag}
            onChange={(e) => setAssetTag(e.target.value)}
          />
        </div>

        {isConflict && (
          <div className="alert alert-danger mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            <div>
              <strong>Already allocated to Priya Shah (Engineering)</strong><br/>
              Direct re-allocation is blocked. Submit a Transfer Request below.
            </div>
          </div>
        )}

        <div className="transfer-request-form flex-col gap-4 mt-6 pt-6 border-t" style={{borderTop: '1px solid var(--border-color)'}}>
          <h3 className="mb-2" style={{fontWeight: 600}}>Transfer Request</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">From</label>
              <input type="text" className="input" value={isConflict ? 'Priya Shah' : ''} disabled />
            </div>
            <div className="flex-1">
              <label className="label">To</label>
              <select className="select">
                <option>Select Employee...</option>
                <option>Arjun Nair</option>
              </select>
            </div>
          </div>
          
          <div className="flex-col gap-2 mt-4">
            <label className="label">Reason</label>
            <textarea className="input" rows={3}></textarea>
          </div>
          
          <div className="mt-4">
            <Button>Submit Request</Button>
          </div>
        </div>

        <div className="allocation-history mt-6 pt-6 border-t" style={{borderTop: '1px solid var(--border-color)'}}>
          <h3 style={{fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)'}}>Allocation History</h3>
          <ul style={{listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
            <li><strong>Mar 12 -</strong> Allocated to Priya Shah - Engineering</li>
            <li><strong>Jan 04 -</strong> Returned by Arjun Nair - condition: good</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
export default AllocationTransfer;
