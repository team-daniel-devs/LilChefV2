import React, { useState } from "react";
import GroceryRecipe from "../components/GroceryRecipe";

const Grocery = () => {
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: "Stuffed Zucchini",
      image: "/mnt/data/Stuffed Zucchini.png",
    },
    {
      id: 2,
      title: "Chicken Alfredo",
      image: "https://via.placeholder.com/150?text=Chicken+Alfredo",
    },
    {
      id: 3,
      title: "Beef Tacos",
      image: "https://via.placeholder.com/150?text=Beef+Tacos",
    },
    {
      id: 4,
      title: "Caesar Salad",
      image: "https://via.placeholder.com/150?text=Caesar+Salad",
    },
  ]);

  const [servings, setServings] = useState(3);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "6 medium zucchinis", image: "https://via.placeholder.com/50", checked: false },
    { id: 2, name: "600g of ground chicken", image: "https://via.placeholder.com/50", checked: false },
    { id: 3, name: "1 potato", image: "https://via.placeholder.com/50", checked: false },
    { id: 4, name: "1 onion", image: "https://via.placeholder.com/50", checked: false },
    { id: 5, name: "1 bell pepper", image: "https://via.placeholder.com/50", checked: false },
    { id: 6, name: "1 garlic clove", image: "https://via.placeholder.com/50", checked: false },
    { id: 7, name: "Salt to taste", image: "https://via.placeholder.com/50", checked: false },
    { id: 8, name: "Pepper to taste", image: "https://via.placeholder.com/50", checked: false },
    { id: 9, name: "Olive oil", image: "https://via.placeholder.com/50", checked: false },
    { id: 10, name: "Grated cheese", image: "https://via.placeholder.com/50", checked: false },
  ]);

  const toggleChecked = (id) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-semibold">Shopping List</h1>
        <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="sr-only">Profile</span>
          <i className="fas fa-user text-gray-600"></i>
        </button>
      </header>

      {/* Recipe List */}
      <div className="p-4">
        <p className="text-lg font-medium mb-2">{recipes.length} recipes</p>
        <div className="flex space-x-4 overflow-x-auto">
          {recipes.map((recipe) => (
            <div className="flex-shrink-0">
              <GroceryRecipe key={recipe.id} title={recipe.title} image={recipe.image} />
            </div>
          ))}
        </div>
      </div>

      {/* "10 Items" Text */}
      <div className="px-4 mt-4">
        <h3 className="text-lg font-medium mb-2">10 items</h3>
      </div>

      {/* Scrollable Items List */}
      <div className="flex-1 overflow-y-auto px-4">
        <ul className="space-y-2">
          {ingredients.map((item) => (
            <li
              key={item.id}
              className="flex items-center bg-white p-4 shadow rounded-lg"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-md mr-4"
              />
              <span className="flex-1">{item.name}</span>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleChecked(item.id)}
                className="w-5 h-5"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow p-4 flex justify-around">
        <button className="text-gray-600">
          <i className="fas fa-home"></i>
        </button>
        <button className="text-gray-600">
          <i className="fas fa-calendar-alt"></i>
        </button>
        <button className="text-green-600">
          <i className="fas fa-shopping-cart"></i>
        </button>
      </nav>
    </div>
  );
};

export default Grocery;
