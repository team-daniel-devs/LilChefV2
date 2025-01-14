import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Saved from './pages/Saved';
import Taskbar from './components/Navbar'; // Import the Taskbar component
import RecipePage from './pages/RecipePage';
import LandingPage from './pages/onboarding/LandingPage';
import SignUp from './pages/onboarding/SignUp';
import Grocery from './pages/Grocery';
import Desktop from './website/Desktop'; // Import the Desktop component
import Mobile from './website/Mobile'; // Import the Mobile component
import Questions from './pages/onboarding/Questions';


const App = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Check if the device is a desktop
      setIsDesktop(window.innerWidth > 424);
    };

    const checkStandaloneMode = () => {
      // Check if the app is running in standalone mode
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsStandalone(isStandaloneMode);
    };

    // Run checks on load
    handleResize();
    checkStandaloneMode();

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // if (isDesktop) {
  //   return <Desktop />; // Render the Desktop component for desktop screens
  // }

  if (isDesktop) {
    return (
      <Router>
        <div style={{ paddingBottom: '60px' }}>
          <Routes>
            <Route path="/questions" element={<Questions />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/recipepage" element={<RecipePage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/grocery" element={<Grocery />} />
          </Routes>

          {/* Conditionally render the Taskbar */}
          <ConditionalTaskbar />
        </div>
      </Router>
    );
  }

  return <Mobile />; // Render the Mobile component for mobile browsers
};

const ConditionalTaskbar = () => {
  const location = useLocation();

  // Define routes where the Taskbar should be hidden
  const hideTaskbarRoutes = ['/', '/recipepage', '/signup', '/questions'];

  // Check if the current path matches any route in `hideTaskbarRoutes`
  const shouldHideTaskbar = hideTaskbarRoutes.includes(location.pathname);

  return !shouldHideTaskbar ? <Taskbar /> : null;
};

export default App;
