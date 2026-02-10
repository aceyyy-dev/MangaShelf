import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Onboarding from './screens/Onboarding';
import Signup from './screens/Signup';
import Login from './screens/Login';
import UsernameSetup from './screens/UsernameSetup';
import ScanOnboarding from './screens/ScanOnboarding';
import ForgotPassword from './screens/ForgotPassword';
import Home from './screens/Home';
import Library from './screens/Library';
import SeriesDetails from './screens/SeriesDetails';
import Scanner from './screens/Scanner';
import Insights from './screens/Insights';
import Profile from './screens/Profile';
import Paywall from './screens/Paywall';
import ValueTracker from './screens/ValueTracker';
import CollectionGrowth from './screens/CollectionGrowth';
import TopAuthors from './screens/TopAuthors';
import SeriesCompletion from './screens/SeriesCompletion';
import { StoreProvider, useStore } from './StoreContext';

// Guard: Only allow access if user is logged in (not guest)
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { userProfile } = useStore();
  if (userProfile.username === 'guest') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Guard: Only allow access if user is Guest (e.g. Onboarding/Login screens)
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
   const { userProfile } = useStore();
   if (userProfile.username !== 'guest') {
     return <Navigate to="/home" replace />;
   }
   return children;
};

// Main Content Wrapper to access Store Context
const AppContent: React.FC = () => {
  return (
    <div className="text-slate-900 dark:text-white h-full w-full bg-background-light dark:bg-background-dark overflow-hidden">
        <Routes>
            {/* Entry Point - Onboarding is now the Root Route */}
            <Route path="/" element={<PublicRoute><Onboarding /></PublicRoute>} />
            
            {/* Public Routes - Accessible only to Guests */}
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            
            {/* Username Setup - Accessible to guests (before final login) */}
            <Route path="/username-setup" element={<PublicRoute><UsernameSetup /></PublicRoute>} />
            
            {/* New Onboarding Step - Accessible after "login" action in UsernameSetup */}
            <Route path="/onboarding-scan" element={<RequireAuth><ScanOnboarding /></RequireAuth>} />
            
            {/* Protected Routes - Accessible only to Logged In Users */}
            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
            <Route path="/series/:id" element={<RequireAuth><SeriesDetails /></RequireAuth>} />
            <Route path="/scan" element={<RequireAuth><Scanner /></RequireAuth>} />
            <Route path="/insights" element={<RequireAuth><Insights /></RequireAuth>} />
            <Route path="/value-tracker" element={<RequireAuth><ValueTracker /></RequireAuth>} />
            <Route path="/collection-growth" element={<RequireAuth><CollectionGrowth /></RequireAuth>} />
            <Route path="/series-completion" element={<RequireAuth><SeriesCompletion /></RequireAuth>} />
            <Route path="/top-authors" element={<RequireAuth><TopAuthors /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/paywall" element={<RequireAuth><Paywall /></RequireAuth>} />
        </Routes>
        <BottomNav />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
        <Router>
           <AppContent />
        </Router>
    </StoreProvider>
  );
};

export default App;