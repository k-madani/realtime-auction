import React, { useState, useEffect } from 'react';
import { Gavel, AlertCircle, TrendingUp, Lock, CheckCircle } from 'lucide-react';
import { bidsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TotalCostCalculator from './TotalCostCalculator';
import PriceInsights from './PriceInsights';

const BidPanel = ({ auction, onBidSuccess }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Reset messages when auction changes
    setError('');
    setSuccess('');
  }, [auction?.id]);

  const getMinimumBid = () => {
    if (!auction) return 0;
    const currentPrice = parseFloat(auction.currentPrice);
    const increment = currentPrice < 100 ? 5 : currentPrice < 500 ? 10 : 25;
    return (currentPrice + increment).toFixed(2);
  };

  const handleBidChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setBidAmount(value);
      setError('');
      setSuccess('');
    }
  };

  const validateBid = () => {
    const bid = parseFloat(bidAmount);
    const minBid = parseFloat(getMinimumBid());

    if (!bidAmount || isNaN(bid)) {
      setError('Please enter a valid bid amount');
      return false;
    }

    if (bid < minBid) {
      setError(`Minimum bid is $${minBid}`);
      return false;
    }

    return true;
  };

  const handlePlaceBid = async () => {
    if (!validateBid()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await bidsAPI.placeBid({
        auctionId: auction.id,
        amount: parseFloat(bidAmount)
      });

      setSuccess('Bid placed successfully! 🎉');
      setBidAmount('');
      
      if (onBidSuccess) {
        onBidSuccess();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to place bid';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBid = () => {
    const minBid = getMinimumBid();
    setBidAmount(minBid);
  };

  if (!auction) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <p className="text-gray-600">Loading auction details...</p>
      </div>
    );
  }

  const isActive = auction.status === 'ACTIVE';
  const isPending = auction.status === 'PENDING';
  const isEnded = auction.status === 'ENDED';
  const isSeller = currentUser?.username === auction.sellerUsername;
  const isWinner = currentUser?.username === auction.winnerUsername;

  return (
    <div className="sticky top-6 space-y-6">
      {/* Main Bid Panel */}
      <div className="bg-white rounded-lg border-2 border-black p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
            <Gavel className="w-6 h-6 text-accent-gold" />
            Place Your Bid
          </h2>
          <p className="text-sm text-gray-600">
            Current bid: <span className="font-bold text-accent-gold">${auction.currentPrice}</span>
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-700 font-semibold">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Auction Status Messages */}
        {!isAuthenticated && (
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-700">
              <Lock className="w-4 h-4 inline mr-1" />
              Please login to place a bid
            </p>
          </div>
        )}

        {isSeller && (
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="text-sm text-yellow-700 font-semibold">
              You cannot bid on your own auction
            </p>
          </div>
        )}

        {isPending && (
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="text-sm text-yellow-700 font-semibold">
              Auction has not started yet
            </p>
          </div>
        )}

        {isEnded && (
          <div className="mb-4 p-3 bg-gray-50 border-l-4 border-gray-500 rounded">
            <p className="text-sm text-gray-700 font-semibold">
              {isWinner ? '🎉 You won this auction!' : 'This auction has ended'}
            </p>
          </div>
        )}

        {/* Bid Input Section */}
        {isActive && !isSeller && isAuthenticated && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-black mb-2">
                Your Bid Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                  $
                </span>
                <input
                  type="text"
                  value={bidAmount}
                  onChange={handleBidChange}
                  placeholder={getMinimumBid()}
                  className="w-full pl-8 pr-4 py-3 text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold focus:border-accent-gold"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Minimum: ${getMinimumBid()}
                </p>
                <button
                  onClick={handleQuickBid}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Use minimum →
                </button>
              </div>
            </div>

            {/* Total Cost Calculator */}
            {bidAmount && parseFloat(bidAmount) > 0 && (
              <TotalCostCalculator 
                auctionId={auction.id} 
                bidAmount={parseFloat(bidAmount)} 
              />
            )}

            {/* Place Bid Button */}
            <button
              onClick={handlePlaceBid}
              disabled={loading || !bidAmount}
              className="w-full mt-4 px-6 py-4 bg-accent-gold text-black rounded-lg hover:bg-yellow-500 font-bold text-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Placing Bid...
                </>
              ) : (
                <>
                  <Gavel className="w-5 h-5" />
                  Place Bid
                </>
              )}
            </button>

            {/* Bidding Tips */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold mb-2">💡 Bidding Tips:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Bids are binding and cannot be cancelled</li>
                <li>• You'll be notified if you're outbid</li>
                <li>• Check total cost including fees</li>
              </ul>
            </div>
          </>
        )}

        {/* Current Winner Display */}
        {auction.winnerUsername && (
          <div className="mt-4 p-3 bg-gradient-to-r from-accent-gold to-yellow-500 rounded-lg">
            <div className="flex items-center gap-2 text-black">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Current Winner: {auction.winnerUsername}
                {isWinner && ' (You!)'}
              </span>
            </div>
          </div>
        )}

        {/* Auction Stats */}
        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Bids</p>
              <p className="text-2xl font-bold text-black">{auction.totalBids || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Starting Price</p>
              <p className="text-2xl font-bold text-black">${auction.startingPrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Insights Panel */}
      <PriceInsights auctionId={auction.id} />
    </div>
  );
};

export default BidPanel;