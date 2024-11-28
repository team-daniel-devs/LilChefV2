import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const SavedRecipe = ({ recipeId, title, image, likes = 0, cookingTime = "N/A" }) => {
  return (
    <div className="relative w-full aspect-square bg-gray-200 overflow-hidden rounded-lg">
      {/* Link to the detailed recipe page */}
      <Link to={`/recipepage/${recipeId}`}>
        {/* Recipe Image */}
        <img
          src={image} // Image URL
          alt={title} // Alt text for accessibility
          className="absolute w-full h-full object-cover" // Ensure the image fills the card
        />

        {/* Black overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
          {/* Recipe title */}
          <h3 className="text-sm font-semibold">{title}</h3>
          {/* Likes and cooking time */}
          <div className="flex items-center justify-between mt-1 text-xs">
            {/* Likes */}
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="w-4 h-4 text-red-500"
              >
                <path d="M8 1C4.287-1.271.5 1.678.5 5.5.5 8.74 8 15 8 15s7.5-6.26 7.5-9.5C15.5 1.678 11.713-1.27 8 1zm0 11.034C5.605 9.427 3 6.86 3 5.5 3 3.57 4.57 2 6.5 2 7.535 2 8 2.585 8 2.585S8.465 2 9.5 2C11.43 2 13 3.57 13 5.5c0 1.36-2.605 3.927-5 6.534z" />
              </svg>
              <span className="ml-1">{likes}</span> {/* Display likes */}
            </div>

            {/* Cooking time */}
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="w-4 h-4 text-white"
              >
                <path d="M8 3.5a.5.5 0 0 1 .5.5v4l3 1.5a.5.5 0 0 1-.5.866L8 8.5V4a.5.5 0 0 1 .5-.5z" />
                <path d="M6.5 0a.5.5 0 0 1 .5.5v1.537A6.5 6.5 0 1 1 1 8.5h1a.5.5 0 1 1 0-1H1.708A5.5 5.5 0 1 0 8.5 1V0a.5.5 0 0 1 .5-.5z" />
              </svg>
              <span className="ml-1">{cookingTime} mins</span> {/* Display cooking time */}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SavedRecipe; // Export component for reuse
