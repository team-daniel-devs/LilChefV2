import React, { useEffect, useState } from "react";
import SavedRecipe from "../components/SavedRecipe"; // SavedRecipe component
import { fetchImageUrl } from "../utils/imageUtils";
import { fetchSavedRecipes, onAuthStateChanged } from "../utils/firebaseUtils";

const Saved = () => {
  const [savedRecipes, setSavedRecipes] = useState([]); // State to hold saved recipes
  const [userId, setUserId] = useState(null); // State to hold the current user's ID
  const [loading, setLoading] = useState(true); // Loading state for recipes

  // Enable scrolling for this page
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  // Listen for the currently logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the user's ID
      } else {
        console.error("No user is logged in");
        setUserId(null);
        setSavedRecipes([]); // Clear saved recipes if no user is logged in
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Fetch saved recipes when userId changes
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecipes = async () => {
      try {
        setLoading(true); // Set loading to true when starting the fetch
        const recipes = await fetchSavedRecipes(userId); // Fetch recipes using the utility function
        const recipesWithImages = await Promise.all(
          recipes.map(async (recipe) => ({
            ...recipe,
            imageUrl: recipe.image_name
              ? await fetchImageUrl(recipe.image_name)
              : "/images/placeholder.jpg", // Attach image URLs
          }))
        );
        setSavedRecipes(recipesWithImages); // Update the state with recipes
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchRecipes();
  }, [userId]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading saved recipes...</p>
      </div>
    );
  }

  // Handle case when no recipes are saved
  if (!savedRecipes.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No saved recipes found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="flex items-center justify-center p-10">
        <h1 className="text-2xl font-semibold text-gray-800">Saved Recipes</h1>
      </header>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center bg-white p-3 rounded-lg shadow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="w-5 h-5 text-gray-500 mr-2"
          >
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zm-5.479.607a5.5 5.5 0 1110 0 5.5 5.5 0 01-10 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search saved recipes"
            className="w-full bg-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      {/* Filter and Sort Buttons */}
      <div className="flex gap-4 mb-6">
        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg shadow-md flex justify-center items-center gap-2">
          Filter
        </button>
        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg shadow-md flex justify-center items-center gap-2">
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
            image={recipe.imageUrl} // Construct image path
            likes={Math.floor(Math.random() * 1000)} // Temporary random likes
            cookingTime={recipe.cooking_time || "N/A"} // Fallback if cooking time is missing
          />
        ))}
      </div>
    </div>
  );
};

export default Saved;


