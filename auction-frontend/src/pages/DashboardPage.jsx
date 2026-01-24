import React, { useState } from 'react';
import AuctionList from '../components/AuctionList';
import BidPanel from '../components/BidPanel';

const DashboardPage = () => {
  const [selectedAuction, setSelectedAuction] = useState(null);

  const handleSelectAuction = (auction) => {
    setSelectedAuction(auction);
    // Scroll to top on mobile for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBidSuccess = () => {
    // You can add notification logic here later
    console.log('Bid placed successfully!');
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auction List - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <AuctionList
            onSelectAuction={handleSelectAuction}
            selectedAuction={selectedAuction}
          />
        </div>

        {/* Bid Panel - 1 column on large screens */}
        <div className="lg:col-span-1">
          <BidPanel
            auction={selectedAuction}
            onBidSuccess={handleBidSuccess}
          />
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;