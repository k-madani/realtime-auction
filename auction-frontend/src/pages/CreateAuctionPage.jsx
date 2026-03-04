import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gavel, DollarSign, Calendar, Clock, FileText, AlertCircle, CheckCircle, Lightbulb, 
  Camera, Smartphone, Shirt, Home, Package, Palette, Activity, BookOpen, Gamepad2, 
  Gem, Car, Music, Wrench
} from 'lucide-react';
import { auctionsAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';

const CreateAuctionPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    startTime: '',
    endTime: '',
    imageUrls: [],
    category: 'ELECTRONICS'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Map categories to Lucide icons (black)
  const categoryIcons = {
    'ELECTRONICS': Smartphone,
    'FASHION': Shirt,
    'HOME_GARDEN': Home,
    'COLLECTIBLES': Package,
    'ART': Palette,
    'SPORTS': Activity,
    'BOOKS': BookOpen,
    'TOYS': Gamepad2,
    'JEWELRY': Gem,
    'AUTOMOTIVE': Car,
    'MUSIC': Music,
    'OTHER': Wrench
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await auctionsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImagesChange = (imageUrls) => {
    setFormData({ ...formData, imageUrls });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.startingPrice || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.imageUrls.length === 0) {
      setError('Please upload at least one image for your auction');
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
      
      alert('Auction created successfully!');
      navigate(`/auctions/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getCategoryIcon = (categoryValue) => {
    const IconComponent = categoryIcons[categoryValue] || Wrench;
    return <IconComponent className="w-5 h-5 text-black" />;
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

      {/* Tips Section */}
      <div className="mb-6 bg-gradient-to-r from-black to-gray-800 rounded-lg p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-6 h-6 text-accent-gold" />
          <h3 className="text-xl font-bold">Tips for a Successful Auction</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-200">
          <li className="flex items-start gap-2">
            <span className="text-accent-gold font-bold">•</span>
            Write a clear, descriptive title that highlights key features
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold font-bold">•</span>
            Provide detailed description with condition, dimensions, and history
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold font-bold">•</span>
            Set a realistic starting price to attract bidders
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold font-bold">•</span>
            Choose appropriate auction duration (24-72 hours works best)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold font-bold">•</span>
            Upload multiple high-quality images from different angles
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold font-bold">•</span>
            First image will be used as the main thumbnail
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-lg">
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <Gavel className="w-4 h-4 inline mr-2 text-black" />
              Auction Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Vintage Rolex Watch"
              maxLength={100}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
              {getCategoryIcon(formData.category)}
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.displayName}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the category that best describes your item
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <FileText className="w-4 h-4 inline mr-2 text-black" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your item..."
              rows={6}
              maxLength={1000}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none shadow-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Starting Price */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <DollarSign className="w-4 h-4 inline mr-2 text-black" />
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
                className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
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
                <Calendar className="w-4 h-4 inline mr-2 text-black" />
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                min={getMinDateTime()}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                When bidding begins
              </p>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                <Clock className="w-4 h-4 inline mr-2 text-black" />
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min={formData.startTime || getMinDateTime()}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                When bidding closes
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <Camera className="w-4 h-4 inline mr-2 text-black" />
              Auction Images *
            </label>
            <ImageUpload onImagesChange={handleImagesChange} maxImages={5} />
            <p className="text-xs text-gray-500 mt-2">
              Upload up to 5 high-quality images. The first image will be the primary thumbnail.
            </p>
          </div>

          {/* Preview Box */}
          {formData.title && formData.startingPrice && (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
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
                <p className="text-sm">
                  <span className="font-semibold text-gray-600">Images:</span>{' '}
                  <span className="text-black">{formData.imageUrls.length} uploaded</span>
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
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold transition shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-accent-gold hover:text-black font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md"
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
    </div>
  );
};

export default CreateAuctionPage;