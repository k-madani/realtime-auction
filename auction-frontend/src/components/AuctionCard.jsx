import React from 'react';
import { Clock, TrendingUp, User, Gavel } from 'lucide-react';

const AuctionCard = ({ auction, onSelect, isSelected }) => {
  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-accent-green text-white';
      case 'PENDING':
        return 'bg-yellow-500 text-white';
      case 'ENDED':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div
      onClick={() => onSelect(auction)}
      className={`bg-white rounded-lg border-2 cursor-pointer transition hover:shadow-xl ${
        isSelected ? 'border-black shadow-xl' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      {/* Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
        <Gavel className="w-16 h-16 text-gray-400" />
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(auction.status)}`}>
          {auction.status}
        </div>

        {/* Time Remaining Badge */}
        {auction.status === 'ACTIVE' && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black bg-opacity-80 text-white rounded-full text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeRemaining(auction.endTime)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-black mb-2 line-clamp-1">
          {auction.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {auction.description}
        </p>

        <div className="space-y-3">
          {/* Current Price */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Current Bid</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-accent-gold" />
              <span className="text-2xl font-bold text-black">
                ${auction.currentPrice}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1 text-gray-600">
              <User className="w-4 h-4" />
              <span>{auction.totalBids || 0} bids</span>
            </div>
            
            {auction.highestBidder && (
              <div className="text-gray-600">
                Leader: <span className="font-semibold text-black">{auction.highestBidder}</span>
              </div>
            )}
          </div>

          {/* Starting Price */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Starting bid: ${auction.startingPrice}</span>
            {auction.status === 'ACTIVE' && (
              <span className="text-accent-red font-semibold">Ends {new Date(auction.endTime).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;