import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { fetchFirestoreDoc, parseSingleValue, parseNutrition, parseRawIngredients, } from "../utils/firebaseUtils";
import AddToShoppingList from "../components/AddToShoppingList";
import SaveButton from "../components/SaveButton";
import { fetchImageUrl } from "../utils/imageUtils";


const RecipePage = () => {
  const { recipeId } = useParams(); // Get the `recipeId` parameter from the URL
  const navigate = useNavigate(); // Navigate between pages
  const scrollContainerRef = useRef(null); // Reference for the scroll container
  const [activeTab, setActiveTab] = useState(0); // Track the active tab (Ingredients, Instructions, Nutrition)
  const [recipe, setRecipe] = useState(null); // Store the recipe data
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Toggle shopping list popup visibility
  const [imageUrl, setImageUrl] = useState(null); // State to store the Firebase image URL

  const tabs = ["Ingredients", "Instructions", "Nutrition"]; // Define the tab names
  const auth = getAuth(); // Firebase Auth instance
  const currentUser = auth.currentUser; // Get the currently logged-in user

  // Fetch the recipe data from Firestore based on `recipeId`
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeData = await fetchFirestoreDoc("recipes", recipeId);
        if (!recipeData) {
          console.error("Recipe not found");
          return;
        }
  
        // Parse the fields
        const cookingTime = recipeData["Cooking Time"]
          ? parseSingleValue(recipeData["Cooking Time"])
          : "N/A";
        const difficulty = recipeData.Difficulty
          ? parseSingleValue(recipeData.Difficulty)
          : "N/A";
        const nutrition = recipeData.Calories
          ? parseNutrition(recipeData.Calories)
          : {};
        const rawIng = recipeData["Raw Ingredients"]
          ? parseRawIngredients(recipeData["Raw Ingredients"])
          : [];
  
        // Parse instructions safely.
        let instructions = [];
        if (recipeData.instructions) {
          if (typeof recipeData.instructions === "string") {
            try {
              instructions = JSON.parse(recipeData.instructions.replace(/'/g, '"'));
            } catch (err) {
              console.error("Error parsing instructions:", err);
            }
          } else if (Array.isArray(recipeData.instructions)) {
            instructions = recipeData.instructions;
          } else {
            console.warn("Unexpected instructions format:", recipeData.instructions);
          }
        }
  
        // Build the final recipe object.
        setRecipe({
          ...recipeData,
          prepTime: cookingTime,
          cookTime: cookingTime,
          level: difficulty,
          nutrition,
          ingredients: rawIng,
          instructions,
        });
  
        // Load image if available.
        const url = recipeData.image_name
          ? await fetchImageUrl(recipeData.image_name)
          : "/images/placeholder.jpg";
        setImageUrl(url);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };
  
    fetchRecipe();
  }, [recipeId]); // Re-fetch if `recipeId` changes

  // Enable scrolling when the component is mounted, disable when unmounted
  useEffect(() => {
    document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  // Handle scrolling between tabs
  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollLeft = scrollContainer.scrollLeft; // Get the horizontal scroll position
    const width = scrollContainer.offsetWidth; // Get the container width

    const newTab = Math.round(scrollLeft / width); // Determine the active tab based on scroll position
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  // Scroll to a specific tab when clicked
  const scrollToTab = (index) => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const width = scrollContainer.offsetWidth;
      scrollContainer.scrollTo({
        left: index * width,
        behavior: "smooth", // Smooth scrolling
      });
    }
    setActiveTab(index); // Update the active tab state
  };

  // Attach and detach scroll event listener for the scroll container
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [activeTab]);

  // Display a loading message if the recipe is not yet loaded
  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading recipe...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Image Section */}
      <div className="relative">
        <img
          src={imageUrl || "/images/placeholder.jpg"}
          alt={recipe.title || "Recipe"}
          className="w-full h-80 object-cover"
        />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
          <img src="/images/backarrow.png" alt="Back" className="w-8 h-8" />
        </button>

        {/* Save Button Component - Ensures Exact Positioning */}
        <div className="absolute top-4 right-4">
          <SaveButton currentUser={currentUser} recipeId={recipeId} size={32} />
        </div>
      </div>



    {/* Recipe Details */}
    <div className="px-6 py-4">
  <h2 className="text-2xl pt-4 font-semibold">{recipe.title || "Untitled Recipe"}</h2>
  <p className="text-sm text-gray-500">By: {recipe.author || "Unknown"}</p>
  
  {/* Inline images with text */}
    <div className="flex items-center mt-2 space-x-4">
      <img src="/images/clock.png" alt="Prep time" className="w-4 h-4" />
      <span className="text-sm text-gray-600">{recipe.prepTime || "N/A"} mins</span>
      
      <img src="/images/level.png" alt="Level" className="w-4 h-4" />
      <span className="text-sm text-gray-600">{recipe.level || "Easy"}</span>
      
      <img src="/images/cal.png" alt="Calories" className="w-4 h-4" />
      <span className="text-sm text-gray-600">{recipe.nutrition?.calories || "N/A"} cal</span>
    </div>
  </div>

    {/* Tabs Section */}
    <div className="flex justify-evenly mt-4 space-x-4">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          className={`text-sm ${
            activeTab === index
              ? "text-[#0E9A61] border-b-2 border-[#0E9A61]"
              : "text-blackk"
          }`}
          onClick={() => scrollToTab(index)}
        >
          {tab}
        </button>
      ))}
    </div>

    {/* Tab Content */}
    <div
      ref={scrollContainerRef}
      className="mt-6 flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
    >
      {/* Ingredients */}
      <div className="min-w-full snap-center px-6">
        <h3 className="text-lg font-semibold">Description:</h3>
        <p className="text-sm text-gray-600 mb-4">
          {recipe.description || "No description available."}
        </p>

        {/* Shopping List Button */}
        <div className="flex justify-center">
        <button
          onClick={() => setIsPopupVisible(true)}
          className="w-7/12 bg-white border-2 border-[#0E9A61] mt-1 mb-4 py-1 text-md rounded-3xl"
          >
          Add to Shopping List
        </button>
        </div>

        <h3 className="text-lg font-semibold">Ingredients</h3>
        <ul className="list-disc ml-6">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="text-sm text-gray-600">
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="min-w-full snap-center px-6">
        <h3 className="text-lg font-semibold">Instructions</h3>
        {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
          <ul className="list-none ml-6">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-sm text-gray-600">
                {step}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No instructions available.</p>
        )}
      </div>


      {/* Nutrition */}
      <div className="min-w-full snap-center px-6">
        <h3 className="text-lg font-semibold">Nutrition</h3>
        <ul className="list-disc ml-6">
          <li>Calories: {recipe.nutrition?.calories || "N/A"}</li>
          <li>Protein: {recipe.nutrition?.protein || "N/A"}g</li>
          <li>Fat: {recipe.nutrition?.fat || "N/A"}g</li>
          <li>Sugar: {recipe.nutrition?.sugar || "N/A"}g</li>
        </ul>
      </div>
    </div>

    {/* Shopping List Popup */}
    {isPopupVisible && (
      <AddToShoppingList
        recipe={{ ...recipe, id: recipeId }}
        onClose={() => setIsPopupVisible(false)}
      />
    )}
  </div>
  );
};

export default RecipePage;
