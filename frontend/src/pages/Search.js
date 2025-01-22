import React, { useEffect, useState } from "react";
import SavedRecipe from "../components/SavedRecipe"; // SavedRecipe component
import { fetchImageUrl } from "../utils/imageUtils";
import { fetchSavedRecipes, onAuthStateChanged } from "../utils/firebaseUtils";
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { db } from "../firebaseconfig"; // Firebase configuration

const Search = () => {
  const [recipes, setRecipes] = useState([]); // State to hold all recipes
  const [filteredRecipes, setFilteredRecipes] = useState([]); // State for filtered recipes
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [userId, setUserId] = useState(null); // State to hold the current user's ID
  const [loading, setLoading] = useState(true); // Loading state for recipes

  // Enable scrolling for this page
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  // Fetch recipes from Firestore on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "recipes"));
        const fetchedRecipes = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            let ingredients = [];
            try {
              ingredients = data.ingredients
                ? JSON.parse(data.ingredients.replace(/'/g, '"'))
                : [];
            } catch (parseError) {
              console.error(
                "Error parsing ingredients for recipe:",
                data.title,
                data.ingredients
              );
              ingredients = [];
            }
  
            return {
              id: doc.id,
              title: data.title || "Untitled Recipe",
              prepTime: data.prepTime || "N/A",
              cookTime: data.cookTime || "N/A",
              servingCost: data.servingCost || "N/A",
              nutrition: data.nutrition || {},
              ingredients: ingredients.slice(0, 5),
              totalIngredients: ingredients.length,
              imageName: data.image_name
                ? await fetchImageUrl(data.image_name)
                : "/images/placeholder.jpg", // Attach image URLs
            };
          })
        );
  
        setRecipes(fetchedRecipes);
        setFilteredRecipes(fetchedRecipes); // Initialize filtered recipes
        setLoading(false); // Mark loading as complete
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setLoading(false);
      }
    };
  
    fetchRecipes();
  }, []);
  

  // Listen for the currently logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.error("No user is logged in");
        setUserId(null);
        setRecipes([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter recipes based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = recipes.filter( //filter recipe list
      (recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        )
    );
    setFilteredRecipes(filtered); //set list to it
  }, [searchQuery, recipes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading saved recipes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center justify-center p-10">
        <h1 className="text-2xl font-semibold text-gray-800">All Recipes</h1>
      </header>

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query when the input of search bar is
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredRecipes.map((recipe) => (
          <SavedRecipe
            key={recipe.id}
            recipeId={recipe.id}
            title={recipe.title}
            image={recipe.imageName}
            likes={Math.floor(Math.random() * 1000)}
            cookingTime={recipe.cookTime}
          />
        ))}
      </div>
    </div>
  );
};

export default Search;
