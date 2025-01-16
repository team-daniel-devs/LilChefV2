import React, { useState, useEffect } from "react";
import { db } from "../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import GroceryRecipe from "../components/GroceryRecipe";

const Grocery = () => {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null); // New state for selected recipe
  const auth = getAuth();
  const storage = getStorage();

  const getNormalizedImageName = (imageName) => {
    if (!imageName) return null;
    return imageName
      .toLowerCase()
      .trim()
      .replace(/^\s*-+/, "")
      .replace(/\s+/g, "-") + ".jpg";
  };

  const fetchImageUrl = async (imageName) => {
    if (!imageName) return "/images/placeholder.jpg";

    const normalizedImageName = getNormalizedImageName(imageName);
    let imageRef = ref(storage, `Recipe_Pictures/${normalizedImageName}`);

    try {
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.warn(`Image not found: ${normalizedImageName}. Retrying with leading dash...`);
    }

    try {
      const fallbackImageName = `-${normalizedImageName}`;
      imageRef = ref(storage, `Recipe_Pictures/${fallbackImageName}`);
      return await getDownloadURL(imageRef);
    } catch (retryError) {
      console.error("Image fetch failed:", retryError);
      return "/images/placeholder.jpg"; // Fallback image
    }
  };

  useEffect(() => {
    const fetchShoppingList = async () => {
      const user = auth.currentUser;

      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const shoppingList = userDoc.data()?.shopping_list || {};

        const fetchedRecipes = [];
        const fetchedIngredients = [];

        for (const recipeId in shoppingList) {
          // Fetch recipe details from the recipes collection
          const recipeDocRef = doc(db, "recipes", recipeId);
          const recipeDoc = await getDoc(recipeDocRef);

          if (recipeDoc.exists()) {
            const recipeData = recipeDoc.data();
            const imageUrl = await fetchImageUrl(recipeData.image_name);

            fetchedRecipes.push({
              id: recipeId,
              title: recipeData.title || "Untitled Recipe",
              image: imageUrl,
            });

            // Add ingredients for this recipe
            fetchedIngredients.push(
              ...shoppingList[recipeId].ingredients.map((ingredient, index) => ({
                id: `${recipeId}-${index}`,
                name: ingredient,
                recipeId: recipeId, // Track which recipe this ingredient belongs to
                checked: false,
              }))
            );
          }
        }

        setRecipes(fetchedRecipes);
        setIngredients(fetchedIngredients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shopping list:", error);
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, []);


  const toggleChecked = (id) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleRecipeClick = (recipeId) => {
    setSelectedRecipeId(recipeId); // Update the selected recipe
  };

  const handleDeleteSelected = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const shoppingList = userDoc.data()?.shopping_list || {};

      const updatedShoppingList = { ...shoppingList };

      // Filter out the selected ingredients for each recipe
      const selectedItems = ingredients.filter((item) => item.checked);
      selectedItems.forEach((item) => {
        const { recipeId, name } = item;
        updatedShoppingList[recipeId].ingredients = updatedShoppingList[recipeId].ingredients.filter(
          (ingredient) => ingredient !== name
        );

        // Remove the recipe key if no ingredients are left
        if (updatedShoppingList[recipeId].ingredients.length === 0) {
          delete updatedShoppingList[recipeId];
        }
      });

      // Update Firestore
      await updateDoc(userDocRef, { shopping_list: updatedShoppingList });

      // Update the UI
      setIngredients((prev) =>
        prev.filter((item) => !item.checked)
      );
    } catch (error) {
      console.error("Error deleting selected items:", error);
    }
  };

  const filteredIngredients = selectedRecipeId
    ? ingredients.filter((item) => item.recipeId === selectedRecipeId)
    : ingredients;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No recipes in your shopping list.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-semibold">Shopping List</h1>
        <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="sr-only">Profile</span>
          <i className="fas fa-user text-gray-600"></i>
        </button>
      </header>

       {/* Recipe List */}
       <div className="p-4">
        <p className="text-lg font-medium mb-2">{recipes.length} recipe</p>
        <div className="flex space-x-4 overflow-x-auto">
          {recipes.map((recipe) => (
            <div
              className="flex-shrink-0 cursor-pointer"
              key={recipe.id}
              onClick={() => handleRecipeClick(recipe.id)} // Handle image click
            >
              <GroceryRecipe title={recipe.title} image={recipe.image} />
            </div>
          ))}
        </div>
      </div>

      {/* "Items" Text */}
      <div className="px-4 mt-4">
        <h3 className="text-lg font-medium mb-2">{filteredIngredients.length} items</h3>
      </div>

      {/* Scrollable Items List */}
      <div className="flex-1 overflow-y-auto px-4">
        <ul className="space-y-2">
          {filteredIngredients.map((item) => (
            <li
              key={item.id}
              className="flex items-center bg-white p-4 shadow rounded-lg"
            >
              <span className="flex-1">{item.name}</span>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleChecked(item.id)}
                className="w-5 h-5"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Delete Button */}
      <div className="px-4 py-2 mb-6">
        <button
          className="bg-red-500 text-white w-full py-3 rounded-lg font-bold shadow-lg mb-12"
          onClick={handleDeleteSelected}
        >
          Delete Selected Items
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow p-4 flex justify-around">
        <button className="text-gray-600">
          <i className="fas fa-home"></i>
        </button>
        <button className="text-gray-600">
          <i className="fas fa-calendar-alt"></i>
        </button>
        <button className="text-green-600">
          <i className="fas fa-shopping-cart"></i>
        </button>
      </nav>
    </div>
  );
};

export default Grocery;