import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, fetchSavedRecipes } from '../utils/firebaseUtils';
import { fetchImageUrl } from '../utils/imageUtils';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { Link } from 'react-router-dom';

/**
 * initializeWeeklyPlan:
 * Checks if the user's document has a 'weeklyMeals' field.
 * If not, it updates the document to create a structure with empty subcategory objects for each day.
 */
async function initializeWeeklyPlan(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // If the user document doesn't exist, we simply return.
    return;
  }

  const data = snap.data();
  // If 'weeklyMeals' is missing, create it with an object for each day containing Breakfast, Lunch, and Dinner arrays.
  if (!data.weeklyMeals) {
    await updateDoc(userRef, {
      weeklyMeals: {
        Monday: { Breakfast: [], Lunch: [], Dinner: [] },
        Tuesday: { Breakfast: [], Lunch: [], Dinner: [] },
        Wednesday: { Breakfast: [], Lunch: [], Dinner: [] },
        Thursday: { Breakfast: [], Lunch: [], Dinner: [] },
        Friday: { Breakfast: [], Lunch: [], Dinner: [] },
        Saturday: { Breakfast: [], Lunch: [], Dinner: [] },
        Sunday: { Breakfast: [], Lunch: [], Dinner: [] },
      },
    });
  }
}

/**
 * fetchWeeklyPlan:
 * Retrieves the user's 'weeklyMeals' field from Firestore.
 * Expected structure: an object with keys for each day.
 */
async function fetchWeeklyPlan(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.weeklyMeals || null;
}

const Plan = () => {
  

  // Local state for the weekly meal plan.
  // Here, each day is initially represented as an empty array,
  // but later the fetched document might have subcategory objects.
  const [mealPlan, setMealPlan] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  // Local state for "My Recipes" (saved recipes from Firestore)
  const [myRecipes, setMyRecipes] = useState([]);
  // dayToAddTo tracks which day is currently selected for adding a recipe.
  // NOTE: In this new design, the day is selected via the day list links, so this function may be unused.
  const [dayToAddTo, setDayToAddTo] = useState(null);

  // Local state for the authenticated user ID and loading status.
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define the order in which days should be displayed.
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // 1) Listen for authentication changes.
  // When the user logs in, store their UID and initialize the weekly plan if needed.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        await initializeWeeklyPlan(user.uid);
      } else {
        setUserId(null);
        // Clear saved recipes and mealPlan if the user logs out.
        setMyRecipes([]);
        setMealPlan({
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        });
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2) Once a user is logged in, fetch the user's weekly meal plan from Firestore.
  useEffect(() => {
    if (!userId) return;

    async function loadPlan() {
      const plan = await fetchWeeklyPlan(userId);
      if (plan) setMealPlan(plan);
    }
    loadPlan();
  }, [userId]);

  // 3) Fetch the user's saved recipes from Firestore.
  // For each recipe, retrieve the full image URL or a placeholder.
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchUserRecipes = async () => {
      try {
        setLoading(true);
        const recipes = await fetchSavedRecipes(userId);
        const recipesWithImages = await Promise.all(
          recipes.map(async (recipe) => ({
            ...recipe,
            imageUrl: recipe.image_name
              ? await fetchImageUrl(recipe.image_name)
              : '/images/placeholder.jpg',
          }))
        );
        setMyRecipes(recipesWithImages);
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRecipes();
  }, [userId]);

  /**
   * handleAddMealClick:
   * Sets which day is selected for adding a recipe.
   * (This function may not be used if you navigate to the daily plan page via links.)
   */
  const handleAddMealClick = (day) => {
    setDayToAddTo(day);
  };

  /**
   * handleAddRecipeToDay:
   * Adds the selected recipe from "My Recipes" to the specified day.
   * It updates both local state and Firestore by storing only the recipe ID.
   */
  const handleAddRecipeToDay = async (recipe) => {
    if (!dayToAddTo) return; // Only proceed if a day is selected.
    const recipeId = recipe.id;
    // 1) Update local state: add recipeId to the array for the selected day.
    setMealPlan((prev) => ({
      ...prev,
      [dayToAddTo]: [...prev[dayToAddTo], recipeId],
    }));
    // 2) Update Firestore: add recipeId to the weeklyMeals for that day using arrayUnion.
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`weeklyMeals.${dayToAddTo}`]: arrayUnion(recipeId),
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
    // Clear the selected day once added.
    setDayToAddTo(null);
  };

  /**
   * handleRemoveMeal:
   * Removes a recipe ID from the specified day in both local state and Firestore.
   */
  const handleRemoveMeal = async (day, idx) => {
    const recipeId = mealPlan[day][idx];
    // Update local state: remove the recipe ID from the day's array.
    setMealPlan((prev) => {
      const updatedDay = [...prev[day]];
      updatedDay.splice(idx, 1);
      return { ...prev, [day]: updatedDay };
    });
    // Update Firestore: remove the recipe ID using arrayRemove.
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`weeklyMeals.${day}`]: arrayRemove(recipeId),
      });
    } catch (error) {
      console.error('Error removing recipe from Firestore:', error);
    }
  };

  // Render "My Recipes" section based on loading state and available recipes.
  let myRecipesSection;
  if (loading) {
    myRecipesSection = (
      <p className="text-sm text-gray-500">Loading your saved recipes...</p>
    );
  } else if (!myRecipes.length) {
    myRecipesSection = (
      <p className="text-sm text-gray-500">No saved recipes found.</p>
    );
  } else {
    myRecipesSection = (
      <div className="flex overflow-x-auto space-x-4">
        {myRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className={`min-w-[120px] border rounded p-2 flex-shrink-0 cursor-pointer ${
              dayToAddTo ? 'border-pink-400' : 'border-gray-200'
            }`}
            onClick={() => handleAddRecipeToDay(recipe)}
          >
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-24 object-cover rounded mb-2"
            />
            <p className="text-sm font-medium text-gray-700">{recipe.title}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header section */}
      <header className="mb-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl font-semibold text-gray-800">Meal Planner</h1>
          
        </div>
      </header>

      {/* My Recipes Section */}
      <section className="bg-white rounded shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-gray-800">My recipes</h3>
          <button className="text-sm text-green-600 hover:underline">See all</button>
        </div>
        {myRecipesSection}
      </section>

      {/* Day list section: Clicking a day navigates to the DailyPlan page */}
      <section className="bg-white rounded shadow p-4">
        <ul className="space-y-3">
          {dayOrder.map((day) => (
            <li
              key={day}
              className="border-b border-gray-200 last:border-b-0 pb-2"
            >
              <Link
                to={`/daily/${day}`}
                className="w-full text-left text-gray-700 font-medium flex items-center justify-between"
              >
                {day}
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Plan;
