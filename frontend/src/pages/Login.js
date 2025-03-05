import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation after login
import CustomButton from "../components/CustomButton"; // Reusable button component
import Heading from "../components/Heading"; // Reusable heading component
import { signInWithEmailAndPassword, getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Firebase Authentication
import { auth } from "../firebaseconfig.js"; // Firebase configuration


const Login = ({ navigation }) => {
  // State variables to store user input for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // Hook for navigating between routes

  // Handles the login process
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    try {
      // Authenticate the user using Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);

      // Send login details to the backend(to login.js in the backend dir) for server-side validation
      
      const response = await fetch("https://cookaing-da7d0.uc.r.appspot.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      
      

      //if running locally
      /*
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      */
      
      console.log("Response status:", response.status); // Log the server's response status

      const responseData = await response.json(); // Parse the JSON response from the server

      if (response.ok) {
        // Navigate to the home page upon successful login
        navigate("/home");
      } else {
        // Display an error message if login fails
        alert("Error", responseData.message || "Failed to login");
      }
    } catch (error) {
      console.error("Network error:", error); // Log any errors that occur during login
      alert("Something went wrong", error.message); // Display a generic error message
    }
  };

  // Handles login with Google OAuth
  const handleGoogleLogin = async () => {
    const authInstance = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      // Launch the Google sign-in popup
      const result = await signInWithPopup(authInstance, provider);
      // Retrieve the user's ID token to send to backend for verification
      const idToken = await result.user.getIdToken();
      console.log("Google ID Token:", idToken);

      // Send the idToken to your backend endpoint for login
      const response = await fetch("http://localhost:3000/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/home");
      } else {
        alert("Error", data.message || "Failed to sign in with Google");
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      alert("Google login failed: " + error.message);
    }
  };


  return (
    <div className="bg-white w-full h-screen px-7 flex flex-col items-center justify-center">
      {/* Logo Section */}
      <div className="flex justify-center items-center">
        <img
          src="/images/logo_better.png" // Replace with the correct path to your logo
          alt="Logo"
          className="w-24 h-24 object-contain"
        />
      </div>

      {/* Heading Section */}
      <div className="mt-10">
        <Heading content="Welcome Back" /> {/* Reusable heading component */}
      </div>

      {/* Subheading Section */}
      <div className="mt-4 text-gray-500 text-sm text-center">
        <p>We'll save your favorite recipes and plans as you go</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="mt-6 w-full max-w-md">
        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email} // Bind the state to the input value
          onChange={(e) => setEmail(e.target.value)} // Update state on input change
          className="bg-gray-100 rounded-xl py-3 px-5 w-full mb-5 text-sm outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={password} // Bind the state to the input value
          onChange={(e) => setPassword(e.target.value)} // Update state on input change
          className="bg-gray-100 rounded-xl py-3 px-5 w-full text-sm outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* Login Button */}
        <div className="mt-8">
          <CustomButton
            bgColor="bg-green-600" // Background color for the button
            textColor="text-white" // Text color for the button
            content="Login" // Button label
            type="submit" // Ensure the button submits the form
          />
        </div>
      </form>

      {/* Google Login Button */}
      <div className="mt-8">
        <CustomButton
          bgColor="bg-blue-600"         // Blue background for Google
          textColor="text-white"         // White text
          content="Login with Google"    // Button label
          onClick={handleGoogleLogin}    // onClick handler for Google login
          type="button"                  // Button type (non-submit)
        />
      </div>
    </div>
  );
};

export default Login;
