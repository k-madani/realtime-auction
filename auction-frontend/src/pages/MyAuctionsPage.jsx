import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Plus, RefreshCw, ExternalLink, TrendingUp } from 'lucide-react';
import { auctionsAPI } from '../services/api';

const MyAuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    setLoading(true);
    try {
      const response = await auctionsAPI.getMyAuctions();
      setAuctions(response.data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    if (filterStatus === 'ALL') return true;
    return auction.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-accent-green text-white';
      case 'PENDING':
        return 'bg-yellow-500 text-white';
      case 'ENDED':
        return 'bg-gray-500 text-white';
      case 'CANCELLED':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-20">
          <div className="text-2xl font-bold text-gray-600">Loading your auctions...</div>
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
            My Auctions
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchMyAuctions}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/create-auction')}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-primary-light transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Auction
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['ALL', 'ACTIVE', 'PENDING', 'ENDED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              filterStatus === status
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredAuctions.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-black mb-2">
            {auctions.length === 0 ? 'No Auctions Yet' : 'No Matching Auctions'}
          </h3>
          <p className="text-gray-600 mb-6">
            {auctions.length === 0
              ? 'Create your first auction to start selling'
              : 'Try adjusting your filters'}
          </p>
          {auctions.length === 0 && (
            <button
              onClick={() => navigate('/create-auction')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-primary-light font-semibold"
            >
              Create Your First Auction
            </button>
          )}
        </div>
      ) : (
        /* Auctions Table */
        <div className="bg-white rounded-lg border-2 border-black overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Title</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-left font-bold">Current Price</th>
                  <th className="px-6 py-4 text-left font-bold">Bids</th>
                  <th className="px-6 py-4 text-left font-bold">Time Remaining</th>
                  <th className="px-6 py-4 text-left font-bold">Winner</th>
                  <th className="px-6 py-4 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuctions.map((auction) => (
                  <tr key={auction.id} className="border-b border-gray-200 hover:bg-gray-50">
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-black line-clamp-1">{auction.title}</p>
                        <p className="text-sm text-gray-500">
                          Created {new Date(auction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(auction.status)}`}>
                        {auction.status}
                      </span>
                    </td>

                    {/* Current Price */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xl font-bold text-black">${auction.currentPrice}</p>
                        <p className="text-xs text-gray-500">Start: ${auction.startingPrice}</p>
                      </div>
                    </td>

                    {/* Bids */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent-gold" />
                        <span className="font-semibold text-black">{auction.totalBids}</span>
                      </div>
                    </td>

                    {/* Time Remaining */}
                    <td className="px-6 py-4">
                      {auction.status === 'ACTIVE' ? (
                        <p className="text-sm font-semibold text-black">
                          {getTimeRemaining(auction.endTime)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">-</p>
                      )}
                    </td>

                    {/* Winner */}
                    <td className="px-6 py-4">
                      {auction.winnerUsername ? (
                        <p className="text-sm font-semibold text-accent-gold">
                          {auction.winnerUsername}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">-</p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/auctions/${auction.id}`)}
                        className="flex items-center gap-2 text-black hover:text-accent-gold transition font-semibold"
                      >
                        <span className="text-sm">View</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {auctions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Total Auctions</p>
            <p className="text-3xl font-bold text-black">{auctions.length}</p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-accent-green">
              {auctions.filter(a => a.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Total Bids</p>
            <p className="text-3xl font-bold text-black">
              {auctions.reduce((sum, a) => sum + a.totalBids, 0)}
            </p>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-accent-gold">
              ${auctions
                .filter(a => a.status === 'ENDED')
                .reduce((sum, a) => sum + parseFloat(a.currentPrice), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAuctionsPage;