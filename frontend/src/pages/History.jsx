import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import BookingCard from '../components/BookingCard';

function History() {
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    api.get('/bookings/history')
       .then(res => setBookings(res.data))
       .catch(console.error);
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this ticket?")) return;
    try {
        await api.post(`/bookings/${id}/cancel`);
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
        alert(err.response?.data?.detail || "Failed to cancel ticket");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full relative min-h-[85vh] p-6 sm:p-10 -mx-4 sm:-mx-8 rounded-[2.5rem] overflow-hidden">
        <h1 className="text-3xl font-extrabold text-black mb-4 relative z-10 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
            My Bookings
        </h1>

        <div className="flex flex-col gap-4">
            {bookings.length === 0 ? (
                <div className="bg-[#1a1a1a]/70 backdrop-blur-lg border border-lavender/30 rounded-2xl p-10 text-center relative z-10">No bookings found.</div>
            ) : (
                bookings.map(b => (
                    <BookingCard 
                        key={b.id}
                        type="booking"
                        {...b}
                        onCancel={cancelBooking}
                    />
                ))
            )}
        </div>
    </div>
  );
}

export default History;
