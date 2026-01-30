import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { paymentsAPI } from '../services/api';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchPaymentDetails();
    } else {
      setError('Invalid payment session');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await paymentsAPI.getBySessionId(sessionId);
      setPayment(response.data);
    } catch (err) {
      setError('Failed to retrieve payment details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-lg border-2 border-red-500 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-lg border-2 border-black shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-green-100">
              Your payment has been processed successfully
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8 space-y-6">
            {/* Auction Info */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Auction Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-semibold text-black">{payment.auctionTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-semibold text-black">{payment.sellerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${payment.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm text-gray-500">
                    #{payment.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-black">
                    {new Date(payment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <h3 className="font-bold text-black mb-3">📬 What's Next?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>The seller has been notified of your payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>You will receive shipping details via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Track your purchase in "My Payments" section</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => navigate(`/auctions/${payment.auctionId}`)}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition flex items-center justify-center gap-2"
              >
                View Auction
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/my-payments')}
                className="px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-50 font-bold transition flex items-center justify-center gap-2"
              >
                My Payments
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 font-bold transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <div className="mt-6 text-center text-sm text-gray-600">
          📧 A confirmation email has been sent to your registered email address
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;