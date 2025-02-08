import React from "react";
import { Link } from "react-router-dom";

const SearchedRecipe = ({ recipeId, title, image, likes = 0, cookingTime = "N/A" }) => {
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

        {/* Save ribbon button */}
        <button className="absolute top-2 right-2 p-2 bg-green-500 text-white rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="w-5 h-5"
          >
            <path d="M11.5 1a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5V2.5A1.5 1.5 0 0 1 4 1h7.5zM9 0v2H7V0h2z" />
          </svg>
        </button>
        
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
      </Link>

      {/* Likes section below the image */}
      <div className="p-2 bg-gray-100 rounded-b-lg">
        <div className="flex items-center text-xs text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="w-4 h-4 text-red-500"
          >
            <path d="M8 1C4.287-1.271.5 1.678.5 5.5.5 8.74 8 15 8 15s7.5-6.26 7.5-9.5C15.5 1.678 11.713-1.27 8 1zm0 11.034C5.605 9.427 3 6.86 3 5.5 3 3.57 4.57 2 6.5 2 7.535 2 8 2.585 8 2.585S8.465 2 9.5 2C11.43 2 13 3.57 13 5.5c0 1.36-2.605 3.927-5 6.534z" />
          </svg>
          <span className="ml-1">{likes}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchedRecipe;
