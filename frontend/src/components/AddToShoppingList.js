import React, { useState } from "react";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../firebaseconfig"; 
import { getAuth } from "firebase/auth";

const AddToShoppingList = ({ recipe, onClose }) => {
  // State to track selected ingredients
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const auth = getAuth(); // Get the Firebase Auth instance

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

  // Add selected ingredients to the shopping list in Firestore
  const handleAddToList = async () => {
    const user = auth.currentUser; // Get the currently logged-in user
  
    if (!user) {
      console.error("User not logged in");
      return;
    }
  
    if (!recipe?.id) {
      console.error("Recipe ID is undefined. Cannot add to shopping list.");
      return;
    }
  
    try {
      const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
      const userDoc = await getDoc(userDocRef); // Fetch the user's document
  
      // Initialize or retrieve the shopping_list field
      const shoppingList = userDoc.data()?.shopping_list || {}; // Get existing or create a new shopping_list map
  
      // Add or update the recipe_id map within the shopping_list
      if (!shoppingList[recipe.id]) {
        // If recipe_id doesn't exist, initialize it
        shoppingList[recipe.id] = { ingredients: [] };
      }
  
      // Merge ingredients for the specific recipe_id, avoiding duplicates
      shoppingList[recipe.id].ingredients = Array.from(
        new Set([
          ...(shoppingList[recipe.id].ingredients || []),
          ...selectedIngredients,
        ])
      );
  
      // Update the Firestore document
      await updateDoc(userDocRef, { shopping_list: shoppingList });
  
      console.log(`Ingredients added to recipe ID "${recipe.id}"`, selectedIngredients);
      onClose(); // Close the popup
    } catch (error) {
      console.error("Error updating shopping list:", error);
    }
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
