import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

function Receipt() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idsParam = searchParams.get('ids');
  
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    if(!idsParam) return;
    const ids = idsParam.split(',').map(Number);
    // Fetch user history and filter by these IDs
    api.get('/bookings/history').then(res => {
        const filtered = res.data.filter(b => ids.includes(b.id));
        setBookings(filtered);
    }).catch(console.error);
  }, [idsParam]);

  if(bookings.length === 0) return <div className="min-h-screen text-center p-20">Loading Receipt...</div>;

  const totalAmount = bookings.reduce((sum, b) => sum + b.amount, 0);
  const busId = bookings[0].bus_id;
  const travelDate = bookings[0].travel_date;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-10">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white text-black w-full max-w-lg p-10 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(230,230,250,0.2)]"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-lavender-dark to-lavender"></div>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">NOVA BUS</h1>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">E-Ticket Receipt</p>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 py-6 mb-6">
            <div className="flex justify-between mb-4">
                <span className="text-gray-500 font-medium">Bus ID</span>
                <span className="font-bold">{busId}</span>
            </div>
            <div className="flex justify-between mb-4">
                <span className="text-gray-500 font-medium">Journey Date</span>
                <span className="font-bold">{travelDate}</span>
            </div>
            <div className="flex justify-between mb-4">
                <span className="text-gray-500 font-medium">Payment Status</span>
                <span className="font-bold text-green-600 uppercase">Success</span>
            </div>
        </div>

        <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Passenger Details</h3>
            {bookings.map(b => (
                <div key={b.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-2">
                    <span className="font-semibold text-lg text-lavender-dark">Seat {b.seat_id}</span>
                    <span className="text-sm bg-gray-200 px-3 py-1 rounded-full">{b.gender}</span>
                    <span className="font-bold text-gray-700">₹{b.amount}</span>
                </div>
            ))}
        </div>

        <div className="border-t-4 border-gray-800 pt-4 flex justify-between items-end">
            <span className="text-gray-500 font-bold uppercase">Total Paid</span>
            <span className="text-4xl font-extrabold text-black">₹{totalAmount}</span>
        </div>

        <div className="mt-10 flex gap-4">
            <Link to="/history" className="flex-1 py-3 text-center border-2 border-black rounded-lg font-bold hover:bg-black hover:text-white transition-colors">View History</Link>
            <Link to="/" className="flex-1 py-3 text-center bg-lavender text-black rounded-lg font-bold hover:bg-lavender-dark hover:text-white transition-colors">Book Another</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Receipt;
