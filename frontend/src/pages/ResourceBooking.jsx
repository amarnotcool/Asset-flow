import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const ResourceBooking = () => {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingStartTime, setBookingStartTime] = useState('10:00');
  const [bookingEndTime, setBookingEndTime] = useState('11:00');
  const [overlapError, setOverlapError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { assets, bookings, addBooking, cancelBooking, syncBackendData } = useAppStore();
  const { user } = useAuthStore();
  
  useEffect(() => { syncBackendData(); }, []);

  const sharedAssets = assets.filter(a => a.is_shared || a.status === 'Available');

  useEffect(() => {
    if (sharedAssets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(sharedAssets[0].id.toString());
    }
  }, [sharedAssets, selectedAssetId]);

  // Auto-dismiss messages
  useEffect(() => {
    if (successMessage || overlapError) {
      const timer = setTimeout(() => { setSuccessMessage(null); setOverlapError(null); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, overlapError]);

  const selectedAsset = assets.find(a => a.id === parseInt(selectedAssetId));
  const resourceBookings = bookings
    .filter(b => b.asset_id === parseInt(selectedAssetId) && b.start_time?.startsWith(bookingDate))
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

  const checkOverlap = (start, end) => {
    const startObj = new Date(start);
    const endObj = new Date(end);

    for (const booking of resourceBookings) {
      if (booking.status === 'Cancelled') continue;
      const existStart = new Date(booking.start_time);
      const existEnd = new Date(booking.end_time);
      if (startObj < existEnd && endObj > existStart) return booking;
    }
    return null;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setOverlapError(null); setSuccessMessage(null);

    if (!bookingStartTime || !bookingEndTime) {
      setOverlapError('Please select start and end times.');
      return;
    }

    const startDt = `${bookingDate}T${bookingStartTime}:00`;
    const endDt = `${bookingDate}T${bookingEndTime}:00`;

    if (new Date(startDt) >= new Date(endDt)) {
      setOverlapError('End time must be after start time.');
      return;
    }

    const conflict = checkOverlap(startDt, endDt);
    if (conflict) {
      setOverlapError(`Requested slot overlaps with existing booking by ${conflict.user_name || 'someone'} (${formatTime(conflict.start_time)}-${formatTime(conflict.end_time)}).`);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await addBooking({
        asset_id: parseInt(selectedAssetId),
        start_time: startDt,
        end_time: endDt,
      });
      setSuccessMessage(`Booking confirmed for ${selectedAsset?.name || 'resource'}.`);
    } catch (err) {
      setOverlapError(err.response?.data?.message || 'Booking failed. Time slot may overlap.');
    }
    setLoading(false);
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

  const formatTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
              <label className="label">Select Resource</label>
              <select className="select" value={selectedAssetId} onChange={e => { setSelectedAssetId(e.target.value); setOverlapError(null); setSuccessMessage(null); }} required>
                <option value="">Choose a resource...</option>
                {sharedAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.asset_tag})</option>
                ))}
              </select>
              {assets.length === 0 && <p className="text-xs text-text-secondary mt-1">No assets available. Register assets first.</p>}
            </div>

            <div>
              <label className="label">Date</label>
              <input type="date" className="input" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <input type="time" className="input" required value={bookingStartTime} onChange={e => { setBookingStartTime(e.target.value); setOverlapError(null); }} step="1800" />
              </div>
              <div>
                <label className="label">End Time</label>
                <input type="time" className="input" required value={bookingEndTime} onChange={e => { setBookingEndTime(e.target.value); setOverlapError(null); }} step="1800" />
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-border-color">
              <button type="submit" disabled={loading || !selectedAssetId} className="btn btn-primary w-full text-base py-3">
                <Plus size={18} /> {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-border-color gap-2">
            <div>
              <h3 className="text-lg font-bold m-0 text-text-primary">Schedule: <span className="text-accent-primary">{selectedAsset?.name || 'Select a resource'}</span></h3>
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
                        {formatTime(b.start_time)} <span className="text-sm font-normal mx-1 text-text-secondary">to</span> {formatTime(b.end_time)}
                      </span>
                      <span className={`badge ${getStatusBadge(b.status)} text-[10px]`}>{b.status}</span>
                    </div>
                    <p className="text-sm text-text-secondary font-medium mt-1 m-0">
                      Booked by: <strong className={b.status === 'Cancelled' ? 'text-text-secondary' : 'text-text-primary'}>{b.user_name || 'You'}</strong>
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
                <p className="text-base font-medium text-text-primary m-0">{selectedAssetId ? 'No active bookings for this date.' : 'Select a resource to view schedule.'}</p>
                <p className="text-sm text-text-secondary mt-1 m-0">{selectedAssetId ? 'The resource is completely open.' : 'Book a time slot using the form.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceBooking;
