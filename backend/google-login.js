// google-login.js
const express = require('express');
const router = express.Router();
const { admin, firebaseAdminInitialized } = require('./firebaseAdmin');

// Ensure Firebase Admin is initialized
// firebaseAdminInitialized.catch(console.error);

firebaseAdminInitialized.then((adminInstance) => {
  admin = adminInstance;
  firestore = admin.firestore();
}).catch(console.error);

router.post('/', async (req, res) => {
  const { idToken } = req.body;

  // Validate the ID token in the request body
  if (!idToken || typeof idToken !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing idToken.' });
  }

  try {
    // Verify the Google ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    // Attempt to get the user record; if it doesn't exist, we return an error
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
      console.log(`Google user logged in successfully: ${userRecord.email}`);
    } catch (error) {
      console.error('User does not exist. Please register first.');
      return res.status(401).json({ message: 'User does not exist. Please register.' });
    }

    // Respond with user details if login is successful
    res.status(200).json({
      message: 'Google user logged in successfully',
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
});

module.exports = router;
