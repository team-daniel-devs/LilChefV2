import React, { useState, useRef } from "react";
import RecipeCard from "../components/RecipeCard";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const startX = useRef(0); // Starting X position
  const startY = useRef(0); // Starting Y position
  const currentTranslateX = useRef(0); // Current translateX during dragging
  const currentTranslateY = useRef(0); // Current translateY during dragging

  const [opacity, setOpacity] = useState(0); // Dynamic opacity based on translation
  const [text, setText] = useState("")
  const [color, setColor] = useState(""); 

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX; // Record initial touch X position
    startY.current = e.touches[0].clientY; // Record initial touch Y position
    containerRef.current.style.transition = "none"; // Disable transition during dragging
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startX.current; // Distance moved horizontally
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

    if(currentTranslateX.current > 0){
      setText("Save");
      setColor("lime");
    }
    if(currentTranslateX.current < 0){
      setText("Discard");
      setColor("red");
    }
    if(currentTranslateX.current === 0){
      setText("");
      setColor("");
    }

    // Update start positions for the next move event
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
    <div
      className="min-h-screen flex justify-center items-center overflow-hidden bg-gray-100"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="recipe-container relative" ref={containerRef}>
        {recipes.slice(currentIndex, currentIndex + 1).map((recipe) => (
          <div className="recipe-card" key={recipe.id}>
            <RecipeCard recipe={recipe} opacity={opacity} text={text} color={color}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
