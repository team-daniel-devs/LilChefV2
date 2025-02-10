const express = require('express');    // Express for handling HTTP requests
const router = express.Router();      // Create a router instance for user-related routes
// const firestore = admin.firestore(); // Access Firestore database through Firebase Admin SDK
const {getAdmin, firebaseAdminInitialized} = require('./firebaseAdmin');
const firebaseAdmin = require('./firebaseAdmin');

let admin;
let firestore;

firebaseAdminInitialized.then((adminInstance) => {
    admin = adminInstance;
    firestore = admin.firestore();
}).catch(console.error);

// Define a POST route for user registration
router.post('/', async (req, res) => {
    try {
        const admin = await firebaseAdminInitialized;
        const {first_name, email, password} = req.body;
        console.log('Request body:', req.body);

        if (!first_name || !email || !password) {
            console.log('Validation failed');
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: `${first_name}`,
        });

        console.log('Successfully created new user:', userRecord.uid);

        await firestore.collection('users').doc(userRecord.uid).set({
            email: email,
            firstName: first_name,
            savedRecipes: [],
        });

        console.log('Successfully created Firestore document for user.');
        res.status(201).json({
            message: 'User registered successfully!',
            uid: userRecord.uid
        });
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ message: 'Failed to register user.', error: error.message });    // Provides the error details for further debugging
    }
});

module.exports = router;
