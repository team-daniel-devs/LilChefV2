import React, { useState } from "react";
import GroceryRecipe from "../components/GroceryRecipe";

const Grocery = () => {
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: "Vegetable Stir-Fry",
      image: "https://www.wholesomeyum.com/wp-content/uploads/2020/11/wholesomeyum-Stir-Fry-Vegetables-15.jpg",
    },
  ]);

  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Zucchinis (2 medium)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSikJWQimooxt4bMqJeClIKPw41PZkDPS4KMQ&s", checked: false },
    { id: 2, name: "Cooked Quinoa (1 cup)", image: "https://cdn.loveandlemons.com/wp-content/uploads/2019/09/quinoa.jpg", checked: false },
    { id: 3, name: "Shredded Mozzarella Cheese (1/2 cup)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-zGX_k_WVybeYieYF_xDuDjvk_ihkx72bJA&s", checked: false },
    { id: 4, name: "Grated Parmesan Cheese (1/4 cup)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS37XjmaCJtQq1v1iacYPLmj2j4Z_Ph_EUCTQ&s", checked: false },
    { id: 5, name: "Small Onion (1, finely chopped)", image: "https://m.media-amazon.com/images/I/81fS9-IMIFL._AC_UF894,1000_QL80_.jpg", checked: false },
    { id: 6, name: "Garlic Cloves (2, minced)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3eyhNI3iWPcX3kZg-FpE4cz_KvTb2vm_G8A&s", checked: false },
    { id: 7, name: "Marinara Sauce (1 cup)", image: "https://www.allrecipes.com/thmb/4X86LzlzRXty6zbIzo2zDZZ6Ugc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/11966-best-marinara-sauce-yet-DDMFS-4x3-078e494b66c4485e8efe0971473b3196.jpg", checked: false },
    { id: 8, name: "Olive Oil (1 tbsp)", image: "https://health.ucdavis.edu/media-resources/contenthub/post/internet/good-food/2024/04/images-body/olive-oil-health-benefits.jpg", checked: false },
    { id: 9, name: "Dried Oregano (1/2 tsp)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_VYFwM5h9E1CDwQZGe7eZFPYRvbHL44MRzw&s", checked: false },
    { id: 10, name: "Salt and Pepper (to taste)", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8ErCqSZYBG36Y7CwuY0lchBg_NsfepHkdKA&s", checked: false },
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
        <p className="text-lg font-medium mb-2">{recipes.length} recipe</p>
        <div className="flex space-x-4 overflow-x-auto">
          {recipes.map((recipe) => (
            <div className="flex-shrink-0" key={recipe.id}>
              <GroceryRecipe title={recipe.title} image={recipe.image} />
            </div>
          ))}
        </div>
      </div>

      {/* "Items" Text */}
      <div className="px-4 mt-4">
        <h3 className="text-lg font-medium mb-2">{ingredients.length} items</h3>
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
