import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, AlertCircle } from 'lucide-react';
import { auctionsAPI } from '../services/api';

const PriceInsights = ({ auctionId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceInsights();
  }, [auctionId]);

  const fetchPriceInsights = async () => {
    try {
      const response = await auctionsAPI.getPriceInsights(auctionId);
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to fetch price insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }

  if (!insights || insights.priceComparison === 'insufficient_data') {
    return (
      <div className="bg-yellow-50 rounded-lg border-2 border-yellow-300 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-black mb-1">No Price Data Yet</p>
            <p className="text-sm text-gray-700">
              Not enough completed auctions in this category to provide price insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getComparisonColor = () => {
    switch (insights.priceComparison) {
      case 'below_average':
        return 'from-green-500 to-green-600';
      case 'above_average':
        return 'from-red-500 to-red-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getComparisonIcon = () => {
    if (insights.percentageDifference < -5) {
      return <TrendingDown className="w-5 h-5" />;
    } else if (insights.percentageDifference > 5) {
      return <TrendingUp className="w-5 h-5" />;
    }
    return <Minus className="w-5 h-5" />;
  };

  const getComparisonText = () => {
    const absPercentage = Math.abs(insights.percentageDifference);
    if (insights.percentageDifference < 0) {
      return `${absPercentage}% below average`;
    } else if (insights.percentageDifference > 0) {
      return `${absPercentage}% above average`;
    }
    return 'Average price';
  };

  return (
    <div className={`bg-gradient-to-br ${getComparisonColor()} rounded-lg border-2 border-black p-4 text-white`}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5" />
        <h3 className="font-bold">Price Insights</h3>
      </div>

      {/* Comparison Badge */}
      <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getComparisonIcon()}
            <span className="font-bold text-lg">{getComparisonText()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white bg-opacity-20 rounded p-2">
          <p className="text-xs opacity-90 mb-1">Average</p>
          <p className="font-bold">${insights.averagePrice.toFixed(2)}</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-2">
          <p className="text-xs opacity-90 mb-1">Low</p>
          <p className="font-bold">${insights.minPrice.toFixed(2)}</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-2">
          <p className="text-xs opacity-90 mb-1">High</p>
          <p className="font-bold">${insights.maxPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white bg-opacity-20 rounded-lg p-3">
        <p className="text-sm font-semibold mb-1">💡 Recommendation:</p>
        <p className="text-sm opacity-95">{insights.recommendation}</p>
      </div>

      <p className="text-xs opacity-75 mt-3">
        Based on {insights.totalSoldItems} completed auction{insights.totalSoldItems !== 1 ? 's' : ''} in this category
      </p>
    </div>
  );
};

export default PriceInsights;