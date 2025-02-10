const admin = require('firebase-admin');    // Import the Firebase Admin SDK
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager'); // Import the Secret Manager client library
const express = require('express');
const { firebaseAdminInitialized } = require('./firebaseAdmin');

// const serviceAccount = require('./firebaseServiceAccountKey.json');   // Import the service account key JSON file for Firebase

// Log a message to indicate the initialization process has started
console.log('Initializing Firebase Admin...');


// Create a new Secret Manager client
async function getFirebaseServiceAccountKey() {
    try{
        const client = new SecretManagerServiceClient();
        const [version] = await client.accessSecretVersion({
            name: 'projects/cookaing-da7d0/secrets/firebase-service-account-key/versions/latest'
        });

        if (!version || !version.payload || !version.payload.data) {
            console.error('Error retrieving secret version');
            return null;
        }

        const credentials =  JSON.parse(version.payload.data.toString('utf8'));
        
        //fix formatting of the secret key
        console.log(credentials);
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
            console.error('Error parsing secret data');
            return null;
        }
        console.log('Successfully retrieved and parsed secret data');
        return credentials;

    } catch (error) {
        console.error('Error retrieving secret:', error);
        return null;
    }
}

async function initializeFirebaseAdmin() {
    if (admin.apps.length) {
        return admin;
    }

    try {
        const serviceAccount = await getFirebaseServiceAccountKey();
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully');
        return admin;
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
        throw error;
    }
}


const adminPromise = initializeFirebaseAdmin();

module.exports = {
    admin,
    firebaseAdminInitialized: adminPromise
};

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
