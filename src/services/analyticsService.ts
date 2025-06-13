// Analytics Service for ElevenLabs ConvAI Dashboard
import { fetchElevenLabsConvAIHistory, ConvAIConversation } from './elevenlabs';

export interface DashboardStats {
  totalCalls: number;
  averageDuration: string;
  totalCost: string;
  averageCost: string;
  totalLLMCost: string;
  successRate: number;
}

export interface ChartDataPoint {
  date: string;
  calls: number;
  successRate: number;
}

export interface AgentStats {
  agentName: string;
  numberOfCalls: number;
  callMinutes: number;
  llmCost: string;
  creditsSpent: string;
}

export interface LanguageStats {
  language: string;
  percentage: number;
}

export interface AnalyticsDashboardData {
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  agentStats: AgentStats[];
  languageStats: LanguageStats[];
  topDate: {
    date: string;
    numberOfCalls: number;
  };
}

// Helper function to calculate duration in minutes
const calculateDurationInMinutes = (seconds: number): number => {
  return Math.round(seconds / 60);
};

// Helper function to format duration as MM:SS
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Estimated cost calculation (based on ElevenLabs pricing)
const calculateEstimatedCost = (durationSeconds: number): number => {
  // ConvAI costs approximately 400 credits per minute based on ElevenLabs Creator plan:
  // 100k credits = 250 minutes of ConvAI = 400 credits per minute
  const minutes = durationSeconds / 60;
  return minutes * 400; // Return credits directly
};

// Convert credits to dollars based on ElevenLabs pricing tiers
const creditsToUSD = (credits: number): number => {
  // Using Creator plan pricing: $22 for 100k credits = $0.00022 per credit
  // But for better accuracy, use average pricing: ~$0.0002 per credit
  return credits * 0.0002;
};

