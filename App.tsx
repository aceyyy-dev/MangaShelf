import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Onboarding from './screens/Onboarding';
import Signup from './screens/Signup';
import Login from './screens/Login';
import UsernameSetup from './screens/UsernameSetup';
import ScanOnboarding from './screens/ScanOnboarding';
import OnboardingProgress from './screens/OnboardingProgress';
import ForgotPassword from './screens/ForgotPassword';
import EmailConfirmation from './screens/EmailConfirmation';
import OAuthCallback from './screens/OAuthCallback';
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

interface AuthGuardProps {
  children: React.ReactNode;
}

// Guard: Only allow access if user is logged in (not guest)
const RequireAuth: React.FC<AuthGuardProps> = ({ children }) => {
  const { userProfile } = useStore();
  if (userProfile.username === 'guest') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Guard: Only allow access if user is Guest
const PublicRoute: React.FC<AuthGuardProps> = ({ children }) => {
   const { userProfile } = useStore();
   if (userProfile.username !== 'guest') {
     return <Navigate to="/home" replace />;
   }
   return <>{children}</>;
};

// Main Content Wrapper
const AppContent: React.FC = () => {
  return (
    <div className="text-slate-900 dark:text-white h-full w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
        <Routes>
            {/* Entry Point & Onboarding Flow */}
            {/* Login, Signup, and UsernameSetup are nested to appear as overlays on Onboarding */}
            <Route path="/" element={<PublicRoute><Onboarding /></PublicRoute>}>
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="username-setup" element={<UsernameSetup />} />
            </Route>

            {/* Extended Onboarding Steps */}
            <Route path="/scan-onboarding" element={<ScanOnboarding />} />
            <Route path="/onboarding-progress" element={<OnboardingProgress />} />

            {/* Auth Utilities */}
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/auth/confirm" element={<EmailConfirmation />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* Protected Routes */}
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
            <Route path="/paywall" element={<Paywall />} />
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