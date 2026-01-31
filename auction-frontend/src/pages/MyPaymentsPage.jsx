import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Package, Calendar, DollarSign, ExternalLink, Search, Filter, ChevronDown } from 'lucide-react';
import { paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyPaymentsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getMyPayments();
      setPayments(response.data);
    } catch (err) {
      setError('Failed to load payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.auctionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSpent = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black flex items-center gap-3">
          <span className="w-2 h-10 bg-accent-gold rounded"></span>
          My Payments
        </h1>
        <p className="text-gray-600 mt-2">Track your auction purchases and payment history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg border-2 border-black p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8" />
            <span className="text-2xl font-bold">{payments.filter(p => p.status === 'COMPLETED').length}</span>
          </div>
          <p className="text-green-100 text-sm font-semibold">Completed Payments</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg border-2 border-black p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <span className="text-2xl font-bold">${totalSpent.toFixed(2)}</span>
          </div>
          <p className="text-blue-100 text-sm font-semibold">Total Spent</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg border-2 border-black p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8" />
            <span className="text-2xl font-bold">{payments.length}</span>
          </div>
          <p className="text-purple-100 text-sm font-semibold">Total Purchases</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border-2 border-black p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by auction or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black appearance-none bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-black mb-2">
            {searchTerm || statusFilter !== 'ALL' ? 'No Payments Found' : 'No Payments Yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Win an auction and complete payment to see your purchase history here'}
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <button
              onClick={() => navigate('/auctions')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition"
            >
              Browse Auctions
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg border-2 border-black p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Payment Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-black mb-1 flex items-center gap-2">
                        {payment.auctionTitle}
                        <button
                          onClick={() => navigate(`/auctions/${payment.auctionId}`)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </h3>
                      <p className="text-sm text-gray-600">
                        Seller: <span className="font-semibold text-black">{payment.sellerName}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="text-2xl font-bold text-accent-gold">${payment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payment Date</p>
                      <p className="text-sm font-semibold text-black flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {payment.paidAt 
                          ? new Date(payment.paidAt).toLocaleDateString()
                          : new Date(payment.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payment ID</p>
                      <p className="text-sm font-mono text-gray-600">#{payment.id}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/auctions/${payment.auctionId}`)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition whitespace-nowrap"
                  >
                    View Auction
                  </button>
                  {payment.status === 'COMPLETED' && (
                    <button
                      onClick={() => {
                        // You can add a download receipt feature here
                        alert('Receipt download coming soon!');
                      }}
                      className="px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-gray-50 font-bold transition whitespace-nowrap"
                    >
                      Download Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {filteredPayments.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredPayments.length} of {payments.length} payment{payments.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default MyPaymentsPage;