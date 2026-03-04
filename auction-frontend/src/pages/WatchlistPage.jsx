import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, RefreshCw, Trash2 } from 'lucide-react';
import { watchlistAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const response = await watchlistAPI.getMyWatchlist();
      setWatchlist(response.data);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (auctionId) => {
    try {
      await watchlistAPI.removeFromWatchlist(auctionId);
      setWatchlist(watchlist.filter(item => item.auction.id !== auctionId));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      alert('Failed to remove from watchlist');
    }
  };

  const handleCardClick = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-20">
          <div className="text-2xl font-bold text-gray-600">Loading your watchlist...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-black flex items-center gap-3">
            <span className="w-2 h-10 bg-accent-gold rounded"></span>
            My Watchlist
          </h1>
          <p className="text-gray-600 mt-2">
            {watchlist.length} auction{watchlist.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        <button
          onClick={fetchWatchlist}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-primary-light transition disabled:opacity-50 font-semibold"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-2">Your Watchlist is Empty</h3>
          <p className="text-gray-600 mb-6">
            Start adding auctions to your watchlist to keep track of items you're interested in
          </p>
          <button
            onClick={() => navigate('/auctions')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-primary-light font-semibold"
          >
            Browse Auctions
          </button>
        </div>
      ) : (
        /* Watchlist Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((item) => (
            <div key={item.id} className="relative">
              {/* Remove Button */}
              <button
                onClick={() => handleRemoveFromWatchlist(item.auction.id)}
                className="absolute -top-2 -right-2 z-20 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition"
                title="Remove from watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Auction Card */}
              <AuctionCard
                auction={item.auction}
                onClick={() => handleCardClick(item.auction.id)}
                isInWatchlist={true}
              />

              {/* Added Date */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                Added {new Date(item.addedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      {watchlist.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-accent-gold to-yellow-500 rounded-lg p-6 text-black">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Watchlist Tips
          </h3>
          <ul className="space-y-1 text-sm">
            <li>• Click the heart icon on any auction to add it to your watchlist</li>
            <li>• Get notified when auctions you're watching are ending soon (coming soon!)</li>
            <li>• Remove items from your watchlist anytime</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;