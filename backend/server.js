const express = require('express');
const cors = require('cors');
const { calculateMealPriceByRecipeId } = require('./mealPrice');
const registerRoute = require('./register');
const loginRoute = require('./login');
const googleSignInRoute = require('./google-signin');
// const admin = require('./firebaseAdmin'); // Use your Firebase Admin initialization file
const { admin, firebaseAdminInitialized } = require('./firebaseAdmin'); // Use your Firebase Admin initialization file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Node.js!');
});


// Meal price calculation endpoint (ignore this one for now)
app.get("/meal-price/:recipeId", async (req, res) => {
  const { recipeId } = req.params;

  try {
    console.log("Fetching meal price for recipe ID:", recipeId);
    const mealPrice = await calculateMealPriceByRecipeId(recipeId);
    res.json(mealPrice);
  } catch (error) {
    console.error("Error fetching meal price:", error.message);
    res.status(500).json({ error: `Failed to calculate meal price: ${error.message}` });
  }
});

// Authentication routes
app.use('/register', registerRoute);
app.use('/google-signin', googleSignInRoute);
app.use('/login', loginRoute);

firebaseAdminInitialized.then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize Firebase Admin:', error);
});
