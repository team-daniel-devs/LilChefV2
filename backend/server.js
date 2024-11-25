const express = require('express');
const cors = require('cors');
const { calculateMealPriceByRecipeId } = require('./mealPrice');
const registerRoute = require('./register');
const loginRoute = require('./login');
const googleSignInRoute = require('./google-signin');
const admin = require('./firebaseAdmin'); // Use your Firebase Admin initialization file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Node.js!');
});


app.get('/test-firestore', async (req, res) => {
  const db = admin.firestore();
  try {
      const testSnapshot = await db.collection('recipes').limit(1).get();
      const testData = testSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Test Firestore Data:", testData);
      res.json(testData);
  } catch (error) {
      console.error("Firestore test failed:", error.message);
      res.status(500).json({ error: "Firestore access failed", details: error.message });
  }
});



// Meal price calculation endpoint
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
