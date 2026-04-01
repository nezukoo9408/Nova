import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, Search, User, ListOrdered, Menu, X, LogOut, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  const navItems = [
    { label: 'Home', path: '/', icon: <Bus className="w-5 h-5" /> },
    { label: 'Search', path: '/search', icon: <Search className="w-5 h-5" /> },
    { label: 'My Bookings', path: '/history', icon: <User className="w-5 h-5" /> },
    { label: 'Waiting List', path: '/waitlist', icon: <ListOrdered className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-lavender-dark/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Nova Logo */}
        <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-lavender to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(150,123,182,0.6)]">
                <span className="text-white font-black text-xl tracking-tighter">N</span>
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white tracking-widest uppercase">
                Nova
            </span>
        </Link>
        
        {/* Links */}
        <div className="hidden md:flex gap-8 items-center bg-black/40 px-6 py-2 rounded-full border border-lavender/10">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${isActive ? 'text-lavender-light drop-shadow-md scale-105' : 'text-gray-400 hover:text-lavender'}`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop Search & Auth Metrics */}
        <div className="hidden md:flex gap-4 items-center">
            {isAuthenticated ? (
                <button 
                    onClick={handleLogout}
                    className="text-sm font-bold bg-lavender/10 text-lavender border border-lavender/30 px-5 py-2 rounded-lg hover:bg-lavender hover:text-black hover:shadow-[0_0_15px_rgba(150,123,182,0.5)] transition-all flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            ) : (
                <>
                    <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-lavender transition-all flex items-center gap-2"><LogIn className="w-4 h-4"/> Login</Link>
                    <Link to="/signup" className="text-sm font-bold bg-lavender/10 text-lavender border border-lavender/30 px-5 py-2 rounded-lg hover:bg-lavender hover:text-black hover:shadow-[0_0_15px_rgba(150,123,182,0.5)] transition-all flex items-center gap-2"><UserPlus className="w-4 h-4" /> Sign Up</Link>
                </>
            )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden text-lavender p-2 drop-shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Animated Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-3xl border-b border-lavender/20 shadow-[-0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="flex flex-col px-6 py-6 pb-8 gap-6">
              <div className="flex flex-col gap-4 border-b border-white/5 pb-6">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 text-lg font-bold transition-all px-4 py-3 rounded-2xl ${isActive ? 'bg-lavender/10 text-lavender-light border border-lavender/20 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-lavender'}`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="flex flex-col gap-4">
                {isAuthenticated ? (
                  <button 
                      onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                      className="text-lg font-bold bg-red-500/10 text-red-400 border border-red-500/30 px-6 py-3 rounded-2xl flex items-center justify-center gap-3 w-full"
                  >
                      <LogOut className="w-5 h-5" /> Logout
                  </button>
                ) : (
                  <>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-center text-gray-300 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl hover:text-lavender transition-all">Login</Link>
                      <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-center bg-gradient-to-r from-purple-600 to-lavender text-white px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(150,123,182,0.4)] transition-all">Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
