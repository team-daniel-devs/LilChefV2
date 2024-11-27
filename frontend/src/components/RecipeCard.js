import React from "react";

const RecipeCard = ({ recipe }) => {
  // Function to normalize the `image_name` to match the file names
  const getNormalizedImageName = (imageName) => {
    if (!imageName) return null;
    return `${imageName.toLowerCase().replace(/\s+/g, "-")}.jpg`; // Convert spaces to dashes and append .jpg
  };

  const normalizedImageName = getNormalizedImageName(recipe.imageName);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {/* Recipe Image */}
      <div className="h-48 w-full bg-gray-300 flex items-center justify-center">
        {normalizedImageName ? (
          <img
            src={`/Food%20Images/${normalizedImageName}`} // Dynamic image path (handle space with %20)
            alt={recipe.title || "N/A"}
            className="h-full w-full object-cover"
            onError={(e) => (e.target.src = "/images/placeholder.jpg")} // Fallback image
          />
        ) : (
          <span className="text-gray-500">Image Placeholder</span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title Section */}
        <div className="text-gray-600 text-sm flex items-center gap-1 mb-2">
          <span>⏱</span>{" "}
          <span>
            {recipe.prepTime || "N/A"} prep, {recipe.cookTime || "N/A"} cook
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {recipe.title || "N/A"}
        </h2>

        {/* Info Section */}
        <div className="flex justify-between text-gray-600 text-sm mb-4">
          <div className="text-center">
            <p className="font-semibold">{recipe.servingCost || "N/A"}</p>
            <p className="text-xs">/serving</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{recipe.prepTime || "N/A"}</p>
            <p className="text-xs">prep</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{recipe.cookTime || "N/A"}</p>
            <p className="text-xs">cook</p>
          </div>
        </div>

        {/* Nutrition Section */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Nutrition</h3>
          <div className="text-sm text-gray-600 grid grid-cols-4 gap-2">
            <div>
              <p className="font-semibold">
                {recipe.nutrition?.calories || "N/A"}
              </p>
              <p className="text-xs">calories</p>
            </div>
            <div>
              <p className="font-semibold">
                {recipe.nutrition?.protein || "N/A"}
              </p>
              <p className="text-xs">protein</p>
            </div>
            <div>
              <p className="font-semibold">{recipe.nutrition?.fat || "N/A"}</p>
              <p className="text-xs">fat</p>
            </div>
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
