import React, { useState } from "react";

const AddToShoppingList = ({ recipe, onClose }) => {
  // State to track selected ingredients
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // Toggle individual ingredient selection
  const handleSelectIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(
        selectedIngredients.filter((item) => item !== ingredient)
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Select or Deselect all ingredients
  const handleSelectAll = () => {
    if (selectedIngredients.length === recipe.ingredients.length) {
      setSelectedIngredients([]); // Deselect all
    } else {
      setSelectedIngredients(recipe.ingredients); // Select all
    }
  };

  // Add selected ingredients to the shopping list
  const handleAddToList = () => {
    console.log("Ingredients added to shopping list:", selectedIngredients);
    onClose(); // Close the popup
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 ${
        recipe ? "visible" : "invisible"
      }`}
    >
      <div
        className="bg-white w-full rounded-t-2xl shadow-lg flex flex-col overflow-hidden"
        style={{ height: "90%" }}
      >
        {/* Popup Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-bold">Add to Shopping List</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Recipe Info */}
        <div className="px-6 mb-4">
          <h3 className="text-lg font-semibold">{recipe?.title || "Recipe"}</h3>
          <div className="flex items-center mt-2">
            <span className="text-gray-500 mr-2">Servings:</span>
            <input
              type="number"
              defaultValue={recipe?.servings || 1}
              className="w-12 border border-gray-300 rounded-md text-center"
            />
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="px-6 flex justify-between items-center">
          <h3 className="text-lg font-bold">Ingredients</h3>
          <button
            onClick={handleSelectAll}
            className="text-sm text-green-500 font-medium"
          >
            {selectedIngredients.length === recipe.ingredients.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {/* Ingredients List */}
        <div className="px-6 mt-4 flex-grow overflow-y-auto">
          {recipe?.ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIngredients.includes(ingredient)}
                  onChange={() => handleSelectIngredient(ingredient)}
                  className="w-5 h-5 accent-green-500 mr-4"
                />
                <span className="text-gray-700">{ingredient}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <div className="fixed bottom-16 left-0 right-0 px-6 py-4 bg-white z-50">
          <button
            onClick={handleAddToList}
            className="bg-green-500 text-white w-full py-3 rounded-lg font-bold shadow-lg"
          >
            Add {selectedIngredients.length || "All"} Item
            {selectedIngredients.length !== 1 && "s"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToShoppingList;
