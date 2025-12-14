import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { LoadingProvider } from './context/LoadingContext';

// Pages
import SplashPage from './app/splash/index';
import LoginPage from './app/auth/LoginPage';
import OnboardingPage from './app/onboarding/index';
import HomePage from './app/home/index';
import ReelPage from './app/reel/index';
import MapPage from './app/map/index';
import ChatPage from './app/ai-chat/index';
import NewspaperPage from './app/newspaper/index';
import ProfilePage from './app/profile/index';
import SearchPage from './app/search/index';
import CategoriesPage from './app/categories/index';
import CategoryPage from './app/categories/CategoryPage';
import PoliticsPage from './app/categories/politics/index';
import TechPage from './app/categories/technology/index';
import TopStoriesPage from './app/top-stories/index';
import LatestPage from './app/latest/index';
import BookmarksPage from './app/bookmarks/index';
import SettingsPage from './app/settings/index';
import AdminPage from './app/admin/index';
import DetailsPage from './app/details/index';
import NotificationsPage from './app/notifications/index';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LoadingProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                {/* Entry Routes */}
                <Route path="/splash" element={<SplashPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />

                {/* Main App Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/top-stories" element={<TopStoriesPage />} />
                <Route path="/latest" element={<LatestPage />} />
                <Route path="/reel" element={<ReelPage />} />
                
                {/* Categories */}
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/politics" element={<PoliticsPage />} />
                <Route path="/categories/technology" element={<TechPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                
                <Route path="/search" element={<SearchPage />} />
                <Route path="/news/:id" element={<DetailsPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/ai-chat" element={<ChatPage />} />
                <Route path="/newspaper" element={<NewspaperPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                
                {/* Fallback to Splash instead of Home for a fresh feel, or Home for dev convenience */}
                <Route path="*" element={<Navigate to="/splash" replace />} />
              </Route>
            </Routes>
          </Router>
        </LoadingProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;