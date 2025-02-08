import React, { useEffect, useState } from "react";
import SavedRecipe from "../components/SavedRecipe";
import { fetchImageUrl } from "../utils/imageUtils";
import { fetchSavedRecipes, onAuthStateChanged } from "../utils/firebaseUtils";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseconfig";

const Search = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previousSearches, setPreviousSearches] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

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
                : "/images/placeholder.jpg",
            };
          })
        );

        setRecipes(fetchedRecipes);
        setFilteredRecipes(fetchedRecipes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      setSearchQuery(inputText);
      setPreviousSearches((prev) =>
        [...new Set([inputText, ...prev])].slice(0, 5)
      );
      setShowSuggestions(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading saved recipes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4 relative">
        <form onSubmit={handleSearch} className="flex items-center bg-white p-3 rounded-lg shadow">
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
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          <button type="submit" className="text-green-500 ml-2">
            Search
          </button>
        </form>
        {showSuggestions && previousSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border border-gray-200 z-10">
            <ul>
              {previousSearches.map((search, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setInputText(search);
                    setSearchQuery(search);
                    setShowSuggestions(false);
                  }}
                >
                  {search}
                </li>
              ))}
            </ul>
          </div>
        )}
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
