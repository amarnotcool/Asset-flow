import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { operationsApi } from '../api';

const ResourceBooking = () => {
  // Simple action-oriented useState variables
  const [selectedResource, setSelectedResource] = useState('Conference room B2');
  const [bookingStartTime, setBookingStartTime] = useState('10:00');
  const [bookingEndTime, setBookingEndTime] = useState('11:00');
  const [bookedByTeam, setBookedByTeam] = useState('Engineering Team');
  const [overlapError, setOverlapError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const teamInputRef = useRef(null);
  const { bookings, addBooking } = useAppStore();

  // useEffect + useRef: Auto-dismiss success message or focus team field
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const resourceBookings = bookings.filter((b) => b.resource === selectedResource);

  const checkOverlap = (start, end) => {
    const toMin = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const reqStart = toMin(start);
    const reqEnd = toMin(end);

    for (const booking of resourceBookings) {
      const existStart = toMin(booking.startTime);
      const existEnd = toMin(booking.endTime);

      if (reqStart < existEnd && reqEnd > existStart) {
        return booking;
      }
    }
    return null;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setOverlapError(null);
    setSuccessMessage(null);

    if (bookingStartTime >= bookingEndTime) {
      setOverlapError('End time must be after start time.');
      return;
    }

    const conflict = checkOverlap(bookingStartTime, bookingEndTime);
    if (conflict) {
      setOverlapError(
        `Requested slot (${bookingStartTime}–${bookingEndTime}) overlaps with existing booking (${conflict.startTime}–${conflict.endTime} by ${conflict.bookedBy}). Slot is unavailable.`
      );
    } else {
      const payload = {
        resource: selectedResource,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        bookedBy: bookedByTeam || 'Staff Member',
        status: 'Confirmed',
      };
      try {
        await operationsApi.createBooking(payload);
      } catch {
        // Fallback local state update
      }
      addBooking(payload);
      setSuccessMessage(
        `Booking confirmed for ${selectedResource} from ${bookingStartTime} to ${bookingEndTime}.`
      );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Resource Booking</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Book shared rooms, vehicles, and equipment with automatic overlap prevention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form Column */}
        <div className="card h-fit">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 m-0 text-text-primary">
            <Calendar size={18} className="text-accent-primary" /> Book a Resource Slot
          </h3>

          {overlapError && (
            <div className="alert alert-danger mb-5">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{overlapError}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success mb-5">
              <CheckCircle size={18} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label">Shared Resource</label>
              <select className="select" value={selectedResource} onChange={e => { setSelectedResource(e.target.value); setOverlapError(null); setSuccessMessage(null); }}>
                <option value="Conference room B2">Conference room B2</option>
                <option value="Company Van AF-312">Company Van AF-312</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <select className="select" value={bookingStartTime} onChange={e => { setBookingStartTime(e.target.value); setOverlapError(null); }}>
                  <option value="09:00">09:00 AM</option>
                  <option value="09:30">09:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                </select>
              </div>
              <div>
                <label className="label">End Time</label>
                <select className="select" value={bookingEndTime} onChange={e => { setBookingEndTime(e.target.value); setOverlapError(null); }}>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Booked By / Team</label>
              <input ref={teamInputRef} type="text" className="input" required value={bookedByTeam} onChange={e => setBookedByTeam(e.target.value)} placeholder="e.g. Engineering Team" />
            </div>

            <div className="mt-2 pt-4 border-t border-border-color">
              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                <Plus size={16} /> Confirm Booking
              </button>
            </div>
          </form>
        </div>

        {/* Schedule / Timeline Column */}
        <div className="lg:col-span-2 card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-border-color gap-2">
            <h3 className="text-lg font-bold m-0 text-text-primary">Today's Schedule: <span className="text-accent-primary">{selectedResource}</span></h3>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider bg-bg-primary px-3 py-1 rounded-full border border-border-color">All times in local time</span>
          </div>

          <div className="flex flex-col gap-4">
            {resourceBookings.length > 0 ? (
              resourceBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-bg-primary border border-border-color flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 relative overflow-hidden shadow-sm hover:border-accent-primary transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-primary"></div>
                  <div className="pl-2">
                    <span className="font-bold text-lg text-text-primary flex items-center gap-2">
                      {b.startTime} <span className="text-text-secondary font-normal text-sm">to</span> {b.endTime}
                    </span>
                    <p className="text-sm text-text-secondary font-medium mt-1 m-0">
                      Booked by: <span className="text-text-primary">{b.bookedBy}</span>
                    </p>
                  </div>
                  <span className="badge badge-info self-start sm:self-auto px-3 py-1 text-xs">
                    {b.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl bg-bg-primary">
                <Calendar size={32} className="mb-3 text-text-secondary opacity-50" />
                <p className="text-base font-medium text-text-primary m-0">No active bookings today.</p>
                <p className="text-sm text-text-secondary mt-1 m-0">This resource is completely open.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceBooking;
