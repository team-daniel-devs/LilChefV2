import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Navigation bar that goes at the bottom of the screen
const Navbar = () => {
  const location = useLocation(); // get the current location url (used to highlight what page you're on)

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#f8f9fa] text-black flex justify-around py-4 border-t border-gray-300 z-50">
      {/* Define a consistent width for all nav items */}
      <Link
        to="/home"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/home' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <span className="text-lg">🏠</span>
        <span className="text-xs">Home</span>
      </Link>

      <Link
        to="/about"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/about' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <span className="text-lg">🔎</span>
        <span className="text-xs">Search</span>
      </Link>

      <Link
        to="/settings"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/settings' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <span className="text-lg">📅</span>
        <span className="text-xs">Plan</span>
      </Link>
      
      <Link
        to="/saved"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/saved' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <span className="text-lg">💾</span>
        <span className="text-xs">Saved</span>
      </Link>

      <Link
        to="/grocery"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/grocery' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <span className="text-lg">🛒</span>
        <span className="text-xs">Grocery</span>
      </Link>
    </nav>
  );
};

export default Navbar;
