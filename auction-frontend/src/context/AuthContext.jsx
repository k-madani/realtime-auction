import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔵 AuthContext initialized');
    console.log('🔵 Token from localStorage:', token);
    console.log('🔵 User from localStorage:', user);
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      console.log('✅ User restored from localStorage');
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    console.log('🔵 Register attempt:', userData);
    try {
      const response = await authAPI.register(userData);
      console.log('🔵 Register response:', response);
      
      const { token, username, email, role } = response.data;
      console.log('🔵 Extracted from response:', { token, username, email, role });
      
      const user = { username, email, role };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ Token saved to localStorage:', token);
      console.log('✅ User saved to localStorage:', user);
      
      setCurrentUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Register error:', error);
      console.error('❌ Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const login = async (credentials) => {
    console.log('🔵 Login attempt:', credentials);
    try {
      const response = await authAPI.login(credentials);
      console.log('🔵 Login response:', response);
      console.log('🔵 Login response.data:', response.data);
      
      const { token, username, email, role } = response.data;
      console.log('🔵 Extracted from response:', { token, username, email, role });
      
      const user = { username, email, role };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ Token saved to localStorage:', token);
      console.log('✅ User saved to localStorage:', user);
      
      setCurrentUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    console.log('🔵 Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    console.log('✅ Logged out');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}