import React, { useState } from 'react';
import { Gavel, DollarSign, TrendingUp, Clock, User, AlertCircle } from 'lucide-react';
import { bidsAPI } from '../services/api';

const BidPanel = ({ auction, onBidSuccess }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!auction) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center sticky top-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gavel className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Select an Auction</h3>
        <p className="text-gray-600">
          Choose an auction from the list to place your bid
        </p>
      </div>
    );
  }

  const minBid = parseFloat(auction.currentPrice) + 10;
  const isActive = auction.status === 'ACTIVE';

  const handlePlaceBid = async () => {
    setError('');
    const amount = parseFloat(bidAmount);

    // Validation
    if (!bidAmount || isNaN(amount)) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (amount < minBid) {
      setError(`Bid must be at least $${minBid.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      await bidsAPI.placeBid(auction.id, amount);
      setBidAmount('');
      setError('');
      if (onBidSuccess) {
        onBidSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = () => {
    const end = new Date(auction.endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Auction ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m remaining`;
  };

  return (
    <div className="bg-white rounded-lg border-2 border-black shadow-xl p-6 sticky top-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-accent-gold" />
        </div>
        <h3 className="text-2xl font-bold text-black">Place Your Bid</h3>
      </div>

      {/* Auction Info */}
      <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Price</span>
          <span className="text-3xl font-bold text-black">${auction.currentPrice}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Minimum Bid</span>
          <span className="text-xl font-bold text-accent-gold">${minBid.toFixed(2)}</span>
        </div>

        {auction.highestBidder && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Highest Bidder</span>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-black">{auction.highestBidder}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Bids</span>
          <span className="font-semibold text-black">{auction.totalBids || 0}</span>
        </div>
      </div>

      {/* Bid Input */}
      {isActive ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Your Bid Amount
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                placeholder={`Min: ${minBid.toFixed(2)}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-lg"
                step="10"
                min={minBid}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border-l-4 border-accent-red rounded">
              <AlertCircle className="w-5 h-5 text-accent-red mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <button
            onClick={handlePlaceBid}
            disabled={loading || !isActive}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-primary-light font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              'Placing Bid...'
            ) : (
              <>
                <Gavel className="w-5 h-5" />
                Place Bid
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600 font-semibold">
            {auction.status === 'PENDING' ? 'Auction not started yet' : 'Auction has ended'}
          </p>
        </div>
      )}

      {/* Time Remaining */}
      <div className="mt-6 p-4 bg-gradient-to-r from-black to-primary-light rounded-lg">
        <div className="flex items-center gap-2 text-white">
          <Clock className="w-5 h-5 text-accent-gold" />
          <div>
            <p className="text-xs text-gray-300">Time Remaining</p>
            <p className="font-bold text-lg">{getTimeRemaining()}</p>
          </div>
        </div>
      </div>

      {/* Auction Details */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1">Ends on</p>
        <p className="text-sm font-semibold text-black">
          {new Date(auction.endTime).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default BidPanel;