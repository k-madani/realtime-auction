import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import AuctionCard from './AuctionCard';
import { auctionsAPI } from '../services/api';

const AuctionList = ({ onSelectAuction, selectedAuction }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await auctionsAPI.getAll();
      setAuctions(response.data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || auction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black flex items-center gap-3">
            <span className="w-2 h-8 bg-accent-gold rounded"></span>
            Live Auctions
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <button
          onClick={fetchAuctions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-primary-light transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search auctions by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black appearance-none bg-white cursor-pointer min-w-[180px]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-5 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredAuctions.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-lg border-2 border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">No auctions found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'ALL'
              ? 'Try adjusting your search or filter'
              : 'No auctions available at the moment'}
          </p>
        </div>
      ) : (
        /* Auction Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onSelect={onSelectAuction}
              isSelected={selectedAuction?.id === auction.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionList;