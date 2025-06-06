
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceChatModal = ({ isOpen, onClose }: VoiceChatModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!conversationStarted) {
      setConversationStarted(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Talk with Voice Bolt</DialogTitle>
          <DialogDescription>
            Experience our AI voice assistant in action
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-8">
          {/* Voice Visualization */}
          <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-400 to-pink-400 animate-pulse' 
                : 'bg-gradient-to-r from-blue-400 to-purple-400'
            }`}>
              <Mic className="w-16 h-16 text-white" />
            </div>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center">
            {!conversationStarted ? (
              <p className="text-gray-600">Click the microphone to start talking</p>
            ) : isRecording ? (
              <p className="text-red-600 font-medium">Listening...</p>
            ) : (
              <p className="text-blue-600 font-medium">Voice Bolt is responding...</p>
            )}
          </div>

          {/* Demo Transcript */}
          {conversationStarted && (
            <div className="w-full bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="space-y-3 text-sm">
                <div className="text-right">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    Hello, how can I help you today?
                  </span>
                </div>
                {isRecording && (
                  <div className="text-left">
                    <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
                      Listening...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex space-x-4">
            <Button
              onClick={toggleRecording}
              className={`rounded-full w-16 h-16 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="outline"
              className="rounded-full w-16 h-16"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* Demo Notice */}
          <div className="text-center text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
            <p>🎭 This is a demo interface. In the full version, you'll have real voice interaction with AI.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceChatModal;
