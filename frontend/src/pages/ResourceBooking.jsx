import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const ResourceBooking = () => {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [overlapError, setOverlapError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { assets, bookings, addBooking, syncBackendData } = useAppStore();

  useEffect(() => { syncBackendData(); }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter shared/bookable assets
  const sharedAssets = assets.filter(a => a.is_shared || a.status === 'Available');
  const selectedAsset = assets.find(a => a.id === parseInt(selectedAssetId));
  const resourceBookings = bookings.filter(b => b.asset_id === parseInt(selectedAssetId));

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setOverlapError(null);
    setSuccessMessage(null);

    if (!bookingStart || !bookingEnd) {
      setOverlapError('Please select start and end times.');
      return;
    }

    if (new Date(bookingStart) >= new Date(bookingEnd)) {
      setOverlapError('End time must be after start time.');
      return;
    }

    setLoading(true);
    try {
      await addBooking({
        asset_id: parseInt(selectedAssetId),
        start_time: bookingStart,
        end_time: bookingEnd,
      });
      setSuccessMessage(`Booking confirmed for ${selectedAsset?.name || 'resource'}.`);
      setBookingStart('');
      setBookingEnd('');
    } catch (err) {
      setOverlapError(err.response?.data?.message || 'Booking failed. Time slot may overlap.');
    }
    setLoading(false);
  };

  const formatTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <input type="datetime-local" className="input" value={bookingStart} onChange={e => { setBookingStart(e.target.value); setOverlapError(null); }} required />
              </div>
              <div>
                <label className="label">End Time</label>
                <input type="datetime-local" className="input" value={bookingEnd} onChange={e => { setBookingEnd(e.target.value); setOverlapError(null); }} required />
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-border-color">
              <button type="submit" disabled={loading || !selectedAssetId} className="btn btn-primary w-full sm:w-auto">
                <Plus size={16} /> {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-border-color gap-2">
            <h3 className="text-lg font-bold m-0 text-text-primary">Schedule: <span className="text-accent-primary">{selectedAsset?.name || 'Select a resource'}</span></h3>
          </div>

          <div className="flex flex-col gap-4">
            {resourceBookings.length > 0 ? (
              resourceBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-bg-primary border border-border-color flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 relative overflow-hidden shadow-sm hover:border-accent-primary transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-primary"></div>
                  <div className="pl-2">
                    <span className="font-bold text-lg text-text-primary flex items-center gap-2">
                      {formatTime(b.start_time)} <span className="text-text-secondary font-normal text-sm">to</span> {formatTime(b.end_time)}
                    </span>
                    <p className="text-sm text-text-secondary font-medium mt-1 m-0">
                      Booked by: <span className="text-text-primary">{b.user_name || 'You'}</span>
                    </p>
                  </div>
                  <span className="badge badge-info self-start sm:self-auto px-3 py-1 text-xs">{b.status}</span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl bg-bg-primary">
                <Calendar size={32} className="mb-3 text-text-secondary opacity-50" />
                <p className="text-base font-medium text-text-primary m-0">{selectedAssetId ? 'No bookings for this resource.' : 'Select a resource to view schedule.'}</p>
                <p className="text-sm text-text-secondary mt-1 m-0">Book a time slot using the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceBooking;
