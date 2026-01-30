import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, TrendingUp, Gavel, Wifi, WifiOff, Star, ChevronLeft, ChevronRight, CreditCard, Package } from 'lucide-react';
import { auctionsAPI, bidsAPI, reviewsAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BidPanel from '../components/BidPanel';
import ReviewModal from '../components/ReviewModal';
import StarRating from '../components/StarRating';
import websocketService from '../services/websocket';

const AuctionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Payment state
  const [payment, setPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // Review state
  const [canReview, setCanReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revieweeRole, setRevieweeRole] = useState(null);

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

  useEffect(() => {
    if (auction && auction.status === 'ENDED') {
      checkCanReview();
      fetchReviews();
      checkPaymentStatus();
    }
  }, [auction]);

  const subscribeToAuction = () => {
    // Subscribe to bid updates
    websocketService.subscribeToAuction(id, (bidNotification) => {
      console.log('📢 New bid received!', bidNotification);
      
      // Update auction with new bid data
      setAuction(prev => ({
        ...prev,
        currentPrice: bidNotification.currentPrice,
        winnerUsername: bidNotification.bidderUsername,
        totalBids: bidNotification.totalBids
      }));

      // Add new bid to bid history at top
      const newBid = {
        id: Date.now(),
        auctionId: id,
        bidderUsername: bidNotification.bidderUsername,
        amount: bidNotification.amount,
        bidTime: bidNotification.bidTime,
        isWinning: true
      };

      setBids(prevBids => {
        const updatedBids = prevBids.map(bid => ({
          ...bid,
          isWinning: false
        }));
        return [newBid, ...updatedBids];
      });
    });

    // Subscribe to status updates
    websocketService.subscribeToAuctionStatus(id, (statusNotification) => {
      console.log('📢 Status update received!', statusNotification);
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

  const checkPaymentStatus = async () => {
    try {
      const response = await paymentsAPI.getByAuctionId(id);
      setPayment(response.data);
    } catch (error) {
      // No payment exists yet - this is fine
      console.log('No payment found for auction');
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await reviewsAPI.canReviewAuction(id);
      setCanReview(response.data.canReview);
      
      if (response.data.canReview && currentUser) {
        const isWinner = auction.winnerUsername === currentUser.username;
        setRevieweeRole(isWinner ? 'SELLER' : 'BUYER');
      }
    } catch (error) {
      console.error('Failed to check review status:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getAuctionReviews(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleBidSuccess = () => {
    console.log('✅ Bid placed, waiting for WebSocket update...');
  };

  const handleReviewSubmitted = (success) => {
    setShowReviewModal(false);
    if (success) {
      setCanReview(false);
      fetchReviews();
      alert('Review submitted successfully!');
    }
  };

  // NEW: Handle payment
  const handlePayNow = async () => {
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const response = await paymentsAPI.createCheckout(id);
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.checkoutUrl;
    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Failed to create checkout session');
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  // NEW: Image navigation
  const nextImage = () => {
    if (auction?.imageUrls && auction.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === auction.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (auction?.imageUrls && auction.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? auction.imageUrls.length - 1 : prev - 1
      );
    }
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

  // Check if current user is the winner
  const isWinner = currentUser && auction && auction.winnerUsername === currentUser.username;
  const showPaymentButton = auction?.status === 'ENDED' && isWinner && !payment;

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
          {/* Image Carousel */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center border-2 border-black overflow-hidden">
            {auction.imageUrls && auction.imageUrls.length > 0 ? (
              <>
                {/* Main Image */}
                <img
                  src={auction.imageUrls[currentImageIndex]}
                  alt={`${auction.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />

                {/* Navigation Arrows (only show if multiple images) */}
                {auction.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {auction.imageUrls.length}
                    </div>
                  </>
                )}

                {/* Thumbnail Strip (bottom) */}
                {auction.imageUrls.length > 1 && (
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {auction.imageUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-12 h-12 rounded border-2 overflow-hidden transition ${
                          index === currentImageIndex
                            ? 'border-accent-gold scale-110'
                            : 'border-white opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Placeholder if no images */
              <Gavel className="w-32 h-32 text-gray-400" />
            )}
          </div>

          {/* Payment Alert (Winner Only - After Auction Ends) */}
          {showPaymentButton && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg border-2 border-black p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">🎉 Congratulations! You Won!</h3>
                  <p className="text-green-100 mb-4">
                    Complete your payment to finalize the purchase and receive shipping details.
                  </p>
                  {paymentError && (
                    <p className="text-red-200 bg-red-700 bg-opacity-50 rounded p-2 mb-4 text-sm">
                      {paymentError}
                    </p>
                  )}
                  <button
                    onClick={handlePayNow}
                    disabled={paymentLoading}
                    className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay ${auction.currentPrice.toFixed(2)} Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Completed Alert */}
          {payment && payment.status === 'COMPLETED' && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg border-2 border-black p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">✅ Payment Completed</h3>
                  <p className="text-blue-100 mb-2">
                    Your payment of ${payment.amount.toFixed(2)} has been processed successfully.
                  </p>
                  <p className="text-blue-200 text-sm">
                    Payment ID: #{payment.id} • {new Date(payment.paidAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Auction Info */}
          <div className="bg-white rounded-lg border-2 border-black p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">{auction.title}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Seller: <span className="font-semibold text-black">{auction.sellerUsername}</span></span>
                </div>
                {auction.categoryDisplay && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold border border-gray-300">
                      {auction.categoryDisplay}
                    </span>
                  </div>
                )}
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

          {/* Review Section - Only show for ended auctions */}
          {auction.status === 'ENDED' && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                  <Star className="w-6 h-6 text-accent-gold" />
                  Reviews
                </h2>
                
                {canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 bg-accent-gold text-black rounded-lg hover:bg-yellow-500 font-semibold transition"
                  >
                    Leave a Review
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No reviews yet. {canReview && 'Be the first to leave a review!'}
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-black">{review.reviewerUsername}</p>
                          <p className="text-xs text-gray-500">
                            Reviewed {review.revieweeUsername} as {review.revieweeRole.toLowerCase()}
                          </p>
                        </div>
                        <StarRating rating={review.rating} size="sm" showNumber={false} />
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bid Panel - Right Side */}
        <div className="lg:col-span-1">
          <BidPanel auction={auction} onBidSuccess={handleBidSuccess} />
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={handleReviewSubmitted}
        auction={auction}
        revieweeRole={revieweeRole}
      />
    </div>
  );
};

export default AuctionDetailPage;