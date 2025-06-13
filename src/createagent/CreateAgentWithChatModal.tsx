import React, { useState, useEffect } from 'react';

// Declare the ElevenLabs ConvAI widget for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'agent-id'?: string;
      }, HTMLElement>;
    }
  }
}
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Globe, 
  Building2,
  MessageCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import CreateAgentForm from './CreateAgentForm';
import { getAgentDetails } from './services/agentCreationService';

interface CreateAgentWithChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOnWebsite?: (agentId: string, websiteUrl: string) => void;
}

interface CreatedAgentData {
  agentId: string;
  agentName: string;
  companyName: string;
  websiteUrl: string;
  email: string;
}

interface AgentDetails {
  agent_id: string;
  name: string;
  conversation_config?: {
    agent?: {
      prompt?: {
        prompt: string;
      };
      first_message?: string;
      language?: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

const CreateAgentWithChatModal = ({ isOpen, onClose, onViewOnWebsite }: CreateAgentWithChatModalProps) => {
  const [currentStep, setCurrentStep] = useState<'create' | 'chat'>('create');
  const [createdAgent, setCreatedAgent] = useState<CreatedAgentData | null>(null);
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const { toast } = useToast();

  // Load ElevenLabs widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.onload = () => {
      setIsWidgetLoaded(true);
      console.log('ElevenLabs ConvAI widget loaded');
    };
    script.onerror = () => {
      console.error('Failed to load ElevenLabs ConvAI widget');
      toast({
        title: "Widget Load Error",
        description: "Failed to load voice chat widget. Please refresh the page.",
        variant: "destructive"
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [toast]);

  const handleAgentCreated = async (agentId: string, agentData: any) => {
    // Store the created agent data
    const agentInfo: CreatedAgentData = {
      agentId,
      agentName: agentData.agentName,
      companyName: agentData.companyName,
      websiteUrl: agentData.websiteUrl,
      email: agentData.email
    };
    
    setCreatedAgent(agentInfo);
    
    // Load agent details from ElevenLabs
    try {
      setIsLoadingAgent(true);
      const details = await getAgentDetails(agentId);
      setAgentDetails(details);
      console.log('Loaded agent details:', details);
    } catch (error) {
      console.error('Error loading agent details:', error);
      toast({
        title: "Warning",
        description: "Agent created but could not load details. Voice chat may still work.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAgent(false);
    }
    
    // Switch to chat view
    setCurrentStep('chat');
    
    toast({
      title: "Agent Created!",
      description: `${agentInfo.agentName} is ready. If knowledge base isn't automatically added, please add it manually via the dashboard.`,
      duration: 8000
    });
  };

  const handleBackToCreation = () => {
    setCurrentStep('create');
    setCreatedAgent(null);
    setAgentDetails(null);
  };

  const handleCloseModal = () => {
    // Reset state
    setCurrentStep('create');
    setCreatedAgent(null);
    setAgentDetails(null);
    onClose();
  };

  const handleViewOnWebsite = () => {
    if (createdAgent && onViewOnWebsite) {
      onViewOnWebsite(createdAgent.agentId, createdAgent.websiteUrl);
      handleCloseModal();
    }
  };

  const renderCreationStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Create Your Voice Agent</DialogTitle>
        <DialogDescription>
          Fill in the details to create your AI voice agent with knowledge base
        </DialogDescription>
      </DialogHeader>
      
      <CreateAgentForm 
        onSuccess={handleAgentCreated}
        onCancel={handleCloseModal}
      />
    </>
  );

  const renderChatStep = () => {
    if (!createdAgent) return null;

    return (
      <>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToCreation}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Agent Created Successfully!</span>
              </DialogTitle>
              <DialogDescription>
                Your AI agent is ready. Start a voice conversation to test it.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">
                      {agentDetails?.name || createdAgent.agentName}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      ID: {createdAgent.agentId}
                    </CardDescription>
                  </div>
                </div>
                                 <Badge variant="outline" className="bg-green-500 text-white text-xs">
                   Ready
                 </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3 h-3 text-gray-500" />
                  <span className="text-xs">{createdAgent.companyName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-3 h-3 text-gray-500" />
                  <a 
                    href={createdAgent.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {createdAgent.websiteUrl}
                  </a>
                </div>
              </div>
              
              {agentDetails?.conversation_config?.agent?.first_message && (
                <div className="mt-3 p-2 bg-blue-50 rounded-md">
                  <div className="flex items-start space-x-2">
                    <MessageCircle className="w-3 h-3 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-800">First Message:</p>
                      <p className="text-xs text-blue-700">
                        "{agentDetails.conversation_config.agent.first_message}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 p-2 bg-green-50 rounded-md">
                <div className="flex items-start space-x-2">
                  <Globe className="w-3 h-3 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-green-800">Knowledge Base:</p>
                    <p className="text-xs text-green-700">
                      Processing {createdAgent.companyName} website content...
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Your agent is being configured with website knowledge.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ElevenLabs ConvAI Widget */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Voice Chat</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Your agent has been created with knowledge from your website. Click the microphone below to start talking.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Widget Status */}
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isWidgetLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-sm font-medium">
                      {isWidgetLoaded ? 'Widget Ready' : 'Loading Widget...'}
                    </span>
                  </div>
                </div>

                {/* ElevenLabs ConvAI Widget Container */}
                <div className="flex justify-center">
                  {isWidgetLoaded && createdAgent ? (
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: `<elevenlabs-convai agent-id="${createdAgent.agentId}"></elevenlabs-convai>`
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center p-8 text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Loading voice chat widget...</span>
                    </div>
                  )}
                </div>

                {/* Help Text */}
                <div className="text-center text-xs text-gray-600">
                  <p>Click the microphone icon above to start voice conversation</p>
                  <p>Your agent includes knowledge from {createdAgent.websiteUrl} and can answer questions about {createdAgent.companyName}</p>
                </div>

                {/* External Link */}
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://elevenlabs.io/app/conversational-ai/agents/${createdAgent.agentId}`, '_blank')}
                    className="text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Agent in Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button variant="outline" onClick={handleBackToCreation} className="flex-1">
              Create Another Agent
            </Button>
            <Button onClick={handleViewOnWebsite} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Globe className="w-4 h-4 mr-2" />
              View on Website
            </Button>
            <Button variant="outline" onClick={handleCloseModal}>
              Close
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        {isLoadingAgent ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading agent details...</span>
          </div>
        ) : (
          currentStep === 'create' ? renderCreationStep() : renderChatStep()
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentWithChatModal; 