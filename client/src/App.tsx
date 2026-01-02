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
            <Route path="/social-connect" element={<SocialConnect />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
