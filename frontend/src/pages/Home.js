import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "../components/RecipeCard"; // Import the RecipeCard component
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseconfig"; 
import { Link } from "react-router-dom";

const Home = () => {
  const [recipes, setRecipes] = useState([]); // Store recipes from Firestore
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current recipe index
  const [rotation, setRotation] = useState(0); // Track rotation angle

  // Fetch recipes from Firestore
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "recipes")); // Fetch all documents
        const fetchedRecipes = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          // Parse the `ingredients` field, safely convert the string to an array
          let ingredients = [];
          try {
            ingredients = data.ingredients
              ? JSON.parse(data.ingredients.replace(/'/g, '"')) // Replace single quotes with double quotes
              : [];
          } catch (parseError) {
            console.error(
              "Error parsing ingredients for recipe:",
              data.title,
              data.ingredients
            );
            ingredients = []; // Default to an empty array if parsing fails
          }

          // Limit the displayed ingredients to 5
          const displayedIngredients = ingredients.slice(0, 5);

          return {
            id: doc.id,
            title: data.title || "Untitled Recipe",
            prepTime: data.prepTime || "N/A", // Add prepTime if available
            cookTime: data.cookTime || "N/A", // Add cookTime if available
            servingCost: data.servingCost || "N/A", // Add servingCost if available
            nutrition: data.nutrition || {}, // Include nutrition if available
            ingredients: displayedIngredients, // Display only the first 5 ingredients
            totalIngredients: ingredients.length, // Keep the total number of ingredients
            imageName: data.image_name || null, // Pass image_name
          };
        });

        setRecipes(fetchedRecipes); // Update state with fetched recipes
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  const handleSwipe = (direction) => {
    if (direction === "left" || direction === "right") {
      setCurrentIndex((prevIndex) =>
        prevIndex === recipes.length - 1 ? 0 : prevIndex + 1
      );
      setRotation(0); // Reset rotation on swipe
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center overflow-hidden">
      {/* Header */}
      <header className="w-full py-4 flex justify-center items-center bg-white shadow">
        {/* Centered Logo */}
        <img src="/images/logo.png" alt="Logo" className="h-8" />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 flex justify-center items-center relative mt-4">
        <AnimatePresence>
          {recipes.slice(currentIndex, currentIndex + 2).map((recipe, index) => (
            <motion.div
              key={recipe.id}
              className={`absolute w-full max-w-md ${
                index === 0 ? "z-10" : "z-0"
              } p-4`}
              drag={index === 0 ? "x" : false} // Only allow drag on the front card
              dragConstraints={{ left: 0, right: 0 }}
              initial={{
                x: 0,
                scale: index === 0 ? 1 : 0.95,
                rotate: 0,
              }}
              animate={{
                x: 0,
                scale: index === 0 ? 1 : 0.95,
                rotate: index === 0 ? rotation : 0,
              }}
              exit={{
                x: index === 0 ? (Math.random() > 0.5 ? 300 : -300) : 0,
                rotate: 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onDrag={(event, info) => {
                if (index === 0) {
                  const dragRotation = info.offset.x / 10; // Adjust divisor for sensitivity
                  setRotation(dragRotation);
                }
              }}
              onDragEnd={(event, info) => {
                if (index === 0 && (info.offset.x > 150 || info.offset.x < -150)) {
                  handleSwipe(info.offset.x > 0 ? "right" : "left");
                } else {
                  setRotation(0); // Reset rotation if swipe is incomplete
                }
              }}
            >
              <Link to={`/recipepage/${recipe.id}`}>
                {/* Wrap RecipeCard in Link */}
                <RecipeCard recipe={recipe} />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;
