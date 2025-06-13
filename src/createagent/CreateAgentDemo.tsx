import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Plus, MessageCircle, ArrowLeft } from 'lucide-react';
import CreateAgentWithChatModal from './CreateAgentWithChatModal';

const CreateAgentDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleViewOnWebsite = (createdAgentId: string, url: string) => {
    setAgentId(createdAgentId);
    setWebsiteUrl(url);
    setShowWebsite(true);
  };

  const handleBackToDemo = () => {
    setShowWebsite(false);
    setAgentId(null);
    setWebsiteUrl(null);
  };

  // Load ElevenLabs widget script when showing website
  useEffect(() => {
    if (showWebsite && agentId) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.head.appendChild(script);

      return () => {
        // Cleanup script on unmount
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [showWebsite, agentId]);

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
          onClick={handleBackToDemo}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-lg border border-gray-200 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Demo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Voice Agent Creator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create custom AI voice agents with your company knowledge base and start talking to them immediately
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Feature Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>Create Agent</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simple form to create custom AI voice agents with your company information and website knowledge
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span>Instant Voice Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Talk to your agent immediately after creation with real-time voice conversation
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <span>Knowledge Base</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your website content is automatically added to the agent's knowledge base for intelligent responses
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Ready to create your AI agent?</CardTitle>
              <CardDescription>
                Click below to open the agent creation wizard and start building your custom voice agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleOpenModal}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your Voice Agent
              </Button>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>✅ Quick setup - just fill in your company details</p>
                <p>✅ Automatic knowledge base integration</p>
                <p>✅ Instant voice testing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature List */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fill Agent Details</h3>
              <p className="text-gray-600">
                Enter your company information, website URL, and agent preferences
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Agent Created</h3>
              <p className="text-gray-600">
                Your agent is created with custom prompts and website knowledge automatically added
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Talking</h3>
              <p className="text-gray-600">
                Immediately test your agent with voice conversations using your knowledge base
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateAgentWithChatModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewOnWebsite={handleViewOnWebsite}
      />
    </div>
  );
};

export default CreateAgentDemo; 