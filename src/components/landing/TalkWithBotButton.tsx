
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface TalkWithBotButtonProps {
  onClick: () => void;
}

const TalkWithBotButton = ({ onClick }: TalkWithBotButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group"
        size="icon"
      >
        <Mic className="w-6 h-6 group-hover:animate-pulse" />
      </Button>
      <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Talk with Voice Bolt
      </div>
    </div>
  );
};

export default TalkWithBotButton;
