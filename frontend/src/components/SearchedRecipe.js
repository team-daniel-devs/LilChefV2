import React from "react";
import { Link } from "react-router-dom";
import SaveButton from "./SaveButton";

const SearchedRecipe = ({ recipeId, title, image, likes = 0, cookingTime = "N/A", difficulty = "Unrated" }) => {
  return (
    <div className="relative w-full aspect-[5/6] bg-gray-200 overflow-hidden rounded-lg">
      <Link to={`/recipepage/${recipeId}`} className="block h-full">
        <img
          src={image}
          alt={title}
          className="absolute w-full h-full object-cover"
        />
        
        {/* Black overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Difficulty indicator */}
        <div className="absolute top-2 left-2 bg-white text-black px-2 py-1 text-xs rounded-full">
          {difficulty}
        </div>

        {/* Save button */}
        <div className="absolute top-2 right-2">
          <SaveButton recipeId={recipeId} size={28} />
        </div>
        
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white flex justify-center items-center text-center">
          <h3 className="text-md">{title}</h3>
        </div>
      </Link>
    </div>
  );
};

export default SearchedRecipe;
