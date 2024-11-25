const axios = require("axios");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require('./firebaseAdmin');
const db = admin.firestore();
require('dotenv').config();


const apiKey = process.env.API_KEY;



// Fetch ingredient details
async function getIngredientDetails(client, ingredientId, amount) {
  try {
    const url = `https://api.spoonacular.com/food/ingredients/${ingredientId}/information`;
    const params = { amount, apiKey };
    const response = await client.get(url, { params });
    const ingredientData = response.data;

    const priceInCents = ingredientData.estimatedCost ? ingredientData.estimatedCost.value : null;
    const priceInDollars = priceInCents ? (priceInCents / 100 * 1.35).toFixed(2) : "Not Available";

    return { name: ingredientData.name, price: priceInDollars };
  } catch (error) {
    return { error: `Error retrieving details for ingredient ID ${ingredientId}: ${error.message}` };
  }
}

// Calculate prices for a list of ingredients
async function calculateIngredientPrices(ingredients) {
  const client = axios.create();
  const results = [];

  for (const ingredient of ingredients) {
    console.log("Calculating price for ingredient:", ingredient);

    try {
      const url = "https://api.spoonacular.com/food/ingredients/search";
      const params = { query: ingredient.name, apiKey };
      const response = await client.get(url, { params });

      console.log("Search Results for", ingredient.name, ":", response.data.results);

      if (response.data.results.length > 0) {
        const ingredientId = response.data.results[0].id;
        const detail = await getIngredientDetails(client, ingredientId, ingredient.amount);
        console.log("Price Details for", ingredient.name, ":", detail);
        results.push(detail);
      } else {
        console.warn(`No results found for ingredient: ${ingredient.name}`);
        results.push({ name: ingredient.name, error: "No results found" });
      }
    } catch (error) {
      console.error(`Error during price calculation for ingredient ${ingredient.name}:`, error.message);
      results.push({ name: ingredient.name, error: error.message });
    }
  }

  return results;
}


async function getRecipeIngredients(recipeId) {
  const db = getFirestore();
  console.log(`Fetching recipe with ID: ${recipeId}`); // Log recipe ID
  const recipeDoc = await db.collection("recipes").doc(recipeId).get();

  if (!recipeDoc.exists) {
    console.error(`Recipe with ID ${recipeId} not found`);
    throw new Error(`Recipe with ID ${recipeId} not found`);
  }

  const recipeData = recipeDoc.data();
  console.log("Raw ingredients from Firestore:", recipeData.ingredients);

  let ingredients = recipeData.ingredients || [];
  if (typeof ingredients === "string") {
    try {
      ingredients = JSON.parse(ingredients.replace(/'/g, '"')); // Replace single quotes with double quotes and parse
    } catch (error) {
      console.error("Failed to parse ingredients:", error.message);
      throw new Error("Invalid ingredient format in database");
    }
  }

  console.log("Parsed ingredients:", ingredients);

  // Simplify ingredient names
  return ingredients.map((ingredient) => {
    const cleanedName = ingredient
      .replace(/^\d+([/.\d\s]*)?\s*/, "") // Remove quantity at the start
      .replace(/\(.*?\)/g, "") // Remove content in parentheses
      .replace(/finely|chopped|teaspoon|tablespoon|pound|ounce|large|small|ground|salted|unsalted|crushed|diced|sliced/gi, "") // Remove descriptive words
      .trim();

    const split = ingredient.split(" ");
    const amount = parseFloat(split[0]) || 1; // Extract amount (default to 1 if not a number)

    return { name: cleanedName, amount };
  });
}




// Calculate meal price by recipe ID
async function calculateMealPriceByRecipeId(recipeId) {
  const ingredients = await getRecipeIngredients(recipeId);
  const prices = await calculateIngredientPrices(ingredients);

  const totalCost = prices.reduce((sum, ingredient) => {
    const price = parseFloat(ingredient.price) || 0;
    return sum + price;
  }, 0);

  return { ingredients: prices, totalCost: totalCost.toFixed(2) };
}


module.exports = { calculateMealPriceByRecipeId };
