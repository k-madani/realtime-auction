import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { bidsAPI } from '../services/api';

const MyBidsPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    setLoading(true);
    try {
      const response = await bidsAPI.getMyBids();
      setBids(response.data);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-20">
          <div className="text-2xl font-bold text-gray-600">Loading your bids...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-black flex items-center gap-3">
          <span className="w-2 h-10 bg-accent-gold rounded"></span>
          My Bids
        </h1>
        <p className="text-gray-600 mt-2">
          {bids.length} bid{bids.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      {bids.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-black mb-2">No Bids Yet</h3>
          <p className="text-gray-600 mb-6">Start bidding on auctions to see them here</p>
          <button
            onClick={() => navigate('/auctions')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-primary-light font-semibold"
          >
            Browse Auctions
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-2 border-black overflow-hidden">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-6 py-4 text-left">Auction</th>
                <th className="px-6 py-4 text-left">Your Bid</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Bid Time</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid) => (
                <tr key={bid.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-black">Auction #{bid.auctionId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xl font-bold text-black">${bid.amount}</p>
                  </td>
                  <td className="px-6 py-4">
                    {bid.isWinning ? (
                      <span className="px-3 py-1 bg-accent-gold text-black rounded-full text-xs font-bold">
                        Winning
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                        Outbid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(bid.bidTime).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/auctions/${bid.auctionId}`)}
                      className="flex items-center gap-2 text-black hover:text-accent-gold transition"
                    >
                      <span className="font-semibold">View</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBidsPage;