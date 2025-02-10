const express = require('express');   // Express for handling HTTP requests
const router = express.Router();      // Create a router instance for handling routes
const {getAdmin, firebaseAdminInitialized} = require('./firebaseAdmin');

let admin;
let firestore;

firebaseAdminInitialized.then((adminInstance) => {
    admin = adminInstance;
    firestore = admin.firestore();
}).catch(console.error);

// Define a POST route for user login
router.post('/', async (req, res) => {
    try{
        const admin = await firebaseAdminInitialized;
        const {email, password} = req.body;
        console.log('Request body:', req.body);

        if (!email || !password) {
            console.log('Validation failed');
            return res.status(400).json({ message: 'All fields are required.' });
        }

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
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Failed to login user.', error: error.message });
    }
});

module.exports = router;
