import React, { useState } from 'react';
import CreateAgentForm from './CreateAgentForm';
import TalkToAgent from './TalkToAgent';
import { AgentCreationData } from './services/agentCreationService';

interface CreatedAgent {
  agentId: string;
  agentData: AgentCreationData;
}

const CreateAndTalkToAgent = () => {
  const [createdAgent, setCreatedAgent] = useState<CreatedAgent | null>(null);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const handleAgentCreated = (agentId: string, agentData: AgentCreationData) => {
    setCreatedAgent({ agentId, agentData });
    setShowVoiceChat(true);
  };

  const handleBackToCreation = () => {
    setShowVoiceChat(false);
    setCreatedAgent(null);
  };

  const handleSuccess = (agentId: string, agentData: any) => {
    // Store the form data that was used to create the agent
    setCreatedAgent({ 
      agentId, 
      agentData: {
        email: agentData.email,
        companyName: agentData.companyName,
        websiteUrl: agentData.websiteUrl,
        agentName: agentData.agentName
      }
    });
    setShowVoiceChat(true);
  };

  if (showVoiceChat && createdAgent) {
    return (
      <TalkToAgent
        agentId={createdAgent.agentId}
        agentName={createdAgent.agentData.agentName}
        companyName={createdAgent.agentData.companyName}
        websiteUrl={createdAgent.agentData.websiteUrl}
        onBack={handleBackToCreation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create & Talk to Your Agent</h1>
          <p className="mt-2 text-gray-600">
            Create your AI voice agent and start talking to it immediately
          </p>
        </div>
        
        <CreateAgentForm onSuccess={handleSuccess} />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            After creating your agent, you'll be able to test it with voice chat right away!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAndTalkToAgent; 