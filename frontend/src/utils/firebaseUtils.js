import { doc, getDoc, updateDoc, arrayUnion, arrayRemove  } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { auth } from "../firebaseconfig";


// Fetch a Firestore document
export const fetchFirestoreDoc = async (collection, docId) => {
  try {
    const docRef = doc(db, collection, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error(`Document ${docId} not found in collection ${collection}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

// Update a Firestore document
export const updateFirestoreDoc = async (collection, docId, data) => {
  try {
    const docRef = doc(db, collection, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// Add an item to an array field in Firestore
export const addToFirestoreArray = async (collection, docId, field, value) => {
  try {
    const docRef = doc(db, collection, docId);
    await updateDoc(docRef, {
      [field]: arrayUnion(value),
    });
  } catch (error) {
    console.error("Error adding to array in Firestore:", error);
    throw error;
  }
};

export const removeFromFirestoreArray = async (collection, docId, field, value) => {
  try {
    const docRef = doc(db, collection, docId);
    await updateDoc(docRef, {
      [field]: arrayRemove(value),
    });
  } catch (error) {
    console.error("Error removing from array in Firestore:", error);
    throw error;
  }
};

// Listen for authentication state changes
export const onAuthStateChanged = (callback) => {
    return auth.onAuthStateChanged(callback);
  };
  
// Fetch saved recipes for a user
export const fetchSavedRecipes = async (userId) => {
    try {
      const userData = await fetchFirestoreDoc("users", userId);
      if (!userData || !userData.savedRecipes) {
        console.log("No saved recipes found for the user:", userId);
        return [];
      }
  
      const recipeIds = userData.savedRecipes;
      console.log("Recipe IDs fetched:", recipeIds);
  
      const recipePromises = recipeIds.map(async (recipeId) => {
        const recipeData = await fetchFirestoreDoc("recipes", recipeId);
        console.log(`Recipe data for ${recipeId}:`, recipeData);
        return recipeData ? { id: recipeId, ...recipeData } : null;
      });
  
      return (await Promise.all(recipePromises)).filter(Boolean); // Remove null/undefined recipes
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      throw error;
    }
  };

// Fetch user's shopping list
export const fetchUserShoppingList = async (userId) => {
    try {
      const userData = await fetchFirestoreDoc("users", userId);
      return userData?.shopping_list || {};
    } catch (error) {
      console.error("Error fetching user's shopping list:", error);
      throw error;
    }
  };

  // Fetch recipe details
export const fetchRecipeDetails = async (recipeId) => {
    try {
      return await fetchFirestoreDoc("recipes", recipeId);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      throw error;
    }
  };


// Get the currently authenticated user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen for authentication state changes
export const onAuthStateChangedListener = (callback) => {
  return auth.onAuthStateChanged(callback);
};


/**
 * Safely parse a Firestore field that looks like `"["5 minutes"]"` or `"["Easy"]"`.
 * 1) Remove the very outer quotes.
 * 2) Un-escape any `\"` inside.
 * 3) JSON-parse to get an array.
 * 4) Return the first element if it exists, else "N/A".
 */
export function parseSingleValue(rawValue) {
  try {
    let str = rawValue.trim();

    // If the entire field is wrapped in quotes, remove them:
    // e.g. `"["5 minutes"]"` -> `["5 minutes"]`
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1); // remove the outer quotes
    }

    // Now str might be: `[\"5 minutes\"]`
    // Un-escape any `\"` to `"` so we can JSON-parse:
    str = str.replace(/\\"/g, '"');

    // Now str might be: `["5 minutes"]`
    const arr = JSON.parse(str);

    if (Array.isArray(arr) && arr.length > 0) {
      return arr[0].trim();
    }
  } catch (err) {
    console.error("Error parsing single value:", err);
  }
  return "N/A";
}

/**
 * Parse a nutrition field that might look like `"["360 calories, 0g protein, 0g fats, 70g carbohydrates"]"`.
 * Steps:
 * 1) Remove outer quotes and un-escape internal quotes.
 * 2) JSON-parse to get an array (like `["360 calories, 0g protein, 0g fats, 70g carbohydrates"]`).
 * 3) Take the first element, split by commas to find calories, protein, fat, sugar.
 */
export function parseNutrition(rawValue) {
  // Default object in case something fails
  const nutritionObj = {
    calories: { value: 0, unit: "cal" },
    protein: { value: 0, unit: "g" },
    fat: { value: 0, unit: "g" },
    sugar: { value: 0, unit: "g" }
  };

  try {
    let str = rawValue.trim();
    // Remove outer quotes if present
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1);
    }
    // Un-escape internal quotes
    str = str.replace(/\\"/g, '"');
    // Now we expect a JSON string like:
    // ["2050 calories, 28g protein, 70g fats, 340g carbohydrates"]
    const arr = JSON.parse(str);

    if (Array.isArray(arr) && arr.length > 0) {
      const line = arr[0].trim().replace(/^"|"$/g, "");
      // Split by commas and process each part
      const parts = line.split(",").map(p => p.trim());
      parts.forEach(part => {
        const lower = part.toLowerCase();
        // Use regex to extract the numeric portion and the remaining text
        const match = part.match(/(\d+(?:\.\d+)?)(.*)/);
        if (match) {
          const num = parseFloat(match[1]);
          const unitText = match[2].trim().toLowerCase();
          if (lower.includes("calorie")) {
            nutritionObj.calories = { value: num, unit: "cal" };
          } else if (lower.includes("protein")) {
            nutritionObj.protein = { value: num, unit: "g" };
          } else if (lower.includes("fat")) {
            nutritionObj.fat = { value: num, unit: "g" };
          } else if (lower.includes("carb") || lower.includes("sugar")) {
            nutritionObj.sugar = { value: num, unit: "g" };
          }
        }
      });
    }
  } catch (err) {
    console.error("Error parsing nutrition:", err);
  }

  return nutritionObj;
}

