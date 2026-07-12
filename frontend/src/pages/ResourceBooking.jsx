import React, { useState } from 'react';
import { Calendar, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const ResourceBooking = () => {
  // Simple action-oriented useState variables
  const [selectedResource, setSelectedResource] = useState('Conference room B2');
  const [bookingStartTime, setBookingStartTime] = useState('10:00');
  const [bookingEndTime, setBookingEndTime] = useState('11:00');
  const [bookedByTeam, setBookedByTeam] = useState('Engineering Team');
  const [overlapError, setOverlapError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { bookings, addBooking } = useAppStore();

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

      // Overlap condition: start < existEnd && end > existStart
      if (reqStart < existEnd && reqEnd > existStart) {
        return booking;
      }
    }
    return null;
  };

  const handleBookingSubmit = (e) => {
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
      addBooking({
        resource: selectedResource,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        bookedBy: bookedByTeam || 'Staff Member',
        status: 'Confirmed',
      });
      setSuccessMessage(
        `Booking confirmed for ${selectedResource} from ${bookingStartTime} to ${bookingEndTime}.`
      );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Resource Booking</h1>
          <p className="text-sm text-text-secondary mt-1">
            Book shared rooms, vehicles, and equipment with automatic overlap prevention
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form Column */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-accent-primary" /> Book a Resource Slot
          </h3>

          {overlapError && (
            <div className="p-3 rounded-lg text-xs bg-alert-danger-bg text-alert-danger border-l-4 border-alert-danger mb-4 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{overlapError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg text-xs bg-alert-success-bg text-alert-success border-l-4 border-alert-success mb-4 flex items-start gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Shared Resource</label>
              <select
                className="select"
                value={selectedResource}
                onChange={(e) => {
                  setSelectedResource(e.target.value);
                  setOverlapError(null);
                  setSuccessMessage(null);
                }}
              >
                <option value="Conference room B2">Conference room B2</option>
                <option value="Company Van AF-312">Company Van AF-312</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <select
                  className="select"
                  value={bookingStartTime}
                  onChange={(e) => {
                    setBookingStartTime(e.target.value);
                    setOverlapError(null);
                  }}
                >
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
                <select
                  className="select"
                  value={bookingEndTime}
                  onChange={(e) => {
                    setBookingEndTime(e.target.value);
                    setOverlapError(null);
                  }}
                >
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
              <input
                type="text"
                className="input"
                required
                value={bookedByTeam}
                onChange={(e) => setBookedByTeam(e.target.value)}
                placeholder="e.g. Engineering Team"
              />
            </div>

            <button type="submit" className="btn btn-primary cursor-pointer mt-2">
              <Plus size={16} /> Confirm Booking
            </button>
          </form>
        </div>

        {/* Schedule / Timeline Column */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Today's Schedule: {selectedResource}</h3>
            <span className="text-xs text-text-secondary">All times in local time</span>
          </div>

          <div className="flex flex-col gap-3">
            {resourceBookings.length > 0 ? (
              resourceBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-lg bg-[#e0f2fe] border-l-4 border-accent-primary flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-sm text-accent-primary">
                      {b.startTime} – {b.endTime}
                    </span>
                    <p className="text-sm text-text-primary font-medium mt-1">
                      Booked by: {b.bookedBy}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-accent-primary">
                    {b.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary py-8 text-center">
                No active bookings for {selectedResource} today. Slot is open!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceBooking;
