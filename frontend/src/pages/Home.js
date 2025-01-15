import React, { useState, useEffect, useRef } from "react";
import RecipeCard from "../components/RecipeCard"; // RecipeCard component to display recipe details
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { db } from "../firebaseconfig"; // Firebase configuration
import { Link } from "react-router-dom"; // For navigation
import FilterPage from "../components/FilterPage"; // Import the updated FilterPage component


const Home = () => {
  const [recipes, setRecipes] = useState([]); // Stores the list of recipes fetched from Firestore
  
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the index of the currently displayed recipe
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const containerRef = useRef(null);
  const startX = useRef(0);  // Starting X position
  const startY = useRef(0);  // Starting Y position
  const currentTranslateX = useRef(0);  // Current translateX during dragging
  const currentTranslateY = useRef(0);  // Current translateY during dragging

  const [opacity, setOpacity] = useState(0); // Dynamic opacity based on translation
  const [text, setText] = useState(""); // Swipe action text
  const [color, setColor] = useState(""); // Swipe action color

  // Fetch recipes from Firestore on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Get all documents(recipes) from the 'recipes' Firestore collection
        const querySnapshot = await getDocs(collection(db, "recipes"));

        // Map through each document and structure the data
        const fetchedRecipes = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // Safely parse the `ingredients` field, converting JSON string to an array
          let ingredients = [];
          try {
            ingredients = data.ingredients
              ? JSON.parse(data.ingredients.replace(/'/g, '"')) // Convert single quotes to double quotes
              : [];
          } catch (parseError) {
            console.error(
              "Error parsing ingredients for recipe:",
              data.title,
              data.ingredients
            );
            ingredients = []; // Default to an empty array if parsing fails
          }

          // Return a structured recipe object
          return {
            id: doc.id, // Recipe ID
            title: data.title || "Untitled Recipe", // Fallback title
            prepTime: data.prepTime || "N/A", // Preparation time
            cookTime: data.cookTime || "N/A", // Cooking time
            servingCost: data.servingCost || "N/A", // Cost per serving
            nutrition: data.nutrition || {}, // Nutrition details
            ingredients: ingredients.slice(0, 5), // Display the first 5 ingredients
            totalIngredients: ingredients.length, // Total number of ingredients
            imageName: data.image_name || null, // Image name
          };
        });

        // Update the state with the fetched recipes
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error); // Log any errors
      }
    };

    fetchRecipes(); // Call the function to fetch recipes
  }, []); // Empty dependency array ensures this runs only once

  // Swipe handlers
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX; // Record initial touch X position
    startY.current = e.touches[0].clientY; // Record initial touch Y position
    containerRef.current.style.transition = "none"; // Disable transition during dragging
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startX.current;  // Distance moved horizontally
    const deltaY = e.touches[0].clientY - startY.current; // Distance moved vertically


    currentTranslateX.current += deltaX; // Update translateX
    currentTranslateY.current += deltaY; // Update translateY

    // Apply the current translation to the card
    containerRef.current.style.transform = `
      translate(${currentTranslateX.current}px, ${currentTranslateY.current}px)
      rotate(${currentTranslateX.current / 20}deg)
    `;

    // Calculate opacity based on horizontal drag distance
    const maxDistance = 100; // Maximum distance for full opacity
    setOpacity(Math.min(Math.abs(currentTranslateX.current) / maxDistance, 1)); // Clamp opacity between 0 and 1

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
     // Check if the card was swiped far enough
     if (currentTranslateX.current > 100) {
      // Swipe right
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : recipes.length - 1));
    } else if (currentTranslateX.current < -100) {
      // Swipe left
      setCurrentIndex((prev) => (prev + 1) % recipes.length);
    }

    // Reset translate values
    currentTranslateX.current = 0;
    currentTranslateY.current = 0;

    // Smoothly reset card position
    containerRef.current.style.transition = "transform 0.3s ease";
    containerRef.current.style.transform = "translate(0px, 0px) rotate(0deg)";

    // Reset opacity after swipe ends
    setOpacity(0);
    setText("");
    setColor("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden bg-gray-100">
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

      <div
        className="recipe-container relative -mt-20"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
          {recipes.slice(currentIndex, currentIndex + 1).map((recipe) => (
          <div className="recipe-card" key={recipe.id}>
            {/* Link to the detailed recipe page */}
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
