import React, { useState, useEffect, useRef } from "react";
import RecipeCard from "../components/RecipeCard"; // Component to display recipe details
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { db } from "../firebaseconfig"; // Firebase configuration
import { Link } from "react-router-dom"; // For navigation
import FilterPage from "../components/FilterPage"; // FilterPage component
import { doc, updateDoc, arrayUnion } from "firebase/firestore"; // Firestore update methods
import { getAuth } from "firebase/auth"; // Firebase Authentication
import { getStorage } from "firebase/storage"; // Firebase Storage (if needed)
import { fetchSavedRecipes } from "../utils/firebaseUtils"; // Utility to fetch saved recipes

const Home = () => {
  const [recipes, setRecipes] = useState([]); // Stores unsaved recipes
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the index of the currently displayed recipe
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Refs for touch handling
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentTranslateX = useRef(0);
  const currentTranslateY = useRef(0);

  // State for dynamic UI during swipe
  const [opacity, setOpacity] = useState(0);
  const [text, setText] = useState("");
  const [color, setColor] = useState("");

  const auth = getAuth();
  const storage = getStorage();
  const currentUser = auth.currentUser; // Get the logged-in user

  // Save the recipe to the user's savedRecipes in Firestore
  // Also remove it from the swipe deck locally so it won't show up again.
  const handleSaveRecipe = async (recipeId) => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }
    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        savedRecipes: arrayUnion(recipeId),
      });
      console.log("Recipe saved successfully!");
      // Remove the saved recipe from the local list
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
      // Reset the index
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  // Fetch recipes from Firestore and filter out those already saved.
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Fetch all recipe documents from the "recipes" collection.
        const querySnapshot = await getDocs(collection(db, "recipes"));

        // Use a mutable variable so we can reassign after filtering.
        let fetchedRecipes = querySnapshot.docs.map((doc) => {
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
            imageName: data.image_name || null,
          };
        });

        // If a user is logged in, filter out recipes already saved.
        if (currentUser) {
          const savedRecipes = await fetchSavedRecipes(currentUser.uid);
          const savedRecipeIds = savedRecipes.map((recipe) => recipe.id);
          fetchedRecipes = fetchedRecipes.filter(
            (recipe) => !savedRecipeIds.includes(recipe.id)
          );
        }

        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, [currentUser]);

  // Touch event handlers for swiping the recipe cards.
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    containerRef.current.style.transition = "none";
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startX.current;
    const deltaY = e.touches[0].clientY - startY.current;
    currentTranslateX.current += deltaX;
    currentTranslateY.current += deltaY;

    containerRef.current.style.transform = `
      translate(${currentTranslateX.current}px, ${currentTranslateY.current}px)
      rotate(${currentTranslateX.current / 20}deg)
    `;

    const maxDistance = 100;
    setOpacity(Math.min(Math.abs(currentTranslateX.current) / maxDistance, 1));
    if (currentTranslateX.current > 0) {
      setText("Save");
      setColor("lime");
    } else if (currentTranslateX.current < 0) {
      setText("Discard");
      setColor("red");
    } else {
      setText("");
      setColor("");
    }
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (currentTranslateX.current > 100) {
      // Swipe right: save recipe.
      handleSaveRecipe(recipes[currentIndex].id);
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : recipes.length - 1));
    } else if (currentTranslateX.current < -100) {
      // Swipe left: discard recipe.
      setRecipes((prev) =>
        prev.filter((recipe) => recipe.id !== recipes[currentIndex].id)
      );
      setCurrentIndex(0);
    }
    currentTranslateX.current = 0;
    currentTranslateY.current = 0;
    containerRef.current.style.transition = "transform 0.3s ease";
    containerRef.current.style.transform = "translate(0px, 0px) rotate(0deg)";
    setOpacity(0);
    setText("");
    setColor("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden bg-gray-100">
      {/* Header with a Sort button */}
      <div className="w-full bg-white shadow flex justify-between items-center px-4 py-3">
        <button
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow z-10"
          onClick={() => setIsFilterVisible(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
          Sort
        </button>
      </div>

      {/* Swipeable Recipe Container */}
      <div
        className="recipe-container relative -mt-20"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {recipes.slice(currentIndex, currentIndex + 1).map((recipe) => (
          <div className="recipe-card" key={recipe.id}>
            <Link to={`/recipepage/${recipe.id}`}>
              <RecipeCard recipe={recipe} opacity={opacity} text={text} color={color} />
            </Link>
          </div>
        ))}
      </div>

      <FilterPage
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
      />
    </div>
  );
};

export default Home;
