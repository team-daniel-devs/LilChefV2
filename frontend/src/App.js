import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Saved from './pages/Saved';
import Taskbar from './components/Navbar'; // Import the Taskbar component
import RecipePage from './pages/RecipePage';
import LandingPage from './pages/onboarding/LandingPage';
import SignUp from './pages/onboarding/SignUp';
import Login from './pages/Login';
import testStorageConnection from "./utils/testStorageConnection";
import Desktop from "./website/Desktop";
import Mobile from "./website/Mobile";
import Grocery from './pages/Grocery';

testStorageConnection();

const App = () => {
  const [showApp, setShowApp] = useState(true);
  const [mobile, setMobile] = useState(false);
  testStorageConnection();
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Detect if the device is a desktop
    if (window.innerWidth > 1024) {
      setShowApp(false);
      setMessage('Please use your phone to access this app.');
      return <Desktop/>
      return;
    }

    // Detect if the app is not opened from the home screen
    const isStandalone =
      window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;


    // Detect if the app is in landscape mode
    const handleOrientationChange = () => {
      if (window.matchMedia('(orientation: landscape)').matches) {
        setShowApp(false);
        setMessage('Please rotate your device to portrait mode.');
      } else {
        setShowApp(true);
        setMessage('');
      }
    };

    //   // Making sure ur on the app (commented otu for dev purposes)
    // if (!isStandalone) {
    //   setShowApp(false);
    //   setMobile(true);
    //   setMessage('Please add this app to your home screen for the best experience.');
    //   return;
    // }

    handleOrientationChange(); // Check on load
    window.addEventListener('resize', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  if (!showApp) {
    if(!mobile){
      return (
        <Desktop/>
      );
    }
    else{
      return (
      <Mobile/>
      );
    }
  }

  return (
    <Router>
      <div style={{ paddingBottom: '60px' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recipepage" element={<RecipePage />} />
          <Route path="/recipepage/:recipeId" element={<RecipePage />} />
          <Route path="/grocery" element={<Grocery />} />
        </Routes>

        {/* Conditionally render the Taskbar */}
        <ConditionalTaskbar />
      </div>
    </Router>
  );
};

const ConditionalTaskbar = () => {
  const location = useLocation();

  // Define routes where the Taskbar should be hidden
  const hideTaskbarRoutes = ['/', '/recipepage', '/signup'];

  // Check if the current path matches any route in `hideTaskbarRoutes`
  const shouldHideTaskbar = hideTaskbarRoutes.includes(location.pathname);

  return !shouldHideTaskbar ? <Taskbar /> : null;
};

export default App;
