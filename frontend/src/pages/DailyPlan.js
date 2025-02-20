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
 * Fetch the entire weeklyMeals doc, which should have 
 * { Monday: {Breakfast:[], Lunch:[], Dinner:[]}, Tuesday: {...}, ... } 
 */
async function fetchWeeklyPlan(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.weeklyMeals || null;
}

const DailyPlan = () => {
  // e.g. "Monday"
  const { day } = useParams();
  const [userId, setUserId] = useState(null);
  // Local mealPlan with subcategories per day
  const [mealPlan, setMealPlan] = useState({
    Monday: { Breakfast: [], Lunch: [], Dinner: [] },
    Tuesday: { Breakfast: [], Lunch: [], Dinner: [] },
    Wednesday: { Breakfast: [], Lunch: [], Dinner: [] },
    Thursday: { Breakfast: [], Lunch: [], Dinner: [] },
    Friday: { Breakfast: [], Lunch: [], Dinner: [] },
    Saturday: { Breakfast: [], Lunch: [], Dinner: [] },
    Sunday: { Breakfast: [], Lunch: [], Dinner: [] },
  });
  // Unscheduled meals (like your myRecipes)
  const [unscheduledMeals, setUnscheduledMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Placeholder macros (as placeholders)
  const [macros] = useState({
    cal: 2350,
    carbs: 95,
    fiber: 18,
    protein: 65,
    fat: 26,
  });

  // Local categories (Breakfast, Lunch, Dinner) are in mealPlan[day]
  // activeCategory tracks which category the user is adding to
  const [activeCategory, setActiveCategory] = useState(null);

  // 1) Listen for user
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

  // 2) Once we have userId, fetch weeklyMeals & unscheduledMeals
  useEffect(() => {
    if (!userId) return;
    async function loadData() {
      try {
        setLoading(true);
        const plan = await fetchWeeklyPlan(userId);
        if (plan) {
          setMealPlan((prev) => ({
            ...prev,
            ...plan,
          }));
        }
        const recipes = await fetchSavedRecipes(userId);
        const recipesWithImages = await Promise.all(
          recipes.map(async (recipe) => ({
            ...recipe,
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

  // Handler: add a meal from unscheduledMeals to the active category for this day.
  const handleAddMealToCategory = async (meal, category) => {
    if (!day) return;
    const recipeId = meal.id;
  
    // Use functional update to ensure we have the latest state
    setMealPlan((prev) => {
      const currentMeals = prev[day][category] || [];
      if (currentMeals.includes(recipeId)) {
        // Already added, so do nothing.
        return prev;
      }
      // Otherwise, add the recipe ID
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [category]: [...currentMeals, recipeId],
        },
      };
    });
  
    // Update Firestore (arrayUnion prevents duplicates in Firestore)
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`weeklyMeals.${day}.${category}`]: arrayUnion(recipeId),
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
    // Clear active category
    setActiveCategory(null);
  };
  

  // Handler: remove a meal from a subcategory
  const handleRemoveMealFromCategory = async (idx, category) => {
    if (!day) return;
    const recipeId = mealPlan[day][category][idx];

    // 1) Update local state
    setMealPlan((prev) => {
      const updated = { ...prev };
      const newArr = [...updated[day][category]];
      newArr.splice(idx, 1);
      updated[day][category] = newArr;
      return updated;
    });

    // 2) Update Firestore
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`weeklyMeals.${day}.${category}`]: arrayRemove(recipeId),
      });
    } catch (error) {
      console.error('Error removing meal from Firestore:', error);
    }
  };

  if (!day) {
    return <div>No day specified</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // subMealPlan: the object for the current day (Breakfast, Lunch, Dinner)
  const subMealPlan = mealPlan[day] || { Breakfast: [], Lunch: [], Dinner: [] };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-800 mb-2">{day}</h1>

      {/* Macros Row */}
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

      {/* Unscheduled Meals (like My Recipes in Plan.js) */}
      <section className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Unscheduled meals</h2>
          <button className="text-xs text-green-600 hover:underline">See all</button>
        </div>
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
                // If an active category is set, add the recipe to that category.
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

      {/* Meal Categories */}
      {['Breakfast', 'Lunch', 'Dinner'].map((category) => {
        const categoryMeals = subMealPlan[category] || [];
        return (
          <section key={category} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">{category}</h3>
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
                  // Look up the recipe info from unscheduledMeals (or allRecipes)
                  const recipe = unscheduledMeals.find((r) => r.id === recipeId);
                  if (!recipe) {
                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded p-2"
                      >
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
