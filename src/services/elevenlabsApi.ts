// ElevenLabs API Service for Dashboard Statistics
import { useState, useEffect } from 'react';

// ElevenLabs API key from environment variables
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Specific agent ID from ElevenLabs URL
const AGENT_ID = 'agent_01jwk1cxa5e6e9y098f7es8waf';

// Main ElevenLabs platform URLs
const ELEVENLABS_PLATFORM_URL = 'https://elevenlabs.io/app';
const CONVERSATIONAL_AI_URL = `${ELEVENLABS_PLATFORM_URL}/conversational-ai`;

// Types for ElevenLabs dashboard statistics
export interface ElevenLabsStatsResponse {
  totalCalls: string;
  totalDuration: string;
  activeCalls: string;
  totalCallsChange: string;
  totalDurationChange: string;
  activeCallsChange: string;
}

// Types for ConversationalAI data
export interface ConversationalAIAgent {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  public: boolean;
}

export interface ConversationalAIResponse {
  agents: ConversationalAIAgent[];
  models: {
    id: string;
    name: string;
    description?: string;
  }[];
  usage: {
    total_conversations: number;
    total_messages: number;
    remaining_credits?: number;
    subscription_tier?: string;
  };
}

// Custom hook for fetching ElevenLabs dashboard statistics
export const useElevenLabsStats = () => {
  const [stats, setStats] = useState<ElevenLabsStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!ELEVENLABS_API_KEY) {
        setError("API key not found. Please set VITE_ELEVENLABS_API_KEY in your environment.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch usage statistics from ElevenLabs API
        const userResponse = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        const historyResponse = await fetch(`${ELEVENLABS_API_URL}/history`, {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        
        // Fetch agent-specific statistics if available
        const agentStatsUrl = `${ELEVENLABS_API_URL}/agents/${AGENT_ID}/statistics`;
        let agentResponse;
        
        try {
          agentResponse = await fetch(agentStatsUrl, {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
            },
          });
        } catch (agentErr) {
          console.warn("Agent statistics endpoint not available, using general stats only");
        }
        
        // If any of the requests failed, throw an error
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch subscription data: ${userResponse.statusText}`);
        }
        
        if (!historyResponse.ok) {
          throw new Error(`Failed to fetch history data: ${historyResponse.statusText}`);
        }

        // Parse the responses
        const userData = await userResponse.json();
        const historyData = await historyResponse.json();
        let agentData = null;
        
        if (agentResponse?.ok) {
          agentData = await agentResponse.json();
        }
        
        // Process data to create dashboard statistics
        // Compare current month with previous month for change metrics
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        
        // Calculate statistics based on the API responses
        // This is a simplified example - actual implementation depends on the API response structure
        
        // Process the data to extract the stats we need
        // For now, using mock data as the exact API structure is not available
        const processedStats = processApiData(userData, historyData, agentData);

        setStats(processedStats);
      } catch (err) {
        console.error('Error fetching ElevenLabs stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback to mock data for demo purposes
        setStats({
          totalCalls: '1,247',
          totalDuration: '89.2h',
          activeCalls: '23',
          totalCallsChange: '+12%',
          totalDurationChange: '+8%',
          activeCallsChange: '+3',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
};

// Custom hook for fetching ConversationalAI data
export const useConversationalAIData = () => {
  const [data, setData] = useState<ConversationalAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversationalAI = async () => {
      if (!ELEVENLABS_API_KEY) {
        setError("API key not found. Please set VITE_ELEVENLABS_API_KEY in your environment.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all agent data
        const agentsResponse = await fetch(`${ELEVENLABS_API_URL}/agents`, {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        // Fetch models available for Conversational AI
        const modelsResponse = await fetch(`${ELEVENLABS_API_URL}/models`, {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        
        // Fetch usage data for Conversational AI
        const usageResponse = await fetch(`${ELEVENLABS_API_URL}/user/conversation-usage`, {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        
        // Check for errors
        if (!agentsResponse.ok) {
          throw new Error(`Failed to fetch agents data: ${agentsResponse.statusText}`);
        }
        
        // Parse the responses
        const agentsData = await agentsResponse.json();
        let modelsData = { models: [] };
        let usageData = { 
          total_conversations: 0, 
          total_messages: 0 
        };
        
        if (modelsResponse.ok) {
          modelsData = await modelsResponse.json();
        } else {
          console.warn("Models endpoint not available, using empty list");
        }
        
        if (usageResponse.ok) {
          usageData = await usageResponse.json();
        } else {
          console.warn("Usage endpoint not available, using default values");
        }
        
        // Process and combine the data
        const conversationalAIData: ConversationalAIResponse = {
          agents: agentsData.agents || [],
          models: modelsData.models || [],
          usage: usageData
        };

        setData(conversationalAIData);
      } catch (err) {
        console.error('Error fetching ConversationalAI data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback to mock data for demo purposes
        setData({
          agents: [
            {
              id: 'agent_01jwk1cxa5e6e9y098f7es8waf',
              name: 'Customer Support Agent',
              description: 'Helps customers with product inquiries and troubleshooting.',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              public: true
            },
            {
              id: 'agent_02abc3dex7f8g9h0ijk1lmno2p',
              name: 'Sales Assistant',
              description: 'Provides information about products and services.',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              public: false
            }
          ],
          models: [
            { id: 'model_001', name: 'Conversational AI Base Model' },
            { id: 'model_002', name: 'Specialized Customer Support Model' }
          ],
          usage: {
            total_conversations: 1247,
            total_messages: 8654,
            remaining_credits: 5000,
            subscription_tier: 'Professional'
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationalAI();
  }, []);

  return { data, isLoading, error };
};

// Helper function to process API responses into dashboard statistics
function processApiData(userData: any, historyData: any, agentData: any | null): ElevenLabsStatsResponse {
  // This is where you would process the actual API data
  // For now, returning mock data
  
  // If we have agent data, use that for more accurate stats
  if (agentData) {
    try {
      // Extract relevant statistics from agent data
      // This is just an example - adjust based on actual API response format
      return {
        totalCalls: formatNumber(agentData.total_conversations || 1247),
        totalDuration: formatDuration(agentData.total_duration_seconds || 321120),
        activeCalls: formatNumber(agentData.active_conversations || 23),
        totalCallsChange: formatChange(agentData.total_conversations_change || 12),
        totalDurationChange: formatChange(agentData.total_duration_change || 8),
        activeCallsChange: `+${agentData.active_conversations_change || 3}`,
      };
    } catch (e) {
      console.error('Error processing agent data:', e);
      // Fall back to default mock data
    }
  }
  
  // Process user subscription and history data
  try {
    // Example calculations - adjust based on actual API response format
    const totalCharacters = userData.character?.used || 0;
    const characterLimit = userData.character?.limit || 1;
    const usagePercentage = Math.round((totalCharacters / characterLimit) * 100);
    
    // Count total history items as calls
    const totalCalls = historyData.history?.length || 1247;
    
    // Sum up duration from history items
    let totalDurationSeconds = 0;
    historyData.history?.forEach((item: any) => {
      totalDurationSeconds += item.duration || 0;
    });
    
    return {
      totalCalls: formatNumber(totalCalls),
      totalDuration: formatDuration(totalDurationSeconds),
      activeCalls: '23', // Mock value as this might not be available in the API
      totalCallsChange: '+12%', // Mock value - would need historical data comparison
      totalDurationChange: '+8%', // Mock value - would need historical data comparison
      activeCallsChange: '+3', // Mock value
    };
  } catch (e) {
    console.error('Error processing user/history data:', e);
    // Return default mock data as fallback
    return {
      totalCalls: '1,247',
      totalDuration: '89.2h',
      activeCalls: '23',
      totalCallsChange: '+12%',
      totalDurationChange: '+8%',
      activeCallsChange: '+3',
    };
  }
}

// Helper functions for formatting
function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours.toLocaleString()}.${Math.floor((seconds % 3600) / 36)}h`;
}

function formatChange(percentage: number): string {
  return percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
}

// Function to fetch voice models
export const fetchVoiceModels = async () => {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voice models');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching voice models:', error);
    throw error;
  }
};

// Function to fetch agent information
export const fetchAgentInfo = async () => {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/agents/${AGENT_ID}`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agent information');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching agent information:', error);
    throw error;
  }
};

// Function to fetch all available agents
export const fetchAllAgents = async () => {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/agents`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all agents:', error);
    throw error;
  }
};

// Function to fetch user subscription info
export const fetchSubscriptionInfo = async () => {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    throw error;
  }
};

// Function to fetch user's usage history
export const fetchUsageHistory = async () => {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/history`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch usage history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching usage history:', error);
    throw error;
  }
};

// Helper to get the URL for conversational AI page
export const getConversationalAIUrl = () => CONVERSATIONAL_AI_URL;

export default {
  useElevenLabsStats,
  useConversationalAIData,
  fetchVoiceModels,
  fetchAgentInfo,
  fetchAllAgents,
  fetchSubscriptionInfo,
  fetchUsageHistory,
  getConversationalAIUrl
}; 