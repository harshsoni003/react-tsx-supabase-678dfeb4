import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentStats, LanguageStats } from '@/services/analyticsService';

interface AgentStatsTableProps {
  agentStats: AgentStats[];
  languageStats: LanguageStats[];
  isLoading?: boolean;
}

const AgentStatsTable = ({ agentStats, languageStats, isLoading }: AgentStatsTableProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse h-6 w-40 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Called Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Most called agents</CardTitle>
        </CardHeader>
        <CardContent>
          {agentStats.length > 0 ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                <span>Agent name</span>
                <span className="text-center">Number of calls</span>
                <span className="text-center">Call minutes</span>
                <span className="text-center">LLM cost</span>
                <span className="text-center">Credits spent</span>
              </div>
              
              {/* Table Rows */}
              {agentStats.map((agent, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 text-sm py-2">
                  <span className="font-medium text-gray-900">{agent.agentName}</span>
                  <span className="text-center font-semibold">{agent.numberOfCalls}</span>
                  <span className="text-center">{agent.callMinutes}</span>
                  <span className="text-center">{agent.llmCost}</span>
                  <span className="text-center">{agent.creditsSpent}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No agent data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {languageStats.map((lang, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{lang.language}</span>
                  <span className="font-semibold">{lang.percentage.toFixed(1)}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lang.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            {languageStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No language data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentStatsTable; 