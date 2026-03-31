import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Search from './pages/Search';
import BusSeats from './pages/BusSeats';
import Payment from './pages/Payment';
import Receipt from './pages/Receipt';
import History from './pages/History';
import Admin from './pages/Admin';
import Waitlist from './pages/Waitlist';
import AnimatedBackground from './components/AnimatedBackground';

// Component to enforce layout around protected pages
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <>
      <AnimatedBackground />
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/buses" element={<ProtectedRoute><BusSeats /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/receipt" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/waitlist" element={<ProtectedRoute><Waitlist /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
