import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Phone, PhoneOff, Clock, AlertCircle, Play, Trash2, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  fetchElevenLabsConvAIHistory,
  downloadHistoryItemAudio, 
  uploadAudioToSupabase,
  convertToConvAICallHistory,
  CallHistoryItem,
  ConvAIHistoryResponse
} from '@/services/elevenlabs';
import { saveCallLog, deleteCallLog } from '@/services/callLogs';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CallDetailsSidePanel from './CallDetailsSidePanel';

// Fallback call history data if API fails
const fallbackCallHistory = [
  {
    id: '1',
    client: 'Customer Service Agent',
    agent_name: 'Customer Service Agent',
    email: '',
    phone: '',
    date: '2024-06-04',
    time: '14:30',
    duration: '12:45',
    type: 'ConvAI',
    status: 'completed',
    notes: 'Sample conversation with customer about product inquiry',
    messages_count: 12,
    evaluation_result: 'Good'
  },
  // ... other fallback data
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <Phone className="h-4 w-4 text-green-600" />;
    case 'ongoing':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'missed':
      return <PhoneOff className="h-4 w-4 text-red-600" />;
    default:
      return <Phone className="h-4 w-4 text-gray-600" />;
  }
};

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

const CallsContent = () => {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [callToDelete, setCallToDelete] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallHistoryItem | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const { toast } = useToast();

  // Fetch call history from ElevenLabs
  const fetchCallHistory = async (cursor?: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching call history for CallsContent:', { cursor, forceRefresh });
      
      const response = await fetchElevenLabsConvAIHistory(100, cursor);
      
      if (!response || !response.conversations) {
        throw new Error('No conversation data received from ElevenLabs');
      }

      const conversations = response.conversations;
      console.log('📊 CallsContent received conversations:', {
        count: conversations.length,
        hasMore: response.has_more,
        cursor: response.next_cursor,
        statuses: conversations.reduce((acc, conv) => {
          acc[conv.status] = (acc[conv.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      if (conversations.length === 0) {
        if (!cursor) {
          // Only show this message on initial load, not when paginating
          setError('No conversations found. You may not have any calls or conversations yet.');
        }
        setLoading(false);
        return;
      }
      
      const convertedCalls = convertToConvAICallHistory(conversations);
      
      // All calls from this endpoint are ConvAI type
      const filteredCalls = convertedCalls;
      
      if (cursor) {
        // Append to existing calls if paginating
        setCallHistory(prev => [...prev, ...filteredCalls]);
      } else {
        // Replace calls if this is the initial load or force refresh
        setCallHistory(filteredCalls);
      }
      
      setHasMore(response.has_more);
      setNextCursor(response.next_cursor);
      
      // Save each call log to Supabase (skip if force refresh to avoid duplicates)
      if (!forceRefresh) {
        for (const call of filteredCalls) {
          try {
            await saveCallLog(call);
          } catch (saveError) {
            console.warn('Failed to save call log:', call.id, saveError);
          }
        }
      }
      
      // Show success toast
      toast({
        title: "History loaded",
        description: `Loaded ${filteredCalls.length} items from ElevenLabs`,
      });
      
      console.log('✅ CallsContent final state:', {
        totalCallsInState: cursor ? 'appended' : filteredCalls.length,
        hasMore: response.has_more
      });
      
    } catch (err) {
      console.error('Error fetching call history:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);
      
      // Use fallback data only if API key is missing and this is initial load
      if (!cursor && errorMessage.includes('API key')) {
        console.log('Using fallback data due to missing API key');
        setCallHistory(fallbackCallHistory);
      }
      
      // Show error toast
      toast({
        title: "Error loading history",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Force refresh function to bypass any caching
  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing call history...');
    setCallHistory([]); // Clear existing data
    setNextCursor(undefined);
    setHasMore(false);
    fetchCallHistory(undefined, true); // Force refresh
  };

  // Load more calls when user clicks "Load More"
  const handleLoadMore = () => {
    if (nextCursor) {
      fetchCallHistory(nextCursor);
    }
  };

  // Play audio for a specific call
  const handlePlayAudio = async (historyItemId: string) => {
    try {
      toast({
        title: "Loading audio",
        description: "Checking for audio availability...",
      });
      
      const audioBlob = await downloadHistoryItemAudio(historyItemId);
      
      if (!audioBlob) {
        toast({
          title: "No audio available",
          description: "This conversation doesn't have downloadable audio.",
          variant: "default",
        });
        return;
      }
      
      // Create an audio URL and play it
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Handle audio playback events
      audio.onloadstart = () => {
        toast({
          title: "Audio ready",
          description: "Playing conversation audio...",
        });
      };
      
      audio.onerror = () => {
        toast({
          title: "Audio playback error",
          description: "Failed to play the audio file.",
          variant: "destructive",
        });
      };
      
      await audio.play();
      
      // Upload to Supabase for persistent storage
      const url = await uploadAudioToSupabase(historyItemId, audioBlob);
      
      if (url) {
        // Update the call history item with the audio URL
        setCallHistory(prev => 
          prev.map(call => 
            call.id === historyItemId ? { ...call, audio_url: url } : call
          )
        );
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      toast({
        title: "Audio unavailable",
        description: "This conversation type may not support audio playback.",
        variant: "default",
      });
    }
  };

  // Handle deleting a call
  const handleDeleteCall = async () => {
    if (!callToDelete) return;
    
    try {
      setLoading(true);
      
      const success = await deleteCallLog(callToDelete);
      
      if (success) {
        // Remove from UI
        setCallHistory(prev => prev.filter(call => call.id !== callToDelete));
        
        toast({
          title: "Item deleted",
          description: "History item has been deleted successfully",
        });
      } else {
        throw new Error('Failed to delete history item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Error deleting item",
        description: err instanceof Error ? err.message : 'Failed to delete history item',
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCallToDelete(null);
      setLoading(false);
    }
  };

  // Handle type filter change
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    // Re-fetch if needed
    if (value === 'ConvAI') {
      // Filter the existing data for ConvAI items
      setCallHistory(prev => prev.filter(call => call.type === 'ConvAI'));
    } else {
      // Reload all data
      fetchCallHistory();
    }
  };

  // Handle row click to open side panel
  const handleRowClick = (call: CallHistoryItem) => {
    setSelectedCall(call);
    setSidePanelOpen(true);
  };

  // Handle closing side panel
  const handleCloseSidePanel = () => {
    setSidePanelOpen(false);
    setSelectedCall(null);
  };

  // Initial data fetch
  useEffect(() => {
    fetchCallHistory();
  }, []);

  const filteredCalls = callHistory.filter(call => {
    const matchesSearch = call.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (call.email && call.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         call.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesType = typeFilter === 'all' || call.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Determine if we have any ConvAI items
  const hasConvAIItems = callHistory.some(call => call.type === 'ConvAI');

  return (
    <>
      {/* Side Panel */}
      <CallDetailsSidePanel
        call={selectedCall}
        isOpen={sidePanelOpen}
        onClose={handleCloseSidePanel}
        onPlayAudio={handlePlayAudio}
      />

      {/* Main Content */}
      <div className={`space-y-6 transition-all duration-300 ${sidePanelOpen ? 'mr-[800px]' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice History</h1>
          <p className="text-gray-600">Manage and review your ElevenLabs voice history</p>
        </div>
        <Button 
          className="bg-[#3B82F6] hover:bg-[#3B82F6]/90"
          onClick={handleForceRefresh}
        >
          <Download className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* API Key Notice */}
      {!loading && callHistory.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To view your ElevenLabs history, please make sure you've added your API key in the{" "}
            <a href="/settings" className="font-medium underline">Settings</a> page.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ConvAI">Conversational AI</SelectItem>
              <SelectItem value="TTS">Text to Speech</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Call History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Voice History ({filteredCalls.length} items)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {typeFilter === 'ConvAI' ? 'Agent' : 'Voice/Agent'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                {hasConvAIItems && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evaluation
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalls.map((call) => (
                <tr 
                  key={call.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(call)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>{call.date}</div>
                    <div className="text-xs text-gray-500">{call.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(call.status)}
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {call.agent_name || call.client}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {call.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {call.duration}
                  </td>
                  {hasConvAIItems && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {call.type === 'ConvAI' ? (
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 text-blue-600 mr-1" />
                            <span className="text-sm text-gray-600">{call.messages_count || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {call.type === 'ConvAI' && call.evaluation_result ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {getEvaluationBadge(call.evaluation_result)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {call.audio_url ? (
                      <audio 
                        controls 
                        src={call.audio_url} 
                        className="h-8 w-40"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(call.id);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" /> Play
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCallToDelete(call.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading history...</p>
          </div>
        )}

        {filteredCalls.length === 0 && !loading && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {hasMore && !loading && (
          <div className="p-6 text-center">
            <Button onClick={handleLoadMore}>
              Load More Items
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete History Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this history item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCall}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default CallsContent;
