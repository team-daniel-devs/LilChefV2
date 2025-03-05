import React, { useState, useEffect, useRef } from "react";
import RecipeCard from "../components/RecipeCard";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { Link } from "react-router-dom";
import FilterPage from "../components/FilterPage";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentTranslateX = useRef(0);
  const currentTranslateY = useRef(0);
  const [opacity, setOpacity] = useState(0);
  const [text, setText] = useState("");
  const [color, setColor] = useState("");
  const auth = getAuth();
  const storage = getStorage();
  const currentUser = auth.currentUser;

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
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "recipes"));

        const fetchedRecipes = querySnapshot.docs.map((doc) => {
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

        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

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
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : recipes.length - 1));
    } else if (currentTranslateX.current < -100) {
      setCurrentIndex((prev) => (prev + 1) % recipes.length);
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
        {/* Header Section */}
        <header className="relative h-16 flex items-center justify-center mb-3">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
            <img src="/images/LogoNoText.png" alt="Logo" className="h-16 w-16 object-contain" />
          </div>
          <button
            className="absolute top-3 right-12 flex items-center bg-[#0E9A61] text-white px-2.5 py-2.5 rounded-2xl text-sm font-semibold shadow z-10"
            onClick={() => setIsFilterVisible(true)}
          >
            <img src="/images/Filter.png" alt="Filter" className="w-5 h-5" />
          </button>
        </header>
  
        {/* Main Content */}
        <main className="flex-1 relative bg-white">
          <div
            className="recipe-container absolute inset-0"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {recipes.slice(currentIndex, currentIndex + 1).map((recipe) => (
              <div className="recipe-card" key={recipe.id}>
                <Link to={`/recipepage/${recipe.id}`}>
                  <RecipeCard recipe={recipe} opacity={opacity} text={text} color={color}/>
                </Link>
              </div>
            ))}
          </div>
        </main>

  
        <FilterPage isVisible={isFilterVisible} onClose={() => setIsFilterVisible(false)} />
      </div>
    </div>
  );
  
};

export default Home;
