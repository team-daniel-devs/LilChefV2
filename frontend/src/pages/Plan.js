import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { onAuthStateChanged, fetchSavedRecipes } from '../utils/firebaseUtils'; 
import { fetchImageUrl } from '../utils/imageUtils'; 
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { Link } from 'react-router-dom';

/**
 * Initialize the user's weekly plan in Firestore if not present.
 */
async function initializeWeeklyPlan(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // If the user doc doesn't exist at all, you might create it
    // But presumably, your user doc already exists if they have email, etc.
    return;
  }

  const data = snap.data();
  // If 'weeklyMeals' doesn't exist, create it with empty arrays
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
 * Fetch the user's weekly meal plan (the `weeklyMeals` field) from Firestore.
 */
async function fetchWeeklyPlan(userId) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  return data.weeklyMeals || null;
}

const Plan = () => {
  const [selectedDateRange] = useState('Nov 25 - Dec 1');

  // Weekly meal plan: each day is an array of RECIPE IDs
  const [mealPlan, setMealPlan] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  // "My Recipes" from Firebase (saved by the user), containing { id, title, imageUrl, ... }
  const [myRecipes, setMyRecipes] = useState([]);
  // Track which day we're adding a recipe to
  const [dayToAddTo, setDayToAddTo] = useState(null);

  // State for user ID and loading status
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define the days in the order to be displayed
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // 1) Listen for the currently logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        // Initialize weekly plan if needed
        await initializeWeeklyPlan(user.uid);
      } else {
        setUserId(null);
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

  // 2) Once we have userId, fetch the user's weekly plan
  useEffect(() => {
    if (!userId) return;

    async function loadPlan() {
      const plan = await fetchWeeklyPlan(userId);
      if (plan) setMealPlan(plan);
    }

    loadPlan();
  }, [userId]);

  // 3) Fetch the saved recipes from Firebase
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserRecipes = async () => {
      try {
        setLoading(true);
        const recipes = await fetchSavedRecipes(userId);
        // For each recipe, fetch the image URL (or use a placeholder)
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
   * Handler: user chooses a day (e.g., Monday) to add a meal to.
   */
  const handleAddMealClick = (day) => {
    setDayToAddTo(day);
  };

  /**
   * Handler: add a selected recipe from "My Recipes" to the chosen day in local state
   * AND update Firestore using arrayUnion (storing ONLY the recipe ID).
   */
  const handleAddRecipeToDay = async (recipe) => {
    if (!dayToAddTo) return;

    // We'll store just the recipe's ID in Firestore
    const recipeId = recipe.id;

    // 1) Update local state
    setMealPlan((prev) => ({
      ...prev,
      [dayToAddTo]: [...prev[dayToAddTo], recipeId],
    }));

    // 2) Update Firestore
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`weeklyMeals.${dayToAddTo}`]: arrayUnion(recipeId),
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }

    setDayToAddTo(null);
  };

  /**
   * Handler: remove a recipe ID from a day in local state AND from Firestore.
   */
  const handleRemoveMeal = async (day, idx) => {
    // 1) Identify which recipe ID we're removing
    const recipeId = mealPlan[day][idx];

    // 2) Update local state
    setMealPlan((prev) => {
      const updatedDay = [...prev[day]];
      updatedDay.splice(idx, 1);
      return { ...prev, [day]: updatedDay };
    });

    // 3) Update Firestore
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`weeklyMeals.${day}`]: arrayRemove(recipeId),
      });
    } catch (error) {
      console.error('Error removing recipe from Firestore:', error);
    }
  };

  // Render the My Recipes section based on loading or empty state
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
      {/* Header */}
      <header className="mb-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl font-semibold text-gray-800">Meal Planner</h1>
          <p className="text-sm text-gray-500">{selectedDateRange}</p>
        </div>
      </header>

      {/* My Recipes Section (same as old plan.js) */}
      <section className="bg-white rounded shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-gray-800">My recipes</h3>
          <button className="text-sm text-green-600 hover:underline">See all</button>
        </div>
        {myRecipesSection}
      </section>

      {/* Day list: clicking a day navigates to the new DailyPlan page */}
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