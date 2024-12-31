import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// A functional component to render a recipe card
const RecipeCard = ({ recipe, opacity, text, color}) => {
  const [imageUrl, setImageUrl] = useState(null); // State to store the Firebase image URL
  const storage = getStorage(); // Firebase Storage instance

  // Helper function to normalize the image name (because the image names have dashes instead of spaces and i  the db we have spaces and not dashes)
  const getNormalizedImageName = (imageName) => {
    if (!imageName) return null; // Return null if no image name is provided
  
    // Normalize the image name: trim spaces, remove leading dashes, and replace spaces with dashes
    return imageName
      .toLowerCase()
      .trim()
      .replace(/^\s*-+/, "") // Remove leading dashes
      .replace(/\s+/g, "-") + ".jpg"; // Replace spaces with dashes and add extension
  };
  
  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!recipe.imageName) return;

      const normalizedImageName = getNormalizedImageName(recipe.imageName);
      if (!normalizedImageName) return;

      let imageRef = ref(storage, `Recipe_Pictures/${normalizedImageName}`);
      try {
        // Attempt to fetch the image with the normalized name
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
        return; // Exit if the image is found
      } catch (error) {
        console.warn(`File not found: ${normalizedImageName}. Retrying with leading dash...`);
      }

      try {
        // Retry with a leading dash
        const fallbackImageName = `-${normalizedImageName}`;
        imageRef = ref(storage, `Recipe_Pictures/${fallbackImageName}`);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
      } catch (retryError) {
        console.error("Image fetch failed for both cases:", retryError);
        setImageUrl("/images/placeholder.jpg"); // Fallback image
      }
    };
    
    fetchImageUrl();
  }, [recipe.imageName]);

  return (
    <div className="relative max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {/* Image Section */}
      <div className="h-48 w-full bg-gray-300 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-500">Loading Image...</span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="text-gray-600 text-sm flex items-center gap-1 mb-2">
          <span>⏱</span> <span>{recipe.prepTime} prep, {recipe.cookTime} cook</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h2>

        <div className="flex justify-between text-gray-600 text-sm mb-4">
          <div className="text-center">
            <p className="font-semibold">{recipe.servingCost}</p>
            <p className="text-xs">/serving</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{recipe.prepTime}</p>
            <p className="text-xs">prep</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{recipe.cookTime}</p>
            <p className="text-xs">cook</p>
          </div>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Nutrition</h3>
          <div className="text-sm text-gray-600 grid grid-cols-4 gap-2">
            <div>
              <p className="font-semibold">{recipe.nutrition.calories}</p>
              <p className="text-xs">calories</p>
            </div>
            <div>
              <p className="font-semibold">{recipe.nutrition.protein}</p>
              <p className="text-xs">protein</p>
            </div>
            <div>
              <p className="font-semibold">{recipe.nutrition.fat}</p>
              <p className="text-xs">fat</p>
            </div>
            <div>
              <p className="font-semibold">{recipe.nutrition.sugar}</p>
              <p className="text-xs">sugar</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Ingredients ({recipe.ingredients.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-600 text-xs font-medium py-1 px-2 rounded-full"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full-covering white overlay */}
      <div
        className="absolute inset-0 bg-white flex justify-center items-center text-gray-800 font-bold"
        style={{
          opacity: opacity,
          border: `2px solid ${color}`,
          boxShadow: `0 0 10px 5px ${color}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default RecipeCard;
