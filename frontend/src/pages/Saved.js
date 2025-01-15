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
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="flex items-center justify-center p-10">
        <h1 className="text-2xl font-semibold text-gray-800">Saved Recipes</h1>
      </header>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center bg-white p-3 rounded-lg shadow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="w-5 h-5 text-gray-500 mr-2"
          >
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zm-5.479.607a5.5 5.5 0 1110 0 5.5 5.5 0 01-10 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search saved recipes"
            className="w-full bg-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      {/* Filter and Sort Buttons */}
      <div className="flex gap-4 mb-6">
        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg shadow-md flex justify-center items-center gap-2">
          Filter
        </button>
        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg shadow-md flex justify-center items-center gap-2">
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
    </div>
  );
};

export default Saved;


