import React, { useState } from 'react';
import { Gavel, LogIn, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';

const AppContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gavel className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">AuctionHub</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">
                  Welcome, {currentUser?.fullName || currentUser?.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!isAuthenticated ? (
          <div className="text-center py-20">
            <Gavel className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Welcome to AuctionHub
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Sign in to start bidding on exclusive items in real-time
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold transition"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Dashboard
            </h2>
            <p className="text-slate-600">
              You're logged in as <strong>{currentUser?.email}</strong>
            </p>
            <p className="text-slate-500 mt-2">
              Auction listing will appear here in the next branch.
            </p>
          </div>
        )}
      </main>

      {/* Auth Modal */}
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