import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import BookingCard from '../components/BookingCard';

function Waitlist() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/user_waitlists')
       .then(res => setWaitlist(res.data))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  const cancelWaitlist = async (id) => {
    if (!window.confirm("Are you sure you want to cancel your waiting list request? Your deposit will be refunded.")) return;
    try {
        await api.post(`/bookings/waitlist/${id}/cancel`);
        setWaitlist(waitlist.map(w => w.id === id ? { ...w, status: 'refunded' } : w));
        alert("Waitlist request cancelled successfully. A confirmation email has been sent.");
    } catch (err) {
        alert(err.response?.data?.detail || "Failed to cancel waitlist");
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center min-h-[85vh] relative overflow-hidden p-6 sm:p-10 -mx-4 sm:-mx-8 rounded-[2.5rem]">
      <div className="max-w-3xl w-full bg-[#121212]/70 backdrop-blur-xl border border-lavender/30 shadow-[0_0_40px_rgba(150,123,182,0.15)] rounded-[2rem] p-8 md:p-12 relative z-10">
          <div>
              <h1 className="text-3xl font-extrabold text-lavender-light mb-2 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  Your Waiting List
              </h1>
              <p className="text-gray-400">Track your queue position. You will be automatically assigned a seat if another passenger cancels.</p>
          </div>
      </div>

      <div className="flex flex-col gap-4 max-w-3xl w-full relative z-10">
          {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center w-full h-full">
                  <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400 font-bold text-lg animate-pulse">Loading Waitlist...</p>
              </div>
          ) : waitlist.length === 0 ? (
              <div className="bg-[#1a1a1a]/60 backdrop-blur-md rounded-2xl p-12 text-center border border-lavender/30 flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 text-lavender/40 mb-4" />
                  <p className="text-xl text-gray-400 font-bold">You have no active waiting list requests.</p>
              </div>
          ) : waitlist.map((w, index) => (
              <BookingCard 
                  key={w.id}
                  type="waitlist"
                  {...w}
                  onCancel={cancelWaitlist}
              />
          ))}
      </div>
    </div>
  );
}

export default Waitlist;
