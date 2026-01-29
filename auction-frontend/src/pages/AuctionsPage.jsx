import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
import { auctionsAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';

const AuctionsPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    endTimeFilter: '',
    sortBy: 'endingSoon'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await auctionsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await auctionsAPI.getAllActive();
      setAuctions(response.data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchParams = {
        keyword: searchTerm || null,
        status: filters.status || null,
        category: filters.category || null,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
        endTimeFilter: filters.endTimeFilter || null,
        sortBy: filters.sortBy || 'endingSoon'
      };

      const response = await auctionsAPI.search(searchParams);
      setAuctions(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      endTimeFilter: '',
      sortBy: 'endingSoon'
    });
    fetchAuctions();
  };

  const handleCardClick = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-black flex items-center gap-3">
            <span className="w-2 h-10 bg-accent-gold rounded"></span>
            Live Auctions
          </h1>
          <p className="text-gray-600 mt-2">
            {auctions.length} auction{auctions.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <button
          onClick={fetchAuctions}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-primary-light transition disabled:opacity-50 font-semibold"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-8 py-4 bg-black text-white rounded-lg hover:bg-primary-light font-semibold transition"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 rounded-lg font-semibold transition flex items-center gap-2 ${
              showFilters ? 'bg-accent-gold text-black' : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border-2 border-black p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-black flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.displayNameWithEmoji}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Min Price</label>
              <input
                type="number"
                placeholder="$0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Max Price</label>
              <input
                type="number"
                placeholder="Any"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* End Time Filter */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Ending Within</label>
              <select
                value={filters.endTimeFilter}
                onChange={(e) => handleFilterChange('endTimeFilter', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Any Time</option>
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="endingSoon">Ending Soonest</option>
                <option value="newest">Newest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="mostBids">Most Bids</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="mt-4 w-full py-3 bg-black text-white rounded-lg hover:bg-primary-light font-semibold transition"
          >
            Apply Filters
          </button>
        </div>
      )}

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
      ) : auctions.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-lg border-2 border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-2">No auctions found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filters).some(v => v)
              ? 'Try adjusting your search or filters'
              : 'No active auctions available at the moment'}
          </p>
          {(searchTerm || Object.values(filters).some(v => v)) && (
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-primary-light font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* Auction Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onClick={() => handleCardClick(auction.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionsPage;