// src/pages/DailyPlan.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  onAuthStateChanged,
  fetchSavedRecipes,
} from '../utils/firebaseUtils';
import { fetchImageUrl } from '../utils/imageUtils';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebaseconfig';

/** 
 * fetchWeeklyPlan:
 * Retrieves the user's weeklyMeals document from Firestore.
 * Expected structure: 
 * {
 *   Monday: { Breakfast: [], Lunch: [], Dinner: [] },
 *   Tuesday: { Breakfast: [], Lunch: [], Dinner: [] },
 *   ...
 * }
 */
async function fetchWeeklyPlan(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.weeklyMeals || null;
}

const DailyPlan = () => {
  // Get the day (e.g., "Monday") from the URL parameters.
  const { day } = useParams();

  // Local state for the current user ID.
  const [userId, setUserId] = useState(null);

  // Local state for the weekly meal plan with subcategories for each day.
  // Default structure: each day is an object with Breakfast, Lunch, and Dinner arrays.
  const [mealPlan, setMealPlan] = useState({
    Monday: { Breakfast: [], Lunch: [], Dinner: [] },
    Tuesday: { Breakfast: [], Lunch: [], Dinner: [] },
    Wednesday: { Breakfast: [], Lunch: [], Dinner: [] },
    Thursday: { Breakfast: [], Lunch: [], Dinner: [] },
    Friday: { Breakfast: [], Lunch: [], Dinner: [] },
    Saturday: { Breakfast: [], Lunch: [], Dinner: [] },
    Sunday: { Breakfast: [], Lunch: [], Dinner: [] },
  });

  // Local state for unscheduled meals.
  // These represent the saved recipes available for selection.
  const [unscheduledMeals, setUnscheduledMeals] = useState([]);

  // Loading state for asynchronous operations.
  const [loading, setLoading] = useState(true);

  // Placeholder macros data for display.
  const [macros] = useState({
    cal: 2350,
    carbs: 95,
    fiber: 18,
    protein: 65,
    fat: 26,
  });

  // activeCategory tracks which subcategory (Breakfast, Lunch, or Dinner)
  // the user has selected to add a meal to.
  const [activeCategory, setActiveCategory] = useState(null);

  // 1) Listen for authentication state changes.
  // When a user is logged in, store their UID; if not, set loading to false.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2) Once we have a userId, load both the weekly plan and unscheduled meals.
  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      try {
        setLoading(true);
        // Fetch the entire weeklyMeals document from Firestore.
        const plan = await fetchWeeklyPlan(userId);
        if (plan) {
          // Merge the fetched plan with the default state.
          setMealPlan((prev) => ({
            ...prev,
            ...plan,
          }));
        }
        // Fetch the user's saved recipes (unscheduled meals).
        const recipes = await fetchSavedRecipes(userId);
        const recipesWithImages = await Promise.all(
          recipes.map(async (recipe) => ({
            ...recipe,
            // Convert stored image identifier into a full URL; use a placeholder if none.
            imageUrl: recipe.image_name
              ? await fetchImageUrl(recipe.image_name)
              : '/images/placeholder.jpg',
          }))
        );
        setUnscheduledMeals(recipesWithImages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  /**
   * handleAddMealToCategory:
   * Adds a meal from unscheduledMeals to the active category (e.g., Breakfast)
   * for the current day. It updates both local state and Firestore.
   * It also prevents duplicate entries.
   */
  const handleAddMealToCategory = async (meal, category) => {
    if (!day) return;
    const recipeId = meal.id;

    // Check for duplicate before updating local state.
    setMealPlan((prev) => {
      const currentMeals = prev[day][category] || [];
      if (currentMeals.includes(recipeId)) {
        // Already exists; do not add duplicate.
        return prev;
      }
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [category]: [...currentMeals, recipeId],
        },
      };
    });

    // Update Firestore using arrayUnion, which also prevents duplicates.
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`weeklyMeals.${day}.${category}`]: arrayUnion(recipeId),
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
    // Clear active category so the user exits "selection mode".
    setActiveCategory(null);
  };

  /**
   * handleRemoveMealFromCategory:
   * Removes a meal from a given category (by index) for the current day.
   * Updates both local state and Firestore.
   */
  const handleRemoveMealFromCategory = async (idx, category) => {
    if (!day) return;
    const recipeId = mealPlan[day][category][idx];

    // Update local state: remove the recipe ID from the specified category array.
    setMealPlan((prev) => {
      const updated = { ...prev };
      const newArr = [...updated[day][category]];
      newArr.splice(idx, 1);
      updated[day][category] = newArr;
      return updated;
    });

    // Update Firestore: remove the recipe ID using arrayRemove.
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`weeklyMeals.${day}.${category}`]: arrayRemove(recipeId),
      });
    } catch (error) {
      console.error('Error removing meal from Firestore:', error);
    }
  };

  // If no day is specified (should not happen), show an error.
  if (!day) {
    return <div>No day specified</div>;
  }

  // While loading data, display a loading indicator.
  if (loading) {
    return <div>Loading...</div>;
  }

  // Get the subcategories for the current day.
  // If not present, default to empty arrays.
  const subMealPlan = mealPlan[day] || { Breakfast: [], Lunch: [], Dinner: [] };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header: displays the current day */}
      <h1 className="text-xl font-bold text-gray-800 mb-2">{day}</h1>

      {/* Macros Row: displays placeholder nutritional values */}
      <div className="flex justify-between mb-4">
        {Object.entries(macros).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 font-semibold flex items-center justify-center">
              {value}
              {(key === 'carbs' || key === 'fiber' || key === 'protein' || key === 'fat') && (
                <span className="text-xs">g</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </p>
          </div>
        ))}
      </div>

      {/* Unscheduled Meals Section: these are the saved recipes that are available to add */}
      <section className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Unscheduled meals</h2>
          <button className="text-xs text-green-600 hover:underline">See all</button>
        </div>
        {/* If a category is active, prompt the user to select a meal to add */}
        {activeCategory && (
          <p className="mb-2 text-xs text-blue-600">
            Select a meal from unscheduled to add to <strong>{activeCategory}</strong>
          </p>
        )}
        <div className="flex overflow-x-auto space-x-4">
          {unscheduledMeals.map((recipe) => (
            <div
              key={recipe.id}
              className="min-w-[100px] flex-shrink-0 cursor-pointer"
              onClick={() => {
                // If a category is active, add the selected meal to that category.
                if (activeCategory) {
                  handleAddMealToCategory(recipe, activeCategory);
                }
              }}
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-20 object-cover rounded"
              />
              <p className="text-xs text-gray-700 mt-1">{recipe.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meal Categories Section: displays Breakfast, Lunch, Dinner */}
      {['Breakfast', 'Lunch', 'Dinner'].map((category) => {
        // For each category, retrieve the array of recipe IDs.
        const categoryMeals = subMealPlan[category] || [];
        return (
          <section key={category} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">{category}</h3>
              {/* When the plus button is clicked, set the active category to this category */}
              <button
                className="text-green-600 text-lg leading-none"
                onClick={() => setActiveCategory(category)}
              >
                +
              </button>
            </div>
            <div className="space-y-2">
              {categoryMeals.length > 0 ? (
                categoryMeals.map((recipeId, idx) => {
                  // Look up the recipe object by its ID from unscheduledMeals (or a global recipe list)
                  const recipe = unscheduledMeals.find((r) => r.id === recipeId);
                  if (!recipe) {
                    // If not found, display a placeholder with a Remove button.
                    return (
                      <div key={idx} className="border border-gray-200 rounded p-2">
                        <p className="text-xs text-gray-500">Recipe not found</p>
                        <button
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => handleRemoveMealFromCategory(idx, category)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  }
                  // Render each meal as a vertical (stacked) block.
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 border border-gray-200 rounded p-2"
                    >
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{recipe.title}</p>
                      </div>
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => handleRemoveMealFromCategory(idx, category)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400">No meals added</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default DailyPlan;
