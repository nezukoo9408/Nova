import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Banknote, AlertTriangle } from 'lucide-react';

function Payment() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('pending_booking');
    if (!data) {
      navigate('/');
      return;
    }
    try {
      setBookingData(JSON.parse(data));
    } catch {
      navigate('/');
    }
    setParsed(true);
  }, [navigate]);

  const handleMarkAsPaid = async () => {
    if (!bookingData) return;
    setLoading(true);
    try {
      if (bookingData.isWaitlist) {
        await api.post('/bookings/waitlist', {
          bus_id: bookingData.busId,
          seat_id: 'WAITING',
          travel_date: bookingData.date,
          gender: bookingData.seats[0]?.gender || 'Male',
          amount: bookingData.totalAmount,
        });
        localStorage.removeItem('pending_booking');
        navigate('/waitlist');
        return;
      }

      const confirmedIds = [];
      for (const seat of bookingData.seats) {
        const res = await api.post('/bookings/confirm', {
          bus_id: bookingData.busId,
          seat_id: seat.id,
          travel_date: bookingData.date,
          gender: seat.gender,
          amount: bookingData.totalAmount / bookingData.seats.length,
        });
        confirmedIds.push(res.data.booking_id);
      }
      localStorage.removeItem('pending_booking');
      navigate(`/receipt?ids=${confirmedIds.join(',')}`);
    } catch (err) {
      alert('Payment recording failed. ' + (err.response?.data?.detail || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('pending_booking');
    navigate('/');
  };

  if (!parsed) return null;
  if (!bookingData) return null;

  const isWaitlist = bookingData.isWaitlist;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className={`rounded-t-3xl p-6 text-center ${isWaitlist ? 'bg-yellow-500/10 border border-yellow-500/30 border-b-0' : 'bg-lavender/10 border border-lavender/30 border-b-0'}`}>
          <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${isWaitlist ? 'bg-yellow-500/20' : 'bg-lavender/20'}`}>
            {isWaitlist ? <Clock className="w-7 h-7 text-yellow-400" /> : <ShieldCheck className="w-7 h-7 text-lavender" />}
          </div>
          <h2 className={`text-2xl font-extrabold ${isWaitlist ? 'text-yellow-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white'}`}>
            {isWaitlist ? 'Complete Waitlist Deposit' : 'Complete Payment'}
          </h2>
          {isWaitlist && (
            <p className="text-gray-400 text-sm mt-1">You will be added to the waiting queue after payment</p>
          )}
        </div>

        {/* Main Card */}
        <div className={`bg-[#121212] p-8 border-x ${isWaitlist ? 'border-yellow-500/30' : 'border-lavender/30'}`}>

          {/* Booking Summary */}
          <div className="bg-black/50 rounded-2xl p-5 mb-6 space-y-3">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Booking Summary</p>
            
            {isWaitlist ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Route</span>
                  <span className="font-semibold text-white">{bookingData.routeFrom} → {bookingData.routeTo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Bus</span>
                  <span className="font-semibold text-white">{bookingData.busName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date</span>
                  <span className="font-semibold text-white">{bookingData.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Type</span>
                  <span className="font-semibold text-yellow-400 bg-yellow-500/10 px-3 py-0.5 rounded-full text-sm border border-yellow-500/20">Waitlist Position</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gender</span>
                  <span className="font-semibold text-white capitalize">{bookingData.seats[0]?.gender}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Seats</span>
                  <span className="font-semibold text-white">{bookingData.seats?.map(s => s.id).join(', ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Date</span>
                  <span className="font-semibold text-white">{bookingData.date}</span>
                </div>
              </>
            )}

            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-green-400" /> Total
              </span>
              <span className="text-2xl font-black text-green-400">₹{bookingData.totalAmount}</span>
            </div>
          </div>

          {/* Waitlist notice box */}
          {isWaitlist && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-200/80 text-xs leading-relaxed">
                This is the maximum seat price. If you get assigned a lower-priced seat, the difference will be refunded. If no seat becomes available, the full amount will be refunded.
              </p>
            </div>
          )}

          {/* QR Payment */}
          <div className="bg-black/50 rounded-2xl p-5 mb-6 flex flex-col items-center">
            <p className="text-gray-400 text-sm mb-3">Scan QR or pay via UPI</p>
            <div className="w-40 h-40 bg-white p-2 rounded-xl mb-3 flex items-center justify-center">
              <span className="text-black font-bold text-xs text-center">QR CODE PLACEHOLDER</span>
            </div>
            <p className="text-lavender font-mono text-sm">UPI: novabus@upi</p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className={`rounded-b-3xl p-6 flex gap-4 border border-t-0 ${isWaitlist ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-lavender/5 border-lavender/30'}`}>
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMarkAsPaid}
            disabled={loading}
            className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all disabled:opacity-60 ${
              isWaitlist
                ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'
            }`}
          >
            {loading ? 'Processing...' : isWaitlist ? 'Confirm Deposit' : 'Mark as Paid'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Payment;
