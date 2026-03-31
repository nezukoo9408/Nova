import React from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

function Layout({ children }) {
  return (
    <div className="min-h-screen text-gray-200 selection:bg-lavender-dark selection:text-white font-sans overflow-x-hidden">
      <Navbar />
      <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-24 pb-12 px-6 max-w-7xl mx-auto"
      >
        {children}
      </motion.main>
    </div>
  );
}

export default Layout;
