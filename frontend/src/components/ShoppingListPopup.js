import React, { useState } from "react";

const ShoppingListPopup = ({ recipe, onClose }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const handleSelectIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(
        selectedIngredients.filter((item) => item !== ingredient)
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIngredients.length === recipe.ingredients.length) {
      setSelectedIngredients([]); // Deselect all
    } else {
      setSelectedIngredients(recipe.ingredients); // Select all
    }
  };

  const handleAddToList = () => {
    console.log("Ingredients added to shopping list:", selectedIngredients);
    onClose(); // Close popup after adding
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div
        className="bg-white w-full flex flex-col relative"
        style={{
          height: "90%", // Fills most of the screen height
          maxWidth: "100%", // Ensures full screen width
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
          zIndex: 50, // Ensure it appears above other elements
        }}
      >
        {/* Popup Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold flex items-center">
            Add to Shopping List
            <button onClick={onClose} className="ml-2">
              <img
                src="/images/downarrow.png"
                alt="Close"
                className="w-5 h-5 cursor-pointer"
              />
            </button>
          </h2>
        </div>

        {/* Recipe Info */}
        <div className="px-6">
          <p className="font-semibold">{recipe.title}</p>
          <div className="flex items-center text-sm mt-2">
            <span className="text-gray-500">Servings:</span>
            <input
              type="number"
              className="ml-2 border border-gray-300 rounded w-12 text-center"
              defaultValue={recipe.servings || 1}
            />
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="px-6 mt-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Ingredients</h3>
          <button
            className="text-sm text-green-500"
            onClick={handleSelectAll}
          >
            {selectedIngredients.length === recipe.ingredients.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {/* Ingredients List */}
        <div
          className="flex-grow overflow-y-auto px-6 mt-2"
          style={{
            paddingBottom: "4rem", // Adds space to avoid button overlap
          }}
        >
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-gray-700"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedIngredients.includes(ingredient)}
                    onChange={() => handleSelectIngredient(ingredient)}
                  />
                  <span>{ingredient}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Add Button */}
        <div
          className="bg-white px-6 py-4"
          style={{
            position: "sticky",
            bottom: "4rem", // Place above navbar
            zIndex: 50, // Ensure visibility over navbar
          }}
        >
          <button
            onClick={handleAddToList}
            className="bg-green-500 text-white w-full py-3 rounded-lg font-semibold"
          >
            Add {selectedIngredients.length || "All"} Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListPopup;
