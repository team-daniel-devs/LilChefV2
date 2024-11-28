const express = require('express');    // Express for handling HTTP requests
const router = express.Router();      // Create a router instance for user-related routes
const admin = require('./firebaseAdmin'); // Firebase admin SDK
const firestore = admin.firestore(); // Access Firestore database through Firebase Admin SDK

// Define a POST route for user registration
router.post('/', async (req, res) => {
     // Extract first_name, email, and password from the request (sent from signup.js in thr frontend dir) body
    const { first_name, email, password } = req.body;


    // Log the incoming request body for debugging
    console.log('Request body:', req.body); // Log the incoming request

    // Validate the input
    if (!first_name || !email || !password) {
        console.log('Validation failed');
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Create a new user in Firebase Authentication
        console.log('Creating user in Firebase...');    // Log the creation process (debugging)
        const userRecord = await admin.auth().createUser({
            email,  // Set user's email
            password,   // Set user's password
            displayName: `${first_name}`, // Set user's display name(this doesnt work, i didnt bother to even remove it)
        });

        // Log the success of user creation(debugging)
        console.log('Successfully created new user:', userRecord.uid);

        // Create a corresponding document in Firestore (add the user to the users collection in firebase)
        console.log('Creating Firestore document...'); // Log Firestore creation process(debugging)
        await firestore.collection('users').doc(userRecord.uid).set({
            email: email,   // Store user's email
            firstName: first_name,   // Store user's first name
            savedRecipes: [], // Initialize an empty array for storing saved recipes
        });

        console.log('Successfully created Firestore document for user.');

        // Respond with a success message and the user's UID
        res.status(201).json({ message: 'User registered successfully!', uid: userRecord.uid });
    } catch (error) {
        // Handle any errors during the registration process
        console.error('Error creating new user:', error);
        res.status(500).json({ message: 'Failed to register user.', error: error.message }); // Provides the error details for further debugging 
    }
});

module.exports = router;
