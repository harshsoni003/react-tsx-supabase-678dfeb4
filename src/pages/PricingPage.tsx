import React from 'react';
import { PricingSection, Navbar } from '@/components/landing';

const PricingPage = () => {
  const handleCreateAgent = () => {
    console.log('Create agent clicked');
    // Add your implementation here
  };

  const handleSignOut = () => {
    console.log('Sign out clicked');
    // Add your implementation here
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCreateAgent={handleCreateAgent} isLoggedIn={false} onSignOut={handleSignOut} />
      <div className="pt-24">
        <PricingSection onCreateAgent={handleCreateAgent} />
      </div>
    </div>
  );
};

export default PricingPage; 