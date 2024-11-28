import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddToShoppingList from "../components/AddToShoppingList";

const RecipePage = () => {
  const [isShoppingListVisible, setIsShoppingListVisible] = useState(false);

  useEffect(() => {
    // Enable scrolling for this page
    document.body.style.overflow = "auto";

    return () => {
      // Restore original overflow when leaving this page
      document.body.style.overflow = "hidden";
    };
  }, []);

  let navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Ingredients", "Instructions", "Nutrition"];
  const content = [
    <div className="p-4">Ingredients content here...</div>,
    <div className="p-4">Instructions content here...</div>,
    <div className="p-4">Nutrition content here...</div>,
  ];

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollLeft = scrollContainer.scrollLeft;
    const width = scrollContainer.offsetWidth;

    // Update activeTab based on scroll position
    const newTab = Math.round(scrollLeft / width);
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const scrollToTab = (index) => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const width = scrollContainer.offsetWidth;
      scrollContainer.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={() => navigate(-1)} className="text-gray-700 text-lg">
          ←
        </button>
        <h1 className="mx-auto font-bold text-lg">Recipe</h1>
        <button className="text-green-500 text-lg">✓</button>
      </div>

      {/* Image */}
      <div className="w-full">
        <img
          src="https://via.placeholder.com/600x400" // Replace with actual image URL
          alt="Recipe"
          className="w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-grow p-4">
        <h2 className="text-2xl font-bold">Stuffed Zucchinis</h2>
        <p className="text-sm text-gray-500">By: Noah Yu</p>
        <div className="flex items-center mt-2 space-x-4">
          <span className="text-sm text-gray-600">25 mins</span>
          <span className="text-sm text-gray-600">Easy</span>
          <span className="text-sm text-gray-600">300 cal</span>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-4 space-x-4">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`text-sm ${
                activeTab === index
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-500"
              }`}
              onClick={() => scrollToTab(index)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Swipable Content */}
        <div
          ref={scrollContainerRef}
          className="mt-4 flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
        >
          {content.map((item, index) => (
            <div
              key={index}
              className="min-w-full snap-center"
              style={{ flexShrink: 0 }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Add to Shopping List Button */}
      <button
        onClick={() => setIsShoppingListVisible(true)}
        className="w-full py-3 bg-green-500 text-white text-lg font-bold rounded-lg"
      >
        Add to Shopping List
      </button>

      {/* AddToShoppingList Popup */}
      <AddToShoppingList
        isVisible={isShoppingListVisible}
        onClose={() => setIsShoppingListVisible(false)}
      />
    </div>
  );
};

export default RecipePage;
