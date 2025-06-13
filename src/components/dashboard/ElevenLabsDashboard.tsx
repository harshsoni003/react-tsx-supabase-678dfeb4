import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Play, Square, ThumbsUp, ThumbsDown, BarChart2, Bot, CircleUser, ExternalLink } from 'lucide-react';
import { useVoiceChat } from '@/services/elevenlabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCards from './StatsCards';
import AgentInfoCard from './AgentInfoCard';
import ConversationalAIPanel from './ConversationalAIPanel';

// Define the possible status values from the useVoiceChat hook
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'initial' | string;
type TabValue = 'voice-chat' | 'conversational-ai' | 'agent-info';

const ElevenLabsDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('voice-chat');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState('');
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'assistant', timestamp: Date}[]>([]);
  
  const {
    status,
    isSpeaking,
    canSendFeedback,
    isMicMuted,
    startConversation,
    stopConversation,
    sendFeedback,
    sendUserMessage,
    toggleMute,
    isBrowserMediaSupported,
  } = useVoiceChat();

  // Close voice session when switching tabs
  useEffect(() => {
    if (activeTab !== 'voice-chat' && isSessionActive) {
      handleStopSession();
    }
  }, [activeTab]);

  const handleStartSession = async () => {
    try {
      const id = await startConversation();
      setConversationId(id);
      setIsSessionActive(true);
      setMessages([...messages, {
        text: "Voice session started. You can speak or type your message.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleStopSession = async () => {
    try {
      await stopConversation();
      setIsSessionActive(false);
      setConversationId(null);
      setMessages([...messages, {
        text: "Voice session ended.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  const handleToggleMute = () => {
    toggleMute(!isMicMuted);
  };

  const handleSendMessage = () => {
    if (!textMessage.trim() || !isSessionActive) return;
    
    sendUserMessage(textMessage);
    setMessages([...messages, {
      text: textMessage,
      sender: 'user',
      timestamp: new Date()
    }]);
    setTextMessage('');
  };

  const getBrowserSupportMessage = () => {
    if (isBrowserMediaSupported()) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Browser supports voice chat</Badge>;
    } else {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Voice chat requires Chrome/Safari</Badge>;
    }
  };

  const getStatusBadge = () => {
    const currentStatus = status as ConnectionStatus;
    
    switch (currentStatus) {
      case 'connecting':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 animate-pulse">Connecting...</Badge>;
      case 'connected':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Disconnected</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ElevenLabs Dashboard</h2>
          <p className="text-gray-500">Monitor usage and interact with your voice assistant</p>
        </div>
        <div className="flex items-center space-x-2">
          {activeTab === 'voice-chat' && getBrowserSupportMessage()}
          {activeTab === 'voice-chat' && getStatusBadge()}
          {isSpeaking && activeTab === 'voice-chat' && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              Speaking...
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Tabs Navigation */}
      <Tabs 
        defaultValue="voice-chat" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as TabValue)}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="voice-chat" className="flex items-center">
            <Mic className="mr-2 h-4 w-4" />
            Voice Chat
          </TabsTrigger>
          <TabsTrigger value="conversational-ai" className="flex items-center">
            <Bot className="mr-2 h-4 w-4" />
            ConversationalAI
          </TabsTrigger>
          <TabsTrigger value="agent-info" className="flex items-center">
            <CircleUser className="mr-2 h-4 w-4" />
            Agent Info
          </TabsTrigger>
        </TabsList>
        
        {/* Voice Chat Tab Content */}
        <TabsContent value="voice-chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation Panel */}
            <div className="lg:col-span-2">
              <Card className="h-[500px] flex flex-col">
                <CardHeader>
                  <CardTitle>Voice Conversation</CardTitle>
                  <CardDescription>Talk with the ElevenLabs voice assistant</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-500 my-8">Start a conversation to see messages here</p>
                    ) : (
                      messages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.sender === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Voice Controls Card */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Controls</CardTitle>
                <CardDescription>Manage your voice session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSessionActive ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Session ID: <span className="font-mono text-xs">{conversationId?.substring(0, 8)}...</span>
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full"
                        onClick={handleToggleMute}
                      >
                        {isMicMuted ? <Mic className="mr-2 h-5 w-5" /> : <MicOff className="mr-2 h-5 w-5" />}
                        {isMicMuted ? 'Unmute' : 'Mute'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="lg" 
                        className="w-full"
                        onClick={handleStopSession}
                      >
                        <Square className="mr-2 h-5 w-5" />
                        End Session
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full"
                    onClick={handleStartSession}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Voice Session
                  </Button>
                )}

                {isSessionActive && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Send Text Message</p>
                    <div className="flex space-x-2">
                      <Input 
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                  </div>
                )}

                {canSendFeedback && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Rate Last Response</p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => sendFeedback(true)}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Good
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => sendFeedback(false)}
                      >
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Bad
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ConversationalAI Tab Content */}
        <TabsContent value="conversational-ai" className="space-y-4">
          <ConversationalAIPanel />
        </TabsContent>

        {/* Agent Info Tab Content */}
        <TabsContent value="agent-info" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5" />
                    Agent Performance
                  </CardTitle>
                  <CardDescription>
                    Usage statistics and metrics for your ElevenLabs voice agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600 mb-2">This feature requires an active subscription</p>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://elevenlabs.io/subscription', '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Subscription Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <AgentInfoCard />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ElevenLabsDashboard; 