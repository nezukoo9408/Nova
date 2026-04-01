import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

function BusSeats() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const date = searchParams.get('date');
  const busId = searchParams.get('busId') || 1; // Assuming a single bus id if not provided for now
  
  const [seatsData, setSeatsData] = useState({ locked: [], booked: {}, waiting: 0 });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [gender, setGender] = useState('Male'); // Default selection for new seats
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [busesLoading, setBusesLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [checkingWaitlist, setCheckingWaitlist] = useState(false);
  const [isBookingClosed, setIsBookingClosed] = useState(false);

  useEffect(() => {
    // Fetch buses matching route
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    setBusesLoading(true);
    api.get(`/buses?route_from=${from}&route_to=${to}&date=${date}`)
       .then(res => {
           setBuses(res.data);
           if(res.data.length > 0) setSelectedBus(res.data[0]);
       })
       .catch(err => console.error(err))
       .finally(() => setBusesLoading(false));
  }, [searchParams, date]);

  useEffect(() => {
    if (selectedBus) {
      fetchSeats(selectedBus.id);
      setSelectedSeats([]);
    }
  }, [selectedBus, date]);

  const fetchSeats = async (id) => {
    try {
      const res = await api.get(`/buses/${id}/seats?date=${date}`);
      setSeatsData(res.data);
      setIsBookingClosed(res.data.is_booking_closed || false);
    } catch(err) {
      console.error(err);
    }
  };

  const toggleSeat = (seatId) => {
    if (seatsData.locked.includes(seatId) || seatsData.booked[seatId]) return;
    
    if (selectedSeats.find(s => s.id === seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, { id: seatId, gender }]);
    }
  };

  const proceedToPay = async () => {
    if (selectedSeats.length === 0) return alert("Select at least one seat");
    setIsLocking(true);
    // Lock seats in backend sequentially
    try {
        const bus = selectedBus;
        for (const s of selectedSeats) {
            await api.post('/bookings/lock', {
                bus_id: bus.id, seat_id: s.id, travel_date: date
            });
        }
        
        const total = selectedSeats.reduce((sum, s) => sum + (s.id.startsWith('U') ? bus.base_price_upper : bus.base_price_lower), 0);
        
        // Save to local storage to pass to payment page
        localStorage.setItem('pending_booking', JSON.stringify({
            busId: bus.id,
            busName: bus.name,
            routeFrom: bus.route_from,
            routeTo: bus.route_to,
            date,
            seats: selectedSeats,
            totalAmount: total
        }));
        navigate('/payment');
    } catch(err) {
        alert(err.response?.data?.detail || "Error locking seats");
        if(selectedBus) fetchSeats(selectedBus.id);
        setSelectedSeats([]);
    } finally {
        setIsLocking(false);
    }
  };

  const handleJoinWaitlistClick = async () => {
      setCheckingWaitlist(true);
      try {
          const checkRes = await api.get(`/bookings/verify_waitlist_status?bus_id=${selectedBus.id}&date=${date}`);
          if (checkRes.data.already_in_waitlist) {
              alert("You are already in the waiting list for this route on the selected date.");
          } else {
              setShowWaitlistModal(true);
          }
      } catch (err) {
          alert(err.response?.data?.detail || "Error validating waiting list status.");
      } finally {
          setCheckingWaitlist(false);
      }
  };

  const getSeatColor = (seatId) => {
    // Priority: Booked -> Locked -> Selected -> Available
    if (seatsData.booked[seatId]) {
      return seatsData.booked[seatId].gender === 'Female' ? 'bg-seat-female' : 'bg-seat-male';
    }
    if (seatsData.locked.includes(seatId)) {
        return 'bg-gray-600 cursor-not-allowed';
    }
    const sel = selectedSeats.find(s => s.id === seatId);
    if (sel) {
      return sel.gender === 'Female' ? 'bg-seat-selectedFemale ring-2 ring-pink-400' : 'bg-seat-selectedMale ring-2 ring-green-400';
    }
    return 'bg-seat-available hover:bg-lavender-dark cursor-pointer';
  };

  const renderDeck = (prefix, title) => {
    // 20 seats: 15 double (5 rows of 3? wait, double + single = 3 per row? 5 rows * 3 = 15... wait 15 double means 15 seats in double col, 5 single means 5 in single col. Total 20.
    // So 5 rows. Left side 2 seats (10 seats total?), right side 1 seat (5 seats)? That makes 15. Wait.
    // "15 double + 5 single" means 15 seats that are part of double columns, and 5 seats in single columns.
    // Let's do 5 rows: Row 1-5. Each row has SeatA, SeatB (Double), aisle, SeatC (Single). 5 * 3 = 15 seats per deck? But 20 needed.
    // 20 seats = maybe 5 rows of 4 seats (Double Left, Double Right)? 5*4=20.
    // Let's assume layout: Row 1-5 [A,B] Aisle [C,D]. (Total 20 per deck).
    // The prompt says "(15 double + 5 single)" which means out of 20: 15 sit together, 5 alone? Maybe 5 rows of [A, B, C] = 15, plus a back row of 5?
    // Let's implement 5 rows of [Left A, Left B, Right Single]. Wait 5*3=15. And last row of 5. 15+5=20! Yes.
    
    let rows = [];
    for(let r=1; r<=5; r++) {
        rows.push([`${prefix}${r}A`, `${prefix}${r}B`, 'AISLE', `${prefix}${r}C`]);
    }
    // Add row 6 with 5 seats
    rows.push([`${prefix}6A`, `${prefix}6B`, `${prefix}6C`, `${prefix}6D`, `${prefix}6E`]);

    return (
        <div className="flex flex-col gap-4 items-center bg-black/40 p-6 rounded-2xl border border-lavender-dark/30">
            <h3 className="text-xl font-bold text-lavender-light">{title}</h3>
            {rows.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-4">
                    {row.map((seatId, sIdx) => {
                        if (seatId === 'AISLE') return <div key={sIdx} className="w-8"></div>;
                        return (
                            <motion.div 
                                key={seatId} 
                                whileHover={!seatsData.booked[seatId] && !seatsData.locked.includes(seatId) ? { scale: 1.1 } : {}}
                                whileTap={!seatsData.booked[seatId] && !seatsData.locked.includes(seatId) ? { scale: 0.95 } : {}}
                                className={`w-12 h-16 rounded-t-xl rounded-b-sm shadow-md flex items-center justify-center font-bold text-xs text-black transition-colors ${getSeatColor(seatId)}`}
                                onClick={() => toggleSeat(seatId)}
                            >
                                {seatId}
                            </motion.div>
                        )
                    })}
                </div>
            ))}
        </div>
    );
  };

  const bookedSeatKeys = Object.keys(seatsData.booked || {});
  const maleBooked = bookedSeatKeys.filter(k => seatsData.booked[k].gender === 'Male').length;
  const femaleBooked = bookedSeatKeys.filter(k => seatsData.booked[k].gender === 'Female').length;
  const bookedCount = maleBooked + femaleBooked;
  const availableCount = 40 - bookedCount;

  return (
    <div className="flex flex-col gap-8 pb-32">
      {busesLoading ? (
          <div className="max-w-2xl mx-auto w-full mt-32 flex flex-col items-center gap-6">
              <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-lavender/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-lavender rounded-full animate-spin" />
              </div>
              <p className="text-lavender font-bold text-lg tracking-wide">Searching for buses...</p>
              <p className="text-gray-500 text-sm">Fetching available routes for your journey</p>
          </div>
      ) : !selectedBus ? (
          <div className="max-w-2xl mx-auto w-full mt-20 bg-[#1a1a1a]/80 backdrop-blur-lg border border-lavender/30 rounded-3xl p-12 text-center shadow-2xl">
              <div className="text-6xl mb-6">🚌</div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white mb-4">
                  No Buses Found
              </h2>
              <p className="text-gray-400 mb-8 font-medium">There are currently no scheduled Nova overnight buses executing the selected route on this journey date. Please try modifying your search parameters.</p>
              <button onClick={() => navigate('/search')} className="bg-lavender text-black px-8 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(150,123,182,0.6)] hover:bg-white transition-all">
                  Search Again
              </button>
          </div>
      ) : (
          <>
          <div className="max-w-4xl mx-auto w-full mb-2">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white text-center mb-6">
                  Select Your Overnight Bus
              </h2>
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                  {buses.map(bus => {
                      const dep = new Date(bus.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      const arr = new Date(bus.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      const isActive = selectedBus.id === bus.id;
                      return (
                          <button 
                              key={bus.id} onClick={() => setSelectedBus(bus)}
                              className={`px-6 py-3 rounded-2xl border transition-all ${isActive ? 'bg-lavender/20 border-lavender shadow-[0_0_20px_rgba(150,123,182,0.4)] scale-105' : 'bg-[#1a1a1a] border-lavender/10 text-gray-400 hover:border-lavender/40'}`}
                          >
                              <div className="font-bold text-white mb-1">{dep} → {arr}</div>
                              <div className="text-xs">{bus.name}</div>
                          </button>
                      )
                  })}
              </div>

              <div className="bg-[#121212] border border-lavender/50 shadow-[0_0_40px_rgba(150,123,182,0.2)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender/10 to-transparent pointer-events-none"></div>
                  <div className="z-10 text-center md:text-left">
                      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white text-center md:text-left mb-2">
                          {selectedBus.route_from} → {selectedBus.route_to}
                      </h2>
                      <div className="text-xl font-bold text-lavender-light mb-3">Journey Date: {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="text-lg font-medium text-gray-300 flex items-center gap-2 justify-center md:justify-start mb-2">
                          ⏱️ {new Date(selectedBus.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} → {new Date(selectedBus.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-md font-bold text-gray-400 mb-4 bg-white/5 inline-block px-3 py-1 rounded shadow-inner border border-white/5">🚌 {selectedBus.name}</div>
                      
                      <div className="mt-1 flex flex-wrap justify-center md:justify-start gap-2">
                          <span className="bg-lavender/20 border border-lavender/50 text-lavender-light px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(150,123,182,0.4)]">
                              🌙 Overnight Journey
                          </span>
                      </div>
                  </div>
                  <div className="z-10 mt-6 md:mt-0 text-center md:text-right">
                      <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-1">Deck Pricing</p>
                      <p className="text-2xl font-black text-green-400">₹{selectedBus.base_price_lower} <span className="text-sm font-medium text-gray-400 block -mt-1">Lower Deck</span></p>
                      <p className="text-2xl font-black text-green-400 mt-2">₹{selectedBus.base_price_upper} <span className="text-sm font-medium text-gray-400 block -mt-1">Upper Deck</span></p>
                  </div>
              </div>
          </div>
      <div className="max-w-4xl mx-auto w-full bg-[#121212]/70 backdrop-blur-lg border border-lavender/30 rounded-3xl p-6 relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 shadow-xl">
          <div className="flex gap-6 sm:gap-12 text-center">
              <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Total Seats</p>
                  <p className="text-white font-black text-3xl">40</p>
              </div>
              <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Available</p>
                  <p className="text-green-400 font-black text-3xl">{availableCount}</p>
              </div>
              <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Booked</p>
                  <p className="text-red-400 font-black text-3xl">{bookedCount}</p>
              </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-lavender/20"></div>
          <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Booked Distribution</p>
              <div className="flex gap-4">
                  <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl text-lg font-bold">Male: {maleBooked}</span>
                  <span className="bg-pink-500/10 text-pink-400 border border-pink-500/30 px-4 py-2 rounded-xl text-lg font-bold">Female: {femaleBooked}</span>
              </div>
          </div>
      </div>
      
      <div className="max-w-md mx-auto bg-[#1a1a1a] border border-lavender/20 p-4 rounded-2xl flex justify-center gap-6 shadow-lg relative z-10">
          <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="gender" value="Male" checked={gender==='Male'} onChange={()=>setGender('Male')} disabled={isBookingClosed} /> 
              <span>Male Passenger</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="gender" value="Female" checked={gender==='Female'} onChange={()=>setGender('Female')} disabled={isBookingClosed} /> 
              <span>Female Passenger</span>
          </label>
      </div>

      {isBookingClosed ? (
          <div className="bg-[#1a1a1a]/80 border border-red-500/30 w-full max-w-2xl mx-auto rounded-3xl p-10 text-center shadow-[0_0_30px_rgba(239,68,68,0.15)] mb-8">
              <div className="text-6xl mb-6">🚫</div>
              <h3 className="text-3xl font-black text-red-400 mb-4">Booking Closed</h3>
              <p className="text-gray-400 mb-8 font-medium">Booking is completely closed for this bus. We stop accepting new reservations and waiting list entries strictly 15 minutes before departure.</p>
              <button onClick={() => navigate('/search')} className="bg-red-500/20 text-red-400 border border-red-500/30 px-8 py-3 rounded-xl font-bold hover:bg-red-500/30 transition-all">
                  Search Another Bus
              </button>
          </div>
      ) : availableCount === 0 ? (
          <div className="bg-[#1a1a1a]/80 border border-yellow-500/30 w-full max-w-2xl mx-auto rounded-3xl p-10 text-center shadow-[0_0_30px_rgba(234,179,8,0.15)] mb-8">
              <h3 className="text-3xl font-black text-white mb-4">All seats are booked</h3>
              
              {seatsData.waiting >= 2 ? (
                  <>
                      <p className="text-red-400 font-bold mb-8">Waiting list is full</p>
                      <button disabled className="px-8 py-4 bg-gray-600/50 text-gray-500 font-bold text-lg rounded-xl cursor-not-allowed shadow-lg border border-gray-600/30">
                          Waiting List is Full
                      </button>
                  </>
              ) : (
                  <>
                      <p className="text-gray-400 mb-8">We cannot guarantee a seat, but you can join our waiting list in case a passenger cancels their trip.</p>
                      <button 
                          disabled={checkingWaitlist}
                          onClick={handleJoinWaitlistClick} 
                          className="px-8 py-4 bg-yellow-500 text-black font-bold text-lg rounded-xl hover:bg-yellow-400 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {checkingWaitlist ? "Checking Status..." : "Join Waiting List"}
                      </button>
                  </>
              )}
          </div>
      ) : (
          <div className="flex flex-col md:flex-row gap-12 justify-center items-start">
            {renderDeck('L', 'Lower Deck')}
            {renderDeck('U', 'Upper Deck')}
          </div>
      )}

      {/* Fixed bottom bar */}
      {!isBookingClosed && availableCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/90 backdrop-blur-xl border-t border-lavender/30 p-6 flex justify-between items-center z-50">
              <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-6">
                  <div>
                      <p className="text-sm text-gray-400">Selected: {selectedSeats.map(s=>s.id).join(", ") || 'None'}</p>
                      <p className="font-black text-2xl text-lavender-light">Total: ₹{selectedSeats.reduce((sum, s) => sum + (s.id.startsWith('U') ? selectedBus?.base_price_upper : selectedBus?.base_price_lower), 0)}</p>
                  </div>
                  <button disabled={isLocking} onClick={proceedToPay} className="px-8 py-4 bg-gradient-to-r from-lavender to-purple-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(150,123,182,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLocking ? "Locking Seats..." : "Continue to Payment"}
                  </button>
              </div>
          </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121212] border border-yellow-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                  <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xl">⚠️</div>
                      <h3 className="text-2xl font-bold text-yellow-400">Waiting List Notice</h3>
                  </div>
                  <div className="text-gray-300 space-y-3 mb-8 text-sm leading-relaxed bg-black/30 rounded-2xl p-5 border border-yellow-500/10">
                      <p className="text-white font-semibold">Waiting list booking will be charged at the maximum seat price (₹{selectedBus?.base_price_lower}).</p>
                      <p>If a lower-priced seat is assigned, the difference will be refunded.</p>
                      <div className="border-t border-yellow-500/20 pt-3">
                          <p>If any passenger cancels their ticket at least 30 minutes before departure, you will be automatically assigned that seat.</p>
                      </div>
                      <p>If no seat becomes available, <span className="text-yellow-400 font-semibold">your payment will be fully refunded.</span></p>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={() => setShowWaitlistModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors">Cancel</button>
                      <button onClick={() => {
                          const payload = {
                              busId: selectedBus.id,
                              busName: selectedBus.name,
                              routeFrom: selectedBus.route_from,
                              routeTo: selectedBus.route_to,
                              date,
                              seats: [{ id: "WAITING", gender }],
                              totalAmount: selectedBus.base_price_lower,
                              isWaitlist: true
                          };
                          localStorage.setItem('pending_booking', JSON.stringify(payload));
                          navigate('/payment');
                      }} className="flex-1 py-3 px-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors">
                          Confirm & Pay
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
          </>
      )}
    </div>
  );
}

export default BusSeats;
