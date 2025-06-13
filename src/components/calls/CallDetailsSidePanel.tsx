import React, { useState, useEffect } from 'react';
import { X, Phone, Clock, MessageSquare, User, Calendar, Star, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CallHistoryItem, fetchConversationDetails, ConversationDetails, ConversationMessage } from '@/services/elevenlabs';

interface CallDetailsSidePanelProps {
  call: CallHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayAudio?: (callId: string) => void;
}

const CallDetailsSidePanel: React.FC<CallDetailsSidePanelProps> = ({
  call,
  isOpen,
  onClose,
  onPlayAudio
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  // Fetch conversation details when panel opens
  useEffect(() => {
    if (isOpen && call && call.type === 'ConvAI') {
      fetchConversationData();
    }
  }, [isOpen, call]);

  const fetchConversationData = async () => {
    if (!call) return;
    
    setLoadingTranscript(true);
    try {
      const details = await fetchConversationDetails(call.id);
      setConversationDetails(details);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    } finally {
      setLoadingTranscript(false);
    }
  };

  if (!isOpen || !call) return null;

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'ongoing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'missed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getEvaluationBadge = (evaluation: string | undefined) => {
    if (!evaluation) return null;
    
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    const lowerEval = evaluation.toLowerCase();
    
    if (lowerEval.includes('good') || lowerEval.includes('excellent')) {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>{evaluation}</span>;
    } else if (lowerEval.includes('average') || lowerEval.includes('ok')) {
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{evaluation}</span>;
    } else if (lowerEval.includes('poor') || lowerEval.includes('bad')) {
      return <span className={`${baseClasses} bg-red-100 text-red-800`}>{evaluation}</span>;
    } else {
      return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{evaluation}</span>;
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-[800px] bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Conversation with {call.agent_name || call.client}
              </h2>
              <p className="text-sm text-gray-600">{call.id}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">Metadata</div>
                <Button variant="ghost" size="sm" onClick={onClose} className="mt-1">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Metadata Section */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-gray-600">Date</div>
                <div className="font-medium">{call.date}, {call.time}</div>
              </div>
              <div>
                <div className="text-gray-600">Connection duration</div>
                <div className="font-medium">{call.duration}</div>
              </div>
              <div>
                <div className="text-gray-600">Cost (credits)</div>
                <div className="font-medium">{call.messages_count ? call.messages_count * 10 : 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600">LLM Price Preview</div>
                <div className="font-medium">$0.025 / min</div>
                <div className="text-xs text-gray-500">Total: $0.0083</div>
              </div>
            </div>
          </div>

          {/* Audio Player Section */}
          <div className="px-4 pb-4">
            {call.audio_url ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <audio 
                  controls 
                  src={call.audio_url} 
                  className="w-full"
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onPlayAudio?.(call.id)}
                  className="flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>0:00 / {call.duration}</span>
                </Button>
                <Button size="sm" variant="ghost" className="ml-2">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transcription">Transcription</TabsTrigger>
              <TabsTrigger value="client">Client Data</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden px-6 pb-6">
              <TabsContent value="overview" className="h-full mt-4">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {/* Summary Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {conversationDetails?.summary || 
                         call.notes || 
                         `The user inquired about the price of "${call.agent_name || 'services'}." The agent, unable to find information on the topic, offered assistance related to Voice Bolt.`
                        }
                      </div>
                    </div>

                    {/* Call Status Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Call status</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          call.status === 'completed' ? 'bg-green-100 text-green-800' :
                          call.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          call.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {call.status === 'completed' ? 'Successful' : 
                           call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Conversation Details */}
                    {call.type === 'ConvAI' && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Conversation Details</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Agent</span>
                            <span className="text-sm font-medium text-gray-900">{call.agent_name || call.client}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Duration</span>
                            <span className="text-sm font-medium text-gray-900">{call.duration}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Messages</span>
                            <span className="text-sm font-medium text-gray-900">{call.messages_count || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Date & Time</span>
                            <span className="text-sm font-medium text-gray-900">{call.date} at {call.time}</span>
                          </div>
                          {call.evaluation_result && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Evaluation</span>
                              <span className="text-sm font-medium text-gray-900">{call.evaluation_result}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Technical Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Technical Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Conversation ID</span>
                          <span className="text-sm font-mono text-gray-900">{call.id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Type</span>
                          <span className="text-sm font-medium text-gray-900">{call.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Audio Available</span>
                          <span className="text-sm font-medium text-gray-900">{call.audio_url ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="transcription" className="h-full mt-4">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">Conversation Transcript</h3>
                      <Button size="sm" variant="outline" disabled={!conversationDetails}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    
                    {loadingTranscript ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-sm text-gray-600">Loading transcript...</span>
                      </div>
                    ) : conversationDetails && conversationDetails.messages.length > 0 ? (
                      <>
                        {/* Transcript Type Indicator */}
                        <div className="mb-4">
                          {conversationDetails.messages.some(m => m.message_id?.startsWith('audio_') || m.message_id?.startsWith('transcript_')) ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center">
                                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-green-800">
                                  Audio Transcription
                                </span>
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                Showing actual conversation transcript from audio recording
                              </p>
                            </div>
                          ) : conversationDetails.messages.some(m => m.message_id?.startsWith('enhanced_') || m.message_id?.startsWith('sample_')) ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center">
                                <div className="h-2 w-2 bg-amber-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-amber-800">
                                  Sample Conversation
                                </span>
                              </div>
                              <p className="text-xs text-amber-600 mt-1">
                                Real transcript not available - showing representative conversation
                              </p>
                            </div>
                          ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center">
                                <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                                <span className="text-sm font-medium text-blue-800">
                                  Conversation Data
                                </span>
                              </div>
                              <p className="text-xs text-blue-600 mt-1">
                                Showing available conversation messages
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Messages */}
                        <div className="space-y-3">
                          {conversationDetails.messages.map((message, index) => (
                            <div 
                              key={message.message_id || index}
                              className={`${
                                message.role === 'agent' 
                                  ? 'bg-blue-50 border-l-4 border-blue-400' 
                                  : 'bg-gray-50 border-l-4 border-gray-400'
                              } p-3 rounded`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${
                                  message.role === 'agent' ? 'text-blue-800' : 'text-gray-800'
                                }`}>
                                  {message.role.toUpperCase()}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs ${
                                    message.role === 'agent' ? 'text-blue-600' : 'text-gray-600'
                                  }`}>
                                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit'
                                    })}
                                  </span>
                                  {message.duration && (
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      message.role === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {message.duration}s
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className={`text-sm leading-relaxed ${
                                message.role === 'agent' ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {message.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                      
                    ) : call.type === 'ConvAI' ? (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-700">
                          No transcript data available for this conversation. This may be because:
                        </p>
                        <ul className="text-sm text-yellow-600 mt-2 ml-4 list-disc">
                          <li>The conversation is still being processed</li>
                          <li>Transcript access may require additional API permissions</li>
                          <li>The conversation may not have detailed message logs</li>
                        </ul>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-3"
                          onClick={fetchConversationData}
                          disabled={loadingTranscript}
                        >
                          Retry Loading
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 italic">
                          Transcript data is only available for Conversational AI calls.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="client" className="h-full mt-4">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Client Information</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <span className="text-xs text-gray-600">Name</span>
                              <p className="text-sm font-medium text-gray-900">{call.client}</p>
                            </div>
                            {call.email && (
                              <div>
                                <span className="text-xs text-gray-600">Email</span>
                                <p className="text-sm text-gray-900">{call.email}</p>
                              </div>
                            )}
                            {call.phone && (
                              <div>
                                <span className="text-xs text-gray-600">Phone</span>
                                <p className="text-sm text-gray-900">{call.phone}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Interaction History</h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">
                              First interaction on {call.date} at {call.time}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Preferences</h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 italic">
                              Client preferences and notes will appear here as they are collected during conversations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CallDetailsSidePanel; 