import React from 'react';
import { motion } from 'framer-motion';

function BookingCard({
    id,
    type, // 'booking' vs 'waitlist'
    route_from,
    route_to,
    travel_date,
    departure_time,
    arrival_time,
    status,
    seat_id, // For bookings
    position, // For waitlists
    gender,
    amount, // For bookings
    amount_paid, // For waitlists
    created_at,
    bus_id,
    onCancel
}) {
    // Determine specific styles and badges based on status and type
    const isWaitlist = type === 'waitlist';
    const amountDisplay = isWaitlist ? amount_paid : amount;

    let statusStyle = 'bg-gray-500/20 text-gray-400';
    if (status === 'booked' || status === 'confirmed') statusStyle = 'bg-green-500/20 text-green-400';
    if (status === 'ongoing') statusStyle = 'bg-indigo-500/20 text-indigo-400';
    if (status === 'completed') statusStyle = 'bg-purple-500/20 text-purple-400';
    if (status === 'waiting') statusStyle = 'bg-yellow-500/20 text-yellow-400';
    if (status === 'cancelled' || status === 'refunded' || status === 'unsuccessful') statusStyle = 'bg-red-500/20 text-red-400';

    const canCancel = (isWaitlist && status === 'waiting') || (!isWaitlist && status === 'booked');

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full bg-[#1a1a1a]/70 backdrop-blur-lg border border-lavender/30 rounded-2xl p-6 relative z-10 flex flex-col md:flex-row justify-between gap-6 hover:shadow-[0_0_20px_rgba(150,123,182,0.15)] transition-all overflow-hidden relative"
        >
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <p className="text-gray-400 text-sm">
                        {isWaitlist ? `Waitlist ID: ${id}` : `Booking ID: ${id}`} • Bus {bus_id}
                    </p>
                    <h3 className="text-xl font-bold text-lavender-light mt-1">
                        {route_from} → {route_to}
                    </h3>
                    <p className="text-sm font-bold text-lavender mt-1 mb-2">
                        Journey Date: {new Date(travel_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm font-medium text-gray-300 bg-white/5 inline-block px-2 py-0.5 rounded border border-white/10">
                        {departure_time} → {arrival_time}
                    </p>
                </div>

                <div className="flex gap-4 mt-4 items-center flex-wrap">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyle}`}>
                        {status.toUpperCase()}
                    </span>

                    {isWaitlist ? (
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white font-mono">
                            Waitlist Pos: #{position}
                        </span>
                    ) : (
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white">
                            Seat {seat_id}
                        </span>
                    )}

                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-white">
                        {gender}
                    </span>
                </div>
            </div>

            <div className="md:text-right flex flex-col items-start md:items-end justify-between min-w-[120px]">
                <div className="flex flex-col items-start md:items-end w-full">
                    <p className="text-2xl font-bold text-white mb-1">₹{amountDisplay}</p>
                    <p className="text-gray-400 text-xs">Booked on:</p>
                    <p className="text-gray-400 text-sm">{new Date(created_at).toLocaleDateString()}</p>
                </div>

                {canCancel && (
                    <button
                        onClick={() => onCancel(id)}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-xl text-sm font-bold transition-all border border-red-500/30 w-full mt-4 md:mt-0 shadow-sm shadow-red-500/10"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Status Colored Edge Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'booked' || status === 'confirmed' ? 'bg-green-500' :
                    status === 'ongoing' ? 'bg-indigo-500' :
                        status === 'completed' ? 'bg-purple-500' :
                            status === 'waiting' ? 'bg-yellow-500' :
                                'bg-red-500'
                }`}></div>
        </motion.div>
    );
}

export default BookingCard;