// Process conversations data into analytics
export const processConversationAnalytics = (conversations: ConvAIConversation[]): AnalyticsDashboardData => {
  if (!conversations || conversations.length === 0) {
    return {
      stats: {
        totalCalls: 0,
        averageDuration: '0:00',
        totalCost: '0',
        averageCost: '0',
        totalLLMCost: '$0.00',
        successRate: 0
      },
      chartData: [],
      agentStats: [],
      languageStats: [{ language: 'English', percentage: 100 }],
      topDate: { date: 'No data', numberOfCalls: 0 }
    };
  }

  // Basic stats calculation
  const totalCalls = conversations.length;
  const totalDurationSeconds = conversations.reduce((sum, conv) => sum + conv.call_duration_secs, 0);
  const averageDurationSeconds = totalDurationSeconds / totalCalls;
  const successfulCalls = conversations.filter(conv => conv.call_successful === 'success').length;
  const successRate = Math.round((successfulCalls / totalCalls) * 100);
  
  // Cost calculations using correct ElevenLabs credit pricing
  const totalCredits = calculateEstimatedCost(totalDurationSeconds);
  const averageCreditsPerCall = totalCredits / totalCalls;
  const totalCostUSD = creditsToUSD(totalCredits);
  const totalLLMCostUSD = totalCostUSD * 0.15; // Estimate LLM costs as 15% of total (more realistic)

  // Debug logging to compare with ElevenLabs dashboard
  console.log('Analytics Debug:', {
    totalCalls,
    totalDurationSeconds,
    averageDurationSeconds: averageDurationSeconds.toFixed(1),
    totalCredits: Math.round(totalCredits),
    averageCreditsPerCall: Math.round(averageCreditsPerCall),
    successRate
  });

  // Additional debug info to help identify discrepancy with ElevenLabs dashboard
  console.log('🔍 Detailed comparison with ElevenLabs Dashboard:', {
    ourStats: {
      calls: totalCalls,
      avgDuration: `${Math.floor(averageDurationSeconds / 60)}:${Math.floor(averageDurationSeconds % 60).toString().padStart(2, '0')}`,
      totalCredits: Math.round(totalCredits),
      avgCreditsPerCall: Math.round(averageCreditsPerCall)
    },
    elevenLabsExpected: {
      calls: 146, // From user's dashboard screenshot
      avgDuration: '0:42',
      totalCredits: 35387,
      avgCreditsPerCall: 242
    },
    differences: {
      callsDiff: totalCalls - 146,
      creditsDiff: Math.round(totalCredits) - 35387,
      avgCreditsDiff: Math.round(averageCreditsPerCall) - 242
    }
  });

  // Create chart data by grouping conversations by date
  const dateGroups = conversations.reduce((groups, conv) => {
    const date = new Date(conv.start_time_unix_secs * 1000).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = { conversations: [], successCount: 0 };
    }
    groups[date].conversations.push(conv);
    if (conv.call_successful === 'success') {
      groups[date].successCount++;
    }
    return groups;
  }, {} as Record<string, { conversations: ConvAIConversation[], successCount: number }>);

  const chartData: ChartDataPoint[] = Object.entries(dateGroups)
    .map(([date, data]) => ({
      date,
      calls: data.conversations.length,
      successRate: Math.round((data.successCount / data.conversations.length) * 100)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Find top date
  const topDate = chartData.reduce((max, current) => 
    current.calls > max.numberOfCalls ? { date: current.date, numberOfCalls: current.calls } : max,
    { date: '', numberOfCalls: 0 }
  );

  // Agent statistics
  const agentGroups = conversations.reduce((groups, conv) => {
    const agentName = conv.agent_name || 'Unknown Agent';
    if (!groups[agentName]) {
      groups[agentName] = { calls: 0, totalDuration: 0 };
    }
    groups[agentName].calls++;
    groups[agentName].totalDuration += conv.call_duration_secs;
    return groups;
  }, {} as Record<string, { calls: number, totalDuration: number }>);

  const agentStats: AgentStats[] = Object.entries(agentGroups).map(([agentName, data]) => {
    const totalCredits = calculateEstimatedCost(data.totalDuration);
    const costUSD = creditsToUSD(totalCredits);
    return {
      agentName,
      numberOfCalls: data.calls,
      callMinutes: calculateDurationInMinutes(data.totalDuration),
      llmCost: `$${(costUSD * 0.15).toFixed(2)}`, // 15% for LLM costs
      creditsSpent: Math.round(totalCredits).toString()
    };
  });

  return {
    stats: {
      totalCalls,
      averageDuration: formatDuration(Math.round(averageDurationSeconds)),
      totalCost: Math.round(totalCredits).toString(),
      averageCost: Math.round(averageCreditsPerCall).toString(),
      totalLLMCost: `$${totalLLMCostUSD.toFixed(2)}`,
      successRate
    },
    chartData,
    agentStats,
    languageStats: [{ language: 'English', percentage: 100 }], // Default for now
    topDate
  };
};

// Fetch all available conversation data with pagination
const fetchAllConversationData = async (): Promise<ConvAIConversation[]> => {
  const allConversations: ConvAIConversation[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;
  let fetchCount = 0;
  const maxFetches = 5; // Limit to 5 API calls (max 500 conversations) to avoid rate limits
  
  console.log('🔍 Starting to fetch ConvAI conversation data for analytics...');
  
  while (hasMore && fetchCount < maxFetches) {
    try {
      console.log(`📥 Fetching conversations batch ${fetchCount + 1}...`);
      
      // Use maximum allowed page size of 100
      const response = await fetchElevenLabsConvAIHistory(100, cursor);
      
      if (!response || !response.conversations || response.conversations.length === 0) {
        console.log('🔚 No more conversations found');
        break;
      }
      
      const currentBatch = response.conversations;
      
      // Log detailed information about this batch
      console.log(`📊 Batch ${fetchCount + 1} details:`, {
        count: currentBatch.length,
        statuses: currentBatch.reduce((acc, conv) => {
          acc[conv.status] = (acc[conv.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        successResults: currentBatch.reduce((acc, conv) => {
          acc[conv.call_successful] = (acc[conv.call_successful] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        dateRange: currentBatch.length > 0 ? {
          earliest: new Date(Math.min(...currentBatch.map(c => c.start_time_unix_secs * 1000))).toISOString(),
          latest: new Date(Math.max(...currentBatch.map(c => c.start_time_unix_secs * 1000))).toISOString()
        } : 'N/A'
      });
      
      allConversations.push(...currentBatch);
      hasMore = response.has_more;
      cursor = response.next_cursor;
      fetchCount++;
      
      console.log(`✅ Total conversations fetched so far: ${allConversations.length}`);
      
      // If we have enough data for accurate analytics, we can stop
      if (allConversations.length >= 200) {
        console.log('🎯 Reached sufficient data for analytics (200+ conversations)');
        break;
      }
    } catch (error) {
      console.error(`❌ Error fetching conversations batch ${fetchCount + 1}:`, error);
      
      // If it's an API key error or authentication error, stop trying
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key') || errorMessage.includes('401') || errorMessage.includes('403')) {
          console.error('🔐 Authentication error - stopping fetch attempts');
          throw error; // Re-throw auth errors
        }
      }
      
      // For other errors (rate limits, network issues), try to continue with what we have
      console.warn('⚠️ Continuing with partial data due to fetch error');
      break;
    }
  }
  
  // Apply potential filters to match ElevenLabs dashboard behavior
  let filteredConversations = allConversations;
  
  // Filter out conversations with certain statuses that might not show in dashboard
  const validStatuses = ['completed', 'failed', 'done']; // ElevenLabs might filter certain statuses
  const beforeFilter = filteredConversations.length;
  filteredConversations = filteredConversations.filter(conv => 
    // Keep all conversations for now, but log what we're seeing
    true
  );
  
  console.log('📈 Final conversation data summary:', {
    totalFetched: allConversations.length,
    afterFiltering: filteredConversations.length,
    filteredOut: beforeFilter - filteredConversations.length,
    statusBreakdown: filteredConversations.reduce((acc, conv) => {
      acc[conv.status] = (acc[conv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    successBreakdown: filteredConversations.reduce((acc, conv) => {
      acc[conv.call_successful] = (acc[conv.call_successful] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageDuration: filteredConversations.reduce((sum, conv) => sum + conv.call_duration_secs, 0) / filteredConversations.length
  });
  
  return filteredConversations;
};

// Fetch and process analytics data
export const fetchAnalyticsData = async (): Promise<AnalyticsDashboardData | null> => {
  try {
    console.log('Fetching ElevenLabs ConvAI history for analytics...');
    
    // Fetch conversations with pagination
    const conversations = await fetchAllConversationData();
    
    if (!conversations || conversations.length === 0) {
      console.warn('No conversation data available for analytics');
      return null;
    }

    console.log(`Processing ${conversations.length} conversations for analytics`);
    return processConversationAnalytics(conversations);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return null;
  }
}; 