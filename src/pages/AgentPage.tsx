import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Globe, 
  Building2,
  MessageCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { getAgentDetails } from '../createagent/services/agentCreationService';
import WebsiteIframe from '@/components/ui/WebsiteIframe';

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
  agent?: {
    prompt?: {
      prompt: string;
    };
    first_message?: string;
    language?: string;
  };
  prompt?: {
    prompt: string;
  } | string;
  first_message?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
}

interface CreatedAgentData {
  agentId: string;
  agentName: string;
  companyName: string;
  websiteUrl: string;
  email: string;
}

const AgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get state passed from navigation, if available
  const createdAgent = location.state?.agent as CreatedAgentData || null;
  
  // Local state
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [localAgent, setLocalAgent] = useState<CreatedAgentData | null>(createdAgent);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micPermissionRequested, setMicPermissionRequested] = useState(false);

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
      document.head.appendChild(script);

      return () => {
        // Cleanup script when component unmounts
        const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
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
      if (isWidgetLoaded && !micPermissionRequested) {
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
            description: "You can now use voice chat with the agent.",
          });
        } catch (error) {
          console.error('Microphone permission denied:', error);
          setMicPermissionGranted(false);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice chat. Click the microphone icon in your browser's address bar.",
            variant: "destructive"
          });
        }
      }
    };

    requestMicrophonePermission();
  }, [isWidgetLoaded, micPermissionRequested, toast]);

  // Load agent details if not provided in location state
  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) return;
      
      try {
        setIsLoadingAgent(true);
        const details = await getAgentDetails(agentId);
        setAgentDetails(details);
        console.log('Loaded agent details:', details);
        
        // If we don't have createdAgent data from navigation state,
        // create a minimal version from the fetched details
        if (!localAgent) {
          setLocalAgent({
            agentId: agentId,
            agentName: details.name || "Agent",
            companyName: "",
            websiteUrl: "",
            email: ""
          });
        }
      } catch (error) {
        console.error('Error loading agent details:', error);
        toast({
          title: "Warning",
          description: "Could not load agent details. Voice chat may still work.",
          variant: "destructive"
        });
        
        // Set minimal agent info if we failed to load
        if (!localAgent) {
          setLocalAgent({
            agentId: agentId,
            agentName: "Agent",
            companyName: "",
            websiteUrl: "",
            email: ""
          });
        }
      } finally {
        setIsLoadingAgent(false);
      }
    };

    fetchAgentDetails();
  }, [agentId, localAgent, toast]);

  if (isLoadingAgent) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading agent details...</span>
        </div>
      </div>
    );
  }

  if (!localAgent || !agentId) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <p>Unable to find the requested agent.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Website Preview in full screen */}
      {localAgent.websiteUrl ? (
        <div className="relative w-full h-full">
          <WebsiteIframe 
            src={localAgent.websiteUrl}
            title="Website Preview"
            className="w-full h-full border-none"
            fallbackMessage="This website cannot be embedded due to security restrictions, but you can still access it directly."
            showFallbackOptions={true}
            onLoadError={() => {
              toast({
                title: "Website Loading Issue",
                description: "The website cannot be embedded due to security policies. You can still open it in a new tab.",
                variant: "default"
              });
            }}
          />
          
          {/* Bottom overlay with branding */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src="/DYOTA_logo-removebg-preview.png" alt="DYOTA Logo" className="h-12 w-auto" />
                <span className="text-white font-semibold">Voice Bolt</span>
              </div>
              <a 
                href={localAgent.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:underline text-sm flex items-center pointer-events-auto"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open Website
              </a>
            </div>
          </div>
          
          {/* ElevenLabs Widget - positioned in the bottom right */}
          <div className="absolute bottom-16 right-4 z-10">
            {isWidgetLoaded && localAgent ? (
              micPermissionGranted ? (
                <div className="bg-white rounded-lg shadow-lg p-2">
                  {React.createElement('elevenlabs-convai', {
                    'agent-id': localAgent.agentId,
                    'variant': 'compact',
                    'text-input': 'false',
                    'text-only-mode': 'false'
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center max-w-xs">
                  <div className="flex items-center mb-2">
                    <MessageCircle className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-sm font-medium">Microphone Access Required</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center mb-3">
                    Please allow microphone access to start voice chat
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="text-xs"
                  >
                    Refresh Page
                  </Button>
                </div>
              )
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-4 flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Loading widget...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="mb-4 text-lg text-gray-600">No website preview available</p>
            
            {/* ElevenLabs Widget - centered when no website */}
            {isWidgetLoaded && localAgent ? (
              micPermissionGranted ? (
                <div className="mt-8">
                  {React.createElement('elevenlabs-convai', {
                    'agent-id': localAgent.agentId,
                    'variant': 'compact',
                    'text-input': 'false',
                    'text-only-mode': 'false'
                  })}
                </div>
              ) : (
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6 flex flex-col items-center max-w-md mx-auto">
                  <div className="flex items-center mb-3">
                    <MessageCircle className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="text-lg font-medium">Microphone Access Required</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    To start voice chat with your agent, please allow microphone access when prompted by your browser.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="mb-2"
                  >
                    Refresh Page
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Look for the microphone icon in your browser's address bar and click "Allow"
                  </p>
                </div>
              )
            ) : (
              <div className="mt-8 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Loading voice chat widget...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Import Badge here since it wasn't at the top
// We need this when we reference Badge in the JSX
import { Badge } from '@/components/ui/badge';

export default AgentPage;
