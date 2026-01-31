import React, { useState } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus, Check, X as XIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  // Password requirements
  const passwordRequirements = [
    { text: 'At least 8 characters', valid: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', valid: /[a-z]/.test(formData.password) },
    { text: 'Contains number', valid: /[0-9]/.test(formData.password) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.valid);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password for registration
    if (!isLogin && !isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);

    const result = isLogin 
      ? await login({ username: formData.username, password: formData.password })
      : await register({ 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        });

    setLoading(false);

    if (result.success) {
      onClose();
      setFormData({ username: '', email: '', password: '' });
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-black rounded-lg shadow-md">
            {isLogin ? (
              <LogIn className="w-6 h-6 text-accent-gold" />
            ) : (
              <UserPlus className="w-6 h-6 text-accent-gold" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-black">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
              required
            />
          </div>

          {/* Email (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
                required
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-sm pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements (Register only) */}
          {!isLogin && formData.password && (
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
              <p className="text-xs font-semibold text-gray-700 mb-2">Password must have:</p>
              <div className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {req.valid ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <XIcon className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={req.valid ? 'text-green-700' : 'text-gray-600'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (!isLogin && !isPasswordValid)}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-accent-gold hover:text-black font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-black hover:text-accent-gold hover:underline font-semibold transition"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;