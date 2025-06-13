import React, { useState } from 'react';
import CreateAgentWithChatModal from './CreateAgentWithChatModal';
import { useToast } from '@/hooks/use-toast';

const CreateAgentPage = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(true); // Start with modal open for this page
  const [showWebsite, setShowWebsite] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleViewOnWebsite = (createdAgentId: string, url: string) => {
    setAgentId(createdAgentId);
    setWebsiteUrl(url);
    setShowWebsite(true);
    setIsModalOpen(false);
  };

  const handleBackToForm = () => {
    setShowWebsite(false);
    setAgentId(null);
    setWebsiteUrl(null);
    setIsModalOpen(true);
  };

  // If showing website with widget
  if (showWebsite && websiteUrl && agentId) {
    return (
      <div className="relative w-full h-screen">
        {/* Website iframe */}
        <iframe
          src={websiteUrl}
          className="w-full h-full border-0"
          title="Customer Website"
          sandbox="allow-scripts allow-same-origin allow-forms allow-navigation"
        />
        
        {/* ElevenLabs Widget positioned in bottom right */}
        <div className="fixed bottom-6 right-6 z-50">
          {React.createElement('elevenlabs-convai', {
            'agent-id': agentId,
            variant: 'full',
            'avatar-orb-color-1': '#4D9CFF',
            'avatar-orb-color-2': '#9CE6E6'
          })}
        </div>
        
        {/* Back button */}
        <button
          onClick={handleBackToForm}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-lg border border-gray-200 transition-colors"
        >
          ← Create New Agent
        </button>
      </div>
    );
  }

  // If modal is closed and no website to show, show the form page
  if (!isModalOpen && !showWebsite) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Agent</h1>
            <p className="mt-2 text-gray-600">
              Set up your AI voice agent in just a few steps
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Open Agent Creator
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team or check the documentation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateAgentWithChatModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewOnWebsite={handleViewOnWebsite}
      />
    </>
  );
};

export default CreateAgentPage; 