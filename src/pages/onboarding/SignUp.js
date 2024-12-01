import React from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="flex flex-col h-screen bg-white px-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full mt-6">
        <button>
          <span className="text-gray-500 text-lg">&#8592;</span> {/* Back arrow */}
        </button>
        <button className="text-green-600 font-medium hover:underline"><Link to="/home">Skip</Link></button>
      </div>

      {/* Logo */}
      <div className="flex justify-center mt-8">
        <img
          src="/images/logo_better.png"
          alt="Logo"
          className="w-20 h-20"
        />
      </div>

      {/* Welcome Text */}
      <div className="mt-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome <span className="ml-2">👋</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          First time? We’ll save your favorite recipes and plans as you go — lemon squeezy!
        </p>
      </div>

      {/* Form */}
      <form className="flex flex-col w-full max-w-md mt-8">
        <input
          type="text"
          placeholder="First Name"
          className="bg-gray-100 rounded-md p-3 mb-4 text-sm outline-none focus:ring-2 focus:ring-green-600"
        />
        <input
          type="email"
          placeholder="Email"
          className="bg-gray-100 rounded-md p-3 mb-4 text-sm outline-none focus:ring-2 focus:ring-green-600"
        />
        <input
          type="password"
          placeholder="Password"
          className="bg-gray-100 rounded-md p-3 mb-6 text-sm outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          type="submit"
          className="bg-green-600 text-white font-medium py-3 rounded-md shadow-md hover:bg-green-500 transition"
        >
          <Link to="/home">Create Account</Link>
        </button>
      </form>

      {/* Spacer */}
      <div className="flex-grow"></div>
    </div>
  );
};

export default SignUp;
