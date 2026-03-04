import React from 'react';
import { Gavel, TrendingUp, Zap } from 'lucide-react';

const Hero = ({ onGetStarted }) => {
  return (
    <section className="relative bg-gradient-to-br from-black via-primary-light to-black text-white py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent-gold opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-gold opacity-10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 p-4 bg-accent-gold/20 rounded-full backdrop-blur-sm">
            <Gavel className="w-16 h-16 text-accent-gold" />
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            Real-Time Auction
            <span className="block text-accent-gold mt-2">Experience</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Bid on exclusive items with instant updates. Experience the thrill of
            <span className="text-accent-gold font-semibold"> live competitive bidding</span> from anywhere in the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-accent-gold text-black rounded-lg hover:bg-yellow-500 text-lg font-bold transition shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Start Bidding Now
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-transparent border-2 border-accent-gold text-accent-gold rounded-lg hover:bg-accent-gold hover:text-black transition font-semibold"
            >
              View Features
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;