import React from 'react';
import { Gavel, User } from 'lucide-react';

const Header = ({ isAuthenticated, currentUser, onSignIn, onLogout }) => {
  return (
    <header className="bg-black text-white border-b border-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gavel className="w-8 h-8 text-accent-gold" />
          <h1 className="text-2xl font-bold tracking-tight">AuctionHub</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-300 hover:text-white transition">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-white transition">
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-lg">
                <User className="w-4 h-4 text-accent-gold" />
                <span className="text-sm text-gray-300">
                  Welcome, {currentUser?.username || currentUser?.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-gray-300 hover:text-white transition border border-gray-700 rounded-lg hover:border-gray-500"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-6 py-2 bg-accent-gold text-black rounded-lg hover:bg-yellow-500 transition font-semibold"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;