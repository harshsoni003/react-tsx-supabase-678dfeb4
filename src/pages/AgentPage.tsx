import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Globe, 
  Building2,
  MessageCircle,
  Loader2,
  ExternalLink,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  getAgentDetails, 
  associateKnowledgeBaseWithAgent,
  createWebsiteKnowledgeBase,
  updateAgentVoice
} from '../createagent/services/agentCreationService';
import WebsiteIframe from '@/components/ui/WebsiteIframe';

interface AgentDetails {
  agent_id: string;
  name: string;
  conversation_config?: {
    agent?: {
      prompt?: {
        prompt: string;
        knowledge_base?: Array<{
          type: string;
          name?: string;
          id: string;
          usage_mode: string;
        }>;
      };
      first_message?: string;
      language?: string;
      knowledge_base?: {
        enabled?: boolean;
        document_ids?: string[];
      };
    };
    knowledge_base?: {
      enabled?: boolean;
      document_ids?: string[];
    };
  };
  agent?: {
    prompt?: {
      prompt: string;
      knowledge_base?: Array<{
        type: string;
        name?: string;
        id: string;
        usage_mode: string;
      }>;
    };
    first_message?: string;
    language?: string;
    knowledge_base?: {
      enabled?: boolean;
      document_ids?: string[];
    };
  };
  knowledge_base?: {
    enabled?: boolean;
    document_ids?: string[];
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
  const [hasKnowledgeBase, setHasKnowledgeBase] = useState<boolean | null>(null);
  const [loadingAssociation, setLoadingAssociation] = useState(false);
  const [loadingVoiceUpdate, setLoadingVoiceUpdate] = useState(false);

  // Helper to check if agent has knowledge base
  const checkKnowledgeBase = (details: AgentDetails): boolean => {
    // Check the new structure: conversation_config.agent.prompt.knowledge_base array
    const promptKnowledgeBase = details?.conversation_config?.agent?.prompt?.knowledge_base;
    if (Array.isArray(promptKnowledgeBase) && promptKnowledgeBase.length > 0) {
      return true;
    }
    
    // Check all possible legacy locations for knowledge base documents
    const kbLocations = [
      details?.conversation_config?.agent?.knowledge_base?.document_ids,
      details?.knowledge_base?.document_ids,
      details?.agent?.knowledge_base?.document_ids,
      details?.conversation_config?.knowledge_base?.document_ids
    ];
    
    // Check if any location has document IDs
    return kbLocations.some(loc => 
      Array.isArray(loc) && loc.length > 0
    );
  };

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
          
          // Remove this toast notification
          // toast({
          //   title: "Microphone Access Granted",
          //   description: "You can now use voice chat with the agent.",
          // });
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
        
        // Check if agent has knowledge base
        setHasKnowledgeBase(checkKnowledgeBase(details));
        
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

  // Handle manual association of knowledge base
  const handleAssociateKnowledgeBase = async () => {
    if (!agentId || !localAgent?.websiteUrl) return;

    setLoadingAssociation(true);
    try {
      toast({
        title: "Creating Knowledge Base",
        description: "Creating knowledge base from website content...",
      });
      
      // First, create a knowledge base from the website URL
      const knowledgeBaseId = await createWebsiteKnowledgeBase(
        localAgent.websiteUrl,
        localAgent.companyName || 'My Company'
      );
      
      toast({
        title: "Knowledge Base Created",
        description: "Now associating with your agent...",
      });
      
      // Then associate the knowledge base with the agent
      await associateKnowledgeBaseWithAgent(agentId, knowledgeBaseId);
      
      // Refresh agent details to confirm association
      const updatedDetails = await getAgentDetails(agentId);
      setAgentDetails(updatedDetails);
      setHasKnowledgeBase(checkKnowledgeBase(updatedDetails));
      
      toast({
        title: "Success!",
        description: "Knowledge base associated with agent successfully.",
      });
    } catch (error) {
      console.error('Error associating knowledge base:', error);
      toast({
        title: "Association Failed",
        description: "Failed to associate knowledge base. Try again or check ElevenLabs dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoadingAssociation(false);
    }
  };

  // Handle manual voice update to Sarah
  const handleUpdateVoice = async () => {
    if (!agentId) return;

    setLoadingVoiceUpdate(true);
    try {
      toast({
        title: "Updating Voice",
        description: "Updating agent voice to Sarah...",
      });
      
      // Update the agent's voice to Sarah
      await updateAgentVoice(agentId);
      
      // Refresh agent details to confirm the update
      const updatedDetails = await getAgentDetails(agentId);
      setAgentDetails(updatedDetails);
      
      toast({
        title: "Voice Updated!",
        description: "Agent voice has been updated to Sarah. Refresh the page to see the changes.",
      });
    } catch (error) {
      console.error('Error updating agent voice:', error);
      toast({
        title: "Voice Update Failed",
        description: "Failed to update agent voice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingVoiceUpdate(false);
    }
  };

  if (isLoadingAgent) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center p-8">
          <img 
            src="/DYOTA_logo-removebg-preview.png" 
            alt="Loading Agent" 
            className="w-36 h-36 animate-pulse mb-6" 
          />
          <div className="flex items-center">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-xl font-semibold">Loading agent details...</span>
          </div>
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
              <a href="/pricing" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 pointer-events-auto bg-white px-3 py-1.5 rounded-2xl shadow-md">
                <img src="/DYOTA_logo-removebg-preview.png" alt="DYOTA Logo" className="h-10 w-auto" />
                <span className="text-black font-semibold">Get Now</span>
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
                    'avatar-image-url': '/22221.png',
                    'avatar-orb-color-1': '#2792dc',
                    'avatar-orb-color-2': '#9ce6e6',
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
            
            {/* Knowledge Base Status */}
            {agentDetails && (
              <div className="mb-6 flex flex-col items-center">
                {hasKnowledgeBase ? (
                  <div className="flex items-center text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Knowledge base is connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-600 mb-2">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>No knowledge base detected</span>
                  </div>
                )}
                
                {!hasKnowledgeBase && !loadingAssociation && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleAssociateKnowledgeBase}
                    className="mt-2"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Attempt to fix knowledge base
                  </Button>
                )}
                
                {loadingAssociation && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Associating knowledge base...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Voice Status */}
            {agentDetails && (
              <div className="mb-6 flex flex-col items-center">
                <div className="flex items-center text-blue-600 mb-2">
                  <Bot className="w-5 h-5 mr-2" />
                  <span>Update agent voice to Sarah</span>
                </div>
                
                {!loadingVoiceUpdate && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateVoice}
                    className="mt-2"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Fix Voice to Sarah
                  </Button>
                )}
                
                {loadingVoiceUpdate && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Updating voice...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* ElevenLabs Widget - centered when no website */}
            {isWidgetLoaded && localAgent ? (
              micPermissionGranted ? (
                <div className="mt-8">
                  {React.createElement('elevenlabs-convai', {
                    'agent-id': localAgent.agentId,
                    'variant': 'compact',
                    'avatar-image-url': '/22221.png',
                    'avatar-orb-color-1': '#2792dc',
                    'avatar-orb-color-2': '#9ce6e6',
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
