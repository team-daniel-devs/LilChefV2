import React from "react";

const GroceryRecipe = ({ title, image }) => {
  return (
    <div className="relative w-24 aspect-square rounded-lg overflow-hidden shadow-lg">
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
      {/* Black overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      {/* Text overlay */}
      <div className="absolute inset-0 flex items-end p-2">
        <h3 className="text-white text-sm font-medium">{title}</h3>
      </div>
    </div>
  );
};

export default GroceryRecipe;
