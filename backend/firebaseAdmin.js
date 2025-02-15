const admin = require('firebase-admin');    // Import the Firebase Admin SDK
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager'); // Import the Secret Manager client library
const express = require('express');
const { firebaseAdminInitialized } = require('./firebaseAdmin');

// Uncomment this block for production to use Secret Manager
// -----------------------------------------------------------
// const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
// 
// // Production: Retrieve service account via Secret Manager
// async function getFirebaseServiceAccountKey() {
//   try {
//     const client = new SecretManagerServiceClient();
//     const [version] = await client.accessSecretVersion({
//       name: 'projects/cookaing-da7d0/secrets/firebase-service-account-key/versions/latest'
//     });
// 
//     if (!version || !version.payload || !version.payload.data) {
//       console.error('Error retrieving secret version');
//       return null;
//     }
// 
//     const credentials = JSON.parse(version.payload.data.toString('utf8'));
//     
//     // Fix formatting of the secret key (replace escaped newlines)
//     credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
//     
//     if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
//       console.error('Error parsing secret data');
//       return null;
//     }
// 
//     console.log('Successfully retrieved and parsed secret data');
//     return credentials;
// 
//   } catch (error) {
//     console.error('Error retrieving secret:', error);
//     return null;
//   }
// }
// 
// async function initializeFirebaseAdminProduction() {
//   if (admin.apps.length) {
//     return admin;
//   }
// 
//   try {
//     const serviceAccount = await getFirebaseServiceAccountKey();
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount)
//     });
//     console.log('Firebase Admin initialized successfully (Production)');
//     return admin;
//   } catch (error) {
//     console.error('Error initializing Firebase Admin:', error);
//     throw error;
//   }
// }
// 
// // For production, you would export like this:
// // const adminPromise = initializeFirebaseAdminProduction();
// // module.exports = {
// //   admin,
// //   firebaseAdminInitialized: adminPromise
// // };
// 
// -----------------------------------------------------------

// Local Development: Use the locally stored service account JSON file
// -------------------------------------------------------------------
const serviceAccount = require('./firebaseServiceAccountKey.json'); // Local credentials file

console.log('Initializing Firebase Admin locally...');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('Firebase Admin initialized successfully (Local)');

// Export the admin instance for local development
module.exports = admin;

// -------------------------------------------------------------------
// To switch between production and local development:
// - For local development: Use the code above (import the JSON file)
// - For production: Comment out the local section and uncomment the production block
//   (or use an environment variable to toggle between them)

// // Check if Firebase Admin has already been initialized to prevent re-initialization
// if (!admin.apps.length) {
//     // Initialize Firebase Admin using the service account credentials
//     admin.initializeApp({
//         // Provide the credentials for the Firebase project
//         credential: admin.credential.cert(serviceAccount),
//         // Set the Firebase database URL based on the project ID from the service account
//         databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
//     });
//     // Log a success message for the initialization
//     console.log('Firebase Admin initialized successfully');
// } else {
//     // Log a message if Firebase Admin is already initialized
//     console.log('Firebase Admin already initialized.');
// }

// // Export the Firebase Admin instance for use in other parts of the application
// module.exports = admin;
