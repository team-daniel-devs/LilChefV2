import React, { useEffect, useState } from "react";
import { db } from "../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import SavedRecipe from "../components/SavedRecipe";

const Saved = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const userId = "C87jGxF8LzRxrHzXt5EIkORhNHS2"; // Replace with dynamic user ID logic

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
          console.error("User not found");
          return;
        }

        const userData = userDoc.data();
        const recipeIds = userData.savedRecipes || [];

        const recipePromises = recipeIds.map((recipeId) =>
          getDoc(doc(db, "recipes", recipeId))
        );

        const recipeDocs = await Promise.all(recipePromises);
        const recipes = recipeDocs
          .filter((doc) => doc.exists())
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        setSavedRecipes(recipes);
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
      }
    };

    fetchSavedRecipes();
  }, [userId]);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-6">
        <h1 className="text-2xl font-bold">Saved Recipes</h1>
        <img
          src="/images/profile-icon.png"
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
      </header>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center bg-white p-3 rounded-lg shadow">
          <img
            src="/images/search.png"
            alt="Search"
            className="w-5 h-5 text-gray-500 mr-2"
          />
          <input
            type="text"
            placeholder="Search saved recipes"
            className="w-full bg-transparent outline-none text-gray-800"
          />
        </div>
      </div>


      {/* Filter and Sort Buttons */}
      <div className="flex gap-4 mb-6">
        <button className="flex-1 bg-green-500 text-white py-2 rounded-full flex items-center justify-center">
          <img
            src="/images/filter.png"
            alt="Filter"
            className="w-5 h-5 mr-2"
          />
          Filter
        </button>
        <button className="flex-1 bg-green-500 text-white py-2 rounded-full flex items-center justify-center">
          <img
            src="/images/sort.png"
            alt="Sort"
            className="w-5 h-5 mr-2"
          />
          Sort
        </button>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-2 gap-4">
        {savedRecipes.map((recipe) => (
          <SavedRecipe
            key={recipe.id}
            recipeId={recipe.id} // Pass recipeId for navigation
            title={recipe.title}
            image={`/Food Images/${recipe.image_name}.jpg`}
            likes={Math.floor(Math.random() * 1000)} // Temporary likes
            cookingTime={recipe.cooking_time || "N/A"} // Default to N/A if cooking time is missing
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white shadow-lg py-4 flex justify-around">
        <img src="/images/home-icon.png" alt="Home" className="w-6 h-6" />
        <img src="/images/search-icon.png" alt="Search" className="w-6 h-6" />
        <img src="/images/calendar-icon.png" alt="Plan" className="w-6 h-6" />
        <img src="/images/saved-icon.png" alt="Saved" className="w-6 h-6" />
        <img src="/images/cart-icon.png" alt="Cart" className="w-6 h-6" />
      </footer>
    </div>
  );
};

export default Saved;
