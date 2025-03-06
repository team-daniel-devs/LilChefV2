import React, { useEffect, useState } from "react";
import SavedRecipe from "../components/SavedRecipe"; // SavedRecipe component
import { fetchImageUrl } from "../utils/imageUtils";
import { fetchSavedRecipes, onAuthStateChanged } from "../utils/firebaseUtils";
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { db } from "../firebaseconfig"; // Firebase configuration
import PastSearch from "../components/PastSearch";
import SearchedRecipe from "../components/SearchedRecipe";

const Search = () => {
  const [recipes, setRecipes] = useState([]); // State to hold all recipes
  const [filteredRecipes, setFilteredRecipes] = useState([]); // State for filtered recipes
  const [pastSearches, setPastSearches] = useState([]); // State for past searches
  const [inputText, setInputText] = useState(""); // State for input text
  const [searchQuery, setSearchQuery] = useState(""); // State for the actual search query
  const [userId, setUserId] = useState(null); // State to hold the current user's ID
  const [loading, setLoading] = useState(true); // Loading state for recipes
  const [searchBarClicked, setSearchBarClicked] = useState(false); // State to track search bar click

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
    const filtered = recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        )
    );
    setFilteredRecipes(filtered);
  }, [searchQuery, recipes]);

  // Handle form submission to trigger search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputText);
    setSearchBarClicked(false); // Reset to show filtered recipes
    if (inputText && !pastSearches.includes(inputText)) {
      setPastSearches((prevSearches) => [...prevSearches, inputText]); // Save search to pastSearches
    }
  };

  // Handle removal of a past search
  const onRemove = (index) => {
    setPastSearches((prevSearches) => {
      const updatedSearches = [...prevSearches];
      updatedSearches.splice(index, 1); // Remove the search at the given index
      return updatedSearches;
    });
  };

  // Handle typing in the search bar
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setSearchBarClicked(true); // Show past searches while typing
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading all recipes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-12">
      <div className="mb-4">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white p-3 rounded-3xl shadow"
        >
          <img
            src="/images/search.png" // Using the PNG image for search
            alt="search icon"
            className="w-5 h-5 text-gray-500 mr-2" // Matching the original size
          />
          <input
            type="text"
            placeholder="Search saved recipes"
            className="w-full bg-transparent outline-none text-gray-800"
            value={inputText}
            onChange={handleInputChange} // Update input text and show past searches while typing
          />
          <button type="submit" className="text-green-500 ml-2">
            Search
          </button>
        </form>
      </div>

      {/* Conditionally render based on whether the search bar was clicked */}
      <div className="grid grid-cols-1 gap-4"> {/* One past search per row */}
        {searchBarClicked
          ? pastSearches.map((search, index) => (
              <PastSearch key={index} text={search} onRemove={() => onRemove(index)} />
            ))
          : (
            <>
              {/* Text showing number of results */}
              <div className="">
                <p className="text-gray-700 font-semibold">
                  {filteredRecipes.length} result{filteredRecipes.length !== 1 ? 's' : ''} found
                </p>
              </div>
              {/* SavedRecipe components */}
              <div className="grid grid-cols-2 gap-4">
                {filteredRecipes.map((recipe) => (
                  <SearchedRecipe
                    key={recipe.id}
                    recipeId={recipe.id}
                    title={recipe.title}
                    image={recipe.imageName}
                    likes={Math.floor(Math.random() * 1000)}
                    cookingTime={recipe.cookTime}
                  />
                ))}
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default Search;
