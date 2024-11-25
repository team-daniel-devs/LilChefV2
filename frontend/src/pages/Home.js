import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "../components/RecipeCard"; // Import the RecipeCard component

// Sample Recipe Data Array
const recipes = [
  {
    id: 1,
    title: "Breakfast Sandwich",
    prepTime: "10 mins",
    cookTime: "15 mins",
    servingCost: "$3.20",
    nutrition: {
      calories: "300 kcal",
      protein: "15g",
      fat: "5g",
      sugar: "2g",
    },
    ingredients: [
      "English Muffin",
      "Sausage Patty",
      "Guacamole",
      "Eggs",
      "Cheese",
      "Bell Pepper",
      "Salt",
      "Pepper",
    ],
  },
  {
    id: 2,
    title: "Avocado Toast",
    prepTime: "5 mins",
    cookTime: "5 mins",
    servingCost: "$2.50",
    nutrition: {
      calories: "250 kcal",
      protein: "6g",
      fat: "12g",
      sugar: "1g",
    },
    ingredients: ["Bread", "Avocado", "Salt", "Pepper", "Lemon"],
  },
  {
    id: 3,
    title: "Pancakes",
    prepTime: "15 mins",
    cookTime: "20 mins",
    servingCost: "$1.80",
    nutrition: {
      calories: "350 kcal",
      protein: "8g",
      fat: "10g",
      sugar: "5g",
    },
    ingredients: ["Flour", "Milk", "Eggs", "Butter", "Sugar", "Maple Syrup"],
  },
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current recipe index
  const [rotation, setRotation] = useState(0); // Track rotation angle

  const handleSwipe = (direction) => {
    if (direction === "left" || direction === "right") {
      // Move to the next recipe in the array
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
              } p-4`} // Added padding to card wrapper
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
              <RecipeCard recipe={recipe} />
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;