/**
 * Parse a raw ingredients field that might look like:
 * `"["tequila, pineapple, lemon, sugar, orange bitters"]"`
 * Steps:
 * 1) Remove outer quotes, un-escape internal quotes.
 * 2) JSON-parse to get an array with a single string.
 * 3) Split that string by commas to get an array of ingredients.
 */
export function parseRawIngredients(rawValue) {
  try {
    let str = rawValue.trim();
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1);
    }
    str = str.replace(/\\"/g, '"');
    const arr = JSON.parse(str);
    if (Array.isArray(arr) && arr.length > 0) {
      const line = arr[0].trim().replace(/^"|"$/g, "");
      return line.split(",").map((ing) => ing.trim());
    }
  } catch (err) {
    console.error("Error parsing raw ingredients:", err);
  }
  return [];
}


/**
 * Example of the rawValue you might receive:
 *   "[\"1 cup (½ pint) cherry tomatoes, halved: $2.00\", \"1 tablespoon soy sauce: $0.10\", ...]"
 *
 * Steps to parse:
 *  1) Remove outer quotes if present (the entire string might be wrapped in quotes).
 *  2) Unescape internal quotes (\" -> ").
 *  3) JSON.parse to get an array of strings (one per ingredient).
 *  4) For each ingredient string, split or find the last ':' to separate name vs. cost.
 *  5) Convert the cost from e.g. '$2.00' to a float number (2.00).
 *  6) Accumulate total cost.
 */
export function parsePricedIngredients(rawValue) {
  let items = [];
  let totalCost = 0;

  try {
    let str = rawValue.trim();

    // Remove outer quotes if present
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1);
    }
    // Un-escape internal quotes
    str = str.replace(/\\"/g, '"');

    let arr;
    try {
      arr = JSON.parse(str);
    } catch (jsonError) {
      console.error("JSON parse error in parsePricedIngredients:", jsonError, "Raw value:", rawValue);
      // Fallback: attempt to split the string manually by commas before a quote
      arr = str.split(/,(?=\s*")/);
    }

    if (Array.isArray(arr)) {
      arr.forEach(entry => {
        const trimmed = entry.trim();
        // Find the last colon which should separate the ingredient from its cost
        const lastColonIndex = trimmed.lastIndexOf(':');
        if (lastColonIndex === -1) {
          // If no colon is found, use cost 0
          items.push({ name: trimmed, cost: 0 });
          return;
        }
        const namePart = trimmed.slice(0, lastColonIndex).trim();
        const costPart = trimmed.slice(lastColonIndex + 1).trim(); // e.g. "$2.00"
        let numericCost = 0;
        if (costPart.startsWith('$')) {
          numericCost = parseFloat(costPart.slice(1)) || 0;
        } else {
          numericCost = parseFloat(costPart) || 0;
        }
        items.push({ name: namePart, cost: numericCost });
        totalCost += numericCost;
      });
    }
  } catch (err) {
    console.error("Error parsing priced ingredients:", err);
  }

  return { items, totalCost };
}
