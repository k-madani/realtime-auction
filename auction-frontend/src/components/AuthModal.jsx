import React, { useState } from 'react';
import { X, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isLogin 
      ? await login({ email: formData.email, password: formData.password })
      : await register(formData);

    setLoading(false);

    if (result.success) {
      onClose();
      setFormData({ email: '', password: '', fullName: '', phoneNumber: '' });
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', fullName: '', phoneNumber: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative border-2 border-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-black rounded-lg">
            {isLogin ? (
              <User className="w-6 h-6 text-accent-gold" />
            ) : (
              <UserPlus className="w-6 h-6 text-accent-gold" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-black">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-accent-red text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-primary-light font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-black hover:text-primary-light font-semibold"
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