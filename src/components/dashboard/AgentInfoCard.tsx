import React, { useState, useEffect } from 'react';
import { Bot, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchAgentInfo } from '@/services/elevenlabsApi';

const AgentInfoCard = () => {
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAgentInfo = async () => {
      try {
        setLoading(true);
        const data = await fetchAgentInfo();
        setAgentInfo(data);
      } catch (err) {
        console.error('Error fetching agent info:', err);
        setError('Failed to load agent information');
        // Mock data as fallback
        setAgentInfo({
          id: 'agent_01jwk1cxa5e6e9y098f7es8waf',
          name: 'ElevenLabs Assistant',
          description: 'An AI voice agent powered by ElevenLabs.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          voice_id: 'voice_123456',
          status: 'active',
          visibility: 'public'
        });
      } finally {
        setLoading(false);
      }
    };

    getAgentInfo();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardHeader>
          <div className="animate-pulse h-6 w-32 bg-gray-200 rounded mb-2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          Agent Information
        </CardTitle>
        <CardDescription>
          Details about the connected ElevenLabs voice agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{agentInfo?.name || 'ElevenLabs Agent'}</h4>
              <div className="flex items-center">
                <Badge 
                  variant="outline" 
                  className={`${
                    agentInfo?.status === 'active' 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {agentInfo?.status || 'unknown'}
                </Badge>
                {agentInfo?.visibility && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {agentInfo.visibility}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {agentInfo?.description && (
            <p className="text-sm text-gray-600">
              {agentInfo.description}
            </p>
          )}
          
          <div className="pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-mono text-gray-900">{agentInfo?.id?.substring(0, 12)}...</span>
            </div>
            {agentInfo?.created_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">{formatDate(agentInfo.created_at)}</span>
              </div>
            )}
            {agentInfo?.updated_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">{formatDate(agentInfo.updated_at)}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => window.open(`https://elevenlabs.io/app/talk-to?agent_id=${agentInfo?.id}`, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Agent on ElevenLabs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentInfoCard; 