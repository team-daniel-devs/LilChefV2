import React from "react";
import { Link } from 'react-router-dom';

const SavedRecipe = ({ recipeId, title, image, likes = 0, cookingTime = "N/A" }) => {
  return (
    <div className="relative w-full aspect-square bg-gray-200 overflow-hidden rounded-lg">
      <Link to={`/recipepage/${recipeId}`}>
      <img
        src={image}
        alt={title}
        className="absolute w-full h-full object-cover"
      />

      {/* Black overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center mt-1 text-xs">
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
      </Link>
    </div>
  );
};

export default SavedRecipe;
