import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
import WebsiteIframe from '@/components/ui/WebsiteIframe';

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
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micPermissionRequested, setMicPermissionRequested] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load ElevenLabs widget script
  useEffect(() => {
    // Check if script already exists
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
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
      document.body.appendChild(script);

      return () => {
        // Clean up script when component unmounts
        const scriptElement = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement);
        }
      };
    } else {
      // Script already exists, just set widget as loaded
      setIsWidgetLoaded(true);
    }
  }, [toast]);

  // Request microphone permissions when widget is loaded
  useEffect(() => {
    const requestMicrophonePermission = async () => {
      if (isWidgetLoaded && !micPermissionRequested && createdAgent) {
        setMicPermissionRequested(true);
        try {
          // Request microphone permission
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicPermissionGranted(true);
          console.log('Microphone permission granted');
          
          // Stop the stream immediately as we just needed permission
          stream.getTracks().forEach(track => track.stop());
          
          toast({
            title: "Microphone Access Granted",
            description: "You can now use voice chat with your agent.",
          });
        } catch (error) {
          console.error('Microphone permission denied:', error);
          setMicPermissionGranted(false);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice chat.",
            variant: "destructive"
          });
        }
      }
    };

    requestMicrophonePermission();
  }, [isWidgetLoaded, micPermissionRequested, createdAgent, toast]);

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
    
    // Instead of switching to chat view in modal, navigate to the agent page
    navigate(`/agent/${agentId}`, { state: { agent: agentInfo } });
    // Close the modal after navigation
    onClose();
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
                <span>Your Agent is Ready</span>
              </DialogTitle>
              <DialogDescription>
                Start a voice conversation to test your new assistant.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Website Visualization */}
          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div className="w-full h-72 bg-gray-100 relative">
                <WebsiteIframe 
                  src={createdAgent.websiteUrl}
                  title="Website Preview"
                  className="w-full h-full border-none"
                  fallbackMessage="This website cannot be embedded in the preview, but your agent can still access its content for knowledge."
                  showFallbackOptions={true}
                  onLoadError={() => {
                    toast({
                      title: "Website Preview Unavailable",
                      description: "The website preview cannot be shown due to security restrictions, but your agent can still use its content.",
                      variant: "default"
                    });
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src="/DYOTA_logo-removebg-preview.png" alt="DYOTA Logo" className="h-12 w-auto" />
                      <span className="text-white font-semibold">Voice Bolt</span>
                    </div>
                    <a 
                      href={createdAgent.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:underline text-sm flex items-center pointer-events-auto"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open Website
                    </a>
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
          
              </CardTitle>
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
                    micPermissionGranted ? (
                      <div>
                        {React.createElement('elevenlabs-convai', {
                          'agent-id': createdAgent.agentId,
                          'variant': 'compact',
                          'text-input': 'false',
                          'text-only-mode': 'false'
                        })}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center max-w-md">
                        <div className="flex items-center mb-3">
                          <MessageCircle className="w-5 h-5 text-orange-500 mr-2" />
                          <span className="text-lg font-medium">Microphone Access Required</span>
                        </div>
                        <p className="text-sm text-gray-600 text-center mb-4">
                          To start voice chat with your agent, please allow microphone access when prompted.
                        </p>
                        <Button 
                          onClick={() => window.location.reload()}
                          size="sm"
                        >
                          Refresh Page
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center p-8 text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Loading voice chat widget...</span>
                    </div>
                  )}
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