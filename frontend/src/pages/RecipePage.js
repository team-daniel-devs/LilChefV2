import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // For navigation and extracting route parameters
import { db } from "../firebaseconfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"; // Firebase Firestore methods
import { getAuth } from "firebase/auth"; // Firebase Authentication
import ShoppingListPopup from "../components/ShoppingListPopup"; // Component for adding ingredients to a shopping list

const RecipePage = () => {
  const { recipeId } = useParams(); // Get the `recipeId` parameter from the URL
  const navigate = useNavigate(); // Navigate between pages
  const scrollContainerRef = useRef(null); // Reference for the scroll container
  const [activeTab, setActiveTab] = useState(0); // Track the active tab (Ingredients, Instructions, Nutrition)
  const [recipe, setRecipe] = useState(null); // Store the recipe data
  const [isPopupVisible, setIsPopupVisible] = useState(false); // Toggle shopping list popup visibility

  const tabs = ["Ingredients", "Instructions", "Nutrition"]; // Define the tab names
  const auth = getAuth(); // Firebase Auth instance
  const currentUser = auth.currentUser; // Get the currently logged-in user

  // Fetch the recipe data from Firestore based on `recipeId`
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
        if (recipeDoc.exists()) {
          const recipeData = recipeDoc.data();

          // Parse the `ingredients` field if it's a JSON string
          let ingredients = [];
          try {
            ingredients = recipeData.ingredients
              ? JSON.parse(recipeData.ingredients.replace(/'/g, '"')) // Replace single quotes with double quotes
              : [];
          } catch (error) {
            console.error("Error parsing ingredients:", error);
          }

          setRecipe({
            ...recipeData,
            ingredients, // Store the parsed ingredients
          });
        } else {
          console.error("Recipe not found");
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };

    fetchRecipe();
  }, [recipeId]); // Re-fetch if `recipeId` changes

  // Save the recipe to the user's saved recipes in Firestore
  const handleSaveRecipe = async () => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    const userDocRef = doc(db, "users", currentUser.uid); // Reference to the user's document

    try {
      await updateDoc(userDocRef, {
        savedRecipes: arrayUnion(recipeId), // Add the recipe ID to the `savedRecipes` array
      });
      console.log("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

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

  // Construct the image path using `image_name`
  const imagePath = recipe.image_name
    ? `/Food Images/${recipe.image_name.toLowerCase().replace(/\s+/g, "-")}.jpg`
    : "/images/placeholder.jpg"; // Fallback image if `image_name` is missing

  // Handle adding ingredients to the shopping list
  const handleAddToShoppingList = () => {
    setIsPopupVisible(true); // Show the popup
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false); // Hide the popup
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Image Section */}
      <div className="relative">
        <img
          src={imagePath}
          alt={recipe.title || "Recipe Image"}
          className="w-full h-64 object-cover"
        />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
          <img src="/images/backarrow.png" alt="Back" className="w-8 h-8" />
        </button>
        <button onClick={handleSaveRecipe} className="absolute top-4 right-4">
          <img src="/images/save.png" alt="Save" className="w-8 h-8" />
        </button>

        {/* Tab Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {tabs.map((_, index) => (
            <div
              key={index}
              onClick={() => scrollToTab(index)}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                activeTab === index ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Recipe Details */}
      <div className="flex-grow px-6 pb-4">
        <h2 className="text-2xl font-bold mt-4">{recipe.title || "N/A"}</h2>
        <p className="text-sm text-gray-500 mt-1">By: {recipe.author || "N/A"}</p>
        <div className="flex items-center mt-2 space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <img src="/images/clock.png" alt="Clock" className="w-4 h-4 mr-2" />
            <span>{recipe.prepTime || "N/A"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <img src="/images/level.png" alt="Level" className="w-4 h-4 mr-2" />
            <span>{recipe.level || "Easy"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <img src="/images/cal.png" alt="Calories" className="w-4 h-4 mr-2" />
            <span>{recipe.nutrition?.calories || "300 cal"}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center mt-6 space-x-6 border-b border-gray-200 pb-2">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => scrollToTab(index)}
              className={`text-sm font-medium ${
                activeTab === index
                  ? "text-green-500 border-b-2 border-green-500 pb-1"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      {/* Popup */}
      {isPopupVisible && (
        <ShoppingListPopup
          recipe={recipe} // Pass recipe data to the popup
          onClose={handleClosePopup} // Close function
        />
      )}

      {/* Swipable Content */}
      <div
          ref={scrollContainerRef}
          className="mt-4 flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
        >
          {/* Ingredients Tab */}
          <div
            className="min-w-full snap-center px-6"
            style={{ flexShrink: 0 }}
          >
            {activeTab === 0 && (
              <>
                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    {recipe.description || "No description available."}
                  </p>
                </div>

                {/* Add to Shopping List Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    className="flex items-center justify-center border border-green-500 text-green-500 font-medium rounded-full"
                    style={{ width: "219px", height: "37px" }}
                    onClick={handleAddToShoppingList} // Open Popup
                  >
                    <img src="/images/list.png" alt="Save Icon" className="w-5 h-5 mr-2" />
                    Add to Shopping List
                  </button>
                </div>

                {/* Servings */}
                <div className="flex items-center mt-4">
                  <span className="text-gray-600 font-medium">Servings:</span>
                  <span className="ml-2 text-lg font-bold">
                    {recipe.servings || "N/A"}
                  </span>
                </div>

                {/* Ingredients */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Ingredients</h3>
                  <ul className="list-disc ml-6">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Instructions Tab */}
          <div
            className="min-w-full snap-center px-6"
            style={{ flexShrink: 0 }}
          >
            {activeTab === 1 && (
              <>
                <h3 className="text-lg font-semibold">Instructions</h3>
                <p className="text-sm text-gray-600">
                  {recipe.instructions || "No instructions available."}
                </p>
              </>
            )}
          </div>

          {/* Nutrition Tab */}
          <div
            className="min-w-full snap-center px-6"
            style={{ flexShrink: 0 }}
          >
            {activeTab === 2 && (
              <>
                <h3 className="text-lg font-semibold">Nutrition</h3>
                <ul className="list-disc ml-6">
                  <li className="text-sm text-gray-600">
                    Calories: {recipe.nutrition?.calories || "N/A"}
                  </li>
                  <li className="text-sm text-gray-600">
                    Protein: {recipe.nutrition?.protein || "N/A"}
                  </li>
                  <li className="text-sm text-gray-600">
                    Fat: {recipe.nutrition?.fat || "N/A"}
                  </li>
                  <li className="text-sm text-gray-600">
                    Sugar: {recipe.nutrition?.sugar || "N/A"}
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
