import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api';

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState({
      name: '', email: '', username: '', password: '', gender: 'Male'
  });
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      // Auto login after signup by automatically calling the login endpoint
      const loginRes = await api.post('/auth/login', { username: formData.username, password: formData.password });
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans p-4">
      
      <div className="bg-[#121212]/80 backdrop-blur-xl border border-lavender/30 p-10 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(150,123,182,0.15)] relative z-10">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lavender to-white text-center mb-8">
            Create an Account
        </h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <input 
                type="text" placeholder="Full Name" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-lavender/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all"
            />
            <input 
                type="email" placeholder="Email Address" required
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-lavender/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all"
            />
            <input 
                type="text" placeholder="Username" required
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-lavender/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all"
            />
            <input 
                type="password" placeholder="Password" required
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-lavender/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lavender transition-all"
            />
            
            <div className="flex justify-between items-center bg-[#1a1a1a] border border-lavender/20 rounded-xl px-4 py-3">
                <span className="text-gray-400">Gender</span>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                        <input type="radio" value="Male" checked={formData.gender==='Male'} onChange={e => setFormData({...formData, gender: 'Male'})}/> Male
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                        <input type="radio" value="Female" checked={formData.gender==='Female'} onChange={e => setFormData({...formData, gender: 'Female'})}/> Female
                    </label>
                </div>
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-lavender-dark to-lavender text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(150,123,182,0.6)] transition-all mt-4">
                Register
            </button>
        </form>
        
        <p className="text-gray-400 text-center mt-6">
            Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-lavender font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
