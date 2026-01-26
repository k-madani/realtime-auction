import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import AuctionsPage from './pages/AuctionsPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import MyBidsPage from './pages/MyBidsPage';

const AppContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onSignIn={handleGetStarted}
          onLogout={logout}
        />

        <div className="flex-grow">
          <Routes>
            {/* Public Route */}
            <Route
              path="/"
              element={
                isAuthenticated ?
                  <Navigate to="/auctions" replace /> :
                  <LandingPage onGetStarted={handleGetStarted} />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/auctions"
              element={
                isAuthenticated ?
                  <AuctionsPage /> :
                  <Navigate to="/" replace />
              }
            />

            <Route
              path="/my-bids"
              element={
                isAuthenticated ?
                  <MyBidsPage /> :
                  <Navigate to="/" replace />
              }
            />

            <Route
              path="/auctions/:id"
              element={
                isAuthenticated ?
                  <AuctionDetailPage /> :
                  <Navigate to="/" replace />
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {!isAuthenticated && <Footer />}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;