import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.data);
      setFormData({
        username: response.data.username,
        email: response.data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.currentPassword) {
      setError('Current password is required to update profile');
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword
      };

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      await usersAPI.updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // If username changed, user needs to login again
      if (formData.username !== profile.username) {
        setTimeout(() => {
          alert('Username changed. Please login again.');
          logout();
        }, 2000);
      } else {
        fetchProfile();
      }

      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      username: profile.username,
      email: profile.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-black">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black flex items-center gap-3">
          <span className="w-2 h-10 bg-accent-gold rounded"></span>
          My Profile
        </h1>
        <p className="text-gray-600 mt-2">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border-2 border-black p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-black to-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-accent-gold" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-1">{profile.username}</h2>
            <p className="text-gray-600 mb-6">{profile.email}</p>

            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-semibold text-black">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Role</span>
                <span className="text-sm font-semibold text-black">{profile.role}</span>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent-gold" />
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auctions Created</span>
                <span className="text-lg font-bold text-black">{profile.totalAuctionsCreated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Auctions</span>
                <span className="text-lg font-bold text-accent-green">{profile.activeAuctionsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bids</span>
                <span className="text-lg font-bold text-black">{profile.totalBidsPlaced}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auctions Won</span>
                <span className="text-lg font-bold text-accent-gold">{profile.auctionsWon}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border-2 border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">Account Settings</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-primary-light font-semibold"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-accent-red rounded flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-accent-red mt-0.5" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-accent-green rounded">
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100"
                />
              </div>

              {editing && (
                <>
                  <div className="pt-6 border-t-2 border-gray-200">
                    <h4 className="text-lg font-bold text-black mb-4">Change Password (Optional)</h4>

                    {/* Current Password */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-black mb-2">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Required to save changes"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        required
                      />
                    </div>

                    {/* New Password */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-black mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      />
                    </div>

                    {/* Confirm Password */}
                    {formData.newPassword && (
                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent-green text-white rounded-lg hover:bg-green-600 font-bold"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;