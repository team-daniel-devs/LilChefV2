import React, { useEffect, useState } from "react";
import { db } from "../firebaseconfig"; // Firebase configuration
import { doc, getDoc } from "firebase/firestore"; // Firestore methods
import { auth } from "../firebaseconfig"; // Firebase Auth
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Firebase Storage
import SavedRecipe from "../components/SavedRecipe"; // SavedRecipe component

const Saved = () => {
  const [savedRecipes, setSavedRecipes] = useState([]); // State to hold saved recipes
  const [userId, setUserId] = useState(null); // State to hold the current user's ID

  useEffect(() => {
    // Listen for the currently logged-in user
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Set the user's ID
      } else {
        console.error("No user is logged in");
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Helper function to normalize the image name
  const getNormalizedImageName = (imageName) => {
    if (!imageName) return null; // Return null if no image name is provided

    // Normalize the image name: trim spaces, remove leading dashes, and replace spaces with dashes
    return imageName
      .toLowerCase()
      .trim()
      .replace(/^\s*-+/, "") // Remove leading dashes
      .replace(/\s+/g, "-") + ".jpg"; // Replace spaces with dashes and add extension
  };

  // Function to fetch image URL with retry logic
  const fetchImageUrl = async (imageName) => {
    const storage = getStorage(); // Initialize Firebase Storage
    const normalizedImageName = getNormalizedImageName(imageName);
    if (!normalizedImageName) return "/images/placeholder.jpg"; // Return placeholder if normalization fails

    // Reference without leading dash
    let imageRef = ref(storage, `Recipe_Pictures/${normalizedImageName}`);

    try {
      // Try fetching the image
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.warn(`File not found: ${normalizedImageName}. Retrying with leading dash...`);
    }

    try {
      // Retry with leading dash
      const fallbackImageName = `-${normalizedImageName}`;
      imageRef = ref(storage, `Recipe_Pictures/${fallbackImageName}`);
      return await getDownloadURL(imageRef);
    } catch (retryError) {
      console.error("Image fetch failed for both cases:", retryError);
      return "/images/placeholder.jpg"; // Return placeholder on failure
    }
  };

  useEffect(() => {
    if (!userId) return; // Wait until userId is set

    const fetchSavedRecipes = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
          console.error("User not found");
          return;
        }

        const userData = userDoc.data();
        const recipeIds = userData.savedRecipes || [];

        const recipePromises = recipeIds.map(async (recipeId) => {
          const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
          if (!recipeDoc.exists()) return null;

          const recipeData = recipeDoc.data();
          const imageUrl = await fetchImageUrl(recipeData.image_name); // Fetch normalized image URL
          return { id: recipeId, ...recipeData, imageUrl }; // Attach image URL to the recipe data
        });

        const recipes = (await Promise.all(recipePromises)).filter(Boolean); // Filter out null values
        setSavedRecipes(recipes); // Update state with the fetched recipes
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
      }
    };

    fetchSavedRecipes();
  }, [userId]);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      {/* Header Section */}
      <header className="flex justify-between items-center px-4 py-6">
        <h1 className="text-2xl font-bold">Saved Recipes</h1>
        <img
          src="/images/profile-icon.png" // Profile icon image
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
      </header>

      {/* Search Bar Section */}
      <div className="mb-4">
        <div className="flex items-center bg-white p-3 rounded-lg shadow">
          <img
            src="/images/search.png" // Search icon image
            alt="Search"
            className="w-5 h-5 text-gray-500 mr-2"
          />
          <input
            type="text"
            placeholder="Search saved recipes" // Input placeholder text
            className="w-full bg-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      {/* Filter and Sort Buttons */}
      <div className="flex gap-4 mb-6">
        <button className="flex-1 bg-green-500 text-white py-2 rounded-full flex items-center justify-center">
          <img
            src="/images/filter.png" // Filter icon image
            alt="Filter"
            className="w-5 h-5 mr-2"
          />
          Filter
        </button>
        <button className="flex-1 bg-green-500 text-white py-2 rounded-full flex items-center justify-center">
          <img
            src="/images/sort.png" // Sort icon image
            alt="Sort"
            className="w-5 h-5 mr-2"
          />
          Sort
        </button>
      </div>

      {/* Recipe Grid Section */}
      <div className="grid grid-cols-2 gap-4">
        {savedRecipes.map((recipe) => (
          <SavedRecipe
            key={recipe.id} // Unique key for each recipe
            recipeId={recipe.id} // Pass recipe ID for navigation
            title={recipe.title} // Pass recipe title
            image={recipe.imageUrl} // Construct image path
            likes={Math.floor(Math.random() * 1000)} // Temporary random likes
            cookingTime={recipe.cooking_time || "N/A"} // Fallback if cooking time is missing
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white shadow-lg py-4 flex justify-around">
        <img src="/images/home-icon.png" alt="Home" className="w-6 h-6" />
        <img src="/images/search-icon.png" alt="Search" className="w-6 h-6" />
        <img src="/images/calendar-icon.png" alt="Plan" className="w-6 h-6" />
        <img src="/images/saved-icon.png" alt="Saved" className="w-6 h-6" />
        <img src="/images/cart-icon.png" alt="Cart" className="w-6 h-6" />
      </footer>
    </div>
  );
};

export default Saved;
