import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

const LandingPage = ({ onGetStarted }) => {
  return (
    <>
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <HowItWorks />
      <Footer />
    </>
  );
};

export default LandingPage;