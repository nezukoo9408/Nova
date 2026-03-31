import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, Search, User, ListOrdered } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: <Bus className="w-5 h-5" /> },
    { label: 'Search', path: '/search', icon: <Search className="w-5 h-5" /> },
    { label: 'My Bookings', path: '/history', icon: <User className="w-5 h-5" /> },
    { label: 'Waiting List', path: '/waitlist', icon: <ListOrdered className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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

        <div className="flex gap-4 items-center">
            {localStorage.getItem('token') ? (
                <button 
                    onClick={handleLogout}
                    className="text-sm font-bold bg-lavender/10 text-lavender border border-lavender/30 px-5 py-2 rounded-lg hover:bg-lavender hover:text-black hover:shadow-[0_0_15px_rgba(150,123,182,0.5)] transition-all"
                >
                    Logout
                </button>
            ) : (
                <>
                    <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-lavender transition-all">Login</Link>
                    <Link to="/signup" className="text-sm font-bold bg-lavender/10 text-lavender border border-lavender/30 px-5 py-2 rounded-lg hover:bg-lavender hover:text-black hover:shadow-[0_0_15px_rgba(150,123,182,0.5)] transition-all">Sign Up</Link>
                </>
            )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
