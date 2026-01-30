import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, User, Heart, Gavel } from 'lucide-react';

const AuctionCard = ({ auction, onWatchlistToggle, isInWatchlist }) => {
  const navigate = useNavigate();

  const getTimeRemaining = () => {
    const end = new Date(auction.endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = () => {
    switch (auction.status) {
      case 'ACTIVE':
        return 'bg-accent-green';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'ENDED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPrimaryImage = () => {
    // Use imageUrls array if available
    if (auction.imageUrls && auction.imageUrls.length > 0) {
      return auction.imageUrls[0];
    }
    // Fallback to single imageUrl (backward compatibility)
    if (auction.imageUrl) {
      return auction.imageUrl;
    }
    return null;
  };

  const primaryImage = getPrimaryImage();
  const imageCount = auction.imageUrls ? auction.imageUrls.length : (auction.imageUrl ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border-2 border-black shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Section */}
      <div 
        className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer overflow-hidden"
        onClick={() => navigate(`/auctions/${auction.id}`)}
      >
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={auction.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {/* Image Count Badge (if multiple images) */}
            {imageCount > 1 && (
              <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Gavel className="w-3 h-3" />
                {imageCount}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gavel className="w-20 h-20 text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 left-3 ${getStatusColor()} text-white px-3 py-1 rounded-full text-xs font-bold`}>
          {auction.status}
        </div>

        {/* Watchlist Button */}
        {onWatchlistToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatchlistToggle(auction.id);
            }}
            className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
          >
            <Heart
              className={`w-5 h-5 ${isInWatchlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 
          className="text-xl font-bold text-black mb-2 line-clamp-2 cursor-pointer hover:text-primary-light transition"
          onClick={() => navigate(`/auctions/${auction.id}`)}
        >
          {auction.title}
        </h3>

        {/* Category */}
        {auction.categoryDisplay && (
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold border border-gray-300">
              {auction.categoryDisplay}
            </span>
          </div>
        )}

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Bid</p>
            <p className="text-xl font-bold text-accent-gold">
              ${auction.currentPrice?.toFixed(2) || auction.startingPrice?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Time Left</p>
            <p className="text-lg font-bold text-black flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTimeRemaining()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">{auction.totalBids || 0}</span>
            <span>bids</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <User className="w-4 h-4" />
            <span className="font-semibold truncate max-w-[120px]">
              {auction.sellerUsername || auction.sellerName}
            </span>
          </div>
        </div>

        {/* View Button */}
        <button
          onClick={() => navigate(`/auctions/${auction.id}`)}
          className="w-full mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-primary-light font-bold transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;