import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // For navigation and extracting route parameters
import { db } from "../firebaseconfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"; // Firebase Firestore methods
import { getAuth } from "firebase/auth"; // Firebase Authentication
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import AddToShoppingList from "../components/AddToShoppingList"; // Component for adding ingredients to a shopping list

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
  const storage = getStorage(); // Firebase Storage instance
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

          // Fetch the recipe image from Firebase
          if (recipeData.image_name) {
            const normalizedImageName = `${recipeData.image_name
              .toLowerCase()
              .replace(/\s+/g, "-")}.jpg`;

            try {
              const imageRef = ref(
                storage,
                `Recipe_Pictures/${normalizedImageName}`
              );
              const url = await getDownloadURL(imageRef);
              setImageUrl(url);
            } catch (error) {
              console.error("Error fetching image from Firebase:", error);
              setImageUrl("/images/placeholder.jpg"); // Fallback image
            }
          }
          
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
        src={imageUrl || "/images/placeholder.jpg"}
        alt={recipe.title || "Recipe"}
        className="w-full h-64 object-cover"
      />
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
        <img src="/images/backarrow.png" alt="Back" className="w-8 h-8" />
      </button>
      <button onClick={handleSaveRecipe} className="absolute top-4 right-4">
        <img src="/images/save.png" alt="Save" className="w-8 h-8" />
      </button>
    </div>

    {/* Recipe Details */}
    <div className="px-6 py-4">
      <h2 className="text-2xl font-bold">{recipe.title || "Untitled Recipe"}</h2>
      <p className="text-sm text-gray-500">By: {recipe.author || "Unknown"}</p>
      <div className="flex items-center mt-2 space-x-4">
        <span className="text-sm text-gray-600">{recipe.prepTime || "N/A"} mins</span>
        <span className="text-sm text-gray-600">{recipe.level || "Easy"}</span>
        <span className="text-sm text-gray-600">
          {recipe.nutrition?.calories || "N/A"} cal
        </span>
      </div>
    </div>

    {/* Tabs Section */}
    <div className="flex justify-center mt-4 space-x-4">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          className={`text-sm ${
            activeTab === index
              ? "text-green-500 border-b-2 border-green-500"
              : "text-gray-500"
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
      className="mt-4 flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
    >
      {/* Ingredients */}
      <div className="min-w-full snap-center px-6">
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
        <p className="text-sm text-gray-600">
          {recipe.instructions || "No instructions available."}
        </p>
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

    {/* Shopping List Button */}
    <button
      onClick={() => setIsPopupVisible(true)}
      className="fixed bottom-0 left-0 w-full py-3 bg-green-500 text-white text-lg font-bold mb-5"
      style={{ bottom: "60px" }} // Adjust this value to the height of your navbar
    >
      Add to Shopping List
    </button>

    {/* Shopping List Popup */}
    {isPopupVisible && (
      <AddToShoppingList
        recipe={recipe}
        onClose={() => setIsPopupVisible(false)}
      />
    )}
  </div>
  );
};

export default RecipePage;
