import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, VolumeX, Loader2, MicOff } from 'lucide-react';
import { useVoiceChat } from '@/services/elevenlabs';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const VoiceChatModal = ({ isOpen, onClose }: VoiceChatModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: Date.now() }
  ]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize the voice chat service
  const {
    status,
    isSpeaking,
    isMicMuted,
    startConversation,
    stopConversation,
    toggleMute,
    sendUserMessage,
    isBrowserMediaSupported
  } = useVoiceChat();

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Start conversation when modal opens
  useEffect(() => {
    if (isOpen) {
      handleStartConversation();
    }
    return () => {
      if (conversationStarted) {
        handleStopConversation();
      }
    };
  }, [isOpen]);

  // Set up message handler for ElevenLabs responses
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message && message.text) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: message.text,
          timestamp: Date.now()
        }]);
      }
    };

    // This would be where we'd set up a listener for ElevenLabs messages
    // For now, we're simulating responses in the sendMessage function

    return () => {
      // Clean up any listeners
    };
  }, []);

  const handleStartConversation = async () => {
    try {
      setError(null);
      
      // Check if browser supports media devices
      if (!isBrowserMediaSupported()) {
        console.warn('Browser does not support media devices or not in secure context - using demo mode');
        // Instead of throwing an error, we'll use demo mode
        setIsDemoMode(true);
        setConversationStarted(true);
        setIsRecording(true);
        return;
      }
      
      try {
        await startConversation();
        setConversationStarted(true);
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start conversation:', err);
        // Fallback to demo mode instead of showing an error
        setIsDemoMode(true);
        setConversationStarted(true);
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setIsDemoMode(true);
      setConversationStarted(true);
      setIsRecording(true);
    }
  };

  const handleStopConversation = async () => {
    try {
      await stopConversation();
      setConversationStarted(false);
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop conversation:', err);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopConversation();
    } else {
      handleStartConversation();
    }
  };

  const handleToggleMute = () => {
    toggleMute(!isMicMuted);
  };

  const handleClose = () => {
    if (conversationStarted) {
      handleStopConversation();
    }
    onClose();
  };

  // Simulate sending a message (in a real implementation, this would use the SDK's sendUserMessage)
  const sendMessage = (text: string) => {
    // Add user message to the conversation
    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: Date.now()
    }]);

    // In a real implementation, we would use the SDK's sendUserMessage
    if (!isDemoMode) {
      try {
        sendUserMessage(text);
      } catch (err) {
        console.warn('Failed to send message via SDK, falling back to demo mode', err);
      }
    }
    
    // For demo purposes, simulate an assistant response after a delay
    setTimeout(() => {
      let response = '';
      
      // Generate more realistic responses based on the input
      if (text.toLowerCase().includes('weather')) {
        response = "I don't have access to real-time weather data in demo mode, but I can help you with voice assistant related questions!";
      } else if (text.toLowerCase().includes('feature')) {
        response = "Voice Bolt offers advanced voice transcription, real-time conversation, and AI-powered responses. You can speak naturally and get intelligent responses immediately.";
      } else if (text.toLowerCase().includes('transcription')) {
        response = "Voice transcription works by converting your speech to text using advanced machine learning models. The text is then processed to understand your intent and generate appropriate responses.";
      } else if (text.toLowerCase().includes('help')) {
        response = "I can help you with various tasks like answering questions, setting reminders, playing music, and controlling smart home devices. What would you like assistance with?";
      } else {
        response = `I heard you say: "${text}". In a live environment, I would provide a more tailored response using ElevenLabs' voice AI technology.`;
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }]);
    }, 1500);
  };

  // For demo purposes, simulate user speech recognition
  const simulateUserSpeech = () => {
    if (isRecording && !isMicMuted) {
      const demoMessages = [
        "What can Voice Bolt do for me?",
        "Tell me about your features",
        "How does voice transcription work?",
        "Can you help me with my tasks?",
        "What's the weather like today?"
      ];
      const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
      sendMessage(randomMessage);
      
      // Add visual feedback that the microphone is active
      const micElement = document.querySelector('.mic-pulse');
      if (micElement) {
        micElement.classList.add('animate-ping');
        setTimeout(() => {
          micElement.classList.remove('animate-ping');
        }, 1000);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Talk with Voice Bolt</DialogTitle>
          <DialogDescription>
            {status === 'connecting' ? 'Connecting...' : 'Experience our AI voice assistant in action'}
            {isDemoMode && (
              <span className="block mt-1 text-amber-500 font-medium">Running in demo mode (no real voice interaction)</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <p>{error}</p>
            <Button 
              onClick={handleClose} 
              className="mt-2 bg-red-100 text-red-800 hover:bg-red-200"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="relative">
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 mic-pulse ${isRecording ? 'bg-gradient-to-r from-red-400 to-pink-400 animate-pulse' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`}
                onClick={simulateUserSpeech} // For demo purposes only
              >
                <Mic className="w-12 h-12 text-white" />
                {isDemoMode && isRecording && (
                  <div className="absolute bottom-0 transform translate-y-10 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                    Click mic to simulate speech
                  </div>
                )}
              </div>
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
              )}
            </div>

            <div className="w-full max-h-60 overflow-y-auto bg-gray-50 rounded-md p-4">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-3 p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'}`}
                >
                  <p className="text-sm font-medium mb-1">{msg.role === 'user' ? 'You' : 'Voice Bolt'}</p>
                  <p>{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={toggleRecording}
                className={`rounded-full w-16 h-16 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>
              
              <Button
                onClick={handleToggleMute}
                variant="outline"
                className="rounded-full w-16 h-16"
              >
                {isMicMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
            </div>

            {status !== 'connected' && (
              <p className="text-xs text-gray-500 italic">
                {status === 'connecting' ? 'Connecting to voice service...' : 'Voice service not connected'}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VoiceChatModal;
