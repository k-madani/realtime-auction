import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

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

      {!isAuthenticated ? (
        <>
          <Hero onGetStarted={handleGetStarted} />
          <Features />
          <HowItWorks />
          <Footer />
        </>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-xl border-2 border-black p-8">
            <h2 className="text-3xl font-bold text-black mb-4 flex items-center gap-3">
              <span className="w-2 h-8 bg-accent-gold rounded"></span>
              Dashboard
            </h2>
            <p className="text-gray-700 text-lg">
              You're logged in as <strong className="text-black">{currentUser?.email}</strong>
            </p>
            <div className="mt-6 p-4 bg-gray-50 border-l-4 border-accent-gold rounded">
              <p className="text-gray-600">
                🎯 Auction listing will appear here in Branch 2.
              </p>
            </div>
          </div>
        </main>
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