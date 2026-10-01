import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import SkillsPage from './pages/SkillsPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import CertificatesPage from './pages/CertificatesPage';
import SessionsPage from './pages/SessionsPage';
import CalendarPage from './pages/CalendarPage';
import MessagesPage from './pages/MessagesPage';
import CommunityPage from './pages/CommunityPage';
import ProjectsPage from './pages/ProjectsPage';
import SkillMatchPage from './pages/SkillMatchPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

const Layout = ({ children }) => {
  const location = useLocation();

  // Pages that don't need the persistent sidebar (landing, login, register, onboarding)
  const isFullWidthPage = ['/', '/login', '/register', '/onboarding'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-violet-600 selection:text-white">
      <Navbar />
      {isFullWidthPage ? (
        <main className="flex-1">{children}</main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        </div>
      )}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Core Landing & Auth Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Application Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/student/:id" element={<StudentDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/skill-match" element={<SkillMatchPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Catch-all fallback to HomePage */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
