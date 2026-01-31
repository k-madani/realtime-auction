import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, User, ChevronDown, LogOut, UserCircle, Menu, X } from 'lucide-react';

const Header = ({ isAuthenticated, currentUser, onSignIn, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-black text-white border-b border-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={handleLogoClick}
        >
          <Gavel className="w-8 h-8 text-accent-gold" />
          <h1 className="text-2xl font-bold tracking-tight">AuctionHub</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white transition font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/auctions')}
                className="text-gray-300 hover:text-white transition font-medium"
              >
                Browse
              </button>
              <button 
                onClick={() => navigate('/my-auctions')}
                className="text-gray-300 hover:text-white transition font-medium"
              >
                My Auctions
              </button>
              <button 
                onClick={() => navigate('/my-bids')}
                className="text-gray-300 hover:text-white transition font-medium"
              >
                My Bids
              </button>
              <button 
                onClick={() => navigate('/watchlist')}
                className="text-gray-300 hover:text-white transition font-medium"
              >
                Watchlist
              </button>
              <button 
                onClick={() => navigate('/create-auction')}
                className="px-4 py-2 bg-accent-gold text-black rounded-lg hover:bg-yellow-500 transition font-semibold flex items-center gap-2"
              >
                <Gavel className="w-4 h-4" />
                Create
              </button>
            </>
          ) : (
            <>
              <a href="#features" className="text-gray-300 hover:text-white transition">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition">
                How It Works
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition">
                About
              </a>
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Button */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-light rounded-lg hover:bg-primary-lighter transition"
              >
                <User className="w-4 h-4 text-accent-gold" />
                <span className="text-sm text-gray-300">
                  Welcome, {currentUser?.username}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border-2 border-black overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm font-semibold text-black">{currentUser?.username}</p>
                    <p className="text-xs text-gray-600">{currentUser?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      <UserCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium">My Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary-light border-t border-gray-800">
          <nav className="px-6 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition py-2"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    navigate('/auctions');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition py-2"
                >
                  Browse Auctions
                </button>
                <button 
                  onClick={() => {
                    navigate('/my-auctions');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition py-2"
                >
                  My Auctions
                </button>
                <button 
                  onClick={() => {
                    navigate('/my-bids');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition py-2"
                >
                  My Bids
                </button>
                <button 
                  onClick={() => {
                    navigate('/watchlist');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition py-2"
                >
                  Watchlist
                </button>
                <button 
                  onClick={() => {
                    navigate('/create-auction');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition py-2"
                >
                  Create Auction
                </button>
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white transition py-2"
                >
                  My Profile
                </button>
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-accent-gold" />
                    <div>
                      <p className="text-sm text-gray-300">{currentUser?.username}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 transition border border-gray-700 rounded-lg hover:border-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="#features" className="block text-gray-300 hover:text-white transition py-2">
                  Features
                </a>
                <a href="#how-it-works" className="block text-gray-300 hover:text-white transition py-2">
                  How It Works
                </a>
                <a href="#about" className="block text-gray-300 hover:text-white transition py-2">
                  About
                </a>
                <button
                  onClick={onSignIn}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-accent-gold text-black rounded-lg hover:bg-yellow-500 transition font-semibold mt-3"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;