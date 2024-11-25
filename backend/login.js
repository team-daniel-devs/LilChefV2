const express = require('express');
const router = express.Router();
const admin = require('./firebaseAdmin'); // Ensure this points to the correct Firebase Admin SDK setup

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    console.log('Request body:', req.body); // Log the incoming request

    // Validate the input
    if (!email || !password) {
        console.log('Validation failed');
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the user exists
        const userRecord = await admin.auth().getUserByEmail(email);

        if (userRecord) {
            console.log(`User logged in successfully: ${userRecord.email}`);
            return res.status(200).json({
                message: 'Login successful',
                email: userRecord.email,
                uid: userRecord.uid,
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(401).json({
            message: 'Authentication failed',
            error: error.message,
        });
    }
});

module.exports = router;
