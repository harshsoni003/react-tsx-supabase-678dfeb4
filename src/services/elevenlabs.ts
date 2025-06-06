// ElevenLabs Voice Chat Service
import { useConversation } from '@elevenlabs/react';
import { useState, useEffect, useRef } from 'react';

// ElevenLabs API key from environment variables
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Agent ID or URL for your ElevenLabs voice agent
// Using the specific agent ID from ElevenLabs
const AGENT_ID = 'agent_01jwk1cxa5e6e9y098f7es8waf';

/**
 * Custom hook for ElevenLabs voice chat functionality
 */
export const useVoiceChat = () => {
  // State to track microphone mute status
  const [isMicMuted, setIsMicMuted] = useState(false);
  // Ref to store the microphone stream
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize the conversation hook from ElevenLabs
  const conversation = useConversation({
    // Event handlers
    onConnect: () => console.log('Voice chat connected'),
    onDisconnect: () => console.log('Voice chat disconnected'),
    onError: (error) => console.error('Voice chat error:', error),
    onMessage: (message) => console.log('Voice chat message:', message),
    
    // Optional: Configure wake lock to prevent device from sleeping during conversation
    useWakeLock: true,
    
    // Optional: Configure connection delay for different platforms
    connectionDelay: {
      android: 3000,
      ios: 0,
      default: 0,
    },
  });

  // Extract states and methods from the conversation hook
  const { 
    status, 
    isSpeaking, 
    canSendFeedback,
    startSession,
    endSession,
    sendFeedback,
    sendUserMessage,
    sendUserActivity,
  } = conversation;

  /**
   * Check if the browser supports media devices
   */
  const isBrowserMediaSupported = () => {
    return !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  /**
   * Start a voice conversation session
   */
  const startConversation = async () => {
    try {
      // Check if browser supports media devices
      if (!isBrowserMediaSupported()) {
        console.warn('Browser does not support media devices - running in demo mode');
        // Return a fake conversation ID for demo mode
        return 'demo-conversation-id';
      }
      
      try {
        // Request microphone permission and store the stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      } catch (micError) {
        console.warn('Could not access microphone, running in demo mode:', micError);
        // Continue without microphone access in demo mode
      }
      
      // Start the conversation session
      // If you have a private agent, you'll need to generate a signed URL
      // For public agents, you can use the agent ID directly
      try {
        const conversationId = await startSession({ 
          agentId: AGENT_ID 
        });
        
        console.log('Conversation started with ID:', conversationId);
        return conversationId;
      } catch (sessionError) {
        console.warn('Could not start ElevenLabs session, running in demo mode:', sessionError);
        // Return a fake conversation ID for demo mode
        return 'demo-conversation-id';
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  };

  /**
   * End the current voice conversation session
   */
  const stopConversation = async () => {
    try {
      // Try to end the session, but don't throw if it fails
      try {
        await endSession();
      } catch (sessionError) {
        console.warn('Could not end ElevenLabs session properly:', sessionError);
        // Continue with cleanup even if session end fails
      }
      
      // Clean up microphone stream
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      
      console.log('Conversation ended');
    } catch (error) {
      console.error('Failed to end conversation:', error);
      // Don't throw the error, just log it
      // This ensures the UI can still update properly
    }
  };

  /**
   * Toggle microphone mute state
   */
  const toggleMute = (muted: boolean) => {
    if (micStreamRef.current) {
      const audioTracks = micStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !muted;
      });
      setIsMicMuted(muted);
      console.log(`Microphone ${muted ? 'muted' : 'unmuted'}`); 
    } else {
      console.warn('No active media stream to mute/unmute');
      setIsMicMuted(muted);
    }
  };

  // Clean up resources when the component unmounts
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    status,
    isSpeaking,
    canSendFeedback,
    isMicMuted,
    startConversation,
    stopConversation,
    sendFeedback,
    sendUserMessage,
    sendUserActivity,
    toggleMute,
    isBrowserMediaSupported,
  };
};
