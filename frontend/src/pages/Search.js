import React, { useEffect, useState } from "react";
import SavedRecipe from "../components/SavedRecipe"; // SavedRecipe component
import { fetchImageUrl } from "../utils/imageUtils";
import { fetchSavedRecipes, onAuthStateChanged } from "../utils/firebaseUtils";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebaseconfig"; // Firebase configuration
import PastSearch from "../components/PastSearch";
import SearchedRecipe from "../components/SearchedRecipe";

const PAGE_SIZE = 20; //How many recipes to load

const Search = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [pastSearches, setPastSearches] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Enable scrolling for this page
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  // Fetch recipes from Firestore (with pagination)
  const fetchRecipes = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      let queryRef = query(
        collection(db, "recipes"),
        orderBy("title"),
        limit(PAGE_SIZE)
      );

      if (lastDoc) {
        queryRef = query(queryRef, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(queryRef);
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

      console.log(`Loaded ${fetchedRecipes.length} recipes`);

      // Append new recipes to the existing list
      setRecipes((prev) => [...prev, ...fetchedRecipes]);
      setFilteredRecipes((prev) => [...prev, ...fetchedRecipes]);

      if (querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false); // No more data to load
      } else {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]); // Save last doc for pagination
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(); // Initial load
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
    if (inputText && !pastSearches.includes(inputText)) {
      setPastSearches((prevSearches) => [...prevSearches, inputText]);
    }
  };

  // Handle removal of a past search
  const onRemove = (index) => {
    setPastSearches((prevSearches) => {
      const updatedSearches = [...prevSearches];
      updatedSearches.splice(index, 1);
      return updatedSearches;
    });
  };

  // Handle typing in the search bar
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  if (loading && recipes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading recipes...</p>
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
          <input
            type="text"
            placeholder="Search saved recipes"
            className="w-full bg-transparent outline-none text-gray-800"
            value={inputText}
            onChange={handleInputChange}
          />
          <button type="submit" className="text-green-500 ml-2">
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div>
        <p className="text-gray-700 font-semibold">
          {filteredRecipes.length} result{filteredRecipes.length !== 1 ? "s" : ""} found
        </p>
      </div>

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

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button
            onClick={fetchRecipes}
            className="bg-[#0E9A61] text-white px-4 w-full py-2 mb-4 rounded-md"
          >
            Load More
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center mt-4">
          <p>Loading more recipes...</p>
        </div>
      )}
    </div>
  );
};

export default Search;
