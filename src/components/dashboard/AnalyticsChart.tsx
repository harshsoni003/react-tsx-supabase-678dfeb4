import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartDataPoint } from '@/services/analyticsService';

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  topDate: { date: string; numberOfCalls: number };
  isLoading?: boolean;
}

const AnalyticsChart = ({ data, topDate, isLoading }: AnalyticsChartProps) => {
  if (isLoading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <div className="animate-pulse h-6 w-48 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Call Frequency Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate chart dimensions and scaling
  const maxCalls = Math.max(...data.map(d => d.calls));
  const chartHeight = 200;
  const chartWidth = data.length * 40; // Width per data point
  
  // Generate SVG path for the line chart
  const generatePath = (dataPoints: ChartDataPoint[]) => {
    const points = dataPoints.map((point, index) => {
      const x = (index / (dataPoints.length - 1)) * 100;
      const y = 100 - (point.calls / maxCalls) * 80; // 80% of chart height
      return `${x},${y}`;
    });
    return `M${points.join('L')}`;
  };

  // Generate success rate area
  const generateSuccessArea = (dataPoints: ChartDataPoint[]) => {
    const points = dataPoints.map((point, index) => {
      const x = (index / (dataPoints.length - 1)) * 100;
      const y = 100 - (point.successRate / 100) * 80;
      return `${x},${y}`;
    });
    return `M0,100 L${points.join('L')} L100,100 Z`;
  };

  return (
    <div className="space-y-6">
      {/* Call Frequency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Call Frequency Over Time</span>
            {topDate.numberOfCalls > 0 && (
              <div className="text-right text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Date: {topDate.date}</span>
                </div>
                <div className="text-gray-900 font-semibold">Number of calls: {topDate.numberOfCalls}</div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 w-full">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              
              {/* Data line */}
              <path
                d={generatePath(data)}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Data points */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - (point.calls / maxCalls) * 80;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r={1.5}
                    fill="#3b82f6"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
              {data.map((point, index) => {
                const date = new Date(point.date);
                const today = new Date();
                const options: Intl.DateTimeFormatOptions = { 
                  month: 'long', 
                  day: 'numeric',
                  year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
                };
                return (
                  <span key={index} className="transform -rotate-45 origin-bottom-left">
                    {date.toLocaleDateString('en-US', options)}
                  </span>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Overall success rate</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 w-full">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              {/* Grid */}
              <rect width="100" height="100" fill="url(#grid)" />
              
              {/* Success rate area */}
              <path
                d={generateSuccessArea(data)}
                fill="rgba(34, 197, 94, 0.3)"
                stroke="none"
              />
              
              {/* Success rate line */}
              <path
                d={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - (point.successRate / 100) * 80;
                  return index === 0 ? `M${x},${y}` : `L${x},${y}`;
                }).join('')}
                stroke="#22c55e"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            
            {/* Y-axis labels for success rate */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 -ml-8">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
          </div>
          
          {/* Success rate summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Success</span>
                <div className="font-semibold">0 (0%)</div>
              </div>
              <div>
                <span className="text-gray-600">Failure</span>
                <div className="font-semibold">0 (0%)</div>
              </div>
              <div>
                <span className="text-gray-600">Unknown</span>
                <div className="font-semibold">0 (0%)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsChart; 