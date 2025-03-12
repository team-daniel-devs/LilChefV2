import React, { useState, useEffect } from "react";
import { fetchImageUrl } from "../utils/imageUtils";

const RecipeCard = ({ recipe, opacity, text, color }) => {
  const [imageUrl, setImageUrl] = useState(null);
  
  useEffect(() => {
    const fetchImage = async () => {
      if (recipe.imageName) {
        const url = await fetchImageUrl(recipe.imageName);
        setImageUrl(url);
      } else {
        setImageUrl("/images/placeholder.jpg");
      }
    };

    fetchImage();
  }, [recipe.imageName]);

  return (
    <div className="relative max-w-md h-[75vh] pb-4 mx-auto bg-white rounded-xl overflow-hidden text-center">
      <div className="w-full bg-gray-300 flex items-center justify-center object-fill">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-500">Loading Image...</span>
        )}
      </div>

      <div className="p-4">
        <div className="text-gray-600 text-sm flex items-center justify-center gap-1 mb-2">
          <span>⏱</span> <span>{recipe.prepTime} prep, {recipe.cookTime} cook</span>
        </div>
        <h2 className="text-xl font-bold text-[#0E9A61] mb-2">{recipe.title}</h2>

        <div className="flex justify-center text-gray-600 text-sm mb-4">
          <div className="text-center mx-2">
            <p className="font-semibold">{recipe.servingCost}</p>
            <p className="text-xs">/serving</p>
          </div>
          <div className="text-center mx-2">
            <p className="font-semibold">{recipe.prepTime}</p>
            <p className="text-xs">prep</p>
          </div>
          <div className="text-center mx-2">
            <p className="font-semibold">{recipe.cookTime}</p>
            <p className="text-xs">cook</p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#0E9A61] mb-2">Nutrition</h3>
          <div className="text-sm text-gray-600 grid grid-cols-4 gap-2">
            <div>
              <p className="font-semibold">{recipe.nutrition.calories || "N/A"}</p>
              <p className="text-xs"></p>
            </div>
            <div>
              <p className="font-semibold">{recipe.nutrition.protein || "N/A"}</p>
              <p className="text-xs"></p>
            </div>
            <div>
              <p className="font-semibold">{recipe.nutrition.fat || "N/A"}</p>
              <p className="text-xs"></p>
            </div>
            <div>
              <p className="font-semibold">{recipe.nutrition.sugar || "N/A"}</p>
              <p className="text-xs"></p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#0E9A61] mb-2">
            Ingredients ({recipe.ingredients.length})
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {recipe.ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-[#7FD5B2] text-black text-xs font-medium py-1 px-2 rounded-full"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 bg-white flex justify-center items-center font-bold"
        style={{
          color: color,
          fontSize: 20,
          opacity: opacity,
          border: `6px solid ${color}`,
          boxShadow: `0 0 10px 5px ${color}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default RecipeCard;
