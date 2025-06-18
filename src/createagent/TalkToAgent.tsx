import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Bot, 
  Globe, 
  Building2,
  MessageCircle,
  Volume2,
  Loader2
} from 'lucide-react';
import { useVoiceChat } from '@/services/elevenlabs';
import { getAgentDetails } from './services/agentCreationService';

interface TalkToAgentProps {
  agentId: string;
  agentName?: string;
  companyName?: string;
  websiteUrl?: string;
  onBack?: () => void;
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

const TalkToAgent = ({ 
  agentId, 
  agentName, 
  companyName, 
  websiteUrl, 
  onBack 
}: TalkToAgentProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const { toast } = useToast();

  // Use the existing voice chat hook but we'll need to modify it for specific agent
  const {
    status,
    isSpeaking,
    isMicMuted,
    startConversation,
    stopConversation,
    toggleMute,
    isBrowserMediaSupported,
  } = useVoiceChat();

  // Load agent details on component mount
  useEffect(() => {
    const loadAgentDetails = async () => {
      try {
        setIsLoadingAgent(true);
        const details = await getAgentDetails(agentId);
        setAgentDetails(details);
        console.log('Loaded agent details:', details);
      } catch (error) {
        console.error('Error loading agent details:', error);
        toast({
          title: "Failed to Load Agent",
          description: "Could not load agent details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingAgent(false);
      }
    };

    if (agentId) {
      loadAgentDetails();
    }
  }, [agentId, toast]);

  // Handle connection status changes
  useEffect(() => {
    setIsConnected(status === 'connected');
  }, [status]);

  const handleStartCall = async () => {
    try {
      if (!isBrowserMediaSupported()) {
        toast({
          title: "Browser Not Supported",
          description: "Your browser doesn't support voice chat. Please use a modern browser.",
          variant: "destructive"
        });
        return;
      }

      // Pass the specific agent ID to connect to
      await startConversation(agentId);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to start voice chat. Please check your microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const handleEndCall = async () => {
    try {
      await stopConversation();
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const handleToggleMute = () => {
    toggleMute(!isMicMuted);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Ready';
    }
  };

  if (isLoadingAgent) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading agent details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Agent Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-xl">
                  {agentDetails?.name || agentName || 'AI Agent'}
                </CardTitle>
                <CardDescription>
                  Agent ID: {agentId}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={`${getStatusColor()} text-white`}>
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyName && (
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{companyName}</span>
              </div>
            )}
            {websiteUrl && (
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <a 
                  href={websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {websiteUrl}
                </a>
              </div>
            )}
          </div>
          
          {agentDetails?.conversation_config?.agent?.first_message && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">First Message:</p>
                  <p className="text-sm text-blue-700">
                    "{agentDetails.conversation_config.agent.first_message}"
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Globe className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Knowledge Base:</p>
                <p className="text-sm text-green-700">
                  This agent has access to your website content and can answer questions about your company.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Chat Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Voice Chat</span>
          </CardTitle>
          <CardDescription>
            Start a voice conversation with your AI agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Indicator */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                <span className="font-medium">{getStatusText()}</span>
                {isSpeaking && (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Agent is speaking...</span>
                  </div>
                )}
              </div>
              {isConnected && (
                <Badge variant={isMicMuted ? "destructive" : "default"}>
                  {isMicMuted ? "Muted" : "Live"}
                </Badge>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex justify-center space-x-4">
              {!isConnected ? (
                <Button
                  onClick={handleStartCall}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                  disabled={status === 'connecting'}
                >
                  {status === 'connecting' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Start Voice Chat
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleToggleMute}
                    size="lg"
                    variant={isMicMuted ? "destructive" : "default"}
                    className="px-6"
                  >
                    {isMicMuted ? (
                      <>
                        <MicOff className="w-5 h-5 mr-2" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        Mute
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleEndCall}
                    size="lg"
                    variant="destructive"
                    className="px-6"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Call
                  </Button>
                </>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-600">
              {!isConnected ? (
                <p>
                  Click "Start Voice Chat" to begin talking with your agent. 
                  Make sure your microphone is enabled.
                </p>
              ) : (
                <p>
                  Speak naturally - your agent can hear you and will respond with voice. 
                  The agent has knowledge about {companyName || 'your company'}.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      {onBack && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack}>
            ← Back to Agent Creation
          </Button>
        </div>
      )}
    </div>
  );
};

export default TalkToAgent; 