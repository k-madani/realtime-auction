import React, { useState } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import StarRating from './StarRating';

const ReviewModal = ({ isOpen, onClose, auction, revieweeRole }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await reviewsAPI.createReview(auction.id, { rating, comment });
      onClose(true); // Pass true to indicate success
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const revieweeLabel = revieweeRole === 'SELLER' ? 'Seller' : 'Buyer';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full mx-4 relative border-2 border-black">
        <button
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent-gold rounded-lg">
            <Star className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-black">
            Rate {revieweeLabel}
          </h2>
        </div>

        {/* Auction Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Auction</p>
          <p className="font-semibold text-black">{auction.title}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-accent-red rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-accent-red mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              Your Rating *
            </label>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <StarRating
                rating={rating}
                size="xl"
                showNumber={false}
                onRatingChange={setRating}
              />
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm text-gray-600">
                {rating === 1 && '⭐ Poor'}
                {rating === 2 && '⭐⭐ Fair'}
                {rating === 3 && '⭐⭐⭐ Good'}
                {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience with this ${revieweeLabel.toLowerCase()}...`}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-6 py-3 bg-accent-gold text-black rounded-lg hover:bg-yellow-500 font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;