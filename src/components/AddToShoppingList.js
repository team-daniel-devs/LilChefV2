import React, { useState } from "react";

const AddToShoppingList = ({ isVisible, onClose }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const placeholderIngredients = [
    { name: "6 medium zucchinis", img: "https://via.placeholder.com/50" },
    { name: "600g of ground chicken", img: "https://via.placeholder.com/50" },
    { name: "1 potato", img: "https://via.placeholder.com/50" },
    { name: "1 onion", img: "https://via.placeholder.com/50" },
    { name: "1 bell pepper", img: "https://via.placeholder.com/50" },
    { name: "2 cloves of garlic", img: "https://via.placeholder.com/50" },
    { name: "300g of shredded cheese", img: "https://via.placeholder.com/50" },
  ];

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(
        selectedIngredients.filter((item) => item !== ingredient)
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleAddItems = () => {
    console.log("Selected Ingredients:", selectedIngredients);
    onClose();
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 h-[80%] bg-white rounded-t-2xl shadow-lg z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Add to Shopping List</h1>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Recipe Info */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Stuffed Zucchinis</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">Servings:</span>
            <input
              type="number"
              defaultValue={3}
              className="w-12 border border-gray-300 rounded-md text-center"
            />
          </div>
        </div>

        {/* Ingredients List */}
        <h3 className="text-md font-bold mb-3 flex justify-between items-center">
          Ingredients
          <button
            className="text-sm text-green-500 font-medium"
            onClick={() =>
              setSelectedIngredients(
                selectedIngredients.length === placeholderIngredients.length
                  ? []
                  : placeholderIngredients.map((item) => item.name)
              )
            }
          >
            {selectedIngredients.length === placeholderIngredients.length
              ? "Unselect All"
              : "Select All"}
          </button>
        </h3>
        <div className="flex-grow overflow-y-auto">
          {placeholderIngredients.map((ingredient) => (
            <div
              key={ingredient.name}
              className="flex items-center mb-4 border-b border-gray-200 pb-2 cursor-pointer"
              onClick={() => toggleIngredient(ingredient.name)}
            >
              <img
                src={ingredient.img}
                alt={ingredient.name}
                className="w-12 h-12 rounded-md object-cover mr-4"
              />
              <span className="flex-grow text-gray-700">{ingredient.name}</span>
              <input
                type="checkbox"
                checked={selectedIngredients.includes(ingredient.name)}
                readOnly
                className="w-5 h-5 accent-green-500 pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Add Items Button */}
        <button
          onClick={handleAddItems}
          className="mt-4 py-3 bg-green-500 text-white text-lg font-bold rounded-lg shadow-lg"
        >
          Add {selectedIngredients.length} Item
          {selectedIngredients.length !== 1 && "s"}
        </button>
      </div>
    </div>
  );
};

export default AddToShoppingList;
