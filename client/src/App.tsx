import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import SocialConnect from './pages/SocialConnect';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import ProfileSetup from './components/ProfileSetup';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import { AuthProvider } from './contexts/AuthContext';

import { Analytics } from './pages/Analytics';
import { Audience } from './pages/Audience';

import SidebarLayout from './components/SidebarLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - redirect to profile-setup if logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Auth Callback Route - accessible while processing auth */}
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Route>

          {/* Protected Routes - redirect to login if not logged in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/social-connect" element={<SocialConnect />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/audience" element={<Audience />} />
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
