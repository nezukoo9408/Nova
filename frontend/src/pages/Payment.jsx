import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Clock, AlertTriangle, ChevronRight,
  CreditCard, Smartphone, CheckCircle2, Lock, ArrowLeft, Tag, X
} from 'lucide-react';

// ─── UPI App data ────────────────────────────────────────────────────────────
const UPI_APPS = [
  {
    id: 'gpay',
    name: 'Google Pay',
    color: '#4285F4',
    logo: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
        <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
        <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
        <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
      </svg>
    )
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    color: '#5f259f',
    logo: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect width="48" height="48" rx="10" fill="#5f259f"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">Pe</text>
      </svg>
    )
  },
  {
    id: 'paytm',
    name: 'Paytm',
    color: '#00BAF2',
    logo: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect width="48" height="48" rx="10" fill="#00BAF2"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">PAY</text>
      </svg>
    )
  },
  {
    id: 'rupay',
    name: 'RuPay',
    color: '#FF6B00',
    logo: (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect width="48" height="48" rx="10" fill="#FF6B00"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">RuPay</text>
      </svg>
    )
  }
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function BookingSummaryCard({ bookingData, discount, finalAmount }) {
  const isWaitlist = bookingData.isWaitlist;
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 space-y-3">
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Booking Summary</p>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Route</span>
        <span className="font-semibold text-white text-sm">{bookingData.routeFrom} → {bookingData.routeTo}</span>
      </div>
      {bookingData.busName && (
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Bus</span>
          <span className="font-semibold text-white text-sm">{bookingData.busName}</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Date</span>
        <span className="font-semibold text-white text-sm">{bookingData.date}</span>
      </div>
      {!isWaitlist && bookingData.seats?.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Seats</span>
          <span className="font-semibold text-white text-sm">{bookingData.seats.map(s => s.id).join(', ')}</span>
        </div>
      )}
      {isWaitlist && (
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Type</span>
          <span className="text-yellow-400 text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">Waitlist</span>
        </div>
      )}
      <div className="border-t border-white/10 pt-3 flex justify-between items-center">
        <span className="font-bold text-gray-300 text-sm">Base Amount</span>
        <span className="text-lg font-bold text-white">₹{bookingData.totalAmount}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between items-center">
          <span className="font-bold text-green-400 text-sm">Discount Applied</span>
          <span className="text-lg font-bold text-green-400">- ₹{discount}</span>
        </div>
      )}
      <div className="border-t border-white/10 pt-3 flex justify-between items-center">
        <span className="font-bold text-white text-sm">Total Payable</span>
        <span className="text-2xl font-black text-green-400">₹{finalAmount}</span>
      </div>
    </div>
  );
}

function LoadingOverlay({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="bg-[#1a1a2e] border border-lavender/30 rounded-3xl p-12 flex flex-col items-center gap-6 shadow-2xl">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-lavender/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-lavender rounded-full animate-spin" />
          <div className="absolute inset-3 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-white font-bold text-lg tracking-wide">{message}</p>
        <p className="text-gray-400 text-sm">Please do not press back or close the window</p>
      </div>
    </motion.div>
  );
}

