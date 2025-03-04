const express = require('express');
const router = express.Router();
const { admin, firebaseAdminInitialized } = require('./firebaseAdmin'); 
let firestore;

// Initialize Firestore from the Admin instance once it’s ready
firebaseAdminInitialized.then((adminInstance) => {
  firestore = adminInstance.firestore();
}).catch(console.error);

router.post('/', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken || typeof idToken !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing idToken.' });
  }

  try {
    // Verify the Google ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;
    
    let userRecord;
    try {
      // Check if the user already exists
      userRecord = await admin.auth().getUser(uid);
      console.log(`User already exists: ${userRecord.email}`);
    } catch (error) {
      // If user does not exist, create a new one
      console.log('User does not exist. Creating a new one...');
      userRecord = await admin.auth().createUser({
        uid,
        email,
        displayName: name || '',
      });
    }

    // **Extra Step:** Ensure a Firestore document exists for the user.
    const userDocRef = firestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      await userDocRef.set({
        email: email,
        firstName: name || '',
        savedRecipes: [],
      });
      console.log('Successfully created Firestore document for user.');
    } else {
      console.log('Firestore document for user already exists.');
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
