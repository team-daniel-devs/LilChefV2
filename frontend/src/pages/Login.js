import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import Heading from "../components/Heading";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig.js";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);

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

      console.log("Response status:", response.status);

      const responseData = await response.json();

      if (response.ok) {
        navigate("/home")
      } else {
        alert("Error", responseData.message || "Failed to login");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Something went wrong", error.message);
    }
  };

  return (
    <div className="bg-white w-full h-screen px-7 flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="flex justify-center items-center">
        <img
          src="/images/Logo_no_name.png" // Replace with your correct path
          alt="Logo"
          className="w-24 h-24 object-contain"
        />
      </div>

      {/* Heading */}
      <div className="mt-10">
        <Heading content="Welcome Back" />
      </div>

      {/* Subheading */}
      <div className="mt-4 text-gray-500 text-sm text-center">
        <p>We'll save your favorite recipes and plans as you go</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="mt-6 w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-100 rounded-xl py-3 px-5 w-full mb-5 text-sm outline-none focus:ring-2 focus:ring-green-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-100 rounded-xl py-3 px-5 w-full text-sm outline-none focus:ring-2 focus:ring-green-600"
        />
        <div className="mt-8">
          <CustomButton
            bgColor="bg-green-600"
            textColor="text-white"
            content="Login"
            type="submit" // Ensure the button submits the form
          />
        </div>
      </form>
    </div>
  );
};

export default Login;