function SuccessOverlay({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        className="bg-[#0f1a0f] border border-green-500/40 rounded-3xl p-12 flex flex-col items-center gap-5 shadow-[0_0_60px_rgba(34,197,94,0.3)] max-w-sm w-full mx-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
          className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-black text-white"
        >
          Payment Successful!
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-green-400 text-center text-sm leading-relaxed"
        >
          Your payment was processed successfully. Confirming your booking now...
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full text-center"
        >
          <div className="text-xs text-gray-500 mt-2 animate-pulse">Redirecting to your ticket...</div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── UPI Flow ────────────────────────────────────────────────────────────────
function UpiFlow({ amount, onSuccess }) {
  const [selectedApp, setSelectedApp] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!selectedApp) e.app = 'Please select a payment app';
    if (!upiId.match(/^[\w.\-]+@[\w]+$/)) e.upiId = 'Enter a valid UPI ID (e.g. name@upi)';
    if (!pin.match(/^\d{4,6}$/)) e.pin = 'PIN must be 4–6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (validate()) onSuccess();
  };

  return (
    <motion.div
      key="upi"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* App grid */}
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Choose Payment App</p>
        <div className="grid grid-cols-4 gap-3">
          {UPI_APPS.map(app => (
            <button
              key={app.id}
              onClick={() => setSelectedApp(app.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 ${
                selectedApp === app.id
                  ? 'border-lavender bg-lavender/10 shadow-[0_0_15px_rgba(150,123,182,0.4)] scale-105'
                  : 'border-white/10 bg-white/5 hover:border-lavender/40 hover:bg-white/10'
              }`}
            >
              {app.logo}
              <span className="text-xs font-semibold text-gray-300 text-center leading-tight">{app.name}</span>
            </button>
          ))}
        </div>
        {errors.app && <p className="text-red-400 text-xs mt-2">{errors.app}</p>}
      </div>

      {/* UPI ID */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-2">UPI ID</label>
        <div className="relative">
          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            className={`w-full bg-white/5 border ${errors.upiId ? 'border-red-500/60' : 'border-white/10'} text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-lavender transition-all placeholder-gray-600`}
          />
        </div>
        {errors.upiId && <p className="text-red-400 text-xs mt-1">{errors.upiId}</p>}
      </div>

      {/* Amount display */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-gray-400 text-sm">Amount to Pay</span>
        <span className="text-green-400 font-black text-xl">₹{amount}</span>
      </div>

      {/* PIN */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-2">UPI PIN</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="4–6 digit PIN"
            inputMode="numeric"
            className={`w-full bg-white/5 border ${errors.pin ? 'border-red-500/60' : 'border-white/10'} text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-lavender transition-all placeholder-gray-600 tracking-[0.4em]`}
          />
        </div>
        {errors.pin && <p className="text-red-400 text-xs mt-1">{errors.pin}</p>}
      </div>

      <button
        onClick={handlePay}
        className="w-full py-4 bg-gradient-to-r from-lavender-dark to-purple-600 text-white font-black text-lg rounded-2xl hover:shadow-[0_0_25px_rgba(150,123,182,0.6)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <ShieldCheck className="w-5 h-5" />
        Pay ₹{amount} Now
      </button>
    </motion.div>
  );
}

// ─── Credit Card Flow ────────────────────────────────────────────────────────
function CardFlow({ amount, onSuccess }) {
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});

  const formatCardNumber = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2);
    return d;
  };

  const validateDetails = () => {
    const e = {};
    if (card.number.replace(/\s/g, '').length !== 16) e.number = 'Enter a valid 16-digit card number';
    if (!card.name.trim()) e.name = 'Enter cardholder name';
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'Enter valid expiry (MM/YY)';
    if (!card.cvv.match(/^\d{3}$/)) e.cvv = 'Enter valid 3-digit CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = () => {
    if (validateDetails()) setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (!otp.match(/^\d{6}$/)) {
      setErrors({ otp: 'Enter a valid 6-digit OTP' });
      return;
    }
    onSuccess();
  };

  if (step === 'otp') {
    return (
      <motion.div
        key="otp"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-5"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-1">OTP Verification</h3>
          <p className="text-gray-400 text-sm">
            An OTP has been sent to your registered mobile number ending in <span className="text-white font-bold">****7890</span>
          </p>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-300 text-xs text-center">For simulation, enter any 6-digit number</p>
        </div>

        <div>
          <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-2">Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit OTP"
            inputMode="numeric"
            maxLength={6}
            className={`w-full bg-white/5 border ${errors.otp ? 'border-red-500/60' : 'border-white/10'} text-white rounded-xl px-4 py-4 focus:outline-none focus:border-lavender transition-all text-center text-2xl tracking-[0.5em] placeholder-gray-600 placeholder:text-base placeholder:tracking-normal`}
          />
          {errors.otp && <p className="text-red-400 text-xs mt-1 text-center">{errors.otp}</p>}
        </div>

        <button
          onClick={handleVerifyOtp}
          className="w-full py-4 bg-gradient-to-r from-lavender-dark to-purple-600 text-white font-black text-lg rounded-2xl hover:shadow-[0_0_25px_rgba(150,123,182,0.6)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <ShieldCheck className="w-5 h-5" />
          Verify & Pay ₹{amount}
        </button>
        <button
          onClick={() => setStep('details')}
          className="w-full py-3 text-gray-400 hover:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Card Details
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="card"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Card Preview */}
      <div className="relative h-44 bg-gradient-to-br from-[#1a1a3e] via-[#2a1a5e] to-[#1a1a2e] rounded-2xl border border-lavender/30 p-6 overflow-hidden shadow-[0_0_30px_rgba(150,123,182,0.2)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/10 rounded-full translate-y-8 -translate-x-8" />
        <div className="flex justify-between items-start mb-4 relative z-10">
          <CreditCard className="w-8 h-8 text-lavender" />
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">VISA / MC</span>
        </div>
        <p className="text-white font-mono text-xl tracking-widest mb-4 relative z-10">
          {card.number || '•••• •••• •••• ••••'}
        </p>
        <div className="flex justify-between items-end relative z-10">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">Card Holder</p>
            <p className="text-white font-bold uppercase text-sm">{card.name || 'YOUR NAME'}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs uppercase tracking-wider">Expires</p>
            <p className="text-white font-bold text-sm">{card.expiry || 'MM/YY'}</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Card Number</label>
        <input
          type="text"
          value={card.number}
          onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
          placeholder="1234 5678 9012 3456"
          inputMode="numeric"
          className={`w-full bg-white/5 border ${errors.number ? 'border-red-500/60' : 'border-white/10'} text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all placeholder-gray-600 font-mono tracking-widest`}
        />
        {errors.number && <p className="text-red-400 text-xs mt-1">{errors.number}</p>}
      </div>

      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Cardholder Name</label>
        <input
          type="text"
          value={card.name}
          onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })}
          placeholder="FULL NAME"
          className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/60' : 'border-white/10'} text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all placeholder-gray-600 uppercase tracking-widest`}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Expiry</label>
          <input
            type="text"
            value={card.expiry}
            onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
            placeholder="MM/YY"
            inputMode="numeric"
            maxLength={5}
            className={`w-full bg-white/5 border ${errors.expiry ? 'border-red-500/60' : 'border-white/10'} text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all placeholder-gray-600`}
          />
          {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
        </div>
        <div>
          <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">CVV</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={card.cvv}
              onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
              placeholder="•••"
              inputMode="numeric"
              maxLength={3}
              className={`w-full bg-white/5 border ${errors.cvv ? 'border-red-500/60' : 'border-white/10'} text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-lavender transition-all placeholder-gray-600 tracking-widest`}
            />
          </div>
          {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
        </div>
      </div>

      {/* Amount */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-gray-400 text-sm">Amount to Pay</span>
        <span className="text-green-400 font-black text-xl">₹{amount}</span>
      </div>

      <button
        onClick={handleProceed}
        className="w-full py-4 bg-gradient-to-r from-lavender-dark to-purple-600 text-white font-black text-lg rounded-2xl hover:shadow-[0_0_25px_rgba(150,123,182,0.6)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <ShieldCheck className="w-5 h-5" />
        Proceed to OTP Verification
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// ─── Main Payment Component ──────────────────────────────────────────────────
function Payment() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [parsed, setParsed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // null | 'upi' | 'card'
  const [loadingState, setLoadingState] = useState(null);   // null | 'processing' | 'success'
  const [confirming, setConfirming] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const data = localStorage.getItem('pending_booking');
    if (!data) { navigate('/'); return; }
    try {
      setBookingData(JSON.parse(data));
    } catch {
      navigate('/');
    }
    setParsed(true);
  }, [navigate]);

  const finalAmount = bookingData ? Math.max(0, bookingData.totalAmount - discountAmount) : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponMsg({ text: 'Checking coupon...', type: 'info' });
    try {
      if (couponCode.toUpperCase() === 'FIRST200') {
        const res = await api.get('/bookings/check-first-offer');
        if (res.data.eligible) {
          setAppliedCoupon(res.data.code);
          setDiscountAmount(res.data.discount);
          setCouponMsg({ text: 'First booking offer applied!', type: 'success' });
        } else {
          setCouponMsg({ text: 'First booking offer has already been used.', type: 'error' });
        }
      } else if (couponCode.toUpperCase() === 'WEEKEND150') {
        setAppliedCoupon('WEEKEND150');
        setDiscountAmount(150);
        setCouponMsg({ text: 'Weekend offer applied!', type: 'success' });
      } else if (couponCode.toUpperCase() === 'NIGHT100') {
        setAppliedCoupon('NIGHT100');
        setDiscountAmount(100);
        setCouponMsg({ text: 'Night saver applied!', type: 'success' });
      } else if (couponCode.toUpperCase() === 'STUDENT120') {
        setAppliedCoupon('STUDENT120');
        setDiscountAmount(120);
        setCouponMsg({ text: 'Student discount applied!', type: 'success' });
      } else {
        setCouponMsg({ text: 'Invalid coupon code', type: 'error' });
      }
    } catch (err) {
      setCouponMsg({ text: 'Failed to verify coupon', type: 'error' });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponMsg({ text: '', type: '' });
  };

  const confirmBooking = async () => {
    if (!bookingData || confirming) return;
    setConfirming(true);
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
          amount: (finalAmount / bookingData.seats.length),
          applied_coupon: appliedCoupon
        });
        confirmedIds.push(res.data.booking_id);
      }
      localStorage.removeItem('pending_booking');
      navigate(`/receipt?ids=${confirmedIds.join(',')}`);
    } catch (err) {
      alert('Booking confirmation failed. ' + (err.response?.data?.detail || ''));
      setLoadingState(null);
    } finally {
      setConfirming(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Step 1: Processing animation (2.5s)
    setLoadingState('processing');
    setTimeout(() => {
      // Step 2: Success screen (2s), then confirm booking
      setLoadingState('success');
      setTimeout(() => {
        confirmBooking();
      }, 2000);
    }, 2500);
  };

  const handleCancel = () => {
    localStorage.removeItem('pending_booking');
    navigate('/');
  };

  if (!parsed || !bookingData) return null;

  const isWaitlist = bookingData.isWaitlist;

  return (
    <>
      {/* Loading Overlay */}
      <AnimatePresence>
        {loadingState === 'processing' && (
          <LoadingOverlay message="Processing your payment securely..." />
        )}
        {loadingState === 'success' && (
          <SuccessOverlay />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center min-h-[80vh] py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          {/* ── Header ── */}
          <div className={`rounded-t-3xl p-6 text-center border border-b-0 ${
            isWaitlist
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-lavender/10 border-lavender/30'
          }`}>
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
              isWaitlist ? 'bg-yellow-500/20' : 'bg-lavender/20'
            }`}>
              {isWaitlist
                ? <Clock className="w-7 h-7 text-yellow-400" />
                : <ShieldCheck className="w-7 h-7 text-lavender" />
              }
            </div>
            <h1 className={`text-2xl font-extrabold ${
              isWaitlist
                ? 'text-yellow-400'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white'
            }`}>
              {isWaitlist ? 'Complete Waitlist Deposit' : 'Complete Payment'}
            </h1>
            {isWaitlist && (
              <p className="text-gray-400 text-sm mt-1">
                You will be added to the waiting queue after payment
              </p>
            )}
          </div>

          {/* ── Main card ── */}
          <div className={`bg-[#0f0f1a] border-x ${
            isWaitlist ? 'border-yellow-500/30' : 'border-lavender/30'
          } p-6`}>

            {/* Booking Summary */}
            <BookingSummaryCard bookingData={bookingData} discount={discountAmount} finalAmount={finalAmount} />

            {/* Coupon Code Section */}
            {!isWaitlist && !paymentMethod && (
              <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="text-lavender w-5 h-5" />
                  <span className="text-white font-bold text-sm">Offers & Discounts</span>
                </div>
                
                {appliedCoupon ? (
                  <div className="flex justify-between items-center bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                    <div>
                      <span className="text-green-400 font-bold block text-sm">{appliedCoupon} Applied</span>
                      <span className="text-green-200/60 text-xs text-sh block">Saved ₹{discountAmount} on this booking</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Offer Code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 font-mono text-white text-sm focus:outline-none focus:border-lavender"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-white/10 hover:bg-lavender text-white hover:text-black font-bold text-sm rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponMsg.text && !appliedCoupon && (
                  <p className={`text-xs mt-2 ${couponMsg.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>
            )}

            {/* Waitlist notice */}
            {isWaitlist && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-200/80 text-xs leading-relaxed">
                  This is the maximum seat price. If you get assigned a lower-priced seat, the difference will be refunded. Full refund if no seat becomes available.
                </p>
              </div>
            )}

            {/* ── Method Selection ── */}
            {!paymentMethod && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
                  Select Payment Method
                </p>

                {/* UPI option */}
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-lavender/10 border border-white/10 hover:border-lavender/40 rounded-2xl p-4 transition-all group text-left"
                >
                  <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">UPI Payment</p>
                    <p className="text-gray-500 text-sm">Google Pay · PhonePe · Paytm · RuPay</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-lavender transition-colors" />
                </button>

                {/* Card option */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-lavender/10 border border-white/10 hover:border-lavender/40 rounded-2xl p-4 transition-all group text-left"
                >
                  <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">Credit / Debit Card</p>
                    <p className="text-gray-500 text-sm">Visa · Mastercard · Rupay</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-lavender transition-colors" />
                </button>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-2 mt-2 pt-2">
                  <Lock className="w-3 h-3 text-gray-600" />
                  <p className="text-gray-600 text-xs">256-bit SSL Secured · Simulated Payment</p>
                </div>
              </motion.div>
            )}

            {/* ── UPI Form ── */}
            <AnimatePresence mode="wait">
              {paymentMethod === 'upi' && (
                <motion.div key="upi-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Methods
                  </button>
                  <UpiFlow amount={finalAmount} onSuccess={handlePaymentSuccess} />
                </motion.div>
              )}

              {/* ── Card Form ── */}
              {paymentMethod === 'card' && (
                <motion.div key="card-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Methods
                  </button>
                  <CardFlow amount={finalAmount} onSuccess={handlePaymentSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          {!paymentMethod && (
            <div className={`rounded-b-3xl p-5 border border-t-0 ${
              isWaitlist ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-lavender/5 border-lavender/30'
            }`}>
              <button
                onClick={handleCancel}
                className="w-full py-3 px-4 rounded-xl font-bold border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
              >
                Cancel &amp; Go Back
              </button>
            </div>
          )}

          {paymentMethod && (
            <div className="rounded-b-3xl border border-t-0 border-lavender/30 bg-lavender/5 px-6 py-4">
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-3 h-3 text-gray-600" />
                <p className="text-gray-600 text-xs">256-bit SSL · Payments are fully simulated</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

export default Payment;
