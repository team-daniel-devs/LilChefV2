import React, { useEffect, useState } from "react";
import { db } from "../firebaseconfig"; // Firebase configuration
import { doc, getDoc } from "firebase/firestore"; // Firestore methods
import SavedRecipe from "../components/SavedRecipe"; // SavedRecipe component

const Saved = () => {
  const [savedRecipes, setSavedRecipes] = useState([]); // State to hold saved recipes
  const userId = "C87jGxF8LzRxrHzXt5EIkORhNHS2"; // Hardcoded user ID, replace with dynamic logic as needed

  useEffect(() => {
    // Function to fetch saved recipes for the user
    const fetchSavedRecipes = async () => {
      try {
        // Get the user document from Firestore
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
          console.error("User not found");
          return; // Exit if user doesn't exist
        }

        const userData = userDoc.data(); // Get user data
        const recipeIds = userData.savedRecipes || []; // Get the saved recipe IDs or an empty array

        // Fetch each recipe document using the IDs
        const recipePromises = recipeIds.map((recipeId) =>
          getDoc(doc(db, "recipes", recipeId))
        );

        // Resolve all promises and filter out non-existent recipes
        const recipeDocs = await Promise.all(recipePromises);
        const recipes = recipeDocs
          .filter((doc) => doc.exists()) // Ensure the document exists
          .map((doc) => ({ id: doc.id, ...doc.data() })); // Map document data into recipe objects

        setSavedRecipes(recipes); // Update state with the fetched recipes
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
      }
    };

    fetchSavedRecipes(); // Call the function
  }, [userId]); // Dependency array ensures this runs only when `userId` changes

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* Header Section */}
      <header className="flex justify-between items-center px-4 py-6">
        <h1 className="text-2xl font-bold">Saved Recipes</h1>
        <img
          src="/images/profile-icon.png" // Profile icon image
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
      </header>

      {/* Search Bar Section */}
      <div className="mb-4">
        <div className="flex items-center bg-white p-3 rounded-lg shadow">
          <img
            src="/images/search.png" // Search icon image
            alt="Search"
            className="w-5 h-5 text-gray-500 mr-2"
          />
          <input
            type="text"
            placeholder="Search saved recipes" // Input placeholder text
            className="w-full bg-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      {/* Filter and Sort Buttons */}
      <div className="flex gap-4 mb-6">
        <button className="flex-1 bg-green-500 text-white py-2 rounded-full flex items-center justify-center">
          <img
            src="/images/filter.png" // Filter icon image
            alt="Filter"
            className="w-5 h-5 mr-2"
          />
          Filter
        </button>
        <button className="flex-1 bg-green-500 text-white py-2 rounded-full flex items-center justify-center">
          <img
            src="/images/sort.png" // Sort icon image
            alt="Sort"
            className="w-5 h-5 mr-2"
          />
          Sort
        </button>
      </div>

      {/* Recipe Grid Section */}
      <div className="grid grid-cols-2 gap-4">
        {savedRecipes.map((recipe) => (
          <SavedRecipe
            key={recipe.id} // Unique key for each recipe
            recipeId={recipe.id} // Pass recipe ID for navigation
            title={recipe.title} // Pass recipe title
            image={`/Food Images/${recipe.image_name}.jpg`} // Construct image path
            likes={Math.floor(Math.random() * 1000)} // Temporary random likes
            cookingTime={recipe.cooking_time || "N/A"} // Fallback if cooking time is missing
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
