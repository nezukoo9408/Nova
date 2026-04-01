import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate(redirect);
    } catch (error) {
        console.error("Login failed", error);
        setError(error.response?.data?.detail || "Invalid credentials");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans p-4">
      
      {/* Main Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm p-10 bg-[#121220]/80 backdrop-blur-xl border border-lavender/30 rounded-3xl shadow-[0_0_60px_rgba(150,123,182,0.2)] flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-lavender to-purple-800 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(150,123,182,0.5)]">
            <span className="text-white font-black text-4xl">N</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white text-center mb-2 tracking-wide">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-sm mb-8 text-center leading-relaxed">
          Log in with your Nova account to continue managing your journeys.
        </p>

        {error && <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input 
                type="text" placeholder="Username or Email" required
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-lavender/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all"
            />
            <input 
                type="password" placeholder="Password" required
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-lavender/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all"
            />
            
            <button type="submit" disabled={isLoading} className={`w-full bg-gradient-to-r from-lavender-dark to-lavender text-black font-bold py-4 rounded-xl transition-all mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(150,123,182,0.6)]'}`}>
                {isLoading ? 'Connecting to server...' : 'Login'}
            </button>
        </form>
        
        <p className="text-gray-400 text-center mt-6 text-sm">
            Don't have an account? <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-lavender font-bold hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
