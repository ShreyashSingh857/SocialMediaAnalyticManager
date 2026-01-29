import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import { Settings } from './pages/Settings';
import { AIStudio } from './pages/AIStudio';
import { VideoMetadata } from './pages/ai-tools/VideoMetadata';
import { ThumbnailRater } from './pages/ai-tools/ThumbnailRater';
import { ScriptAssistant } from './pages/ai-tools/ScriptAssistant';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import ProfileSetup from './components/ProfileSetup';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import { AuthProvider } from './contexts/AuthContext';

import { AnalyticsLayout } from './pages/analytics/AnalyticsLayout';
import { AnalyticsOverview } from './pages/analytics/AnalyticsOverview';
import { AnalyticsAudience } from './pages/analytics/AnalyticsAudience';
import { AnalyticsContent } from './pages/analytics/AnalyticsContent';


import SidebarLayout from './components/SidebarLayout';
import { Navigate } from 'react-router-dom';

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
              <Route path="/social-connect" element={<Settings />} /> {/* Redirect or Alias if needed, or just replace */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />

              {/* Nested Analytics Routes */}
              <Route path="/analytics" element={<AnalyticsLayout />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<AnalyticsOverview />} />
                <Route path="audience" element={<AnalyticsAudience />} />
                <Route path="content" element={<AnalyticsContent />} />
              </Route>

              <Route path="/ai-studio" element={<AIStudio />} />
              <Route path="/ai-studio/video-metadata" element={<VideoMetadata />} />
              <Route path="/ai-studio/thumbnail-rater" element={<ThumbnailRater />} />
              <Route path="/ai-studio/script-assistant" element={<ScriptAssistant />} />
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
