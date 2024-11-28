import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import RecipeCard from "../components/RecipeCard"; // RecipeCard component to display recipe details
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { db } from "../firebaseconfig"; // Firebase configuration
import { Link } from "react-router-dom"; // For navigation

const Home = () => {
  const [recipes, setRecipes] = useState([]); // Stores the list of recipes fetched from Firestore
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the index of the currently displayed recipe
  const [rotation, setRotation] = useState(0); // Tracks the rotation angle of the top recipe card

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

  // Handles swipe gestures (left or right) to update the current index
  const handleSwipe = (direction) => {
    if (direction === "left" || direction === "right") {
      setCurrentIndex((prevIndex) =>
        prevIndex === recipes.length - 1 ? 0 : prevIndex + 1 // Loop back to the start when reaching the end
      );
      setRotation(0); // Reset rotation after the swipe
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center overflow-hidden">
      {/* Header Section */}
      <header className="w-full py-4 flex justify-center items-center bg-white shadow">
        {/* Logo */}
        <img src="/images/logo.png" alt="Logo" className="h-8" />
      </header>

      {/* Main Content Section */}
      <main className="flex-1 w-full px-6 flex justify-center items-center relative mt-4">
        <AnimatePresence>
          {/* Display the top two recipe cards */}
          {recipes.slice(currentIndex, currentIndex + 2).map((recipe, index) => (
            <motion.div
              key={recipe.id} // Unique key for each card
              className={`absolute w-full max-w-md ${
                index === 0 ? "z-10" : "z-0"
              } p-4`} // Front card has higher z-index
              drag={index === 0 ? "x" : false} // Only allow drag for the top card
              dragConstraints={{ left: 0, right: 0 }} // Limit drag movement to horizontal axis
              initial={{
                x: 0,
                scale: index === 0 ? 1 : 0.95, // Scale the background card slightly smaller
                rotate: 0,
              }}
              animate={{
                x: 0,
                scale: index === 0 ? 1 : 0.95,
                rotate: index === 0 ? rotation : 0, // Apply rotation only to the top card
              }}
              exit={{
                x: index === 0 ? (Math.random() > 0.5 ? 300 : -300) : 0, // Swipe out the top card
                rotate: 0, // Reset rotation
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }} // Smooth spring animation
              onDrag={(event, info) => {
                if (index === 0) {
                  const dragRotation = info.offset.x / 10; // Adjust rotation sensitivity
                  setRotation(dragRotation); // Update rotation state
                }
              }}
              onDragEnd={(event, info) => {
                if (index === 0 && (info.offset.x > 150 || info.offset.x < -150)) {
                  handleSwipe(info.offset.x > 0 ? "right" : "left"); // Swipe if dragged far enough
                } else {
                  setRotation(0); // Reset rotation if swipe is incomplete
                }
              }}
            >
              {/* Link to the detailed recipe page */}
              <Link to={`/recipepage/${recipe.id}`}>
                <RecipeCard recipe={recipe} /> {/* Display recipe details */}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;
