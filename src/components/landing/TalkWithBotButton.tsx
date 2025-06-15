import { useEffect } from 'react';

interface TalkWithBotButtonProps {
  onClick: () => void;
}

const TalkWithBotButton = ({ onClick }: TalkWithBotButtonProps) => {
  useEffect(() => {
    // Check if the script is already loaded
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      // Load the ElevenLabs Conversational AI widget script
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);

      return () => {
        // Clean up script when component unmounts
        const scriptElement = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement);
        }
      };
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <elevenlabs-convai agent-id="agent_01jwk1cxa5e6e9y098f7es8waf"></elevenlabs-convai>
    </div>
  );
};

export default TalkWithBotButton;
