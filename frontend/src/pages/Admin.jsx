import React, { useEffect, useState } from 'react';
import api from '../api';

function Admin() {
  const [analytics, setAnalytics] = useState({ total_bookings: 0, revenue: 0 });
  const [buses, setBuses] = useState([]);
  
  useEffect(() => {
    api.get('/admin/analytics').then(res => setAnalytics(res.data)).catch(console.error);
    api.get('/buses').then(res => setBuses(res.data)).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-8 font-sans w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white mb-2">
            Admin Dashboard
        </h1>

        <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="bg-[#121212] flex-1 p-8 rounded-3xl border border-lavender/20 shadow-xl flex flex-col items-center justify-center">
                <span className="text-gray-400 font-medium mb-2 uppercase tracking-wide">Total Revenue</span>
                <span className="text-5xl font-black text-green-400">₹{analytics.revenue}</span>
            </div>
            <div className="bg-[#121212] flex-1 p-8 rounded-3xl border border-lavender/20 shadow-xl flex flex-col items-center justify-center">
                <span className="text-gray-400 font-medium mb-2 uppercase tracking-wide">Total Bookings</span>
                <span className="text-5xl font-black text-lavender-light">{analytics.total_bookings}</span>
            </div>
        </div>

        <h2 className="text-2xl font-bold text-lavender break-words mb-6">Manage Buses</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-lavender-dark/30 text-gray-400 text-sm uppercase">
                        <th className="py-4 font-normal">ID</th>
                        <th className="py-4 font-normal">Name</th>
                        <th className="py-4 font-normal">Route</th>
                        <th className="py-4 font-normal">AC</th>
                        <th className="py-4 font-normal">Price (Lower)</th>
                    </tr>
                </thead>
                <tbody>
                    {buses.length === 0 ? (
                        <tr><td colSpan="5" className="py-4 text-center">No buses found</td></tr>
                    ) : buses.map(b => (
                        <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4">{b.id}</td>
                            <td className="py-4 font-semibold">{b.name}</td>
                            <td className="py-4">{b.route_from} → {b.route_to}</td>
                            <td className="py-4">{b.is_ac ? 'Yes' : 'No'}</td>
                            <td className="py-4">₹{b.base_price_lower}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

export default Admin;
