import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { fetchAnalyticsData, AnalyticsDashboardData } from '@/services/analyticsService';
import MetricsCards from './MetricsCards';
import AnalyticsChart from './AnalyticsChart';
import AgentStatsTable from './AgentStatsTable';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading analytics dashboard data...');
      const data = await fetchAnalyticsData();
      
      if (data) {
        setDashboardData(data);
        toast({
          title: "Analytics loaded",
          description: `Loaded data for ${data.stats.totalCalls} conversations`,
        });
      } else {
        throw new Error('Failed to load analytics data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      console.error('Error loading analytics:', err);
      
      toast({
        title: "Error loading analytics",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (error && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-gray-500">ElevenLabs ConvAI performance metrics and insights</p>
          </div>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please check your ElevenLabs API key in settings and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-gray-500">ElevenLabs ConvAI performance metrics and insights</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert (if data exists but there was an error refreshing) */}
      {error && dashboardData && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Showing cached data.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Cards */}
      <MetricsCards 
        stats={dashboardData?.stats || {
          totalCalls: 0,
          averageDuration: '0:00',
          totalCost: '0',
          averageCost: '0',
          totalLLMCost: '$0.00',
          successRate: 0
        }} 
        isLoading={isLoading} 
      />

      {/* Charts */}
      <AnalyticsChart 
        data={dashboardData?.chartData || []} 
        topDate={dashboardData?.topDate || { date: '', numberOfCalls: 0 }}
        isLoading={isLoading}
      />

      {/* Agent Stats and Language Table */}
      <AgentStatsTable 
        agentStats={dashboardData?.agentStats || []}
        languageStats={dashboardData?.languageStats || []}
        isLoading={isLoading}
      />

      {/* Data Source Info */}
      {dashboardData && !isLoading && (
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            Analytics based on {dashboardData.stats.totalCalls} conversations from ElevenLabs ConvAI
          </p>
          <p className="mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 