import React, { useState } from "react";

const FilterPage = ({ isVisible, onClose }) => {
  const [selectedCookingTimes, setSelectedCookingTimes] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const toggleSelection = (item, selectedItems, setSelectedItems) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item)); // Remove if already selected
    } else {
      setSelectedItems([...selectedItems, item]); // Add if not selected
    }
  };

  const handleApplyFilter = () => {
    console.log({
      selectedCookingTimes,
      selectedDifficulties,
      selectedIngredients,
    });
    onClose(); // Close the filter page
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        height: "80%", // Adjust as needed
      }}
    >
      <div
        className="p-6 h-full overflow-y-auto pb-[calc(64px+16px)]"
        style={{
          paddingTop: "24px", // Add extra whitespace at the top
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Filter your search</h1>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Add extra space at the start */}
        <div className="h-4"></div> {/* White space at the top */}

        {/* Content */}
        <div className="space-y-6">
          {/* Cooking Time */}
          <div>
            <h2 className="text-lg font-bold flex justify-between items-center">
              Cooking Time
              <span className="text-green-500 text-sm cursor-pointer">
                Reset
              </span>
            </h2>
            <div className="flex gap-3 mt-3">
              {["15 min", "30 min", "1 hour", ">1 hour"].map((time) => (
                <button
                  key={time}
                  onClick={() =>
                    toggleSelection(time, selectedCookingTimes, setSelectedCookingTimes)
                  }
                  className={`px-4 py-2 rounded-lg border border-gray-300 ${
                    selectedCookingTimes.includes(time)
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients Price */}
          <div>
            <h2 className="text-lg font-bold">Ingredients Price</h2>
            <input
              type="range"
              className="w-full mt-2 accent-green-500"
              min="0"
              max="100"
            />
            <p className="text-gray-700 text-sm mt-2">$0</p>
          </div>

          {/* Difficulty */}
          <div>
            <h2 className="text-lg font-bold">Difficulty</h2>
            <div className="flex gap-3 mt-3">
              {["Easy", "Medium", "Hard"].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() =>
                    toggleSelection(
                      difficulty,
                      selectedDifficulties,
                      setSelectedDifficulties
                    )
                  }
                  className={`px-4 py-2 rounded-lg border border-gray-300 ${
                    selectedDifficulties.includes(difficulty)
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients in Stock */}
          <div>
            <h2 className="text-lg font-bold flex justify-between items-center">
              Ingredients in stock
              <span className="text-green-500 text-sm cursor-pointer">
                View all
              </span>
            </h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {[...Array(12).keys()].map((i) => (
                <button
                  key={i}
                  onClick={() =>
                    toggleSelection(
                      `Ingredient ${i}`,
                      selectedIngredients,
                      setSelectedIngredients
                    )
                  }
                  className={`px-4 py-2 rounded-full border border-gray-300 ${
                    selectedIngredients.includes(`Ingredient ${i}`)
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {`Ingredient ${i}`}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Filter Button */}
          <button
            onClick={handleApplyFilter}
            className="w-full py-3 bg-green-500 text-white text-lg font-bold rounded-lg shadow-lg"
          >
            Apply Filter
          </button>
        </div>

        {/* Add extra space at the end */}
        <div className="h-16"></div> {/* White space at the bottom */}
      </div>
    </div>
  );
};

export default FilterPage;
