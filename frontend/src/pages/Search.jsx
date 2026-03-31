import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Search as SearchIcon, ArrowRight } from 'lucide-react';

const karnatakaRoutes = [
  { from: 'Bengaluru', to: 'Mysuru', type: 'Premium AC Seat', departure: '19:00', arrival: '22:30', price: 500 },
  { from: 'Bengaluru', to: 'Mangaluru', type: 'Sleeper AC', departure: '20:00', arrival: '05:00', price: 900 },
  { from: 'Bengaluru', to: 'Hubballi', type: 'Volvo Multi-Axle', departure: '20:00', arrival: '04:00', price: 1200 },
  { from: 'Bengaluru', to: 'Belagavi', type: 'Sleeper Non-AC', departure: '19:00', arrival: '05:00', price: 800 },
  { from: 'Bengaluru', to: 'Shivamogga', type: 'Premium AC Seat', departure: '20:00', arrival: '03:00', price: 700 },
  { from: 'Mysuru', to: 'Mangaluru', type: 'Premium AC Seat', departure: '20:00', arrival: '03:00', price: 700 },
  { from: 'Mysuru', to: 'Bengaluru', type: 'Volvo Multi-Axle', departure: '19:30', arrival: '23:00', price: 700 },
  { from: 'Hubballi', to: 'Bengaluru', type: 'Sleeper AC', departure: '20:00', arrival: '04:00', price: 1100 },
  { from: 'Mangaluru', to: 'Udupi', type: 'AC Seater', departure: '19:00', arrival: '20:30', price: 150 },
  { from: 'Shivamogga', to: 'Mangaluru', type: 'Non-AC Seater', departure: '20:00', arrival: '02:00', price: 400 },
];

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [date, setDate] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [journeyDate, setJourneyDate] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if(!from || !to || !date) return alert("Please fill all fields");
    navigate(`/buses?from=${from}&to=${to}&date=${date}`);
  };

  const autofillRoute = (route) => {
      setFrom(route.from);
      setTo(route.to);
  };

  return (
    <div className="flex flex-col gap-10 relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10 min-h-[85vh] -mx-4 sm:-mx-8">
      {/* Search Header Configurator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212]/60 backdrop-blur-xl p-8 rounded-3xl border border-lavender/30 shadow-[0_0_40px_rgba(230,230,250,0.05)] relative z-10"
      >
          <h2 className="text-3xl font-bold text-lavender-light mb-6 flex items-center gap-3">
              <SearchIcon className="w-8 h-8" />
              Find Your Bus
          </h2>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-4 text-lavender-dark w-5 h-5" />
                  <input 
                      type="text" 
                      placeholder="Leaving from" 
                      className="w-full bg-[#0f0f0f] border border-lavender/30 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender transition-all"
                      value={from} onChange={e=>setFrom(e.target.value)} required 
                  />
              </div>
              <div className="flex items-center justify-center">
                  <ArrowRight className="text-lavender-dark/50 hidden md:block" />
              </div>
              <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-4 text-lavender-dark w-5 h-5" />
                  <input 
                      type="text" 
                      placeholder="Going to" 
                      className="w-full bg-[#0f0f0f] border border-lavender/30 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender transition-all"
                      value={to} onChange={e=>setTo(e.target.value)} required 
                  />
              </div>
              <div className="flex-1 relative">
                  <Calendar className="absolute left-4 top-4 text-lavender-dark w-5 h-5" />
                  <input 
                      type="date" 
                      className="w-full bg-[#0f0f0f] border border-lavender/30 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender transition-all [color-scheme:dark]"
                      value={date} onChange={e=>setDate(e.target.value)} required 
                  />
              </div>
              <button 
                  type="submit" 
                  className="bg-gradient-to-r from-lavender-dark to-lavender text-black font-bold px-8 py-4 rounded-xl transition-all md:w-auto w-full"
              >
                  Search
              </button>
          </form>
      </motion.div>

      {/* Preconfigured Routes */}
      <div>
          <h3 className="text-2xl font-bold text-gray-200 mb-6 flex items-center gap-2">
              Explore Popular Routes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {karnatakaRoutes.map((r, i) => (
                  <motion.div 
                      onClick={() => setSelectedRoute({ from: r.from, to: r.to })}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={i} 
                      className="bg-[#121212]/70 backdrop-blur-lg p-6 rounded-3xl border border-lavender/30 hover:border-lavender/80 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(150,123,182,0.2)] transition-all group relative overflow-hidden flex flex-col justify-between h-40 z-10"
                  >
                      {/* Destination Header */}
                      <div className="flex justify-between items-center z-10">
                          <span className="text-xl font-bold text-white group-hover:text-lavender-light transition-colors">{r.from}</span>
                          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-lavender transition-colors" />
                          <span className="text-xl font-bold text-white group-hover:text-lavender-light transition-colors">{r.to}</span>
                      </div>
                      
                      {/* Sub Details */}
                      <div className="flex justify-between items-end mt-4 z-10">
                          <div>
                              <p className="text-xs text-lavender/80 font-semibold mb-1 uppercase tracking-wider">{r.type}</p>
                              <p className="text-sm text-gray-400 font-medium">{r.departure} - {r.arrival} {r.arrival < r.departure ? '(Next Day)' : ''}</p>
                          </div>
                          <div className="text-right">
                              <span className="text-xs text-gray-500 block mb-1">Starting from</span>
                              <span className="text-xl font-black text-green-400">₹{r.price}</span>
                          </div>
                      </div>
                      
                      {/* Card glow effect */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/5 rounded-full blur-[40px] group-hover:bg-lavender/10 transition-colors pointer-events-none"></div>
                  </motion.div>
              ))}
          </div>
      </div>

      {/* Date Picker Modal */}
      {selectedRoute && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121212] border border-lavender/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(150,123,182,0.2)]">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white mb-2">Select Journey Date</h3>
                  <p className="text-gray-400 text-sm mb-6">{selectedRoute.from} → {selectedRoute.to}</p>
                  
                  <input 
                      type="date"
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} // Prevents past dates
                      className="w-full bg-[#0f0f0f] border border-lavender/30 text-white rounded-xl px-4 py-4 mb-6 focus:outline-none focus:border-lavender focus:ring-1 focus:ring-lavender transition-all [color-scheme:dark]"
                  />
                  
                  <div className="flex gap-4">
                      <button onClick={() => { setSelectedRoute(null); setJourneyDate(''); }} className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors">
                          Cancel
                      </button>
                      <button 
                          onClick={() => {
                              if(!journeyDate) return alert("Please select a date!");
                              if(!localStorage.getItem('token')) {
                                  setShowAuthModal(true);
                                  return;
                              }
                              navigate(`/buses?from=${selectedRoute.from}&to=${selectedRoute.to}&date=${journeyDate}`);
                          }} 
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-lavender-dark to-lavender text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(150,123,182,0.6)] transition-all"
                      >
                          Continue
                      </button>
                  </div>
              </motion.div>
          </div>
      )}

      {/* Auth Intercept Modal */}
      {showAuthModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 text-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121212] border border-lavender/30 rounded-3xl p-10 max-w-sm w-full shadow-[0_0_60px_rgba(150,123,182,0.3)]">
                  <div className="w-16 h-16 bg-gradient-to-br from-lavender to-purple-800 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(150,123,182,0.5)]">
                      <span className="text-white font-black text-4xl">N</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Authentication Required</h3>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">Please login or sign up to continue booking your journey from {selectedRoute?.from} to {selectedRoute?.to}.</p>
                  
                  <div className="flex flex-col gap-4">
                      <button 
                          onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/buses?from=${selectedRoute.from}&to=${selectedRoute.to}&date=${journeyDate}`)}`)} 
                          className="w-full py-4 px-4 bg-gradient-to-r from-lavender-dark to-lavender text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(150,123,182,0.6)] transition-all"
                      >
                          Login
                      </button>
                      <button 
                          onClick={() => navigate(`/signup?redirect=${encodeURIComponent(`/buses?from=${selectedRoute.from}&to=${selectedRoute.to}&date=${journeyDate}`)}`)} 
                          className="w-full py-4 px-4 bg-white/5 border border-lavender/30 text-lavender font-bold rounded-xl hover:bg-lavender/10 hover:text-white transition-all"
                      >
                          Sign Up
                      </button>
                      <button onClick={() => setShowAuthModal(false)} className="mt-2 text-gray-500 hover:text-white text-sm font-bold transition-colors">
                          Cancel
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
    </div>
  );
}

export default SearchPage;
