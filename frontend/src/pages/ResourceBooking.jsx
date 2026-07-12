import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ResourceBooking = () => {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Resource Booking</h1>
      
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="w-[300px]">
            <label className="label">Resource</label>
            <select className="select">
              <option>Conference room B2 - Tue, 2 Jul</option>
            </select>
          </div>
        </div>

        <div className="flex min-h-[300px] border-l-2 border-border-color ml-[60px] relative">
          <div className="absolute -left-[70px] flex flex-col justify-between h-full text-xs text-text-secondary font-medium pt-[10px]">
            <span className="h-[60px] block">9:00 AM</span>
            <span className="h-[60px] block">10:00 AM</span>
            <span className="h-[60px] block">11:00 AM</span>
            <span className="h-[60px] block">12:00 PM</span>
            <span className="h-[60px] block">1:00 PM</span>
          </div>
          
          <div className="w-full relative" style={{background: 'repeating-linear-gradient(to bottom, transparent, transparent 59px, #e2e8f0 59px, #e2e8f0 60px)'}}>
            {/* Booked slot 9:00 - 10:00 */}
            <div className="absolute left-2.5 right-2.5 rounded-md p-2 text-[0.85rem] flex items-center bg-[#dbeafe] border-l-4 border-accent-primary text-accent-primary" style={{ top: 0, height: '60px' }}>
              <strong>Booked - Procurement Team</strong>
            </div>

            {/* Overlap mock 9:30 - 10:30 */}
            <div className="absolute left-2.5 right-2.5 rounded-md p-2 text-[0.85rem] flex items-center bg-transparent border-2 border-dashed border-alert-danger text-alert-danger z-10 backdrop-blur-[1px]" style={{ top: '30px', height: '60px' }}>
              <span>Requested 9:30 to 10:30 - conflict - slot is unavailable</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button>Book a slot</Button>
        </div>
      </Card>
    </div>
  );
};
export default ResourceBooking;
