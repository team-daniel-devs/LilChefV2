import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
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
