// firebase.js
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  update,
  remove,
  get,
} from "firebase/database";

// Firebase configuration - Replace with your actual Firebase project details
const firebaseConfig = {
    apiKey: "AIzaSyAGLuRqrPutW83izLOcGwY5drPSo3aNV10",
    authDomain: "cookaing-da7d0.firebaseapp.com",
    databaseURL: "https://cookaing-da7d0-default-rtdb.firebaseio.com",
    projectId: "cookaing-da7d0",
    storageBucket: "cookaing-da7d0.firebasestorage.app",
    messagingSenderId: "114118808176",
    appId: "1:114118808176:web:e93a1c6c64436bfa769ab5",
    measurementId: "G-J150VYMM41"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Helper functions for interacting with Firebase Realtime Database

/**
 * Add new data to a specified path
 * @param {string} path - Path in the database (e.g., 'users/')
 * @param {object} data - Data to be added
 * @returns {Promise}
 */
export const addData = (path, data) => {
  const dataRef = push(ref(database, path));
  return set(dataRef, data);
};

/**
 * Get data from a specified path in real-time
 * @param {string} path - Path in the database (e.g., 'users/')
 * @param {function} callback - Function to handle data changes
 */
export const getData = (path, callback) => {
  const dataRef = ref(database, path);
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

/**
 * Update existing data at a specified path
 * @param {string} path - Path in the database (e.g., 'users/user1')
 * @param {object} newData - Data to update
 * @returns {Promise}
 */
export const updateData = (path, newData) => {
  const dataRef = ref(database, path);
  return update(dataRef, newData);
};

/**
 * Delete data from a specified path
 * @param {string} path - Path in the database (e.g., 'users/user1')
 * @returns {Promise}
 */
export const deleteData = (path) => {
  const dataRef = ref(database, path);
  return remove(dataRef);
};


// Add email to the betaTesters array
export const addEmailToArray = async (path, email) => {
  const dataRef = ref(database, path);

  try {
    // Get the current data
    const snapshot = await get(dataRef);
    const currentData = snapshot.val();

    // Ensure currentData is an array or initialize it as one
    const updatedData = Array.isArray(currentData) ? [...currentData, email] : [email];

    // Update the database
    await set(dataRef, updatedData);

    console.log("Email added to the array successfully!");
  } catch (error) {
    console.error("Error adding email to the array:", error);
  }
};


export default database;
