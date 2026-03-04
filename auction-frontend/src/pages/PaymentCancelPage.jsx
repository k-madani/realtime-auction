import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Cancel Card */}
        <div className="bg-white rounded-lg border-2 border-black shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Cancelled
            </h1>
            <p className="text-red-100">
              Your payment was not completed
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Information */}
            <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
              <h2 className="text-lg font-bold text-black mb-3">
                What Happened?
              </h2>
              <p className="text-gray-700 mb-4">
                You cancelled the payment process or closed the payment window. 
                No charges were made to your account.
              </p>
              <div className="bg-white rounded p-4 border border-orange-300">
                <p className="text-sm text-gray-600">
                  💡 <strong>Note:</strong> If you're the winning bidder, you'll need 
                  to complete the payment to receive your item. The auction is still 
                  reserved for you.
                </p>
              </div>
            </div>

            {/* Reasons & Solutions */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-black mb-3">Common Reasons:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Changed your mind about the purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Need to update payment information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Accidentally closed the payment window</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Technical issues during checkout</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => navigate('/my-bids')}
                className="px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-50 font-bold transition flex items-center justify-center gap-2"
              >
                My Bids
                <ArrowLeft className="w-4 h-4" />
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

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="font-bold text-black mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you're experiencing technical issues or have questions about the 
            payment process, please contact support.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;