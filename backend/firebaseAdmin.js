const admin = require('firebase-admin');    // Import the Firebase Admin SDK
const serviceAccount = require('./firebaseServiceAccountKey.json');   // Import the service account key JSON file for Firebase

// Log a message to indicate the initialization process has started
console.log('Initializing Firebase Admin...');

// Check if Firebase Admin has already been initialized to prevent re-initialization
if (!admin.apps.length) {
    // Initialize Firebase Admin using the service account credentials
    admin.initializeApp({
        // Provide the credentials for the Firebase project
        credential: admin.credential.cert(serviceAccount),
        // Set the Firebase database URL based on the project ID from the service account
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    // Log a success message for the initialization
    console.log('Firebase Admin initialized successfully');
} else {
    // Log a message if Firebase Admin is already initialized
    console.log('Firebase Admin already initialized.');
}

// Export the Firebase Admin instance for use in other parts of the application
module.exports = admin;
