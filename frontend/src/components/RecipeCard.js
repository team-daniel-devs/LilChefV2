import React from "react";

// A functional component to render a recipe card
const RecipeCard = ({ recipe }) => {
  // Helper function to normalize the image name (because the image names have dashes instead of spaces and i  the db we have spaces and not dashes)
  const getNormalizedImageName = (imageName) => {
    if (!imageName) return null; // If no image name is provided, return null
    return `${imageName.toLowerCase().replace(/\s+/g, "-")}.jpg`; // Convert spaces to dashes and append .jpg
  };

  // Call the helper function to normalize the image name
  const normalizedImageName = getNormalizedImageName(recipe.imageName);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {/* Recipe Image Section */}
      <div className="h-48 w-full bg-gray-300 flex items-center justify-center">
        {normalizedImageName ? (
          // Display the recipe image if available
          <img
            src={`/Food%20Images/${normalizedImageName}`} // Dynamic image path with %20 for spaces
            alt={recipe.title || "N/A"} // Use recipe title as alt text
            className="h-full w-full object-cover" // Ensure the image covers the container
            onError={(e) => (e.target.src = "/images/placeholder.jpg")} // Fallback to a placeholder image if loading fails
          />
        ) : (
          // Placeholder text if no image is provided
          <span className="text-gray-500">Image Placeholder</span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Time Section */}
        <div className="text-gray-600 text-sm flex items-center gap-1 mb-2">
          <span>⏱</span> {/* Clock icon */}
          <span>
            {recipe.prepTime || "N/A"} prep, {recipe.cookTime || "N/A"} cook
          </span>
        </div>

        {/* Title Section */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {recipe.title || "N/A"} {/* Display the recipe title */}
        </h2>

        {/* Info Section */}
        <div className="flex justify-between text-gray-600 text-sm mb-4">
          {/* Cost per serving */}
          <div className="text-center">
            <p className="font-semibold">{recipe.servingCost || "N/A"}</p>
            <p className="text-xs">/serving</p>
          </div>
          {/* Preparation time */}
          <div className="text-center">
            <p className="font-semibold">{recipe.prepTime || "N/A"}</p>
            <p className="text-xs">prep</p>
          </div>
          {/* Cooking time */}
          <div className="text-center">
            <p className="font-semibold">{recipe.cookTime || "N/A"}</p>
            <p className="text-xs">cook</p>
          </div>
        </div>

        {/* Nutrition Section */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Nutrition</h3>
          <div className="text-sm text-gray-600 grid grid-cols-4 gap-2">
            {/* Calories */}
            <div>
              <p className="font-semibold">
                {recipe.nutrition?.calories || "N/A"}
              </p>
              <p className="text-xs">calories</p>
            </div>
            {/* Protein */}
            <div>
              <p className="font-semibold">
                {recipe.nutrition?.protein || "N/A"}
              </p>
              <p className="text-xs">protein</p>
            </div>
            {/* Fat */}
            <div>
              <p className="font-semibold">
                {recipe.nutrition?.fat || "N/A"}
              </p>
              <p className="text-xs">fat</p>
            </div>
            {/* Sugar */}
            <div>
              <p className="font-semibold">
                {recipe.nutrition?.sugar || "N/A"}
              </p>
              <p className="text-xs">sugar</p>
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Ingredients ({recipe.totalIngredients || 0})
          </h3>
          {/* Render each ingredient as a tag */}
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
    </div>
  );
};

export default RecipeCard;
