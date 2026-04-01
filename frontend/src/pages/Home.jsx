import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Search, MapPin, Tag, Star, Calendar, Moon, GraduationCap } from 'lucide-react';

const featuredRoutes = [
  { id: 1, from: 'Bengaluru', to: 'Mysuru', desc: 'Heritage Highway' },
  { id: 2, from: 'Bengaluru', to: 'Mangaluru', desc: 'Coastal Express' },
  { id: 3, from: 'Bengaluru', to: 'Hubballi', desc: 'Commercial Route' },
  { id: 4, from: 'Bengaluru', to: 'Belagavi', desc: 'Long Highway' },
  { id: 5, from: 'Bengaluru', to: 'Shivamogga', desc: 'Forest Drive' },
  { id: 6, from: 'Mysuru', to: 'Mangaluru', desc: 'Western Ghats' },
];

const offers = [
  { id: 1, title: 'First Ride Offer', desc: 'Get ₹200 OFF on your first booking.', code: 'FIRST200', icon: <Star className="w-7 h-7 text-yellow-400" /> },
  { id: 2, title: 'Weekend Special', desc: 'Get ₹150 OFF on weekend bookings.', code: 'WEEKEND150', icon: <Calendar className="w-7 h-7 text-orange-400" /> },
  { id: 3, title: 'Night Saver', desc: 'Get ₹100 OFF on overnight buses.', code: 'NIGHT100', icon: <Moon className="w-7 h-7 text-blue-400" /> },
  { id: 4, title: 'Student Discount', desc: 'Flat ₹120 OFF for students.', code: 'STUDENT120', icon: <GraduationCap className="w-7 h-7 text-green-400" /> },
];

function Home() {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [journeyDate, setJourneyDate] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="flex flex-col gap-10 relative min-h-[85vh] p-4 sm:p-8 -mx-4 sm:-mx-8 rounded-[2.5rem] overflow-hidden">
      {/* Hero Section */}
      <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-96 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(150,123,182,0.15)] group"
      >
          <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop" alt="Travel Header" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent"></div>
          
          <div className="relative h-full flex flex-col items-start justify-end p-10 md:p-14">
              <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender to-purple-300">Nova</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-xl font-medium">Experience strictly overnight premium intercity bus travel. Seamless booking, journeys that matter.</p>
              
              <Link to="/search" className="flex items-center gap-3 bg-lavender text-black px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(150,123,182,0.6)] hover:bg-white transition-all transform hover:-translate-y-1">
                  <Search className="w-5 h-5" />
                  Search All Buses
              </Link>
          </div>
      </motion.div>

      {/* Featured Routes */}
      <div className="pb-10 relative z-10">
          <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-lavender-light flex items-center gap-2">
                  <Compass className="text-lavender w-6 h-6" />
                  Featured Journeys
              </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRoutes.map((route, i) => (
                  <motion.div 
                      key={route.id}
                      onClick={() => setSelectedRoute({ from: route.from, to: route.to })}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group cursor-pointer relative h-48 rounded-3xl overflow-hidden shadow-lg border border-lavender/20 bg-gradient-to-br from-[#12121e] to-[#0a0a0f] hover:border-lavender/60 hover:shadow-[0_0_30px_rgba(150,123,182,0.3)] transition-all flex flex-col justify-between p-6"
                  >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-lavender/20 transition-all duration-500"></div>
                      
                      <div className="flex justify-between items-start relative z-10">
                          <MapPin className="text-lavender w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-white/50 tracking-widest uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">{route.desc}</span>
                      </div>
                      
                      <div className="relative z-10">
                          <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-lavender group-hover:to-white transition-all">{route.from}</h3>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-lavender/50"></span>
                              <span className="h-px bg-lavender/20 w-8"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-lavender/50"></span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-400 mt-1">{route.to}</h3>
                      </div>
                  </motion.div>
              ))}
          </div>
      </div>

      {/* Offers Section */}
      <div className="pb-16 relative z-10">
          <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-lavender-light flex items-center gap-2">
                  <Tag className="text-lavender w-6 h-6" />
                  Exclusive Offers
              </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {offers.map((offer, i) => (
                  <motion.div 
                      key={offer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-[#121212]/70 backdrop-blur-md border border-white/10 hover:border-lavender/40 rounded-3xl p-5 hover:bg-[#1a1a2e]/50 transition-all flex flex-col justify-between h-full group shadow-md hover:shadow-[0_0_20px_rgba(150,123,182,0.15)]"
                  >
                      <div>
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              {offer.icon}
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">{offer.title}</h3>
                          <p className="text-gray-400 text-sm leading-relaxed mb-4">{offer.desc}</p>
                      </div>
                      <div className="bg-black/60 border border-lavender/20 border-dashed rounded-xl p-3 flex justify-between items-center group-hover:border-lavender/60 transition-colors">
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">CODE</span>
                          <span className="text-sm text-lavender font-mono font-bold tracking-widest">{offer.code}</span>
                      </div>
                  </motion.div>
              ))}
          </div>
      </div>

      {/* About Nova */}
      <div className="pb-16 relative z-10">
          <div className="bg-[#121212]/70 backdrop-blur-xl border border-lavender/30 rounded-[2rem] p-10 md:p-16 shadow-[0_0_40px_rgba(150,123,182,0.15)]">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white mb-8">
                  Why Choose Nova?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#1a1a1a]/60 backdrop-blur-md border border-lavender/20 rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(150,123,182,0.2)] transition-all">
                      <h3 className="text-xl font-bold text-lavender-light mb-3">🌙 Strictly Overnight</h3>
                      <p className="text-gray-300">Maximize your daylight hours. Nova ensures you travel comfortably through the night and arrive fresh exactly by early morning.</p>
                  </div>
                  <div className="bg-[#1a1a1a]/60 backdrop-blur-md border border-lavender/20 rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(150,123,182,0.2)] transition-all">
                      <h3 className="text-xl font-bold text-lavender-light mb-3">🚌 Premium AC & Volvo Fleet</h3>
                      <p className="text-gray-300">From Multi-Axle Volvos to standard Sleepers, our routes come fully equipped with multi-tier accommodations to fit your budget.</p>
                  </div>
                  <div className="bg-[#1a1a1a]/60 backdrop-blur-md border border-lavender/20 rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(150,123,182,0.2)] transition-all">
                      <h3 className="text-xl font-bold text-lavender-light mb-3">🎫 Smart Pricing Decks</h3>
                      <p className="text-gray-300">Dynamic native pricing based on Upper (Discount) and Lower (Premium) decks lets you perfectly balance affordability with luxury layout.</p>
                  </div>
                  <div className="bg-[#1a1a1a]/60 backdrop-blur-md border border-lavender/20 rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(150,123,182,0.2)] transition-all">
                      <h3 className="text-xl font-bold text-lavender-light mb-3">⚡ Auto-Allocation Waitlist</h3>
                      <p className="text-gray-300">Never refresh endlessly. Our intelligent waitlist queue auto-allocates you a seat immediately the second someone cancels their ticket.</p>
                  </div>
              </div>
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

export default Home;
