import React, { useState, useEffect } from 'react';
import { Star, Package, ShoppingCart } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import StarRating from './StarRating';

const UserRatingsDisplay = ({ username }) => {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [username]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await reviewsAPI.getUserRatings(username);
      setRatings(response.data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading ratings...</div>;
  }

  if (!ratings || ratings.totalReviews === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
        <Star className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Rating Card */}
      <div className="bg-gradient-to-r from-accent-gold to-yellow-500 rounded-lg p-6 text-black">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold mb-1">Overall Rating</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">{ratings.overallRating.toFixed(1)}</span>
              <StarRating rating={ratings.overallRating} size="lg" showNumber={false} />
            </div>
            <p className="text-sm mt-1">{ratings.totalReviews} reviews</p>
          </div>
          <Star className="w-16 h-16 opacity-20" />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* As Seller */}
        {ratings.sellerReviews > 0 && (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-gray-600" />
              <p className="text-sm font-semibold text-gray-700">As Seller</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-black">
                {ratings.sellerRating.toFixed(1)}
              </span>
              <StarRating rating={ratings.sellerRating} size="sm" showNumber={false} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {ratings.sellerReviews} reviews
            </p>
          </div>
        )}

        {/* As Buyer */}
        {ratings.buyerReviews > 0 && (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <p className="text-sm font-semibold text-gray-700">As Buyer</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-black">
                {ratings.buyerRating.toFixed(1)}
              </span>
              <StarRating rating={ratings.buyerRating} size="sm" showNumber={false} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {ratings.buyerReviews} reviews
            </p>
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      {ratings.recentReviews.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <h3 className="text-lg font-bold text-black mb-3">Recent Reviews</h3>
          <div className="space-y-3">
            {ratings.recentReviews.slice(0, 5).map((review) => (
              <div key={review.id} className="pb-3 border-b border-gray-200 last:border-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-semibold text-black">
                      {review.reviewerUsername}
                    </p>
                    <p className="text-xs text-gray-500">
                      Reviewed as {review.revieweeRole.toLowerCase()}
                    </p>
                  </div>
                  <StarRating rating={review.rating} size="sm" showNumber={false} />
                </div>
                
                {review.comment && (
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {review.comment}
                  </p>
                )}
                
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRatingsDisplay;