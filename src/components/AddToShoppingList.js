import React, { useState } from "react";

const AddToShoppingList = ({ isVisible, onClose }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  
  const vegetableStirFryIngredients = [
    { name: "Zucchinis (2 medium)", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSikJWQimooxt4bMqJeClIKPw41PZkDPS4KMQ&s" },
    { name: "Cooked Quinoa (1 cup)", img: "https://cdn.loveandlemons.com/wp-content/uploads/2019/09/quinoa.jpg" },
    { name: "Shredded Mozzarella Cheese (1/2 cup)", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-zGX_k_WVybeYieYF_xDuDjvk_ihkx72bJA&s" },
    { name: "Grated Parmesan Cheese (1/4 cup)", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS37XjmaCJtQq1v1iacYPLmj2j4Z_Ph_EUCTQ&s" },
    { name: "Small Onion (1, finely chopped)", img: "https://m.media-amazon.com/images/I/81fS9-IMIFL._AC_UF894,1000_QL80_.jpg" },
    { name: "Garlic Cloves (2, minced)", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3eyhNI3iWPcX3kZg-FpE4cz_KvTb2vm_G8A&s" },
    { name: "Marinara Sauce (1 cup)", img: "https://www.allrecipes.com/thmb/4X86LzlzRXty6zbIzo2zDZZ6Ugc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/11966-best-marinara-sauce-yet-DDMFS-4x3-078e494b66c4485e8efe0971473b3196.jpg" },
    { name: "Olive Oil (1 tbsp)", img: "https://health.ucdavis.edu/media-resources/contenthub/post/internet/good-food/2024/04/images-body/olive-oil-health-benefits.jpg" },
    { name: "Dried Oregano (1/2 tsp)", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_VYFwM5h9E1CDwQZGe7eZFPYRvbHL44MRzw&s" },
    { name: "Salt and Pepper (to taste)", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8ErCqSZYBG36Y7CwuY0lchBg_NsfepHkdKA&s" },
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
          <h2 className="text-lg font-semibold">Vegetable Stir-Fry</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">Servings:</span>
            <input
              type="number"
              defaultValue={4}
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
                selectedIngredients.length === vegetableStirFryIngredients.length
                  ? []
                  : vegetableStirFryIngredients.map((item) => item.name)
              )
            }
          >
            {selectedIngredients.length === vegetableStirFryIngredients.length
              ? "Unselect All"
              : "Select All"}
          </button>
        </h3>
        <div className="flex-grow overflow-y-auto">
          {vegetableStirFryIngredients.map((ingredient) => (
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
