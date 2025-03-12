import React, { useEffect, useState } from "react";
import SavedRecipe from "../components/SavedRecipe"; // SavedRecipe component
import { fetchImageUrl } from "../utils/imageUtils";
import { fetchSavedRecipes, onAuthStateChanged, parseSingleValue } from "../utils/firebaseUtils";

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
        setLoading(true);
        const recipes = await fetchSavedRecipes(userId);

        // Parse the cooking time and attach image URLs
        const recipesWithData = await Promise.all(
          recipes.map(async (recipe) => {
            // 1) Parse the cooking time field
            const cookingTime = recipe["Cooking Time"]
              ? parseSingleValue(recipe["Cooking Time"])
              : "N/A";

            // 2) Fetch image URL
            const imageUrl = recipe.image_name
              ? await fetchImageUrl(recipe.image_name)
              : "/images/placeholder.jpg";

            return {
              ...recipe,
              cookingTime,
              imageUrl,
            };
          })
        );

        setSavedRecipes(recipesWithData);
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
      } finally {
        setLoading(false);
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
    <div className="min-h-screen p-4 bg-[#F7F7F7]">
      {/* Header */}
      <header className="flex items-center justify-center p-10 mt-4">
        <h1 className="text-2xl text-gray-800">Saved Recipes</h1>
      </header>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center bg-white p-3 rounded-3xl">
          <img
            src="images/search.png"
            alt="Search Icon"
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
      <div className="flex justify-start mb-4">
        <div className="flex gap-2 w-48">
          <button className="flex-1 bg-[#0E9A61] text-white py-2 rounded-2xl shadow-md flex justify-center items-center gap-2">
            <img src="images/filter.png" alt="Filter Icon" className="w-5 h-5" />
            Filter
          </button>
          <button className="flex-1 bg-[#0E9A61] text-white py-2 rounded-2xl shadow-md flex justify-center items-center gap-2">
            <img src="images/sort.png" alt="Sort Icon" className="w-4 h-4" />
            Sort
          </button>
        </div>
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
            cookingTime={recipe.cookingTime || "N/A"} // Fallback if cooking time is missing
          />
        ))}
      </div>
    </div>
  );
};

export default Saved;


