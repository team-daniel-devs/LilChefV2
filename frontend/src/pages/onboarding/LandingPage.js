import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [step, setStep] = useState(0);

  // Pages data including the welcome screen and onboarding steps
  const pages = [
    {
      type: "welcome",
      image: "/images/logo_better.png", // Replace with correct path
    },
    {
      title: "Recipes Just For You",
      image: "/images/paper.png", // Replace with correct path
      description: "Share your preferences and skill level to get started.",
    },
    {
      title: "Plan Your Week",
      image: "/images/schedule.png", // Replace with correct path
      description: "Get a meal plan and a smart grocery list.",
    },
    {
      title: "Cook with Confidence",
      image: "/images/check.png", // Replace with correct path
      description: "Follow easy steps to make great meals.",
    },
  ];

  const nextStep = () => {
    if (step < pages.length - 1) {
      setStep((prevStep) => prevStep + 1);
    } else {
      console.log("Onboarding Complete");
    }
  };

  useEffect(() => {
    // Disable scrolling/swiping
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-white overflow-hidden">
      {pages[step].type === "welcome" ? (
        // Welcome screen layout
        <div className="flex flex-col items-center justify-center flex-grow">
          <img
            src={pages[step].image}
            alt="Welcome"
            className="w-40 h-40 mb-6" // Increased size for welcome screen image
          />
        </div>
      ) : (
        // Onboarding steps layout
        <div className="flex flex-col items-center justify-center flex-grow transition-all duration-500">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            {pages[step].title}
          </h1>
          <img
            src={pages[step].image}
            alt={pages[step].title}
            className="w-3/4 max-w-md mb-6 transform transition-transform duration-500" // Increased size for onboarding step images
            key={step}
          />
          <p className="mt-4 text-sm text-gray-500 text-center">
            {pages[step].description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={nextStep}
          className="bg-green-600 text-white text-lg font-medium py-3 px-6 rounded-full shadow-md hover:bg-green-500 transition"
        >
          {step === pages.length - 1 ? (
            <Link to="/signup" className="text-white">
              Finish
            </Link>
          ) : step === 0 ? (
            "Get Started"
          ) : (
            "Continue"
          )}
        </button>
        {step > 0 && (
          <div className="flex space-x-2 mt-4">
            {pages.slice(1).map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === step - 1 ? "bg-green-600" : "bg-gray-300"
                }`}
              ></span>
            ))}
          </div>
        )}
        {step === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            Already a member?{" "}
            <a
              href="/login"
              className="text-green-600 font-semibold hover:underline"
            >
              Sign In
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
