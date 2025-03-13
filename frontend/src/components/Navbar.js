import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Navigation bar that goes at the bottom of the screen
const Navbar = () => {
  const location = useLocation(); // get the current location url (used to highlight what page you're on)

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#f8f9fa] h-20 text-black flex justify-around py-4 border-t border-gray-300 z-50">
      {/* Define a consistent width for all nav items */}
      <Link
        to="/home"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/home' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <img
          src={
            location.pathname === '/home'
              ? '/images/navbar/home_selected.svg'
              : '/images/navbar/home.svg'
          }
          alt="Home"
          className="w-6 h-6"
        />
      </Link>

      <Link
        to="/search"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/search' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <img
          src={
            location.pathname === '/search'
              ? '/images/navbar/search_selected.svg'
              : '/images/navbar/search.svg'
          }
          alt="Search"
          className="w-6 h-6"
        />
      </Link>

      <Link
        to="/plan"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/plan' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <img
          src={
            location.pathname === '/plan'
              ? '/images/navbar/schedule_selected.svg'
              : '/images/navbar/schedule.svg'
          }
          alt="Plan"
          className="w-6 h-6"
        />
      </Link>

      <Link
        to="/saved"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/saved' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <img
          src={
            location.pathname === '/saved'
              ? '/images/navbar/save_selected.svg'
              : '/images/navbar/save.svg'
          }
          alt="Saved"
          className="w-6 h-6"
        />
      </Link>

      <Link
        to="/grocery"
        className={`flex flex-col items-center w-20 ${
          location.pathname === '/grocery' ? 'text-cyan-400' : 'text-gray-600'
        }`}
      >
        <img
          src={
            location.pathname === '/grocery'
              ? '/images/navbar/shoppingcart_selected.svg'
              : '/images/navbar/shoppingcart.svg'
          }
          alt="Grocery"
          className="w-6 h-6"
        />
      </Link>
    </nav>
  );
};

export default Navbar;
