import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Saved from './pages/Saved';
import Taskbar from './components/Navbar'; // Import the Taskbar component
import RecipePage from './pages/RecipePage';
import LandingPage from './pages/onboarding/LandingPage';
import SignUp from './pages/onboarding/SignUp';
import Login from './pages/Login';

const App = () => {
  const [showApp, setShowApp] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Detect if the device is a desktop
    if (window.innerWidth > 1024) {
      setShowApp(false);
      setMessage('Please use your phone to access this app.');
      return;
    }

    // Detect if the app is not opened from the home screen
    const isStandalone =
      window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

      // Making sure ur on the app (commented otu for dev purposes)
    // if (!isStandalone) {
    //   setShowApp(false);
    //   setMessage('Please add this app to your home screen for the best experience.');
    //   return;
    // }

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

    handleOrientationChange(); // Check on load
    window.addEventListener('resize', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  if (!showApp) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center',
        }}
      >
        <p>{message}</p>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ paddingBottom: '60px' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/recipepage" element={<RecipePage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
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
