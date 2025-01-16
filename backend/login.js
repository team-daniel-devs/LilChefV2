const express = require('express');   // Express for handling HTTP requests
const router = express.Router();      // Create a router instance for handling routes
const {admin, firebaseAdminInitialized} = require('./firebaseAdmin'); // Firebase Admin SDK setup 


// Wait for Firebase Admin to be initialized before using Firestore
firebaseAdminInitialized.catch(error => {
    console.error('Failed to initialize Firebase Admin:', error);
  });

// Define a POST route for user login
router.post('/', async (req, res) => {
    await firebaseAdminInitialized;

    // Extract email and password from the request body(sent from the login.js in the frontend dir)
    const { email, password } = req.body;

    // Log the incoming request body for debugging
    console.log('Request body:', req.body); // Log the incoming request

    // Validate the input
    if (!email || !password) {
        // If either email or password is missing, respond with a 400 Bad Request status
        console.log('Validation failed');
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Attempt to fetch the user by email from Firebase Authentication
        const userRecord = await admin.auth().getUserByEmail(email);

        // If the user exists, log success and respond with their details
        if (userRecord) {
            console.log(`User logged in successfully: ${userRecord.email}`);
            return res.status(200).json({
                message: 'Login successful',
                email: userRecord.email, // User email
                uid: userRecord.uid,   // User unique ID
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        // Handle errors that occur during login
        console.error('Error during login:', error.message);
        return res.status(401).json({
            message: 'Authentication failed',
            error: error.message, // Provides the error message for debugging
        });
    }
});

module.exports = router;
