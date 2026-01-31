import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 AuctionHub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-accent-gold transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-accent-gold transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;