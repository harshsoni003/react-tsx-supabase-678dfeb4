import React from 'react';
import { useConversationalAIData, getConversationalAIUrl } from '@/services/elevenlabsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Bot, Plus, AlertCircle, BarChart } from 'lucide-react';

const ConversationalAIPanel = () => {
  const { data, isLoading, error } = useConversationalAIData();
  
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
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mb-2"></div>
          <div className="animate-pulse h-4 w-64 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="animate-pulse h-24 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="animate-pulse h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading ConversationalAI Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={() => window.open(getConversationalAIUrl(), '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open ElevenLabs ConversationalAI
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          ConversationalAI Platform
        </CardTitle>
        <CardDescription>
          Your ElevenLabs ConversationalAI agents and usage statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Usage Stats */}
          {data?.usage && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Conversations</div>
                <div className="text-2xl font-bold">{data.usage.total_conversations.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Messages</div>
                <div className="text-2xl font-bold">{data.usage.total_messages.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  {data.usage.subscription_tier ? 'Subscription Tier' : 'Remaining Credits'}
                </div>
                <div className="text-2xl font-bold">
                  {data.usage.subscription_tier || data.usage.remaining_credits?.toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {/* Agent List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Your Agents</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`${getConversationalAIUrl()}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Platform
              </Button>
            </div>
            
            {data?.agents && data.agents.length > 0 ? (
              <div className="space-y-3">
                {data.agents.map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {agent.image_url ? (
                            <img src={agent.image_url} alt={agent.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
                              <Bot className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{agent.name}</h4>
                          <div className="text-sm text-gray-600">
                            {agent.description ? (
                              <span className="truncate block max-w-xs">{agent.description}</span>
                            ) : (
                              <span className="italic">No description</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="outline" className={
                          agent.status === 'active' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }>
                          {agent.status}
                        </Badge>
                        <span className="text-xs text-gray-500 mt-1">
                          Created: {formatDate(agent.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`https://elevenlabs.io/app/talk-to?agent_id=${agent.id}`, '_blank')}
                      >
                        Talk to agent
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`${getConversationalAIUrl()}/dashboard?agent_id=${agent.id}`, '_blank')}
                      >
                        <BarChart className="mr-1 h-4 w-4" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-lg">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h4 className="text-lg font-medium mb-2">No agents found</h4>
                <p className="text-gray-600 mb-4">You haven't created any ConversationalAI agents yet.</p>
                <Button 
                  onClick={() => window.open(`${getConversationalAIUrl()}/create-agent`, '_blank')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Agent
                </Button>
              </div>
            )}
          </div>
          
          {/* Models List */}
          {data?.models && data.models.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Available Models</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.models.map((model) => (
                  <div key={model.id} className="border rounded-lg p-3 text-sm">
                    <div className="font-medium">{model.name}</div>
                    {model.description && (
                      <div className="text-gray-600 mt-1">{model.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t pt-4 mt-4">
            <Button 
              className="w-full" 
              variant="default"
              onClick={() => window.open(`${getConversationalAIUrl()}/create-agent`, '_blank')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Agent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalAIPanel; 