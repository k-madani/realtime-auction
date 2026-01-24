import React from 'react';
import { Zap, Shield, Clock, Bell, TrendingUp, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-Time Bidding',
      description: 'Experience instant bid updates with WebSocket technology. See every bid as it happens, no refresh needed.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Transactions',
      description: 'JWT authentication and encrypted connections ensure your bids and personal data are always protected.',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Live Countdowns',
      description: 'Track auction end times with precision. Automated notifications keep you informed of closing auctions.',
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Instant Notifications',
      description: 'Get notified immediately when you\'re outbid or when your target auctions are ending soon.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Bid History',
      description: 'View complete bidding history for any auction. Analyze trends and make informed decisions.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Global Competition',
      description: 'Compete with bidders worldwide. Join a thriving community of collectors and enthusiasts.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-4">
            Why Choose AuctionHub?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cutting-edge technology meets seamless user experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg border-2 border-gray-200 hover:border-black transition group hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-black text-accent-gold rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-gold group-hover:text-black transition">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;