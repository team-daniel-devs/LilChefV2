import React, { useState, useEffect, useRef } from "react";
import RecipeCard from "../components/RecipeCard";
import { collection, getDocs, query, startAfter, limit } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { Link } from "react-router-dom";
import FilterPage from "../components/FilterPage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { fetchSavedRecipes } from "../utils/firebaseUtils";

const PAGE_SIZE = 5;
const LOAD_THRESHOLD = 2;

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const loadRecipes = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let queryRef = collection(db, "recipes");
      if (lastVisible) {
        queryRef = query(queryRef, startAfter(lastVisible), limit(PAGE_SIZE));
      } else {
        queryRef = query(queryRef, limit(PAGE_SIZE));
      }

      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        const fetchedRecipes = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          let ingredients = [];
          try {
            ingredients = data.ingredients
              ? JSON.parse(data.ingredients.replace(/'/g, '"'))
              : [];
          } catch (error) {
            console.error("Error parsing ingredients for recipe:", data.title);
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

        const newRecipes = fetchedRecipes.filter(
          (recipe) => !recipes.some((r) => r.id === recipe.id)
        );

        if (currentUser) {
          const savedRecipes = await fetchSavedRecipes(currentUser.uid);
          const savedRecipeIds = savedRecipes.map((recipe) => recipe.id);
          const filteredRecipes = newRecipes.filter(
            (recipe) => !savedRecipeIds.includes(recipe.id)
          );
          setRecipes((prev) => [...prev, ...filteredRecipes]);
          console.log(`Loaded ${filteredRecipes.length} new recipes.`);
        } else {
          setRecipes((prev) => [...prev, ...newRecipes]);
          console.log(`Loaded ${newRecipes.length} new recipes.`);
        }

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    if (currentIndex >= recipes.length - LOAD_THRESHOLD) {
      loadRecipes();
    }
  }, [currentIndex]);

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
      setCurrentIndex((prev) => prev + 1);
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
            {recipes.slice(currentIndex, currentIndex + 1).map((recipe) => (
              <div key={recipe.id}>
                <Link to={`/recipepage/${recipe.id}`}>
                  <RecipeCard recipe={recipe} opacity={opacity} text={text} color={color} />
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
