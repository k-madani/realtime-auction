import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

const AppContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onSignIn={handleGetStarted}
        onLogout={logout}
      />

      {isAuthenticated ? (
        <DashboardPage />
      ) : (
        <LandingPage onGetStarted={handleGetStarted} />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
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