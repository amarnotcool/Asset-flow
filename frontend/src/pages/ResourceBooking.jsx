import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './ResourceBooking.css';

const ResourceBooking = () => {
  return (
    <div className="booking-page flex-col">
      <h1 className="page-title">Resource Booking</h1>
      
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <label className="label">Resource</label>
            <select className="select" style={{width: '300px'}}>
              <option>Conference room B2 - Tue, 2 Jul</option>
            </select>
          </div>
        </div>

        <div className="timeline-container">
          <div className="time-labels">
            <span>9:00 AM</span>
            <span>10:00 AM</span>
            <span>11:00 AM</span>
            <span>12:00 PM</span>
            <span>1:00 PM</span>
          </div>
          
          <div className="timeline-track">
            {/* Booked slot 9:00 - 10:00 */}
            <div className="slot booked" style={{ top: 0, height: '60px' }}>
              <strong>Booked - Procurement Team</strong>
            </div>

            {/* Overlap mock 9:30 - 10:30 */}
            <div className="slot conflict" style={{ top: '30px', height: '60px' }}>
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
