import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddToShoppingList from "../components/AddToShoppingList";

const RecipePage = () => {
  const [isShoppingListVisible, setIsShoppingListVisible] = useState(false);

  useEffect(() => {
    // Enable scrolling for this page
    document.body.style.overflow = "auto";

    return () => {
      // Restore original overflow when leaving this page
      document.body.style.overflow = "hidden";
    };
  }, []);

  let navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Ingredients", "Instructions", "Nutrition"];
  const content = [
    <div className="p-4 max-w-full overflow-hidden">
      <p className="font-bold">Main Ingredients:</p>
      <div>• 2 medium zucchinis</div>
      <div>• 1 cup cooked quinoa</div>
      <div>• 1/2 cup shredded mozzarella cheese</div>
      <div>• 1/4 cup grated Parmesan cheese</div>
      <div>• 1 small onion, finely chopped</div>
      <div>• 2 garlic cloves, minced</div>
      <div>• 1 cup marinara sauce</div>
      <div>• 1 tbsp olive oil</div>
      <div>• 1/2 tsp dried oregano</div>
      <div>• Salt and pepper to taste</div>
    </div>,
    <div className="p-4 max-w-full overflow-hidden">
      <p className="font-bold">Instructions:</p>
      <div>
        <div>1. Preheat your oven to 375°F (190°C).</div>
        <div>Line a baking dish with parchment paper.</div>
      </div>
      <div>
        <div>2. Cut the zucchinis in half lengthwise.</div>
        <div>Scoop out the centers to create "boats."</div>
      </div>
      <div>
        <div>3. Heat olive oil in a skillet over medium heat.</div>
        <div>Add onion and garlic, sautéing until softened.</div>
      </div>
      <div>
        <div>4. Stir in the cooked quinoa, marinara sauce,</div>
        <div>oregano, salt, and pepper. Cook for 2-3 minutes.</div>
      </div>
      <div>
        <div>5. Spoon the quinoa mixture into the zucchini boats.</div>
        <div>Top with mozzarella and Parmesan cheese.</div>
      </div>
      <div>
        <div>6. Place the stuffed zucchinis on the baking dish.</div>
        <div>Bake for 20-25 minutes or until tender.</div>
      </div>
      <div>
        <div>7. Remove from oven and let cool for 5 minutes.</div>
        <div>Serve and enjoy!</div>
      </div>
    </div>,
    <div className="p-4 max-w-full overflow-hidden">
      <p className="font-bold">Nutrition Information (Per Serving):</p>
      <div>• Calories: 300</div>
      <div>• Protein: 12g</div>
      <div>• Carbohydrates: 25g</div>
      <div>• Fiber: 5g</div>
      <div>• Fat: 15g</div>
      <div>• Saturated Fat: 5g</div>
      <div>• Cholesterol: 20mg</div>
      <div>• Sodium: 400mg</div>
    </div>,
  ];

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollLeft = scrollContainer.scrollLeft;
    const width = scrollContainer.offsetWidth;

    // Update activeTab based on scroll position
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

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={() => navigate(-1)} className="text-gray-700 text-lg">
          ←
        </button>
        <h1 className="mx-auto font-bold text-lg">Recipe</h1>
        <button className="text-green-500 text-lg">✓</button>
      </div>

      {/* Image */}
      <div className="w-full">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiphrNcjfvL_UgvwWdgU6GdmJzN-6qV7MleA&s"
          alt="Recipe"
          className="w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-grow p-4">
        <h2 className="text-2xl font-bold">Stuffed Zucchinis</h2>
        <p className="text-sm text-gray-500">By: Noah Yu</p>
        <div className="flex items-center mt-2 space-x-4">
          <span className="text-sm text-gray-600">25 mins</span>
          <span className="text-sm text-gray-600">Easy</span>
          <span className="text-sm text-gray-600">300 cal</span>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-4 space-x-4">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`text-sm ${
                activeTab === index
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-500"
              }`}
              onClick={() => scrollToTab(index)}
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
          {content.map((item, index) => (
            <div
              key={index}
              className="min-w-full snap-center"
              style={{ flexShrink: 0 }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Add to Shopping List Button */}
      <button
        onClick={() => setIsShoppingListVisible(true)}
        className="w-full py-3 bg-green-500 text-white text-lg font-bold rounded-lg"
      >
        Add to Shopping List
      </button>

      {/* AddToShoppingList Popup */}
      <AddToShoppingList
        isVisible={isShoppingListVisible}
        onClose={() => setIsShoppingListVisible(false)}
      />
    </div>
  );
};

export default RecipePage;
