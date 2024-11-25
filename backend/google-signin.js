const express = require('express');
const router = express.Router();
const admin = require('./firebaseAdmin'); 

router.post('/', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing idToken.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, uid } = decodedToken;
    
        // Check if the user exists in Firebase
        let userRecord;
        try {
            userRecord = await admin.auth().getUser(uid);
            console.log(`User already exists: ${userRecord.email}`);
        } catch (error) {
            // If user does not exist, create them
            console.log('User does not exist. Creating a new one...');
            userRecord = await admin.auth().createUser({
                uid,
                email,
                displayName: name || '',
            });
        }
    
        res.status(200).json({
            message: 'Google user signed in successfully',
            uid: userRecord.uid,
            email: userRecord.email,
        });
    } catch (error) {
        console.error('Error verifying Google ID token:', error);
        res.status(401).json({ message: 'Invalid token', error: error.message });
    }
    
});


module.exports = router;