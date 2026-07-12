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
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Asset Allocation & Transfer</h1>
      
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
          <div className="p-4 rounded-lg text-sm border-l-4 bg-alert-danger-bg text-alert-danger border-l-alert-danger flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <strong>Already allocated to Priya Shah (Engineering)</strong><br/>
              Direct re-allocation is blocked. Submit a Transfer Request below.
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-border-color">
          <h3 className="mb-2 font-semibold text-lg">Transfer Request</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">From</label>
              <input type="text" className="input bg-bg-primary text-text-secondary cursor-not-allowed" value={isConflict ? 'Priya Shah' : ''} disabled readOnly />
            </div>
            <div className="flex-1">
              <label className="label">To</label>
              <select className="select">
                <option>Select Employee...</option>
                <option>Arjun Nair</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col mt-2">
            <label className="label">Reason</label>
            <textarea className="input" rows={3}></textarea>
          </div>
          
          <div className="mt-4">
            <Button>Submit Request</Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border-color">
          <h3 className="font-semibold text-sm mb-4 text-text-secondary">Allocation History</h3>
          <ul className="list-none text-[0.85rem] text-text-secondary space-y-2">
            <li><strong>Mar 12 -</strong> Allocated to Priya Shah - Engineering</li>
            <li><strong>Jan 04 -</strong> Returned by Arjun Nair - condition: good</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
export default AllocationTransfer;
