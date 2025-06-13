import React from 'react';
import { Phone, Clock, DollarSign, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardStats } from '@/services/analyticsService';

interface MetricsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const MetricsCards = ({ stats, isLoading }: MetricsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: 'Number of calls',
      value: stats.totalCalls.toLocaleString(),
      icon: Phone,
      highlighted: true,
      className: 'border-green-200 bg-green-50'
    },
    {
      title: 'Average duration',
      value: stats.averageDuration,
      icon: Clock,
      className: 'bg-white'
    },
    {
      title: 'Total cost',
      value: `${stats.totalCost} credits`,
      icon: DollarSign,
      className: 'bg-white'
    },
    {
      title: 'Average cost',
      value: `${stats.averageCost} credits/call`,
      icon: TrendingUp,
      className: 'bg-white'
    },
    {
      title: 'Total LLM cost',
      value: stats.totalLLMCost,
      icon: DollarSign,
      className: 'bg-white'
    },
    {
      title: 'Average LLM cost',
      value: '$0.01',
      icon: TrendingDown,
      className: 'bg-white'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricsData.map((metric, index) => (
          <Card 
            key={index} 
            className={`p-4 relative ${metric.className} ${metric.highlighted ? 'ring-2 ring-green-300' : ''}`}
          >
            {metric.highlighted && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            )}
            <CardContent className="p-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <metric.icon className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Rate Badge */}
      <div className="flex justify-start">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-lg font-semibold text-gray-900">Overall success rate</span>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            {stats.successRate}%
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards; 