import React from 'react';
import { UserPlus, Search, Gavel, Trophy } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-12 h-12" />,
      step: '01',
      title: 'Create Account',
      description: 'Sign up in seconds with just your email. No credit card required to start browsing auctions.',
    },
    {
      icon: <Search className="w-12 h-12" />,
      step: '02',
      title: 'Browse Auctions',
      description: 'Explore thousands of live auctions. Filter by category, price range, and ending time to find your perfect item.',
    },
    {
      icon: <Gavel className="w-12 h-12" />,
      step: '03',
      title: 'Place Your Bid',
      description: 'Submit your bid and watch real-time updates. Get instant notifications when someone outbids you.',
    },
    {
      icon: <Trophy className="w-12 h-12" />,
      step: '04',
      title: 'Win & Celebrate',
      description: 'Win the auction and receive instant confirmation. Secure checkout and fast delivery to your doorstep.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start bidding in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-1 bg-gradient-to-r from-accent-gold to-transparent -z-10"></div>
              )}
              
              <div className="bg-primary-light p-8 rounded-lg border-2 border-gray-800 hover:border-accent-gold transition group">
                <div className="text-6xl font-bold text-gray-800 mb-4">
                  {step.step}
                </div>
                
                <div className="w-16 h-16 bg-accent-gold text-black rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  {step.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-3">
                  {step.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;