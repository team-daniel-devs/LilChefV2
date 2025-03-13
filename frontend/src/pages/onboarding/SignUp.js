import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const SignUp = () => {
  // States for form fields
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // For navigation after successful registration

  // Function to handle form submission
  const submitForm = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      // Send form data to the backend (to register.js in the backend dir)
      
      const response = await fetch('https://cookaing-da7d0.uc.r.appspot.com/register', {
        method: "POST", // HTTP method
        headers: {
          "Content-Type": "application/json", // Specify content type
        },
        body: JSON.stringify({
          first_name: firstName, // Send first name
          email: email, // Send email
          password: password, // Send password
        }),
      });
      

      
      //if running locally
      /*
      const response = await fetch('http://localhost:3000/register', {
        method: "POST", // HTTP method
        headers: {
          "Content-Type": "application/json", // Specify content type
        },
        body: JSON.stringify({
          first_name: firstName, // Send first name
          email: email, // Send email
          password: password, // Send password
        }),
      });
      */


      console.log("Response status:", response.status); // Log response status

      const responseData = await response.json(); // Parse JSON response

      // If registration is successful, navigate to the home page
      if (response.ok) {
        navigate("/home");
      } else {
        alert("Error", responseData.message || "Failed to register");
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error("Network error:", error);
      alert("Something went wrong", error.message);
    }
  };


  // Function to handle Google sign-up using OAuth
const handleGoogleSignUp = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    // Launch the Google sign-in popup
    const result = await signInWithPopup(auth, provider);
    // Retrieve the user's ID token to send to backend for verification
    const idToken = await result.user.getIdToken();
    console.log("Google ID Token:", idToken);

    // Uncomment this block for production:
    //-------------------------------------------------------------------------------------------
    
    const response = await fetch('https://cookaing-da7d0.uc.r.appspot.com/google-signin', {
      method: "POST", // HTTP method
      headers: {
        "Content-Type": "application/json", // Specify content type
      },
      body: JSON.stringify({ idToken }),
    });
    
   //-------------------------------------------------------------------------------------------

    // Uncomment this block for local development:
    /*
    //--------------------------------------------------------------------
    const response = await fetch('http://localhost:3000/google-signin', {
      method: "POST", // HTTP method
      headers: {
        "Content-Type": "application/json", // Specify content type
      },
      body: JSON.stringify({ idToken }),
    });
    */
    
    const data = await response.json();
    if (response.ok) {
      navigate("/home");
    } else {
      alert("Error", data.message || "Failed to sign in with Google");
    }
  } catch (error) {
    console.error("Error during Google sign up:", error);
    alert("Google sign up failed: " + error.message);
  }
  //---------------------------------------------------------------------


};


  return (
    <div className="flex flex-col h-screen bg-white px-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between w-full mt-6">
        <button>
          <Link to="/">
            <span className="text-gray-500 text-lg">&#8592;</span> {/* Back arrow */}
          </Link>
        </button>
      </div>

      {/* Logo Section */}
      <div className="flex justify-center mt-8">
        <img
          src="/images/logo.png" // Path to logo image
          alt="Logo"
          className="w-20 h-20"
        />
      </div>

      {/* Welcome Text */}
      <div className="mt-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome <span className="ml-2">👋</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          First time? We’ll save your favorite recipes and plans as you go —
          lemon squeezy!
        </p>
      </div>

      {/* Sign-Up Form */}
      <form className="flex flex-col w-full max-w-md mt-8" onSubmit={submitForm}>
        {/* First Name Input */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)} // Update state
          className="bg-gray-100 rounded-md p-3 mb-4 text-sm outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update state
          className="bg-gray-100 rounded-md p-3 mb-4 text-sm outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update state
          className="bg-gray-100 rounded-md p-3 mb-6 text-sm outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* Create Acccount button */}
        <button
          type="submit"
          className="bg-green-600 text-white font-medium py-3 rounded-md shadow-md hover:bg-green-500 transition"
        >
          Create Account
        </button>
      </form>

      {/* Google Sign-Up Button */}
      <button
        onClick={handleGoogleSignUp}
        className="bg-blue-600 text-white font-medium py-3 rounded-md shadow-md hover:bg-blue-500 transition mt-4"
      >
        Sign up with Google
      </button>

      {/* Spacer to ensure proper layout */}
      <div className="flex-grow"></div>
    </div>
  );
};

export default SignUp;
