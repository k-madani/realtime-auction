import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, Calculator } from 'lucide-react';
import { auctionsAPI } from '../services/api';

const TotalCostCalculator = ({ auctionId, bidAmount }) => {
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bidAmount && bidAmount > 0) {
      fetchCostBreakdown();
    }
  }, [bidAmount]);

  const fetchCostBreakdown = async () => {
    setLoading(true);
    try {
      const response = await auctionsAPI.getCostBreakdown(auctionId, bidAmount);
      setCostBreakdown(response.data);
    } catch (error) {
      console.error('Failed to fetch cost breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!costBreakdown || loading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-black">Total Cost Breakdown</h3>
      </div>

      <div className="space-y-2">
        {/* Bid Amount */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Your Bid
          </span>
          <span className="font-semibold text-black">
            ${costBreakdown.bidAmount.toFixed(2)}
          </span>
        </div>

        {/* Platform Fee */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Platform Fee ({costBreakdown.platformFeePercentage}%)
          </span>
          <span className="font-semibold text-black">
            ${costBreakdown.platformFee.toFixed(2)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 flex items-center gap-1">
            <Package className="w-4 h-4" />
            Shipping (estimate)
          </span>
          <span className="font-semibold text-black">
            ${costBreakdown.shippingEstimate.toFixed(2)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-blue-200 my-2"></div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-black">
            Total Cost
          </span>
          <span className="text-2xl font-bold text-blue-600">
            ${costBreakdown.totalCost.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-3">
        💡 This is your total commitment if you win this auction
      </p>
    </div>
  );
};

export default TotalCostCalculator;