import React, { useState, useEffect, useRef } from "react";
import RecipeCard from "../components/RecipeCard"; // Component to display recipe details
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore"; // Firestore functions
import { db } from "../firebaseconfig"; // Firebase configuration
import { Link } from "react-router-dom"; // For navigation
import FilterPage from "../components/FilterPage"; // FilterPage component
import { doc, updateDoc, arrayUnion } from "firebase/firestore"; // Firestore update methods
import { getAuth } from "firebase/auth"; // Firebase Authentication
import { getStorage } from "firebase/storage"; // Firebase Storage (if needed)
import { fetchSavedRecipes, parseNutrition, parseSingleValue, parseRawIngredients, parsePricedIngredients } from "../utils/firebaseUtils"; // Utility to fetch saved recipes

const BATCH_SIZE = 20; // Number of recipes to fetch per batch
const FETCH_THRESHOLD = 5; // When currentIndex is within 5 of the end, fetch more

// Helper function to filter recipes based on the filter criteria.
const filterRecipes = (recipes, filters) => {
  return recipes.filter((recipe) => {
    // 1. Filter by cooking time (if any selected).
    if (filters.cookingTimes && filters.cookingTimes.length > 0) {
      // Here we assume recipe.prepTime is in a format like "15 min", "30 min", etc.
      // We check if it exactly matches any of the selected times.
      if (!filters.cookingTimes.includes(recipe.prepTime)) {
        return false;
      }
    }

    // 2. Filter by difficulty.
    if (filters.difficulties && filters.difficulties.length > 0) {
      if (!filters.difficulties.includes(recipe.level)) {
        return false;
      }
    }

    // 3. Filter by ingredients:
    // If at least one of the selected ingredients is in the recipe's ingredients list.
    if (filters.ingredients && filters.ingredients.length > 0) {
      const recipeIngredients = recipe.ingredients.map((ing) =>
        ing.toLowerCase()
      );
      const hasIngredient = filters.ingredients.some((selIng) =>
        recipeIngredients.includes(selIng.toLowerCase())
      );
      if (!hasIngredient) {
        return false;
      }
    }

    // 4. Filter by price:
    // Convert recipe.servingCost from a string like "$12.34" to a number.
    if (filters.price && filters.price > 0) {
      const costStr = recipe.servingCost;
      // If cost is not available or is "N/A", filter out the recipe.
      if (!costStr || costStr === "N/A") {
        return false;
      }
      const cost = parseFloat(costStr.replace("$", ""));
      // Only include recipes with a cost less than or equal to the filter value.
      if (isNaN(cost) || cost > filters.price) {
        return false;
      }
    }

    // If the recipe passes all conditions, include it.
    return true;
  });
};

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [lastDoc, setLastDoc] = useState(null); // Holds the last fetched document snapshot
  const [loadingMore, setLoadingMore] = useState(false); // Flag for loading additional recipes
  const [hasMore, setHasMore] = useState(true); // Flag to indicate if there are more recipes to fetch.

  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentTranslateX = useRef(0);
  const currentTranslateY = useRef(0);

  const [opacity, setOpacity] = useState(0);
  const [text, setText] = useState("");
  const [color, setColor] = useState("");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleSaveRecipe = async (recipeId) => {
    if (!currentUser) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        savedRecipes: arrayUnion(recipeId),
      });
      console.log("Recipe saved successfully!");
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  // Fetch recipes from Firestore and filter out those already saved.
  // Function to fetch the next batch of recipes.
  const fetchNextRecipes = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const recipesRef = collection(db, "recipes");
      let q;
      if (lastDoc) {
        q = query(recipesRef, orderBy("__name__"), startAfter(lastDoc), limit(BATCH_SIZE));
      } else {
        q = query(recipesRef, orderBy("__name__"), limit(BATCH_SIZE));
      }
      const querySnapshot = await getDocs(q);
      let newRecipes = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let ingredients = [];
        try {
          ingredients = data["Raw Ingredients"]
            ? parseRawIngredients(data["Raw Ingredients"])
            : [];
        } catch (parseError) {
          console.error("Error parsing ingredients for recipe:", data.title, data["Raw Ingredients"]);
        }
        let pricedData = { items: [], totalCost: 0 };
        if (data.priced_ingredients) {
          pricedData = parsePricedIngredients(data.priced_ingredients);
        }
        const servingCost = pricedData.totalCost
          ? `$${pricedData.totalCost.toFixed(2)}`
          : "N/A";
        return {
          id: docSnap.id,
          title: data.title || "Untitled Recipe",
          prepTime: data["Cooking Time"] ? parseSingleValue(data["Cooking Time"]) : "N/A",
          cookTime: data["Cooking Time"] ? parseSingleValue(data["Cooking Time"]) : "N/A",
          servingCost,
          nutrition: data.Calories
            ? parseNutrition(data.Calories)
            : { calories: "N/A", protein: "N/A", fat: "N/A", sugar: "N/A" },
          ingredients: ingredients.slice(0, 5),
          totalIngredients: ingredients.length,
          imageName: data.image_name || null,
          level: data.Difficulty ? parseSingleValue(data.Difficulty) : "N/A",
        };
      });

      // Filter out saved recipes if the user is logged in.
      if (currentUser) {
        const savedRecipes = await fetchSavedRecipes(currentUser.uid);
        const savedRecipeIds = savedRecipes.map((r) => r.id);
        newRecipes = newRecipes.filter((recipe) => !savedRecipeIds.includes(recipe.id));
      }

      // Append new recipes.
      setRecipes((prev) => [...prev, ...newRecipes]);
      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        if (querySnapshot.docs.length < BATCH_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initially fetch recipes.
  useEffect(() => {
    fetchNextRecipes();
  }, [currentUser]);

  // Fetch more when nearing end.
  useEffect(() => {
    if (recipes.length - currentIndex <= FETCH_THRESHOLD && !loadingMore) {
      fetchNextRecipes();
    }
  }, [currentIndex, recipes, loadingMore]);

  // If filters are active and no matching recipes are found, fetch more.
  useEffect(() => {
    if (
      activeFilters &&
      filterRecipes(recipes, activeFilters).length === 0 &&
      hasMore &&
      !loadingMore
    ) {
      fetchNextRecipes();
    }
  }, [activeFilters, recipes, hasMore, loadingMore]);

  // When a filter is applied.
  const handleApplyFilter = (filterCriteria) => {
    console.log("Applied filter:", filterCriteria);
    setActiveFilters(filterCriteria);
    setCurrentIndex(0);
  };

  // Determine recipes to display.
  const filteredRecipes = activeFilters ? filterRecipes(recipes, activeFilters) : recipes.slice(0, BATCH_SIZE);

  // If filters are active but none match, show a message.
  const renderContent = () => {
    if (activeFilters && filteredRecipes.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600 text-lg">
            No recipes match your filters. Try adjusting your criteria.
          </p>
        </div>
      );
    }
    return filteredRecipes.slice(currentIndex, currentIndex + 1).map((recipe) => (
      <div className="recipe-card" key={recipe.id}>
        <Link to={`/recipepage/${recipe.id}`}>
          <RecipeCard recipe={recipe} opacity={opacity} text={text} color={color} />
        </Link>
      </div>
    ));
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    if (containerRef.current) {
      containerRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startX.current;
    const deltaY = e.touches[0].clientY - startY.current;
    currentTranslateX.current += deltaX;
    currentTranslateY.current += deltaY;

    if (containerRef.current) {
      containerRef.current.style.transform = `translate(${currentTranslateX.current}px, ${currentTranslateY.current}px) rotate(${currentTranslateX.current / 20}deg)`;
    }

    const maxDistance = 100;
    setOpacity(Math.min(Math.abs(currentTranslateX.current) / maxDistance, 1));

    if (currentTranslateX.current > 0) {
      setText("Save");
      setColor("#0E9A61");
    } else if (currentTranslateX.current < 0) {
      setText("Dislike");
      setColor("#D83A52");
    } else {
      setText("");
      setColor("");
    }

    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (currentTranslateX.current > 100) {
      handleSaveRecipe(recipes[currentIndex].id);
      setCurrentIndex((prev) => prev + 1);
    } else if (currentTranslateX.current < -100) {
      // Swipe left: discard recipe.
      setRecipes((prev) =>
        prev.filter((recipe) => recipe.id !== recipes[currentIndex].id)
      );
      setCurrentIndex(0);
    }

    currentTranslateX.current = 0;
    currentTranslateY.current = 0;

    if (containerRef.current) {
      containerRef.current.style.transition = "transform 0.3s ease";
      containerRef.current.style.transform = "translate(0px, 0px) rotate(0deg)";
    }
    setOpacity(0);
    setText("");
    setColor("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white mt-[-5vh]">
      <div className="w-full max-w-3xl flex flex-col overflow-hidden bg-white shadow-lg rounded-lg">
        <header className="relative h-16 flex items-center justify-center mb-3">
          <img src="/images/LogoNoText.png" alt="Logo" className="h-16 w-16" />
          <button
            className="absolute top-3 right-12 bg-[#0E9A61] text-white px-2.5 py-2.5 rounded-2xl"
            onClick={() => setIsFilterVisible(true)}
          >
            Filter
          </button>
        </header>

        <main className="flex-1 relative bg-white">
          <div
            className="recipe-container absolute inset-0"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {renderContent()}
          </div>
        </main>

  
        <FilterPage
         isVisible={isFilterVisible} 
         onClose={() => setIsFilterVisible(false)}
         onApplyFilter={handleApplyFilter}
         />
      </div>
    </div>
  );
};

export default Home;
