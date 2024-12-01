import React, { useState } from "react";
import { addEmailToArray } from "./Realtime"; // Import the updated function

const Desktop = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false); // State to track submission

  const handleSubmit = async () => {
    if (email.trim() !== "") {
      try {
        setSubmitted(true); // Set submitted state to true
        await addEmailToArray("betaTesters", email);
      } catch (error) {
        console.error("Error adding email:", error);
      }
    } else {
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Section with Large Cut-Off Circle */}
      <div
        className="relative w-1/2 flex items-center justify-end overflow-hidden"
        style={{ backgroundColor: "#129b62" }}
      >
        {/* Large Circle */}
        <div className="absolute -left-72 md:-left-48 lg:-left-36 w-[50vw] h-[115vh] bg-white rounded-full flex items-center justify-center">
          {/* Logo */}
          <div className="text-center relative" style={{ left: "3vw" }}>
            <img
              src="/images/logo_better.png"
              alt="Better Logo"
              className="w-48 h-48"
            />
          </div>
        </div>
      </div>

      {/* Right Section with Custom Green Background */}
      <div
        className="w-1/2 text-white flex flex-col justify-center pl-12 pr-56"
        style={{ backgroundColor: "#129b62" }}
      >
        {/* Main Heading */}
        <h2 className="text-4xl font-semibold mb-4 text-left">
          A gourmet chef, right in your pocket.
        </h2>

        {/* Dynamic Subtext */}
        <p className="text-lg mb-6 text-left">
          {submitted
            ? "Great! We just sent you an email!"
            : "Sign up to be a beta tester, and we’ll email you the next steps."}
        </p>

        {/* Input and Button Box */}
        {!submitted && (
          <div className="w-full max-w-md flex">
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state on input change
              className="flex-grow px-4 py-3 rounded-l-lg text-gray-700 outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={handleSubmit} // Call handleSubmit on button click
              className="bg-white text-green-700 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Desktop;
