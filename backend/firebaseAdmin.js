const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccountKey.json'); 

console.log('Initializing Firebase Admin...');

// Check if Firebase has already been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('Firebase Admin initialized successfully');
} else {
    console.log('Firebase Admin already initialized.');
}

console.log('Firebase Admin initialized successfully');

module.exports = admin;
