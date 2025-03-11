import React from "react";
import { Link } from 'react-router-dom';
import SaveButton from '../components/SaveButton.js'

const SavedRecipe = ({ recipeId, title, image, stars = 0, cookingTime = "N/A" }) => {
  return (
    <div className="w-full">
      {/* Main square with image and save button */}
      <div className="relative w-full aspect-square bg-gray-200 overflow-hidden rounded-3xl">
        <Link to={`/recipepage/${recipeId}`}>
          <img
            src={image}
            alt={title}
            className="absolute w-full h-full object-cover"
          />

          {/* Black overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>

          {/* Text overlay */}
          <div className="absolute bottom-0 left-0 right-0 pl-3 pb-2 text-white">
            <h3 className="text-md">{title}</h3>
          </div>
        </Link>

        {/* Save button */}
        <div className="absolute top-2 right-2">
          <SaveButton recipeId={recipeId} size={36} />
        </div>
      </div>

      {/* Text below the main square */}
      <div className="mt-2 flex justify-between px-2 text-sm text-gray-800">
        {/* Star image and stars count */}
        <div className="flex items-center">
          <span>{stars}</span>
                    <img
            src="/images/star.png"
            alt="Star Icon"
            className="w-4 h-4 mr-1 ml-2"
          />
        </div>

        {/* Clock image and cooking time */}
        <div className="flex items-center">
          <img
            src="/images/clock.png"
            alt="Clock Icon"
            className="w-4 h-4 mr-1"
          />
          <span>{cookingTime}</span>
        </div>
      </div>
    </div>
  );
};

export default SavedRecipe;
