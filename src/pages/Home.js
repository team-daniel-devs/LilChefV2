import React, { useState, useRef } from "react";
import RecipeCard from "../components/RecipeCard";
import FilterPage from "../components/FilterPage"; // Import the updated FilterPage component

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
    image: "https://www.dontgobaconmyheart.co.uk/wp-content/uploads/2020/11/english-muffin-breakfast-sandwich-500x500.jpg",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqWUXBtxAtDkBIoTftl0731SAGDdfNV9_X3A&s",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwTiXV0M8mopHLJb04RX9mYhbEYyb4HMrXHA&s",
  },
  {
    id: 4,
    title: "Chicken Salad",
    prepTime: "10 mins",
    cookTime: "10 mins",
    servingCost: "$4.00",
    nutrition: {
      calories: "220 kcal",
      protein: "25g",
      fat: "8g",
      sugar: "3g",
    },
    ingredients: ["Chicken Breast", "Lettuce", "Tomatoes", "Cucumber", "Dressing"],
    image: "https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_4:3/k%2FPhoto%2FRecipes%2F2024-03-chicken-salad-190%2Fchicken-salad-190-261",
  },
  {
    id: 5,
    title: "Spaghetti Bolognese",
    prepTime: "15 mins",
    cookTime: "30 mins",
    servingCost: "$5.00",
    nutrition: {
      calories: "400 kcal",
      protein: "20g",
      fat: "10g",
      sugar: "4g",
    },
    ingredients: [
      "Spaghetti",
      "Ground Beef",
      "Tomato Sauce",
      "Onion",
      "Garlic",
      "Olive Oil",
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA_EF-1qMDLEoJA2sJ9S0rbE8qgw1ffJK3Bw&s",
  },
  {
    id: 6,
    title: "Vegetable Stir-Fry",
    prepTime: "10 mins",
    cookTime: "10 mins",
    servingCost: "$3.50",
    nutrition: {
      calories: "150 kcal",
      protein: "5g",
      fat: "5g",
      sugar: "2g",
    },
    ingredients: ["Broccoli", "Carrots", "Bell Peppers", "Soy Sauce", "Ginger"],
    image: "https://www.wholesomeyum.com/wp-content/uploads/2020/11/wholesomeyum-Stir-Fry-Vegetables-15.jpg",
  },
  {
    id: 7,
    title: "Grilled Cheese Sandwich",
    prepTime: "5 mins",
    cookTime: "5 mins",
    servingCost: "$1.50",
    nutrition: {
      calories: "300 kcal",
      protein: "10g",
      fat: "12g",
      sugar: "2g",
    },
    ingredients: ["Bread", "Cheese", "Butter"],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAFVPpn2AEspRJR8iX_C5H_Hm63rrsoHm3BA&s",
  },
  {
    id: 8,
    title: "Beef Tacos",
    prepTime: "15 mins",
    cookTime: "10 mins",
    servingCost: "$4.50",
    nutrition: {
      calories: "350 kcal",
      protein: "18g",
      fat: "15g",
      sugar: "3g",
    },
    ingredients: [
      "Taco Shells",
      "Ground Beef",
      "Cheese",
      "Lettuce",
      "Tomato",
      "Sour Cream",
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReBnQ776pnJJPUuO-soQzNdTPcfn1UhBOPYw&s",
  },
  {
    id: 9,
    title: "Caesar Salad",
    prepTime: "10 mins",
    cookTime: "0 mins",
    servingCost: "$3.80",
    nutrition: {
      calories: "200 kcal",
      protein: "7g",
      fat: "14g",
      sugar: "2g",
    },
    ingredients: [
      "Romaine Lettuce",
      "Caesar Dressing",
      "Croutons",
      "Parmesan Cheese",
      "Lemon",
    ],
    image: "https://www.allrecipes.com/thmb/JTW0AIVY5PFxqLrf_-CDzT4OZQY=/0x512/filters:no_upscale():max_bytes(150000):strip_icc()/229063-Classic-Restaurant-Caesar-Salad-ddmfs-4x3-231-89bafa5e54dd4a8c933cf2a5f9f12a6f.jpg",
  },
  {
    id: 10,
    title: "Chocolate Chip Cookies",
    prepTime: "15 mins",
    cookTime: "12 mins",
    servingCost: "$2.00",
    nutrition: {
      calories: "150 kcal",
      protein: "2g",
      fat: "8g",
      sugar: "10g",
    },
    ingredients: [
      "Flour",
      "Butter",
      "Sugar",
      "Brown Sugar",
      "Chocolate Chips",
      "Eggs",
      "Vanilla Extract",
    ],
    image: "https://sallysbakingaddiction.com/wp-content/uploads/2013/05/classic-chocolate-chip-cookies.jpg",
  },
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const containerRef = useRef(null);
  const startX = useRef(0);
  const currentTranslateX = useRef(0);

  const [opacity, setOpacity] = useState(0);
  const [text, setText] = useState("");
  const [color, setColor] = useState("");

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    containerRef.current.style.transition = "none";
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - startX.current;
    currentTranslateX.current += deltaX;

    containerRef.current.style.transform = `translate(${currentTranslateX.current}px, 0px) rotate(${currentTranslateX.current / 20}deg)`;

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
  };

  const handleTouchEnd = () => {
    if (Math.abs(currentTranslateX.current) > 100) {
      setCurrentIndex((prev) => (prev + 1) % recipes.length);
    }

    currentTranslateX.current = 0;

    containerRef.current.style.transition = "transform 0.3s ease";
    containerRef.current.style.transform = "translate(0px, 0px) rotate(0deg)";
    setOpacity(0);
    setText("");
    setColor("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden bg-gray-100">
      <div className="w-full bg-white shadow flex justify-between items-center px-4 py-3">
        <button
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow"
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
        className="recipe-container relative mt-2"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {recipes.slice(currentIndex, currentIndex + 1).map((recipe) => (
          <div className="recipe-card" key={recipe.id}>
            <RecipeCard
              recipe={recipe}
              opacity={opacity}
              text={text}
              color={color}
            />
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
