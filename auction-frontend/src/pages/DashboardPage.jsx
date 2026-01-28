import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Gavel, Trophy, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { usersAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-black">Failed to load dashboard</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Auctions Created',
      value: stats.totalAuctionsCreated,
      icon: <Gavel className="w-8 h-8" />,
      color: 'bg-blue-500',
      subtitle: `${stats.activeAuctions} active`
    },
    {
      title: 'Total Bids Placed',
      value: stats.totalBidsPlaced,
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-accent-gold',
      subtitle: `${stats.currentlyWinning} currently winning`
    },
    {
      title: 'Auctions Won',
      value: stats.auctionsWon,
      icon: <Trophy className="w-8 h-8" />,
      color: 'bg-accent-green',
      subtitle: 'Completed'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="w-8 h-8" />,
      color: 'bg-purple-500',
      subtitle: `Spent: $${stats.totalSpent.toFixed(2)}`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black flex items-center gap-3">
          <span className="w-2 h-10 bg-accent-gold rounded"></span>
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Overview of your auction activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-black transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${card.color} text-white rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-black mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Auctions */}
        <div className="bg-white rounded-lg border-2 border-black p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
              <Gavel className="w-6 h-6 text-accent-gold" />
              My Recent Auctions
            </h2>
            <button
              onClick={() => navigate('/my-auctions')}
              className="text-sm text-black hover:text-accent-gold font-semibold"
            >
              View All →
            </button>
          </div>

          {stats.recentAuctions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No auctions created yet</p>
              <button
                onClick={() => navigate('/create-auction')}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-primary-light font-semibold"
              >
                Create Your First Auction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentAuctions.map((auction) => (
                <div
                  key={auction.id}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-black transition cursor-pointer"
                  onClick={() => navigate(`/auctions/${auction.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-black mb-1">{auction.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Current: ${auction.currentPrice}</span>
                        <span>•</span>
                        <span>{auction.totalBids} bids</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      auction.status === 'ACTIVE' ? 'bg-accent-green text-white' :
                      auction.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {auction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-lg border-2 border-black p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent-gold" />
              My Recent Bids
            </h2>
            <button
              onClick={() => navigate('/my-bids')}
              className="text-sm text-black hover:text-accent-gold font-semibold"
            >
              View All →
            </button>
          </div>

          {stats.recentBids.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No bids placed yet</p>
              <button
                onClick={() => navigate('/auctions')}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-primary-light font-semibold"
              >
                Browse Auctions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentBids.map((bid) => (
                <div
                  key={bid.id}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-black transition cursor-pointer"
                  onClick={() => navigate(`/auctions/${bid.auctionId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-black">Auction #{bid.auctionId}</p>
                        {bid.isWinning && (
                          <span className="px-2 py-0.5 bg-accent-gold text-black rounded-full text-xs font-bold">
                            Winning
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(bid.bidTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-black">${bid.amount}</p>
                      <button className="text-xs text-black hover:text-accent-gold font-semibold flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-black to-primary-light rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/create-auction')}
            className="p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition text-left"
          >
            <Gavel className="w-6 h-6 text-accent-gold mb-2" />
            <h3 className="font-bold mb-1">Create Auction</h3>
            <p className="text-sm text-gray-300">List a new item for bidding</p>
          </button>

          <button
            onClick={() => navigate('/auctions')}
            className="p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition text-left"
          >
            <TrendingUp className="w-6 h-6 text-accent-gold mb-2" />
            <h3 className="font-bold mb-1">Browse Auctions</h3>
            <p className="text-sm text-gray-300">Find items to bid on</p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition text-left"
          >
            <Clock className="w-6 h-6 text-accent-gold mb-2" />
            <h3 className="font-bold mb-1">View Profile</h3>
            <p className="text-sm text-gray-300">Manage your account</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;