import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, DollarSign, Calendar, Clock, FileText, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { auctionsAPI } from '../services/api';

const CreateAuctionPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    startTime: '',
    endTime: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.startingPrice || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const now = new Date();

    if (startTime < now) {
      setError('Start time must be in the future');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const auctionData = {
        ...formData,
        startingPrice: parseFloat(formData.startingPrice)
      };

      const response = await auctionsAPI.create(auctionData);
      
      // Show success and redirect
      alert('Auction created successfully!');
      navigate(`/auctions/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  // Get min date/time for inputs (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black flex items-center gap-3">
          <span className="w-2 h-10 bg-accent-gold rounded"></span>
          Create New Auction
        </h1>
        <p className="text-gray-600 mt-2">List your item and start receiving bids</p>
      </div>

      <div className="bg-white rounded-lg border-2 border-black p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-accent-red rounded flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent-red mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <Gavel className="w-4 h-4 inline mr-2" />
              Auction Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Vintage Rolex Watch"
              maxLength={100}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your item..."
              rows={6}
              maxLength={1000}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Starting Price */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Starting Price *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                $
              </span>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum bid amount to start the auction
            </p>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                min={getMinDateTime()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                When bidding begins
              </p>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min={formData.startTime || getMinDateTime()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                When bidding closes
              </p>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add an image to make your auction more attractive
            </p>
          </div>

          {/* Preview Box */}
          {formData.title && formData.startingPrice && (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-accent-green" />
                <h3 className="text-lg font-bold text-black">Preview</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-600">Title:</span>{' '}
                  <span className="text-black">{formData.title}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-gray-600">Starting Price:</span>{' '}
                  <span className="text-accent-gold font-bold">${formData.startingPrice}</span>
                </p>
                {formData.startTime && (
                  <p className="text-sm">
                    <span className="font-semibold text-gray-600">Starts:</span>{' '}
                    <span className="text-black">
                      {new Date(formData.startTime).toLocaleString()}
                    </span>
                  </p>
                )}
                {formData.endTime && (
                  <p className="text-sm">
                    <span className="font-semibold text-gray-600">Ends:</span>{' '}
                    <span className="text-black">
                      {new Date(formData.endTime).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-primary-light font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <Gavel className="w-5 h-5" />
                  Create Auction
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-black to-primary-light rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-3">💡 Tips for a Successful Auction</h3>
        <ul className="space-y-2 text-sm text-gray-200">
          <li>• Write a clear, descriptive title that highlights key features</li>
          <li>• Provide detailed description with condition, dimensions, and history</li>
          <li>• Set a realistic starting price to attract bidders</li>
          <li>• Choose appropriate auction duration (24-72 hours works best)</li>
          <li>• Add high-quality images to increase trust and bids</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateAuctionPage;