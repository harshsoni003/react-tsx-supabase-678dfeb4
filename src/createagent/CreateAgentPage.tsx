import React, { useState } from 'react';
import CreateAgentForm from './CreateAgentForm';
import RateLimitWarning from './RateLimitWarning';
import TalkWithBotButton from '@/components/landing/TalkWithBotButton';
import { useNavigate } from 'react-router-dom';

const CreateAgentPage = () => {
  const [showRateLimit, setShowRateLimit] = useState(true);
  const navigate = useNavigate();

  const handleContinueFromWarning = () => {
    setShowRateLimit(false);
  };

  const handleCancelFromWarning = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center">
          {showRateLimit ? (
            <RateLimitWarning 
              onContinue={handleContinueFromWarning}
              onCancel={handleCancelFromWarning}
              showBackButton={true}
            />
          ) : (
            <CreateAgentForm showBackButton={true} />
          )}
        </div>
      </div>
      
      {/* ElevenLabs Widget */}
      <TalkWithBotButton onClick={() => {}} />
    </div>
  );
};

export default CreateAgentPage; 