import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, TrendingUp, Gavel, Wifi, WifiOff } from 'lucide-react';
import { auctionsAPI, bidsAPI } from '../services/api';
import BidPanel from '../components/BidPanel';
import websocketService from '../services/websocket';

const AuctionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
    fetchBids();

    // Connect to WebSocket
    websocketService.connect(
      () => {
        setWsConnected(true);
        subscribeToAuction();
      },
      (error) => {
        console.error('WebSocket connection failed:', error);
        setWsConnected(false);
      }
    );

    // Cleanup
    return () => {
      websocketService.unsubscribeFromAuction(id);
    };
  }, [id]);

  const subscribeToAuction = () => {
    // Subscribe to bid updates
    websocketService.subscribeToAuction(id, (bidNotification) => {
      console.log('🔔 New bid received!', bidNotification);
      
      // Update auction with new bid data
      setAuction(prev => ({
        ...prev,
        currentPrice: bidNotification.currentPrice,
        winnerUsername: bidNotification.bidderUsername,
        totalBids: bidNotification.totalBids
      }));

      // Add new bid to bid history at top
      const newBid = {
        id: Date.now(), // Temporary ID
        auctionId: id,
        bidderUsername: bidNotification.bidderUsername,
        amount: bidNotification.amount,
        bidTime: bidNotification.bidTime,
        isWinning: true
      };

      setBids(prevBids => {
        // Mark all other bids as not winning
        const updatedBids = prevBids.map(bid => ({
          ...bid,
          isWinning: false
        }));
        // Add new bid at the top
        return [newBid, ...updatedBids];
      });
    });

    // Subscribe to status updates
    websocketService.subscribeToAuctionStatus(id, (statusNotification) => {
      console.log('🔔 Status update received!', statusNotification);
      setAuction(prev => ({
        ...prev,
        status: statusNotification.status
      }));
    });
  };

  const fetchAuctionDetails = async () => {
    try {
      const response = await auctionsAPI.getById(id);
      setAuction(response.data);
    } catch (error) {
      console.error('Failed to fetch auction:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await bidsAPI.getAuctionBids(id);
      setBids(response.data);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    }
  };

  const handleBidSuccess = () => {
    // Don't need to fetch manually - WebSocket will update
    console.log('✅ Bid placed, waiting for WebSocket update...');
  };

  const getTimeRemaining = () => {
    if (!auction) return '';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Auction Not Found</h2>
          <button
            onClick={() => navigate('/auctions')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-primary-light"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back Button & Connection Status */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/auctions')}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Auctions</span>
        </button>

        {/* WebSocket Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
          wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {wsConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              Live Updates Active
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              Reconnecting...
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center border-2 border-black">
            <Gavel className="w-32 h-32 text-gray-400" />
          </div>

          {/* Auction Info */}
          <div className="bg-white rounded-lg border-2 border-black p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">{auction.title}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Seller: <span className="font-semibold text-black">{auction.sellerUsername}</span></span>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                auction.status === 'ACTIVE' ? 'bg-accent-green text-white' :
                auction.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {auction.status}
              </span>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              {auction.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t-2 border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">Starting Price</p>
                <p className="text-xl font-bold text-black">${auction.startingPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Price</p>
                <p className="text-2xl font-bold text-accent-gold">${auction.currentPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Bids</p>
                <p className="text-xl font-bold text-black">{auction.totalBids || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Time Left</p>
                <p className="text-xl font-bold text-black">{getTimeRemaining()}</p>
              </div>
            </div>
          </div>

          {/* Bid History */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent-gold" />
              Bid History
            </h2>
            
            {bids.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No bids yet. Be the first to bid!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bids.map((bid, index) => (
                  <div
                    key={bid.id || index}
                    className={`flex items-center justify-between p-4 rounded-lg transition ${
                      bid.isWinning ? 'bg-accent-gold bg-opacity-20 border-2 border-accent-gold' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-black">{bid.bidderUsername}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bid.bidTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-black">${bid.amount}</p>
                      {bid.isWinning && (
                        <p className="text-xs text-accent-gold font-semibold">Winning Bid</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bid Panel - Right Side */}
        <div className="lg:col-span-1">
          <BidPanel auction={auction} onBidSuccess={handleBidSuccess} />
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;