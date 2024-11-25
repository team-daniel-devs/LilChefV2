const express = require('express');
const router = express.Router();
const admin = require('./firebaseAdmin'); 

router.post('/', async (req, res) => {
    const { first_name, email, password } = req.body;

    console.log('Request body:', req.body); // Log the incoming request

    // Validate the input
    if (!first_name || !email || !password) {
        console.log('Validation failed');
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Create a new user in Firebase Authentication
        console.log('Creating user in Firebase...');
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: `${first_name}`,
        });

        console.log('Successfully created new user:', userRecord.uid);

        res.status(201).json({ message: 'User registered successfully!', uid: userRecord.uid });
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ message: 'Failed to register user.', error: error.message });
    }
});

module.exports = router;
