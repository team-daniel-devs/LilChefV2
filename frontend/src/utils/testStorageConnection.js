import { getStorage, ref, getDownloadURL } from "firebase/storage";

const testStorageConnection = async () => {
  try {
    const storage = getStorage(); // Initialize Firebase Storage
    const testRef = ref(storage, "Recipe_Pictures/-bloody-mary-tomato-toast-with-celery-and-horseradish-56389813.jpg"); // Reference a test file in your storage

    // Attempt to get the download URL for the file
    const url = await getDownloadURL(testRef);
    console.log("Connection successful! File URL:", url);
  } catch (error) {
    console.error("Error connecting to Firebase Storage:", error);
  }
};

// Export the function
export default testStorageConnection;
