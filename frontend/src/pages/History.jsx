import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import BookingCard from '../components/BookingCard';

function History() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('booked');

    useEffect(() => {
        api.get('/bookings/history')
            .then(res => setBookings(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'all') return true;
        return b.status.toLowerCase() === activeTab.toLowerCase();
    });

    const cancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this ticket?")) return;
        try {
            await api.post(`/bookings/${id}/cancel`);
            setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
            alert("Ticket cancelled successfully. A confirmation email has been sent to your registered address.");
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to cancel ticket");
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full relative min-h-[85vh] p-6 sm:p-10 -mx-4 sm:-mx-8 rounded-[2.5rem] overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <h1 className="text-3xl font-extrabold text-white relative z-10 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                    My Bookings
                </h1>

                <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl relative z-10">
                    {['booked', 'ongoing', 'completed', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab
                                    ? 'bg-lavender text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center relative z-10 w-full h-full">
                        <div className="w-16 h-16 border-4 border-lavender/20 border-t-lavender rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 font-bold text-lg animate-pulse">Loading Bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-[#1a1a1a]/70 backdrop-blur-lg border border-lavender/30 rounded-2xl p-10 text-center relative z-10 text-white font-medium">
                        No {activeTab} bookings found.
                    </div>
                ) : (
                    filteredBookings.map(b => (
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
