import React, { useEffect } from "react";
import SavedRecipe from "../components/SavedRecipe";

const Saved = () => {

  //put this to enable scrolling!
  useEffect(() => {
    // Enable scrolling for this page
    document.body.style.overflow = "auto";

    return () => {
      // Restore original overflow when leaving this page
      document.body.style.overflow = "hidden";
    };
  }, []);

  const recipes = [
    { title: "Vegetable Stir-Fry", likes: 350, image: "https://www.wholesomeyum.com/wp-content/uploads/2020/11/wholesomeyum-Stir-Fry-Vegetables-15.jpg" },
    { title: "Chocolate Chip Cookies", likes: 200, image: "https://sallysbakingaddiction.com/wp-content/uploads/2013/05/classic-chocolate-chip-cookies.jpg" },
    { title: "Grilled Cheese Sandwich", likes: 150, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAFVPpn2AEspRJR8iX_C5H_Hm63rrsoHm3BA&s" },
    { title: "Beef Tacos", likes: 450, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReBnQ776pnJJPUuO-soQzNdTPcfn1UhBOPYw&s" },
    { title: "Avocado Toast", likes: 250, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqWUXBtxAtDkBIoTftl0731SAGDdfNV9_X3A&s" },
    { title: "Spaghetti Bolognese", likes: 500, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA_EF-1qMDLEoJA2sJ9S0rbE8qgw1ffJK3Bw&s" },
  ];  
  

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="flex items-center justify-center p-10">
        <h1 className="text-2xl font-semibold text-gray-800">Saved Recipes</h1>
      </header>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center bg-white p-3 rounded-lg shadow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="w-5 h-5 text-gray-500 mr-2"
          >
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zm-5.479.607a5.5 5.5 0 1110 0 5.5 5.5 0 01-10 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search saved recipes"
            className="w-full bg-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      {/* Filter and Sort Buttons */}
      <div className="flex gap-4 mb-6">
        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg shadow-md flex justify-center items-center gap-2">
          Filter
        </button>
        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg shadow-md flex justify-center items-center gap-2">
          Sort
        </button>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-2 gap-4">
        {recipes.map((recipe, index) => (
          <SavedRecipe
            key={index}
            title={recipe.title}
            likes={recipe.likes}
            image={recipe.image}
          />
        ))}
      </div>
    </div>
  );
};

export default Saved;
