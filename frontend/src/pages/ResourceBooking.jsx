import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const ResourceBooking = () => {
  const [selectedResource, setSelectedResource] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingStartTime, setBookingStartTime] = useState('10:00');
  const [bookingEndTime, setBookingEndTime] = useState('11:00');
  const [overlapError, setOverlapError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { bookings, assets, addBooking, cancelBooking } = useAppStore();
  const { user } = useAuthStore();
  
  const sharedAssets = assets.filter(a => a.isShared);

  useEffect(() => {
    if (sharedAssets.length > 0 && !selectedResource) {
      setSelectedResource(sharedAssets[0].name);
    }
  }, [sharedAssets, selectedResource]);

  // Auto-dismiss messages
  useEffect(() => {
    if (successMessage || overlapError) {
      const timer = setTimeout(() => { setSuccessMessage(null); setOverlapError(null); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, overlapError]);

  const resourceBookings = bookings
    .filter(b => b.resource === selectedResource && b.date === bookingDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const checkOverlap = (start, end) => {
    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const reqStart = toMin(start);
    const reqEnd = toMin(end);

    for (const booking of resourceBookings) {
      if (booking.status === 'Cancelled') continue;
      const existStart = toMin(booking.startTime);
      const existEnd = toMin(booking.endTime);
      if (reqStart < existEnd && reqEnd > existStart) return booking;
    }
    return null;
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setOverlapError(null); setSuccessMessage(null);

    if (bookingStartTime >= bookingEndTime) {
      setOverlapError('End time must be after start time.');
      return;
    }

    const conflict = checkOverlap(bookingStartTime, bookingEndTime);
    if (conflict) {
      setOverlapError(`Requested slot overlaps with existing booking by ${conflict.bookedBy} (${conflict.startTime}-${conflict.endTime}).`);
    } else {
      addBooking({
        resource: selectedResource,
        date: bookingDate,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        bookedBy: user?.name || 'Current User',
        status: 'Upcoming',
      });
      setSuccessMessage(`Booking confirmed for ${selectedResource} from ${bookingStartTime} to ${bookingEndTime}.`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Upcoming': return 'badge-info';
      case 'Ongoing': return 'badge-success';
      case 'Completed': return 'badge-neutral';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex justify-between items-center mb-6 shrink-0 flex-row">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Resource Booking</h1>
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
              <select className="select" value={selectedResource} onChange={e => setSelectedResource(e.target.value)}>
                {sharedAssets.map(a => <option key={a.id} value={a.name}>{a.name} ({a.category})</option>)}
              </select>
            </div>

            <div>
              <label className="label">Date</label>
              <input type="date" className="input" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <input type="time" className="input" required value={bookingStartTime} onChange={e => setBookingStartTime(e.target.value)} step="1800" />
              </div>
              <div>
                <label className="label">End Time</label>
                <input type="time" className="input" required value={bookingEndTime} onChange={e => setBookingEndTime(e.target.value)} step="1800" />
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-border-color">
              <button type="submit" className="btn btn-primary w-full text-base py-3">
                <Plus size={18} /> Confirm Booking
              </button>
            </div>
          </form>
        </div>

        {/* Schedule / Timeline Column */}
        <div className="lg:col-span-2 card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-border-color gap-2">
            <div>
              <h3 className="text-lg font-bold m-0 text-text-primary">Schedule: <span className="text-accent-primary">{selectedResource || 'Select a resource'}</span></h3>
              <p className="text-xs text-text-secondary mt-1">Date: <strong>{bookingDate}</strong></p>
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider bg-bg-primary px-3 py-1 rounded-full border border-border-color">Local Time</span>
          </div>

          <div className="flex flex-col gap-4">
            {resourceBookings.length > 0 ? (
              resourceBookings.map((b) => (
                <div key={b.id} className={`p-4 rounded-xl bg-bg-primary border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 relative overflow-hidden transition-colors ${b.status === 'Cancelled' ? 'border-border-color opacity-60' : 'border-border-color hover:border-accent-primary shadow-sm'}`}>
                  {b.status !== 'Cancelled' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-primary"></div>}
                  
                  <div className={b.status !== 'Cancelled' ? 'pl-2' : ''}>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${b.status === 'Cancelled' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                        {b.startTime} <span className="text-sm font-normal mx-1 text-text-secondary">to</span> {b.endTime}
                      </span>
                      <span className={`badge ${getStatusBadge(b.status)} text-[10px]`}>{b.status}</span>
                    </div>
                    <p className="text-sm text-text-secondary font-medium mt-1 m-0">
                      Booked by: <strong className={b.status === 'Cancelled' ? 'text-text-secondary' : 'text-text-primary'}>{b.bookedBy}</strong>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {b.status === 'Upcoming' && (
                      <button onClick={() => cancelBooking(b.id)} className="btn btn-outline text-alert-danger border-alert-danger hover:bg-alert-danger hover:text-white py-1.5 px-3 text-xs">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl bg-bg-primary/50">
                <Calendar size={32} className="mb-3 text-text-secondary opacity-50" />
                <p className="text-base font-medium text-text-primary m-0">No active bookings for this date.</p>
                <p className="text-sm text-text-secondary mt-1 m-0">The resource is completely open.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceBooking;
