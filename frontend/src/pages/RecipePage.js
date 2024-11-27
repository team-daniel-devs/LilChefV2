import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

const RecipePage = () => {
  const { recipeId } = useParams(); // Get the recipe ID from the URL
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [recipe, setRecipe] = useState(null);

  const tabs = ["Ingredients", "Instructions", "Nutrition"];

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
        if (recipeDoc.exists()) {
          const recipeData = recipeDoc.data();

          // Parse `ingredients` if it's a JSON string
          let ingredients = [];
          try {
            ingredients = recipeData.ingredients
              ? JSON.parse(recipeData.ingredients.replace(/'/g, '"'))
              : [];
          } catch (error) {
            console.error("Error parsing ingredients:", error);
          }

          setRecipe({
            ...recipeData,
            ingredients,
          });
        } else {
          console.error("Recipe not found");
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  useEffect(() => {
    document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollLeft = scrollContainer.scrollLeft;
    const width = scrollContainer.offsetWidth;

    const newTab = Math.round(scrollLeft / width);
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const scrollToTab = (index) => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const width = scrollContainer.offsetWidth;
      scrollContainer.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
    }
    setActiveTab(index); // Synchronize activeTab state
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [activeTab]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading recipe...</p>
      </div>
    );
  }

  // Construct the image path using `image_name`
  const imagePath = recipe.image_name
    ? `/Food Images/${recipe.image_name.toLowerCase().replace(/\s+/g, "-")}.jpg`
    : "/images/placeholder.jpg";

  // Define content dynamically based on the recipe data
  const content = [
    <div className="p-4 text-left">
      <h3 className="text-lg font-semibold">Ingredients</h3>
      <ul className="list-disc ml-6">
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index} className="text-sm text-gray-600">
            {ingredient}
          </li>
        ))}
      </ul>
    </div>,
    <div className="p-4 text-left">
      <h3 className="text-lg font-semibold">Instructions</h3>
      <p className="text-sm text-gray-600">{recipe.instructions || "No instructions available."}</p>
    </div>,
    <div className="p-4 text-left">
      <h3 className="text-lg font-semibold">Nutrition</h3>
      <ul className="list-disc ml-6">
        <li className="text-sm text-gray-600">Calories: {recipe.nutrition?.calories || "N/A"}</li>
        <li className="text-sm text-gray-600">Protein: {recipe.nutrition?.protein || "N/A"}</li>
        <li className="text-sm text-gray-600">Fat: {recipe.nutrition?.fat || "N/A"}</li>
        <li className="text-sm text-gray-600">Sugar: {recipe.nutrition?.sugar || "N/A"}</li>
      </ul>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Image Section */}
      <div className="relative">
        <img
          src={imagePath}
          alt={recipe.title || "Recipe Image"}
          className="w-full h-64 object-cover"
        />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
          <img src="/images/backarrow.png" alt="Back" className="w-8 h-8" />
        </button>
        <button className="absolute top-4 right-4">
          <img src="/images/save.png" alt="Save" className="w-8 h-8" />
        </button>

        {/* Tab Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {tabs.map((_, index) => (
            <div
              key={index}
              onClick={() => scrollToTab(index)}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                activeTab === index ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Recipe Details */}
      <div className="flex-grow px-6 pb-4">
        <h2 className="text-2xl font-bold mt-4">{recipe.title || "N/A"}</h2>
        <p className="text-sm text-gray-500 mt-1">By: {recipe.author || "N/A"}</p>
        <div className="flex items-center mt-2 space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <img src="/images/clock.png" alt="Clock" className="w-4 h-4 mr-2" />
            <span>{recipe.prepTime || "N/A"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <img src="/images/level.png" alt="Level" className="w-4 h-4 mr-2" />
            <span>{recipe.level || "Easy"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <img src="/images/cal.png" alt="Calories" className="w-4 h-4 mr-2" />
            <span>{recipe.nutrition?.calories || "300 cal"}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center mt-6 space-x-6 border-b border-gray-200 pb-2">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => scrollToTab(index)}
              className={`text-sm font-medium ${
                activeTab === index
                  ? "text-green-500 border-b-2 border-green-500 pb-1"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      {/* Swipable Content */}
      <div
          ref={scrollContainerRef}
          className="mt-4 flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide"
        >
          {/* Ingredients Tab */}
          <div
            className="min-w-full snap-center px-6"
            style={{ flexShrink: 0 }}
          >
            {activeTab === 0 && (
              <>
                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    {recipe.description || "No description available."}
                  </p>
                </div>

                {/* Add to Shopping List Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    className="flex items-center justify-center border border-green-500 text-green-500 font-medium rounded-full"
                    style={{ width: "219px", height: "37px" }}
                  >
                    <img
                      src="/images/list.png"
                      alt="Save Icon"
                      className="w-5 h-5 mr-2"
                    />
                    Add to Shopping List
                  </button>
                </div>

                {/* Servings */}
                <div className="flex items-center mt-4">
                  <span className="text-gray-600 font-medium">Servings:</span>
                  <span className="ml-2 text-lg font-bold">
                    {recipe.servings || "N/A"}
                  </span>
                </div>

                {/* Ingredients */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Ingredients</h3>
                  <ul className="list-disc ml-6">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Instructions Tab */}
          <div
            className="min-w-full snap-center px-6"
            style={{ flexShrink: 0 }}
          >
            {activeTab === 1 && (
              <>
                <h3 className="text-lg font-semibold">Instructions</h3>
                <p className="text-sm text-gray-600">
                  {recipe.instructions || "No instructions available."}
                </p>
              </>
            )}
          </div>

          {/* Nutrition Tab */}
          <div
            className="min-w-full snap-center px-6"
            style={{ flexShrink: 0 }}
          >
            {activeTab === 2 && (
              <>
                <h3 className="text-lg font-semibold">Nutrition</h3>
                <ul className="list-disc ml-6">
                  <li className="text-sm text-gray-600">
                    Calories: {recipe.nutrition?.calories || "N/A"}
                  </li>
                  <li className="text-sm text-gray-600">
                    Protein: {recipe.nutrition?.protein || "N/A"}
                  </li>
                  <li className="text-sm text-gray-600">
                    Fat: {recipe.nutrition?.fat || "N/A"}
                  </li>
                  <li className="text-sm text-gray-600">
                    Sugar: {recipe.nutrition?.sugar || "N/A"}
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
